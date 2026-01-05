// ========================================
// DASHBOARD DE MOTORISTAS - FROTIX
// ========================================

// Paleta de Cores FrotiX - Verde Esmeralda
const CORES_MOTORISTAS = {
    esmeralda: '#059669',
    verde: '#16a34a',
    azul: '#0D47A1',
    laranja: '#d97706',
    amarelo: '#f59e0b',
    vermelho: '#dc2626',
    roxo: '#9d4edd',
    ciano: '#22d3ee',
    rosa: '#ec4899'
};

// ========================================
// FUNÇÃO DE FORMATAÇÃO DE NÚMEROS
// ========================================

function formatarNumero(valor, casasDecimais = 0) {
    try {
        if (valor === null || valor === undefined || isNaN(valor)) {
            return '0';
        }
        const valorArredondado = Number(valor).toFixed(casasDecimais);
        const partes = valorArredondado.split('.');
        const parteInteira = partes[0];
        const parteDecimal = partes[1];
        const parteInteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        if (casasDecimais > 0 && parteDecimal) {
            return `${parteInteiraFormatada},${parteDecimal}`;
        }
        return parteInteiraFormatada;
    } catch (error) {
        console.error('Erro ao formatar número:', error);
        return '0';
    }
}

function formatarValorMonetario(valor) {
    try {
        if (valor === null || valor === undefined || isNaN(valor)) {
            return '0';
        }
        const valorNumerico = Number(valor);
        if (valorNumerico < 100) {
            return formatarNumero(valorNumerico, 2);
        }
        return formatarNumero(valorNumerico, 0);
    } catch (error) {
        console.error('Erro ao formatar valor monetário:', error);
        return '0';
    }
}

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

let periodoAtual = {
    dataInicio: null,
    dataFim: null
};

let filtroAnoMes = {
    ano: null,
    mes: null
};

let usarFiltroAnoMes = true; // true = usa ano/mês, false = usa período personalizado

let motoristaFiltro = null;

const NOMES_MESES = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Instâncias dos gráficos
let chartViagensPorMotorista = null;
let chartKmPorMotorista = null;
let chartDistribuicaoTipo = null;
let chartDistribuicaoStatus = null;
let chartEvolucaoViagens = null;
let chartHorasPorMotorista = null;
let chartAbastecimentosPorMotorista = null;
let chartMultasPorMotorista = null;
let chartTempoEmpresa = null;
let chartHeatmapViagens = null;

// ========================================
// LOADING INICIAL DA PÁGINA
// ========================================

function mostrarLoadingInicial() {
    try {
        const loadingEl = document.getElementById('loadingInicialDashboardMot');
        if (loadingEl) {
            loadingEl.style.display = 'flex';
        }
    } catch (error) {
        console.error('Erro ao mostrar loading inicial:', error);
    }
}

function esconderLoadingInicial() {
    try {
        const loadingEl = document.getElementById('loadingInicialDashboardMot');
        if (loadingEl) {
            loadingEl.style.opacity = '0';
            setTimeout(function() {
                loadingEl.style.display = 'none';
            }, 300);
        }
    } catch (error) {
        console.error('Erro ao esconder loading inicial:', error);
    }
}

function mostrarLoadingGeral(mensagem = 'Atualizando dados...') {
    // Remove loading anterior se existir
    $('#loadingGeralDashboardMot').remove();

    // Cria loading padrão FrotiX
    const html = `
        <div id="loadingGeralDashboardMot" class="ftx-spin-overlay" style="z-index: 999999; cursor: wait;">
            <div class="ftx-spin-box" style="text-align: center; min-width: 300px;">
                <img src="/images/logo_gota_frotix_transparente.png" alt="FrotiX" class="ftx-loading-logo" style="display: block;" />
                <div class="ftx-loading-bar"></div>
                <div class="ftx-loading-text">${mensagem}</div>
                <div class="ftx-loading-subtext">Aguarde, por favor</div>
            </div>
        </div>
    `;
    $('body').append(html);
}

function esconderLoadingGeral() {
    $('#loadingGeralDashboardMot').fadeOut(300, function() {
        $(this).remove();
    });
}

// ========================================
// INICIALIZAÇÃO
// ========================================

async function inicializarDashboard() {
    try {
        mostrarLoadingInicial();

        // Carrega anos/meses disponíveis primeiro
        await carregarAnosMesesDisponiveis();

        // Inicializa campos de data (para modo período personalizado)
        inicializarCamposData();

        // Carrega lista de motoristas para o filtro
        await carregarListaMotoristas();

        // Carrega dashboard (usará filtro ano/mês por padrão)
        await carregarDadosDashboard();

        esconderLoadingInicial();

        if (typeof AppToast !== 'undefined') {
            AppToast.show('Verde', 'Dashboard carregado com sucesso!', 3000);
        }
    } catch (error) {
        esconderLoadingInicial();
        console.error('Erro ao inicializar dashboard:', error);
        if (typeof Alerta !== 'undefined') {
            Alerta.TratamentoErroComLinha('dashboard-motoristas.js', 'inicializarDashboard', error);
        }
    }
}

// ========================================
// CARREGAR ANOS E MESES DISPONÍVEIS
// ========================================

async function carregarAnosMesesDisponiveis() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterAnosMesesDisponiveis',
            type: 'GET'
        });

        if (response.success && response.anos && response.anos.length > 0) {
            const selectAno = document.getElementById('filtroAno');
            const selectMes = document.getElementById('filtroMes');

            if (selectAno) {
                selectAno.innerHTML = '<option value="">&lt;Todos os Anos&gt;</option>';
                response.anos.forEach(ano => {
                    const option = document.createElement('option');
                    option.value = ano;
                    option.textContent = ano;
                    selectAno.appendChild(option);
                });

                // Seleciona o ano mais recente por padrão
                selectAno.value = response.anos[0];
                filtroAnoMes.ano = response.anos[0];

                // Carrega meses do ano selecionado
                await carregarMesesPorAno(response.anos[0]);
            }
        } else {
            // Se não há dados, usa data atual como fallback
            const hoje = new Date();
            filtroAnoMes.ano = hoje.getFullYear();
            filtroAnoMes.mes = hoje.getMonth() + 1;
            usarFiltroAnoMes = false;

            // Configura período padrão
            periodoAtual.dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
            periodoAtual.dataInicio = new Date(periodoAtual.dataFim);
            periodoAtual.dataInicio.setDate(periodoAtual.dataInicio.getDate() - 30);
        }
    } catch (error) {
        console.error('Erro ao carregar anos/meses disponíveis:', error);
        // Fallback para período padrão
        usarFiltroAnoMes = false;
        const hoje = new Date();
        periodoAtual.dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
        periodoAtual.dataInicio = new Date(periodoAtual.dataFim);
        periodoAtual.dataInicio.setDate(periodoAtual.dataInicio.getDate() - 30);
    }
}

async function carregarMesesPorAno(ano) {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterMesesPorAno',
            type: 'GET',
            data: { ano: ano }
        });

        if (response.success && response.meses && response.meses.length > 0) {
            const selectMes = document.getElementById('filtroMes');
            if (selectMes) {
                selectMes.innerHTML = '';
                response.meses.forEach(mes => {
                    const option = document.createElement('option');
                    option.value = mes;
                    option.textContent = NOMES_MESES[mes];
                    selectMes.appendChild(option);
                });

                // Seleciona o mês mais recente por padrão
                selectMes.value = response.meses[0];
                filtroAnoMes.mes = response.meses[0];

                // Atualiza indicador
                atualizarIndicadorPeriodo();
            }
        }
    } catch (error) {
        console.error('Erro ao carregar meses por ano:', error);
    }
}

