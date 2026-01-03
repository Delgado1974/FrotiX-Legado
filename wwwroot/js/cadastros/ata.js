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
                    "Você tem certeza que deseja apagar esta ata?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar",
                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ AtaId: id });
                            var url = "/api/AtaRegistroPrecos/Delete";
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
                                            "ata.js",
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
                                            "ata.js",
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
                            "ata.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ata.js", "callback@$.on#2", error);
            }
        });

        $(document).on("click", ".updateStatusAta", function () {
            try
            {
                var url = $(this).data("url");
                var currentElement = $(this);

                $.get(url, function (data) {
                    try
                    {
                        if (data.success) {
                            AppToast.show('Verde', "Status alterado com sucesso!");

                            // Inverte o status baseado no estado atual do elemento
                            if (currentElement.hasClass("btn-verde")) {
                                // Era Ativo, agora é Inativo
                                currentElement
                                    .removeClass("btn-verde")
                                    .addClass("fundo-cinza")
                                    .html('<i class="fa-duotone fa-circle-xmark"></i> Inativo');
                            } else {
                                // Era Inativo, agora é Ativo
                                currentElement
                                    .removeClass("fundo-cinza")
                                    .addClass("btn-verde")
                                    .html('<i class="fa-duotone fa-circle-check"></i> Ativo');
                            }
                        } else {
                            AppToast.show('Vermelho', 'Erro ao alterar status!');
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("ata.js", "updateStatusAta.get.success", error);
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("ata.js", "updateStatusAta.click", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("ata.js", "callback@$.ready#0", error);
    }
});

function loadList() {
    try
    {
        dataTable = $("#tblAta").DataTable({
            order: [[0, "desc"]],
            columnDefs: [
                {
                    targets: 0, // Ata
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
                    targets: 6, // Status
                    className: "text-center",
                    width: "5%",
                },
                {
                    targets: 7, // Ação
                    className: "text-center",
                    width: "5%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/ataregistroprecos",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "ataCompleta" },
                { data: "processoCompleto" },
                { data: "objeto" },
                { data: "descricaoFornecedor" },
                { data: "periodo" },
                { data: "valorFormatado" },
                {
                    data: "status",
                    render: function (data, type, row, meta) {
                        try
                        {
                            if (data)
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusAta ftx-badge-status btn-verde" 
                                           data-url="/api/AtaRegistroPrecos/updateStatusAta?Id=${row.ataId}"
                                           style="cursor:pointer;">
                                           <i class="fa-duotone fa-circle-check"></i>
                                           Ativo
                                        </a>`;
                            else
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusAta ftx-badge-status fundo-cinza" 
                                           data-url="/api/AtaRegistroPrecos/updateStatusAta?Id=${row.ataId}"
                                           style="cursor:pointer;">
                                           <i class="fa-duotone fa-circle-xmark"></i>
                                           Inativo
                                        </a>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ata.js", "render.status", error);
                        }
                    },
                },
                {
                    data: "ataId",
                    render: function (data) {
                        try
                        {
                            return `<div class="ftx-actions">
                                        <a href="/AtaRegistroPrecos/Upsert?id=${data}" 
                                           class="btn btn-azul btn-icon-28" 
                                           data-ejtip="Editar Ata"
                                           style="cursor:pointer;">
                                            <i class="fa-duotone fa-pen-to-square"></i>
                                        </a>
                                        <a href="javascript:void(0)" 
                                           class="btn btn-delete btn-vinho btn-icon-28" 
                                           data-ejtip="Excluir Ata"
                                           style="cursor:pointer;" 
                                           data-id="${data}">
                                            <i class="fa-duotone fa-trash-can"></i>
                                        </a>
                                    </div>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("ata.js", "render.actions", error);
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
        Alerta.TratamentoErroComLinha("ata.js", "loadList", error);
    }
}
