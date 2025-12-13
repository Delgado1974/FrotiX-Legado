/* =========================================================================
 *  ocorrencias.js
 *  Tela: Gestão de Ocorrências
 *  Padrão FrotiX - Refatorado
 * ========================================================================= */

/* ==========================
   Variáveis Globais
   ========================== */
var dataTable = null;
var imagemOcorrenciaAlterada = false;
var novaImagemOcorrencia = "";

/* ==========================
   Helpers de Nome
   ========================== */
const CONECTORES = new Set([
    "de", "da", "do", "dos", "das", "e", "d", "d'", "del", "della", "di", "du", "van", "von",
]);

function abreviarNomeMotorista(nome)
{
    try
    {
        if (!nome) return "";
        const palavras = String(nome).trim().split(/\s+/);
        const out = [];

        for (const w of palavras)
        {
            const limp = w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.:()]/g, "");
            if (CONECTORES.has(limp)) continue;
            out.push(w);
            if (out.length === 2) break;
        }

        return out.join(" ");
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "abreviarNomeMotorista", error);
        return nome || "";
    }
}

/* ==========================
   Helpers de Data
   ========================== */
function _keyIsoFromBR(value)
{
    try
    {
        if (!value) return "";
        const [dd, mm, yyyy] = value.split("/");
        return `${yyyy}-${mm}-${dd}`;
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "_keyIsoFromBR", error);
        return "";
    }
}

/* ==========================
   Helpers de Combo Syncfusion
   ========================== */
function getComboValue(comboId)
{
    try
    {
        const el = document.getElementById(comboId);
        if (el && el.ej2_instances && el.ej2_instances.length > 0)
        {
            const inst = el.ej2_instances[0];
            if (inst && inst.value != null && inst.value !== "") return inst.value;
        }
        return "";
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "getComboValue", error);
        return "";
    }
}

/* ==========================
   Construção da Grid
   ========================== */
