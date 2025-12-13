/**
 * Dashboard de Abastecimentos - JavaScript
 * FrotiX - Câmara dos Deputados
 * 
 * Utiliza Syncfusion EJ2 Charts para visualização de dados
 */

// ====== VARIÁVEIS GLOBAIS ======
let dadosGerais = null;
let dadosMensais = null;
let dadosVeiculo = null;

// Instâncias dos gráficos
let chartValorCategoria = null;
let chartValorLitro = null;
let chartLitrosMes = null;
let chartConsumoMes = null;
let chartPizzaCombustivel = null;
let chartLitrosDia = null;
let chartValorVeiculo = null;
let chartConsumoCategoria = null;
let chartConsumoMensalVeiculo = null;
let chartValorMensalVeiculo = null;

// Nomes dos meses
const MESES = ['', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_COMPLETOS = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// Paleta de cores verde
const CORES = {
    verde: ['#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac'],
    laranja: ['#ea580c', '#f97316', '#fb923c', '#fdba74'],
    azul: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc'],
    multi: ['#166534', '#0284c7', '#ea580c', '#eab308', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e']
};

// ====== INICIALIZAÇÃO ======
document.addEventListener('DOMContentLoaded', function () {
    try {
        inicializarTabs();
        carregarDadosGerais();
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "DOMContentLoaded", error);
    }
});

// ====== NAVEGAÇÃO DE ABAS ======
function inicializarTabs() {
    try {
        const tabs = document.querySelectorAll('.dash-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const tabId = this.getAttribute('data-tab');
                const tabAtual = document.querySelector('.dash-tab.active')?.getAttribute('data-tab');

                // Se clicou na mesma aba, não faz nada
                if (tabId === tabAtual) return;

                // Destroi gráficos da aba anterior
                if (tabAtual === 'consumo-geral') destruirGraficosGeral();
                if (tabAtual === 'consumo-mensal') destruirGraficosMensal();
                if (tabAtual === 'consumo-veiculo') destruirGraficosVeiculo();

                // Remove active de todas as abas
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Esconde todos os conteúdos
                document.querySelectorAll('.dash-content').forEach(c => c.classList.remove('active'));

                // Mostra o conteúdo selecionado
                const tabContent = document.getElementById('tab-' + tabId);
                if (tabContent) tabContent.classList.add('active');

                // Carrega dados da aba
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

        // Botão Atualizar
        document.getElementById('btnAtualizar').addEventListener('click', function () {
            location.reload();
        });

        // Filtros
        document.getElementById('filtroAnoGeral')?.addEventListener('change', function () {
            carregarDadosGerais();
        });

        document.getElementById('btnFiltrarMensal')?.addEventListener('click', function () {
            carregarDadosMensais();
        });

        document.getElementById('btnFiltrarVeiculo')?.addEventListener('click', function () {
            carregarDadosVeiculo();
        });

        // Filtros da aba veículo
        document.getElementById('filtroModeloVeiculo')?.addEventListener('change', function () {
            // Limpa filtro de placa quando muda modelo
            document.getElementById('filtroPlacaVeiculo').value = '';
        });

    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "inicializarTabs", error);
    }
}

// ====== CARREGAMENTO DE DADOS ======

// Aba 1: Consumo Geral
function carregarDadosGerais() {
    try {
        const ano = document.getElementById('filtroAnoGeral')?.value || '';

        $.ajax({
            url: '/api/abastecimento/DashboardDados',
            type: 'GET',
            data: { ano: ano || null },
            success: function (data) {
                try {
                    dadosGerais = data;
                    preencherFiltroAnos(data.anosDisponiveis);
                    renderizarAbaGeral(data);
                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosGerais.success", error);
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar dados gerais:', error);
                AppToast.show('red', 'Erro ao carregar dados do dashboard', 5000);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosGerais", error);
    }
}

// Aba 2: Consumo Mensal
function carregarDadosMensais() {
    try {
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
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar dados mensais:', error);
                AppToast.show('red', 'Erro ao carregar dados mensais', 5000);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosMensais", error);
    }
}

// Aba 3: Consumo por Veículo
function carregarDadosVeiculo() {
    try {
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
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar dados por veículo:', error);
                AppToast.show('red', 'Erro ao carregar dados por veículo', 5000);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosVeiculo", error);
    }
}

// ====== RENDERIZAÇÃO - ABA GERAL ======
function renderizarAbaGeral(data) {
    try {
        // Tabela Valor por Ano
        let htmlValor = '';
        let totalValor = 0;
        data.resumoPorAno.forEach(item => {
            totalValor += item.valor;
            htmlValor += `<tr><td>${item.ano}</td><td class="text-end">${formatarMoeda(item.valor)}</td></tr>`;
        });
        htmlValor += `<tr class="total"><td>Total</td><td class="text-end">${formatarMoeda(totalValor)}</td></tr>`;
        document.querySelector('#tabelaValorPorAno tbody').innerHTML = htmlValor;

        // Tabela Litros por Ano
        let htmlLitros = '';
        let totalLitros = 0;
        data.resumoPorAno.forEach(item => {
            totalLitros += item.litros;
            htmlLitros += `<tr><td>${item.ano}</td><td class="text-end">${formatarNumero(item.litros)}</td></tr>`;
        });
        htmlLitros += `<tr class="total"><td>Total</td><td class="text-end">${formatarNumero(totalLitros)}</td></tr>`;
        document.querySelector('#tabelaLitrosPorAno tbody').innerHTML = htmlLitros;

        // Média do Litro
        let htmlMedia = '';
        data.mediaLitro.forEach(item => {
            htmlMedia += `
                <div class="media-litro-item">
                    <span class="tipo">${item.combustivel}</span>
                    <span class="valor">${item.media.toFixed(2)}</span>
                </div>`;
        });
        document.getElementById('mediaLitroGeral').innerHTML = htmlMedia;

        // Gráficos
        renderizarChartValorCategoria(data.valorPorCategoria);
        renderizarChartValorLitro(data.valorLitroPorMes);
        renderizarChartLitrosMes(data.litrosPorMes);
        renderizarChartConsumoMes(data.consumoPorMes);

    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarAbaGeral", error);
    }
}

// ====== RENDERIZAÇÃO - ABA MENSAL ======
function renderizarAbaMensal(data) {
    try {
        // Cards de totais
        document.getElementById('valorTotalMensal').textContent = formatarMoeda(data.valorTotal);
        document.getElementById('totalLitrosMensal').textContent = formatarNumeroK(data.litrosTotal);

        // Breakdown por combustível
        let htmlBreak = '';
        data.porCombustivel.forEach(item => {
            htmlBreak += `
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span style="font-weight: 500;">${item.combustivel}</span>
                    <span style="font-weight: 700; color: #166534;">${formatarMoeda(item.valor)}</span>
                </div>`;
        });
        document.getElementById('breakdownCombustivelMensal').innerHTML = htmlBreak || '<div class="text-center text-muted py-3">Sem dados</div>';

        // Média do litro
        let htmlMedia = '';
        data.mediaLitro.forEach(item => {
            htmlMedia += `
                <div class="media-litro-item">
                    <span class="tipo">${item.combustivel}</span>
                    <span class="valor">${item.media.toFixed(2)}</span>
                </div>`;
        });
        document.getElementById('mediaLitroMensal').innerHTML = htmlMedia || '<div class="text-center text-muted">-</div>';

        // Gráficos
        renderizarChartPizzaCombustivel(data.porCombustivel);
        renderizarChartLitrosDia(data.litrosPorDia);
        renderizarChartValorVeiculo(data.valorPorVeiculo);
        renderizarChartConsumoCategoria(data.consumoPorCategoria);

    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarAbaMensal", error);
    }
}

// ====== RENDERIZAÇÃO - ABA VEÍCULO ======
function renderizarAbaVeiculo(data) {
    try {
        // Cards de totais
        document.getElementById('valorTotalVeiculo').textContent = formatarMoeda(data.valorTotal);
        document.getElementById('litrosTotalVeiculo').textContent = formatarNumero(data.litrosTotal);

        // Info do veículo
        document.getElementById('descricaoVeiculoSelecionado').textContent = data.descricaoVeiculo;
        document.getElementById('categoriaVeiculoSelecionado').textContent = data.categoriaVeiculo;

        // Tabela de veículos
        let htmlTabela = '';
        data.veiculosComValor.forEach(item => {
            const nome = item.tipoVeiculo || item.placa || '-';
            htmlTabela += `
                <tr style="cursor: pointer;" onclick="selecionarVeiculo('${item.veiculoId}')">
                    <td>${nome}</td>
                    <td class="text-end fw-bold">${formatarMoeda(item.valor)}</td>
                </tr>`;
        });
        document.querySelector('#tabelaValorVeiculos tbody').innerHTML = htmlTabela || '<tr><td colspan="2" class="text-center py-3">Sem dados</td></tr>';

        // Gráficos
        renderizarChartConsumoMensalVeiculo(data.consumoMensalLitros);
        renderizarChartValorMensalVeiculo(data.valorMensal);

    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarAbaVeiculo", error);
    }
}

// ====== GRÁFICOS - ABA GERAL ======

function destruirGraficosGeral() {
    try {
        if (chartValorCategoria) { chartValorCategoria.destroy(); chartValorCategoria = null; }
        if (chartValorLitro) { chartValorLitro.destroy(); chartValorLitro = null; }
        if (chartLitrosMes) { chartLitrosMes.destroy(); chartLitrosMes = null; }
        if (chartConsumoMes) { chartConsumoMes.destroy(); chartConsumoMes = null; }
    } catch (e) { console.warn('Erro ao destruir gráficos geral:', e); }
}

function destruirGraficosMensal() {
    try {
        if (chartPizzaCombustivel) { chartPizzaCombustivel.destroy(); chartPizzaCombustivel = null; }
        if (chartLitrosDia) { chartLitrosDia.destroy(); chartLitrosDia = null; }
        if (chartValorVeiculo) { chartValorVeiculo.destroy(); chartValorVeiculo = null; }
        if (chartConsumoCategoria) { chartConsumoCategoria.destroy(); chartConsumoCategoria = null; }
    } catch (e) { console.warn('Erro ao destruir gráficos mensal:', e); }
}

function destruirGraficosVeiculo() {
    try {
        if (chartConsumoMensalVeiculo) { chartConsumoMensalVeiculo.destroy(); chartConsumoMensalVeiculo = null; }
        if (chartValorMensalVeiculo) { chartValorMensalVeiculo.destroy(); chartValorMensalVeiculo = null; }
    } catch (e) { console.warn('Erro ao destruir gráficos veiculo:', e); }
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
            x: item.categoria || 'N/A',
            y: item.valor || 0,
            color: CORES.multi[idx % CORES.multi.length]
        }));

        chartValorCategoria = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelRotation: -45, labelStyle: { size: '10px' } },
            primaryYAxis: { labelFormat: 'R$ {value}', labelStyle: { size: '10px' } },
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                pointColorMapping: 'color',
                type: 'Bar',
                cornerRadius: { topRight: 4, bottomRight: 4 }
            }],
            tooltip: { enable: true, format: '${point.x}: R$ ${point.y}' },
            height: '320px',
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

        // Agrupar por combustível
        const combustiveis = [...new Set(dados.map(d => d.combustivel))];
        const series = combustiveis.map((comb, idx) => {
            const dataPoints = [];
            for (let m = 1; m <= 12; m++) {
                const item = dados.find(d => d.mes === m && d.combustivel === comb);
                dataPoints.push({ x: MESES[m], y: item ? item.media : null });
            }
            return {
                dataSource: dataPoints,
                xName: 'x',
                yName: 'y',
                name: comb,
                type: 'Line',
                width: 3,
                marker: { visible: true, width: 8, height: 8 }
            };
        });

        chartValorLitro = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelStyle: { size: '10px' } },
            primaryYAxis: { labelFormat: '{value}', minimum: 4, labelStyle: { size: '10px' } },
            series: series,
            legendSettings: { visible: true, position: 'Top' },
            tooltip: { enable: true },
            height: '320px',
            chartArea: { border: { width: 0 } },
            palettes: CORES.verde
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

        // Agrupar por combustível
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

        chartLitrosMes = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelStyle: { size: '10px' } },
            primaryYAxis: { labelFormat: '{value}', labelStyle: { size: '10px' } },
            series: series,
            legendSettings: { visible: true, position: 'Top' },
            tooltip: { enable: true },
            height: '320px',
            chartArea: { border: { width: 0 } },
            palettes: ['#166534', '#ea580c']
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
                y: item ? item.valor : 0
            });
        }

        chartConsumoMes = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelStyle: { size: '10px' } },
            primaryYAxis: { labelFormat: 'R$ {value}', labelStyle: { size: '10px' } },
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                type: 'Column',
                fill: '#16a34a',
                cornerRadius: { topLeft: 4, topRight: 4 }
            }],
            tooltip: { enable: true, format: '${point.x}: R$ ${point.y}' },
            height: '320px',
            chartArea: { border: { width: 0 } }
        });
        chartConsumoMes.appendTo('#chartConsumoMes');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartConsumoMes", error);
    }
}

