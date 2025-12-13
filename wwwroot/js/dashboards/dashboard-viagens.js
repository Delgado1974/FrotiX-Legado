// ========================================
// DASHBOARD DE VIAGENS - FROTIX
// ========================================

// Paleta de Cores FrotiX
const CORES_FROTIX = {
    azul: '#0D47A1',
    verde: '#16a34a',
    laranja: '#d97706',
    amarelo: '#f59e0b',
    vermelho: '#dc2626',
    roxo: '#9d4edd',
    ciano: '#22d3ee',
    rosa: '#ec4899'
};

let periodoAtual = {
    dataInicio: null,
    dataFim: null
};

// Variáveis para armazenar gráficos
let chartViagensPorStatus = null;
let chartCustosPorTipo = null;

// Variáveis para PDFViewer
let pdfAtualBlob = null;
let pdfViewerInstance = null;

// ========================================
// INICIALIZAÇÃO
// ========================================

async function inicializarDashboard()
{
    try
    {
        // Define período padrão (últimos 30 dias)
        const hoje = new Date();
        periodoAtual.dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
        periodoAtual.dataInicio = new Date(periodoAtual.dataFim);
        periodoAtual.dataInicio.setDate(periodoAtual.dataInicio.getDate() - 30);

        // Inicializa campos de data HTML5
        inicializarCamposData();

        // Carrega dashboard
        await carregarDadosDashboard();

        AppToast.show('Verde', 'Dashboard carregado com sucesso!', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'inicializarDashboard', error);
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
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'inicializarCamposData', error);
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
            carregarViagensPorDia(),
            carregarViagensPorStatus(),
            carregarViagensPorMotorista(),
            carregarViagensPorVeiculo(),
            carregarCustosPorDia(),
            carregarCustosPorTipo(),
            carregarViagensPorFinalidade(),
            carregarKmPorVeiculo(),
            carregarViagensPorRequisitante(),
            carregarViagensPorSetor(),
            carregarCustosPorMotorista(),
            carregarCustosPorVeiculo(),
            carregarTop10ViagensMaisCaras(),
            carregarHeatmapViagens(),
            carregarTop10VeiculosKm(),
            carregarCustoMedioPorFinalidade()
        ]);

        const tempo = ((performance.now() - inicio) / 1000).toFixed(2);
        console.log(`✅ Dashboard carregado em ${tempo}s`);

        // Log de falhas
        const nomes = [
            'EstatisticasGerais', 'ViagensPorDia', 'ViagensPorStatus', 'ViagensPorMotorista',
            'ViagensPorVeiculo', 'CustosPorDia', 'CustosPorTipo', 'ViagensPorFinalidade',
            'KmPorVeiculo', 'ViagensPorRequisitante', 'ViagensPorSetor', 'CustosPorMotorista',
            'CustosPorVeiculo', 'Top10ViagensMaisCaras', 'HeatmapViagens', 'Top10VeiculosKm',
            'CustoMedioPorFinalidade'
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
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarDadosDashboard', error);
        esconderLoadingGeral();
    }
}

// ========================================
// ESTATÍSTICAS GERAIS
// ========================================