function BuildGridOcorrencias(params)
{
    try
    {
        if ($.fn.DataTable.isDataTable("#tblOcorrencia"))
        {
            $("#tblOcorrencia").DataTable().destroy();
            $("#tblOcorrencia tbody").empty();
        }

        dataTable = $("#tblOcorrencia").DataTable({
            autoWidth: false,
            dom: "Bfrtip",
            lengthMenu: [[10, 25, 50, -1], ["10 linhas", "25 linhas", "50 linhas", "Todas"]],
            buttons: ["pageLength", "excel", { extend: "pdfHtml5", orientation: "landscape", pageSize: "LEGAL" }],
            order: [[1, "desc"]],
            columnDefs: [
                { targets: 0, className: "text-center", width: "5%" },
                {
                    targets: 1,
                    className: "text-center",
                    width: "8%",
                    render: function (value, type)
                    {
                        try
                        {
                            if (!value) return "";
                            if (type === "sort" || type === "type")
                            {
                                if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return _keyIsoFromBR(value);
                            }
                            return value;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ocorrencias.js", "grid.render.data", error);
                            return "";
                        }
                    }
                },
                {
                    targets: 2,
                    className: "text-left",
                    width: "12%",
                    render: function (data, type)
                    {
                        try
                        {
                            return type === "display" ? abreviarNomeMotorista(data) : data;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ocorrencias.js", "grid.render.motorista", error);
                            return data;
                        }
                    }
                },
                { targets: 3, className: "text-left", width: "15%" },
                { targets: 4, className: "text-left", width: "15%" },
                { targets: 5, className: "text-left", width: "15%" },
                { targets: 6, className: "text-center", width: "8%" },
                { targets: 7, className: "text-center", width: "8%" },
                { targets: 8, visible: false }
            ],
            responsive: true,
            ajax: {
                url: "/api/OcorrenciaViagem/ListarGestao",
                type: "GET",
                dataType: "json",
                data: params,
                error: function (xhr, error, thrown)
                {
                    try
                    {
                        console.error("Erro ao carregar ocorrências:", error, thrown);
                        AppToast.show("Vermelho", "Erro ao carregar ocorrências", 3000);
                    }
                    catch (err)
                    {
                        Alerta.TratamentoErroComLinha("ocorrencias.js", "ajax.error", err);
                    }
                }
            },
            columns: [
                { data: "noFichaVistoria", defaultContent: "-" },
                { data: "data", defaultContent: "-" },
                { data: "nomeMotorista", defaultContent: "-" },
                { data: "descricaoVeiculo", defaultContent: "-" },
                { data: "resumoOcorrencia", defaultContent: "-" },
                { data: "descricaoSolucaoOcorrencia", defaultContent: "-" },
                {
                    data: "statusOcorrencia",
                    render: function (data, type, row)
                    {
                        try
                        {
                            var s = row.statusOcorrencia || "Aberta";
                            var icon = "";
                            var badgeClass = "ftx-badge-aberta";
                            
                            switch (s)
                            {
                                case "Aberta":
                                    icon = '<i class="fa-solid fa-circle-exclamation me-1"></i>';
                                    badgeClass = "ftx-badge-aberta";
                                    break;
                                case "Baixada":
                                    icon = '<i class="fa-solid fa-circle-check me-1"></i>';
                                    badgeClass = "ftx-badge-baixada";
                                    break;
                                case "Pendente":
                                    icon = '<i class="fa-solid fa-clock me-1"></i>';
                                    badgeClass = "ftx-badge-pendente";
                                    break;
                                case "Manutenção":
                                    icon = '<i class="fa-solid fa-wrench me-1"></i>';
                                    badgeClass = "ftx-badge-manutencao";
                                    break;
                            }
                            
                            return `<span class="ftx-badge-status ${badgeClass}">${icon}${s}</span>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ocorrencias.js", "grid.render.status", error);
                            return "";
                        }
                    }
                },
                {
                    data: "ocorrenciaViagemId",
                    render: function (data, type, row)
                    {
                        try
                        {
                            var baixada = row.statusOcorrencia === "Baixada";
                            var temImagem = row.imagemOcorrencia && row.imagemOcorrencia.trim() !== "";

                            // Botão Ver Imagem - sempre visível, disabled se não tiver imagem
                            var btnImagem = `
                                <button type="button" class="btn btn-foto text-white btn-icon-28 btn-ver-imagem ${temImagem ? '' : 'disabled'}" 
                                    data-imagem="${row.imagemOcorrencia || ''}" 
                                    title="${temImagem ? 'Ver Imagem/Vídeo' : 'Sem imagem'}"
                                    ${temImagem ? '' : 'disabled'}>
                                    <i class="fad fa-image"></i>
                                </button>`;

                            // Botão Editar - sempre visível
                            var btnEditar = `
                                <button type="button" class="btn btn-azul-escuro text-white btn-icon-28 btn-editar-ocorrencia" 
                                    data-id="${data}" title="Editar">
                                    <i class="fal fa-edit"></i>
                                </button>`;

                            // Botão Baixar - sempre visível, disabled se já baixada
                            var btnBaixa = `
                                <button type="button" class="btn btn-verde text-white btn-icon-28 btn-baixar ${baixada ? 'disabled' : ''}" 
                                    data-id="${data}" 
                                    title="${baixada ? 'Já baixada' : 'Dar Baixa'}"
                                    ${baixada ? 'disabled' : ''}>
                                    <i class="fa-solid fa-flag-checkered"></i>
                                </button>`;

                            return `<div class="text-center ftx-actions">
                                ${btnImagem}
                                ${btnEditar}
                                ${btnBaixa}
                            </div>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ocorrencias.js", "grid.render.acoes", error);
                            return "";
                        }
                    }
                },
                { data: "descricaoOcorrencia", defaultContent: "" }
            ],
            language: {
                url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json"
            },
            drawCallback: function ()
            {
                try
                {
                    console.log("[ocorrencias.js] Grid carregada com", this.api().rows().count(), "registros");
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha("ocorrencias.js", "drawCallback", error);
                }
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "BuildGridOcorrencias", error);
    }
}

/* ==========================
   Coleta de Parâmetros
   ========================== */
function collectParamsFromUI()
{
    try
    {
        const data = ($("#txtData").val() || "").trim();
        const dataInicial = ($("#txtDataInicial").val() || "").trim();
        const dataFinal = ($("#txtDataFinal").val() || "").trim();
        const temPeriodo = dataInicial && dataFinal;

        const veiculoId = getComboValue("lstVeiculos");
        const motoristaId = getComboValue("lstMotorista");

        let statusId = getComboValue("lstStatus");
        if (!statusId)
        {
            statusId = (veiculoId || motoristaId || data || temPeriodo) ? "Todas" : "Aberta";
        }

        return {
            veiculoId: veiculoId,
            motoristaId: motoristaId,
            statusId: statusId,
            data: temPeriodo ? "" : data,
            dataInicial: temPeriodo ? dataInicial : "",
            dataFinal: temPeriodo ? dataFinal : ""
        };
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "collectParamsFromUI", error);
        return { statusId: "Aberta" };
    }
}

/* ==========================
   Validação de Datas
   ========================== */
function validateDatesBeforeSearch()
{
    try
    {
        const dataInicial = ($("#txtDataInicial").val() || "").trim();
        const dataFinal = ($("#txtDataFinal").val() || "").trim();

        if ((dataInicial && !dataFinal) || (!dataInicial && dataFinal))
        {
            Alerta.Erro("Informação Ausente", "Para filtrar por período, preencha Data Inicial e Data Final.", "OK");
            return false;
        }

        return true;
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "validateDatesBeforeSearch", error);
        return false;
    }
}

