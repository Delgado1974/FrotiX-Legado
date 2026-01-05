/* global $, DTBetterErrors, Alerta */

// ====================================================================
// FUNÇÕES DE LOADING - OVERLAY PADRÃO FROTIX
// ====================================================================
function mostrarLoadingAutuacao()
{
    try
    {
        const overlay = document.getElementById('loadingOverlayAutuacao');
        if (overlay)
        {
            overlay.style.display = 'flex';
        }
    }
    catch (error)
    {
        try { Alerta.TratamentoErroComLinha("listaautuacao.js", "mostrarLoadingAutuacao", error); } catch (_) { }
    }
}

function esconderLoadingAutuacao()
{
    try
    {
        const overlay = document.getElementById('loadingOverlayAutuacao');
        if (overlay)
        {
            overlay.style.display = 'none';
        }
    }
    catch (error)
    {
        try { Alerta.TratamentoErroComLinha("listaautuacao.js", "esconderLoadingAutuacao", error); } catch (_) { }
    }
}

// Inicialização
$(document).ready(function ()
{
    try
    {
        ListaTodasNotificacoes();
    } catch (error)
    {
        try { Alerta.TratamentoErroComLinha("listaautuacao.js", "document.ready", error); } catch (_) { }
    }
});

function ListaTodasNotificacoes()
{
    try
    {
        // ✅ Mostrar overlay de loading FrotiX
        mostrarLoadingAutuacao();

        // ===== Coleta filtros =====
        const veiculos = document.getElementById('lstVeiculos')?.ej2_instances?.[0];
        const tipos = document.getElementById('lstTiposMulta')?.ej2_instances?.[0];
        const motoristas = document.getElementById('lstMotorista')?.ej2_instances?.[0];
        const orgaos = document.getElementById('lstOrgao')?.ej2_instances?.[0];
        const statusCb = document.getElementById('lstStatus')?.ej2_instances?.[0];

        const veiculoId = veiculos?.value ?? "";
        const tipoMultaId = (tipos?.value !== null && tipos?.value !== "") ? tipos.value : "";
        const motoristaId = motoristas?.value ?? "";
        const orgaoAutuanteId = orgaos?.value ?? "";
        const statusId = statusCb?.value ?? "";

        // ===== Erros melhores (fila + dedupe + logs) =====
        DTBetterErrors.setGlobalOptions({
            logToConsole: true,
            dedupeWindowMs: 3000
        });

        DTBetterErrors.enable('#tblMulta', {
            contexto: 'ListaMultas',
            origem: 'AJAX.DataTable',
            encaminharParaAlerta: true,
            preferEnriquecido: true,
            showModal: true,
            previewLimit: 1200
        });

        // ===== Guard: se já existe uma DataTable, destrói antes de recriar =====
        if ($.fn.DataTable.isDataTable('#tblMulta'))
        {
            try
            {
                $('#tblMulta').DataTable().clear().destroy();
            } catch (_) { }
            $('#tblMulta tbody').empty();
        }

        // === DataTable ===
        let dataTableMultas = $('#tblMulta').DataTable({
            autoWidth: false,
            dom: 'Bfrtip',
            lengthMenu: [[10, 25, 50, -1], ['10 linhas', '25 linhas', '50 linhas', 'Todas as Linhas']],
            buttons: [
                'pageLength',
                'excel',
                { extend: 'pdfHtml5', orientation: 'landscape', pageSize: 'LEGAL' }
            ],
            order: [[1, 'desc']],
            responsive: true,
            deferRender: true,
            processing: true,

            columnDefs: [
                {
                    targets: 0, className: "text-center",
                    render: function (data, type, full)
                    {
                        return `
              <div class="text-center">
                <a aria-label="&#9762; (${full.observacao})"
                   data-microtip-position="right" role="tooltip"
                   data-microtip-size="medium" style="cursor:pointer;"
                   data-id="${data}">
                   ${full.numInfracao}
                </a>
              </div>`;
                    }
                },
                { targets: 1, className: "text-center" },   // Data
                { targets: 2, className: "text-center" },   // Hora
                {
                    targets: 3, className: "text-left", width: "12%",
                    render: function (data, type, full)
                    {
                        return `
              <div class="text-center">
                <a aria-label="&#128241; (${full.telefone})"
                   data-microtip-position="top" role="tooltip"
                   style="cursor:pointer;" data-id="${data}">
                   ${full.nome}
                </a>
              </div>`;
                    }
                },
                { targets: 4, className: "text-center" },   // Veículo
                { targets: 5, className: "text-left" },     // Órgão
                {
                    targets: 6, className: "text-left",
                    render: function (data, type, full)
                    {
                        return `
              <div class="text-center">
                <a aria-label="&#9940; (${full.descricao})"
                   data-microtip-position="top" role="tooltip"
                   data-microtip-size="medium" style="cursor:pointer;"
                   data-id="${data}">
                   ${full.artigo}
                </a>
              </div>`;
                    }
                },
                { targets: 7, className: "text-left", width: "16%" }, // Local
                { targets: 8, className: "text-center" },             // Dt Reconhecimento
                { targets: 9, className: "text-right" },              // Até Vencimento
                { targets: 10, className: "text-right" },             // Pós Vencimento
                {
                    // ====== BADGES DE STATUS FrotiX COM ÍCONES ======
                    targets: 11, className: "text-center", width: "10%",
                    render: function (data, type, full)
                    {
                        let badgeClass = 'ftx-badge-default';
                        let iconClass = 'fa-circle-question';

                        if (data === 'Notificado')
                        {
                            badgeClass = 'ftx-badge-notificado';
                            iconClass = 'fa-bell';
                        }
                        else if (data === 'Reconhecido')
                        {
                            badgeClass = 'ftx-badge-reconhecido';
                            iconClass = 'fa-circle-check';
                        }
                        else if (data === 'Pendente')
                        {
                            badgeClass = 'ftx-badge-pendente';
                            iconClass = 'fa-clock';
                        }
                        else if (data === 'Pago')
                        {
                            badgeClass = 'ftx-badge-pago';
                            iconClass = 'fa-money-bill-wave';
                        }

                        return `<span class="ftx-badge-status ${badgeClass}">
                                    <i class="fa-solid ${iconClass}"></i>
                                    ${data || '-'}
                                </span>`;
                    }
                },
                {
                    // ====== BOTÕES DE AÇÃO FrotiX ======
                    targets: 12, className: "text-center", width: "15%",
                    render: function (data, type, full)
                    {
                        // Verifica se tem PDF de autuação informado
                        const temPDF = full.autuacaoPDF && full.autuacaoPDF !== '';

                        // Botão Exibir PDF - desabilitado se não foi informado
                        const btnExibirPDF = temPDF
                            ? `<a class="ftx-btn-icon ftx-btn-pdf btn-exibe-autuacao"
                                   data-id="${data}" 
                                   data-autuacaopdf="${full.autuacaoPDF}"
                                   data-ejtip="Visualizar Notificação de Autuação">
                                   <i class="fa-duotone fa-file-pdf"></i>
                               </a>`
                            : `<a class="ftx-btn-icon ftx-btn-pdf-disabled"
                                   data-ejtip="PDF não informado na gravação"
                                   aria-disabled="true">
                                   <i class="fa-duotone fa-file-pdf"></i>
                               </a>`;

                        return `
              <div class="text-center" style="display:flex; justify-content:center; align-items:center; gap:3px; flex-wrap:nowrap;">
                <a href="/Multa/UpsertAutuacao?id=${data}"
                   class="ftx-btn-icon ftx-btn-editar"
                   data-ejtip="Editar a Autuação">
                   <i class="fa-duotone fa-pen-to-square"></i>
                </a>
                <a class="ftx-btn-icon ftx-btn-status btn-status"
                   data-ejtip="Altera Status (${full.status})"
                   data-id="${data}">
                   <i class="fa-duotone fa-bolt"></i>
                </a>
                <a class="ftx-btn-icon ftx-btn-penalidade btn-pagamento"
                   data-ejtip="Transformar em Penalidade"
                   data-id="${data}">
                   <i class="fa-duotone fa-rotate-exclamation"></i>
                </a>
                <a class="ftx-btn-icon ftx-btn-apagar btn-apagar"
                   data-ejtip="Apagar a Autuação"
                   data-id="${data}">
                   <i class="fa-duotone fa-trash-can"></i>
                </a>
                ${btnExibirPDF}
              </div>`;
                    }
                }
            ],

            ajax: {
                url: "/api/multa/ListaMultas",
                type: "GET",
                data: {
                    fase: "Autuação",
                    veiculo: veiculoId,
                    orgao: orgaoAutuanteId,
                    motorista: motoristaId,
                    infracao: tipoMultaId,
                    status: statusId
                },
                datatype: "json",
                error: function (xhr, error, thrown)
                {
                    try
                    {
                        esconderLoadingAutuacao();
                        console.error('Erro ao carregar autuações:', error, thrown);
                    }
                    catch (e)
                    {
                        try { Alerta.TratamentoErroComLinha("listaautuacao.js", "ajax.error", e); } catch (_) { }
                    }
                }
            },
            columns: [
                { data: "numInfracao" }, { data: "data" }, { data: "hora" }, { data: "nome" },
                { data: "placa" }, { data: "sigla" }, { data: "artigo" }, { data: "localizacao" },
                { data: "vencimento" }, { data: "valorAteVencimento" }, { data: "valorPosVencimento" },
                { data: "status" }, { data: "multaId" }
            ],

            language: {
                emptyTable: "Nenhum registro encontrado",
                info: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 até 0 de 0 registros",
                infoFiltered: "(Filtrados de _MAX_ registros)",
                infoThousands: ".",
                loadingRecords: "Carregando...",
                processing: "Processando...",
                zeroRecords: "Nenhum registro encontrado",
                search: "Pesquisar",
                paginate: { next: "Próximo", previous: "Anterior", first: "Primeiro", last: "Último" },
                aria: { sortAscending: ": Ordenar colunas de forma ascendente", sortDescending: ": Ordenar colunas de forma descendente" },
                select: { rows: { "_": "Selecionado %d linhas", "1": "Selecionado 1 linha" } },
                buttons: {
                    copySuccess: { "1": "Uma linha copiada com sucesso", "_": "%d linhas copiadas com sucesso" },
                    collection: "Coleção  <span class=\"ui-button-icon-primary ui-icon ui-icon-triangle-1-s\"></span>",
                    colvis: "Visibilidade da Coluna", colvisRestore: "Restaurar Visibilidade", copy: "Copiar",
                    copyKeys: "Pressione ctrl ou ⌘ + C para copiar os dados da tabela. Para cancelar, clique nesta mensagem ou pressione Esc.",
                    copyTitle: "Copiar para a Área de Transferência", csv: "CSV", excel: "Excel",
                    pageLength: { "-1": "Mostrar todos os registros", "_": "Mostrar %d registros" },
                    pdf: "PDF", print: "Imprimir"
                },
                lengthMenu: "Exibir _MENU_ resultados por página",
                thousands: ".",
                decimal: ","
            },
            drawCallback: function (settings)
            {
                try
                {
                    // ✅ Esconder overlay de loading FrotiX
                    esconderLoadingAutuacao();

                    if (window.FTXTooltip)
                    {
                        window.FTXTooltip.refresh();
                    }
                } catch (error)
                {
                    try { Alerta.TratamentoErroComLinha("listaautuacao.js", "drawCallback", error); } catch (_) { }
                }
            },
            initComplete: function (settings, json)
            {
                try
                {
                    // ✅ Esconder overlay de loading FrotiX após inicialização completa
                    esconderLoadingAutuacao();
                } catch (error)
                {
                    try { Alerta.TratamentoErroComLinha("listaautuacao.js", "initComplete", error); } catch (_) { }
                }
            }
        });
    } catch (error)
    {
        // ✅ Esconder loading em caso de erro
        esconderLoadingAutuacao();
        try { Alerta.TratamentoErroComLinha("listaautuacao.js", "ListaTodasNotificacoes", error); } catch (_) { }
    }
}

