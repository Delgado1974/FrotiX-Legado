var dataTable;

$(document).ready(function () {
    try
    {
        loadList();

        $(document).on("click", ".btn-delete", function () {
            try
            {
                var id = $(this).data("id");

                Alerta.Confirmar(
                    "Você tem certeza que deseja apagar este operador?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"

                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ OperadorId: id });
                            var url = "/api/Operador/Delete";
                            $.ajax({
                                url: url,
                                type: "POST",
                                data: dataToPost,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data) {
                                    try
                                    {
                                        if (data.success) {
                                            AppToast.show('Verde', data.message);
                                            dataTable.ajax.reload();
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "operador.js",
                                            "success",
                                            error,
                                        );
                                    }
                                },
                                error: function (err) {
                                    try
                                    {
                                        console.log(err);
                                        alert("something went wrong");
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "operador.js",
                                            "error",
                                            error,
                                        );
                                    }
                                },
                            });
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "operador.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("operador.js", "callback@$.on#2", error);
            }
        });

        $(document).on("click", ".updateStatusOperador", function ()
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
                                currentElement.attr('data-ejtip', 'Operador inativo - clique para ativar');
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
                                currentElement.attr('data-ejtip', 'Operador ativo - clique para inativar');
                            }
                        }
                        else 
                        {
                            Alerta.Erro("Erro ao Alterar Status", "Ocorreu um erro ao tentar alterar o status. Tente novamente.", "OK");
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("operador.js", "updateStatusOperador.get.callback", error);
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("operador.js", "updateStatusOperador.click", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("operador.js", "callback@$.ready#0", error);
    }
});

function loadList() {
    try
    {
        dataTable = $("#tblOperador").DataTable({
            columnDefs: [
                {
                    targets: 0, //Nome
                    className: "text-left",
                    width: "15%",
                },
                {
                    targets: 1, //Ponto
                    className: "text-center",
                    width: "6%",
                },
                {
                    targets: 2, //Celular
                    className: "text-center",
                    width: "8%",
                },
                {
                    targets: 3, //Contrato
                    className: "text-left",
                    width: "10%",
                },
                {
                    targets: 4, //Status
                    className: "text-center",
                    width: "5%",
                },
                {
                    targets: 5, //Ação
                    className: "text-center",
                    width: "8%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/operador",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "nome" },
                { data: "ponto" },
                { data: "celular01" },
                { data: "contratoOperador" },
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
                       class="updateStatusLavador btn btn-xs"
                       style="background-color: #22c55e !important; color: white !important; box-shadow: 0 0 8px rgba(34,197,94,.5) !important; border: none !important;"
                       data-ejtip="Lavador ativo - clique para inativar"
                       data-url="/api/Lavador/updateStatusLavador?Id=${row.lavadorId}">Ativo</a>`;
                            } else
                            {
                                // INATIVO = CINZA
                                return `<a href="javascript:void(0)"
                       class="updateStatusLavador btn btn-xs"
                       style="background-color: #2F4F4F !important; color: aliceblue !important; box-shadow: 0 0 8px rgba(47,79,79,.5) !important; border: none !important;"
                       data-ejtip="Lavador inativo - clique para ativar"
                       data-url="/api/Lavador/updateStatusLavador?Id=${row.lavadorId}">Inativo</a>`;
                            }
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha(
                                "lavador.js",
                                "render@status",
                                error
                            );
                            return "";
                        }
                    },
                },
                {
                    data: "operadorId",
                    render: function (data)
                    {
                        try
                        {
                            return `
                                    <div class="text-center">
                                        <a href="/Operador/Upsert?id=${data}"
                                           class="btn btn-editar btn-icon-28"
                                           data-ejtip="Editar Operador">
                                            <i class="fal fa-edit"></i>
                                        </a>
                                        <a class="btn-delete btn fundo-vermelho btn-icon-28"
                                           data-ejtip="Excluir Operador"
                                           data-id="${data}">
                                            <i class="fal fa-trash-alt"></i>
                                        </a>
                                        <a class="btn btn-foto btn-icon-28"
                                           data-bs-toggle="modal" data-bs-target="#modalFoto"
                                           data-ejtip="Foto do Operador"
                                           data-id="${data}">
                                            <i class="fal fa-camera-retro"></i>
                                        </a>
                                    </div>`;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("operador.js", "render.acoes", error);
                            return "";
                        }
                    }
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
        Alerta.TratamentoErroComLinha("operador.js", "loadList", error);
    }
}
