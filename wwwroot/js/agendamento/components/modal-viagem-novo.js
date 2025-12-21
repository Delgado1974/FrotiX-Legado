// ====================================================================
// MODAL VIAGEM - Gerenciamento completo do modal de agendamento
// ====================================================================
//
// ESTRUTURA:
// 1. CRIAÇÃO DE OBJETOS DE AGENDAMENTO
// 2. ENVIO E COMUNICAÇÃO COM API
// 3. EDIÇÃO DE AGENDAMENTOS
// 4. ALTERAÇÃO DE DATA INICIAL (NOVA FUNCIONALIDADE)
// 5. INTEGRAÇÃO COM RELAtÓRIO
// 6. INICIALIZAÇÃO E LIMPEZA DE CAMPOS
// 7. CONTROLE DE ESTADO DO MODAL
//
// ====================================================================

// ====================================================================
// SEÇÃO 1: CRIAÇÃO DE OBJETOS DE AGENDAMENTO
// ====================================================================

/**
 * Flag global para controlar limpeza do modal
 * Evita que a limpeza seja executada múltiplas vezes
 */
window.modalJaFoiLimpo = false;

// Variável global para controlar instância do Report Viewer
window.telerikReportViewer = null;
window.isReportViewerLoading = false;

// Variável para rastrear último ID carregado
window.ultimoViagemIdCarregado = null;

/**
 * ðŸ”§ Função auxiliar segura para refresh de componentes Syncfusion
 * Evita erros quando o componente não está inicializado
 * param {string} elementId - ID do elemento
 * returns {boolean} Sucesso da operação
 */
window.refreshComponenteSafe = function (elementId)
{
    try
    {
        const elemento = document.getElementById(elementId);
        if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
        {
            const instancia = elemento.ej2_instances[0];

            // Verificar se o método existe antes de chamar
            if (typeof instancia.refresh === 'function')
            {
                instancia.refresh();
            } else if (typeof instancia.dataBind === 'function')
            {
                instancia.dataBind();
            }

            return true;
        }
        return false;
    } catch (error)
    {
        console.warn(`âš ï¸ Não foi possível atualizar ${elementId}:`, error);
        return false;
    }
};

/**
 * ðŸ“ Cria objeto de agendamento NOVO a partir dos campos do formulário
 * Esta é a função BASE que lê todos os campos e monta o objeto
 * returns {Object|null} Objeto de agendamento ou null em caso de erro
 */
window.criarAgendamentoNovo = function ()
{
    try
    {
        console.log("ðŸ“ [criarAgendamentoNovo] === INICIANDO ===");

        // Obter instâncias dos componentes Syncfusion
        const txtDataInicial = document.getElementById("txtDataInicial")?.ej2_instances?.[0];
        const txtDataFinal = document.getElementById("txtDataFinal")?.ej2_instances?.[0];
        const rteDescricao = document.getElementById("rteDescricao")?.ej2_instances?.[0];
        const lstMotorista = document.getElementById("lstMotorista")?.ej2_instances?.[0];
        const lstVeiculo = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
        const lstRequisitante = document.getElementById("lstRequisitante")?.ej2_instances?.[0];
        const lstSetorRequisitanteAgendamento = document.getElementById("lstSetorRequisitanteAgendamento")?.ej2_instances?.[0];
        const cmbOrigem = document.getElementById("cmbOrigem")?.ej2_instances?.[0];
        const cmbDestino = document.getElementById("cmbDestino")?.ej2_instances?.[0];
        const lstFinalidade = document.getElementById("lstFinalidade")?.ej2_instances?.[0];
        const ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial")?.ej2_instances?.[0];
        const ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal")?.ej2_instances?.[0];
        const lstEventos = document.getElementById("lstEventos")?.ej2_instances?.[0];
        const lstRecorrente = document.getElementById("lstRecorrente")?.ej2_instances?.[0];
        const lstPeriodos = document.getElementById("lstPeriodos")?.ej2_instances?.[0];
        const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia")?.ej2_instances?.[0];
        const lstDias = document.getElementById("lstDias")?.ej2_instances?.[0];
        const calDatasSelecionadas = document.getElementById("calDatasSelecionadas")?.ej2_instances?.[0];
        const lstDiasMes = document.getElementById("lstDiasMes")?.ej2_instances?.[0];

        // Extrair valores
        const dataInicialValue = txtDataInicial?.value;
        const dataFinalValue = txtDataFinal?.value;
        const horaInicioTexto = $("#txtHoraInicial").val();
        const horaFimTexto = $("#txtHoraFinal").val();

        // DEPOIS da linha 60, adicione este debug:
        console.log("ðŸ” [DEBUG] Valores capturados:");
        console.log("   - lstMotorista?.value:", lstMotorista?.value);
        console.log("   - lstVeiculo?.value:", lstVeiculo?.value);
        //console.log("   - typeof motoristaId:", typeof motoristaId);
        //console.log("   - typeof veiculoId:", typeof veiculoId);

        const motoristaId = lstMotorista?.value;
        const veiculoId = lstVeiculo?.value;

        // CORREÇÃO: Garantir que os valores sejam strings válidas ou null
        const motoristaIdFinal = (motoristaId && motoristaId !== "null" && motoristaId !== "undefined")
            ? String(motoristaId)
            : null;

        const veiculoIdFinal = (veiculoId && veiculoId !== "null" && veiculoId !== "undefined")
            ? String(veiculoId)
            : null;

        console.log("âœ… [DEBUG] Valores finais:");
        console.log("   - motoristaIdFinal:", motoristaIdFinal);
        console.log("   - veiculoIdFinal:", veiculoIdFinal);

        const requisitanteId = lstRequisitante?.value;
        const setorId = lstSetorRequisitanteAgendamento.value[0];
        const origem = cmbOrigem?.value;
        const destino = cmbDestino?.value;
        const finalidade = window.getSfValue0(lstFinalidade);
        const combustivelInicial = window.getSfValue0(ddtCombustivelInicial);
        const combustivelFinal = window.getSfValue0(ddtCombustivelFinal);
        const descricaoHtml = rteDescricao?.getHtml() ?? "";
        const ramal = $("#txtRamalRequisitanteSF").val();
        const kmAtual = window.parseIntSafe($("#txtKmAtual").val());
        const kmInicial = window.parseIntSafe($("#txtKmInicial").val());
        const kmFinal = window.parseIntSafe($("#txtKmFinal").val());
        const noFichaVistoria = $("#txtNoFichaVistoria").val();

        // Processar evento
        let eventoId = null;

        if (lstEventos?.value)
        {
            const eventosVal = lstEventos.value;

            // ✅ Tratar tanto array (MultiSelect) quanto valor único (ComboBox)
            if (Array.isArray(eventosVal) && eventosVal.length > 0)
            {
                eventoId = eventosVal[0]; // MultiSelect
            } else if (eventosVal)
            {
                eventoId = eventosVal; // ComboBox
            }
        }

        console.log("🎪 EventoId capturado:", eventoId);

        // Processar datas
        let dataInicial = null;
        let horaInicio = null;

        if (dataInicialValue)
        {
            const dataInicialDate = new Date(dataInicialValue);
            dataInicial = window.toDateOnlyString(dataInicialDate);

            if (horaInicioTexto)
            {
                horaInicio = window.toLocalDateTimeString(dataInicialDate, horaInicioTexto);
            }
        }

        let dataFinal = null;
        if (dataFinalValue)
        {
            const dataFinalDate = new Date(dataFinalValue);
            dataFinal = window.toDateOnlyString(dataFinalDate);
        }

        // Processar recorrência
        const recorrente = lstRecorrente?.value ?? "N";
        const intervalo = window.getSfValue0(lstPeriodos) ?? "";

        let dataFinalRecorrencia = null;
        if (txtFinalRecorrencia?.value)
        {
            const dataFinalRecDate = new Date(txtFinalRecorrencia.value);
            dataFinalRecorrencia = window.toDateOnlyString(dataFinalRecDate);
        }

        // ============================================================================
        // cÓDIGO CORRIGIDO - PRONTO PARA COPIAR E COLAR
        // ============================================================================
        // Substitua as linhas 171-198 do modal-viagem.js por este código
        // ============================================================================

        // Processar dias da semana (para recorrência semanal)
        let monday = false, tuesday = false, wednesday = false;
        let thursday = false, friday = false, saturday = false, sunday = false;

        if (lstDias?.value && Array.isArray(lstDias.value))
        {
            const diasSelecionados = lstDias.value;

            // âœ… CORREÇÃO: lstDias retorna NÚMEROS (0-6), não textos!
            // Mapeamento: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
            sunday = diasSelecionados.includes(0);
            monday = diasSelecionados.includes(1);
            tuesday = diasSelecionados.includes(2);
            wednesday = diasSelecionados.includes(3);
            thursday = diasSelecionados.includes(4);
            friday = diasSelecionados.includes(5);
            saturday = diasSelecionados.includes(6);

            // Debug para verificar o mapeamento
            console.log("ðŸ“… Dias selecionados (números):", diasSelecionados);
            console.log("ðŸ“‹ Mapeamento booleano:", {
                domingo: sunday,
                segunda: monday,
                terca: tuesday,
                quarta: wednesday,
                quinta: thursday,
                sexta: friday,
                sabado: saturday
            });
        }

        // Processar datas selecionadas (para recorrência variada)
        let datasSelecionadas = null;
        if (calDatasSelecionadas?.values && Array.isArray(calDatasSelecionadas.values))
        {
            datasSelecionadas = calDatasSelecionadas.values
                .map(d => window.toDateOnlyString(new Date(d)))
                .join(",");
        }

        // ============================================================================
        // FIM DO cÓDIGO CORRIGIDO
        // ============================================================================

        // Processar dia do mês (para recorrência mensal)
        const diaMesRecorrencia = window.getSfValue0(lstDiasMes);

        // Montar objeto de agendamento
        const agendamento = {
            ViagemId: "00000000-0000-0000-0000-000000000000",
            RecorrenciaViagemId: "00000000-0000-0000-0000-000000000000",
            DataInicial: dataInicial,
            HoraInicio: horaInicio,
            DataFinal: dataFinal,
            HoraFim: horaFimTexto,
            Finalidade: finalidade,
            Origem: origem,
            Destino: destino,

            MotoristaId: motoristaIdFinal,
            VeiculoId: veiculoIdFinal,

            //MotoristaId: motoristaId,
            //VeiculoId: veiculoId,
            CombustivelInicial: combustivelInicial,
            CombustivelFinal: combustivelFinal,
            KmAtual: kmAtual,
            KmInicial: kmInicial,
            KmFinal: kmFinal,
            RequisitanteId: requisitanteId,
            RamalRequisitante: ramal,
            SetorSolicitanteId: setorId,
            Descricao: descricaoHtml,
            StatusAgendamento: true,
            FoiAgendamento: false,
            Status: "Agendada",
            EventoId: eventoId,
            Recorrente: recorrente,
            Intervalo: intervalo,
            DataFinalRecorrencia: dataFinalRecorrencia,
            Monday: monday,
            Tuesday: tuesday,
            Wednesday: wednesday,
            Thursday: thursday,
            Friday: friday,
            Saturday: saturday,
            Sunday: sunday,
            //DatasSelecionadas: datasSelecionadas,
            DiaMesRecorrencia: diaMesRecorrencia,
            NoFichaVistoria: noFichaVistoria
        };

        console.log("âœ… [criarAgendamentoNovo] Agendamento criado:", agendamento);
        return agendamento;
    } catch (error)
    {
        console.error("âŒ [criarAgendamentoNovo] ERRO:", error);
        Alerta.TratamentoErroComLinha("modal-viagem.js", "criarAgendamentoNovo", error);
        return null;
    }
};

