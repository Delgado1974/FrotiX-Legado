// ===============================================================
// SISTEMA DE EVENTO - COMPLETO E CORRIGIDO
// Arquivo: wwwroot/js/agendamento/components/evento.js
// ===============================================================

/**
 * Inicializa o sistema de evento
 * Chame esta função no final da ExibeViagem
 */
function inicializarSistemaEvento()
{
    console.log("🎯 Inicializando Sistema de Evento...");

    // 1. Monitora mudanças na finalidade
    configurarMonitoramentoFinalidade();

    // 2. Configura o botão "Novo Evento"
    configurarBotaoNovoEvento();

    // 3. Configura botões do formulário de cadastro
    configurarBotoesCadastroEvento();

    // 4. Configura evento select do requisitante de evento
    configurarRequisitanteEvento();

    console.log("✅ Sistema de Evento inicializado!");
}

/**
 * Monitora a lista de Finalidades
 */
function configurarMonitoramentoFinalidade()
{
    const lstFinalidade = document.getElementById("lstFinalidade");

    if (!lstFinalidade)
    {
        console.warn("⚠️ lstFinalidade não encontrado");
        return;
    }

    // Verifica se é componente Syncfusion
    if (lstFinalidade.ej2_instances && lstFinalidade.ej2_instances[0])
    {
        const dropdown = lstFinalidade.ej2_instances[0];

        // Adiciona listener para SELECT (dispara imediatamente ao clicar)
        dropdown.select = function (args)
        {
            console.log("🎯 Finalidade SELECIONADA (select event):", args.itemData);

            // Pega o texto da finalidade
            const finalidade = args.itemData?.text || args.itemData?.Descricao || args.itemData?.FinalidadeId || "";

            console.log("🔍 Processando:", finalidade);
            controlarVisibilidadeSecaoEvento(finalidade);
        };

        // TAMBÉM adiciona listener para CHANGE (backup para casos de programático)
        dropdown.change = function (args)
        {
            console.log("🔄 Finalidade mudou (change event):", args.value);
            controlarVisibilidadeSecaoEvento(args.value);
        };

        console.log("✅ Listener de Finalidade configurado (SELECT + CHANGE)");

        // Verifica estado inicial
        const valorAtual = dropdown.value;
        if (valorAtual)
        {
            controlarVisibilidadeSecaoEvento(valorAtual);
        }
    } else
    {
        console.warn("⚠️ lstFinalidade não é componente EJ2");
    }
}

/**
 * Configura o evento select do requisitante de evento
 * para preencher automaticamente o setor
 */
function configurarRequisitanteEvento()
{
    console.log("🔧 === INÍCIO configurarRequisitanteEvento ===");

    // Função para tentar configurar
    const tentarConfigurar = (tentativa = 1) =>
    {
        console.log(`🔄 Tentativa ${tentativa} de configurar requisitante de evento...`);

        const lstRequisitanteEvento = document.getElementById("lstRequisitanteEvento");

        if (!lstRequisitanteEvento)
        {
            console.warn(`⚠️ lstRequisitanteEvento não encontrado no DOM (tentativa ${tentativa})`);

            if (tentativa < 5)
            {
                console.log(`   ⏰ Tentando novamente em 300ms...`);
                setTimeout(() => tentarConfigurar(tentativa + 1), 300);
            }
            else
            {
                console.error('❌ lstRequisitanteEvento não encontrado após 5 tentativas');
            }
            return;
        }

        console.log('✅ Elemento lstRequisitanteEvento encontrado');

        // Verifica se é componente Syncfusion
        if (lstRequisitanteEvento.ej2_instances && lstRequisitanteEvento.ej2_instances[0])
        {
            const dropdown = lstRequisitanteEvento.ej2_instances[0];

            console.log('✅ Componente Syncfusion encontrado:');
            console.log('   - Tipo:', dropdown.constructor.name);
            console.log('   - Value atual:', dropdown.value);
            console.log('   - Text atual:', dropdown.text);
            console.log('   - DataSource:', dropdown.dataSource);

            // Verifica se já tem um listener
            if (dropdown.select)
            {
                console.log('⚠️ Listener select já existe, será substituído');
            }

            // Configura o listener select
            dropdown.select = function (args)
            {
                console.log('🔔 [LISTENER] Select disparado no lstRequisitanteEvento:');
                console.log('   - isInteraction:', args.isInteraction);
                console.log('   - itemData:', args.itemData);
                console.log('   - value:', args.e?.target?.value);

                // Chama a função global
                if (typeof window.onSelectRequisitanteEvento === 'function')
                {
                    window.onSelectRequisitanteEvento(args);
                }
            };

            console.log('✅ Listener de select configurado com sucesso!');
            console.log('🔧 === FIM configurarRequisitanteEvento ===');
        }
        else
        {
            console.warn(`⚠️ lstRequisitanteEvento não é componente Syncfusion (tentativa ${tentativa})`);

            if (tentativa < 5)
            {
                console.log(`   ⏰ Tentando novamente em 300ms...`);
                setTimeout(() => tentarConfigurar(tentativa + 1), 300);
            }
            else
            {
                console.error('❌ lstRequisitanteEvento não inicializado após 5 tentativas');
                console.log('🔧 === FIM configurarRequisitanteEvento (FALHOU) ===');
            }
        }
    };

    // Inicia as tentativas
    tentarConfigurar();
}

