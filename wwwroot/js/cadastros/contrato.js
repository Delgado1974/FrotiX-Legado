var dataTable;

$(document).ready(function () {
    try {
        loadList();

        $(document).on("click", ".btn-delete", function () {
            try {
                var id = $(this).data("id");

                Alerta.Confirmar(
                    "Você tem certeza que deseja apagar este contrato?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"
                ).then((willDelete) => {
                    try {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ ContratoId: id });
                            var url = "/api/Contrato/Delete";
                            $.ajax({
                                url: url,
                                type: "POST",
                                data: dataToPost,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data) {
                                    try {
                                        if (data.success) {
                                            AppToast.show('Verde', data.message);
                                            dataTable.ajax.reload();
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    } catch (error) {
                                        Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.ajax.success", error);
                                    }
                                },
                                error: function (err) {
                                    try {
                                        console.log(err);
                                        AppToast.show('Vermelho', 'Erro ao excluir o contrato!');
                                    } catch (error) {
                                        Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.ajax.error", error);
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.confirm.then", error);
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.click", error);
            }
        });

        $(document).on("click", ".updateStatusContrato", function () {
            try {
                var url = $(this).data("url");
                var currentElement = $(this);

                $.get(url, function (data) {
                    try {
                        if (data.success) {
                            AppToast.show('Verde', "Status alterado com sucesso!");

                            if (data.type == 1) {
                                // Inativo
                                currentElement
                                    .removeClass("btn-verde")
                                    .addClass("fundo-cinza")
                                    .html('<i class="fa-duotone fa-circle-xmark"></i> Inativo');
                            } else {
                                // Ativo
                                currentElement
                                    .removeClass("fundo-cinza")
                                    .addClass("btn-verde")
                                    .html('<i class="fa-duotone fa-circle-check"></i> Ativo');
                            }
                        } else {
                            AppToast.show('Vermelho', 'Erro ao alterar status!');
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("contrato.js", "updateStatusContrato.get.success", error);
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("contrato.js", "updateStatusContrato.click", error);
            }
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("contrato.js", "document.ready", error);
    }
});

function loadList() {
    try {
        dataTable = $("#tblContrato").DataTable({
            order: [[0, "desc"]],

            columnDefs: [
                {
                    targets: 0, // Contrato
                    className: "text-center",
                    width: "6%"
                },
                {
                    targets: 1, // Processo Completo
                    className: "text-center",
                    width: "7%"
                },
                {
                    targets: 2, // Objeto
                    className: "text-left",
                    width: "14%"
                },
                {
                    targets: 3, // Fornecedor
                    className: "text-left",
                    width: "14%"
                },
                {
                    targets: 4, // Vigência
                    className: "text-center",
                    width: "9%"
                },
                {
                    targets: 5, // Valor Anual
                    className: "text-right",
                    width: "8%"
                },
                {
                    targets: 6, // Valor Mensal
                    className: "text-right",
                    width: "8%"
                },
                {
                    targets: 7, // Prorrogação
                    className: "text-center",
                    width: "8%"
                },
                {
                    targets: 8, // Status
                    className: "text-center",
                    width: "6%"
                },
                {
                    targets: 9, // Ação
                    className: "text-center",
                    width: "12%",
                    orderable: false
                }
            ],

            responsive: true,
            ajax: {
                url: "/api/contrato",
                type: "GET",
                datatype: "json"
            },
            columns: [
                { data: "contratoCompleto" },
                { data: "processoCompleto" },
                { data: "objeto" },
                { data: "descricaoFornecedor" },
                { data: "periodo" },
                { data: "valorFormatado" },
                { data: "valorMensal" },
                { data: "vigenciaCompleta" },
                {
                    data: "status",
                    render: function (data, type, row, meta) {
                        try {
                            if (data) {
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusContrato ftx-badge-status btn-verde" 
                                           data-url="/api/Contrato/updateStatusContrato?Id=${row.contratoId}">
                                           <i class="fa-duotone fa-circle-check"></i>
                                           Ativo
                                        </a>`;
                            } else {
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusContrato ftx-badge-status fundo-cinza" 
                                           data-url="/api/Contrato/updateStatusContrato?Id=${row.contratoId}">
                                           <i class="fa-duotone fa-circle-xmark"></i>
                                           Inativo
                                        </a>`;
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("contrato.js", "render.status", error);
                        }
                    }
                },
                {
                    data: "contratoId",
                    render: function (data) {
                        try {
                            return `<div class="ftx-actions">
                                        <a href="/Contrato/Upsert?id=${data}" 
                                           class="btn btn-azul text-white" 
                                           aria-label="Editar Contrato" 
                                           data-microtip-position="top" 
                                           role="tooltip">
                                            <i class="fa-duotone fa-pen-to-square"></i>
                                        </a>
                                        <a href="javascript:void(0)" 
                                           class="btn btn-delete btn-vinho text-white" 
                                           aria-label="Excluir Contrato" 
                                           data-microtip-position="top" 
                                           role="tooltip" 
                                           data-id="${data}">
                                            <i class="fa-duotone fa-trash-can"></i>
                                        </a>
                                        <a href="javascript:void(0)" 
                                           class="btn btn-documentos btn-info text-white" 
                                           aria-label="Documentos do Contrato" 
                                           data-microtip-position="top" 
                                           role="tooltip" 
                                           data-id="${data}">
                                            <i class="fa-duotone fa-file-pdf"></i>
                                        </a>
                                        <a href="javascript:void(0)" 
                                           class="btn btn-itens fundo-cinza text-white" 
                                           aria-label="Itens do Contrato" 
                                           data-microtip-position="top" 
                                           role="tooltip" 
                                           data-id="${data}">
                                            <i class="fa-duotone fa-sitemap"></i>
                                        </a>
                                        <a href="/Contrato/RepactuacaoContrato?id=${data}" 
                                           class="btn btn-repactuacao fundo-chocolate text-white" 
                                           aria-label="Adicionar Repactuação" 
                                           data-microtip-position="top" 
                                           role="tooltip" 
                                           data-id="${data}">
                                            <i class="fa-duotone fa-handshake"></i>
                                        </a>
                                    </div>`;
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("contrato.js", "render.actions", error);
                        }
                    }
                }
            ],

            language: {
                url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                emptyTable: "Sem Dados para Exibição"
            },
            width: "100%"
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("contrato.js", "loadList", error);
    }
}
