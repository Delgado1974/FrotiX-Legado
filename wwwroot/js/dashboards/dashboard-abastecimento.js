/**
 * Dashboard de Abastecimentos - Refatorado
 * FrotiX - Câmara dos Deputados
 * Paleta: Âmbar/Dourado
 */

// ====== VARIÁVEIS GLOBAIS ======
let dadosGerais = null;
let dadosMensais = null;
let dadosVeiculo = null;
let modalLoading = null;

// Instâncias dos gráficos
let chartValorCategoria = null;
let chartValorLitro = null;
let chartLitrosMes = null;
let chartConsumoMes = null;
let chartPizzaCombustivel = null;
let chartLitrosDia = null;
let chartConsumoCategoria = null;
let chartConsumoMensalVeiculo = null;
let chartValorMensalVeiculo = null;
let chartRankingVeiculos = null;

// Nomes dos meses
const MESES = ['', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_COMPLETOS = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// Paleta de cores CARAMELO SUAVE
const CORES = {
    amber: ['#a8784c', '#8b5e3c', '#6d472c', '#5a3a24', '#4a2f1d'],
    gold: ['#d4a574', '#c4956a', '#a8784c', '#9a7045', '#8b6340'],
    warm: ['#c49a6c', '#b8916a', '#a88565', '#9a785a', '#8c6c50'],
    multi: ['#a8784c', '#c4956a', '#d4a574', '#b8916a', '#8b5e3c', '#9a7045', '#6d472c', '#8b6340'],
    categorias: ['#a8784c', '#c49a6c', '#9a7045', '#8b5e3c', '#c4956a', '#5a3a24', '#6d472c', '#8b6340', '#d4a574', '#4a2f1d']
};

// ====== MODAL DE LOADING ======
function mostrarLoading() {
    if (!modalLoading) {
        const modalEl = document.getElementById('modalLoadingAbast');
        if (modalEl) {
            modalLoading = new bootstrap.Modal(modalEl);
        }
    }
    if (modalLoading) {
        modalLoading.show();
    }
}

function esconderLoading() {
    if (modalLoading) {
        modalLoading.hide();
    }
    // Força cor caramelo nos headers das tabelas após fechar modal
    forcarCorCarameloTabelas();
}

/**
 * Força a cor caramelo nos headers das tabelas .ftx-tabela-caramelo
 * Necessário porque algum handler global muda a cor para azul
 */
function forcarCorCarameloTabelas() {
    setTimeout(function() {
        document.querySelectorAll('.ftx-tabela-caramelo thead').forEach(thead => {
            thead.style.setProperty('background', 'linear-gradient(135deg, #a8784c 0%, #c4956a 100%)', 'important');
            thead.style.setProperty('background-color', '#a8784c', 'important');
        });
        document.querySelectorAll('.ftx-tabela-caramelo thead tr').forEach(tr => {
            tr.style.setProperty('background', 'linear-gradient(135deg, #a8784c 0%, #c4956a 100%)', 'important');
            tr.style.setProperty('background-color', '#a8784c', 'important');
        });
        document.querySelectorAll('.ftx-tabela-caramelo thead th').forEach(th => {
            th.style.setProperty('background', 'transparent', 'important');
            th.style.setProperty('background-color', 'transparent', 'important');
            th.style.setProperty('color', '#ffffff', 'important');
        });
    }, 100);
}

// ====== INICIALIZAÇÃO ======
document.addEventListener('DOMContentLoaded', function () {
    try {
        inicializarTabs();
        // Primeiro busca anos disponíveis, depois carrega com filtros
        inicializarFiltrosECarregar();
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "DOMContentLoaded", error);
    }
});

/**
 * Inicializa os filtros buscando anos disponíveis e depois carrega os dados filtrados
 */