/**
 * ================================================================
 * NOVA FUNÇÃO: Atualiza campos quando Requisitante Evento é selecionado
 * Esta função é chamada pelo listener em configurarRequisitanteEvento()
 * ================================================================
 */
window.onSelectRequisitanteEvento = function (args)
{
    console.log('🎯 Requisitante de Evento selecionado!');
    console.log('   itemData:', args.itemData);

    try
    {
        // Validação - aceita tanto id quanto RequisitanteId
        const requisitanteId = args.itemData?.id || args.itemData?.RequisitanteId;

        if (!args || !args.itemData || !requisitanteId)
        {
            console.warn('⚠️ Dados inválidos do requisitante');
            console.log('   id:', args.itemData?.id);
            console.log('   RequisitanteId:', args.itemData?.RequisitanteId);
            return;
        }

        console.log('✅ Requisitante ID:', requisitanteId);

        // BUSCAR SETOR DO REQUISITANTE
        $.ajax({
            url: "/Viagens/Upsert?handler=PegaSetor",
            method: "GET",
            dataType: "json",
            data: { id: requisitanteId },
            success: function (res)
            {
                console.log('📦 Resposta do servidor (Setor):', res);

                try
                {
                    // A resposta pode vir como {data: 'id'} ou {success: true, data: 'id'}
                    const setorId = res.data || (res.success && res.data);

                    if (setorId)
                    {
                        const lstSetorEvento = document.getElementById("lstSetorRequisitanteEvento");

                        if (!lstSetorEvento)
                        {
                            console.error('❌ lstSetorRequisitanteEvento não encontrado no DOM');
                            return;
                        }

                        if (!lstSetorEvento.ej2_instances || !lstSetorEvento.ej2_instances[0])
                        {
                            console.error('❌ lstSetorRequisitanteEvento não está inicializado');
                            return;
                        }

                        const dropdownSetor = lstSetorEvento.ej2_instances[0];

                        // Seta o valor do setor
                        dropdownSetor.value = [setorId];
                        dropdownSetor.dataBind();

                        console.log('✅ Setor atualizado:', setorId);
                    }
                    else
                    {
                        console.warn('⚠️ Setor não encontrado na resposta');

                        // Limpa o campo se não houver setor
                        const lstSetorEvento = document.getElementById("lstSetorRequisitanteEvento");
                        if (lstSetorEvento?.ej2_instances?.[0])
                        {
                            lstSetorEvento.ej2_instances[0].value = null;
                            lstSetorEvento.ej2_instances[0].dataBind();
                        }
                    }
                }
                catch (error)
                {
                    console.error('❌ Erro ao setar setor:', error);
                    Alerta.TratamentoErroComLinha('evento.js', 'onSelectRequisitanteEvento.setor', error);
                }
            },
            error: function (xhr, status, error)
            {
                console.error('❌ Erro ao buscar setor:', { xhr, status, error });
                Alerta.TratamentoErroComLinha('evento.js', 'onSelectRequisitanteEvento.ajax.setor', error);

                // Limpa o campo em caso de erro
                const lstSetorEvento = document.getElementById("lstSetorRequisitanteEvento");
                if (lstSetorEvento?.ej2_instances?.[0])
                {
                    lstSetorEvento.ej2_instances[0].value = null;
                    lstSetorEvento.ej2_instances[0].dataBind();
                }
            }
        });
    }
    catch (error)
    {
        console.error('❌ Erro geral em onSelectRequisitanteEvento:', error);
        Alerta.TratamentoErroComLinha('evento.js', 'onSelectRequisitanteEvento', error);
    }
};


