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
                    "Você tem certeza que deseja apagar este motorista? Não será possível recuperar os dados eliminados!",
                    "Sim, excluir",
                    "Cancelar"
                ).then((confirmed) =>
                {
                    try
                    {
                        if (confirmed)
                        {
                            var dataToPost = JSON.stringify({ MotoristaId: id });
                            var url = "/api/Motorista/Delete";

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
                                            AppToast.show("Verde", data.message, 3000);
                                            dataTable.ajax.reload();
                                        } else
                                        {
                                            AppToast.show("Vermelho", data.message, 3000);
                                        }
                                    } catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha("motorista.js", "btn-delete.ajax.success", error);
                                    }
                                },
                                error: function (err)
                                {
                                    try
                                    {
                                        console.error("Erro ao deletar motorista:", err);
                                        AppToast.show("Vermelho", "Erro ao processar a exclusão", 3000);
                                    } catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha("motorista.js", "btn-delete.ajax.error", error);
                                    }
                                }
                            });
                        }
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("motorista.js", "btn-delete.confirmar.then", error);
                    }
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("motorista.js", "btn-delete.click", error);
            }
        });

        $(document).on("click", ".updateStatusMotorista", function ()
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

                            if (data.type == 0)
                            {
                                // ATIVO = VERDE
                                currentElement.text("Ativo");
                                currentElement.removeClass().addClass("updateStatusMotorista btn btn-xs btn-verde");
                                currentElement.css({
                                    'color': 'white !important',
                                    'box-shadow': '0 0 8px rgba(34,197,94,.5) !important',
                                    'border': 'none !important'
                                });
                                currentElement.attr('data-ejtip', 'Motorista ativo - clique para inativar');
                            }
                            else
                            {
                                // INATIVO = CINZA
                                currentElement.text("Inativo");
                                currentElement.removeClass().addClass("updateStatusMotorista btn btn-xs");
                                currentElement.css({
                                    'background-color': '#2F4F4F !important',
                                    'color': 'aliceblue !important',
                                    'box-shadow': '0 0 8px rgba(47,79,79,.5) !important',
                                    'border': 'none !important'
                                });
                                currentElement.attr('data-ejtip', 'Motorista inativo - clique para ativar');
                            }
                        }
                        else
                        {
                            Alerta.Erro("Erro ao Alterar Status", "Ocorreu um erro ao tentar alterar o status. Tente novamente.", "OK");
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("motorista.js", "updateStatusMotorista.get.callback", error);
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("motorista.js", "updateStatusMotorista.click", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("motorista.js", "document.ready", error);
    }
});

function loadList()
{
    try
    {
        dataTable = $("#tblMotorista").DataTable({
            autoWidth: false,
            dom: "Bfrtip",
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
            columnDefs: [
                {
                    targets: 0,
                    className: "text-left",
                    width: "15%"
                },
                {
                    targets: 1,
                    className: "text-center",
                    width: "3%"
                },
                {
                    targets: 2,
                    className: "text-center",
                    width: "3%"
                },
                {
                    targets: 3,
                    className: "text-center",
                    width: "3%",
                    defaultContent: ""
                },
                {
                    targets: 4,
                    className: "text-center",
                    width: "2%"
                },
                {
                    targets: 5,
                    className: "text-left",
                    width: "5%"
                },
                {
                    targets: 6,
                    className: "text-left",
                    width: "20%"
                },
                {
                    targets: 7,
                    className: "text-center",
                    width: "5%"
                },
                {
                    targets: 8,
                    className: "text-center",
                    width: "5%"
                },
                {
                    targets: 9,
                    className: "text-center",
                    width: "13%"
                }
            ],
            responsive: true,
            ajax: {
                url: "/api/motorista",
                type: "GET",
                datatype: "json"
            },
            columns: [
                { data: "nome" },
                { data: "ponto" },
                { data: "cnh" },
                { data: "categoriaCNH" },
                { data: "celular01" },
                { data: "sigla" },
                { data: "contratoMotorista" },
                { data: "efetivoFerista" },
                {
                    data: "status",
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            if (data)
                            {
                                // ATIVO = VERDE
                                return `<a href="javascript:void(0)"
                       class="updateStatusMotorista btn btn-xs btn-verde"
                       style="color: white !important; box-shadow: 0 0 8px rgba(34,197,94,.5) !important; border: none !important;"
                       data-ejtip="Motorista ativo - clique para inativar"
                       data-url="/api/Motorista/updateStatusMotorista?Id=${row.motoristaId}">Ativo</a>`;
                            } else
                            {
                                // INATIVO = CINZA
                                return `<a href="javascript:void(0)"
                       class="updateStatusMotorista btn btn-xs"
                       style="background-color: #2F4F4F !important; color: aliceblue !important; box-shadow: 0 0 8px rgba(47,79,79,.5) !important; border: none !important;"
                       data-ejtip="Motorista inativo - clique para ativar"
                       data-url="/api/Motorista/updateStatusMotorista?Id=${row.motoristaId}">Inativo</a>`;
                            }
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("motorista.js", "status.render", error);
                            return "";
                        }
                    }
                },
                {
                    data: "motoristaId",
                    render: function (data)
                    {
                        try
                        {
                            return `<div class="text-center">
                                    <a href="/Motorista/Upsert?id=${data}"
                                       class="btn btn-editar btn-icon-28"
                                       data-ejtip="Editar Motorista">
                                        <i class="fal fa-edit"></i>
                                    </a>
                                    <a class="btn-delete btn fundo-vermelho btn-icon-28"
                                       data-ejtip="Excluir Motorista"
                                       data-id="${data}">
                                        <i class="fal fa-trash-alt"></i>
                                    </a>
                                    <a class="btn btn-foto btn-icon-28"
                                       data-bs-toggle="modal"
                                       data-bs-target="#modalFoto"
                                       data-ejtip="Foto do Motorista"
                                       data-id="${data}">
                                        <i class="fal fa-camera-retro"></i>
                                    </a>
                                </div>`;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("motorista.js", "acoes.render", error);
                            return "";
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
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("motorista.js", "loadList", error);
    }
}