async function carregarEstatisticasGerais()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString()
        });

        const response = await fetch(`/api/DashboardViagens/ObterEstatisticasGerais?${params}`);
        const result = await response.json();

        if (result.success)
        {
            const data = result;

            // Atualiza cards principais - SEM CENTAVOS
            $('#statTotalViagens').text(data.totalViagens.toLocaleString('pt-BR'));
            $('#statViagensFinalizadas').text(data.viagensFinalizadas.toLocaleString('pt-BR'));
            $('#statCustoTotal').text('R$ ' + data.custoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
            $('#statCustoMedio').text('R$ ' + data.custoMedioPorViagem.toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
            $('#statKmTotal').text(data.kmTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' km');
            $('#statKmMedio').text(data.kmMedioPorViagem.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' km');
            $('#statViagensEmAndamento').text(data.viagensEmAndamento.toLocaleString('pt-BR'));
            $('#statViagensAgendadas').text(data.viagensAgendadas || 0);
            $('#statViagensCanceladas').text(data.viagensCanceladas.toLocaleString('pt-BR'));

            // Atualiza variações (se existirem dados do período anterior na API)
            if (data.periodoAnterior)
            {
                // Cards principais
                atualizarVariacao('variacaoCusto', data.custoTotal, data.periodoAnterior.custoTotal);
                atualizarVariacao('variacaoViagens', data.totalViagens, data.periodoAnterior.totalViagens);
                atualizarVariacao('variacaoCustoMedio', data.custoMedioPorViagem, data.periodoAnterior.custoMedioPorViagem);
                atualizarVariacao('variacaoKm', data.kmTotal, data.periodoAnterior.kmTotal);
                atualizarVariacao('variacaoKmMedio', data.kmMedioPorViagem, data.periodoAnterior.kmMedioPorViagem);

                // Cards de status
                atualizarVariacao('variacaoRealizadas', data.viagensFinalizadas, data.periodoAnterior.viagensFinalizadas);
                atualizarVariacao('variacaoAbertas', data.viagensEmAndamento, data.periodoAnterior.viagensEmAndamento);
                atualizarVariacao('variacaoAgendadas', data.viagensAgendadas, data.periodoAnterior.viagensAgendadas);
                atualizarVariacao('variacaoCanceladas', data.viagensCanceladas, data.periodoAnterior.viagensCanceladas);

                // Cards de custo por tipo
                atualizarVariacao('variacaoCustoCombustivel', data.custoCombustivel, data.periodoAnterior.custoCombustivel);
                atualizarVariacao('variacaoCustoVeiculo', data.custoVeiculo, data.periodoAnterior.custoVeiculo);
                atualizarVariacao('variacaoCustoMotorista', data.custoMotorista, data.periodoAnterior.custoMotorista);
                atualizarVariacao('variacaoCustoOperador', data.custoOperador, data.periodoAnterior.custoOperador);
                atualizarVariacao('variacaoCustoLavador', data.custoLavador, data.periodoAnterior.custoLavador);
            }
            else
            {
                // Se não houver dados do período anterior, deixa como neutro
                $('#variacaoCusto, #variacaoViagens, #variacaoCustoMedio, #variacaoKm, #variacaoKmMedio, #variacaoRealizadas, #variacaoAbertas, #variacaoAgendadas, #variacaoCanceladas, #variacaoCustoCombustivel, #variacaoCustoVeiculo, #variacaoCustoMotorista, #variacaoCustoOperador, #variacaoCustoLavador')
                    .text('-')
                    .removeClass('variacao-positiva variacao-negativa')
                    .addClass('variacao-neutra');
            }

            // Atualiza cards de custo por tipo - SEM CENTAVOS
            $('#statCustoCombustivel').text('R$ ' + (data.custoCombustivel || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
            $('#statCustoVeiculo').text('R$ ' + (data.custoVeiculo || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
            $('#statCustoMotorista').text('R$ ' + (data.custoMotorista || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
            $('#statCustoOperador').text('R$ ' + (data.custoOperador || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
            $('#statCustoLavador').text('R$ ' + (data.custoLavador || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarEstatisticasGerais', error);
    }
}

// ========================================
// VIAGENS POR DIA
// ========================================

async function carregarViagensPorDia()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString()
        });

        const response = await fetch(`/api/DashboardViagens/ObterViagensPorDia?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoViagensPorDia(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarViagensPorDia', error);
    }
}

function renderizarGraficoViagensPorDia(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                title: 'Dia da Semana'
            },
            primaryYAxis: {
                labelFormat: '{value}',
                title: 'Quantidade de Viagens'
            },
            series: [{
                dataSource: dados,
                xName: 'diaSemana',
                yName: 'total',
                name: 'Total',
                type: 'Column',
                cornerRadius: { topLeft: 10, topRight: 10 },
                fill: CORES_FROTIX.azul
            }],
            tooltip: {
                enable: true,
                format: '${point.x}: ${point.y} viagens'
            },
            legendSettings: { visible: false },
            height: '350px'
        });

        chart.appendTo('#chartViagensPorDia');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoViagensPorDia', error);
    }
}

// ========================================
// VIAGENS POR STATUS
// ========================================

async function carregarViagensPorStatus()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString()
        });

        const response = await fetch(`/api/DashboardViagens/ObterViagensPorStatus?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoViagensPorStatus(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarViagensPorStatus', error);
    }
}

function renderizarGraficoViagensPorStatus(dados)
{
    try
    {
        // Destroi gráfico anterior se existir
        if (chartViagensPorStatus)
        {
            chartViagensPorStatus.destroy();
            chartViagensPorStatus = null;
        }

        chartViagensPorStatus = new ej.charts.AccumulationChart({
            series: [{
                dataSource: dados,
                xName: 'status',
                yName: 'total',
                innerRadius: '40%',
                dataLabel: {
                    visible: true,
                    position: 'Outside',
                    name: 'status',
                    font: { fontWeight: '600' }
                }
            }],
            enableSmartLabels: true,
            legendSettings: {
                visible: true,
                position: 'Bottom'
            },
            tooltip: {
                enable: true,
                format: '${point.x}: ${point.y} viagens'
            },
            height: '350px'
        });

        chartViagensPorStatus.appendTo('#chartViagensPorStatus');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoViagensPorStatus', error);
    }
}

// ========================================
// VIAGENS POR MOTORISTA
// ========================================

async function carregarViagensPorMotorista()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString(),
            top: 10
        });

        const response = await fetch(`/api/DashboardViagens/ObterViagensPorMotorista?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoViagensPorMotorista(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarViagensPorMotorista', error);
    }
}

function renderizarGraficoViagensPorMotorista(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: -45,
                labelIntersectAction: 'Rotate45'
            },
            primaryYAxis: {
                labelFormat: '{value}',
                title: 'Quantidade de Viagens'
            },
            series: [{
                dataSource: dados,
                xName: 'motorista',
                yName: 'totalViagens',
                type: 'Column',
                name: 'Viagens',
                cornerRadius: { topLeft: 10, topRight: 10 },
                fill: CORES_FROTIX.ciano
            }],
            tooltip: {
                enable: true,
                format: '${point.x}: ${point.y} viagens'
            },
            legendSettings: { visible: false },
            height: '350px'
        });

        chart.appendTo('#chartViagensPorMotorista');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoViagensPorMotorista', error);
    }
}

// ========================================
// VIAGENS POR VEÍCULO
// ========================================

async function carregarViagensPorVeiculo()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString(),
            top: 10
        });

        const response = await fetch(`/api/DashboardViagens/ObterViagensPorVeiculo?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoViagensPorVeiculo(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarViagensPorVeiculo', error);
    }
}

function renderizarGraficoViagensPorVeiculo(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: -45,
                labelIntersectAction: 'Rotate45'
            },
            primaryYAxis: {
                labelFormat: '{value}',
                title: 'Quantidade de Viagens'
            },
            series: [{
                dataSource: dados,
                xName: 'veiculo',
                yName: 'totalViagens',
                type: 'Column',
                name: 'Viagens',
                cornerRadius: { topLeft: 10, topRight: 10 },
                fill: CORES_FROTIX.laranja
            }],
            tooltip: {
                enable: true,
                format: '${point.x}: ${point.y} viagens'
            },
            legendSettings: { visible: false },
            height: '350px'
        });

        chart.appendTo('#chartViagensPorVeiculo');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoViagensPorVeiculo', error);
    }
}

// ========================================
// CUSTOS POR DIA
// ========================================

async function carregarCustosPorDia()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString()
        });

        const response = await fetch(`/api/DashboardViagens/ObterCustosPorDia?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoCustosPorDia(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarCustosPorDia', error);
    }
}

function renderizarGraficoCustosPorDia(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'DateTime',
                labelFormat: 'dd/MM',
                intervalType: 'Days',
                edgeLabelPlacement: 'Shift'
            },
            primaryYAxis: {
                labelFormat: 'R$ {value}',
                title: 'Custos (R$)',
                minimum: 0
            },
            series: [{
                dataSource: dados.map(d => ({
                    x: new Date(d.data),
                    y: (d.combustivel || 0) + (d.veiculo || 0) + (d.motorista || 0) + (d.operador || 0) + (d.lavador || 0)
                })),
                xName: 'x',
                yName: 'y',
                name: 'Custo Total',
                type: 'Area',
                opacity: 0.5,
                fill: CORES_FROTIX.azul,
                border: { width: 2, color: CORES_FROTIX.azul }
            }],
            tooltip: {
                enable: true,
                format: 'R$ ${point.y}'
            },
            legendSettings: { visible: false },
            height: '350px'
        });

        chart.appendTo('#chartCustosPorDia');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoCustosPorDia', error);
    }
}

// ========================================
// CUSTOS POR TIPO
// ========================================

async function carregarCustosPorTipo()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString()
        });

        const response = await fetch(`/api/DashboardViagens/ObterCustosPorTipo?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoCustosPorTipo(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarCustosPorTipo', error);
    }
}

function renderizarGraficoCustosPorTipo(dados)
{
    try
    {
        // Destroi gráfico anterior se existir
        if (chartCustosPorTipo)
        {
            chartCustosPorTipo.destroy();
            chartCustosPorTipo = null;
        }

        chartCustosPorTipo = new ej.charts.AccumulationChart({
            series: [{
                dataSource: dados,
                xName: 'tipo',
                yName: 'custo',
                dataLabel: {
                    visible: true,
                    position: 'Outside',
                    name: 'tipo',
                    font: { fontWeight: '600' }
                }
            }],
            enableSmartLabels: true,
            legendSettings: {
                visible: true,
                position: 'Bottom'
            },
            tooltip: {
                enable: true,
                format: '${point.x}: R$ ${point.y}'
            },
            height: '350px'
        });

        chartCustosPorTipo.appendTo('#chartCustosPorTipo');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoCustosPorTipo', error);
    }
}

// ========================================
// VIAGENS POR FINALIDADE
// ========================================

async function carregarViagensPorFinalidade()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString(),
            top: 10
        });

        const response = await fetch(`/api/DashboardViagens/ObterViagensPorFinalidade?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoViagensPorFinalidade(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarViagensPorFinalidade', error);
    }
}

function renderizarGraficoViagensPorFinalidade(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: -45,
                labelIntersectAction: 'Rotate45'
            },
            primaryYAxis: {
                labelFormat: '{value}',
                title: 'Quantidade de Viagens'
            },
            series: [{
                dataSource: dados,
                xName: 'finalidade',
                yName: 'total',
                type: 'Column',
                name: 'Viagens',
                cornerRadius: { topLeft: 10, topRight: 10 },
                fill: CORES_FROTIX.verde
            }],
            tooltip: {
                enable: true,
                format: '${point.x}: ${point.y} viagens'
            },
            legendSettings: { visible: false },
            height: '420px'
        });

        chart.appendTo('#chartViagensPorFinalidade');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoViagensPorFinalidade', error);
    }
}

// ========================================
// KM POR VEÍCULO
// ========================================

async function carregarKmPorVeiculo()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString(),
            top: 10
        });

        const response = await fetch(`/api/DashboardViagens/ObterKmPorVeiculo?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoKmPorVeiculo(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarKmPorVeiculo', error);
    }
}

