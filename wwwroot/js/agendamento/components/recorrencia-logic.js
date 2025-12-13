// ====================================================================
// RECORRENCIA LOGIC - Lógica de visibilidade dos campos de recorrência
// ====================================================================

window.calendario = null;
window.datasSelecionadas = [];
window.ignorarEventosRecorrencia = false;

/**
 * Inicializa a lógica de visibilidade dos campos de recorrência
 * Deve ser chamado após os controles Syncfusion estarem renderizados
 */
window.inicializarLogicaRecorrencia = function ()
{
    try
    {
        console.log("ðŸ”§ Inicializando lógica de recorrência...");

        // PRIMEIRO: Inicializar o dropdown de perí­odos (se ainda não foi)
        if (window.inicializarDropdownPeriodos)
        {
            console.log("ðŸ“‹ Inicializando dropdown de perí­odos...");
            window.inicializarDropdownPeriodos();
        }
        else
        {
            console.warn("âš ï¸ Função inicializarDropdownPeriodos não encontrada");
        }

        // Aguardar um pouco para garantir que o dropdown foi criado
        setTimeout(() =>
        {
            // Esconder todos os campos exceto lstRecorrente no início
            esconderTodosCamposRecorrencia();

            // SEGUNDO: Definir valor padrío "Não" para lstRecorrente
            setTimeout(() =>
            {
                const lstRecorrenteElement = document.getElementById("lstRecorrente");
                if (lstRecorrenteElement && lstRecorrenteElement.ej2_instances)
                {
                    const lstRecorrente = lstRecorrenteElement.ej2_instances[0];
                    if (lstRecorrente)
                    {
                        // Verificar qual valor usar para "Não"
                        console.log("ðŸ” DataSource de lstRecorrente:", lstRecorrente.dataSource);

                        // Tentar encontrar o item "Não"
                        const itemNao = lstRecorrente.dataSource?.find(item =>
                            item.Descricao === "Não" ||
                            item.Descricao === "Nao" ||
                            item.RecorrenteId === "N"
                        );

                        if (itemNao)
                        {
                            console.log("ðŸ“‹ Item 'Não' encontrado:", itemNao);
                            lstRecorrente.value = itemNao.RecorrenteId;
                            lstRecorrente.dataBind();
                            // lstRecorrente.refresh(); // Comentado - causa evento change indesejado
                            console.log("âœ… lstRecorrente definido como 'Não' (padrío)");
                        }
                        else
                        {
                            console.warn("âš ï¸ Item 'Não' não encontrado no dataSource");
                        }
                    }
                    else
                    {
                        console.warn("âš ï¸ Instância lstRecorrente não encontrada");
                    }
                }
                else
                {
                    console.warn("âš ï¸ lstRecorrente não encontrado no DOM");
                }
            }, 200);

            // TERCEIRO: Configurar event handlers
            configurarEventHandlerRecorrente();
            configurarEventHandlerPeriodo();

            console.log("âœ… Lógica de recorrência inicializada");

        }, 300);

    } catch (error)
    {
        console.error("âŒ Erro ao inicializar lógica de recorrência:", error);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("recorrencia-logic.js", "inicializarLogicaRecorrencia", error);
        }
    }
};
{
    try
    {
        console.log("ðŸ”§ Inicializando lógica de recorrência...");

        // Esconder todos os campos exceto lstRecorrente no início
        esconderTodosCamposRecorrencia();

        // Definir valor padrío "Não" para lstRecorrente
        setTimeout(() =>
        {
            const lstRecorrenteElement = document.getElementById("lstRecorrente");
            if (lstRecorrenteElement && lstRecorrenteElement.ej2_instances)
            {
                const lstRecorrente = lstRecorrenteElement.ej2_instances[0];
                if (lstRecorrente)
                {
                    lstRecorrente.value = "N";
                    lstRecorrente.dataBind();
                    console.log("âœ… lstRecorrente definido como 'Não'");
                }
            }
        }, 100);

        // Configurar event handler para lstRecorrente
        configurarEventHandlerRecorrente();

        // Configurar event handler para lstPeriodos
        configurarEventHandlerPeriodo();

        console.log("âœ… Lógica de recorrência inicializada");

    } catch (error)
    {
        console.error("âŒ Erro ao inicializar lógica de recorrência:", error);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("recorrencia-logic.js", "inicializarLogicaRecorrencia", error);
        }
    }
};

/**
 * Esconde todos os campos de recorrência exceto lstRecorrente
 */
function esconderTodosCamposRecorrencia()
{
    try
    {
        const camposParaEsconder = [
            "divPeriodo",
            "divDias",
            "divDiaMes",
            "divFinalRecorrencia",
            "calendarContainer"
        ];

        camposParaEsconder.forEach(id =>
        {
            const elemento = document.getElementById(id);
            if (elemento)
            {
                // Usar setProperty com important para sobrescrever CSS
                elemento.style.setProperty('display', 'none', 'important');
            }
        });

        console.log("âœ… Todos os campos de recorrência escondidos (exceto lstRecorrente)");

    } catch (error)
    {
        console.error("âŒ Erro ao esconder campos:", error);
    }
}