function atualizarIndicadorPeriodo() {
    const indicador = document.getElementById('indicadorPeriodo');
    const labelPeriodo = document.getElementById('periodoAtualLabel');
    let textoIndicador = '';

    if (usarFiltroAnoMes && filtroAnoMes.ano && filtroAnoMes.mes) {
        textoIndicador = `${NOMES_MESES[filtroAnoMes.mes]}/${filtroAnoMes.ano}`;
    } else if (!usarFiltroAnoMes && periodoAtual.dataInicio && periodoAtual.dataFim) {
        const inicio = periodoAtual.dataInicio.toLocaleDateString('pt-BR');
        const fim = periodoAtual.dataFim.toLocaleDateString('pt-BR');
        textoIndicador = `${inicio} a ${fim}`;
    }

    if (indicador) {
        if (textoIndicador) {
            indicador.textContent = textoIndicador;
            indicador.style.display = 'inline';
        } else {
            indicador.style.display = 'none';
        }
    }

    // Atualiza também o label do período na caixa de filtros
    if (labelPeriodo && textoIndicador) {
        labelPeriodo.innerHTML = `<strong>Exibindo dados de:</strong> ${textoIndicador}`;
    }
}

function aplicarFiltroAnoMes() {
    const selectAno = document.getElementById('filtroAno');
    const selectMes = document.getElementById('filtroMes');

    if (!selectAno?.value || !selectMes?.value) {
        if (typeof AppToast !== 'undefined') {
            AppToast.show('Amarelo', 'Selecione o ano e o mês para filtrar.', 3000);
        }
        return;
    }

    filtroAnoMes.ano = parseInt(selectAno.value);
    filtroAnoMes.mes = parseInt(selectMes.value);
    usarFiltroAnoMes = true;

    // Remove classe active dos botões de período rápido
    document.querySelectorAll('.btn-period-mot').forEach(btn => btn.classList.remove('active'));

    // Atualiza indicador
    atualizarIndicadorPeriodo();

    // Recarrega dashboard
    carregarDadosDashboard();

    // Se tiver motorista selecionado, recarrega dados individuais e tabelas comparativas
    if (motoristaFiltro) {
        carregarDadosMotoristaIndividual(motoristaFiltro);
        carregarTabelasComparativas(motoristaFiltro);
    }

    if (typeof AppToast !== 'undefined') {
        AppToast.show('Verde', `Exibindo dados de ${NOMES_MESES[filtroAnoMes.mes]}/${filtroAnoMes.ano}`, 3000);
    }
}

// Função auxiliar para obter parâmetros de filtro atuais
function obterParametrosFiltro() {
    if (usarFiltroAnoMes && filtroAnoMes.ano && filtroAnoMes.mes) {
        return {
            ano: filtroAnoMes.ano,
            mes: filtroAnoMes.mes
        };
    } else {
        return {
            dataInicio: periodoAtual.dataInicio.toISOString(),
            dataFim: periodoAtual.dataFim.toISOString()
        };
    }
}

// ========================================
// CAMPOS DE DATA HTML5
// ========================================

function inicializarCamposData() {
    try {
        const dataInicio = document.getElementById('dataInicio');
        const dataFim = document.getElementById('dataFim');

        if (dataInicio && dataFim) {
            dataInicio.value = formatarDataParaInput(periodoAtual.dataInicio);
            dataFim.value = formatarDataParaInput(periodoAtual.dataFim);

            dataInicio.addEventListener('change', function() {
                periodoAtual.dataInicio = new Date(this.value + 'T00:00:00');
            });

            dataFim.addEventListener('change', function() {
                periodoAtual.dataFim = new Date(this.value + 'T23:59:59');
            });
        }
    } catch (error) {
        console.error('Erro ao inicializar campos de data:', error);
    }
}

function formatarDataParaInput(data) {
    try {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    } catch (error) {
        return '';
    }
}

// ========================================
// LISTA DE MOTORISTAS PARA FILTRO
// ========================================

async function carregarListaMotoristas() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterListaMotoristas',
            type: 'GET'
        });

        if (response.success) {
            const select = document.getElementById('filtroMotorista');
            if (select) {
                select.innerHTML = '<option value="">Todos os Motoristas</option>';
                response.data.forEach(m => {
                    const option = document.createElement('option');
                    option.value = m.motoristaId;
                    option.textContent = m.nome;
                    select.appendChild(option);
                });

                // Evento de mudança
                select.addEventListener('change', function() {
                    motoristaFiltro = this.value || null;
                    if (motoristaFiltro) {
                        carregarDadosMotoristaIndividual(motoristaFiltro);
                        carregarTabelasComparativas(motoristaFiltro); // Tabelas comparativas
                        mostrarSecaoIndividual();
                    } else {
                        esconderSecaoIndividual();
                    }
                    // Atualiza gráficos que filtram por motorista
                    carregarEvolucaoViagens();
                    carregarHeatmapViagens();
                });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar lista de motoristas:', error);
    }
}

function mostrarSecaoIndividual() {
    const secao = document.getElementById('secaoMotoristaIndividual');
    if (secao) {
        secao.classList.add('visible');
    }
    // Esconde seções coletivas quando motorista é selecionado
    esconderSecoesColetivas();
}

function esconderSecaoIndividual() {
    const secao = document.getElementById('secaoMotoristaIndividual');
    if (secao) {
        secao.classList.remove('visible');
    }
    // Mostra seções coletivas novamente
    mostrarSecoesColetivas();
}

function esconderSecoesColetivas() {
    const secoes = ['secaoCardsColetivos', 'secaoGraficosColetivos', 'secaoGraficosColetivos2', 'secaoTabelasColetivas'];
    secoes.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    // Atualiza subtítulo do gráfico de evolução
    const evolucaoSub = document.getElementById('evolucaoSubtitle');
    if (evolucaoSub && motoristaFiltro) {
        const select = document.getElementById('filtroMotorista');
        const nome = select?.options[select.selectedIndex]?.text || '';
        evolucaoSub.textContent = `(${nome})`;
    }
}

function mostrarSecoesColetivas() {
    const secoes = ['secaoCardsColetivos', 'secaoGraficosColetivos', 'secaoGraficosColetivos2', 'secaoTabelasColetivas'];
    secoes.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
    });
    // Limpa subtítulo do gráfico de evolução
    const evolucaoSub = document.getElementById('evolucaoSubtitle');
    if (evolucaoSub) {
        evolucaoSub.textContent = '';
    }
}

// ========================================
// CARREGAR DADOS
// ========================================

async function carregarDadosDashboard() {
    try {
        console.log('⏱️ Iniciando carregamento do dashboard de motoristas...');
        const inicio = performance.now();

        mostrarLoadingGeral();

        const resultados = await Promise.allSettled([
            carregarEstatisticasGerais(),
            carregarTop10PorViagens(),
            carregarTop10PorKm(),
            carregarDistribuicaoPorTipo(),
            carregarDistribuicaoPorStatus(),
            carregarEvolucaoViagens(),
            carregarTop10PorHoras(),
            carregarTop10PorAbastecimentos(),
            carregarMotoristasComMaisMultas(),
            carregarDistribuicaoPorTempoEmpresa(),
            carregarMotoristasComCnhProblema(),
            carregarTop10Performance(),
            carregarHeatmapViagens()
        ]);

        const tempo = ((performance.now() - inicio) / 1000).toFixed(2);
        console.log(`✅ Dashboard de motoristas carregado em ${tempo}s`);

        esconderLoadingGeral();

        // Atualiza indicador de período após carregamento
        atualizarIndicadorPeriodo();
    } catch (error) {
        esconderLoadingGeral();
        console.error('Erro ao carregar dados do dashboard:', error);
    }
}

