/* ============================================================================
   ListaManutencao.js — Ajuste Visual FrotiX
   ============================================================================ */

/* =========================
   Bloco: Lista da Manutenção
   ========================= */
var URLapi = "";
var IDapi = "";

/* =========================
   Bloco: Overlay de Loading - Padrao FrotiX
   ========================= */
function mostrarLoadingManutencao()
{
    try
    {
        var overlay = document.getElementById('loadingOverlayManutencao');
        if (overlay)
        {
            overlay.style.display = 'flex';
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "mostrarLoadingManutencao", error);
    }
}

function esconderLoadingManutencao()
{
    try
    {
        var overlay = document.getElementById('loadingOverlayManutencao');
        if (overlay)
        {
            overlay.style.display = 'none';
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "esconderLoadingManutencao", error);
    }
}

document.addEventListener('DOMContentLoaded', function ()
{
    try
    {
        // remove bootstrap tooltips para evitar conflito visual
        var els = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        els.forEach(function (el)
        {
            try
            {
                var inst = window.bootstrap?.Tooltip?.getInstance?.(el);
                inst?.dispose?.();
            } catch (_) { }
            el.removeAttribute('data-bs-toggle');
            if (!el.hasAttribute('data-ejtip') && el.getAttribute('title'))
            {
                el.setAttribute('data-ejtip', el.getAttribute('title'));
                el.removeAttribute('title');
            }
        });

        // Carrega automaticamente as OSs Abertas ao iniciar
        carregaManutencaoInicial();

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "DOMContentLoaded", error);
    }
});

/**
 * Carrega a tabela com OSs Abertas ao iniciar a página
 */
