// ============================================================
// atualizacustosviagem.js - Tela de Ajuste de Custos de Viagens
// Padrão FrotiX - Bootstrap 5
// ============================================================

// Variáveis globais para instâncias dos modais
let modalAjustaCustos = null;
let modalFicha = null;

$(document).ready(function () {
    try {
        inicializarModais();
        initDataTable();
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "document.ready", error);
    }
});

// ============================================================
// INICIALIZAÇÃO DOS MODAIS (Bootstrap 5)
// ============================================================
function inicializarModais() {
    try {
        // Modal Ajusta Custos
        const modalAjustaCustosEl = document.getElementById("modalAjustaCustos");
        if (modalAjustaCustosEl) {
            modalAjustaCustos = new bootstrap.Modal(modalAjustaCustosEl, {
                keyboard: true,
                backdrop: "static"
            });

            // Evento ao mostrar o modal
            modalAjustaCustosEl.addEventListener("show.bs.modal", function (event) {
                try {
                    const button = event.relatedTarget;
                    if (button) {
                        const viagemId = button.getAttribute("data-id");
                        if (viagemId) {
                            carregarDadosViagem(viagemId);
                        }
                    }
                }
                catch (error) {
                    Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "modalAjustaCustos.show", error);
                }
            });
        }

        // Modal Ficha de Vistoria
        const modalFichaEl = document.getElementById("modalFicha");
        if (modalFichaEl) {
            modalFicha = new bootstrap.Modal(modalFichaEl, {
                keyboard: true,
                backdrop: "static"
            });

            // Evento ao mostrar o modal
            modalFichaEl.addEventListener("show.bs.modal", function (event) {
                try {
                    const button = event.relatedTarget;
                    if (button) {
                        const viagemId = button.getAttribute("data-id");
                        if (viagemId) {
                            document.getElementById("txtViagemId").value = viagemId;
                            carregarFichaVistoria(viagemId, button);
                        }
                    }
                }
                catch (error) {
                    Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "modalFicha.show", error);
                }
            });
        }

        // Botão Ajustar Viagem
        const btnAjustarViagem = document.getElementById("btnAjustarViagem");
        if (btnAjustarViagem) {
            btnAjustarViagem.addEventListener("click", function () {
                gravarViagem();
            });
        }
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "inicializarModais", error);
    }
}

// ============================================================
// FUNÇÕES DE LOADING - Padrão FrotiX (Overlay)
// ============================================================
function mostrarLoading(mensagem) {
    try {
        if (mensagem) {
            document.getElementById("txtLoadingMessage").textContent = mensagem;
        }
        const overlay = document.getElementById("loadingOverlayCustos");
        if (overlay) {
            overlay.style.display = "flex";
        }
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "mostrarLoading", error);
    }
}

function esconderLoading() {
    try {
        const overlay = document.getElementById("loadingOverlayCustos");
        if (overlay) {
            overlay.style.display = "none";
        }
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "esconderLoading", error);
    }
}