/* ==========================
   Funções de Imagem
   ========================== */
function renderizarImagemOcorrencia(imagemUrl, readonly)
{
    try
    {
        const container = document.getElementById("divImagemOcorrencia");
        if (!container) return;

        imagemOcorrenciaAlterada = false;
        novaImagemOcorrencia = "";

        if (imagemUrl && imagemUrl.trim())
        {
            const isVideo = /\.(mp4|webm)$/i.test(imagemUrl);
            let mediaHtml = isVideo
                ? `<video class="img-ocorrencia-preview" controls>
                     <source src="${imagemUrl}" type="video/${imagemUrl.split('.').pop()}">
                   </video>`
                : `<img src="${imagemUrl}" class="img-ocorrencia-preview" alt="Imagem" />`;

            const actionsHtml = readonly ? "" : `
                <div class="img-ocorrencia-actions">
                    <button type="button" class="btn-img-action btn-alterar" id="btnAlterarImagem">
                        <i class="fad fa-image"></i> Alterar
                    </button>
                    <button type="button" class="btn-img-action btn-excluir" id="btnExcluirImagem">
                        <i class="fad fa-trash-can"></i> Excluir
                    </button>
                </div>`;

            container.innerHTML = `<div class="img-ocorrencia-container p-3">${mediaHtml}${actionsHtml}</div>`;
        }
        else
        {
            const actionsHtml = readonly ? "" : `
                <div class="img-ocorrencia-actions">
                    <button type="button" class="btn-img-action btn-alterar" id="btnAlterarImagem">
                        <i class="fad fa-image"></i> Adicionar Imagem
                    </button>
                </div>`;

            container.innerHTML = `
                <div class="img-ocorrencia-placeholder">
                    <i class="fad fa-image-slash"></i>
                    <p>Nenhuma imagem registrada</p>
                    ${actionsHtml}
                </div>`;
        }

        registrarEventosImagem();
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "renderizarImagemOcorrencia", error);
    }
}

function registrarEventosImagem()
{
    try
    {
        const btnAlterar = document.getElementById("btnAlterarImagem");
        if (btnAlterar)
        {
            btnAlterar.onclick = () =>
            {
                try { document.getElementById("inputImagemOcorrencia").click(); }
                catch (e) { Alerta.TratamentoErroComLinha("ocorrencias.js", "btnAlterarImagem.click", e); }
            };
        }

        const btnExcluir = document.getElementById("btnExcluirImagem");
        if (btnExcluir)
        {
            btnExcluir.onclick = async () =>
            {
                try
                {
                    const confirmado = await Alerta.Confirmar(
                        "Excluir Imagem",
                        "Deseja realmente excluir a imagem?",
                        "Sim, excluir",
                        "Cancelar"
                    );

                    if (confirmado)
                    {
                        imagemOcorrenciaAlterada = true;
                        novaImagemOcorrencia = "";
                        $("#txtImagemOcorrenciaAtual").val("");
                        renderizarImagemOcorrencia("", false);
                        AppToast.show("Amarelo", "Imagem marcada para exclusão. Salve para confirmar.", 3000);
                    }
                }
                catch (e)
                {
                    Alerta.TratamentoErroComLinha("ocorrencias.js", "btnExcluirImagem.click", e);
                }
            };
        }
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "registrarEventosImagem", error);
    }
}

