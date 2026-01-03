// Para controlar a exibição de ToolTips
var CarregandoViagemBloqueada = false;

/* =========================================================================================
   ESCONDE SPINNER GLOBAL IMEDIATAMENTE
   Este código roda ANTES de qualquer $(document).ready
   Remove o spinner de bolinhas que vem do data-ftx-spin do AnalyticsDashboard
   ========================================================================================= */
(function() {
    'use strict';
    
    // Função que remove o spinner - será chamada múltiplas vezes para garantir
    function removerSpinnerGlobal() {
        // Remove overlay do spinner global
        var overlays = document.querySelectorAll('.ftx-spin-overlay');
        overlays.forEach(function(el) { el.remove(); });
        
        // Tenta via jQuery também se disponível
        if (typeof $ !== 'undefined') {
            $('.ftx-spin-overlay').remove();
        }
        
        // Esconde via API se disponível
        if (window.FTXSpinner && typeof FTXSpinner.hide === 'function') {
            FTXSpinner.hide();
        }
        if (window.FtxSpin && typeof FtxSpin.hide === 'function') {
            FtxSpin.hide();
        }
    }
    
    // Executa imediatamente
    removerSpinnerGlobal();
    
    // Executa novamente após pequenos delays para garantir
    setTimeout(removerSpinnerGlobal, 0);
    setTimeout(removerSpinnerGlobal, 50);
    setTimeout(removerSpinnerGlobal, 100);
    setTimeout(removerSpinnerGlobal, 200);
    
    // Executa quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removerSpinnerGlobal);
    } else {
        removerSpinnerGlobal();
    }
})();

/* =========================================================================================
   FOTO DO MOTORISTA: LAZY LOADING + CACHE + LIMITE DE CONCORRÊNCIA
   - Busca só quando a imagem estiver visível.
   - Reutiliza resultado via cache em memória.
   - Evita "tempestade" de requisições com fila e limite de concorrência.
   ========================================================================================= */

const FTX_FOTO_PLACEHOLDER = "/images/placeholder-user.png";
const FTX_FOTO_ENDPOINT = "/api/Viagem/FotoMotorista";

// Cache definitivo: motoristaId -> "data:image..." OU URL do placeholder
const FtxFotoCache = new Map();

// Em voo: motoristaId -> Promise<string>
const FtxFotoInflight = new Map();

// Fila para controlar concorrência
const FtxFotoQueue = [];
const FTX_MAX_CONCURRENT = 4;
let FtxFotoCurrent = 0;

/* =========================================================================================
   MÓDULO DE LOADING DE VIAGENS - PADRÃO FROTIX
   Substitui o spinner de bolinhas por um modal elegante
   ========================================================================================= */
const FtxViagens = (function() {
    'use strict';

    let _modalLoading = null;
    let _primeiroCarregamento = true;

    // Inicializa referência ao modal
    function _initModal() {
        try {
            const modalEl = document.getElementById('modalLoadingViagens');
            if (modalEl) {
                _modalLoading = new bootstrap.Modal(modalEl, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        } catch (error) {
            Alerta.TratamentoErroComLinha("ViagemIndex.js", "FtxViagens._initModal", error);
        }
    }

    // Mostra o modal de loading
    function mostrarLoading(mensagem) {
        try {
            // Esconde o spinner global de bolinhas (data-ftx-spin) se existir
            if (window.FTXSpinner) {
                window.FTXSpinner.hide();
            }
            if (window.FtxSpin) {
                window.FtxSpin.hide();
            }
            // Remove overlay do spinner global se existir
            $('.ftx-spin-overlay').remove();

            if (!_modalLoading) {
                _initModal();
            }

            // Atualiza mensagem
            const msgEl = document.getElementById('loadingViagensMensagem');
            if (msgEl) {
                msgEl.textContent = mensagem || 'Aguarde enquanto carregamos as viagens...';
            }

            if (_modalLoading) {
                _modalLoading.show();
            }
        } catch (error) {
            Alerta.TratamentoErroComLinha("ViagemIndex.js", "FtxViagens.mostrarLoading", error);
        }
    }

    // Esconde o modal de loading
    function esconderLoading() {
        try {
            if (_modalLoading) {
                _modalLoading.hide();
            }
            // Garante que o backdrop seja removido
            setTimeout(() => {
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open').css('padding-right', '');
            }, 150);
        } catch (error) {
            Alerta.TratamentoErroComLinha("ViagemIndex.js", "FtxViagens.esconderLoading", error);
        }
    }

    // Adiciona aviso de filtro próximo ao campo de pesquisa do DataTable
    function adicionarAvisoFiltro() {
        try {
            const filterWrapper = $('#tblViagem_wrapper .dataTables_filter');
            if (filterWrapper.length && !filterWrapper.find('.ftx-filter-hint').length) {
                const avisoHtml = `
                    <span class="ftx-filter-hint" title="Digite qualquer termo para filtrar em todas as colunas visíveis">
                        <i class="fa-duotone fa-lightbulb"></i>
                        <span>Filtra em todas as colunas</span>
                    </span>
                `;
                filterWrapper.append(avisoHtml);
            }
        } catch (error) {
            Alerta.TratamentoErroComLinha("ViagemIndex.js", "FtxViagens.adicionarAvisoFiltro", error);
        }
    }

    // Função pública para filtrar viagens (chamada pelo botão Filtrar)
    function filtrar() {
        try {
            mostrarLoading('Filtrando viagens...');
            ListaTodasViagens();
        } catch (error) {
            Alerta.TratamentoErroComLinha("ViagemIndex.js", "FtxViagens.filtrar", error);
            esconderLoading();
        }
    }

    // Retorna interface pública
    return {
        mostrarLoading: mostrarLoading,
        esconderLoading: esconderLoading,
        adicionarAvisoFiltro: adicionarAvisoFiltro,
        filtrar: filtrar,
        isPrimeiroCarregamento: function() { return _primeiroCarregamento; },
        setPrimeiroCarregamento: function(val) { _primeiroCarregamento = val; }
    };
})();

// Expõe globalmente para uso no onclick do botão
window.FtxViagens = FtxViagens;

// Clique nos botões "Finalizar" dentro da tabela
$(document).on('click', '#tblViagem .btn-fundo-laranja', function (e)
{
    const $btn = $(this);
    if ($btn.hasClass('disabled'))
    {
        e.preventDefault();
        return false;
    }

    const viagemId = $btn.data('id');
    const modalEl = document.getElementById('modalFinalizaViagem');
    if (!modalEl) return;

    // guarda o id no modal (fallback para quando o relatedTarget vier vazio)
    modalEl.setAttribute('data-trigger-id', String(viagemId));

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show(); // abre programaticamente
});

// Handler para abrir modal de impressão (Ficha da Viagem)
$(document).on('click', '#tblViagem .btn-imprimir', function (e)
{
    e.preventDefault();
    e.stopPropagation();
    
    const viagemId = $(this).data('viagem-id');
    const modalEl = document.getElementById('modalPrint');
    if (!modalEl || !viagemId) return;

    // guarda o id no modal
    modalEl.setAttribute('data-viagem-id', String(viagemId));
    // também injeta no hidden
    $('#txtViagemId').val(viagemId);
    
    // Abre o modal via Bootstrap 5
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
});

/* =========================================================================================
   MODAL CUSTOS VIAGEM - Handlers e funções
   ========================================================================================= */

// Clique no botão de custos dentro da tabela
$(document).on('click', '#tblViagem .btn-custos-viagem', function (e)
{
    try
    {
        e.preventDefault();
        
        if ($(this).hasClass('disabled')) return;
        
        const viagemId = $(this).data('id');
        const modalEl = document.getElementById('modalCustosViagem');
        if (!modalEl) return;

        // Guarda o ID no modal
        modalEl.setAttribute('data-viagem-id', String(viagemId));
        $('#hiddenCustosViagemId').val(viagemId);

        // Abre o modal
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "click.btn-custos-viagem", error);
    }
});

// Quando o modal de custos é aberto
$('#modalCustosViagem').on('shown.bs.modal', function (e)
{
    try
    {
        const modalEl = this;
        let viagemId = modalEl.getAttribute('data-viagem-id');

        // Fallback: tenta pegar do hidden
        if (!viagemId || viagemId === 'undefined')
        {
            viagemId = $('#hiddenCustosViagemId').val();
        }

        if (!viagemId || viagemId === 'undefined')
        {
            console.error('ViagemId não encontrado');
            return;
        }

        // Reseta os campos
        resetarModalCustos();

        // Busca os custos da viagem
        carregarCustosViagem(viagemId);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "modalCustosViagem.shown", error);
    }
});

// Reseta os campos do modal
function resetarModalCustos()
{
    try
    {
        $('#spanNumeroViagem').text('-');
        $('#spanInfoViagem').text('Carregando...');
        $('#spanDuracao').text('-');
        $('#spanKm').text('-');
        $('#spanLitros').text('-');
        $('#spanConsumo').text('-');
        $('#spanTipoCombustivel').text('-');
        $('#spanCustoMotorista').text('R$ 0,00');
        $('#spanCustoVeiculo').text('R$ 0,00');
        $('#spanCustoCombustivel').text('R$ 0,00');
        $('#spanCustoOperador').text('R$ 0,00');
        $('#spanCustoLavador').text('R$ 0,00');
        $('#spanCustoTotal').text('R$ 0,00');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "resetarModalCustos", error);
    }
}

// Carrega os custos da viagem via API
function carregarCustosViagem(viagemId)
{
    try
    {
        $.ajax({
            url: '/api/Viagem/ObterCustosViagem',
            type: 'GET',
            data: { viagemId: viagemId },
            success: function (response)
            {
                try
                {
                    if (response.success && response.data)
                    {
                        preencherModalCustos(response.data);
                    } else
                    {
                        $('#spanInfoViagem').text(response.message || 'Erro ao carregar custos');
                        AppToast.show('Vermelho', response.message || 'Erro ao carregar custos', 4000);
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "carregarCustosViagem.success", error);
                }
            },
            error: function (xhr, status, error)
            {
                console.error('Erro ao carregar custos:', error);
                $('#spanInfoViagem').text('Erro ao carregar custos');
                AppToast.show('Vermelho', 'Erro ao carregar custos da viagem', 4000);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "carregarCustosViagem", error);
    }
}

// Preenche o modal com os dados recebidos
function preencherModalCustos(data)
{
    try
    {
        // Número da viagem
        $('#spanNumeroViagem').text(data.noFichaVistoria || '-');

        // Informações da viagem
        $('#spanInfoViagem').text(data.infoViagem || '-');

        // Estatísticas
        $('#spanDuracao').text(data.duracaoFormatada || '-');
        $('#spanKm').text(data.kmPercorrido > 0 ? `${data.kmPercorrido.toLocaleString('pt-BR')} km` : '-');
        $('#spanLitros').text(data.litrosGastos > 0 ? `${data.litrosGastos.toFixed(2).replace('.', ',')} L` : '-');
        $('#spanConsumo').text(data.consumoFormatado || '-');
        $('#spanTipoCombustivel').text(data.tipoCombustivel || '-');

        // Custos individuais
        $('#spanCustoMotorista').text(formatarMoedaCustos(data.custoMotorista));
        $('#spanCustoVeiculo').text(formatarMoedaCustos(data.custoVeiculo));
        $('#spanCustoCombustivel').text(formatarMoedaCustos(data.custoCombustivel));
        $('#spanCustoOperador').text(formatarMoedaCustos(data.custoOperador));
        $('#spanCustoLavador').text(formatarMoedaCustos(data.custoLavador));

        // Custo total
        $('#spanCustoTotal').text(formatarMoedaCustos(data.custoTotal));
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "preencherModalCustos", error);
    }
}

// Formata valor como moeda brasileira (nome diferente para evitar conflito)
function formatarMoedaCustos(valor)
{
    try
    {
        if (valor === null || valor === undefined) return 'R$ 0,00';
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "formatarMoedaCustos", error);
        return 'R$ 0,00';
    }
}

// Quando o modal é fechado, limpa o data attribute
$('#modalCustosViagem').on('hidden.bs.modal', function ()
{
    try
    {
        this.removeAttribute('data-viagem-id');
        $('#hiddenCustosViagemId').val('');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "modalCustosViagem.hidden", error);
    }
});

/* =========================================================================================
   FIM MODAL CUSTOS VIAGEM
   ========================================================================================= */

function ftxQueueFotoFetch(motoristaId)
{
    try
    {
        if (!motoristaId) return Promise.resolve("");

        if (FtxFotoCache.has(motoristaId))
        {
            return Promise.resolve(FtxFotoCache.get(motoristaId));
        }

        if (FtxFotoInflight.has(motoristaId))
        {
            return FtxFotoInflight.get(motoristaId);
        }

        const promise = new Promise((resolve) =>
        {
            FtxFotoQueue.push({ motoristaId, resolve });
            ftxDrainFotoQueue();
        });

        FtxFotoInflight.set(motoristaId, promise);
        return promise;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "ftxQueueFotoFetch", error);
        return Promise.resolve("");
    }
}

