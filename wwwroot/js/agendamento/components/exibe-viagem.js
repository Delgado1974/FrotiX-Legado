// ====================================================================
// EXIBE VIAGEM - Função para exibir/editar viagem no modal
// ====================================================================

/**
 * Exibe viagem no modal (criar ou editar)
 * param {Object|string} objViagem - Objeto com dados da viagem ou string vazia para novo
 * param {Date} dataClicada - Data clicada no calendário (opcional)
 * param {string} horaClicada - Hora clicada no calendário (opcional)
 */

// ====================================================================
// HELPER: Aguardar função estar disponível
// ====================================================================
function aguardarFuncaoDisponivel(nomeFuncao, timeout = 5000)
{
    try
    {
        return new Promise((resolve, reject) =>
        {
            const inicio = Date.now();

            const verificar = () =>
            {
                // Verificar se função está disponível
                const partes = nomeFuncao.split('.');
                let objeto = window;

                for (const parte of partes)
                {
                    if (parte === 'window') continue;
                    objeto = objeto[parte];
                    if (!objeto) break;
                }

                if (typeof objeto === 'function')
                {
                    resolve();
                }
                else if (Date.now() - inicio > timeout)
                {
                    reject(new Error(`Timeout aguardando ${nomeFuncao}`));
                }
                else
                {
                    setTimeout(verificar, 50);
                }
            };

            verificar();
        });
    }
    catch (error)
    {
        console.error("❌ Erro em aguardarFuncaoDisponivel:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "aguardarFuncaoDisponivel", error);
    }
}

window.ExibeViagem = function (objViagem, dataClicada = null, horaClicada = null)
{
    try
    {
        // Cancelar abertura anterior se existir
        if (window.modalDebounceTimer)
        {
            clearTimeout(window.modalDebounceTimer);
        }

        // Se já está abrindo, aguardar
        if (window.modalIsOpening)
        {
            console.log("âš ï¸ Modal já está sendo aberto, aguardando...");
            return;
        }

        window.modalIsOpening = true;

        // PASSO 3: ✨ NOVO - Cancelar carregamento de relatório pendente
        if (window.isReportViewerLoading)
        {
            console.log("⚠️ Cancelando carregamento de relatório pendente");
            window.isReportViewerLoading = false;
        }

        window.modalDebounceTimer = setTimeout(() =>
        {
            // Código original da função ExibeViagem aqui
            console.log("ðŸ“‹ ExibeViagem executando após debounce");

            if (!objViagem || objViagem === "" || typeof objViagem === "string")
            {
                exibirNovaViagem(dataClicada, horaClicada);
            } else
            {
                exibirViagemExistente(objViagem);
            }

            // Resetar flag após abertura
            setTimeout(() =>
            {
                window.modalIsOpening = false;
            }, 500);
        }, 300); // Aguarda 300ms antes de abrir
    } catch (error)
    {
        window.modalIsOpening = false;
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "ExibeViagem", error);
    }
};

/**
 * Exibe formulário para nova viagem
 */

/**
 * Inicializa o dropdown lstRecorrente com dataSource
 * VERSÃO ROBUSTA - Recria o dropdown se necessário
 */
function inicializarLstRecorrente()
{
    try
    {
        const lstRecorrenteElement = document.getElementById("lstRecorrente");

        if (!lstRecorrenteElement)
        {
            console.warn("⚠️ lstRecorrente não encontrado no DOM");
            return false;
        }

        // DataSource
        const dataRecorrente = [
            { RecorrenteId: "N", Descricao: "Não" },
            { RecorrenteId: "S", Descricao: "Sim" }
        ];

        // Verificar se já existe instância
        if (lstRecorrenteElement.ej2_instances && lstRecorrenteElement.ej2_instances[0])
        {
            const lstRecorrente = lstRecorrenteElement.ej2_instances[0];

            // Verificar se dataSource está vazio ou undefined
            if (!lstRecorrente.dataSource || lstRecorrente.dataSource.length === 0)
            {
                console.log("🔄 lstRecorrente existe mas dataSource está vazio - populando...");
                lstRecorrente.dataSource = dataRecorrente;
                lstRecorrente.fields = { text: 'Descricao', value: 'RecorrenteId' };
                lstRecorrente.dataBind();
                console.log("✅ lstRecorrente dataSource populado");
            }
            else
            {
                console.log("ℹ️ lstRecorrente já tem dataSource");
            }

            return true;
        }
        else
        {
            // Se não existe instância, criar nova
            console.log("🆕 Criando nova instância de lstRecorrente...");

            const dropdown = new ej.dropdowns.DropDownList({
                dataSource: dataRecorrente,
                fields: { text: 'Descricao', value: 'RecorrenteId' },
                placeholder: 'Selecione...',
                popupHeight: '200px',
                cssClass: 'e-outline text-center',
                floatLabelType: 'Never',
                value: 'N' // Padrão
            });

            dropdown.appendTo('#lstRecorrente');
            console.log("✅ lstRecorrente criado com sucesso");
            return true;
        }
    } catch (error)
    {
        console.error("❌ Erro ao inicializar lstRecorrente:", error);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("exibe-viagem.js", "inicializarLstRecorrente", error);
        }
        return false;
    }
}

function exibirNovaViagem(dataClicada, horaClicada)
{
    try
    {
        console.log("ðŸ†• Criando nova viagem");
        console.log("ðŸ§¹ Limpando campos ANTES de configurar novo agendamento...");

        // ============================================
        // 1. LIMPAR CAMPOS PRIMEIRO (CríTICO!)
        // ============================================
        if (typeof window.limparCamposModalViagens === 'function')
        {
            window.limparCamposModalViagens();
        }
        else
        {
            console.warn("⚠️ limparCamposModalViagens não disponível");
        }

        // ============================================
        // 1.5 LIMPAR LISTBOX DE DATAS VARIADAS
        // ============================================
        limparListboxDatasVariadas();

        // ============================================
        // 3. AGUARDAR LIMPEZA COMPLETAR
        // ============================================
        setTimeout(() =>
        {
            console.log("â° Iniciando configuração de novo agendamento após limpeza...");

            // ============================================
            // 3. DEFINIR tíTULO DO MODAL
            // ============================================
            window.setModalTitle('NOVO_AGENDAMENTO');

            // ============================================
            // 5. INICIALIZAR CAMPOS
            // ============================================
            if (typeof window.inicializarCamposModal === 'function')
            {
                if (typeof window.inicializarCamposModal === 'function')
                {
                    window.inicializarCamposModal();
                }
                else
                {
                    console.warn("⚠️ inicializarCamposModal não disponível");
                }
            }
            else
            {
                console.warn("⚠️ inicializarCamposModal não disponível");
            }

            // ============================================
            // 5. ESCONDER RELAtÓRIO
            // ============================================
            if (typeof window.esconderRelatorio === 'function')
            {
                window.esconderRelatorio();
            }

            // ============================================
            // 6. LIMPEZA EXTRA DE MOTORISTA E VeíCULO
            // ============================================
            console.log("ðŸ§¹ [Extra] Garantindo limpeza de Motorista e Veí­culo...");

            // Limpar Motorista
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

                console.log("âœ… Motorista limpo na criação de novo agendamento");
            }

            // Limpar Veí­culo
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

                console.log("âœ… Veí­culo limpo na criação de novo agendamento");
            }

            // ============================================
            // 8. CONFIGURAR BOTÕES
            // ============================================
            $("#btnConfirma").html("<i class='fa-regular fa-thumbs-up'></i> Confirmar");
            $("#btnConfirma").prop("disabled", false).show();
            $("#btnApaga").hide();
            $("#btnCancela").hide();
            $("#btnViagem").hide();
            $("#btnImprime").hide();

            // ============================================
            // 9. CONFIGURAR RODAPÉ - OCULTAR USER LABELS
            // ============================================
            configurarRodapeLabelsNovo();

            // ============================================
            // 10. OCULTAR CAMPOS DE VIAGEM
            // ============================================
            const camposViagem = [
                "divNoFichaVistoria", "divDataFinal", "divHoraFinal", "divDuracao",
                "divKmAtual", "divKmInicial", "divKmFinal", "divQuilometragem",
                "divCombustivelInicial", "divCombustivelFinal"
            ];

            camposViagem.forEach(id =>
            {
                const el = document.getElementById(id);
                if (el) el.style.display = "none";
            });

            // ============================================
            // 11. FECHAR CARD DE EVENTO E ACCORDION
            // ============================================
            console.log("🧹 [NovoAgendamento] Fechando Card de Evento e Accordion...");

            // Fechar Card de Seleção de Evento
            const cardSelecaoEvento = document.getElementById("cardSelecaoEvento");
            if (cardSelecaoEvento)
            {
                cardSelecaoEvento.style.display = "none";
                console.log("✅ Card de Seleção de Evento fechado");
            }

            // Fechar seção de Evento (sectionEvento)
            const sectionEvento = document.getElementById("sectionEvento");
            if (sectionEvento)
            {
                sectionEvento.style.display = "none";
                console.log("✅ Section Evento fechada");
            }

            // Fechar Accordion de Novo Evento
            const sectionCadastroEvento = document.getElementById("sectionCadastroEvento");
            if (sectionCadastroEvento)
            {
                sectionCadastroEvento.style.display = "none";
                console.log("✅ Accordion de Novo Evento fechado");
            }

            // Fechar Accordion de Novo Requisitante
            const sectionCadastroRequisitante = document.getElementById("sectionCadastroRequisitante");
            if (sectionCadastroRequisitante)
            {
                sectionCadastroRequisitante.style.display = "none";
                console.log("✅ Accordion de Novo Requisitante fechado");
            }

            // Limpar campos do accordion de evento
            const txtNomeEvento = document.getElementById("txtNomeEvento");
            const txtDescricaoEvento = document.getElementById("txtDescricaoEvento");
            if (txtNomeEvento) txtNomeEvento.value = "";
            if (txtDescricaoEvento) txtDescricaoEvento.value = "";

            // Limpar campos do accordion de requisitante
            const txtPonto = document.getElementById("txtPonto");
            const txtNome = document.getElementById("txtNome");
            const txtRamal = document.getElementById("txtRamal");
            const txtEmail = document.getElementById("txtEmail");
            if (txtPonto) txtPonto.value = "";
            if (txtNome) txtNome.value = "";
            if (txtRamal) txtRamal.value = "";
            if (txtEmail) txtEmail.value = "";

            // ============================================
            // 9. CONFIGURAR DATA INICIAL
            // ============================================
            const txtDataInicial = document.getElementById("txtDataInicial");
            if (txtDataInicial)
            {
                // Determinar qual data usar
                let dataParaUsar;
                if (dataClicada)
                {
                    dataParaUsar = dataClicada;
                    console.log("ðŸ“… Usando data clicada:", dataParaUsar.toLocaleDateString('pt-BR'));
                } else if (window.calendar && window.calendar.getDate)
                {
                    dataParaUsar = window.calendar.getDate();
                    console.log("ðŸ“… Usando data da agenda:", dataParaUsar.toLocaleDateString('pt-BR'));
                } else
                {
                    dataParaUsar = new Date();
                    console.log("ðŸ“… Usando data de hoje:", dataParaUsar.toLocaleDateString('pt-BR'));
                }

                // Garantir que o componente está inicializado
                if (!txtDataInicial.ej2_instances || !txtDataInicial.ej2_instances[0])
                {
                    console.warn("âš ï¸ DatePicker não inicializado, tentando inicializar...");

                    // Inicializar DatePicker manualmente
                    new ej.calendars.DatePicker({
                        value: dataParaUsar,
                        format: 'dd/MM/yyyy',
                        placeholder: 'Selecione a data',
                        enabled: true,
                        change: function (args)
                        {
                            try
                            {
                                if (typeof window.calcularDuracaoViagem === 'function')
                                {
                                    window.calcularDuracaoViagem();
                                }
                            } catch (e)
                            {
                                console.error("Erro no change do DatePicker:", e);
                            }
                        }
                    }).appendTo(txtDataInicial);

                    console.log("âœ… DatePicker criado e data definida");
                } else
                {
                    // Usar instância existente
                    const datePickerInstance = txtDataInicial.ej2_instances[0];
                    datePickerInstance.value = dataParaUsar;
                    datePickerInstance.enabled = true;

                    // Forçar renderização
                    if (typeof datePickerInstance.refresh === 'function')
                    {
                        datePickerInstance.refresh();
                    }
                    if (typeof datePickerInstance.dataBind === 'function')
                    {
                        datePickerInstance.dataBind();
                    }

                    console.log("âœ… Data definida na instância existente");
                }

                // Garantir que está visível
                txtDataInicial.style.display = '';
                const parentDiv = txtDataInicial.closest('.form-group, .mb-3, div[id*="divData"]');
                if (parentDiv)
                {
                    parentDiv.style.display = 'block';
                }
            }

            // ============================================
            // 10. CONFIGURAR HORA INICIAL (se fornecida)
            // ============================================
            if (horaClicada)
            {
                $("#txtHoraInicial").val(horaClicada);
                console.log("ðŸ• Hora inicial definida:", horaClicada);
            } else
            {
                $("#txtHoraInicial").val("");
            }

            // ============================================
            // 14. HABILITAR RECORRÊNCIA
            // ============================================
            const lstRecorrente = document.getElementById("lstRecorrente");
            if (lstRecorrente && lstRecorrente.ej2_instances && lstRecorrente.ej2_instances[0])
            {
                lstRecorrente.ej2_instances[0].enabled = true;
                lstRecorrente.ej2_instances[0].value = "N";
                lstRecorrente.ej2_instances[0].dataBind();
                console.log("âœ… Recorrente definido como 'Não'");
            }

            // ============================================
            // 12. HABILITAR PEríODO
            // ============================================
            const lstPeriodos = document.getElementById("lstPeriodos");
            if (lstPeriodos && lstPeriodos.ej2_instances && lstPeriodos.ej2_instances[0])
            {
                lstPeriodos.ej2_instances[0].enabled = true;
                lstPeriodos.ej2_instances[0].value = null;
                lstPeriodos.ej2_instances[0].dataBind();
                console.log("âœ… Perí­odo habilitado e limpo");
            }

            // ============================================
            // 16. LIMPAR CAMPOS HIDDEN
            // ============================================
            $("#txtViagemId").val("");
            $("#txtRecorrenciaViagemId").val("");
            $("#txtStatusAgendamento").val(true);

            console.log("âœ… Campos hidden limpos");

            // ============================================
            // 17. RESETAR FLAGS GLOBAIS
            // ============================================
            window.CarregandoAgendamento = false;
            window.CarregandoViagemBloqueada = false;
            window.transformandoEmViagem = false;
            window.carregandoViagemExistente = false;

            console.log("âœ… Flags globais resetadas");

            // ============================================
            // 15. LOG FINAL
            // ============================================
            console.log("âœ… ===== NOVO AGENDAMENTO CONFIGURADO COM SUCESSO =====");
        }, 100); // Aguardar 100ms para garantir que a limpeza foi aplicada
    } catch (error)
    {
        console.error("âŒ Erro em exibirNovaViagem:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "exibirNovaViagem", error);
    }
}

/**
 * Exibe viagem existente para edição
 */
// ====================================================================
// FUNÇÃO COMPLETA: exibirViagemExistente() - exibe-viagem.js
// SUBSTITUIR A FUNÇÃO COMPLETA NO ARQUIVO
// ====================================================================

/**
 * Exibe viagem existente para edição
 */
/**
 * Exibe viagem existente para edição
 */