function renderizarGraficoKmPorVeiculo(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: 0,
                labelIntersectAction: 'Trim',
                maximumLabelWidth: 120
            },
            primaryYAxis: {
                labelFormat: '{value} km',
                title: 'Quilometragem'
            },
            series: [{
                dataSource: dados,
                xName: 'veiculo',
                yName: 'kmTotal',
                type: 'Bar',
                name: 'KM',
                cornerRadius: { topRight: 10, bottomRight: 10 },
                fill: CORES_FROTIX.roxo
            }],
            tooltip: {
                enable: true,
                format: '${point.x}: ${point.y} km'
            },
            legendSettings: { visible: false },
            height: '420px'
        });

        chart.appendTo('#chartKmPorVeiculo');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoKmPorVeiculo', error);
    }
}

// ========================================
// VIAGENS POR REQUISITANTE
// ========================================

async function carregarViagensPorRequisitante()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString(),
            top: 6
        });

        const response = await fetch(`/api/DashboardViagens/ObterViagensPorRequisitante?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoViagensPorRequisitante(result.data);

            // Atualiza linha com total Ctran se existir
            if (result.viagensCtran !== undefined)
            {
                $('#infoViagensCtranRequisitante').text(`Viagens Ctran: ${result.viagensCtran.toLocaleString('pt-BR')}`);
                $('#footerRequisitante').removeClass('d-none');
            }
            else
            {
                $('#footerRequisitante').addClass('d-none');
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarViagensPorRequisitante', error);
    }
}

function renderizarGraficoViagensPorRequisitante(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: 0,
                labelIntersectAction: 'Trim',
                maximumLabelWidth: 100
            },
            primaryYAxis: {
                labelFormat: '{value}',
                title: 'Quantidade de Viagens'
            },
            series: [{
                dataSource: dados,
                xName: 'requisitante',
                yName: 'totalViagens',
                type: 'Bar',
                name: 'Viagens',
                cornerRadius: { topRight: 10, bottomRight: 10 },
                fill: CORES_FROTIX.rosa
            }],
            tooltip: {
                enable: true,
                format: '${point.x}: ${point.y} viagens'
            },
            legendSettings: { visible: false },
            height: '280px'
        });

        chart.appendTo('#chartViagensPorRequisitante');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoViagensPorRequisitante', error);
    }
}

// ========================================
// VIAGENS POR SETOR
// ========================================

async function carregarViagensPorSetor()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString(),
            top: 6
        });

        const response = await fetch(`/api/DashboardViagens/ObterViagensPorSetor?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoViagensPorSetor(result.data);

            // Atualiza linha com total Ctran se existir
            if (result.viagensCtran !== undefined)
            {
                $('#infoViagensCtranSetor').text(`Viagens Ctran: ${result.viagensCtran.toLocaleString('pt-BR')}`);
                $('#footerSetor').removeClass('d-none');
            }
            else
            {
                $('#footerSetor').addClass('d-none');
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarViagensPorSetor', error);
    }
}

function renderizarGraficoViagensPorSetor(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: 0,
                labelIntersectAction: 'Trim',
                maximumLabelWidth: 100
            },
            primaryYAxis: {
                labelFormat: '{value}',
                title: 'Quantidade de Viagens'
            },
            series: [{
                dataSource: dados,
                xName: 'setor',
                yName: 'totalViagens',
                type: 'Bar',
                name: 'Viagens',
                cornerRadius: { topRight: 10, bottomRight: 10 },
                fill: CORES_FROTIX.amarelo
            }],
            tooltip: {
                enable: true,
                format: '${point.x}: ${point.y} viagens'
            },
            legendSettings: { visible: false },
            height: '280px'
        });

        chart.appendTo('#chartViagensPorSetor');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoViagensPorSetor', error);
    }
}

// ========================================
// CUSTOS POR MOTORISTA
// ========================================

async function carregarCustosPorMotorista()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString(),
            top: 10
        });

        const response = await fetch(`/api/DashboardViagens/ObterCustosPorMotorista?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoCustosPorMotorista(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarCustosPorMotorista', error);
    }
}

function renderizarGraficoCustosPorMotorista(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: -45,
                labelIntersectAction: 'Rotate45'
            },
            primaryYAxis: {
                labelFormat: 'R$ {value}',
                title: 'Custo Total (R$)'
            },
            series: [{
                dataSource: dados,
                xName: 'motorista',
                yName: 'custoTotal',
                type: 'Column',
                name: 'Custo',
                cornerRadius: { topLeft: 10, topRight: 10 },
                fill: CORES_FROTIX.vermelho
            }],
            tooltip: {
                enable: true,
                format: '${point.x}: R$ ${point.y}'
            },
            legendSettings: { visible: false },
            height: '350px'
        });

        chart.appendTo('#chartCustosPorMotorista');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoCustosPorMotorista', error);
    }
}

// ========================================
// CUSTOS POR VEÍCULO
// ========================================

async function carregarCustosPorVeiculo()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString(),
            top: 10
        });

        const response = await fetch(`/api/DashboardViagens/ObterCustosPorVeiculo?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarGraficoCustosPorVeiculo(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarCustosPorVeiculo', error);
    }
}

function renderizarGraficoCustosPorVeiculo(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: -45,
                labelIntersectAction: 'Rotate45'
            },
            primaryYAxis: {
                labelFormat: 'R$ {value}',
                title: 'Custo Total (R$)'
            },
            series: [{
                dataSource: dados,
                xName: 'veiculo',
                yName: 'custoTotal',
                type: 'Column',
                name: 'Custo',
                cornerRadius: { topLeft: 10, topRight: 10 },
                fill: CORES_FROTIX.azul
            }],
            tooltip: {
                enable: true,
                format: '${point.x}: R$ ${point.y}'
            },
            legendSettings: { visible: false },
            height: '350px'
        });

        chart.appendTo('#chartCustosPorVeiculo');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarGraficoCustosPorVeiculo', error);
    }
}

