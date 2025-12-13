// ========================================
// DASHBOARD DE EVENTOS - FROTIX
// ========================================
// TODAS AS FUNÇÕES TÊM TRY-CATCH OBRIGATÓRIO

// ========================================
// INJEÇÃO DE MÓDULOS SYNCFUSION (CRÍTICO!)
// ========================================
// DEVE ser executado ANTES de qualquer uso de gráficos

if (typeof ej !== 'undefined' && ej.charts)
{
    console.log('🔧 Injetando módulos Syncfusion...');

    // Injetar módulos para Chart
    ej.charts.Chart.Inject(
        ej.charts.ColumnSeries,
        ej.charts.LineSeries,
        ej.charts.Category,
        ej.charts.Legend,
        ej.charts.Tooltip,
        ej.charts.DataLabel
    );

    // Injetar módulos para AccumulationChart
    ej.charts.AccumulationChart.Inject(
        ej.charts.PieSeries,
        ej.charts.AccumulationTooltip,
        ej.charts.AccumulationDataLabel,
        ej.charts.AccumulationLegend
    );

    console.log('✅ Módulos Syncfusion injetados com sucesso!');
} else
{
    console.error('❌ ERRO: Syncfusion (ej.charts) não está carregado!');
}

// Paleta de Cores FrotiX
const CORES_FROTIX = {
    azul: '#0D6EFD',
    verde: '#16a34a',
    laranja: '#d97706',
    amarelo: '#f59e0b',
    vermelho: '#dc2626',
    roxo: '#667eea',
    ciano: '#22d3ee',
    rosa: '#ec4899'
};

let periodoAtual = {
    dataInicio: null,
    dataFim: null
};

// Variáveis para armazenar gráficos Syncfusion
let chartEventosPorStatus = null;
let chartEventosPorSetor = null;
let chartEventosPorMes = null;

// ========================================
// INICIALIZAÇÃO
// ========================================

async function inicializarDashboard()
{
    try
    {
        console.log('🎯 Iniciando Dashboard de Eventos...');

        // Define período padrão (últimos 30 dias)
        const hoje = new Date();
        periodoAtual.dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
        periodoAtual.dataInicio = new Date(periodoAtual.dataFim);
        periodoAtual.dataInicio.setDate(periodoAtual.dataInicio.getDate() - 30);

        // Inicializa campos de data HTML5
        inicializarCamposData();

        // Carrega dashboard
        await carregarDadosDashboard();

        AppToast.show('Verde', 'Dashboard de Eventos carregado com sucesso!', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'inicializarDashboard', error);
    }
}

// ========================================
// CAMPOS DE DATA HTML5
// ========================================

function inicializarCamposData()
{
    try
    {
        const dataInicio = document.getElementById('dataInicio');
        const dataFim = document.getElementById('dataFim');

        if (dataInicio && dataFim)
        {
            // Define valores iniciais
            dataInicio.value = formatarDataParaInput(periodoAtual.dataInicio);
            dataFim.value = formatarDataParaInput(periodoAtual.dataFim);

            // Adiciona eventos de mudança
            dataInicio.addEventListener('change', function ()
            {
                try
                {
                    periodoAtual.dataInicio = new Date(this.value + 'T00:00:00');
                } catch (error)
                {
                    console.error('Erro ao atualizar data inicial:', error);
                }
            });

            dataFim.addEventListener('change', function ()
            {
                try
                {
                    periodoAtual.dataFim = new Date(this.value + 'T23:59:59');
                } catch (error)
                {
                    console.error('Erro ao atualizar data final:', error);
                }
            });
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'inicializarCamposData', error);
    }
}

function formatarDataParaInput(data)
{
    try
    {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    } catch (error)
    {
        return '';
    }
}

// ========================================
// CARREGAR DADOS
// ========================================

