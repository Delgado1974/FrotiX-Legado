var dataTable;
var placaBronzeInitialized = false; // Flag para prevenir inicialização dupla

$(document).ready(function ()
{
    try
    {
        // Previne inicialização múltipla
        if (placaBronzeInitialized)
        {
            console.warn('placabronze.js já foi inicializado - ignorando');
            return;
        }
        placaBronzeInitialized = true;

        console.log('✓ Inicializando placabronze.js');

        loadList();

        // Remove event listeners anteriores antes de adicionar novos
        $(document).off("click", ".btn-delete");
        $(document).off("click", ".btn-desvincular");
        $(document).off("click", ".updateStatusPlacaBronze");

        // Event handler para DELETE
        $(document).on("click", ".btn-delete", function (e)
        {
            e.preventDefault();
            e.stopImmediatePropagation(); // Previne propagação duplicada

            try
            {
                var id = $(this).data("id");
                console.log('Delete clicado - ID:', id);

                Alerta.Confirmar(
                    "Confirmar Exclusão",
                    "Você tem certeza que deseja apagar esta placa? Não será possível recuperar os dados eliminados!",
                    "Sim, excluir",
                    "Cancelar"
                ).then((willDelete) =>
                {
                    try
                    {
                        if (willDelete)
                        {
                            var dataToPost = JSON.stringify({ PlacaBronzeId: id });
                            var url = "/api/PlacaBronze/Delete";

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
                                        console.log('Resposta do servidor:', data);

                                        if (data.success)
                                        {
                                            if (typeof AppToast !== 'undefined')
                                            {
                                                AppToast.show("Verde", data.message, 2000);
                                            }
                                            else
                                            {
                                                console.warn('AppToast não disponível');
                                                alert(data.message);
                                            }
                                            dataTable.ajax.reload();
                                        }
                                        else
                                        {
                                            if (typeof AppToast !== 'undefined')
                                            {
                                                AppToast.show("Vermelho", data.message, 2000);
                                            }
                                            else
                                            {
                                                alert(data.message);
                                            }
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha("placabronze.js", "ajax.Delete.success", error);
                                    }
                                },
                                error: function (err)
                                {
                                    try
                                    {
                                        console.error('Erro na requisição:', err);
                                        if (typeof AppToast !== 'undefined')
                                        {
                                            AppToast.show("Vermelho", "Erro ao excluir a placa de bronze. Tente novamente.", 2000);
                                        }
                                        else
                                        {
                                            alert("Erro ao excluir a placa de bronze. Tente novamente.");
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha("placabronze.js", "ajax.Delete.error", error);
                                    }
                                },
                            });
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("placabronze.js", "btn-delete.Confirmar.then", error);
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("placabronze.js", "btn-delete.click", error);
            }
        });

        // Event handler para DESVINCULAR
        $(document).on("click", ".btn-desvincular", function (e)
        {
            e.preventDefault();
            e.stopImmediatePropagation();

            try
            {
                var id = $(this).data("id");
                console.log('Desvincular clicado - ID:', id);

                Alerta.Confirmar(
                    "Confirmar Desvinculação",
                    "Você tem certeza que deseja desvincular esse veículo? Você precisará reassociá-lo se for o caso!",
                    "Sim, desvincular",
                    "Cancelar"
                ).then((willDelete) =>
                {
                    try
                    {
                        if (willDelete)
                        {
                            var dataToPost = JSON.stringify({ PlacaBronzeId: id });
                            var url = "/api/PlacaBronze/Desvincula";

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
                                            if (typeof AppToast !== 'undefined')
                                            {
                                                AppToast.show("Verde", data.message, 2000);
                                            }
                                            else
                                            {
                                                alert(data.message);
                                            }
                                            dataTable.ajax.reload();
                                        }
                                        else
                                        {
                                            if (typeof AppToast !== 'undefined')
                                            {
                                                AppToast.show("Vermelho", data.message, 2000);
                                            }
                                            else
                                            {
                                                alert(data.message);
                                            }
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha("placabronze.js", "ajax.Desvincula.success", error);
                                    }
                                },
                                error: function (err)
                                {
                                    try
                                    {
                                        console.error(err);
                                        if (typeof AppToast !== 'undefined')
                                        {
                                            AppToast.show("Vermelho", "Erro ao desvincular o veículo. Tente novamente.", 2000);
                                        }
                                        else
                                        {
                                            alert("Erro ao desvincular o veículo. Tente novamente.");
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha("placabronze.js", "ajax.Desvincula.error", error);
                                    }
                                },
                            });
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("placabronze.js", "btn-desvincular.Confirmar.then", error);
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("placabronze.js", "btn-desvincular.click", error);
            }
        });

        // Event handler para UPDATE STATUS
        $(document).on("click", ".updateStatusPlacaBronze", function (e)
        {
            e.preventDefault();
            e.stopImmediatePropagation();

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
                            if (typeof AppToast !== 'undefined')
                            {
                                AppToast.show("Verde", data.message, 2000);
                            }

                            var text = "Ativo";

                            if (data.type == 1)
                            {
                                text = "Inativo";
                                currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                            }
                            else
                            {
                                currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                            }

                            currentElement.text(text);
                        }
                        else
                        {
                            if (typeof AppToast !== 'undefined')
                            {
                                AppToast.show("Vermelho", "Erro ao alterar o status. Tente novamente.", 2000);
                            }
                            else
                            {
                                alert("Erro ao alterar o status. Tente novamente.");
                            }
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("placabronze.js", "updateStatusPlacaBronze.get.callback", error);
                    }
                })
                    .fail(function (jqXHR)
                    {
                        try
                        {
                            console.error(jqXHR);
                            if (typeof AppToast !== 'undefined')
                            {
                                AppToast.show("Vermelho", "Ocorreu um erro ao alterar o status da placa", 2000);
                            }
                            else
                            {
                                alert("Ocorreu um erro ao alterar o status da placa");
                            }
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("placabronze.js", "updateStatusPlacaBronze.get.fail", error);
                        }
                    });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("placabronze.js", "updateStatusPlacaBronze.click", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("placabronze.js", "document.ready", error);
    }
});

function loadList()
{
    try
    {
        // Destrói instância anterior do DataTable se existir
        if ($.fn.DataTable.isDataTable('#tblPlacaBronze'))
        {
            console.log('Destruindo DataTable anterior');
            $('#tblPlacaBronze').DataTable().destroy();
        }

        console.log('Inicializando DataTable');

        dataTable = $("#tblPlacaBronze").DataTable({
            columnDefs: [
                {
                    targets: 0, // Descrição da Placa
                    className: "text-left",
                    width: "40%",
                },
                {
                    targets: 1, // Veículo Associado
                    className: "text-center",
                    width: "15%",
                },
                {
                    targets: 2, // Status
                    className: "text-center",
                    width: "10%",
                },
                {
                    targets: 3, // Ações
                    className: "text-center",
                    width: "15%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/placaBronze",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "descricaoPlaca" },
                { data: "placaVeiculo" },
                {
                    data: "status",
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            if (data)
                            {
                                return '<a href="javascript:void(0)" ' +
                                    'class="updateStatusPlacaBronze btn btn-verde text-white" ' +
                                    'data-url="/api/PlacaBronze/updateStatusPlacaBronze?Id=' + row.placaBronzeId + '" ' +
                                    'data-ejtip="Placa ativa - clique para inativar" ' +
                                    'style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">' +
                                    'Ativo</a>';
                            }
                            else
                            {
                                return '<a href="javascript:void(0)" ' +
                                    'class="updateStatusPlacaBronze btn fundo-cinza text-white text-bold" ' +
                                    'data-url="/api/PlacaBronze/updateStatusPlacaBronze?Id=' + row.placaBronzeId + '" ' +
                                    'data-ejtip="Placa inativa - clique para ativar" ' +
                                    'style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">' +
                                    'Inativo</a>';
                            }
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("placabronze.js", "DataTable.render.status", error);
                            return "";
                        }
                    },
                },
                {
                    data: "placaBronzeId",
                    render: function (data)
                    {
                        try
                        {
                            return `<div class="text-center">
                                <a href="/PlacaBronze/Upsert?id=${data}" 
                                   class="btn btn-azul text-white" 
                                   data-ejtip="Editar placa de bronze"
                                   aria-label="Editar placa de bronze"
                                   style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn-delete btn btn-vinho text-white" 
                                   data-id="${data}"
                                   data-ejtip="Excluir placa de bronze"
                                   aria-label="Excluir placa de bronze"
                                   style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">
                                    <i class="far fa-trash-alt"></i>
                                </a>
                                <a class="btn-desvincular btn btn-fundo-laranja text-white" 
                                   data-id="${data}"
                                   data-ejtip="Desvincular veículo da placa"
                                   aria-label="Desvincular veículo"
                                   style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">
                                    <i class="far fa-unlink"></i>
                                </a>
                            </div>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("placabronze.js", "DataTable.render.acoes", error);
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

        console.log('✓ DataTable inicializado com sucesso');
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("placabronze.js", "loadList", error);
    }
}
