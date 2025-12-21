/**
 * empenho.js - Gestão de Empenhos
 * FrotiX - Sistema de Gestão de Frotas
 * Padrão: Try-Catch com Alerta.TratamentoErroComLinha em TODAS as funções
 */

var dataTable;

$(document).ready(function () {
    try {
        // Inicialização - a lógica principal está no Index.cshtml
        // Este arquivo contém funções auxiliares e handlers delegados

        // Handler para exclusão de empenho (delegado para funcionar com DataTable dinâmico)
        $(document).on("click", ".btn-delete", function () {
            try {
                var id = $(this).data("id");

                Alerta.Confirmar(
                    "Você tem certeza que deseja apagar este empenho?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"
                ).then((willDelete) => {
                    try {
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
                                    try {
                                        if (data.success) {
                                            AppToast.show('Verde', data.message);
                                            $("#tblEmpenho").DataTable().ajax.reload(null, false);
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    } catch (error) {
                                        Alerta.TratamentoErroComLinha(
                                            "empenho.js",
                                            "btn-delete.ajax.success",
                                            error
                                        );
                                    }
                                },
                                error: function (err) {
                                    try {
                                        console.error("Erro ao excluir empenho:", err);
                                        AppToast.show('Vermelho', 'Erro ao excluir o empenho. Tente novamente.');
                                    } catch (error) {
                                        Alerta.TratamentoErroComLinha(
                                            "empenho.js",
                                            "btn-delete.ajax.error",
                                            error
                                        );
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha(
                            "empenho.js",
                            "btn-delete.swal.then",
                            error
                        );
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("empenho.js", "btn-delete.click", error);
            }
        });

        // Handler para alterar status do empenho (se existir)
        $(document).on("click", ".updateStatusEmpenho", function () {
            try {
                var url = $(this).data("url");
                var currentElement = $(this);

                $.get(url, function (data) {
                    try {
                        if (data.success) {
                            AppToast.show('Verde', "Status alterado com sucesso!");
                            var text = "Ativo";

                            if (data.type == 1) {
                                text = "Inativo";
                                currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                            } else {
                                currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                            }

                            currentElement.text(text);
                        } else {
                            AppToast.show('Vermelho', 'Erro ao alterar o status.');
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha(
                            "empenho.js",
                            "updateStatusEmpenho.get.success",
                            error
                        );
                    }
                }).fail(function (err) {
                    try {
                        console.error("Erro ao alterar status:", err);
                        AppToast.show('Vermelho', 'Erro ao alterar o status. Tente novamente.');
                    } catch (error) {
                        Alerta.TratamentoErroComLinha(
                            "empenho.js",
                            "updateStatusEmpenho.get.fail",
                            error
                        );
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("empenho.js", "updateStatusEmpenho.click", error);
            }
        });

        // Handler para exclusão de nota fiscal (delegado)
        $(document).on("click", ".btn-delete-nf", function () {
            try {
                var id = $(this).data("id");

                Alerta.Confirmar(
                    "Você tem certeza que deseja apagar esta Nota Fiscal?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"
                ).then((willDelete) => {
                    try {
                        if (willDelete) {
                            $.ajax({
                                url: "/api/NotaFiscal/Delete",
                                type: "POST",
                                data: JSON.stringify({ NotaFiscalId: id }),
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data) {
                                    try {
                                        if (data.success) {
                                            AppToast.show('Verde', data.message);
                                            $("#tblNotaFiscal").DataTable().ajax.reload(null, false);
                                            // Também recarregar a tabela de empenhos para atualizar saldos
                                            if ($.fn.DataTable.isDataTable('#tblEmpenho')) {
                                                $("#tblEmpenho").DataTable().ajax.reload(null, false);
                                            }
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    } catch (error) {
                                        Alerta.TratamentoErroComLinha(
                                            "empenho.js",
                                            "btn-delete-nf.ajax.success",
                                            error
                                        );
                                    }
                                },
                                error: function (err) {
                                    try {
                                        console.error("Erro ao excluir nota fiscal:", err);
                                        AppToast.show('Vermelho', 'Erro ao excluir a nota fiscal. Tente novamente.');
                                    } catch (error) {
                                        Alerta.TratamentoErroComLinha(
                                            "empenho.js",
                                            "btn-delete-nf.ajax.error",
                                            error
                                        );
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha(
                            "empenho.js",
                            "btn-delete-nf.swal.then",
                            error
                        );
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("empenho.js", "btn-delete-nf.click", error);
            }
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("empenho.js", "document.ready", error);
    }
});

/**
 * Formata valor numérico para moeda brasileira
 * @param {number} valor - Valor a ser formatado
 * @returns {string} - Valor formatado (ex: "R$ 1.234,56")
 */
function formatarMoeda(valor) {
    try {
        if (valor === null || valor === undefined) return "R$ 0,00";
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } catch (error) {
        Alerta.TratamentoErroComLinha("empenho.js", "formatarMoeda", error);
        return "R$ 0,00";
    }
}

/**
 * Converte string de moeda brasileira para número
 * @param {string} valor - String no formato brasileiro (ex: "1.234,56")
 * @returns {number} - Valor numérico
 */
function moedaParaNumero(valor) {
    try {
        if (!valor) return 0;
        return parseFloat(
            String(valor)
                .replace(/\s/g, '')
                .replace(/\./g, '')
                .replace(',', '.')
                .replace('R$', '')
                .replace('&nbsp;', '')
        );
    } catch (error) {
        Alerta.TratamentoErroComLinha("empenho.js", "moedaParaNumero", error);
        return 0;
    }
}

/**
 * Formata data para o padrão brasileiro (DD/MM/YYYY)
 * @param {string|Date} data - Data a ser formatada
 * @returns {string} - Data formatada
 */
function formatarData(data) {
    try {
        if (!data) return "";
        const d = new Date(data);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString('pt-BR');
    } catch (error) {
        Alerta.TratamentoErroComLinha("empenho.js", "formatarData", error);
        return "";
    }
}

/**
 * Recarrega a tabela de empenhos
 */
function recarregarTabelaEmpenhos() {
    try {
        if ($.fn.DataTable.isDataTable('#tblEmpenho')) {
            $('#tblEmpenho').DataTable().ajax.reload(null, false);
        }
    } catch (error) {
        Alerta.TratamentoErroComLinha("empenho.js", "recarregarTabelaEmpenhos", error);
    }
}

/**
 * Recarrega a tabela de notas fiscais
 */
function recarregarTabelaNotasFiscais() {
    try {
        if ($.fn.DataTable.isDataTable('#tblNotaFiscal')) {
            $('#tblNotaFiscal').DataTable().ajax.reload(null, false);
        }
    } catch (error) {
        Alerta.TratamentoErroComLinha("empenho.js", "recarregarTabelaNotasFiscais", error);
    }
}