/**
 * Configura o event handler para o dropdown lstRecorrente
 */
function configurarEventHandlerRecorrente()
{
    try
    {
        const lstRecorrenteElement = document.getElementById("lstRecorrente");

        if (!lstRecorrenteElement || !lstRecorrenteElement.ej2_instances)
        {
            console.warn("âš ï¸ lstRecorrente não encontrado");
            return;
        }

        const lstRecorrente = lstRecorrenteElement.ej2_instances[0];

        if (!lstRecorrente)
        {
            console.warn("âš ï¸ Instância lstRecorrente não encontrada");
            return;
        }

        // Configurar evento de mudança
        lstRecorrente.change = function (args)
        {
            aoMudarRecorrente(args);
        };

        console.log("âœ… Event handler lstRecorrente configurado");

    } catch (error)
    {
        console.error("âŒ Erro ao configurar event handler recorrente:", error);
    }
}

/**
 * Handler executado quando lstRecorrente muda
 */
function aoMudarRecorrente(args)
{
    try
    {
        console.log("ðŸ”„ lstRecorrente mudou - DEBUG COMPLETO:");
        console.log("   - args completo:", args);
        console.log("   - args.value:", args.value);
        console.log("   - args.itemData:", args.itemData);
        console.log("   - args.itemData?.RecorrenteId:", args.itemData?.RecorrenteId);
        console.log("   - args.itemData?.Descricao:", args.itemData?.Descricao);

        // ADICIONAR VERIFICAÇÃO DA FLAG
        if (window.ignorarEventosRecorrencia)
        {
            console.log("ðŸ“Œ Ignorando evento de recorrente (carregando dados)");
            return;
        }

        // Tentar múltiplas formas de pegar o valor
        const valor = args.value || args.itemData?.RecorrenteId || args.itemData?.Value;
        const descricao = args.itemData?.Descricao || args.itemData?.Text || "";

        console.log("   - Valor extraÃ­do:", valor);
        console.log("   - Descrição extraÃ­da:", descricao);

        const divPeriodo = document.getElementById("divPeriodo");
        console.log("   - divPeriodo existe?", divPeriodo ? "SIM" : "NÃO");

        // Limpar campos antes de mostrar/esconder
        limparCamposRecorrenciaAoMudar();

        // Verificar se é "Sim" de várias formas possíveis
        const ehSim = valor === "S" ||
            valor === "Sim" ||
            descricao === "Sim" ||
            descricao.toLowerCase() === "sim";

        console.log("   - Ã‰ SIM?", ehSim);

        if (ehSim) // Sim
        {
            console.log("   âœ… Selecionou SIM - Mostrar lstPeriodo");

            if (divPeriodo)
            {
                console.log("   â†’ Aplicando display:block no divPeriodo...");
                // Usar setProperty com important para sobrescrever CSS
                divPeriodo.style.setProperty('display', 'block', 'important');
                console.log("   â†’ Display aplicado. Valor atual:", window.getComputedStyle(divPeriodo).display);

                // Limpar valor do lstPeriodos
                const lstPeriodosElement = document.getElementById("lstPeriodos");
                if (lstPeriodosElement && lstPeriodosElement.ej2_instances)
                {
                    const lstPeriodos = lstPeriodosElement.ej2_instances[0];
                    if (lstPeriodos)
                    {
                        lstPeriodos.value = null;
                        lstPeriodos.dataBind();
                    }
                }
            }
            else
            {
                console.error("   âŒ divPeriodo NÃO FOI ENCONTRADO!");
            }
        }
        else // Não
        {
            console.log("   âŒ Selecionou NÃO - Esconder todos os campos");
            esconderTodosCamposRecorrencia();
        }

    } catch (error)
    {
        console.error("âŒ Erro em aoMudarRecorrente:", error);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("recorrencia-logic.js", "aoMudarRecorrente", error);
        }
    }
}

/**
 * Configura o event handler para o dropdown lstPeriodos
 */
function configurarEventHandlerPeriodo()
{
    try
    {
        console.log("ðŸ”§ Tentando configurar event handler de lstPeriodos...");

        // Tentar várias vezes até encontrar o controle
        let tentativas = 0;
        const maxTentativas = 10;

        const intervalo = setInterval(() =>
        {
            tentativas++;
            console.log(`   â†’ Tentativa ${tentativas}/${maxTentativas}...`);

            const lstPeriodosElement = document.getElementById("lstPeriodos");

            if (!lstPeriodosElement)
            {
                console.warn(`   âš ï¸ lstPeriodos não encontrado (tentativa ${tentativas})`);
                if (tentativas >= maxTentativas)
                {
                    clearInterval(intervalo);
                    console.error("   âŒ lstPeriodos não encontrado após todas tentativas");
                }
                return;
            }

            if (!lstPeriodosElement.ej2_instances || !lstPeriodosElement.ej2_instances[0])
            {
                console.warn(`   âš ï¸ lstPeriodos não inicializado ainda (tentativa ${tentativas})`);
                if (tentativas >= maxTentativas)
                {
                    clearInterval(intervalo);
                    console.error("   âŒ lstPeriodos não inicializado após todas tentativas");
                }
                return;
            }

            // Encontrou! Configurar o evento
            clearInterval(intervalo);

            const lstPeriodos = lstPeriodosElement.ej2_instances[0];

            console.log("   âœ… lstPeriodos encontrado! Configurando evento...");
            console.log("   ðŸ“‹ DataSource atual:", lstPeriodos.dataSource);

            // Remover evento anterior se existir
            lstPeriodos.change = null;

            // Configurar novo evento de mudança
            lstPeriodos.change = function (args)
            {
                console.log("ðŸŽ¯ EVENT HANDLER CHAMADO! lstPeriodos mudou!");
                aoMudarPeriodo(args);
            };

            console.log("   âœ… Event handler lstPeriodos configurado com sucesso!");

        }, 200); // Tentar a cada 200ms

    } catch (error)
    {
        console.error("âŒ Erro ao configurar event handler perí­odo:", error);
    }
}