// ========================================
// TOP 10 VIAGENS MAIS CARAS
// ========================================

async function carregarTop10ViagensMaisCaras()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString()
        });

        const response = await fetch(`/api/DashboardViagens/ObterTop10ViagensMaisCaras?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarTabelaTop10(result.data);
        } else
        {
            $('#tabelaTop10Body').html('<tr><td colspan="7" class="text-center">Nenhuma viagem encontrada</td></tr>');
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarTop10ViagensMaisCaras', error);
    }
}

function renderizarTabelaTop10(dados)
{
    try
    {
        let html = '';

        dados.forEach((viagem, index) =>
        {
            html += `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${viagem.noFichaVistoria}</td>
                    <td>${viagem.dataInicial}</td>
                    <td>${viagem.dataFinal}</td>
                    <td>${viagem.motorista}</td>
                    <td>${viagem.veiculo}</td>
                    <td class="text-end text-success fw-bold">R$ ${viagem.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        });

        $('#tabelaTop10Body').html(html);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarTabelaTop10', error);
    }
}

// ========================================
// HEATMAP DE VIAGENS (Dia x Hora)
// ========================================

async function carregarHeatmapViagens()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString()
        });

        const response = await fetch(`/api/DashboardViagens/ObterHeatmapViagens?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarHeatmapViagens(result.data, result.maxValor);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarHeatmapViagens', error);
    }
}

function renderizarHeatmapViagens(dados, maxValor)
{
    try
    {
        const tbody = document.getElementById('heatmapBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Função para obter cor baseada na intensidade
        function obterCorHeatmap(valor, max)
        {
            if (max === 0 || valor === 0) return '#f5f5f5';

            const intensidade = valor / max;

            if (intensidade <= 0.2) return '#e8f5e9';
            if (intensidade <= 0.4) return '#c8e6c9';
            if (intensidade <= 0.6) return '#81c784';
            if (intensidade <= 0.8) return '#4caf50';
            return '#2e7d32';
        }

        // Criar linhas para cada dia
        dados.forEach(dia =>
        {
            const tr = document.createElement('tr');

            // Célula do dia da semana
            const tdDia = document.createElement('td');
            tdDia.className = 'fw-bold text-center';
            tdDia.textContent = dia.diaSemana;
            tr.appendChild(tdDia);

            // Células das horas (0-23)
            dia.horas.forEach((quantidade, hora) =>
            {
                const td = document.createElement('td');
                td.className = 'text-center';
                td.style.backgroundColor = obterCorHeatmap(quantidade, maxValor);
                td.style.color = quantidade > (maxValor * 0.6) ? 'white' : '#333';
                td.style.fontWeight = quantidade > 0 ? '600' : 'normal';
                td.style.cursor = 'pointer';
                td.style.transition = 'transform 0.2s';
                td.textContent = quantidade > 0 ? quantidade : '';
                td.title = `${dia.diaSemana} ${hora.toString().padStart(2, '0')}:00 - ${quantidade} viagem(s)`;

                // Efeito hover
                td.addEventListener('mouseenter', function ()
                {
                    this.style.transform = 'scale(1.1)';
                    this.style.zIndex = '10';
                });
                td.addEventListener('mouseleave', function ()
                {
                    this.style.transform = 'scale(1)';
                    this.style.zIndex = '1';
                });

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarHeatmapViagens', error);
    }
}

// ========================================
// TOP 10 VEÍCULOS POR KM RODADO
// ========================================

async function carregarTop10VeiculosKm()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString()
        });

        const response = await fetch(`/api/DashboardViagens/ObterTop10VeiculosPorKm?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarTop10VeiculosKm(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarTop10VeiculosKm', error);
    }
}

function renderizarTop10VeiculosKm(dados)
{
    try
    {
        // Preparar dados com label combinado (placa + modelo)
        const dadosFormatados = dados.map(d => ({
            veiculo: d.placa,
            totalKm: d.totalKm,
            tooltip: `${d.placa} - ${d.marcaModelo}\n${d.totalViagens} viagens | Média: ${d.mediaKmPorViagem} km/viagem`
        }));

        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: 0,
                labelIntersectAction: 'Trim',
                maximumLabelWidth: 80
            },
            primaryYAxis: {
                labelFormat: '{value} km',
                title: 'Quilometragem Total'
            },
            series: [{
                dataSource: dadosFormatados,
                xName: 'veiculo',
                yName: 'totalKm',
                type: 'Bar',
                name: 'KM Rodado',
                cornerRadius: { topRight: 8, bottomRight: 8 },
                fill: CORES_FROTIX.verde
            }],
            tooltip: {
                enable: true,
                format: '${point.x}: ${point.y} km'
            },
            legendSettings: { visible: false },
            height: '380px'
        });

        chart.appendTo('#chartTop10VeiculosKm');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarTop10VeiculosKm', error);
    }
}

// ========================================
// CUSTO MÉDIO POR FINALIDADE
// ========================================