function carregaManutencaoInicial()
{
    try
    {
        // Mostra loading antes de carregar
        mostrarLoadingManutencao();

        // Registra formatos de data
        if ($.fn.dataTable && $.fn.dataTable.moment)
        {
            $.fn.dataTable.moment("DD/MM/YYYY");
        }

        // Inicializa o DataTable com status Aberta
        $("#tblManutencao").DataTable({
            autoWidth: false,
            dom: "Bfrtip",
            lengthMenu: [[10, 25, 50, -1], ["10 linhas", "25 linhas", "50 linhas", "Todas as Linhas"]],
            buttons: ["pageLength", "excel", { extend: "pdfHtml5", orientation: "landscape", pageSize: "LEGAL" }],
            order: [[2, "desc"]],
            columnDefs: [
                { targets: 0, className: "text-center", width: "8%" },
                { targets: 1, className: "text-left", width: "15%" },
                { targets: 2, className: "text-center", width: "7%" },
                { targets: 3, className: "text-center", width: "7%" },
                { targets: 4, className: "text-center", width: "7%" },
                { targets: 5, className: "text-center", width: "7%" },
                { targets: 6, className: "text-center", width: "4%" },
                { targets: 7, className: "text-center", width: "5%" },
                { targets: 8, className: "text-left", width: "20%" },
                { targets: 9, className: "text-center", width: "8%" },
                { targets: 10, className: "text-center", width: "10%" }
            ],
            responsive: true,
            ajax: {
                url: "/api/Manutencao/",
                type: "GET",
                dataType: "json",
                data: {
                    veiculoId: "",
                    statusId: "Aberta",  // Status padrão: Abertas
                    mes: "",
                    ano: "",
                    dataInicial: "",
                    dataFinal: ""
                },
                error: function (xhr, error, thrown)
                {
                    esconderLoadingManutencao();
                    Alerta.TratamentoErroComLinha("ListaManutencao.js", "ajax.error@carregaManutencaoInicial", thrown);
                }
            },
            initComplete: function ()
            {
                esconderLoadingManutencao();
            },
            columns: [
                { data: "numOS" },
                { data: "descricaoVeiculo" },
                { data: "dataSolicitacao" },
                { data: "dataEntrega" },
                { data: "dataRecolhimento" },
                { data: "dataDevolucao" },
                { data: "dias" },
                { data: "reserva" },
                { data: "resumoOS" },
                {
                    data: "statusOS",
                    render: function (d)
                    {
                        try
                        {
                            const v = (d || "").trim();
                            if (v === "Aberta")
                            {
                                return '<span class="ftx-manut-badge ftx-manut-badge-aberta"><i class="fa-solid fa-circle-check"></i> Aberta</span>';
                            }
                            if (v === "Cancelada")
                            {
                                return '<span class="ftx-manut-badge ftx-manut-badge-cancelada"><i class="fa-solid fa-xmark"></i> Cancelada</span>';
                            }
                            return '<span class="ftx-manut-badge ftx-manut-badge-fechada"><i class="fa-solid fa-lock"></i> Fechada/Baixada</span>';
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ListaManutencao.js", "render@statusOS@init", error);
                            return "";
                        }
                    }
                },
                {
                    data: "manutencaoId",
                    render: function (data, type, full)
                    {
                        try
                        {
                            const status = (full.statusOS || "").trim();
                            const isClosed = status === "Fechada" || status === "Cancelada";

                            const tooltipEditar = isClosed ? "Visualizar OS" : "Editar OS";
                            const tooltipBaixar = isClosed ? "Desabilitado" : "Baixar OS";
                            const tooltipCancelar = status === "Cancelada" ? "OS Cancelada"
                                : status === "Fechada" ? "OS Fechada"
                                    : "Cancelar OS";

                            const disabledAttr = isClosed ? 'aria-disabled="true"' : '';
                            const iconEditar = isClosed ? "fa-duotone fa-eye" : "fa-duotone fa-pen-to-square";
                            const iconBaixar = isClosed ? "fa-duotone fa-lock" : "fa-duotone fa-flag-checkered";

                            return `
                                <div class="text-center">
                                    <a href="/Manutencao/Upsert?id=${data}"
                                       class="ftx-manut-btn-icon ftx-manut-btn-editar"
                                       data-ejtip="${tooltipEditar}"
                                       data-id="${data}">
                                        <i class="${iconEditar}" style="--fa-primary-color: #fff; --fa-secondary-color: #d0e8f0; --fa-secondary-opacity: 0.8;"></i>
                                    </a>
                                    <a class="ftx-manut-btn-icon ftx-manut-btn-baixar btn-baixar"
                                       data-ejtip="${tooltipBaixar}"
                                       ${disabledAttr}
                                       
                                       data-id="${data}">
                                        <i class="${iconBaixar}" style="--fa-primary-color: #fff; --fa-secondary-color: #ffe8d0; --fa-secondary-opacity: 0.8;"></i>
                                    </a>
                                    <a class="ftx-manut-btn-icon ftx-manut-btn-cancelar btn-deletemanutencao"
                                       data-ejtip="${tooltipCancelar}"
                                       ${disabledAttr}
                                       data-id="${data}">
                                        <i class="fa-duotone fa-ban" style="--fa-primary-color: #fff; --fa-secondary-color: #ffebee; --fa-secondary-opacity: 0.8;"></i>
                                    </a>
                                </div>`;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ListaManutencao.js", "render@manutencaoId@init", error);
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
                loadingRecords: "Carregando...",
                processing: "Processando...",
                zeroRecords: "Nenhum registro encontrado",
                search: "Pesquisar",
                paginate: {
                    next: "Próximo", previous: "Anterior", first: "Primeiro", last: "Último"
                },
                aria: {
                    sortAscending: ": Ordenar colunas de forma ascendente",
                    sortDescending: ": Ordenar colunas de forma descendente"
                },
                buttons: {
                    copySuccess: { 1: "Uma linha copiada com sucesso", _: "%d linhas copiadas com sucesso" },
                    colvis: "Visibilidade da Coluna",
                    copy: "Copiar",
                    csv: "CSV",
                    excel: "Excel",
                    pageLength: { "-1": "Mostrar todos os registros", _: "Mostrar %d registros" },
                    pdf: "PDF",
                    print: "Imprimir"
                },
                lengthMenu: "Exibir _MENU_ resultados por página",
                thousands: ".",
                decimal: ","
            },
            width: "100%"
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "carregaManutencaoInicial", error);
    }
}

/* ==========================================
   Bloco: Aplicar Filtros (Mês/Ano + Veículo + Status) — grid
   ========================================== */
$("#btnDatas").click(function ()
{
    try
    {
        // Mês/Ano
        let Mes = $("#lstMes").val();
        let Ano = $("#lstAno").val();

        // Período (dd/MM/yyyy) — só vale se ambos preenchidos
        let dataInicial = ($("#txtDataInicial").val() || "").trim();
        let dataFinal = ($("#txtDataFinal").val() || "").trim();

        const temIni = dataInicial.length > 0;
        const temFim = dataFinal.length > 0;

        if ((temIni && !temFim) || (!temIni && temFim))
        {
            Alerta.Erro("Informação Ausente", "Para filtrar por período, preencha Data Inicial e Data Final.", "Ok");
            return;
        }

        // Se período estiver preenchido, ignoramos Mês/Ano nesta chamada
        if (temIni && temFim)
        {
            Mes = "";
            Ano = "";
        } else
        {
            if ((Mes && !Ano) || (!Mes && Ano))
            {
                Alerta.Erro("Informação Ausente", "Informe Mês e Ano (ou use Período com as duas datas).", "Ok");
                return;
            }
        }

        // Veículo
        let veiculoId = "";
        const veiculosCombo = document.getElementById("lstVeiculos");
        if (veiculosCombo?.ej2_instances?.length > 0)
        {
            const combo = veiculosCombo.ej2_instances[0];
            if (combo.value) veiculoId = combo.value;
        }

        // Status (padrão: Aberta; se houver outros filtros e vier vazio => Todas)
        let statusId = "Aberta";
        const statusCombo = document.getElementById("lstStatus");
        if (statusCombo?.ej2_instances?.length > 0)
        {
            const st = statusCombo.ej2_instances[0];
            if (st.value === "" || st.value === null)
            {
                if (veiculoId || (Mes && Ano) || (temIni && temFim)) statusId = "Todas";
            } else statusId = st.value;
        }

        // Moment para ordenar datas no DataTable
        if ($.fn.dataTable && $.fn.dataTable.moment)
        {
            $.fn.dataTable.moment("DD/MM/YYYY");
        }

        // Mostra loading antes de carregar
        mostrarLoadingManutencao();

        // Recria o DataTable
        var dt = $("#tblManutencao").DataTable();
        dt.destroy();
        $("#tblManutencao tbody").empty();

        $("#tblManutencao").DataTable({
            autoWidth: false,
            dom: "Bfrtip",
            lengthMenu: [[10, 25, 50, -1], ["10 linhas", "25 linhas", "50 linhas", "Todas as Linhas"]],
            buttons: ["pageLength", "excel", { extend: "pdfHtml5", orientation: "landscape", pageSize: "LEGAL" }],
            order: [[2, "desc"]],
            columnDefs: [
                { targets: 0, className: "text-center", width: "8%" },
                { targets: 1, className: "text-left", width: "15%" },
                { targets: 2, className: "text-center", width: "7%" },
                { targets: 3, className: "text-center", width: "7%" },
                { targets: 4, className: "text-center", width: "7%" },
                { targets: 5, className: "text-center", width: "7%" },
                { targets: 6, className: "text-center", width: "4%" },
                { targets: 7, className: "text-center", width: "5%" },
                { targets: 8, className: "text-left", width: "20%" },
                { targets: 9, className: "text-center", width: "8%" },
                { targets: 10, className: "text-center", width: "10%" }
            ],
            responsive: true,
            ajax: {
                url: "/api/Manutencao/",
                type: "GET",
                dataType: "json",
                data: {
                    veiculoId: veiculoId,
                    statusId: statusId,
                    mes: Mes || "",
                    ano: Ano || "",
                    dataInicial: temIni && temFim ? dataInicial : "",
                    dataFinal: temIni && temFim ? dataFinal : ""
                },
                error: function (xhr, error, thrown)
                {
                    esconderLoadingManutencao();
                    Alerta.TratamentoErroComLinha("ListaManutencao.js", "ajax.error@btnDatas", thrown);
                }
            },
            initComplete: function ()
            {
                esconderLoadingManutencao();
            },
            columns: [
                { data: "numOS" },
                { data: "descricaoVeiculo" },
                { data: "dataSolicitacao" },
                { data: "dataEntrega" },
                { data: "dataRecolhimento" },
                { data: "dataDevolucao" },
                { data: "dias" },
                { data: "reserva" },
                { data: "resumoOS" },
                {
                    data: "statusOS",
                    render: function (d)
                    {
                        try
                        {
                            const v = (d || "").trim();
                            if (v === "Aberta")
                            {
                                return '<span class="ftx-manut-badge ftx-manut-badge-aberta"><i class="fa-solid fa-circle-check"></i> Aberta</span>';
                            }
                            if (v === "Cancelada")
                            {
                                return '<span class="ftx-manut-badge ftx-manut-badge-cancelada"><i class="fa-solid fa-xmark"></i> Cancelada</span>';
                            }
                            return '<span class="ftx-manut-badge ftx-manut-badge-fechada"><i class="fa-solid fa-lock"></i> Fechada/Baixada</span>';
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ListaManutencao.js", "render@statusOS", error);
                            return "";
                        }
                    }
                },
                {
                    data: "manutencaoId",
                    render: function (data, type, full)
                    {
                        try
                        {
                            const status = (full.statusOS || "").trim();
                            const isClosed = status === "Fechada" || status === "Cancelada";

                            const tooltipEditar = isClosed ? "Visualizar OS" : "Editar OS";
                            const tooltipBaixar = isClosed ? "Desabilitado" : "Baixar OS";
                            const tooltipCancelar = status === "Cancelada" ? "OS Cancelada"
                                : status === "Fechada" ? "OS Fechada"
                                    : "Cancelar OS";

                            const disabledAttr = isClosed ? 'aria-disabled="true"' : '';
                            const iconEditar = isClosed ? "fa-duotone fa-eye" : "fa-duotone fa-pen-to-square";
                            const iconBaixar = isClosed ? "fa-duotone fa-lock" : "fa-duotone fa-flag-checkered";

                            return `
                                <div class="text-center">
                                    <a href="/Manutencao/Upsert?id=${data}"
                                       class="ftx-manut-btn-icon ftx-manut-btn-editar"
                                       data-ejtip="${tooltipEditar}"
                                       data-id="${data}">
                                        <i class="${iconEditar}" style="--fa-primary-color: #fff; --fa-secondary-color: #d0e8f0; --fa-secondary-opacity: 0.8;"></i>
                                    </a>
                                    <a class="ftx-manut-btn-icon ftx-manut-btn-baixar btn-baixar"
                                       data-ejtip="${tooltipBaixar}"
                                       ${disabledAttr}
                                       
                                       data-id="${data}">
                                        <i class="${iconBaixar}" style="--fa-primary-color: #fff; --fa-secondary-color: #ffe8d0; --fa-secondary-opacity: 0.8;"></i>
                                    </a>
                                    <a class="ftx-manut-btn-icon ftx-manut-btn-cancelar btn-deletemanutencao"
                                       data-ejtip="${tooltipCancelar}"
                                       ${disabledAttr}
                                       data-id="${data}">
                                        <i class="fa-duotone fa-ban" style="--fa-primary-color: #fff; --fa-secondary-color: #ffebee; --fa-secondary-opacity: 0.8;"></i>
                                    </a>
                                </div>`;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ListaManutencao.js", "render@manutencaoId", error);
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
                loadingRecords: "Carregando...",
                processing: "Processando...",
                zeroRecords: "Nenhum registro encontrado",
                search: "Pesquisar",
                paginate: {
                    next: "Próximo", previous: "Anterior", first: "Primeiro", last: "Último"
                },
                aria: {
                    sortAscending: ": Ordenar colunas de forma ascendente",
                    sortDescending: ": Ordenar colunas de forma descendente"
                },
                select: {
                    rows: { _: "Selecionado %d linhas", 1: "Selecionado 1 linha" },
                    cells: { 1: "1 célula selecionada", _: "%d células selecionadas" },
                    columns: { 1: "1 coluna selecionada", _: "%d colunas selecionadas" }
                },
                buttons: {
                    copySuccess: { 1: "Uma linha copiada com sucesso", _: "%d linhas copiadas com sucesso" },
                    collection: 'Coleção  <span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span>',
                    colvis: "Visibilidade da Coluna",
                    colvisRestore: "Restaurar Visibilidade",
                    copy: "Copiar",
                    copyKeys: "Pressione ctrl ou u2318 + C para copiar...",
                    copyTitle: "Copiar para a Área de Transferência",
                    csv: "CSV",
                    excel: "Excel",
                    pageLength: { "-1": "Mostrar todos os registros", _: "Mostrar %d registros" },
                    pdf: "PDF",
                    print: "Imprimir"
                },
                lengthMenu: "Exibir _MENU_ resultados por página",
                thousands: ".",
                decimal: ","
            },
            width: "100%"
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "btnDatas.click", error);
    }
});


/**
 * Monta/recarrega a grid principal de Manutenção
 */
function ListaTblManutencao(URLapi, IDapi)
{
    try
    {
        if ($.fn.dataTable && $.fn.dataTable.moment)
        {
            $.fn.dataTable.moment("DD/MM/YYYY");
            $.fn.dataTable.moment("DD/MM/YYYY HH:mm:ss");
            $.fn.dataTable.moment("DD/MM/YYYY HH:mm");
        }

        var dataTableManutencao = $("#tblManutencao").DataTable();
        dataTableManutencao.destroy();
        $("#tblManutencao tbody").empty();

        dataTableManutencao = $("#tblManutencao").DataTable({
            autoWidth: false,
            dom: "Bfrtip",
            lengthMenu: [
                [10, 25, 50, -1],
                ["10 linhas", "25 linhas", "50 linhas", "Todas as Linhas"]
            ],
            buttons: [
                "pageLength",
                "excel",
                { extend: "pdfHtml5", orientation: "landscape", pageSize: "LEGAL" }
            ],
            order: [[2, "desc"]],
            columnDefs: [
                { targets: 0, className: "text-center", width: "8%" },
                { targets: 1, className: "text-left", width: "15%" },
                { targets: 2, className: "text-center", width: "7%" },
                { targets: 3, className: "text-center", width: "7%" },
                { targets: 4, className: "text-center", width: "7%" },
                { targets: 5, className: "text-center", width: "7%" },
                { targets: 6, className: "text-center", width: "4%" },
                { targets: 7, className: "text-center", width: "5%" },
                { targets: 8, className: "text-left", width: "20%" },
                { targets: 9, className: "text-center", width: "8%" },
                { targets: 10, className: "text-center", width: "10%" }
            ],
            responsive: true,
            ajax: {
                url: URLapi,
                data: { id: IDapi },
                type: "GET",
                dataType: "json"
            },
            columns: [
                { data: "numOS" },
                { data: "placaDescricao" },
                { data: "dataSolicitacao" },
                { data: "dataDisponibilidade" },
                { data: "dataEntrega" },
                { data: "dataDevolucao" },
                { data: "dias" },
                { data: "reserva" },
                { data: "resumoOS" },
                {
                    data: "statusOS",
                    render: function (d)
                    {
                        try
                        {
                            const v = (d || "").trim();
                            if (v === "Aberta")
                            {
                                return '<span class="ftx-manut-badge ftx-manut-badge-aberta"><i class="fa-solid fa-circle-check"></i> Aberta</span>';
                            }
                            if (v === "Cancelada")
                            {
                                return '<span class="ftx-manut-badge ftx-manut-badge-cancelada"><i class="fa-solid fa-xmark"></i> Cancelada</span>';
                            }
                            return '<span class="ftx-manut-badge ftx-manut-badge-fechada"><i class="fa-solid fa-lock"></i> Fechada/Baixada</span>';
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ListaManutencao.js", "render@statusOS#2", error);
                            return "";
                        }
                    }
                },
                {
                    data: "manutencaoId",
                    render: function (data, type, full)
                    {
                        try
                        {
                            const status = (full.statusOS || full.StatusOS || "").trim();
                            const isClosed = status === "Fechada" || status === "Cancelada";

                            const tooltipEditar = isClosed ? "Visualizar OS" : "Editar OS";
                            const tooltipBaixar = isClosed ? "Desabilitado" : "Baixar OS";
                            const tooltipCancelar = status === "Cancelada" ? "OS Cancelada"
                                : status === "Fechada" ? "OS Fechada"
                                    : "Cancelar OS";

                            const disabledAttr = isClosed ? 'aria-disabled="true"' : '';
                            const iconEditar = isClosed ? "fa-duotone fa-eye" : "fa-duotone fa-pen-to-square";
                            const iconClass = isClosed ? "fa-duotone fa-lock" : "fa-duotone fa-flag-checkered";

                            return `
                                <div class="text-center">
                                    <a href="/Manutencao/Upsert?id=${data}"
                                       class="ftx-manut-btn-icon ftx-manut-btn-editar"
                                       data-ejtip="${tooltipEditar}"
                                       data-id="${data}">
                                        <i class="${iconEditar}" style="--fa-primary-color: #fff; --fa-secondary-color: #d0e8f0; --fa-secondary-opacity: 0.8;"></i>
                                    </a>
                                    <a class="ftx-manut-btn-icon ftx-manut-btn-baixar btn-baixar"
                                       data-ejtip="${tooltipBaixar}"
                                       ${disabledAttr}
                                       
                                       data-id="${data}">
                                        <i class="${iconClass}" style="--fa-primary-color: #fff; --fa-secondary-color: #ffe8d0; --fa-secondary-opacity: 0.8;"></i>
                                    </a>
                                    <a class="ftx-manut-btn-icon ftx-manut-btn-cancelar btn-deletemanutencao"
                                       data-ejtip="${tooltipCancelar}"
                                       ${disabledAttr}
                                       data-id="${data}">
                                        <i class="fa-duotone fa-ban" style="--fa-primary-color: #fff; --fa-secondary-color: #ffebee; --fa-secondary-opacity: 0.8;"></i>
                                    </a>
                                </div>`;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ListaManutencao.js", "render@manutencaoId#2", error);
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
                loadingRecords: "Carregando...",
                processing: "Processando...",
                zeroRecords: "Nenhum registro encontrado",
                search: "Pesquisar",
                paginate: {
                    next: "Próximo", previous: "Anterior", first: "Primeiro", last: "Último"
                },
                aria: {
                    sortAscending: ": Ordenar colunas de forma ascendente",
                    sortDescending: ": Ordenar colunas de forma descendente"
                },
                select: {
                    rows: { _: "Selecionado %d linhas", 1: "Selecionado 1 linha" },
                    cells: { 1: "1 célula selecionada", _: "%d células selecionadas" },
                    columns: { 1: "1 coluna selecionada", _: "%d colunas selecionadas" }
                },
                buttons: {
                    copySuccess: { 1: "Uma linha copiada com sucesso", _: "%d linhas copiadas com sucesso" },
                    collection: 'Coleção',
                    colvis: "Visibilidade da Coluna",
                    colvisRestore: "Restaurar Visibilidade",
                    copy: "Copiar",
                    copyKeys: "Pressione ctrl ou u2318 + C para copiar...",
                    copyTitle: "Copiar para a Área de Transferência",
                    csv: "CSV",
                    excel: "Excel",
                    pageLength: { "-1": "Mostrar todos os registros", _: "Mostrar %d registros" },
                    pdf: "PDF",
                    print: "Imprimir"
                },
                lengthMenu: "Exibir _MENU_ resultados por página",
                thousands: ".",
                decimal: ","
            },
            width: "100%"
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "ListaTblManutencao", error);
    }
}

/* ===================================================
   Bloco: Preenche modal (reserva) ao abrir via bandeira
   =================================================== */
function normalizaBool(v)
{
    try
    {
        if (v === true || v === false) return v;
        if (typeof v === "number") return v === 1;
        if (v == null) return false;
        var s = String(v).trim().toLowerCase();
        return s === "true" || s === "1" || s === "sim" || s === "enviado";
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "normalizaBool", error);
        return false;
    }
}

/* =======================================
   Bloco: Filtros (veículo / status / datas)
   ======================================= */
var escolhendoVeiculo = false;
var escolhendoData = false;
var escolhendoStatus = false;

function ListaTodasManutencao()
{
    try
    {
        escolhendoVeiculo = false;
        escolhendoData = false;
        escolhendoStatus = false;

        URLapi = "api/manutencao/ListaManutencao";
        IDapi = "";

        ListaTblManutencao(URLapi, IDapi);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "ListaTodasManutencao", error);
    }
}

/* ===================================================
   Bloco: Modal principal (itens OS) e DataTable itens
   =================================================== */
var dataTableItens;
var LinhaManutencaoSelecionada = 0;
var itensRemovidosParaPendente = []; // Armazena itens removidos para serem marcados como Pendente

$("#tblItens tbody").on("click", "tr", function ()
{
    try
    {
        LinhaManutencaoSelecionada = dataTableItens.row(this).index();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "tblItens.click", error);
    }
});

$("#modalManutencao")
    .on("shown.bs.modal", function (event)
    {
        try
        {
            // Limpa o array de itens removidos ao abrir o modal
            itensRemovidosParaPendente = [];

            // Obtém o ManutencaoId do campo hidden ou do botão
            var ManutencaoId = $("#txtId").val() || $("#btnFecharManutencao").data("id");

            if (!ManutencaoId)
            {
                console.warn("ManutencaoId não encontrado");
                return;
            }

            // Recria grid de itens
            if ($.fn.DataTable.isDataTable("#tblItens"))
            {
                $("#tblItens").DataTable().destroy();
                $("#tblItens tbody").empty();
            }

            dataTableItens = $("#tblItens").DataTable({
                autoWidth: false,
                order: [[2, "desc"]],
                columnDefs: [
                    { targets: 0, visible: true, className: "text-center", width: "8%" },
                    { targets: 1, visible: true, className: "text-center", width: "8%" },
                    { targets: 2, visible: true, className: "text-center", width: "10%" },
                    { targets: 3, visible: true, className: "text-left", width: "12%" },
                    { targets: 4, visible: true, className: "text-left", width: "25%" },
                    { targets: 5, visible: true, className: "text-center", width: "12%" }, // Ações (foto + remover)
                    { targets: 6, visible: false },
                    { targets: 7, visible: false },
                    { targets: 8, visible: false },
                    { targets: 9, visible: false },
                    { targets: 10, visible: false },
                    { targets: 11, visible: false }
                ],
                ajax: {
                    url: "/api/Manutencao/ItensOS",
                    data: { id: ManutencaoId },
                    type: "GET",
                    dataType: "json"
                },
                columns: [
                    { data: "tipoItem" },
                    { data: "numFicha" },
                    { data: "dataItem" },
                    { data: "nomeMotorista" },
                    { data: "resumo" },
                    {
                        data: null,
                        render: function (data, type, full)
                        {
                            try
                            {
                                const img = full.imagemOcorrencia || '';
                                const hasImage = img && img.trim().length > 0 && img.toLowerCase() !== 'semimagem.jpg';
                                
                                // Botão de foto: azul com foto, laranja sem foto
                                const btnFoto = hasImage 
                                    ? `<button type="button" class="ftx-manut-btn-icon ftx-manut-btn-editar btn-ver-foto"
                                            data-ejtip="Ver Foto"
                                            data-imagem="${full.imagemOcorrencia || ''}"
                                            style="background: linear-gradient(135deg, #17a2b8, #138496);">
                                        <i class="fa-duotone fa-camera-polaroid" style="--fa-primary-color: #fff; --fa-secondary-color: #e1f7fe; --fa-secondary-opacity: 0.8;"></i>
                                    </button>`
                                    : `<button type="button" class="ftx-manut-btn-icon btn-ver-foto"
                                            data-ejtip="Sem Foto"
                                            data-imagem=""
                                            style="background: linear-gradient(135deg, #9e9e9e, #757575); opacity: 0.6; cursor: not-allowed;"
                                            disabled>
                                        <i class="fa-duotone fa-camera-slash" style="--fa-primary-color: #fff; --fa-secondary-color: #e0e0e0; --fa-secondary-opacity: 0.8;"></i>
                                    </button>`;

                                return `
                                    <div class="d-flex gap-1 justify-content-center">
                                        ${btnFoto}
                                        <button type="button" class="ftx-manut-btn-icon ftx-manut-btn-cancelar btn-remover-item-baixa"
                                                data-ejtip="Remover da Baixa (ficará Pendente)"
                                                data-itemid="${full.itemManutencaoId}"
                                                data-viagemid="${full.viagemId}"
                                                style="background: linear-gradient(135deg, #dc3545, #c82333);">
                                            <i class="fa-duotone fa-circle-minus" style="--fa-primary-color: #fff; --fa-secondary-color: #ffebee; --fa-secondary-opacity: 0.8;"></i>
                                        </button>
                                    </div>`;
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("ListaManutencao.js", "render@acoes", error);
                                return "";
                            }
                        }
                    },
                    { data: "itemManutencaoId" },
                    { data: "descricao" },
                    { data: "status" },
                    { data: "motoristaId" },
                    { data: "imagemOcorrencia" },
                    { data: "viagemId" }
                ],
                language: {
                    emptyTable: "Nenhum item encontrado",
                    info: "Mostrando _START_ até _END_ de _TOTAL_",
                    infoEmpty: "Nenhum item",
                    search: "Pesquisar",
                    paginate: { next: "Próximo", previous: "Anterior" }
                }
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("ListaManutencao.js", "modalManutencao.shown", error);
        }
    });

/* ===================================================
   Bloco: Visualizar foto da ocorrência
   =================================================== */
$(document).on("click", ".btn-ver-foto", function ()
{
    try
    {
        var imagem = $(this).data("imagem");
        var imgEl = document.getElementById("imgViewerOcorrencia");
        var placeholder = document.getElementById("noImagePlaceholder");

        if (imagem && imagem.trim().length > 0)
        {
            imgEl.src = imagem;
            imgEl.style.display = "block";
            if (placeholder) placeholder.style.display = "none";
        } else
        {
            imgEl.style.display = "none";
            if (placeholder) placeholder.style.display = "block";
        }

        var modal = new bootstrap.Modal(document.getElementById("modalFoto"));
        modal.show();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "btn-ver-foto.click", error);
    }
});

/* ===================================================
   Bloco: Toggle Reserva
   =================================================== */
$("#lstReserva").change(function ()
{
    try
    {
        var val = $(this).val();
        if (val === "1")
        {
            $("#divReserva").slideDown(200);
        } else
        {
            $("#divReserva").slideUp(200);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "lstReserva.change", error);
    }
});

/* ===================================================
   Bloco: Remover item do grid de baixa (marcará como Pendente)
   =================================================== */
$(document).on("click", ".btn-remover-item-baixa", function ()
{
    try
    {
        var $btn = $(this);
        var $tr = $btn.closest("tr");
        var rowData = dataTableItens.row($tr).data();

        if (!rowData)
        {
            AppToast.show("Vermelho", "Erro ao obter dados do item.", 2000);
            return;
        }

        Alerta.Confirmar(
            "Remover da Baixa?",
            "Este item NÃO será baixado junto com a OS e ficará como PENDENTE. Deseja continuar?",
            "Sim, Remover",
            "Cancelar"
        ).then(function (confirmado)
        {
            if (confirmado)
            {
                try
                {
                    // Armazena o item removido para ser marcado como Pendente
                    itensRemovidosParaPendente.push({
                        itemManutencaoId: rowData.itemManutencaoId,
                        viagemId: rowData.viagemId,
                        tipoItem: rowData.tipoItem,
                        numFicha: rowData.numFicha
                    });

                    // Remove a linha do grid
                    dataTableItens.row($tr).remove().draw(false);

                    AppToast.show("Amarelo", "Item removido. Ficará como PENDENTE após a baixa.", 3000);

                    // Log para debug
                    console.log("[ListaManutencao.js] Itens removidos para Pendente:", itensRemovidosParaPendente);
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha("ListaManutencao.js", "btn-remover-item-baixa.confirm", error);
                }
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "btn-remover-item-baixa.click", error);
    }
});

/* ===================================================
   Bloco: Baixar OS
   =================================================== */
$("#btnFecharManutencao").click(function ()
{
    try
    {
        var ManutencaoId = $(this).data("id");
        var dataDevolucao = $("#txtDataDevolucao").val();
        var resumoOS = $("#txtResumoOS").val();
        var reservaEnviado = $("#lstReserva").val();
        var veiculoReservaId = "";
        var dataRecebimentoReserva = $("#txtDataRecebimentoReserva").val();
        var dataDevolucaoReserva = $("#txtDataDevolucaoReserva").val();

        var veiculoReservaCombo = document.getElementById("lstVeiculoReserva");
        if (veiculoReservaCombo?.ej2_instances?.length > 0)
        {
            var combo = veiculoReservaCombo.ej2_instances[0];
            if (combo.value) veiculoReservaId = combo.value;
        }

        if (!dataDevolucao)
        {
            Alerta.Warning("Campo Obrigatório", "Informe a Data de Devolução.", "Ok");
            return;
        }

        // Monta mensagem de confirmação
        var msgConfirm = "Deseja baixar esta Ordem de Serviço?";
        if (itensRemovidosParaPendente.length > 0)
        {
            msgConfirm += "\n\n⚠️ " + itensRemovidosParaPendente.length + " item(ns) removido(s) ficará(ão) como PENDENTE.";
        }

        Alerta.Confirmar("Confirma Baixa?", msgConfirm, "Sim", "Não")
            .then(function (confirmado)
            {
                if (confirmado)
                {
                    $.ajax({
                        url: "/api/Manutencao/BaixaOS",
                        type: "POST",
                        dataType: "json",
                        data: {
                            manutencaoId: ManutencaoId,
                            dataDevolucao: dataDevolucao,
                            resumoOS: resumoOS,
                            reservaEnviado: reservaEnviado,
                            veiculoReservaId: veiculoReservaId,
                            dataRecebimentoReserva: dataRecebimentoReserva,
                            dataDevolucaoReserva: dataDevolucaoReserva,
                            itensRemovidosJson: JSON.stringify(itensRemovidosParaPendente) // Envia itens removidos
                        },
                        success: function (response)
                        {
                            try
                            {
                                if (response.sucesso !== false)
                                {
                                    var msg = "Ordem de Serviço baixada com sucesso!";
                                    if (itensRemovidosParaPendente.length > 0)
                                    {
                                        msg += " (" + itensRemovidosParaPendente.length + " item(ns) marcado(s) como Pendente)";
                                    }
                                    AppToast.show("Verde", msg, 4000);
                                    
                                    // Limpa o array após sucesso
                                    itensRemovidosParaPendente = [];
                                    
                                    $("#modalManutencao").modal("hide");
                                    $("#btnDatas").click();
                                } else
                                {
                                    AppToast.show("Vermelho", response.message || "Erro ao baixar a OS.", 3000);
                                }
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("ListaManutencao.js", "BaixaOS.success", error);
                            }
                        },
                        error: function ()
                        {
                            AppToast.show("Vermelho", "Erro de comunicação com o servidor.", 3000);
                        }
                    });
                }
            });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "btnFecharManutencao.click", error);
    }
});

/* ===================================================
   Bloco: Cancelar Manutenção
   =================================================== */
$(document).on("click", ".btn-deletemanutencao", function ()
{
    try
    {
        var ManutencaoId = $(this).data("id");

        Alerta.Confirmar("Confirma Cancelamento?", "Deseja cancelar esta Ordem de Serviço?", "Sim, Cancelar", "Não")
            .then(function (confirmado)
            {
                if (confirmado)
                {
                    $.ajax({
                        url: "/api/Manutencao/CancelaManutencao",
                        type: "POST",
                        dataType: "json",
                        data: { id: ManutencaoId },
                        success: function (response)
                        {
                            try
                            {
                                if (response.sucesso !== false)
                                {
                                    AppToast.show("Verde", "Ordem de Serviço cancelada!", 3000);
                                    $("#btnDatas").click();
                                } else
                                {
                                    AppToast.show("Vermelho", "Erro ao cancelar a OS.", 3000);
                                }
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("ListaManutencao.js", "CancelaManutencao.success", error);
                            }
                        },
                        error: function ()
                        {
                            AppToast.show("Vermelho", "Erro de comunicação com o servidor.", 3000);
                        }
                    });
                }
            });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "btn-deletemanutencao.click", error);
    }
});

/* ===================================================
   Bloco: Abrir Modal Baixar (delegação para conteúdo dinâmico)
   =================================================== */
$(document).on("click", ".btn-baixar", function (e)
{
    try
    {
        // Verifica se o botão está desabilitado
        if ($(this).attr("aria-disabled") === "true")
        {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        var ManutencaoId = $(this).data("id");
        var $tr = $(this).closest("tr");

        // Obtém dados da linha
        var dt = $("#tblManutencao").DataTable();
        var dataRow = dt.row($tr).data() || {};

        // Define o ID no modal
        $("#txtId").val(ManutencaoId);
        $("#btnFecharManutencao").data("id", ManutencaoId);

        // Preenche campos iniciais
        document.getElementById("txtDataDevolucao").value = moment().format("YYYY-MM-DD");
        $("#txtResumoOS").val(dataRow.resumoOS || "");

        // Abre o modal manualmente
        var modalEl = document.getElementById("modalManutencao");
        var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("ListaManutencao.js", "btn-baixar.click", error);
    }
});
