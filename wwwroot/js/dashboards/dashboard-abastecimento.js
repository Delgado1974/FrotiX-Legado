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

// ====== OVERLAY DE LOADING - Padrão FrotiX ======
function mostrarLoading() {
    const el = document.getElementById('loadingOverlayAbast');
    if (el) {
        el.style.display = 'flex';
    }
}

function esconderLoading() {
    const el = document.getElementById('loadingOverlayAbast');
    if (el) {
        el.style.display = 'none';
    }
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
 * Lógica: Ano com último registro -> Mês daquele ano com último registro
 */
function inicializarFiltrosECarregar() {
    try {
        mostrarLoading();

        // Busca para obter anos disponíveis
        $.ajax({
            url: '/api/abastecimento/DashboardDados',
            type: 'GET',
            data: { ano: null, mes: null },
            success: function (data) {
                try {
                    const anos = data.anosDisponiveis || [];

                    if (anos.length === 0) {
                        // Sem dados disponíveis
                        esconderLoading();
                        return;
                    }

                    // Ano com último registro (primeiro da lista, ordenado desc)
                    const anoUltimoRegistro = anos[0];

                    // Preencher selects de ano
                    const selectGeral = document.getElementById('filtroAnoGeral');
                    const selectMensal = document.getElementById('filtroAnoMensal');
                    const selectVeiculo = document.getElementById('filtroAnoVeiculo');

                    [selectGeral, selectMensal, selectVeiculo].forEach(select => {
                        if (!select) return;
                        const isGeral = select.id === 'filtroAnoGeral';
                        select.innerHTML = isGeral ? '<option value="">&lt;Todos os Anos&gt;</option>' : '';
                        anos.forEach(ano => {
                            const option = document.createElement('option');
                            option.value = ano;
                            option.textContent = ano;
                            select.appendChild(option);
                        });
                        select.value = anoUltimoRegistro.toString();
                        select.dataset.initialized = 'true';
                    });

                    // Buscar dados DO ANO COM ÚLTIMO REGISTRO para determinar o mês
                    $.ajax({
                        url: '/api/abastecimento/DashboardDados',
                        type: 'GET',
                        data: { ano: anoUltimoRegistro, mes: null },
                        success: function (dataAno) {
                            try {
                                let mesSelecionado = '';
                                const consumoPorMes = dataAno.consumoPorMes || [];

                                // Encontrar o último mês com dados (maior número de mês com valor > 0)
                                if (consumoPorMes.length > 0) {
                                    const mesesComDados = consumoPorMes
                                        .filter(item => item.valor > 0)
                                        .map(item => item.mes)
                                        .sort((a, b) => b - a); // Ordenar decrescente

                                    if (mesesComDados.length > 0) {
                                        mesSelecionado = mesesComDados[0].toString();
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
                                Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "inicializarFiltrosECarregar.inner.success", error);
                                esconderLoading();
                            }
                        },
                        error: function () {
                            // Em caso de erro, carrega sem mês específico
                            carregarDadosGeraisComFiltros();
                        }
                    });

                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "inicializarFiltrosECarregar.success", error);
                    esconderLoading();
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao inicializar filtros:', error);
                esconderLoading();
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

        // Atualiza a label do período com os filtros selecionados
        atualizarLabelPeriodoGeral();

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

        // ====== ABA GERAL - Filtros ======
        document.getElementById('btnFiltrarAnoMesGeral')?.addEventListener('click', function () {
            // Limpa período personalizado ao usar ano/mês
            document.getElementById('dataInicioGeral').value = '';
            document.getElementById('dataFimGeral').value = '';
            document.querySelectorAll('.btn-period-abast').forEach(b => b.classList.remove('active'));
            carregarDadosGerais();
        });

        document.getElementById('btnLimparAnoMesGeral')?.addEventListener('click', function () {
            document.getElementById('filtroAnoGeral').value = '';
            document.getElementById('filtroMesGeral').value = '';
            atualizarLabelPeriodoGeral();
            carregarDadosGerais();
        });

        document.getElementById('btnFiltrarPeriodoGeral')?.addEventListener('click', function () {
            const dataInicio = document.getElementById('dataInicioGeral').value;
            const dataFim = document.getElementById('dataFimGeral').value;
            if (dataInicio && dataFim) {
                // Limpa ano/mês ao usar período personalizado
                document.getElementById('filtroAnoGeral').value = '';
                document.getElementById('filtroMesGeral').value = '';
                document.querySelectorAll('.btn-period-abast').forEach(b => b.classList.remove('active'));
                carregarDadosGeraisPeriodo(dataInicio, dataFim);
            } else {
                Alerta.Warning('Preencha as datas de início e fim');
            }
        });

        document.getElementById('btnLimparPeriodoGeral')?.addEventListener('click', function () {
            document.getElementById('dataInicioGeral').value = '';
            document.getElementById('dataFimGeral').value = '';
            document.querySelectorAll('.btn-period-abast').forEach(b => b.classList.remove('active'));
            atualizarLabelPeriodoGeral();
            carregarDadosGerais();
        });

        // Períodos Rápidos
        document.querySelectorAll('.btn-period-abast').forEach(btn => {
            btn.addEventListener('click', function () {
                const dias = parseInt(this.dataset.dias);
                const dataFim = new Date();
                const dataInicio = new Date();
                dataInicio.setDate(dataInicio.getDate() - dias);

                document.getElementById('dataInicioGeral').value = dataInicio.toISOString().split('T')[0];
                document.getElementById('dataFimGeral').value = dataFim.toISOString().split('T')[0];
                document.getElementById('filtroAnoGeral').value = '';
                document.getElementById('filtroMesGeral').value = '';

                document.querySelectorAll('.btn-period-abast').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                carregarDadosGeraisPeriodo(
                    document.getElementById('dataInicioGeral').value,
                    document.getElementById('dataFimGeral').value
                );
            });
        });

        // ====== ABA MENSAL - Filtros ======
        document.getElementById('btnFiltrarMensal')?.addEventListener('click', function () {
            carregarDadosMensais();
        });

        document.getElementById('btnLimparMensal')?.addEventListener('click', function () {
            const selectAno = document.getElementById('filtroAnoMensal');
            if (selectAno && selectAno.options.length > 0) {
                selectAno.selectedIndex = 0;
            }
            document.getElementById('filtroMesMensal').value = '';
            carregarDadosMensais();
        });

        // ====== ABA VEÍCULO - Filtros ======
        document.getElementById('btnFiltrarAnoMesVeiculo')?.addEventListener('click', function () {
            // Limpa período personalizado ao usar ano/mês
            document.getElementById('dataInicioVeiculo').value = '';
            document.getElementById('dataFimVeiculo').value = '';
            document.querySelectorAll('.btn-period-abast-veiculo').forEach(b => b.classList.remove('active'));
            carregarDadosVeiculo();
        });

        document.getElementById('btnLimparAnoMesVeiculo')?.addEventListener('click', function () {
            const selectAno = document.getElementById('filtroAnoVeiculo');
            if (selectAno && selectAno.options.length > 0) {
                selectAno.selectedIndex = 0;
            }
            document.getElementById('filtroMesVeiculo').value = '';
            document.getElementById('filtroModeloVeiculo').value = '';
            document.getElementById('filtroPlacaVeiculo').value = '';
            atualizarLabelPeriodoVeiculo();
            carregarDadosVeiculo();
        });

        document.getElementById('btnFiltrarPeriodoVeiculo')?.addEventListener('click', function () {
            const dataInicio = document.getElementById('dataInicioVeiculo').value;
            const dataFim = document.getElementById('dataFimVeiculo').value;
            if (dataInicio && dataFim) {
                // Limpa ano/mês ao usar período personalizado
                document.getElementById('filtroAnoVeiculo').value = '';
                document.getElementById('filtroMesVeiculo').value = '';
                document.getElementById('filtroModeloVeiculo').value = '';
                document.getElementById('filtroPlacaVeiculo').value = '';
                document.querySelectorAll('.btn-period-abast-veiculo').forEach(b => b.classList.remove('active'));
                carregarDadosVeiculoPeriodo(dataInicio, dataFim);
            } else {
                Alerta.Warning('Preencha as datas de início e fim');
            }
        });

        document.getElementById('btnLimparPeriodoVeiculo')?.addEventListener('click', function () {
            document.getElementById('dataInicioVeiculo').value = '';
            document.getElementById('dataFimVeiculo').value = '';
            document.querySelectorAll('.btn-period-abast-veiculo').forEach(b => b.classList.remove('active'));
            atualizarLabelPeriodoVeiculo();
            carregarDadosVeiculo();
        });

        // Períodos Rápidos - Veículo
        document.querySelectorAll('.btn-period-abast-veiculo').forEach(btn => {
            btn.addEventListener('click', function () {
                const dias = parseInt(this.dataset.dias);
                const dataFim = new Date();
                const dataInicio = new Date();
                dataInicio.setDate(dataInicio.getDate() - dias);

                document.getElementById('dataInicioVeiculo').value = dataInicio.toISOString().split('T')[0];
                document.getElementById('dataFimVeiculo').value = dataFim.toISOString().split('T')[0];
                document.getElementById('filtroAnoVeiculo').value = '';
                document.getElementById('filtroMesVeiculo').value = '';
                document.getElementById('filtroModeloVeiculo').value = '';
                document.getElementById('filtroPlacaVeiculo').value = '';

                document.querySelectorAll('.btn-period-abast-veiculo').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                carregarDadosVeiculoPeriodo(
                    document.getElementById('dataInicioVeiculo').value,
                    document.getElementById('dataFimVeiculo').value
                );
            });
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

// ====== FUNÇÕES AUXILIARES DE FILTRO ======

function atualizarLabelPeriodoGeral() {
    const label = document.getElementById('periodoAtualLabelGeral');
    if (!label) return;

    const ano = document.getElementById('filtroAnoGeral')?.value;
    const mes = document.getElementById('filtroMesGeral')?.value;
    const dataInicio = document.getElementById('dataInicioGeral')?.value;
    const dataFim = document.getElementById('dataFimGeral')?.value;

    if (dataInicio && dataFim) {
        const di = new Date(dataInicio + 'T00:00:00');
        const df = new Date(dataFim + 'T00:00:00');
        label.textContent = `Período: ${di.toLocaleDateString('pt-BR')} a ${df.toLocaleDateString('pt-BR')}`;
    } else if (ano && mes) {
        label.textContent = `Período: ${MESES_COMPLETOS[parseInt(mes)]} de ${ano}`;
    } else if (ano) {
        label.textContent = `Período: Ano de ${ano}`;
    } else {
        label.textContent = 'Exibindo todos os dados';
    }
}

function carregarDadosGeraisPeriodo(dataInicio, dataFim) {
    try {
        mostrarLoading();
        atualizarLabelPeriodoGeral();

        $.ajax({
            url: '/api/abastecimento/DashboardDadosPeriodo',
            type: 'GET',
            data: { dataInicio: dataInicio, dataFim: dataFim },
            success: function (data) {
                try {
                    dadosGerais = data;
                    renderizarAbaGeral(data);
                    esconderLoading();
                } catch (error) {
                    esconderLoading();
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosGeraisPeriodo.success", error);
                }
            },
            error: function (xhr, status, error) {
                esconderLoading();
                console.error('Erro ao carregar dados por período:', error);
                // Fallback: usar filtro por ano/mês se endpoint não existir
                carregarDadosGerais();
            }
        });
    } catch (error) {
        esconderLoading();
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosGeraisPeriodo", error);
    }
}

function atualizarLabelPeriodoVeiculo() {
    const label = document.getElementById('periodoAtualLabelVeiculo');
    if (!label) return;

    const ano = document.getElementById('filtroAnoVeiculo')?.value;
    const mes = document.getElementById('filtroMesVeiculo')?.value;
    const modelo = document.getElementById('filtroModeloVeiculo')?.value;
    const placa = document.getElementById('filtroPlacaVeiculo')?.value;
    const dataInicio = document.getElementById('dataInicioVeiculo')?.value;
    const dataFim = document.getElementById('dataFimVeiculo')?.value;

    let partes = [];

    if (dataInicio && dataFim) {
        const di = new Date(dataInicio + 'T00:00:00');
        const df = new Date(dataFim + 'T00:00:00');
        partes.push(`${di.toLocaleDateString('pt-BR')} a ${df.toLocaleDateString('pt-BR')}`);
    } else if (ano && mes) {
        partes.push(`${MESES_COMPLETOS[parseInt(mes)]} de ${ano}`);
    } else if (ano) {
        partes.push(`Ano de ${ano}`);
    }

    if (placa) {
        partes.push(`Placa: ${placa}`);
    } else if (modelo) {
        partes.push(`Modelo: ${modelo}`);
    }

    if (partes.length > 0) {
        label.textContent = `Período: ${partes.join(' | ')}`;
    } else {
        label.textContent = 'Exibindo todos os dados';
    }
}

function carregarDadosVeiculoPeriodo(dataInicio, dataFim) {
    try {
        mostrarLoading();
        atualizarLabelPeriodoVeiculo();

        $.ajax({
            url: '/api/abastecimento/DashboardDadosVeiculoPeriodo',
            type: 'GET',
            data: { dataInicio: dataInicio, dataFim: dataFim },
            success: function (data) {
                try {
                    dadosVeiculo = data;
                    renderizarAbaVeiculo(data, null, null);
                    esconderLoading();
                } catch (error) {
                    esconderLoading();
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosVeiculoPeriodo.success", error);
                }
            },
            error: function (xhr, status, error) {
                esconderLoading();
                console.error('Erro ao carregar dados de veículo por período:', error);
                // Fallback: usar filtro por ano/mês se endpoint não existir
                carregarDadosVeiculo();
            }
        });
    } catch (error) {
        esconderLoading();
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "carregarDadosVeiculoPeriodo", error);
    }
}

// ====== CARREGAMENTO DE DADOS ======

function carregarDadosGerais() {
    try {
        mostrarLoading();
        atualizarLabelPeriodoGeral();
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
        const ano = document.getElementById('filtroAnoMensal')?.value || '';
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
        atualizarLabelPeriodoVeiculo();
        const ano = document.getElementById('filtroAnoVeiculo')?.value || '';
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

                    // Obter placa selecionada para passar ao gráfico de ranking
                    const placaSelecionada = placaSelect?.options[placaSelect.selectedIndex]?.text;
                    const placaValida = veiculoId && placaSelecionada && placaSelecionada !== 'Todas';
                    renderizarAbaVeiculo(data, placaValida ? veiculoId : null, placaValida ? placaSelecionada : null);

                    // Renderizar heatmap: por placa específica ou por modelo
                    if (veiculoId && placaSelecionada && placaSelecionada !== 'Todas') {
                        // Placa específica selecionada
                        renderizarHeatmapVeiculo(ano || null, placaSelecionada, null);
                    } else if (modelo) {
                        // Modelo selecionado, sem placa específica
                        renderizarHeatmapVeiculo(ano || null, null, modelo);
                    } else {
                        // Nenhum filtro específico
                        renderizarHeatmapVeiculo(null, null, null);
                    }
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
        document.getElementById('litrosTotalGeral').textContent = formatarLitros(data.totais.litrosTotal);
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

        // Mapa de Calor Dia/Hora
        const anoGeral = document.getElementById('filtroAnoGeral')?.value || '';
        const mesGeral = document.getElementById('filtroMesGeral')?.value || '';
        renderizarHeatmapDiaHora(anoGeral, mesGeral);
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarAbaGeral", error);
    }
}

function renderizarTabelaResumoPorAno(dados) {
    try {
        const container = document.getElementById('tabelaResumoPorAno');
        if (!container) return;

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="grid-row" style="justify-content: center; padding: 20px; color: #6c757d;">Sem dados</div>';
            return;
        }

        let html = '';
        let totalValor = 0;

        dados.forEach(item => {
            totalValor += item.valor;
            html += `
                <div class="grid-row">
                    <div class="grid-cell" style="font-weight: 600;">${item.ano}</div>
                    <div class="grid-cell text-end">${formatarMoeda(item.valor)}</div>
                </div>
            `;
        });

        html += `
            <div class="grid-row grid-row-total">
                <div class="grid-cell">TOTAL</div>
                <div class="grid-cell text-end">${formatarMoeda(totalValor)}</div>
            </div>
        `;

        container.innerHTML = html;
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
        document.getElementById('totalLitrosMensal').textContent = formatarLitros(data.litrosTotal);

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

        // Mapa de Calor Categoria/Mês
        const anoMensal = document.getElementById('filtroAnoMensal')?.value || '';
        if (anoMensal) {
            renderizarHeatmapCategoria(anoMensal);
        }
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
 * Tabela TOP 15 por TIPO de veículo (modelo) - Usando DIVs
 */
function renderizarTabelaValorPorTipo(dados) {
    try {
        const container = document.getElementById('tabelaValorPorTipo');
        if (!container) return;

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="grid-row" style="justify-content: center; padding: 20px; color: #6c757d;">Sem dados</div>';
            return;
        }

        let html = '';
        let totalValor = 0;

        dados.forEach((item, idx) => {
            totalValor += item.valor;
            const badgeClass = idx < 3 ? 'badge-rank-abast top3' : 'badge-rank-abast';
            html += `
                <div class="grid-row">
                    <div class="grid-cell"><span class="${badgeClass}">${idx + 1}</span> ${item.tipoVeiculo}</div>
                    <div class="grid-cell text-end" style="color: #4a7c59; font-weight: 600;">${formatarMoedaTabela(item.valor)}</div>
                </div>
            `;
        });

        // Linha de total
        html += `
            <div class="grid-row grid-row-total">
                <div class="grid-cell"><strong>Total (Top 15)</strong></div>
                <div class="grid-cell text-end" style="color: #2d5a3d; font-weight: 700;">${formatarMoedaTabela(totalValor)}</div>
            </div>
        `;

        container.innerHTML = html;
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarTabelaValorPorTipo", error);
    }
}

/**
 * Tabela TOP 15 por PLACA individual - Usando DIVs
 */
function renderizarTabelaValorPorPlaca(dados) {
    try {
        const container = document.getElementById('tabelaValorPorPlaca');
        if (!container) return;

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="grid-row" style="justify-content: center; padding: 20px; color: #6c757d;">Sem dados</div>';
            return;
        }

        let html = '';
        let totalValor = 0;

        dados.forEach((item, idx) => {
            totalValor += item.valor;
            const badgeClass = idx < 3 ? 'badge-rank-abast top3' : 'badge-rank-abast';
            html += `
                <div class="grid-row">
                    <div class="grid-cell"><span class="${badgeClass}">${idx + 1}</span> <strong>${item.placa}</strong></div>
                    <div class="grid-cell" style="font-size: 0.7rem; color: #666;">${item.tipoVeiculo || '-'}</div>
                    <div class="grid-cell text-end" style="color: #4a7c59; font-weight: 600;">${formatarMoedaTabela(item.valor)}</div>
                </div>
            `;
        });

        // Linha de total
        html += `
            <div class="grid-row grid-row-total">
                <div class="grid-cell" style="grid-column: span 2;"><strong>Total (Top 15)</strong></div>
                <div class="grid-cell text-end" style="color: #2d5a3d; font-weight: 700;">${formatarMoedaTabela(totalValor)}</div>
            </div>
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
function renderizarAbaVeiculo(data, veiculoSelecionadoId, placaSelecionada) {
    try {
        document.getElementById('valorTotalVeiculo').textContent = formatarMoeda(data.valorTotal);
        document.getElementById('litrosTotalVeiculo').textContent = formatarLitros(data.litrosTotal);

        document.getElementById('descricaoVeiculoSelecionado').textContent = data.descricaoVeiculo;
        document.getElementById('categoriaVeiculoSelecionado').textContent = data.categoriaVeiculo;

        renderizarChartConsumoMensalVeiculo(data.consumoMensalLitros);
        renderizarChartValorMensalVeiculo(data.valorMensal);
        renderizarChartRankingVeiculos(data.veiculosComValor, veiculoSelecionadoId, placaSelecionada);
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

function renderizarChartRankingVeiculos(dados, veiculoSelecionadoId, placaSelecionada) {
    try {
        const container = document.getElementById('chartRankingVeiculos');
        const tituloEl = document.getElementById('tituloRankingVeiculos');
        const subtituloEl = document.getElementById('subtituloRankingVeiculos');
        const iconEl = document.getElementById('iconRankingVeiculos');
        if (!container) return;

        if (chartRankingVeiculos) { chartRankingVeiculos.destroy(); chartRankingVeiculos = null; }
        container.innerHTML = '';

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">Sem dados</div>';
            return;
        }

        // Verificar se há veículo selecionado
        const modoComparativo = veiculoSelecionadoId && placaSelecionada;

        if (modoComparativo) {
            // Modo comparativo: veículo selecionado vs TOP 10
            if (tituloEl) tituloEl.textContent = 'Comparativo de Consumo';
            if (subtituloEl) subtituloEl.textContent = placaSelecionada + ' vs. Top 10';
            if (iconEl) iconEl.className = 'fa-duotone fa-chart-mixed';

            const top10 = dados.slice(0, 10);
            const veiculoNoTop10 = top10.find(v => v.veiculoId == veiculoSelecionadoId);
            const veiculoSelecionado = dados.find(v => v.veiculoId == veiculoSelecionadoId);

            let dadosComparativo = [];

            // Se o veículo selecionado não está no TOP 10, adiciona ele primeiro
            if (veiculoSelecionado && !veiculoNoTop10) {
                dadosComparativo.push({
                    x: '★ ' + veiculoSelecionado.placa,
                    y: veiculoSelecionado.valor,
                    color: '#2563eb', // Azul destaque
                    veiculoId: veiculoSelecionado.veiculoId,
                    selecionado: true
                });
            }

            // Adiciona TOP 10, destacando o selecionado se estiver nele
            top10.forEach((item, idx) => {
                const isSelecionado = item.veiculoId == veiculoSelecionadoId;
                dadosComparativo.push({
                    x: isSelecionado ? '★ ' + item.placa : item.placa,
                    y: item.valor,
                    color: isSelecionado ? '#2563eb' : CORES.multi[idx % CORES.multi.length],
                    veiculoId: item.veiculoId,
                    selecionado: isSelecionado
                });
            });

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
                    dataSource: dadosComparativo,
                    xName: 'x',
                    yName: 'y',
                    pointColorMapping: 'color',
                    type: 'Bar',
                    cornerRadius: { topRight: 4, bottomRight: 4 }
                }],
                tooltip: { enable: true },
                tooltipRender: function(args) {
                    const label = args.point.x.replace('★ ', '');
                    args.text = label + ': ' + formatarLabelMoeda(args.point.y);
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
        } else {
            // Modo ranking normal
            if (tituloEl) tituloEl.textContent = 'Ranking de Veículos (Top 10)';
            if (subtituloEl) subtituloEl.textContent = 'Por placa individual';
            if (iconEl) iconEl.className = 'fa-duotone fa-ranking-star';

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
        }

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

function formatarLitros(valor) {
    if (!valor) return '0 lt';
    // Formata número completo sem abreviação, com separador de milhar
    return Math.round(valor).toLocaleString('pt-BR') + ' lt';
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

// ====== MAPAS DE CALOR ======

var heatmapDiaHora = null;
var heatmapCategoria = null;
var heatmapVeiculo = null;
var modalDetalhes = null;

// Paleta de cores do heatmap (mesma ordem usada no paletteSettings)
const HEATMAP_CORES = ['#f5ebe0', '#d4a574', '#c4956a', '#a8784c', '#8b5e3c', '#6d472c'];

/**
 * Cria a legenda customizada com faixas de valores para o heatmap
 * @param {string} containerId - ID do container da legenda
 * @param {Array} dados - Array de valores do heatmap
 */
function criarLegendaHeatmap(containerId, dados) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Extrair todos os valores
    const valores = dados.flat().filter(v => v > 0);
    if (valores.length === 0) {
        container.innerHTML = '<span class="text-muted" style="font-size: 0.75rem;">Sem dados para exibir legenda</span>';
        return;
    }

    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const range = max - min;
    const steps = HEATMAP_CORES.length;
    const stepSize = range / (steps - 1);

    // Criar os itens da legenda
    let html = '';
    for (let i = 0; i < steps; i++) {
        const valorInicio = i === 0 ? 0 : min + (stepSize * (i - 0.5));
        const valorFim = i === steps - 1 ? max : min + (stepSize * (i + 0.5));

        let label;
        if (i === 0) {
            label = 'R$ 0';
        } else if (i === steps - 1) {
            label = '> R$ ' + formatarNumeroK(valorFim * 0.8);
        } else {
            label = 'R$ ' + formatarNumeroK(valorInicio) + ' - ' + formatarNumeroK(valorFim);
        }

        html += `
            <div class="heatmap-legenda-item">
                <div class="heatmap-legenda-cor" style="background-color: ${HEATMAP_CORES[i]};"></div>
                <span class="heatmap-legenda-range">${label}</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Renderiza o Mapa de Calor: Dia da Semana x Hora (Aba 1 - Consumo Geral)
 */
function renderizarHeatmapDiaHora(ano, mes) {
    try {
        const container = document.getElementById('heatmapDiaHora');
        if (!container) return;

        $.ajax({
            url: '/api/abastecimento/DashboardHeatmapHora',
            type: 'GET',
            data: { ano: ano || null, mes: mes || null },
            success: function (data) {
                try {
                    if (heatmapDiaHora) {
                        heatmapDiaHora.destroy();
                        heatmapDiaHora = null;
                    }
                    container.innerHTML = '';

                    // Preparar dados para o HeatMap
                    var heatmapData = [];
                    var diasSemana = data.xLabels;
                    var horas = data.yLabels;

                    // Criar matriz de dados
                    for (var i = 0; i < diasSemana.length; i++) {
                        var row = [];
                        for (var j = 0; j < horas.length; j++) {
                            var item = data.data.find(d => d.x === diasSemana[i] && d.y === horas[j]);
                            row.push(item ? item.value : 0);
                        }
                        heatmapData.push(row);
                    }

                    heatmapDiaHora = new ej.heatmap.HeatMap({
                        titleSettings: { text: '' },
                        xAxis: {
                            labels: diasSemana,
                            textStyle: { size: '11px', fontFamily: 'Outfit' }
                        },
                        yAxis: {
                            labels: horas,
                            textStyle: { size: '9px', fontFamily: 'Outfit' }
                        },
                        dataSource: heatmapData,
                        cellSettings: {
                            showLabel: false,
                            border: { width: 1, color: 'white' }
                        },
                        paletteSettings: {
                            palette: [
                                { color: '#f5ebe0' },
                                { color: '#d4a574' },
                                { color: '#c4956a' },
                                { color: '#a8784c' },
                                { color: '#8b5e3c' },
                                { color: '#6d472c' }
                            ],
                            type: 'Gradient'
                        },
                        legendSettings: {
                            visible: false
                        },
                        tooltipRender: function(args) {
                            args.content = [diasSemana[args.xValue] + ' às ' + horas[args.yValue] + ': ' + formatarMoeda(args.value)];
                        },
                        cellClick: function(args) {
                            var diaSemana = args.xValue;
                            var hora = parseInt(horas[args.yValue]);
                            abrirModalDetalhes({
                                titulo: 'Abastecimentos - ' + diasSemana[diaSemana] + ' às ' + horas[args.yValue],
                                ano: ano,
                                mes: mes,
                                diaSemana: diaSemana,
                                hora: hora
                            });
                        }
                    });
                    heatmapDiaHora.appendTo('#heatmapDiaHora');

                    // Criar legenda customizada com faixas de valores
                    criarLegendaHeatmap('legendaHeatmapDiaHora', heatmapData);

                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarHeatmapDiaHora.success", error);
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar mapa de calor:', error);
                container.innerHTML = '<div class="text-center text-muted py-4">Erro ao carregar mapa de calor</div>';
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarHeatmapDiaHora", error);
    }
}

/**
 * Renderiza o Mapa de Calor: Categoria x Mês (Aba 2 - Consumo Mensal)
 */
function renderizarHeatmapCategoria(ano) {
    try {
        const container = document.getElementById('heatmapCategoria');
        if (!container) return;

        $.ajax({
            url: '/api/abastecimento/DashboardHeatmapCategoria',
            type: 'GET',
            data: { ano: ano },
            success: function (data) {
                try {
                    if (heatmapCategoria) {
                        heatmapCategoria.destroy();
                        heatmapCategoria = null;
                    }
                    container.innerHTML = '';

                    if (!data.xLabels || data.xLabels.length === 0) {
                        container.innerHTML = '<div class="text-center text-muted py-4">Sem dados de categorias</div>';
                        return;
                    }

                    // Preparar dados para o HeatMap
                    var categorias = data.xLabels;
                    var meses = data.yLabels;
                    var heatmapData = [];

                    for (var i = 0; i < categorias.length; i++) {
                        var row = [];
                        for (var j = 0; j < meses.length; j++) {
                            var item = data.data.find(d => d.x === categorias[i] && d.y === meses[j]);
                            row.push(item ? item.value : 0);
                        }
                        heatmapData.push(row);
                    }

                    heatmapCategoria = new ej.heatmap.HeatMap({
                        titleSettings: { text: '' },
                        xAxis: {
                            labels: categorias,
                            textStyle: { size: '10px', fontFamily: 'Outfit' }
                        },
                        yAxis: {
                            labels: meses,
                            textStyle: { size: '10px', fontFamily: 'Outfit' }
                        },
                        dataSource: heatmapData,
                        cellSettings: {
                            showLabel: false,
                            border: { width: 1, color: 'white' }
                        },
                        paletteSettings: {
                            palette: [
                                { color: '#f5ebe0' },
                                { color: '#d4a574' },
                                { color: '#c4956a' },
                                { color: '#a8784c' },
                                { color: '#8b5e3c' },
                                { color: '#6d472c' }
                            ],
                            type: 'Gradient'
                        },
                        legendSettings: {
                            visible: false
                        },
                        tooltipRender: function(args) {
                            args.content = [categorias[args.xValue] + ' - ' + meses[args.yValue] + ': ' + formatarMoeda(args.value)];
                        },
                        cellClick: function(args) {
                            var categoria = categorias[args.xValue];
                            var mesNum = args.yValue + 1;
                            abrirModalDetalhes({
                                titulo: 'Abastecimentos - ' + categoria + ' em ' + meses[args.yValue],
                                ano: ano,
                                mes: mesNum,
                                categoria: categoria
                            });
                        }
                    });
                    heatmapCategoria.appendTo('#heatmapCategoria');

                    // Criar legenda customizada com faixas de valores
                    criarLegendaHeatmap('legendaHeatmapCategoria', heatmapData);

                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarHeatmapCategoria.success", error);
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar mapa de calor:', error);
                container.innerHTML = '<div class="text-center text-muted py-4">Erro ao carregar mapa de calor</div>';
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarHeatmapCategoria", error);
    }
}

/**
 * Renderiza o Mapa de Calor: Dia da Semana x Hora de um Veículo ou Modelo específico (Aba 3)
 */
function renderizarHeatmapVeiculo(ano, placa, tipoVeiculo) {
    try {
        const container = document.getElementById('heatmapVeiculo');
        const containerVazio = document.getElementById('heatmapVeiculoVazio');
        const legendaContainer = document.getElementById('legendaHeatmapVeiculo');
        if (!container) return;

        // Se não tem placa nem modelo selecionado, mostrar mensagem
        if (!placa && !tipoVeiculo) {
            container.style.display = 'none';
            if (legendaContainer) legendaContainer.innerHTML = '';
            if (containerVazio) containerVazio.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        if (containerVazio) containerVazio.style.display = 'none';

        $.ajax({
            url: '/api/abastecimento/DashboardHeatmapVeiculo',
            type: 'GET',
            data: { ano: ano || null, placa: placa || null, tipoVeiculo: tipoVeiculo || null },
            success: function (data) {
                try {
                    if (heatmapVeiculo) {
                        heatmapVeiculo.destroy();
                        heatmapVeiculo = null;
                    }
                    container.innerHTML = '';

                    if (!data.xLabels || data.xLabels.length === 0 || !data.data || data.data.length === 0) {
                        container.innerHTML = '<div class="text-center text-muted py-4">Sem dados de abastecimento para este veículo</div>';
                        return;
                    }

                    // Preparar dados para o HeatMap
                    var heatmapData = [];
                    var diasSemana = data.xLabels;
                    var horas = data.yLabels;

                    // Criar matriz de dados
                    for (var i = 0; i < diasSemana.length; i++) {
                        var row = [];
                        for (var j = 0; j < horas.length; j++) {
                            var item = data.data.find(d => d.x === diasSemana[i] && d.y === horas[j]);
                            row.push(item ? item.value : 0);
                        }
                        heatmapData.push(row);
                    }

                    heatmapVeiculo = new ej.heatmap.HeatMap({
                        titleSettings: { text: '' },
                        xAxis: {
                            labels: diasSemana,
                            textStyle: { size: '11px', fontFamily: 'Outfit' }
                        },
                        yAxis: {
                            labels: horas,
                            textStyle: { size: '9px', fontFamily: 'Outfit' }
                        },
                        dataSource: heatmapData,
                        cellSettings: {
                            showLabel: false,
                            border: { width: 1, color: 'white' }
                        },
                        paletteSettings: {
                            palette: [
                                { color: '#f5ebe0' },
                                { color: '#d4a574' },
                                { color: '#c4956a' },
                                { color: '#a8784c' },
                                { color: '#8b5e3c' },
                                { color: '#6d472c' }
                            ],
                            type: 'Gradient'
                        },
                        legendSettings: {
                            visible: false
                        },
                        tooltipRender: function(args) {
                            args.content = [diasSemana[args.xValue] + ' às ' + horas[args.yValue] + ': ' + formatarMoeda(args.value)];
                        },
                        cellClick: function(args) {
                            var diaSemana = args.xValue;
                            var hora = parseInt(horas[args.yValue]);
                            var filtroLabel = placa || tipoVeiculo || 'Veículo';
                            abrirModalDetalhes({
                                titulo: 'Abastecimentos - ' + filtroLabel + ' - ' + diasSemana[diaSemana] + ' às ' + horas[args.yValue],
                                ano: ano,
                                placa: placa || null,
                                tipoVeiculo: tipoVeiculo || null,
                                diaSemana: diaSemana,
                                hora: hora
                            });
                        }
                    });
                    heatmapVeiculo.appendTo('#heatmapVeiculo');

                    // Criar legenda customizada com faixas de valores
                    criarLegendaHeatmap('legendaHeatmapVeiculo', heatmapData);

                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarHeatmapVeiculo.success", error);
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar mapa de calor do veículo:', error);
                container.innerHTML = '<div class="text-center text-muted py-4">Erro ao carregar mapa de calor</div>';
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "renderizarHeatmapVeiculo", error);
    }
}

// ====== MODAL DE DETALHES ======

/**
 * Abre o modal de detalhes com os abastecimentos filtrados
 */
function abrirModalDetalhes(filtros) {
    try {
        if (!modalDetalhes) {
            modalDetalhes = new bootstrap.Modal(document.getElementById('modalDetalhesAbast'));
        }

        document.getElementById('modalDetalhesTitulo').textContent = filtros.titulo || 'Detalhes dos Abastecimentos';
        document.getElementById('detalhesGrid').innerHTML = `
            <div class="detalhes-grid-header">Data</div>
            <div class="detalhes-grid-header">Veículo</div>
            <div class="detalhes-grid-header">Litros</div>
            <div class="detalhes-grid-header">R$/Litro</div>
            <div class="detalhes-grid-header">Total</div>
            <div style="grid-column: span 5; text-align: center; padding: 30px;">
                <i class="fa-duotone fa-spinner-third fa-spin fa-2x"></i>
            </div>
        `;
        document.getElementById('detalhesVazio').style.display = 'none';
        document.getElementById('detalhesQtd').textContent = '...';
        document.getElementById('detalhesLitros').textContent = '...';
        document.getElementById('detalhesValor').textContent = '...';

        modalDetalhes.show();

        $.ajax({
            url: '/api/abastecimento/DashboardDetalhes',
            type: 'GET',
            data: {
                ano: filtros.ano || null,
                mes: filtros.mes || null,
                categoria: filtros.categoria || null,
                tipoVeiculo: filtros.tipoVeiculo || null,
                placa: filtros.placa || null,
                diaSemana: filtros.diaSemana !== undefined ? filtros.diaSemana : null,
                hora: filtros.hora !== undefined ? filtros.hora : null
            },
            success: function (data) {
                try {
                    document.getElementById('detalhesQtd').textContent = data.totais.quantidade.toLocaleString('pt-BR');
                    document.getElementById('detalhesLitros').textContent = formatarNumero(data.totais.litros) + ' L';
                    document.getElementById('detalhesValor').textContent = formatarMoeda(data.totais.valor);

                    var gridHtml = `
                        <div class="detalhes-grid-header">Data</div>
                        <div class="detalhes-grid-header">Veículo</div>
                        <div class="detalhes-grid-header">Litros</div>
                        <div class="detalhes-grid-header">R$/Litro</div>
                        <div class="detalhes-grid-header">Total</div>
                    `;

                    if (data.registros && data.registros.length > 0) {
                        data.registros.forEach(function(reg) {
                            gridHtml += `
                                <div class="detalhes-grid-cell">${reg.data}</div>
                                <div class="detalhes-grid-cell">${reg.placa}</div>
                                <div class="detalhes-grid-cell">${formatarNumero(reg.litros)}</div>
                                <div class="detalhes-grid-cell">${formatarMoeda(reg.valorUnitario)}</div>
                                <div class="detalhes-grid-cell">${formatarMoeda(reg.valorTotal)}</div>
                            `;
                        });
                        document.getElementById('detalhesVazio').style.display = 'none';
                    } else {
                        document.getElementById('detalhesVazio').style.display = 'block';
                    }

                    document.getElementById('detalhesGrid').innerHTML = gridHtml;

                } catch (error) {
                    Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "abrirModalDetalhes.success", error);
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar detalhes:', error);
                document.getElementById('detalhesGrid').innerHTML = `
                    <div class="detalhes-grid-header">Data</div>
                    <div class="detalhes-grid-header">Veículo</div>
                    <div class="detalhes-grid-header">Litros</div>
                    <div class="detalhes-grid-header">R$/Litro</div>
                    <div class="detalhes-grid-header">Total</div>
                `;
                document.getElementById('detalhesVazio').style.display = 'block';
                document.getElementById('detalhesVazio').innerHTML = '<i class="fa-duotone fa-circle-exclamation fa-2x mb-2"></i><div>Erro ao carregar detalhes</div>';
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("dashboard-abastecimento.js", "abrirModalDetalhes", error);
    }
}
