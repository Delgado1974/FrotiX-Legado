var dataTable;

$(document).ready(function ()
{
    try
    {
        loadList();

        // Evento de exclusão de requisitante
        $(document).on("click", ".btn-delete", function ()
        {
            try
            {
                var id = $(this).data("id");

                Alerta.Confirmar(
                    "Confirmar Exclusão",
                    "Você tem certeza que deseja apagar este requisitante? Não será possível recuperar os dados eliminados!",
                    "Sim, excluir",
                    "Cancelar"
                ).then((willDelete) =>
                {
                    try
                    {
                        if (willDelete)
                        {
                            var dataToPost = JSON.stringify({ RequisitanteId: id });
                            var url = "/api/Requisitante/Delete";
                            $.ajax({
                                url: url,
                                type: "POST",
                                data: dataToPost,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data)
                                {
                                    try
                                    {
                                        if (data.success)
                                        {
                                            AppToast.show("Verde", data.message, 2000);
                                            dataTable.ajax.reload();
                                        } else
                                        {
                                            AppToast.show("Vermelho", data.message, 2000);
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha("requisitante.js", "ajax.Delete.success", error);
                                    }
                                },
                                error: function (err)
                                {
                                    try
                                    {
                                        console.error(err);
                                        AppToast.show("Vermelho", "Ocorreu um erro ao tentar excluir o requisitante.", 2000);
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha("requisitante.js", "ajax.Delete.error", error);
                                    }
                                },
                            });
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("requisitante.js", "btn-delete.Confirmar.then", error);
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("requisitante.js", "btn-delete.click", error);
            }
        });

        // Evento de clique no badge de status para alternar Ativo/Inativo
        $(document).on("click", ".btn-toggle-status", function ()
        {
            try
            {
                var url = $(this).data("url");
                var currentElement = $(this);

                $.get(url, function (data)
                {
                    try
                    {
                        if (data.success)
                        {
                            AppToast.show("Verde", "Status alterado com sucesso!", 2000);

                            if (data.type == 1)
                            {
                                // Mudou para INATIVO - Cinza
                                currentElement
                                    .removeClass('ftx-badge-ativo')
                                    .addClass('ftx-badge-inativo')
                                    .attr('title', 'Clique para ativar')
                                    .html('<i class="fa-duotone fa-circle-xmark" style="--fa-primary-color:#fff; --fa-secondary-color:#adb5bd;"></i>Inativo');
                            }
                            else 
                            {
                                // Mudou para ATIVO - Verde
                                currentElement
                                    .removeClass('ftx-badge-inativo')
                                    .addClass('ftx-badge-ativo')
                                    .attr('title', 'Clique para desativar')
                                    .html('<i class="fa-duotone fa-circle-check" style="--fa-primary-color:#fff; --fa-secondary-color:#c8e6c9;"></i>Ativo');
                            }
                        }
                        else 
                        {
                            AppToast.show("Vermelho", "Erro ao alterar status.", 2000);
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("requisitante.js", "btn-toggle-status.get.callback", error);
                    }
                }).fail(function ()
                {
                    try
                    {
                        AppToast.show("Vermelho", "Erro ao alterar status do requisitante.", 2000);
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("requisitante.js", "btn-toggle-status.get.fail", error);
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("requisitante.js", "btn-toggle-status.click", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("requisitante.js", "document.ready", error);
    }
});

function loadList()
{
    try
    {
        dataTable = $("#tblRequisitante").DataTable({
            order: [],
            columnDefs: [
                {
                    targets: 0, // Ponto
                    className: "text-center",
                    width: "8%",
                },
                {
                    targets: 1, // Nome
                    className: "text-left",
                    width: "25%",
                },
                {
                    targets: 2, // Ramal
                    className: "text-center",
                    width: "8%",
                },
                {
                    targets: 3, // Setor
                    className: "text-left",
                    width: "25%",
                },
                {
                    targets: 4, // Status
                    className: "text-center",
                    width: "10%",
                },
                {
                    targets: 5, // Ação
                    className: "text-center",
                    width: "10%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/requisitante",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "ponto" },
                { data: "nome" },
                { data: "ramal" },
                { data: "nomeSetor" },
                {
                    // Coluna Status - Badge Padrão FrotiX CLICÁVEL
                    data: "status",
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            var id = row.requisitanteId;
                            if (data)
                            {
                                // ATIVO - Verde
                                return '<span class="ftx-badge-status ftx-badge-ativo ftx-badge-clickable btn-toggle-status" ' +
                                       'data-url="/api/Requisitante/updateStatusRequisitante?Id=' + id + '" ' +
                                       'title="Clique para desativar">' +
                                       '<i class="fa-duotone fa-circle-check"></i> ' +
                                       'Ativo</span>';
                            } else
                            {
                                // INATIVO - Cinza
                                return '<span class="ftx-badge-status ftx-badge-inativo ftx-badge-clickable btn-toggle-status" ' +
                                       'data-url="/api/Requisitante/updateStatusRequisitante?Id=' + id + '" ' +
                                       'title="Clique para ativar">' +
                                       '<i class="fa-duotone fa-circle-xmark"></i> ' +
                                       'Inativo</span>';
                            }
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("requisitante.js", "DataTable.render.status", error);
                            return "";
                        }
                    },
                },
                {
                    // Coluna Ações - Botões Padrão FrotiX com ícones duotone
                    data: "requisitanteId",
                    render: function (data)
                    {
                        try
                        {
                            return '<div class="d-flex justify-content-center gap-1">' +
                                       '<a href="/Requisitante/Upsert?id=' + data + '" ' +
                                          'class="btn-acao-ftx btn-azul" ' +
                                          'title="Editar requisitante">' +
                                           '<i class="fa-duotone fa-pen-to-square" style="--fa-primary-color:#fff; --fa-secondary-color:#90caf9;"></i>' +
                                       '</a>' +
                                       '<button type="button" class="btn-acao-ftx btn-vinho btn-delete" ' +
                                               'data-id="' + data + '" ' +
                                               'title="Excluir requisitante">' +
                                           '<i class="fa-duotone fa-trash-can" style="--fa-primary-color:#fff; --fa-secondary-color:#ffcdd2;"></i>' +
                                       '</button>' +
                                   '</div>';
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("requisitante.js", "DataTable.render.acoes", error);
                            return "";
                        }
                    },
                },
            ],

            language: {
                url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                emptyTable: "Sem Dados para Exibição",
            },
            width: "100%",
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("requisitante.js", "loadList", error);
    }
}