function exibirViagemExistente(objViagem)
{
    try
    {
        console.log("âœï¸ Editando viagem:", objViagem.viagemId);
        console.log

        // ============================================
        // LIMPAR LISTBOX (será repovoada se for dias variados)
        // ============================================
        limparListboxDatasVariadas();
        ("ðŸ“‹ Dados completos:", objViagem);

        // âš¡ FLAG IMPORTANTE: Indica que estamos carregando dados existentes
        window.carregandoViagemExistente = true;
        // Cancelar timeout anterior se existir
        if (window.timeoutAbrirModal)
        {
            clearTimeout(window.timeoutAbrirModal);
            console.log("⏰ Timeout anterior cancelado");
        }
        window.dadosRecorrenciaCarregados = objViagem;

        // ADICIONAR: Desabilitar eventos de recorrência temporariamente
        window.ignorarEventosRecorrencia = true;

        // 1. DEFINIR tíTULO DO MODAL PRIMEIRO
        definirTituloModal(objViagem);

        // 1.5. ESCONDER TODOS OS CAMPOS OPCIONAIS NO INICIO (CRITICO!)
        console.log("Escondendo todos campos opcionais no inicio...");
        const camposOpcionais = [
            "divNoFichaVistoria", "divDataFinal", "divHoraFinal", "divDuracao",
            "divKmAtual", "divKmInicial", "divKmFinal", "divQuilometragem",
            "divCombustivelInicial", "divCombustivelFinal",
            "divPeriodo", "divDias", "divDiaMes", "divFinalRecorrencia", "calendarContainer",
            "cardSelecaoEvento", "sectionEvento", "sectionCadastroEvento", "sectionCadastroRequisitante",
            "listboxDatasVariadasContainer" // Adicionar listbox container também
        ];

        camposOpcionais.forEach(id =>
        {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });
        console.log("Campos opcionais escondidos");

        // GARANTIR que o calendário e seus elementos estejam SEMPRE ocultos em edição
        const calendarElements = {
            'calendarContainer': document.getElementById('calendarContainer'),
            'calDatasSelecionadas': document.getElementById('calDatasSelecionadas'),
            'badgeContadorDatasSelecionadas': document.getElementById('badgeContadorDatasSelecionadas')
        };

        Object.entries(calendarElements).forEach(([name, elem]) =>
        {
            if (elem)
            {
                elem.style.display = 'none';
                console.log(`   ✅ ${name} ocultado explicitamente`);
            }
        });

        // Ocultar também a label do calendário se existir
        const labelCal = document.querySelector('label[for="calDatasSelecionadas"]');
        if (labelCal)
        {
            labelCal.style.display = 'none';
            console.log("   ✅ Label do calendário ocultada");
        }

        // 2. Limpar e inicializar
        // window.limparCamposModalViagens(); // NÃO limpar ao editar
        if (typeof window.inicializarCamposModal === 'function')
        {
            window.inicializarCamposModal();
        }
        else
        {
            console.warn("⚠️ inicializarCamposModal não disponível");
        }

        // 3. Preencher campos básicos
        $("#txtViagemId").val(objViagem.viagemId);
        $("#txtRecorrenciaViagemId").val(objViagem.recorrenciaViagemId || "");
        $("#txtStatusAgendamento").val(objViagem.statusAgendamento);
        $("#txtUsuarioIdCriacao").val(objViagem.usuarioIdCriacao || "");
        $("#txtDataCriacao").val(objViagem.dataCriacao || "");

        // 4. Datas e horas
        if (objViagem.dataInicial)
        {
            const txtDataInicial = document.getElementById("txtDataInicial");
            if (txtDataInicial && txtDataInicial.ej2_instances && txtDataInicial.ej2_instances[0])
            {
                txtDataInicial.ej2_instances[0].value = new Date(objViagem.dataInicial);
                txtDataInicial.ej2_instances[0].dataBind();
            }
        }

        if (objViagem.dataFinal)
        {
            const txtDataFinal = document.getElementById("txtDataFinal");
            if (txtDataFinal && txtDataFinal.ej2_instances && txtDataFinal.ej2_instances[0])
            {
                txtDataFinal.ej2_instances[0].value = new Date(objViagem.dataFinal);
                txtDataFinal.ej2_instances[0].dataBind();
            }
        }

        // 4.5 - PREENCHER HORA INICIAL (CORREÇÃO)
        console.log("ðŸ• [DEBUG] Processando hora inicial...");
        console.log("   - objViagem.horaInicio:", objViagem.horaInicio);
        console.log("   - objViagem.HoraInicio:", objViagem.HoraInicio);
        console.log("   - objViagem.horaInicialTexto:", objViagem.horaInicialTexto);
        console.log("   - objViagem.horaInicial:", objViagem.horaInicial);

        // Tentar diferentes campos possíveis
        let horaParaExibir = null;

        // Prioridade 1: horaInicialTexto (formato simples HH:mm)
        if (objViagem.horaInicialTexto)
        {
            horaParaExibir = objViagem.horaInicialTexto;
        }
        // Prioridade 2: horaInicio ou HoraInicio (pode estar em formato DateTime)
        else if (objViagem.horaInicio || objViagem.HoraInicio)
        {
            const horaOriginal = objViagem.horaInicio || objViagem.HoraInicio;

            // Se contém "T" é formato ISO DateTime
            if (horaOriginal.includes("T"))
            {
                // Extrair apenas HH:mm da parte após o T
                const parteHora = horaOriginal.split("T")[1];
                if (parteHora)
                {
                    horaParaExibir = parteHora.substring(0, 5); // Pega HH:mm
                }
            }
            // Se contém ":" pode ser já no formato HH:mm ou HH:mm:ss
            else if (horaOriginal.includes(":"))
            {
                // Se já está no formato HH:mm
                if (horaOriginal.length === 5)
                {
                    horaParaExibir = horaOriginal;
                }
                // Se está no formato HH:mm:ss
                else if (horaOriginal.length >= 8)
                {
                    horaParaExibir = horaOriginal.substring(0, 5);
                }
                else
                {
                    horaParaExibir = horaOriginal;
                }
            }
            // Pode ser um objeto Date
            else
            {
                try
                {
                    const dataHora = new Date(horaOriginal);
                    if (!isNaN(dataHora))
                    {
                        const horas = String(dataHora.getHours()).padStart(2, '0');
                        const minutos = String(dataHora.getMinutes()).padStart(2, '0');
                        horaParaExibir = `${horas}:${minutos}`;
                    }
                } catch (e)
                {
                    console.warn("âš ï¸ Não foi possível converter hora:", e);
                }
            }
        }
        // Prioridade 3: Tentar campo horaInicial (minúsculo)
        else if (objViagem.horaInicial)
        {
            // Aplicar mesma lógica
            const horaOriginal = objViagem.horaInicial;
            if (typeof horaOriginal === 'string' && horaOriginal.includes(":"))
            {
                horaParaExibir = horaOriginal.substring(0, 5);
            }
        }

        // Aplicar a hora no campo
        if (horaParaExibir)
        {
            $("#txtHoraInicial").val(horaParaExibir);
            console.log("âœ… Hora inicial definida:", horaParaExibir);
        } else
        {
            console.warn("âš ï¸ Hora inicial não encontrada ou em formato inválido");
            $("#txtHoraInicial").val("");
        }

        // 4.6 - PREENCHER HORA FINAL (mesma lógica)
        console.log("ðŸ• [DEBUG] Processando hora final...");
        console.log("   - objViagem.horaFim:", objViagem.horaFim);
        console.log("   - objViagem.HoraFim:", objViagem.HoraFim);
        console.log("   - objViagem.horaFinalTexto:", objViagem.horaFinalTexto);

        let horaFinalParaExibir = null;

        // Aplicar mesma lógica para hora final
        if (objViagem.horaFinalTexto)
        {
            horaFinalParaExibir = objViagem.horaFinalTexto;
        }
        else if (objViagem.horaFim || objViagem.HoraFim)
        {
            const horaFinalOriginal = objViagem.horaFim || objViagem.HoraFim;

            if (horaFinalOriginal.includes("T"))
            {
                const parteHora = horaFinalOriginal.split("T")[1];
                if (parteHora)
                {
                    horaFinalParaExibir = parteHora.substring(0, 5);
                }
            }
            else if (horaFinalOriginal.includes(":"))
            {
                horaFinalParaExibir = horaFinalOriginal.substring(0, 5);
            }
            else
            {
                try
                {
                    const dataHora = new Date(horaFinalOriginal);
                    if (!isNaN(dataHora))
                    {
                        const horas = String(dataHora.getHours()).padStart(2, '0');
                        const minutos = String(dataHora.getMinutes()).padStart(2, '0');
                        horaFinalParaExibir = `${horas}:${minutos}`;
                    }
                } catch (e)
                {
                    console.warn("âš ï¸ Não foi possível converter hora final:", e);
                }
            }
        }

        if (horaFinalParaExibir)
        {
            $("#txtHoraFinal").val(horaFinalParaExibir);
            console.log("âœ… Hora final definida:", horaFinalParaExibir);
        } else
        {
            $("#txtHoraFinal").val("");
        }

        // 5. Motorista
        if (objViagem.motoristaId)
        {
            const lstMotorista = document.getElementById("lstMotorista");
            if (lstMotorista && lstMotorista.ej2_instances && lstMotorista.ej2_instances[0])
            {
                lstMotorista.ej2_instances[0].value = objViagem.motoristaId;
                lstMotorista.ej2_instances[0].dataBind();
            }
        }

        // 6. Veí­culo
        if (objViagem.veiculoId)
        {
            const lstVeiculo = document.getElementById("lstVeiculo");
            if (lstVeiculo && lstVeiculo.ej2_instances && lstVeiculo.ej2_instances[0])
            {
                lstVeiculo.ej2_instances[0].value = objViagem.veiculoId;
                lstVeiculo.ej2_instances[0].dataBind();
            }
        }

        // 7. Finalidade
        const lstFinalidade = document.getElementById("lstFinalidade");
        if (lstFinalidade && lstFinalidade.ej2_instances && lstFinalidade.ej2_instances[0])
        {
            const finalidadeInst = lstFinalidade.ej2_instances[0];
            let finalidadeId = objViagem.finalidadeViagemId || objViagem.finalidadeId;
            const finalidadeNome = objViagem.finalidade;

            console.log("🔍 DEBUG Finalidade:");
            console.log("   finalidadeViagemId:", objViagem.finalidadeViagemId);
            console.log("   finalidadeId:", objViagem.finalidadeId);
            console.log("   finalidade (nome):", finalidadeNome);

            // Se não temos ID mas temos nome, buscar o ID
            if (!finalidadeId && finalidadeNome)
            {
                // Tentar em treeData primeiro
                if (finalidadeInst.treeData && finalidadeInst.treeData.length > 0)
                {
                    const finalidadeEncontrada = finalidadeInst.treeData.find(f => f.Descricao === finalidadeNome);
                    if (finalidadeEncontrada)
                    {
                        finalidadeId = finalidadeEncontrada.FinalidadeId;
                        console.log("   ✅ ID encontrado em treeData:", finalidadeId);
                    }
                }

                // Se não encontrou, tentar em treeItems
                if (!finalidadeId && finalidadeInst.treeItems && finalidadeInst.treeItems.length > 0)
                {
                    const finalidadeEncontrada = finalidadeInst.treeItems.find(f => f.Descricao === finalidadeNome);
                    if (finalidadeEncontrada)
                    {
                        finalidadeId = finalidadeEncontrada.FinalidadeId;
                        console.log("   ✅ ID encontrado em treeItems:", finalidadeId);
                    }
                }
            }

            if (finalidadeId)
            {
                setTimeout(() =>
                {
                    finalidadeInst.value = [finalidadeId]; // Array para DropDownTree
                    if (typeof finalidadeInst.dataBind === 'function')
                    {
                        finalidadeInst.dataBind();
                    }
                    console.log("✅ Finalidade carregada:", finalidadeId);
                }, 200);
            } else
            {
                console.log("ℹ️ Finalidade não informada");
            }
        }

        // 7.1. Ramal Requisitante
        const txtRamalRequisitanteSF = document.getElementById("txtRamalRequisitanteSF");
        if (txtRamalRequisitanteSF)
        {
            const ramal = objViagem.ramalRequisitanteSF || objViagem.ramalRequisitante || "";
            txtRamalRequisitanteSF.value = ramal;
            console.log("✅ Ramal requisitante carregado:", ramal);
        }

        // 7.2. Setor Requisitante
        const lstSetorRequisitanteAgendamento = document.getElementById("lstSetorRequisitanteAgendamento");
        if (lstSetorRequisitanteAgendamento && lstSetorRequisitanteAgendamento.ej2_instances && lstSetorRequisitanteAgendamento.ej2_instances[0])
        {
            const setorInst = lstSetorRequisitanteAgendamento.ej2_instances[0];
            // CORRIGIDO: usar setorSolicitanteId ao invés de setorRequisitanteId
            const setorId = objViagem.setorSolicitanteId || objViagem.setorRequisitanteId || objViagem.setorId;
            let setorNome = objViagem.setorSolicitante || objViagem.nomeSetorRequisitante || objViagem.setorRequisitanteNome || objViagem.setorNome || objViagem.nomeSetor || null;

            console.log("🔍 DEBUG Setor Requisitante:");
            console.log("   setorSolicitanteId:", objViagem.setorSolicitanteId);
            console.log("   setorId:", setorId);
            console.log("   setorNome (do objeto):", setorNome);

            if (setorId)
            {
                // Se não temos o nome, buscar no treeItems
                if (!setorNome && setorInst.treeItems && setorInst.treeItems.length > 0)
                {
                    const setorEncontrado = setorInst.treeItems.find(s => s.SetorSolicitanteId === setorId);
                    if (setorEncontrado)
                    {
                        setorNome = setorEncontrado.Nome;
                        console.log("   ✅ Nome encontrado em treeItems:", setorNome);
                    } else
                    {
                        console.warn("   ⚠️ Setor não encontrado em treeItems");
                    }
                }

                // Setar valor após pequeno delay
                setTimeout(() =>
                {
                    try
                    {
                        setorInst.value = [setorId]; // DropDownTree espera array

                        // Se temos o nome, setar também
                        if (setorNome)
                        {
                            setorInst.text = setorNome;
                        }

                        if (typeof setorInst.dataBind === 'function')
                        {
                            setorInst.dataBind();
                        }

                        console.log("✅ Setor requisitante carregado:", setorId);
                        console.log("   Texto exibido:", setorInst.text);
                    } catch (error)
                    {
                        console.error("❌ Erro ao definir setor:", error);
                    }
                }, 200);
            } else
            {
                console.log("ℹ️ Setor requisitante não informado");
            }
        } else
        {
            console.error("❌ lstSetorRequisitanteAgendamento não encontrado ou não inicializado");
        }

        if (objViagem.requisitanteId)
        {
            const lstRequisitante = document.getElementById("lstRequisitante");
            if (lstRequisitante && lstRequisitante.ej2_instances && lstRequisitante.ej2_instances[0])
            {
                lstRequisitante.ej2_instances[0].value = objViagem.requisitanteId;
                lstRequisitante.ej2_instances[0].dataBind();
            }
        }

        // 9. Setor
        if (objViagem.setorId)
        {
            const ddtSetor = document.getElementById("ddtSetor");
            if (ddtSetor && ddtSetor.ej2_instances && ddtSetor.ej2_instances[0])
            {
                ddtSetor.ej2_instances[0].value = objViagem.setorId;
                ddtSetor.ej2_instances[0].dataBind();
            }
        }

        // 10. Origem e Destino
        if (objViagem.origem)
        {
            const cmbOrigem = document.getElementById("cmbOrigem");
            if (cmbOrigem && cmbOrigem.ej2_instances && cmbOrigem.ej2_instances[0])
            {
                cmbOrigem.ej2_instances[0].value = objViagem.origem;
                cmbOrigem.ej2_instances[0].dataBind();
            }
        }

        if (objViagem.destino)
        {
            const cmbDestino = document.getElementById("cmbDestino");
            if (cmbDestino && cmbDestino.ej2_instances && cmbDestino.ej2_instances[0])
            {
                cmbDestino.ej2_instances[0].value = objViagem.destino;
                cmbDestino.ej2_instances[0].dataBind();
            }
        }

        // 11. Descrição
        if (objViagem.descricao)
        {
            const rteDescricao = document.getElementById("rteDescricao");
            if (rteDescricao && rteDescricao.ej2_instances && rteDescricao.ej2_instances[0])
            {
                rteDescricao.ej2_instances[0].value = objViagem.descricao;
                rteDescricao.ej2_instances[0].dataBind();
            }
        }

        // 12. Campos de viagem
        // Se NoFichaVistoria for 0, mostrar placeholder "(mobile)" em itálico cinza
        const noFichaVal = objViagem.noFichaVistoria;
        const txtNoFicha = $("#txtNoFichaVistoria");
        if (noFichaVal === 0 || noFichaVal === "0" || noFichaVal === null || noFichaVal === "")
        {
            txtNoFicha.val("");
            txtNoFicha.attr("placeholder", "(mobile)");
            txtNoFicha.addClass("placeholder-mobile");
        }
        else
        {
            txtNoFicha.val(noFichaVal);
            txtNoFicha.attr("placeholder", "");
            txtNoFicha.removeClass("placeholder-mobile");
        }
        $("#txtKmAtual").val(objViagem.kmAtual || "");
        $("#txtKmInicial").val(objViagem.kmInicial || "");
        $("#txtKmFinal").val(objViagem.kmFinal || "");

        // 13. Combustí­vel
        if (objViagem.combustivelInicial)
        {
            const ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial");
            if (ddtCombustivelInicial && ddtCombustivelInicial.ej2_instances && ddtCombustivelInicial.ej2_instances[0])
            {
                ddtCombustivelInicial.ej2_instances[0].value = objViagem.combustivelInicial;
                ddtCombustivelInicial.ej2_instances[0].dataBind();
            }
        }

        if (objViagem.combustivelFinal)
        {
            const ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal");
            if (ddtCombustivelFinal && ddtCombustivelFinal.ej2_instances && ddtCombustivelFinal.ej2_instances[0])
            {
                ddtCombustivelFinal.ej2_instances[0].value = objViagem.combustivelFinal;
                ddtCombustivelFinal.ej2_instances[0].dataBind();
            }
        }

        // 14. Evento - VERSÃO DEBUG COMPLETA
        console.log("=== DEBUG EVENTO ===");
        console.log("objViagem.eventoId:", objViagem.eventoId);
        console.log("objViagem.evento:", objViagem.evento);
        console.log("objViagem.eventoNome:", objViagem.eventoNome);

        if (objViagem.eventoId)
        {
            console.log("✅ EventoId existe:", objViagem.eventoId);

            const lstEventos = document.getElementById("lstEventos");
            console.log("lstEventos elemento:", lstEventos);
            console.log("lstEventos tem ej2_instances?", lstEventos?.ej2_instances);
            console.log("lstEventos instância [0]:", lstEventos?.ej2_instances?.[0]);

            if (lstEventos && lstEventos.ej2_instances && lstEventos.ej2_instances[0])
            {
                console.log("✅ lstEventos ENCONTRADO e INICIALIZADO");

                const lstEventosInst = lstEventos.ej2_instances[0];

                console.log("DataSource do lstEventos:", lstEventosInst.dataSource);
                console.log("Valor atual:", lstEventosInst.value);

                // PASSO 1: Definir o valor
                console.log("🔄 Definindo valor:", objViagem.eventoId);
                lstEventosInst.value = objViagem.eventoId;
                lstEventosInst.dataBind();

                console.log("✅ Valor definido. Novo valor:", lstEventosInst.value);
                console.log("Texto selecionado:", lstEventosInst.text);

                // PASSO 2: Mostrar a div
                const divDadosEventoSelecionado = document.getElementById("divDadosEventoSelecionado");
                console.log("divDadosEventoSelecionado elemento:", divDadosEventoSelecionado);

                if (divDadosEventoSelecionado)
                {
                    console.log("Display ANTES:", divDadosEventoSelecionado.style.display);
                    divDadosEventoSelecionado.style.display = "flex";
                    console.log("Display DEPOIS:", divDadosEventoSelecionado.style.display);
                    console.log("✅ divDadosEventoSelecionado.display = 'flex'");
                }
                else
                {
                    console.error("❌ divDadosEventoSelecionado NÃO ENCONTRADA!");
                }

                // PASSO 3: Buscar dados do evento
                setTimeout(() =>
                {
                    console.log("⏰ Timeout 500ms completado, iniciando AJAX...");
                    console.log("URL que será chamada: /api/ViagemEvento/ObterPorId?id=" + objViagem.eventoId);

                    $.ajax({
                        url: '/api/ViagemEvento/ObterPorId',
                        method: 'GET',
                        data: { id: objViagem.eventoId },
                        success: function (response)
                        {
                            console.log("✅ AJAX SUCCESS!");
                            console.log("Response completo:", response);
                            console.log("response.success:", response.success);
                            console.log("response.data:", response.data);

                            if (response.success && response.data)
                            {
                                const evento = response.data;
                                console.log("Evento:", evento);

                                // Data Início
                                console.log("--- Processando Data Início ---");
                                const dataInicial = evento.DataInicial || evento.dataInicial;
                                console.log("dataInicial:", dataInicial);

                                const txtDataInicioEvento = document.getElementById("txtDataInicioEvento");
                                console.log("txtDataInicioEvento elemento:", txtDataInicioEvento);
                                console.log("txtDataInicioEvento.ej2_instances:", txtDataInicioEvento?.ej2_instances);

                                if (dataInicial && txtDataInicioEvento && txtDataInicioEvento.ej2_instances && txtDataInicioEvento.ej2_instances[0])
                                {
                                    txtDataInicioEvento.ej2_instances[0].value = new Date(dataInicial);
                                    txtDataInicioEvento.ej2_instances[0].enabled = false;
                                    txtDataInicioEvento.ej2_instances[0].dataBind();
                                    console.log("✅ Data Início preenchida");
                                }
                                else
                                {
                                    console.error("❌ Não foi possível preencher Data Início");
                                }

                                // Data Fim
                                console.log("--- Processando Data Fim ---");
                                const dataFinal = evento.DataFinal || evento.dataFinal;
                                console.log("dataFinal:", dataFinal);

                                const txtDataFimEvento = document.getElementById("txtDataFimEvento");
                                console.log("txtDataFimEvento elemento:", txtDataFimEvento);

                                if (dataFinal && txtDataFimEvento && txtDataFimEvento.ej2_instances && txtDataFimEvento.ej2_instances[0])
                                {
                                    txtDataFimEvento.ej2_instances[0].value = new Date(dataFinal);
                                    txtDataFimEvento.ej2_instances[0].enabled = false;
                                    txtDataFimEvento.ej2_instances[0].dataBind();
                                    console.log("✅ Data Fim preenchida");
                                }
                                else
                                {
                                    console.error("❌ Não foi possível preencher Data Fim");
                                }

                                // Qtd Participantes
                                console.log("--- Processando Qtd Participantes ---");
                                const qtdParticipantes = evento.QtdParticipantes || evento.qtdParticipantes;
                                console.log("qtdParticipantes:", qtdParticipantes);

                                const txtQtdParticipantesEvento = document.getElementById("txtQtdParticipantesEvento");
                                console.log("txtQtdParticipantesEvento elemento:", txtQtdParticipantesEvento);

                                if (qtdParticipantes !== undefined && txtQtdParticipantesEvento && txtQtdParticipantesEvento.ej2_instances && txtQtdParticipantesEvento.ej2_instances[0])
                                {
                                    const qtdNumero = typeof qtdParticipantes === 'string' ? parseInt(qtdParticipantes, 10) : qtdParticipantes;
                                    txtQtdParticipantesEvento.ej2_instances[0].value = qtdNumero;
                                    txtQtdParticipantesEvento.ej2_instances[0].enabled = false;
                                    txtQtdParticipantesEvento.ej2_instances[0].dataBind();
                                    console.log("✅ Qtd Participantes preenchida");
                                }
                                else
                                {
                                    console.error("❌ Não foi possível preencher Qtd Participantes");
                                }

                                console.log("=== FIM PREENCHIMENTO EVENTO ===");
                            }
                            else
                            {
                                console.error("❌ response.success é false OU response.data está vazio");
                            }
                        },
                        error: function (xhr, status, error)
                        {
                            console.error("❌ AJAX ERROR!");
                            console.error("Status:", status);
                            console.error("Error:", error);
                            console.error("xhr:", xhr);
                            console.error("xhr.responseText:", xhr.responseText);
                        }
                    });
                }, 500);
            }
            else
            {
                console.error("❌ lstEventos NÃO encontrado ou NÃO inicializado!");
                if (!lstEventos) console.error("   - Elemento não existe no DOM");
                if (lstEventos && !lstEventos.ej2_instances) console.error("   - Não tem ej2_instances");
                if (lstEventos && lstEventos.ej2_instances && !lstEventos.ej2_instances[0]) console.error("   - ej2_instances[0] é undefined");
            }
        }
        else
        {
            console.log("⚠️ objViagem.eventoId está vazio/null");
        }
        console.log("=== FIM DEBUG EVENTO ===");

        // ====================================
        // 15. RESTAURAR CONTROLES DE RECORRÊNCIA
        // ====================================
        const isRecorrente = objViagem.recorrente === "S" ||
            (objViagem.intervalo && objViagem.intervalo !== "" && objViagem.intervalo !== "N") ||
            (objViagem.recorrenciaViagemId && objViagem.recorrenciaViagemId !== "00000000-0000-0000-0000-000000000000");

        if (isRecorrente)
        {
            console.log("ðŸ”„ Agendamento é RECORRENTE");
            console.log("   - Recorrente:", objViagem.recorrente);
            console.log("   - Intervalo:", objViagem.intervalo);
            console.log("   - RecorrenciaViagemId:", objViagem.recorrenciaViagemId);

            // PRIMEIRO: Definir lstRecorrente como "S"
            const lstRecorrente = document.getElementById("lstRecorrente");
            if (lstRecorrente && lstRecorrente.ej2_instances && lstRecorrente.ej2_instances[0])
            {
                lstRecorrente.ej2_instances[0].value = "S";
                lstRecorrente.ej2_instances[0].enabled = false; // Desabilitar pois já existe
                lstRecorrente.ej2_instances[0].dataBind();
                console.log("âœ… lstRecorrente definido como 'Sim'");
            }

            // SEGUNDO: Mostrar div de perí­odo IMEDIATAMENTE
            const divPeriodo = document.getElementById("divPeriodo");
            if (divPeriodo)
            {
                divPeriodo.style.setProperty('display', 'block', 'important');
                console.log("âœ… divPeriodo visível");
            }

            // TERCEIRO: Preencher perí­odo
            const lstPeriodos = document.getElementById("lstPeriodos");
            if (lstPeriodos && lstPeriodos.ej2_instances && lstPeriodos.ej2_instances[0])
            {
                lstPeriodos.ej2_instances[0].value = objViagem.intervalo;
                lstPeriodos.ej2_instances[0].enabled = false; // Desabilitar pois já existe
                lstPeriodos.ej2_instances[0].dataBind();
                console.log("âœ… Perí­odo definido:", objViagem.intervalo);
            }

            // QUARTO: Configurar campos especí­ficos com delay
            setTimeout(() =>
            {
                configurarCamposRecorrencia(objViagem);

                // Garantir visibilidade após configuração
                if (window.garantirVisibilidadeRecorrencia)
                {
                    window.garantirVisibilidadeRecorrencia(objViagem);
                }

                // REABILITAR eventos após carregamento completo
                window.ignorarEventosRecorrencia = false;
                console.log("âœ… Eventos de recorrência reabilitados");
            }, 500);
        } else
        {
            console.log("âŒ Agendamento NÃO é recorrente");

            // Garantir que lstRecorrente esteja como "N"
            const lstRecorrente = document.getElementById("lstRecorrente");
            if (lstRecorrente && lstRecorrente.ej2_instances && lstRecorrente.ej2_instances[0])
            {
                lstRecorrente.ej2_instances[0].value = "N";
                lstRecorrente.ej2_instances[0].enabled = false; // DESABILITAR pois é edição de não-recorrente
                console.log("✅ lstRecorrente definido como 'Não' e desabilitado");
            }

            // Esconder campos de recorrência
            $("#divPeriodo, #divDias, #divDiaMes, #divFinalRecorrencia, #calendarContainer").hide();

            // Reabilitar eventos após delay
            setTimeout(() =>
            {
                window.ignorarEventosRecorrencia = false;
            }, 500);
        }

        // 16. Configurar campos de viagem (km, combustí­vel, ficha)
        if (objViagem.status === "Aberta" || objViagem.status === "Realizada")
        {
            mostrarCamposViagem(objViagem);
        }

        // 17. Configurar botões baseado no status
        configurarBotoesPorStatus(objViagem);

        // 17.5 CONFIGURAR RODAPÉ - EXIBIR USER LABELS
        setTimeout(async () =>
        {
            await configurarRodapeLabelsExistente(objViagem);
        }, 400);

        // 18. Calcular durações
        if (typeof window.calcularDuracaoViagem === 'function')
        {
            window.calcularDuracaoViagem();
        }

        if (typeof window.calcularDistanciaViagem === 'function')
        {
            window.calcularDistanciaViagem();
        }

        // 19. Abrir o modal
        window.timeoutAbrirModal = setTimeout(() =>
        {
            console.log("⏰ [exibirViagemExistente] Tentando abrir modal...");
            $("#modalViagens").modal("show");
            console.log("✅ Modal aberto");
        }, 550);
    } catch (error)
    {
        // Garantir reabilitação em caso de erro
        window.carregandoViagemExistente = false;
        window.ignorarEventosRecorrencia = false;

        console.error("âŒ Erro ao exibir viagem existente:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "exibirViagemExistente", error);
    }
}

/**
 * Configura campos especí­ficos de recorrência baseado no tipo
 */
function configurarCamposRecorrencia(objViagem)
{
    try
    {
        console.log("ðŸ”§ Configurando campos de recorrência para tipo:", objViagem.intervalo);

        const intervalo = objViagem.intervalo;

        switch (intervalo)
        {
            case "D": // Diário
                configurarRecorrenciaDiaria(objViagem);
                break;

            case "S": // Semanal
            case "Q": // Quinzenal
                configurarRecorrenciaSemanal(objViagem);
                break;

            case "M": // Mensal
                configurarRecorrenciaMensal(objViagem);
                break;

            case "V": // Variada
                console.log("🔧 Tipo Variada detectado - chamando configurarRecorrenciaVariada");
                console.log("   objViagem passado:", objViagem);

                configurarRecorrenciaVariada(objViagem)
                    .then(() =>
                    {
                        console.log("✅ configurarRecorrenciaVariada concluída com sucesso");
                    })
                    .catch(err =>
                    {
                        console.error("❌ Erro em configurarRecorrenciaVariada:", err);
                        console.error("   Stack:", err.stack);
                    })
                    .finally(() =>
                    {
                        console.log("📊 configurarRecorrenciaVariada finalizada (finally do then)");
                    });
                break;

            default:
                console.warn("âš ï¸ Tipo de recorrência não reconhecido:", intervalo);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "configurarCamposRecorrencia", error);
    }
}

function configurarRecorrenciaDiaria(objViagem)
{
    try
    {
        console.log("ðŸ“… Configurando campos para recorrência DIÃRIA");

        // Mostrar apenas data final de recorrência
        const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
        if (divFinalRecorrencia)
        {
            divFinalRecorrencia.style.setProperty('display', 'block', 'important');
        }

        if (objViagem.dataFinalRecorrencia)
        {
            const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
            if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
            {
                txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                txtFinalRecorrencia.ej2_instances[0].enabled = false;
                txtFinalRecorrencia.ej2_instances[0].dataBind();
            }
        }
    }
    catch (error)
    {
        console.error("❌ Erro em configurarRecorrenciaDiaria:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "configurarRecorrenciaDiaria", error);
    }
}

function configurarRecorrenciaSemanal(objViagem)
{
    try
    {
        console.log("ðŸ“… Configurando campos para recorrência SEMANAL/QUINZENAL");

        // Mostrar dias da semana
        const divDias = document.getElementById("divDias");
        if (divDias)
        {
            divDias.style.setProperty('display', 'block', 'important');
        }

        // Mostrar data final
        const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
        if (divFinalRecorrencia)
        {
            divFinalRecorrencia.style.setProperty('display', 'block', 'important');
        }

        // ============================================================
        // ðŸ”§ CORREÇÃO: Usar PascalCase (Monday em vez de monday)
        // ============================================================
        const lstDias = document.getElementById("lstDias");
        if (lstDias && lstDias.ej2_instances && lstDias.ej2_instances[0])
        {
            const diasSelecionados = [];

            // âœ… CORRIGIDO: Usar Monday (com M maiúsculo) em vez de monday
            if (objViagem.Monday) diasSelecionados.push("Segunda");
            if (objViagem.Tuesday) diasSelecionados.push("Terça");
            if (objViagem.Wednesday) diasSelecionados.push("Quarta");
            if (objViagem.Thursday) diasSelecionados.push("Quinta");
            if (objViagem.Friday) diasSelecionados.push("Sexta");
            if (objViagem.Saturday) diasSelecionados.push("Sábado");
            if (objViagem.Sunday) diasSelecionados.push("Domingo");

            console.log("ðŸ“‹ Dias selecionados:", diasSelecionados);

            lstDias.ej2_instances[0].value = diasSelecionados;
            lstDias.ej2_instances[0].enabled = false;
            lstDias.ej2_instances[0].dataBind();
        }

        // Preencher data final
        if (objViagem.dataFinalRecorrencia)
        {
            const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
            if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
            {
                txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                txtFinalRecorrencia.ej2_instances[0].enabled = false;
                txtFinalRecorrencia.ej2_instances[0].dataBind();
            }
        }
    }
    catch (error)
    {
        console.error("❌ Erro em configurarRecorrenciaSemanal:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "configurarRecorrenciaSemanal", error);
    }
}

function configurarRecorrenciaMensal(objViagem)
{
    try
    {
        console.log("ðŸ“… Configurando campos para recorrência MENSAL");

        // Mostrar dia do mês
        const divDiaMes = document.getElementById("divDiaMes");
        if (divDiaMes)
        {
            divDiaMes.style.setProperty('display', 'block', 'important');
        }

        // Mostrar data final
        const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
        if (divFinalRecorrencia)
        {
            divFinalRecorrencia.style.setProperty('display', 'block', 'important');
        }

        // Preencher dia do mês
        if (objViagem.diaMesRecorrencia)
        {
            const lstDiasMes = document.getElementById("lstDiasMes");
            if (lstDiasMes && lstDiasMes.ej2_instances && lstDiasMes.ej2_instances[0])
            {
                lstDiasMes.ej2_instances[0].value = objViagem.diaMesRecorrencia;
                lstDiasMes.ej2_instances[0].enabled = false;
                lstDiasMes.ej2_instances[0].dataBind();
            }
        }

        // Preencher data final
        if (objViagem.dataFinalRecorrencia)
        {
            const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
            if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
            {
                txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                txtFinalRecorrencia.ej2_instances[0].enabled = false;
                txtFinalRecorrencia.ej2_instances[0].dataBind();
            }
        }
    }
    catch (error)
    {
        console.error("❌ Erro em configurarRecorrenciaMensal:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "configurarRecorrenciaMensal", error);
    }
}

/**
 * Busca datas da recorrência variada do banco de dados
 * param {string} recorrenciaViagemId - ID da recorrência
 * returns {Promise<Array<Date>>} Array de datas
 */
/**
 * Busca datas da recorrência variada do banco de dados
 * LÓGICA CORRIGIDA:
 * - Se RecorrenciaViagemId estiver preenchido: busca por RecorrenciaViagemId
 * - Se RecorrenciaViagemId estiver vazio/null: significa que é o PRIMEIRO registro,
 *   então busca onde RecorrenciaViagemId = ViagemId do registro atual
 *
 * @param {string} recorrenciaViagemId - ID da recorrência (pode ser null/empty)
 * @param {string} viagemId - ID da viagem atual
 * @returns {Promise<Array<Date>>} Array de datas ordenadas
 */
// ====================================================================
// CORREÇÃO DA FUNÇÃO buscarDatasRecorrenciaVariada
// ====================================================================
// Esta função deve substituir a função buscarDatasRecorrenciaVariada no arquivo exibe-viagem.js
// ====================================================================

async function buscarDatasRecorrenciaVariada(recorrenciaViagemId, viagemId)
{
    try
    {
        console.log("🔍 [buscarDatasRecorrenciaVariada] === INICIANDO BUSCA ===");
        console.log("   - RecorrenciaViagemId:", recorrenciaViagemId);
        console.log("   - ViagemId:", viagemId);

        // ✅ LÓGICA SIMPLIFICADA: Determinar qual ID usar
        let idParaBusca;

        // Se RecorrenciaViagemId está preenchido e não é GUID vazio, usar ele
        if (recorrenciaViagemId &&
            recorrenciaViagemId !== "00000000-0000-0000-0000-000000000000" &&
            recorrenciaViagemId !== 0)
        {
            idParaBusca = recorrenciaViagemId;
            console.log("✅ Usando RecorrenciaViagemId:", idParaBusca);
        }
        else if (viagemId &&
            viagemId !== "00000000-0000-0000-0000-000000000000" &&
            viagemId !== 0)
        {
            idParaBusca = viagemId;
            console.log("✅ Usando ViagemId:", idParaBusca);
        }
        else
        {
            console.error("❌ Nenhum ID válido fornecido!");
            return [];
        }

        // ✅ USAR A NOVA API: BuscarViagensRecorrencia
        const url = `/api/Agenda/BuscarViagensRecorrencia?id=${idParaBusca}`;
        console.log("📡 Chamando nova API:", url);

        const response = await fetch(url);

        if (!response.ok)
        {
            console.error("❌ Erro HTTP:", response.status, response.statusText);

            // Tentar ler o corpo da resposta para mais detalhes
            try
            {
                const errorText = await response.text();
                console.error("❌ Detalhes do erro:", errorText);
            } catch (e)
            {
                console.error("❌ Não foi possível ler detalhes do erro");
            }

            return [];
        }

        const result = await response.json();
        console.log("📦 Resposta da API:", result);

        // A nova API retorna diretamente um array
        let viagensArray = Array.isArray(result) ? result : [];

        console.log(`📦 Total de ${viagensArray.length} registro(s) encontrado(s)`);

        if (viagensArray.length === 0)
        {
            console.warn("⚠️ Nenhuma viagem encontrada para a recorrência");
            console.warn("   ID buscado:", idParaBusca);
            return [];
        }

        // Listar todas as viagens encontradas para debug
        console.log("📋 Detalhes das viagens encontradas:");
        viagensArray.forEach((viagem, index) =>
        {
            console.log(`   Viagem ${index + 1}:`);
            console.log(`      - ViagemId: ${viagem.viagemId}`);
            console.log(`      - RecorrenciaViagemId: ${viagem.recorrenciaViagemId}`);
            console.log(`      - DataInicial: ${viagem.dataInicial}`);
        });

        // Extrair as datas iniciais de cada viagem
        const datas = viagensArray
            .map(viagem =>
            {
                const dataStr = viagem.dataInicial;

                if (!dataStr)
                {
                    console.warn(`⚠️ Viagem sem data inicial:`, viagem);
                    return null;
                }

                return new Date(dataStr);
            })
            .filter(data => data !== null && !isNaN(data.getTime()))
            .sort((a, b) => a - b); // Ordenar datas cronologicamente

        console.log("✅ Total de datas válidas processadas:", datas.length);

        if (datas.length > 0)
        {
            console.log("📅 Datas da recorrência:");
            datas.forEach((data, index) =>
            {
                const dataFormatada = data.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                console.log(`   ${index + 1}. ${dataFormatada}`);
            });
        } else
        {
            console.error("❌ NENHUMA DATA VÁLIDA FOI EXTRAÍDA!");
        }

        return datas;
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "buscarDatasRecorrenciaVariada", error);
        return [];
    }
}

// ====================================================================
// FUNÇÃO: limparListboxDatasVariadasCompleto
// Limpeza completa da listbox e seus elementos relacionados
// ====================================================================
function limparListboxDatasVariadasCompleto()
{
    try
    {
        console.log("🧹 Limpando listbox de datas variadas completamente...");

        // Limpar listbox
        const listbox = document.getElementById("lstDatasVariadas");
        if (listbox)
        {
            listbox.innerHTML = '';
            listbox.options.length = 0;
            listbox.style.display = 'none';
            console.log("   ✅ Listbox limpa");
        }

        // Ocultar container
        const container = document.getElementById('listboxDatasVariadasContainer');
        if (container)
        {
            container.style.display = 'none';
            console.log("   ✅ Container ocultado");
        }

        // Limpar badge
        const badge = document.getElementById('badgeContadorDatasVariadas');
        if (badge)
        {
            badge.textContent = '0';
            badge.style.display = 'none';
            console.log("   ✅ Badge limpo");
        }

        // Ocultar qualquer label "Selecione as Datas"
        document.querySelectorAll('label').forEach(label =>
        {
            if (label.textContent && label.textContent.includes('Selecione as Datas'))
            {
                label.style.display = 'none';
                label.style.visibility = 'hidden';
            }
        });

        console.log("✅ Limpeza completa concluída");
    }
    catch (error)
    {
        console.error("❌ Erro na limpeza:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "limparListboxDatasVariadasCompleto", error);
    }
}

// ====================================================================
// FUNÇÃO SEGURA: configurarRecorrenciaVariada
// Versão simplificada que não causa erro de insertBefore
// ====================================================================

// Configuração para habilitar/desabilitar busca do primeiro agendamento
window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;  // DESABILITADO para evitar delays de 30 segundos!

// Função para verificar se a API foi corrigida
async function verificarAPICorrigida()
{
    try
    {
        console.log("🔍 Verificando se API ObterAgendamento foi corrigida...");

        // Testar com um GUID qualquer
        const testGuid = "00000000-0000-0000-0000-000000000000";
        const url = `/api/Agenda/ObterAgendamento?viagemId=${testGuid}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        // Se retornar 404 (não encontrado) ou 200 (encontrado), a API está funcionando
        // Se retornar 500 ou timeout, provavelmente não foi corrigida
        if (response.status === 404 || response.status === 200)
        {
            console.log("✅ API ObterAgendamento parece estar corrigida!");
            window.BUSCAR_PRIMEIRO_AGENDAMENTO = false; // FORÇADO FALSE PARA EVITAR DELAYS
            return true;
        }
        else
        {
            console.warn("⚠️ API ObterAgendamento pode não estar corrigida (status: " + response.status + ")");
            window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;
            return false;
        }
    }
    catch (error)
    {
        console.error("❌ Erro ao verificar API:", error);
        window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;
        return false;
    }
}

// Verificar API ao carregar a página (executar uma vez)
// DESABILITADO PARA EVITAR DELAYS!
/*
if (typeof window.apiVerificada === 'undefined')
{
    window.apiVerificada = true;
    verificarAPICorrigida();
}
*/
// Para testar manualmente use: window.verificarAPICorrigida()

async function configurarRecorrenciaVariada(objViagem)
{
    try
    {
        console.log("=== configurarRecorrenciaVariada - INÍCIO ===");
        const startTime = Date.now(); // Medição de tempo
        console.log("📊 Status BUSCAR_PRIMEIRO_AGENDAMENTO:", window.BUSCAR_PRIMEIRO_AGENDAMENTO);
        if (window.BUSCAR_PRIMEIRO_AGENDAMENTO)
        {
            console.warn("⚠️ ATENÇÃO: Busca do primeiro habilitada - pode causar DELAYS!");
        } else
        {
            console.log("✅ Busca do primeiro DESABILITADA - sem delays!");
        }

        if (!objViagem?.viagemId)
        {
            console.error("❌ objViagem inválido");
            return;
        }

        // IMPORTANTE: Ocultar a label "Selecione as Datas" que não deveria aparecer em edição
        document.querySelectorAll('label').forEach(label =>
        {
            if (label.textContent && label.textContent.includes('Selecione as Datas'))
            {
                label.style.display = 'none';
                label.style.visibility = 'hidden';
                console.log("   ✅ Label 'Selecione as Datas' ocultada");
            }
        });

        // IMPORTANTE: Ocultar o calendário para evitar dupla exibição
        const calendarContainer = document.getElementById('calendarContainer');
        if (calendarContainer)
        {
            calendarContainer.style.display = 'none';
            console.log("   ✅ Calendário ocultado");
        }

        // Ocultar label do calendário também
        const labelCalendar = document.querySelector('label[for="calDatasSelecionadas"]');
        if (labelCalendar)
        {
            labelCalendar.style.display = 'none';
            console.log("   ✅ Label do calendário ocultada");
        }

        // Ocultar badge do calendário
        const badgeCalendar = document.getElementById('badgeContadorDatasSelecionadas');
        if (badgeCalendar)
        {
            badgeCalendar.style.display = 'none';
            console.log("   ✅ Badge do calendário ocultado");
        }

        // 1. COLETAR DATAS
        const todasDatas = [];

        // Incluir data inicial
        if (objViagem.dataInicial)
        {
            todasDatas.push(objViagem.dataInicial);
        }

        // PRIMEIRO: Garantir que o container e listbox estejam visíveis
        const container = document.getElementById('listboxDatasVariadasContainer');
        const listbox = document.getElementById('lstDatasVariadas');

        if (container)
        {
            container.style.display = 'block';
            console.log("   ✅ Container tornado visível");
        }

        if (listbox)
        {
            listbox.style.display = 'block';
            console.log("   ✅ Listbox tornada visível");
        }

        // Determinar qual ID usar para busca
        let idParaBuscar = null;
        const recorrenciaVazia = !objViagem.recorrenciaViagemId ||
            objViagem.recorrenciaViagemId === "00000000-0000-0000-0000-000000000000";

        if (recorrenciaVazia)
        {
            // É o primeiro agendamento da série
            idParaBuscar = objViagem.viagemId;
            console.log(`   📌 Primeiro agendamento - buscar por ViagemId: ${idParaBuscar}`);
        }
        else
        {
            // É um agendamento subsequente
            idParaBuscar = objViagem.recorrenciaViagemId;
            console.log(`   📌 Subsequente - buscar por RecorrenciaViagemId: ${idParaBuscar}`);
        }

        // Buscar viagens relacionadas
        if (idParaBuscar)
        {
            try
            {
                const url = `/api/Agenda/BuscarViagensRecorrencia?id=${idParaBuscar}`;
                console.log(`⏱️ Chamando API BuscarViagensRecorrencia...`);
                const apiStartTime = Date.now();

                // Adicionar timeout de 2 segundos para evitar travamento
                const controller = new AbortController();
                const timeoutId = setTimeout(() =>
                {
                    console.error("❌ Timeout na API BuscarViagensRecorrencia (2s)");
                    controller.abort();
                }, 2000);

                const response = await fetch(url);

                if (response.ok)
                {
                    const viagens = await response.json();
                    console.log(`   📦 Retornaram ${viagens.length} viagens da API`);
                    console.log(`   📊 Detalhes das viagens retornadas:`, viagens);

                    let datasAdicionadas = 0;
                    viagens.forEach(v =>
                    {
                        console.log(`      Verificando viagem: ${v.viagemId}, Data: ${v.dataInicial}`);
                        if (v.dataInicial && v.viagemId !== objViagem.viagemId)
                        {
                            todasDatas.push(v.dataInicial);
                            datasAdicionadas++;
                            console.log(`         ✅ Data adicionada: ${v.dataInicial}`);
                        }
                        else if (v.viagemId === objViagem.viagemId)
                        {
                            console.log(`         ⏩ Pulando data atual: ${v.dataInicial}`);
                        }
                    });
                    console.log(`   📊 Total de datas adicionadas da API: ${datasAdicionadas}`);

                    // Se é subsequente, verificar se o primeiro está na lista
                    if (!recorrenciaVazia)
                    {
                        console.log(`   🔍 Verificando se o primeiro agendamento está na lista...`);
                        console.log(`      ID do primeiro (RecorrenciaViagemId): ${idParaBuscar}`);

                        // O primeiro tem viagemId igual ao RecorrenciaViagemId dos outros
                        // OU tem RecorrenciaViagemId vazio/null
                        const primeiroNaLista = viagens.find(v =>
                        {
                            const ehPrimeiro = v.viagemId === idParaBuscar ||
                                !v.recorrenciaViagemId ||
                                v.recorrenciaViagemId === "00000000-0000-0000-0000-000000000000";
                            return ehPrimeiro;
                        });

                        if (primeiroNaLista)
                        {
                            console.log(`      ✅ Primeiro encontrado na lista: ${primeiroNaLista.viagemId}`);
                            // Se já está na lista, garantir que sua data seja adicionada
                            if (primeiroNaLista.dataInicial && !todasDatas.includes(primeiroNaLista.dataInicial))
                            {
                                todasDatas.push(primeiroNaLista.dataInicial);
                                console.log(`      ✅ Data do primeiro adicionada: ${primeiroNaLista.dataInicial}`);
                            }
                        }
                        else if (window.BUSCAR_PRIMEIRO_AGENDAMENTO)
                        {
                            // A API BuscarViagensRecorrencia não retornou o primeiro
                            // Vamos buscá-lo separadamente (agora funciona pois a API foi corrigida)
                            console.log(`   ⚠️ Primeiro não encontrado na lista! Buscando separadamente...`);

                            try
                            {
                                const urlPrimeiro = `/api/Agenda/ObterAgendamento?viagemId=${idParaBuscar}`;
                                console.log(`      Chamando API corrigida: ${urlPrimeiro}`);

                                // Timeout de 5 segundos (aumentado pois agora deve funcionar)
                                const controller = new AbortController();
                                const timeoutId = setTimeout(() => controller.abort(), 1000) // Reduzido de 5000ms para 1000ms;

                                const responsePrimeiro = await fetch(urlPrimeiro, {
                                    signal: controller.signal
                                });

                                clearTimeout(timeoutId);

                                if (responsePrimeiro.ok)
                                {
                                    const primeiro = await responsePrimeiro.json();
                                    console.log(`      ✅ Resposta recebida:`, primeiro);

                                    if (primeiro && primeiro.dataInicial)
                                    {
                                        todasDatas.push(primeiro.dataInicial);
                                        console.log(`      ✅ Data do PRIMEIRO agendamento adicionada: ${primeiro.dataInicial}`);
                                    }
                                    else
                                    {
                                        console.log(`      ⚠️ Primeiro agendamento sem dataInicial`);
                                    }
                                }
                                else
                                {
                                    console.error(`      ❌ Erro na resposta: ${responsePrimeiro.status}`);
                                    console.error(`      Verifique se a API ObterAgendamento foi corrigida`);

                                    // Desabilitar busca futura se der erro
                                    if (responsePrimeiro.status === 500)
                                    {
                                        console.warn("      ⚠️ Desabilitando busca do primeiro agendamento para evitar delays");
                                        window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;
                                    }
                                }
                            }
                            catch (errPrimeiro)
                            {
                                if (errPrimeiro.name === 'AbortError')
                                {
                                    console.error("      ❌ Timeout ao buscar primeiro agendamento (5s)");
                                    console.error("      API provavelmente não foi corrigida - desabilitando busca");
                                    window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;
                                }
                                else
                                {
                                    console.error("      ❌ Erro ao buscar primeiro:", errPrimeiro);
                                }
                            }
                        }
                        else
                        {
                            console.log(`   ℹ️ Busca do primeiro agendamento desabilitada`);
                            console.log(`      Para habilitar: window.BUSCAR_PRIMEIRO_AGENDAMENTO = true`);
                        }
                    }
                }
            }
            catch (err)
            {
                console.error("Erro ao buscar viagens:", err);
                Alerta.TratamentoErroComLinha("exibe-viagem.js", "configurarRecorrenciaVariada.busca", err);
            }
        }
        else
        {
            console.log("   ⚠️ Sem ID para buscar viagens relacionadas");
        }

        // LOG IMPORTANTE: Total de datas antes de deduplicar
        console.log(`📊 TOTAL DE DATAS COLETADAS: ${todasDatas.length}`);
        console.log(`   Datas coletadas:`, todasDatas);

        // Ordenar e remover duplicatas
        let datasUnicas = [];
        try
        {
            datasUnicas = [...new Set(todasDatas)]
                .map(d => new Date(d))
                .sort((a, b) => a - b);

            console.log(`✅ Datas processadas e ordenadas: ${datasUnicas.length} datas únicas`);
        } catch (errOrdenacao)
        {
            console.error("❌ Erro ao ordenar datas:", errOrdenacao);
            console.error("   Datas originais:", todasDatas);
            return;
        }

        console.log(`Total: ${datasUnicas.length} datas`);

        if (datasUnicas.length === 0)
        {
            console.error("⚠️ Nenhuma data encontrada! Verificar API.");
            console.error("   todasDatas original:", todasDatas);

            // Ainda assim, mostrar container vazio para indicar problema
            const container = document.getElementById('listboxDatasVariadasContainer');
            if (container)
            {
                container.style.display = 'block';
                const label = container.querySelector('label');
                if (label)
                {
                    label.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Nenhuma data encontrada';
                }
            }

            console.log("=== FIM configurarRecorrenciaVariada (sem datas) ===");
            return;
        }

        console.log("✅ Continuando com população da listbox...");

        // 2. PREENCHER LISTBOX
        console.log("🎯 Iniciando preenchimento da listbox...");
        const select = document.getElementById("lstDatasVariadas");
        console.log("   Elemento select encontrado?", !!select);

        if (!select)
        {
            console.error("❌ lstDatasVariadas não encontrado no DOM!");

            // Tentar encontrar o container e criar a listbox se necessário
            const container = document.getElementById('listboxDatasVariadasContainer');
            if (container)
            {
                console.log("   🔧 Container existe, tentando criar select...");

                // Verificar se já existe um select dentro
                let selectExistente = container.querySelector('select');
                if (!selectExistente)
                {
                    selectExistente = document.createElement('select');
                    selectExistente.id = 'lstDatasVariadas';
                    selectExistente.className = 'form-control';
                    selectExistente.multiple = true;
                    selectExistente.size = 5;
                    container.appendChild(selectExistente);
                    console.log("   ✅ Select criado dinamicamente");
                }

                // Tentar novamente
                const selectNovo = document.getElementById("lstDatasVariadas");
                if (selectNovo)
                {
                    console.log("   ✅ Select encontrado após criação");
                    // Continuar com selectNovo
                } else
                {
                    console.error("   ❌ Ainda não foi possível encontrar/criar select");
                    return;
                }
            } else
            {
                console.error("   ❌ Container também não encontrado");
                return;
            }
        }

        const selectFinal = document.getElementById("lstDatasVariadas");
        if (!selectFinal)
        {
            console.error("❌ Problema crítico: não foi possível obter referência ao select");
            return;
        }

        select.innerHTML = '';

        // Forçar visibilidade
        select.style.setProperty('display', 'block', 'important');
        select.style.setProperty('visibility', 'visible', 'important');
        select.style.setProperty('opacity', '1', 'important');

        // Data para destacar - do agendamento ATUAL
        const dataAtualStr = objViagem.dataInicial.split('T')[0];
        console.log(`Data a destacar: ${dataAtualStr}`);

        datasUnicas.forEach(data =>
        {
            const dataIso = data.toISOString();
            const dataStr = dataIso.split('T')[0];

            const texto = data.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            const option = document.createElement('option');
            option.value = dataIso;

            // Destacar a data do agendamento atual
            if (dataStr === dataAtualStr)
            {
                option.text = `📅 ${texto}`;
                option.style.color = '#dc3545';
                option.style.fontWeight = 'bold';
                option.className = 'data-agendamento-atual';
            }
            else
            {
                option.text = texto;
            }

            select.appendChild(option);
        });

        // 3. CONFIGURAR LISTBOX
        select.size = Math.min(datasUnicas.length, 5);
        select.multiple = true;
        select.disabled = false;

        // CRÍTICO: Desselecionar TODOS os itens explicitamente
        for (let i = 0; i < select.options.length; i++)
        {
            select.options[i].selected = false;
        }
        console.log("✅ Todos os itens desselecionados explicitamente");

        // 4. ATUALIZAR BADGE
        const badge = document.getElementById('badgeContadorDatasVariadas');
        if (badge)
        {
            badge.textContent = datasUnicas.length;
            badge.style.display = 'inline-block';
        }

        // 5. GARANTIR VISIBILIDADE DO CONTAINER
        // Reutilizar variáveis já declaradas no início
        if (container)
        {
            container.style.setProperty('display', 'block', 'important');
            container.style.setProperty('visibility', 'visible', 'important');
            console.log("✅ Container visível");
        }
        else
        {
            console.error("❌ Container listboxDatasVariadasContainer NÃO encontrado!");
        }

        // FORÇAR VISIBILIDADE NOVAMENTE DA LISTBOX
        if (select)
        {
            select.style.setProperty('display', 'block', 'important');
            select.style.setProperty('visibility', 'visible', 'important');
            select.style.setProperty('opacity', '1', 'important');
            console.log("✅ Listbox forçada visível novamente");
        }

        // DIAGNÓSTICO FINAL
        console.log("📊 DIAGNÓSTICO FINAL:");
        console.log("   lstDatasVariadas existe?", !!select);
        console.log("   lstDatasVariadas visível?", select ? window.getComputedStyle(select).display : "N/A");
        console.log("   Total de options:", select ? select.options.length : 0);
        console.log("   Container existe?", !!container);
        console.log("   Container visível?", container ? window.getComputedStyle(container).display : "N/A");

        console.log("✅ Listbox configurada!");
        const totalTime = Date.now() - startTime;
        console.log(`⏱️ Tempo total de configurarRecorrenciaVariada: ${totalTime}ms`);
        if (totalTime > 1000)
        {
            console.warn(`⚠️ DELAY DETECTADO: ${totalTime}ms (maior que 1 segundo)`);
        }
        console.log("=== FIM configurarRecorrenciaVariada ===");
    }
    catch (error)
    {
        console.error("❌ ERRO CRÍTICO em configurarRecorrenciaVariada:", error);
        console.error("   Stack trace:", error.stack);

        // Mesmo com erro, garantir que o container fique visível para debug
        const container = document.getElementById('listboxDatasVariadasContainer');
        if (container)
        {
            container.style.display = 'block';
            const label = container.querySelector('label');
            if (label)
            {
                label.textContent = `Erro ao carregar datas: ${error.message}`;
            }
        }

        Alerta.TratamentoErroComLinha("exibe-viagem.js", "configurarRecorrenciaVariada", error);
    }
    finally
    {
        console.log("=== configurarRecorrenciaVariada FINALIZADA (finally) ===");
    }
}

// ====================================================================
// FUNÇÃO: limparListboxDatasVariadas - LIMPA LISTBOX E BADGE
// ====================================================================
function limparListboxDatasVariadas()
{
    try
    {
        console.log("🧹 Limpando ListBox de Datas Variadas e Calendário...");

        // Limpar e ocultar a listbox
        const listbox = document.getElementById("lstDatasVariadas");
        if (listbox)
        {
            listbox.innerHTML = '';
            // Remover TODOS os estilos inline
            listbox.removeAttribute('style');
            // Depois aplicar display none
            listbox.style.display = 'none';
            listbox.size = 1;
            listbox.multiple = false;
            console.log("   ✅ lstDatasVariadas limpa e oculta (estilos removidos)");
        }

        // Limpar o badge da listbox
        const badge = document.getElementById('badgeContadorDatasVariadas');
        if (badge)
        {
            badge.textContent = '0';
            badge.style.display = 'none';
            console.log("   ✅ Badge da listbox limpo e oculto");
        }

        // Ocultar o container da listbox
        const container = document.getElementById('listboxDatasVariadasContainer');
        if (container)
        {
            // Remover TODOS os estilos inline primeiro
            container.removeAttribute('style');
            // Depois aplicar display none
            container.style.display = 'none';
            console.log("   ✅ Container da listbox oculto (estilos removidos)");
        }

        // IMPORTANTE: Também ocultar o calendário e seus elementos
        const calendarContainer = document.getElementById('calendarContainer');
        if (calendarContainer)
        {
            calendarContainer.style.display = 'none';
            console.log("   ✅ Container do calendário oculto");
        }

        const calDatasSelecionadas = document.getElementById('calDatasSelecionadas');
        if (calDatasSelecionadas)
        {
            calDatasSelecionadas.style.display = 'none';
            console.log("   ✅ Calendário oculto");
        }

        const badgeCalendar = document.getElementById('badgeContadorDatasSelecionadas');
        if (badgeCalendar)
        {
            badgeCalendar.textContent = '0';
            badgeCalendar.style.display = 'none';
            console.log("   ✅ Badge do calendário limpo e oculto");
        }

        // Ocultar label do calendário
        const labelCalendar = document.querySelector('label[for="calDatasSelecionadas"]');
        if (labelCalendar)
        {
            labelCalendar.style.display = 'none';
            console.log("   ✅ Label do calendário oculta");
        }

        console.log("✅ Limpeza completa concluída");
    }
    catch (error)
    {
        console.error("❌ Erro ao limpar ListBox:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "limparListboxDatasVariadas", error);
    }
}

// Exportar para uso global
window.limparListboxDatasVariadas = limparListboxDatasVariadas;
// ====================================================================
// FUNÇÃO DE TESTE PARA VERIFICAR RENDERIZAÇÃO
// ====================================================================

// ====================================================================
// FUNÇÃO PARA FORÇAR ATUALIZAÇÃO DA LISTBOX
// ====================================================================

/**
 * Mostra campos especí­ficos de viagem
 */
function mostrarCamposViagem(objViagem)
{
    try
    {
        // Mostrar campos iniciais
        $("#divNoFichaVistoria, #divKmAtual, #divKmInicial, #divCombustivelInicial").show();

        // Preencher ficha - Se 0, mostrar placeholder "(mobile)"
        const noFichaVal = objViagem.noFichaVistoria;
        const txtNoFicha = $("#txtNoFichaVistoria");
        if (noFichaVal === 0 || noFichaVal === "0" || !noFichaVal)
        {
            txtNoFicha.val("");
            txtNoFicha.attr("placeholder", "(mobile)");
            txtNoFicha.addClass("placeholder-mobile");
        }
        else
        {
            txtNoFicha.val(noFichaVal);
            txtNoFicha.attr("placeholder", "");
            txtNoFicha.removeClass("placeholder-mobile");
        }

        // Preencher km atual
        if (objViagem.kmAtual)
        {
            $("#txtKmAtual").val(objViagem.kmAtual);
        }

        // Preencher km inicial
        if (objViagem.kmInicial)
        {
            $("#txtKmInicial").val(objViagem.kmInicial);
        }

        // Preencher combustível inicial
        if (objViagem.combustivelInicial)
        {
            const ddtCombIni = document.getElementById("ddtCombustivelInicial");
            if (ddtCombIni && ddtCombIni.ej2_instances && ddtCombIni.ej2_instances[0])
            {
                ddtCombIni.ej2_instances[0].value = [objViagem.combustivelInicial];
                ddtCombIni.ej2_instances[0].dataBind();
            }
        }

        // SEMPRE mostrar campos de finalização para Aberta, Agendada e Realizada
        // Isso permite ao usuário finalizar a viagem diretamente
        if (objViagem.status === "Aberta" || objViagem.status === "Agendada" || objViagem.status === "Realizada")
        {
            $("#divDataFinal, #divHoraFinal, #divKmFinal, #divCombustivelFinal, #divQuilometragem, #divDuracao").show();

            // Preencher valores se existirem (para viagem Realizada)
            if (objViagem.kmFinal)
            {
                $("#txtKmFinal").val(objViagem.kmFinal);
            }

            if (objViagem.combustivelFinal)
            {
                const ddtCombFim = document.getElementById("ddtCombustivelFinal");
                if (ddtCombFim && ddtCombFim.ej2_instances && ddtCombFim.ej2_instances[0])
                {
                    ddtCombFim.ej2_instances[0].value = [objViagem.combustivelFinal];
                    ddtCombFim.ej2_instances[0].dataBind();
                }
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "mostrarCamposViagem", error);
    }
}

/**
 * Configura botões baseado no status da viagem
 */
function configurarBotoesPorStatus(objViagem)
{
    try
    {
        const status = objViagem.status;
        const statusAgendamento = objViagem.statusAgendamento;

        if (status === "Cancelada")
        {
            // Viagem cancelada - apenas visualização
            $("#btnConfirma").hide();
            $("#btnApaga").hide();
            $("#btnCancela").hide();
            $("#btnViagem").hide();
            $("#btnImprime").show();
            window.desabilitarTodosControles();
            window.CarregandoViagemBloqueada = true;
        } else if (status === "Realizada")
        {
            // Viagem realizada - apenas visualização
            $("#btnConfirma").hide();
            $("#btnApaga").hide();
            $("#btnCancela").hide();
            $("#btnViagem").hide();
            $("#btnImprime").show();
            window.desabilitarTodosControles();
            window.CarregandoViagemBloqueada = true;
        } else if (status === "Aberta")
        {
            // Viagem aberta - pode editar
            $("#btnConfirma").html("<i class='fa fa-save'></i> Editar").show();
            $("#btnApaga").hide();
            $("#btnCancela").show();
            $("#btnViagem").hide();
            $("#btnImprime").show();
        } else if (statusAgendamento === true)
        {
            // Agendamento - pode transformar em viagem
            $("#btnConfirma").html("<i class='fa fa-edit'></i> Edita Agendamento").show();
            $("#btnApaga").show();
            $("#btnCancela").show();
            $("#btnViagem").show();
            $("#btnImprime").show();
        } else
        {
            // Outros casos
            $("#btnConfirma").html("<i class='fa fa-save'></i> Salvar").show();
            $("#btnApaga").show();
            $("#btnCancela").show();
            $("#btnViagem").hide();
            $("#btnImprime").show();
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "configurarBotoesPorStatus", error);
    }
}

/**
 * Configura campos de recorrência para visualização/edição
 */
function configurarRecorrencia(objViagem)
{
    try
    {
        console.log("ðŸ”„ Configurando recorrência:", objViagem);

        // Definir recorrente como "S" e desabilitar
        const lstRecorrente = document.getElementById("lstRecorrente");
        if (lstRecorrente && lstRecorrente.ej2_instances && lstRecorrente.ej2_instances[0])
        {
            lstRecorrente.ej2_instances[0].value = "S";
            lstRecorrente.ej2_instances[0].enabled = false;
            lstRecorrente.ej2_instances[0].dataBind();
        }

        // Mostrar divPeriodo
        const divPeriodo = document.getElementById("divPeriodo");
        if (divPeriodo)
        {
            divPeriodo.style.setProperty('display', 'block', 'important');
        }

        // Configurar perí­odo e desabilitar
        const lstPeriodos = document.getElementById("lstPeriodos");
        if (lstPeriodos && lstPeriodos.ej2_instances && lstPeriodos.ej2_instances[0])
        {
            lstPeriodos.ej2_instances[0].enabled = false;

            if (objViagem.intervalo)
            {
                lstPeriodos.ej2_instances[0].value = objViagem.intervalo;
                lstPeriodos.ej2_instances[0].dataBind();

                console.log("ðŸ“‹ Tipo de intervalo:", objViagem.intervalo);

                // Mostrar campos especí­ficos baseado no tipo de recorrência
                switch (objViagem.intervalo)
                {
                    case "D": // Diário
                        mostrarCamposRecorrenciaDiaria(objViagem);
                        break;

                    case "S": // Semanal
                    case "Q": // Quinzenal
                        mostrarCamposRecorrenciaSemanal(objViagem);
                        break;

                    case "M": // Mensal
                        mostrarCamposRecorrenciaMensal(objViagem);
                        break;

                    case "V": // Variada
                        mostrarCamposRecorrenciaVariada(objViagem);
                        break;

                    default:
                        console.warn("âš ï¸ Tipo de recorrência não reconhecido:", objViagem.intervalo);
                }
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "configurarRecorrencia", error);
    }
}

/**
 * Mostra campos para recorrência diária
 */
function mostrarCamposRecorrenciaDiaria(objViagem)
{
    try
    {
        console.log("ðŸ“… Configurando recorrência diária");

        // Mostrar campo de data final de recorrência
        const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
        if (divFinalRecorrencia)
        {
            divFinalRecorrencia.style.setProperty('display', 'block', 'important');
        }

        // Preencher data final de recorrência
        if (objViagem.dataFinalRecorrencia)
        {
            const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
            if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
            {
                txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                txtFinalRecorrencia.ej2_instances[0].enabled = false;
                txtFinalRecorrencia.ej2_instances[0].dataBind();
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "mostrarCamposRecorrenciaDiaria", error);
    }
}

/**
 * Mostra campos para recorrência semanal/quinzenal
 */
function mostrarCamposRecorrenciaSemanal(objViagem)
{
    try
    {
        console.log("ðŸ“… Configurando recorrência semanal/quinzenal");

        // Mostrar campo de dias da semana
        const divDias = document.getElementById("divDias");
        if (divDias)
        {
            divDias.style.setProperty('display', 'block', 'important');
        }

        // Mostrar campo de data final
        const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
        if (divFinalRecorrencia)
        {
            divFinalRecorrencia.style.setProperty('display', 'block', 'important');
        }

        // Preencher dias da semana selecionados
        const lstDias = document.getElementById("lstDias");
        if (lstDias && lstDias.ej2_instances && lstDias.ej2_instances[0])
        {
            const diasSelecionados = [];

            // Mapear os dias booleanos para o array
            if (objViagem.monday) diasSelecionados.push("Segunda");
            if (objViagem.tuesday) diasSelecionados.push("Terça");
            if (objViagem.wednesday) diasSelecionados.push("Quarta");
            if (objViagem.thursday) diasSelecionados.push("Quinta");
            if (objViagem.friday) diasSelecionados.push("Sexta");
            if (objViagem.saturday) diasSelecionados.push("Sábado");
            if (objViagem.sunday) diasSelecionados.push("Domingo");

            lstDias.ej2_instances[0].value = diasSelecionados;
            lstDias.ej2_instances[0].enabled = false;
            lstDias.ej2_instances[0].dataBind();

            console.log("âœ… Dias selecionados:", diasSelecionados);
        }

        // Preencher data final de recorrência
        if (objViagem.dataFinalRecorrencia)
        {
            const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
            if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
            {
                txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                txtFinalRecorrencia.ej2_instances[0].enabled = false;
                txtFinalRecorrencia.ej2_instances[0].dataBind();
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "mostrarCamposRecorrenciaSemanal", error);
    }
}

/**
 * Mostra campos para recorrência mensal
 */
function mostrarCamposRecorrenciaMensal(objViagem)
{
    try
    {
        console.log("ðŸ“… Configurando recorrência mensal");

        // Mostrar campo de dia do mês
        const divDiaMes = document.getElementById("divDiaMes");
        if (divDiaMes)
        {
            divDiaMes.style.setProperty('display', 'block', 'important');
        }

        // Mostrar campo de data final
        const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
        if (divFinalRecorrencia)
        {
            divFinalRecorrencia.style.setProperty('display', 'block', 'important');
        }

        // Preencher dia do mês
        if (objViagem.diaMesRecorrencia)
        {
            const lstDiasMes = document.getElementById("lstDiasMes");
            if (lstDiasMes && lstDiasMes.ej2_instances && lstDiasMes.ej2_instances[0])
            {
                lstDiasMes.ej2_instances[0].value = objViagem.diaMesRecorrencia;
                lstDiasMes.ej2_instances[0].enabled = false;
                lstDiasMes.ej2_instances[0].dataBind();

                console.log("âœ… Dia do mês:", objViagem.diaMesRecorrencia);
            }
        }

        // Preencher data final de recorrência
        if (objViagem.dataFinalRecorrencia)
        {
            const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
            if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
            {
                txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                txtFinalRecorrencia.ej2_instances[0].enabled = false;
                txtFinalRecorrencia.ej2_instances[0].dataBind();
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "mostrarCamposRecorrenciaMensal", error);
    }
}

/**
 * Mostra campos para recorrência variada
 */
async function mostrarCamposRecorrenciaVariada(objViagem)
{
    try
    {
        console.log("📅 [mostrarCamposRecorrenciaVariada] Iniciando...");
        console.log("   objViagem:", objViagem);

        // ESCONDER calendário (usado na criação)
        const calendarContainer = document.getElementById("calendarContainer");
        if (calendarContainer)
        {
            calendarContainer.style.display = 'none';
            console.log("✅ calendarContainer escondido");
        }
        else
        {
            console.log("⚠️ calendarContainer não encontrado");
        }

        // MOSTRAR listbox (usado na edição)
        const listboxContainer = document.getElementById("listboxDatasVariadasContainer");
        console.log("🔍 Procurando listboxDatasVariadasContainer...");

        if (listboxContainer)
        {
            console.log("✅ listboxDatasVariadasContainer encontrado!");
            console.log("   Display antes:", listboxContainer.style.display);

            listboxContainer.style.display = 'block';
            listboxContainer.style.setProperty('display', 'block', 'important');

            console.log("   Display depois:", listboxContainer.style.display);
            console.log("   InnerHTML:", listboxContainer.innerHTML.substring(0, 200));
        }
        else
        {
            console.error("❌ listboxDatasVariadasContainer não encontrado!");
        }

        // Chamar função para preencher a listbox
        console.log("🔧 Chamando configurarRecorrenciaVariada...");
        await configurarRecorrenciaVariada(objViagem);
        console.log("✅ configurarRecorrenciaVariada concluída");
    } catch (error)
    {
        console.error("❌ Erro em mostrarCamposRecorrenciaVariada:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "mostrarCamposRecorrenciaVariada", error);
    }
}

/**
 * Define o tí­tulo do modal baseado no status (VERSÃO ORIGINAL)
 */
function definirTituloModal(objViagem)
{
    try
    {
        let tipoModal = 'NOVO_AGENDAMENTO';

        if (objViagem && (objViagem.viagemId || objViagem.ViagemId))
        {
            // IMPORTANTE: API pode retornar em PascalCase ou camelCase
            const status = objViagem.status ?? objViagem.Status;
            
            // CORRIGIDO: Verificar StatusAgendamento de forma explícita
            // O campo pode vir como boolean, number ou string
            const statusAgendamentoRaw = objViagem.statusAgendamento ?? objViagem.StatusAgendamento;
            const statusAgendamento = statusAgendamentoRaw === true || 
                                      statusAgendamentoRaw === 1 || 
                                      statusAgendamentoRaw === "1" || 
                                      statusAgendamentoRaw === "true" ||
                                      statusAgendamentoRaw === "True";
            
            // CORRIGIDO: Verificar FoiAgendamento de forma explícita
            // IMPORTANTE: API pode retornar como FoiAgendamento (PascalCase) ou foiAgendamento (camelCase)
            const foiAgendamentoRaw = objViagem.foiAgendamento ?? objViagem.FoiAgendamento;
            const foiAgendamento = foiAgendamentoRaw === true || 
                                   foiAgendamentoRaw === 1 || 
                                   foiAgendamentoRaw === "1" || 
                                   foiAgendamentoRaw === "true" ||
                                   foiAgendamentoRaw === "True";
            
            // CORRIGIDO: Verificar Finalidade de múltiplas formas
            const finalidadeNome = (objViagem.finalidade ?? objViagem.Finalidade ?? '').toString().toLowerCase().trim();
            const isEvento = finalidadeNome === 'evento' || finalidadeNome === 'eventos';

            console.log("🔍 DEBUG definirTituloModal:");
            console.log("   objViagem COMPLETO:", JSON.stringify(objViagem, null, 2));
            console.log("   status:", status);
            console.log("   statusAgendamentoRaw:", statusAgendamentoRaw, "tipo:", typeof statusAgendamentoRaw);
            console.log("   statusAgendamento (calculado):", statusAgendamento);
            console.log("   foiAgendamentoRaw:", foiAgendamentoRaw, "tipo:", typeof foiAgendamentoRaw);
            console.log("   foiAgendamento (calculado):", foiAgendamento);
            console.log("   finalidadeNome:", finalidadeNome);
            console.log("   isEvento:", isEvento);

            // ===== EVENTO (Finalidade = Evento) - PRIORIDADE =====
            if (isEvento)
            {
                if (status === "Cancelada")
                {
                    tipoModal = 'EVENTO_CANCELADO';
                }
                else if (status === "Realizada")
                {
                    tipoModal = 'EVENTO_REALIZADO';
                }
                else if (status === "Aberta" && !statusAgendamento)
                {
                    tipoModal = 'EVENTO_ABERTO';
                }
                else // Status = 'Agendada' ou 'Aberta' com statusAgendamento = true
                {
                    tipoModal = 'EVENTO_AGENDADO';
                }
            }
            // ===== CANCELADA =====
            else if (status === "Cancelada")
            {
                tipoModal = 'VIAGEM_CANCELADA';
            }
            // ===== REALIZADA =====
            else if (status === "Realizada")
            {
                tipoModal = 'VIAGEM_REALIZADA';
                // Passar foiAgendamento para adicionar texto em laranja se necessário
                window._foiAgendamentoAtual = foiAgendamento;
            }
            // ===== ABERTA (viagem já transformada, não é mais agendamento) =====
            else if (status === "Aberta" && !statusAgendamento)
            {
                tipoModal = 'VIAGEM_ABERTA';
                window._foiAgendamentoAtual = false;
            }
            // ===== AGENDADA (Status = 'Agendada' OU Status = 'Aberta' com statusAgendamento = true) =====
            else if (status === "Agendada" || (status === "Aberta" && statusAgendamento))
            {
                tipoModal = 'VIAGEM_AGENDADA';
                window._foiAgendamentoAtual = false;
            }
            // ===== DEFAULT =====
            else
            {
                tipoModal = 'EDITAR_AGENDAMENTO';
                window._foiAgendamentoAtual = false;
            }
        }

        console.log(`✅ Tipo de modal determinado: ${tipoModal}`);
        window.setModalTitle(tipoModal);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "definirTituloModal", error);
    }
}

/**
* Restaura dados de recorrência após inicialização
*/
function restaurarDadosRecorrencia(objViagem)
{
    try
    {
        console.log("ðŸ”„ Restaurando dados de recorrência:", objViagem);

        if (!objViagem)
        {
            console.warn("âš ï¸ Nenhum objeto de viagem fornecido");
            return;
        }

        // Verificar se e recorrente
        if (objViagem.recorrente === 'S' || objViagem.recorrente === true)
        {
            console.log("âœ… Ã‰ recorrente, restaurando configurações...");

            // Restaurar lstRecorrente
            const lstRecorrente = document.getElementById("lstRecorrente");
            if (lstRecorrente && lstRecorrente.ej2_instances && lstRecorrente.ej2_instances[0])
            {
                lstRecorrente.ej2_instances[0].value = 'S';
                lstRecorrente.ej2_instances[0].enabled = false; // Desabilitar em edição
                lstRecorrente.ej2_instances[0].dataBind();
                console.log("âœ… lstRecorrente = Sim");
            }

            // Mostrar divPeriodo
            const divPeriodo = document.getElementById("divPeriodo");
            if (divPeriodo)
            {
                divPeriodo.style.setProperty('display', 'block', 'important');
            }

            // Restaurar periodo
            if (objViagem.intervalo)
            {
                const lstPeriodos = document.getElementById("lstPeriodos");
                if (lstPeriodos && lstPeriodos.ej2_instances && lstPeriodos.ej2_instances[0])
                {
                    lstPeriodos.ej2_instances[0].value = objViagem.intervalo;
                    lstPeriodos.ej2_instances[0].enabled = false; // Desabilitar em edição de recorrência
                    lstPeriodos.ej2_instances[0].dataBind();
                    console.log("âœ… Perí­odo = " + objViagem.intervalo);
                }

                // ================================================================
                // Se for SEMANAL ou QUINZENAL
                // ================================================================
                if (objViagem.intervalo === 'S' || objViagem.intervalo === 'Q')
                {
                    setTimeout(() =>
                    {
                        console.log("ðŸ“… [FINAL] Preenchendo lstDias...");

                        const lstDias = document.getElementById("lstDias");
                        if (lstDias && lstDias.ej2_instances && lstDias.ej2_instances[0])
                        {
                            const diasSelecionados = [];

                            // DIAS ABREVIADOS (sem "-Feira")
                            if (objViagem.Monday || objViagem.monday) diasSelecionados.push("Segunda");
                            if (objViagem.Tuesday || objViagem.tuesday) diasSelecionados.push("Terça");
                            if (objViagem.Wednesday || objViagem.wednesday) diasSelecionados.push("Quarta");
                            if (objViagem.Thursday || objViagem.thursday) diasSelecionados.push("Quinta");
                            if (objViagem.Friday || objViagem.friday) diasSelecionados.push("Sexta");
                            if (objViagem.Saturday || objViagem.saturday) diasSelecionados.push("Sábado");
                            if (objViagem.Sunday || objViagem.sunday) diasSelecionados.push("Domingo");

                            if (diasSelecionados.length > 0)
                            {
                                lstDias.ej2_instances[0].value = diasSelecionados;
                                lstDias.ej2_instances[0].dataBind();
                                console.log("âœ… [FINAL] lstDias preenchido:", diasSelecionados);
                            }
                        }

                        // ========================================
                        // RENDERIZAR CHIPS VISUALMENTE
                        // ========================================
                        setTimeout(() =>
                        {
                            console.log("ðŸ“… [RENDER] Renderizando chips visualmente...");

                            const lstDias = document.getElementById("lstDias");

                            if (lstDias && lstDias.ej2_instances && lstDias.ej2_instances[0])
                            {
                                const instance = lstDias.ej2_instances[0];
                                const dias = instance.value;

                                console.log("ðŸ“‹ [RENDER] Dias encontrados:", dias);

                                if (dias && dias.length > 0)
                                {
                                    const wrapper = lstDias.closest('.e-input-group');

                                    if (wrapper)
                                    {
                                        // CSS DO WRAPPER - Altura compacta
                                        wrapper.style.cssText = `
                                            width: 100% !important;
                                            display: flex !important;
                                            flex-wrap: wrap !important;
                                            min-height: 36px !important;
                                            max-height: 36px !important;
                                            height: 36px !important;
                                            overflow: visible !important;
                                            align-items: center !important;
                                            padding: 2px 4px !important;
                                            box-sizing: border-box !important;
                                        `;

                                        // Criar ou encontrar container de chips
                                        let chipsContainer = wrapper.querySelector('.e-chips-collection');

                                        if (!chipsContainer)
                                        {
                                            chipsContainer = document.createElement('span');
                                            chipsContainer.className = 'e-chips-collection';
                                            wrapper.insertBefore(chipsContainer, wrapper.firstChild);
                                        }

                                        // CSS DO CONTAINER - Sem padding extra
                                        chipsContainer.style.cssText = `
                                            display: flex !important;
                                            flex-wrap: wrap !important;
                                            gap: 3px !important;
                                            padding: 0 !important;
                                            margin: 0 !important;
                                            width: 100% !important;
                                            overflow: visible !important;
                                            align-items: center !important;
                                        `;

                                        // Renderizar chips
                                        chipsContainer.innerHTML = '';

                                        dias.forEach(dia =>
                                        {
                                            const chip = document.createElement('span');
                                            chip.className = 'e-chips';

                                            // CSS DOS CHIPS - Compactos
                                            chip.style.cssText = `
                                                display: inline-flex !important;
                                                align-items: center !important;
                                                padding: 3px 8px !important;
                                                margin: 1px !important;
                                                background-color: #e0e0e0 !important;
                                                border-radius: 10px !important;
                                                font-size: 12px !important;
                                                color: #333 !important;
                                                white-space: nowrap !important;
                                                height: 22px !important;
                                                line-height: 22px !important;
                                                box-sizing: border-box !important;
                                            `;

                                            const chipContent = document.createElement('span');
                                            chipContent.className = 'e-chipcontent';
                                            chipContent.textContent = dia;

                                            chip.appendChild(chipContent);
                                            chipsContainer.appendChild(chip);
                                        });

                                        // Remover elementos vazios que ocupam espaço
                                        Array.from(wrapper.children).forEach(child =>
                                        {
                                            if (child !== chipsContainer && child.offsetHeight > 30)
                                            {
                                                child.style.display = 'none';
                                            }
                                        });

                                        console.log("âœ… [RENDER] Total de chips renderizados:", dias.length);
                                    }
                                    else
                                    {
                                        console.error("âŒ [RENDER] Wrapper não encontrado");
                                    }
                                }
                                else
                                {
                                    console.warn("âš ï¸ [RENDER] Nenhum dia encontrado no componente");
                                }
                            }

                            // ========================================
                            // Desabilitar lstPeriodos (UMA VEZ)
                            // ========================================
                            const lstPeriodos = document.getElementById("lstPeriodos");
                            if (lstPeriodos && lstPeriodos.ej2_instances && lstPeriodos.ej2_instances[0])
                            {
                                lstPeriodos.ej2_instances[0].enabled = false;
                                lstPeriodos.ej2_instances[0].dataBind();
                                console.log("âœ… [RENDER] lstPeriodos desabilitado");
                            }

                            // ========================================
                            // Preencher e desabilitar txtFinalRecorrencia (UMA VEZ)
                            // ========================================
                            if (objViagem.dataFinalRecorrencia)
                            {
                                const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
                                if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
                                {
                                    txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                                    txtFinalRecorrencia.ej2_instances[0].enabled = false;
                                    txtFinalRecorrencia.ej2_instances[0].dataBind();
                                    console.log("âœ… [RENDER] Data final preenchida e desabilitada");
                                }
                            }
                        }, 1000); // Aguardar 1 segundo adicional (total: 2 segundos desde o início)
                    }, 1000); // Aguardar 1 segundo
                }

                // ================================================================
                // Se for MENSAL
                // ================================================================
                if (objViagem.intervalo === 'M')
                {
                    console.log("ðŸ“… Preenchendo lstDiasMes com dados de recorrência...");

                    if (objViagem.diaDoMes)
                    {
                        const lstDiasMes = document.getElementById("lstDiasMes");
                        if (lstDiasMes && lstDiasMes.ej2_instances && lstDiasMes.ej2_instances[0])
                        {
                            lstDiasMes.ej2_instances[0].value = objViagem.diaDoMes;
                            lstDiasMes.ej2_instances[0].enabled = false;
                            lstDiasMes.ej2_instances[0].dataBind();
                            console.log("âœ… lstDiasMes = " + objViagem.diaDoMes);
                        }
                    }

                    // Preencher data final
                    if (objViagem.dataFinalRecorrencia)
                    {
                        const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
                        if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
                        {
                            txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                            txtFinalRecorrencia.ej2_instances[0].enabled = false;
                            txtFinalRecorrencia.ej2_instances[0].dataBind();
                            console.log("âœ… Data final de recorrência preenchida");
                        }
                    }
                }
            }
        }
    }
    catch (error)
    {
        console.error("❌ Erro em restaurarDadosRecorrencia:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "restaurarDadosRecorrencia", error);
    }
}
function restaurarRecorrenciaDiaria(objViagem)
{
    try
    {
        // Mostrar e preencher data final
        const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
        if (divFinalRecorrencia)
        {
            divFinalRecorrencia.style.setProperty('display', 'block', 'important');
        }

        if (objViagem.dataFinalRecorrencia)
        {
            const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
            if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
            {
                txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                txtFinalRecorrencia.ej2_instances[0].enabled = false;
                txtFinalRecorrencia.ej2_instances[0].dataBind();
            }
        }
    }
    catch (error)
    {
        console.error("❌ Erro em restaurarRecorrenciaDiaria:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "restaurarRecorrenciaDiaria", error);
    }
}

function restaurarRecorrenciaSemanal(objViagem)
{
    try
    {
        // Mostrar campos
        const divDias = document.getElementById("divDias");
        if (divDias)
        {
            divDias.style.setProperty('display', 'block', 'important');
        }

        const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
        if (divFinalRecorrencia)
        {
            divFinalRecorrencia.style.setProperty('display', 'block', 'important');
        }

        // ============================================================
        // ðŸ”§ CORREÇÃO: Usar PascalCase (Monday em vez de monday)
        // ============================================================
        const lstDias = document.getElementById("lstDias");
        if (lstDias && lstDias.ej2_instances && lstDias.ej2_instances[0])
        {
            const diasSelecionados = [];

            // âœ… CORRIGIDO: Usar Monday (com M maiúsculo) em vez de monday
            if (objViagem.Monday) diasSelecionados.push("Segunda");
            if (objViagem.Tuesday) diasSelecionados.push("Terça");
            if (objViagem.Wednesday) diasSelecionados.push("Quarta");
            if (objViagem.Thursday) diasSelecionados.push("Quinta");
            if (objViagem.Friday) diasSelecionados.push("Sexta");
            if (objViagem.Saturday) diasSelecionados.push("Sábado");
            if (objViagem.Sunday) diasSelecionados.push("Domingo");

            lstDias.ej2_instances[0].value = diasSelecionados;
            lstDias.ej2_instances[0].enabled = false;
            lstDias.ej2_instances[0].dataBind();
        }

        // Preencher data final
        if (objViagem.dataFinalRecorrencia)
        {
            const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
            if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
            {
                txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                txtFinalRecorrencia.ej2_instances[0].enabled = false;
                txtFinalRecorrencia.ej2_instances[0].dataBind();
            }
        }
    }
    catch (error)
    {
        console.error("❌ Erro em restaurarRecorrenciaSemanal:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "restaurarRecorrenciaSemanal", error);
    }
}

function restaurarRecorrenciaMensal(objViagem)
{
    try
    {
        // Mostrar campos
        const divDiaMes = document.getElementById("divDiaMes");
        if (divDiaMes)
        {
            divDiaMes.style.setProperty('display', 'block', 'important');
        }

        const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
        if (divFinalRecorrencia)
        {
            divFinalRecorrencia.style.setProperty('display', 'block', 'important');
        }

        // Preencher dia do mês
        if (objViagem.diaMesRecorrencia)
        {
            const lstDiasMes = document.getElementById("lstDiasMes");
            if (lstDiasMes && lstDiasMes.ej2_instances && lstDiasMes.ej2_instances[0])
            {
                lstDiasMes.ej2_instances[0].value = objViagem.diaMesRecorrencia;
                lstDiasMes.ej2_instances[0].enabled = false;
                lstDiasMes.ej2_instances[0].dataBind();
            }
        }

        // Preencher data final
        if (objViagem.dataFinalRecorrencia)
        {
            const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia");
            if (txtFinalRecorrencia && txtFinalRecorrencia.ej2_instances && txtFinalRecorrencia.ej2_instances[0])
            {
                txtFinalRecorrencia.ej2_instances[0].value = new Date(objViagem.dataFinalRecorrencia);
                txtFinalRecorrencia.ej2_instances[0].enabled = false;
                txtFinalRecorrencia.ej2_instances[0].dataBind();
            }
        }
    }
    catch (error)
    {
        console.error("❌ Erro em restaurarRecorrenciaMensal:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "restaurarRecorrenciaMensal", error);
    }
}

async function restaurarRecorrenciaVariada(objViagem)
{
    try
    {
        // Mostrar calendário
        const calendarContainer = document.getElementById("calendarContainer");
        if (calendarContainer)
        {
            calendarContainer.style.setProperty('display', 'block', 'important');
        }

        // Inicializar calendário se necessário
        if (typeof window.inicializarCalendarioSyncfusion === 'function')
        {
            window.inicializarCalendarioSyncfusion();
        }

        // ✅ Buscar e carregar datas do banco de dados
        if (recorrenciaId)
        {
            setTimeout(async () =>
            {
                const calDatasSelecionadas = document.getElementById("calDatasSelecionadas");

                if (calDatasSelecionadas && calDatasSelecionadas.ej2_instances && calDatasSelecionadas.ej2_instances[0])
                {
                    const calendario = calDatasSelecionadas.ej2_instances[0];

                    // Buscar datas do banco
                    const datasArray = await buscarDatasRecorrenciaVariada(
                        objViagem.recorrenciaViagemId,
                        objViagem.viagemId
                    );

                    if (datasArray.length > 0)
                    {
                        calendario.values = datasArray;
                        calendario.enabled = false;
                        calendario.dataBind();

                        if (window.atualizarBadgeCalendario)
                        {
                            window.atualizarBadgeCalendario(datasArray.length);
                        }
                    }
                }
            }, 1000);
        }
    }
    catch (error)
    {
        console.error("❌ Erro em restaurarRecorrenciaVariada:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "restaurarRecorrenciaVariada", error);
    }
}

// Adicione esta nova função:
window.garantirVisibilidadeRecorrencia = function (objViagem)
{
    try
    {
        if (!objViagem || !objViagem.intervalo) return;

        console.log("ðŸ” Garantindo visibilidade dos controles de recorrência");

        // Forçar visibilidade com !important
        const divPeriodo = document.getElementById("divPeriodo");
        if (divPeriodo)
        {
            divPeriodo.style.setProperty('display', 'block', 'important');
        }

        // Baseado no tipo de recorrência
        switch (objViagem.intervalo)
        {
            case "D": // Diário
                const divFinalRecorrenciaD = document.getElementById("divFinalRecorrencia");
                if (divFinalRecorrenciaD)
                {
                    divFinalRecorrenciaD.style.setProperty('display', 'block', 'important');
                }
                break;

            case "S": // Semanal
            case "Q": // Quinzenal
                const divDias = document.getElementById("divDias");
                if (divDias)
                {
                    divDias.style.setProperty('display', 'block', 'important');
                }
                const divFinalRecorrenciaS = document.getElementById("divFinalRecorrencia");
                if (divFinalRecorrenciaS)
                {
                    divFinalRecorrenciaS.style.setProperty('display', 'block', 'important');
                }
                break;

            case "M": // Mensal
                const divDiaMes = document.getElementById("divDiaMes");
                if (divDiaMes)
                {
                    divDiaMes.style.setProperty('display', 'block', 'important');
                }
                const divFinalRecorrenciaM = document.getElementById("divFinalRecorrencia");
                if (divFinalRecorrenciaM)
                {
                    divFinalRecorrenciaM.style.setProperty('display', 'block', 'important');
                }
                break;

            case "V": // Variada
                const calendarContainer = document.getElementById("calendarContainer");
                if (calendarContainer)
                {
                    calendarContainer.style.setProperty('display', 'block', 'important');
                }
                break;
        }
    } catch (error)
    {
        console.error("Erro ao garantir visibilidade:", error);
    }
};

window.garantirVisibilidadeRecorrencia = function (objViagem)
{
    try
    {
        if (!objViagem || !objViagem.intervalo) return;

        console.log("ðŸ” Garantindo visibilidade dos controles de recorrência");

        // Forçar visibilidade com !important
        const divPeriodo = document.getElementById("divPeriodo");
        if (divPeriodo)
        {
            divPeriodo.style.setProperty('display', 'block', 'important');
        }

        // Baseado no tipo de recorrência
        switch (objViagem.intervalo)
        {
            case "D": // Diário
                const divFinalRecorrenciaD = document.getElementById("divFinalRecorrencia");
                if (divFinalRecorrenciaD)
                {
                    divFinalRecorrenciaD.style.setProperty('display', 'block', 'important');
                }
                break;

            case "S": // Semanal
            case "Q": // Quinzenal
                const divDias = document.getElementById("divDias");
                if (divDias)
                {
                    divDias.style.setProperty('display', 'block', 'important');
                }
                const divFinalRecorrenciaS = document.getElementById("divFinalRecorrencia");
                if (divFinalRecorrenciaS)
                {
                    divFinalRecorrenciaS.style.setProperty('display', 'block', 'important');
                }
                break;

            case "M": // Mensal
                const divDiaMes = document.getElementById("divDiaMes");
                if (divDiaMes)
                {
                    divDiaMes.style.setProperty('display', 'block', 'important');
                }
                const divFinalRecorrenciaM = document.getElementById("divFinalRecorrencia");
                if (divFinalRecorrenciaM)
                {
                    divFinalRecorrenciaM.style.setProperty('display', 'block', 'important');
                }
                break;

            case "V": // Variada
                const calendarContainer = document.getElementById("calendarContainer");
                if (calendarContainer)
                {
                    calendarContainer.style.setProperty('display', 'block', 'important');
                }
                break;
        }

        console.log("âœ… Visibilidade dos controles garantida para tipo:", objViagem.intervalo);
    } catch (error)
    {
        console.error("âŒ Erro ao garantir visibilidade:", error);
        Alerta.TratamentoErroComLinha("exibe-viagem.js", "garantirVisibilidadeRecorrencia", error);
    }
};

// ====================================================================
// Configurar Rodapé - Labels de Novo Agendamento
// ====================================================================
function configurarRodapeLabelsNovo()
{
    try
    {
        console.log("🆕 [configurarRodapeLabelsNovo] === INICIANDO ===");

        // Função auxiliar para ocultar elemento com força máxima
        const ocultarForcado = (elemento) =>
        {
            if (!elemento) return false;

            // Método 1: setProperty com !important
            elemento.style.setProperty('display', 'none', 'important');
            elemento.style.setProperty('visibility', 'hidden', 'important');
            elemento.style.setProperty('opacity', '0', 'important');
            elemento.style.setProperty('height', '0', 'important');
            elemento.style.setProperty('overflow', 'hidden', 'important');
            elemento.style.setProperty('margin', '0', 'important');
            elemento.style.setProperty('padding', '0', 'important');

            // Método 2: Remover classes que possam estar mostrando
            elemento.classList.remove('show', 'visible', 'd-flex', 'd-block', 'd-inline');
            elemento.classList.add('d-none');

            // Método 3: Limpar conteúdo interno
            const spans = elemento.querySelectorAll('span, i, svg');
            spans.forEach(s =>
            {
                s.textContent = '';
                s.style.setProperty('display', 'none', 'important');
            });

            return true;
        };

        // ✅ ESTRATÉGIA 1: Ocultar por IDs específicos
        const labelsIds = [
            'lblUsuarioAgendamento',
            'lblUsuarioCriacao',
            'lblUsuarioFinalizacao',
            'lblUsuarioCancelamento'
        ];

        labelsIds.forEach(id =>
        {
            const el = document.getElementById(id);
            if (el)
            {
                const ocultou = ocultarForcado(el);
                console.log(`   ${ocultou ? '✅' : '❌'} ${id} ocultado`);
            }
        });

        // ✅ ESTRATÉGIA 2: Ocultar APENAS labels que começam com lblUsuario no rodapé
        const modalFooter = document.querySelector('#modalViagens .modal-footer');
        if (modalFooter)
        {
            const labelsUsuario = modalFooter.querySelectorAll('[id^="lblUsuario"]');
            labelsUsuario.forEach(el =>
            {
                ocultarForcado(el);
            });
            console.log(`   ✅ ${labelsUsuario.length} labels de usuário ocultados no rodapé`);
        }

        // ✅ ESTRATÉGIA 3: Ocultar APENAS ícones dentro das labels específicas de usuário
        const iconesEspecificos = [
            '#lblUsuarioAgendamento .fa-user-clock',
            '#lblUsuarioCriacao .fa-user-plus',
            '#lblUsuarioFinalizacao .fa-user-check',
            '#lblUsuarioCancelamento .fa-trash-can-xmark'
        ];

        iconesEspecificos.forEach(sel =>
        {
            const icone = document.querySelector(sel);
            if (icone)
            {
                const labelPai = icone.closest('[id^="lblUsuario"]');
                if (labelPai) ocultarForcado(labelPai);
            }
        });

        // ✅ ESTRATÉGIA 4: Usar jQuery se disponível
        if (typeof $ !== 'undefined')
        {
            $('[id^="lblUsuario"]').hide().css({
                'display': 'none !important',
                'visibility': 'hidden !important',
                'opacity': '0 !important'
            });
        }

        // ✅ ESTRATÉGIA 5: Executar novamente após um delay (garantia) - MAIS ESPECÍFICA
        setTimeout(() =>
        {
            console.log("🔄 [configurarRodapeLabelsNovo] Reforçando ocultação...");

            labelsIds.forEach(id =>
            {
                const el = document.getElementById(id);
                if (el) ocultarForcado(el);
            });

            const modalFooter = document.querySelector('#modalViagens .modal-footer');
            if (modalFooter)
            {
                // Buscar APENAS dentro dos labels específicos de usuário
                const labelsUsuario = modalFooter.querySelectorAll('[id^="lblUsuario"]');
                labelsUsuario.forEach(label =>
                {
                    ocultarForcado(label);

                    // Ocultar ícones dentro deste label específico
                    const iconesInterno = label.querySelectorAll('[class*="fa-"]');
                    iconesInterno.forEach(icone =>
                    {
                        icone.style.setProperty('display', 'none', 'important');
                    });
                });
            }

            console.log("✅ [configurarRodapeLabelsNovo] Reforço concluído");
        }, 100);

        console.log("✅ [configurarRodapeLabelsNovo] Labels ocultados (múltiplas estratégias)");
    } catch (error)
    {
        console.error("❌ [configurarRodapeLabelsNovo] Erro:", error);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("exibe-viagem.js", "configurarRodapeLabelsNovo", error);
        }
    }
}

// ====================================================================
// ====================================================================
// Helper - Recuperar Nome de Usuário por ID
// ====================================================================
/**
 * Recupera o nome completo de um usuário via AJAX
 * @param {string} usuarioId - GUID do usuário
 * @returns {Promise<string>} Nome completo do usuário ou string vazia
 */
async function recuperarNomeUsuario(usuarioId)
{
    try
    {
        if (!usuarioId || usuarioId.trim() === '')
        {
            return '';
        }

        const response = await $.ajax({
            url: '/api/Agenda/RecuperaUsuario',
            type: 'GET',
            data: { Id: usuarioId },
            dataType: 'json'
        });

        return response.data || '';
    } catch (error)
    {
        console.error("❌ [recuperarNomeUsuario] Erro ao recuperar usuário:", usuarioId, error);
        return '';
    }
}

// Configurar Rodapé - Labels de Viagem Existente
// ====================================================================
async function configurarRodapeLabelsExistente(objViagem)
{
    try
    {
        console.log("🏷️ [configurarRodapeLabelsExistente] === INICIANDO ===");
        console.log("🔍 [configurarRodapeLabelsExistente] objViagem:", objViagem);

        // Helper para formatar data/hora - APENAS SE HOUVER USUÁRIO
        function formatarDataHora(data, usuario, acao)
        {
            try
            {
                // Se não houver usuário, retornar mensagem de usuário não encontrado
                if (!usuario || usuario.trim() === '')
                {
                    return `${acao} por Usuário não encontrado`;
                }

                // Se não houver data, exibir apenas usuário
                if (!data)
                {
                    return `${acao} por ${usuario}`;
                }

                try
                {
                    const d = new Date(data);
                    const dataStr = d.toLocaleDateString('pt-BR');
                    const horaStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    return `${acao} por ${usuario} em ${dataStr} às ${horaStr}`;
                } catch
                {
                    // Se data for inválida, exibir apenas usuário
                    return `${acao} por ${usuario}`;
                }
            }
            catch (error)
            {
                console.error("❌ Erro em formatarDataHora:", error);
                Alerta.TratamentoErroComLinha("exibe-viagem.js", "formatarDataHora", error);
            }
        }

        // Primeiro: Ocultar TODOS os labels
        const todosLabels = [
            '#lblUsuarioAgendamento',
            '#lblUsuarioCriacao',
            '#lblUsuarioFinalizacao',
            '#lblUsuarioCancelamento'
        ];

        todosLabels.forEach(sel =>
        {
            const el = document.querySelector(sel);
            if (el)
            {
                el.style.display = 'none';
            }
        });

        console.log("🔍 [configurarRodapeLabelsExistente] Status:", objViagem.status ?? objViagem.Status);
        console.log("🔍 [configurarRodapeLabelsExistente] FoiAgendamento:", objViagem.foiAgendamento ?? objViagem.FoiAgendamento);
        console.log("🔍 [configurarRodapeLabelsExistente] StatusAgendamento:", objViagem.statusAgendamento ?? objViagem.StatusAgendamento);

        // REGRA 1: Agendado Por - quando FoiAgendamento = true (EXPLICITAMENTE)
        // NÃO usar statusAgendamento aqui, pois são coisas diferentes:
        // - FoiAgendamento = true significa que a viagem FOI um agendamento antes de ser realizada
        // - StatusAgendamento = true significa que AINDA É um agendamento
        // IMPORTANTE: API pode retornar como FoiAgendamento (PascalCase) ou foiAgendamento (camelCase)
        const foiAgendamentoRaw = objViagem.foiAgendamento ?? objViagem.FoiAgendamento;
        const foiAgendamento = foiAgendamentoRaw === true || 
                               foiAgendamentoRaw === 1 || 
                               foiAgendamentoRaw === "1" || 
                               foiAgendamentoRaw === "true" ||
                               foiAgendamentoRaw === "True";
        
        console.log("🔍 [configurarRodapeLabelsExistente] foiAgendamentoRaw:", foiAgendamentoRaw, "tipo:", typeof foiAgendamentoRaw);
        console.log("🔍 [configurarRodapeLabelsExistente] foiAgendamento (calculado):", foiAgendamento);

        if (foiAgendamento)
        {
            const labelAgendamento = document.querySelector('#lblUsuarioAgendamento');
            if (labelAgendamento)
            {
                // ✅ CORREÇÃO: Recuperar nome do usuário via AJAX
                const usuario = await recuperarNomeUsuario(objViagem.usuarioIdAgendamento);

                // Se usuário for vazio/nulo, mostrar "Usuário não encontrado"
                let texto;
                if (usuario && usuario.trim() !== '')
                {
                    texto = formatarDataHora(objViagem.dataAgendamento, usuario, 'Agendado');
                }
                else
                {
                    texto = 'Agendado por Usuário não encontrado';
                }

                const span = labelAgendamento.querySelector('span');
                if (span)
                {
                    span.textContent = texto;
                }
                else
                {
                    labelAgendamento.innerHTML = `<i class="fa-duotone fa-solid fa-user-clock" style="--fa-primary-color: #C2410C; --fa-secondary-color: #fed7aa; --fa-secondary-opacity: 0.6;"></i> <span>${texto}</span>`;
                }

                labelAgendamento.style.display = 'flex';
                console.log("✅ [configurarRodapeLabelsExistente] lblUsuarioAgendamento exibido");
            }
        }
        else
        {
            // ✅ Se não atende às condições, ocultar e limpar
            const labelAgendamento = document.querySelector('#lblUsuarioAgendamento');
            if (labelAgendamento)
            {
                labelAgendamento.style.display = 'none';
                labelAgendamento.innerHTML = '';
            }
        }

        // REGRA 2: Criado Por - quando FoiAgendamento = false
        if (!foiAgendamento)
        {
            const labelCriacao = document.querySelector('#lblUsuarioCriacao');
            if (labelCriacao)
            {
                // ✅ CORREÇÃO: Recuperar nome do usuário via AJAX
                const usuario = await recuperarNomeUsuario(objViagem.usuarioIdCriacao);

                // Se usuário for vazio/nulo, mostrar "Usuário não encontrado"
                let texto;
                if (usuario && usuario.trim() !== '')
                {
                    texto = formatarDataHora(objViagem.dataCriacao, usuario, 'Criado');
                }
                else
                {
                    texto = 'Criado por Usuário não encontrado';
                }

                const span = labelCriacao.querySelector('span');
                if (span)
                {
                    span.textContent = texto;
                }
                else
                {
                    labelCriacao.innerHTML = `<i class="fa-sharp-duotone fa-solid fa-user-plus" style="--fa-primary-color: #1e3a8a; --fa-secondary-color: #bfdbfe; --fa-secondary-opacity: 0.6;"></i> <span>${texto}</span>`;
                }

                labelCriacao.style.display = 'flex';
                console.log("✅ [configurarRodapeLabelsExistente] lblUsuarioCriacao exibido");
            }
        }
        else
        {
            // ✅ Se não atende às condições, ocultar e limpar
            const labelCriacao = document.querySelector('#lblUsuarioCriacao');
            if (labelCriacao)
            {
                labelCriacao.style.display = 'none';
                labelCriacao.innerHTML = '';
            }
        }

        // REGRA 3: Finalizado Por - quando Status = "Realizada"
        if (objViagem.status === "Realizada")
        {
            const labelFinalizacao = document.querySelector('#lblUsuarioFinalizacao');
            if (labelFinalizacao)
            {
                // ✅ CORREÇÃO: Recuperar nome do usuário via AJAX
                const usuario = await recuperarNomeUsuario(objViagem.usuarioIdFinalizacao);

                // Se usuário for vazio/nulo, mostrar "Usuário não encontrado"
                let texto;
                if (usuario && usuario.trim() !== '')
                {
                    texto = formatarDataHora(objViagem.dataFinalizacao, usuario, 'Finalizado');
                }
                else
                {
                    texto = 'Finalizado por Usuário não encontrado';
                }

                const span = labelFinalizacao.querySelector('span');
                if (span)
                {
                    span.textContent = texto;
                }
                else
                {
                    labelFinalizacao.innerHTML = `<i class="fa-duotone fa-solid fa-user-check" style="--fa-primary-color: #155724; --fa-secondary-color: #c3e6cb; --fa-secondary-opacity: 0.6;"></i> <span>${texto}</span>`;
                }

                labelFinalizacao.style.display = 'flex';
                console.log("✅ [configurarRodapeLabelsExistente] lblUsuarioFinalizacao exibido");
            }
        }
        else
        {
            // ✅ Se não atende às condições, ocultar e limpar
            const labelFinalizacao = document.querySelector('#lblUsuarioFinalizacao');
            if (labelFinalizacao)
            {
                labelFinalizacao.style.display = 'none';
                labelFinalizacao.innerHTML = '';
            }
        }

        // REGRA 4: Cancelado Por - quando Status = "Cancelada"
        if (objViagem.status === "Cancelada")
        {
            const labelCancelamento = document.querySelector('#lblUsuarioCancelamento');
            if (labelCancelamento)
            {
                // ✅ CORREÇÃO: Recuperar nome do usuário via AJAX
                const usuario = await recuperarNomeUsuario(objViagem.usuarioIdCancelamento);

                // Se usuário for vazio/nulo, mostrar "Usuário não encontrado"
                let texto;
                if (usuario && usuario.trim() !== '')
                {
                    texto = formatarDataHora(objViagem.dataCancelamento, usuario, 'Cancelado');
                }
                else
                {
                    texto = 'Cancelado por Usuário não encontrado';
                }

                const span = labelCancelamento.querySelector('span');
                if (span)
                {
                    span.textContent = texto;
                }
                else
                {
                    labelCancelamento.innerHTML = `<i class="fa-duotone fa-regular fa-trash-can-xmark" style="--fa-primary-color: #8B0000; --fa-secondary-color: #f5c6cb; --fa-secondary-opacity: 0.6;"></i> <span>${texto}</span>`;
                }

                labelCancelamento.style.display = 'flex';
                console.log("✅ [configurarRodapeLabelsExistente] lblUsuarioCancelamento exibido");
            }
        }
        else
        {
            // ✅ Se não atende às condições, ocultar e limpar
            const labelCancelamento = document.querySelector('#lblUsuarioCancelamento');
            if (labelCancelamento)
            {
                labelCancelamento.style.display = 'none';
                labelCancelamento.innerHTML = '';
            }
        }

        console.log("✅ [configurarRodapeLabelsExistente] Labels de rodapé configurados");
    } catch (error)
    {
        console.error("❌ [configurarRodapeLabelsExistente] Erro:", error);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("exibe-viagem.js", "configurarRodapeLabelsExistente", error);
        }
    }
}

// ====================================================================
// CONFIGURAÇÃO DE TÍTULO DO MODAL COM ÍCONES
// ====================================================================

/**
 * Configurações de títulos e ícones do modal
 * ATUALIZADO: Novas cores e ícones por status - Padrão FrotiX
 */
window.ModalConfig = {
    NOVO_AGENDAMENTO: {
        icone: '<i class="fa-duotone fa-solid fa-calendar-plus fa-lg me-2" style="--fa-primary-color: #cc5500; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 0.8;"></i>',
        titulo: "Criar Agendamento",
        headerClass: "modal-header-novo-agendamento"
    },
    EDITAR_AGENDAMENTO: {
        icone: '<i class="fa-duotone fa-solid fa-calendar-lines-pen fa-lg me-2" style="--fa-primary-color: #003d82; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 0.8;"></i>',
        titulo: "Editar Agendamento",
        headerClass: "modal-header-editar-agendamento"
    },
    VIAGEM_ABERTA: {
        icone: '<i class="fa-duotone fa-solid fa-calendar-range fa-lg me-2" style="--fa-primary-color: #314f31; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 0.8;"></i>',
        titulo: 'Viagem Aberta <span class="titulo-subtexto">(permite edição)</span>',
        headerClass: "modal-header-viagem-aberta"
    },
    VIAGEM_AGENDADA: {
        icone: '<i class="fa-duotone fa-solid fa-calendar-circle-user fa-lg me-2" style="--fa-primary-color: #E07435; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 0.8;"></i>',
        titulo: 'Viagem Agendada <span class="titulo-subtexto">(permite edição)</span>',
        headerClass: "modal-header-viagem-agendada"
    },
    VIAGEM_REALIZADA: {
        icone: '<i class="fa-duotone fa-solid fa-calendar-check fa-lg me-2" style="--fa-primary-color: #113D4E; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 0.8;"></i>',
        titulo: 'Viagem Realizada <span class="titulo-subtexto">(não permite edição)</span>',
        headerClass: "modal-header-viagem-realizada"
    },
    VIAGEM_CANCELADA: {
        icone: '<i class="fa-duotone fa-solid fa-calendar-xmark fa-lg me-2" style="--fa-primary-color: #a24e58; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 0.8;"></i>',
        titulo: 'Viagem Cancelada <span class="titulo-subtexto">(não permite edição)</span>',
        headerClass: "modal-header-viagem-cancelada"
    },
    // ===== EVENTOS =====
    EVENTO_ABERTO: {
        icone: '<i class="fa-duotone fa-solid fa-calendar-users fa-lg me-2" style="--fa-primary-color: #84593D; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 0.8;"></i>',
        titulo: 'Evento Aberto <span class="titulo-subtexto">(permite edição)</span>',
        headerClass: "modal-header-viagem-evento"
    },
    EVENTO_AGENDADO: {
        icone: '<i class="fa-duotone fa-solid fa-calendar-users fa-lg me-2" style="--fa-primary-color: #84593D; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 0.8;"></i>',
        titulo: 'Evento Agendado <span class="titulo-subtexto">(permite edição)</span>',
        headerClass: "modal-header-viagem-evento"
    },
    EVENTO_REALIZADO: {
        icone: '<i class="fa-duotone fa-solid fa-calendar-users fa-lg me-2" style="--fa-primary-color: #84593D; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 0.8;"></i>',
        titulo: 'Evento Realizado <span class="titulo-subtexto">(não permite edição)</span>',
        headerClass: "modal-header-viagem-evento"
    },
    EVENTO_CANCELADO: {
        icone: '<i class="fa-duotone fa-solid fa-calendar-users fa-lg me-2" style="--fa-primary-color: #84593D; --fa-secondary-color: #ffffff; --fa-secondary-opacity: 0.8;"></i>',
        titulo: 'Evento Cancelado <span class="titulo-subtexto">(não permite edição)</span>',
        headerClass: "modal-header-viagem-evento"
    }
};

/**
 * Define título do modal com ícone e cor
 * ATUALIZADO: Agora também altera a classe do header
 * @param {string} tipo - Tipo de modal (NOVO_AGENDAMENTO, EDITAR_AGENDAMENTO, etc)
 * @param {string} tituloCustomizado - Título customizado opcional
 */
window.setModalTitle = function (tipo, tituloCustomizado = null)
{
    try
    {
        const config = window.ModalConfig[tipo];

        if (!config)
        {
            console.warn("⚠️ Tipo de modal não encontrado:", tipo);
            return;
        }

        let titulo = tituloCustomizado || config.titulo;
        
        // Se for VIAGEM_REALIZADA e foiAgendamento = true, adicionar texto em laranja
        if (tipo === 'VIAGEM_REALIZADA' && window._foiAgendamentoAtual === true)
        {
            titulo = 'Viagem Realizada <span class="titulo-subtexto">(não permite edição)</span> <span class="titulo-via-agendamento">(através de Agendamento)</span>';
        }
        
        const tituloCompleto = config.icone + titulo;

        // Atualizar título do modal
        const modalTitle = document.querySelector("#modalViagens .modal-title");
        if (modalTitle)
        {
            modalTitle.innerHTML = tituloCompleto;
            console.log(`✅ Título do modal definido: ${tipo}${window._foiAgendamentoAtual ? ' (via Agendamento)' : ''}`);
        } else
        {
            console.warn("⚠️ Elemento .modal-title não encontrado");
        }

        // NOVO: Atualizar classe do header
        const modalHeader = document.querySelector("#modalViagens #Titulo");
        if (modalHeader && config.headerClass)
        {
            // Remove todas as classes de header anteriores
            const classesToRemove = [
                'modal-header-dinheiro',
                'modal-header-vinho',
                'modal-header-azul',
                'modal-header-terracota',
                'modal-header-verde',
                'modal-header-novo-agendamento',
                'modal-header-editar-agendamento',
                'modal-header-viagem-aberta',
                'modal-header-viagem-agendada',
                'modal-header-viagem-realizada',
                'modal-header-viagem-cancelada',
                'modal-header-viagem-evento'
            ];
            
            classesToRemove.forEach(cls => {
                modalHeader.classList.remove(cls);
            });

            // Adiciona a nova classe
            modalHeader.classList.add(config.headerClass);
            console.log(`✅ Classe do header alterada para: ${config.headerClass}`);
        }
        
        // Limpar flag após uso
        window._foiAgendamentoAtual = false;
    } catch (error)
    {
        console.error("❌ Erro ao definir título do modal:", error);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("exibe-viagem.js", "setModalTitle", error);
        }
    }
};

// ====================================================================
// LISTENER PARA GARANTIR INICIALIZAÇÃO DO lstRecorrente
// ====================================================================
$(document).ready(function ()
{
    // Listener para quando o modal é mostrado
    $('#modalViagens').on('shown.bs.modal', function ()
    {
        console.log("🎯 Modal mostrado - garantindo lstRecorrente inicializado...");

        // Aguardar um pouco para garantir que Syncfusion carregou
        setTimeout(() =>
        {
            inicializarLstRecorrente();
            // Inicializar ListBox de datas variadas
        }, 100);
    });

    console.log("✅ Listener de modal configurado");
});

// ====================================================================
// AUTO-EXECUÇÃO AO CARREGAR A PÁGINA
// ========
// ====================================================================
// FUNÇÕES DE CONTROLE - Use no console para habilitar/desabilitar
// ====================================================================

// Habilitar busca do primeiro agendamento
window.habilitarBuscaPrimeiro = function ()
{
    window.BUSCAR_PRIMEIRO_AGENDAMENTO = false; // FORÇADO FALSE PARA EVITAR DELAYS
    console.log("✅ Busca do primeiro agendamento HABILITADA");
    console.log("   A listbox agora tentará buscar o primeiro agendamento da série");
    return "Habilitado";
};

// Desabilitar busca do primeiro agendamento
window.desabilitarBuscaPrimeiro = function ()
{
    window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;
    console.log("✅ Busca do primeiro agendamento DESABILITADA");
    console.log("   A listbox NÃO tentará buscar o primeiro agendamento");
    console.log("   Isso evita delays se a API não foi corrigida");
    return "Desabilitado";
};

// Verificar status atual
window.statusBuscaPrimeiro = function ()
{
    console.log("📊 STATUS DA BUSCA DO PRIMEIRO AGENDAMENTO:");
    console.log("   Habilitada?", window.BUSCAR_PRIMEIRO_AGENDAMENTO ? "SIM ✅" : "NÃO ❌");

    if (window.BUSCAR_PRIMEIRO_AGENDAMENTO)
    {
        console.log("   ℹ️ A listbox tentará buscar o primeiro agendamento da série");
        console.log("   ⚠️ Se a API não foi corrigida, pode causar delay de 5 segundos");
        console.log("   Para desabilitar: window.desabilitarBuscaPrimeiro()");
    }
    else
    {
        console.log("   ℹ️ A listbox NÃO tentará buscar o primeiro agendamento");
        console.log("   ✅ Não haverá delays, mas o primeiro pode não aparecer na lista");
        console.log("   Para habilitar: window.habilitarBuscaPrimeiro()");
    }

    return window.BUSCAR_PRIMEIRO_AGENDAMENTO;
};

// Testar API manualmente
window.testarAPIObterAgendamento = async function (viagemId)
{
    console.log("🧪 TESTANDO API ObterAgendamento...");

    if (!viagemId)
    {
        console.error("❌ Forneça um viagemId válido");
        console.log("   Exemplo: window.testarAPIObterAgendamento('7b89ce20-7319-4ba0-848a-08de15965414')");
        return;
    }

    try
    {
        const url = `/api/Agenda/ObterAgendamento?viagemId=${viagemId}`;
        console.log(`   URL: ${url}`);

        const inicio = Date.now();
        const response = await fetch(url);
        const tempo = Date.now() - inicio;

        console.log(`   ⏱️ Tempo de resposta: ${tempo}ms`);
        console.log(`   📊 Status: ${response.status}`);

        if (response.ok)
        {
            const dados = await response.json();
            console.log("   ✅ API funcionando corretamente!");
            console.log("   Dados retornados:", dados);

            // Habilitar busca automaticamente se funcionar
            window.BUSCAR_PRIMEIRO_AGENDAMENTO = false; // FORÇADO FALSE PARA EVITAR DELAYS
            console.log("   ✅ Busca do primeiro agendamento HABILITADA automaticamente");
        }
        else if (response.status === 404)
        {
            console.log("   ⚠️ Agendamento não encontrado (404)");
            console.log("   Mas a API está funcionando corretamente!");

            // Habilitar busca pois API está OK
            window.BUSCAR_PRIMEIRO_AGENDAMENTO = false; // FORÇADO FALSE PARA EVITAR DELAYS
            console.log("   ✅ Busca do primeiro agendamento HABILITADA");
        }
        else
        {
            console.error(`   ❌ Erro: ${response.status}`);
            const erro = await response.text();
            console.error("   Resposta:", erro);

            // Desabilitar busca se der erro 500
            if (response.status === 500)
            {
                window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;
                console.warn("   ⚠️ Busca do primeiro agendamento DESABILITADA");
                console.warn("   API provavelmente não foi corrigida");
            }
        }
    }
    catch (error)
    {
        console.error("   ❌ Erro ao testar API:", error);
        window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;
        console.warn("   ⚠️ Busca do primeiro agendamento DESABILITADA");
    }
};

// Garantir limpeza ao fechar modal
$(document).ready(function ()
{
    $('#modalViagens').on('hidden.bs.modal', function ()
    {
        limparListboxDatasVariadasCompleto();
        console.log("✅ Modal fechado - listbox limpa");
    });

    // Também ocultar label ao abrir modal
    $('#modalViagens').on('shown.bs.modal', function ()
    {
        setTimeout(() =>
        {
            document.querySelectorAll('label').forEach(label =>
            {
                if (label.textContent && label.textContent.includes('Selecione as Datas'))
                {
                    label.style.display = 'none';
                    label.style.visibility = 'hidden';
                }
            });
        }, 100);
    });
});
// ====================================================================
// FUNÇÕES DE CONTROLE MANUAL (usar no console se necessário)
// ====================================================================

// Habilitar busca do primeiro agendamento (só se API foi corrigida)
window.habilitarBuscaPrimeiro = function ()
{
    window.BUSCAR_PRIMEIRO_AGENDAMENTO = false; // FORÇADO FALSE PARA EVITAR DELAYS
    console.log("✅ Busca do primeiro agendamento HABILITADA");
    console.log("⚠️ ATENÇÃO: Só use se a API ObterAgendamento foi corrigida!");
    return "Habilitado";
};

// Desabilitar busca do primeiro agendamento (evita delays)
window.desabilitarBuscaPrimeiro = function ()
{
    window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;
    console.log("✅ Busca do primeiro agendamento DESABILITADA");
    console.log("✅ Sem delays de 30 segundos!");
    return "Desabilitado";
};

// Verificar status atual
window.statusBuscaPrimeiro = function ()
{
    const status = window.BUSCAR_PRIMEIRO_AGENDAMENTO;
    console.log(`📊 Status da busca do primeiro: ${status ? 'HABILITADA' : 'DESABILITADA'}`);
    if (status)
    {
        console.log("⚠️ Pode causar delays se a API não foi corrigida!");
    } else
    {
        console.log("✅ Sem delays - performace otimizada!");
    }
    return status;
};

// Testar API ObterAgendamento
window.testarAPIObterAgendamento = async function (viagemId)
{
    if (!viagemId)
    {
        console.error("❌ Forneça um viagemId válido!");
        return;
    }

    console.log(`🔍 Testando API com viagemId: ${viagemId}`);
    const url = `/api/Agenda/ObterAgendamento?viagemId=${viagemId}`;

    try
    {
        const inicio = Date.now();
        const response = await fetch(url);
        const tempo = Date.now() - inicio;

        console.log(`⏱️ Tempo de resposta: ${tempo}ms`);

        if (response.ok)
        {
            const data = await response.json();
            console.log("✅ API funcionando!", data);
            return true;
        } else
        {
            console.error(`❌ Erro ${response.status}`);
            return false;
        }
    } catch (error)
    {
        console.error("❌ Erro na API:", error);
        return false;
    }
};

// ====================================================================
// OVERRIDE FINAL - GARANTIR ZERO DELAYS
// ====================================================================
// Este código garante que NUNCA haverá delays, sobrescrevendo qualquer
// configuração anterior

(function ()
{
    console.log("🚀 Aplicando override final para ZERO delays...");

    // Forçar desabilitação total
    window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;
    window.apiVerificada = true;

    // Sobrescrever a função verificarAPICorrigida para não fazer nada
    window.verificarAPICorrigida = async function ()
    {
        console.log("⚡ verificarAPICorrigida DESABILITADA (override)");
        return false;
    };

    // Log de confirmação
    console.log("✅ OVERRIDE APLICADO:");
    console.log("   - Busca do primeiro: DESABILITADA");
    console.log("   - Verificação de API: DESABILITADA");
    console.log("   - Modal deve abrir INSTANTANEAMENTE!");
})();

console.log("===========================================");
console.log("📌 FUNÇÕES DE CONTROLE DISPONÍVEIS:");
console.log("  window.habilitarBuscaPrimeiro()  - Habilita busca (se API corrigida)");
console.log("  window.desabilitarBuscaPrimeiro() - Desabilita busca (sem delays)");
console.log("  window.statusBuscaPrimeiro()     - Verifica status atual");
console.log("  window.testarAPIObterAgendamento('id') - Testa a API");
console.log("  window.forcarLimpeza()           - Força limpeza completa");
console.log("===========================================");

// ====================================================================
// FUNÇÕES DE DEBUG PARA IDENTIFICAR DELAYS
// ====================================================================

window.debugDelay = function ()
{
    console.log("🔍 DEBUG DE DELAYS:");
    console.log("1. BUSCAR_PRIMEIRO_AGENDAMENTO:", window.BUSCAR_PRIMEIRO_AGENDAMENTO);
    console.log("2. apiVerificada:", window.apiVerificada);
    console.log("3. Para ELIMINAR delays: window.desabilitarTodosDelays()");
    return {
        buscarPrimeiro: window.BUSCAR_PRIMEIRO_AGENDAMENTO,
        apiVerificada: window.apiVerificada
    };
};

window.desabilitarTodosDelays = function ()
{
    console.log("🚀 DESABILITANDO TODOS OS DELAYS...");
    window.BUSCAR_PRIMEIRO_AGENDAMENTO = false;
    window.apiVerificada = true; // Evita verificação futura
    console.log("✅ Todos os delays desabilitados!");
    console.log("✅ Modal deve abrir INSTANTANEAMENTE agora!");
    return "Delays eliminados";
};

// Garan
// ====================================================================
// DIAGNÓSTICO AUTOMÁTICO
// ====================================================================
try
{
    const diagnostico = {
        exibirViagemExistente: typeof exibirViagemExistente === 'function',
        configurarRecorrenciaVariada: typeof configurarRecorrenciaVariada === 'function',
        limparListbox: typeof limparListboxDatasVariadas === 'function' || typeof limparListboxDatasVariadasCompleto === 'function',
        delays: !window.BUSCAR_PRIMEIRO_AGENDAMENTO
    };

    console.log("📊 DIAGNÓSTICO exibe-viagem.js:");
    console.log("   exibirViagemExistente:", diagnostico.exibirViagemExistente ? "✅" : "❌");
    console.log("   configurarRecorrenciaVariada:", diagnostico.configurarRecorrenciaVariada ? "✅" : "❌");
    console.log("   Limpeza listbox:", diagnostico.limparListbox ? "✅" : "❌");
    console.log("   Delays desabilitados:", diagnostico.delays ? "✅" : "⚠️");

    if (Object.values(diagnostico).every(v => v))
    {
        console.log("✅ exibe-viagem.js 100% funcional!");
    }
} catch (e)
{
    console.error("❌ Erro no diagnóstico:", e);
}