/**
 * ðŸ“ Cria objeto de agendamento com recorrência
 * Usado quando o agendamento se repete em múltiplas datas
 * param {string} viagemId - ID da viagem
 * param {string} viagemIdRecorrente - ID da recorrência
 * param {string} dataInicial - Data inicial (formato YYYY-MM-DD)
 * returns {Object|null} Objeto de agendamento ou null em caso de erro
 */
window.criarAgendamento = function (viagemId, viagemIdRecorrente, dataInicial)
{
    try
    {
        console.log("ðŸ“ [criarAgendamento] === INICIANDO ===");
        console.log("   ðŸ“‹ Parâmetros recebidos:");
        console.log("      - viagemId:", viagemId);
        console.log("      - viagemIdRecorrente:", viagemIdRecorrente);
        console.log("      - dataInicial:", dataInicial);

        // âœ… CRIAR O AGENDAMENTO BASE usando a função que JÃ FUNCIONA
        console.log("   ðŸ”§ Chamando criarAgendamentoNovo()...");
        const agendamentoBase = window.criarAgendamentoNovo();

        if (!agendamentoBase)
        {
            console.error("   âŒ criarAgendamentoNovo retornou NULL!");
            throw new Error("Não foi possível criar o objeto base do agendamento");
        }

        console.log("   âœ… Agendamento base criado com sucesso");
        console.log("   ðŸ“‹ DataInicial do base:", agendamentoBase.DataInicial);

        // âœ… CLONAR o objeto para não modificar o original
        const agendamento = { ...agendamentoBase };

        // âœ… SOBRESCREVER os campos especí­ficos de recorrência
        agendamento.ViagemId = viagemId || "00000000-0000-0000-0000-000000000000";
        agendamento.RecorrenciaViagemId = viagemIdRecorrente || "00000000-0000-0000-0000-000000000000";

        // âœ… RECALCULAR HoraInicio quando DataInicial for alterada
        if (dataInicial)
        {
            const horaInicioTexto = $("#txtHoraInicial").val();

            if (horaInicioTexto)
            {
                const dataInicialDate = new Date(dataInicial + 'T00:00:00');
                agendamento.DataInicial = dataInicial;
                agendamento.HoraInicio = window.toLocalDateTimeString(dataInicialDate, horaInicioTexto);

                console.log("   ðŸ”„ DataInicial SOBRESCRITA para:", dataInicial);
                console.log("   ðŸ”„ HoraInicio RECALCULADA para:", agendamento.HoraInicio);
            } else
            {
                console.error("   âŒ Hora inicial não encontrada!");
                throw new Error("Hora de Início é obrigatória");
            }
        }

        // âœ… VALIDAÇÕES CríTICAS
        const erros = [];

        if (!agendamento.DataInicial)
        {
            erros.push("Data Inicial é obrigatória");
        }

        if (!agendamento.HoraInicio)
        {
            erros.push("Hora de Início é obrigatória");
        }

        //if (!agendamento.MotoristaId) {
        //    erros.push("Motorista é obrigatório");
        //}

        //if (!agendamento.VeiculoId) {
        //    erros.push("Veí­culo é obrigatório");
        //}

        if (!agendamento.RequisitanteId)
        {
            erros.push("Requisitante é obrigatório");
        }

        if (!agendamento.Finalidade)
        {
            erros.push("Finalidade é obrigatória");
        }

        if (erros.length > 0)
        {
            console.error('âŒ ERRO DE VALIDAÇÃO:');
            console.error('      - ' + erros[0]);
            Alerta.Erro(erros[0]); // Mostra apenas o primeiro erro
            return null; // Para a execução
        }

        console.log("   âœ… === AGENDAMENTO CRIADO COM SUCESSO ===");
        console.log("   ðŸ“‹ Resumo do agendamento:");
        console.log("      - ViagemId:", agendamento.ViagemId);
        console.log("      - RecorrenciaViagemId:", agendamento.RecorrenciaViagemId);
        console.log("      - DataInicial:", agendamento.DataInicial);
        console.log("      - HoraInicio:", agendamento.HoraInicio);
        console.log("      - Recorrente:", agendamento.Recorrente);
        console.log("      - Intervalo:", agendamento.Intervalo);
        console.log("      - MotoristaId:", agendamento.MotoristaId);
        console.log("      - VeiculoId:", agendamento.VeiculoId);
        console.log("      - RequisitanteId:", agendamento.RequisitanteId);
        console.log("      - Finalidade:", agendamento.Finalidade);

        return agendamento;
    } catch (error)
    {
        console.error("âŒ [criarAgendamento] ERRO FATAL:", error);
        console.error("   Stack trace:", error.stack);

        Alerta.TratamentoErroComLinha("modal-viagem.js", "criarAgendamento", error);
        AppToast.show("Vermelho", "Erro ao criar agendamento: " + error.message, 5000);

        return null;
    }
};

/**
 * ðŸ“ Cria objeto de agendamento para edição
 * Preserva campos originais e atualiza apenas os modificados
 * param {Object} agendamentoOriginal - Agendamento original do banco
 * returns {Object|null} Objeto de agendamento ou null em caso de erro
 */
window.criarAgendamentoEdicao = function (agendamentoOriginal)
{
    try
    {
        // Obter instâncias dos componentes
        const rteDescricao = document.getElementById("rteDescricao")?.ej2_instances?.[0];
        const lstMotorista = document.getElementById("lstMotorista")?.ej2_instances?.[0];
        const lstVeiculo = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
        const ddtSetor = document.getElementById("lstSetorRequisitanteAgendamento")?.ej2_instances?.[0];
        const ddtFinalidade = document.getElementById("lstFinalidade")?.ej2_instances?.[0];
        const ddtCombIniInst = document.getElementById("ddtCombustivelInicial")?.ej2_instances?.[0];
        const ddtCombFimInst = document.getElementById("ddtCombustivelFinal")?.ej2_instances?.[0];
        const lstEventosInst = document.getElementById("lstEventos")?.ej2_instances?.[0];
        const txtDataInicial = document.getElementById("txtDataInicial")?.ej2_instances?.[0];
        const txtDataFinal = document.getElementById("txtDataFinal")?.ej2_instances?.[0];
        const rteDescricaoHtmlContent = rteDescricao?.getHtml() ?? "";

        // Extrair valores dos componentes
        const motoristaId = lstMotorista?.value ?? null;
        const veiculoId = lstVeiculo?.value ?? null;
        const setorId = window.getSfValue0(ddtSetor);
        const requisitanteId = document.getElementById("lstRequisitante")?.ej2_instances?.[0]?.value ?? null;
        const destino = document.getElementById("cmbDestino")?.ej2_instances?.[0]?.value ?? null;
        const origem = document.getElementById("cmbOrigem")?.ej2_instances?.[0]?.value ?? null;
        const finalidade = window.getSfValue0(ddtFinalidade);
        const combustivelInicial = window.getSfValue0(ddtCombIniInst);
        const combustivelFinal = window.getSfValue0(ddtCombFimInst);
        const noFichaVistoria = $("#txtNoFichaVistoria").val();
        const kmAtual = window.parseIntSafe($("#txtKmAtual").val());
        const kmInicial = window.parseIntSafe($("#txtKmInicial").val());
        const kmFinal = window.parseIntSafe($("#txtKmFinal").val());

        // Processar evento
        let eventoId = null;

        if (lstEventosInst?.value)
        {
            const eventosVal = lstEventosInst.value;

            // ✅ Tratar tanto array (MultiSelect) quanto valor único (ComboBox)
            if (Array.isArray(eventosVal) && eventosVal.length > 0)
            {
                eventoId = eventosVal[0]; // MultiSelect
            } else if (eventosVal)
            {
                eventoId = eventosVal; // ComboBox
            }
        }

        console.log("🎪 EventoId capturado:", eventoId);

        // NOVA LÃ“GICA: Permitir alteração de data inicial
        const txtDataInicialValue = txtDataInicial?.value;
        let dataInicialStr = null;

        if (txtDataInicialValue)
        {
            const dataInicialDate = new Date(txtDataInicialValue);
            dataInicialStr = window.toDateOnlyString(dataInicialDate);
        }

        const horaInicioTexto = $("#txtHoraInicial").val();
        let horaInicioLocal = null;

        if (txtDataInicialValue && horaInicioTexto)
        {
            const dataInicialDate = new Date(txtDataInicialValue);
            horaInicioLocal = window.toLocalDateTimeString(dataInicialDate, horaInicioTexto);
        }

        const dataFinalDate = txtDataFinal?.value ? new Date(txtDataFinal.value) : null;
        const dataFinalStr = dataFinalDate ? window.toDateOnlyString(dataFinalDate) : null;
        const horaFimTexto = $("#txtHoraFinal").val() || null;

        // Preservar status original
        const statusAgendamento = agendamentoOriginal?.statusAgendamento ?? true;
        const foiAgendamento = agendamentoOriginal?.foiAgendamento ?? true;

        // Montar payload de edição
        const payload = {
            ViagemId: agendamentoOriginal?.viagemId,
            DataInicial: dataInicialStr,
            HoraInicio: horaInicioLocal,
            DataFinal: dataFinalStr,
            HoraFim: horaFimTexto,
            Finalidade: finalidade,
            Origem: origem,
            Destino: destino,
            MotoristaId: motoristaId,
            VeiculoId: veiculoId,
            CombustivelInicial: combustivelInicial,
            CombustivelFinal: combustivelFinal,
            KmAtual: kmAtual,
            KmInicial: kmInicial,
            KmFinal: kmFinal,
            RequisitanteId: requisitanteId,
            RamalRequisitante: $("#txtRamalRequisitanteSF").val(),
            SetorSolicitanteId: setorId,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: statusAgendamento,
            FoiAgendamento: foiAgendamento,
            Status: agendamentoOriginal?.status,
            EventoId: eventoId,
            Recorrente: agendamentoOriginal?.recorrente,
            RecorrenciaViagemId: agendamentoOriginal?.recorrenciaViagemId,
            //DatasSelecionadas: agendamentoOriginal?.datasSelecionadas,
            Intervalo: agendamentoOriginal?.intervalo,
            DataFinalRecorrencia: agendamentoOriginal?.dataFinalRecorrencia,
            Monday: agendamentoOriginal?.monday,
            Tuesday: agendamentoOriginal?.tuesday,
            Wednesday: agendamentoOriginal?.wednesday,
            Thursday: agendamentoOriginal?.thursday,
            Friday: agendamentoOriginal?.friday,
            Saturday: agendamentoOriginal?.saturday,
            Sunday: agendamentoOriginal?.sunday,
            DiaMesRecorrencia: agendamentoOriginal?.diaMesRecorrencia,
            NoFichaVistoria: noFichaVistoria
        };

        return payload;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "criarAgendamentoEdicao", error);
        return null;
    }
};

/**
 * ðŸ“ Cria objeto de viagem (transformação de agendamento)
 * Converte um agendamento em viagem real (quando sai do status "Agendada")
 * param {Object} agendamentoUnicoAlterado - Agendamento base
 * returns {Object|null} Objeto de viagem ou null em caso de erro
 */