/**
 * Handler executado quando lstPeriodos muda
 */
function aoMudarPeriodo(args)
{
    try
    {
        console.log("ðŸ”„ lstPeriodos mudou - DEBUG COMPLETO:");
        console.log("   - args completo:", args);
        console.log("   - args.value:", args.value);
        console.log("   - args.itemData:", args.itemData);

        // ADICIONAR VERIFICAÇÃO DA FLAG
        if (window.ignorarEventosRecorrencia)
        {
            console.log("ðŸ“Œ Ignorando evento de perí­odo (carregando dados)");
            return;
        }

        // Tentar múltiplas formas de pegar o valor
        const valor = args.value || args.itemData?.Value || args.itemData?.PeriodoId;
        const texto = args.itemData?.Text || args.itemData?.Periodo || "";

        console.log("   ðŸ“‹ Valor extraÃ­do:", valor);
        console.log("   ðŸ“‹ Texto extraÃ­do:", texto);

        // Esconder todos os campos especí­ficos primeiro
        console.log("   ðŸ§¹ Escondendo campos especí­ficos...");
        esconderCamposEspecificosPeriodo();

        // Mostrar campos baseado no perí­odo selecionado
        console.log("   ðŸ” Verificando qual perí­odo foi selecionado...");

        switch (valor)
        {
            case "D": // Diário
                console.log("   âž¡ï¸ Perí­odo: DIÃRIO - Mostrar apenas txtFinalRecorrencia");
                mostrarTxtFinalRecorrencia();
                break;

            case "S": // Semanal
            case "Q": // Quinzenal
                console.log("   âž¡ï¸ Perí­odo: SEMANAL/QUINZENAL - Mostrar lstDias + txtFinalRecorrencia");
                mostrarLstDias();
                mostrarTxtFinalRecorrencia();
                break;

            case "M": // Mensal
                console.log("   âž¡ï¸ Perí­odo: MENSAL - Mostrar lstDiasMes + txtFinalRecorrencia");
                mostrarLstDiasMes();
                mostrarTxtFinalRecorrencia();
                break;

            case "V": // Dias Variados
                console.log("   âž¡ï¸ Perí­odo: DIAS VARIADOS - Mostrar calendário com badge");
                mostrarCalendarioComBadge();
                break;

            default:
                console.log("   âš ï¸ Perí­odo não reconhecido:", valor, texto);
                console.log("   ðŸ’¡ Tentando pelo texto...");

                // Tentar pelo texto se o valor não for reconhecido
                const textoLower = texto.toLowerCase();

                if (textoLower.includes("diário") || textoLower.includes("diario"))
                {
                    console.log("   âž¡ï¸ Detectado pelo texto: DIÃRIO");
                    mostrarTxtFinalRecorrencia();
                }
                else if (textoLower.includes("semanal"))
                {
                    console.log("   âž¡ï¸ Detectado pelo texto: SEMANAL");
                    mostrarLstDias();
                    mostrarTxtFinalRecorrencia();
                }
                else if (textoLower.includes("quinzenal"))
                {
                    console.log("   âž¡ï¸ Detectado pelo texto: QUINZENAL");
                    mostrarLstDias();
                    mostrarTxtFinalRecorrencia();
                }
                else if (textoLower.includes("mensal"))
                {
                    console.log("   âž¡ï¸ Detectado pelo texto: MENSAL");
                    mostrarLstDiasMes();
                    mostrarTxtFinalRecorrencia();
                }
                else if (textoLower.includes("variado") || textoLower.includes("variada"))
                {
                    console.log("   âž¡ï¸ Detectado pelo texto: DIAS VARIADOS");
                    mostrarCalendarioComBadge();
                }
                else
                {
                    console.error("   âŒ Perí­odo não pôde ser identificado!");
                }
                break;
        }

        console.log("   âœ… aoMudarPeriodo concluÃ­do");

    } catch (error)
    {
        console.error("âŒ Erro em aoMudarPeriodo:", error);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("recorrencia-logic.js", "aoMudarPeriodo", error);
        }
    }
}

