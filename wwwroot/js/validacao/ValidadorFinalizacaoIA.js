// ====================================================================
// ValidadorFinalizacaoIA.js
// Validador Inteligente para Finalização de Viagem
// Usa IA evolutiva baseada no histórico do veículo
// ====================================================================

/**
 * Classe principal de validação inteligente
 * Integra com a API de estatísticas para calibrar alertas
 */
class ValidadorFinalizacaoIA {
    constructor() {
        // Cache de estatísticas por veículo (5 minutos)
        this.cacheEstatisticas = new Map();
        this.cacheDuracao = 5 * 60 * 1000; // 5 minutos em ms

        // Limites padrão (quando não há histórico)
        this.limitesPadrao = {
            kmMaximoSemHistorico: 500,
            kmAlertaSemHistorico: 100,
            duracaoMaximaMinutos: 720, // 12 horas
            duracaoMinimaMinutos: 5
        };

        // Z-Scores para níveis de alerta
        this.zScores = {
            leve: 1.5,
            moderado: 2.5,
            severo: 3.5
        };

        // Flags para evitar alertas repetidos
        this._kmConfirmado = false;
        this._duracaoConfirmada = false;
    }

    /**
     * Reseta as flags de confirmação (chamar ao abrir modal)
     */
    resetarConfirmacoes() {
        this._kmConfirmado = false;
        this._duracaoConfirmada = false;
    }

    // =====================================================================
    // VALIDAÇÃO DE DATA
    // =====================================================================

    /**
     * Valida se a data final não é futura (BLOQUEANTE)
     * @param {string} dataFinal - Data no formato YYYY-MM-DD ou DD/MM/YYYY
     * @returns {Promise<{valido: boolean, mensagem: string}>}
     */
    async validarDataNaoFutura(dataFinal) {
        if (!dataFinal) {
            return { valido: false, mensagem: "A Data Final é obrigatória." };
        }

        const data = this._parseData(dataFinal);
        if (!data || isNaN(data.getTime())) {
            return { valido: false, mensagem: "Data Final inválida." };
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        data.setHours(0, 0, 0, 0);

        if (data > hoje) {
            return {
                valido: false,
                mensagem: "A Data Final não pode ser superior à data de hoje.\n\nViagens só podem ser finalizadas com datas passadas ou de hoje."
            };
        }

        return { valido: true, mensagem: "" };
    }

    /**
     * Valida se a data não é muito antiga (alerta, não bloqueante)
     * @param {string} dataFinal - Data no formato YYYY-MM-DD ou DD/MM/YYYY
     * @returns {Promise<{valido: boolean, requerConfirmacao: boolean, mensagem: string}>}
     */
    async validarDataNaoMuitoAntiga(dataFinal) {
        if (!dataFinal) return { valido: true, requerConfirmacao: false, mensagem: "" };

        const data = this._parseData(dataFinal);
        if (!data) return { valido: true, requerConfirmacao: false, mensagem: "" };

        const hoje = new Date();
        const diasAtras = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));

        if (diasAtras > 30) {
            return {
                valido: true,
                requerConfirmacao: true,
                mensagem: `Você está finalizando uma viagem de <strong>${diasAtras} dias atrás</strong>.\n\nIsso está correto?`
            };
        }

