/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/Pages/MarcaVeiculo - Index.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo contém a lógica JavaScript do DataTable e ações da página de
    listagem de Marcas de Veículos. Para entender completamente a funcionalidade,
    consulte a documentação acima.
    ═══════════════════════════════════════════════════════════════════════════════
*/

var dataTable;

$(document).ready(function ()
{
    try
    {
        loadList();

        $(document).on("click", ".btn-delete", function ()
        {
            try
            {
                var id = $(this).data("id");

                Alerta.Confirmar(
                    "Confirmar Exclusão",
                    "Você tem certeza que deseja apagar esta marca de veículo? Não será possível recuperar os dados eliminados!",
                    "Sim, excluir",
                    "Cancelar"
                ).then(function (confirmed)
                {
                    try
                    {
                        if (confirmed)
                        {
                            var dataToPost = JSON.stringify({ MarcaId: id });
                            var url = "/api/MarcaVeiculo/Delete";
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
                                            AppToast.show("Verde", data.message, 2000);
                                            dataTable.ajax.reload();
                                        } else
                                        {
                                            AppToast.show("Vermelho", data.message, 2000);
                                        }
                                    } catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha("marcaveiculo.js", "ajax.success", error);
                                    }
                                },
                                error: function (err)
                                {
                                    try
                                    {
                                        console.log(err);
                                        Alerta.Erro("Erro", "Ocorreu um erro ao tentar excluir a marca de veículo.");
                                    } catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha("marcaveiculo.js", "ajax.error", error);
                                    }
                                }
                            });
                        }
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("marcaveiculo.js", "confirmar.then", error);
                    }
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("marcaveiculo.js", "click.btn-delete", error);
            }
        });

        $(document).on("click", ".updateStatusMarcaVeiculo", function ()
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
                            var text = "Ativo";

                            if (data.type == 1)
                            {
                                text = "Inativo";
                                currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                            } else
                            {
                                currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                            }

                            currentElement.text(text);
                        } else
                        {
                            Alerta.Erro("Erro", "Ocorreu um erro ao alterar o status da marca.");
                        }
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("marcaveiculo.js", "get.success", error);
                    }
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("marcaveiculo.js", "click.updateStatusMarcaVeiculo", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("marcaveiculo.js", "document.ready", error);
    }
});

function loadList()
{
    try
    {
        dataTable = $("#tblMarcaVeiculo").DataTable({
            columnDefs: [
                {
                    targets: 1,
                    className: "text-center",
                    width: "20%"
                },
                {
                    targets: 2,
                    className: "text-center",
                    width: "20%"
                }
            ],
            responsive: true,
            ajax: {
                url: "/api/marcaVeiculo",
                type: "GET",
                datatype: "json"
            },
            columns: [
                { data: "descricaoMarca", width: "30%" },
                {
                    data: "status",
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            if (data)
                            {
                                return '<a href="javascript:void(0)" ' +
                                    'class="updateStatusMarcaVeiculo btn btn-verde text-white" ' +
                                    'data-url="/api/MarcaVeiculo/updateStatusMarcaVeiculo?Id=' + row.marcaId + '" ' +
                                    'data-ejtip="Marca ativa - clique para inativar" ' +
                                    'style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">' +
                                    'Ativo</a>';
                            }
                            else
                            {
                                return '<a href="javascript:void(0)" ' +
                                    'class="updateStatusMarcaVeiculo btn fundo-cinza text-white text-bold" ' +
                                    'data-url="/api/MarcaVeiculo/updateStatusMarcaVeiculo?Id=' + row.marcaId + '" ' +
                                    'data-ejtip="Marca inativa - clique para ativar" ' +
                                    'style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">' +
                                    'Inativo</a>';
                            }
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("marcaveiculo.js", "render.status", error);
                            return "";
                        }
                    },
                    className: "text-center",
                    width: "10%"
                },
                     {
                    data: "marcaId",
                    render: function (data)
                    {
                        try
                        {
                            return `<div class="text-center">
                                <a href="/MarcaVeiculo/Upsert?id=${data}" class="btn btn-azul text-white" data-ejtip="Editar marca de veículo" style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn-delete btn btn-vinho text-white" data-ejtip="Excluir marca de veículo" style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                            </div>`;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("marcaveiculo.js", "render.acoes", error);
                        }
                    },
                    width: "20%"
                }
            ],
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                emptyTable: "Sem Dados para Exibição"
            },
            width: "100%"
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("marcaveiculo.js", "loadList", error);
    }
}