function ftxDrainFotoQueue()
{
    try
    {
        while (FtxFotoCurrent < FTX_MAX_CONCURRENT && FtxFotoQueue.length > 0)
        {
            const { motoristaId, resolve } = FtxFotoQueue.shift();
            FtxFotoCurrent++;

            $.get(FTX_FOTO_ENDPOINT, { id: motoristaId })
                .done(function (res)
                {
                    const src = (res && res.fotoBase64) ? res.fotoBase64 : "";
                    FtxFotoCache.set(motoristaId, src);
                    resolve(src);
                })
                .fail(function ()
                {
                    FtxFotoCache.set(motoristaId, "");
                    resolve("");
                })
                .always(function ()
                {
                    FtxFotoCurrent--;
                    FtxFotoInflight.delete(motoristaId);
                    ftxDrainFotoQueue();
                });
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "ftxDrainFotoQueue", error);
    }
}

// Observer para imagens: só dispara quando a imagem entrar na viewport do grid
const FtxFotoObserver = (function ()
{
    try
    {
        if (!('IntersectionObserver' in window)) return null;

        let rootEl = null;
        try
        {
            const cand1 = document.querySelector('#tblViagem_wrapper .dataTables_scrollBody');
            const cand2 = document.querySelector('#tblViagem_wrapper .dataTables_scroll');
            rootEl = cand1 || cand2 || null;
        } catch (e) { rootEl = null; }

        return new IntersectionObserver((entries, obs) =>
        {
            entries.forEach(entry =>
            {
                if (!entry.isIntersecting) return;

                const img = entry.target;
                const motId = img.getAttribute('data-mot-id');
                const ico = img.nextElementSibling && img.nextElementSibling.tagName === 'I'
                    ? img.nextElementSibling
                    : null;

                ftxQueueFotoFetch(motId).then(src =>
                {
                    if (img.getAttribute('data-mot-id') !== motId) return;

                    if (src)
                    {
                        img.src = src;
                        img.classList.add('is-visible');
                        if (ico) ico.style.display = 'none';
                    } else
                    {
                        img.removeAttribute('src');
                        img.classList.remove('is-visible');
                        if (ico) ico.style.display = 'inline-block';
                    }
                });

                obs.unobserve(img);
            });
        }, { root: rootEl, rootMargin: '120px', threshold: 0.01 });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "FtxFotoObserver", error);
        return null;
    }
})();

// Associa observer às imagens de uma TR
function ftxBindLazyImgsInRow(row)
{
    try
    {
        const $imgs = $(row).find('img[data-mot-id]');
        if (!$imgs.length) return;

        $imgs.each(function ()
        {
            const img = this;
            const motId = img.getAttribute('data-mot-id');

            if (motId && FtxFotoCache.has(motId))
            {
                img.src = FtxFotoCache.get(motId) || FTX_FOTO_PLACEHOLDER;
                return;
            }

            if (FtxFotoObserver)
            {
                FtxFotoObserver.observe(img);
            } else
            {
                ftxQueueFotoFetch(motId).then(src => { img.src = src; });
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "ftxBindLazyImgsInRow", error);
    }
}

// Render helper para a coluna "Motorista"
function ftxRenderMotorista(data, type, row, meta)
{
    try
    {
        const id = row.motoristaId || row.MotoristaId || '';
        const nome = row.nomeMotorista || row.NomeMotorista || '';

        if (type !== 'display') return nome || '';

        const safeNome = $('<div>').text(nome || '').html();
        const imgId = `ftx_foto_${id}_${meta.row}_${meta.col}`;
        const icoId = `${imgId}_ico`;

        const html = `
          <div class="d-flex align-items-center">
            <span class="ftx-avatar">
              <img id="${imgId}" data-mot-id="${id}" class="ftx-avatar-img" alt="Foto">
              <i id="${icoId}" class="fa-sharp-duotone fa-solid fa-user-tie ftx-avatar-ico" aria-hidden="true"></i>
            </span>
            <span>${safeNome}</span>
          </div>
        `;

        setTimeout(() =>
        {
            const img = document.getElementById(imgId);
            const ico = document.getElementById(icoId);
            if (!img) return;

            const cached = FtxFotoCache.get(id);
            const apply = (src) =>
            {
                if (src)
                {
                    img.src = src;
                    img.classList.add('is-visible');
                    if (ico) ico.style.display = 'none';
                } else
                {
                    img.removeAttribute('src');
                    img.classList.remove('is-visible');
                    if (ico) ico.style.display = 'block';
                }
            };

            if (cached !== undefined)
            {
                apply(cached);
            } else if (FtxFotoObserver)
            {
                FtxFotoObserver.observe(img);
            } else
            {
                ftxQueueFotoFetch(id).then(apply);
            }
        }, 0);

        return html;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "ftxRenderMotorista", error);
        return row && (row.nomeMotorista || row.NomeMotorista) || '';
    }
}

/* =========================================================================================
   FIM utilitários de lazy loading de foto
   ========================================================================================= */

$(function ()
{
    try
    {
        // Mostra loading imediatamente ao carregar a página
        // (substitui o spinner de bolinhas)
        FtxViagens.mostrarLoading('Aguarde enquanto carregamos as viagens...');
        
        // Carrega as viagens
        ListaTodasViagens();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "$(function)", error);
        FtxViagens.esconderLoading();
    }
});

document.addEventListener("DOMContentLoaded", function ()
{
    try
    {
        // Tooltip Duração
        const tooltipDuracao = new ej.popups.Tooltip({
            content: 'Se a <span style="color: #A0522D; font-weight: bold; text-decoration: underline;">Duração da Viagem</span> estiver muito longa, verifique se ela está <strong>Correta</strong>',
            opensOn: "Hover",
            cssClass: "custom-orange-tooltip",
            position: "TopCenter",
            beforeOpen: (args) =>
            {
                try
                {
                    if (CarregandoViagemBloqueada) args.cancel = true;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "tooltipDuracao.beforeOpen", error);
                }
            }
        });
        tooltipDuracao.appendTo("#txtDuracao");

        // Tooltip Km Percorrido
        const tooltipKm = new ej.popups.Tooltip({
            content: 'Se a <span style="color: #A0522D; font-weight: bold; text-decoration: underline;">Quilometragem Percorrida</span> estiver muito grande, verifique se ela está <strong>Correta</strong>',
            opensOn: "Hover",
            cssClass: "custom-orange-tooltip",
            position: "TopCenter",
            beforeOpen: (args) =>
            {
                try
                {
                    if (CarregandoViagemBloqueada) args.cancel = true;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "tooltipKm.beforeOpen", error);
                }
            }
        });
        tooltipKm.appendTo("#txtKmPercorrido");

        window.tooltipDuracao = tooltipDuracao;
        window.tooltipKm = tooltipKm;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "DOMContentLoaded", error);
    }
});

// Função para salvar ficha de vistoria
function salvarFichaVistoria()
{
    try
    {
        const fileInput = document.getElementById('txtFile');
        const file = fileInput.files[0];

        if (!file)
        {
            AppToast.show('Amarelo', 'Selecione um arquivo', 3000);
            return;
        }

        let viagemId = $('#hiddenViagemId').val() ||
            window.viagemIdAtual ||
            $('#modalFicha').data('viagem-id');

        console.log('ID final para salvar:', viagemId);

        if (!viagemId || viagemId === 'undefined' || viagemId === '')
        {
            AppToast.show('Vermelho', 'ID da viagem perdido. Feche o modal e tente novamente', 3000);
            return;
        }

        const formData = new FormData();
        formData.append('arquivo', file);
        formData.append('viagemId', viagemId);

        $('#loadingSpinner').show();
        $('#imageContainer').hide();
        $('#btnSalvarFicha').prop('disabled', true);

        $.ajax({
            url: '/api/Viagem/UploadFichaVistoria',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response)
            {
                $('#loadingSpinner').hide();
                $('#imageContainer').show();
                $('#btnSalvarFicha').prop('disabled', false);

                if (response.success)
                {
                    AppToast.show('Verde', response.message || 'Ficha salva com sucesso', 3000);

                    const table = $('#tblViagem').DataTable();
                    if (table)
                    {
                        table.ajax.reload(null, false);
                    }

                    setTimeout(() =>
                    {
                        const modalFicha = bootstrap.Modal.getInstance(document.getElementById('modalFicha'));
                        if (modalFicha) modalFicha.hide();
                        $('.modal-backdrop').remove();
                        $('body').removeClass('modal-open');
                    }, 1500);
                } else
                {
                    AppToast.show('Vermelho', response.message || 'Erro ao salvar ficha', 3000);
                }
            },
            error: function (xhr)
            {
                $('#loadingSpinner').hide();
                $('#imageContainer').show();
                $('#btnSalvarFicha').prop('disabled', false);

                const errorMsg = xhr.responseJSON?.message || 'Erro ao enviar arquivo';
                AppToast.show('Vermelho', errorMsg, 4000);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "salvarFichaVistoria", error);
    }
}

// Função para resetar o modal
function resetModalFicha()
{
    try
    {
        $('#txtFile').val('');
        $('#imgFichaViewer').attr('src', '').hide();
        $('#noImageContainer').hide();
        $('#loadingSpinner').hide();
        $('#imageContainer').show();
        $('#uploadContainer').show();
        $('#btnSalvarFicha').hide();
        $('#btnAlterarFicha').hide();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "resetModalFicha", error);
    }
}

// Função para carregar ficha existente
function carregarFichaVistoria(viagemId)
{
    try
    {
        if (!viagemId)
        {
            console.error('ViagemId não fornecido');
            return;
        }

        console.log('Carregando ficha para viagem:', viagemId);

        $('#loadingSpinner').show();
        $('#imageContainer').hide();

        $.ajax({
            url: '/api/Viagem/ObterFichaVistoria',
            type: 'GET',
            data: { viagemId: viagemId },
            success: function (response)
            {
                $('#loadingSpinner').hide();
                $('#imageContainer').show();

                if (response.success && response.temImagem)
                {
                    $('#imgFichaViewer').attr('src', response.imagemBase64).show();
                    $('#noImageContainer').hide();
                    $('#uploadContainer').hide();
                    $('#btnAlterarFicha').show();
                    $('#btnSalvarFicha').hide();
                } else
                {
                    $('#imgFichaViewer').hide();
                    $('#noImageContainer').show();
                    $('#uploadContainer').show();
                    $('#btnAlterarFicha').hide();
                    $('#btnSalvarFicha').hide();
                }
            },
            error: function (xhr)
            {
                $('#loadingSpinner').hide();
                $('#imageContainer').show();
                $('#noImageContainer').show();
                AppToast.show('Vermelho', 'Erro ao carregar ficha de vistoria', 3000);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "carregarFichaVistoria", error);
    }
}

$(document).ready(function ()
{
    try
    {
        // Garante que o botão Fechar funcione
        $('#modalFicha .btn-secondary, #modalFicha .close').on('click', function ()
        {
            const modalFicha = bootstrap.Modal.getInstance(document.getElementById('modalFicha'));
            if (modalFicha) modalFicha.hide();
            setTimeout(() =>
            {
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open').css('padding-right', '');
            }, 300);
        });

        // Fecha modal ao pressionar ESC
        $(document).on('keydown', function (e)
        {
            if (e.key === 'Escape' && $('#modalFicha').hasClass('show'))
            {
                const modalFicha = bootstrap.Modal.getInstance(document.getElementById('modalFicha'));
                if (modalFicha) modalFicha.hide();
            }
        });

        // Ao fechar o modal
        $('#modalFicha').on('hidden.bs.modal', function ()
        {
            resetModalFicha();
            window.viagemIdAtual = null;
            $('#hiddenViagemId').val('');
            $('#modalFicha').removeData('viagem-id');
        });

        // Preview da imagem ao selecionar arquivo
        $('#txtFile').on('change', function (e)
        {
            const file = e.target.files[0];
            if (file)
            {
                if (!file.type.match('image.*'))
                {
                    AppToast.show('Vermelho', 'Por favor, selecione apenas arquivos de imagem', 3000);
                    this.value = '';
                    return;
                }

                if (file.size > 5 * 1024 * 1024)
                {
                    AppToast.show('Vermelho', 'O arquivo não pode ser maior que 5MB', 3000);
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e)
                {
                    $('#imgFichaViewer').attr('src', e.target.result).show();
                    $('#noImageContainer').hide();
                    $('#btnSalvarFicha').show();
                    $('#btnAlterarFicha').hide();
                };
                reader.readAsDataURL(file);
            }
        });

        // Botão Salvar Ficha
        $('#btnSalvarFicha').on('click', function ()
        {
            console.log('Clique no botão salvar. ID atual:', window.viagemIdAtual);
            salvarFichaVistoria();
        });

        // Botão Alterar Ficha
        $('#btnAlterarFicha').on('click', function ()
        {
            $('#uploadContainer').show();
            $('#btnAlterarFicha').hide();
            $('#txtFile').val('').trigger('click');
        });

        // Inicialização dos componentes Syncfusion
        if (document.getElementById("ddtCombustivelInicial") &&
            document.getElementById("ddtCombustivelInicial").ej2_instances)
        {
            document.getElementById("ddtCombustivelInicial").ej2_instances[0].showPopup();
            document.getElementById("ddtCombustivelInicial").ej2_instances[0].hidePopup();
            console.log("Mostrei/Escondi Popup");
        }
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "document.ready", error);
    }
});

$(document).on("click", ".btn-cancela-viagem", async function ()
{
    try
    {
        const id = $(this).data("id");

        const confirmacao = await window.SweetAlertInterop.ShowConfirm(
            "Cancelar Viagem",
            "Você tem certeza que deseja cancelar esta viagem? Não será possível desfazer a operação!",
            "Cancelar a Viagem",
            "Desistir"
        );

        if (confirmacao)
        {
            const dataToPost = JSON.stringify({ ViagemId: id });
            $.ajax({
                url: "/api/Viagem/Cancelar",
                type: "POST",
                data: dataToPost,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            })
                .done(function (data)
                {
                    try
                    {
                        if (data.success)
                        {
                            AppToast.show('Verde', data.message);
                            $("#tblViagem").DataTable().ajax.reload();
                        } else
                        {
                            AppToast.show('Vermelho', data.message);
                        }
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("ViagemIndex.js", "ajax.done.cancelar", error);
                    }
                })
                .fail(function (err)
                {
                    try
                    {
                        TratamentoErroComLinha("ViagemIndex.js", "ajax.error", err);
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("ViagemIndex.js", "ajax.fail.cancelar", error);
                    }
                });
        }
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "click.btn-cancelar", error);
    }
});