// ====== GRÁFICOS - ABA MENSAL ======

function renderizarChartPizzaCombustivel(dados) {
    try {
        const container = document.getElementById('chartPizzaCombustivel');
        if (!container) return;
        
        if (chartPizzaCombustivel) { chartPizzaCombustivel.destroy(); chartPizzaCombustivel = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const dataSource = dados.map((item, idx) => ({
            x: item.combustivel || 'N/A',
            y: item.litros || 0,
            text: formatarNumeroK(item.litros || 0)
        }));

        chartPizzaCombustivel = new ej.charts.AccumulationChart({
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                innerRadius: '50%',
                dataLabel: {
                    visible: true,
                    name: 'text',
                    position: 'Outside',
                    font: { fontWeight: '600', size: '11px' }
                }
            }],
            legendSettings: { visible: true, position: 'Bottom' },
            tooltip: { enable: true, format: '${point.x}: ${point.y} litros' },
            height: '240px',
            palettes: ['#0284c7', '#ea580c', '#16a34a', '#eab308']
        });
        chartPizzaCombustivel.appendTo('#chartPizzaCombustivel');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartPizzaCombustivel", error);
    }
}

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

        // Agrupar por combustível
        const combustiveis = [...new Set(dados.map(d => d.combustivel))];
        const series = combustiveis.map((comb, idx) => {
            const dataPoints = [];
            for (let d = 1; d <= 31; d++) {
                const item = dados.find(x => x.dia === d && x.combustivel === comb);
                if (item) {
                    dataPoints.push({ x: d, y: item.litros });
                }
            }
            return {
                dataSource: dataPoints,
                xName: 'x',
                yName: 'y',
                name: comb,
                type: 'StackingArea',
                opacity: 0.7
            };
        });

        chartLitrosDia = new ej.charts.Chart({
            primaryXAxis: { title: 'Data', labelStyle: { size: '10px' } },
            primaryYAxis: { labelStyle: { size: '10px' } },
            series: series,
            legendSettings: { visible: true, position: 'Top' },
            tooltip: { enable: true },
            height: '320px',
            chartArea: { border: { width: 0 } },
            palettes: ['#0284c7', '#ea580c', '#16a34a']
        });
        chartLitrosDia.appendTo('#chartLitrosDia');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartLitrosDia", error);
    }
}