// ===== EVENT HANDLERS PARA BOTÕES DINÂMICOS DA DATATABLE =====

// Botão Alterar Status - Event Delegation
$(document).on('click', '.btn-status', function (e)
{
    try
    {
        e.preventDefault();
        const multaId = $(this).data('id');
        $('#txtIdStatus').val(multaId);

        // Carrega o status atual
        $.ajax({
            type: "get",
            url: "/api/Multa/PegaStatus",
            data: { Id: multaId },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data)
            {
                try
                {
                    const { numInfracao, data: dataAutuacao, hora, nome, status } = data;

                    // Preenche os campos de informação
                    $("#txtNumInfracaoStatus").html(numInfracao || '-');
                    $("#txtDataStatus").html(dataAutuacao || '-');
                    $("#txtHoraStatus").html(hora || '-');
                    $("#txtMotoristaStatus").html(nome || '-');
                    $("#txtStatusAtual").html(status || '-');

                    // Define o status atual no dropdown
                    const lstStatus = document.getElementById('lstStatusAlterado')?.ej2_instances?.[0];
                    if (lstStatus)
                    {
                        lstStatus.value = status;
                    }

                    // Abre o modal
                    $('#modalAlteraStatus').modal('show');
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha("listaautuacao.js", "btn-status.success", error);
                }
            },
            error: function (data)
            {
                Alerta.Erro('Erro', 'Erro ao recuperar status', 'OK');
                console.log(data);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("listaautuacao.js", "btn-status.click", error);
    }
});

// Botão Transformar em Penalidade - Event Delegation
$(document).on('click', '.btn-pagamento', function (e)
{
    try
    {
        e.preventDefault();
        const multaId = $(this).data('id');

        // ✅ CRÍTICO: Define o ID ANTES de abrir o modal
        $('#txtId').val(multaId);
        console.log('✅ txtId definido como:', multaId);

        // Carrega dados da multa
        $.ajax({
            type: "get",
            url: "/api/Multa/PegaObservacao",
            data: { Id: multaId },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data)
            {
                try
                {
                    const { nomeMotorista, numInfracao, observacao } = data;

                    // Preenche o RTE se existir
                    const rte = document.getElementById('rte')?.ej2_instances?.[0];
                    if (rte)
                    {
                        rte.value = observacao || "";
                    }

                    // Atualiza título do modal
                    $("#h3Titulo").html(`<i class="fa-duotone fa-money-bill-transfer me-2"></i>Transformar em Penalidade a Autuação nº ${numInfracao} de ${nomeMotorista}`);

                    // Abre o modal
                    $('#modalTransformaPenalidade').modal('show');
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha("listaautuacao.js", "btn-pagamento.success", error);
                }
            },
            error: function (data)
            {
                Alerta.Erro('Erro', 'Erro ao carregar dados da multa', 'OK');
                console.log(data);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("listaautuacao.js", "btn-pagamento.click", error);
    }
});

// Botão Apagar - Event Delegation
$(document).on('click', '.btn-apagar', function (e)
{
    try
    {
        e.preventDefault();
        const id = $(this).data('id');

        Alerta.Confirmar(
            "Você tem certeza que deseja apagar esta Autuação?",
            "Não será possível recuperar os dados eliminados!",
            "Excluir",
            "Cancelar"
        ).then(function (confirmed)
        {
            try
            {
                if (!confirmed) return;

                $.ajax({
                    url: '/api/Multa/Delete',
                    type: "POST",
                    data: JSON.stringify({ MultaId: id }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data)
                    {
                        try
                        {
                            if (data.success)
                            {
                                AppToast.show('Verde', data.message, 2000);
                                ListaTodasNotificacoes();
                            }
                            else
                            {
                                AppToast.show('Vermelho', data.message, 3000);
                            }
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("listaautuacao.js", "btn-apagar.success", error);
                        }
                    },
                    error: function (err)
                    {
                        try
                        {
                            console.log(err);
                            Alerta.Erro('Erro', 'Ocorreu um problema ao apagar.', 'OK');
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("listaautuacao.js", "btn-apagar.error", error);
                        }
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("listaautuacao.js", "btn-apagar.confirmar", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("listaautuacao.js", "btn-apagar.click", error);
    }
});

// ====================================================================
// EVENT HANDLER: BOTÃO EXIBIR NOTIFICAÇÃO DE AUTUAÇÃO
// ====================================================================
$(document).on('click', '.btn-exibe-autuacao', function (e)
{
    try
    {
        e.preventDefault();

        const autuacaoPDF = $(this).data('autuacaopdf');
        const multaId = $(this).data('id');

        console.log('🔍 Clique em btn-exibe-autuacao, autuacaoPDF:', autuacaoPDF);

        if (!autuacaoPDF || autuacaoPDF === '')
        {
            AppToast.show('Amarelo', 'PDF não informado na gravação desta autuação', 3000);
            return;
        }

        // ✅ VERIFICA SE O ARQUIVO EXISTE NO SERVIDOR ANTES DE ABRIR
        $.ajax({
            type: "GET",
            url: "/api/Multa/VerificaPDFExiste",
            data: { nomeArquivo: autuacaoPDF },
            dataType: "json",
            success: function (data)
            {
                try
                {
                    if (data.success && data.existe)
                    {
                        exibirPDFAutuacao(autuacaoPDF);
                    }
                    else
                    {
                        AppToast.show('Vermelho', 'Arquivo PDF não encontrado no servidor. O arquivo pode ter sido removido ou movido.', 4000);
                        console.warn('⚠️ Arquivo não encontrado:', autuacaoPDF);
                    }
                }
                catch (innerError)
                {
                    Alerta.TratamentoErroComLinha("listaautuacao.js", "btn-exibe-autuacao.verificaPDF.success", innerError);
                }
            },
            error: function (xhr, status, error)
            {
                console.warn('⚠️ Erro ao verificar existência do PDF, tentando abrir:', error);
                exibirPDFAutuacao(autuacaoPDF);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("listaautuacao.js", "btn-exibe-autuacao.click", error);
    }
});

// ====================================================================
// FUNÇÃO: EXIBIR PDF DE AUTUAÇÃO NO MODAL
// ====================================================================
function exibirPDFAutuacao(nomeArquivo)
{
    try
    {
        if (!nomeArquivo || nomeArquivo === '')
        {
            console.error('Nome do arquivo PDF inválido');
            return;
        }

        $('#modalExibePDF').modal('show');

        setTimeout(function ()
        {
            try
            {
                const viewerElement = document.getElementById('pdfViewerAutuacaoControl');
                if (!viewerElement)
                {
                    console.error('PDF Viewer de Autuação não encontrado');
                    return;
                }

                const pdfViewer = viewerElement.ej2_instances?.[0];
                if (!pdfViewer)
                {
                    console.error('Instância do PDF Viewer não encontrada');
                    return;
                }

                pdfViewer.documentLoadFailed = function (args)
                {
                    try
                    {
                        console.error('❌ Falha ao carregar PDF:', args);
                        $('#modalExibePDF').modal('hide');
                        AppToast.show('Vermelho', 'Arquivo PDF não encontrado no servidor ou corrompido', 4000);
                    }
                    catch (err)
                    {
                        console.error('Erro no handler documentLoadFailed:', err);
                    }
                };

                pdfViewer.documentLoad = function ()
                {
                    try
                    {
                        setTimeout(function ()
                        {
                            pdfViewer.magnificationModule.fitToWidth();
                            console.log('✅ Zoom ajustado para FitToWidth');
                        }, 100);
                    } catch (err)
                    {
                        console.warn('⚠️ Não foi possível ajustar zoom automaticamente:', err);
                    }
                };

                pdfViewer.documentPath = nomeArquivo;
                pdfViewer.dataBind();
                pdfViewer.load(nomeArquivo, null);

                console.log('✅ PDF de Autuação carregado:', nomeArquivo);
            } catch (err)
            {
                console.error('❌ Erro ao carregar PDF:', err);
                Alerta.TratamentoErroComLinha("listaautuacao.js", "exibirPDFAutuacao.timeout", err);
            }
        }, 500);
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("listaautuacao.js", "exibirPDFAutuacao", error);
    }
}

// ====================================================================
// EVENT HANDLER: LIMPAR PDF AO FECHAR MODAL
// ====================================================================
$('#modalExibePDF').on('hidden.bs.modal', function ()
{
    try
    {
        const pdfViewer = document.getElementById('pdfViewerAutuacaoControl')?.ej2_instances?.[0];
        if (pdfViewer)
        {
            pdfViewer.unload();
        }
        console.log('✅ Modal Exibir PDF fechado e viewer limpo');
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("listaautuacao.js", "modalExibePDF.hidden", error);
    }
});