// ========================================
// ESTATÍSTICAS GERAIS
// ========================================

async function carregarEstatisticasGerais() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterEstatisticasGerais',
            type: 'GET',
            data: obterParametrosFiltro()
        });

        if (response.success) {
            // Cards gerais
            atualizarElemento('statTotalMotoristas', formatarNumero(response.totalMotoristas));
            atualizarElemento('statMotoristasAtivos', formatarNumero(response.motoristasAtivos));
            atualizarElemento('statTotalViagens', formatarNumero(response.totalViagens));
            atualizarElemento('statKmTotal', formatarNumero(response.kmTotal) + ' km');
            atualizarElemento('statHorasTotais', formatarNumero(response.horasTotais, 1) + 'h');

            // Cards por tipo
            atualizarElemento('statEfetivos', formatarNumero(response.efetivos));
            atualizarElemento('statFeristas', formatarNumero(response.feristas));
            atualizarElemento('statCobertura', formatarNumero(response.cobertura));
            atualizarElemento('statInativos', formatarNumero(response.motoristasInativos));

            // Percentuais
            const total = response.motoristasAtivos || 1;
            atualizarElemento('percentualAtivos', `${Math.round((response.motoristasAtivos / response.totalMotoristas) * 100)}% do total`);
            atualizarElemento('percentualEfetivos', `${Math.round((response.efetivos / total) * 100)}% dos ativos`);
            atualizarElemento('percentualFeristas', `${Math.round((response.feristas / total) * 100)}% dos ativos`);
            atualizarElemento('percentualCobertura', `${Math.round((response.cobertura / total) * 100)}% dos ativos`);
            atualizarElemento('percentualInativos', `${Math.round((response.motoristasInativos / response.totalMotoristas) * 100)}% do total`);

            // CNH e Multas
            atualizarElemento('statCnhVencidas', formatarNumero(response.cnhVencidas));
            atualizarElemento('statCnhVencendo', formatarNumero(response.cnhVencendo30Dias));
            atualizarElemento('statTotalMultas', formatarNumero(response.totalMultas));
            atualizarElemento('valorTotalMultas', 'R$ ' + formatarValorMonetario(response.valorTotalMultas));

            // Alertas
            if (response.cnhVencidas > 0) {
                atualizarElemento('alertaCnhVencidas', 'requer atenção imediata!');
                document.getElementById('alertaCnhVencidas')?.classList.add('variacao-negativa');
            }
            if (response.cnhVencendo30Dias > 0) {
                atualizarElemento('alertaCnhVencendo', 'renovar em breve');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas gerais:', error);
    }
}

function atualizarElemento(id, valor) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = valor;
    }
}

// ========================================
// DADOS DO MOTORISTA INDIVIDUAL
// ========================================

async function carregarDadosMotoristaIndividual(motoristaId) {
    try {
        const params = obterParametrosFiltro();
        params.motoristaId = motoristaId;

        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterDadosMotorista',
            type: 'GET',
            data: params
        });

        if (response.success) {
            const m = response.motorista;
            const e = response.estatisticas;

            // Título (usando camelCase - nome das propriedades do JSON)
            atualizarElemento('tituloMotoristaIndividual', `Dados de ${m.nome}`);
            atualizarElemento('nomeMotoristaIndividual', m.nome || '-');
            atualizarElemento('cpfMotoristaIndividual', `CPF: ${m.cpf || '-'}`);
            atualizarElemento('pontoMotoristaIndividual', `Ponto: ${m.ponto || '-'}`);

            // Data de Ingresso e Tempo na Empresa
            atualizarElemento('dataIngressoIndividual', m.dataIngresso || '-');
            atualizarElemento('tempoEmpresaIndividual', m.tempoEmpresa || '-');

            // Badge Tipo
            const badgeTipo = document.getElementById('badgeTipoMotorista');
            if (badgeTipo) {
                badgeTipo.className = 'badge-tipo-motorista';
                const tipo = m.efetivoFerista || 'Efetivo';
                badgeTipo.textContent = tipo;
                if (tipo === 'Ferista') {
                    badgeTipo.classList.add('badge-ferista');
                } else if (tipo === 'Cobertura') {
                    badgeTipo.classList.add('badge-cobertura');
                } else {
                    badgeTipo.classList.add('badge-efetivo');
                }
            }

            // Badge Status (usando camelCase)
            const badgeStatus = document.getElementById('badgeStatusMotorista');
            if (badgeStatus) {
                if (m.status === true) {
                    badgeStatus.className = 'badge ms-2 bg-success';
                    badgeStatus.textContent = 'Ativo';
                } else {
                    badgeStatus.className = 'badge ms-2 bg-secondary';
                    badgeStatus.textContent = 'Inativo';
                }
            }

            // Foto (usando camelCase)
            const fotoContainer = document.getElementById('fotoMotorista');
            if (fotoContainer) {
                if (m.temFoto) {
                    fotoContainer.innerHTML = `<img src="/api/DashboardMotoristas/ObterFotoMotorista/${motoristaId}" class="foto-motorista" alt="Foto do motorista" />`;
                    fotoContainer.className = '';
                } else {
                    fotoContainer.innerHTML = '<i class="fa-duotone fa-user"></i>';
                    fotoContainer.className = 'foto-motorista-placeholder';
                }
            }

            // CNH (usando camelCase)
            atualizarElemento('statVencimentoCnhIndividual', m.dataVencimentoCnh || '-');
            atualizarElemento('statCategoriaCnhIndividual', m.categoriaCNH || '-');

            // Badge CNH
            const badgeCnh = document.getElementById('badgeCnhStatus');
            if (badgeCnh) {
                badgeCnh.className = '';
                if (m.statusCnh === 'Vencida') {
                    badgeCnh.className = 'badge-cnh-vencida';
                    badgeCnh.textContent = 'Vencida';
                    atualizarElemento('diasParaVencerCnh', `Venceu há ${Math.abs(m.diasParaVencerCnh)} dias`);
                } else if (m.statusCnh === 'Vencendo') {
                    badgeCnh.className = 'badge-cnh-vencendo';
                    badgeCnh.textContent = 'Vencendo';
                    atualizarElemento('diasParaVencerCnh', `Vence em ${m.diasParaVencerCnh} dias`);
                } else {
                    badgeCnh.className = 'badge-cnh-ok';
                    badgeCnh.textContent = 'OK';
                    atualizarElemento('diasParaVencerCnh', m.diasParaVencerCnh ? `Vence em ${m.diasParaVencerCnh} dias` : '-');
                }
            }

            // Estatísticas individuais
            atualizarElemento('statViagensIndividual', formatarNumero(e.totalViagens));
            atualizarElemento('statKmIndividual', formatarNumero(e.kmTotal) + ' km');
            atualizarElemento('statHorasDirigidasIndividual', formatarNumero(e.horasDirigidas, 1) + 'h');
            atualizarElemento('statAbastecimentosIndividual', formatarNumero(e.abastecimentos));
            atualizarElemento('statMultasIndividual', formatarNumero(e.totalMultas));
            atualizarElemento('valorMultasIndividual', 'R$ ' + formatarValorMonetario(e.valorMultas));
            atualizarElemento('statMediaKmViagemIndividual', formatarNumero(e.mediaKmPorViagem, 1) + ' km');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do motorista:', error);
    }
}

// ========================================
// TOP 10 MOTORISTAS POR VIAGENS
// ========================================