// ============================================================
// CARREGAR DADOS DA VIAGEM NO MODAL
// ============================================================
function carregarDadosViagem(viagemId) {
    try {
        $.ajax({
            type: "GET",
            url: "/api/Viagem/GetViagem/" + viagemId,
            success: function (res) {
                try {
                    if (res && res.success && res.data) {
                        const viagem = res.data;
                        
                        document.getElementById("txtId").value = viagem.viagemId;
                        document.getElementById("txtNoFichaVistoria").value = viagem.noFichaVistoria || "";

                        // Finalidade
                        const lstFinalidade = document.getElementById("lstFinalidadeAlterada");
                        if (lstFinalidade && lstFinalidade.ej2_instances) {
                            lstFinalidade.ej2_instances[0].value = viagem.finalidade || null;
                        }

                        // Evento
                        const lstEvento = document.getElementById("lstEvento");
                        if (lstEvento && lstEvento.ej2_instances) {
                            if (viagem.finalidade === "Evento" && viagem.eventoId) {
                                lstEvento.ej2_instances[0].enabled = true;
                                lstEvento.ej2_instances[0].value = [viagem.eventoId.toString()];
                                $(".esconde-diveventos").show();
                            } else {
                                lstEvento.ej2_instances[0].enabled = false;
                                lstEvento.ej2_instances[0].value = null;
                                $(".esconde-diveventos").hide();
                            }
                        }

                        // Datas e Horas
                        document.getElementById("txtDataInicial").value = viagem.dataInicial || "";
                        document.getElementById("txtHoraInicial").value = viagem.horaInicio || "";
                        document.getElementById("txtDataFinal").value = viagem.dataFinal || "";
                        document.getElementById("txtHoraFinal").value = viagem.horaFim || "";

                        // Quilometragem
                        document.getElementById("txtKmInicial").value = viagem.kmInicial || "";
                        document.getElementById("txtKmFinal").value = viagem.kmFinal || "";

                        // Ramal do Requisitante
                        document.getElementById("txtRamalRequisitante").value = viagem.ramalRequisitante || "";

                        // Aguarda um pequeno delay para os combos Syncfusion carregarem os dados
                        setTimeout(function() {
                            try {
                                // Motorista
                                const lstMotorista = document.getElementById("lstMotoristaAlterado");
                                if (lstMotorista && lstMotorista.ej2_instances && viagem.motoristaId) {
                                    lstMotorista.ej2_instances[0].value = viagem.motoristaId;
                                }

                                // Veículo
                                const lstVeiculo = document.getElementById("lstVeiculoAlterado");
                                if (lstVeiculo && lstVeiculo.ej2_instances && viagem.veiculoId) {
                                    lstVeiculo.ej2_instances[0].value = viagem.veiculoId;
                                }

                                // Solicitante (Requisitante)
                                const lstRequisitante = document.getElementById("lstRequisitanteAlterado");
                                if (lstRequisitante && lstRequisitante.ej2_instances && viagem.requisitanteId) {
                                    lstRequisitante.ej2_instances[0].value = viagem.requisitanteId;
                                }

                                // Setor Solicitante (DropDownTree - precisa de array)
                                const lstSetor = document.getElementById("lstSetorSolicitanteAlterado");
                                if (lstSetor && lstSetor.ej2_instances && viagem.setorSolicitanteId) {
                                    lstSetor.ej2_instances[0].value = [viagem.setorSolicitanteId];
                                }
                            } catch (error) {
                                console.error("Erro ao setar valores dos combos:", error);
                            }
                        }, 300);

                    } else {
                        AppToast.show("Amarelo", res.message || "Viagem não encontrada", 3000);
                    }
                }
                catch (error) {
                    Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "carregarDadosViagem.success", error);
                }
            },
            error: function (xhr, status, error) {
                Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "carregarDadosViagem.error", error);
            }
        });
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "carregarDadosViagem", error);
    }
}

// ============================================================
// CARREGAR FICHA DE VISTORIA
// ============================================================
function carregarFichaVistoria(viagemId, button) {
    try {
        const labelEl = document.getElementById("DynamicModalLabel");
        const imgViewer = document.getElementById("imgViewer");

        // Pega o número da ficha da linha da tabela
        const fichaVistoria = $(button).closest("tr").find("td:eq(0)").text();

        $.ajax({
            type: "GET",
            url: "/api/Viagem/PegaFichaModal",
            data: { id: viagemId },
            success: function (res) {
                try {
                    imgViewer.removeAttribute("src");

                    if (res === false || res === null || res === "") {
                        labelEl.innerHTML = '<i class="fa-duotone fa-file-image me-2"></i>Viagem sem Ficha de Vistoria Digitalizada';
                        imgViewer.src = "/Images/FichaAmarelaNova.jpg";
                    } else {
                        labelEl.innerHTML = '<i class="fa-duotone fa-file-image me-2"></i>Ficha de Vistoria Nº: <b>' + fichaVistoria + '</b>';
                        imgViewer.src = "data:image/jpg;base64," + res;
                    }
                }
                catch (error) {
                    Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "carregarFichaVistoria.success", error);
                }
            },
            error: function (xhr, status, error) {
                Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "carregarFichaVistoria.error", error);
            }
        });
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "carregarFichaVistoria", error);
    }
}

