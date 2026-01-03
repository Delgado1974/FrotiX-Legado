/**
 * Dashboard de Lavagem de Veiculos
 * FrotiX - Sistema de Gestao de Frotas
 */

// ========================================
// VARIAVEIS GLOBAIS
// ========================================
let chartDiaSemana = null;
let chartHorario = null;
let chartEvolucao = null;
let chartTopLavadores = null;
let chartTopVeiculos = null;

// Cores do tema Cyan
const CORES_LAV = {
    primary: '#0891b2',
    secondary: '#06b6d4',
    accent: '#22d3ee',
    dark: '#0e7490',
    light: '#ecfeff',
    gradient: ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'],
    heatmap: ['#ecfeff', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490']
};

// ========================================
// INICIALIZACAO
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    try {
        // Define periodo padrao (ultimos 30 dias)
        const hoje = new Date();
        const inicio = new Date();
        inicio.setDate(hoje.getDate() - 30);

        document.getElementById('dataInicio').value = formatarDataInput(inicio);
        document.getElementById('dataFim').value = formatarDataInput(hoje);

        // Event listeners
        document.getElementById('btnFiltrar').addEventListener('click', carregarDados);

        // Desmarcar periodos rapidos ao editar datas manualmente
        document.getElementById('dataInicio').addEventListener('change', function() {
            document.querySelectorAll('.btn-period-lav').forEach(b => b.classList.remove('active'));
        });
        document.getElementById('dataFim').addEventListener('change', function() {
            document.querySelectorAll('.btn-period-lav').forEach(b => b.classList.remove('active'));
        });

        // Botoes de periodo rapido
        document.querySelectorAll('.btn-period-lav').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.btn-period-lav').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const dias = parseInt(this.dataset.dias);
                const novoInicio = new Date();
                novoInicio.setDate(hoje.getDate() - dias);

                document.getElementById('dataInicio').value = formatarDataInput(novoInicio);
                document.getElementById('dataFim').value = formatarDataInput(hoje);

                carregarDados();
            });
        });

        // Carrega dados iniciais
        carregarDados();
    } catch (error) {
        console.error('Erro na inicializacao:', error);
        ocultarLoading();
    }
});

// ========================================
// FUNCOES DE CARREGAMENTO
// ========================================
async function carregarDados() {
    try {
        mostrarLoading();

        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;

        // Carrega todos os dados em paralelo (otimizado - removidos graficos desnecessarios)
        await Promise.all([
            carregarEstatisticasGerais(dataInicio, dataFim),
            carregarGraficosDiaSemana(dataInicio, dataFim),
            carregarGraficosHorario(dataInicio, dataFim),
            carregarGraficosEvolucao(),
            carregarTopLavadores(dataInicio, dataFim),
            carregarTopVeiculos(dataInicio, dataFim),
            carregarHeatmap(dataInicio, dataFim),
            carregarTabelaLavadores(dataInicio, dataFim),
            carregarTabelaVeiculos(dataInicio, dataFim)
        ]);

        ocultarLoading();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        ocultarLoading();
        Alerta.Erro('Erro ao carregar dados do dashboard');
    }
}