async function carregarDadosDashboard()
{
    try
    {
        console.log('⏱️ Iniciando carregamento do dashboard...');
        const inicio = performance.now();

        mostrarLoadingGeral();

        // Promise.allSettled não trava se um falhar
        const resultados = await Promise.allSettled([
            carregarEstatisticasGerais(),
            carregarEventosPorStatus(),
            carregarEventosPorSetor(),
            carregarEventosPorRequisitante(),
            carregarEventosPorMes(),
        ]);

        const tempo = ((performance.now() - inicio) / 1000).toFixed(2);
        console.log(`✅ Dashboard carregado em ${tempo}s`);

        // Log de falhas
        const nomes = [
            'EstatisticasGerais', 'EventosPorStatus', 'EventosPorSetor',
            'EventosPorRequisitante', 'EventosPorMes', 'EventosPorTipo',
            'EventosPorDia'
        ];

        resultados.forEach((resultado, index) =>
        {
            if (resultado.status === 'rejected')
            {
                console.error(`❌ ${nomes[index]} falhou:`, resultado.reason);
            }
        });

        esconderLoadingGeral();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'carregarDadosDashboard', error);
        esconderLoadingGeral();
    }
}

// ========================================
// LOADING
// ========================================

function mostrarLoadingGeral()
{
    try
    {
        const loading = document.getElementById('loadingDashboard');
        if (loading)
        {
            loading.classList.remove('d-none');
        }
    } catch (error)
    {
        console.error('Erro ao mostrar loading:', error);
    }
}

function esconderLoadingGeral()
{
    try
    {
        const loading = document.getElementById('loadingDashboard');
        if (loading)
        {
            loading.classList.add('d-none');
        }
    } catch (error)
    {
        console.error('Erro ao esconder loading:', error);
    }
}

// ========================================
// PERÍODOS RÁPIDOS
// ========================================

function aplicarPeriodoRapido(dias)
{
    try
    {
        const hoje = new Date();
        periodoAtual.dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
        periodoAtual.dataInicio = new Date(periodoAtual.dataFim);
        periodoAtual.dataInicio.setDate(periodoAtual.dataInicio.getDate() - dias);

        // Atualiza campos HTML
        document.getElementById('dataInicio').value = formatarDataParaInput(periodoAtual.dataInicio);
        document.getElementById('dataFim').value = formatarDataParaInput(periodoAtual.dataFim);

        // Recarrega dashboard
        carregarDadosDashboard();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'aplicarPeriodoRapido', error);
    }
}

async function atualizarDashboard()
{
    try
    {
        await carregarDadosDashboard();
        AppToast.show('Verde', 'Dashboard atualizado!', 2000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'atualizarDashboard', error);
    }
}

// ========================================
// ESTATÍSTICAS GERAIS
// ========================================

async function carregarEstatisticasGerais()
{
    try
    {
        const response = await fetch(`/api/DashboardEventos/ObterEstatisticasGerais?` +
            `dataInicio=${periodoAtual.dataInicio.toISOString()}&` +
            `dataFim=${periodoAtual.dataFim.toISOString()}`);

        if (!response.ok) throw new Error('Erro ao carregar estatísticas gerais');

        const result = await response.json();

        if (result.success)
        {
            renderizarEstatisticasGerais(result);
        } else
        {
            console.error('Erro:', result.message);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'carregarEstatisticasGerais', error);
    }
}

function renderizarEstatisticasGerais(dados)
{
    try
    {
        // Cards principais
        document.getElementById('statTotalEventos').textContent = dados.totalEventos.toLocaleString();
        document.getElementById('statEventosAtivos').textContent = dados.eventosAtivos.toLocaleString();
        document.getElementById('statEventosConcluidos').textContent = dados.eventosConcluidos.toLocaleString();
        document.getElementById('statEventosCancelados').textContent = dados.eventosCancelados.toLocaleString();

        // Cards secundários
        document.getElementById('statTotalParticipantes').textContent = dados.totalParticipantes.toLocaleString();
        document.getElementById('statMediaParticipantes').textContent = dados.mediaParticipantesPorEvento.toLocaleString() + ' part.';

        // Variações vs período anterior
        calcularVariacao('totalEventos', dados.totalEventos, dados.periodoAnterior.totalEventos, 'variacaoTotalEventos');
        calcularVariacao('totalParticipantes', dados.totalParticipantes, dados.periodoAnterior.totalParticipantes, 'variacaoTotalParticipantes');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'renderizarEstatisticasGerais', error);
    }
}

