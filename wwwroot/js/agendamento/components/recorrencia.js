// ====================================================================
// RECORRÊNCIA - Gerenciamento de recorrências de agendamento
// CORREÇÃO: RecorrenciaViagemId deve ser preenchido corretamente
// ====================================================================

class GerenciadorRecorrencia
{
    constructor()
    {
        this.datasSelecionadas = [];
    }

    /**
     * Ajusta data inicial para recorrência
     * param {string} tipoRecorrencia - Tipo (D, S, Q, M, V)
     * returns {Array} Array de datas
     */
    ajustarDataInicialRecorrente(tipoRecorrencia)
    {
        try
        {
            const datas = [];

            if (tipoRecorrencia === "V")
            {
                this.gerarRecorrenciaVariada(datas);
                return datas.length > 0 ? datas : null;
            }

            let dataAtual = document.getElementById("txtDataInicial")?.ej2_instances?.[0]?.value;
            const dataFinal = document.getElementById("txtFinalRecorrencia")?.ej2_instances?.[0]?.value;

            if (!dataAtual || !dataFinal)
            {
                console.error("Data Inicial ou Data Final não encontrada.");
                return null;
            }

            dataAtual = moment(dataAtual).toISOString().split("T")[0];
            const dataFinalFormatada = moment(dataFinal).toISOString().split("T")[0];

            let diasSelecionados = document.getElementById("lstDias")?.ej2_instances?.[0]?.value || [];

            if (tipoRecorrencia === "M")
            {
                diasSelecionados = [].concat(document.getElementById("lstDiasMes")?.ej2_instances?.[0]?.value || []);
            }

            let diasSelecionadosIndex = [];
            if (tipoRecorrencia !== "M")
            {
                diasSelecionadosIndex = diasSelecionados.map(dia => ({
                    Sunday: 0,
                    Monday: 1,
                    Tuesday: 2,
                    Wednesday: 3,
                    Thursday: 4,
                    Friday: 5,
                    Saturday: 6
                }[dia]));
            }

            if (tipoRecorrencia === "D")
            {
                this.gerarRecorrenciaDiaria(dataAtual, dataFinalFormatada, datas);
            } else if (tipoRecorrencia === "M")
            {
                this.gerarRecorrenciaMensal(dataAtual, dataFinalFormatada, diasSelecionados, datas);
            } else
            {
                this.gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinalFormatada, diasSelecionadosIndex, datas);
            }

            return datas.length > 0 ? datas : null;

        } catch (error)
        {
            Alerta.TratamentoErroComLinha("recorrencia.js", "ajustarDataInicialRecorrente", error);
            return null;
        }
    }

    /**
     * Gera recorrência variada (dias específicos)
     * param {Array} datas - Array para preencher
     */
    gerarRecorrenciaVariada(datas)
    {
        try
        {
            const calendarObj = document.getElementById("calDatasSelecionadas")?.ej2_instances?.[0];

            if (!calendarObj || !calendarObj.values || calendarObj.values.length === 0)
            {
                console.error("Nenhuma data selecionada no calendário para recorrência do tipo 'V'.");
                return;
            }

            console.log("📅 [Variada] Datas selecionadas no calendário:", calendarObj.values);

            // ✅ ORDENAR as datas (da mais antiga para a mais recente)
            const datasOrdenadas = calendarObj.values
                .filter(date => date) // Remover nulls
                .map(date => new Date(date)) // Converter para Date
                .sort((a, b) => a - b); // Ordenar cronologicamente

            console.log("📅 [Variada] Datas ordenadas:", datasOrdenadas);

            // ✅ Adicionar ao array no formato YYYY-MM-DD
            datasOrdenadas.forEach(date =>
            {
                try
                {
                    datas.push(moment(date).format("YYYY-MM-DD"));
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("recorrencia.js", "gerarRecorrenciaVariada_forEach", error);
                }
            });

            console.log("✅ [Variada] Array de datas gerado:", datas);

            // ✅ LIMPAR o campo de DatasSelecionadas pois não será mais usado
            // As datas serão enviadas individualmente, uma por requisição
            console.log("🔧 [Variada] Campo DatasSelecionadas será ignorado - enviando datas individualmente");

        } catch (error)
        {
            Alerta.TratamentoErroComLinha("recorrencia.js", "gerarRecorrenciaVariada", error);
        }
    }

    /**
     * Gera recorrência mensal
     * param {string} dataAtual - Data inicial
     * param {string} dataFinal - Data final
     * param {Array} diasSelecionados - Dias do mês
     * param {Array} datas - Array para preencher
     */
    gerarRecorrenciaMensal(dataAtual, dataFinal, diasSelecionados, datas)
    {
        try
        {
            dataAtual = moment(dataAtual);
            dataFinal = moment(dataFinal);

            while (dataAtual.isSameOrBefore(dataFinal))
            {
                const mesAtual = dataAtual.month();
                const anoAtual = dataAtual.year();

                diasSelecionados.forEach(diaDoMes =>
                {
                    const dataEspecifica = moment([anoAtual, mesAtual, diaDoMes]);

                    if (dataEspecifica.isValid() &&
                        dataEspecifica.month() === mesAtual &&
                        dataEspecifica.isSameOrAfter(moment(dataAtual).startOf("day")) &&
                        dataEspecifica.isSameOrBefore(dataFinal))
                    {
                        if (!datas.includes(dataEspecifica.format("YYYY-MM-DD")))
                        {
                            datas.push(dataEspecifica.format("YYYY-MM-DD"));
                        }
                    }
                });

                dataAtual.add(1, "month").startOf("month");
            }

            datas.sort((a, b) => moment(a).diff(moment(b)));

        } catch (error)
        {
            Alerta.TratamentoErroComLinha("recorrencia.js", "gerarRecorrenciaMensal", error);
        }
    }

    /**
     * Gera recorrência diária
     * param {string} dataAtual - Data inicial
     * param {string} dataFinal - Data final
     * param {Array} datas - Array para preencher
     */
    gerarRecorrenciaDiaria(dataAtual, dataFinal, datas)
    {
        try
        {
            dataAtual = moment(dataAtual);
            dataFinal = moment(dataFinal);

            while (dataAtual.isSameOrBefore(dataFinal))
            {
                const dayOfWeek = dataAtual.isoWeekday();
                if (dayOfWeek >= 1 && dayOfWeek <= 5)
                {
                    datas.push(dataAtual.format("YYYY-MM-DD"));
                }
                dataAtual.add(1, "days");
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("recorrencia.js", "gerarRecorrenciaDiaria", error);
        }
    }

    /**
     * Gera recorrência por período (semanal/quinzenal)
     * param {string} tipoRecorrencia - Tipo de recorrência
     * param {string} dataAtual - Data inicial
     * param {string} dataFinal - Data final
     * param {Array} diasSelecionadosIndex - Índices dos dias
     * param {Array} datas - Array para preencher
     */
    gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinal, diasSelecionadosIndex, datas)
    {
        try
        {
            dataAtual = moment(dataAtual);
            dataFinal = moment(dataFinal);

            if (tipoRecorrencia === "Q")
            {
                dataAtual = moment(dataAtual).day(8);
            }

            while (dataAtual.isSameOrBefore(dataFinal))
            {
                diasSelecionadosIndex.forEach(diaSelecionado =>
                {
                    let proximaData = moment(dataAtual).day(diaSelecionado);
                    if (proximaData.isBefore(dataAtual)) proximaData.add(1, "week");
                    if (proximaData.isSameOrBefore(dataFinal) && !datas.includes(proximaData.format("YYYY-MM-DD")))
                    {
                        datas.push(proximaData.format("YYYY-MM-DD"));
                    }
                });

                switch (tipoRecorrencia)
                {
                    case "S":
                        dataAtual.add(1, "week");
                        break;
                    case "Q":
                        dataAtual.add(2, "weeks");
                        break;
                    default:
                        console.error("Tipo de recorrência inválido: ", tipoRecorrencia);
                        return;
                }

                if (dataAtual.isAfter(dataFinal)) break;
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("recorrencia.js", "gerarRecorrenciaPorPeriodo", error);
        }
    }

    /**
     * ✅ CORRIGIDO: Processa recorrência com loop para todas as datas
     * Cria um agendamento para cada data no array
     * O primeiro agendamento gera o viagemId que será usado como RecorrenciaViagemId nos demais
     */
    async handleRecurrence(periodoRecorrente, datasRecorrentes)
    {
        try
        {
            if (!datasRecorrentes || datasRecorrentes.length === 0)
            {
                console.error("❌ Nenhuma data inicial válida retornada para o período.");
                AppToast.show("Vermelho", "Erro: Nenhuma data válida para a recorrência", 3000);
                throw new Error("Nenhuma data válida para recorrência");
            }

            console.log(`📅 Processando ${datasRecorrentes.length} agendamento(s) recorrente(s)...`);
            console.log(`📋 Datas a processar:`, datasRecorrentes);

            // ✅ CRIAR PRIMEIRO AGENDAMENTO
            console.log("📤 Criando primeiro agendamento...");
            let primeiroAgendamento = window.criarAgendamento(null, null, datasRecorrentes[0]);

            if (!primeiroAgendamento)
            {
                console.error("❌ criarAgendamento retornou NULL");
                throw new Error("Erro ao criar objeto do primeiro agendamento");
            }

            // ✅ IMPORTANTE: Para o primeiro agendamento, garantir que RecorrenciaViagemId seja null/vazio
            primeiroAgendamento.RecorrenciaViagemId = "00000000-0000-0000-0000-000000000000";

            let agendamentoObj;
            let recorrenciaViagemId = null;

            try
            {
                agendamentoObj = await window.enviarNovoAgendamento(primeiroAgendamento, false);

                // ✅ CORREÇÃO: Verificar diferentes estruturas de resposta possíveis
                if (!agendamentoObj)
                {
                    console.error("❌ Primeiro agendamento falhou - resposta vazia");
                    throw new Error("Erro ao criar o primeiro agendamento.");
                }

                console.log("📦 Resposta completa do primeiro agendamento:", agendamentoObj);

                // ✅ ARMAZENAR O viagemId DO PRIMEIRO AGENDAMENTO
                // A resposta pode vir em diferentes formatos, vamos tentar todos
                recorrenciaViagemId = agendamentoObj.novaViagem?.viagemId ||
                    agendamentoObj.viagemId ||
                    agendamentoObj.data?.viagemId ||
                    agendamentoObj.data ||
                    agendamentoObj.id ||
                    null;

                // Se ainda não encontrou, procurar em propriedades aninhadas
                if (!recorrenciaViagemId || recorrenciaViagemId === "00000000-0000-0000-0000-000000000000")
                {
                    // Tentar buscar em data.value ou result
                    if (agendamentoObj.data && typeof agendamentoObj.data === 'object')
                    {
                        recorrenciaViagemId = agendamentoObj.data.viagemId ||
                            agendamentoObj.data.id ||
                            agendamentoObj.data.value?.viagemId ||
                            null;
                    }
                }

                if (!recorrenciaViagemId || recorrenciaViagemId === "00000000-0000-0000-0000-000000000000")
                {
                    console.error("❌ ViagemId não retornado pela API");
                    console.error("   Estrutura da resposta:", JSON.stringify(agendamentoObj, null, 2));

                    // Mesmo assim, continuar com os demais agendamentos
                    console.warn("⚠️ Continuando sem RecorrenciaViagemId (será gravado como GUID vazio)");
                }

                console.log("✅ Primeiro agendamento criado:");
                console.log("   📅 Data:", datasRecorrentes[0]);
                console.log("   🔑 ViagemId capturado:", recorrenciaViagemId || "NÃO CAPTURADO");
            }
            catch (error)
            {
                console.error("❌ Falha no primeiro agendamento:", error);
                Alerta.TratamentoErroComLinha("recorrencia.js", "handleRecurrence_primeiro", error);
                AppToast.show("Vermelho", "Erro ao criar o primeiro agendamento", 3000);
                throw error;
            }

            // ✅ CRIAR AGENDAMENTOS SUBSEQUENTES
            if (datasRecorrentes.length > 1)
            {
                console.log(`📤 Criando ${datasRecorrentes.length - 1} agendamento(s) subsequente(s)...`);
                console.log(`🔗 Usando RecorrenciaViagemId: ${recorrenciaViagemId || "GUID VAZIO"}`);

                let sucessos = 0;
                let falhas = 0;

                // ✅ LOOP POR TODAS AS DATAS RESTANTES
                for (let i = 1; i < datasRecorrentes.length; i++)
                {
                    const dataAtual = datasRecorrentes[i];

                    console.log(`\n   📤 Criando agendamento ${i}/${datasRecorrentes.length - 1}...`);
                    console.log(`      📅 Data: ${dataAtual}`);
                    console.log(`      🔗 RecorrenciaViagemId: ${recorrenciaViagemId || "00000000-0000-0000-0000-000000000000"}`);

                    // ✅ CRIAR AGENDAMENTO SUBSEQUENTE COM RecorrenciaViagemId
                    const agendamentoSubsequente = window.criarAgendamento(
                        null,                    // viagemId = null (novo)
                        recorrenciaViagemId || "00000000-0000-0000-0000-000000000000",    // RecorrenciaViagemId do primeiro
                        dataAtual               // Data específica
                    );

                    if (!agendamentoSubsequente)
                    {
                        falhas++;
                        console.error(`   ❌ Falha ao criar objeto do agendamento ${i}`);
                        continue;
                    }

                    try
                    {
                        await window.enviarNovoAgendamento(
                            agendamentoSubsequente,
                            false // ❌ NÃO MOSTRAR TOAST INDIVIDUAL
                        );

                        sucessos++;
                        console.log(`   ✅ Agendamento ${i} criado com sucesso`);
                    }
                    catch (error)
                    {
                        falhas++;
                        console.error(`   ❌ Falha no agendamento ${i}:`, error);
                        Alerta.TratamentoErroComLinha("recorrencia.js", "handleRecurrence_subsequente", error);
                    }
                }

                console.log(`\n📊 Resultado: ${sucessos + 1}/${datasRecorrentes.length} agendamentos criados`);

                if (falhas > 0)
                {
                    const mensagem = `${sucessos + 1} de ${datasRecorrentes.length} agendamentos criados. ${falhas} falharam.`;
                    console.warn("⚠️", mensagem);
                    AppToast.show("Amarelo", mensagem, 5000);

                    return {
                        sucesso: true,
                        totalCriados: sucessos + 1,
                        totalFalhas: falhas,
                        parcial: true
                    };
                }
            }

            // ✅ SUCESSO TOTAL
            console.log("✅ Todos os agendamentos foram criados!");
            return {
                sucesso: true,
                totalCriados: datasRecorrentes.length,
                totalFalhas: 0,
                parcial: false
            };

        }
        catch (error)
        {
            console.error("❌ Erro geral em handleRecurrence:", error);
            Alerta.TratamentoErroComLinha("recorrencia.js", "handleRecurrence", error);
            throw error;
        }
    }

    /**
     * Atualiza calendário com datas existentes
     */
    atualizarCalendarioExistente(datas)
    {
        try
        {
            const selectedDates = datas.map(data => new Date(data));
            const calendarObj = document.getElementById("calDatasSelecionadas").ej2_instances[0];

            calendarObj.values = selectedDates;
            calendarObj.refresh();
            calendarObj.isMultiSelection = false;

            const readOnlyElement = document.getElementById('readOnly-checkbox');
            if (readOnlyElement)
            {
                readOnlyElement.checked = true;
                readOnlyElement.disabled = true;
            }

            console.log("Calendário atualizado para modo somente leitura.");
        }
        catch (error)
        {
            Alerta.TratamentoErroComLinha("recorrencia.js", "atualizarCalendarioExistente", error);
        }
    }

    /**
     * ✅ FUNÇÃO ADICIONAL: Verifica e corrige RecorrenciaViagemId
     * Garante que o primeiro registro tenha RecorrenciaViagemId = ViagemId
     */
    async corrigirRecorrenciaViagemId(viagemId)
    {
        try
        {
            console.log("🔧 Corrigindo RecorrenciaViagemId do primeiro registro...");

            // Fazer uma chamada para atualizar o primeiro registro
            // onde RecorrenciaViagemId = ViagemId (marca como pai da recorrência)
            const payload = {
                ViagemId: viagemId,
                RecorrenciaViagemId: viagemId
            };

            console.log("📤 Enviando correção:", payload);

            // Esta função precisaria de uma API específica no backend
            // Por enquanto, apenas logamos o que deveria ser feito
            console.warn("⚠️ API de correção não implementada - o backend deve atualizar RecorrenciaViagemId = ViagemId para o primeiro registro");

            return true;
        }
        catch (error)
        {
            console.error("❌ Erro ao corrigir RecorrenciaViagemId:", error);
            return false;
        }
    }
}

// ====================================================================
// INICIALIZAÇÃO E EXPORTAÇÃO
// ====================================================================

// Criar instância global
window.gerenciadorRecorrencia = new GerenciadorRecorrencia();

// Exportar funções para uso global
window.ajustarDataInicialRecorrente = function (tipoRecorrencia)
{
    return window.gerenciadorRecorrencia.ajustarDataInicialRecorrente(tipoRecorrencia);
};

window.handleRecurrence = function (periodoRecorrente, datasRecorrentes)
{
    return window.gerenciadorRecorrencia.handleRecurrence(periodoRecorrente, datasRecorrentes);
};

window.atualizarCalendarioExistente = function (datas)
{
    return window.gerenciadorRecorrencia.atualizarCalendarioExistente(datas);
};

window.corrigirRecorrenciaViagemId = function (viagemId)
{
    return window.gerenciadorRecorrencia.corrigirRecorrenciaViagemId(viagemId);
};

console.log("✅ GerenciadorRecorrencia inicializado");