        return { valido: true, requerConfirmacao: false, mensagem: "" };
    }

    // =====================================================================
    // ANÁLISE INTELIGENTE DE DATAS E HORAS
    // =====================================================================

    /**
     * Analisa a consistência entre data/hora inicial e final
     * @param {Object} dados - {dataInicial, horaInicial, dataFinal, horaFinal, veiculoId}
     * @returns {Promise<{valido: boolean, nivel: string, mensagem: string, detalhes: Object}>}
     */
    async analisarDatasHoras(dados) {
        const { dataInicial, horaInicial, dataFinal, horaFinal, veiculoId } = dados;

        // Parse das datas
        const dtInicial = this._parseDataHora(dataInicial, horaInicial);
        const dtFinal = this._parseDataHora(dataFinal, horaFinal);

        if (!dtInicial || !dtFinal) {
            return { valido: true, nivel: 'ok', mensagem: "", detalhes: {} };
        }

        // Validação bloqueante: Data/Hora Final antes da Inicial
        if (dtFinal <= dtInicial) {
            const mesmodia = this._parseData(dataInicial)?.getTime() === this._parseData(dataFinal)?.getTime();
            if (mesmodia) {
                return {
                    valido: false,
                    nivel: 'erro',
                    mensagem: `A hora final (${horaFinal}) é anterior ou igual à hora inicial (${horaInicial}).\n\nIsso não é possível no mesmo dia.`,
                    detalhes: { horaInicial, horaFinal }
                };
            } else {
                return {
                    valido: false,
                    nivel: 'erro',
                    mensagem: "A data/hora final é anterior à data/hora inicial.\n\nPor favor, corrija os valores.",
                    detalhes: {}
                };
            }
        }

        // Calcular duração
        const duracaoMinutos = Math.round((dtFinal - dtInicial) / (1000 * 60));
        const duracaoHoras = duracaoMinutos / 60;

        // Validação: Duração muito curta
        if (duracaoMinutos < this.limitesPadrao.duracaoMinimaMinutos) {
            return {
                valido: false,
                nivel: 'erro',
                mensagem: `A duração de ${duracaoMinutos} minutos parece muito curta para uma viagem.\n\nVerifique os horários informados.`,
                detalhes: { duracaoMinutos }
            };
        }

        // Obter estatísticas do veículo (se disponível)
        let estatisticas = null;
        if (veiculoId) {
            estatisticas = await this._obterEstatisticas(veiculoId);
        }

        // Análise baseada em estatísticas
        if (estatisticas && estatisticas.dadosSuficientes) {
            const zScore = (duracaoMinutos - estatisticas.duracaoMediaMinutos) / estatisticas.duracaoDesvioPadraoMinutos;

            if (Math.abs(zScore) > this.zScores.severo) {
                return {
                    valido: true,
                    nivel: 'severo',
                    requerConfirmacao: !this._duracaoConfirmada,
                    mensagem: this._gerarMensagemDuracaoAnomala(duracaoMinutos, estatisticas, 'severo'),
                    detalhes: { duracaoMinutos, duracaoHoras, zScore, estatisticas }
                };
            }

            if (Math.abs(zScore) > this.zScores.moderado) {
                return {
                    valido: true,
                    nivel: 'moderado',
                    requerConfirmacao: !this._duracaoConfirmada,
                    mensagem: this._gerarMensagemDuracaoAnomala(duracaoMinutos, estatisticas, 'moderado'),
                    detalhes: { duracaoMinutos, duracaoHoras, zScore, estatisticas }
                };
            }
        } else {
            // Sem histórico: usar limites padrão
            if (duracaoMinutos > this.limitesPadrao.duracaoMaximaMinutos) {
                return {
                    valido: true,
                    nivel: 'moderado',
                    requerConfirmacao: !this._duracaoConfirmada,
                    mensagem: this._gerarMensagemDuracaoSemHistorico(duracaoMinutos),
                    detalhes: { duracaoMinutos, duracaoHoras }
                };
            }
        }

        return { valido: true, nivel: 'ok', mensagem: "", detalhes: { duracaoMinutos } };
    }

    // =====================================================================
    // ANÁLISE INTELIGENTE DE QUILOMETRAGEM
    // =====================================================================

    /**
     * Analisa a consistência da quilometragem
     * @param {Object} dados - {kmInicial, kmFinal, veiculoId}
     * @returns {Promise<{valido: boolean, nivel: string, mensagem: string, detalhes: Object}>}
     */
    async analisarKm(dados) {
        const { kmInicial, kmFinal, veiculoId } = dados;

        const kmIni = parseInt(kmInicial) || 0;
        const kmFim = parseInt(kmFinal) || 0;

        // Validação: KM Final não informado
        if (!kmFim || kmFim <= 0) {
            return {
                valido: false,
                nivel: 'erro',
                mensagem: "A quilometragem final é obrigatória e deve ser maior que zero.",
                detalhes: {}
            };
        }

        // Validação bloqueante: KM Final menor que inicial (IMPOSSÍVEL)
        if (kmFim < kmIni) {
            return {
                valido: false,
                nivel: 'erro',
                mensagem: `O Km Final (${kmFim.toLocaleString('pt-BR')}) é MENOR que o Km Inicial (${kmIni.toLocaleString('pt-BR')}).\n\nIsso significaria que o veículo andou ${(kmIni - kmFim).toLocaleString('pt-BR')} km para trás, o que é fisicamente impossível.\n\nPor favor, corrija o valor do Km Final.`,
                detalhes: { kmInicial: kmIni, kmFinal: kmFim }
            };
        }

        // Validação bloqueante: KM igual (viagem sem deslocamento)
        if (kmFim === kmIni) {
            return {
                valido: true,
                nivel: 'alerta',
                requerConfirmacao: true,
                mensagem: `A quilometragem final é igual à inicial (${kmIni.toLocaleString('pt-BR')} km).\n\nIsso significa que o veículo não se deslocou.\n\nEssa viagem foi realmente sem deslocamento?`,
                detalhes: { kmRodado: 0 }
            };
        }

        const kmRodado = kmFim - kmIni;

        // Obter estatísticas do veículo
        let estatisticas = null;
        if (veiculoId) {
            estatisticas = await this._obterEstatisticas(veiculoId);
        }

        // Análise baseada em estatísticas (IA evolutiva)
        if (estatisticas && estatisticas.dadosSuficientes) {
            const zScore = (kmRodado - estatisticas.kmMedio) / estatisticas.kmDesvioPadrao;

            // Anomalia severa (Z > 3.5)
            if (zScore > this.zScores.severo) {
                return {
                    valido: true,
                    nivel: 'severo',
                    requerConfirmacao: !this._kmConfirmado,
                    mensagem: this._gerarMensagemKmAnomalo(kmRodado, estatisticas, 'severo'),
                    detalhes: { kmRodado, zScore, estatisticas }
                };
            }

            // Anomalia moderada (Z > 2.5)
            if (zScore > this.zScores.moderado) {
                return {
                    valido: true,
                    nivel: 'moderado',
                    requerConfirmacao: !this._kmConfirmado,
                    mensagem: this._gerarMensagemKmAnomalo(kmRodado, estatisticas, 'moderado'),
                    detalhes: { kmRodado, zScore, estatisticas }
                };
            }

            // Anomalia leve (Z > 1.5) - apenas log, sem alerta
            if (zScore > this.zScores.leve) {
                console.log(`[ValidadorIA] Km levemente acima do padrão: ${kmRodado} km (Z=${zScore.toFixed(2)})`);
            }

        } else {
            // Sem histórico: usar limites padrão
            if (kmRodado > this.limitesPadrao.kmMaximoSemHistorico) {
                return {
                    valido: true,
                    nivel: 'moderado',
                    requerConfirmacao: !this._kmConfirmado,
                    mensagem: this._gerarMensagemKmSemHistorico(kmRodado),
                    detalhes: { kmRodado }
                };
            }

            if (kmRodado > this.limitesPadrao.kmAlertaSemHistorico) {
                return {
                    valido: true,
                    nivel: 'leve',
                    requerConfirmacao: !this._kmConfirmado,
                    mensagem: `Esta viagem percorreu ${kmRodado.toLocaleString('pt-BR')} km.\n\nConfirma que está correto?`,
                    detalhes: { kmRodado }
                };
            }
        }

        return { valido: true, nivel: 'ok', mensagem: "", detalhes: { kmRodado } };
    }

    // =====================================================================
    // VALIDAÇÃO COMPLETA (ORQUESTRA TODAS AS VALIDAÇÕES)
    // =====================================================================

    /**
     * Executa todas as validações de finalização
     * @param {Object} dados - Todos os dados do formulário
     * @returns {Promise<{valido: boolean, erros: Array, alertas: Array}>}
     */
    async validarFinalizacao(dados) {
        const { dataInicial, horaInicial, dataFinal, horaFinal, kmInicial, kmFinal, veiculoId } = dados;
        const erros = [];
        const alertas = [];

        // 1. Validar data não futura (BLOQUEANTE)
        const validacaoData = await this.validarDataNaoFutura(dataFinal);
        if (!validacaoData.valido) {
            erros.push({ tipo: 'dataFutura', mensagem: validacaoData.mensagem });
        }

        // Se já tem erro bloqueante, retorna
        if (erros.length > 0) {
            return { valido: false, erros, alertas };
        }

        // 2. Analisar datas/horas
        const analiseDatas = await this.analisarDatasHoras({
            dataInicial, horaInicial, dataFinal, horaFinal, veiculoId
        });

        if (!analiseDatas.valido) {
            erros.push({ tipo: 'datas', mensagem: analiseDatas.mensagem, detalhes: analiseDatas.detalhes });
        } else if (analiseDatas.requerConfirmacao) {
            alertas.push({
                tipo: 'duracao',
                nivel: analiseDatas.nivel,
                mensagem: analiseDatas.mensagem,
                detalhes: analiseDatas.detalhes,
                onConfirm: () => { this._duracaoConfirmada = true; }
            });
        }

        // 3. Analisar quilometragem
        const analiseKm = await this.analisarKm({ kmInicial, kmFinal, veiculoId });

        if (!analiseKm.valido) {
            erros.push({ tipo: 'km', mensagem: analiseKm.mensagem, detalhes: analiseKm.detalhes });
        } else if (analiseKm.requerConfirmacao) {
            alertas.push({
                tipo: 'km',
                nivel: analiseKm.nivel,
                mensagem: analiseKm.mensagem,
                detalhes: analiseKm.detalhes,
                onConfirm: () => { this._kmConfirmado = true; }
            });
        }

        // 4. Validar data muito antiga
        const validacaoDataAntiga = await this.validarDataNaoMuitoAntiga(dataFinal);
        if (validacaoDataAntiga.requerConfirmacao) {
            alertas.push({
                tipo: 'dataAntiga',
                nivel: 'leve',
                mensagem: validacaoDataAntiga.mensagem,
                detalhes: {}
            });
        }

        return {
            valido: erros.length === 0,
            erros,
            alertas
        };
    }

    // =====================================================================
    // MÉTODOS DE GERAÇÃO DE MENSAGENS CONVINCENTES
    // =====================================================================

    _gerarMensagemKmAnomalo(kmRodado, estatisticas, nivel) {
        const percentualAcima = ((kmRodado / estatisticas.kmMedio - 1) * 100).toFixed(0);
        const tempoEstimado = (kmRodado / 80).toFixed(1); // 80 km/h média

        let icone = nivel === 'severo' ? '🚨' : '⚠️';
        let titulo = nivel === 'severo' ? 'QUILOMETRAGEM MUITO ACIMA DO PADRÃO' : 'Quilometragem Acima do Padrão';

        return `${icone} <strong>${titulo}</strong>

Você informou <strong>${kmRodado.toLocaleString('pt-BR')} km</strong> rodados nesta viagem.

📊 <strong>Histórico do veículo ${estatisticas.placa || ''}:</strong>
• Média por viagem: ${Math.round(estatisticas.kmMedio).toLocaleString('pt-BR')} km
• 95% das viagens: até ${Math.round(estatisticas.kmPercentil95).toLocaleString('pt-BR')} km
• Maior viagem registrada: ${estatisticas.kmMaximo.toLocaleString('pt-BR')} km

📈 Esta viagem seria <strong>${percentualAcima}% maior</strong> que a média.

⏱️ Isso equivale a aproximadamente <strong>${tempoEstimado}h</strong> de viagem a 80 km/h.

Os valores estão corretos?`;
    }

    _gerarMensagemKmSemHistorico(kmRodado) {
        const tempoEstimado = (kmRodado / 80).toFixed(1);

        return `⚠️ <strong>Quilometragem Elevada</strong>

Você informou <strong>${kmRodado.toLocaleString('pt-BR')} km</strong> rodados.

💡 Para referência:
• ${tempoEstimado}h de viagem a 80 km/h
• Equivalente a ${(kmRodado / 100).toFixed(1)} trajetos de 100 km

Este veículo ainda não tem histórico suficiente para comparação.

Os valores estão corretos?`;
    }

    _gerarMensagemDuracaoAnomala(duracaoMinutos, estatisticas, nivel) {
        const horas = Math.floor(duracaoMinutos / 60);
        const minutos = duracaoMinutos % 60;
        const duracaoFormatada = `${horas}h ${minutos}min`;

        const mediaHoras = Math.floor(estatisticas.duracaoMediaMinutos / 60);
        const mediaMinutos = Math.round(estatisticas.duracaoMediaMinutos % 60);
        const mediaFormatada = `${mediaHoras}h ${mediaMinutos}min`;

        const vezes = (duracaoMinutos / estatisticas.duracaoMediaMinutos).toFixed(1);

        let icone = nivel === 'severo' ? '🕐' : '⏰';

        return `${icone} <strong>Duração Incomum</strong>

Esta viagem teria duração de <strong>${duracaoFormatada}</strong>.

📊 <strong>Histórico do veículo ${estatisticas.placa || ''}:</strong>
• Duração média: ${mediaFormatada}
• Esta viagem seria <strong>${vezes}x maior</strong> que a média

Isso está correto?`;
    }

    _gerarMensagemDuracaoSemHistorico(duracaoMinutos) {
        const horas = Math.floor(duracaoMinutos / 60);
        const minutos = duracaoMinutos % 60;

        return `⏰ <strong>Duração Longa</strong>

Esta viagem teria duração de <strong>${horas}h ${minutos}min</strong>.

Isso está correto?`;
    }

    // =====================================================================
    // MÉTODOS AUXILIARES
    // =====================================================================

    /**
     * Obtém estatísticas do veículo (com cache)
     */
    async _obterEstatisticas(veiculoId) {
        if (!veiculoId) return null;

        // Verificar cache
        const cacheKey = veiculoId.toString();
        const cached = this.cacheEstatisticas.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.cacheDuracao) {
            return cached.data;
        }

        try {
            const response = await fetch(`/api/Viagem/EstatisticasVeiculo?veiculoId=${veiculoId}`);
            const result = await response.json();

            if (result.success && result.data) {
                // Armazenar no cache
                this.cacheEstatisticas.set(cacheKey, {
                    data: result.data,
                    timestamp: Date.now()
                });
                return result.data;
            }
        } catch (error) {
            console.error('[ValidadorIA] Erro ao buscar estatísticas:', error);
        }

        return null;
    }

    /**
     * Parse de data nos formatos YYYY-MM-DD ou DD/MM/YYYY
     */
    _parseData(dataStr) {
        if (!dataStr) return null;

        // Formato YYYY-MM-DD
        if (dataStr.includes('-')) {
            const [ano, mes, dia] = dataStr.split('-').map(Number);
            return new Date(ano, mes - 1, dia);
        }

        // Formato DD/MM/YYYY
        if (dataStr.includes('/')) {
            const [dia, mes, ano] = dataStr.split('/').map(Number);
            return new Date(ano, mes - 1, dia);
        }

        return null;
    }

    /**
     * Parse de data e hora combinados
     */
    _parseDataHora(dataStr, horaStr) {
        const data = this._parseData(dataStr);
        if (!data) return null;

        if (horaStr) {
            const [hora, minuto] = horaStr.split(':').map(Number);
            data.setHours(hora || 0, minuto || 0, 0, 0);
        }

        return data;
    }
}