function calcularVariacao(campo, valorAtual, valorAnterior, elementoId)
{
    try
    {
        const elemento = document.getElementById(elementoId);
        if (!elemento) return;

        if (valorAnterior === 0)
        {
            elemento.textContent = '—';
            elemento.className = 'variacao-metrica variacao-neutra';
            return;
        }

        const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100;
        const variacaoAbs = Math.abs(variacao);
        const sinal = variacao >= 0 ? '+' : '';

        elemento.textContent = `${sinal}${variacao.toFixed(1)}% vs anterior`;
        elemento.className = variacao >= 0 ?
            'variacao-metrica variacao-positiva' :
            'variacao-metrica variacao-negativa';
    } catch (error)
    {
        console.error('Erro ao calcular variação:', error);
    }
}

// ========================================
// EVENTOS POR STATUS
// ========================================

async function carregarEventosPorStatus()
{
    try
    {
        const response = await fetch(`/api/DashboardEventos/ObterEventosPorStatus?` +
            `dataInicio=${periodoAtual.dataInicio.toISOString()}&` +
            `dataFim=${periodoAtual.dataFim.toISOString()}`);

        if (!response.ok) throw new Error('Erro ao carregar eventos por status');

        const result = await response.json();

        if (result.success)
        {
            renderizarGraficoEventosPorStatus(result.dados);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'carregarEventosPorStatus', error);
    }
}

function renderizarGraficoEventosPorStatus(dados)
{
    try
    {
        const elemento = document.getElementById('chartEventosPorStatus');

        if (!elemento)
        {
            console.error('❌ Elemento #chartEventosPorStatus não encontrado no HTML!');
            return;
        }

        if (!dados || dados.length === 0)
        {
            console.warn('⚠️ Sem dados para renderizar gráfico de Status');
            elemento.innerHTML = '<div class="text-center p-4 text-muted">Sem dados disponíveis</div>';
            return;
        }

        if (chartEventosPorStatus)
        {
            chartEventosPorStatus.destroy();
            chartEventosPorStatus = null;
        }

        chartEventosPorStatus = new ej.charts.AccumulationChart({
            series: [{
                dataSource: dados,
                xName: 'status',
                yName: 'quantidade',
                innerRadius: '40%',
                dataLabel: {
                    visible: true,
                    position: 'Outside',
                    name: 'status'
                },
                palettes: ['#0D6EFD', '#16a34a', '#dc2626', '#f59e0b', '#667eea']
            }],
            legendSettings: { visible: true },
            tooltip: { enable: true }
        });

        chartEventosPorStatus.appendTo('#chartEventosPorStatus');
        console.log('✅ Gráfico de Status renderizado');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'renderizarGraficoEventosPorStatus', error);
    }
}

// ========================================
// EVENTOS POR SETOR
// ========================================

async function carregarEventosPorSetor()
{
    try
    {
        const response = await fetch(`/api/DashboardEventos/ObterEventosPorSetor?` +
            `dataInicio=${periodoAtual.dataInicio.toISOString()}&` +
            `dataFim=${periodoAtual.dataFim.toISOString()}`);

        if (!response.ok) throw new Error('Erro ao carregar eventos por setor');

        const result = await response.json();

        if (result.success)
        {
            renderizarGraficoEventosPorSetor(result.dados);
            renderizarTabelaSetores(result.dados);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'carregarEventosPorSetor', error);
    }
}