$("#modalFinalizaViagem").on("shown.bs.modal", function (event)
{
    try
    {
        // 1) tenta pegar do clique
        let $btn = $(event.relatedTarget || []);
        // 2) fallback: pegar do atributo gravado no modal
        const modalEl = this;
        const fallbackId = modalEl.getAttribute('data-trigger-id');
        const viagemId = ($btn.length ? $btn.data("id") : null) || fallbackId;

        if (!viagemId)
        {
            console.warn("Não foi possível determinar o viagemId para preencher o modal.");
            return;
        }

        $("#txtId").val(viagemId);

        const dt = $("#tblViagem").DataTable();
        let idx = dt.rows((i, r) => String(r.viagemId) === String(viagemId)).indexes()[0];
        let data = (idx !== undefined) ? dt.row(idx).data() : null;

        if (!data)
        {
            // tenta a linha do botão (quando veio de relatedTarget)
            if ($btn.length)
            {
                data = dt.row($btn.closest("tr")).data();
                if (!data)
                {
                    const $parent = $btn.closest("tr.child").prev(".parent");
                    if ($parent.length) data = dt.row($parent).data();
                }
            }
        }

        // --- a partir daqui, exatamente a sua lógica original ---
        let dataInicial = data?.dataInicial ? new Date(data.dataInicial).toLocaleDateString("pt-BR") : "";
        let horaInicio = data?.horaInicio ? new Date(data.horaInicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

        $("#txtDataInicial").val(dataInicial).prop("disabled", true);
        $("#txtHoraInicial").val(horaInicio).prop("disabled", true);
        $("#txtKmInicial").val(data.kmInicial).prop("disabled", true);

        const combInicial = document.getElementById("ddtCombustivelInicial");
        const combFinal = document.getElementById("ddtCombustivelFinal");
        const rteDescricao = document.getElementById("rteDescricao");

        if (combInicial?.ej2_instances?.length)
        {
            combInicial.ej2_instances[0].value = [data.combustivelInicial];
            combInicial.ej2_instances[0].enabled = false;
        }

        $("#h3Titulo").html("Finalizar a Viagem - Ficha nº " + data.noFichaVistoria + " de " + data.nomeMotorista);

        // ✅ OCORRÊNCIAS: Debug - mostrar todos os campos disponíveis
        console.log("📋 Dados da viagem disponíveis:", data);
        console.log("   Campos:", Object.keys(data));
        
        // Tentar encontrar veiculoId com diferentes nomes
        var veiculoIdValue = data.veiculoId || data.VeiculoId || data.veiculo_id || '';
        var motoristaIdValue = data.motoristaId || data.MotoristaId || data.motorista_id || '';
        
        console.log("   veiculoId encontrado:", veiculoIdValue);
        console.log("   motoristaId encontrado:", motoristaIdValue);
        
        // ✅ OCORRÊNCIAS: Armazenar veiculoId e motoristaId no modal para uso posterior
        modalEl.setAttribute('data-veiculo-id', veiculoIdValue);
        modalEl.setAttribute('data-motorista-id', motoristaIdValue);

        if (data.dataFinal != null)
        {
            CarregandoViagemBloqueada = true;

            const formattedDate = new Date(data.dataFinal).toLocaleDateString("pt-BR");
            $("#txtDataFinal").removeAttr("type").val(formattedDate).attr("readonly", true);

            const isoHour = data.horaFim || "2025-08-05T09:50:00";
            const dateHour = new Date(isoHour);
            const timeFormatted = `${String(dateHour.getHours()).padStart(2, "0")}:${String(dateHour.getMinutes()).padStart(2, "0")}`;
            $("#txtHoraFinal").val(timeFormatted).attr("readonly", true);

            $("#txtKmFinal").val(data.kmFinal).attr("readonly", true);

            if (combFinal?.ej2_instances?.length)
            {
                combFinal.ej2_instances[0].value = [data.combustivelFinal];
                combFinal.ej2_instances[0].enabled = false;
            }
            if (rteDescricao?.ej2_instances?.length)
            {
                rteDescricao.ej2_instances[0].value = data.descricao;
                rteDescricao.ej2_instances[0].readonly = true;
            }

            $("#chkStatusDocumento").prop("checked", data.statusDocumento).prop("disabled", true);
            $("#chkStatusCartaoAbastecimento").prop("checked", data.statusCartaoAbastecimento).prop("disabled", true);

            calcularDistanciaViagem();
            calcularDuracaoViagem();

            $("#btnFinalizarViagem").hide();
        } else
        {
            const agora = new Date();
            const dataAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
            const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

            $("#txtDataFinal").removeAttr("type").attr("type", "date").val(dataAtual);
            $("#txtHoraFinal").val(horaAtual);
            $("#txtKmFinal").val("");

            calcularDuracaoViagem();

            if (combFinal?.ej2_instances?.length)
            {
                combFinal.ej2_instances[0].value = "";
                combFinal.ej2_instances[0].enabled = true;
            }
            if (rteDescricao?.ej2_instances?.length)
            {
                rteDescricao.ej2_instances[0].value = data.descricao || "";
                rteDescricao.ej2_instances[0].readonly = false;
            }

            $("#chkStatusDocumento").prop("checked", true).attr("readonly", false);
            $("#chkStatusCartaoAbastecimento").prop("checked", true).attr("readonly", false);

            $("#btnFinalizarViagem").show();

            // ✅ OCORRÊNCIAS: Limpar ocorrências anteriores ao abrir modal para nova finalização
            if (typeof OcorrenciaViagem !== 'undefined' && OcorrenciaViagem.limparOcorrencias) {
                OcorrenciaViagem.limparOcorrencias();
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "shown.bs.modal", error);
    }
});

$("#modalFinalizaViagem").on("hide.bs.modal", function ()
{
    try
    {
        $("#txtId, #txtDataInicial, #txtHoraInicial, #txtKmInicial, #txtDataFinal, #txtHoraFinal, #txtKmFinal")
            .val("")
            .removeAttr("readonly");
        $("#txtDataFinal").attr("type", "date");

        const combInicial = document.getElementById("ddtCombustivelInicial");
        if (combInicial && combInicial.ej2_instances && combInicial.ej2_instances.length > 0)
        {
            combInicial.ej2_instances[0].value = "";
            combInicial.ej2_instances[0].enabled = true;
        }

        const combFinal = document.getElementById("ddtCombustivelFinal");
        if (combFinal && combFinal.ej2_instances && combFinal.ej2_instances.length > 0)
        {
            combFinal.ej2_instances[0].value = "";
            combFinal.ej2_instances[0].enabled = true;
        }

        const combKm = document.getElementById("txtKmPercorrido");
        if (combKm && combKm.ej2_instances && combKm.ej2_instances.length > 0)
        {
            combKm.ej2_instances[0].value = "";
            combKm.ej2_instances[0].enabled = true;
        }

        const rteDescricao = document.getElementById("rteDescricao");
        if (rteDescricao && rteDescricao.ej2_instances && rteDescricao.ej2_instances.length > 0)
        {
            rteDescricao.ej2_instances[0].value = "";
            rteDescricao.ej2_instances[0].readonly = false;
        }

        document.getElementById("txtKmPercorrido").value = "";
        document.getElementById("txtDuracao").value = "";

        $("#chkStatusDocumento, #chkStatusCartaoAbastecimento")
            .prop("checked", false)
            .attr("readonly", false);
        $("#btnFinalizarViagem").show();

        // ✅ OCORRÊNCIAS: Limpar ocorrências ao fechar modal
        if (typeof OcorrenciaViagem !== 'undefined' && OcorrenciaViagem.limparOcorrencias) {
            OcorrenciaViagem.limparOcorrencias();
        }

        // ✅ OCORRÊNCIAS: Limpar data attributes
        this.removeAttribute('data-veiculo-id');
        this.removeAttribute('data-motorista-id');
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "hide.bs.modal", error);
    }
});

function formatDateBR(dateStr)
{
    try
    {
        if (dateStr.includes("/"))
        {
            return dateStr;
        }
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "formatDateBR", error);
        return dateStr;
    }
}

// Função para converter dd/MM/yyyy → Date
function parseDataBR(dataBR)
{
    if (!dataBR) return null;
    const partes = dataBR.split('/');
    // new Date(ano, mês-1, dia)
    return new Date(partes[2], partes[1] - 1, partes[0]);
}

$("#txtDataFinal").focusout(function ()
{
    try
    {
        const rawDataInicial = document.getElementById("txtDataInicial")?.value;
        const horaInicial = document.getElementById("txtHoraInicial")?.value;
        const rawDataFinal = document.getElementById("txtDataFinal")?.value;
        const horaFinal = document.getElementById("txtHoraFinal")?.value;

        //const dataInicial = formatDateBR(rawDataInicial);
        //const dataFinal = formatDateBR(rawDataFinal);

        // Converter para Date objects
        const dataInicial = parseDataBR(rawDataInicial);
        const dataFinal = parseDataBR(rawDataFinal);

        var inicio = moment(`${dataInicial}`, "DD/MM/YYYY HH:mm");
        var fim = moment(`${dataFinal}`, "DD/MM/YYYY HH:mm");

        if (!inicio.isValid() || !fim.isValid()) return;

        // VALIDAÇÃO: Data Final não pode ser superior à data atual
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        if (dataFinal > hoje)
        {
            $("#txtDataFinal").val("");
            $("#txtDuracao").val("");
            $("#txtDataFinal").focus();
            AppToast.show("Amarelo", "A Data Final não pode ser superior à data atual.", 4000);
            return;
        }

        if (dataFinal < dataInicial)
        {
            $("#txtDataFinal").val("");
            $("#txtDuracao").val("");
            Alerta.Erro("Erro na Data", "A data final deve ser maior que a inicial!");
            return;
        }

        validarDatasSimples(dataInicial, dataFinal);

        if (dataFinal === dataInicial)
        {
            const horaInicial = $("#txtHoraInicial").val();
            const horaFinal = $("#txtHoraFinal").val();

            if (!horaInicial || !horaFinal) return;

            const [hI, mI] = horaInicial.split(":").map(Number);
            const [hF, mF] = horaFinal.split(":").map(Number);
            const minIni = hI * 60 + mI;
            const minFin = hF * 60 + mF;

            if (minFin <= minIni)
            {
                $("#txtHoraFinal").val("");
                $("#txtDuracao").val("");
                Alerta.Erro("Erro na Hora", "A hora final deve ser maior que a inicial quando as datas forem iguais!");
                return;
            }
        }

        calcularDuracaoViagem();
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "focusout.txtDataFinal", error);
    }
});

$("#txtHoraFinal").focusout(function ()
{
    try
    {
        if ($("#txtDataFinal").val() === "" && $("#txtHoraFinal").val() != "")
        {
            Alerta.Erro("Erro na Hora", "A hora final só pode ser preenchida depois de Data Final!");
            $("#txtHoraFinal").val("");
            $("#txtDuracao").val("");
        }

        const horaInicial = $("#txtHoraInicial").val();
        const horaFinal = $("#txtHoraFinal").val();

        const dataInicialParts = $("#txtDataInicial").val().split("/");
        const dataInicial = `${dataInicialParts[2]}-${dataInicialParts[1]}-${dataInicialParts[0]}`;
        const dataFinal = $("#txtDataFinal").val();

        if (!dataFinal)
        {
            $("#txtHoraFinal").val("");
            Alerta.Erro("Erro na Hora Final", "Preencha a Data Final para poder preencher a Hora Final!");
            return;
        }

        if (dataInicial === dataFinal)
        {
            if (!horaInicial || !horaFinal) return;

            const [hIni, mIni] = horaInicial.split(":").map(Number);
            const [hFin, mFin] = horaFinal.split(":").map(Number);

            const minutosInicial = hIni * 60 + mIni;
            const minutosFinal = hFin * 60 + mFin;

            if (minutosFinal <= minutosInicial)
            {
                $("#txtHoraFinal").val("");
                Alerta.Erro("Erro na Hora", "A hora final deve ser maior que a inicial quando as datas forem iguais!");
            }
        }

        calcularDuracaoViagem();
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "focusout.txtHoraFinal", error);
    }
});