function inicializarFiltrosECarregar() {
    try {
        mostrarLoading();

        // Busca rápida só para obter anos disponíveis
        $.ajax({
            url: '/api/abastecimento/DashboardDados',
            type: 'GET',
            data: { ano: null, mes: null },
            success: function (data) {
                try {
                    const anos = data.anosDisponiveis || [];
                    const mesAtual = new Date().getMonth() + 1;

                    // Ano mais recente disponível
                    const anoMaisRecente = anos.length > 0 ? anos[0] : new Date().getFullYear();

                    // Preencher selects de ano
                    const selectGeral = document.getElementById('filtroAnoGeral');
                    const selectMensal = document.getElementById('filtroAnoMensal');
                    const selectVeiculo = document.getElementById('filtroAnoVeiculo');

                    [selectGeral, selectMensal, selectVeiculo].forEach(select => {
                        if (!select) return;
                        const isGeral = select.id === 'filtroAnoGeral';
                        select.innerHTML = isGeral ? '<option value="">Todos os Anos</option>' : '';
                        anos.forEach(ano => {
                            const option = document.createElement('option');
                            option.value = ano;
                            option.textContent = ano;
                            select.appendChild(option);
                        });
                        select.value = anoMaisRecente.toString();
                        select.dataset.initialized = 'true';
                    });

                    // Determinar o mês: mês atual se tiver dados, senão último mês com dados
                    let mesSelecionado = '';
                    const consumoPorMes = data.consumoPorMes || [];

                    if (consumoPorMes.length > 0) {
                        // Filtrar consumo do ano mais recente
                        const temDadosMesAtual = consumoPorMes.some(item => item.mes === mesAtual && item.valor > 0);

                        if (temDadosMesAtual) {
                            mesSelecionado = mesAtual.toString();
                        } else {
                            // Último mês com dados
                            const mesesComDados = consumoPorMes
                                .filter(item => item.valor > 0)
                                .map(item => item.mes)
                                .sort((a, b) => b - a);

                            if (mesesComDados.length > 0) {
                                mesSelecionado = mesesComDados[0].toString();
                            }
                        }
                    }

                    const selectMesGeral = document.getElementById('filtroMesGeral');
                    if (selectMesGeral) {
                        selectMesGeral.value = mesSelecionado;
                        selectMesGeral.dataset.initialized = 'true';
                    }

                    // Agora carrega os dados com os filtros aplicados
                    carregarDadosGeraisComFiltros();

                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "inicializarFiltrosECarregar.success", error);
                    esconderLoading();
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao inicializar filtros:', error);
                esconderLoading();
                // Tenta carregar sem filtros
                carregarDadosGerais();
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "inicializarFiltrosECarregar", error);
        esconderLoading();
    }
}

/**
 * Carrega dados gerais usando os filtros já selecionados (sem repreencher filtros)
 */
function carregarDadosGeraisComFiltros() {
    try {
        const ano = document.getElementById('filtroAnoGeral')?.value || '';
        const mes = document.getElementById('filtroMesGeral')?.value || '';

        $.ajax({
            url: '/api/abastecimento/DashboardDados',
            type: 'GET',
            data: { ano: ano || null, mes: mes || null },
            success: function (data) {
                try {
                    dadosGerais = data;
                    renderizarAbaGeral(data);
                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosGeraisComFiltros.success", error);
                } finally {
                    esconderLoading();
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar dados gerais:', error);
                AppToast.show('red', 'Erro ao carregar dados do dashboard', 5000);
                esconderLoading();
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosGeraisComFiltros", error);
        esconderLoading();
    }
}

// ====== NAVEGAÇÃO DE ABAS ======
function inicializarTabs() {
    try {
        const tabs = document.querySelectorAll('.dash-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const tabId = this.getAttribute('data-tab');
                const tabAtual = document.querySelector('.dash-tab.active')?.getAttribute('data-tab');

                if (tabId === tabAtual) return;

                if (tabAtual === 'consumo-geral') destruirGraficosGeral();
                if (tabAtual === 'consumo-mensal') destruirGraficosMensal();
                if (tabAtual === 'consumo-veiculo') destruirGraficosVeiculo();

                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                document.querySelectorAll('.dash-content').forEach(c => c.classList.remove('active'));

                const tabContent = document.getElementById('tab-' + tabId);
                if (tabContent) tabContent.classList.add('active');

                setTimeout(() => {
                    if (tabId === 'consumo-geral') {
                        carregarDadosGerais();
                    } else if (tabId === 'consumo-mensal') {
                        carregarDadosMensais();
                    } else if (tabId === 'consumo-veiculo') {
                        carregarDadosVeiculo();
                    }
                }, 100);
            });
        });

        document.getElementById('btnFiltrarGeral')?.addEventListener('click', function () {
            carregarDadosGerais();
        });

        document.getElementById('btnFiltrarMensal')?.addEventListener('click', function () {
            carregarDadosMensais();
        });

        document.getElementById('btnFiltrarVeiculo')?.addEventListener('click', function () {
            carregarDadosVeiculo();
        });

        document.getElementById('filtroModeloVeiculo')?.addEventListener('change', function () {
            document.getElementById('filtroPlacaVeiculo').value = '';
            carregarDadosVeiculo();
        });
        
        document.getElementById('filtroPlacaVeiculo')?.addEventListener('change', function () {
            if (this.value) {
                document.getElementById('filtroModeloVeiculo').value = '';
            }
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "inicializarTabs", error);
    }
}

// ====== CARREGAMENTO DE DADOS ======

function carregarDadosGerais() {
    try {
        mostrarLoading();
        const ano = document.getElementById('filtroAnoGeral')?.value || '';
        const mes = document.getElementById('filtroMesGeral')?.value || '';

        $.ajax({
            url: '/api/abastecimento/DashboardDados',
            type: 'GET',
            data: { ano: ano || null, mes: mes || null },
            success: function (data) {
                try {
                    dadosGerais = data;
                    // Não repreenche os filtros, apenas renderiza
                    renderizarAbaGeral(data);
                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosGerais.success", error);
                } finally {
                    esconderLoading();
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar dados gerais:', error);
                AppToast.show('red', 'Erro ao carregar dados do dashboard', 5000);
                esconderLoading();
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosGerais", error);
        esconderLoading();
    }
}

function carregarDadosMensais() {
    try {
        mostrarLoading();
        const ano = document.getElementById('filtroAnoMensal')?.value || new Date().getFullYear();
        const mes = document.getElementById('filtroMesMensal')?.value || '';

        $.ajax({
            url: '/api/abastecimento/DashboardMensal',
            type: 'GET',
            data: { ano: ano, mes: mes || null },
            success: function (data) {
                try {
                    dadosMensais = data;
                    renderizarAbaMensal(data);
                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosMensais.success", error);
                } finally {
                    esconderLoading();
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar dados mensais:', error);
                AppToast.show('red', 'Erro ao carregar dados mensais', 5000);
                esconderLoading();
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosMensais", error);
        esconderLoading();
    }
}

function carregarDadosVeiculo() {
    try {
        mostrarLoading();
        const ano = document.getElementById('filtroAnoVeiculo')?.value || new Date().getFullYear();
        const mes = document.getElementById('filtroMesVeiculo')?.value || '';
        const modelo = document.getElementById('filtroModeloVeiculo')?.value || '';
        const placaSelect = document.getElementById('filtroPlacaVeiculo');
        const veiculoId = placaSelect?.value || '';

        $.ajax({
            url: '/api/abastecimento/DashboardVeiculo',
            type: 'GET',
            data: {
                ano: ano,
                mes: mes || null,
                veiculoId: veiculoId || null,
                tipoVeiculo: modelo || null
            },
            success: function (data) {
                try {
                    dadosVeiculo = data;
                    preencherFiltrosVeiculo(data);
                    renderizarAbaVeiculo(data);
                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosVeiculo.success", error);
                } finally {
                    esconderLoading();
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar dados por veículo:', error);
                AppToast.show('red', 'Erro ao carregar dados por veículo', 5000);
                esconderLoading();
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosVeiculo", error);
        esconderLoading();
    }
}

// ====== RENDERIZAÇÃO - ABA GERAL ======
function renderizarAbaGeral(data) {
    try {
        document.getElementById('valorTotalGeral').textContent = formatarMoeda(data.totais.valorTotal);
        document.getElementById('litrosTotalGeral').textContent = formatarNumeroK(data.totais.litrosTotal);
        document.getElementById('qtdAbastecimentosGeral').textContent = data.totais.qtdAbastecimentos.toLocaleString('pt-BR');
        
        const mediaDiesel = data.mediaLitro.find(m => m.combustivel.toLowerCase().includes('diesel'));
        const mediaGasolina = data.mediaLitro.find(m => m.combustivel.toLowerCase().includes('gasolina'));
        
        document.getElementById('mediaDieselGeral').textContent = mediaDiesel 
            ? formatarMoeda(mediaDiesel.media) 
            : 'R$ 0';
        document.getElementById('mediaGasolinaGeral').textContent = mediaGasolina 
            ? formatarMoeda(mediaGasolina.media) 
            : 'R$ 0';

        renderizarTabelaResumoPorAno(data.resumoPorAno);
        renderizarChartValorCategoria(data.valorPorCategoria);
        renderizarChartValorLitro(data.valorLitroPorMes);
        renderizarChartLitrosMes(data.litrosPorMes);
        renderizarChartConsumoMes(data.consumoPorMes);
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarAbaGeral", error);
    }
}

function renderizarTabelaResumoPorAno(dados) {
    try {
        const tbody = document.getElementById('tabelaResumoPorAno');
        if (!tbody) return;

        if (!dados || dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted py-4">Sem dados</td></tr>';
            return;
        }

        let html = '';
        let totalValor = 0;

        dados.forEach(item => {
            totalValor += item.valor;
            html += `
                <tr>
                    <td style="font-weight: 600;">${item.ano}</td>
                    <td class="text-end">${formatarMoeda(item.valor)}</td>
                </tr>
            `;
        });

        html += `
            <tr style="background: var(--dash-bg-terracota); font-weight: 700;">
                <td>TOTAL</td>
                <td class="text-end">${formatarMoeda(totalValor)}</td>
            </tr>
        `;

        tbody.innerHTML = html;
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarTabelaResumoPorAno", error);
    }
}

function renderizarChartValorCategoria(dados) {
    try {
        const container = document.getElementById('chartValorCategoria');
        if (!container) return;
        
        if (chartValorCategoria) { chartValorCategoria.destroy(); chartValorCategoria = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const dataSource = dados.map((item, idx) => ({
            x: item.categoria,
            y: item.valor,
            color: CORES.multi[idx % CORES.multi.length]
        }));

        chartValorCategoria = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelStyle: { size: '9px' } },
            primaryYAxis: { 
                labelFormat: 'R$ {value}',
                labelStyle: { size: '9px' },
                labelIntersectAction: 'None',
                edgeLabelPlacement: 'Shift'
            },
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                pointColorMapping: 'color',
                type: 'Bar',
                cornerRadius: { topRight: 4, bottomRight: 4 }
            }],
            tooltip: { enable: true },
            tooltipRender: function(args) {
                args.text = args.point.x + ': ' + formatarLabelMoeda(args.point.y);
            },
            axisLabelRender: function(args) {
                if (args.axis.name === 'primaryYAxis') {
                    const valor = parseFloat(args.text.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
                    args.text = formatarLabelMoeda(valor);
                }
            },
            height: '300px',
            chartArea: { border: { width: 0 } }
        });
        chartValorCategoria.appendTo('#chartValorCategoria');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartValorCategoria", error);
    }
}

function renderizarChartValorLitro(dados) {
    try {
        const container = document.getElementById('chartValorLitro');
        if (!container) return;
        
        if (chartValorLitro) { chartValorLitro.destroy(); chartValorLitro = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const combustiveis = [...new Set(dados.map(d => d.combustivel))];
        const series = combustiveis.map((comb, idx) => {
            const dataPoints = [];
            for (let m = 1; m <= 12; m++) {
                const item = dados.find(d => d.mes === m && d.combustivel === comb);
                dataPoints.push({ x: MESES[m], y: item ? item.media : 0 });
            }
            return {
                dataSource: dataPoints,
                xName: 'x',
                yName: 'y',
                name: comb,
                type: 'Line',
                marker: { visible: true, width: 6, height: 6 },
                width: 2
            };
        });

        chartValorLitro = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelStyle: { size: '9px' } },
            primaryYAxis: { labelFormat: 'R$ {value}', labelStyle: { size: '9px' } },
            series: series,
            legendSettings: { visible: true, position: 'Bottom' },
            tooltip: { enable: true, format: '${series.name}: R$ ${point.y}' },
            height: '300px',
            chartArea: { border: { width: 0 } },
            palettes: [CORES.amber[2], CORES.gold[1]]
        });
        chartValorLitro.appendTo('#chartValorLitro');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartValorLitro", error);
    }
}

function renderizarChartLitrosMes(dados) {
    try {
        const container = document.getElementById('chartLitrosMes');
        if (!container) return;
        
        if (chartLitrosMes) { chartLitrosMes.destroy(); chartLitrosMes = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const combustiveis = [...new Set(dados.map(d => d.combustivel))];
        const series = combustiveis.map((comb, idx) => {
            const dataPoints = [];
            for (let m = 1; m <= 12; m++) {
                const item = dados.find(d => d.mes === m && d.combustivel === comb);
                dataPoints.push({ x: MESES[m], y: item ? item.litros : 0 });
            }
            return {
                dataSource: dataPoints,
                xName: 'x',
                yName: 'y',
                name: comb,
                type: 'StackingColumn',
                cornerRadius: { topLeft: 2, topRight: 2 }
            };
        });

        chartLitrosMes = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelStyle: { size: '9px' } },
            primaryYAxis: { 
                labelFormat: '{value}',
                labelStyle: { size: '9px' }
            },
            series: series,
            legendSettings: { visible: true, position: 'Bottom' },
            tooltip: { enable: true },
            tooltipRender: function(args) {
                args.text = args.series.name + ': ' + formatarLabelNumero(args.point.y) + ' L';
            },
            axisLabelRender: function(args) {
                if (args.axis.name === 'primaryYAxis') {
                    const valor = parseFloat(args.text.replace(/\./g, '').replace(',', '.'));
                    args.text = formatarLabelNumero(valor);
                }
            },
            height: '280px',
            chartArea: { border: { width: 0 } },
            palettes: [CORES.amber[1], CORES.gold[1]]
        });
        chartLitrosMes.appendTo('#chartLitrosMes');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartLitrosMes", error);
    }
}

function renderizarChartConsumoMes(dados) {
    try {
        const container = document.getElementById('chartConsumoMes');
        if (!container) return;
        
        if (chartConsumoMes) { chartConsumoMes.destroy(); chartConsumoMes = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const dataSource = [];
        for (let m = 1; m <= 12; m++) {
            const item = dados.find(d => d.mes === m);
            dataSource.push({
                x: MESES[m],
                y: item ? item.valor : 0,
                color: CORES.amber[m % CORES.amber.length]
            });
        }

        chartConsumoMes = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelStyle: { size: '9px' } },
            primaryYAxis: { 
                labelFormat: 'R$ {value}', 
                labelStyle: { size: '9px' }
            },
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                pointColorMapping: 'color',
                type: 'Column',
                cornerRadius: { topLeft: 4, topRight: 4 }
            }],
            tooltip: { enable: true },
            tooltipRender: function(args) {
                args.text = args.point.x + ': ' + formatarLabelMoeda(args.point.y);
            },
            axisLabelRender: function(args) {
                if (args.axis.name === 'primaryYAxis') {
                    const valor = parseFloat(args.text.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
                    args.text = formatarLabelMoeda(valor);
                }
            },
            height: '280px',
            chartArea: { border: { width: 0 } }
        });
        chartConsumoMes.appendTo('#chartConsumoMes');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartConsumoMes", error);
    }
}

// ====== RENDERIZAÇÃO - ABA MENSAL ======
function renderizarAbaMensal(data) {
    try {
        // Cards de totais
        document.getElementById('valorTotalMensal').textContent = formatarMoeda(data.valorTotal);
        document.getElementById('totalLitrosMensal').textContent = formatarNumeroK(data.litrosTotal);

        // Tabela média do litro
        renderizarTabelaMediaLitroMensal(data.mediaLitro);

        // Gráfico pizza combustíveis (COM LEGENDA)
        renderizarChartPizzaCombustivel(data.porCombustivel);
        
        // Gráfico Litros por Dia (LEGENDA MAIOR)
        renderizarChartLitrosDia(data.litrosPorDia);
        
        // TABELAS TOP 15
        renderizarTabelaValorPorTipo(data.valorPorTipo);
        renderizarTabelaValorPorPlaca(data.valorPorPlaca);
        
        // Gráfico de consumo por CATEGORIA REAL
        renderizarChartConsumoCategoria(data.consumoPorCategoria);
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarAbaMensal", error);
    }
}

function renderizarTabelaMediaLitroMensal(dados) {
    try {
        const tbody = document.getElementById('tabelaMediaLitroMensal');
        if (!tbody) return;

        if (!dados || dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted py-3">Sem dados</td></tr>';
            return;
        }

        let html = '';
        dados.forEach(item => {
            html += `
                <tr>
                    <td style="font-weight: 500;">${item.combustivel}</td>
                    <td class="text-end" style="font-weight: 600; color: var(--dash-marrom-dark);">${formatarMoeda(item.media)}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarTabelaMediaLitroMensal", error);
    }
}

/**
 * Pizza de Combustíveis - COM LEGENDA VISÍVEL
 */
function renderizarChartPizzaCombustivel(dados) {
    try {
        const container = document.getElementById('chartPizzaCombustivel');
        if (!container) return;
        
        if (chartPizzaCombustivel) { chartPizzaCombustivel.destroy(); chartPizzaCombustivel = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-4">Sem dados</div>';
            return;
        }

        const dataSource = dados.map((item, idx) => ({
            x: item.combustivel,
            y: item.litros,
            text: item.combustivel,
            color: CORES.multi[idx % CORES.multi.length]
        }));

        chartPizzaCombustivel = new ej.charts.AccumulationChart({
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                pointColorMapping: 'color',
                type: 'Pie',
                dataLabel: {
                    visible: false // Desabilita labels externos para não poluir
                },
                radius: '75%'
            }],
            tooltip: { enable: true },
            tooltipRender: function(args) {
                args.text = args.point.x + ': ' + formatarLabelNumero(args.point.y) + ' L';
            },
            // LEGENDA VISÍVEL
            legendSettings: { 
                visible: true, 
                position: 'Bottom',
                textStyle: { size: '11px', fontWeight: '500' }
            },
            height: '180px',
            enableSmartLabels: true
        });
        chartPizzaCombustivel.appendTo('#chartPizzaCombustivel');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartPizzaCombustivel", error);
    }
}

/**
 * Litros por Dia - LEGENDA 40% MAIOR
 */
function renderizarChartLitrosDia(dados) {
    try {
        const container = document.getElementById('chartLitrosDia');
        if (!container) return;
        
        if (chartLitrosDia) { chartLitrosDia.destroy(); chartLitrosDia = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const combustiveis = [...new Set(dados.map(d => d.combustivel))];
        const series = combustiveis.map((comb, idx) => {
            const dataPoints = dados
                .filter(d => d.combustivel === comb)
                .map(d => ({ x: d.dia, y: d.litros }));
            return {
                dataSource: dataPoints,
                xName: 'x',
                yName: 'y',
                name: comb,
                type: 'SplineArea',
                opacity: 0.6,
                border: { width: 2 }
            };
        });

        chartLitrosDia = new ej.charts.Chart({
            primaryXAxis: { 
                valueType: 'Double', 
                labelStyle: { size: '10px' }, 
                title: 'Dia do Mês', 
                titleStyle: { size: '11px', fontWeight: '600' },
                interval: 1 
            },
            primaryYAxis: { 
                labelFormat: '{value}',
                labelStyle: { size: '10px' },
                title: 'Litros',
                titleStyle: { size: '11px', fontWeight: '600' }
            },
            series: series,
            // LEGENDA 40% MAIOR
            legendSettings: { 
                visible: true, 
                position: 'Top',
                textStyle: { size: '14px', fontWeight: '600' },
                shapeHeight: 12,
                shapeWidth: 12,
                padding: 10
            },
            tooltip: { enable: true },
            tooltipRender: function(args) {
                args.text = args.series.name + ' (Dia ' + args.point.x + '): ' + formatarLabelNumero(args.point.y) + ' L';
            },
            axisLabelRender: function(args) {
                if (args.axis.name === 'primaryYAxis') {
                    const valor = parseFloat(args.text.replace(/\./g, '').replace(',', '.'));
                    args.text = formatarLabelNumero(valor);
                }
            },
            height: '220px',
            chartArea: { border: { width: 0 } },
            palettes: [CORES.amber[2], CORES.gold[2]]
        });
        chartLitrosDia.appendTo('#chartLitrosDia');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartLitrosDia", error);
    }
}

/**
 * Tabela TOP 15 por TIPO de veículo (modelo)
 */
function renderizarTabelaValorPorTipo(dados) {
    try {
        const container = document.getElementById('tabelaValorPorTipo');
        if (!container) return;

        console.log('valorPorTipo:', dados); // Debug

        if (!dados || dados.length === 0) {
            container.innerHTML = '<tr><td colspan="2" class="text-center text-muted py-4">Sem dados</td></tr>';
            return;
        }

        let html = '';
        let totalValor = 0;

        dados.forEach((item, idx) => {
            totalValor += item.valor;
            const badgeClass = idx < 3 ? 'badge-rank top3' : 'badge-rank';
            html += `
                <tr>
                    <td><span class="${badgeClass}">${idx + 1}</span> ${item.tipoVeiculo}</td>
                    <td class="text-end" style="color: #4a7c59; font-weight: 600;">${formatarMoedaTabela(item.valor)}</td>
                </tr>
            `;
        });

        // Linha de total
        html += `
            <tr class="linha-total">
                <td><strong>Total (Top 15)</strong></td>
                <td class="text-end" style="color: #2d5a3d; font-weight: 700;">${formatarMoedaTabela(totalValor)}</td>
            </tr>
        `;

        container.innerHTML = html;
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarTabelaValorPorTipo", error);
    }
}

/**
 * Tabela TOP 15 por PLACA individual
 */
function renderizarTabelaValorPorPlaca(dados) {
    try {
        const container = document.getElementById('tabelaValorPorPlaca');
        if (!container) return;

        console.log('valorPorPlaca:', dados); // Debug

        if (!dados || dados.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4">Sem dados</td></tr>';
            return;
        }

        let html = '';
        let totalValor = 0;

        dados.forEach((item, idx) => {
            totalValor += item.valor;
            const badgeClass = idx < 3 ? 'badge-rank top3' : 'badge-rank';
            html += `
                <tr>
                    <td><span class="${badgeClass}">${idx + 1}</span> <strong>${item.placa}</strong></td>
                    <td style="font-size: 0.7rem; color: #666;">${item.tipoVeiculo || '-'}</td>
                    <td class="text-end" style="color: #4a7c59; font-weight: 600;">${formatarMoedaTabela(item.valor)}</td>
                </tr>
            `;
        });

        // Linha de total
        html += `
            <tr class="linha-total">
                <td colspan="2"><strong>Total (Top 15)</strong></td>
                <td class="text-end" style="color: #2d5a3d; font-weight: 700;">${formatarMoedaTabela(totalValor)}</td>
            </tr>
        `;

        container.innerHTML = html;
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarTabelaValorPorPlaca", error);
    }
}

/**
 * Gráfico de Consumo por CATEGORIA REAL do veículo
 * (Ambulância, Carga Leve, Carga Pesada, Coletivos Pequenos, Depol, Mesa, Ônibus/Microônibus, Passeio)
 */
function renderizarChartConsumoCategoria(dados) {
    try {
        const container = document.getElementById('chartConsumoCategoria');
        if (!container) return;
        
        if (chartConsumoCategoria) { chartConsumoCategoria.destroy(); chartConsumoCategoria = null; }
        container.innerHTML = '';

        console.log('consumoPorCategoria:', dados); // Debug

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados de categoria</div>';
            return;
        }

        const dataSource = dados.map((item, idx) => ({
            x: item.categoria || 'Sem Categoria',
            y: item.valor || 0,
            color: CORES.categorias[idx % CORES.categorias.length]
        }));

        chartConsumoCategoria = new ej.charts.Chart({
            primaryXAxis: { 
                valueType: 'Category', 
                labelRotation: -30, 
                labelStyle: { size: '11px', fontWeight: '500' } 
            },
            primaryYAxis: { 
                labelFormat: 'R$ {value}', 
                labelStyle: { size: '10px' }
            },
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                pointColorMapping: 'color',
                type: 'Column',
                cornerRadius: { topLeft: 4, topRight: 4 },
                dataLabel: {
                    visible: true,
                    position: 'Top',
                    font: { size: '10px', fontWeight: '600' }
                }
            }],
            tooltip: { enable: true },
            tooltipRender: function(args) {
                args.text = args.point.x + ': ' + formatarLabelMoeda(args.point.y);
            },
            textRender: function(args) {
                args.text = formatarMoedaCompacta(args.point.y);
            },
            axisLabelRender: function(args) {
                if (args.axis.name === 'primaryYAxis') {
                    const valor = parseFloat(args.text.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
                    args.text = formatarLabelMoeda(valor);
                }
            },
            height: '280px',
            chartArea: { border: { width: 0 } }
        });
        chartConsumoCategoria.appendTo('#chartConsumoCategoria');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartConsumoCategoria", error);
    }
}

// ====== RENDERIZAÇÃO - ABA VEÍCULO ======
function renderizarAbaVeiculo(data) {
    try {
        document.getElementById('valorTotalVeiculo').textContent = formatarMoeda(data.valorTotal);
        document.getElementById('litrosTotalVeiculo').textContent = formatarNumeroK(data.litrosTotal);

        document.getElementById('descricaoVeiculoSelecionado').textContent = data.descricaoVeiculo;
        document.getElementById('categoriaVeiculoSelecionado').textContent = data.categoriaVeiculo;

        renderizarChartConsumoMensalVeiculo(data.consumoMensalLitros);
        renderizarChartValorMensalVeiculo(data.valorMensal);
        renderizarChartRankingVeiculos(data.veiculosComValor);
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarAbaVeiculo", error);
    }
}

function renderizarChartConsumoMensalVeiculo(dados) {
    try {
        const container = document.getElementById('chartConsumoMensalVeiculo');
        if (!container) return;
        
        if (chartConsumoMensalVeiculo) { chartConsumoMensalVeiculo.destroy(); chartConsumoMensalVeiculo = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const combustiveis = [...new Set(dados.map(d => d.combustivel))];
        const series = combustiveis.map((comb, idx) => {
            const dataPoints = [];
            for (let m = 1; m <= 12; m++) {
                const item = dados.find(d => d.mes === m && d.combustivel === comb);
                dataPoints.push({ x: MESES[m], y: item ? item.litros : 0 });
            }
            return {
                dataSource: dataPoints,
                xName: 'x',
                yName: 'y',
                name: comb,
                type: 'SplineArea',
                opacity: 0.6,
                border: { width: 2 }
            };
        });

        chartConsumoMensalVeiculo = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelStyle: { size: '9px' } },
            primaryYAxis: { 
                labelFormat: '{value}',
                labelStyle: { size: '9px' }
            },
            series: series,
            legendSettings: { visible: true, position: 'Bottom' },
            tooltip: { enable: true },
            tooltipRender: function(args) {
                args.text = args.series.name + ': ' + formatarLabelNumero(args.point.y) + 'L';
            },
            axisLabelRender: function(args) {
                if (args.axis.name === 'primaryYAxis') {
                    const valor = parseFloat(args.text.replace(/\./g, '').replace(',', '.'));
                    args.text = formatarLabelNumero(valor);
                }
            },
            height: '160px',
            chartArea: { border: { width: 0 } },
            palettes: [CORES.amber[1], CORES.gold[1]]
        });
        chartConsumoMensalVeiculo.appendTo('#chartConsumoMensalVeiculo');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartConsumoMensalVeiculo", error);
    }
}

function renderizarChartValorMensalVeiculo(dados) {
    try {
        const container = document.getElementById('chartValorMensalVeiculo');
        if (!container) return;
        
        if (chartValorMensalVeiculo) { chartValorMensalVeiculo.destroy(); chartValorMensalVeiculo = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const dataSource = [];
        for (let m = 1; m <= 12; m++) {
            const item = dados.find(d => d.mes === m);
            dataSource.push({
                x: MESES_COMPLETOS[m],
                y: item ? item.valor : 0,
                color: CORES.amber[m % CORES.amber.length]
            });
        }

        chartValorMensalVeiculo = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelRotation: -45, labelStyle: { size: '9px' } },
            primaryYAxis: { 
                labelFormat: 'R$ {value}', 
                labelStyle: { size: '9px' }
            },
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                pointColorMapping: 'color',
                type: 'Bar',
                cornerRadius: { topRight: 4, bottomRight: 4 }
            }],
            tooltip: { enable: true },
            tooltipRender: function(args) {
                args.text = args.point.x + ': ' + formatarLabelMoeda(args.point.y);
            },
            axisLabelRender: function(args) {
                if (args.axis.name === 'primaryYAxis') {
                    const valor = parseFloat(args.text.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
                    args.text = formatarLabelMoeda(valor);
                }
            },
            height: '280px',
            chartArea: { border: { width: 0 } }
        });
        chartValorMensalVeiculo.appendTo('#chartValorMensalVeiculo');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartValorMensalVeiculo", error);
    }
}

function renderizarChartRankingVeiculos(dados) {
    try {
        const container = document.getElementById('chartRankingVeiculos');
        if (!container) return;
        
        if (chartRankingVeiculos) { chartRankingVeiculos.destroy(); chartRankingVeiculos = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const top10 = dados.slice(0, 10);
        const dataSource = top10.map((item, idx) => ({
            x: item.placa + (item.tipoVeiculo ? '\n' + item.tipoVeiculo : ''),
            y: item.valor,
            color: CORES.multi[idx % CORES.multi.length],
            veiculoId: item.veiculoId
        }));

        chartRankingVeiculos = new ej.charts.Chart({
            primaryXAxis: { 
                valueType: 'Category', 
                labelStyle: { size: '8px' }
            },
            primaryYAxis: { 
                labelFormat: 'R$ {value}', 
                labelStyle: { size: '9px' }
            },
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                pointColorMapping: 'color',
                type: 'Bar',
                cornerRadius: { topRight: 4, bottomRight: 4 }
            }],
            tooltip: { enable: true },
            tooltipRender: function(args) {
                const label = args.point.x.replace('\n', ' - ');
                args.text = label + ': ' + formatarLabelMoeda(args.point.y);
            },
            axisLabelRender: function(args) {
                if (args.axis.name === 'primaryYAxis') {
                    const valor = parseFloat(args.text.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
                    args.text = formatarLabelMoeda(valor);
                }
            },
            pointClick: function(args) {
                const veiculoId = args.point.veiculoId;
                if (veiculoId) {
                    selecionarVeiculo(veiculoId);
                }
            },
            height: '280px',
            chartArea: { border: { width: 0 } }
        });
        chartRankingVeiculos.appendTo('#chartRankingVeiculos');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartRankingVeiculos", error);
    }
}

// ====== FUNÇÕES DE DESTRUIÇÃO DE GRÁFICOS ======

function destruirGraficosGeral() {
    try {
        if (chartValorCategoria) { chartValorCategoria.destroy(); chartValorCategoria = null; }
        if (chartValorLitro) { chartValorLitro.destroy(); chartValorLitro = null; }
        if (chartLitrosMes) { chartLitrosMes.destroy(); chartLitrosMes = null; }
        if (chartConsumoMes) { chartConsumoMes.destroy(); chartConsumoMes = null; }
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "destruirGraficosGeral", error);
    }
}

function destruirGraficosMensal() {
    try {
        if (chartPizzaCombustivel) { chartPizzaCombustivel.destroy(); chartPizzaCombustivel = null; }
        if (chartLitrosDia) { chartLitrosDia.destroy(); chartLitrosDia = null; }
        if (chartConsumoCategoria) { chartConsumoCategoria.destroy(); chartConsumoCategoria = null; }
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "destruirGraficosMensal", error);
    }
}

function destruirGraficosVeiculo() {
    try {
        if (chartConsumoMensalVeiculo) { chartConsumoMensalVeiculo.destroy(); chartConsumoMensalVeiculo = null; }
        if (chartValorMensalVeiculo) { chartValorMensalVeiculo.destroy(); chartValorMensalVeiculo = null; }
        if (chartRankingVeiculos) { chartRankingVeiculos.destroy(); chartRankingVeiculos = null; }
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "destruirGraficosVeiculo", error);
    }
}

// ====== FUNÇÕES AUXILIARES ======

function preencherFiltroAnos(anos, consumoPorMes) {
    try {
        const selectGeral = document.getElementById('filtroAnoGeral');
        const selectMensal = document.getElementById('filtroAnoMensal');
        const selectVeiculo = document.getElementById('filtroAnoVeiculo');
        const selectMesGeral = document.getElementById('filtroMesGeral');

        const anoAtual = new Date().getFullYear();
        const mesAtual = new Date().getMonth() + 1; // 1-12

        // Ano mais recente disponível nos dados (primeiro da lista, pois vem ordenado desc)
        const anoMaisRecente = anos && anos.length > 0 ? anos[0] : anoAtual;

        [selectGeral, selectMensal, selectVeiculo].forEach(select => {
            if (!select) return;

            const valorAtual = select.value;
            const isGeral = select.id === 'filtroAnoGeral';
            const jáInicializado = select.dataset.initialized === 'true';

            select.innerHTML = isGeral ? '<option value="">Todos os Anos</option>' : '';

            anos.forEach(ano => {
                const option = document.createElement('option');
                option.value = ano;
                option.textContent = ano;
                select.appendChild(option);
            });

            // Na primeira carga, seleciona o ano mais recente disponível
            if (!jáInicializado && !valorAtual) {
                select.value = anoMaisRecente.toString();
                select.dataset.initialized = 'true';
            } else if (valorAtual) {
                // Mantém o valor selecionado se já havia um
                select.value = valorAtual;
            }
        });

        // Posicionar o mês: mês atual se tiver dados, senão último mês com dados
        if (selectMesGeral && selectMesGeral.dataset.initialized !== 'true') {
            let mesSelecionado = '';

            if (consumoPorMes && consumoPorMes.length > 0) {
                // Verificar se o mês atual tem dados
                const temDadosMesAtual = consumoPorMes.some(item => item.mes === mesAtual && item.valor > 0);

                if (temDadosMesAtual) {
                    mesSelecionado = mesAtual.toString();
                } else {
                    // Encontrar o último mês com dados (maior número de mês com valor > 0)
                    const mesesComDados = consumoPorMes
                        .filter(item => item.valor > 0)
                        .map(item => item.mes)
                        .sort((a, b) => b - a); // Ordenar decrescente

                    if (mesesComDados.length > 0) {
                        mesSelecionado = mesesComDados[0].toString();
                    }
                }
            }

            selectMesGeral.value = mesSelecionado;
            selectMesGeral.dataset.initialized = 'true';
        }
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "preencherFiltroAnos", error);
    }
}

function preencherFiltrosVeiculo(data) {
    try {
        const selectModelo = document.getElementById('filtroModeloVeiculo');
        const selectPlaca = document.getElementById('filtroPlacaVeiculo');
        
        const modeloAtual = selectModelo.value;
        selectModelo.innerHTML = '<option value="">Todos</option>';
        data.modelosDisponiveis.forEach(modelo => {
            const option = document.createElement('option');
            option.value = modelo;
            option.textContent = modelo;
            selectModelo.appendChild(option);
        });
        if (modeloAtual) selectModelo.value = modeloAtual;

        const placaAtual = selectPlaca.value;
        selectPlaca.innerHTML = '<option value="">Todas</option>';
        
        let placasFiltradas = data.placasDisponiveis;
        if (modeloAtual) {
            placasFiltradas = data.veiculosComValor
                .filter(v => v.tipoVeiculo === modeloAtual)
                .map(v => ({ veiculoId: v.veiculoId, placa: v.placa }));
        }
        
        placasFiltradas.forEach(item => {
            const option = document.createElement('option');
            option.value = item.veiculoId;
            option.textContent = item.placa;
            selectPlaca.appendChild(option);
        });
        if (placaAtual) selectPlaca.value = placaAtual;

    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "preencherFiltrosVeiculo", error);
    }
}

function selecionarVeiculo(veiculoId) {
    try {
        document.getElementById('filtroModeloVeiculo').value = '';
        document.getElementById('filtroPlacaVeiculo').value = veiculoId;
        carregarDadosVeiculo();
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "selecionarVeiculo", error);
    }
}

// ====== FUNÇÕES DE FORMATAÇÃO ======

function formatarMoeda(valor) {
    if (!valor) return 'R$ 0';
    if (Math.abs(valor) >= 100) {
        return 'R$ ' + Math.round(valor).toLocaleString('pt-BR');
    }
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarMoedaTabela(valor) {
    if (!valor) return 'R$ 0,00';
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarMoedaCompacta(valor) {
    if (!valor) return 'R$ 0';
    if (valor >= 1000000) {
        return 'R$ ' + (valor / 1000000).toFixed(1) + 'M';
    }
    if (valor >= 1000) {
        return 'R$ ' + (valor / 1000).toFixed(0) + 'K';
    }
    return 'R$ ' + Math.round(valor).toLocaleString('pt-BR');
}

function formatarNumero(valor) {
    if (!valor) return '0';
    if (Math.abs(valor) >= 100) {
        return Math.round(valor).toLocaleString('pt-BR');
    }
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarNumeroK(valor) {
    if (!valor) return '0';
    if (valor >= 1000000) {
        const num = (valor / 1000000);
        return num >= 100 ? num.toFixed(0) + 'M' : num.toFixed(2) + 'M';
    }
    if (valor >= 1000) {
        const num = (valor / 1000);
        return num >= 100 ? num.toFixed(0) + 'K' : num.toFixed(2) + 'K';
    }
    return Math.round(valor).toLocaleString('pt-BR');
}

function formatarLabelMoeda(valor) {
    if (!valor) return 'R$ 0';
    if (Math.abs(valor) >= 100) {
        return 'R$ ' + Math.round(valor).toLocaleString('pt-BR');
    }
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarLabelNumero(valor) {
    if (!valor) return '0';
    if (Math.abs(valor) >= 100) {
        return Math.round(valor).toLocaleString('pt-BR');
    }
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
