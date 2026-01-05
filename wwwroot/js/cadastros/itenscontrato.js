// ============================================================
// ITENS CONTRATO - JavaScript
// FrotiX - Sistema de Gestão de Frotas
// ============================================================

// Variáveis globais
var tipoSelecionado = 'contrato';
var contratoAtual = null;
var ataAtual = null;
var dtVeiculos, dtEncarregados, dtOperadores, dtMotoristas, dtLavadores;

// ============================================================
// INICIALIZAÇÃO
// ============================================================
$(document).ready(function () {
    try {
        // Verificar se há parâmetro na URL
        var urlParams = new URLSearchParams(window.location.search);
        var contratoIdParam = urlParams.get('contratoId');
        var ataIdParam = urlParams.get('ataId');

        // Carregar listas
        if (contratoIdParam) {
            // Se veio com contratoId, carregar contratos e selecionar
            loadContratos(true, contratoIdParam);
        } else {
            loadContratos(true);
        }

        if (ataIdParam) {
            // Se veio com ataId, mudar para aba de Ata e selecionar
            switchTipo('ata');
            loadAtas(true, ataIdParam);
        } else {
            loadAtas(true);
        }

        $('#ddlStatus').on('change', function () {
            try {
                var status = $(this).val() === 'true';
                if (tipoSelecionado === 'contrato') {
                    loadContratos(status);
                } else {
                    loadAtas(status);
                }
                ocultarTudo();
            } catch (error) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "ddlStatus.change", error);
            }
        });

        $('#ddlContrato').on('change', function () {
            try {
                var id = $(this).val();
                if (id) {
                    loadContratoDetalhes(id);
                } else {
                    ocultarTudo();
                }
            } catch (error) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "ddlContrato.change", error);
            }
        });

        $('#ddlAta').on('change', function () {
            try {
                var id = $(this).val();
                if (id) {
                    loadAtaDetalhes(id);
                } else {
                    ocultarTudo();
                }
            } catch (error) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "ddlAta.change", error);
            }
        });

        // Evento de atualização de status do veículo
        $(document).on("click", ".updateStatusVeiculo", function () {
            try {
                var url = $(this).data("url");
                var currentElement = $(this);

                $.get(url, function (data) {
                    try {
                        if (data.success) {
                            AppToast.show('Verde', "Status alterado com sucesso!", 2000);

                            if (data.type == 1) {
                                // Mudou para Inativo
                                currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                                currentElement.html('<i class="fa-duotone fa-circle-xmark me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#ffcdd2;"></i> Inativo');
                            } else {
                                // Mudou para Ativo
                                currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                                currentElement.html('<i class="fa-duotone fa-circle-check me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#c8e6c9;"></i> Ativo');
                            }

                            // Atualiza contadores
                            atualizarContadoresStatus();
                        } else {
                            AppToast.show('Vermelho', "Não foi possível alterar o status.", 2000);
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "updateStatusVeiculo.get.success", error);
                    }
                }).fail(function () {
                    try {
                        AppToast.show('Vermelho', "Erro ao alterar o status do veículo.", 2000);
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "updateStatusVeiculo.get.fail", error);
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "updateStatusVeiculo.click", error);
            }
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "document.ready", error);
    }
});

// ============================================================
// SWITCH CONTRATO/ATA
// ============================================================
function switchTipo(tipo) {
    try {
        tipoSelecionado = tipo;

        if (tipo === 'contrato') {
            $('#btnSwitchContrato').addClass('active');
            $('#btnSwitchAta').removeClass('active');
            $('#divContrato').show();
            $('#divAta').hide();
            $('#resumoAta').removeClass('show');
        } else {
            $('#btnSwitchAta').addClass('active');
            $('#btnSwitchContrato').removeClass('active');
            $('#divAta').show();
            $('#divContrato').hide();
            $('#resumoContrato').removeClass('show');
        }

        ocultarTudo();

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "switchTipo", error);
    }
}

// ============================================================
// OCULTAR TUDO
// ============================================================
function ocultarTudo() {
    try {
        $('#resumoContrato').removeClass('show');
        $('#resumoAta').removeClass('show');
        $('#resumoServico').removeClass('show');
        $('#tabstripContainer').removeClass('show');
        $('#cardContadoresVeiculos').removeClass('show');

        if (dtVeiculos) { dtVeiculos.clear().draw(); }
        if (dtEncarregados) { dtEncarregados.clear().draw(); }
        if (dtOperadores) { dtOperadores.clear().draw(); }
        if (dtMotoristas) { dtMotoristas.clear().draw(); }
        if (dtLavadores) { dtLavadores.clear().draw(); }

        $('#navItemVeiculos, #navItemEncarregados, #navItemOperadores, #navItemMotoristas, #navItemLavadores').hide();
        $('.nav-tabs-custom .nav-link').removeClass('active');
        $('.tab-pane').removeClass('show active');

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "ocultarTudo", error);
    }
}

function mostrarShimmer() {
    try {
        $('#shimmerContainer').addClass('show');
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "mostrarShimmer", error);
    }
}

function ocultarShimmer() {
    try {
        $('#shimmerContainer').removeClass('show');
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "ocultarShimmer", error);
    }
}

// ============================================================
// LOADING OVERLAY - PADRÃO FROTIX
// ============================================================
function mostrarLoading() {
    try {
        $('#loadingOverlayContrato').css('display', 'flex');
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "mostrarLoading", error);
    }
}

function esconderLoading() {
    try {
        $('#loadingOverlayContrato').css('display', 'none');
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "esconderLoading", error);
    }
}

