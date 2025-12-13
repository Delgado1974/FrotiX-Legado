
/*! FrotiX Global Error Hook v1.0
 *  Objetivo: capturar erros 5xx (ProblemDetails JSON) de AJAX/fetch/axios
 *  e exibir SweetAlert usando os componentes já existentes no projeto.
 *  Uso: incluir depois do jQuery e dos seus arquivos sweetalert_interop_*.js e alerta_*.js
 */
(function () {
    'use strict';

    var seen = new Set();

    function extractProblem(raw) {
        var obj = null;
        if (raw && typeof raw === 'object') {
            obj = raw;
        } else if (typeof raw === 'string') {
            try { obj = JSON.parse(raw); } catch { obj = {}; }
        } else {
            obj = raw || {};
        }

        var detail = (obj && (obj.detail || obj.title)) || 'Erro inesperado.';
        var ext = (obj && (obj.extensions || obj)) || {};
        var corr = obj.correlationId || ext.correlationId || null;
        return { detail: detail, corr: corr, problem: obj };
    }

    function showProblem(detail, corr, source) {
        try {
            var msg = detail + (corr ? "\nCódigo de correlação: " + corr : "");
            if (window.SweetAlertInterop && typeof SweetAlertInterop.ShowError === "function") {
                SweetAlertInterop.ShowError("Falha na operação", msg);
            } else if (window.Alerta && typeof Alerta.TratamentoErroComLinha === "function") {
                Alerta.TratamentoErroComLinha(source || "ajax", "global", new Error(detail + (corr ? " | corr=" + corr : "")));
            } else {
                console.error("[FrotiX ErrorHook]", msg);
            }
        } catch (e) {
            console.error("[FrotiX ErrorHook] showProblem falhou:", e);
        }
    }

    function shouldHandle(status) {
        return Number(status) >= 500;
    }

    function stamp(corr) {
        if (!corr) return true;
        if (seen.has(corr)) return false;
        seen.add(corr);
        setTimeout(function () { try { seen.delete(corr); } catch {} }, 10000);
        return true;
    }

    // jQuery global (cobre $.ajax, DataTables, etc.)
    if (window.jQuery) {
        jQuery(document).ajaxError(function (_evt, xhr) {
            try {
                if (!shouldHandle(xhr && xhr.status)) return;
                var raw = (xhr && (xhr.responseJSON || xhr.responseText)) || {};
                var meta = extractProblem(raw);
                if (stamp(meta.corr)) showProblem(meta.detail, meta.corr, "ajax");
            } catch (e) {
                console.error("[FrotiX ErrorHook] ajaxError:", e);
            }
        });
    }

    // fetch() intercept
    if (window.fetch && !window.__fxFetchHooked) {
        var originalFetch = window.fetch;
        window.fetch = async function (input, init) {
            var resp = await originalFetch(input, init);
            try {
                if (!resp.ok && shouldHandle(resp.status)) {
                    var clone = resp.clone();
                    var text = "";
                    try { text = await clone.text(); } catch {}
                    var meta = extractProblem(text);
                    if (stamp(meta.corr)) showProblem(meta.detail, meta.corr, "fetch");
                }
            } catch (e) {
                console.error("[FrotiX ErrorHook] fetch intercept:", e);
            }
            return resp;
        };
        window.__fxFetchHooked = true;
    }

    // axios intercept (se presente)
    if (window.axios && axios.interceptors && !window.__fxAxiosHooked) {
        axios.interceptors.response.use(
            function (r) { return r; },
            function (err) {
                try {
                    var status = (err && err.response && err.response.status) || 0;
                    if (shouldHandle(status)) {
                        var data = err.response && err.response.data;
                        var meta = extractProblem(data);
                        if (stamp(meta.corr)) showProblem(meta.detail, meta.corr, "axios");
                    }
                } catch (e) {
                    console.error("[FrotiX ErrorHook] axios intercept:", e);
                }
                return Promise.reject(err);
            }
        );
        window.__fxAxiosHooked = true;
    }
})();