function renderizarChartValorVeiculo(dados) {
    try {
        const container = document.getElementById('chartValorVeiculo');
        if (!container) return;
        
        if (chartValorVeiculo) { chartValorVeiculo.destroy(); chartValorVeiculo = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const dataSource = dados.map(item => ({
            x: item.veiculo || 'N/A',
            y: item.valor || 0
        }));

        chartValorVeiculo = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelRotation: -90, labelStyle: { size: '8px' } },
            primaryYAxis: { labelFormat: 'R$ {value}', labelStyle: { size: '10px' } },
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                type: 'Spline',
                fill: '#16a34a',
                width: 2,
                marker: { visible: false }
            }],
            tooltip: { enable: true, format: '${point.x}: R$ ${point.y}' },
            height: '320px',
            chartArea: { border: { width: 0 } }
        });
        chartValorVeiculo.appendTo('#chartValorVeiculo');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartValorVeiculo", error);
    }
}

function renderizarChartConsumoCategoria(dados) {
    try {
        const container = document.getElementById('chartConsumoCategoria');
        if (!container) return;
        
        if (chartConsumoCategoria) { chartConsumoCategoria.destroy(); chartConsumoCategoria = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        const dataSource = dados.map((item, idx) => ({
            x: item.categoria || 'N/A',
            y: item.valor || 0,
            color: CORES.multi[idx % CORES.multi.length]
        }));

        chartConsumoCategoria = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelRotation: -45, labelStyle: { size: '9px' } },
            primaryYAxis: { labelFormat: 'R$ {value}', labelStyle: { size: '10px' } },
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                pointColorMapping: 'color',
                type: 'Column',
                cornerRadius: { topLeft: 4, topRight: 4 }
            }],
            tooltip: { enable: true, format: '${point.x}: R$ ${point.y}' },
            height: '320px',
            chartArea: { border: { width: 0 } }
        });
        chartConsumoCategoria.appendTo('#chartConsumoCategoria');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartConsumoCategoria", error);
    }
}

