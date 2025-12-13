var dataTable;

$(document).ready(function ()
{
    try
    {
        loadList();

        // DELETE
        $(document).on("click", ".btn-delete", function ()
        {
            try
            {
                var id = $(this).data("id");

                Alerta.Confirmar(
                    "Você tem certeza que deseja apagar este lavador?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"
                ).then((willDelete) =>
                {
                    try
                    {
                        if (willDelete)
                        {
                            var dataToPost = JSON.stringify({ LavadorId: id });
                            var url = "/api/Lavador/Delete";
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
                                            AppToast.show('Verde', data.message);
                                            dataTable.ajax.reload();
                                        } else
                                        {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    } catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "lavador.js",
                                            "success",
                                            error
                                        );
                                    }
                                },
                                error: function (err)
                                {
                                    try
                                    {
                                        console.log(err);
                                        alert("something went wrong");
                                    } catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "lavador.js",
                                            "error",
                                            error
                                        );
                                    }
                                },
                            });
                        }
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "lavador.js",
                            "callback@swal.then#0",
                            error
                        );
                    }
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha(
                    "lavador.js",
                    "callback@$.on#2",
                    error
                );
            }
        });

        // STATUS (corrigido: classe certa + animação/glow do Global)
        $(document).on("click", ".updateStatusLavador", function ()
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
                                currentElement.attr('data-ejtip', 'Lavador inativo - clique para ativar');
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
                                currentElement.attr('data-ejtip', 'Lavador ativo - clique para inativar');
                            }
                        }
                        else 
                        {
                            Alerta.Erro("Erro ao Alterar Status", "Ocorreu um erro ao tentar alterar o status. Tente novamente.", "OK");
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("lavador.js", "updateStatusLavador.get.callback", error);
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("lavador.js", "updateStatusLavador.click", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha(
            "lavador.js",
            "callback@$.ready#0",
            error
        );
    }
});

function loadList()
{
    try
    {
        // garante estilos de tabela global
        $("#tblLavador").addClass("ftx-table");

        dataTable = $("#tblLavador").DataTable({
            columnDefs: [
                { targets: 0, className: "text-left", width: "15%" }, // Nome
                { targets: 1, className: "text-center", width: "6%" }, // Ponto
                { targets: 2, className: "text-center", width: "8%" }, // Celular
                { targets: 3, className: "text-left", width: "10%" }, // Contrato
                { targets: 4, className: "text-center", width: "5%" }, // Status
                { targets: 5, className: "text-center", width: "8%" }, // Ações
            ],
            responsive: true,
            ajax: {
                url: "/api/lavador",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "nome" },
                { data: "ponto" },
                { data: "celular01" },
                { data: "contratoLavador" },
                {
                    data: "status",
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            var base =
                                'href="javascript:void(0)" ' +
                                'class="updateStatusLavador btn ftx-status-btn btn-xs text-white ';

                            var cls = data ? 'btn-verde is-active' : 'fundo-cinza is-inactive';
                            var url = '/api/Lavador/updateStatusLavador?Id=' + row.lavadorId;
                            var label = data ? 'Ativo' : 'Inativo';

                            return (
                                "<a " + base + cls + '" ' +
                                'data-url="' + url + '" ' +
                                'aria-label="Alterar status para ' + (data ? 'Inativo' : 'Ativo') + '" ' +
                                'aria-pressed="' + (data ? 'true' : 'false') + '">' +
                                label + "</a>"
                            );
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha(
                                "lavador.js",
                                "render@status",
                                error
                            );
                        }
                    },
                },
                {
                    data: "lavadorId",
                    render: function (data)
                    {
                        try
                        {
                            return (
                                '<div class="text-center">' +
                                '  <a href="/Lavador/Upsert?id=' + data + '" ' +
                                '     class="btn btn-editar btn-icon-28" ' +
                                '     data-ejtip="Editar Lavador">' +
                                '     <i class="fal fa-edit"></i>' +
                                '  </a>' +
                                '  <a class="btn-delete btn fundo-vermelho btn-icon-28" ' +
                                '     data-ejtip="Excluir Lavador" data-id="' + data + '">' +
                                '     <i class="fal fa-trash-alt"></i>' +
                                '  </a>' +
                                '  <a class="btn btn-foto btn-icon-28" ' +
                                '     data-toggle="modal" data-target="#modalFoto" ' +
                                '     data-ejtip="Foto do Lavador" ' +
                                '     data-id="' + data + '" data-backdrop="false">' +
                                '     <i class="fal fa-camera-retro"></i>' +
                                '  </a>' +
                                '</div>'
                            );
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha(
                                "lavador.js",
                                "render@acoes",
                                error
                            );
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
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("lavador.js", "loadList", error);
    }
}
