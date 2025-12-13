// ============================================================================
// administracao.js - Dashboard de Administração FrotiX
// ============================================================================

// Variáveis globais para os gráficos
let chartNormalizacaoPizza = null;
let chartNormalizacaoTipo = null;
let chartTipoUso = null;
let chartTop10Veiculos = null;
let chartTop10Motoristas = null;
let chartCustoPorFinalidade = null;
let chartPropriosTerceirizados = null;
let chartEficiencia = null;
let chartEvolucaoMensal = null;

// Paleta de cores
const cores = [
    'rgba(54, 162, 235, 0.8)',   // Azul
    'rgba(75, 192, 192, 0.8)',   // Verde água
    'rgba(255, 206, 86, 0.8)',   // Amarelo
    'rgba(255, 99, 132, 0.8)',   // Vermelho
    'rgba(153, 102, 255, 0.8)',  // Roxo
    'rgba(255, 159, 64, 0.8)',   // Laranja
    'rgba(199, 199, 199, 0.8)',  // Cinza
    'rgba(83, 102, 255, 0.8)',   // Azul escuro
    'rgba(255, 99, 255, 0.8)',   // Rosa
    'rgba(99, 255, 132, 0.8)'    // Verde claro
];

const coresBorda = cores.map(c => c.replace('0.8', '1'));

// ============================================================================
// Inicialização
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
    try {
        inicializarFiltros();
        carregarTodosGraficos();
    } catch (e) {
        console.error('Erro DOMContentLoaded:', e);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha) {
            Alerta.TratamentoErroComLinha(e, 'DOMContentLoaded');
        }
    }
});

function inicializarFiltros() {
    try {
        const hoje = new Date();
        const dataFim = hoje.toISOString().split('T')[0];
        const dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        document.getElementById('dataInicio').value = dataInicio;
        document.getElementById('dataFim').value = dataFim;
    } catch (e) {
        console.error('Erro inicializarFiltros:', e);
    }
}

function definirPeriodo(dias) {
    try {
        const hoje = new Date();
        const dataFim = hoje.toISOString().split('T')[0];
        const dataInicio = new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        document.getElementById('dataInicio').value = dataInicio;
        document.getElementById('dataFim').value = dataFim;

        carregarTodosGraficos();
    } catch (e) {
        console.error('Erro definirPeriodo:', e);
    }
}

function obterParametrosFiltro() {
    try {
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        return `dataInicio=${dataInicio}&dataFim=${dataFim}`;
    } catch (e) {
        console.error('Erro obterParametrosFiltro:', e);
        return '';
    }
}

// ============================================================================
// Utilitário: Mostrar Sem Dados
// ============================================================================