function renderizarGraficoEventosPorSetor(dados)
{
    try
    {
        const elemento = document.getElementById('chartEventosPorSetor');

        if (!elemento)
        {
            console.error('❌ Elemento #chartEventosPorSetor não encontrado no HTML!');
            return;
        }

        if (!dados || dados.length === 0)
        {
            console.warn('⚠️ Sem dados para renderizar gráfico de Setores');
            elemento.innerHTML = '<div class="text-center p-4 text-muted">Sem dados disponíveis</div>';
            return;
        }

        if (chartEventosPorSetor)
        {
            chartEventosPorSetor.destroy();
            chartEventosPorSetor = null;
        }

        chartEventosPorSetor = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category'
            },
            primaryYAxis: {
                title: 'Quantidade'
            },
            series: [{
                dataSource: dados,
                xName: 'setor',
                yName: 'quantidade',
                type: 'Column',
                name: 'Eventos',
                fill: '#667eea'
            }],
            legendSettings: { visible: false },
            tooltip: { enable: true }
        });

        chartEventosPorSetor.appendTo('#chartEventosPorSetor');
        console.log('✅ Gráfico de Setores renderizado');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'renderizarGraficoEventosPorSetor', error);
    }
}

function renderizarTabelaSetores(dados)
{
    try
    {
        const tbody = document.querySelector('#tabelaSetores tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        dados.forEach((item, index) =>
        {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.setor}</td>
                <td class="text-end">${item.quantidade}</td>
                <td class="text-end">${item.participantes.toLocaleString()}</td>
                <td class="text-end">${item.concluidos}</td>
                <td class="text-end">
                    <span class="badge bg-${item.taxaConclusao >= 70 ? 'success' : item.taxaConclusao >= 50 ? 'warning' : 'danger'}">
                        ${item.taxaConclusao.toFixed(1)}%
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'renderizarTabelaSetores', error);
    }
}

// ========================================
// EVENTOS POR REQUISITANTE
// ========================================

async function carregarEventosPorRequisitante()
{
    try
    {
        const response = await fetch(`/api/DashboardEventos/ObterEventosPorRequisitante?` +
            `dataInicio=${periodoAtual.dataInicio.toISOString()}&` +
            `dataFim=${periodoAtual.dataFim.toISOString()}`);

        if (!response.ok) throw new Error('Erro ao carregar eventos por requisitante');

        const result = await response.json();

        if (result.success)
        {
            renderizarTabelaRequisitantes(result.dados);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'carregarEventosPorRequisitante', error);
    }
}

function renderizarTabelaRequisitantes(dados)
{
    try
    {
        const tbody = document.querySelector('#tabelaRequisitantes tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        dados.forEach((item, index) =>
        {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.requisitante}</td>
                <td class="text-end">${item.quantidade}</td>
                <td class="text-end">${item.participantes.toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'renderizarTabelaRequisitantes', error);
    }
}

// ========================================
// EVENTOS POR MÊS
// ========================================

async function carregarEventosPorMes()
{
    try
    {
        const response = await fetch(`/api/DashboardEventos/ObterEventosPorMes?` +
            `dataInicio=${periodoAtual.dataInicio.toISOString()}&` +
            `dataFim=${periodoAtual.dataFim.toISOString()}`);

        if (!response.ok) throw new Error('Erro ao carregar eventos por mês');

        const result = await response.json();

        if (result.success)
        {
            renderizarGraficoEventosPorMes(result.dados);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'carregarEventosPorMes', error);
    }
}

function renderizarGraficoEventosPorMes(dados)
{
    try
    {
        const elemento = document.getElementById('chartEventosPorMes');

        if (!elemento)
        {
            console.error('❌ Elemento #chartEventosPorMes não encontrado no HTML!');
            return;
        }

        if (!dados || dados.length === 0)
        {
            console.warn('⚠️ Sem dados para renderizar gráfico Mensal');
            elemento.innerHTML = '<div class="text-center p-4 text-muted">Sem dados disponíveis</div>';
            return;
        }

        if (chartEventosPorMes)
        {
            chartEventosPorMes.destroy();
            chartEventosPorMes = null;
        }

        chartEventosPorMes = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: -45
            },
            primaryYAxis: {
                title: 'Quantidade de Eventos',
                labelFormat: '{value}'
            },
            series: [{
                dataSource: dados,
                xName: 'mesNome',
                yName: 'quantidade',
                type: 'Line',
                name: 'Eventos',
                marker: {
                    visible: true,
                    width: 8,
                    height: 8,
                    dataLabel: { visible: true, position: 'Top' }
                },
                width: 3,
                fill: '#0D6EFD'
            }],
            title: 'Evolução Mensal de Eventos',
            titleStyle: {
                fontFamily: 'Helvetica',
                fontWeight: '600',
                size: '14px'
            },
            tooltip: {
                enable: true,
                format: '${point.x}: ${point.y} eventos'
            },
            // CRÍTICO: Desabilita zoomSettings
            zoomSettings: {
                enableSelectionZooming: false,
                enablePinchZooming: false,
                enableMouseWheelZooming: false,
                enableDeferredZooming: false,
                enableScrollbar: false
            },
            enableAnimation: true
        });

        chartEventosPorMes.appendTo('#chartEventosPorMes');
        console.log('✅ Gráfico Mensal renderizado');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'renderizarGraficoEventosPorMes', error);
    }
}