async function carregarEstatisticasGerais(dataInicio, dataFim) {
    try {
        const response = await fetch(`/api/DashboardLavagem/EstatisticasGerais?dataInicio=${dataInicio}&dataFim=${dataFim}`);
        const result = await response.json();

        if (result.success) {
            document.getElementById('totalLavagens').textContent = formatarNumero(result.totalLavagens);
            document.getElementById('veiculosLavados').textContent = formatarNumero(result.veiculosLavados);
            document.getElementById('lavadoresAtivos').textContent = formatarNumero(result.lavadoresAtivos);
            document.getElementById('mediaDiaria').textContent = result.mediaDiaria.toFixed(1);
            document.getElementById('mediaPorVeiculo').textContent = result.mediaPorVeiculo.toFixed(1);

            // Destaques
            document.getElementById('lavadorDestaqueNome').textContent = result.lavadorDestaque?.nome || '-';
            document.getElementById('lavadorDestaqueQtd').textContent = `${result.lavadorDestaque?.quantidade || 0} lavagens`;

            document.getElementById('veiculoMaisLavadoPlaca').textContent = result.veiculoMaisLavado?.placa || '-';
            document.getElementById('veiculoMaisLavadoQtd').textContent = `${result.veiculoMaisLavado?.quantidade || 0} lavagens`;

            document.getElementById('diaMaisMovimentado').textContent = result.diaMaisMovimentado || '-';
            document.getElementById('horarioPico').textContent = result.horarioPico || '-';

            // Variacao
            const variacaoEl = document.getElementById('variacaoLavagens');
            const anterior = result.periodoAnterior?.totalLavagens || 0;
            if (anterior > 0) {
                const variacao = ((result.totalLavagens - anterior) / anterior * 100).toFixed(1);
                if (variacao > 0) {
                    variacaoEl.className = 'variacao-metrica variacao-positiva';
                    variacaoEl.innerHTML = `<i class="fa-solid fa-arrow-up me-1"></i>+${variacao}%`;
                } else if (variacao < 0) {
                    variacaoEl.className = 'variacao-metrica variacao-negativa';
                    variacaoEl.innerHTML = `<i class="fa-solid fa-arrow-down me-1"></i>${variacao}%`;
                } else {
                    variacaoEl.className = 'variacao-metrica variacao-neutra';
                    variacaoEl.innerHTML = `<i class="fa-solid fa-equals me-1"></i>0%`;
                }
            } else {
                variacaoEl.textContent = '';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar estatisticas gerais:', error);
    }
}

async function carregarGraficosDiaSemana(dataInicio, dataFim) {
    try {
        const response = await fetch(`/api/DashboardLavagem/LavagensPorDiaSemana?dataInicio=${dataInicio}&dataFim=${dataFim}`);
        const result = await response.json();

        if (result.success && result.data) {
            if (chartDiaSemana) chartDiaSemana.destroy();

            chartDiaSemana = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labelStyle: { color: '#6B7280' }
                },
                primaryYAxis: {
                    labelStyle: { color: '#6B7280' },
                    minimum: 0
                },
                series: [{
                    dataSource: result.data,
                    xName: 'dia',
                    yName: 'quantidade',
                    type: 'Column',
                    fill: CORES_LAV.primary,
                    cornerRadius: { topLeft: 4, topRight: 4 },
                    marker: { dataLabel: { visible: true, position: 'Top', font: { fontWeight: '600' } } }
                }],
                tooltip: { enable: true },
                chartArea: { border: { width: 0 } },
                background: 'transparent'
            });

            chartDiaSemana.appendTo('#chartDiaSemana');
        }
    } catch (error) {
        console.error('Erro ao carregar grafico dia da semana:', error);
    }
}

async function carregarGraficosHorario(dataInicio, dataFim) {
    try {
        const response = await fetch(`/api/DashboardLavagem/LavagensPorHorario?dataInicio=${dataInicio}&dataFim=${dataFim}`);
        const result = await response.json();

        if (result.success && result.data) {
            if (chartHorario) chartHorario.destroy();

            chartHorario = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labelStyle: { color: '#6B7280' },
                    labelRotation: -45
                },
                primaryYAxis: {
                    labelStyle: { color: '#6B7280' },
                    minimum: 0
                },
                series: [{
                    dataSource: result.data,
                    xName: 'hora',
                    yName: 'quantidade',
                    type: 'Area',
                    fill: CORES_LAV.primary,
                    opacity: 0.6,
                    border: { width: 2, color: CORES_LAV.dark }
                }],
                tooltip: { enable: true },
                chartArea: { border: { width: 0 } },
                background: 'transparent'
            });

            chartHorario.appendTo('#chartHorario');
        }
    } catch (error) {
        console.error('Erro ao carregar grafico horario:', error);
    }
}

