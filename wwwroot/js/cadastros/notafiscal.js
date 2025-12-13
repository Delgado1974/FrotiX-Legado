$(document).ready(function () {
    try
    {
        $(document).on("click", ".btn-delete", function () {
            try
            {
                var id = $(this).data("id");

                Alerta.Confirmar(
                    "Você tem certeza que deseja apagar esta nota fiscal?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"

                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ NotaFiscalId: id });
                            var url = "/api/NotaFiscal/Delete";
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
                                            $("#tblNotaFiscal")
                                                .DataTable()
                                                .ajax.reload(null, false);
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "notafiscal_<num>.js",
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
                                            "notafiscal_<num>.js",
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
                            "notafiscal_<num>.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("notafiscal_<num>.js", "callback@$.on#2", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("notafiscal_<num>.js", "callback@$.ready#0", error);
    }
});

function GetEmpenhoList(id)
{
    try
    {
        $.ajax({
            url: "api/NotaFiscal/EmpenhoList",
            method: "GET",
            data: { id: id },
            success: function (res)
            {
                var option = '<option value="">-- Selecione um Empenho --</option>';
                if (res != null && res.data.length)
                {
                    res.data.forEach(function (obj)
                    {
                        option += '<option value="' + obj.empenhoId + '">' + obj.notaEmpenho + '</option>';
                    });
                }
                $('#ListaEmpenhos').empty().append(option);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("Index.cshtml", "GetEmpenhoList", error);
    }
}

function GetEmpenhoListAta(id)
{
    try
    {
        $.ajax({
            url: "api/NotaFiscal/EmpenhoListAta",
            method: "GET",
            data: { id: id },
            success: function (res)
            {
                var option = '<option value="">-- Selecione um Empenho --</option>';
                if (res != null && res.data.length)
                {
                    res.data.forEach(function (obj)
                    {
                        option += '<option value="' + obj.empenhoId + '">' + obj.notaEmpenho + '</option>';
                    });
                }
                $('#ListaEmpenhos').empty().append(option);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("Index.cshtml", "GetEmpenhoListAta", error);
    }
}