async function carregarTop10PorViagens() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterTop10PorViagens',
            type: 'GET',
            data: obterParametrosFiltro()
        });

        if (response.success && response.data.length > 0) {
            const dados = response.data.map(item => ({
                x: item.motorista.length > 15 ? item.motorista.substring(0, 12) + '...' : item.motorista,
                y: item.totalViagens,
                nomeCompleto: item.motorista
            }));

            if (chartViagensPorMotorista) {
                chartViagensPorMotorista.destroy();
            }

            chartViagensPorMotorista = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labelStyle: { size: '11px' },
                    labelIntersectAction: 'Rotate45'
                },
                primaryYAxis: {
                    title: 'Viagens',
                    labelFormat: '{value}'
                },
                series: [{
                    dataSource: dados,
                    xName: 'x',
                    yName: 'y',
                    type: 'Column',
                    fill: CORES_MOTORISTAS.azul,
                    cornerRadius: { topLeft: 4, topRight: 4 }
                }],
                tooltip: {
                    enable: true,
                    format: '${point.x}: ${point.y} viagens'
                },
                chartArea: { border: { width: 0 } }
            });

            chartViagensPorMotorista.appendTo('#chartViagensPorMotorista');
        }
    } catch (error) {
        console.error('Erro ao carregar top 10 por viagens:', error);
    }
}

// ========================================
// TOP 10 MOTORISTAS POR QUILOMETRAGEM
// ========================================

async function carregarTop10PorKm() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterTop10PorKm',
            type: 'GET',
            data: obterParametrosFiltro()
        });

        if (response.success && response.data.length > 0) {
            const dados = response.data.map(item => ({
                x: item.motorista.length > 15 ? item.motorista.substring(0, 12) + '...' : item.motorista,
                y: Number(item.kmTotal),
                nomeCompleto: item.motorista
            }));

            if (chartKmPorMotorista) {
                chartKmPorMotorista.destroy();
            }

            chartKmPorMotorista = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labelStyle: { size: '11px' },
                    labelIntersectAction: 'Rotate45'
                },
                primaryYAxis: {
                    title: 'Quilômetros',
                    labelFormat: '{value}'
                },
                series: [{
                    dataSource: dados,
                    xName: 'x',
                    yName: 'y',
                    type: 'Column',
                    fill: CORES_MOTORISTAS.laranja,
                    cornerRadius: { topLeft: 4, topRight: 4 }
                }],
                tooltip: {
                    enable: true,
                    format: '${point.x}: ${point.y} km'
                },
                chartArea: { border: { width: 0 } }
            });

            chartKmPorMotorista.appendTo('#chartKmPorMotorista');
        }
    } catch (error) {
        console.error('Erro ao carregar top 10 por km:', error);
    }
}

// ========================================
// DISTRIBUIÇÃO POR TIPO
// ========================================

async function carregarDistribuicaoPorTipo() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterDistribuicaoPorTipo',
            type: 'GET'
        });

        if (response.success && response.data.length > 0) {
            const coresTipo = {
                'Efetivo': CORES_MOTORISTAS.esmeralda,
                'Ferista': CORES_MOTORISTAS.ciano,
                'Cobertura': CORES_MOTORISTAS.roxo
            };

            const dados = response.data.map(item => ({
                x: item.tipo,
                y: item.quantidade,
                fill: coresTipo[item.tipo] || CORES_MOTORISTAS.verde
            }));

            if (chartDistribuicaoTipo) {
                chartDistribuicaoTipo.destroy();
            }

            chartDistribuicaoTipo = new ej.charts.AccumulationChart({
                series: [{
                    dataSource: dados,
                    xName: 'x',
                    yName: 'y',
                    pointColorMapping: 'fill',
                    type: 'Pie',
                    dataLabel: {
                        visible: true,
                        position: 'Outside',
                        name: 'x',
                        font: { size: '12px', fontWeight: '600' },
                        connectorStyle: { length: '20px' }
                    },
                    innerRadius: '40%'
                }],
                legendSettings: {
                    visible: true,
                    position: 'Bottom'
                },
                tooltip: {
                    enable: true,
                    format: '${point.x}: ${point.y} motoristas'
                }
            });

            chartDistribuicaoTipo.appendTo('#chartDistribuicaoTipo');
        }
    } catch (error) {
        console.error('Erro ao carregar distribuição por tipo:', error);
    }
}

// ========================================
// DISTRIBUIÇÃO POR STATUS
// ========================================

async function carregarDistribuicaoPorStatus() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterDistribuicaoPorStatus',
            type: 'GET'
        });

        if (response.success && response.data.length > 0) {
            const coresStatus = {
                'Ativos': CORES_MOTORISTAS.verde,
                'Inativos': '#6b7280'
            };

            const dados = response.data.map(item => ({
                x: item.status,
                y: item.quantidade,
                fill: coresStatus[item.status] || CORES_MOTORISTAS.verde
            }));

            if (chartDistribuicaoStatus) {
                chartDistribuicaoStatus.destroy();
            }

            chartDistribuicaoStatus = new ej.charts.AccumulationChart({
                series: [{
                    dataSource: dados,
                    xName: 'x',
                    yName: 'y',
                    pointColorMapping: 'fill',
                    type: 'Pie',
                    dataLabel: {
                        visible: true,
                        position: 'Outside',
                        name: 'x',
                        font: { size: '12px', fontWeight: '600' },
                        connectorStyle: { length: '20px' }
                    },
                    innerRadius: '40%'
                }],
                legendSettings: {
                    visible: true,
                    position: 'Bottom'
                },
                tooltip: {
                    enable: true,
                    format: '${point.x}: ${point.y} motoristas'
                }
            });

            chartDistribuicaoStatus.appendTo('#chartDistribuicaoStatus');
        }
    } catch (error) {
        console.error('Erro ao carregar distribuição por status:', error);
    }
}

// ========================================
// EVOLUÇÃO DE VIAGENS NO PERÍODO
// ========================================

async function carregarEvolucaoViagens() {
    try {
        const params = obterParametrosFiltro();

        // Se tiver motorista selecionado, filtra por ele
        if (motoristaFiltro) {
            params.motoristaId = motoristaFiltro;
        }

        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterEvolucaoViagens',
            type: 'GET',
            data: params
        });

        if (response.success && response.data.length > 0) {
            const dados = response.data.map(item => ({
                x: new Date(item.data),
                y: item.totalViagens
            }));

            if (chartEvolucaoViagens) {
                chartEvolucaoViagens.destroy();
            }

            chartEvolucaoViagens = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'DateTime',
                    labelFormat: 'dd/MM',
                    intervalType: 'Days',
                    edgeLabelPlacement: 'Shift'
                },
                primaryYAxis: {
                    title: 'Viagens',
                    labelFormat: '{value}'
                },
                series: [{
                    dataSource: dados,
                    xName: 'x',
                    yName: 'y',
                    type: 'SplineArea',
                    fill: CORES_MOTORISTAS.esmeralda,
                    opacity: 0.3,
                    border: { width: 2, color: CORES_MOTORISTAS.esmeralda },
                    marker: {
                        visible: true,
                        width: 6,
                        height: 6,
                        fill: CORES_MOTORISTAS.esmeralda
                    }
                }],
                tooltip: {
                    enable: true,
                    format: '${point.x}: ${point.y} viagens'
                },
                chartArea: { border: { width: 0 } }
            });

            chartEvolucaoViagens.appendTo('#chartEvolucaoViagens');
        }
    } catch (error) {
        console.error('Erro ao carregar evolução de viagens:', error);
    }
}

// ========================================
// TOP 10 MOTORISTAS POR HORAS DIRIGIDAS
// ========================================

