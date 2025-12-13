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
                    "Você tem certeza que deseja apagar este tipo de multa?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"

                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ TipoMultaId: id });
                            var url = "/api/Multa/DeleteTipoMulta";
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
                                            "tipomulta_<num>.js",
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
                                            "tipomulta_<num>.js",
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
                            "tipomulta_<num>.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("tipomulta_<num>.js", "callback@$.on#2", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("tipomulta_<num>.js", "callback@$.ready#0", error);
    }
});

function loadList() {
    try
    {
        dataTable = $("#tblTipoMulta").DataTable({
            columnDefs: [
                {
                    targets: 0, // Artigo
                    className: "text-left",
                    width: "20%",
                },
                {
                    targets: 1, // Denatran
                    className: "text-left",
                    width: "20%",
                },
                {
                    targets: 2, // Descrição
                    className: "text-left",
                    width: "64%",
                },
                {
                    targets: 3, // Infração
                    className: "text-center",
                    width: "8%",
                },
                {
                    targets: 4, // Ações
                    className: "text-center",
                    width: "8%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/Multa/PegaTipoMulta",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "artigo" },
                { data: "denatran" },
                { data: "descricao" },
                { data: "infracao" },
                {
                    data: "tipoMultaId",
                    render: function (data) {
                        try
                        {
                            return `<div class="text-center">
                                <a href="/Multa/UpsertTipoMulta?id=${data}" class="btn btn-azul btn-xs text-white" style="cursor:pointer; ">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn-delete btn btn-vinho btn-xs text-white" style="cursor:pointer; " data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                    </div>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("tipomulta_<num>.js", "render", error);
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
        Alerta.TratamentoErroComLinha("tipomulta_<num>.js", "loadList", error);
    }
}