/**
 * Controla a visibilidade da seção de evento
 * param {string|Array} finalidade - Valor da finalidade
 */
function controlarVisibilidadeSecaoEvento(finalidade)
{
    const sectionEvento = document.getElementById("sectionEvento");
    const sectionCadastro = document.getElementById("sectionCadastroEvento");

    if (!sectionEvento)
    {
        console.warn("⚠️ sectionEvento não encontrado");
        return;
    }

    // Verifica se "Evento" está selecionado
    let isEvento = false;

    if (Array.isArray(finalidade))
    {
        isEvento = finalidade.some(f =>
            f === "Evento" || f === "E" ||
            (f && f.toLowerCase && f.toLowerCase() === "evento")
        );
    } else
    {
        isEvento = finalidade === "Evento" ||
            finalidade === "E" ||
            (finalidade && finalidade.toLowerCase && finalidade.toLowerCase() === "evento");
    }

    // Mostra ou oculta as seções
    if (isEvento)
    {
        console.log("✅ Mostrando seção de Evento");
        sectionEvento.style.display = "block";
    } else
    {
        console.log("➖ Ocultando seções de Evento");
        sectionEvento.style.display = "none";

        // Oculta também o cadastro se estiver aberto
        if (sectionCadastro)
        {
            sectionCadastro.style.display = "none";
        }
    }
}

/**
 * Configura o botão "Novo Evento"
 */
function configurarBotaoNovoEvento()
{
    const btnEvento = document.getElementById("btnEvento");

    if (!btnEvento)
    {
        console.warn("⚠️ btnEvento não encontrado");
        return;
    }

    // Remove listeners anteriores
    const novoBotao = btnEvento.cloneNode(true);
    btnEvento.parentNode.replaceChild(novoBotao, btnEvento);

    // Adiciona novo listener para TOGGLE
    novoBotao.addEventListener("click", function (e)
    {
        e.preventDefault();
        e.stopPropagation();

        const sectionCadastro = document.getElementById("sectionCadastroEvento");

        if (!sectionCadastro)
        {
            console.warn("⚠️ sectionCadastroEvento não encontrado");
            return;
        }

        // TOGGLE: Se está visível, fecha. Se está oculto, abre.
        if (sectionCadastro.style.display === "none" || !sectionCadastro.style.display)
        {
            console.log("🆕 Abrindo formulário de cadastro");
            abrirFormularioCadastroEvento();
        } else
        {
            console.log("➖ Fechando formulário de cadastro");
            fecharFormularioCadastroEvento();
        }
    });

    console.log("✅ Botão Novo Evento configurado (modo TOGGLE)");
}

/**
 * Abre o formulário de cadastro de evento
 */
function abrirFormularioCadastroEvento()
{
    const sectionCadastro = document.getElementById("sectionCadastroEvento");

    if (!sectionCadastro)
    {
        console.warn("⚠️ sectionCadastroEvento não encontrado");
        return;
    }

    // Limpa os campos
    limparCamposCadastroEvento();

    // Mostra a seção
    sectionCadastro.style.display = "block";

    // Scroll suave
    sectionCadastro.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Foca no primeiro campo
    setTimeout(() =>
    {
        const txtNome = document.getElementById("txtNomeEvento");
        if (txtNome)
        {
            txtNome.focus();
        }
    }, 300);
}

/**
 * Fecha o formulário de cadastro
 */
function fecharFormularioCadastroEvento()
{
    const sectionCadastro = document.getElementById("sectionCadastroEvento");

    if (sectionCadastro)
    {
        sectionCadastro.style.display = "none";
        limparCamposCadastroEvento();
        console.log("➖ Formulário de cadastro fechado");
    }
}

/**
 * Configura os botões do formulário de cadastro
 */
