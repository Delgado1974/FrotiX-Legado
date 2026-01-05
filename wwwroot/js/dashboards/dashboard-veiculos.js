/**
 * Dashboard de Veículos - FrotiX
 * Tema: Verde Sage/Oliva
 * Versão: 1.0
 */

// Paleta de cores do tema Verde Sage
const CORES_VEIC = {
    primary: '#5f8575',
    secondary: '#7aa390',
    accent: '#8fb8a4',
    dark: '#4a6b5c',
    darker: '#3a5548',
    light: '#f0f7f4',
    cream: '#e8f2ed',
    // Cores complementares para gráficos
    chart: [
        '#5f8575', '#7aa390', '#8fb8a4', '#4a6b5c', '#3a5548',
        '#14b8a6', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'
    ]
};

// Instâncias dos gráficos Syncfusion
let chartCategoria, chartStatus, chartOrigem, chartModelos, chartAnoFabricacao;
let chartViagensMes, chartAbastecimentoMes;
let chartComparativoMensal, chartCustoCategoria;

// Dados globais
let dadosGerais = null;
let dadosUso = null;
let dadosCustos = null;

$(document).ready(function () {
    // Inicialização
    initTabs();
    carregarDadosGerais();
});

// ==============================================
// NAVEGAÇÃO DE ABAS
// ==============================================
function initTabs() {
    $('.dash-tab-veic').on('click', function () {
        const tabId = $(this).data('tab');

        // Atualiza classes das abas
        $('.dash-tab-veic').removeClass('active');
        $(this).addClass('active');

        // Mostra conteúdo correto
        $('.dash-content-veic').removeClass('active');
        $(`#tab-${tabId}`).addClass('active');

        // Carrega dados se necessário
        if (tabId === 'uso-veiculos' && !filtrosUsoInicializados) {
            inicializarFiltrosUso();
        } else if (tabId === 'custos' && !dadosCustos) {
            carregarDadosCustos();
        }
    });
}

// ==============================================
// LOADING OVERLAY
// ==============================================
function mostrarLoading(mensagem = 'Carregando...') {
    $('#loadingOverlayVeic .ftx-loading-text').text(mensagem);
    $('#loadingOverlayVeic').fadeIn(200);
}

function esconderLoading() {
    $('#loadingOverlayVeic').fadeOut(300);
}

// ==============================================
// ABA 1: VISÃO GERAL
// ==============================================
function carregarDadosGerais() {
    mostrarLoading('Carregando dados da frota...');

    $.ajax({
        url: '/api/DashboardVeiculos/DashboardDados',
        method: 'GET',
        success: function (data) {
            dadosGerais = data;
            atualizarCardsGerais(data.totais);
            renderizarGraficosGerais(data);
            renderizarTabelasGerais(data);
            esconderLoading();
        },
        error: function (xhr, status, error) {
            console.error('Erro ao carregar dados gerais:', error);
            esconderLoading();
            mostrarErro('Erro ao carregar dados da frota');
        }
    });
}

function atualizarCardsGerais(totais) {
    $('#totalVeiculos').text(totais.totalVeiculos.toLocaleString('pt-BR'));
    $('#veiculosAtivos').text(totais.veiculosAtivos.toLocaleString('pt-BR'));
    $('#veiculosInativos').text(totais.veiculosInativos.toLocaleString('pt-BR'));
    $('#veiculosReserva').text(totais.veiculosReserva.toLocaleString('pt-BR'));
    $('#veiculosEfetivos').text(totais.veiculosEfetivos.toLocaleString('pt-BR'));
    $('#veiculosProprios').text(totais.veiculosProprios.toLocaleString('pt-BR'));
    $('#veiculosLocados').text(totais.veiculosLocados.toLocaleString('pt-BR'));
    $('#idadeMedia').text(totais.idadeMedia.toFixed(1) + ' anos');
    $('#valorMensalTotal').text(formatarMoeda(totais.valorMensalTotal));
}