// Instância global
window.ValidadorFinalizacaoIA = new ValidadorFinalizacaoIA();

// =====================================================================
// FUNÇÕES DE INTEGRAÇÃO COM SWEETALERT (DESIGN IA)
// =====================================================================

/**
 * Mostra alerta de erro simples (bloqueante)
 * Usa o alerta padrão do sistema para erros de validação simples
 */
async function mostrarErroValidacaoIA(mensagem) {
    // Usa o alerta padrão para erros simples
    await Alerta.Erro("Erro de Validação", mensagem);
}

/**
 * Mostra alerta de confirmação IA com design especial
 * @returns {Promise<boolean>} true se confirmou, false se cancelou
 */
async function mostrarConfirmacaoValidacaoIA(mensagem, nivel) {
    const botaoConfirma = nivel === 'severo' ? "Sim, confirmo!" : "Está correto";
    const botaoCancela = nivel === 'severo' ? "Deixa eu corrigir" : "Corrigir";
    const titulo = nivel === 'severo' ? "Atenção - Análise IA" : "Verificação Inteligente";

    // Usar o novo design de Validação IA
    if (window.Alerta?.ValidacaoIAConfirmar) {
        return await Alerta.ValidacaoIAConfirmar(titulo, mensagem, botaoConfirma, botaoCancela);
    } else {
        // Fallback
        return await Alerta.Confirmar(titulo, mensagem, botaoConfirma, botaoCancela);
    }
}