function mostrarSemDados(containerId, mensagem = 'Sem dados para o período selecionado') {
    try {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="sem-dados"><i class="fas fa-info-circle me-2"></i>${mensagem}</div>`;
        }
    } catch (e) {
        console.error('Erro mostrarSemDados:', e);
    }
}

function restaurarCanvas(containerId, canvasId) {
    try {
        const container = document.getElementById(containerId);
        if (container && !document.getElementById(canvasId)) {
            container.innerHTML = `<canvas id="${canvasId}"></canvas>`;
        }
    } catch (e) {
        console.error('Erro restaurarCanvas:', e);
    }
}

// ============================================================================
// Carregar Todos os Gráficos
// ============================================================================

async function carregarTodosGraficos() {
    try {
        // Mostrar loading nos cards
        mostrarLoadingCards();

        // Carregar todos em paralelo com Promise.allSettled para não parar se um falhar
        const resultados = await Promise.allSettled([
            carregarResumoGeral(),
            carregarEstatisticasNormalizacao(),
            carregarDistribuicaoTipoUso(),
            carregarHeatmap(),
            carregarTop10Veiculos(),
            carregarTop10Motoristas(),
            carregarCustoPorFinalidade(),
            carregarComparativoPropiosTerceirizados(),
            carregarEficienciaFrota(),
            carregarEvolucaoMensalCustos()
        ]);

        // Log de resultados para debug
        resultados.forEach((r, i) => {
            if (r.status === 'rejected') {
                console.error(`Erro no gráfico ${i}:`, r.reason);
            }
        });

    } catch (e) {
        console.error('Erro carregarTodosGraficos:', e);
    }
}

function mostrarLoadingCards() {
    try {
        const cards = ['cardVeiculosAtivos', 'cardMotoristasAtivos', 'cardViagensRealizadas', 'cardTotalKm'];
        cards.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        });
    } catch (e) {
        console.error('Erro mostrarLoadingCards:', e);
    }
}

function pararLoadingCards() {
    try {
        const cards = [
            { id: 'cardVeiculosAtivos', valor: '0' },
            { id: 'cardMotoristasAtivos', valor: '0' },
            { id: 'cardViagensRealizadas', valor: '0' },
            { id: 'cardTotalKm', valor: '0 km' }
        ];
        cards.forEach(c => {
            const el = document.getElementById(c.id);
            if (el && el.innerHTML.includes('fa-spinner')) {
                el.textContent = c.valor;
            }
        });
    } catch (e) {
        console.error('Erro pararLoadingCards:', e);
    }
}

// ============================================================================
// Resumo Geral
// ============================================================================

async function carregarResumoGeral() {
    try {
        const response = await fetch(`/api/Administracao/ObterResumoGeralFrota?${obterParametrosFiltro()}`);
        const result = await response.json();

        if (result.sucesso && result.dados) {
            const dados = result.dados;
            document.getElementById('cardVeiculosAtivos').textContent = formatarNumero(dados.veiculosAtivos);
            document.getElementById('cardMotoristasAtivos').textContent = formatarNumero(dados.motoristasAtivos);
            document.getElementById('cardViagensRealizadas').textContent = formatarNumero(dados.viagensRealizadas);
            document.getElementById('cardTotalKm').textContent = formatarKm(dados.totalKm);
        } else {
            pararLoadingCards();
        }
    } catch (e) {
        console.error('Erro carregarResumoGeral:', e);
        pararLoadingCards();
    }
}

// ============================================================================
// Estatísticas de Normalização
// ============================================================================

async function carregarEstatisticasNormalizacao() {
    try {
        const response = await fetch(`/api/Administracao/ObterEstatisticasNormalizacao?${obterParametrosFiltro()}`);
        const result = await response.json();

        if (result.sucesso && result.dados) {
            const dados = result.dados;

            // Gráfico Pizza - Originais vs Normalizadas
            if (dados.resumo && (dados.resumo.viagensOriginais > 0 || dados.resumo.viagensNormalizadas > 0)) {
                renderizarPizzaNormalizacao(dados.resumo);
                document.getElementById('lblPercentualNormalizadas').textContent =
                    `${dados.resumo.percentualNormalizadas}% das viagens foram normalizadas`;
            } else {
                mostrarSemDados('containerPizzaNormalizacao', 'Sem dados de normalização');
                document.getElementById('lblPercentualNormalizadas').textContent = '';
            }

            // Gráfico Barras - Por Tipo
            if (dados.porTipoNormalizacao && dados.porTipoNormalizacao.length > 0) {
                renderizarBarrasTipoNormalizacao(dados.porTipoNormalizacao);
            } else {
                mostrarSemDados('containerNormalizacaoTipo', 'Sem tipos de normalização');
            }
        } else {
            mostrarSemDados('containerPizzaNormalizacao', 'Erro ao carregar dados');
            mostrarSemDados('containerNormalizacaoTipo', 'Erro ao carregar dados');
        }
    } catch (e) {
        console.error('Erro carregarEstatisticasNormalizacao:', e);
        mostrarSemDados('containerPizzaNormalizacao', 'Erro ao carregar');
        mostrarSemDados('containerNormalizacaoTipo', 'Erro ao carregar');
    }
}

function renderizarPizzaNormalizacao(resumo) {
    try {
        restaurarCanvas('containerPizzaNormalizacao', 'chartNormalizacaoPizza');
        const ctx = document.getElementById('chartNormalizacaoPizza').getContext('2d');

        if (chartNormalizacaoPizza) {
            chartNormalizacaoPizza.destroy();
        }

        chartNormalizacaoPizza = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Originais', 'Normalizadas'],
                datasets: [{
                    data: [resumo.viagensOriginais, resumo.viagensNormalizadas],
                    backgroundColor: [cores[0], cores[3]],
                    borderColor: [coresBorda[0], coresBorda[3]],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const total = resumo.viagensOriginais + resumo.viagensNormalizadas;
                                const percentual = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${formatarNumero(context.raw)} (${percentual}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Erro renderizarPizzaNormalizacao:', e);
    }
}

function renderizarBarrasTipoNormalizacao(dados) {
    try {
        restaurarCanvas('containerNormalizacaoTipo', 'chartNormalizacaoTipo');
        const ctx = document.getElementById('chartNormalizacaoTipo').getContext('2d');

        if (chartNormalizacaoTipo) {
            chartNormalizacaoTipo.destroy();
        }

        // Labels formatados - quebrar em múltiplas linhas se muito longo
        const labels = dados.map(d => {
            const texto = formatarTipoNormalizacao(d.tipo);
            // Quebrar em array de linhas (máximo 18 chars por linha)
            if (texto.length > 18) {
                const palavras = texto.split(' ');
                const linhas = [];
                let linhaAtual = '';
                palavras.forEach(palavra => {
                    if ((linhaAtual + ' ' + palavra).trim().length <= 18) {
                        linhaAtual = (linhaAtual + ' ' + palavra).trim();
                    } else {
                        if (linhaAtual) linhas.push(linhaAtual);
                        linhaAtual = palavra;
                    }
                });
                if (linhaAtual) linhas.push(linhaAtual);
                return linhas;
            }
            return texto;
        });
        const valores = dados.map(d => d.quantidade);

        chartNormalizacaoTipo = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade',
                    data: valores,
                    backgroundColor: cores[1],
                    borderColor: coresBorda[1],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                layout: {
                    padding: {
                        left: 10
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                // Mostrar nome completo no tooltip
                                return formatarTipoNormalizacao(dados[context[0].dataIndex].tipo);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    },
                    y: {
                        ticks: {
                            font: { size: 10 },
                            autoSkip: false,
                            maxRotation: 0
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Erro renderizarBarrasTipoNormalizacao:', e);
    }
}

function formatarTipoNormalizacao(tipo) {
    if (!tipo) return 'Não especificado';
    // Substituir underscores por espaços e formatar
    return tipo
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
}

// ============================================================================
// Distribuição por Tipo de Uso
// ============================================================================

async function carregarDistribuicaoTipoUso() {
    try {
        const response = await fetch('/api/Administracao/ObterDistribuicaoTipoUso');
        const result = await response.json();

        if (result.sucesso && result.dados && result.dados.length > 0) {
            renderizarTipoUso(result.dados);
        } else {
            mostrarSemDados('containerTipoUso', 'Sem dados de tipo de uso');
            document.getElementById('legendaTipoUso').innerHTML = '';
        }
    } catch (e) {
        console.error('Erro carregarDistribuicaoTipoUso:', e);
        mostrarSemDados('containerTipoUso', 'Erro ao carregar');
    }
}

function renderizarTipoUso(dados) {
    try {
        restaurarCanvas('containerTipoUso', 'chartTipoUso');
        const ctx = document.getElementById('chartTipoUso').getContext('2d');

        if (chartTipoUso) {
            chartTipoUso.destroy();
        }

        const labels = dados.map(d => d.tipoUso || 'Não especificado');
        const valores = dados.map(d => d.quantidade);

        chartTipoUso = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: cores.slice(0, dados.length),
                    borderColor: coresBorda.slice(0, dados.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    } catch (e) {
        console.error('Erro renderizarTipoUso:', e);
    }
}

// ============================================================================
// Heatmap
// ============================================================================

async function carregarHeatmap() {
    try {
        const response = await fetch(`/api/Administracao/ObterHeatmapViagens?${obterParametrosFiltro()}`);
        const result = await response.json();

        if (result.sucesso && result.dados) {
            renderizarHeatmap(result.dados);
        } else {
            renderizarHeatmapVazio();
        }
    } catch (e) {
        console.error('Erro carregarHeatmap:', e);
        renderizarHeatmapVazio();
    }
}

function renderizarHeatmap(dados) {
    try {
        const tbody = document.getElementById('heatmapBody');
        const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

        // Encontrar valor máximo para escala de cores
        let maxValor = 0;
        if (dados.matriz) {
            dados.matriz.forEach(row => {
                row.forEach(val => {
                    if (val > maxValor) maxValor = val;
                });
            });
        }

        let html = '';
        for (let dia = 0; dia < 7; dia++) {
            html += `<tr><td class="text-center small fw-bold">${diasSemana[dia]}</td>`;
            for (let hora = 0; hora < 24; hora++) {
                const valor = dados.matriz && dados.matriz[dia] ? (dados.matriz[dia][hora] || 0) : 0;
                const cor = obterCorHeatmap(valor, maxValor);
                html += `<td class="heatmap-cell" style="background-color: ${cor};" title="${diasSemana[dia]} ${hora}h: ${valor} viagens">${valor > 0 ? valor : ''}</td>`;
            }
            html += '</tr>';
        }

        tbody.innerHTML = html;
    } catch (e) {
        console.error('Erro renderizarHeatmap:', e);
        renderizarHeatmapVazio();
    }
}

function renderizarHeatmapVazio() {
    try {
        const tbody = document.getElementById('heatmapBody');
        const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

        let html = '';
        for (let dia = 0; dia < 7; dia++) {
            html += `<tr><td class="text-center small fw-bold">${diasSemana[dia]}</td>`;
            for (let hora = 0; hora < 24; hora++) {
                html += `<td class="heatmap-cell" style="background-color: #f5f5f5;"></td>`;
            }
            html += '</tr>';
        }

        tbody.innerHTML = html;
    } catch (e) {
        console.error('Erro renderizarHeatmapVazio:', e);
    }
}

function obterCorHeatmap(valor, maxValor) {
    if (valor === 0 || maxValor === 0) return '#f5f5f5';
    const percentual = valor / maxValor;
    if (percentual <= 0.2) return '#e8f5e9';
    if (percentual <= 0.4) return '#c8e6c9';
    if (percentual <= 0.6) return '#81c784';
    if (percentual <= 0.8) return '#4caf50';
    return '#2e7d32';
}

// ============================================================================
// Top 10 Veículos
// ============================================================================

async function carregarTop10Veiculos() {
    try {
        const response = await fetch(`/api/Administracao/ObterTop10VeiculosPorKm?${obterParametrosFiltro()}`);
        const result = await response.json();

        if (result.sucesso && result.dados && result.dados.length > 0) {
            renderizarTop10Veiculos(result.dados);
        } else {
            mostrarSemDados('containerTop10Veiculos', 'Sem dados de veículos no período');
        }
    } catch (e) {
        console.error('Erro carregarTop10Veiculos:', e);
        mostrarSemDados('containerTop10Veiculos', 'Erro ao carregar');
    }
}

function renderizarTop10Veiculos(dados) {
    try {
        restaurarCanvas('containerTop10Veiculos', 'chartTop10Veiculos');
        const ctx = document.getElementById('chartTop10Veiculos').getContext('2d');

        if (chartTop10Veiculos) {
            chartTop10Veiculos.destroy();
        }

        const labels = dados.map(d => truncarTexto(d.placa || d.veiculoDescricao, 15));
        const valores = dados.map(d => d.totalKm);

        chartTop10Veiculos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'KM Rodados',
                    data: valores,
                    backgroundColor: cores[0],
                    borderColor: coresBorda[0],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                const item = dados[context[0].dataIndex];
                                return item.veiculoDescricao || item.placa;
                            },
                            label: function (context) {
                                const item = dados[context.dataIndex];
                                return [
                                    `Total KM: ${formatarKm(item.totalKm)}`,
                                    `Viagens: ${item.totalViagens}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return formatarKm(value);
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Erro renderizarTop10Veiculos:', e);
    }
}