$("#txtKmInicial").focusout(function ()
{
    try
    {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmAtualStr = $("#txtKmAtual").val();

        if (!kmInicialStr || !kmAtualStr)
        {
            $("#txtKmPercorrido").val("");
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(",", "."));
        const kmAtual = parseFloat(kmAtualStr.replace(",", "."));

        if (isNaN(kmInicial) || isNaN(kmAtual))
        {
            $("#txtKmPercorrido").val("");
            return;
        }

        if (kmInicial < 0)
        {
            $("#txtKmInicial").val("");
            $("#txtKmPercorrido").val("");
            Alerta.Erro("Erro na Quilometragem", "A quilometragem <strong>inicial</strong> deve ser maior que <strong>zero</strong>!");
            return;
        }

        if (kmInicial < kmAtual)
        {
            $("#txtKmAtual").val("");
            $("#txtKmPercorrido").val("");
            Alerta.Erro("Erro na Quilometragem", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>!");
            return;
        }

        calcularDistanciaViagem();
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "focusout.txtKmInicial", error);
    }
});

$("#txtKmFinal").focusout(function ()
{
    try
    {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmFinalStr = $("#txtKmFinal").val();

        if (!kmInicialStr || !kmFinalStr)
        {
            $("#txtKmPercorrido").val("");
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(",", "."));
        const kmFinal = parseFloat(kmFinalStr.replace(",", "."));

        if (isNaN(kmInicial) || isNaN(kmFinal))
        {
            $("#txtKmPercorrido").val("");
            return;
        }

        if (kmFinal < kmInicial)
        {
            $("#txtKmFinal").val("");
            $("#txtKmPercorrido").val("");
            Alerta.Erro("Erro na Quilometragem", "A quilometragem <strong>final</strong> deve ser maior que a <strong>inicial</strong>!");
            return;
        }

        const kmPercorrido = (kmFinal - kmInicial).toFixed(2);
        $("#txtKmPercorrido").val(kmPercorrido);

        if (kmPercorrido > 100)
        {
            Alerta.Alerta("Alerta na Quilometragem", "A quilometragem <strong>final</strong> excede em 100km a <strong>inicial</strong>!");
        }

        calcularDistanciaViagem();
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "focusout.txtKmFinal", error);
    }
});

function calcularDistanciaViagem()
{
    try
    {
        var elKmIni = document.getElementById("txtKmInicial");
        var elKmFim = document.getElementById("txtKmFinal");
        var elPerc = document.getElementById("txtKmPercorrido");
        if (!elKmIni || !elKmFim || !elPerc) return;

        var ini = parseFloat((elKmIni.value || '').replace(",", "."));
        var fim = parseFloat((elKmFim.value || '').replace(",", "."));

        if (isNaN(ini) || isNaN(fim))
        {
            elPerc.value = "";
            FieldUX.setInvalid(elPerc, false);
            FieldUX.setHigh(elPerc, false);
            FieldUX.tooltipOnTransition(elPerc, false, 1, 'tooltipKm');
            return;
        }

        var diff = +(fim - ini).toFixed(2);
        elPerc.value = isFinite(diff) ? diff : "";

        var invalid = (diff < 0 || diff > 100);
        var high = (!invalid && diff >= 50 && diff <= 100);

        FieldUX.setInvalid(elPerc, invalid);
        FieldUX.setHigh(elPerc, high);
        FieldUX.tooltipOnTransition(elPerc, invalid && !window.CarregandoViagemBloqueada, 1200, 'tooltipKm');
    } catch (error)
    {
        if (typeof TratamentoErroComLinha === 'function')
        {
            TratamentoErroComLinha("ViagemIndex.js", "calcularDistanciaViagem", error);
        } else { console.error(error); }
    }
}

window.calcularKmPercorrido = window.calcularKmPercorrido || calcularDistanciaViagem;

function parseDate(d)
{
    try
    {
        if (!d) return null;
        if (d.includes("/"))
        {
            const [dia, mes, ano] = d.split("/");
            return new Date(ano, mes - 1, dia);
        }
        if (d.includes("-"))
        {
            const [ano, mes, dia] = d.split("-");
            return new Date(ano, mes - 1, dia);
        }
        return null;
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "parseDate", error);
        return null;
    }
}

async function validarDatasSimples()
{
    try
    {
        const dataInicialStr = $("#txtDataInicial").val();
        const dataFinalInput = $("#txtDataFinal");
        const dataFinalStr = dataFinalInput.val();

        if (dataInicialStr === "")
        {
            Alerta.Erro("Erro na Data", "A data inicial é obrigatória!");
            return false;
        }

        if (dataInicialStr !== "" && dataFinalStr !== "")
        {
            const dtInicial = parseDate(dataInicialStr);
            const dtFinal = parseDate(dataFinalStr);

            if (!dtInicial || !dtFinal)
            {
                Alerta.Erro("Erro na Data", "Formato de data inválido!");
                return false;
            }

            dtInicial.setHours(0, 0, 0, 0);
            dtFinal.setHours(0, 0, 0, 0);

            const diferencaDias = (dtFinal - dtInicial) / (1000 * 60 * 60 * 24);

            if (diferencaDias >= 5)
            {
                const mensagem = "A Data Final está 5 dias ou mais após a Data Inicial. Tem certeza?";
                const confirmado = await window.SweetAlertInterop.ShowPreventionAlert(mensagem);

                if (confirmado)
                {
                    showSyncfusionToast("Confirmação feita pelo usuário!", "success", "💪🏼");
                } else
                {
                    showSyncfusionToast("Ação cancelada pelo usuário", "danger", "😟");

                    const campo = document.getElementById("txtDataFinal");
                    if (campo)
                    {
                        campo.value = "";
                        campo.focus();
                        return false;
                    }
                }
            }
        }

        return true;
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "validarDatasSimples", error);
        return false;
    }
}

async function validarKmAtualFinal()
{
    try
    {
        const kmInicial = $("#txtKmInicial").val();
        const kmAtual = $("#txtKmAtual").val();

        if (!kmInicial || !kmAtual) return true;

        const ini = parseFloat(kmAtual.replace(",", "."));
        const fim = parseFloat(kmInicial.replace(",", "."));

        if (fim < ini)
        {
            Alerta.Erro("Erro", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>.");
            return false;
        }

        const diff = fim - ini;

        if (diff > 100)
        {
            const confirmado = await Alerta.Confirmar(
                "Quilometragem Alta",
                'A quilometragem <span style="color: #A0522D; font-weight: bold; text-decoration: underline;">Inicial</span> excede em 100km a <span style="color: #A0522D; font-weight: bold; text-decoration: underline;">Atual</span>. Tem certeza?',
                "Tenho certeza! 💪🏼",
                "Me enganei! 😟"
            );

            if (!confirmado)
            {
                const txtKmInicialElement = document.getElementById("txtKmInicial");
                txtKmInicialElement.value = null;
                txtKmInicialElement.focus();
                return false;
            }
        }

        return true;
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "validarKmAtualFinal", error);
        return false;
    }
}

async function validarKmInicialFinal()
{
    try
    {
        const kmInicial = $("#txtKmInicial").val();
        const kmFinal = $("#txtKmFinal").val();

        if (!kmInicial || !kmFinal) return true;

        const ini = parseFloat(kmInicial.replace(",", "."));
        const fim = parseFloat(kmFinal.replace(",", "."));

        if (fim < ini)
        {
            Alerta.Erro("Erro", "A quilometragem final deve ser maior que a inicial.");
            return false;
        }

        const diff = fim - ini;
        if (diff > 100)
        {
            const confirmado = await Alerta.Confirmar(
                "Quilometragem Alta",
                'A quilometragem <span style="color: #A0522D; font-weight: bold; text-decoration: underline;">Final</span> excede em 100km a <span style="color: #A0522D; font-weight: bold; text-decoration: underline;">Inicial</span>. Tem certeza?',
                "Tenho certeza! 💪🏼",
                "Me enganei! 😟"
            );

            if (!confirmado)
            {
                const txtKmFinalElement = document.getElementById("txtKmFinal");
                txtKmFinalElement.value = null;
                txtKmFinalElement.focus();
                return false;
            }
        }

        return true;
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "validarKmInicialFinal", error);
        return false;
    }
}