async function carregarCustoMedioPorFinalidade()
{
    try
    {
        const params = new URLSearchParams({
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString(),
            top: 10
        });

        const response = await fetch(`/api/DashboardViagens/ObterCustoMedioPorFinalidade?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0)
        {
            renderizarCustoMedioPorFinalidade(result.data);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarCustoMedioPorFinalidade', error);
    }
}

function renderizarCustoMedioPorFinalidade(dados)
{
    try
    {
        const chart = new ej.charts.Chart({
            primaryXAxis: {
                valueType: 'Category',
                labelRotation: 0,
                labelIntersectAction: 'Trim',
                maximumLabelWidth: 120
            },
            primaryYAxis: {
                labelFormat: 'R$ {value}',
                title: 'Custo Total (R$)'
            },
            axes: [{
                name: 'yAxisMedio',
                opposedPosition: true,
                labelFormat: 'R$ {value}',
                title: 'Custo Médio (R$)'
            }],
            series: [
                {
                    dataSource: dados,
                    xName: 'finalidade',
                    yName: 'custoTotal',
                    type: 'Bar',
                    name: 'Custo Total',
                    cornerRadius: { topRight: 8, bottomRight: 8 },
                    fill: CORES_FROTIX.vermelho,
                    opacity: 0.8
                },
                {
                    dataSource: dados,
                    xName: 'finalidade',
                    yName: 'custoMedio',
                    type: 'Line',
                    name: 'Custo Médio',
                    yAxisName: 'yAxisMedio',
                    marker: {
                        visible: true,
                        width: 10,
                        height: 10,
                        fill: CORES_FROTIX.azul
                    },
                    fill: CORES_FROTIX.azul,
                    width: 3
                }
            ],
            tooltip: {
                enable: true,
                shared: true
            },
            legendSettings: {
                visible: true,
                position: 'Top'
            },
            height: '380px'
        });

        chart.appendTo('#chartCustoMedioPorFinalidade');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'renderizarCustoMedioPorFinalidade', error);
    }
}

// ========================================
// FILTROS
// ========================================

function aplicarFiltroPeriodo(dias)
{
    try
    {
        const hoje = new Date();
        periodoAtual.dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
        periodoAtual.dataInicio = new Date(periodoAtual.dataFim);
        periodoAtual.dataInicio.setDate(periodoAtual.dataInicio.getDate() - dias);

        // Atualiza campos HTML5
        const dataInicio = document.getElementById('dataInicio');
        const dataFim = document.getElementById('dataFim');
        if (dataInicio && dataFim)
        {
            dataInicio.value = formatarDataParaInput(periodoAtual.dataInicio);
            dataFim.value = formatarDataParaInput(periodoAtual.dataFim);
        }

        carregarDadosDashboard();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'aplicarFiltroPeriodo', error);
    }
}

function aplicarFiltroPersonalizado()
{
    try
    {
        const dataInicioInput = document.getElementById('dataInicio');
        const dataFimInput = document.getElementById('dataFim');

        if (!dataInicioInput?.value || !dataFimInput?.value)
        {
            AppToast.show('Amarelo', 'Preencha as datas De e Até para filtrar.', 3000);
            return;
        }

        const dataInicio = new Date(dataInicioInput.value + 'T00:00:00');
        const dataFim = new Date(dataFimInput.value + 'T23:59:59');

        if (dataInicio > dataFim)
        {
            AppToast.show('Vermelho', 'A data inicial não pode ser maior que a data final.', 3000);
            return;
        }

        periodoAtual.dataInicio = dataInicio;
        periodoAtual.dataFim = dataFim;

        // Remove classe active de todos os botões de período
        $('.btn-period').removeClass('active');

        carregarDadosDashboard();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'aplicarFiltroPersonalizado', error);
    }
}

function atualizarDashboard()
{
    try
    {
        // Atualiza variáveis de período antes de recarregar
        const dataInicio = document.getElementById('dataInicio');
        const dataFim = document.getElementById('dataFim');

        if (dataInicio && dataFim && dataInicio.value && dataFim.value)
        {
            periodoAtual.dataInicio = new Date(dataInicio.value + 'T00:00:00');
            periodoAtual.dataFim = new Date(dataFim.value + 'T23:59:59');
        }

        carregarDadosDashboard();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'atualizarDashboard', error);
    }
}

// ========================================
// LOADING
// ========================================

function mostrarLoadingGeral()
{
    try
    {
        const elemento = document.getElementById('loadingDashboard');
        if (!elemento)
        {
            console.error('❌ Elemento #loadingDashboard não existe!');
            return;
        }

        // Remove classe
        elemento.classList.remove('d-none');

        // FORÇA com setAttribute (mais forte que .css())
        elemento.setAttribute('style',
            'display: flex !important; ' +
            'visibility: visible !important; ' +
            'opacity: 1 !important; ' +
            'position: fixed !important; ' +
            'top: 0 !important; ' +
            'left: 0 !important; ' +
            'right: 0 !important; ' +
            'bottom: 0 !important; ' +
            'z-index: 99999 !important; ' +
            'background-color: rgba(255, 255, 255, 0.9) !important; ' +
            'justify-content: center !important; ' +
            'align-items: center !important;'
        );
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'mostrarLoadingGeral', error);
    }
}

function esconderLoadingGeral()
{
    try
    {
        // Pequeno delay para suavizar a transição (800ms em vez de instantâneo)
        setTimeout(() =>
        {
            const elemento = document.getElementById('loadingDashboard');
            if (elemento)
            {
                elemento.classList.add('d-none');
                elemento.removeAttribute('style'); // Remove estilos inline forçados
            }
        }, 800);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'esconderLoadingGeral', error);
    }
}

// ========================================
// CÁLCULO DE VARIAÇÕES
// ========================================

function atualizarVariacao(elementoId, valorAtual, valorAnterior)
{
    try
    {
        const elemento = $(`#${elementoId}`);

        if (!valorAnterior || valorAnterior === 0)
        {
            elemento.text('-').removeClass('variacao-positiva variacao-negativa').addClass('variacao-neutra');
            return;
        }

        const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100;
        const sinal = variacao >= 0 ? '+' : '';
        const texto = `${sinal}${variacao.toFixed(2)}% vs período anterior`;

        elemento.text(texto);

        if (variacao > 0)
        {
            elemento.removeClass('variacao-negativa variacao-neutra').addClass('variacao-positiva');
        }
        else if (variacao < 0)
        {
            elemento.removeClass('variacao-positiva variacao-neutra').addClass('variacao-negativa');
        }
        else
        {
            elemento.removeClass('variacao-positiva variacao-negativa').addClass('variacao-neutra');
        }
    } catch (error)
    {
        console.error('Erro ao atualizar variação:', error);
    }
}

// ========================================
// EXPORTAÇÃO PARA PDF
// ========================================

// ========================================
// EXPORTAÇÃO PARA PDF
// ========================================

/**
 * Exporta o Dashboard para PDF e exibe em Modal com PDFViewer
 */
/**
 * Exporta o dashboard para PDF capturando gráficos E cards visuais
 * Envia via POST para /Viagens/ExportarParaPDF
 */
async function exportarParaPDF()
{
    try
    {
        console.log('🚀 ===== INICIANDO EXPORTAÇÃO PARA PDF =====');

        // Valida período
        if (!periodoAtual.dataInicio || !periodoAtual.dataFim)
        {
            console.error('❌ Período inválido!');
            AppToast.show('Amarelo', 'Por favor, selecione um período válido.', 3000);
            return;
        }
        console.log('✅ Período válido:', periodoAtual);

        // Toast de aguarde
        AppToast.show('Amarelo', 'Capturando gráficos, cards e gerando PDF, aguarde...', 8000);

        // 📊 Captura todos os gráficos como Base64 PNG
        console.log('📊 Iniciando captura de gráficos...');
        const graficos = await capturarGraficos();
        console.log('📊 Gráficos capturados:', Object.keys(graficos).length);

        // 🎨 Captura todos os cards visuais como Base64 PNG
        console.log('🎨 Iniciando captura de cards...');
        const cards = await capturarCards();
        console.log('🎨 Cards capturados:', Object.keys(cards).filter(k => cards[k]).length);

        // Formata datas
        const dataInicio = periodoAtual.dataInicio.toISOString();
        const dataFim = periodoAtual.dataFim.toISOString();
        console.log('📅 Datas formatadas:', { dataInicio, dataFim });

        // 🔍 DIAGNÓSTICO: Calcular tamanho do payload
        const payload = {
            dataInicio: dataInicio,
            dataFim: dataFim,
            graficos: graficos,
            cards: cards
        };
        const payloadJSON = JSON.stringify(payload);
        const tamanhoMB = (payloadJSON.length / 1024 / 1024).toFixed(2);
        console.log('📦 Tamanho total do payload:', tamanhoMB, 'MB');
        console.log('📦 Tamanho por componente:');
        console.log('   📊 Gráficos:');
        for (const [key, base64] of Object.entries(graficos))
        {
            const tamanhoKB = (base64.length / 1024).toFixed(1);
            console.log(`      - ${key}: ${tamanhoKB} KB`);
        }
        console.log('   🎨 Cards:');
        for (const [key, base64] of Object.entries(cards))
        {
            if (base64)
            {
                const tamanhoKB = (base64.length / 1024).toFixed(1);
                console.log(`      - ${key}: ${tamanhoKB} KB`);
            }
        }

        // Verifica se payload está muito grande (> 30MB)
        if (parseFloat(tamanhoMB) > 30)
        {
            console.error('❌ PAYLOAD MUITO GRANDE! ASP.NET Core tem limite de 30MB por padrão.');
            AppToast.show('Vermelho', 'Payload muito grande. Contate o administrador.', 5000);
            return;
        }

        // Envia via POST
        console.log('📤 Enviando POST para /Viagens/ExportarParaPDF...');
        const response = await fetch('/Viagens/ExportarParaPDF', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dataInicio: dataInicio,
                dataFim: dataFim,
                graficos: graficos,
                cards: cards
            })
        });

        console.log('📥 Resposta recebida:', response);
        console.log('   Status:', response.status, response.statusText);

        if (!response.ok)
        {
            const errorText = await response.text();
            console.error('❌ Erro na resposta:', errorText);
            throw new Error(`Erro ao gerar PDF: ${errorText}`);
        }

        // Converte resposta para Blob
        console.log('🔄 Convertendo resposta para Blob...');
        pdfAtualBlob = await response.blob();
        console.log('✅ Blob criado:', pdfAtualBlob.size, 'bytes');

        // Converte Blob para Base64
        console.log('🔄 Convertendo Blob para Base64...');
        const reader = new FileReader();
        reader.onloadend = function ()
        {
            console.log('✅ Base64 criado:', reader.result.substring(0, 100) + '...');
            const base64PDF = reader.result;

            // Abre o modal
            console.log('🖥️ Abrindo modal...');
            const modal = new bootstrap.Modal(document.getElementById('modalPDFViewer'));
            modal.show();

            // Aguarda o modal abrir completamente antes de carregar o PDF
            $('#modalPDFViewer').one('shown.bs.modal', function ()
            {
                console.log('✅ Modal aberto, carregando PDF no viewer...');
                carregarPDFNoViewer(base64PDF);
            });

            // Toast de sucesso
            AppToast.show('Verde', 'PDF gerado com sucesso!', 3000);
            console.log('🎉 ===== EXPORTAÇÃO CONCLUÍDA COM SUCESSO =====');
        };

        reader.onerror = function (error)
        {
            console.error('❌ Erro ao ler Blob:', error);
        };

        reader.readAsDataURL(pdfAtualBlob);
    } catch (error)
    {
        console.error('❌ ===== ERRO NA EXPORTAÇÃO =====');
        console.error('Erro:', error);
        console.error('Stack:', error.stack);
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'exportarParaPDF', error);
    }
}