async function carregarTop10PorHoras() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterTop10PorHoras',
            type: 'GET',
            data: obterParametrosFiltro()
        });

        if (response.success && response.data.length > 0) {
            const dados = response.data.map(item => ({
                x: item.motorista.length > 15 ? item.motorista.substring(0, 12) + '...' : item.motorista,
                y: item.horasTotais
            }));

            if (chartHorasPorMotorista) {
                chartHorasPorMotorista.destroy();
            }

            chartHorasPorMotorista = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labelStyle: { size: '11px' },
                    labelIntersectAction: 'Rotate45'
                },
                primaryYAxis: {
                    title: 'Horas',
                    labelFormat: '{value}h'
                },
                series: [{
                    dataSource: dados,
                    xName: 'x',
                    yName: 'y',
                    type: 'Column',
                    fill: CORES_MOTORISTAS.roxo,
                    cornerRadius: { topLeft: 4, topRight: 4 }
                }],
                tooltip: {
                    enable: true,
                    format: '${point.x}: ${point.y}h'
                },
                chartArea: { border: { width: 0 } }
            });

            chartHorasPorMotorista.appendTo('#chartHorasPorMotorista');
        }
    } catch (error) {
        console.error('Erro ao carregar top 10 por horas:', error);
    }
}

// ========================================
// TOP 10 MOTORISTAS POR ABASTECIMENTOS
// ========================================

async function carregarTop10PorAbastecimentos() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterTop10PorAbastecimentos',
            type: 'GET',
            data: obterParametrosFiltro()
        });

        if (response.success && response.data.length > 0) {
            const dados = response.data.map(item => ({
                x: item.motorista.length > 15 ? item.motorista.substring(0, 12) + '...' : item.motorista,
                y: item.totalAbastecimentos
            }));

            if (chartAbastecimentosPorMotorista) {
                chartAbastecimentosPorMotorista.destroy();
            }

            chartAbastecimentosPorMotorista = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labelStyle: { size: '11px' },
                    labelIntersectAction: 'Rotate45'
                },
                primaryYAxis: {
                    title: 'Abastecimentos',
                    labelFormat: '{value}'
                },
                series: [{
                    dataSource: dados,
                    xName: 'x',
                    yName: 'y',
                    type: 'Column',
                    fill: CORES_MOTORISTAS.amarelo,
                    cornerRadius: { topLeft: 4, topRight: 4 }
                }],
                tooltip: {
                    enable: true,
                    format: '${point.x}: ${point.y} abastecimentos'
                },
                chartArea: { border: { width: 0 } }
            });

            chartAbastecimentosPorMotorista.appendTo('#chartAbastecimentosPorMotorista');
        } else {
            // Exibe mensagem quando não há abastecimentos no período
            if (chartAbastecimentosPorMotorista) {
                chartAbastecimentosPorMotorista.destroy();
                chartAbastecimentosPorMotorista = null;
            }
            document.getElementById('chartAbastecimentosPorMotorista').innerHTML = '<div class="text-center text-muted py-5"><i class="fa-duotone fa-gas-pump fa-3x mb-3" style="color: #d97706;"></i><p>Não há Abastecimentos no Período</p></div>';
        }
    } catch (error) {
        console.error('Erro ao carregar top 10 por abastecimentos:', error);
    }
}

// ========================================
// MOTORISTAS COM MAIS MULTAS
// ========================================

async function carregarMotoristasComMaisMultas() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterMotoristasComMaisMultas',
            type: 'GET',
            data: obterParametrosFiltro()
        });

        if (response.success && response.data.length > 0) {
            const dados = response.data.map(item => ({
                x: item.motorista.length > 15 ? item.motorista.substring(0, 12) + '...' : item.motorista,
                y: item.totalMultas
            }));

            if (chartMultasPorMotorista) {
                chartMultasPorMotorista.destroy();
            }

            chartMultasPorMotorista = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labelStyle: { size: '11px' },
                    labelIntersectAction: 'Rotate45'
                },
                primaryYAxis: {
                    title: 'Multas',
                    labelFormat: '{value}'
                },
                series: [{
                    dataSource: dados,
                    xName: 'x',
                    yName: 'y',
                    type: 'Column',
                    fill: CORES_MOTORISTAS.vermelho,
                    cornerRadius: { topLeft: 4, topRight: 4 }
                }],
                tooltip: {
                    enable: true,
                    format: '${point.x}: ${point.y} multas'
                },
                chartArea: { border: { width: 0 } }
            });

            chartMultasPorMotorista.appendTo('#chartMultasPorMotorista');
        } else {
            document.getElementById('chartMultasPorMotorista').innerHTML = '<div class="text-center text-muted py-5"><i class="fa-duotone fa-check-circle fa-3x mb-3 text-success"></i><p>Nenhuma multa registrada no período</p></div>';
        }
    } catch (error) {
        console.error('Erro ao carregar motoristas com mais multas:', error);
    }
}

// ========================================
// DISTRIBUIÇÃO POR TEMPO DE EMPRESA
// ========================================

async function carregarDistribuicaoPorTempoEmpresa() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterDistribuicaoPorTempoEmpresa',
            type: 'GET'
        });

        if (response.success && response.data.length > 0) {
            const coresFaixas = [
                CORES_MOTORISTAS.ciano,
                CORES_MOTORISTAS.azul,
                CORES_MOTORISTAS.esmeralda,
                CORES_MOTORISTAS.laranja,
                CORES_MOTORISTAS.roxo
            ];

            const dados = response.data.map((item, index) => ({
                x: item.faixa,
                y: item.quantidade,
                fill: coresFaixas[index % coresFaixas.length]
            }));

            if (chartTempoEmpresa) {
                chartTempoEmpresa.destroy();
            }

            chartTempoEmpresa = new ej.charts.AccumulationChart({
                series: [{
                    dataSource: dados,
                    xName: 'x',
                    yName: 'y',
                    pointColorMapping: 'fill',
                    type: 'Pie',
                    dataLabel: {
                        visible: true,
                        position: 'Outside',
                        name: 'x',
                        font: { size: '11px', fontWeight: '600' },
                        connectorStyle: { length: '15px' }
                    },
                    innerRadius: '40%'
                }],
                legendSettings: {
                    visible: true,
                    position: 'Bottom'
                },
                tooltip: {
                    enable: true,
                    format: '${point.x}: ${point.y} motoristas'
                }
            });

            chartTempoEmpresa.appendTo('#chartTempoEmpresa');
        }
    } catch (error) {
        console.error('Erro ao carregar distribuição por tempo de empresa:', error);
    }
}

// ========================================
// MOTORISTAS COM CNH PROBLEMA
// ========================================

async function carregarMotoristasComCnhProblema() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterMotoristasComCnhProblema',
            type: 'GET'
        });

        if (response.success) {
            const tbody = document.getElementById('tabelaCnhBody');
            if (tbody) {
                if (response.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="fa-duotone fa-check-circle text-success me-2"></i>Nenhum motorista com CNH vencida ou vencendo</td></tr>';
                    return;
                }

                let html = '';
                response.data.forEach(item => {
                    const badgeClass = item.status === 'Vencida' ? 'bg-danger' : 'bg-warning';
                    const diasTexto = item.dias < 0 ? `${Math.abs(item.dias)} dias atrás` : `${item.dias} dias`;

                    html += `
                        <tr>
                            <td>${item.motorista}</td>
                            <td class="text-center">${item.cnh || '-'}</td>
                            <td class="text-center">${item.categoria || '-'}</td>
                            <td class="text-center">${item.dataVencimento}</td>
                            <td class="text-center"><span class="badge ${badgeClass}">${item.status}</span></td>
                            <td class="text-center">${diasTexto}</td>
                        </tr>
                    `;
                });

                tbody.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar motoristas com CNH problema:', error);
    }
}

// ========================================
// TOP 10 MOTORISTAS POR PERFORMANCE
// ========================================