/**
 * Esconde campos especí­ficos de perí­odo
 */
function esconderCamposEspecificosPeriodo()
{
    // Remover classes de modo de recorrência variada
    document.body.classList.remove('modo-criacao-variada');
    document.body.classList.remove('modo-edicao-variada');

    const campos = [
        "divDias",
        "divDiaMes",
        "divFinalRecorrencia",
        "calendarContainer"
    ];

    campos.forEach(id =>
    {
        const elemento = document.getElementById(id);
        if (elemento)
        {
            // Usar setProperty com important para sobrescrever CSS
            elemento.style.setProperty('display', 'none', 'important');
        }
    });
}

/**
 * Mostra o campo txtFinalRecorrencia
 */
function mostrarTxtFinalRecorrencia()
{
    const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
    if (divFinalRecorrencia)
    {
        // Usar setProperty com important para sobrescrever CSS
        divFinalRecorrencia.style.setProperty('display', 'block', 'important');
        console.log("   âœ… txtFinalRecorrencia exibido");
    }
}

/**
 * Mostra o campo lstDias (multiselect de dias da semana)
 * ✅ CORRIGIDO: Agora chama inicialização para popular o dataSource
 */
function mostrarLstDias()
{
    try
    {
        const divDias = document.getElementById("divDias");
        if (divDias)
        {
            // Usar setProperty com important para sobrescrever CSS
            divDias.style.setProperty('display', 'block', 'important');
            console.log("   ✅ lstDias container exibido");

            // ✅ CRÍTICO: Chamar inicialização para popular os dias da semana
            setTimeout(() =>
            {
                if (typeof window.inicializarLstDias === 'function')
                {
                    const sucesso = window.inicializarLstDias();
                    if (sucesso)
                    {
                        console.log("   ✅ lstDias populado com dias da semana");
                    }
                    else
                    {
                        console.warn("   ⚠️ lstDias não pôde ser populado (controle não renderizado)");
                    }
                }
                else
                {
                    console.error("   ❌ Função window.inicializarLstDias não encontrada!");
                }
            }, 100); // Pequeno delay para garantir renderização
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("recorrencia-logic.js", "mostrarLstDias", error);
    }
}

/**
 * Mostra o campo lstDiasMes
 * ✅ CORRIGIDO: Agora chama inicialização para popular o dataSource
 */
function mostrarLstDiasMes()
{
    try
    {
        const divDiaMes = document.getElementById("divDiaMes");
        if (divDiaMes)
        {
            // Usar setProperty com important para sobrescrever CSS
            divDiaMes.style.setProperty('display', 'block', 'important');
            console.log("   ✅ lstDiasMes container exibido");

            // ✅ CRÍTICO: Chamar inicialização para popular os dias do mês
            setTimeout(() =>
            {
                if (typeof window.inicializarLstDiasMes === 'function')
                {
                    const sucesso = window.inicializarLstDiasMes();
                    if (sucesso)
                    {
                        console.log("   ✅ lstDiasMes populado com dias do mês");
                    }
                    else
                    {
                        console.warn("   ⚠️ lstDiasMes não pôde ser populado (controle não renderizado)");
                    }
                }
                else
                {
                    console.error("   ❌ Função window.inicializarLstDiasMes não encontrada!");
                }
            }, 100); // Pequeno delay para garantir renderização
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("recorrencia-logic.js", "mostrarLstDiasMes", error);
    }
}

var datasSelecionadas = []; // Array para armazenar datas selecionadas

function inicializarCalendarioSyncfusion()
{
    try
    {
        console.log("🔧 Inicializando calendário Syncfusion...");

        // Verificar se o elemento existe
        const calElement = document.getElementById('calDatasSelecionadas');
        if (!calElement)
        {
            console.error("❌ Elemento calDatasSelecionadas não encontrado!");
            return;
        }

        console.log("✅ Elemento calDatasSelecionadas encontrado");

        // Destruir calendário anterior se existir
        if (calendario)
        {
            console.log("♻️ Destruindo calendário anterior");
            try
            {
                calendario.destroy();
            } catch (e)
            {
                console.warn("⚠️ Erro ao destruir calendário anterior:", e);
            }
        }

        // Limpar o container
        $('#calDatasSelecionadas').empty();
        console.log("🧹 Container limpo");

        // Verificar se Syncfusion está disponível
        if (typeof ej === 'undefined' || !ej.calendars || !ej.calendars.Calendar)
        {
            console.error("❌ Syncfusion Calendar não está disponível!");
            return;
        }

        console.log("✅ Syncfusion Calendar disponível");

        // Criar novo calendário com seleção múltipla
        calendario = new ej.calendars.Calendar({
            value: new Date(),
            isMultiSelection: true,
            firstDayOfWeek: 0,
            values: datasSelecionadas,
            locale: 'pt-BR',
            format: 'dd/MM/yyyy',
            change: function (args)
            {
                datasSelecionadas = args.values || [];
                console.log("📅 Datas selecionadas:", datasSelecionadas);
                console.log("📊 Total de datas:", datasSelecionadas.length);

                // Atualizar badge com contador
                atualizarBadgeCalendario(datasSelecionadas.length);
            }
        });

        console.log("📅 Instância do calendário criada");

        // Anexar ao elemento
        calendario.appendTo('#calDatasSelecionadas');
        console.log("✅ Calendário Syncfusion anexado ao DOM");

        // Forçar exibição do elemento
        calElement.style.display = 'block';
        calElement.style.visibility = 'visible';

        console.log("✅ Calendário Syncfusion inicializado com sucesso!");

        // CRIAR BADGE APÓS o calendário ser renderizado
        setTimeout(function ()
        {
            criarBadgeVisual();
        }, 200);

    } catch (error)
    {
        console.error("❌ Erro ao inicializar calendário:", error);
        Alerta.TratamentoErroComLinha("recorrencia-logic.js", "inicializarCalendarioSyncfusion", error);
    }
}


function atualizarBadgeCalendario(quantidade)
{
    // Atualizar o texto do badge
    $('#badgeContadorDatas').text(quantidade);

    // Adicionar animação de pulse quando houver mudança
    $('#badgeContadorDatas').addClass('badge-pulse');
    setTimeout(function ()
    {
        $('#badgeContadorDatas').removeClass('badge-pulse');
    }, 300);

    console.log("ðŸ·ï¸ Badge atualizado:", quantidade);
}

/**
 * Mostra o calendário com badge para contagem de dias
 */
function mostrarCalendarioComBadge()
{
    try
    {
        console.log("📅 Iniciando mostrarCalendarioComBadge()");

        // Esconder outros containers primeiro
        const camposParaEsconder = ["divDias", "divDiaMes", "divFinalRecorrencia"];
        camposParaEsconder.forEach(id =>
        {
            const elemento = document.getElementById(id);
            if (elemento)
            {
                elemento.style.setProperty('display', 'none', 'important');
            }
        });

        console.log("✅ Outros campos escondidos");

        // Verificar se o container do calendário existe
        const calendarContainer = document.getElementById("calendarContainer");
        if (!calendarContainer)
        {
            console.error("❌ Elemento calendarContainer não encontrado!");
            return;
        }

        console.log("✅ Container do calendário encontrado");

        // Mostrar container do calendário com !important
        calendarContainer.style.setProperty('display', 'block', 'important');
        calendarContainer.style.setProperty('visibility', 'visible', 'important');
        console.log("✅ Container do calendário exibido");

        // Verificar se o elemento interno existe
        const calDatasSelecionadas = document.getElementById("calDatasSelecionadas");
        if (!calDatasSelecionadas)
        {
            console.error("❌ Elemento calDatasSelecionadas não encontrado!");
            return;
        }

        console.log("✅ Elemento calDatasSelecionadas encontrado");

        // Garantir que o elemento interno também está visível
        calDatasSelecionadas.style.setProperty('display', 'block', 'important');
        calDatasSelecionadas.style.setProperty('visibility', 'visible', 'important');

        // Configurar localização ANTES de inicializar
        if (typeof configurarLocalizacaoSyncfusion === 'function')
        {
            configurarLocalizacaoSyncfusion();
            console.log("✅ Localização configurada");
        }

        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() =>
        {
            // Inicializar o calendário Syncfusion
            inicializarCalendarioSyncfusion();
            console.log("✅ Calendário inicializado");
        }, 100);

        console.log("✅ mostrarCalendarioComBadge concluído");

    } catch (error)
    {
        console.error("❌ Erro em mostrarCalendarioComBadge:", error);
        Alerta.TratamentoErroComLinha("recorrencia-logic.js", "mostrarCalendarioComBadge", error);
    }
}


/**
 * Cria o badge visual no canto superior direito do calendário
 */
function criarBadgeVisual()
{
    console.log("ðŸ·ï¸ Criando badge...");

    // Remover badge antigo
    $('#badgeContadorDatas').remove();

    // Garantir que o container tenha position relative
    $('#calendarContainer').css({
        'position': 'relative',
        'overflow': 'visible' // â† IMPORTANTE: permitir que o badge saia do container
    });

    // Criar badge
    var badge = $('<div id="badgeContadorDatas">0</div>').css({
        'position': 'absolute',
        'width': '35px',
        'height': '35px',
        'border-radius': '50%',
        'background-color': '#FF8C00',
        'color': 'white',
        'border': '2px solid white',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'font-size': '14px',
        'font-weight': 'bold',
        'font-family': 'Arial, sans-serif',
        'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'z-index': '999999', // â† Z-index altí­ssimo
        'transition': 'all 0.3s ease',
        'cursor': 'default'
    });

    // Efeito hover
    badge.hover(
        function ()
        {
            $(this).css({
                'transform': 'scale(1.15)',
                'box-shadow': '0 4px 12px rgba(255, 140, 0, 0.5)'
            });
        },
        function ()
        {
            $(this).css({
                'transform': 'scale(1)',
                'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.3)'
            });
        }
    );

    // Adicionar badge ao container pai
    $('#calendarContainer').append(badge);

    // Aguardar o calendário renderizar completamente
    setTimeout(function ()
    {
        // Pegar a posição do calendário dentro do container
        var calElement = $('#calDatasSelecionadas');
        if (calElement.length > 0)
        {
            var calPos = calElement.position();
            var calWidth = calElement.outerWidth();

            // Posicionar badge na quina superior direita do calendário
            badge.css({
                'top': (calPos.top - 18) + 'px',
                'left': (calPos.left + calWidth - 18) + 'px'
            });

            console.log("âœ… Badge posicionado em:", {
                top: (calPos.top - 18) + 'px',
                left: (calPos.left + calWidth - 18) + 'px'
            });
        }
    }, 100);

    console.log("âœ… Badge criado!");
}

function posicionarBadge()
{
    var calPos = $('#calDatasSelecionadas').offset();
    var calWidth = $('#calDatasSelecionadas').outerWidth();

    $('#badgeContadorDatas').css({
        'position': 'fixed',
        'top': calPos.top + 10 + 'px',
        'left': (calPos.left + calWidth - 45) + 'px'
    });
}

// Reposicionar ao redimensionar janela
$(window).on('resize', posicionarBadge);

/**
 * Carrega dados CLDR dos arquivos locais
 */
function carregarCLDRLocal()
{
    console.log("ðŸŒ Carregando dados CLDR locais...");

    // Caminhos dos arquivos CLDR locais
    var cldrUrls = [
        'cldr/numberingSystems.json',
        'cldr/ca-gregorian.json',
        'cldr/numbers.json',
        'cldr/timeZoneNames.json',
        'cldr/weekData.json'
    ];

    var dadosCarregados = [];
    var carregamentosCompletos = 0;
    var totalArquivos = cldrUrls.length;

    // Função para carregar cada arquivo
    cldrUrls.forEach(function (caminho)
    {
        var ajax = new ej.base.Ajax(caminho, 'GET', true);

        ajax.onSuccess = function (response)
        {
            console.log("âœ… Arquivo carregado:", caminho);

            try
            {
                // Tentar fazer parse do JSON
                var dados = JSON.parse(response);
                dadosCarregados.push(dados);
                console.log("âœ… Parse bem-sucedido:", caminho);
            } catch (erro)
            {
                console.error("âŒ Erro ao fazer parse do JSON:", caminho);
                console.error("Erro detalhado:", erro.message);
                console.log("Conteíºdo recebido:", response.substring(0, 200)); // Primeiros 200 caracteres
            }

            carregamentosCompletos++;

            // Quando todos os arquivos forem carregados
            if (carregamentosCompletos === totalArquivos)
            {
                console.log("âœ… Total de arquivos processados:", dadosCarregados.length);
                aplicarCLDR(dadosCarregados);
            }
        };

        ajax.onFailure = function (error)
        {
            console.error("âŒ Erro ao carregar arquivo:", caminho, error);
            carregamentosCompletos++;

            // Continuar mesmo com erro
            if (carregamentosCompletos === totalArquivos)
            {
                aplicarCLDR(dadosCarregados);
            }
        };

        ajax.send();
    });
}
/**
 * Aplica os dados CLDR e carrega traduções
 */
function aplicarCLDR(dadosCarregados)
{
    console.log("ðŸ”§ Aplicando dados CLDR...");
    console.log("ðŸ“Š Arquivos carregados com sucesso:", dadosCarregados.length);

    // Verificar se temos dados para carregar
    if (dadosCarregados.length === 0)
    {
        console.error("âŒ Nenhum arquivo CLDR foi carregado corretamente!");
        console.log("âš ï¸ Usando configuração padrío en-US");
        ej.base.setCulture('en-US');
        inicializarCalendarioSyncfusion();
        return;
    }

    try
    {
        // Carregar dados no Syncfusion
        ej.base.loadCldr.apply(null, dadosCarregados);
        console.log("âœ… Dados CLDR aplicados com sucesso");

        // Definir cultura portuguesa
        ej.base.setCulture('pt');
        console.log("âœ… Cultura definida para 'pt'");

        // Carregar arquivo de tradução pt-BR.json
        carregarTraducoesPTBR();

    } catch (erro)
    {
        console.error("âŒ Erro ao aplicar CLDR:", erro);
        console.log("âš ï¸ Usando configuração padrío en-US");
        ej.base.setCulture('en-US');
        inicializarCalendarioSyncfusion();
    }
}

/**
 * Carrega arquivo de tradução pt-BR.json local
 */
function carregarTraducoesPTBR()
{
    console.log("ðŸ”¤ Carregando traduções pt-BR.json...");

    var ajax = new ej.base.Ajax('cldr/pt-BR.json', 'GET', true);

    ajax.onSuccess = function (response)
    {
        try
        {
            console.log("âœ… Traduções pt-BR carregadas");

            // Fazer parse do JSON
            var traducoes = JSON.parse(response);

            // Carregar traduções
            ej.base.L10n.load(traducoes);
            console.log("âœ… Traduções aplicadas com sucesso");

        } catch (erro)
        {
            console.error("âŒ Erro ao fazer parse do pt-BR.json:", erro.message);
            console.log("Conteíºdo recebido:", response.substring(0, 200));
        }

        // Inicializar calendário (com ou sem traduções)
        inicializarCalendarioSyncfusion();
    };

    ajax.onFailure = function (error)
    {
        console.warn("âš ï¸ Erro ao carregar pt-BR.json:", error);
        console.log("âš ï¸ Continuando sem traduções da interface...");

        // Continuar mesmo sem traduções
        inicializarCalendarioSyncfusion();
    };

    ajax.send();
}

/**
 * Configura a localização pt-BR no Syncfusion
 */
function configurarLocalizacaoSyncfusion()
{
    // Definir locale pt-BR
    ej.base.L10n.load({
        'pt-BR': {
            'calendar': {
                today: 'Hoje'
            }
        }
    });

    // Configurar cultura padrío
    ej.base.setCulture('pt-BR');
    ej.base.setCurrencyCode('BRL');
}

/**
 * Inicializa o calendário Syncfusion de seleção múltipla
 */
function inicializarCalendario()
{
    try
    {
        const calElement = document.getElementById("calDatasSelecionadas");

        if (!calElement)
        {
            console.error("âŒ Elemento calDatasSelecionadas não encontrado");
            return;
        }

        console.log("ðŸ”§ Criando instância do Calendar Syncfusion...");

        // Configurar locale português se ainda não foi
        if (ej.base && ej.base.L10n && ej.base.L10n.load)
        {
            ej.base.L10n.load({
                'pt-BR': {
                    'calendar': {
                        today: 'Hoje'
                    }
                }
            });
        }

        // Criar instância do Calendar com seleção múltipla
        const calendar = new ej.calendars.Calendar({
            // Permitir seleção múltipla
            isMultiSelection: true,

            // Valores iniciais vazios
            values: [],

            // Locale português
            locale: 'pt-BR',

            // Data mÃ­nima: hoje
            min: new Date(),

            // Evento de mudança
            change: function (args)
            {
                console.log("ðŸ“… Datas selecionadas:", args.values);
                atualizarBadgeContador();
            },

            // Renderização de células
            renderDayCell: function (args)
            {
                // Desabilitar datas passadas
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                if (args.date < hoje)
                {
                    args.isDisabled = true;
                }
            }
        });

        // Anexar ao elemento
        calendar.appendTo(calElement);

        console.log("âœ… Calendário inicializado com sucesso!");
        console.log("   ðŸ“‹ Tipo:", calendar.getModuleName());

    } catch (error)
    {
        console.error("âŒ Erro ao inicializar calendário:", error);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("recorrencia-logic.js", "inicializarCalendario", error);
        }
    }
}