/**
 * Carrega o PDF no PDFViewer Syncfusion
 */
function carregarPDFNoViewer(base64PDF)
{
    try
    {
        // Se já existe uma instância, destroi
        if (pdfViewerInstance)
        {
            pdfViewerInstance.destroy();
        }

        // Cria nova instância do PDFViewer
        pdfViewerInstance = new ej.pdfviewer.PdfViewer({
            documentPath: base64PDF,
            serviceUrl: 'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer',
            enableToolbar: true,
            enableNavigationToolbar: true,
            enableThumbnail: true,
            zoomMode: 'FitToWidth',
            locale: 'pt-BR',
            documentLoad: function ()
            {
                console.log('✅ PDF carregado no viewer');

                // Ajusta zoom para FitToWidth
                setTimeout(() =>
                {
                    if (pdfViewerInstance)
                    {
                        pdfViewerInstance.magnification.fitToWidth();
                    }
                }, 500);
            }
        });

        // Renderiza o viewer no container
        pdfViewerInstance.appendTo('#pdfViewerContainer');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'carregarPDFNoViewer', error);
    }
}

/**
 * Baixa o PDF quando o usuário clicar no botão Baixar
 */
function baixarPDF()
{
    try
    {
        if (!pdfAtualBlob)
        {
            AppToast.show('Amarelo', 'Nenhum PDF disponível para download.', 3000);
            return;
        }

        const url = window.URL.createObjectURL(pdfAtualBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Dashboard_Viagens_${periodoAtual.dataInicio.toLocaleDateString('pt-BR').replace(/\//g, '-')}_a_${periodoAtual.dataFim.toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        AppToast.show('Verde', 'PDF baixado com sucesso!', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'baixarPDF', error);
    }
}

/**
 * Captura todos os gráficos como Base64
 */
async function capturarGraficos()
{
    try
    {
        console.log('🎯 INICIANDO CAPTURA DE GRÁFICOS...');

        const graficos = {};

        // Captura gráfico de Status (Pizza)
        console.log('🔍 Verificando gráfico de Status...');
        console.log('chartViagensPorStatus:', chartViagensPorStatus);
        if (chartViagensPorStatus)
        {
            console.log('✅ chartViagensPorStatus existe, capturando...');
            graficos.status = await exportarGraficoSyncfusion(chartViagensPorStatus, 'status');
            console.log('📊 Status capturado:', graficos.status ? 'SIM' : 'NÃO');
        }
        else
        {
            console.warn('⚠️ chartViagensPorStatus não existe!');
        }

        // Captura gráfico de Motoristas
        console.log('🔍 Verificando gráfico de Motoristas...');
        const chartMotoristas = document.querySelector('#chartViagensPorMotorista');
        console.log('Elemento #chartViagensPorMotorista:', chartMotoristas);
        if (chartMotoristas && chartMotoristas.ej2_instances && chartMotoristas.ej2_instances[0])
        {
            console.log('✅ Motoristas existe, capturando...');
            graficos.motoristas = await exportarGraficoSyncfusion(chartMotoristas.ej2_instances[0], 'motoristas');
            console.log('📊 Motoristas capturado:', graficos.motoristas ? 'SIM' : 'NÃO');
        }
        else
        {
            console.warn('⚠️ chartViagensPorMotorista não encontrado ou sem instância!');
        }

        // Captura gráfico de Veículos
        console.log('🔍 Verificando gráfico de Veículos...');
        const chartVeiculos = document.querySelector('#chartViagensPorVeiculo');
        console.log('Elemento #chartViagensPorVeiculo:', chartVeiculos);
        if (chartVeiculos && chartVeiculos.ej2_instances && chartVeiculos.ej2_instances[0])
        {
            console.log('✅ Veículos existe, capturando...');
            graficos.veiculos = await exportarGraficoSyncfusion(chartVeiculos.ej2_instances[0], 'veiculos');
            console.log('📊 Veículos capturado:', graficos.veiculos ? 'SIM' : 'NÃO');
        }
        else
        {
            console.warn('⚠️ chartViagensPorVeiculo não encontrado ou sem instância!');
        }

        // Captura gráfico de Finalidades
        console.log('🔍 Verificando gráfico de Finalidades...');
        const chartFinalidades = document.querySelector('#chartViagensPorFinalidade');
        console.log('Elemento #chartViagensPorFinalidade:', chartFinalidades);
        if (chartFinalidades && chartFinalidades.ej2_instances && chartFinalidades.ej2_instances[0])
        {
            console.log('✅ Finalidades existe, capturando...');
            graficos.finalidades = await exportarGraficoSyncfusion(chartFinalidades.ej2_instances[0], 'finalidades');
            console.log('📊 Finalidades capturado:', graficos.finalidades ? 'SIM' : 'NÃO');
        }
        else
        {
            console.warn('⚠️ chartViagensPorFinalidade não encontrado ou sem instância!');
        }

        // Captura gráfico de Requisitantes
        console.log('🔍 Verificando gráfico de Requisitantes...');
        const chartRequisitantes = document.querySelector('#chartViagensPorRequisitante');
        console.log('Elemento #chartViagensPorRequisitante:', chartRequisitantes);
        if (chartRequisitantes && chartRequisitantes.ej2_instances && chartRequisitantes.ej2_instances[0])
        {
            console.log('✅ Requisitantes existe, capturando...');
            graficos.requisitantes = await exportarGraficoSyncfusion(chartRequisitantes.ej2_instances[0], 'requisitantes');
            console.log('📊 Requisitantes capturado:', graficos.requisitantes ? 'SIM' : 'NÃO');
        }
        else
        {
            console.warn('⚠️ chartViagensPorRequisitante não encontrado ou sem instância!');
        }

        // Captura gráfico de Setores
        console.log('🔍 Verificando gráfico de Setores...');
        const chartSetores = document.querySelector('#chartViagensPorSetor');
        console.log('Elemento #chartViagensPorSetor:', chartSetores);
        if (chartSetores && chartSetores.ej2_instances && chartSetores.ej2_instances[0])
        {
            console.log('✅ Setores existe, capturando...');
            graficos.setores = await exportarGraficoSyncfusion(chartSetores.ej2_instances[0], 'setores');
            console.log('📊 Setores capturado:', graficos.setores ? 'SIM' : 'NÃO');
        }
        else
        {
            console.warn('⚠️ chartViagensPorSetor não encontrado ou sem instância!');
        }

        console.log('🎯 CAPTURA FINALIZADA!');
        console.log('📊 Total de gráficos capturados:', Object.keys(graficos).filter(k => graficos[k]).length);
        console.log('📊 Gráficos capturados:', graficos);

        // 🔄 CONVERTER SVG → PNG (Backend Syncfusion.Pdf só aceita PNG!)
        console.log('🔄 Convertendo SVG para PNG...');
        const graficosPNG = {};

        for (const [key, svgBase64] of Object.entries(graficos))
        {
            console.log(`🔄 [${key}] Processando conversão...`);

            if (!svgBase64)
            {
                console.warn(`⚠️ [${key}] SVG vazio, pulando conversão`);
                graficosPNG[key] = '';
                continue;
            }

            try
            {
                console.log(`   🔍 [${key}] Iniciando conversão de ${(svgBase64.length / 1024).toFixed(1)}KB...`);
                graficosPNG[key] = await converterSvgParaPng(svgBase64);
                console.log(`✅ [${key}] SVG convertido para PNG com sucesso!`);
            } catch (erro)
            {
                console.error(`❌ [${key}] ERRO ao converter SVG para PNG:`, erro);
                console.error(`❌ [${key}] Mensagem:`, erro.message);
                console.error(`❌ [${key}] Stack:`, erro.stack);
                graficosPNG[key] = ''; // String vazia em caso de erro
            }
        }

        console.log('✅ Todos os gráficos convertidos para PNG!');
        console.log('📊 Total de gráficos PNG:', Object.keys(graficosPNG).filter(k => graficosPNG[k]).length);
        return graficosPNG;
    } catch (error)
    {
        console.error('❌ ERRO FATAL em capturarGraficos:', error);
        console.error('Stack trace:', error.stack);
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'capturarGraficos', error);
        return {};
    }
}

/**
 * Converte SVG Base64 para PNG Base64 usando Blob e URL.createObjectURL
 * Método mais robusto que funciona com SVGs complexos do Syncfusion
 * @param {string} svgBase64 - String Base64 do SVG (com data:image/svg+xml;base64, prefixo)
 * @returns {Promise<string>} PNG Base64 (com data:image/png;base64, prefixo)
 */
async function converterSvgParaPng(svgBase64)
{
    try
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                // 1. Extrair apenas o Base64 puro (remover prefixo data:image/svg+xml;base64,)
                const base64Data = svgBase64.split(',')[1];
                if (!base64Data)
                {
                    reject(new Error('SVG Base64 inválido - sem dados após vírgula'));
                    return;
                }

                // 2. Decodificar Base64 para string SVG
                const svgString = atob(base64Data);

                // 3. Criar Blob do SVG
                const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);

                // 4. Criar imagem do SVG
                const img = new Image();

                img.onload = () =>
                {
                    try
                    {
                        // 5. Criar canvas com as dimensões da imagem
                        const canvas = document.createElement('canvas');

                        // Usar dimensões da imagem ou dimensões padrão se inválidas
                        canvas.width = img.width > 0 ? img.width : 800;
                        canvas.height = img.height > 0 ? img.height : 600;

                        console.log(`   📐 Dimensões: ${canvas.width}x${canvas.height}`);

                        // 6. Desenhar SVG no canvas com fundo branco
                        const ctx = canvas.getContext('2d');

                        // Fundo branco (importante para transparência)
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        // Desenhar imagem
                        ctx.drawImage(img, 0, 0);

                        // 7. Converter canvas para PNG Base64
                        const pngBase64 = canvas.toDataURL('image/png', 0.95); // 95% qualidade

                        // 8. Liberar memória
                        URL.revokeObjectURL(url);

                        // 9. Log de tamanho
                        const tamanhoAntes = (svgBase64.length / 1024).toFixed(1);
                        const tamanhoDepois = (pngBase64.length / 1024).toFixed(1);
                        console.log(`   🔄 ${tamanhoAntes}KB (SVG) → ${tamanhoDepois}KB (PNG)`);

                        resolve(pngBase64);
                    } catch (erro)
                    {
                        URL.revokeObjectURL(url);
                        reject(new Error('Erro ao desenhar no canvas: ' + erro.message));
                    }
                };

                img.onerror = (erro) =>
                {
                    URL.revokeObjectURL(url);
                    reject(new Error('Falha ao carregar SVG como imagem: ' + erro));
                };

                // 10. Configurar CORS e iniciar carregamento
                img.crossOrigin = 'anonymous';
                img.src = url;
            } catch (erro)
            {
                reject(new Error('Erro ao processar SVG Base64: ' + erro.message));
            }
        });
    } catch (erro)
    {
        console.error('❌ Erro em converterSvgParaPng:', erro);
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'converterSvgParaPng', erro);
        throw erro;
    }
}