function configurarBotoesCadastroEvento()
{
    // Botão Salvar Evento (Inserir)
    const btnInserir = document.getElementById("btnInserirEvento");
    if (btnInserir)
    {
        // Aplicar classe e ícone corretos
        btnInserir.className = "btn btn-azul";
        btnInserir.innerHTML = '<i class="fa-regular fa-thumbs-up"></i> Salvar Evento';

        const novoBtnInserir = btnInserir.cloneNode(true);
        btnInserir.parentNode.replaceChild(novoBtnInserir, btnInserir);

        novoBtnInserir.addEventListener("click", function ()
        {
            console.log("💾 Inserindo evento...");
            inserirNovoEvento();
        });
    }

    // Botão Cancelar
    const btnCancelar = document.getElementById("btnCancelarEvento");
    if (btnCancelar)
    {
        // Aplicar classe e ícone corretos
        btnCancelar.className = "btn btn-vinho";
        btnCancelar.innerHTML = '<i class="fa-regular fa-circle-xmark"></i> Cancelar';

        const novoBtnCancelar = btnCancelar.cloneNode(true);
        btnCancelar.parentNode.replaceChild(novoBtnCancelar, btnCancelar);

        novoBtnCancelar.addEventListener("click", function ()
        {
            console.log("❌ Cancelando cadastro");
            fecharFormularioCadastroEvento();
        });
    }

    console.log("✅ Botões do formulário configurados com estilos corretos");
}

/**
 * Limpa todos os campos do formulário de cadastro
 */
function limparCamposCadastroEvento()
{
    try
    {
        console.log("🧹 Limpando campos do formulário...");

        // Campos de texto simples
        const txtNome = document.getElementById("txtNomeEvento");
        if (txtNome) txtNome.value = "";

        const txtDescricao = document.getElementById("txtDescricaoEvento");
        if (txtDescricao) txtDescricao.value = "";

        // DatePickers Syncfusion
        const txtDataInicial = document.getElementById("txtDataInicialEvento");
        if (txtDataInicial?.ej2_instances?.[0])
        {
            txtDataInicial.ej2_instances[0].value = null;
        }

        const txtDataFinal = document.getElementById("txtDataFinalEvento");
        if (txtDataFinal?.ej2_instances?.[0])
        {
            txtDataFinal.ej2_instances[0].value = null;
        }

        // NumericTextBox (quantidade)
        const txtQuantidade = document.getElementById("txtQtdParticipantesEventoCadastro");
        if (txtQuantidade?.ej2_instances?.[0])
        {
            txtQuantidade.ej2_instances[0].value = 0;
        }

        // DropDownTree (requisitante)
        const lstRequisitante = document.getElementById("lstRequisitanteEvento");
        if (lstRequisitante?.ej2_instances?.[0])
        {
            lstRequisitante.ej2_instances[0].value = null;
        }

        // DropDownTree (setor)
        const lstSetor = document.getElementById("lstSetorRequisitanteEvento");
        if (lstSetor?.ej2_instances?.[0])
        {
            lstSetor.ej2_instances[0].value = null;
        }

        console.log("✅ Campos limpos com sucesso");

    } catch (error)
    {
        console.error("❌ Erro ao limpar campos:", error);
        Alerta.TratamentoErroComLinha("evento.js", "limparCamposCadastroEvento", error);
    }
}

/**
 * Insere um novo evento no banco de dados
 * Adaptado do código de ViagemUpsert.js
 */