function ListaTodasViagens()
{
    try
    {
        let veiculoId = "";
        const veiculosCombo = document.getElementById("lstVeiculos");
        if (veiculosCombo && veiculosCombo.ej2_instances && veiculosCombo.ej2_instances.length > 0)
        {
            const combo = veiculosCombo.ej2_instances[0];
            if (combo.value != null && combo.value !== "")
            {
                veiculoId = combo.value;
            }
        }

        let motoristaId = "";
        const motoristasCombo = document.getElementById("lstMotorista");
        if (motoristasCombo && motoristasCombo.ej2_instances && motoristasCombo.ej2_instances.length > 0)
        {
            const combo = motoristasCombo.ej2_instances[0];
            if (combo.value != null && combo.value !== "")
            {
                motoristaId = combo.value;
            }
        }

        let eventoId = "";
        const eventosCombo = document.getElementById("lstEventos");
        if (eventosCombo && eventosCombo.ej2_instances && eventosCombo.ej2_instances.length > 0)
        {
            const combo = eventosCombo.ej2_instances[0];
            if (combo.value != null && combo.value !== "")
            {
                eventoId = combo.value;
            }
        }

        let statusId = "Aberta";
        const statusCombo = document.getElementById("lstStatus");
        if (statusCombo && statusCombo.ej2_instances && statusCombo.ej2_instances.length > 0)
        {
            const status = statusCombo.ej2_instances[0];
            if (status.value === "" || status.value === null)
            {
                if (motoristaId || veiculoId || eventoId || ($("#txtData").val() != null && $("#txtData").val() !== ""))
                {
                    statusId = "Todas";
                }
            } else
            {
                statusId = status.value;
            }
        }

        const dateVal = $("#txtData").val();
        const date = dateVal ? dateVal.split("-") : null;
        const dataViagem = date && date.length === 3 ? `${date[2]}/${date[1]}/${date[0]}` : "";

        const URLapi = "/api/viagem";

        let dataTableViagens = $("#tblViagem").DataTable();
        dataTableViagens.destroy();
        $("#tblViagem tbody").empty();

        dataTableViagens = $("#tblViagem").DataTable({
            autoWidth: false,
            dom: "Bfrtip",
            deferRender: true,
            stateSave: false,
            lengthMenu: [
                [10, 25, 50, -1],
                ["10 linhas", "25 linhas", "50 linhas", "Todas as Linhas"]
            ],
            buttons: [
                "pageLength",
                "excel",
                {
                    extend: "pdfHtml5",
                    orientation: "landscape",
                    pageSize: "LEGAL"
                }
            ],
            order: [], // Ordenação feita no servidor
            columnDefs: [
                { targets: 0, className: "text-center", width: "3%" },
                { targets: 1, className: "text-center", width: "3%" },
                { targets: 2, className: "text-center", width: "3%" },
                { targets: 3, className: "text-left", width: "10%" },
                { targets: 4, className: "text-left", width: "10%" },
                { targets: 5, className: "text-left", width: "10%" },
                { targets: 6, className: "text-left", width: "10%" },
                { targets: 7, className: "text-center", width: "4%" },
                { targets: 8, className: "text-center", width: "6%" },
                { targets: 9, className: "text-center", width: "1%", visible: false },
                { targets: 10, className: "text-center", visible: false },
                { targets: 11, className: "text-center", visible: false },
                { targets: 12, className: "text-center", visible: false },
                { targets: 13, className: "text-center", visible: false },
                { targets: 14, className: "text-center", visible: false },
                { targets: 15, className: "text-center", visible: false },
                { targets: 16, className: "text-center", visible: false },
                { targets: 17, className: "text-center", visible: false },
                { targets: 18, className: "text-center", visible: false },
                { targets: 19, className: "text-center", visible: false },
                { targets: 20, className: "text-center", visible: false }
            ],
            responsive: true,
            ajax: {
                url: URLapi,
                type: "GET",
                data: {
                    veiculoId: veiculoId,
                    motoristaId: motoristaId,
                    statusId: statusId,
                    dataviagem: dataViagem,
                    eventoId: eventoId
                },
                datatype: "json"
            },
            columns: [
                { data: "noFichaVistoria" },
                {
                    data: "dataInicial",
                    render: function (data)
                    {
                        try
                        {
                            if (!data) return "";
                            var date = new Date(data);
                            return date.toLocaleDateString("pt-BR");
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ViagemIndex.js", "render.dataInicial", error);
                            return "";
                        }
                    }
                },
                {
                    data: "horaInicio",
                    render: function (data)
                    {
                        try
                        {
                            if (!data) return "";
                            var date = new Date(data);
                            return date.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit"
                            });
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ViagemIndex.js", "render.horaInicio", error);
                            return "";
                        }
                    }
                },
                { data: "nomeRequisitante" },
                { data: "nomeSetor" },
                {
                    data: null,
                    name: "nomeMotorista",
                    render: ftxRenderMotorista
                },
                { data: "descricaoVeiculo" },
                // COLUNA: Status (badge compacto com ícones - padrão Manutenção)
                {
                    data: "status",
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            if (row.status === "Aberta")
                            {
                                return `<span class="ftx-viagem-badge ftx-viagem-badge-aberta">
                                            <i class="fa-solid fa-circle-check"></i> Aberta
                                        </span>`;
                            }
                            if (row.status === "Realizada")
                            {
                                return `<span class="ftx-viagem-badge ftx-viagem-badge-realizada">
                                            <i class="fa-solid fa-lock"></i> Realizada
                                        </span>`;
                            }
                            // Cancelada
                            return `<span class="ftx-viagem-badge ftx-viagem-badge-cancelada">
                                        <i class="fa-solid fa-xmark"></i> Cancelada
                                    </span>`;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ViagemIndex.js", "render.status", error);
                            return "";
                        }
                    }
                },
                // COLUNA: Ação (ícones em botões 28x28, Bootstrap 5)
                {
                    data: "viagemId",
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            const isAberta = row.status === "Aberta";
                            const disabledAttrs = isAberta ? "" : 'class="disabled" aria-disabled="true" tabindex="-1"';
                            const disabledClass = isAberta ? "" : "disabled";

                            return `
                                    <div class="text-center ftx-actions">
                                        <!-- Editar -->
                                        <a href="/Viagens/Upsert?id=${data}"
                                           class="btn btn-azul text-white btn-icon-28"
                                           data-ejtip="Editar a Viagem">
                                            <i class="fad fa-pen-to-square"></i>
                                        </a>

                                        <!-- Finalizar (abre modal Bootstrap 5) -->
                                        <a class="btn btn-fundo-laranja text-white btn-icon-28 ${disabledClass}"
                                           href="javascript:void(0)"
                                           data-bs-toggle="modal" data-bs-target="#modalFinalizaViagem"
                                           data-id="${data}"
                                           data-ejtip="Finalizar a Viagem">
                                            <i class="fad fa-flag-checkered"></i>
                                        </a>

                                        <!-- Cancelar (desabilitado se não estiver Aberta) -->
                                        <a class="btn btn-cancela-viagem btn-vinho text-white btn-icon-28 ${disabledClass}"
                                           href="javascript:void(0)" ${disabledAttrs}
                                           data-id="${data}"
                                           data-ejtip="Cancelar a Viagem">
                                            <i class="fad fa-rectangle-xmark"></i>
                                        </a>

                                        <a class="btn btn-imprimir text-white btn-icon-28 btn-glow"
                                           href="javascript:void(0)"
                                           role="button"
                                           data-viagem-id="${data}"
                                           data-ejtip="Ficha da Viagem">
                                            <i class="fad fa-print"></i>
                                        </a>

                                        <!-- Ficha de Vistoria (desabilitado se aberta) -->
                                        <a class="btn btn-foto text-white btn-icon-28 ${isAberta ? 'disabled' : ''}"
                                           href="javascript:void(0)"
                                           ${isAberta ? '' : `onclick="abrirModalFicha('${data}')"`}
                                           ${isAberta ? 'tabindex="-1" aria-disabled="true"' : ''}
                                           data-ejtip="Ficha de Vistoria">
                                            <i class="fad fa-clipboard-check"></i>
                                        </a>

                                        <!-- Custos da Viagem (desabilitado se aberta) -->
                                        <a class="btn btn-custos-viagem text-white btn-icon-28 ${isAberta ? 'disabled' : ''}"
                                           href="javascript:void(0)"
                                           data-id="${data}"
                                           ${isAberta ? 'tabindex="-1" aria-disabled="true"' : ''}
                                           data-ejtip="Custos da Viagem">
                                            <i class="fad fa-money-bill-wave"></i>
                                        </a>

                                        <!-- Ocorrências da Viagem (desabilitado se aberta) -->
                                        <a class="btn btn-ocorrencias-viagem text-white btn-icon-28 ${isAberta ? 'disabled' : ''}"
                                           href="javascript:void(0)"
                                           data-id="${data}"
                                           data-noficha="${row.noFichaVistoria || ''}"
                                           ${isAberta ? 'tabindex="-1" aria-disabled="true"' : ''}
                                           data-ejtip="Ocorrências da Viagem">
                                            <i class="fad fa-car-burst"></i>
                                        </a>
                                    </div>`;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ViagemIndex.js", "render.viagemId", error);
                            return "";
                        }
                    }
                },
                {
                    data: "viagemId",
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            return meta.row + meta.settings._iDisplayStart + 1;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ViagemIndex.js", "render.rowNumber", error);
                            return "";
                        }
                    }
                },
                { data: "kmInicial" },
                { data: "combustivelInicial" },
                { data: "dataFinal" },
                { data: "horaFim" },
                { data: "kmFinal" },
                { data: "combustivelFinal" },
                { data: "resumoOcorrencia" },
                { data: "descricaoOcorrencia" },
                { data: "statusDocumento" },
                { data: "statusCartaoAbastecimento" },
                { data: "descricao" }
            ],
            rowCallback: function (row)
            {
                try
                {
                    ftxBindLazyImgsInRow(row);
                } catch (e)
                {
                    console.error("Erro no rowCallback:", e);
                }
            },
            language: {
                emptyTable: "Nenhum registro encontrado",
                info: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 até 0 de 0 registros",
                infoFiltered: "(Filtrados de _MAX_ registros)",
                loadingRecords: "Carregando...",
                processing: "Processando...",
                zeroRecords: "Nenhum registro encontrado",
                search: "Pesquisar",
                paginate: {
                    next: "Próximo",
                    previous: "Anterior",
                    first: "Primeiro",
                    last: "Último"
                },
                lengthMenu: "Exibir _MENU_ resultados por página"
            },
            drawCallback: function (settings)
            {
                try
                {
                    // Reinicializa os tooltips Syncfusion após cada redesenho da tabela
                    var tooltipElements = document.querySelectorAll('[data-ejtip]');
                    tooltipElements.forEach(function (element)
                    {
                        if (!element.ej2_instances || element.ej2_instances.length === 0)
                        {
                            new ej.popups.Tooltip({
                                content: element.getAttribute('data-ejtip'),
                                position: 'TopCenter'
                            }).appendTo(element);
                        }
                    });
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "DataTable.drawCallback", error);
                }
            },
            // Callback quando DataTable termina de inicializar
            initComplete: function(settings, json) {
                try {
                    // Adiciona o aviso de filtro após a tabela ser criada
                    FtxViagens.adicionarAvisoFiltro();
                } catch (error) {
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "DataTable.initComplete", error);
                }
            }
        });

        // Controle para esconder o loading apenas uma vez
        let loadingHidden = false;
        function safeHideLoading()
        {
            if (loadingHidden) return;
            loadingHidden = true;
            
            requestAnimationFrame(() => {
                // Esconde o modal de loading do FrotiX
                FtxViagens.esconderLoading();
                
                // Fallback: esconde spinner global se ainda existir
                if (window.FTXSpinner) {
                    window.FTXSpinner.hide();
                }
                if (window.FtxSpin) {
                    window.FtxSpin.hide();
                }
                // Remove overlay do spinner global
                $('.ftx-spin-overlay').remove();
                
                // Marca que não é mais o primeiro carregamento
                FtxViagens.setPrimeiroCarregamento(false);
            });
        }

        // Esconde loading quando os dados forem carregados
        dataTableViagens.one('draw.dt', safeHideLoading);
        dataTableViagens.on('error.dt', safeHideLoading);
        
        // Bind para lazy loading de fotos
        dataTableViagens.on('draw.dt', function ()
        {
            try
            {
                $('#tblViagem tbody tr').each(function ()
                {
                    ftxBindLazyImgsInRow(this);
                });
            } catch (e)
            {
                console.error("Erro no draw.dt:", e);
            }
        });

        // Timeout de segurança (20 segundos)
        setTimeout(safeHideLoading, 20000);
        
    } catch (error)
    {
        TratamentoErroComLinha("ViagemIndex.js", "ListaTodasViagens", error);
        FtxViagens.esconderLoading();
    }
}

$("#btnFinalizarViagem").click(async function (e)
{
    try
    {
        e.preventDefault();
        console.log("🔵 [1/8] Botão Finalizar Viagem clicado");

        // VALIDAÇÃO 1: Data Final
        const DataFinal = $("#txtDataFinal").val();
        console.log("🔵 [2/8] Verificando Data Final:", DataFinal);
        if (DataFinal === "")
        {
            console.log("❌ Data Final vazia - parando execução");
            Alerta.Erro("Erro na Data", "A data final é obrigatória!");
            return;
        }

        // VALIDAÇÃO: Data Final não pode ser superior à data atual
        const dataFinalParsed = parseDataBR(DataFinal);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        if (dataFinalParsed > hoje)
        {
            console.log("❌ Data Final superior a hoje - parando execução");
            $("#txtDataFinal").val("");
            $("#txtDataFinal").focus();
            AppToast.show("Amarelo", "A Data Final não pode ser superior à data atual.", 4000);
            return;
        }

        // VALIDAÇÃO 2: Validação Assíncrona de Datas
        console.log("🔵 [3/8] Validando datas...");
        const datasOk = await validarDatasSimples();
        console.log("🔵 [3/8] Resultado validarDatasSimples:", datasOk);
        if (!datasOk)
        {
            console.log("❌ Validação de datas falhou - parando execução");
            return;
        }

        // VALIDAÇÃO 3: Hora Final
        const HoraFinal = $("#txtHoraFinal").val();
        console.log("🔵 [4/8] Verificando Hora Final:", HoraFinal);
        if (HoraFinal === "")
        {
            console.log("❌ Hora Final vazia - parando execução");
            Alerta.Erro("Erro na Hora", "A hora final é obrigatória!");
            return;
        }

        // VALIDAÇÃO 4: KM Final
        const KmFinal = $("#txtKmFinal").val();
        console.log("🔵 [5/8] Verificando KM Final:", KmFinal);
        if (KmFinal === "")
        {
            console.log("❌ KM Final vazio - parando execução");
            Alerta.Erro("Erro na Quilometragem", "A quilometragem final é obrigatória!");
            return;
        }

        // VALIDAÇÃO 5: Validação Assíncrona de KM
        console.log("🔵 [6/8] Validando quilometragem...");
        const kmOk = await validarKmInicialFinal();
        console.log("🔵 [6/8] Resultado validarKmInicialFinal:", kmOk);
        if (!kmOk)
        {
            console.log("❌ Validação de KM falhou - parando execução");
            return;
        }

        // VALIDAÇÃO 6: Nível de Combustível Final
        console.log("🔵 [7/8] Verificando nível de combustível...");
        var niveisElement = document.getElementById("ddtCombustivelFinal");
        console.log("🔵 [7/8] Elemento ddtCombustivelFinal:", niveisElement);

        if (!niveisElement)
        {
            console.log("❌ ERRO CRÍTICO: Elemento ddtCombustivelFinal não encontrado no DOM!");
            Alerta.Erro("Erro", "Componente de combustível não foi encontrado. Recarregue a página.");
            return;
        }

        var niveis = niveisElement.ej2_instances?.[0];
        console.log("🔵 [7/8] Instância Syncfusion niveis:", niveis);
        console.log("🔵 [7/8] Valor do nível:", niveis?.value);

        if (!niveis)
        {
            console.log("❌ ERRO CRÍTICO: Componente Syncfusion ddtCombustivelFinal não está inicializado!");
            Alerta.Erro("Erro", "Componente de combustível não está inicializado. Recarregue a página.");
            return;
        }

        if (niveis.value === null || niveis.value === undefined || niveis.value === "")
        {
            console.log("❌ Nível de combustível vazio - parando execução");
            Alerta.Erro("Atenção", "O nível final de combustível é obrigatório!");
            return;
        }

        var nivelcombustivel = niveis.value.toString();
        console.log("🔵 [7/7] Nível de combustível validado:", nivelcombustivel);

        // ✅ VALIDAÇÃO 8: Ocorrências Múltiplas
        console.log("🔵 [8/8] Validando ocorrências múltiplas...");
        if (typeof OcorrenciaViagem !== 'undefined' && OcorrenciaViagem.temOcorrencias && OcorrenciaViagem.temOcorrencias())
        {
            if (!OcorrenciaViagem.validarOcorrencias())
            {
                console.log("❌ Validação de ocorrências múltiplas falhou - parando execução");
                AppToast.show('Vermelho', 'Preencha o resumo de todas as ocorrências!', 3000);
                return;
            }
        }

        // ✅ TODAS AS VALIDAÇÕES PASSARAM - PREPARANDO DADOS
        console.log("✅ Todas as validações passaram! Preparando dados para gravação...");

        const statusDocumento = $("#chkStatusDocumento").prop("checked") ? "Entregue" : "Ausente";
        const statusCartaoAbastecimento = $("#chkStatusCartaoAbastecimento").prop("checked") ? "Entregue" : "Ausente";

        var descricaoElement = document.getElementById("rteDescricao");
        var descricao = descricaoElement?.ej2_instances?.[0];

        if (!descricao)
        {
            console.log("⚠️ Componente rteDescricao não inicializado, usando valor vazio");
        }

        // ✅ Coletar ocorrências múltiplas (se houver)
        var ocorrenciasParaEnviar = [];
        if (typeof OcorrenciaViagem !== 'undefined' && OcorrenciaViagem.temOcorrencias && OcorrenciaViagem.temOcorrencias())
        {
            ocorrenciasParaEnviar = OcorrenciaViagem.coletarOcorrenciasSimples();
            console.log("📋 Ocorrências coletadas:", ocorrenciasParaEnviar);
        }

        const objViagem = {
            ViagemId: $("#txtId").val(),
            DataFinal: $("#txtDataFinal").val(),
            HoraFim: $("#txtHoraFinal").val(),
            KmFinal: $("#txtKmFinal").val(),
            CombustivelFinal: nivelcombustivel,
            StatusDocumento: statusDocumento,
            StatusCartaoAbastecimento: statusCartaoAbastecimento,
            Descricao: descricao?.value || "",
            Ocorrencias: ocorrenciasParaEnviar  // ✅ NOVO: Lista de ocorrências
        };

        console.log("📤 Dados preparados para envio:", objViagem);
        console.log("📋 Total de ocorrências:", ocorrenciasParaEnviar.length);
        console.log("🚀 Iniciando requisição AJAX...");

        // Mostrar spinner antes da requisição
        mostrarSpinnerFinalizacao();

        // GRAVAÇÃO VIA AJAX
        $.ajax({
            type: "POST",
            url: "/api/Viagem/FinalizaViagem",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(objViagem),
            beforeSend: function ()
            {
                console.log("⏳ AJAX: Enviando requisição...");
            },
            success: function (data)
            {
                // Esconder spinner no sucesso
                esconderSpinnerFinalizacao();

                console.log("✅ AJAX: Resposta recebida com sucesso!", data);

                // VERIFICAR SE A OPERAÇÃO FOI BEM SUCEDIDA
                if (data.success === false)
                {
                    console.log("❌ Operação falhou:", data.message);
                    AppToast.show("Amarelo", data.message || "Erro ao finalizar viagem", 4000);
                    
                    // Se for erro de Data Final, limpar o campo e manter foco
                    if (data.message && data.message.includes("Data Final"))
                    {
                        $("#txtDataFinal").val("");
                        $("#txtDataFinal").focus();
                    }
                    return;
                }

                // ✅ Ocorrências agora são salvas junto com a viagem no backend
                if (data.ocorrenciasCriadas > 0) {
                    console.log("✅ Ocorrências criadas:", data.ocorrenciasCriadas);
                }

                // ✅ Limpar ocorrências do formulário
                if (typeof OcorrenciaViagem !== 'undefined' && OcorrenciaViagem.limparOcorrencias) {
                    OcorrenciaViagem.limparOcorrencias();
                }

                try
                {
                    AppToast.show("Verde", data.message, 3000);

                    console.log("🔄 Recarregando tabela de viagens...");
                    $("#tblViagem").DataTable().ajax.reload(null, false);

                    console.log("❌ Fechando modal...");
                    $("#modalFinalizaViagem").hide();
                    $("div").removeClass("modal-backdrop");
                    $("body").removeClass("modal-open");

                    console.log("✅ Viagem finalizada com sucesso!");
                }
                catch (error)
                {
                    console.error("❌ Erro no callback de sucesso:", error);
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "success.finalizarViagem", error);
                }
            },
            error: function (xhr, status, error)
            {
                try
                {
                    // Esconder spinner no erro
                    esconderSpinnerFinalizacao();

                    console.error("❌ AJAX: Erro na requisição", {
                        status: status,
                        error: error,
                        responseText: xhr.responseText,
                        statusCode: xhr.status
                    });

                    let mensagem = "Erro ao finalizar viagem";

                    if (xhr.responseJSON?.message)
                    {
                        mensagem = xhr.responseJSON.message;
                    }
                    else if (xhr.responseText)
                    {
                        try
                        {
                            const response = JSON.parse(xhr.responseText);
                            mensagem = response.message || mensagem;
                        }
                        catch (e)
                        {
                            console.error("❌ Erro ao parsear responseText:", e);
                        }
                    }

                    AppToast.show("Vermelho", mensagem, 4000);
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "ajax.error.finalizarViagem", error);
                } catch (err)
                {
                    // Esconder spinner em caso de exceção
                    esconderSpinnerFinalizacao();

                    console.error("❌ Erro no handler de erro do AJAX:", err);
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "error.finalizarViagem", err);
                }
            },
            complete: function ()
            {
                console.log("🏁 AJAX: Requisição finalizada (sucesso ou erro)");
            }
        });
    } catch (error)
    {
        console.error("❌ ERRO CRÍTICO na função de finalizar viagem:", error);
        console.error("❌ Stack trace:", error.stack);
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "click.btnFinalizarViagem", error);
    }
});