async function carregarGraficosEvolucao() {
    try {
        const response = await fetch('/api/DashboardLavagem/EvolucaoMensal?meses=12');
        const result = await response.json();

        if (result.success && result.data) {
            if (chartEvolucao) chartEvolucao.destroy();

            chartEvolucao = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labelStyle: { color: '#6B7280' }
                },
                primaryYAxis: {
                    labelStyle: { color: '#6B7280' },
                    minimum: 0
                },
                series: [{
                    dataSource: result.data,
                    xName: 'mes',
                    yName: 'quantidade',
                    type: 'Line',
                    fill: CORES_LAV.primary,
                    width: 3,
                    marker: {
                        visible: true,
                        width: 8,
                        height: 8,
                        fill: CORES_LAV.primary,
                        dataLabel: { visible: true, position: 'Top', font: { fontWeight: '600' } }
                    }
                }],
                tooltip: { enable: true },
                chartArea: { border: { width: 0 } },
                background: 'transparent'
            });

            chartEvolucao.appendTo('#chartEvolucao');
        }
    } catch (error) {
        console.error('Erro ao carregar grafico evolucao:', error);
    }
}

async function carregarTopLavadores(dataInicio, dataFim) {
    try {
        const response = await fetch(`/api/DashboardLavagem/TopLavadores?dataInicio=${dataInicio}&dataFim=${dataFim}&top=10`);
        const result = await response.json();

        if (result.success && result.data) {
            if (chartTopLavadores) chartTopLavadores.destroy();

            chartTopLavadores = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labelStyle: { color: '#6B7280' }
                },
                primaryYAxis: {
                    labelStyle: { color: '#6B7280' },
                    minimum: 0
                },
                series: [{
                    dataSource: result.data.reverse(),
                    xName: 'nome',
                    yName: 'quantidade',
                    type: 'Bar',
                    fill: CORES_LAV.secondary,
                    cornerRadius: { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 },
                    marker: { dataLabel: { visible: true, position: 'Top', font: { fontWeight: '600' } } }
                }],
                tooltip: { enable: true },
                chartArea: { border: { width: 0 } },
                background: 'transparent'
            });

            chartTopLavadores.appendTo('#chartTopLavadores');
        }
    } catch (error) {
        console.error('Erro ao carregar top lavadores:', error);
    }
}

async function carregarTopVeiculos(dataInicio, dataFim) {
    try {
        const response = await fetch(`/api/DashboardLavagem/TopVeiculos?dataInicio=${dataInicio}&dataFim=${dataFim}&top=10`);
        const result = await response.json();

        if (result.success && result.data) {
            if (chartTopVeiculos) chartTopVeiculos.destroy();

            chartTopVeiculos = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labelStyle: { color: '#6B7280' }
                },
                primaryYAxis: {
                    labelStyle: { color: '#6B7280' },
                    minimum: 0
                },
                series: [{
                    dataSource: result.data.reverse(),
                    xName: 'placa',
                    yName: 'quantidade',
                    type: 'Bar',
                    fill: CORES_LAV.accent,
                    cornerRadius: { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 },
                    marker: { dataLabel: { visible: true, position: 'Top', font: { fontWeight: '600' } } }
                }],
                tooltip: { enable: true },
                chartArea: { border: { width: 0 } },
                background: 'transparent'
            });

            chartTopVeiculos.appendTo('#chartTopVeiculos');
        }
    } catch (error) {
        console.error('Erro ao carregar top veiculos:', error);
    }
}

async function carregarHeatmap(dataInicio, dataFim) {
    try {
        const response = await fetch(`/api/DashboardLavagem/HeatmapDiaHora?dataInicio=${dataInicio}&dataFim=${dataFim}`);
        const result = await response.json();

        if (result.success && result.data) {
            renderizarHeatmap(result.data);
        }
    } catch (error) {
        console.error('Erro ao carregar heatmap:', error);
    }
}