function renderizarGraficosGerais(data) {
    // Gráfico de Categoria (Donut)
    if (data.porCategoria && data.porCategoria.length > 0) {
        renderizarChartPie('chartCategoria', data.porCategoria.map(c => ({
            x: c.categoria,
            y: c.quantidade
        })));
    }

    // Gráfico de Status (Donut)
    if (data.porStatus && data.porStatus.length > 0) {
        renderizarChartPie('chartStatus', data.porStatus.map(s => ({
            x: s.status,
            y: s.quantidade
        })), ['#10b981', '#64748b']);
    }

    // Gráfico de Origem (Donut)
    if (data.porOrigem && data.porOrigem.length > 0) {
        renderizarChartPie('chartOrigem', data.porOrigem.map(o => ({
            x: o.origem,
            y: o.quantidade
        })), ['#5f8575', '#f59e0b', '#06b6d4']);
    }

    // Gráfico de Modelos (Barras Horizontais)
    if (data.porModelo && data.porModelo.length > 0) {
        renderizarChartBarH('chartModelos', data.porModelo.map(m => ({
            x: m.modelo.length > 25 ? m.modelo.substring(0, 22) + '...' : m.modelo,
            y: m.quantidade
        })));
    }

    // Gráfico de Ano de Fabricação (Colunas)
    if (data.porAnoFabricacao && data.porAnoFabricacao.length > 0) {
        renderizarChartColumn('chartAnoFabricacao', data.porAnoFabricacao.map(a => ({
            x: a.ano.toString(),
            y: a.quantidade
        })));
    }
}

function renderizarTabelasGerais(data) {
    // Tabela de Categorias
    let htmlCategoria = '';
    if (data.porCategoria && data.porCategoria.length > 0) {
        data.porCategoria.forEach(c => {
            htmlCategoria += `
                <div class="grid-row">
                    <div class="grid-cell">${c.categoria}</div>
                    <div class="grid-cell text-end"><strong>${c.quantidade}</strong></div>
                </div>
            `;
        });
        // Total
        const totalCat = data.porCategoria.reduce((sum, c) => sum + c.quantidade, 0);
        htmlCategoria += `
            <div class="grid-row grid-row-total">
                <div class="grid-cell"><strong>TOTAL</strong></div>
                <div class="grid-cell text-end"><strong>${totalCat}</strong></div>
            </div>
        `;
    } else {
        htmlCategoria = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 2; text-align: center;">Nenhum dado encontrado</div></div>';
    }
    $('#tabelaCategoria').html(htmlCategoria);

    // Tabela de Combustível
    let htmlCombustivel = '';
    if (data.porCombustivel && data.porCombustivel.length > 0) {
        data.porCombustivel.forEach(c => {
            htmlCombustivel += `
                <div class="grid-row">
                    <div class="grid-cell">${c.combustivel}</div>
                    <div class="grid-cell text-end"><strong>${c.quantidade}</strong></div>
                </div>
            `;
        });
    } else {
        htmlCombustivel = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 2; text-align: center;">Nenhum dado encontrado</div></div>';
    }
    $('#tabelaCombustivel').html(htmlCombustivel);

    // Tabela de Unidades
    let htmlUnidade = '';
    if (data.porUnidade && data.porUnidade.length > 0) {
        data.porUnidade.forEach(u => {
            htmlUnidade += `
                <div class="grid-row">
                    <div class="grid-cell">${u.unidade}</div>
                    <div class="grid-cell text-end"><strong>${u.quantidade}</strong></div>
                </div>
            `;
        });
    } else {
        htmlUnidade = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 2; text-align: center;">Nenhum dado encontrado</div></div>';
    }
    $('#tabelaUnidade').html(htmlUnidade);

    // Tabela Top KM
    let htmlTopKm = '';
    if (data.topKm && data.topKm.length > 0) {
        data.topKm.forEach((v, i) => {
            const badgeClass = i < 3 ? 'top3' : '';
            htmlTopKm += `
                <div class="grid-row">
                    <div class="grid-cell"><span class="badge-rank-veic ${badgeClass}">${i + 1}</span></div>
                    <div class="grid-cell">
                        <strong>${v.placa}</strong>
                        <small class="d-block text-muted">${v.modelo}</small>
                    </div>
                    <div class="grid-cell text-end"><strong>${v.km.toLocaleString('pt-BR')} km</strong></div>
                </div>
            `;
        });
    } else {
        htmlTopKm = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 3; text-align: center;">Nenhum dado encontrado</div></div>';
    }
    $('#tabelaTopKm').html(htmlTopKm);
}

