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
                    "Você tem certeza que deseja apagar este contrato?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"

                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ ContratoId: id });
                            var url = "/api/Contrato/Delete";
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
                                            "contrato_<num>.js",
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
                                            "contrato_<num>.js",
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
                            "contrato_<num>.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("contrato_<num>.js", "callback@$.on#2", error);
            }
        });

        $(document).on("click", ".updateStatusContrato", function () {
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
                            "contrato_<num>.js",
                            "callback@$.get#1",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("contrato_<num>.js", "callback@$.on#2", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("contrato_<num>.js", "callback@$.ready#0", error);
    }
});

function loadList() {
    try
    {
        dataTable = $("#tblContrato").DataTable({
            order: [[0, "desc"]],

            columnDefs: [
                {
                    targets: 0, // Contrato
                    className: "text-center",
                    width: "5%",
                },
                {
                    targets: 1, // Processo Completo
                    className: "text-center",
                    width: "6%",
                },
                {
                    targets: 2, // Objeto
                    className: "text-left",
                    width: "12%",
                },
                {
                    targets: 3, // Fornecedor
                    className: "text-left",
                    width: "12%",
                },
                {
                    targets: 4, // Vigência
                    className: "text-center",
                    width: "9%",
                },
                {
                    targets: 5, // Valor
                    className: "text-right",
                    width: "8%",
                },
                {
                    targets: 6, // Valor Mensal
                    className: "text-right",
                    width: "8%",
                },
                {
                    targets: 7, // Prorrogação
                    className: "text-center",
                    width: "10%",
                },
                {
                    targets: 8, // Status
                    className: "text-center",
                    width: "5%",
                },
                {
                    targets: 9, // Ação
                    className: "text-center",
                    width: "12%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/contrato",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "contratoCompleto" },
                { data: "processoCompleto" },
                { data: "objeto" },
                { data: "descricaoFornecedor" },
                { data: "periodo" },
                { data: "valorFormatado" },
                { data: "valorMensal" },
                { data: "vigenciaCompleta" },
                {
                    data: "status",
                    render: function (data, type, row, meta) {
                        try
                        {
                            if (data)
                                return (
                                    '<a href="javascript:void" class="updateStatusContrato btn btn-verde btn-xs text-white" data-url="/api/Contrato/updateStatusContrato?Id=' +
                                    row.contratoId +
                                    '">Ativo</a>'
                                );
                            else
                                return (
                                    '<a href="javascript:void" class="updateStatusContrato btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Contrato/updateStatusContrato?Id=' +
                                    row.contratoId +
                                    '">Inativo</a>'
                                );
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("contrato_<num>.js", "render", error);
                        }
                    },
                },
                {
                    data: "contratoId",
                    render: function (data) {
                        try
                        {
                            return `<div class="text-center">
                                <a href="/Contrato/Upsert?id=${data}" class="btn btn-azul btn-xs text-white"  aria-label="Editar o Contrato!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px">
                                    <i class="far fa-edit"></i>
                                </a>

                                <a class="btn btn-delete btn-vinho btn-xs text-white" aria-label="Excluir o Contrato!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>

                                <a class="btn btn-documentos btn-info btn-xs text-white" aria-label="Documentos do Contrato!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}'>
                                    <i class="fal fa-file-pdf"></i>
                                </a>

                                <a class="btn btn-itens fundo-cinza btn-xs text-white" aria-label="Itens do Contrato!" data-microtip-position="top" role="tooltip" style="cursor:pointer;margin: 2px " data-id='${data}'>
                                    <i class="fal fa-sitemap"></i>
                                </a>

                                <a href="/Contrato/RepactuacaoContrato?id=${data}" class="btn btn-repactuacao fundo-chocolate btn-xs text-white" aria-label="Adiciona Repactuação!" data-microtip-position="top" role="tooltip" style="cursor:pointer;margin: 2px " data-id='${data}'>
                                    <i class="fal fa-handshake"></i>
                                </a>


                    </div>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("contrato_<num>.js", "render", error);
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
        Alerta.TratamentoErroComLinha("contrato_<num>.js", "loadList", error);
    }
}