// ========================================
// EVENTOS POR TIPO
// ========================================


// ========================================
// EVENTOS POR DIA
// ========================================

async function carregarEventosPorDia()
{
    try
    {
        const response = await fetch(`/api/DashboardEventos/ObterEventosPorDia?` +
            `dataInicio=${periodoAtual.dataInicio.toISOString()}&` +
            `dataFim=${periodoAtual.dataFim.toISOString()}`);

        if (!response.ok) throw new Error('Erro ao carregar eventos por dia');

        const result = await response.json();

        if (result.success)
        {
            // Pode renderizar um gráfico adicional se necessário
            console.log('✅ Eventos por dia carregados:', result.dados.length, 'dias');
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'carregarEventosPorDia', error);
    }
}

// ========================================
// EXPORTAÇÃO PDF
// ========================================

async function exportarParaPDF()
{
    try
    {
        console.log('📄 Iniciando exportação para PDF...');

        const dataInicio = periodoAtual.dataInicio.toISOString();
        const dataFim = periodoAtual.dataFim.toISOString();

        window.location.href = `/ExportarParaPDF?dataInicio=${dataInicio}&dataFim=${dataFim}`;

        AppToast.show('Verde', 'PDF gerado com sucesso!', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'exportarParaPDF', error);
    }
}

// ========================================
// EVENTOS DO DOCUMENT.READY
// ========================================

$(document).ready(function ()
{
    try
    {
        console.log('🚀 Dashboard de Eventos iniciando...');

        // Inicializa o dashboard
        inicializarDashboard();

        // Botão de atualizar dashboard
        $('#btnAtualizarDashboard').on('click', function ()
        {
            try
            {
                atualizarDashboard();
            } catch (error)
            {
                Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'click btnAtualizarDashboard', error);
            }
        });

        // Botão de exportar PDF
        $('#btnExportarPDF').on('click', function ()
        {
            try
            {
                exportarParaPDF();
            } catch (error)
            {
                Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'click btnExportarPDF', error);
            }
        });

        // Botões de período rápido
        $('#btn7Dias').on('click', function ()
        {
            try
            {
                aplicarPeriodoRapido(7);
            } catch (error)
            {
                Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'click btn7Dias', error);
            }
        });

        $('#btn15Dias').on('click', function ()
        {
            try
            {
                aplicarPeriodoRapido(15);
            } catch (error)
            {
                Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'click btn15Dias', error);
            }
        });

        $('#btn30Dias').on('click', function ()
        {
            try
            {
                aplicarPeriodoRapido(30);
            } catch (error)
            {
                Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'click btn30Dias', error);
            }
        });

        $('#btn90Dias').on('click', function ()
        {
            try
            {
                aplicarPeriodoRapido(90);
            } catch (error)
            {
                Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'click btn90Dias', error);
            }
        });

        $('#btn180Dias').on('click', function ()
        {
            try
            {
                aplicarPeriodoRapido(180);
            } catch (error)
            {
                Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'click btn180Dias', error);
            }
        });

        $('#btn1Ano').on('click', function ()
        {
            try
            {
                aplicarPeriodoRapido(365);
            } catch (error)
            {
                Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'click btn1Ano', error);
            }
        });

        console.log('✅ Dashboard de Eventos pronto!');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-eventos.js', 'document.ready', error);
    }
});