// ==============================================
// ABA 2: USO DOS VEÍCULOS
// ==============================================

// Variáveis de estado dos filtros
let filtroUsoAtual = { tipo: 'todos' };
let filtrosUsoInicializados = false;

/**
 * Inicializa filtros da aba Uso dos Veículos
 * Detecta o ano mais recente com registros e pré-seleciona
 */
function inicializarFiltrosUso() {
    mostrarLoading('Carregando estatísticas de uso...');

    // Primeira chamada: obter anos disponíveis
    $.ajax({
        url: '/api/DashboardVeiculos/DashboardUso',
        method: 'GET',
        data: {},
        success: function (data) {
            const anos = data.anosDisponiveis || [];

            if (anos.length === 0) {
                // Sem dados disponíveis
                dadosUso = data;
                filtrosUsoInicializados = true;
                preencherSelectAnos('#filtroAnoUso', [], null);
                atualizarCardsUso(data.totais);
                renderizarGraficosUso(data);
                renderizarTabelasUso(data);
                esconderLoading();
                return;
            }

            // Ano com último registro (primeiro da lista, ordenado desc)
            const anoMaisRecente = anos[0];

            // Preencher select de anos e pré-selecionar o mais recente
            preencherSelectAnos('#filtroAnoUso', anos, anoMaisRecente);
            $('#filtroAnoUso').val(anoMaisRecente.toString());

            // Buscar dados DO ANO MAIS RECENTE para determinar o mês mais recente
            $.ajax({
                url: '/api/DashboardVeiculos/DashboardUso',
                method: 'GET',
                data: { ano: anoMaisRecente },
                success: function (dataAno) {
                    let mesSelecionado = '';
                    const viagensPorMes = dataAno.viagensPorMes || [];

                    // Encontrar o último mês com dados (maior número de mês com valor > 0)
                    if (viagensPorMes.length > 0) {
                        const mesesComDados = viagensPorMes
                            .filter(item => item.total > 0)
                            .map(item => item.mes)
                            .sort((a, b) => b - a); // Ordenar decrescente

                        if (mesesComDados.length > 0) {
                            mesSelecionado = mesesComDados[0].toString();
                        }
                    }

                    // Pré-selecionar mês se encontrado
                    if (mesSelecionado) {
                        $('#filtroMesUso').val(mesSelecionado);
                        filtroUsoAtual = { tipo: 'anoMes', ano: anoMaisRecente.toString(), mes: mesSelecionado };
                    } else {
                        filtroUsoAtual = { tipo: 'anoMes', ano: anoMaisRecente.toString(), mes: '' };
                    }

                    // Atualizar label de período
                    atualizarPeriodoAtualLabel();

                    // Carregar dados com filtros aplicados
                    dadosUso = dataAno;
                    filtrosUsoInicializados = true;
                    atualizarCardsUso(dataAno.totais);
                    renderizarGraficosUso(dataAno);
                    renderizarTabelasUso(dataAno);
                    esconderLoading();
                },
                error: function () {
                    // Em caso de erro, usa os dados da primeira chamada
                    filtroUsoAtual = { tipo: 'anoMes', ano: anoMaisRecente.toString(), mes: '' };
                    atualizarPeriodoAtualLabel();
                    dadosUso = data;
                    filtrosUsoInicializados = true;
                    atualizarCardsUso(data.totais);
                    renderizarGraficosUso(data);
                    renderizarTabelasUso(data);
                    esconderLoading();
                }
            });
        },
        error: function (xhr, status, error) {
            console.error('Erro ao inicializar filtros de uso:', error);
            esconderLoading();
            mostrarErro('Erro ao carregar estatísticas de uso');
        }
    });
}