/**
 * Exporta gráfico Syncfusion com DEBUG COMPLETO
 * @param {Object} chart - Instância do gráfico Syncfusion
 * @param {string} nome - Nome do gráfico (para debug)
 * @returns {Promise<string>} Base64 do gráfico
 */
function exportarGraficoSyncfusion(chart, nome)
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            console.log(`🔍 [${nome}] Iniciando captura do gráfico...`);

            // 1. Verifica se o chart existe
            if (!chart)
            {
                console.error(`❌ [${nome}] Chart é null ou undefined`);
                resolve(null);
                return;
            }
            console.log(`✅ [${nome}] Chart existe:`, chart);

            // 2. Verifica se tem element
            if (!chart.element)
            {
                console.error(`❌ [${nome}] chart.element não existe`);
                console.log(`[${nome}] Propriedades do chart:`, Object.keys(chart));
                resolve(null);
                return;
            }
            console.log(`✅ [${nome}] chart.element existe:`, chart.element);

            const chartElement = chart.element;

            // 3. Tenta encontrar CANVAS
            const canvas = chartElement.querySelector('canvas');
            if (canvas)
            {
                console.log(`✅ [${nome}] Canvas encontrado!`);
                console.log(`[${nome}] Canvas dimensões: ${canvas.width}x${canvas.height}`);

                try
                {
                    const base64 = canvas.toDataURL('image/png');
                    console.log(`✅ [${nome}] Canvas convertido para Base64 (${Math.round(base64.length / 1024)}KB)`);
                    resolve(base64);
                    return;
                }
                catch (canvasError)
                {
                    console.error(`❌ [${nome}] Erro ao converter canvas:`, canvasError);
                }
            }
            else
            {
                console.warn(`⚠️ [${nome}] Canvas NÃO encontrado, tentando SVG...`);
            }

            // 4. Tenta encontrar SVG (Syncfusion pode usar SVG ao invés de Canvas)
            const svg = chartElement.querySelector('svg');
            if (svg)
            {
                console.log(`✅ [${nome}] SVG encontrado!`);

                try
                {
                    // Converte SVG para Base64
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

                    console.log(`✅ [${nome}] SVG convertido para Base64 (${Math.round(svgBase64.length / 1024)}KB)`);
                    resolve(svgBase64);
                    return;
                }
                catch (svgError)
                {
                    console.error(`❌ [${nome}] Erro ao converter SVG:`, svgError);
                }
            }
            else
            {
                console.warn(`⚠️ [${nome}] SVG NÃO encontrado`);
            }

            // 5. Se não encontrou nem canvas nem SVG, mostra o HTML do elemento
            console.error(`❌ [${nome}] Nem canvas nem SVG encontrados!`);
            console.log(`[${nome}] HTML do elemento:`, chartElement.innerHTML.substring(0, 500));
            console.log(`[${nome}] Filhos do elemento:`, chartElement.children);

            resolve(null);
        }
        catch (error)
        {
            console.error(`❌ [${nome}] ERRO GERAL:`, error);
            console.error(`[${nome}] Stack trace:`, error.stack);
            resolve(null);
        }
    });
}