function inserirNovoEvento()
{
    try
    {
        console.log("💾 Iniciando inserção de evento...");

        // Validação de campos obrigatórios
        const txtNome = document.getElementById("txtNomeEvento");
        const txtDescricao = document.getElementById("txtDescricaoEvento");
        const txtDataInicial = document.getElementById("txtDataInicialEvento");
        const txtDataFinal = document.getElementById("txtDataFinalEvento");
        const txtQuantidade = document.getElementById("txtQtdParticipantesEventoCadastro");

        if (!txtNome || !txtNome.value.trim())
        {
            Alerta.Alerta("Atenção", "O Nome do Evento é obrigatório!");
            return;
        }

        if (!txtDescricao || !txtDescricao.value.trim())
        {
            Alerta.Alerta("Atenção", "A Descrição do Evento é obrigatória!");
            return;
        }

        // Pega os DatePickers
        const dataInicialPicker = txtDataInicial?.ej2_instances?.[0];
        const dataFinalPicker = txtDataFinal?.ej2_instances?.[0];

        if (!dataInicialPicker || !dataInicialPicker.value)
        {
            Alerta.Alerta("Atenção", "A Data Inicial é obrigatória!");
            return;
        }

        if (!dataFinalPicker || !dataFinalPicker.value)
        {
            Alerta.Alerta("Atenção", "A Data Final é obrigatória!");
            return;
        }

        // Validação: Data Inicial não pode ser maior que Data Final
        const dataInicial = new Date(dataInicialPicker.value);
        const dataFinal = new Date(dataFinalPicker.value);

        if (dataInicial > dataFinal)
        {
            Alerta.Alerta("Atenção", "A Data Inicial não pode ser maior que a Data Final!");
            // Limpa o campo Data Final
            dataFinalPicker.value = null;
            return;
        }

        // Pega quantidade
        const quantidadePicker = txtQuantidade?.ej2_instances?.[0];
        const quantidade = quantidadePicker?.value || 0;

        if (!quantidade || quantidade <= 0)
        {
            Alerta.Alerta("Atenção", "A Quantidade de Participantes é obrigatória!");
            return;
        }

        // Validação: Quantidade deve ser número inteiro
        if (!Number.isInteger(quantidade) || quantidade > 2147483647)
        {
            Alerta.Alerta("Atenção", "A Quantidade de Participantes deve ser um número inteiro válido (máximo: 2.147.483.647)!");
            // Limpa o campo de quantidade
            quantidadePicker.value = null;
            return;
        }

        // Pega setor e requisitante
        const lstSetor = document.getElementById("lstSetorRequisitanteEvento");
        const lstRequisitante = document.getElementById("lstRequisitanteEvento");

        if (!lstSetor?.ej2_instances?.[0] || !lstSetor.ej2_instances[0].value)
        {
            Alerta.Alerta("Atenção", "O Setor é obrigatório!");
            return;
        }

        if (!lstRequisitante?.ej2_instances?.[0] || !lstRequisitante.ej2_instances[0].value)
        {
            Alerta.Alerta("Atenção", "O Requisitante é obrigatório!");
            return;
        }

        const setorId = lstSetor.ej2_instances[0].value.toString();
        const requisitanteId = lstRequisitante.ej2_instances[0].value.toString();

        // Prepara objeto para envio
        const objEvento = {
            Nome: txtNome.value.trim(),
            Descricao: txtDescricao.value.trim(),
            SetorSolicitanteId: setorId,
            RequisitanteId: requisitanteId,
            QtdParticipantes: quantidade,
            DataInicial: moment(dataInicialPicker.value).format("MM-DD-YYYY"),
            DataFinal: moment(dataFinalPicker.value).format("MM-DD-YYYY"),
            Status: "1"
        };

        console.log("📦 Objeto a ser enviado:", objEvento);

        // Envia via AJAX
        $.ajax({
            type: "POST",
            url: "/api/Viagem/AdicionarEvento",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(objEvento),
            success: function (data)
            {
                try
                {
                    console.log("✅ Resposta do servidor:", data);

                    if (data.success)
                    {
                        // Mostra mensagem de sucesso
                        AppToast.show('Verde', data.message);

                        // Atualiza a lista de eventos com o novo evento
                        atualizarListaEventos(data.eventoId, data.eventoText);

                        // Fecha o formulário
                        fecharFormularioCadastroEvento();

                        console.log("✅ Evento inserido com sucesso!");
                    }
                    else
                    {
                        Alerta.Alerta("Erro", data.message || "Erro ao adicionar evento");
                    }
                }
                catch (error)
                {
                    console.error("❌ Erro no success do AJAX:", error);
                    Alerta.TratamentoErroComLinha("evento.js", "ajax.AdicionarEvento.success", error);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                try
                {
                    console.error("❌ Erro na requisição AJAX:", errorThrown);
                    console.error("   Status:", textStatus);
                    console.error("   Response:", jqXHR.responseText);

                    Alerta.Alerta("Erro", "Erro ao adicionar evento no servidor");
                }
                catch (error)
                {
                    console.error("❌ Erro no error handler:", error);
                    Alerta.TratamentoErroComLinha("evento.js", "ajax.AdicionarEvento.error", error);
                }
            }
        });

    }
    catch (error)
    {
        console.error("❌ Erro ao inserir evento:", error);
        Alerta.TratamentoErroComLinha("evento.js", "inserirNovoEvento", error);
    }
}

/**
 * Atualiza a lista de eventos após adicionar um novo
 * param {string} eventoId - ID do evento recém-criado
 * param {string} eventoText - Nome do evento recém-criado
 */
function atualizarListaEventos(eventoId, eventoText)
{
    try
    {
        console.log("🔄 Atualizando lista de eventos...");
        console.log("   EventoId:", eventoId);
        console.log("   EventoText:", eventoText);

        const lstEventos = document.getElementById("lstEventos");

        if (!lstEventos || !lstEventos.ej2_instances || !lstEventos.ej2_instances[0])
        {
            console.error("❌ lstEventos não encontrado ou não é componente EJ2");
            return;
        }

        const comboBox = lstEventos.ej2_instances[0];

        // Cria o novo item com a estrutura correta
        const novoItem = {
            EventoId: eventoId,
            Evento: eventoText
        };

        console.log("📦 Novo item a ser adicionado:", novoItem);

        // MÉTODO 1: Usar addItem do Syncfusion
        try
        {
            comboBox.addItem(novoItem);
            console.log("✅ Item adicionado usando addItem()");
        }
        catch (e)
        {
            console.warn("⚠️ addItem() falhou, tentando método alternativo:", e);

            // MÉTODO 2: Manipular dataSource diretamente
            let dataSource = comboBox.dataSource || [];

            if (!Array.isArray(dataSource))
            {
                dataSource = [];
            }

            const jaExiste = dataSource.some(item => item.EventoId === eventoId);

            if (!jaExiste)
            {
                dataSource.push(novoItem);
                comboBox.dataSource = dataSource;
                console.log("✅ Item adicionado ao dataSource manualmente");
            }
        }

        // Aguarda o componente processar
        setTimeout(() =>
        {
            console.log("🔄 Selecionando novo evento...");

            // Define o valor
            comboBox.value = eventoId;

            // Força a atualização visual
            comboBox.dataBind();

            console.log("✅ Evento selecionado");
            console.log("   Value:", comboBox.value);
            console.log("   Text:", comboBox.text);

            // Aguarda mais um pouco antes de buscar dados
            setTimeout(() =>
            {
                // Buscar e exibir os dados do evento
                if (typeof window.exibirDadosEvento === 'function')
                {
                    console.log("🔍 Chamando window.exibirDadosEvento...");
                    window.exibirDadosEvento(novoItem);
                }
                else if (typeof exibirDadosEvento === 'function')
                {
                    console.log("🔍 Chamando exibirDadosEvento...");
                    exibirDadosEvento(novoItem);
                }
                else
                {
                    console.warn("⚠️ Função exibirDadosEvento não encontrada");
                }
            }, 100);

        }, 250);

        console.log("✅ Processo de atualização iniciado");

    }
    catch (error)
    {
        console.error("❌ Erro ao atualizar lista de eventos:", error);
        Alerta.TratamentoErroComLinha("evento.js", "atualizarListaEventos", error);
    }
}

// ===============================================================
// DIAGNÓSTICO - Use no console para debugar
// ===============================================================

/**
 * Diagnóstico completo do sistema de evento
 */
function diagnosticarSistemaEvento()
{
    console.log("=== DIAGNÓSTICO DO SISTEMA DE EVENTO ===");

    const sectionEvento = document.getElementById("sectionEvento");
    console.log("1. sectionEvento existe?", !!sectionEvento);
    if (sectionEvento)
    {
        console.log("   - Display:", sectionEvento.style.display);
        console.log("   - Visível?", sectionEvento.offsetWidth > 0 && sectionEvento.offsetHeight > 0);
    }

    const sectionCadastro = document.getElementById("sectionCadastroEvento");
    console.log("2. sectionCadastroEvento existe?", !!sectionCadastro);
    if (sectionCadastro)
    {
        console.log("   - Display:", sectionCadastro.style.display);
        console.log("   - Visível?", sectionCadastro.offsetWidth > 0 && sectionCadastro.offsetHeight > 0);
    }

    const lstFinalidade = document.getElementById("lstFinalidade");
    console.log("3. lstFinalidade existe?", !!lstFinalidade);
    if (lstFinalidade?.ej2_instances)
    {
        console.log("   - É componente EJ2?", true);
        console.log("   - Valor atual:", lstFinalidade.ej2_instances[0].value);
    }

    const lstEventos = document.getElementById("lstEventos");
    console.log("4. lstEventos existe?", !!lstEventos);
    if (lstEventos?.ej2_instances)
    {
        console.log("   - É componente EJ2?", true);
        console.log("   - DataSource:", lstEventos.ej2_instances[0].dataSource);
        console.log("   - Quantidade de itens:", lstEventos.ej2_instances[0].dataSource?.length || 0);
    }

    const btnEvento = document.getElementById("btnEvento");
    console.log("5. btnEvento existe?", !!btnEvento);
    if (btnEvento)
    {
        console.log("   - Display:", window.getComputedStyle(btnEvento).display);
        console.log("   - Visível?", btnEvento.offsetWidth > 0 && btnEvento.offsetHeight > 0);
        console.log("   - Dimensões:", btnEvento.offsetWidth + "x" + btnEvento.offsetHeight);
    }

    const btnInserir = document.getElementById("btnInserirEvento");
    console.log("6. btnInserirEvento existe?", !!btnInserir);

    const btnCancelar = document.getElementById("btnCancelarEvento");
    console.log("7. btnCancelarEvento existe?", !!btnCancelar);

    console.log("=== FIM DO DIAGNÓSTICO ===");
}

/**
 * Testa mostrar a seção de evento
 */
function testarMostrarSecaoEvento()
{
    console.log("🧪 Teste: Mostrando seção de evento");
    controlarVisibilidadeSecaoEvento("Evento");
}

/**
 * Testa ocultar a seção de evento
 */
function testarOcultarSecaoEvento()
{
    console.log("🧪 Teste: Ocultando seção de evento");
    controlarVisibilidadeSecaoEvento("Transporte");
}

/**
 * Testa abrir o formulário de cadastro
 */
function testarAbrirFormulario()
{
    console.log("🧪 Teste: Abrindo formulário de cadastro");
    abrirFormularioCadastroEvento();
}

/**
 * Testa fechar o formulário de cadastro
 */
function testarFecharFormulario()
{
    console.log("🧪 Teste: Fechando formulário de cadastro");
    fecharFormularioCadastroEvento();
}

/**
 * Testa limpar campos do formulário
 */
function testarLimparCampos()
{
    console.log("🧪 Teste: Limpando campos");
    limparCamposCadastroEvento();
}

/**
 * Verifica se todos os elementos necessários existem
 */
function verificarElementosEvento()
{
    console.log("=== VERIFICAÇÃO DE ELEMENTOS ===");

    const elementos = [
        "sectionEvento",
        "sectionCadastroEvento",
        "lstEventos",
        "btnEvento",
        "txtNomeEvento",
        "txtDescricaoEvento",
        "txtDataInicialEvento",
        "txtDataFinalEvento",
        "txtQtdParticipantesEventoCadastro",
        "lstRequisitanteEvento",
        "lstSetorRequisitanteEvento",
        "btnInserirEvento",
        "btnCancelarEvento"
    ];

    let todosExistem = true;

    elementos.forEach(id =>
    {
        const elemento = document.getElementById(id);
        const existe = !!elemento;
        console.log(existe ? "✅" : "❌", id, "existe?", existe);
        if (!existe) todosExistem = false;
    });

    console.log("=== FIM DA VERIFICAÇÃO ===");
    console.log(todosExistem ? "✅ Todos os elementos existem!" : "⚠️ Alguns elementos estão faltando!");

    return todosExistem;
}

// ===============================================================
// EXPORTAÇÃO (se usar módulos)
// ===============================================================

// Se você usar módulos ES6, descomente as linhas abaixo:
// export {
//     inicializarSistemaEvento,
//     controlarVisibilidadeSecaoEvento,
//     abrirFormularioCadastroEvento,
//     fecharFormularioCadastroEvento,
//     diagnosticarSistemaEvento
// };