window.criarAgendamentoViagem = function (agendamentoUnicoAlterado)
{
    try
    {
        const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        const rteDescricaoHtmlContent = rteDescricao.getHtml();

        let motoristaId = document.getElementById("lstMotorista").ej2_instances[0].value;
        let veiculoId = document.getElementById("lstVeiculo").ej2_instances[0].value;

        // Processar evento
        let eventoId = null;
        const lstEventosInst = document.getElementById("lstEventos")?.ej2_instances?.[0];

        if (lstEventosInst?.value)
        {
            const eventosVal = lstEventosInst.value;

            // ✅ Tratar tanto array (MultiSelect) quanto valor único (ComboBox)
            if (Array.isArray(eventosVal) && eventosVal.length > 0)
            {
                eventoId = eventosVal[0]; // MultiSelect
            } else if (eventosVal)
            {
                eventoId = eventosVal; // ComboBox
            }
        }

        console.log("🎪 EventoId capturado:", eventoId);

        let setorId = document.getElementById("lstSetorRequisitanteAgendamento").ej2_instances[0].value[0];
        let ramal = $("#txtRamalRequisitanteSF").val();
        let requisitanteId = document.getElementById("lstRequisitante").ej2_instances[0].value;
        let kmAtual = parseInt($("#txtKmAtual").val(), 10);
        let kmInicial = parseInt($("#txtKmInicial").val(), 10);
        let kmFinal = parseInt($("#txtKmFinal").val(), 10);
        let destino = document.getElementById("cmbDestino").ej2_instances[0].value;
        let origem = document.getElementById("cmbOrigem").ej2_instances[0].value;
        let finalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];
        let combustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0].value[0];

        // Combustí­vel final (opcional)
        let combustivelFinal = "";
        if (document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0] === null ||
            document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0] === undefined)
        {
            combustivelFinal = null;
        } else
        {
            combustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0];
        }

        // Data final (opcional)
        let dataFinal = "";
        if (document.getElementById("txtDataFinal").ej2_instances[0].value === null ||
            document.getElementById("txtDataFinal").ej2_instances[0].value === undefined)
        {
            dataFinal = null;
        } else
        {
            dataFinal = moment(document.getElementById("txtDataFinal").ej2_instances[0].value).format("YYYY-MM-DD");
        }

        let horaInicio = $("#txtHoraInicial").val();

        // Hora fim (opcional)
        let horaFim = "";
        if (document.getElementById("txtHoraFinal").value === null ||
            document.getElementById("txtHoraFinal").value === undefined ||
            document.getElementById("txtHoraFinal").value === "")
        {
            horaFim = null;
        } else
        {
            horaFim = document.getElementById("txtHoraFinal").value;
        }

        let statusAgendamento = document.getElementById("txtStatusAgendamento").value;
        let criarViagemFechada = true;
        let noFichaVistoria = document.getElementById("txtNoFichaVistoria").value;
        let status = "Aberta";

        // Determinar status baseado nos campos preenchidos
        if (dataFinal && horaFim && combustivelFinal && kmFinal)
        {
            status = "Realizada";
            if (statusAgendamento)
            {
                criarViagemFechada = true;
            } else
            {
                criarViagemFechada = false;
            }
        }

        const agendamento = {
            ViagemId: window.viagemId,
            NoFichaVistoria: noFichaVistoria,
            DataInicial: window.dataInicial,
            HoraInicio: horaInicio,
            DataFinal: dataFinal,
            HoraFim: horaFim,
            Finalidade: finalidade,
            Origem: origem,
            Destino: destino,
            MotoristaId: motoristaId,
            VeiculoId: veiculoId,
            KmAtual: kmAtual,
            KmInicial: kmInicial,
            KmFinal: kmFinal,
            CombustivelInicial: combustivelInicial,
            CombustivelFinal: combustivelFinal,
            RequisitanteId: requisitanteId,
            RamalRequisitante: ramal,
            SetorSolicitanteId: setorId,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: false,
            FoiAgendamento: true,
            Status: status,
            EventoId: eventoId,
            Recorrente: agendamentoUnicoAlterado.recorrente,
            RecorrenciaViagemId: agendamentoUnicoAlterado.recorrenciaViagemId,
            //DatasSelecionadas: agendamentoUnicoAlterado.datasSelecionadas,
            Intervalo: agendamentoUnicoAlterado.intervalo,
            DataFinalRecorrencia: agendamentoUnicoAlterado.dataFinalRecorrencia,
            Monday: agendamentoUnicoAlterado.monday,
            Tuesday: agendamentoUnicoAlterado.tuesday,
            Wednesday: agendamentoUnicoAlterado.wednesday,
            Thursday: agendamentoUnicoAlterado.thursday,
            Friday: agendamentoUnicoAlterado.friday,
            Saturday: agendamentoUnicoAlterado.saturday,
            Sunday: agendamentoUnicoAlterado.sunday,
            DiaMesRecorrencia: agendamentoUnicoAlterado.diaMesRecorrencia,
            CriarViagemFechada: criarViagemFechada
        };

        return agendamento;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "criarAgendamentoViagem", error);
        return null;
    }
};

// ====================================================================
// SEÇÃO 2: ENVIO E COMUNICAÇÃO COM API
// ====================================================================

/**
 * ðŸ“¤ Envia agendamento para API
 * Função base para todas as operações de criação/atualização
 * param {Object} agendamento - Objeto de agendamento
 * returns {Promise<Object>} Resultado da operação
 */
window.enviarAgendamento = async function (agendamento)
{
    try
    {
        // Evitar múltiplos envios simultâneos
        if (window.isSubmitting)
        {
            console.warn("âš ï¸ Tentativa de enviar enquanto outra requisição está em andamento.");
            return;
        }

        // VALIDAÇÃO: Data Final não pode ser superior à data atual
        if (agendamento.DataFinal)
        {
            const dataFinalDate = new Date(agendamento.DataFinal + "T00:00:00");
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            if (dataFinalDate > hoje)
            {
                // Limpar campo Data Final no modal
                const txtDataFinal = document.getElementById("txtDataFinal")?.ej2_instances?.[0];
                if (txtDataFinal)
                {
                    txtDataFinal.value = null;
                }
                AppToast.show("Amarelo", "A Data Final não pode ser superior à data atual.", 4000);
                return { success: false, message: "Data Final inválida" };
            }
        }

        window.isSubmitting = true;
        $("#btnConfirma").prop("disabled", true);

        try
        {
            const response = await $.ajax({
                type: "POST",
                url: "/api/Agenda/Agendamento",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(agendamento)
            });

            if (response?.success === true)
            {
                console.log("Agendamento enviado com sucesso.");
            } else
            {
                console.error("Erro ao enviar agendamento: operação mal sucedida.", response);
                throw new Error("Erro ao criar agendamento. Operação mal sucedida.");
            }

            response.operacaoBemSucedida = true;
            return response;
        } catch (error)
        {
            if (error.statusText)
            {
                // Ã‰ um erro AJAX
                const erroAjax = window.criarErroAjax(error, error.statusText, error.responseText, { url: "/api/Agenda/Agendamento", type: "POST" });
                Alerta.TratamentoErroComLinha("modal-viagem.js", "enviarAgendamento", erroAjax);
            } else
            {
                Alerta.TratamentoErroComLinha("modal-viagem.js", "enviarAgendamento", error);
            }
            throw error;
        } finally
        {
            window.isSubmitting = false;
            $("#btnConfirma").prop("disabled", false);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "enviarAgendamento", error);
        throw error;
    }
};

/**
 * ðŸ“¤ Envia novo agendamento
 * Wrapper para envio com feedback de sucesso
 * param {Object} agendamento - Objeto de agendamento
 * param {boolean} isUltimoAgendamento - Se é o último da série
 * returns {Promise<Object>} Resultado da operação
 */
window.enviarNovoAgendamento = async function (agendamento, isUltimoAgendamento = true)
{
    try
    {
        try
        {
            const objViagem = await window.enviarAgendamento(agendamento);

            if (!objViagem.operacaoBemSucedida)
            {
                console.error("âŒ Erro ao criar novo agendamento: operação não bem-sucedida", objViagem);
                throw new Error("Erro ao criar novo agendamento");
            }

            // Mostrar feedback apenas no último agendamento de uma série
            if (isUltimoAgendamento)
            {
                window.exibirMensagemSucesso();
            }

            return objViagem;
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("modal-viagem.js", "enviarNovoAgendamento_inner", error);
            throw error;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "enviarNovoAgendamento", error);
        throw error;
    }
};

/**
 * ðŸ“¤ Envia agendamento com opções de edição
 * Usado para editar agendamentos recorrentes (editar todos ou apenas próximos)
 * param {string} viagemId - ID da viagem
 * param {boolean} editarTodos - Editar todos os recorrentes
 * param {boolean} editarProximos - Editar próximos
 * param {string} dataInicial - Data inicial
 * param {string} viagemIdRecorrente - ID da recorrência
 */
