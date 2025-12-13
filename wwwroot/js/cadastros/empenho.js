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
                    "Você tem certeza que deseja apagar este empenho?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"


                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ EmpenhoId: id });
                            var url = "/api/Empenho/Delete";
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
                                            $("#tblEmpenho").DataTable().ajax.reload(null, false);
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "empenho.js",
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
                                            "empenho.js",
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
                            "empenho.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("empenho.js", "callback@$.on#2", error);
            }
        });

        $(document).on("click", ".updateStatusEmpenho", function () {
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
                            "empenho.js",
                            "callback@$.get#1",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("empenho.js", "callback@$.on#2", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("empenho.js", "callback@$.ready#0", error);
    }
});

function loadList() {
    try
    {
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("empenho.js", "loadList", error);
    }
} 