/**
 * Limpa o PDFViewer quando o modal é fechado
 */
function limparPDFViewer()
{
    try
    {
        if (pdfViewerInstance)
        {
            pdfViewerInstance.destroy();
            pdfViewerInstance = null;
        }

        // Limpa o container
        $('#pdfViewerContainer').empty();
    } catch (error)
    {
        console.error('Erro ao limpar PDFViewer:', error);
    }
}

// ========================================
// EVENTOS
// ========================================

$(document).ready(function ()
{
    try
    {
        inicializarDashboard();

        // Eventos dos botões de período rápido
        $('#btn7Dias').on('click', () => aplicarFiltroPeriodo(7));
        $('#btn15Dias').on('click', () => aplicarFiltroPeriodo(15));
        $('#btn30Dias').on('click', () => aplicarFiltroPeriodo(30));
        $('#btn60Dias').on('click', () => aplicarFiltroPeriodo(60));
        $('#btn90Dias').on('click', () => aplicarFiltroPeriodo(90));
        $('#btn180Dias').on('click', () => aplicarFiltroPeriodo(180));
        $('#btn365Dias').on('click', () => aplicarFiltroPeriodo(365));

        // Evento do botão Filtrar (datas personalizadas)
        $('#btnFiltrar').on('click', aplicarFiltroPersonalizado);

        // Evento do botão atualizar
        $('#btnAtualizar').on('click', atualizarDashboard);

        // Evento do botão exportar PDF
        $('#btnExportarPDF').on('click', exportarParaPDF);

        // Evento do botão baixar PDF
        $('#btnBaixarPDF').on('click', baixarPDF);

        // Limpa o PDFViewer quando o modal é fechado
        $('#modalPDFViewer').on('hidden.bs.modal', limparPDFViewer);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'document.ready', error);
    }
});

/**
* Captura os 9 cards de estatísticas como imagens PNG usando html2canvas
* @returns {Promise<Object>} Dicionário com Base64 PNG de cada card
*/
async function capturarCards()
{
    try
    {
        console.log('🎨 ===== INICIANDO CAPTURA DE CARDS =====');

        const cards = {};

        // Lista de IDs dos cards na ordem (3x3)
        const cardIds = [
            'cardCustoTotal', 'cardTotalViagens', 'cardCustoMedio',
            'cardKmTotal', 'cardKmMedio', 'cardViagensFinalizadas',
            'cardViagensEmAndamento', 'cardViagensAgendadas', 'cardViagensCanceladas'
        ];

        for (const cardId of cardIds)
        {
            const elemento = document.getElementById(cardId);

            if (!elemento)
            {
                console.warn(`⚠️ [${cardId}] Elemento não encontrado no DOM`);
                cards[cardId] = '';
                continue;
            }

            try
            {
                console.log(`🎨 [${cardId}] Capturando card...`);

                // Captura o elemento como canvas usando html2canvas
                const canvas = await html2canvas(elemento, {
                    backgroundColor: '#ffffff',
                    scale: 2, // Alta qualidade
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });

                // Converte canvas para Base64 PNG
                const base64PNG = canvas.toDataURL('image/png');

                cards[cardId] = base64PNG;

                // Log do tamanho
                const tamanhoKB = (base64PNG.length / 1024).toFixed(1);
                console.log(`✅ [${cardId}] Card capturado (${tamanhoKB} KB)`);
            } catch (erro)
            {
                console.error(`❌ [${cardId}] Erro ao capturar card:`, erro);
                console.error(`❌ [${cardId}] Mensagem:`, erro.message);
                cards[cardId] = '';
            }
        }

        const totalCapturados = Object.keys(cards).filter(k => cards[k]).length;
        console.log(`✅ Total de cards capturados: ${totalCapturados}/${cardIds.length}`);
        console.log('🎨 ===== CAPTURA DE CARDS FINALIZADA =====');

        return cards;
    } catch (error)
    {
        console.error('❌ ERRO FATAL em capturarCards:', error);
        console.error('Stack trace:', error.stack);
        Alerta.TratamentoErroComLinha('dashboard-viagens.js', 'capturarCards', error);
        return {};
    }
}