// ============================================================
// CARREGAMENTO DE LISTAS
// ============================================================
function loadContratos(status, contratoIdParaSelecionar) {
    try {
        $.ajax({
            type: "GET",
            url: "/api/ItensContrato/ListaContratos",
            data: { status: status },
            success: function (res) {
                try {
                    var options = '<option value="">-- Selecione um Contrato --</option>';
                    if (res && res.success && res.data) {
                        res.data.forEach(function (item) {
                            options += '<option value="' + item.value + '" data-tipo="' + item.tipoContrato + '">' + item.text + '</option>';
                        });
                    }
                    $('#ddlContrato').html(options);

                    // Se foi passado um contratoId para selecionar, selecionar e disparar evento
                    if (contratoIdParaSelecionar) {
                        $('#ddlContrato').val(contratoIdParaSelecionar);
                        if ($('#ddlContrato').val() === contratoIdParaSelecionar) {
                            $('#ddlContrato').trigger('change');
                        }
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "loadContratos.success", error);
                }
            },
            error: function (err) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "loadContratos.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadContratos", error);
    }
}

function loadAtas(status, ataIdParaSelecionar) {
    try {
        $.ajax({
            type: "GET",
            url: "/api/ItensContrato/ListaAtas",
            data: { status: status },
            success: function (res) {
                try {
                    var options = '<option value="">-- Selecione uma Ata --</option>';
                    if (res && res.success && res.data) {
                        res.data.forEach(function (item) {
                            options += '<option value="' + item.value + '">' + item.text + '</option>';
                        });
                    }
                    $('#ddlAta').html(options);

                    // Se foi passado um ataId para selecionar, selecionar e disparar evento
                    if (ataIdParaSelecionar) {
                        $('#ddlAta').val(ataIdParaSelecionar);
                        if ($('#ddlAta').val() === ataIdParaSelecionar) {
                            $('#ddlAta').trigger('change');
                        }
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "loadAtas.success", error);
                }
            },
            error: function (err) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "loadAtas.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadAtas", error);
    }
}

// ============================================================
// DETALHES DO CONTRATO
// ============================================================
function loadContratoDetalhes(id) {
    try {
        mostrarShimmer();
        ocultarTudo();

        $.ajax({
            type: "GET",
            url: "/api/ItensContrato/GetContratoDetalhes",
            data: { id: id },
            success: function (res) {
                try {
                    ocultarShimmer();

                    if (res && res.success && res.data) {
                        contratoAtual = res.data;
                        exibirResumoContrato(res.data);
                        configurarAbas(res.data);
                    } else {
                        AppToast.show("Vermelho", "Erro ao carregar detalhes do contrato", 3000);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "loadContratoDetalhes.success", error);
                }
            },
            error: function (err) {
                ocultarShimmer();
                Alerta.TratamentoErroComLinha("itenscontrato.js", "loadContratoDetalhes.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadContratoDetalhes", error);
    }
}

function exibirResumoContrato(data) {
    try {
        $('#resumoContratoNumero').text('Contrato ' + data.contratoCompleto);
        $('#resumoFornecedor').text(data.fornecedor);
        $('#resumoObjeto').text(data.objeto);
        $('#resumoVigencia').text(data.dataInicio + ' a ' + data.dataFim);
        $('#resumoValor').text(formatarMoeda(data.valor));

        var badge = $('#resumoContratoBadge');
        badge.removeClass('locacao terceirizacao servico');

        if (data.tipoContrato === 'Locação') {
            badge.addClass('locacao').text('LOCAÇÃO');
        } else if (data.tipoContrato === 'Terceirização') {
            badge.addClass('terceirizacao').text('TERCEIRIZAÇÃO');
        } else {
            badge.addClass('servico').text('SERVIÇO');
        }

        $('#resumoContrato').addClass('show');

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "exibirResumoContrato", error);
    }
}

function configurarAbas(data) {
    try {
        $('#navItemVeiculos, #navItemEncarregados, #navItemOperadores, #navItemMotoristas, #navItemLavadores').hide();
        $('#resumoServico').removeClass('show');
        $('#tabstripContainer').removeClass('show');
        $('#cardContadoresVeiculos').removeClass('show');

        $('.nav-tabs-custom .nav-link').removeClass('active');
        $('.tab-pane').removeClass('show active');

        var tipoContrato = data.tipoContrato;

        if (tipoContrato === 'Serviço') {
            $('#resumoServico').addClass('show');
            return;
        }

        $('#tabstripContainer').addClass('show');

        if (tipoContrato === 'Locação') {
            $('#navItemVeiculos').show();
            $('#tabVeiculos').addClass('active');
            $('#paneVeiculos').addClass('show active');
            $('#spanCustoVeiculos').show();

            loadItensContrato(data.contratoId);
            loadTblVeiculos(data.contratoId);

        } else if (tipoContrato === 'Terceirização') {
            var primeiraAba = null;
            var primeiroPane = null;

            if (data.contratoEncarregados) {
                $('#navItemEncarregados').show();
                $('#qtdContratadaEncarregados').text(data.quantidadeEncarregado || 0);
                $('#custoMensalEncarregados').text(formatarMoeda(data.custoMensalEncarregado));
                if (!primeiraAba) {
                    primeiraAba = 'tabEncarregados';
                    primeiroPane = 'paneEncarregados';
                }
            }

            if (data.contratoOperadores) {
                $('#navItemOperadores').show();
                $('#qtdContratadaOperadores').text(data.quantidadeOperador || 0);
                $('#custoMensalOperadores').text(formatarMoeda(data.custoMensalOperador));
                if (!primeiraAba) {
                    primeiraAba = 'tabOperadores';
                    primeiroPane = 'paneOperadores';
                }
            }

            if (data.contratoMotoristas) {
                $('#navItemMotoristas').show();
                $('#qtdContratadaMotoristas').text(data.quantidadeMotorista || 0);
                $('#custoMensalMotoristas').text(formatarMoeda(data.custoMensalMotorista));
                if (!primeiraAba) {
                    primeiraAba = 'tabMotoristas';
                    primeiroPane = 'paneMotoristas';
                }
            }

            if (data.contratoLavadores) {
                $('#navItemLavadores').show();
                $('#qtdContratadaLavadores').text(data.quantidadeLavador || 0);
                $('#custoMensalLavadores').text(formatarMoeda(data.custoMensalLavador));
                if (!primeiraAba) {
                    primeiraAba = 'tabLavadores';
                    primeiroPane = 'paneLavadores';
                }
            }

            if (primeiraAba) {
                $('#' + primeiraAba).addClass('active');
                $('#' + primeiroPane).addClass('show active');

                if (primeiraAba === 'tabEncarregados') loadTblEncarregados(data.contratoId);
                else if (primeiraAba === 'tabOperadores') loadTblOperadores(data.contratoId);
                else if (primeiraAba === 'tabMotoristas') loadTblMotoristas(data.contratoId);
                else if (primeiraAba === 'tabLavadores') loadTblLavadores(data.contratoId);
            }
        }

        $('.nav-tabs-custom .nav-link').off('shown.bs.tab').on('shown.bs.tab', function (e) {
            try {
                var target = $(e.target).attr('id');
                var id = contratoAtual ? contratoAtual.contratoId : null;

                if (!id) return;

                if (target === 'tabVeiculos') loadTblVeiculos(id);
                else if (target === 'tabEncarregados') loadTblEncarregados(id);
                else if (target === 'tabOperadores') loadTblOperadores(id);
                else if (target === 'tabMotoristas') loadTblMotoristas(id);
                else if (target === 'tabLavadores') loadTblLavadores(id);

            } catch (error) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "nav-link.shown", error);
            }
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "configurarAbas", error);
    }
}

// ============================================================
// DETALHES DA ATA
// ============================================================
function loadAtaDetalhes(id) {
    try {
        mostrarShimmer();
        ocultarTudo();

        $.ajax({
            type: "GET",
            url: "/api/ItensContrato/GetAtaDetalhes",
            data: { id: id },
            success: function (res) {
                try {
                    ocultarShimmer();

                    if (res && res.success && res.data) {
                        ataAtual = res.data;
                        exibirResumoAta(res.data);
                        configurarAbasAta(res.data);
                    } else {
                        AppToast.show("Vermelho", "Erro ao carregar detalhes da ata", 3000);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "loadAtaDetalhes.success", error);
                }
            },
            error: function (err) {
                ocultarShimmer();
                Alerta.TratamentoErroComLinha("itenscontrato.js", "loadAtaDetalhes.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadAtaDetalhes", error);
    }
}

function exibirResumoAta(data) {
    try {
        $('#resumoAtaNumero').text('Ata ' + data.ataCompleta);
        $('#resumoAtaFornecedor').text(data.fornecedor);
        $('#resumoAtaObjeto').text(data.objeto);
        $('#resumoAtaVigencia').text(data.dataInicio + ' a ' + data.dataFim);
        $('#resumoAtaValor').text(formatarMoeda(data.valor));

        $('#resumoAta').addClass('show');

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "exibirResumoAta", error);
    }
}

function configurarAbasAta(data) {
    try {
        $('#navItemVeiculos, #navItemEncarregados, #navItemOperadores, #navItemMotoristas, #navItemLavadores').hide();
        $('#resumoServico').removeClass('show');

        $('.nav-tabs-custom .nav-link').removeClass('active');
        $('.tab-pane').removeClass('show active');

        $('#tabstripContainer').addClass('show');

        $('#navItemVeiculos').show();
        $('#tabVeiculos').addClass('active');
        $('#paneVeiculos').addClass('show active');

        $('#spanCustoVeiculos').hide();

        loadTblVeiculosAta(data.ataId);

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "configurarAbasAta", error);
    }
}

// ============================================================
// CARREGAR ITENS DO CONTRATO
// ============================================================
function loadItensContrato(contratoId) {
    try {
        $.ajax({
            type: "GET",
            url: "/api/ItensContrato/GetItensContrato",
            data: { contratoId: contratoId },
            success: function (res) {
                try {
                    var options = '<option value="">-- Selecione o Item --</option>';
                    var qtdTotal = 0;
                    var custoTotal = 0;

                    if (res && res.success && res.data && res.data.length > 0) {
                        res.data.forEach(function (item) {
                            options += '<option value="' + item.value + '">' + item.text + '</option>';
                            qtdTotal += (item.quantidade || 0);
                            custoTotal += (item.quantidade || 0) * (item.valorUnitario || 0);
                        });
                        $('#divItemVeiculo').show();
                    } else {
                        $('#divItemVeiculo').hide();
                    }

                    $('#ddlItemVeiculo').html(options);
                    $('#qtdContratadaVeiculos').text(qtdTotal);
                    $('#custoMensalVeiculos').text(formatarMoeda(custoTotal));

                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "loadItensContrato.success", error);
                }
            },
            error: function (err) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "loadItensContrato.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadItensContrato", error);
    }
}

// ============================================================
// DATATABLES - VEÍCULOS
// ============================================================
function loadTblVeiculos(contratoId) {
    try {
        // Limpa filtro ao carregar nova tabela
        $('#ddlFiltroItem').val('');

        if (dtVeiculos) {
            dtVeiculos.destroy();
            $('#tblVeiculos tbody').empty();
        }

        // Carrega itens para o filtro
        carregarFiltroItens(contratoId);

        // Mostra loading
        mostrarLoading();

        dtVeiculos = $('#tblVeiculos').DataTable({
            ajax: {
                url: "/api/ItensContrato/GetVeiculosContrato",
                data: { contratoId: contratoId },
                type: "GET",
                dataSrc: function (json) {
                    try {
                        var data = json.data || [];
                        $('#badgeVeiculos').text(data.length);

                        // Atualiza contadores
                        $('#qtdVeiculosAtivos').text(json.qtdAtivos || 0);
                        $('#qtdVeiculosInativos').text(json.qtdInativos || 0);
                        $('#cardContadoresVeiculos').addClass('show');

                        return data;
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblVeiculos.dataSrc", error);
                        return [];
                    }
                },
                error: function (xhr, error, thrown) {
                    esconderLoading();
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblVeiculos.ajax.error", error);
                }
            },
            columns: [
                {
                    data: 'descricaoItem',
                    render: function (data) {
                        return data || '-';
                    }
                },
                { data: 'placa' },
                { data: 'marcaModelo' },
                {
                    data: 'status',
                    className: 'text-center',
                    render: function (data, type, row) {
                        if (data) {
                            return '<a href="javascript:void(0)" class="updateStatusVeiculo btn btn-verde text-white" data-url="/api/Veiculo/updateStatusVeiculo?Id=' + row.veiculoId + '" style="cursor:pointer; padding: 4px 10px; font-size: 12px; border-radius: 6px;">' +
                                   '<i class="fa-duotone fa-circle-check me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#c8e6c9;"></i> Ativo</a>';
                        } else {
                            return '<a href="javascript:void(0)" class="updateStatusVeiculo btn fundo-cinza text-white" data-url="/api/Veiculo/updateStatusVeiculo?Id=' + row.veiculoId + '" style="cursor:pointer; padding: 4px 10px; font-size: 12px; border-radius: 6px;">' +
                                   '<i class="fa-duotone fa-circle-xmark me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#ffcdd2;"></i> Inativo</a>';
                        }
                    }
                },
                {
                    data: null,
                    orderable: false,
                    className: 'text-center',
                    render: function (data, type, row) {
                        return '<button type="button" class="btn-action btn-danger" onclick="removerVeiculo(\'' + row.veiculoId + '\', \'' + row.contratoId + '\')" title="Remover"><i class="fad fa-trash-alt"></i></button>';
                    }
                }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json' },
            order: [[1, 'asc']],
            responsive: true,
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
            initComplete: function () {
                esconderLoading();
            },
            drawCallback: function () {
                esconderLoading();
            }
        });

    } catch (error) {
        esconderLoading();
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblVeiculos", error);
    }
}

function loadTblVeiculosAta(ataId) {
    try {
        if (dtVeiculos) {
            dtVeiculos.destroy();
            $('#tblVeiculos tbody').empty();
        }

        // Mostra loading
        mostrarLoading();

        dtVeiculos = $('#tblVeiculos').DataTable({
            ajax: {
                url: "/api/ItensContrato/GetVeiculosAta",
                data: { ataId: ataId },
                type: "GET",
                dataSrc: function (json) {
                    try {
                        var data = json.data || [];
                        $('#badgeVeiculos').text(data.length);
                        $('#qtdContratadaVeiculos').text(data.length);

                        $('#qtdVeiculosAtivos').text(json.qtdAtivos || 0);
                        $('#qtdVeiculosInativos').text(json.qtdInativos || 0);
                        $('#cardContadoresVeiculos').addClass('show');

                        return data;
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblVeiculosAta.dataSrc", error);
                        return [];
                    }
                },
                error: function (xhr, error, thrown) {
                    esconderLoading();
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblVeiculosAta.ajax.error", error);
                }
            },
            columns: [
                {
                    data: 'descricaoItem',
                    render: function (data) { return data || '-'; }
                },
                { data: 'placa' },
                { data: 'marcaModelo' },
                {
                    data: 'status',
                    className: 'text-center',
                    render: function (data, type, row) {
                        if (data) {
                            return '<a href="javascript:void(0)" class="updateStatusVeiculo btn btn-verde text-white" data-url="/api/Veiculo/updateStatusVeiculo?Id=' + row.veiculoId + '" style="cursor:pointer; padding: 4px 10px; font-size: 12px; border-radius: 6px;">' +
                                   '<i class="fa-duotone fa-circle-check me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#c8e6c9;"></i> Ativo</a>';
                        } else {
                            return '<a href="javascript:void(0)" class="updateStatusVeiculo btn fundo-cinza text-white" data-url="/api/Veiculo/updateStatusVeiculo?Id=' + row.veiculoId + '" style="cursor:pointer; padding: 4px 10px; font-size: 12px; border-radius: 6px;">' +
                                   '<i class="fa-duotone fa-circle-xmark me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#ffcdd2;"></i> Inativo</a>';
                        }
                    }
                },
                {
                    data: null,
                    orderable: false,
                    className: 'text-center',
                    render: function (data, type, row) {
                        return '<button type="button" class="btn-action btn-danger" onclick="removerVeiculoAta(\'' + row.veiculoId + '\', \'' + row.ataId + '\')" title="Remover"><i class="fad fa-trash-alt"></i></button>';
                    }
                }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json' },
            order: [[1, 'asc']],
            responsive: true,
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
            initComplete: function () {
                esconderLoading();
            },
            drawCallback: function () {
                esconderLoading();
            }
        });

    } catch (error) {
        esconderLoading();
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblVeiculosAta", error);
    }
}

// ============================================================
// FILTRO POR ITEM
// ============================================================
function carregarFiltroItens(contratoId) {
    try {
        var $ddl = $('#ddlFiltroItem');
        $ddl.empty().append('<option value="">-- Todos os Itens --</option>');

        $.ajax({
            type: "GET",
            url: "/api/ItensContrato/GetItensContrato",
            data: { contratoId: contratoId },
            success: function (res) {
                try {
                    if (res && res.success && res.data) {
                        res.data.forEach(function (item) {
                            $ddl.append('<option value="' + item.text + '">' + item.text + '</option>');
                        });
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "carregarFiltroItens.success", error);
                }
            },
            error: function (err) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "carregarFiltroItens.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "carregarFiltroItens", error);
    }
}

function filtrarPorItem() {
    try {
        var valorFiltro = $('#ddlFiltroItem').val();

        if (dtVeiculos) {
            // Mostra loading durante o filtro
            mostrarLoading();
            // Filtra pela coluna 0 (ITEM)
            dtVeiculos.column(0).search(valorFiltro).draw();
        }
    } catch (error) {
        esconderLoading();
        Alerta.TratamentoErroComLinha("itenscontrato.js", "filtrarPorItem", error);
    }
}

function limparFiltroItem() {
    try {
        $('#ddlFiltroItem').val('');

        if (dtVeiculos) {
            // Mostra loading durante o filtro
            mostrarLoading();
            dtVeiculos.column(0).search('').draw();
        }
    } catch (error) {
        esconderLoading();
        Alerta.TratamentoErroComLinha("itenscontrato.js", "limparFiltroItem", error);
    }
}

function atualizarContadoresStatus() {
    try {
        // Conta ativos e inativos na tabela atual
        var ativos = 0;
        var inativos = 0;

        if (dtVeiculos) {
            dtVeiculos.rows().every(function () {
                var data = this.data();
                if (data && data.status !== undefined) {
                    // Verifica pelo estado atual do botão na linha
                    var $row = $(this.node());
                    if ($row.find('.btn-verde').length > 0) {
                        ativos++;
                    } else {
                        inativos++;
                    }
                }
            });

            $('#qtdVeiculosAtivos').text(ativos);
            $('#qtdVeiculosInativos').text(inativos);
        }
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "atualizarContadoresStatus", error);
    }
}

// ============================================================
// DATATABLES - ENCARREGADOS
// ============================================================
function loadTblEncarregados(contratoId) {
    try {
        if (dtEncarregados) {
            dtEncarregados.destroy();
            $('#tblEncarregados tbody').empty();
        }

        dtEncarregados = $('#tblEncarregados').DataTable({
            ajax: {
                url: "/api/ItensContrato/GetEncarregadosContrato",
                data: { contratoId: contratoId },
                type: "GET",
                dataSrc: function (json) {
                    try {
                        var data = json.data || [];
                        $('#badgeEncarregados').text(data.length);
                        return data;
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblEncarregados.dataSrc", error);
                        return [];
                    }
                }
            },
            columns: [
                { data: 'nome' },
                { data: 'ponto' },
                { data: 'celular01' },
                {
                    data: 'status',
                    className: 'text-center',
                    render: function (data) {
                        if (data) {
                            return '<span class="badge ftx-badge-status bg-success" style="font-size:0.86rem; border:1px solid #454545;"><i class="fa-duotone fa-circle-check me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#c8e6c9;"></i> Ativo</span>';
                        } else {
                            return '<span class="badge ftx-badge-status bg-secondary" style="font-size:0.86rem; border:1px solid #454545;"><i class="fa-duotone fa-circle-xmark me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#ccc;"></i> Inativo</span>';
                        }
                    }
                },
                {
                    data: null,
                    orderable: false,
                    className: 'text-center ftx-actions',
                    render: function (data, type, row) {
                        return '<button type="button" class="btn-icon-28 btn-terracota" onclick="desvincularEncarregado(\'' + row.encarregadoId + '\', \'' + row.contratoId + '\')" data-ejtip="Desvincular do Contrato"><i class="fa-duotone fa-link-slash"></i></button>';
                    }
                }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json' },
            order: [[0, 'asc']],
            responsive: true,
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip'
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblEncarregados", error);
    }
}

// ============================================================
// DATATABLES - OPERADORES
// ============================================================
function loadTblOperadores(contratoId) {
    try {
        if (dtOperadores) {
            dtOperadores.destroy();
            $('#tblOperadores tbody').empty();
        }

        dtOperadores = $('#tblOperadores').DataTable({
            ajax: {
                url: "/api/ItensContrato/GetOperadoresContrato",
                data: { contratoId: contratoId },
                type: "GET",
                dataSrc: function (json) {
                    try {
                        var data = json.data || [];
                        $('#badgeOperadores').text(data.length);
                        return data;
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblOperadores.dataSrc", error);
                        return [];
                    }
                }
            },
            columns: [
                { data: 'nome' },
                { data: 'ponto' },
                { data: 'celular01' },
                {
                    data: 'status',
                    className: 'text-center',
                    render: function (data) {
                        if (data) {
                            return '<span class="badge ftx-badge-status bg-success" style="font-size:0.86rem; border:1px solid #454545;"><i class="fa-duotone fa-circle-check me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#c8e6c9;"></i> Ativo</span>';
                        } else {
                            return '<span class="badge ftx-badge-status bg-secondary" style="font-size:0.86rem; border:1px solid #454545;"><i class="fa-duotone fa-circle-xmark me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#ccc;"></i> Inativo</span>';
                        }
                    }
                },
                {
                    data: null,
                    orderable: false,
                    className: 'text-center ftx-actions',
                    render: function (data, type, row) {
                        return '<button type="button" class="btn-icon-28 btn-terracota" onclick="desvincularOperador(\'' + row.operadorId + '\', \'' + row.contratoId + '\')" data-ejtip="Desvincular do Contrato"><i class="fa-duotone fa-link-slash"></i></button>';
                    }
                }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json' },
            order: [[0, 'asc']],
            responsive: true,
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip'
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblOperadores", error);
    }
}

// ============================================================
// DATATABLES - MOTORISTAS
// ============================================================
function loadTblMotoristas(contratoId) {
    try {
        if (dtMotoristas) {
            dtMotoristas.destroy();
            $('#tblMotoristas tbody').empty();
        }

        dtMotoristas = $('#tblMotoristas').DataTable({
            ajax: {
                url: "/api/ItensContrato/GetMotoristasContrato",
                data: { contratoId: contratoId },
                type: "GET",
                dataSrc: function (json) {
                    try {
                        var data = json.data || [];
                        $('#badgeMotoristas').text(data.length);
                        return data;
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblMotoristas.dataSrc", error);
                        return [];
                    }
                }
            },
            columns: [
                { data: 'nome' },
                { data: 'ponto' },
                { data: 'cnh' },
                { data: 'celular01' },
                {
                    data: 'status',
                    className: 'text-center',
                    render: function (data) {
                        if (data) {
                            return '<span class="badge ftx-badge-status bg-success" style="font-size:0.86rem; border:1px solid #454545;"><i class="fa-duotone fa-circle-check me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#c8e6c9;"></i> Ativo</span>';
                        } else {
                            return '<span class="badge ftx-badge-status bg-secondary" style="font-size:0.86rem; border:1px solid #454545;"><i class="fa-duotone fa-circle-xmark me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#ccc;"></i> Inativo</span>';
                        }
                    }
                },
                {
                    data: null,
                    orderable: false,
                    className: 'text-center ftx-actions',
                    render: function (data, type, row) {
                        return '<button type="button" class="btn-icon-28 btn-terracota" onclick="desvincularMotorista(\'' + row.motoristaId + '\', \'' + row.contratoId + '\')" data-ejtip="Desvincular do Contrato"><i class="fa-duotone fa-link-slash"></i></button>';
                    }
                }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json' },
            order: [[0, 'asc']],
            responsive: true,
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip'
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblMotoristas", error);
    }
}

// ============================================================
// DATATABLES - LAVADORES
// ============================================================
function loadTblLavadores(contratoId) {
    try {
        if (dtLavadores) {
            dtLavadores.destroy();
            $('#tblLavadores tbody').empty();
        }

        dtLavadores = $('#tblLavadores').DataTable({
            ajax: {
                url: "/api/ItensContrato/GetLavadoresContrato",
                data: { contratoId: contratoId },
                type: "GET",
                dataSrc: function (json) {
                    try {
                        var data = json.data || [];
                        $('#badgeLavadores').text(data.length);
                        return data;
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblLavadores.dataSrc", error);
                        return [];
                    }
                }
            },
            columns: [
                { data: 'nome' },
                { data: 'ponto' },
                { data: 'celular01' },
                {
                    data: 'status',
                    className: 'text-center',
                    render: function (data) {
                        if (data) {
                            return '<span class="badge ftx-badge-status bg-success" style="font-size:0.86rem; border:1px solid #454545;"><i class="fa-duotone fa-circle-check me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#c8e6c9;"></i> Ativo</span>';
                        } else {
                            return '<span class="badge ftx-badge-status bg-secondary" style="font-size:0.86rem; border:1px solid #454545;"><i class="fa-duotone fa-circle-xmark me-1" style="--fa-primary-color:#fff; --fa-secondary-color:#ccc;"></i> Inativo</span>';
                        }
                    }
                },
                {
                    data: null,
                    orderable: false,
                    className: 'text-center ftx-actions',
                    render: function (data, type, row) {
                        return '<button type="button" class="btn-icon-28 btn-terracota" onclick="desvincularLavador(\'' + row.lavadorId + '\', \'' + row.contratoId + '\')" data-ejtip="Desvincular do Contrato"><i class="fa-duotone fa-link-slash"></i></button>';
                    }
                }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json' },
            order: [[0, 'asc']],
            responsive: true,
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip'
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "loadTblLavadores", error);
    }
}

// ============================================================
// MODAIS - ABRIR
// ============================================================
function abrirModalVeiculo() {
    try {
        var id = tipoSelecionado === 'contrato' ? contratoAtual?.contratoId : ataAtual?.ataId;
        if (!id) {
            AppToast.show("Amarelo", "Selecione um contrato ou ata primeiro", 3000);
            return;
        }

        var url = tipoSelecionado === 'contrato' ? '/api/ItensContrato/GetVeiculosDisponiveis' : '/api/ItensContrato/GetVeiculosDisponiveisAta';
        var param = tipoSelecionado === 'contrato' ? { contratoId: id } : { ataId: id };

        $.ajax({
            type: "GET",
            url: url,
            data: param,
            success: function (res) {
                try {
                    var options = '<option value="">-- Selecione o Veículo --</option>';
                    if (res && res.success && res.data) {
                        res.data.forEach(function (item) {
                            options += '<option value="' + item.value + '">' + item.text + '</option>';
                        });
                    }
                    $('#ddlVeiculo').html(options);
                    $('#btnSalvarVeiculo').removeClass('loading').prop('disabled', false);
                    $('#modalVeiculo').modal('show');
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalVeiculo.success", error);
                }
            },
            error: function (err) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalVeiculo.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalVeiculo", error);
    }
}

function abrirModalEncarregado() {
    try {
        if (!contratoAtual?.contratoId) {
            AppToast.show("Amarelo", "Selecione um contrato primeiro", 3000);
            return;
        }

        $.ajax({
            type: "GET",
            url: "/api/ItensContrato/GetEncarregadosDisponiveis",
            data: { contratoId: contratoAtual.contratoId },
            success: function (res) {
                try {
                    var options = '<option value="">-- Selecione o Encarregado --</option>';
                    if (res && res.success && res.data) {
                        res.data.forEach(function (item) {
                            options += '<option value="' + item.value + '">' + item.text + '</option>';
                        });
                    }
                    $('#ddlEncarregado').html(options);
                    $('#btnSalvarEncarregado').removeClass('loading').prop('disabled', false);
                    $('#modalEncarregado').modal('show');
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalEncarregado.success", error);
                }
            },
            error: function (err) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalEncarregado.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalEncarregado", error);
    }
}

function abrirModalOperador() {
    try {
        if (!contratoAtual?.contratoId) {
            AppToast.show("Amarelo", "Selecione um contrato primeiro", 3000);
            return;
        }

        $.ajax({
            type: "GET",
            url: "/api/ItensContrato/GetOperadoresDisponiveis",
            data: { contratoId: contratoAtual.contratoId },
            success: function (res) {
                try {
                    var options = '<option value="">-- Selecione o Operador --</option>';
                    if (res && res.success && res.data) {
                        res.data.forEach(function (item) {
                            options += '<option value="' + item.value + '">' + item.text + '</option>';
                        });
                    }
                    $('#ddlOperador').html(options);
                    $('#btnSalvarOperador').removeClass('loading').prop('disabled', false);
                    $('#modalOperador').modal('show');
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalOperador.success", error);
                }
            },
            error: function (err) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalOperador.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalOperador", error);
    }
}

function abrirModalMotorista() {
    try {
        if (!contratoAtual?.contratoId) {
            AppToast.show("Amarelo", "Selecione um contrato primeiro", 3000);
            return;
        }

        $.ajax({
            type: "GET",
            url: "/api/ItensContrato/GetMotoristasDisponiveis",
            data: { contratoId: contratoAtual.contratoId },
            success: function (res) {
                try {
                    var options = '<option value="">-- Selecione o Motorista --</option>';
                    if (res && res.success && res.data) {
                        res.data.forEach(function (item) {
                            options += '<option value="' + item.value + '">' + item.text + '</option>';
                        });
                    }
                    $('#ddlMotorista').html(options);
                    $('#btnSalvarMotorista').removeClass('loading').prop('disabled', false);
                    $('#modalMotorista').modal('show');
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalMotorista.success", error);
                }
            },
            error: function (err) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalMotorista.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalMotorista", error);
    }
}

function abrirModalLavador() {
    try {
        if (!contratoAtual?.contratoId) {
            AppToast.show("Amarelo", "Selecione um contrato primeiro", 3000);
            return;
        }

        $.ajax({
            type: "GET",
            url: "/api/ItensContrato/GetLavadoresDisponiveis",
            data: { contratoId: contratoAtual.contratoId },
            success: function (res) {
                try {
                    var options = '<option value="">-- Selecione o Lavador --</option>';
                    if (res && res.success && res.data) {
                        res.data.forEach(function (item) {
                            options += '<option value="' + item.value + '">' + item.text + '</option>';
                        });
                    }
                    $('#ddlLavador').html(options);
                    $('#btnSalvarLavador').removeClass('loading').prop('disabled', false);
                    $('#modalLavador').modal('show');
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalLavador.success", error);
                }
            },
            error: function (err) {
                Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalLavador.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "abrirModalLavador", error);
    }
}

// ============================================================
// SALVAR
// ============================================================
function salvarVeiculo() {
    try {
        var veiculoId = $('#ddlVeiculo').val();
        if (!veiculoId) {
            AppToast.show("Amarelo", "Selecione um veículo", 3000);
            return;
        }

        $('#btnSalvarVeiculo').addClass('loading').prop('disabled', true);

        var url, data;

        if (tipoSelecionado === 'contrato') {
            url = '/api/ItensContrato/IncluirVeiculoContrato';
            data = {
                veiculoId: veiculoId,
                contratoId: contratoAtual.contratoId,
                itemVeiculoId: $('#ddlItemVeiculo').val() || null
            };
        } else {
            url = '/api/ItensContrato/IncluirVeiculoAta';
            data = {
                veiculoId: veiculoId,
                ataId: ataAtual.ataId
            };
        }

        $.ajax({
            type: "POST",
            url: url,
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (res) {
                try {
                    $('#btnSalvarVeiculo').removeClass('loading').prop('disabled', false);
                    if (res && res.success) {
                        AppToast.show("Verde", res.message, 3000);
                        $('#modalVeiculo').modal('hide');

                        if (tipoSelecionado === 'contrato') {
                            loadTblVeiculos(contratoAtual.contratoId);
                        } else {
                            loadTblVeiculosAta(ataAtual.ataId);
                        }
                    } else {
                        AppToast.show("Vermelho", res.message || "Erro ao incluir veículo", 3000);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarVeiculo.success", error);
                }
            },
            error: function (err) {
                $('#btnSalvarVeiculo').removeClass('loading').prop('disabled', false);
                Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarVeiculo.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarVeiculo", error);
    }
}

function salvarEncarregado() {
    try {
        var encarregadoId = $('#ddlEncarregado').val();
        if (!encarregadoId) {
            AppToast.show("Amarelo", "Selecione um encarregado", 3000);
            return;
        }

        $('#btnSalvarEncarregado').addClass('loading').prop('disabled', true);

        $.ajax({
            type: "POST",
            url: "/api/ItensContrato/IncluirEncarregadoContrato",
            contentType: "application/json",
            data: JSON.stringify({
                encarregadoId: encarregadoId,
                contratoId: contratoAtual.contratoId
            }),
            success: function (res) {
                try {
                    $('#btnSalvarEncarregado').removeClass('loading').prop('disabled', false);
                    if (res && res.success) {
                        AppToast.show("Verde", res.message, 3000);
                        $('#modalEncarregado').modal('hide');
                        loadTblEncarregados(contratoAtual.contratoId);
                    } else {
                        AppToast.show("Vermelho", res.message || "Erro ao incluir encarregado", 3000);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarEncarregado.success", error);
                }
            },
            error: function (err) {
                $('#btnSalvarEncarregado').removeClass('loading').prop('disabled', false);
                Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarEncarregado.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarEncarregado", error);
    }
}

function salvarOperador() {
    try {
        var operadorId = $('#ddlOperador').val();
        if (!operadorId) {
            AppToast.show("Amarelo", "Selecione um operador", 3000);
            return;
        }

        $('#btnSalvarOperador').addClass('loading').prop('disabled', true);

        $.ajax({
            type: "POST",
            url: "/api/ItensContrato/IncluirOperadorContrato",
            contentType: "application/json",
            data: JSON.stringify({
                operadorId: operadorId,
                contratoId: contratoAtual.contratoId
            }),
            success: function (res) {
                try {
                    $('#btnSalvarOperador').removeClass('loading').prop('disabled', false);
                    if (res && res.success) {
                        AppToast.show("Verde", res.message, 3000);
                        $('#modalOperador').modal('hide');
                        loadTblOperadores(contratoAtual.contratoId);
                    } else {
                        AppToast.show("Vermelho", res.message || "Erro ao incluir operador", 3000);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarOperador.success", error);
                }
            },
            error: function (err) {
                $('#btnSalvarOperador').removeClass('loading').prop('disabled', false);
                Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarOperador.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarOperador", error);
    }
}

function salvarMotorista() {
    try {
        var motoristaId = $('#ddlMotorista').val();
        if (!motoristaId) {
            AppToast.show("Amarelo", "Selecione um motorista", 3000);
            return;
        }

        $('#btnSalvarMotorista').addClass('loading').prop('disabled', true);

        $.ajax({
            type: "POST",
            url: "/api/ItensContrato/IncluirMotoristaContrato",
            contentType: "application/json",
            data: JSON.stringify({
                motoristaId: motoristaId,
                contratoId: contratoAtual.contratoId
            }),
            success: function (res) {
                try {
                    $('#btnSalvarMotorista').removeClass('loading').prop('disabled', false);
                    if (res && res.success) {
                        AppToast.show("Verde", res.message, 3000);
                        $('#modalMotorista').modal('hide');
                        loadTblMotoristas(contratoAtual.contratoId);
                    } else {
                        AppToast.show("Vermelho", res.message || "Erro ao incluir motorista", 3000);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarMotorista.success", error);
                }
            },
            error: function (err) {
                $('#btnSalvarMotorista').removeClass('loading').prop('disabled', false);
                Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarMotorista.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarMotorista", error);
    }
}

function salvarLavador() {
    try {
        var lavadorId = $('#ddlLavador').val();
        if (!lavadorId) {
            AppToast.show("Amarelo", "Selecione um lavador", 3000);
            return;
        }

        $('#btnSalvarLavador').addClass('loading').prop('disabled', true);

        $.ajax({
            type: "POST",
            url: "/api/ItensContrato/IncluirLavadorContrato",
            contentType: "application/json",
            data: JSON.stringify({
                lavadorId: lavadorId,
                contratoId: contratoAtual.contratoId
            }),
            success: function (res) {
                try {
                    $('#btnSalvarLavador').removeClass('loading').prop('disabled', false);
                    if (res && res.success) {
                        AppToast.show("Verde", res.message, 3000);
                        $('#modalLavador').modal('hide');
                        loadTblLavadores(contratoAtual.contratoId);
                    } else {
                        AppToast.show("Vermelho", res.message || "Erro ao incluir lavador", 3000);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarLavador.success", error);
                }
            },
            error: function (err) {
                $('#btnSalvarLavador').removeClass('loading').prop('disabled', false);
                Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarLavador.error", err);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "salvarLavador", error);
    }
}

// ============================================================
// REMOVER
// ============================================================
function removerVeiculo(veiculoId, contratoId) {
    try {
        Alerta.Confirmar(
            "Deseja realmente remover este veículo do contrato?",
            "Esta ação não poderá ser desfeita!",
            "Sim, remover",
            "Cancelar"
        ).then((confirmado) => {
            if (confirmado) {
                $.ajax({
                    type: "POST",
                    url: "/api/ItensContrato/RemoverVeiculoContrato",
                    contentType: "application/json",
                    data: JSON.stringify({ veiculoId: veiculoId, contratoId: contratoId }),
                    success: function (res) {
                        try {
                            if (res && res.success) {
                                AppToast.show("Verde", res.message, 3000);
                                loadTblVeiculos(contratoId);
                            } else {
                                AppToast.show("Vermelho", res.message || "Erro ao remover veículo", 3000);
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("itenscontrato.js", "removerVeiculo.success", error);
                        }
                    },
                    error: function (err) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "removerVeiculo.error", err);
                    }
                });
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "removerVeiculo", error);
    }
}

function removerVeiculoAta(veiculoId, ataId) {
    try {
        Alerta.Confirmar(
            "Deseja realmente remover este veículo da ata?",
            "Esta ação não poderá ser desfeita!",
            "Sim, remover",
            "Cancelar"
        ).then((confirmado) => {
            if (confirmado) {
                $.ajax({
                    type: "POST",
                    url: "/api/ItensContrato/RemoverVeiculoAta",
                    contentType: "application/json",
                    data: JSON.stringify({ veiculoId: veiculoId, ataId: ataId }),
                    success: function (res) {
                        try {
                            if (res && res.success) {
                                AppToast.show("Verde", res.message, 3000);
                                loadTblVeiculosAta(ataId);
                            } else {
                                AppToast.show("Vermelho", res.message || "Erro ao remover veículo", 3000);
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("itenscontrato.js", "removerVeiculoAta.success", error);
                        }
                    },
                    error: function (err) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "removerVeiculoAta.error", err);
                    }
                });
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "removerVeiculoAta", error);
    }
}

function desvincularEncarregado(encarregadoId, contratoId) {
    try {
        Alerta.Confirmar(
            "Deseja desvincular este encarregado do contrato?",
            "O encarregado ficará disponível para outros contratos.",
            "Sim, desvincular",
            "Cancelar"
        ).then((confirmado) => {
            if (confirmado) {
                $.ajax({
                    type: "POST",
                    url: "/api/ItensContrato/RemoverEncarregadoContrato",
                    contentType: "application/json",
                    data: JSON.stringify({ encarregadoId: encarregadoId, contratoId: contratoId }),
                    success: function (res) {
                        try {
                            if (res && res.success) {
                                AppToast.show("Verde", "Encarregado desvinculado com sucesso!", 3000);
                                loadTblEncarregados(contratoId);
                            } else {
                                AppToast.show("Vermelho", res.message || "Erro ao desvincular encarregado", 3000);
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularEncarregado.success", error);
                        }
                    },
                    error: function (err) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularEncarregado.error", err);
                    }
                });
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularEncarregado", error);
    }
}

function desvincularOperador(operadorId, contratoId) {
    try {
        Alerta.Confirmar(
            "Deseja desvincular este operador do contrato?",
            "O operador ficará disponível para outros contratos.",
            "Sim, desvincular",
            "Cancelar"
        ).then((confirmado) => {
            if (confirmado) {
                $.ajax({
                    type: "POST",
                    url: "/api/ItensContrato/RemoverOperadorContrato",
                    contentType: "application/json",
                    data: JSON.stringify({ operadorId: operadorId, contratoId: contratoId }),
                    success: function (res) {
                        try {
                            if (res && res.success) {
                                AppToast.show("Verde", "Operador desvinculado com sucesso!", 3000);
                                loadTblOperadores(contratoId);
                            } else {
                                AppToast.show("Vermelho", res.message || "Erro ao desvincular operador", 3000);
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularOperador.success", error);
                        }
                    },
                    error: function (err) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularOperador.error", err);
                    }
                });
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularOperador", error);
    }
}

function desvincularMotorista(motoristaId, contratoId) {
    try {
        Alerta.Confirmar(
            "Deseja desvincular este motorista do contrato?",
            "O motorista ficará disponível para outros contratos.",
            "Sim, desvincular",
            "Cancelar"
        ).then((confirmado) => {
            if (confirmado) {
                $.ajax({
                    type: "POST",
                    url: "/api/ItensContrato/RemoverMotoristaContrato",
                    contentType: "application/json",
                    data: JSON.stringify({ motoristaId: motoristaId, contratoId: contratoId }),
                    success: function (res) {
                        try {
                            if (res && res.success) {
                                AppToast.show("Verde", "Motorista desvinculado com sucesso!", 3000);
                                loadTblMotoristas(contratoId);
                            } else {
                                AppToast.show("Vermelho", res.message || "Erro ao desvincular motorista", 3000);
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularMotorista.success", error);
                        }
                    },
                    error: function (err) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularMotorista.error", err);
                    }
                });
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularMotorista", error);
    }
}

function desvincularLavador(lavadorId, contratoId) {
    try {
        Alerta.Confirmar(
            "Deseja desvincular este lavador do contrato?",
            "O lavador ficará disponível para outros contratos.",
            "Sim, desvincular",
            "Cancelar"
        ).then((confirmado) => {
            if (confirmado) {
                $.ajax({
                    type: "POST",
                    url: "/api/ItensContrato/RemoverLavadorContrato",
                    contentType: "application/json",
                    data: JSON.stringify({ lavadorId: lavadorId, contratoId: contratoId }),
                    success: function (res) {
                        try {
                            if (res && res.success) {
                                AppToast.show("Verde", "Lavador desvinculado com sucesso!", 3000);
                                loadTblLavadores(contratoId);
                            } else {
                                AppToast.show("Vermelho", res.message || "Erro ao desvincular lavador", 3000);
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularLavador.success", error);
                        }
                    },
                    error: function (err) {
                        Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularLavador.error", err);
                    }
                });
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "desvincularLavador", error);
    }
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function formatarMoeda(valor) {
    try {
        if (valor === null || valor === undefined) return 'R$ 0,00';
        return 'R$ ' + parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (error) {
        Alerta.TratamentoErroComLinha("itenscontrato.js", "formatarMoeda", error);
        return 'R$ 0,00';
    }
}