async function uploadImagemOcorrencia(file)
{
    try
    {
        const formData = new FormData();
        formData.append("arquivo", file);

        const container = document.getElementById("divImagemOcorrencia");
        container.innerHTML = `
            <div class="img-ocorrencia-placeholder">
                <i class="fa fa-spinner fa-spin" style="font-size: 3rem;"></i>
                <p class="mt-3">Enviando arquivo...</p>
            </div>`;

        const response = await fetch("/api/OcorrenciaViagem/UploadImagem", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.success)
        {
            imagemOcorrenciaAlterada = true;
            novaImagemOcorrencia = result.url;
            $("#txtImagemOcorrenciaAtual").val(result.url);
            renderizarImagemOcorrencia(result.url, false);
            AppToast.show("Verde", "Imagem carregada. Salve para confirmar.", 3000);
        }
        else
        {
            Alerta.Erro("Erro no Upload", result.message || "Erro ao enviar arquivo.", "OK");
            renderizarImagemOcorrencia($("#txtImagemOcorrenciaAtual").val(), false);
        }

        document.getElementById("inputImagemOcorrencia").value = "";
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "uploadImagemOcorrencia", error);
        Alerta.Erro("Erro", "Erro ao enviar arquivo.", "OK");
        renderizarImagemOcorrencia($("#txtImagemOcorrenciaAtual").val(), false);
    }
}

/* ==========================
   Verificação de Solução
   ========================== */
function verificarSolucaoPreenchida()
{
    try
    {
        const rteSol = document.getElementById("rteSolucao")?.ej2_instances?.[0];
        if (!rteSol) return false;

        const valor = rteSol.value || "";
        const textoLimpo = valor.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
        return textoLimpo.length > 0;
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "verificarSolucaoPreenchida", error);
        return false;
    }
}

/* ==========================
   Baixa de Ocorrência
   ========================== */
async function executarBaixaOcorrencia(id, solucao, onSuccess)
{
    try
    {
        const response = await fetch("/api/OcorrenciaViagem/BaixarOcorrenciaComSolucao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                OcorrenciaViagemId: id,
                SolucaoOcorrencia: solucao || ""
            })
        });

        const data = await response.json();

        if (data.success)
        {
            AppToast.show("Verde", data.message, 2000);
            if (onSuccess) onSuccess();
            if (dataTable) dataTable.ajax.reload(null, false);
        }
        else
        {
            AppToast.show("Vermelho", data.message, 2000);
        }
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "executarBaixaOcorrencia", error);
        Alerta.Erro("Erro", "Erro ao baixar ocorrência.", "OK");
    }
}

function abrirModalBaixaRapida(id, solucaoAtual)
{
    try
    {
        $("#txtBaixaRapidaId").val(id);
        $("#txtBaixaRapidaSolucao").val(solucaoAtual || "");
        
        const modalEl = document.getElementById("modalBaixaRapida");
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
        
        // Foca no campo de solução
        setTimeout(() => $("#txtBaixaRapidaSolucao").focus(), 300);
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "abrirModalBaixaRapida", error);
    }
}

function fecharModalBaixaRapida()
{
    try
    {
        const modalEl = document.getElementById("modalBaixaRapida");
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "fecharModalBaixaRapida", error);
    }
}

async function processarBaixaComValidacao(id, solucaoAtual, onSuccess)
{
    try
    {
        const solucaoLimpa = (solucaoAtual || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
        
        if (solucaoLimpa.length > 0)
        {
            // Já tem solução: confirma direto
            const confirmado = await Alerta.Confirmar(
                "Baixa na Ocorrência",
                "Você tem certeza que deseja dar baixa nesta ocorrência?",
                "Sim, dar baixa",
                "Cancelar"
            );

            if (confirmado)
            {
                await executarBaixaOcorrencia(id, solucaoAtual, onSuccess);
            }
        }
        else
        {
            // Sem solução: abre modal para digitar
            abrirModalBaixaRapida(id, "");
        }
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "processarBaixaComValidacao", error);
    }
}

/* ==========================
   Visualizar Imagem/Vídeo
   ========================== */