function carregarDadosUso(params = {}) {
    mostrarLoading('Carregando estatísticas de uso...');

    $.ajax({
        url: '/api/DashboardVeiculos/DashboardUso',
        method: 'GET',
        data: params,
        success: function (data) {
            dadosUso = data;

            // Preencher select de anos se não preenchido
            if ($('#filtroAnoUso option').length <= 1) {
                preencherSelectAnos('#filtroAnoUso', data.anosDisponiveis, null);
            }

            atualizarCardsUso(data.totais);
            renderizarGraficosUso(data);
            renderizarTabelasUso(data);
            esconderLoading();
        },
        error: function (xhr, status, error) {
            console.error('Erro ao carregar dados de uso:', error);
            esconderLoading();
            mostrarErro('Erro ao carregar estatísticas de uso');
        }
    });
}

// Atualiza o label do período atual
function atualizarPeriodoAtualLabel() {
    const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let label = 'Exibindo todos os dados';

    if (filtroUsoAtual.tipo === 'anoMes') {
        const ano = filtroUsoAtual.ano;
        const mes = filtroUsoAtual.mes;
        if (ano && mes) {
            label = `Período: ${meses[parseInt(mes)]}/${ano}`;
        } else if (ano) {
            label = `Período: Ano ${ano}`;
        } else if (mes) {
            label = `Período: ${meses[parseInt(mes)]} (todos os anos)`;
        }
    } else if (filtroUsoAtual.tipo === 'periodo') {
        const di = filtroUsoAtual.dataInicio;
        const df = filtroUsoAtual.dataFim;
        if (di && df) {
            label = `Período: ${formatarDataBR(di)} a ${formatarDataBR(df)}`;
        }
    } else if (filtroUsoAtual.tipo === 'rapido') {
        label = `Período: Últimos ${filtroUsoAtual.dias} dias`;
    }

    $('#periodoAtualLabelUso').text(label);
}

