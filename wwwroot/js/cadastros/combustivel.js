/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/Pages/Combustivel - Index.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo contém a lógica JavaScript do DataTable e ações da página de
    listagem de Tipos de Combustível. Para entender completamente a funcionalidade,
    consulte a documentação acima.
    ═══════════════════════════════════════════════════════════════════════════════
*/

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
                    "Você tem certeza que deseja apagar este tipo de combustível?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"

                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ CombustivelId: id });
                            var url = "/api/Combustivel/Delete";
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
                                            "combustivel.js",
                                            "success",
                                            error,
                                        );
                                    }
                                },
                                error: function (err) {
                                    try
                                    {
                                        console.log(err);
                                        AppToast.show('Vermelho', 'Erro ao excluir o combustível');
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "combustivel.js",
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
                            "combustivel.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("combustivel.js", "callback@$.on#2", error);
            }
        });

        $(document).on("click", ".updateStatusCombustivel", function () {
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
                        } else AppToast.show('Vermelho', 'Erro ao alterar o status');
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "combustivel.js",
                            "callback@$.get#1",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("combustivel.js", "callback@$.on#2", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("combustivel.js", "callback@$.ready#0", error);
    }
});

function loadList() {
    try
    {
        dataTable = $("#tblCombustivel").DataTable({
            columnDefs: [
                {
                    targets: 1,
                    className: "text-center",
                    width: "15%",
                },
                {
                    targets: 2,
                    className: "text-center",
                    width: "15%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/combustivel",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "descricao", width: "70%" },
                {
                    data: "status",
                    render: function (data, type, row, meta) {
                        try
                        {
                            if (data)
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusCombustivel btn btn-verde btn-xs text-white" 
                                           data-url="/api/Combustivel/UpdateStatusCombustivel?Id=${row.combustivelId}">Ativo</a>`;
                            else
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusCombustivel btn btn-xs fundo-cinza text-white text-bold" 
                                           data-url="/api/Combustivel/UpdateStatusCombustivel?Id=${row.combustivelId}">Inativo</a>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("combustivel.js", "render@status", error);
                        }
                    },
                    width: "15%",
                },
                {
                    data: "combustivelId",
                    render: function (data) {
                        try
                        {
                            return `<div class="ftx-actions">
                                <a href="/Combustivel/Upsert?id=${data}" 
                                   class="btn btn-icon-28 btn-azul" 
                                   data-ejtip="Editar combustível">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a href="javascript:void(0)" 
                                   class="btn-delete btn btn-icon-28 btn-vinho" 
                                   data-ejtip="Excluir combustível"
                                   data-id="${data}">
                                    <i class="far fa-trash-alt"></i>
                                </a>
                            </div>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("combustivel.js", "render@acoes", error);
                        }
                    },
                    width: "15%",
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
        Alerta.TratamentoErroComLinha("combustivel.js", "loadList", error);
    }
}