function renderizarHeatmap(data) {
    const container = document.getElementById('heatmapContainer');
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

    // Encontra valor maximo para escala de cores
    const maxValor = Math.max(...data.map(d => d.quantidade), 1);

    let html = '<table class="table table-sm mb-0" style="width: auto;">';
    html += '<thead><tr><th></th>';

    // Cabecalho das horas
    for (let h = 0; h < 24; h++) {
        html += `<th class="text-center" style="font-size: 0.7rem; padding: 2px;">${h.toString().padStart(2, '0')}</th>`;
    }
    html += '</tr></thead><tbody>';

    // Linhas dos dias
    for (let d = 0; d < 7; d++) {
        html += `<tr><td style="font-size: 0.75rem; font-weight: 600;">${diasSemana[d]}</td>`;

        for (let h = 0; h < 24; h++) {
            const item = data.find(x => x.dia === d && x.hora === h);
            const valor = item ? item.quantidade : 0;
            const intensidade = valor / maxValor;
            const corIndex = Math.min(Math.floor(intensidade * (CORES_LAV.heatmap.length - 1)), CORES_LAV.heatmap.length - 1);
            const cor = CORES_LAV.heatmap[corIndex];
            const corTexto = intensidade > 0.5 ? '#fff' : '#333';

            html += `<td style="padding: 2px;">
                <div class="heatmap-cell" style="background-color: ${cor}; color: ${corTexto};" title="${diasSemana[d]} ${h}h: ${valor} lavagens">
                    ${valor > 0 ? valor : ''}
                </div>
            </td>`;
        }
        html += '</tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

async function carregarTabelaLavadores(dataInicio, dataFim) {
    try {
        const response = await fetch(`/api/DashboardLavagem/EstatisticasPorLavador?dataInicio=${dataInicio}&dataFim=${dataFim}`);
        const result = await response.json();

        if (result.success && result.data) {
            const tbody = document.querySelector('#tabelaLavadores tbody');
            tbody.innerHTML = result.data.slice(0, 15).map(item => `
                <tr>
                    <td>${item.nome}</td>
                    <td class="text-center"><strong>${item.lavagens}</strong></td>
                    <td class="text-center">${item.percentual}%</td>
                    <td class="text-center">${item.mediaDia}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar tabela lavadores:', error);
    }
}

async function carregarTabelaVeiculos(dataInicio, dataFim) {
    try {
        const response = await fetch(`/api/DashboardLavagem/EstatisticasPorVeiculo?dataInicio=${dataInicio}&dataFim=${dataFim}`);
        const result = await response.json();

        if (result.success && result.data) {
            const tbody = document.querySelector('#tabelaVeiculos tbody');
            tbody.innerHTML = result.data.slice(0, 15).map(item => {
                let badgeDias = '';
                if (item.diasSemLavar >= 0) {
                    if (item.diasSemLavar <= 3) {
                        badgeDias = `<span class="badge bg-success">${item.diasSemLavar}</span>`;
                    } else if (item.diasSemLavar <= 7) {
                        badgeDias = `<span class="badge bg-warning text-dark">${item.diasSemLavar}</span>`;
                    } else {
                        badgeDias = `<span class="badge bg-danger">${item.diasSemLavar}</span>`;
                    }
                }

                return `
                    <tr>
                        <td><strong>${item.placa}</strong> <small class="text-muted">${item.modelo}</small></td>
                        <td class="text-center"><strong>${item.lavagens}</strong></td>
                        <td class="text-center">${item.ultimaLavagem}</td>
                        <td class="text-center">${badgeDias}</td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar tabela veiculos:', error);
    }
}

// ========================================
// FUNCOES AUXILIARES
// ========================================
function formatarNumero(valor) {
    if (valor === null || valor === undefined) return '0';
    return valor.toLocaleString('pt-BR');
}

function formatarDataInput(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function mostrarLoading(mensagem) {
    var modalEl = document.getElementById('modalLoadingLavagem');
    if (!modalEl) return;

    // Atualiza mensagem se fornecida
    if (mensagem) {
        var msgEl = document.getElementById('loadingLavagemMensagem');
        if (msgEl) msgEl.textContent = mensagem;
    }

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        var existingModal = bootstrap.Modal.getInstance(modalEl);
        if (existingModal) {
            existingModal.show();
        } else {
            var modal = new bootstrap.Modal(modalEl, {
                backdrop: 'static',
                keyboard: false
            });
            modal.show();
        }
    }
}

function ocultarLoading() {
    var modalEl = document.getElementById('modalLoadingLavagem');
    if (!modalEl) return;

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        var modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) {
            modal.hide();
        }
    }

    // Remove backdrop manual se existir
    var backdrop = document.getElementById('ftx-loading-backdrop');
    if (backdrop) {
        backdrop.remove();
        document.body.classList.remove('modal-open');
    }
}