function abrirModalImagem(imagemUrl)
{
    try
    {
        const container = document.getElementById("divImagemVisualizacao");
        if (!container) return;

        const isVideo = /\.(mp4|webm)$/i.test(imagemUrl);
        
        if (isVideo)
        {
            container.innerHTML = `
                <video controls autoplay style="max-width:100%; max-height:70vh;">
                    <source src="${imagemUrl}" type="video/${imagemUrl.split('.').pop()}">
                    Seu navegador não suporta vídeos.
                </video>`;
        }
        else
        {
            container.innerHTML = `<img src="${imagemUrl}" style="max-width:100%; max-height:70vh;" alt="Imagem da Ocorrência" />`;
        }

        const modalEl = document.getElementById("modalVisualizarImagem");
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "abrirModalImagem", error);
    }
}

/* ==========================
   Abertura do Modal
   ========================== */
function abrirModalOcorrencia()
{
    try
    {
        const modalEl = document.getElementById("modalOcorrencia");
        if (!modalEl) return;

        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "abrirModalOcorrencia", error);
    }
}

function fecharModalOcorrencia()
{
    try
    {
        const modalEl = document.getElementById("modalOcorrencia");
        if (!modalEl) return;

        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "fecharModalOcorrencia", error);
    }
}

function preencherModalComDados(data)
{
    try
    {
        $("#txtId").val(data.ocorrenciaViagemId);
        $("#txtResumo").val(data.resumoOcorrencia || "");
        $("#txtImagemOcorrenciaAtual").val(data.imagemOcorrencia || "");

        const rteDesc = document.getElementById("rteOcorrencias")?.ej2_instances?.[0];
        const rteSol = document.getElementById("rteSolucao")?.ej2_instances?.[0];

        if (rteDesc) rteDesc.value = data.descricaoOcorrencia || "";
        if (rteSol) rteSol.value = data.descricaoSolucaoOcorrencia || "";

        const baixada = data.statusOcorrencia === "Baixada";
        $("#chkStatusOcorrencia").val(baixada ? "Baixada" : "Aberta");
        $("#txtResumo").prop("readonly", baixada);

        if (rteDesc) rteDesc.readonly = baixada;

        renderizarImagemOcorrencia(data.imagemOcorrencia || "", baixada);

        // Botões sempre visíveis, mas desabilitados se já baixada
        $("#btnEditarOcorrencia").show().prop("disabled", baixada);
        $("#btnBaixarOcorrenciaModal").show().prop("disabled", baixada);
        
        // Ajustar aparência visual quando desabilitado
        if (baixada)
        {
            $("#btnEditarOcorrencia").css("opacity", "0.5").css("cursor", "not-allowed");
            $("#btnBaixarOcorrenciaModal").css("opacity", "0.5").css("cursor", "not-allowed");
        }
        else
        {
            $("#btnEditarOcorrencia").css("opacity", "1").css("cursor", "pointer");
            $("#btnBaixarOcorrenciaModal").css("opacity", "1").css("cursor", "pointer");
        }
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "preencherModalComDados", error);
    }
}

function limparModal()
{
    try
    {
        $("#txtId").val("");
        $("#txtResumo").val("").prop("readonly", false);
        $("#txtImagemOcorrenciaAtual").val("");
        $("#chkStatusOcorrencia").val("");

        try { document.getElementById("rteOcorrencias").ej2_instances[0].value = ""; } catch (_) { }
        try { document.getElementById("rteSolucao").ej2_instances[0].value = ""; } catch (_) { }

        imagemOcorrenciaAlterada = false;
        novaImagemOcorrencia = "";

        const container = document.getElementById("divImagemOcorrencia");
        if (container) container.innerHTML = "";
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "limparModal", error);
    }
}

/* ==========================
   Document Ready
   ========================== */