function calcularDuracaoViagem()
{
    try
    {
        var elDuracao = document.getElementById("txtDuracao");
        var elDataIni = document.getElementById("txtDataInicial");
        var elHoraIni = document.getElementById("txtHoraInicial");
        var elDataFim = document.getElementById("txtDataFinal");
        var elHoraFim = document.getElementById("txtHoraFinal");
        if (!elDuracao) return;

        var DUR_LIMIAR_MIN = 720;

        var dIni = (elDataIni?.value || "").trim();
        var hIni = (elHoraIni?.value || "").trim();
        var dFim = (elDataFim?.value || "").trim();
        var hFim = (elHoraFim?.value || "").trim();

        if (!dIni || !hIni || !dFim || !hFim)
        {
            elDuracao.value = "";
            FieldUX.setInvalid(elDuracao, false);
            FieldUX.tooltipOnTransition(elDuracao, false, 1, 'tooltipDuracao');
            return;
        }

        if (typeof moment !== "function") throw new Error("moment.js não carregado");

        var F = ["DD/MM/YYYYTHH:mm", "YYYY-MM-DDTHH:mm"];
        var inicio = moment(dIni + "T" + hIni, F, true);
        var fim = moment(dFim + "T" + hFim, F, true);
        if (!inicio.isValid() || !fim.isValid())
        {
            elDuracao.value = "";
            FieldUX.setInvalid(elDuracao, false);
            FieldUX.tooltipOnTransition(elDuracao, false, 1, 'tooltipDuracao');
            return;
        }

        var minutos = fim.diff(inicio, "minutes");
        if (!Number.isFinite(minutos) || minutos < 0)
        {
            elDuracao.value = "";
            FieldUX.setInvalid(elDuracao, true);
            FieldUX.tooltipOnTransition(elDuracao, true, 1200, 'tooltipDuracao');
            return;
        }

        var dias = Math.floor(minutos / 1440);
        var horas = Math.floor((minutos % 1440) / 60);
        elDuracao.value = `${dias} dia${dias !== 1 ? "s" : ""} e ${horas} hora${horas !== 1 ? "s" : ""}`;

        var invalida = minutos > DUR_LIMIAR_MIN;
        FieldUX.setInvalid(elDuracao, invalida);
        FieldUX.tooltipOnTransition(elDuracao, invalida && !window.CarregandoViagemBloqueada, 1200, 'tooltipDuracao');
    } catch (error)
    {
        if (typeof TratamentoErroComLinha === 'function')
        {
            TratamentoErroComLinha("ViagemIndex.js", "calcularDuracaoViagem", error);
        } else { console.error(error); }
    }
}

// ===============================================
// CONFIGURAÇÃO DO TELERIK REPORT VIEWER - CORRIGIDO
// ===============================================

// Função para determinar qual relatório usar
function determinarRelatorio(data)
{
    try
    {
        if (!data) return "FichaAberta.trdp";

        let relatorio = "FichaAberta.trdp";

        if (data.status === "Cancelada")
        {
            $("#btnCancela").hide();
            window.CarregandoViagemBloqueada = true;
            relatorio = data.finalidade !== "Evento" ? "FichaCancelada.trdp" : "FichaEventoCancelado.trdp";
        } else if (data.finalidade === "Evento" && data.status !== "Cancelada")
        {
            relatorio = "FichaEvento.trdp";
        } else if (data.status === "Aberta" && data.finalidade !== "Evento")
        {
            relatorio = "FichaAberta.trdp";
        } else if (data.status === "Realizada")
        {
            window.CarregandoViagemBloqueada = true;
            relatorio = data.finalidade !== "Evento" ? "FichaRealizada.trdp" : "FichaEventoRealizado.trdp";
        } else if (data.statusAgendamento === true)
        {
            relatorio = data.finalidade !== "Evento" ? "FichaAgendamento.trdp" : "FichaEventoAgendado.trdp";
        }

        console.log('Relatório selecionado:', relatorio);
        return relatorio;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "determinarRelatorio", error);
        return "FichaAberta.trdp";
    }
}

// Função para inicializar o Report Viewer
function initViewer(viagemId)
{
    try
    {
        if (!viagemId)
        {
            console.error('ViagemId não fornecido para o Report Viewer');
            $("#reportViewer1").html('<div class="alert alert-warning">ID da viagem não informado.</div>');
            return;
        }

        console.log('Inicializando Report Viewer para viagem:', viagemId);

        // VERIFICAÇÕES CRÍTICAS
        if (typeof $ === 'undefined')
        {
            console.error('jQuery não carregado!');
            $("#reportViewer1").html('<div class="alert alert-danger">jQuery não carregado.</div>');
            return;
        }

        if (typeof kendo === 'undefined')
        {
            console.error('Kendo UI não carregado!');
            $("#reportViewer1").html('<div class="alert alert-danger">Kendo UI não carregado.</div>');
            return;
        }

        if (typeof telerikReportViewer === 'undefined')
        {
            console.error('telerikReportViewer não está definido.');
            $("#reportViewer1").html('<div class="alert alert-danger">Telerik Report Viewer não carregado.</div>');
            return;
        }

        const $viewer = $("#reportViewer1");

        // Limpa instância anterior
        const existingInstance = $viewer.data("telerik_ReportViewer");
        if (existingInstance)
        {
            try
            {
                if (typeof existingInstance.dispose === 'function')
                {
                    existingInstance.dispose();
                } else if (typeof existingInstance.destroy === 'function')
                {
                    existingInstance.destroy();
                }
            } catch (e)
            {
                console.error('Erro ao destruir Report Viewer anterior:', e);
            }
            $viewer.removeData("telerik_ReportViewer");
            $viewer.empty();
        }

        // Ajusta container
        $("#ReportContainer").css({
            height: "700px",
            display: "block"
        }).addClass("visible");

        // Busca dados da viagem
        $.ajax({
            type: "GET",
            url: "/api/Agenda/RecuperaViagem",
            data: { id: viagemId },
            contentType: "application/json",
            dataType: "json"
        })
            .done(function (response)
            {
                try
                {
                    const data = response && response.data ? response.data : {};
                    const relatorioNome = determinarRelatorio(data);

                    console.log('Configurando Report Viewer com:', {
                        relatorio: relatorioNome,
                        viagemId: viagemId
                    });

                    // AGUARDA O KENDO ESTAR TOTALMENTE PRONTO
                    kendo.ui.progress($viewer, true);

                    try
                    {
                        // Inicializa o Report Viewer - VERSÃO SIMPLIFICADA
                        $viewer.telerik_ReportViewer({
                            serviceUrl: "/api/reports/",
                            reportSource: {
                                report: relatorioNome,
                                parameters: {
                                    ViagemId: viagemId.toString().toUpperCase()
                                }
                            },
                            viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
                            scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
                            scale: 1.0,
                            enableAccessibility: false,
                            sendEmail: {
                                enabled: false
                            }
                        });

                        //    // Inicializa o Report Viewer
                        //    $viewer.telerik_ReportViewer({
                        //        serviceUrl: window.location.origin + "/api/reports/",
                        //        reportSource: {
                        //            report: relatorioNome,
                        //            parameters: {
                        //                ViagemId: String(viagemId).toUpperCase()
                        //            }
                        //        },
                        //        viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
                        //        scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
                        //        scale: 1.0,
                        //        enableAccessibility: false,
                        //        sendEmail: { enabled: false },
                        //        print: { enablePrintPreview: true },
                        //        width: "100%",
                        //        height: "640px",
                        //        pageMode: telerikReportViewer.PageModes.SINGLE_PAGE,
                        //        error: function (e, args)
                        //        {
                        //            console.error('Erro no Report Viewer:', args);
                        //            kendo.ui.progress($viewer, false);
                        //            const errorMsg = args.message || 'Erro desconhecido ao carregar relatório';
                        //            AppToast.show('Vermelho', 'Erro: ' + errorMsg, 4000);
                        //            $("#reportViewer1").html('<div class="alert alert-danger">' + errorMsg + '</div>');
                        //        },
                        //        ready: function ()
                        //        {
                        //            console.log('Report Viewer carregado com sucesso');
                        //            kendo.ui.progress($viewer, false);
                        //            $("#btnConfirma").prop("disabled", false);
                        //        }
                        //    });
                    }
                    catch (error)
                    {
                        console.error('Erro ao inicializar viewer:', error);
                        kendo.ui.progress($viewer, false);
                        $("#reportViewer1").html('<div class="alert alert-danger">Erro: ' + error.message + '</div>');
                    }
                } catch (error)
                {
                    console.error('Erro ao configurar Report Viewer:', error);
                    $("#reportViewer1").html('<div class="alert alert-danger">Erro ao configurar o relatório.</div>');
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "initViewer.done", error);
                }
            })
            .fail(function (xhr)
            {
                console.error("Erro ao carregar dados da viagem:", xhr);
                const errorMsg = xhr.responseJSON?.message || 'Não foi possível carregar os dados da viagem';
                $("#reportViewer1").html('<div class="alert alert-danger">' + errorMsg + '</div>');
            });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "initViewer", error);
    }
}

