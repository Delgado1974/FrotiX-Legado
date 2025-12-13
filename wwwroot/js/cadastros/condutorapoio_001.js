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
                    "Você tem certeza que deseja apagar este condutor?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"

                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ CondutorId: id });
                            var url = "/api/CondutorApoio/Delete";
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
                                            "condutorapoio_<num>.js",
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
                                            "condutorapoio_<num>.js",
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
                            "condutorapoio_<num>.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("condutorapoio_<num>.js", "callback@$.on#2", error);
            }
        });

        $(document).on("click", ".updateStatusCondutor", function () {
            try
            {
                var url = $(this).data("url");
                var currentElement = $(this);

                $.get(url, function (data) {
                    try
                    {
                        if (data.success) {
                            AppToast.show('Verde', "Status alterado com sucesso!");
                            var text = "Ativo";

                            if (data.type == 1) {
                                text = "Inativo";
                                currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                            } else
                                currentElement.removeClass("fundo-cinza").addClass("btn-verde");

                            currentElement.text(text);
                        } else alert("Something went wrong!");
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "condutorapoio_<num>.js",
                            "callback@$.get#1",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("condutorapoio_<num>.js", "callback@$.on#2", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("condutorapoio_<num>.js", "callback@$.ready#0", error);
    }
});

function loadList() {
    try
    {
        dataTable = $("#tblCondutor").DataTable({
            columnDefs: [
                {
                    targets: 1, // Descrição
                    className: "text-center",
                    width: "20%",
                },
                {
                    targets: 2, // Status
                    className: "text-center",
                    width: "20%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/condutorapoio",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "descricao", width: "30%" },
                {
                    data: "status",
                    render: function (data, type, row, meta) {
                        try
                        {
                            if (data)
                                return (
                                    '<a href="javascript:void" class="updateStatusCondutor btn btn-verde btn-xs text-white" data-url="/api/CondutorApoio/UpdateStatusCondutor?Id=' +
                                    row.condutorId +
                                    '">Ativo</a>'
                                );
                            else
                                return (
                                    '<a href="javascript:void" class="updateStatusCondutor btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Combustivel/UpdateStatusCondutor?Id=' +
                                    row.condutorId +
                                    '">Inativo</a>'
                                );
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha(
                                "condutorapoio_<num>.js",
                                "render",
                                error,
                            );
                        }
                    },
                    width: "10%",
                },
                {
                    data: "condutorId",
                    render: function (data) {
                        try
                        {
                            return `<div class="text-center">
                                <a href="/CondutorApoio/Upsert?id=${data}" class="btn btn-azul btn-xs text-white" style="cursor:pointer; width:75px;">
                                    <i class="far fa-edit"></i> Editar
                                </a>
                                <a class="btn-delete btn btn-vinho btn-xs text-white" style="cursor:pointer; width:80px;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i> Excluir
                                </a>
                    </div>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha(
                                "condutorapoio_<num>.js",
                                "render",
                                error,
                            );
                        }
                    },
                    width: "20%",
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
        Alerta.TratamentoErroComLinha("condutorapoio_<num>.js", "loadList", error);
    }
}