function formatarDataBR(dataStr) {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Eventos dos filtros - Ano/Mês
$(document).on('click', '#btnFiltrarAnoMesUso', function () {
    const ano = $('#filtroAnoUso').val();
    const mes = $('#filtroMesUso').val();

    const params = {};
    if (ano) params.ano = ano;
    if (mes) params.mes = mes;

    filtroUsoAtual = { tipo: 'anoMes', ano, mes };
    atualizarPeriodoAtualLabel();

    // Limpar campos de período
    $('#dataInicioUso').val('');
    $('#dataFimUso').val('');
    $('.btn-period-veic').removeClass('active');

    carregarDadosUso(params);
});

$(document).on('click', '#btnLimparAnoMesUso', function () {
    $('#filtroAnoUso').val('');
    $('#filtroMesUso').val('');
    $('#dataInicioUso').val('');
    $('#dataFimUso').val('');
    $('.btn-period-veic').removeClass('active');

    filtroUsoAtual = { tipo: 'todos' };
    atualizarPeriodoAtualLabel();

    carregarDadosUso({});
});

// Eventos dos filtros - Período Personalizado
$(document).on('click', '#btnFiltrarPeriodoUso', function () {
    const dataInicio = $('#dataInicioUso').val();
    const dataFim = $('#dataFimUso').val();

    if (!dataInicio || !dataFim) {
        mostrarErro('Preencha as datas de início e fim');
        return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
        mostrarErro('Data de início deve ser anterior à data de fim');
        return;
    }

    const params = { dataInicio, dataFim };

    filtroUsoAtual = { tipo: 'periodo', dataInicio, dataFim };
    atualizarPeriodoAtualLabel();

    // Limpar campos de ano/mês
    $('#filtroAnoUso').val('');
    $('#filtroMesUso').val('');
    $('.btn-period-veic').removeClass('active');

    carregarDadosUso(params);
});

$(document).on('click', '#btnLimparPeriodoUso', function () {
    $('#dataInicioUso').val('');
    $('#dataFimUso').val('');
    $('.btn-period-veic').removeClass('active');

    // Manter ano/mês se estiverem preenchidos
    const ano = $('#filtroAnoUso').val();
    const mes = $('#filtroMesUso').val();

    if (ano || mes) {
        filtroUsoAtual = { tipo: 'anoMes', ano, mes };
        const params = {};
        if (ano) params.ano = ano;
        if (mes) params.mes = mes;
        carregarDadosUso(params);
    } else {
        filtroUsoAtual = { tipo: 'todos' };
        carregarDadosUso({});
    }

    atualizarPeriodoAtualLabel();
});

// Eventos dos Períodos Rápidos
$(document).on('click', '.btn-period-veic', function () {
    const dias = parseInt($(this).data('dias'));

    // Calcular datas
    const hoje = new Date();
    const dataFim = hoje.toISOString().split('T')[0];
    const dataInicio = new Date(hoje.getTime() - (dias * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

    // Atualizar campos visuais
    $('#dataInicioUso').val(dataInicio);
    $('#dataFimUso').val(dataFim);
    $('#filtroAnoUso').val('');
    $('#filtroMesUso').val('');

    // Marcar botão ativo
    $('.btn-period-veic').removeClass('active');
    $(this).addClass('active');

    filtroUsoAtual = { tipo: 'rapido', dias, dataInicio, dataFim };
    atualizarPeriodoAtualLabel();

    carregarDadosUso({ dataInicio, dataFim });
});

function atualizarCardsUso(totais) {
    $('#totalViagensUso').text(totais.totalViagens.toLocaleString('pt-BR'));
    $('#kmTotalRodado').text(totais.kmTotalRodado.toLocaleString('pt-BR') + ' km');
    $('#totalAbastecimentosUso').text(totais.totalAbastecimentos.toLocaleString('pt-BR'));
    $('#totalLitrosUso').text(totais.totalLitros.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' L');
    $('#valorAbastecimentoUso').text(formatarMoeda(totais.valorTotalAbastecimento));
}

function renderizarGraficosUso(data) {
    // Gráfico Viagens por Mês
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dadosViagens = [];
    for (let i = 1; i <= 12; i++) {
        const item = data.viagensPorMes.find(v => v.mes === i);
        dadosViagens.push({
            x: meses[i - 1],
            y: item ? item.quantidade : 0
        });
    }
    renderizarChartArea('chartViagensMes', dadosViagens, CORES_VEIC.primary);

    // Gráfico Abastecimento por Mês
    const dadosAbast = [];
    for (let i = 1; i <= 12; i++) {
        const item = data.abastecimentoPorMes.find(a => a.mes === i);
        dadosAbast.push({
            x: meses[i - 1],
            y: item ? item.valor : 0
        });
    }
    renderizarChartArea('chartAbastecimentoMes', dadosAbast, '#f59e0b');
}

function renderizarTabelasUso(data) {
    // Tabela Top Viagens
    let htmlViagens = '';
    if (data.topViagens && data.topViagens.length > 0) {
        data.topViagens.forEach((v, i) => {
            const badgeClass = i < 3 ? 'top3' : '';
            htmlViagens += `
                <div class="grid-row">
                    <div class="grid-cell"><span class="badge-rank-veic ${badgeClass}">${i + 1}</span></div>
                    <div class="grid-cell">
                        <strong>${v.placa}</strong>
                        <small class="d-block text-muted">${v.modelo}</small>
                    </div>
                    <div class="grid-cell text-center"><strong>${v.quantidade}</strong></div>
                    <div class="grid-cell text-end">${v.kmTotal.toLocaleString('pt-BR')} km</div>
                </div>
            `;
        });
    } else {
        htmlViagens = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 4; text-align: center;">Nenhum dado encontrado</div></div>';
    }
    $('#tabelaTopViagens').html(htmlViagens);

    // Tabela Top Abastecimento
    let htmlAbast = '';
    if (data.topAbastecimento && data.topAbastecimento.length > 0) {
        data.topAbastecimento.forEach((v, i) => {
            const badgeClass = i < 3 ? 'top3' : '';
            htmlAbast += `
                <div class="grid-row">
                    <div class="grid-cell"><span class="badge-rank-veic ${badgeClass}">${i + 1}</span></div>
                    <div class="grid-cell">
                        <strong>${v.placa}</strong>
                        <small class="d-block text-muted">${v.modelo}</small>
                    </div>
                    <div class="grid-cell text-end">${v.litros.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} L</div>
                    <div class="grid-cell text-end"><strong>${formatarMoeda(v.valor)}</strong></div>
                </div>
            `;
        });
    } else {
        htmlAbast = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 4; text-align: center;">Nenhum dado encontrado</div></div>';
    }
    $('#tabelaTopAbastecimento').html(htmlAbast);

    // Tabela Top Litros Abastecidos
    let htmlLitros = '';
    if (data.topLitrosAbastecidos && data.topLitrosAbastecidos.length > 0) {
        data.topLitrosAbastecidos.forEach((v, i) => {
            const badgeClass = i < 3 ? 'top3' : '';
            htmlLitros += `
                <div class="grid-row">
                    <div class="grid-cell"><span class="badge-rank-veic ${badgeClass}">${i + 1}</span></div>
                    <div class="grid-cell">
                        <strong>${v.placa}</strong>
                        <small class="d-block text-muted">${v.modelo}</small>
                    </div>
                    <div class="grid-cell text-end"><strong>${v.litros.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} L</strong></div>
                    <div class="grid-cell text-center">${v.qtdAbastecimentos}</div>
                </div>
            `;
        });
    } else {
        htmlLitros = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 4; text-align: center;">Nenhum dado encontrado</div></div>';
    }
    $('#tabelaTopLitros').html(htmlLitros);

    // Tabela Top Menos Eficientes (menor km/l)
    let htmlConsumo = '';
    if (data.topConsumo && data.topConsumo.length > 0) {
        data.topConsumo.forEach((v, i) => {
            const badgeClass = i < 3 ? 'top3' : '';
            htmlConsumo += `
                <div class="grid-row">
                    <div class="grid-cell"><span class="badge-rank-veic ${badgeClass}">${i + 1}</span></div>
                    <div class="grid-cell">
                        <strong>${v.placa}</strong>
                        <small class="d-block text-muted">${v.modelo}</small>
                    </div>
                    <div class="grid-cell text-end"><strong style="color: #ef4444;">${v.consumo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
                    <div class="grid-cell text-end">${v.kmRodado.toLocaleString('pt-BR')}</div>
                </div>
            `;
        });
    } else {
        htmlConsumo = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 4; text-align: center;">Nenhum dado encontrado</div></div>';
    }
    $('#tabelaTopConsumo').html(htmlConsumo);

    // Tabela Top Mais Eficientes (maior km/l)
    let htmlEficiencia = '';
    if (data.topEficiencia && data.topEficiencia.length > 0) {
        data.topEficiencia.forEach((v, i) => {
            const badgeClass = i < 3 ? 'top3' : '';
            htmlEficiencia += `
                <div class="grid-row">
                    <div class="grid-cell"><span class="badge-rank-veic ${badgeClass}">${i + 1}</span></div>
                    <div class="grid-cell">
                        <strong>${v.placa}</strong>
                        <small class="d-block text-muted">${v.modelo}</small>
                    </div>
                    <div class="grid-cell text-end"><strong style="color: #10b981;">${v.consumo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
                    <div class="grid-cell text-end">${v.kmRodado.toLocaleString('pt-BR')}</div>
                </div>
            `;
        });
    } else {
        htmlEficiencia = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 4; text-align: center;">Nenhum dado encontrado</div></div>';
    }
    $('#tabelaTopEficiencia').html(htmlEficiencia);
}

// ==============================================
// ABA 3: CUSTOS
// ==============================================
function carregarDadosCustos(ano = null) {
    mostrarLoading('Carregando dados de custos...');

    const params = ano ? { ano: ano } : {};

    $.ajax({
        url: '/api/DashboardVeiculos/DashboardCustos',
        method: 'GET',
        data: params,
        success: function (data) {
            dadosCustos = data;

            // Preencher select de anos se não preenchido
            if ($('#filtroAnoCusto option').length <= 1) {
                // Usar anos do dadosUso se disponível
                if (dadosUso && dadosUso.anosDisponiveis) {
                    preencherSelectAnos('#filtroAnoCusto', dadosUso.anosDisponiveis, data.anoSelecionado);
                } else {
                    preencherSelectAnos('#filtroAnoCusto', [new Date().getFullYear()], data.anoSelecionado);
                }
            }

            atualizarCardsCustos(data.totais);
            renderizarGraficosCustos(data);
            renderizarTabelasCustos(data);
            esconderLoading();
        },
        error: function (xhr, status, error) {
            console.error('Erro ao carregar dados de custos:', error);
            esconderLoading();
            mostrarErro('Erro ao carregar dados de custos');
        }
    });
}

function atualizarCardsCustos(totais) {
    $('#custoAbastecimento').text(formatarMoeda(totais.totalAbastecimento));
    $('#custoManutencao').text(formatarMoeda(totais.totalManutencao));
    $('#qtdAbastecimentosCusto').text(totais.qtdAbastecimentos.toLocaleString('pt-BR'));
    $('#qtdManutencoesCusto').text(totais.qtdManutencoes.toLocaleString('pt-BR'));
}

function renderizarGraficosCustos(data) {
    // Gráfico Comparativo Mensal (Barras Agrupadas)
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const seriesAbast = [];
    const seriesManut = [];

    data.comparativoMensal.forEach((item, i) => {
        seriesAbast.push({ x: meses[i], y: item.abastecimento });
        seriesManut.push({ x: meses[i], y: item.manutencao });
    });

    renderizarChartColumnGrouped('chartComparativoMensal', seriesAbast, seriesManut, 'Abastecimento', 'Manutenção');

    // Gráfico Custo por Categoria
    if (data.custoPorCategoria && data.custoPorCategoria.length > 0) {
        renderizarChartBarH('chartCustoCategoria', data.custoPorCategoria.map(c => ({
            x: c.categoria,
            y: c.valorAbastecimento
        })), '#f59e0b');
    }
}

function renderizarTabelasCustos(data) {
    // Tabela Custo por Categoria
    let html = '';
    if (data.custoPorCategoria && data.custoPorCategoria.length > 0) {
        let total = 0;
        data.custoPorCategoria.forEach(c => {
            total += c.valorAbastecimento;
            html += `
                <div class="grid-row">
                    <div class="grid-cell">${c.categoria}</div>
                    <div class="grid-cell text-end"><strong>${formatarMoeda(c.valorAbastecimento)}</strong></div>
                </div>
            `;
        });
        html += `
            <div class="grid-row grid-row-total">
                <div class="grid-cell"><strong>TOTAL</strong></div>
                <div class="grid-cell text-end"><strong>${formatarMoeda(total)}</strong></div>
            </div>
        `;
    } else {
        html = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 2; text-align: center;">Nenhum dado encontrado</div></div>';
    }
    $('#tabelaCustoCategoria').html(html);
}

// Evento do botão filtrar Custos
$(document).on('click', '#btnFiltrarCusto', function () {
    const ano = $('#filtroAnoCusto').val();
    carregarDadosCustos(ano);
});

// ==============================================
// GRÁFICOS SYNCFUSION
// ==============================================

function renderizarChartPie(containerId, dados, cores = CORES_VEIC.chart) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const chart = new ej.charts.AccumulationChart({
        series: [{
            dataSource: dados,
            xName: 'x',
            yName: 'y',
            innerRadius: '50%',
            palettes: cores,
            dataLabel: {
                visible: true,
                position: 'Outside',
                name: 'x',
                font: { fontWeight: '600', size: '11px' },
                connectorStyle: { length: '10px', type: 'Curve' }
            },
            explode: true,
            explodeOffset: '5%',
            explodeIndex: 0
        }],
        legendSettings: {
            visible: true,
            position: 'Bottom',
            textStyle: { size: '11px' }
        },
        tooltip: {
            enable: true,
            format: '${point.x}: <b>${point.y}</b>'
        },
        background: 'transparent',
        enableSmartLabels: true
    });
    chart.appendTo(container);
}

function renderizarChartBarH(containerId, dados, cor = CORES_VEIC.primary) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const chart = new ej.charts.Chart({
        primaryXAxis: {
            valueType: 'Category',
            labelStyle: { size: '10px' },
            majorGridLines: { width: 0 }
        },
        primaryYAxis: {
            labelFormat: '{value}',
            labelStyle: { size: '10px' },
            majorGridLines: { dashArray: '3,3' }
        },
        series: [{
            dataSource: dados,
            xName: 'x',
            yName: 'y',
            type: 'Bar',
            fill: cor,
            cornerRadius: { topLeft: 4, topRight: 4 },
            marker: { dataLabel: { visible: true, position: 'Top', font: { size: '10px', fontWeight: '600' } } }
        }],
        tooltip: { enable: true, format: '${point.x}: <b>${point.y}</b>' },
        chartArea: { border: { width: 0 } },
        background: 'transparent'
    });
    chart.appendTo(container);
}

function renderizarChartColumn(containerId, dados, cor = CORES_VEIC.primary) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const chart = new ej.charts.Chart({
        primaryXAxis: {
            valueType: 'Category',
            labelStyle: { size: '10px' },
            majorGridLines: { width: 0 }
        },
        primaryYAxis: {
            labelFormat: '{value}',
            labelStyle: { size: '10px' },
            majorGridLines: { dashArray: '3,3' }
        },
        series: [{
            dataSource: dados,
            xName: 'x',
            yName: 'y',
            type: 'Column',
            fill: cor,
            cornerRadius: { topLeft: 4, topRight: 4 },
            marker: { dataLabel: { visible: true, position: 'Top', font: { size: '10px', fontWeight: '600' } } }
        }],
        tooltip: { enable: true, format: '${point.x}: <b>${point.y}</b>' },
        chartArea: { border: { width: 0 } },
        background: 'transparent'
    });
    chart.appendTo(container);
}