async function carregarTop10Performance() {
    try {
        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterTop10Performance',
            type: 'GET',
            data: obterParametrosFiltro()
        });

        if (response.success) {
            const tbody = document.getElementById('tabelaTop10Body');
            if (tbody) {
                if (response.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Nenhum dado disponível para o período</td></tr>';
                    return;
                }

                let html = '';
                response.data.forEach((item, index) => {
                    const medalha = index < 3 ? ['🥇', '🥈', '🥉'][index] : (index + 1);
                    const badgeTipo = item.tipo === 'Efetivo' ? 'badge-efetivo' :
                                      item.tipo === 'Ferista' ? 'badge-ferista' : 'badge-cobertura';

                    html += `
                        <tr>
                            <td class="text-center fw-bold">${medalha}</td>
                            <td>${item.motorista}</td>
                            <td class="text-center"><span class="badge-tipo-motorista ${badgeTipo}" style="padding: 3px 8px; font-size: 0.7rem;">${item.tipo}</span></td>
                            <td class="text-center">${formatarNumero(item.totalViagens)}</td>
                            <td class="text-center">${formatarNumero(item.kmTotal)} km</td>
                            <td class="text-center">${formatarNumero(item.horasTotais, 1)}h</td>
                            <td class="text-center">${item.totalMultas > 0 ? '<span class="text-danger">' + item.totalMultas + '</span>' : '<span class="text-success">0</span>'}</td>
                        </tr>
                    `;
                });

                tbody.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar top 10 performance:', error);
    }
}

// ========================================
// MAPA DE CALOR - VIAGENS POR DIA DA SEMANA E HORA
// ========================================

async function carregarHeatmapViagens() {
    try {
        const params = obterParametrosFiltro();

        // Se tiver motorista selecionado, adiciona ao filtro
        if (motoristaFiltro) {
            params.motoristaId = motoristaFiltro;
        }

        const response = await $.ajax({
            url: '/api/DashboardMotoristas/ObterHeatmapViagens',
            type: 'GET',
            data: params
        });

        if (response.success) {
            // Atualiza subtítulo
            const subtitle = document.getElementById('heatmapSubtitle');
            if (subtitle) {
                if (motoristaFiltro) {
                    const select = document.getElementById('filtroMotorista');
                    const nomeMotorista = select?.options[select.selectedIndex]?.text || 'Motorista Selecionado';
                    subtitle.textContent = `(${nomeMotorista})`;
                } else {
                    subtitle.textContent = '(Todos os Motoristas)';
                }
            }

            // Atualiza total de viagens
            const totalEl = document.getElementById('heatmapTotalViagens');
            if (totalEl) {
                totalEl.textContent = `Total: ${formatarNumero(response.totalViagens)} viagens no período`;
            }

            // Gera dados completos para o heatmap (todas as combinações de dia/hora)
            const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const horas = [];
            for (let h = 0; h < 24; h++) {
                horas.push(h.toString().padStart(2, '0') + ':00');
            }

            // Cria matriz completa com zeros
            const dadosCompletos = [];
            diasSemana.forEach((dia, diaIndex) => {
                horas.forEach((hora, horaIndex) => {
                    // Procura se existe dado para esta combinação
                    const dado = response.data.find(d => d.x === dia && d.y === hora);
                    dadosCompletos.push({
                        x: dia,
                        y: hora,
                        value: dado ? dado.value : 0
                    });
                });
            });

            // Destroy chart anterior se existir
            if (chartHeatmapViagens) {
                chartHeatmapViagens.destroy();
            }

            // Cria o heatmap usando Syncfusion
            chartHeatmapViagens = new ej.charts.Chart({
                primaryXAxis: {
                    valueType: 'Category',
                    labels: diasSemana,
                    title: 'Dia da Semana',
                    labelStyle: { size: '11px' }
                },
                primaryYAxis: {
                    valueType: 'Category',
                    labels: horas,
                    title: 'Hora do Dia',
                    labelStyle: { size: '10px' },
                    isInversed: false
                },
                series: [{
                    dataSource: dadosCompletos,
                    xName: 'x',
                    yName: 'y',
                    type: 'Heatmap',
                    colorName: 'value',
                    marker: {
                        dataLabel: {
                            visible: true,
                            template: '<div style="font-size:10px;font-weight:bold;color:#333;">${value > 0 ? value : ""}</div>'
                        }
                    }
                }],
                paletteSeries: [
                    { color: '#ecfdf5', value: 0 },
                    { color: '#a7f3d0', value: 1 },
                    { color: '#6ee7b7', value: 3 },
                    { color: '#34d399', value: 5 },
                    { color: '#10b981', value: 10 },
                    { color: '#059669', value: 20 },
                    { color: '#047857', value: response.valorMaximo || 50 }
                ],
                tooltip: {
                    enable: true,
                    format: '${point.x} às ${point.y}: ${point.value} viagens'
                },
                chartArea: { border: { width: 0 } }
            });

            chartHeatmapViagens.appendTo('#heatmapViagens');

            // Como Syncfusion não tem heatmap nativo simples, vamos criar com DIVs
            criarHeatmapDivs(response.data, response.valorMaximo);
        }
    } catch (error) {
        console.error('Erro ao carregar heatmap de viagens:', error);
    }
}