window.enviarAgendamentoComOpcao = async function (viagemId, editarTodos, editarProximos, dataInicial = null, viagemIdRecorrente = null)
{
    try
    {
        try
        {
            if (!dataInicial)
            {
                dataInicial = moment().format("YYYY-MM-DD");
            }

            const agendamento = window.criarAgendamento(viagemId, viagemIdRecorrente, dataInicial);

            agendamento.EditarTodos = editarTodos;
            agendamento.EditarProximos = editarProximos;

            const objViagem = await window.enviarAgendamento(agendamento);

            if (objViagem)
            {
                AppToast.show("Verde", "Agendamento atualizado com sucesso", 3000);
                $("#modalViagens").modal("hide");
                $(document.body).removeClass("modal-open");
                $(".modal-backdrop").remove();
                $(document.body).css("overflow", "");
                window.calendar.refetchEvents();
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("modal-viagem.js", "enviarAgendamentoComOpcao_inner", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "enviarAgendamentoComOpcao", error);
    }
};

/**
 * ðŸ”„ Aplica atualização em agendamento
 * Envia alterações para o servidor usando Fetch API
 * param {Object} objViagem - Objeto de viagem
 * returns {Promise<boolean>} Sucesso da operação
 */
window.aplicarAtualizacao = async function (objViagem)
{
    try
    {
        const response = await fetch("/api/Agenda/Agendamento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(objViagem)
        });

        const data = await response.json();

        if (data?.success || data?.data)
        {
            AppToast.show("Verde", data.message || "Agendamento Atualizado", 2000);
            return true;
        } else
        {
            AppToast.show("Vermelho", data?.message || "Falha ao atualizar agendamento", 2000);
            return false;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "aplicarAtualizacao", error);
        return false;
    }
};

// ====================================================================
// SEÇÃO 3: RECUPERAÇÃO E CONSULTA DE DADOS
// ====================================================================

/**
 * ðŸ” Recupera viagem para edição
 * Busca dados completos da viagem do servidor
 * param {string} viagemId - ID da viagem
 * returns {Promise<Object|null>} Dados da viagem ou null
 */
window.recuperarViagemEdicao = async function (viagemId)
{
    try
    {
        const result = await window.AgendamentoService.obterParaEdicao(viagemId);

        if (result.success)
        {
            return result.data;
        } else
        {
            throw new Error(result.error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "recuperarViagemEdicao", error);
        return null;
    }
};

/**
 * ðŸ” Obtém agendamentos recorrentes para exclusão
 * Busca todos os agendamentos de uma série recorrente
 * param {string} recorrenciaViagemId - ID da recorrência
 * returns {Promise<Array>} Lista de agendamentos
 */
window.obterAgendamentosRecorrentes = async function (recorrenciaViagemId)
{
    try
    {
        const result = await window.AgendamentoService.obterRecorrentes(recorrenciaViagemId);

        if (result.success)
        {
            return result.data;
        } else
        {
            throw new Error(result.error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "obterAgendamentosRecorrentes", error);
        return [];
    }
};

/**
 * ðŸ” Obtém agendamento inicial de recorrência
 * Busca o primeiro agendamento de uma série recorrente
 * param {string} viagemId - ID da viagem
 * returns {Promise<Array>} Lista com agendamento inicial
 */
window.obterAgendamentosRecorrenteInicial = async function (viagemId)
{
    try
    {
        const result = await window.AgendamentoService.obterRecorrenteInicial(viagemId);

        if (result.success)
        {
            return result.data;
        } else
        {
            throw new Error(result.error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "obterAgendamentosRecorrenteInicial", error);
        return [];
    }
};

// ====================================================================
// SEÇÃO 4: EXCLUSÃO E CANCELAMENTO
// ====================================================================

/**
 * ðŸ—‘ï¸ Exclui agendamento
 * Remove completamente o agendamento do sistema
 * param {string} viagemId - ID da viagem
 */
window.excluirAgendamento = async function (viagemId)
{
    try
    {
        const result = await window.AgendamentoService.excluir(viagemId);

        if (result.success)
        {
            // Sucesso já tratado no service
        } else
        {
            AppToast.show("Vermelho", result.message, 2000);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "excluirAgendamento", error);
    }
};

/**
 * âŒ Cancela agendamento
 * Muda status para cancelado (mantém no banco para histórico)
 * param {string} viagemId - ID da viagem
 * param {string} descricao - Descrição do cancelamento
 * param {boolean} mostrarToast - Se deve mostrar toast
 * returns {Promise<Object>} Resultado da operação
 */
window.cancelarAgendamento = async function (viagemId, descricao, mostrarToast = true)
{
    try
    {
        const result = await window.AgendamentoService.cancelar(viagemId, descricao);

        if (result.success)
        {
            if (mostrarToast)
            {
                AppToast.show("Verde", "O agendamento foi cancelado com sucesso!", 2000);
            }
            return result;
        } else
        {
            AppToast.show("Vermelho", result.message, 2000);
            return result;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "cancelarAgendamento", error);
        return { success: false, error: error.message };
    }
};

// ====================================================================
// SEÇÃO 4.5: ALTERAÇÃO DE DATA INICIAL (NOVA FUNCIONALIDADE)
// ====================================================================

/**
 * ðŸ—“ï¸ Detecta se houve alteração na Data Inicial
 * param {Object} agendamentoOriginal - Dados originais do banco
 * returns {Object} { alterou: boolean, dataOriginal: Date, dataNova: Date }
 */
function detectarAlteracaoDataInicial(agendamentoOriginal)
{
    try
    {
        // Obter data original do banco
        const dataOriginalStr = agendamentoOriginal?.dataInicial;
        if (!dataOriginalStr)
        {
            return { alterou: false, dataOriginal: null, dataNova: null };
        }

        const dataOriginal = new Date(dataOriginalStr);
        dataOriginal.setHours(0, 0, 0, 0);

        // Obter data atual do formulário
        const txtDataInicial = document.getElementById("txtDataInicial")?.ej2_instances?.[0];
        if (!txtDataInicial || !txtDataInicial.value)
        {
            return { alterou: false, dataOriginal: null, dataNova: null };
        }

        const dataNova = new Date(txtDataInicial.value);
        dataNova.setHours(0, 0, 0, 0);

        // Comparar timestamps
        const alterou = dataOriginal.getTime() !== dataNova.getTime();

        console.log("ðŸ“… [DataInicial] Detecção de alteração:", {
            dataOriginal: dataOriginal.toLocaleDateString('pt-BR'),
            dataNova: dataNova.toLocaleDateString('pt-BR'),
            alterou: alterou
        });

        return {
            alterou: alterou,
            dataOriginal: dataOriginal,
            dataNova: dataNova,
            dataOriginalStr: dataOriginalStr,
            dataNovaStr: window.toDateOnlyString(dataNova)
        };
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "detectarAlteracaoDataInicial", error);
        return { alterou: false, dataOriginal: null, dataNova: null };
    }
}

/**
 * ðŸ”€ Calcula "push" de datas para agendamentos subsequentes
 * param {Date} dataOriginal - Data original
 * param {Date} dataNova - Data nova escolhida
 * param {string} intervalo - Tipo de recorrência (D, S, Q, M)
 * returns {number} Quantidade de dias/semanas/meses a avançar
 */
function calcularPushDatas(dataOriginal, dataNova, intervalo)
{
    try
    {
        const diffDias = Math.floor((dataNova - dataOriginal) / (1000 * 60 * 60 * 24));

        console.log("ðŸ“Š [Push] Diferença em dias:", diffDias);

        switch (intervalo)
        {
            case "D": // Diário
                return diffDias;

            case "S": // Semanal
                return Math.floor(diffDias / 7);

            case "Q": // Quinzenal
                return Math.floor(diffDias / 14);

            case "M": // Mensal
                const mOriginal = moment(dataOriginal);
                const mNova = moment(dataNova);
                return mNova.diff(mOriginal, 'months');

            default:
                console.warn("âš ï¸ Intervalo não reconhecido:", intervalo);
                return 0;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "calcularPushDatas", error);
        return 0;
    }
}

/**
 * ðŸ”„ Aplica "push" nas datas de agendamentos subsequentes
 * param {string} recorrenciaViagemId - ID da recorrência
 * param {Date} dataOriginal - Data original
 * param {Date} dataNova - Nova data
 * param {string} intervalo - Tipo de intervalo (D, S, Q, M)
 * param {Date} dataReferencia - Data a partir da qual aplicar o push
 * returns {Promise<boolean>} Sucesso da operação
 */
async function aplicarPushDatasSubsequentes(recorrenciaViagemId, dataOriginal, dataNova, intervalo, dataReferencia)
{
    try
    {
        console.log("ðŸ”„ [Push] Iniciando aplicação de push nas datas subsequentes...");

        // Buscar todos os agendamentos da recorrência
        const agendamentos = await window.obterAgendamentosRecorrentes(recorrenciaViagemId);

        if (!agendamentos || agendamentos.length === 0)
        {
            console.warn("âš ï¸ Nenhum agendamento recorrente encontrado");
            return false;
        }

        // Calcular unidades de push
        const pushUnidades = calcularPushDatas(dataOriginal, dataNova, intervalo);

        console.log("ðŸ“Š [Push] Unidades a avançar:", pushUnidades, "no intervalo:", intervalo);

        let contadorSucesso = 0;
        let contadorErro = 0;

        // Filtrar apenas agendamentos com data >= dataReferencia
        const agendamentosFiltrados = agendamentos.filter(ag =>
        {
            const dataAg = new Date(ag.dataInicial);
            dataAg.setHours(0, 0, 0, 0);
            return dataAg.getTime() >= dataReferencia.getTime();
        });

        console.log(`ðŸ“‹ [Push] Total de agendamentos a atualizar: ${agendamentosFiltrados.length}`);

        // Aplicar push em cada agendamento
        for (const agendamento of agendamentosFiltrados)
        {
            try
            {
                const dataAtual = moment(agendamento.dataInicial);
                let novaData;

                // Aplicar push conforme o intervalo
                switch (intervalo)
                {
                    case "D": // Diário
                        novaData = dataAtual.add(pushUnidades, 'days');
                        break;

                    case "S": // Semanal
                        novaData = dataAtual.add(pushUnidades, 'weeks');
                        break;

                    case "Q": // Quinzenal
                        novaData = dataAtual.add(pushUnidades * 2, 'weeks');
                        break;

                    case "M": // Mensal
                        novaData = dataAtual.add(pushUnidades, 'months');
                        break;

                    default:
                        console.warn("âš ï¸ Intervalo inválido:", intervalo);
                        continue;
                }

                // Criar payload de atualização MANUALMENTE (sem spread operator)
                const payload = {
                    ViagemId: agendamento.viagemId,
                    DataInicial: novaData.format("YYYY-MM-DD"),
                    HoraInicio: agendamento.horaInicio,
                    DataFinal: agendamento.dataFinal,
                    HoraFim: agendamento.horaFim,
                    Finalidade: agendamento.finalidade,
                    Origem: agendamento.origem,
                    Destino: agendamento.destino,
                    MotoristaId: agendamento.motoristaId,
                    VeiculoId: agendamento.veiculoId,
                    CombustivelInicial: agendamento.combustivelInicial,
                    CombustivelFinal: agendamento.combustivelFinal,
                    KmAtual: agendamento.kmAtual,
                    KmInicial: agendamento.kmInicial,
                    KmFinal: agendamento.kmFinal,
                    RequisitanteId: agendamento.requisitanteId,
                    RamalRequisitante: agendamento.ramalRequisitante,
                    SetorSolicitanteId: agendamento.setorSolicitanteId,
                    Descricao: agendamento.descricao,
                    StatusAgendamento: agendamento.statusAgendamento,
                    FoiAgendamento: agendamento.foiAgendamento,
                    Status: agendamento.status,
                    EventoId: agendamento.eventoId,
                    Recorrente: agendamento.recorrente,
                    RecorrenciaViagemId: agendamento.recorrenciaViagemId,
                    //DatasSelecionadas: agendamento.datasSelecionadas,
                    Intervalo: agendamento.intervalo,
                    DataFinalRecorrencia: agendamento.dataFinalRecorrencia,
                    Monday: agendamento.monday,
                    Tuesday: agendamento.tuesday,
                    Wednesday: agendamento.wednesday,
                    Thursday: agendamento.thursday,
                    Friday: agendamento.friday,
                    Saturday: agendamento.saturday,
                    Sunday: agendamento.sunday,
                    DiaMesRecorrencia: agendamento.diaMesRecorrencia,
                    NoFichaVistoria: agendamento.noFichaVistoria
                };

                // Enviar atualização
                const sucesso = await window.aplicarAtualizacao(payload);

                if (sucesso)
                {
                    contadorSucesso++;
                    console.log(`âœ… [Push] Agendamento ${agendamento.viagemId} atualizado para ${novaData.format("DD/MM/YYYY")}`);
                } else
                {
                    contadorErro++;
                    console.error(`âŒ [Push] Falha ao atualizar ${agendamento.viagemId}`);
                }
            } catch (error)
            {
                contadorErro++;
                console.error(`âŒ [Push] Erro ao processar agendamento:`, error);
                Alerta.TratamentoErroComLinha("modal-viagem.js", "aplicarPushDatasSubsequentes_loop", error);
            }
        }

        console.log(`ðŸ“Š [Push] Resultado: ${contadorSucesso} sucessos, ${contadorErro} erros`);

        return contadorErro === 0;
    } catch (error)
    {
        console.error("âŒ [Push] Erro geral:", error);
        Alerta.TratamentoErroComLinha("modal-viagem.js", "aplicarPushDatasSubsequentes", error);
        return false;
    }
}

/**
 * â“ Pergunta ao usuário sobre alteração de datas recorrentes
 * Usa Alerta.Confirmar3 para 3 opções
 * param {string} dataOriginalStr - Data original formatada
 * param {string} dataNovaStr - Nova data formatada
 * returns {Promise<string>} "apenas_este" | "todos_subsequentes" | "cancelar"
 */
async function perguntarAlteracaoRecorrente(dataOriginalStr, dataNovaStr)
{
    try
    {
        const mensagem = `
            <div class="text-start">
                <p><strong>Você está alterando a Data Inicial de um agendamento recorrente:</strong></p>
                <ul class="mb-3">
                    <li>Data Original: <strong>${dataOriginalStr}</strong></li>
                    <li>Nova Data: <strong class="text-primary">${dataNovaStr}</strong></li>
                </ul>
                <p class="mb-2">Como deseja proceder?</p>
            </div>
        `;

        const resultado = await Alerta.Confirmar3(
            "Alteração de Data Inicial",
            mensagem,
            "Alterar apenas este",          // Botão 1 (Azul)
            "Alterar este e subsequentes",   // Botão 2 (Verde)
            "Cancelar operação"              // Botão 3 (Vermelho)
        );

        console.log("ðŸ¤” [Pergunta] Resposta do usuário:", resultado);

        // Mapear resultado do Alerta.Confirmar3
        switch (resultado)
        {
            case 1:
                return "apenas_este";
            case 2:
                return "todos_subsequentes";
            case 3:
            default:
                return "cancelar";
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "perguntarAlteracaoRecorrente", error);
        return "cancelar";
    }
}

/**
 * ðŸ”§ Processa alteração de Data Inicial em edição
 * Função principal que coordena toda a lógica
 * param {Object} agendamentoOriginal - Dados originais do banco
 * param {Object} agendamentoEditado - Dados editados do formulário
 * returns {Promise<Object>} { sucesso: boolean, agendamentoFinal: Object }
 */
async function processarAlteracaoDataInicial(agendamentoOriginal, agendamentoEditado)
{
    try
    {
        console.log("ðŸ”§ [ProcessarData] Iniciando processamento...");

        // 1. Detectar se houve alteração
        const deteccao = detectarAlteracaoDataInicial(agendamentoOriginal);

        if (!deteccao.alterou)
        {
            console.log("â„¹ï¸ [ProcessarData] Data não foi alterada, seguindo fluxo normal");
            return {
                sucesso: true,
                agendamentoFinal: agendamentoEditado,
                precisaRecarregar: false
            };
        }

        // 2. Verificar se o status permite alteração
        const status = agendamentoOriginal?.status || "";
        if (status !== "Aberta" && status !== "Agendada")
        {
            console.warn("âš ï¸ [ProcessarData] Status não permite alteração de data:", status);
            AppToast.show("Amarelo", "Não é possível alterar a data de viagens com status '" + status + "'", 3000);
            return {
                sucesso: false,
                agendamentoFinal: null,
                precisaRecarregar: false
            };
        }

        // 3. Verificar se é recorrente
        const isRecorrente = agendamentoOriginal?.recorrente === "S" || agendamentoOriginal?.recorrente === "M" ||
            agendamentoOriginal?.recorrente === "Q" || agendamentoOriginal?.recorrente === "D";
        const intervalo = agendamentoOriginal?.intervalo || "";
        const recorrenciaViagemId = agendamentoOriginal?.recorrenciaViagemId || "";

        // 4. Se não é recorrente OU é recorrência variada (V), permite alteração direta
        if (!isRecorrente || intervalo === "V")
        {
            console.log("â„¹ï¸ [ProcessarData] Não é recorrente ou é variada, permitindo alteração direta");
            return {
                sucesso: true,
                agendamentoFinal: agendamentoEditado,
                precisaRecarregar: false
            };
        }

        // 5. Ã‰ recorrente e NÃO é variada - perguntar ao usuário
        console.log("â“ [ProcessarData] Ã‰ recorrente, perguntando ao usuário...");

        const dataOriginalFormatada = deteccao.dataOriginal.toLocaleDateString('pt-BR');
        const dataNovaFormatada = deteccao.dataNova.toLocaleDateString('pt-BR');

        const escolha = await perguntarAlteracaoRecorrente(dataOriginalFormatada, dataNovaFormatada);

        console.log("âœ… [ProcessarData] Escolha do usuário:", escolha);

        if (escolha === "cancelar")
        {
            // Usuário cancelou - não fazer nada
            console.log("ðŸš« [ProcessarData] Operação cancelada pelo usuário");
            return {
                sucesso: false,
                agendamentoFinal: null,
                precisaRecarregar: false
            };
        }

        if (escolha === "apenas_este")
        {
            // Alterar apenas este agendamento
            console.log("âœï¸ [ProcessarData] Alterando apenas este agendamento");
            return {
                sucesso: true,
                agendamentoFinal: agendamentoEditado,
                precisaRecarregar: false
            };
        }

        if (escolha === "todos_subsequentes")
        {
            // Alterar este e aplicar push nos subsequentes
            console.log("ðŸ”„ [ProcessarData] Alterando este e aplicando push nos subsequentes");

            // Aplicar push
            const pushSucesso = await aplicarPushDatasSubsequentes(
                recorrenciaViagemId,
                deteccao.dataOriginal,
                deteccao.dataNova,
                intervalo,
                deteccao.dataOriginal
            );

            if (pushSucesso)
            {
                console.log("âœ… [ProcessarData] Push aplicado com sucesso");
                AppToast.show("Verde", "Data inicial atualizada em todos os agendamentos subsequentes", 3000);
            } else
            {
                console.warn("âš ï¸ [ProcessarData] Push teve erros, mas prosseguindo");
                AppToast.show("Amarelo", "Alguns agendamentos não puderam ser atualizados", 3000);
            }

            return {
                sucesso: true,
                agendamentoFinal: agendamentoEditado,
                precisaRecarregar: true
            };
        }

        // Caso não reconhecido (não deveria chegar aqui)
        console.warn("âš ï¸ [ProcessarData] Escolha não reconhecida:", escolha);
        return {
            sucesso: false,
            agendamentoFinal: null,
            precisaRecarregar: false
        };
    } catch (error)
    {
        console.error("âŒ [ProcessarData] Erro:", error);
        Alerta.TratamentoErroComLinha("modal-viagem.js", "processarAlteracaoDataInicial", error);
        return {
            sucesso: false,
            agendamentoFinal: null,
            precisaRecarregar: false
        };
    }
}

// ====================================================================
// SEÇÃO 5: EDIÇÃO DE AGENDAMENTOS
// ====================================================================

/**
 * âœï¸ Edita agendamento único
 * Atualiza agendamento que não faz parte de série recorrente
 * param {string} viagemId - ID da viagem
 */
window.editarAgendamento = async function (viagemId)
{
    try
    {
        if (!viagemId)
        {
            throw new Error("ViagemId é obrigatório.");
        }

        try
        {
            // Buscar dados originais
            const agendamentoBase = await window.recuperarViagemEdicao(viagemId);

            if (!agendamentoBase)
            {
                throw new Error("Agendamento inexistente.");
            }

            // Criar objeto com alterações
            const agendamentoEditado = window.criarAgendamentoEdicao(agendamentoBase);

            // NOVA LÃ“GICA: Processar alteração de data inicial
            const resultadoProcessamento = await processarAlteracaoDataInicial(agendamentoBase, agendamentoEditado);

            if (!resultadoProcessamento.sucesso)
            {
                console.log("ðŸš« [EditarAgendamento] Operação não prosseguiu");
                return;
            }

            const agendamentoFinal = resultadoProcessamento.agendamentoFinal;

            // Validar e enviar
            if (await window.ValidaCampos(agendamentoFinal.ViagemId))
            {
                const response = await fetch("/api/Agenda/Agendamento", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(agendamentoFinal)
                });

                // Determinar tipo para feedback
                let tipoAgendamento = "Viagem";
                if (agendamentoFinal.Status === "Aberta")
                {
                    tipoAgendamento = "Viagem";
                } else
                {
                    tipoAgendamento = "Agendamento";
                }

                const resultado = await response.json();

                if (resultado.success)
                {
                    AppToast.show("Verde", tipoAgendamento + " atualizado com sucesso!", 2000);

                    // Fechar modal
                    $("#modalViagens").modal("hide");
                    $(document.body).removeClass("modal-open");
                    $(".modal-backdrop").remove();
                    $(document.body).css("overflow", "");
                } else
                {
                    AppToast.show("Vermelho", "Erro ao atualizar " + tipoAgendamento, 2000);
                }

                // Atualizar calendário
                if (window.calendar?.refetchEvents)
                {
                    window.calendar.refetchEvents();
                }
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("modal-viagem.js", "editarAgendamento_inner", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "editarAgendamento", error);
    }
};

/**
 * âœï¸ Edita agendamento recorrente
 * Atualiza agendamentos de uma série recorrente (todos ou a partir de data)
 * param {string} viagemId - ID da viagem
 * param {boolean} editaTodos - Se edita todos
 * param {string} dataInicialRecorrencia - Data inicial da recorrência
 * param {string} recorrenciaViagemId - ID da recorrência
 * param {boolean} editarAgendamentoRecorrente - Flag de edição
 */
window.editarAgendamentoRecorrente = async function (viagemId, editaTodos, dataInicialRecorrencia, recorrenciaViagemId, editarAgendamentoRecorrente)
{
    try
    {
        /**
         * Compara se uma data é igual ou posterior a outra (ignora hora)
         */
        const isSameOrAfterDay = (left, right) =>
        {
            try
            {
                const L = window.toLocalDateOnly(left);
                const R = window.toLocalDateOnly(right);
                if (!L || !R) return false;
                return L.getTime() >= R.getTime();
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("modal-viagem.js", "isSameOrAfterDay", error);
                return false;
            }
        };

        /**
         * Fecha modal com sucesso e atualiza calendário
         */
        const fecharModalComSucesso = () =>
        {
            try
            {
                try
                {
                    $("#modalViagens").modal("hide");
                } catch { }
                $(".modal-backdrop").remove();
                $("body").removeClass("modal-open").css("overflow", "");
                if (window.calendar?.refetchEvents) window.calendar.refetchEvents();
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("modal-viagem.js", "fecharModalComSucesso", error);
            }
        };

        try
        {
            if (!viagemId) throw new Error("ViagemId não fornecido.");

            let houveSucesso = false;

            if (editaTodos)
            {
                // Editar todos os agendamentos da série
                if (recorrenciaViagemId === "00000000-0000-0000-0000-000000000000" || !recorrenciaViagemId)
                {
                    recorrenciaViagemId = viagemId;
                    const [primeiroDaSerie = {}] = await window.obterAgendamentosRecorrenteInicial(viagemId);
                    let objViagem = window.criarAgendamentoEdicao(primeiroDaSerie);

                    objViagem.editarTodosRecorrentes = true;
                    objViagem.editarAPartirData = dataInicialRecorrencia;
                    const ok = await window.aplicarAtualizacao(objViagem);
                    houveSucesso = houveSucesso || ok;
                }

                // Buscar e atualizar todos os agendamentos da série
                const agendamentos = await window.obterAgendamentosRecorrentes(recorrenciaViagemId);
                for (const agendamentoRecorrente of agendamentos)
                {
                    if (isSameOrAfterDay(agendamentoRecorrente.dataInicial, dataInicialRecorrencia))
                    {
                        let objViagem = window.criarAgendamentoEdicao(agendamentoRecorrente);
                        const ok = await window.aplicarAtualizacao(objViagem);
                        houveSucesso = houveSucesso || ok;
                    }
                }
            } else
            {
                // Editar apenas este agendamento
                const agendamentoUnicoAlterado = await window.recuperarViagemEdicao(viagemId);
                let objViagem = window.criarAgendamentoEdicao(agendamentoUnicoAlterado);
                const ok = await window.aplicarAtualizacao(objViagem);
                houveSucesso = houveSucesso || ok;
            }

            if (houveSucesso) fecharModalComSucesso();
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("modal-viagem.js", "editarAgendamentoRecorrente_inner", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "editarAgendamentoRecorrente", error);
    }
};

// ====================================================================
// SEÇÃO 6: FEEDBACK E MENSAGENS
// ====================================================================

/**
 * âœ… Exibe mensagem de sucesso e fecha modal
 * Usado após criação bem-sucedida de agendamentos
 */
window.exibirMensagemSucesso = function ()
{
    try
    {
        AppToast.show("Verde", "Todos os agendamentos foram criados com sucesso", 3000);
        Alerta.Sucesso("Agendamento criado com sucesso", "Todos os agendamentos foram criados com sucesso");
        $("#modalViagens").modal("hide");
        $(document.body).removeClass("modal-open");
        $(".modal-backdrop").remove();
        $(document.body).css("overflow", "");
        window.calendar.refetchEvents();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "exibirMensagemSucesso", error);
    }
};

/**
 * âŒ Exibe erro ao criar agendamento
 * Feedback visual quando falha a criação
 */
window.exibirErroAgendamento = function ()
{
    try
    {
        AppToast.show("Vermelho", "Não foi possível criar o agendamento com os dados informados", 3000);
        Alerta.Erro("Erro ao criar agendamento", "Não foi possível criar o agendamento com os dados informados");
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "exibirErroAgendamento", error);
    }
};

/**
 * âš ï¸ Handler de erro de agendamento
 * Ponto central para tratamento de erros de agendamento
 * param {Error} error - Erro
 */
window.handleAgendamentoError = function (error)
{
    try
    {
        window.exibirErroAgendamento();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "handleAgendamentoError", error);
    }
};

// ====================================================================
// SEÇÃO 7: INTEGRAÇÃO COM RELAtÓRIO (VERSÃO MELHORADA)
// ====================================================================

/**
 * ðŸ“Š Carrega o relatório no modal
 * Integração com o módulo de relatório (relatorio.js)
 * Busca o ViagemId e exibe o relatório da ficha de vistoria
 */
window.carregarRelatorioNoModal = function ()
{
    try
    {
        console.log("ðŸ“Š [ModalViagem] ===== INICIANDO CARREGAMENTO DE RELAtÓRIO =====");

        // Buscar ViagemId de diferentes fontes
        const viagemId = window.State?.get('viagemAtual')?.viagemId ||
            $('#txtViagemIdRelatorio').val() ||
            $('#txtViagemId').val() ||
            window.currentViagemId ||
            window.viagemId;

        console.log("ðŸ” [ModalViagem] Fontes de ViagemId:", {
            state: window.State?.get('viagemAtual')?.viagemId,
            txtViagemIdRelatorio: $('#txtViagemIdRelatorio').val(),
            txtViagemId: $('#txtViagemId').val(),
            currentViagemId: window.currentViagemId,
            viagemId: window.viagemId,
            final: viagemId
        });

        if (!viagemId || viagemId === '00000000-0000-0000-0000-000000000000')
        {
            console.error("âŒ [ModalViagem] ViagemId não encontrado ou inválido:", viagemId);

            if (typeof AppToast !== 'undefined')
            {
                AppToast.show('Amarelo', 'ID da viagem não identificado', 3000);
            }

            return;
        }

        console.log("âœ… [ModalViagem] ViagemId válido encontrado:", viagemId);

        // Verificar se o módulo de relatório existe
        if (typeof window.carregarRelatorioViagem !== 'function')
        {
            console.error("âŒ [ModalViagem] Função carregarRelatorioViagem não encontrada!");
            console.error("    Verifique se relatorio.js está carregado");

            if (typeof AppToast !== 'undefined')
            {
                AppToast.show('Vermelho', 'Módulo de relatório não carregado', 3000);
            }

            return;
        }

        console.log("âœ… [ModalViagem] Módulo de relatório encontrado");

        // Verificar se o container do relatório existe
        const reportContainer = document.getElementById('reportViewerAgenda');
        if (!reportContainer)
        {
            console.error("âŒ [ModalViagem] Container #reportViewerAgenda não encontrado no DOM");

            if (typeof AppToast !== 'undefined')
            {
                AppToast.show('Vermelho', 'Container do relatório não encontrado', 3000);
            }

            return;
        }

        console.log("âœ… [ModalViagem] Container do relatório encontrado");

        // Mostrar o card do relatório
        const cardRelatorio = $('#cardRelatorio');
        const reportContainerDiv = $('#ReportContainerAgenda');

        if (cardRelatorio.length > 0)
        {
            console.log("ðŸ“º [ModalViagem] Exibindo card do relatório");
            cardRelatorio.slideDown(300);
        }

        if (reportContainerDiv.length > 0)
        {
            console.log("ðŸ“º [ModalViagem] Exibindo container do relatório");
            reportContainerDiv.slideDown(300);
        }

        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() =>
        {
            console.log("ðŸš€ [ModalViagem] Chamando carregarRelatorioViagem com ViagemId:", viagemId);

            // Scroll suave até o relatório
            const card = document.getElementById('cardRelatorio');
            if (card)
            {
                card.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }

            // Chamar a função de carregamento
            window.carregarRelatorioViagem(viagemId)
                .then(() =>
                {
                    console.log("âœ… [ModalViagem] Relatório carregado com sucesso");

                    if (typeof AppToast !== 'undefined')
                    {
                        AppToast.show('Verde', 'Relatório carregado com sucesso', 2000);
                    }
                })
                .catch((error) =>
                {
                    console.error("âŒ [ModalViagem] Erro ao carregar relatório:", error);

                    if (typeof AppToast !== 'undefined')
                    {
                        AppToast.show('Vermelho', 'Erro ao carregar relatório: ' + error.message, 3000);
                    }
                });
        }, 500); // Aguardar 500ms para garantir que o DOM está pronto
    } catch (error)
    {
        console.error("âŒ [ModalViagem] Erro crí­tico em carregarRelatorioNoModal:", error);
        Alerta.TratamentoErroComLinha("modal-viagem.js", "carregarRelatorioNoModal", error);

        if (typeof AppToast !== 'undefined')
        {
            AppToast.show('Vermelho', 'Erro ao inicializar relatório', 3000);
        }
    }
};

// Variável para rastrear último ID carregado
window.ultimoViagemIdCarregado = null;

/**
 * ðŸ“‚ Event handler para quando o modal é aberto
 */
function aoAbrirModalViagem(event)
{
    try
    {
        console.log("ðŸ“‚ [ModalViagem] ===== MODAL ABERTO =====");

        // Resetar flags
        window.modalJaFoiLimpo = false;
        window.ignorarEventosRecorrencia = false;

        // Buscar ViagemId
        const viagemId = $('#txtViagemId').val() ||
            $('#txtViagemIdRelatorio').val() ||
            window.currentViagemId;

        console.log("ðŸ“‹ [ModalViagem] ViagemId encontrado:", viagemId);
        console.log("ðŸ“‹ [ModalViagem] Último ViagemId carregado:", window.ultimoViagemIdCarregado);

        // Se houver ViagemId válido e for diferente do último carregado
        if (viagemId && viagemId !== "" && viagemId !== "00000000-0000-0000-0000-000000000000")
        {
            // Verificar se é um ID diferente do último carregado
            if (viagemId !== window.ultimoViagemIdCarregado)
            {
                console.log("ðŸ“Š [ModalViagem] ViagemId diferente, recarregando relatório...");

                // Destruir viewer anterior primeiro
                if (typeof destruirViewerAnterior === 'function')
                {
                    destruirViewerAnterior().then(() =>
                    {
                        // Aguardar e carregar novo relatório
                        setTimeout(() =>
                        {
                            if (typeof window.carregarRelatorioViagem === 'function')
                            {
                                window.carregarRelatorioViagem(viagemId);
                                $("#cardRelatorio").show();
                                window.ultimoViagemIdCarregado = viagemId;
                            }
                        }, 300);
                    });
                } else
                {
                    // Fallback se a função não existir
                    setTimeout(() =>
                    {
                        if (typeof window.carregarRelatorioViagem === 'function')
                        {
                            window.carregarRelatorioViagem(viagemId);
                            $("#cardRelatorio").show();
                            window.ultimoViagemIdCarregado = viagemId;
                        }
                    }, 500);
                }
            } else
            {
                console.log("ðŸ“Š [ModalViagem] Mesmo ViagemId, mantendo relatório atual");
            }
        } else
        {
            console.log("â„¹ï¸ [ModalViagem] Novo agendamento - não carregar relatório");
            $('#cardRelatorio').hide();
            window.ultimoViagemIdCarregado = null;
        }

        // Inicializar sistema de requisitante (accordion)
        setTimeout(() =>
        {
            if (typeof inicializarSistemaRequisitante === 'function')
            {
                inicializarSistemaRequisitante();
            }
        }, 500);
    } catch (error)
    {
        console.error("âŒ [ModalViagem] Erro ao abrir modal:", error);
        Alerta.TratamentoErroComLinha("modal-viagem.js", "aoAbrirModalViagem", error);
    }
}

/**
 * ðŸšª Event handler para quando o modal é fechado
 */
function aoFecharModalViagem()
{
    try
    {
        console.log("ðŸšª [ModalViagem] ===== MODAL FECHANDO =====");

        // Limpar o relatório
        if (typeof window.limparRelatorio === 'function')
        {
            window.limparRelatorio();
        }

        // Resetar variáveis EXCETO modalJaFoiLimpo
        window.ignorarEventosRecorrencia = false;
        window.carregandoViagemExistente = false;

        // Cancelar timeout pendente
        if (window.timeoutAbrirModal)
        {
            clearTimeout(window.timeoutAbrirModal);
            window.timeoutAbrirModal = null;
        }

        // Limpar campos do modal
        if (typeof window.limparCamposModalViagens === 'function')
        {
            window.limparCamposModalViagens();
            console.log("Campos limpos ao fechar modal");
        }

        // Resetar modalJaFoiLimpo DEPOIS da limpeza
        window.modalJaFoiLimpo = false;

        window.currentViagemId = null;
        window.ultimoViagemIdCarregado = null;

        console.log("Modal fechado e limpo");
        console.log("âœ… [ModalViagem] Modal fechado e limpo");
    } catch (error)
    {
        console.error("âŒ [ModalViagem] Erro ao fechar modal:", error);
    }
}

/**
 * ðŸŽ¬ Inicializa eventos de relatório no modal
 * Registra os event handlers do Bootstrap no modal
 */
function inicializarEventosRelatorioModal()
{
    try
    {
        console.log("ðŸŽ¬ [ModalViagem] ===== INICIALIZANDO EVENTOS DE RELAtÓRIO =====");

        const $modal = $('#modalViagens');

        if ($modal.length === 0)
        {
            console.warn("âš ï¸ [ModalViagem] Modal #modalViagens não encontrado no DOM");
            return;
        }

        console.log("âœ… [ModalViagem] Modal #modalViagens encontrado");

        // Remove eventos anteriores para evitar duplicação
        $modal.off('shown.bs.modal', aoAbrirModalViagem);
        $modal.off('hidden.bs.modal', aoFecharModalViagem);

        // Registra eventos
        $modal.on('shown.bs.modal', aoAbrirModalViagem);
        $modal.on('hidden.bs.modal', aoFecharModalViagem);

        console.log("âœ… [ModalViagem] Eventos de relatório inicializados com sucesso");
        console.log("   - shown.bs.modal â†’ aoAbrirModalViagem");
        console.log("   - hidden.bs.modal â†’ aoFecharModalViagem");
    } catch (error)
    {
        console.error("âŒ [ModalViagem] Erro ao inicializar eventos:", error);
        Alerta.TratamentoErroComLinha("modal-viagem.js", "inicializarEventosRelatorioModal", error);
    }
}

// Expor função globalmente
window.carregarRelatorioNoModal = carregarRelatorioNoModal;

$(function ()
{
    console.log("ðŸŽ¬ [ModalViagem] ===== DOCUMENTO PRONTO =====");
    console.log("ðŸŽ¬ [ModalViagem] Inicializando eventos de relatório...");
    inicializarEventosRelatorioModal();

    // VALIDAÇÃO: Data Final não pode ser superior à data atual
    // Configura evento blur para o DatePicker txtDataFinal
    const configurarValidacaoDataFinal = function ()
    {
        try
        {
            const txtDataFinal = document.getElementById("txtDataFinal");
            if (txtDataFinal && txtDataFinal.ej2_instances && txtDataFinal.ej2_instances[0])
            {
                const datePicker = txtDataFinal.ej2_instances[0];
                
                // Adiciona evento blur se ainda não existir
                if (!datePicker._dataFinalValidacaoConfigurada)
                {
                    const blurOriginal = datePicker.blur;
                    datePicker.blur = function (args)
                    {
                        try
                        {
                            // Chama evento original se existir
                            if (blurOriginal && typeof blurOriginal === "function")
                            {
                                blurOriginal.call(this, args);
                            }

                            // Validação de Data Final
                            if (datePicker.value)
                            {
                                const dataFinal = new Date(datePicker.value);
                                dataFinal.setHours(0, 0, 0, 0);
                                const hoje = new Date();
                                hoje.setHours(0, 0, 0, 0);

                                if (dataFinal > hoje)
                                {
                                    datePicker.value = null;
                                    AppToast.show("Amarelo", "A Data Final não pode ser superior à data atual.", 4000);
                                }
                            }
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("modal-viagem.js", "txtDataFinal.blur", error);
                        }
                    };
                    datePicker._dataFinalValidacaoConfigurada = true;
                    console.log("✅ [ModalViagem] Validação de Data Final configurada (blur)");
                }
            }
        }
        catch (error)
        {
            Alerta.TratamentoErroComLinha("modal-viagem.js", "configurarValidacaoDataFinal", error);
        }
    };

    // Configura quando o modal da viagem abrir (componente pode não existir ainda)
    $(document).on("shown.bs.modal", "#ModalViagem", function ()
    {
        setTimeout(configurarValidacaoDataFinal, 100);
    });

    // Tenta configurar imediatamente também (caso o componente já exista)
    setTimeout(configurarValidacaoDataFinal, 500);
});

// ====================================================================
// SEÇÃO 8: INICIALIZAÇÃO E LIMPEZA DE CAMPOS
// ====================================================================

/**
 * ðŸŽ¬ Inicializa campos do modal
 * Prepara o modal para criar um novo agendamento
 */
window.inicializarCamposModal = function ()
{
    try
    {
        // Habilita todos os campos exceto o container de botões
        const divModal = document.getElementById("divModal");
        if (divModal)
        {
            const childNodes = divModal.getElementsByTagName("*");
            for (const node of childNodes)
            {
                if (node.id !== "divBotoes")
                {
                    node.disabled = false;
                    node.value = "";
                }
            }
        }

        // Configura campos de hora
        $("#txtHoraInicial, #txtHoraFinal").attr("type", "time");

        // Oculta campos especí­ficos de viagem (só aparecem quando transformar em viagem)
        const camposViagem = [
            "divNoFichaVistoria", "divDataFinal", "divHoraFinal", "divDuracao",
            "divKmAtual", "divKmInicial", "divKmFinal", "divQuilometragem",
            "divCombustivelInicial", "divCombustivelFinal"
        ];

        camposViagem.forEach(id =>
        {
            const elemento = document.getElementById(id);
            if (elemento) elemento.style.display = "none";
        });

        // Inicializa componentes EJ2
        window.inicializarComponentesEJ2();

        // Configura visibilidade de botões
        $("#btnImprime, #btnConfirma, #btnApaga, #btnCancela").show();

        const btnEvento = document.getElementById("btnEvento");
        if (btnEvento) btnEvento.style.display = "none";

        // ✅ lstEventos está SEMPRE HABILITADO
        // Apenas o valor é limpo quando necessário (em lstFinalidade_Change)

        // Configura botão requisitante
        const btnRequisitante = document.getElementById("btnRequisitante");
        if (btnRequisitante)
        {
            btnRequisitante.classList.remove("disabled");
        }

        console.log("âœ… [ModalViagem] Campos inicializados");
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "inicializarCamposModal", error);
    }
};