$(document).ready(function ()
{
    try
    {
        // Carrega grid inicial com ocorrências ABERTAS
        BuildGridOcorrencias({
            veiculoId: "",
            motoristaId: "",
            statusId: "Aberta",
            data: "",
            dataInicial: "",
            dataFinal: ""
        });

        // Botão Filtrar
        $("#btnFiltrarOcorrencias").on("click", function (e)
        {
            try
            {
                e.preventDefault();
                if (!validateDatesBeforeSearch()) return;
                const params = collectParamsFromUI();
                console.log("[Ocorrências] Filtros:", params);
                BuildGridOcorrencias(params);
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "btnFiltrar.click", error);
            }
        });

        // Enter nos campos de data
        $("#txtData, #txtDataInicial, #txtDataFinal").on("keydown", function (e)
        {
            try
            {
                if (e.key === "Enter") $("#btnFiltrarOcorrencias").trigger("click");
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "txtData.keydown", error);
            }
        });

        // Clique em Editar (delegado)
        $(document).on("click", ".btn-editar-ocorrencia", function (e)
        {
            try
            {
                e.preventDefault();
                e.stopPropagation();

                const id = $(this).data("id");
                if (!id) return;

                const table = $("#tblOcorrencia").DataTable();
                const rowApi = table.row((idx, rowData) => String(rowData.ocorrenciaViagemId) === String(id));

                if (rowApi.any())
                {
                    preencherModalComDados(rowApi.data());
                    abrirModalOcorrencia();
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "btn-editar.click", error);
            }
        });

        // Clique em Ver Imagem (delegado)
        $(document).on("click", ".btn-ver-imagem", function (e)
        {
            try
            {
                e.preventDefault();
                e.stopPropagation();

                const imagem = $(this).data("imagem");
                if (imagem)
                {
                    abrirModalImagem(imagem);
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "btn-ver-imagem.click", error);
            }
        });

        // Clique em Baixar na tabela (delegado)
        $(document).on("click", ".btn-baixar", async function (e)
        {
            try
            {
                e.preventDefault();
                e.stopPropagation();

                const id = $(this).data("id");
                if (!id) return;

                const table = $("#tblOcorrencia").DataTable();
                const rowApi = table.row((idx, rowData) => String(rowData.ocorrenciaViagemId) === String(id));

                let solucaoAtual = "";
                if (rowApi.any())
                {
                    const data = rowApi.data();
                    solucaoAtual = data.descricaoSolucaoOcorrencia || "";
                }

                await processarBaixaComValidacao(id, solucaoAtual, null);
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "btn-baixar.click", error);
            }
        });

        // Botão Confirmar Baixa Rápida
        $("#btnConfirmarBaixaRapida").on("click", async function (e)
        {
            try
            {
                e.preventDefault();
                
                const $btn = $(this);
                if ($btn.data("busy")) return;

                const id = $("#txtBaixaRapidaId").val();
                const solucao = $("#txtBaixaRapidaSolucao").val();

                if (!id)
                {
                    Alerta.Erro("Erro", "ID da ocorrência não encontrado.", "OK");
                    return;
                }

                $btn.data("busy", true).prop("disabled", true).html('<i class="fa fa-spinner fa-spin me-1"></i> Baixando...');

                await executarBaixaOcorrencia(id, solucao, function() {
                    fecharModalBaixaRapida();
                });

                $btn.data("busy", false).prop("disabled", false).html('<i class="fa-solid fa-flag-checkered me-1" style="color:#fff;"></i> Confirmar Baixa');
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "btnConfirmarBaixaRapida.click", error);
                $("#btnConfirmarBaixaRapida").data("busy", false).prop("disabled", false).html('<i class="fa-solid fa-flag-checkered me-1" style="color:#fff;"></i> Confirmar Baixa');
            }
        });

        // Limpar modal de baixa rápida ao fechar
        $("#modalBaixaRapida").on("hidden.bs.modal", function ()
        {
            try
            {
                $("#txtBaixaRapidaId").val("");
                $("#txtBaixaRapidaSolucao").val("");
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "modalBaixaRapida.hidden", error);
            }
        });

        // Botão Baixar no Modal de Edição
        $("#btnBaixarOcorrenciaModal").on("click", async function (e)
        {
            try
            {
                e.preventDefault();

                const id = $("#txtId").val();
                if (!id)
                {
                    Alerta.Erro("Erro", "ID da ocorrência não encontrado.", "OK");
                    return;
                }

                // Pega a solução do RTE
                const rteSol = document.getElementById("rteSolucao")?.ej2_instances?.[0];
                const solucaoAtual = rteSol?.value || "";

                await processarBaixaComValidacao(id, solucaoAtual, fecharModalOcorrencia);
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "btnBaixarModal.click", error);
            }
        });

        // Botão Salvar
        $("#btnEditarOcorrencia").on("click", async function (e)
        {
            try
            {
                e.preventDefault();

                const $btn = $(this);
                if ($btn.data("busy")) return;

                const resumo = $("#txtResumo").val();
                if (!resumo)
                {
                    Alerta.Erro("Informação Ausente", "O Resumo da Ocorrência é obrigatório.", "OK");
                    return;
                }

                const rteDesc = document.getElementById("rteOcorrencias")?.ej2_instances?.[0];
                const rteSol = document.getElementById("rteSolucao")?.ej2_instances?.[0];

                let imagemFinal = $("#txtImagemOcorrenciaAtual").val() || "";
                if (imagemOcorrenciaAlterada)
                {
                    imagemFinal = novaImagemOcorrencia;
                }

                const payload = {
                    OcorrenciaViagemId: $("#txtId").val(),
                    ResumoOcorrencia: resumo,
                    DescricaoOcorrencia: rteDesc?.value || "",
                    SolucaoOcorrencia: rteSol?.value || "",
                    StatusOcorrencia: $("#chkStatusOcorrencia").val() || "Aberta",
                    ImagemOcorrencia: imagemFinal
                };

                $btn.data("busy", true).prop("disabled", true).html('<i class="fa fa-spinner fa-spin me-2"></i> Salvando...');

                const response = await fetch("/api/OcorrenciaViagem/EditarOcorrencia", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (data.success)
                {
                    AppToast.show("Verde", data.message || "Ocorrência atualizada!", 2000);
                    fecharModalOcorrencia();
                    if (dataTable) dataTable.ajax.reload(null, false);
                }
                else
                {
                    AppToast.show("Vermelho", data.message || "Erro ao salvar.", 2000);
                }

                $btn.data("busy", false).prop("disabled", false).html('<i class="fad fa-floppy-disk me-1" style="color:#fff;"></i> Salvar Alterações');
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "btnSalvar.click", error);
                $("#btnEditarOcorrencia").data("busy", false).prop("disabled", false).html('<i class="fad fa-floppy-disk me-1" style="color:#fff;"></i> Salvar Alterações');
            }
        });

        // Evento de seleção de imagem
        $("#inputImagemOcorrencia").on("change", function (e)
        {
            try
            {
                const file = e.target.files[0];
                if (!file) return;

                const tiposPermitidos = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
                if (!tiposPermitidos.includes(file.type))
                {
                    Alerta.Erro("Tipo Inválido", "Selecione uma imagem (JPG, PNG, GIF, WebP) ou vídeo (MP4, WebM).", "OK");
                    return;
                }

                if (file.size > 50 * 1024 * 1024)
                {
                    Alerta.Erro("Arquivo muito grande", "O arquivo deve ter no máximo 50MB.", "OK");
                    return;
                }

                uploadImagemOcorrencia(file);
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "inputImagem.change", error);
            }
        });

        // Limpar modal ao fechar
        $("#modalOcorrencia").on("hidden.bs.modal", function ()
        {
            try
            {
                limparModal();
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ocorrencias.js", "modal.hidden", error);
            }
        });

        // Refresh UI dos RTEs ao abrir modal
        $("#modalOcorrencia").on("shown.bs.modal", function ()
        {
            try
            {
                document.getElementById("rteOcorrencias")?.ej2_instances?.[0]?.refreshUI();
                document.getElementById("rteSolucao")?.ej2_instances?.[0]?.refreshUI();
            }
            catch (_) { }
        });

        console.log("[ocorrencias.js] Inicialização concluída");
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ocorrencias.js", "document.ready", error);
    }
});