/**
 * Cria o badge contador de dias selecionados
 */
function criarBadgeContador()
{
    try
    {
        // O badge deve ficar SOBRE O CALENDÁRIO, não sobre o container
        const calDatasSelecionadas = document.getElementById("calDatasSelecionadas");

        if (!calDatasSelecionadas)
        {
            console.warn("âš ï¸ Elemento calDatasSelecionadas não encontrado");
            return;
        }

        // Verificar se o badge já existe
        let badge = document.getElementById("badgeContadorDias");

        if (!badge)
        {
            // Criar novo badge
            badge = document.createElement("span");
            badge.id = "badgeContadorDias";
            badge.className = "badge-contador-dias";
            badge.textContent = "0";

            // Estilizar o badge
            badge.style.position = "absolute";
            badge.style.top = "-25px"; // Mais fora! (55% fora do calendário)
            badge.style.right = "-25px"; // Mais fora! (55% fora do calendário)
            badge.style.backgroundColor = "#ff8c00"; // Laranja
            badge.style.color = "white";
            badge.style.borderRadius = "50%";
            badge.style.width = "45px";
            badge.style.height = "45px";
            badge.style.display = "flex";
            badge.style.alignItems = "center";
            badge.style.justifyContent = "center";
            badge.style.fontSize = "18px";
            badge.style.fontWeight = "bold";
            badge.style.zIndex = "1000";
            badge.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
            badge.style.border = "3px solid white"; // Borda branca para destacar

            // Posicionar o calDatasSelecionadas como relative
            calDatasSelecionadas.style.position = "relative";

            // Adicionar o badge AO CALENDÁRIO (não ao container)
            calDatasSelecionadas.appendChild(badge);

            console.log("   âœ… Badge contador criado e posicionado sobre o calendário");
        }
        else
        {
            // Resetar contador se já existe
            badge.textContent = "0";
            console.log("   âœ… Badge resetado");
        }

    } catch (error)
    {
        console.error("âŒ Erro ao criar badge:", error);
    }
}