/**
 * âš™ï¸ Inicializa componentes Syncfusion EJ2
 * Configura estado inicial dos componentes visuais
 */
window.inicializarComponentesEJ2 = function ()
{
    try
    {
        const componentes = [
            { id: "rteDescricao", propriedades: { enabled: true, value: "" } },
            { id: "lstMotorista", propriedades: { enabled: true, value: "" } },
            { id: "lstVeiculo", propriedades: { enabled: true, value: "" } },
            { id: "lstRequisitante", propriedades: { enabled: true, value: "" } },
            // REMOVIDO: lstSetorRequisitanteAgendamento - não limpar pois será preenchido depois
            { id: "ddtCombustivelInicial", propriedades: { value: "" } },
            { id: "ddtCombustivelFinal", propriedades: { value: "" } }
        ];

        componentes.forEach(({ id, propriedades }) =>
        {
            try
            {
                const elemento = document.getElementById(id);
                if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
                {
                    const componente = elemento.ej2_instances[0];
                    Object.assign(componente, propriedades);
                }
            } catch (error)
            {
                console.warn(`âš ï¸ Não foi possível inicializar o componente: ${id}`);
            }
        });

        console.log("âœ… [ModalViagem] Componentes EJ2 inicializados");
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "inicializarComponentesEJ2", error);
    }
};