// ====== GRÁFICOS - ABA VEÍCULO ======

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

        // Agrupar por combustível
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
            primaryYAxis: { labelStyle: { size: '9px' } },
            series: series,
            legendSettings: { visible: true, position: 'Bottom' },
            tooltip: { enable: true },
            height: '220px',
            chartArea: { border: { width: 0 } },
            palettes: ['#166534', '#ea580c']
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
                y: item ? item.valor : 0
            });
        }

        chartValorMensalVeiculo = new ej.charts.Chart({
            primaryXAxis: { valueType: 'Category', labelRotation: -45, labelStyle: { size: '10px' } },
            primaryYAxis: { labelFormat: 'R$ {value}', labelStyle: { size: '10px' } },
            series: [{
                dataSource: dataSource,
                xName: 'x',
                yName: 'y',
                type: 'Bar',
                fill: '#16a34a',
                cornerRadius: { topRight: 4, bottomRight: 4 }
            }],
            tooltip: { enable: true, format: '${point.x}: R$ ${point.y}' },
            height: '340px',
            chartArea: { border: { width: 0 } }
        });
        chartValorMensalVeiculo.appendTo('#chartValorMensalVeiculo');
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarChartValorMensalVeiculo", error);
    }
}

// ====== FUNÇÕES AUXILIARES ======