/**
 * Função de validação para integrar com o fluxo existente
 * @param {Object} dados - {dataInicial, horaInicial, dataFinal, horaFinal, kmInicial, kmFinal, veiculoId}
 * @returns {Promise<boolean>} true se pode prosseguir, false se deve parar
 */
async function validarFinalizacaoComIA(dados) {
    try {
        const validador = window.ValidadorFinalizacaoIA;
        const resultado = await validador.validarFinalizacao(dados);

        // Se tem erros, mostrar e bloquear
        if (!resultado.valido) {
            for (const erro of resultado.erros) {
                await mostrarErroValidacaoIA(erro.mensagem);
            }
            return false;
        }

        // Se tem alertas, pedir confirmação sequencialmente
        for (const alerta of resultado.alertas) {
            const confirmou = await mostrarConfirmacaoValidacaoIA(alerta.mensagem, alerta.nivel);
            if (!confirmou) {
                return false;
            }
            // Marcar como confirmado
            if (alerta.onConfirm) {
                alerta.onConfirm();
            }
        }

        return true;
    } catch (error) {
        console.error('[ValidadorIA] Erro na validação:', error);
        // Em caso de erro, deixa prosseguir (fail-safe)
        return true;
    }
}

/**
 * Validação consolidada de segurança para o submit (Update/Insert/Finalizar)
 * Verifica novamente se há alertas IA pendentes e mostra um alerta único consolidado
 * @param {Object} dados - {dataInicial, horaInicial, dataFinal, horaFinal, kmInicial, kmFinal, veiculoId}
 * @returns {Promise<boolean>} true se pode prosseguir, false se deve parar
 */