/**
 * ðŸ§¹ Limpa campos de recorrência
 * Reseta todos os campos relacionados Ã  recorrência
 */
window.limparCamposRecorrencia = function ()
{
    try
    {
        const componentesRecorrencia = [
            { id: "lstRecorrente", valor: "N" },
            { id: "lstPeriodos", valor: "" },
            { id: "lstDias", valor: [] },
            { id: "txtFinalRecorrencia", valor: null },
            { id: "calDatasSelecionadas", valor: null }
        ];

        componentesRecorrencia.forEach(({ id, valor }) =>
        {
            const elemento = document.getElementById(id);
            if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
            {
                elemento.ej2_instances[0].value = valor;
            } else if (elemento)
            {
                elemento.value = valor;
            }
        });

        // Limpar lista de dias selecionados
        const listBox = document.getElementById("lstDiasCalendario");
        if (listBox && listBox.ej2_instances && listBox.ej2_instances[0])
        {
            listBox.ej2_instances[0].dataSource = [];
        }

        // Resetar badge de contagem
        const badge = document.getElementById("itensBadge");
        if (badge) badge.textContent = 0;

        // Limpar listbox de datas variadas
        const lstDatasVariadas = document.getElementById("lstDatasVariadas");
        if (lstDatasVariadas)
        {
            lstDatasVariadas.innerHTML = '';
            lstDatasVariadas.size = 3;
        }

        // Resetar badge de datas variadas
        const badgeDatasVariadas = document.getElementById("badgeContadorDatasVariadas");
        if (badgeDatasVariadas)
        {
            badgeDatasVariadas.textContent = 0;
            badgeDatasVariadas.style.display = 'none';
        }

        // Esconder container da listbox de datas variadas
        const listboxContainer = document.getElementById("listboxDatasVariadasContainer");
        if (listboxContainer)
        {
            listboxContainer.style.display = 'none';
        }

        console.log("âœ… [ModalViagem] Campos de recorrência limpos");
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-viagem.js", "limparCamposRecorrencia", error);
    }
};

