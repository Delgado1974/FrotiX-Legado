/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/Pages/Operador - Index.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo contém a lógica JavaScript do DataTable e ações da página de
    listagem de Operadores. Para entender completamente a funcionalidade,
    consulte a documentação acima.
    ═══════════════════════════════════════════════════════════════════════════════
*/

var dataTable;

$(document).ready(function () {
    try {
        loadList();

        // Handler delegado para excluir operador
        $(document).on("click", ".btn-delete", function () {
            try {
                var id = $(this).data("id");

                Alerta.Confirmar(
                    "Confirmar Exclusão",
                    "Você tem certeza que deseja apagar este operador?",
                    "Sim, excluir",
                    "Cancelar"
                ).then((willDelete) => {
                    try {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ OperadorId: id });
                            $.ajax({
                                url: "/api/Operador/Delete",
                                type: "POST",
                                data: dataToPost,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data) {
                                    try {
                                        if (data.success) {
                                            AppToast.show("Verde", data.message, 2000);
                                            dataTable.ajax.reload();
                                        } else {
                                            AppToast.show("Vermelho", data.message, 3000);
                                        }
                                    } catch (error) {
                                        Alerta.TratamentoErroComLinha("operador.js", "Delete.success", error);
                                    }
                                },
                                error: function (err) {
                                    try {
                                        console.error("Erro ao excluir:", err);
                                        AppToast.show("Vermelho", "Erro ao excluir operador", 3000);
                                    } catch (error) {
                                        Alerta.TratamentoErroComLinha("operador.js", "Delete.error", error);
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("operador.js", "Delete.confirmar", error);
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("operador.js", "btn-delete.click", error);
            }
        });

        // Handler delegado para alterar status
        $(document).on("click", ".updateStatusOperador", function () {
            try {
                var url = $(this).data("url");
                var currentElement = $(this);

                $.get(url, function (data) {
                    try {
                        if (data.success) {
                            AppToast.show("Verde", "Status alterado com sucesso!", 2000);

                            if (data.type == 1) {
                                // INATIVO
                                currentElement.html('<i class="fa-duotone fa-circle-xmark"></i> Inativo');
                                currentElement.removeClass("badge-ativo").addClass("badge-inativo");
                                currentElement.attr("data-ejtip", "Operador inativo - clique para ativar");
                            } else {
                                // ATIVO
                                currentElement.html('<i class="fa-duotone fa-circle-check"></i> Ativo');
                                currentElement.removeClass("badge-inativo").addClass("badge-ativo");
                                currentElement.attr("data-ejtip", "Operador ativo - clique para inativar");
                            }
                        } else {
                            Alerta.Erro("Erro ao Alterar Status", "Ocorreu um erro ao tentar alterar o status.", "OK");
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("operador.js", "updateStatus.callback", error);
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("operador.js", "updateStatusOperador.click", error);
            }
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("operador.js", "document.ready", error);
    }
});

function loadList() {
    try {
        dataTable = $("#tblOperador").DataTable({
            autoWidth: false,
            dom: 'Bfrtip',
            lengthMenu: [
                [10, 25, 50, -1],
                ['10 linhas', '25 linhas', '50 linhas', 'Todas as Linhas']
            ],
            buttons: ['pageLength', 'excel', { extend: 'pdfHtml5', orientation: 'landscape', pageSize: 'LEGAL' }],
            order: [[0, 'asc']],
            columnDefs: [
                { targets: 0, className: "text-left", width: "25%" },
                { targets: 1, className: "text-center", width: "8%" },
                { targets: 2, className: "text-center", width: "12%" },
                { targets: 3, className: "text-left", width: "25%" },
                { targets: 4, className: "text-center", width: "10%" },
                { targets: 5, className: "text-center", width: "20%" }
            ],
            responsive: true,
            ajax: {
                url: "/api/operador",
                type: "GET",
                datatype: "json"
            },
            columns: [
                { data: "nome" },
                { data: "ponto" },
                { data: "celular01" },
                { data: "contratoOperador" },
                {
                    data: "status",
                    render: function (data, type, row) {
                        try {
                            if (data) {
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusOperador badge-ativo" 
                                           data-ejtip="Operador ativo - clique para inativar" 
                                           data-url="/api/Operador/UpdateStatusOperador?Id=${row.operadorId}">
                                            <i class="fa-duotone fa-circle-check"></i> Ativo
                                        </a>`;
                            } else {
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusOperador badge-inativo" 
                                           data-ejtip="Operador inativo - clique para ativar" 
                                           data-url="/api/Operador/UpdateStatusOperador?Id=${row.operadorId}">
                                            <i class="fa-duotone fa-circle-xmark"></i> Inativo
                                        </a>`;
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("operador.js", "render.status", error);
                            return "";
                        }
                    }
                },
                {
                    data: "operadorId",
                    render: function (data) {
                        try {
                            return `<div class="ftx-btn-acoes">
                                        <a href="/Operador/Upsert?id=${data}" 
                                           class="btn btn-editar btn-icon-28" 
                                           data-ejtip="Editar Operador">
                                            <i class="fa-duotone fa-pen-to-square"></i>
                                        </a>
                                        <a href="javascript:void(0)" 
                                           class="btn btn-foto btn-icon-28" 
                                           data-ejtip="Foto do Operador" 
                                           data-id="${data}">
                                            <i class="fa-duotone fa-camera-retro"></i>
                                        </a>
                                        <a href="javascript:void(0)" 
                                           class="btn fundo-vermelho btn-icon-28 btn-delete" 
                                           data-ejtip="Excluir Operador" 
                                           data-id="${data}">
                                            <i class="fa-duotone fa-trash-can"></i>
                                        </a>
                                    </div>`;
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("operador.js", "render.acoes", error);
                            return "";
                        }
                    }
                }
            ],
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                emptyTable: "Nenhum operador encontrado"
            },
            width: "100%"
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("operador.js", "loadList", error);
    }
}
