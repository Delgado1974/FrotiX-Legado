/*
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                          ║
 * ║  📚 DOCUMENTAÇÃO DISPONÍVEL                                              ║
 * ║                                                                          ║
 * ║  Este arquivo está completamente documentado em:                         ║
 * ║  📄 Documentacao/Pages/Contrato - Index.md                                ║
 * ║                                                                          ║
 * ║  A documentação inclui:                                                   ║
 * ║  • Explicação detalhada de todas as funções principais                   ║
 * ║  • Sistema de validação de dependências                                  ║
 * ║  • Gestão de status com bloqueio de ações                                ║
 * ║  • Handlers de eventos                                                   ║
 * ║  • Interconexões com outros módulos                                      ║
 * ║                                                                          ║
 * ║  Última atualização: 08/01/2026                                          ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

var dataTable;

$(document).ready(function () {
    try {
        loadList();

        $(document).on("click", ".btn-delete", function () {
            try {
                var id = $(this).data("id");
                console.log("Verificando dependências do contrato:", id);

                // Primeiro verifica se há dependências
                $.ajax({
                    url: "/api/Contrato/VerificarDependencias?id=" + id,
                    type: "GET",
                    dataType: "json",
                    success: function (result) {
                        try {
                            console.log("Resultado da verificação:", result);
                            
                            if (result.success && result.possuiDependencias) {
                                // Não pode excluir - mostrar mensagem com detalhes
                                var mensagem = "Este contrato não pode ser excluído pois possui:\n\n";
                                
                                if (result.veiculosContrato > 0) {
                                    mensagem += "• " + result.veiculosContrato + " veículo(s) associado(s)\n";
                                }
                                if (result.encarregados > 0) {
                                    mensagem += "• " + result.encarregados + " encarregado(s) vinculado(s)\n";
                                }
                                if (result.operadores > 0) {
                                    mensagem += "• " + result.operadores + " operador(es) vinculado(s)\n";
                                }
                                if (result.lavadores > 0) {
                                    mensagem += "• " + result.lavadores + " lavador(es) vinculado(s)\n";
                                }
                                if (result.motoristas > 0) {
                                    mensagem += "• " + result.motoristas + " motorista(s) vinculado(s)\n";
                                }
                                if (result.empenhos > 0) {
                                    mensagem += "• " + result.empenhos + " empenho(s) vinculado(s)\n";
                                }
                                if (result.notasFiscais > 0) {
                                    mensagem += "• " + result.notasFiscais + " nota(s) fiscal(is) vinculada(s)\n";
                                }
                                
                                mensagem += "\nRemova as associações antes de excluir o contrato.";
                                
                                Alerta.Warning("Exclusão não permitida", mensagem);
                            } else {
                                // Pode excluir - mostrar confirmação
                                Alerta.Confirmar(
                                    "Você tem certeza que deseja apagar este contrato?",
                                    "Não será possível recuperar os dados eliminados!",
                                    "Excluir",
                                    "Cancelar"
                                ).then((willDelete) => {
                                    try {
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
                                                    try {
                                                        if (data.success) {
                                                            AppToast.show('Verde', data.message);
                                                            dataTable.ajax.reload();
                                                        } else {
                                                            AppToast.show('Vermelho', data.message);
                                                        }
                                                    } catch (error) {
                                                        Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.ajax.success", error);
                                                    }
                                                },
                                                error: function (err) {
                                                    try {
                                                        console.log(err);
                                                        AppToast.show('Vermelho', 'Erro ao excluir o contrato!');
                                                    } catch (error) {
                                                        Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.ajax.error", error);
                                                    }
                                                }
                                            });
                                        }
                                    } catch (error) {
                                        Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.confirm.then", error);
                                    }
                                });
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.verificar.success", error);
                        }
                    },
                    error: function (xhr, status, error) {
                        try {
                            console.log("Erro na API VerificarDependencias:", xhr.status, error);
                            console.log("Resposta:", xhr.responseText);
                            
                            // Se a API falhar, mostra confirmação normal (fallback)
                            Alerta.Confirmar(
                                "Você tem certeza que deseja apagar este contrato?",
                                "Não será possível recuperar os dados eliminados!",
                                "Excluir",
                                "Cancelar"
                            ).then((willDelete) => {
                                try {
                                    if (willDelete) {
                                        var dataToPost = JSON.stringify({ ContratoId: id });
                                        $.ajax({
                                            url: "/api/Contrato/Delete",
                                            type: "POST",
                                            data: dataToPost,
                                            contentType: "application/json; charset=utf-8",
                                            dataType: "json",
                                            success: function (data) {
                                                if (data.success) {
                                                    AppToast.show('Verde', data.message);
                                                    dataTable.ajax.reload();
                                                } else {
                                                    AppToast.show('Vermelho', data.message);
                                                }
                                            },
                                            error: function () {
                                                AppToast.show('Vermelho', 'Erro ao excluir o contrato!');
                                            }
                                        });
                                    }
                                } catch (err) {
                                    Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.fallback.then", err);
                                }
                            });
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.verificar.error", error);
                        }
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.click", error);
            }
        });

        $(document).on("click", ".updateStatusContrato", function () {
            try {
                var url = $(this).data("url");
                var currentElement = $(this);
                var row = currentElement.closest('tr');

                $.get(url, function (data) {
                    try {
                        if (data.success) {
                            AppToast.show('Verde', "Status alterado com sucesso!");

                            // Botões que devem ser bloqueados/desbloqueados (exceto Editar e Excluir)
                            var botoesBloqueaveis = row.find('.btn-documentos, .btn-itens, .btn-repactuacao');

                            // Inverte o status baseado no estado atual do elemento
                            if (currentElement.hasClass("btn-verde")) {
                                // Era Ativo, agora é Inativo - BLOQUEAR botões
                                currentElement
                                    .removeClass("btn-verde")
                                    .addClass("fundo-cinza")
                                    .html('<i class="fa-duotone fa-circle-xmark"></i> Inativo');
                                
                                // Bloquear botões
                                botoesBloqueaveis
                                    .addClass('disabled')
                                    .css({ 'pointer-events': 'none', 'opacity': '0.5' });
                                
                                // Remover href do botão de repactuação
                                row.find('.btn-repactuacao').attr('href', 'javascript:void(0)');
                            } else {
                                // Era Inativo, agora é Ativo - DESBLOQUEAR botões
                                currentElement
                                    .removeClass("fundo-cinza")
                                    .addClass("btn-verde")
                                    .html('<i class="fa-duotone fa-circle-check"></i> Ativo');
                                
                                // Desbloquear botões
                                botoesBloqueaveis
                                    .removeClass('disabled')
                                    .css({ 'pointer-events': '', 'opacity': '' });
                                
                                // Restaurar href do botão de repactuação
                                var contratoId = row.find('.btn-repactuacao').data('id');
                                row.find('.btn-repactuacao').attr('href', '/Contrato/RepactuacaoContrato?id=' + contratoId);
                            }
                        } else {
                            AppToast.show('Vermelho', 'Erro ao alterar status!');
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("contrato.js", "updateStatusContrato.get.success", error);
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("contrato.js", "updateStatusContrato.click", error);
            }
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("contrato.js", "document.ready", error);
    }
});

function loadList() {
    try {
        dataTable = $("#tblContrato").DataTable({
            order: [[0, "desc"]],

            columnDefs: [
                {
                    targets: 0, // Contrato
                    className: "text-center",
                    width: "6%"
                },
                {
                    targets: 1, // Processo Completo
                    className: "text-center",
                    width: "7%"
                },
                {
                    targets: 2, // Objeto
                    className: "text-left",
                    width: "14%"
                },
                {
                    targets: 3, // Fornecedor
                    className: "text-left",
                    width: "14%"
                },
                {
                    targets: 4, // Vigência
                    className: "text-center",
                    width: "9%"
                },
                {
                    targets: 5, // Valor Anual
                    className: "text-right",
                    width: "8%"
                },
                {
                    targets: 6, // Valor Mensal
                    className: "text-right",
                    width: "8%"
                },
                {
                    targets: 7, // Prorrogação
                    className: "text-center",
                    width: "8%"
                },
                {
                    targets: 8, // Status
                    className: "text-center",
                    width: "6%"
                },
                {
                    targets: 9, // Ação
                    className: "text-center",
                    width: "12%",
                    orderable: false
                }
            ],

            responsive: true,
            ajax: {
                url: "/api/contrato",
                type: "GET",
                datatype: "json"
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
                        try {
                            if (data) {
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusContrato ftx-badge-status btn-verde" 
                                           data-url="/api/Contrato/updateStatusContrato?Id=${row.contratoId}">
                                           <i class="fa-duotone fa-circle-check"></i>
                                           Ativo
                                        </a>`;
                            } else {
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusContrato ftx-badge-status fundo-cinza" 
                                           data-url="/api/Contrato/updateStatusContrato?Id=${row.contratoId}">
                                           <i class="fa-duotone fa-circle-xmark"></i>
                                           Inativo
                                        </a>`;
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("contrato.js", "render.status", error);
                        }
                    }
                },
                {
                    data: "contratoId",
                    render: function (data, type, row) {
                        try {
                            // Verifica se o contrato está inativo
                            var isInativo = !row.status;
                            var disabledClass = isInativo ? 'disabled' : '';
                            var disabledStyle = isInativo ? 'pointer-events: none; opacity: 0.5;' : '';
                            
                            return `<div class="ftx-actions" data-contrato-id="${data}">
                                        <a href="/Contrato/Upsert?id=${data}" 
                                           class="btn btn-azul btn-icon-28" 
                                           data-ejtip="Editar Contrato"
                                           style="cursor:pointer;">
                                            <i class="fa-duotone fa-pen-to-square"></i>
                                        </a>
                                        <a href="javascript:void(0)" 
                                           class="btn btn-delete btn-vinho btn-icon-28" 
                                           data-ejtip="Excluir Contrato"
                                           style="cursor:pointer;"
                                           data-id="${data}">
                                            <i class="fa-duotone fa-trash-can"></i>
                                        </a>
                                        <a href="javascript:void(0)" 
                                           class="btn btn-documentos btn-info btn-icon-28 ${disabledClass}" 
                                           data-ejtip="Documentos do Contrato"
                                           style="cursor:pointer; ${disabledStyle}"
                                           data-id="${data}">
                                            <i class="fa-duotone fa-file-pdf"></i>
                                        </a>
                                        <a href="${isInativo ? 'javascript:void(0)' : '/Contrato/ItensContrato?contratoId=' + data}" 
                                           class="btn btn-itens fundo-cinza btn-icon-28 ${disabledClass}" 
                                           data-ejtip="Itens do Contrato"
                                           style="cursor:pointer; ${disabledStyle}"
                                           data-id="${data}">
                                            <i class="fa-duotone fa-sitemap"></i>
                                        </a>
                                        <a href="${isInativo ? 'javascript:void(0)' : '/Contrato/RepactuacaoContrato?id=' + data}" 
                                           class="btn btn-repactuacao fundo-chocolate btn-icon-28 ${disabledClass}" 
                                           data-ejtip="Adicionar Repactuação"
                                           style="cursor:pointer; ${disabledStyle}"
                                           data-id="${data}">
                                            <i class="fa-duotone fa-handshake"></i>
                                        </a>
                                    </div>`;
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("contrato.js", "render.actions", error);
                        }
                    }
                }
            ],

            language: {
                url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                emptyTable: "Sem Dados para Exibição"
            },
            width: "100%"
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("contrato.js", "loadList", error);
    }
}