// ============================================================
// GRAVAR VIAGEM
// ============================================================
function gravarViagem() {
    try {
        const viagemId = document.getElementById("txtId").value;
        const noFichaVistoria = document.getElementById("txtNoFichaVistoria").value;

        // Finalidade
        const lstFinalidade = document.getElementById("lstFinalidadeAlterada");
        const finalidade = lstFinalidade && lstFinalidade.ej2_instances ? lstFinalidade.ej2_instances[0].value : null;

        // Evento
        const lstEvento = document.getElementById("lstEvento");
        let eventoId = null;
        if (lstEvento && lstEvento.ej2_instances) {
            const eventoValue = lstEvento.ej2_instances[0].value;
            if (eventoValue && eventoValue.length > 0) {
                eventoId = eventoValue[0]; // Guid como string
            }
        }

        // Datas e Horas
        const dataInicial = document.getElementById("txtDataInicial").value || null;
        const horaInicial = document.getElementById("txtHoraInicial").value || null;
        const dataFinal = document.getElementById("txtDataFinal").value || null;
        const horaFinal = document.getElementById("txtHoraFinal").value || null;

        // Km
        const kmInicial = parseInt(document.getElementById("txtKmInicial").value) || null;
        const kmFinal = parseInt(document.getElementById("txtKmFinal").value) || null;

        // Motorista
        const lstMotorista = document.getElementById("lstMotoristaAlterado");
        const motoristaId = lstMotorista && lstMotorista.ej2_instances ? lstMotorista.ej2_instances[0].value : null;

        // Veículo
        const lstVeiculo = document.getElementById("lstVeiculoAlterado");
        const veiculoId = lstVeiculo && lstVeiculo.ej2_instances ? lstVeiculo.ej2_instances[0].value : null;

        // Setor Solicitante
        const lstSetor = document.getElementById("lstSetorSolicitanteAlterado");
        let setorSolicitanteId = null;
        if (lstSetor && lstSetor.ej2_instances) {
            const setorValue = lstSetor.ej2_instances[0].value;
            if (setorValue && setorValue.length > 0) {
                setorSolicitanteId = setorValue[0];
            }
        }

        // Solicitante (Requisitante)
        const lstRequisitante = document.getElementById("lstRequisitanteAlterado");
        const requisitanteId = lstRequisitante && lstRequisitante.ej2_instances ? lstRequisitante.ej2_instances[0].value : null;

        // Ramal do Requisitante
        const ramalRequisitante = document.getElementById("txtRamalRequisitante").value || null;

        const dados = {
            ViagemId: viagemId,
            NoFichaVistoria: parseInt(noFichaVistoria) || null,
            Finalidade: finalidade,
            EventoId: eventoId,
            DataInicial: dataInicial,
            HoraInicio: horaInicial,
            DataFinal: dataFinal,
            HoraFim: horaFinal,
            KmInicial: kmInicial,
            KmFinal: kmFinal,
            MotoristaId: motoristaId,
            VeiculoId: veiculoId,
            SetorSolicitanteId: setorSolicitanteId,
            RequisitanteId: requisitanteId,
            RamalRequisitante: ramalRequisitante
        };

        // Mostrar spinner
        const btnAjustar = document.getElementById("btnAjustarViagem");
        const spinner = btnAjustar.querySelector(".spinner-border");
        const btnText = btnAjustar.querySelector(".btn-text");
        if (spinner) spinner.classList.remove("d-none");
        if (btnText) btnText.textContent = "Gravando...";
        btnAjustar.disabled = true;

        $.ajax({
            type: "POST",
            url: "/api/Viagem/AtualizarDadosViagemDashboard",
            contentType: "application/json",
            data: JSON.stringify(dados),
            success: function (res) {
                try {
                    // Esconder spinner do botão
                    if (spinner) spinner.classList.add("d-none");
                    if (btnText) btnText.textContent = "Ajustar Viagem";
                    btnAjustar.disabled = false;

                    if (res.success) {
                        // Fechar modal de ajustes
                        if (modalAjustaCustos) {
                            modalAjustaCustos.hide();
                        }

                        // Mostrar loading enquanto atualiza DataTable
                        mostrarLoading("Atualizando dados...");

                        // Recarregar DataTable com callback para esconder loading
                        $("#tblViagem").DataTable().ajax.reload(function () {
                            esconderLoading();
                            AppToast.show("Verde", "Viagem atualizada com sucesso!", 3000);
                        }, false);
                    } else {
                        AppToast.show("Vermelho", res.message || "Erro ao atualizar viagem", 4000);
                    }
                }
                catch (error) {
                    Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "gravarViagem.success", error);
                }
            },
            error: function (xhr, status, error) {
                // Esconder spinner
                const btnAjustar = document.getElementById("btnAjustarViagem");
                const spinner = btnAjustar.querySelector(".spinner-border");
                const btnText = btnAjustar.querySelector(".btn-text");
                if (spinner) spinner.classList.add("d-none");
                if (btnText) btnText.textContent = "Ajustar Viagem";
                btnAjustar.disabled = false;

                AppToast.show("Vermelho", "Erro ao gravar: " + error, 4000);
                Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "gravarViagem.error", error);
            }
        });
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "gravarViagem", error);
    }
}

// ============================================================
// HELPERS PARA NUMERIC TEXTBOX
// ============================================================
function setNumericValue(elementId, value) {
    try {
        const element = document.getElementById(elementId);
        if (element && element.ej2_instances) {
            element.ej2_instances[0].value = value || 0;
        }
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "setNumericValue", error);
    }
}