// ============================================================================
// Top 10 Motoristas
// ============================================================================

async function carregarTop10Motoristas() {
    try {
        const response = await fetch(`/api/Administracao/ObterTop10MotoristasPorKm?${obterParametrosFiltro()}`);
        const result = await response.json();

        if (result.sucesso && result.dados && result.dados.length > 0) {
            renderizarTop10Motoristas(result.dados);
        } else {
            mostrarSemDados('containerTop10Motoristas', 'Sem dados de motoristas no período');
        }
    } catch (e) {
        console.error('Erro carregarTop10Motoristas:', e);
        mostrarSemDados('containerTop10Motoristas', 'Erro ao carregar');
    }
}

function renderizarTop10Motoristas(dados) {
    try {
        restaurarCanvas('containerTop10Motoristas', 'chartTop10Motoristas');
        const ctx = document.getElementById('chartTop10Motoristas').getContext('2d');

        if (chartTop10Motoristas) {
            chartTop10Motoristas.destroy();
        }

        const labels = dados.map(d => truncarTexto(d.nome, 15));
        const valores = dados.map(d => d.totalKm);

        chartTop10Motoristas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'KM Rodados',
                    data: valores,
                    backgroundColor: cores[1],
                    borderColor: coresBorda[1],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                return dados[context[0].dataIndex].nome;
                            },
                            label: function (context) {
                                const item = dados[context.dataIndex];
                                return [
                                    `Total KM: ${formatarKm(item.totalKm)}`,
                                    `Viagens: ${item.totalViagens}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return formatarKm(value);
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Erro renderizarTop10Motoristas:', e);
    }
}

// ============================================================================
// Custo por Finalidade
// ============================================================================

async function carregarCustoPorFinalidade() {
    try {
        const response = await fetch(`/api/Administracao/ObterCustoPorFinalidade?${obterParametrosFiltro()}`);
        const result = await response.json();

        if (result.sucesso && result.dados && result.dados.length > 0) {
            renderizarCustoPorFinalidade(result.dados);
        } else {
            mostrarSemDados('containerCustoPorFinalidade', 'Sem dados de custos por finalidade');
        }
    } catch (e) {
        console.error('Erro carregarCustoPorFinalidade:', e);
        mostrarSemDados('containerCustoPorFinalidade', 'Erro ao carregar');
    }
}

function renderizarCustoPorFinalidade(dados) {
    try {
        restaurarCanvas('containerCustoPorFinalidade', 'chartCustoPorFinalidade');
        const ctx = document.getElementById('chartCustoPorFinalidade').getContext('2d');

        if (chartCustoPorFinalidade) {
            chartCustoPorFinalidade.destroy();
        }

        const labels = dados.map(d => truncarTexto(d.finalidade, 15));
        const valores = dados.map(d => d.custoMedio);

        chartCustoPorFinalidade = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Custo Médio (R$)',
                    data: valores,
                    backgroundColor: cores[2],
                    borderColor: coresBorda[2],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                return dados[context[0].dataIndex].finalidade;
                            },
                            label: function (context) {
                                const item = dados[context.dataIndex];
                                return [
                                    `Custo Médio: ${formatarMoeda(item.custoMedio)}`,
                                    `Custo Total: ${formatarMoeda(item.custoTotal)}`,
                                    `Viagens: ${item.totalViagens}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return formatarMoeda(value);
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Erro renderizarCustoPorFinalidade:', e);
    }
}

// ============================================================================
// Próprios vs Terceirizados
// ============================================================================

async function carregarComparativoPropiosTerceirizados() {
    try {
        const response = await fetch(`/api/Administracao/ObterComparativoPropiosTerceirizados?${obterParametrosFiltro()}`);
        const result = await response.json();

        if (result.sucesso && result.dados) {
            const dados = result.dados;
            if (dados.proprios.totalViagens > 0 || dados.terceirizados.totalViagens > 0) {
                renderizarPropriosTerceirizados(dados);
            } else {
                mostrarSemDados('containerPropriosTerceirizados', 'Sem dados de veículos próprios/terceirizados');
            }
        } else {
            mostrarSemDados('containerPropriosTerceirizados', 'Sem dados disponíveis');
        }
    } catch (e) {
        console.error('Erro carregarComparativoPropiosTerceirizados:', e);
        mostrarSemDados('containerPropriosTerceirizados', 'Erro ao carregar');
    }
}

function renderizarPropriosTerceirizados(dados) {
    try {
        restaurarCanvas('containerPropriosTerceirizados', 'chartPropriosTerceirizados');
        const ctx = document.getElementById('chartPropriosTerceirizados').getContext('2d');

        if (chartPropriosTerceirizados) {
            chartPropriosTerceirizados.destroy();
        }

        chartPropriosTerceirizados = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Viagens', 'KM (mil)', 'Custo Total (R$ mil)'],
                datasets: [
                    {
                        label: 'Próprios',
                        data: [dados.proprios.totalViagens, dados.proprios.totalKm / 1000, dados.proprios.custoTotal / 1000],
                        backgroundColor: cores[0],
                        borderColor: coresBorda[0],
                        borderWidth: 1
                    },
                    {
                        label: 'Terceirizados',
                        data: [dados.terceirizados.totalViagens, dados.terceirizados.totalKm / 1000, dados.terceirizados.custoTotal / 1000],
                        backgroundColor: cores[3],
                        borderColor: coresBorda[3],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label;
                                const tipo = label === 'Próprios' ? dados.proprios : dados.terceirizados;
                                const idx = context.dataIndex;
                                if (idx === 0) return `${label}: ${formatarNumero(tipo.totalViagens)} viagens`;
                                if (idx === 1) return `${label}: ${formatarKm(tipo.totalKm)}`;
                                return `${label}: ${formatarMoeda(tipo.custoTotal)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch (e) {
        console.error('Erro renderizarPropriosTerceirizados:', e);
    }
}

// ============================================================================
// Eficiência da Frota
// ============================================================================

async function carregarEficienciaFrota() {
    try {
        const response = await fetch(`/api/Administracao/ObterEficienciaFrota?${obterParametrosFiltro()}`);
        const result = await response.json();

        if (result.sucesso && result.dados && result.dados.length > 0) {
            renderizarEficiencia(result.dados);
        } else {
            mostrarSemDados('containerEficiencia', 'Sem dados de eficiência no período');
        }
    } catch (e) {
        console.error('Erro carregarEficienciaFrota:', e);
        mostrarSemDados('containerEficiencia', 'Erro ao carregar');
    }
}

function renderizarEficiencia(dados) {
    try {
        restaurarCanvas('containerEficiencia', 'chartEficiencia');
        const ctx = document.getElementById('chartEficiencia').getContext('2d');

        if (chartEficiencia) {
            chartEficiencia.destroy();
        }

        const labels = dados.map(d => truncarTexto(d.placa, 12));
        const valores = dados.map(d => d.custoPorKm);

        // Cores gradientes (verde para mais eficiente)
        const coresEficiencia = dados.map((_, i) => {
            if (i < 3) return 'rgba(76, 175, 80, 0.8)';  // Top 3 - Verde
            if (i < 7) return 'rgba(33, 150, 243, 0.8)'; // 4-7 - Azul
            return 'rgba(255, 193, 7, 0.8)';              // 8-10 - Amarelo
        });

        chartEficiencia = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Custo por KM (R$)',
                    data: valores,
                    backgroundColor: coresEficiencia,
                    borderColor: coresEficiencia.map(c => c.replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                return dados[context[0].dataIndex].veiculoDescricao;
                            },
                            label: function (context) {
                                const item = dados[context.dataIndex];
                                return [
                                    `Custo/KM: ${formatarMoeda(item.custoPorKm)}`,
                                    `Total KM: ${formatarNumero(item.totalKm)}`,
                                    `Custo Total: ${formatarMoeda(item.custoTotal)}`,
                                    `Viagens: ${item.totalViagens}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Erro renderizarEficiencia:', e);
    }
}

// ============================================================================
// Evolução Mensal de Custos
// ============================================================================

async function carregarEvolucaoMensalCustos() {
    try {
        const response = await fetch(`/api/Administracao/ObterEvolucaoMensalCustos?${obterParametrosFiltro()}`);
        const result = await response.json();

        if (result.sucesso && result.dados && result.dados.length > 0) {
            renderizarEvolucaoMensal(result.dados);
        } else {
            mostrarSemDados('containerEvolucaoMensal', 'Sem dados de evolução no período');
        }
    } catch (e) {
        console.error('Erro carregarEvolucaoMensalCustos:', e);
        mostrarSemDados('containerEvolucaoMensal', 'Erro ao carregar');
    }
}

function renderizarEvolucaoMensal(dados) {
    try {
        restaurarCanvas('containerEvolucaoMensal', 'chartEvolucaoMensal');
        const ctx = document.getElementById('chartEvolucaoMensal').getContext('2d');

        if (chartEvolucaoMensal) {
            chartEvolucaoMensal.destroy();
        }

        const labels = dados.map(d => d.mesAno);

        chartEvolucaoMensal = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Combustível',
                        data: dados.map(d => d.custoCombustivel),
                        borderColor: cores[0],
                        backgroundColor: cores[0].replace('0.8', '0.1'),
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Motorista',
                        data: dados.map(d => d.custoMotorista),
                        borderColor: cores[1],
                        backgroundColor: cores[1].replace('0.8', '0.1'),
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Lavador',
                        data: dados.map(d => d.custoLavador),
                        borderColor: cores[2],
                        backgroundColor: cores[2].replace('0.8', '0.1'),
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            afterBody: function (context) {
                                const item = dados[context[0].dataIndex];
                                return [
                                    '',
                                    `Total: ${formatarMoeda(item.custoTotal)}`,
                                    `Viagens: ${item.totalViagens}`,
                                    `KM: ${formatarKm(item.totalKm)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return formatarMoeda(value);
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Erro renderizarEvolucaoMensal:', e);
    }
}

// ============================================================================
// Funções Utilitárias
// ============================================================================

function formatarNumero(valor) {
    try {
        if (valor === null || valor === undefined) return '0';
        return valor.toLocaleString('pt-BR');
    } catch (e) {
        return '0';
    }
}

function formatarMoeda(valor) {
    try {
        if (valor === null || valor === undefined) return 'R$ 0,00';
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } catch (e) {
        return 'R$ 0,00';
    }
}

function formatarKm(valor) {
    try {
        if (valor === null || valor === undefined) return '0 km';
        if (valor >= 1000) {
            return (valor / 1000).toFixed(1) + 'k km';
        }
        return Math.round(valor) + ' km';
    } catch (e) {
        return '0 km';
    }
}

function truncarTexto(texto, maxLength) {
    try {
        if (!texto) return '';
        if (texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
    } catch (e) {
        return texto || '';
    }
}