// Configuração do modal de impressão
$(function ()
{
    try
    {
        const $modal = $("#modalPrint");

        $modal.on("show.bs.modal", function (event)
        {
            const modalEl = this;
            const $button = $(event.relatedTarget || []);   // pode vir vazio
            const fromBtn = $button.data("viagem-id") || $button.data("id");
            const fromAttr = modalEl.getAttribute('data-viagem-id');
            const fromHidden = $("#txtViagemId").val();

            const viagemId = fromBtn || fromAttr || fromHidden;

            console.log('Modal abrindo com ViagemId:', viagemId);

            if (!viagemId)
            {
                console.error('ViagemId não encontrado no botão/modal/hidden');
                return;
            }

            $("#txtViagemId").val(viagemId);
        });

        $modal.on("shown.bs.modal", function ()
        {
            // Fix para conflito entre Bootstrap e Kendo
            $(document).off("focusin.modal");

            const viagemId = $("#txtViagemId").val();

            if (!viagemId)
            {
                $("#reportViewer1").html('<div class="alert alert-warning">ID da viagem não informado.</div>');
                return;
            }

            setTimeout(function ()
            {
                if (typeof kendo !== 'undefined' && typeof telerikReportViewer !== 'undefined')
                {
                    initViewer(viagemId);
                } else
                {
                    console.error('Dependências não carregadas. Aguardando...');
                    setTimeout(function ()
                    {
                        initViewer(viagemId);
                    }, 1000);
                }
            }, 300);
        });

        $modal.on("hidden.bs.modal", function ()
        {
            console.log('Limpando Report Viewer...');

            // limpa fallback para não “vazar” id entre aberturas
            this.removeAttribute('data-viagem-id');

            const $viewer = $("#reportViewer1");
            const instance = $viewer.data("telerik_ReportViewer");

            if (instance)
            {
                try
                {
                    if (typeof instance.dispose === 'function')
                    {
                        instance.dispose();
                    } else if (typeof instance.destroy === 'function')
                    {
                        instance.destroy();
                    }
                } catch (e)
                {
                    console.error('Erro ao limpar Report Viewer:', e);
                }
            }

            $viewer.replaceWith('<div id="reportViewer1" style="width:100%" class="pb-3">Loading...</div>');
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "modalPrint.config", error);
    }
});

// Helper Único para UI dos campos (KM e Duração)
(function ()
{
    function ensureTooltip(el, globalName)
    {
        try
        {
            if (globalName && window[globalName] && typeof window[globalName].open === 'function') return window[globalName];
            if (el && el.ej2_instances && el.ej2_instances.length)
            {
                for (var i = 0; i < el.ej2_instances.length; i++)
                {
                    var inst = el.ej2_instances[i];
                    if (inst && typeof inst.open === 'function' && typeof inst.close === 'function')
                    {
                        if (globalName) window[globalName] = inst;
                        return inst;
                    }
                }
            }
            if (window.ej && ej.popups && typeof ej.popups.Tooltip === 'function')
            {
                var inst = new ej.popups.Tooltip({
                    content: el.getAttribute('data-ejtip') || 'Valor acima do limite.',
                    opensOn: 'Custom',
                    position: 'TopCenter'
                });
                inst.appendTo(el);
                if (globalName) window[globalName] = inst;
                return inst;
            }
            return null;
        } catch (error)
        {
            console.error("Erro em ensureTooltip:", error);
            return null;
        }
    }

    function toggleClass(el, cls, on)
    {
        try
        {
            if (!el) return;
            if (el.classList)
            {
                el.classList.toggle(cls, !!on);
            } else
            {
                var c = el.className || '', has = new RegExp('\\b' + cls + '\\b').test(c);
                if (on && !has) el.className = (c + ' ' + cls).trim();
                if (!on && has) el.className = c.replace(new RegExp('\\b' + cls + '\\b'), '').replace(/\s{2,}/g, ' ').trim();
            }
        } catch (error)
        {
            console.error("Erro em toggleClass:", error);
        }
    }

    function setInvalid(el, invalid)
    {
        try
        {
            if (!el) return;
            toggleClass(el, 'is-invalid', invalid);
            try { el.setAttribute('aria-invalid', String(!!invalid)); } catch (e) { }
            try { el.style.color = invalid ? 'var(--ftx-invalid,#dc3545)' : 'black'; } catch (e) { }
            try
            {
                var wrap = el.closest('.e-input-group, .e-float-input, .e-control-wrapper');
                if (wrap) toggleClass(wrap, 'is-invalid', invalid);
            } catch (e) { }
            setHigh(el, false);
        } catch (error)
        {
            console.error("Erro em setInvalid:", error);
        }
    }

    function setHigh(el, high)
    {
        try
        {
            if (!el) return;
            toggleClass(el, 'is-high', high);
            try
            {
                var wrap = el.closest('.e-input-group, .e-float-input, .e-control-wrapper');
                if (wrap) toggleClass(wrap, 'is-high', high);
            } catch (e) { }
        } catch (error)
        {
            console.error("Erro em setHigh:", error);
        }
    }

    function tooltipOnTransition(el, condition, ms, globalName)
    {
        try
        {
            if (!el) return;
            var key = '_prevCond_' + (globalName || 'tt');
            var prev = !!el[key], now = !!condition;
            if (now && !prev)
            {
                var tip = ensureTooltip(el, globalName);
                if (tip && typeof tip.open === 'function')
                {
                    tip.open(el);
                    clearTimeout(el._tipTimer);
                    el._tipTimer = setTimeout(function ()
                    {
                        try { tip.close(); } catch (e) { }
                    }, ms || 1000);
                }
            }
            el[key] = now;
        } catch (error)
        {
            console.error("Erro em tooltipOnTransition:", error);
        }
    }

    window.FieldUX = { ensureTooltip, setInvalid, setHigh, tooltipOnTransition };
})();

// Event listeners para cálculos automáticos
["input", "change", "focusout"].forEach(evt =>
{
    document.getElementById("txtHoraFinal")?.addEventListener(evt, calcularDuracaoViagem);
    document.getElementById("txtDataFinal")?.addEventListener(evt, calcularDuracaoViagem);
    document.getElementById("txtKmInicial")?.addEventListener(evt, calcularDistanciaViagem);
    document.getElementById("txtKmFinal")?.addEventListener(evt, calcularDistanciaViagem);
});

// Variável global para armazenar o ID atual
window.viagemIdAtual = null;

// Função global para abrir o modal de ficha
window.abrirModalFicha = function (viagemId)
{
    try
    {
        console.log('Abrindo modal para viagem:', viagemId);

        if (!viagemId || viagemId === 'undefined')
        {
            AppToast.show('Vermelho', 'ID da viagem não identificado', 3000);
            return;
        }

        window.viagemIdAtual = viagemId;
        $('#hiddenViagemId').val(viagemId);
        
        const modalEl = document.getElementById('modalFicha');
        if (!modalEl)
        {
            console.error('Modal #modalFicha não encontrado!');
            return;
        }
        
        modalEl.setAttribute('data-viagem-id', viagemId);

        console.log('ID armazenado (global):', window.viagemIdAtual);
        console.log('ID armazenado (hidden):', $('#hiddenViagemId').val());

        resetModalFicha();
        
        // Bootstrap 5: usar bootstrap.Modal
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();

        setTimeout(() =>
        {
            carregarFichaVistoria(viagemId);
        }, 300);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "abrirModalFicha", error);
    }
};

// Event listener para capturar viagem-id do modal de print
document.addEventListener('show.bs.modal', function (ev)
{
    try
    {
        if (ev.target && ev.target.id === 'modalPrint')
        {
            const trigger = ev.relatedTarget;
            const id = trigger ? trigger.getAttribute('data-viagem-id') : null;
            const hid = document.getElementById('txtViagemId');
            if (hid && id) hid.value = id;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "modalPrint.show", error);
    }
});

// Preview simples de imagem
document.getElementById('txtFile')?.addEventListener('change', e =>
{
    try
    {
        const file = e.target.files?.[0];
        const img = document.getElementById('imgViewer');
        if (!file || !img) return;
        const r = new FileReader();
        r.onload = ev =>
        {
            img.src = ev.target.result;
            img.classList.remove('d-none');
        };
        r.readAsDataURL(file);
    } catch (error)
    {
        console.error("Erro no preview da imagem:", error);
    }
});

function mostrarSpinnerFinalizacao()
{
    try
    {
        $('#modalSpinnerFinalizacao').modal('show');
        $('#btnFinalizarViagem').prop('disabled', true).addClass('disabled');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "mostrarSpinnerFinalizacao", error);
    }
}

function esconderSpinnerFinalizacao()
{
    try
    {
        $('#modalSpinnerFinalizacao').modal('hide');
        $('#btnFinalizarViagem').prop('disabled', false).removeClass('disabled');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "esconderSpinnerFinalizacao", error);
    }
}

/* =========================================================================================
   MODAL OCORRÊNCIAS DA VIAGEM - Handlers e funções
   ========================================================================================= */

// Clique no botão de ocorrências dentro da tabela
$(document).on('click', '#tblViagem .btn-ocorrencias-viagem', function (e)
{
    try
    {
        e.preventDefault();
        
        if ($(this).hasClass('disabled')) return;
        
        const viagemId = $(this).data('id');
        const noFicha = $(this).data('noficha');
        const modalEl = document.getElementById('modalOcorrenciasViagem');
        if (!modalEl) return;

        // Guarda o ID e número da ficha no modal
        modalEl.setAttribute('data-viagem-id', String(viagemId));
        modalEl.setAttribute('data-noficha', String(noFicha || ''));
        $('#hiddenOcorrenciasViagemId').val(viagemId);

        // Atualiza o título do modal
        const tituloSpan = modalEl.querySelector('#modalOcorrenciasViagemLabel span');
        if (tituloSpan)
        {
            tituloSpan.textContent = noFicha ? `Ocorrências da Viagem nº ${noFicha}` : 'Ocorrências da Viagem';
        }

        // Abre o modal
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "click.btn-ocorrencias-viagem", error);
    }
});

// Quando o modal de ocorrências é aberto
$('#modalOcorrenciasViagem').on('shown.bs.modal', function (e)
{
    try
    {
        const modalEl = this;
        let viagemId = modalEl.getAttribute('data-viagem-id');

        // Fallback: tenta pegar do hidden
        if (!viagemId || viagemId === 'undefined')
        {
            viagemId = $('#hiddenOcorrenciasViagemId').val();
        }

        if (!viagemId || viagemId === 'undefined')
        {
            console.error('ViagemId não encontrado');
            return;
        }

        // Reseta a tabela
        $('#tblOcorrenciasViagem tbody').html('<tr><td colspan="5" class="text-center"><i class="fa fa-spinner fa-spin"></i> Carregando...</td></tr>');

        // Busca as ocorrências da viagem
        carregarOcorrenciasViagem(viagemId);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "modalOcorrenciasViagem.shown", error);
    }
});