function renderizarChartArea(containerId, dados, cor = CORES_VEIC.primary) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const chart = new ej.charts.Chart({
        primaryXAxis: {
            valueType: 'Category',
            labelStyle: { size: '10px' },
            majorGridLines: { width: 0 }
        },
        primaryYAxis: {
            labelFormat: '{value}',
            labelStyle: { size: '10px' },
            majorGridLines: { dashArray: '3,3' }
        },
        series: [{
            dataSource: dados,
            xName: 'x',
            yName: 'y',
            type: 'SplineArea',
            fill: cor,
            opacity: 0.5,
            border: { width: 2, color: cor },
            marker: {
                visible: true,
                width: 7,
                height: 7,
                fill: cor,
                border: { width: 2, color: '#fff' }
            }
        }],
        tooltip: { enable: true, format: '${point.x}: <b>${point.y}</b>' },
        chartArea: { border: { width: 0 } },
        background: 'transparent'
    });
    chart.appendTo(container);
}

function renderizarChartColumnGrouped(containerId, series1, series2, nome1, nome2) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const chart = new ej.charts.Chart({
        primaryXAxis: {
            valueType: 'Category',
            labelStyle: { size: '10px' },
            majorGridLines: { width: 0 }
        },
        primaryYAxis: {
            labelFormat: 'R$ {value}',
            labelStyle: { size: '10px' },
            majorGridLines: { dashArray: '3,3' }
        },
        series: [
            {
                dataSource: series1,
                xName: 'x',
                yName: 'y',
                name: nome1,
                type: 'Column',
                fill: '#f59e0b',
                cornerRadius: { topLeft: 3, topRight: 3 }
            },
            {
                dataSource: series2,
                xName: 'x',
                yName: 'y',
                name: nome2,
                type: 'Column',
                fill: CORES_VEIC.primary,
                cornerRadius: { topLeft: 3, topRight: 3 }
            }
        ],
        legendSettings: { visible: true, position: 'Top' },
        tooltip: {
            enable: true,
            shared: true,
            format: '${series.name}: <b>${point.y}</b>'
        },
        chartArea: { border: { width: 0 } },
        background: 'transparent'
    });
    chart.appendTo(container);
}

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================

function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });
}

function preencherSelectAnos(seletor, anos, anoSelecionado) {
    const $select = $(seletor);
    $select.empty();

    // Adiciona opção "Todos os Anos" primeiro
    $select.append('<option value="">&lt;Todos os Anos&gt;</option>');

    if (anos && anos.length > 0) {
        anos.forEach(ano => {
            const selected = ano === anoSelecionado ? 'selected' : '';
            $select.append(`<option value="${ano}" ${selected}>${ano}</option>`);
        });
    } else {
        const anoAtual = new Date().getFullYear();
        $select.append(`<option value="${anoAtual}" selected>${anoAtual}</option>`);
    }
}

function mostrarErro(mensagem) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: mensagem,
            confirmButtonColor: CORES_VEIC.primary
        });
    } else {
        alert(mensagem);
    }
}