window.limparCamposModalViagens = function ()
{
    try
    {
        // âœ… VERIFICAR FLAG ANTES DE LIMPAR
        if (window.modalJaFoiLimpo)
        {
            console.log("â­•ï¸ [ModalViagem] Modal já foi limpo, pulando limpeza...");
            return;
        }

        // âœ… VERIFICAR SE EStí CARREGANDO VIAGEM EXISTENTE
        if (window.carregandoViagemExistente)
        {
            console.log("ðŸ“Œ [ModalViagem] Carregando viagem existente, pulando limpeza");
            return;
        }

        console.log("ðŸ§¹ [ModalViagem] Limpando todos os campos...");

        // Remover classes de modo de edição variada
        document.body.classList.remove('modo-edicao-variada');
        document.body.classList.remove('modo-criacao-variada');

        // âœ… MARCAR QUE O MODAL FOI LIMPO
        window.modalJaFoiLimpo = true;

        // MOSTRAR CARD DE RECORRÊNCIA (para novo agendamento)
        $("#cardRecorrencia").show();
        // Limpar campos HTML nativos
        $("#txtReport, #txtViagemId, #txtRecorrenciaViagemId, #txtStatusAgendamento, #txtUsuarioIdCriacao, #txtDataCriacao, #txtNoFichaVistoria, #txtDataFinal, #txtHoraFinal, #txtKmAtual, #txtKmInicial, #txtKmFinal, #txtRamalRequisitante, #txtNomeDoEvento, #txtDescricaoEvento, #txtDataInicialEvento, #txtDataFinalEvento, #txtQtdPessoas, #txtPonto, #txtNome, #txtRamal, #txtEmail").val("");

        // âœ… Ramal já é limpo na linha acima (txtRamalRequisitante é campo HTML nativo, não Syncfusion)

        // Limpar setor
        const lstSetor = document.getElementById("lstSetorRequisitanteAgendamento");
        if (lstSetor && lstSetor.ej2_instances && lstSetor.ej2_instances[0])
        {
            lstSetor.ej2_instances[0].value = null;
            window.refreshComponenteSafe("lstSetorRequisitanteAgendamento");
        }

        // Limpar campos de duração e quilometragem
        ["txtDuracao", "txtQuilometragem"].forEach(id =>
        {
            try
            {
                const elemento = document.getElementById(id);
                if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
                {
                    const instance = elemento.ej2_instances[0];
                    instance.value = null;
                    window.refreshComponenteSafe(id);
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("modal-viagem.js", "limparCamposModalViagens_forEach1", error);
            }
        });

        // Limpar comboboxes e dropdowns - VERSÃO CORRIGIDA
        const syncIds = ["lstFinalidade", "ddtSetor", "cmbOrigem", "cmbDestino", "lstMotorista", "lstVeiculo", "lstRequisitante", "lstSetorRequisitanteAgendamento", "lstEventos", "ddtCombustivelInicial", "ddtCombustivelFinal", "lstDiasMes", "lstDias"];
        syncIds.forEach(id =>
        {
            try
            {
                const elemento = document.getElementById(id);
                if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
                {
                    const instance = elemento.ej2_instances[0];

                    // âœ… LIMPEZA COMPLETA
                    instance.value = null;
                    instance.text = '';

                    // ✅ SEMPRE HABILITAR todos os componentes (incluindo lstEventos)
                    if (typeof instance.enabled !== "undefined")
                    {
                        instance.enabled = true;
                    }

                    // Forçar atualização visual
                    if (typeof instance.dataBind === 'function')
                    {
                        instance.dataBind();
                    }

                    // Refresh adicional para garantir
                    if (typeof instance.refresh === 'function')
                    {
                        instance.refresh();
                    }

                    console.log(`âœ… ${id} limpo com sucesso`);
                } else
                {
                    console.warn(`âš ï¸ ${id} não encontrado ou não inicializado`);
                }
            } catch (error)
            {
                console.error(`âŒ Erro ao limpar ${id}:`, error);
                Alerta.TratamentoErroComLinha("modal-viagem.js", "limparCamposModalViagens_forEach2", error);
            }
        });

        // âœ… LIMPEZA ESPEcíFICA EXTRA PARA MOTORISTA E VeíCULO
        console.log("ðŸ§¹ [Limpeza Extra] Garantindo limpeza de Motorista e Veí­culo...");

        // Motorista
        const lstMotorista = document.getElementById("lstMotorista");
        if (lstMotorista && lstMotorista.ej2_instances && lstMotorista.ej2_instances[0])
        {
            const motoristaInst = lstMotorista.ej2_instances[0];
            motoristaInst.value = null;
            motoristaInst.text = '';
            motoristaInst.index = null;

            if (typeof motoristaInst.dataBind === 'function')
            {
                motoristaInst.dataBind();
            }

            if (typeof motoristaInst.clear === 'function')
            {
                motoristaInst.clear();
            }

            console.log("âœ… Motorista limpo completamente");
        }

        // Veí­culo
        const lstVeiculo = document.getElementById("lstVeiculo");
        if (lstVeiculo && lstVeiculo.ej2_instances && lstVeiculo.ej2_instances[0])
        {
            const veiculoInst = lstVeiculo.ej2_instances[0];
            veiculoInst.value = null;
            veiculoInst.text = '';
            veiculoInst.index = null;

            if (typeof veiculoInst.dataBind === 'function')
            {
                veiculoInst.dataBind();
            }

            if (typeof veiculoInst.clear === 'function')
            {
                veiculoInst.clear();
            }

            console.log("âœ… Veí­culo limpo completamente");
        }

        // Limpar datas - VERSÃO CORRIGIDA
        ["txtDataInicial", "txtDataFinal", "txtFinalRecorrencia"].forEach(id =>
        {
            try
            {
                const elemento = document.getElementById(id);
                if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
                {
                    const instance = elemento.ej2_instances[0];
                    instance.value = null;
                    instance.enabled = true;
                    window.refreshComponenteSafe(id);
                }
            } catch (error)
            {
                console.error(`âŒ Erro ao limpar ${id}:`, error);
            }
        });

        // Limpar finalidade
        const lstFinalidade = document.getElementById("lstFinalidade");
        if (lstFinalidade && lstFinalidade.ej2_instances && lstFinalidade.ej2_instances[0])
        {
            lstFinalidade.ej2_instances[0].value = null;
            lstFinalidade.ej2_instances[0].enabled = true;
            window.refreshComponenteSafe("lstFinalidade");
        }

        // Limpar recorrência - CORRIGIDO COM INICIALIZAÇÃO DE DATASOURCE
        console.log("🔄 [limparCampos] Inicializando lstRecorrente...");

        // CRÍTICO: Garantir que dataSource está inicializado
        if (typeof window.inicializarLstRecorrente === 'function')
        {
            window.inicializarLstRecorrente();
        }

        // USAR TIMEOUT PARA GARANTIR QUE O VALOR SEJA DEFINIDO APÓS A INICIALIZAÇÃO
        setTimeout(() =>
        {
            const elRecorrente = document.getElementById("lstRecorrente");
            if (elRecorrente && elRecorrente.ej2_instances && elRecorrente.ej2_instances[0])
            {
                window.ignorarEventosRecorrencia = true;

                // Garantir que tem dataSource antes de definir valor
                const instance = elRecorrente.ej2_instances[0];
                if (!instance.dataSource || instance.dataSource.length === 0)
                {
                    instance.dataSource = [
                        { RecorrenteId: "N", Descricao: "Não" },
                        { RecorrenteId: "S", Descricao: "Sim" }
                    ];
                    instance.fields = { text: 'Descricao', value: 'RecorrenteId' };
                }

                instance.value = "N";
                instance.enabled = true;

                // Usar dataBind para aplicar valor
                if (typeof instance.dataBind === 'function')
                {
                    instance.dataBind();
                }

                console.log("✅ [limparCampos] lstRecorrente definido como 'Não' (com timeout)");
                window.ignorarEventosRecorrencia = false;
            }
        }, 100);

        // Limpar perí­odo - VERSÃO CORRIGIDA
        const elPeriodos = document.getElementById("lstPeriodos");
        if (elPeriodos && elPeriodos.ej2_instances && elPeriodos.ej2_instances[0])
        {
            elPeriodos.ej2_instances[0].value = null;
            elPeriodos.ej2_instances[0].enabled = true;
            window.refreshComponenteSafe("lstPeriodos");
        } else if (typeof window.rebuildLstPeriodos === "function")
        {
            window.rebuildLstPeriodos();
        }

        // Limpar editor de texto rico
        const rteDescricao = document.getElementById("rteDescricao");
        if (rteDescricao && rteDescricao.ej2_instances && rteDescricao.ej2_instances[0])
        {
            rteDescricao.ej2_instances[0].value = "";
            window.refreshComponenteSafe("rteDescricao");
        }

        // Limpar campos de evento/requisitante
        const idsToReset = ["lstRequisitanteEvento", "lstSetorRequisitanteEvento", "ddtSetorRequisitante"];
        idsToReset.forEach(id =>
        {
            try
            {
                const elemento = document.getElementById(id);
                if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
                {
                    const instance = elemento.ej2_instances[0];
                    instance.value = null;
                    window.refreshComponenteSafe(id);
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("modal-viagem.js", "limparCamposModalViagens_forEach3", error);
            }
        });

        // Esconder divs de campos avançados
        $("#divPeriodo, #divTxtPeriodo, #divDias, #divDiaMes, #divFinalRecorrencia, #divFinalFalsoRecorrencia, #calendarContainer, #listboxContainer, #listboxContainerHTML").hide();

        // Limpar labels de usuário
        $("#lblUsuarioAgendamento, #lblUsuarioCriacao, #lblUsuarioFinalizacao, #lblUsuarioCancelamento").text("");

        // Resetar botão confirmar
        $("#btnConfirma").html("<i class='fa-regular fa-thumbs-up'></i> Confirmar").prop("disabled", false);

        // Limpar calendário de datas selecionadas
        const calInstance = document.getElementById("calDatasSelecionadas");
        if (calInstance && calInstance.ej2_instances && calInstance.ej2_instances[0])
        {
            const calendario = calInstance.ej2_instances[0];
            if ("values" in calendario) calendario.values = [];
            if ("value" in calendario) calendario.value = null;
            window.refreshComponenteSafe("calDatasSelecionadas");
        }

        // Limpar lista HTML de dias
        const lstDiasHTML = document.getElementById("lstDiasCalendarioHTML");
        if (lstDiasHTML) lstDiasHTML.innerHTML = "";

        // Limpar lista de dias selecionados
        const listBox = document.getElementById("lstDiasCalendario");
        if (listBox && listBox.ej2_instances && listBox.ej2_instances[0])
        {
            listBox.ej2_instances[0].dataSource = [];
        }

        // Resetar badge de contagem
        const badge = document.getElementById("itensBadge");
        if (badge) badge.textContent = 0;

        // âœ… LIMPAR E ESCONDER RELAtÓRIO
        console.log("ðŸ§¹ [ModalViagem] Limpando relatório...");

        if (typeof window.limparRelatorio === 'function')
        {
            window.limparRelatorio();
        } else
        {
            // Fallback manual se função não existir
            $("#ReportContainerAgenda").hide();
            $("#reportViewerAgenda").html("");
            $("#cardRelatorio").hide();
        }

        // Limpar campos hidden de viagem
        $('#txtViagemIdRelatorio').val('');
        window.currentViagemId = null;

        // Abortar requisições de relatório pendentes (se houver)
        if (window.xhrRelatorio && window.xhrRelatorio.abort)
        {
            window.xhrRelatorio.abort();
        }

        console.log("âœ… [ModalViagem] Todos os campos limpos");
    } catch (error)
    {
        console.error("âŒ [ModalViagem] Erro ao limpar campos:", error);
        Alerta.TratamentoErroComLinha("modal-viagem.js", "limparCamposModalViagens", error);
    }
};

// ====================================================================
// SEÇÃO 9: CONTROLE DE ESTADO DO MODAL
// ====================================================================

/**
 * ðŸ”’ Desabilita todos os controles do formulário (EXCETO botões de fechar/footer)
 * Usado para modo de visualização (quando o agendamento já foi realizado ou cancelado)
 */
window.desabilitarTodosControles = function ()
{
    try
    {
        console.log("ðŸ”’ [ModalViagem] Desabilitando controles...");

        // IMPORTANTE: IDs de botões que NUNCA devem ser desabilitados
        const botoesProtegidos = [
            'btnFecha',           // Botão X do modal
            'btnFechar',          // Botão Fechar
            'btnCancelar',        // Botão Cancelar
            'btnClose',           // Variação de nome
            'btnCancel'           // Variação de nome
        ];

        // Desabilita campos HTML nativos (EXCETO botões protegidos)
        const divModal = document.getElementById("divModal");
        if (divModal)
        {
            const childNodes = divModal.getElementsByTagName("*");
            for (const node of childNodes)
            {
                // Verificar se é botão protegido
                const isProtegido = botoesProtegidos.includes(node.id) ||
                    node.hasAttribute('data-bs-dismiss') ||
                    node.classList.contains('btn-close') ||
                    node.closest('.modal-header') !== null ||
                    node.closest('[data-bs-dismiss]') !== null;

                if (!isProtegido)
                {
                    node.disabled = true;
                }
            }
        }

        // Desabilita componentes EJ2 (EXCETO os do modal-footer)
        const componentesEJ2 = [
            "txtDataInicial", "txtDataFinal", "lstFinalidade",
            "lstMotorista", "lstVeiculo", "lstRequisitante",
            "lstSetorRequisitanteAgendamento", "cmbOrigem", "cmbDestino",
            "ddtCombustivelInicial", "ddtCombustivelFinal", "rteDescricao",
            "lstRecorrente", "lstPeriodos", "lstDias", "lstEventos"
        ];

        componentesEJ2.forEach(id =>
        {
            try
            {
                const elemento = document.getElementById(id);
                if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
                {
                    elemento.ej2_instances[0].enabled = false;
                }
            } catch (error)
            {
                console.warn(`âš ï¸ Erro ao desabilitar componente ${id}:`, error);
            }
        });

        //         // Desabilita botão requisitante (mas não botões de fechar)
        //         const btnRequisitante = document.getElementById("btnRequisitante");
        //         if (btnRequisitante)
        //         {
        //             btnRequisitante.classList.add("disabled");
        //             btnRequisitante.addEventListener("click", function (event)
        //             {
        //                 event.preventDefault();
        //             });
        //         }

        // GARANTIR que botões de fechar NUNCA são desabilitados
        botoesProtegidos.forEach(id =>
        {
            const btn = document.getElementById(id);
            if (btn)
            {
                btn.disabled = false;
                btn.classList.remove('disabled');
                btn.style.pointerEvents = 'auto';
            }
        });

        // Garantir botão X do modal sempre habilitado
        const btnClose = document.querySelector('#modalViagens .btn-close, #modalViagens [data-bs-dismiss="modal"]');
        if (btnClose)
        {
            btnClose.disabled = false;
            btnClose.style.pointerEvents = 'auto';
        }

        console.log("ðŸ”’ [ModalViagem] Controles desabilitados (exceto botões de fechar)");
    } catch (error)
    {
        console.error("âŒ [ModalViagem] Erro ao desabilitar controles:", error);
        Alerta.TratamentoErroComLinha("modal-viagem.js", "desabilitarTodosControles", error);
    }
};

// ====================================================================
// FIM DO ARQUIVO modal-viagem.js
// ====================================================================
console.log("âœ… [ModalViagem] Arquivo carregado completamente");
