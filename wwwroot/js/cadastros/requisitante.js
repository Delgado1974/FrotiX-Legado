var dataTable;

$(document).ready(function ()
{
    try
    {
        loadList();

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
                                        Alerta.Erro("Erro ao Excluir", "Ocorreu um erro ao tentar excluir o requisitante. Tente novamente.", "OK");
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

        $(document).on("click", ".updateStatusRequisitante", function ()
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
                                // INATIVO = CINZA
                                currentElement.text("Inativo");
                                currentElement.css({
                                    'background-color': '#2F4F4F',
                                    'color': 'aliceblue',
                                    'box-shadow': '0 0 8px rgba(47,79,79,.5)',
                                    'border': 'none'
                                });
                                currentElement.attr('data-ejtip', 'Requisitante inativo - clique para ativar');
                            }
                            else 
                            {
                                // ATIVO = VERDE
                                currentElement.text("Ativo");
                                currentElement.css({
                                    'background-color': '#22c55e',
                                    'color': 'white',
                                    'box-shadow': '0 0 8px rgba(34,197,94,.5)',
                                    'border': 'none'
                                });
                                currentElement.attr('data-ejtip', 'Requisitante ativo - clique para inativar');
                            }
                        }
                        else 
                        {
                            Alerta.Erro("Erro ao Alterar Status", "Ocorreu um erro ao tentar alterar o status. Tente novamente.", "OK");
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("requisitante.js", "updateStatusRequisitante.get.callback", error);
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("requisitante.js", "updateStatusRequisitante.click", error);
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
                    width: "5%",
                },
                {
                    targets: 1, // Nome
                    className: "text-left",
                    width: "20%",
                },
                {
                    targets: 2, // Ramal
                    className: "text-center",
                    width: "8%",
                },
                {
                    targets: 3, // Setor
                    className: "text-left",
                    width: "20%",
                },
                {
                    targets: 4, // Status
                    className: "text-center",
                    width: "5%",
                },
                {
                    targets: 5, // Ação
                    className: "text-center",
                    width: "5%",
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
                    data: "status",
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            if (data)
                            {
                                // ATIVO = VERDE
                                return (
                                    '<a href="javascript:void(0)" class="updateStatusRequisitante btn btn-xs" style="background-color: #22c55e !important; color: white !important; box-shadow: 0 0 8px rgba(34,197,94,.5) !important; border: none !important;" data-url="/api/Requisitante/updateStatusRequisitante?Id=' +
                                    row.requisitanteId +
                                    '" data-ejtip="Requisitante ativo - clique para inativar">Ativo</a>'
                                );
                            } else
                            {
                                // INATIVO = CINZA
                                return (
                                    '<a href="javascript:void(0)" class="updateStatusRequisitante btn btn-xs" style="background-color: #2F4F4F !important; color: aliceblue !important; box-shadow: 0 0 8px rgba(47,79,79,.5) !important; border: none !important;" data-url="/api/Requisitante/updateStatusRequisitante?Id=' +
                                    row.requisitanteId +
                                    '" data-ejtip="Requisitante inativo - clique para ativar">Inativo</a>'
                                );
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
                    data: "requisitanteId",
                    render: function (data)
                    {
                        try
                        {
                            return `<div class="text-center">
                                        <a href="/Requisitante/Upsert?id=${data}" 
                                           class="btn btn-editar btn-icon-28" 
                                           data-ejtip="Editar requisitante">
                                            <i class="fal fa-edit"></i>
                                        </a>
                                        <a class="btn btn-delete fundo-vermelho btn-icon-28" 
                                           data-id='${data}'
                                           data-ejtip="Excluir requisitante">
                                            <i class="fal fa-trash-alt"></i>
                                        </a>
                                    </div>`;
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