// Carrega as ocorrências da viagem via API
function carregarOcorrenciasViagem(viagemId)
{
    try
    {
        $.ajax({
            url: '/api/OcorrenciaViagem/ListarOcorrenciasModal',
            type: 'GET',
            data: { viagemId: viagemId },
            success: function (response)
            {
                try
                {
                    if (response.success && response.data)
                    {
                        renderizarTabelaOcorrencias(response.data);
                    } else
                    {
                        $('#tblOcorrenciasViagem tbody').html('<tr><td colspan="5" class="text-center text-muted">Nenhuma ocorrência registrada</td></tr>');
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "carregarOcorrenciasViagem.success", error);
                }
            },
            error: function (xhr, status, error)
            {
                console.error('Erro ao carregar ocorrências:', error);
                $('#tblOcorrenciasViagem tbody').html('<tr><td colspan="5" class="text-center text-danger">Erro ao carregar ocorrências</td></tr>');
                AppToast.show('Vermelho', 'Erro ao carregar ocorrências da viagem', 4000);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "carregarOcorrenciasViagem", error);
    }
}

// Renderiza a tabela de ocorrências
function renderizarTabelaOcorrencias(ocorrencias)
{
    try
    {
        if (!ocorrencias || ocorrencias.length === 0)
        {
            $('#tblOcorrenciasViagem tbody').html('<tr><td colspan="6" class="text-center text-muted">Nenhuma ocorrência registrada</td></tr>');
            return;
        }

        let html = '';
        ocorrencias.forEach(function (oc, index)
        {
            // Normaliza campos para ambos os formatos (camelCase e PascalCase)
            const dataCriacao = oc.dataCriacao || oc.DataCriacao;
            const dataFormatada = dataCriacao ? new Date(dataCriacao).toLocaleDateString('pt-BR') : '-';
            const imagem = oc.imagemOcorrencia || oc.ImagemOcorrencia || '';
            const temImagem = imagem && imagem.trim() !== '';
            const statusOc = oc.statusOcorrencia !== undefined ? oc.statusOcorrencia : oc.StatusOcorrencia;
            const statusStr = oc.status || oc.Status || '';
            const resumo = oc.resumo || oc.Resumo || '';
            const descricao = oc.descricao || oc.Descricao || '';
            const ocorrenciaId = oc.ocorrenciaViagemId || oc.OcorrenciaViagemId;
            const itemManutId = oc.itemManutencaoId || oc.ItemManutencaoId;
            
            // Determina status final para exibição
            let statusFinal = 'Aberta';
            let badgeClass = 'ftx-ocorrencia-badge-aberta';
            
            if (statusStr === 'Pendente')
            {
                statusFinal = 'Pendente';
                badgeClass = 'ftx-ocorrencia-badge-pendente';
            }
            else if (statusStr === 'Baixada' || statusOc === false)
            {
                statusFinal = 'Baixada';
                badgeClass = 'ftx-ocorrencia-badge-baixada';
            }
            else if (itemManutId && itemManutId !== '00000000-0000-0000-0000-000000000000')
            {
                statusFinal = 'Manutenção';
                badgeClass = 'ftx-ocorrencia-badge-manutencao';
            }
            
            const jaBaixada = statusFinal === 'Baixada';
            
            html += `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${resumo || '-'}</td>
                    <td>${descricao || '-'}</td>
                    <td class="text-center">${dataFormatada}</td>
                    <td class="text-center">
                        <span class="ftx-ocorrencia-badge ${badgeClass}">${statusFinal}</span>
                    </td>
                    <td class="text-center">
                        <button type="button" class="btn btn-foto text-white btn-icon-28 btn-ver-imagem-ocorrencia ${temImagem ? '' : 'disabled'}"
                                data-imagem="${imagem}"
                                ${temImagem ? '' : 'disabled tabindex="-1" aria-disabled="true"'}
                                title="${temImagem ? 'Ver Imagem' : 'Sem imagem'}">
                            <i class="fab fa-wpforms"></i>
                        </button>
                        <button type="button" class="btn btn-verde text-white btn-icon-28 btn-baixar-ocorrencia ${jaBaixada ? 'disabled' : ''}"
                                data-id="${ocorrenciaId}"
                                data-resumo="${resumo.replace(/"/g, '&quot;')}"
                                ${jaBaixada ? 'disabled tabindex="-1" aria-disabled="true"' : ''}
                                title="${jaBaixada ? 'Já baixada' : 'Dar Baixa'}">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button type="button" class="btn btn-vinho text-white btn-icon-28 btn-excluir-ocorrencia"
                                data-id="${ocorrenciaId}"
                                title="Excluir Ocorrência">
                            <i class="fa-duotone fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        $('#tblOcorrenciasViagem tbody').html(html);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "renderizarTabelaOcorrencias", error);
    }
}

// Clique no botão de ver imagem
$(document).on('click', '.btn-ver-imagem-ocorrencia:not(.disabled)', function (e)
{
    try
    {
        e.preventDefault();
        const imagemPath = $(this).data('imagem');
        
        if (!imagemPath)
        {
            AppToast.show('Amarelo', 'Esta ocorrência não possui imagem', 3000);
            return;
        }

        // Define a imagem no modal
        $('#imgOcorrenciaViewer').attr('src', imagemPath).show();
        $('#noImageOcorrencia').hide();

        // Abre o modal de imagem
        const modalImagem = new bootstrap.Modal(document.getElementById('modalImagemOcorrencia'));
        modalImagem.show();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "click.btn-ver-imagem-ocorrencia", error);
    }
});

// Clique no botão de excluir ocorrência
$(document).on('click', '.btn-excluir-ocorrencia', function (e)
{
    try
    {
        e.preventDefault();
        const ocorrenciaId = $(this).data('id');
        const $btn = $(this);
        const $row = $btn.closest('tr');

        Alerta.Confirmar(
            "Deseja realmente excluir esta ocorrência?",
            "Esta ação não poderá ser desfeita!",
            "Sim, excluir",
            "Cancelar"
        ).then((confirmado) =>
        {
            if (confirmado)
            {
                excluirOcorrenciaViagem(ocorrenciaId, $row);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "click.btn-excluir-ocorrencia", error);
    }
});

// Exclui a ocorrência via API
function excluirOcorrenciaViagem(ocorrenciaId, $row)
{
    try
    {
        $.ajax({
            url: '/api/OcorrenciaViagem/ExcluirOcorrencia',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ ocorrenciaViagemId: ocorrenciaId }),
            success: function (response)
            {
                try
                {
                    if (response.success)
                    {
                        AppToast.show('Verde', 'Ocorrência excluída com sucesso', 3000);
                        $row.fadeOut(300, function() { 
                            $(this).remove();
                            // Verifica se ainda há linhas
                            if ($('#tblOcorrenciasViagem tbody tr').length === 0)
                            {
                                $('#tblOcorrenciasViagem tbody').html('<tr><td colspan="5" class="text-center text-muted">Nenhuma ocorrência registrada</td></tr>');
                            }
                        });
                    } else
                    {
                        AppToast.show('Vermelho', response.message || 'Erro ao excluir ocorrência', 4000);
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "excluirOcorrenciaViagem.success", error);
                }
            },
            error: function (xhr, status, error)
            {
                console.error('Erro ao excluir ocorrência:', error);
                AppToast.show('Vermelho', 'Erro ao excluir ocorrência', 4000);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "excluirOcorrenciaViagem", error);
    }
}

// Quando o modal é fechado, limpa o data attribute
$('#modalOcorrenciasViagem').on('hidden.bs.modal', function ()
{
    try
    {
        this.removeAttribute('data-viagem-id');
        this.removeAttribute('data-noficha');
        $('#hiddenOcorrenciasViagemId').val('');
        $('#tblOcorrenciasViagem tbody').html('');
        
        // Reseta o título
        const tituloSpan = this.querySelector('#modalOcorrenciasViagemLabel span');
        if (tituloSpan)
        {
            tituloSpan.textContent = 'Ocorrências da Viagem';
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "modalOcorrenciasViagem.hidden", error);
    }
});

// ============================================================================
// BAIXA DE OCORRÊNCIA
// ============================================================================

// Clique no botão de baixar ocorrência
$(document).on('click', '.btn-baixar-ocorrencia:not(.disabled)', function (e)
{
    try
    {
        e.preventDefault();
        const ocorrenciaId = $(this).data('id');
        const resumo = $(this).data('resumo') || 'esta ocorrência';
        const $btn = $(this);
        const $row = $btn.closest('tr');

        // Primeira confirmação: deseja dar baixa?
        Alerta.Confirmar(
            `Deseja dar baixa em: "${resumo}"?`,
            "A ocorrência será marcada como resolvida",
            "Sim, dar baixa",
            "Cancelar"
        ).then((confirmado) =>
        {
            if (confirmado)
            {
                // Segunda pergunta: deseja informar a solução?
                Alerta.Confirmar(
                    "Deseja informar a solução aplicada?",
                    "Você pode registrar como a ocorrência foi resolvida",
                    "Sim, informar",
                    "Não, apenas baixar"
                ).then((querInformar) =>
                {
                    if (querInformar)
                    {
                        // Abre modal para digitar a solução
                        $('#hiddenBaixaOcorrenciaId').val(ocorrenciaId);
                        $('#txtSolucaoBaixa').val('');
                        const modalSolucao = new bootstrap.Modal(document.getElementById('modalSolucaoOcorrencia'));
                        modalSolucao.show();
                    }
                    else
                    {
                        // Baixa sem solução
                        executarBaixaOcorrencia(ocorrenciaId, '', $row, $btn);
                    }
                });
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "click.btn-baixar-ocorrencia", error);
    }
});

// Confirmar baixa com solução (do modal)
$(document).on('click', '#btnConfirmarBaixaSolucao', function (e)
{
    try
    {
        e.preventDefault();
        const ocorrenciaId = $('#hiddenBaixaOcorrenciaId').val();
        const solucao = $('#txtSolucaoBaixa').val().trim();
        
        // Fecha o modal de solução
        const modalSolucao = bootstrap.Modal.getInstance(document.getElementById('modalSolucaoOcorrencia'));
        if (modalSolucao) modalSolucao.hide();
        
        // Encontra a linha e botão correspondentes pelo data-id
        const $btn = $(`.btn-baixar-ocorrencia[data-id="${ocorrenciaId}"]`);
        const $row = $btn.closest('tr');
        
        // Executa a baixa
        if ($btn.length > 0)
        {
            executarBaixaOcorrencia(ocorrenciaId, solucao, $row, $btn);
        }
        else
        {
            // Se não encontrou o botão, executa sem atualizar UI
            executarBaixaOcorrenciaSemUI(ocorrenciaId, solucao);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "click.btnConfirmarBaixaSolucao", error);
    }
});

// Função de baixa sem atualização de UI (fallback)
function executarBaixaOcorrenciaSemUI(ocorrenciaId, solucao)
{
    try
    {
        $.ajax({
            url: '/api/OcorrenciaViagem/BaixarOcorrenciaUpsert',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
                ocorrenciaViagemId: ocorrenciaId,
                solucaoOcorrencia: solucao || ''
            }),
            success: function (response)
            {
                try
                {
                    // Verifica success em ambos os formatos
                    const isSuccess = response.success === true || response.Success === true;
                    const mensagem = response.message || response.Message;
                    
                    if (isSuccess)
                    {
                        AppToast.show('Verde', 'Ocorrência baixada com sucesso!', 3000);
                        
                        // Recarrega a tabela de ocorrências se estiver aberta
                        const viagemId = $('#hiddenOcorrenciasViagemId').val();
                        if (viagemId)
                        {
                            carregarOcorrenciasViagem(viagemId);
                        }
                    }
                    else
                    {
                        AppToast.show('Vermelho', mensagem || 'Erro ao baixar ocorrência', 4000);
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "executarBaixaOcorrenciaSemUI.success", error);
                }
            },
            error: function (xhr, status, error)
            {
                console.error('Erro ao baixar ocorrência:', xhr.responseText || error);
                AppToast.show('Vermelho', 'Erro ao baixar ocorrência', 4000);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "executarBaixaOcorrenciaSemUI", error);
    }
}

// Função que executa a baixa via AJAX
function executarBaixaOcorrencia(ocorrenciaId, solucao, $row, $btn)
{
    try
    {
        console.log('executarBaixaOcorrencia chamada:', { ocorrenciaId, solucao, temRow: !!$row, temBtn: !!$btn });
        
        $.ajax({
            url: '/api/OcorrenciaViagem/BaixarOcorrenciaUpsert',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
                ocorrenciaViagemId: ocorrenciaId,
                solucaoOcorrencia: solucao || ''
            }),
            success: function (response)
            {
                try
                {
                    console.log('Resposta da API:', response);
                    
                    // Verifica success em ambos os formatos (camelCase e PascalCase)
                    const isSuccess = response.success === true || response.Success === true;
                    const mensagem = response.message || response.Message || 'Ocorrência baixada com sucesso!';
                    
                    if (isSuccess)
                    {
                        AppToast.show('Verde', mensagem, 3000);
                        
                        // Desabilita o botão de baixa (se existir)
                        if ($btn && $btn.length > 0)
                        {
                            $btn.addClass('disabled')
                                .attr('disabled', true)
                                .attr('title', 'Já baixada')
                                .prop('disabled', true);
                            
                            // Efeito visual na linha
                            if ($row && $row.length > 0)
                            {
                                $row.addClass('table-success');
                                setTimeout(() => $row.removeClass('table-success'), 2000);
                            }
                        }
                        else
                        {
                            // Se não encontrou o botão, recarrega a tabela
                            const viagemId = $('#hiddenOcorrenciasViagemId').val();
                            if (viagemId)
                            {
                                carregarOcorrenciasViagem(viagemId);
                            }
                        }
                    }
                    else
                    {
                        AppToast.show('Vermelho', mensagem || 'Erro ao baixar ocorrência', 4000);
                    }
                } catch (error)
                {
                    console.error('Erro no success:', error);
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "executarBaixaOcorrencia.success", error);
                }
            },
            error: function (xhr, status, error)
            {
                console.error('Erro AJAX:', { xhr, status, error, responseText: xhr.responseText });
                AppToast.show('Vermelho', 'Erro ao baixar ocorrência: ' + (xhr.responseText || error), 4000);
            }
        });
    } catch (error)
    {
        console.error('Erro geral:', error);
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "executarBaixaOcorrencia", error);
    }
}

// Limpa modal de solução ao fechar
$('#modalSolucaoOcorrencia').on('hidden.bs.modal', function ()
{
    try
    {
        $('#hiddenBaixaOcorrenciaId').val('');
        $('#txtSolucaoBaixa').val('');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ViagemIndex.js", "modalSolucaoOcorrencia.hidden", error);
    }
});

