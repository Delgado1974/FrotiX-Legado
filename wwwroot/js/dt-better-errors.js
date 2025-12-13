/*!
 * DataTables Better Errors (fila + coalescência + integração Alerta.*)
 * Versão: 1.4.1
 * - Suprime alerta nativo (errMode='none')
 * - Captura error.dt (DT), preXhr.dt (URL) e xhr.dt (HTTP)
 * - Fila (Promises) para Alerta.* + Modal (um por vez)
 * - Dedupe de mensagens (janela configurável)
 * - Flag anti-duplicidade p/ ajax.error (jqXHR.__dtBetterHandled = true)
 * - Coalescer 'Ajax error (tn/7)' mesmo quando xhr.dt não chegou a disparar
 */
(function (global, $)
{
    'use strict';
    if (!$) { console.error('[DTBetterErrors] jQuery é obrigatório.'); return; }

    const DEFAULTS = {
        contexto: 'DataTable',
        origem: 'AJAX.DataTable',
        encaminharParaAlerta: true,
        preferEnriquecido: true,
        showModal: true,
        logToConsole: true,
        previewLimit: 1200,
        dedupeWindowMs: 3000,

        // coalescer error.dt “Ajax error / Erro ao carregar dados”
        suppressAjaxErrorDt: true,
        coalesceWindowMs: 2000
    };

    let GLOBAL_OPTS = {};
    const _logs = [];
    const _dedupe = new Map();
    const alertaQ = queue();
    const modalQ = queue();

    function setGlobalOptions(opts) { GLOBAL_OPTS = Object.assign({}, GLOBAL_OPTS, opts || {}); }
    function getLogs() { return _logs.slice(); }
    function clearLogs() { _logs.length = 0; }

    function queue()
    {
        let current = Promise.resolve();
        return { enqueue(task) { current = current.then(() => task()).catch(e => console.warn('[DTBetterErrors][Queue]', e)); return current; } };
    }

    function ensureErrModeDisabled()
    {
        if ($.fn?.dataTable?.ext) $.fn.dataTable.ext.errMode = 'none';
        else $(function () { if ($.fn?.dataTable?.ext) $.fn.dataTable.ext.errMode = 'none'; });
    }

    function enable(selector, opts = {})
    {
        ensureErrModeDisabled();

        const options = Object.assign({}, DEFAULTS, GLOBAL_OPTS, opts);
        const $table = $(selector);
        if (!$table.length) { console.warn('[DTBetterErrors] Tabela não encontrada:', selector); return; }

        // Estado local por tabela
        const state = $table.data('dtBetterState') || {
            lastPreXhrAt: 0, lastPreXhrUrl: '',
            lastXhrErrAt: 0, lastXhrSig: '', lastXhrPayload: null
        };
        $table.data('dtBetterState', state);

        // Evita binds duplicados
        $table.off('.dtBetterErrors');
        $table.data('dtBetterErrorsOptions', options);

        // Guardar URL da requisição (para enriquecer/suprimir error.dt)
        $table.on('preXhr.dt.dtBetterErrors', function (e, settings, data)
        {
            const url = settings.ajax && (settings.ajax.url || settings.ajax);
            state.lastPreXhrUrl = typeof url === 'function' ? '[function]' : (url || '');
            state.lastPreXhrAt = Date.now();
            $table.data('dtBetterState', state);
        });

        // XHR.DT — HTTP 4xx/5xx etc.
        $table.on('xhr.dt.dtBetterErrors', function (e, settings, json, xhr)
        {
            if (!xhr) return;
            const ok = xhr.status >= 200 && xhr.status < 300;
            if (ok) return;

            try { xhr.__dtBetterHandled = true; } catch (_) { }

            const url = settings.ajax && (settings.ajax.url || settings.ajax);
            const body = (xhr.responseText || '');
            const payload = {
                title: 'Erro ao carregar dados (AJAX)',
                summary: `HTTP ${xhr.status} ${xhr.statusText || ''} em ${url}`,
                suggestions: [
                    'Verifique a URL do endpoint e se ele está acessível.',
                    'Confirme que o servidor retorna JSON válido (Content-Type: application/json).',
                    'Se o JSON é um array na raiz, use `ajax: { dataSrc: "" }`.',
                    'Se o JSON vem como { "data": [...] }, ajuste `ajax.dataSrc` para "data".',
                    'Confira CORS, autenticação/token e logs do servidor.'
                ],
                raw: { status: xhr.status, statusText: xhr.statusText || '', url, responsePreview: body.slice(0, options.previewLimit) },
                dedupeKey: `XHR|${settings.sTableId || ''}|${url || ''}|${xhr.status}`
            };

            // marca estado p/ coalescer o error.dt subsequente
            state.lastXhrErrAt = Date.now();
            state.lastXhrSig = payload.dedupeKey;
            state.lastXhrPayload = payload;
            $table.data('dtBetterState', state);

            handleError($table, options, payload);
        });

        // ERROR.DT — mensageria interna (ex.: “Ajax error / tn/7”)
        $table.on('error.dt.dtBetterErrors', function (e, settings, techNote, message)
        {
            e.preventDefault(); // suprime alerta nativo
            const msg = (message || '').toString();
            const isAjaxErrorMsg = /Ajax error/i.test(msg) || /Erro ao carregar dados/i.test(msg) || /datatables\.net\/tn\/7/i.test(msg);

            // Coalescer com xhr.dt (se veio logo antes)
            if (options.suppressAjaxErrorDt && isAjaxErrorMsg)
            {
                const windowMs = options.coalesceWindowMs || 2000;
                if (state.lastXhrErrAt && (Date.now() - state.lastXhrErrAt) < windowMs)
                {
                    log(options, 'info', 'Coalescido: error.dt Ajax error suprimido (já houve xhr.dt)', { message, state });
                    return;
                }
            }

            // Sem xhr.dt recente, montamos um fallback útil com a URL do preXhr
            if (isAjaxErrorMsg)
            {
                const url = state.lastPreXhrUrl || (settings.ajax && (settings.ajax.url || settings.ajax)) || '';
                const payload = {
                    title: 'Erro ao carregar dados (AJAX)',
                    summary: `Falha ao carregar via AJAX em ${url || '(URL não disponível)'}`,
                    suggestions: [
                        'Cheque a aba Network do DevTools (status HTTP, corpo e Content-Type).',
                        'Se o servidor retorna HTML (ex.: página 404), ajuste a rota ou autenticação.',
                        'Se o JSON é um array na raiz, use `ajax: { dataSrc: "" }`.',
                        'Se o JSON vem como { "data": [...] }, ajuste `ajax.dataSrc` para "data".'
                    ],
                    raw: { message: msg, techNote, url },
                    // chave compatível com XHR para dedupe/coalescência
                    dedupeKey: `ERR|${settings.sTableId || ''}|${url || ''}|AJAX`
                };
                handleError($table, options, payload);
                return;
            }

            // Demais erros (unknown parameter, invalid JSON etc.)
            const dtApi = $(settings.nTable).DataTable();
            const human = explainErrorMessage(msg, settings, dtApi);
            const payload = {
                title: 'Erro no DataTables',
                summary: human.summary,
                suggestions: human.suggestions,
                raw: {
                    message: msg, techNote, tableId: settings.sTableId,
                    columns: settings.aoColumns?.map(c => getDataSrc(dtApi, c)) || []
                }
            };
            handleError($table, options, payload);
        });
    }

    function disable(selector) { const $t = $(selector); $t.off('.dtBetterErrors'); $t.removeData('dtBetterErrorsOptions'); }

    function handleError($table, options, payload)
    {
        const contexto = options.contexto || ($table.attr('id') || 'DataTable');
        const origem = String(options.origem || 'AJAX.DataTable');

        // Dedupe: usa chave específica se fornecida (xhr/err coalescidos)
        const key = (payload.dedupeKey || makeKey(contexto, origem, payload));
        if (seen(key, options.dedupeWindowMs)) { log(options, 'info', 'Erro duplicado suprimido', { contexto, origem, payload }); return; }
        stamp(key);

        if (options.encaminharParaAlerta && hasAlerta()) alertaQ.enqueue(() => sendToAlerta(contexto, origem, payload, options));
        if (options.showModal) modalQ.enqueue(() => showModal(payload, options));

        log(options, 'error', 'Erro DataTables', { contexto, origem, payload });
        global.__DT_LAST_ERROR__ = { contexto, origem, payload, ts: Date.now() };
    }

    function hasAlerta()
    {
        return global.Alerta &&
            (typeof global.Alerta.TratamentoErroComLinha === 'function' ||
                typeof global.Alerta.TratamentoErroComLinhaEnriquecido === 'function');
    }

    function sendToAlerta(contexto, origem, payload, options)
    {
        return new Promise((resolve) =>
        {
            try
            {
                const err = new Error(payload.summary || payload.title || 'Erro DataTables');
                err.name = 'DataTablesError';
                err.details = payload.raw || {};
                err.__dtBetterPayload = payload;
                let ret;
                if (options.preferEnriquecido && typeof global.Alerta.TratamentoErroComLinhaEnriquecido === 'function')
                {
                    ret = global.Alerta.TratamentoErroComLinhaEnriquecido(contexto, origem, err, { fonte: 'DTBetterErrors' });
                } else if (typeof global.Alerta.TratamentoErroComLinha === 'function')
                {
                    ret = global.Alerta.TratamentoErroComLinha(contexto, origem, err);
                }
                if (ret && typeof ret.then === 'function') ret.then(() => resolve()).catch(() => resolve());
                else resolve();
            } catch (ex) { console.warn('[DTBetterErrors] Falha ao chamar Alerta.*:', ex); resolve(); }
        });
    }

    function showModal(payload, options)
    {
        return new Promise((resolve) =>
        {
            const hasBS = !!global.bootstrap || !!$.fn.modal;
            if (!hasBS) { try { alert(`${payload.title}\n\n${payload.summary}\n\n- ${(payload.suggestions || []).join('\n- ')}`); } catch (_) { } resolve(); return; }
            ensureModal(); $('#dtErrorModal .modal-body').html(render(payload));
            const el = document.getElementById('dtErrorModal');
            if (global.bootstrap)
            {
                const m = new bootstrap.Modal(el);
                el.addEventListener('hidden.bs.modal', () => resolve(), { once: true });
                m.show();
            } else
            {
                $('#dtErrorModal').one('hidden.bs.modal', () => resolve()).modal('show');
            }
        });
    }

    function render({ title, summary, suggestions = [], raw = {} })
    {
        return `
      <div class="mb-2"><strong>${esc(title || 'Erro')}</strong></div>
      <div class="mb-2">${esc(summary || '')}</div>
      ${suggestions.length ? `<ul class="mb-2">${suggestions.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      <details open><summary>Detalhes técnicos</summary>
        <pre class="mt-2 p-2 bg-light border rounded small">${esc(JSON.stringify(raw, null, 2))}</pre>
      </details>
    `;
    }

    function explainErrorMessage(message, settings, dtApi)
    {
        let summary = message; const suggestions = [];
        if (/Requested unknown parameter/i.test(message))
        {
            const m = message.match(/column\s+(\d+)/i); const idx = m ? parseInt(m[1], 10) : null;
            const dataSrc = (idx != null && dtApi?.column) ? dtApi.column(idx).dataSrc() : undefined;
            summary = 'Coluna configurada com um campo que não existe no dataset.';
            if (idx != null) suggestions.push(`A coluna #${idx} usa \`data\` = "${dataSrc}". Confirme que cada registro do JSON possui essa chave.`);
            else suggestions.push('Uma coluna usa `data` inexistente em algumas linhas do JSON.');
            suggestions.push('Se algumas linhas não tiverem o campo, defina `columns[n].defaultContent = ""`.',
                'Se o servidor retorna array (posicional), use `columns[n].data = n` (índice).',
                'Compare as chaves reais do payload com `columns[].data`.');
        }
        if (/Invalid JSON response/i.test(message))
        {
            summary = 'A resposta do servidor não é um JSON válido para o DataTables.';
            suggestions.push('O servidor pode estar retornando HTML de erro (500) ou JSON malformado.',
                'Garanta `Content-Type: application/json` e JSON bem formado.',
                'Se o array está na raiz, use `ajax: { dataSrc: "" }`.',
                'Se vier `{ "data": [...] }`, ajuste `ajax.dataSrc` para "data".');
        }
        if (suggestions.length === 0)
        {
            suggestions.push('Abra o console para ver o erro completo e o objeto `settings`.',
                'Revise o mapeamento `columns[].data` e o `ajax.dataSrc`.',
                'Em `render`, trate campos ausentes com `row?.campo ?? ""`.');
        }
        return { summary, suggestions };
    }

    function getDataSrc(dtApi, colSettings) { try { return dtApi.column(colSettings.idx).dataSrc(); } catch { return colSettings?.mData ?? colSettings?.data; } }

    function ensureModal()
    {
        if (document.getElementById('dtErrorModal')) return;
        const tpl = `
    <div class="modal fade" id="dtErrorModal" tabindex="-1" aria-labelledby="dtErrorModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title" id="dtErrorModalLabel">Detalhes do erro</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button></div>
        <div class="modal-body"></div>
        <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button></div>
      </div></div>
    </div>`;
        document.body.insertAdjacentHTML('beforeend', tpl);
    }

    function esc(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

    function log(options, level, msg, extra)
    {
        const e = { level, msg, extra, ts: Date.now() }; _logs.push(e);
        if (!options.logToConsole) return;
        const p = '[DTBetterErrors]';
        try { (console[level] || console.log).call(console, p, msg, extra); } catch (_) { }
    }

    function makeKey(ctx, orig, payload)
    {
        const base = `${ctx}|${orig}|${payload.title}|${payload.summary}`;
        return base.replace(/\s+/g, ' ').trim().slice(0, 500);
    }
    function seen(key, windowMs) { const last = _dedupe.get(key); if (!last) return false; return (Date.now() - last) < windowMs; }
    function stamp(key) { _dedupe.set(key, Date.now()); }

    // API pública
    global.DTBetterErrors = {
        enable, disable, setGlobalOptions, getLogs, clearLogs, version: '1.4.1'
    };
})(window, window.jQuery);