/**
 * Configura atualização automática do badge
 */
function configurarAtualizacaoBadge()
{
    try
    {
        const calDatasSelecionadasElement = document.getElementById("calDatasSelecionadas");

        if (!calDatasSelecionadasElement)
        {
            console.warn("âš ï¸ Elemento calDatasSelecionadas não encontrado no DOM");
            return;
        }

        if (!calDatasSelecionadasElement.ej2_instances || !calDatasSelecionadasElement.ej2_instances[0])
        {
            console.warn("âš ï¸ Calendário calDatasSelecionadas não está inicializado");
            console.log("ðŸ’¡ Isso é normal se o calendário ainda não foi renderizado");
            return;
        }

        const calendario = calDatasSelecionadasElement.ej2_instances[0];

        console.log("âœ… Calendário encontrado! Tipo:", calendario.getModuleName());

        // Interceptar o evento de mudança do calendário
        const changeOriginal = calendario.change;

        calendario.change = function (args)
        {
            // Executar função original se existir
            if (changeOriginal)
            {
                changeOriginal.call(calendario, args);
            }

            // Atualizar o badge
            atualizarBadgeContador();
        };

        console.log("   âœ… Atualização de badge configurada");

    } catch (error)
    {
        console.error("âŒ Erro ao configurar atualização de badge:", error);
    }
}