async function validarFinalizacaoConsolidadaIA(dados) {
    try {
        const validador = window.ValidadorFinalizacaoIA;
        if (!validador) {
            console.warn('[ValidadorIA] Validador não disponível');
            return true; // Fail-safe
        }

        const alertasPendentes = [];
        let temErros = false;

        // 1. Validar data não futura (bloqueante)
        if (dados.dataFinal) {
            const resultadoDataFutura = await validador.validarDataNaoFutura(dados.dataFinal);
            if (!resultadoDataFutura.valido) {
                await Alerta.Erro("Data Inválida", resultadoDataFutura.mensagem);
                return false;
            }
        }

        // 2. Analisar data/hora (avisos)
        if (dados.dataInicial && dados.horaInicial && dados.dataFinal && dados.horaFinal) {
            const resultadoDatas = await validador.analisarDatasHoras(dados);

            if (!resultadoDatas.valido && resultadoDatas.nivel === 'erro') {
                await Alerta.Erro("Erro de Data/Hora", resultadoDatas.mensagem);
                return false;
            }

            if (resultadoDatas.nivel === 'moderado' || resultadoDatas.nivel === 'severo') {
                alertasPendentes.push({
                    tipo: 'duracao',
                    nivel: resultadoDatas.nivel,
                    titulo: '⏱️ DURAÇÃO DA VIAGEM',
                    mensagem: resultadoDatas.mensagem
                });
            }
        }

        // 3. Analisar KM (avisos)
        if (dados.kmInicial && dados.kmFinal && dados.veiculoId) {
            const kmInicial = parseInt(dados.kmInicial) || 0;
            const kmFinal = parseInt(dados.kmFinal) || 0;

            // Validação básica bloqueante
            if (kmFinal <= kmInicial) {
                await Alerta.Erro("Erro de Quilometragem", "A quilometragem final deve ser maior que a inicial.");
                return false;
            }

            const resultadoKm = await validador.analisarKm({
                kmInicial: kmInicial,
                kmFinal: kmFinal,
                veiculoId: dados.veiculoId
            });

            if (!resultadoKm.valido && resultadoKm.nivel === 'erro') {
                await Alerta.Erro("Erro de Quilometragem", resultadoKm.mensagem);
                return false;
            }

            if (resultadoKm.nivel === 'moderado' || resultadoKm.nivel === 'severo') {
                alertasPendentes.push({
                    tipo: 'km',
                    nivel: resultadoKm.nivel,
                    titulo: '🚗 QUILOMETRAGEM',
                    mensagem: resultadoKm.mensagem
                });
            }
        }

        // 4. Se há alertas pendentes, mostrar consolidado
        if (alertasPendentes.length > 0) {
            const nivelMaisAlto = alertasPendentes.some(a => a.nivel === 'severo') ? 'severo' : 'moderado';

            let mensagemConsolidada = '';

            if (alertasPendentes.length === 1) {
                // Apenas um alerta
                mensagemConsolidada = alertasPendentes[0].mensagem;
            } else {
                // Múltiplos alertas - consolidar
                mensagemConsolidada = '<strong>A Análise Inteligente identificou os seguintes pontos:</strong>\n\n';

                for (const alerta of alertasPendentes) {
                    mensagemConsolidada += `<strong>${alerta.titulo}</strong>\n`;
                    mensagemConsolidada += alerta.mensagem + '\n\n';
                }

                mensagemConsolidada += '<strong>Deseja prosseguir mesmo assim?</strong>';
            }

            const botaoConfirma = nivelMaisAlto === 'severo' ? "Sim, confirmo!" : "Está correto";
            const botaoCancela = nivelMaisAlto === 'severo' ? "Deixa eu corrigir" : "Corrigir";

            const confirmou = await Alerta.ValidacaoIAConfirmar(
                "Verificação Final",
                mensagemConsolidada,
                botaoConfirma,
                botaoCancela
            );

            if (!confirmou) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('[ValidadorIA] Erro na validação consolidada:', error);
        // Em caso de erro, deixa prosseguir (fail-safe)
        return true;
    }
}

// Exportar função global
window.validarFinalizacaoConsolidadaIA = validarFinalizacaoConsolidadaIA;