function preencherFiltroAnos(anos) {
    try {
        const selectGeral = document.getElementById('filtroAnoGeral');
        const selectMensal = document.getElementById('filtroAnoMensal');
        const selectVeiculo = document.getElementById('filtroAnoVeiculo');

        const anoAtual = new Date().getFullYear();

        // Preenche filtros
        [selectGeral, selectMensal, selectVeiculo].forEach(select => {
            if (!select) return;

            const valorAtual = select.value;
            const isGeral = select.id === 'filtroAnoGeral';

            select.innerHTML = isGeral ? '<option value="">Todos os Anos</option>' : '';

            anos.forEach(ano => {
                const option = document.createElement('option');
                option.value = ano;
                option.textContent = ano;
                if (!isGeral && ano === anoAtual) option.selected = true;
                select.appendChild(option);
            });

            if (valorAtual) select.value = valorAtual;
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "preencherFiltroAnos", error);
    }
}

function preencherFiltrosVeiculo(data) {
    try {
        // Modelos
        const selectModelo = document.getElementById('filtroModeloVeiculo');
        const modeloAtual = selectModelo.value;
        selectModelo.innerHTML = '<option value="">Todos</option>';
        data.modelosDisponiveis.forEach(modelo => {
            const option = document.createElement('option');
            option.value = modelo;
            option.textContent = modelo;
            selectModelo.appendChild(option);
        });
        if (modeloAtual) selectModelo.value = modeloAtual;

        // Placas
        const selectPlaca = document.getElementById('filtroPlacaVeiculo');
        const placaAtual = selectPlaca.value;
        selectPlaca.innerHTML = '<option value="">Todas</option>';
        data.placasDisponiveis.forEach(item => {
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
        document.getElementById('filtroPlacaVeiculo').value = veiculoId;
        carregarDadosVeiculo();
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "selecionarVeiculo", error);
    }
}

function formatarMoeda(valor) {
    return 'R$ ' + (valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarNumero(valor) {
    return (valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarNumeroK(valor) {
    if (!valor) return '0';
    if (valor >= 1000000) return (valor / 1000000).toFixed(2) + 'M';
    if (valor >= 1000) return (valor / 1000).toFixed(2) + 'K';
    return valor.toFixed(2);
}