/**
 * Atualiza o número no badge de contador
 */
function atualizarBadgeContador()
{
    try
    {
        const badge = document.getElementById("badgeContadorDias");
        const calDatasSelecionadasElement = document.getElementById("calDatasSelecionadas");

        if (!badge)
        {
            console.warn("âš ï¸ Badge não encontrado");
            return;
        }

        if (!calDatasSelecionadasElement || !calDatasSelecionadasElement.ej2_instances)
        {
            console.warn("âš ï¸ Calendário não encontrado para atualizar badge");
            badge.textContent = "0";
            return;
        }

        const calendario = calDatasSelecionadasElement.ej2_instances[0];

        if (!calendario)
        {
            badge.textContent = "0";
            return;
        }

        // Contar datas selecionadas
        const datasSelecionadas = calendario.values || [];
        const quantidade = datasSelecionadas.length;

        // Atualizar badge
        badge.textContent = quantidade.toString();

        console.log(`   ðŸ“Š Badge atualizado: ${quantidade} dias selecionados`);

    } catch (error)
    {
        console.error("âŒ Erro ao atualizar badge:", error);
    }
}

/**
 * Limpa valores dos campos ao mudar lstRecorrente
 */
function limparCamposRecorrenciaAoMudar()
{
    try
    {
        // Limpar lstPeriodos
        const lstPeriodosElement = document.getElementById("lstPeriodos");
        if (lstPeriodosElement && lstPeriodosElement.ej2_instances)
        {
            const lstPeriodos = lstPeriodosElement.ej2_instances[0];
            if (lstPeriodos)
            {
                lstPeriodos.value = null;
                lstPeriodos.dataBind();
            }
        }

        // Limpar lstDias
        const lstDiasElement = document.getElementById("lstDias");
        if (lstDiasElement && lstDiasElement.ej2_instances)
        {
            const lstDias = lstDiasElement.ej2_instances[0];
            if (lstDias)
            {
                lstDias.value = [];
                lstDias.dataBind();
            }
        }

        // Limpar lstDiasMes
        const lstDiasMesElement = document.getElementById("lstDiasMes");
        if (lstDiasMesElement && lstDiasMesElement.ej2_instances)
        {
            const lstDiasMes = lstDiasMesElement.ej2_instances[0];
            if (lstDiasMes)
            {
                lstDiasMes.value = null;
                lstDiasMes.dataBind();
            }
        }

        // Limpar txtFinalRecorrencia
        const txtFinalRecorrenciaElement = document.getElementById("txtFinalRecorrencia");
        if (txtFinalRecorrenciaElement && txtFinalRecorrenciaElement.ej2_instances)
        {
            const txtFinalRecorrencia = txtFinalRecorrenciaElement.ej2_instances[0];
            if (txtFinalRecorrencia)
            {
                txtFinalRecorrencia.value = null;
                txtFinalRecorrencia.dataBind();
            }
        }

        // Limpar calendário
        const calDatasSelecionadasElement = document.getElementById("calDatasSelecionadas");
        if (calDatasSelecionadasElement && calDatasSelecionadasElement.ej2_instances)
        {
            const calendario = calDatasSelecionadasElement.ej2_instances[0];
            if (calendario)
            {
                calendario.values = [];
                calendario.dataBind();
            }
        }

        // Resetar badge
        const badge = document.getElementById("badgeContadorDias");
        if (badge)
        {
            badge.textContent = "0";
        }

    } catch (error)
    {
        console.error("âŒ Erro ao limpar campos:", error);
    }
}

// ====================================================================
// INICIALIZAÇÃO AUTOMÃTICA
// ====================================================================

// Chamar inicialização quando o documento estiver pronto
if (document.readyState === 'loading')
{
    document.addEventListener('DOMContentLoaded', () =>
    {
        // Aguardar um pouco para garantir que os controles Syncfusion foram renderizados
        setTimeout(() =>
        {
            window.inicializarLogicaRecorrencia();
        }, 1000);
    });
}
else
{
    // Documento já carregado
    setTimeout(() =>
    {
        window.inicializarLogicaRecorrencia();
    }, 1000);
}