/* ==========================
   Localização RTE Syncfusion
   ========================== */
try
{
    if (typeof ej !== "undefined" && ej.base && ej.base.L10n)
    {
        ej.base.L10n.load({
            "pt-BR": {
                richtexteditor: {
                    alignments: "Alinhamentos", justifyLeft: "Alinhar à Esquerda", justifyCenter: "Centralizar",
                    justifyRight: "Alinhar à Direita", justifyFull: "Justificar", fontName: "Fonte",
                    fontSize: "Tamanho", fontColor: "Cor da Fonte", backgroundColor: "Cor de Fundo",
                    bold: "Negrito", italic: "Itálico", underline: "Sublinhado", strikethrough: "Tachado",
                    clearFormat: "Limpar Formatação", cut: "Cortar", copy: "Copiar", paste: "Colar",
                    unorderedList: "Lista", orderedList: "Lista Numerada", indent: "Aumentar Recuo",
                    outdent: "Diminuir Recuo", undo: "Desfazer", redo: "Refazer",
                    createLink: "Inserir Link", image: "Inserir Imagem", fullscreen: "Maximizar",
                    formats: "Formatos", sourcecode: "Código Fonte"
                }
            }
        });
    }
}
catch (error)
{
    console.warn("Erro ao carregar localização RTE:", error);
}