function getNumericValue(elementId) {
    try {
        const element = document.getElementById(elementId);
        if (element && element.ej2_instances) {
            return element.ej2_instances[0].value || 0;
        }
        return 0;
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "getNumericValue", error);
        return 0;
    }
}

// Formata data DD/MM/YYYY para YYYY-MM-DD (formato input date)
function formatarDataParaInput(dataStr) {
    try {
        if (!dataStr) return "";
        
        // Se já está no formato YYYY-MM-DD, retorna direto
        if (dataStr.includes("-") && dataStr.length === 10) {
            return dataStr;
        }
        
        // Se está no formato DD/MM/YYYY
        if (dataStr.includes("/")) {
            const partes = dataStr.split("/");
            if (partes.length === 3) {
                return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            }
        }
        
        return dataStr;
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "formatarDataParaInput", error);
        return "";
    }
}

// ============================================================
// DATATABLE - INICIALIZAÇÃO
// ============================================================
function initDataTable() {
    try {
        // Mostrar loading antes de iniciar
        mostrarLoading("Carregando Dados de Viagens...");

        $("#tblViagem").DataTable({
            processing: false,
            serverSide: false,
            paging: true,
            searching: true,
            ordering: true,
            order: [[1, "desc"]],
            ajax: {
                url: "/api/custosviagem",
                type: "GET",
                dataSrc: function (json) {
                    try {
                        // Esconder loading após carregar dados
                        esconderLoading();
                        return json.data || [];
                    }
                    catch (error) {
                        esconderLoading();
                        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "ajax.dataSrc", error);
                        return [];
                    }
                },
                error: function (xhr, status, error) {
                    esconderLoading();
                    Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "ajax.error", error);
                }
            },
            columns: [
                { data: "noFichaVistoria" },
                { data: "dataInicial" },
                { data: "dataFinal" },
                { data: "horaInicio" },
                { data: "horaFim" },
                { data: "finalidade" },
                { data: "nomeMotorista" },
                { data: "descricaoVeiculo" },
                {
                    data: "kmInicial",
                    render: function (data) {
                        try {
                            return data ? data.toLocaleString("pt-BR") : "-";
                        }
                        catch (error) {
                            Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "render.kmInicial", error);
                            return "-";
                        }
                    }
                },
                {
                    data: "kmFinal",
                    render: function (data) {
                        try {
                            return data ? data.toLocaleString("pt-BR") : "-";
                        }
                        catch (error) {
                            Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "render.kmFinal", error);
                            return "-";
                        }
                    }
                },
                // COLUNA AÇÃO - Botões padrão FrotiX
                {
                    data: "viagemId",
                    orderable: false,
                    searchable: false,
                    className: "ftx-actions text-center",
                    render: function (data, type, row, meta) {
                        try {
                            return `<div class="d-flex justify-content-center gap-1">
                                <button type="button" class="btn btn-icon-28 btn-azul"
                                    data-bs-toggle="modal" data-bs-target="#modalAjustaCustos"
                                    data-id="${data}"
                                    aria-label="Editar Dados" data-microtip-position="top" role="tooltip">
                                    <i class="fa-duotone fa-pen-to-square"></i>
                                </button>
                                <button type="button" class="btn btn-icon-28 btn-fundo-laranja"
                                    data-bs-toggle="modal" data-bs-target="#modalFicha"
                                    data-id="${data}"
                                    aria-label="Ver Ficha de Vistoria" data-microtip-position="top" role="tooltip">
                                    <i class="fa-duotone fa-file-image"></i>
                                </button>
                            </div>`;
                        }
                        catch (error) {
                            Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "columns.render.acao", error);
                            return "";
                        }
                    }
                },
                // Coluna oculta (row number)
                {
                    data: "viagemId",
                    visible: false,
                    render: function (data, type, row, meta) {
                        try {
                            return meta.row + meta.settings._iDisplayStart + 1;
                        }
                        catch (error) {
                            Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "columns.render.rowNumber", error);
                            return "";
                        }
                    }
                }
            ],
            language: {
                emptyTable: "Nenhum registro encontrado",
                info: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 até 0 de 0 registros",
                infoFiltered: "(Filtrados de _MAX_ registros)",
                infoThousands: ".",
                lengthMenu: "_MENU_ resultados por página",
                loadingRecords: "Carregando...",
                processing: "Processando...",
                search: "Pesquisar:",
                zeroRecords: "Nenhum registro encontrado",
                paginate: {
                    first: "Primeiro",
                    last: "Último",
                    next: "Próximo",
                    previous: "Anterior"
                }
            },
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
            responsive: true
        });
    }
    catch (error) {
        Alerta.TratamentoErroComLinha("atualizacustosviagem.js", "initDataTable", error);
    }
}