function criarHeatmapDivs(dados, valorMaximo) {
    const container = document.getElementById('heatmapViagens');
    if (!container) return;

    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const horas = [];
    for (let h = 0; h < 24; h++) {
        horas.push(h.toString().padStart(2, '0') + ':00');
    }

    // Mapa de dados para acesso rápido
    const dadosMap = {};
    dados.forEach(d => {
        dadosMap[`${d.x}-${d.y}`] = d.value;
    });

    // Função para determinar cor baseada no valor
    function getColor(value, max) {
        if (value === 0) return '#ecfdf5';
        const ratio = value / (max || 1);
        if (ratio <= 0.1) return '#d1fae5';
        if (ratio <= 0.25) return '#a7f3d0';
        if (ratio <= 0.4) return '#6ee7b7';
        if (ratio <= 0.55) return '#34d399';
        if (ratio <= 0.7) return '#10b981';
        if (ratio <= 0.85) return '#059669';
        return '#047857';
    }

    // Constrói HTML do heatmap
    let html = '<div style="overflow-x: auto;">';
    html += '<table style="border-collapse: collapse; width: 100%; min-width: 600px;">';

    // Header com dias da semana
    html += '<thead><tr><th style="padding: 8px; background: #f3f4f6; border: 1px solid #e5e7eb; font-size: 11px;"></th>';
    diasSemana.forEach(dia => {
        html += `<th style="padding: 8px; background: var(--mot-gradient); color: white; border: 1px solid #e5e7eb; font-size: 11px; text-align: center;">${dia}</th>`;
    });
    html += '</tr></thead>';

    // Corpo com horas e células
    html += '<tbody>';
    horas.forEach(hora => {
        html += `<tr><td style="padding: 6px 8px; background: #f9fafb; border: 1px solid #e5e7eb; font-size: 10px; font-weight: 600; text-align: right; white-space: nowrap;">${hora}</td>`;
        diasSemana.forEach(dia => {
            const value = dadosMap[`${dia}-${hora}`] || 0;
            const color = getColor(value, valorMaximo);
            const textColor = value > 0 ? (value > valorMaximo * 0.5 ? 'white' : '#111827') : 'transparent';
            html += `<td style="padding: 4px; background: ${color}; border: 1px solid #e5e7eb; text-align: center; font-size: 10px; font-weight: bold; color: ${textColor}; cursor: ${value > 0 ? 'pointer' : 'default'};" title="${dia} às ${hora}: ${value} viagem(ns)">${value > 0 ? value : ''}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table></div>';

    container.innerHTML = html;
}

// ========================================
// TABELAS COMPARATIVAS: MOTORISTA VS TOP 10
// ========================================

let dadosMotoristaAtual = null; // Guarda dados do motorista selecionado

async function carregarTabelasComparativas(motoristaId) {
    try {
        const params = obterParametrosFiltro();
        params.motoristaId = motoristaId;

        // Carrega dados em paralelo com tratamento individual de erro
        const [resultMotorista, resultTop10Viagens, resultTop10Km, resultPosicao] = await Promise.allSettled([
            $.ajax({
                url: '/api/DashboardMotoristas/ObterDadosMotorista',
                type: 'GET',
                data: params
            }),
            $.ajax({
                url: '/api/DashboardMotoristas/ObterTop10PorViagens',
                type: 'GET',
                data: obterParametrosFiltro()
            }),
            $.ajax({
                url: '/api/DashboardMotoristas/ObterTop10PorKm',
                type: 'GET',
                data: obterParametrosFiltro()
            }),
            $.ajax({
                url: '/api/DashboardMotoristas/ObterPosicaoMotorista',
                type: 'GET',
                data: params
            })
        ]);

        // Extrai resultados (com fallback para erro)
        const responseMotorista = resultMotorista.status === 'fulfilled' ? resultMotorista.value : null;
        const responseTop10Viagens = resultTop10Viagens.status === 'fulfilled' ? resultTop10Viagens.value : null;
        const responseTop10Km = resultTop10Km.status === 'fulfilled' ? resultTop10Km.value : null;
        const responsePosicao = resultPosicao.status === 'fulfilled' ? resultPosicao.value : null;

        if (responseMotorista?.success) {
            dadosMotoristaAtual = {
                nome: responseMotorista.motorista.nome,
                viagens: responseMotorista.estatisticas.totalViagens,
                km: responseMotorista.estatisticas.kmTotal,
                posicaoViagens: responsePosicao?.success ? responsePosicao.posicaoViagens : null,
                posicaoKm: responsePosicao?.success ? responsePosicao.posicaoKm : null
            };

            // Monta tabela de Viagens
            if (responseTop10Viagens?.success && responseTop10Viagens.data) {
                montarTabelaComparativaViagens(responseTop10Viagens.data, dadosMotoristaAtual);
            } else {
                document.getElementById('tabelaComparativaViagensBody').innerHTML = '<tr><td colspan="3" class="text-center py-3 text-muted">Sem dados disponíveis</td></tr>';
            }

            // Monta tabela de KM
            if (responseTop10Km?.success && responseTop10Km.data) {
                montarTabelaComparativaKm(responseTop10Km.data, dadosMotoristaAtual);
            } else {
                document.getElementById('tabelaComparativaKmBody').innerHTML = '<tr><td colspan="3" class="text-center py-3 text-muted">Sem dados disponíveis</td></tr>';
            }
        } else {
            // Erro ao carregar dados do motorista
            document.getElementById('tabelaComparativaViagensBody').innerHTML = '<tr><td colspan="3" class="text-center py-3 text-danger">Erro ao carregar dados</td></tr>';
            document.getElementById('tabelaComparativaKmBody').innerHTML = '<tr><td colspan="3" class="text-center py-3 text-danger">Erro ao carregar dados</td></tr>';
        }
    } catch (error) {
        console.error('Erro ao carregar tabelas comparativas:', error);
        document.getElementById('tabelaComparativaViagensBody').innerHTML = '<tr><td colspan="3" class="text-center py-3 text-danger">Erro ao carregar</td></tr>';
        document.getElementById('tabelaComparativaKmBody').innerHTML = '<tr><td colspan="3" class="text-center py-3 text-danger">Erro ao carregar</td></tr>';
    }
}

function montarTabelaComparativaViagens(top10Data, motorista) {
    const tbody = document.getElementById('tabelaComparativaViagensBody');
    if (!tbody) return;

    // Verifica se o motorista está no Top 10
    const posicaoNoTop10 = top10Data.findIndex(item =>
        item.motorista.toLowerCase().trim() === motorista.nome.toLowerCase().trim()
    );

    let html = '';
    const medalhas = ['🥇', '🥈', '🥉'];

    // Renderiza o Top 10
    top10Data.forEach((item, index) => {
        const ehMotorista = item.motorista.toLowerCase().trim() === motorista.nome.toLowerCase().trim();
        const classe = ehMotorista ? 'linha-motorista-selecionado' : '';
        const medalha = index < 3 ? `<span class="medalha-posicao">${medalhas[index]}</span>` : (index + 1);

        html += `
            <tr class="${classe}">
                <td class="text-center fw-bold">${medalha}</td>
                <td>${item.motorista}${ehMotorista ? ' <i class="fa-solid fa-star text-warning ms-1"></i>' : ''}</td>
                <td class="text-center">${formatarNumero(item.totalViagens)}</td>
            </tr>
        `;
    });

    // Se o motorista NÃO está no Top 10, adiciona uma linha separadora e mostra sua posição REAL
    if (posicaoNoTop10 === -1) {
        // Usa a posição real retornada pelo servidor
        const posicaoReal = motorista.posicaoViagens || (top10Data.length + 1);

        html += `
            <tr class="linha-separador-comparativa">
                <td colspan="3" class="text-center small text-muted">· · · · · · · · · ·</td>
            </tr>
            <tr class="linha-motorista-selecionado">
                <td class="text-center"><span class="posicao-fora-top10">${posicaoReal}º</span></td>
                <td>${motorista.nome} <i class="fa-solid fa-star text-warning ms-1"></i></td>
                <td class="text-center">${formatarNumero(motorista.viagens)}</td>
            </tr>
        `;
    }

    tbody.innerHTML = html;
}

function montarTabelaComparativaKm(top10Data, motorista) {
    const tbody = document.getElementById('tabelaComparativaKmBody');
    if (!tbody) return;

    // Verifica se o motorista está no Top 10
    const posicaoNoTop10 = top10Data.findIndex(item =>
        item.motorista.toLowerCase().trim() === motorista.nome.toLowerCase().trim()
    );

    let html = '';
    const medalhas = ['🥇', '🥈', '🥉'];

    // Renderiza o Top 10
    top10Data.forEach((item, index) => {
        const ehMotorista = item.motorista.toLowerCase().trim() === motorista.nome.toLowerCase().trim();
        const classe = ehMotorista ? 'linha-motorista-selecionado' : '';
        const medalha = index < 3 ? `<span class="medalha-posicao">${medalhas[index]}</span>` : (index + 1);

        html += `
            <tr class="${classe}">
                <td class="text-center fw-bold">${medalha}</td>
                <td>${item.motorista}${ehMotorista ? ' <i class="fa-solid fa-star text-warning ms-1"></i>' : ''}</td>
                <td class="text-center">${formatarNumero(item.kmTotal)} km</td>
            </tr>
        `;
    });

    // Se o motorista NÃO está no Top 10, adiciona uma linha separadora e mostra sua posição REAL
    if (posicaoNoTop10 === -1) {
        // Usa a posição real retornada pelo servidor
        const posicaoReal = motorista.posicaoKm || (top10Data.length + 1);

        html += `
            <tr class="linha-separador-comparativa">
                <td colspan="3" class="text-center small text-muted">· · · · · · · · · ·</td>
            </tr>
            <tr class="linha-motorista-selecionado">
                <td class="text-center"><span class="posicao-fora-top10">${posicaoReal}º</span></td>
                <td>${motorista.nome} <i class="fa-solid fa-star text-warning ms-1"></i></td>
                <td class="text-center">${formatarNumero(motorista.km)} km</td>
            </tr>
        `;
    }

    tbody.innerHTML = html;
}

// ========================================
// FILTROS E PERÍODO RÁPIDO
// ========================================

function aplicarFiltroPeriodo(dias, btnElement) {
    const hoje = new Date();
    periodoAtual.dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
    periodoAtual.dataInicio = new Date(periodoAtual.dataFim);
    periodoAtual.dataInicio.setDate(periodoAtual.dataInicio.getDate() - dias);

    // Muda para modo período personalizado
    usarFiltroAnoMes = false;

    // Atualiza campos HTML5
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');
    if (dataInicio && dataFim) {
        dataInicio.value = formatarDataParaInput(periodoAtual.dataInicio);
        dataFim.value = formatarDataParaInput(periodoAtual.dataFim);
    }

    // Remove classe active de todos os botões
    document.querySelectorAll('.btn-period-mot').forEach(btn => btn.classList.remove('active'));

    // Adiciona classe active ao botão clicado
    if (btnElement) {
        btnElement.classList.add('active');
    }

    // Atualiza indicador
    atualizarIndicadorPeriodo();

    carregarDadosDashboard();

    // Se tiver motorista selecionado, recarrega dados individuais e tabelas comparativas
    if (motoristaFiltro) {
        carregarDadosMotoristaIndividual(motoristaFiltro);
        carregarTabelasComparativas(motoristaFiltro);
    }
}

function aplicarFiltroPersonalizado() {
    const dataInicioInput = document.getElementById('dataInicio');
    const dataFimInput = document.getElementById('dataFim');

    if (!dataInicioInput?.value || !dataFimInput?.value) {
        if (typeof AppToast !== 'undefined') {
            AppToast.show('Amarelo', 'Preencha as datas De e Até para filtrar.', 3000);
        }
        return;
    }

    periodoAtual.dataInicio = new Date(dataInicioInput.value + 'T00:00:00');
    periodoAtual.dataFim = new Date(dataFimInput.value + 'T23:59:59');

    if (periodoAtual.dataInicio > periodoAtual.dataFim) {
        if (typeof AppToast !== 'undefined') {
            AppToast.show('Amarelo', 'A data inicial não pode ser maior que a final.', 3000);
        }
        return;
    }

    // Muda para modo período personalizado
    usarFiltroAnoMes = false;

    // Remove classe active de todos os botões de período
    document.querySelectorAll('.btn-period-mot').forEach(btn => btn.classList.remove('active'));

    // Atualiza indicador
    atualizarIndicadorPeriodo();

    carregarDadosDashboard();

    // Se tiver motorista selecionado, recarrega dados individuais e tabelas comparativas
    if (motoristaFiltro) {
        carregarDadosMotoristaIndividual(motoristaFiltro);
        carregarTabelasComparativas(motoristaFiltro);
    }
}

// ========================================
// FUNÇÕES DE LIMPAR FILTROS
// ========================================

function limparFiltroMotorista() {
    const select = document.getElementById('filtroMotorista');
    if (select) {
        select.value = '';
    }
    motoristaFiltro = null;
    dadosMotoristaAtual = null;

    // Esconde seção individual
    esconderSecaoIndividual();

    // Limpa as tabelas comparativas
    const tbodyViagens = document.getElementById('tabelaComparativaViagensBody');
    const tbodyKm = document.getElementById('tabelaComparativaKmBody');
    if (tbodyViagens) {
        tbodyViagens.innerHTML = '<tr><td colspan="3" class="text-center py-3 text-muted">Selecione um motorista</td></tr>';
    }
    if (tbodyKm) {
        tbodyKm.innerHTML = '<tr><td colspan="3" class="text-center py-3 text-muted">Selecione um motorista</td></tr>';
    }

    // Atualiza gráficos de evolução e heatmap (volta para todos os motoristas)
    carregarEvolucaoViagens();
    carregarHeatmapViagens();

    if (typeof AppToast !== 'undefined') {
        AppToast.show('Verde', 'Filtro de motorista limpo', 2000);
    }
}

function limparFiltroAnoMes() {
    // Volta para o mês/ano mais recente
    carregarAnosMesesDisponiveis().then(() => {
        atualizarIndicadorPeriodo();
        carregarDadosDashboard();

        if (motoristaFiltro) {
            carregarDadosMotoristaIndividual(motoristaFiltro);
            carregarTabelasComparativas(motoristaFiltro);
        }
    });

    // Remove classe active dos botões de período rápido
    document.querySelectorAll('.btn-period-mot').forEach(btn => btn.classList.remove('active'));

    if (typeof AppToast !== 'undefined') {
        AppToast.show('Verde', 'Filtro de período restaurado', 2000);
    }
}

function limparFiltroPeriodo() {
    // Limpa campos de data
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');
    if (dataInicio) dataInicio.value = '';
    if (dataFim) dataFim.value = '';

    // Limpa variáveis de período personalizado
    periodoAtual.dataInicio = null;
    periodoAtual.dataFim = null;

    // Volta para modo Ano/Mês
    usarFiltroAnoMes = true;

    // Remove classe active dos botões de período rápido
    document.querySelectorAll('.btn-period-mot').forEach(btn => btn.classList.remove('active'));

    // Atualiza indicador e recarrega
    atualizarIndicadorPeriodo();
    carregarDadosDashboard();

    if (motoristaFiltro) {
        carregarDadosMotoristaIndividual(motoristaFiltro);
        carregarTabelasComparativas(motoristaFiltro);
    }

    if (typeof AppToast !== 'undefined') {
        AppToast.show('Verde', 'Período personalizado limpo', 2000);
    }
}

function aplicarFiltroMotorista() {
    const select = document.getElementById('filtroMotorista');
    motoristaFiltro = select?.value || null;

    if (motoristaFiltro) {
        carregarDadosMotoristaIndividual(motoristaFiltro);
        carregarTabelasComparativas(motoristaFiltro);
        mostrarSecaoIndividual();
    } else {
        esconderSecaoIndividual();
    }

    // Atualiza gráficos que filtram por motorista
    carregarEvolucaoViagens();
    carregarHeatmapViagens();
}

// ========================================
// EVENT LISTENERS
// ========================================

$(document).ready(function() {
    // Inicializa o dashboard
    inicializarDashboard();

    // Botão Filtrar Motorista
    $('#btnFiltrarMotorista').on('click', aplicarFiltroMotorista);

    // Botão Limpar Motorista
    $('#btnLimparMotorista').on('click', limparFiltroMotorista);

    // Botão Filtrar por Ano/Mês
    $('#btnFiltrarAnoMes').on('click', aplicarFiltroAnoMes);

    // Botão Limpar Ano/Mês
    $('#btnLimparAnoMes').on('click', limparFiltroAnoMes);

    // Botão Limpar Período
    $('#btnLimparPeriodo').on('click', limparFiltroPeriodo);

    // Evento de mudança do select de Ano (carrega meses do ano selecionado)
    $('#filtroAno').on('change', function() {
        const ano = parseInt(this.value);
        if (ano) {
            carregarMesesPorAno(ano);
        }
    });

    // Botões de período rápido
    $('#btn7Dias').on('click', function() { aplicarFiltroPeriodo(7, this); });
    $('#btn15Dias').on('click', function() { aplicarFiltroPeriodo(15, this); });
    $('#btn30Dias').on('click', function() { aplicarFiltroPeriodo(30, this); });
    $('#btn60Dias').on('click', function() { aplicarFiltroPeriodo(60, this); });
    $('#btn90Dias').on('click', function() { aplicarFiltroPeriodo(90, this); });
    $('#btn180Dias').on('click', function() { aplicarFiltroPeriodo(180, this); });
    $('#btn365Dias').on('click', function() { aplicarFiltroPeriodo(365, this); });

    // Botão Filtrar (período personalizado)
    $('#btnFiltrar').on('click', aplicarFiltroPersonalizado);
});
