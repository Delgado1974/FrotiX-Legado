// ====================================================================
// REQUISITANTE SERVICE - Serviço para gerenciamento de requisitantes
// ====================================================================

/* eslint-disable no-undef */
(function ()
{
    "use strict";

    // Debug: Rastrear cargas do arquivo
    window.requisitanteServiceLoadCount = (window.requisitanteServiceLoadCount || 0) + 1;
    console.log("🔄 requisitante_service.js CARREGADO - Carga #" + window.requisitanteServiceLoadCount);
    console.log("   Timestamp:", new Date().toISOString());

    // ------------------------------
    // Serviço (chamadas à API)
    // ------------------------------
    class RequisitanteService
    {
        constructor()
        {
            this.api = window.ApiClient;
        }

        /**
         * Adiciona novo requisitante
         * @param {Object} dados - Dados do requisitante
         * @returns {Promise<Object>} Resultado da operação
         */
        async adicionar(dados)
        {
            try
            {
                const response = await this.api.post('/api/Viagem/AdicionarRequisitante', dados);

                if (response.success)
                {
                    return {
                        success: true,
                        message: response.message,
                        requisitanteId: response.requisitanteid
                    };
                } else
                {
                    return {
                        success: false,
                        message: response.message || "Erro ao adicionar requisitante"
                    };
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("requisitante_service.js", "adicionar", error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        /**
         * Lista requisitantes
         * @returns {Promise<{success:boolean,data:any[],error?:string}>}
         */
        async listar()
        {
            try
            {
                return new Promise((resolve, reject) =>
                {
                    $.ajax({
                        url: "/Viagens/Upsert?handler=AJAXPreencheListaRequisitantes",
                        method: "GET",
                        datatype: "json",
                        success: function (res)
                        {
                            const requisitantes = res.data.map(item => ({
                                RequisitanteId: item.requisitanteId,
                                Requisitante: item.requisitante
                            }));

                            resolve({
                                success: true,
                                data: requisitantes
                            });
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                            const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
                            Alerta.TratamentoErroComLinha("requisitante.service.js", "listar", erro);
                            reject(erro);
                        }
                    });
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("requisitante.service.js", "listar", error);
                return {
                    success: false,
                    error: error.message,
                    data: []
                };
            }
        }
    }

    // Instância global do serviço
    window.RequisitanteService = new RequisitanteService();

    // Flag para prevenir fechamento durante validação
    let estaValidando = false;

    // Flag para evitar duplo clique no botão Novo Requisitante
    let isProcessing = false;

    // Contador de inicializações (debug)
    let inicializacaoCount = 0;


    // ===============================================================
    // CAPTURA DE DADOS DE SETORES DO VIEWDATA
    // ===============================================================

    /**
     * Captura dados de setores já carregados nos outros controles
     */
    function capturarDadosSetores()
    {
        try
        {
            // Tentar pegar dos controles já existentes
            const lstSetorAgendamento = document.getElementById("lstSetorRequisitanteAgendamento");

            if (lstSetorAgendamento && lstSetorAgendamento.ej2_instances && lstSetorAgendamento.ej2_instances[0])
            {
                const dados = lstSetorAgendamento.ej2_instances[0].fields?.dataSource;
                if (dados && dados.length > 0)
                {
                    window.SETORES_DATA = dados;
                    console.log(`✅ Dados de setores capturados: ${dados.length} itens`);
                    return true;
                }
            }

            // Tentar do lstSetorRequisitanteEvento
            const lstSetorEvento = document.getElementById("lstSetorRequisitanteEvento");
            if (lstSetorEvento && lstSetorEvento.ej2_instances && lstSetorEvento.ej2_instances[0])
            {
                const dados = lstSetorEvento.ej2_instances[0].fields?.dataSource;
                if (dados && dados.length > 0)
                {
                    window.SETORES_DATA = dados;
                    console.log(`✅ Dados de setores capturados do evento: ${dados.length} itens`);
                    return true;
                }
            }

            console.warn("⚠️ Não foi possível capturar dados de setores");
            return false;

        } catch (error)
        {
            console.error("❌ Erro ao capturar dados de setores:", error);
            return false;
        }
    }

    // ===============================================================
    // SISTEMA DE REQUISITANTE - ACCORDION (UI)
    // ===============================================================

    /**
     * Inicializa o sistema de requisitante (chamar ao abrir o modal)
     */
    function inicializarSistemaRequisitante()
    {
        inicializacaoCount++;
        console.log(`🔄 inicializarSistemaRequisitante chamada (${inicializacaoCount}x)`);

        // PROTEÇÃO: Evitar múltiplas inicializações
        if (window.requisitanteServiceInicializado)
        {
            console.log("⚠️ Sistema já inicializado, ignorando chamada duplicada");
            return;
        }

        // Marca como inicializado IMEDIATAMENTE para evitar race conditions
        window.requisitanteServiceInicializado = true;
        console.log("📍 Marcado como inicializado. Próximas chamadas serão ignoradas.");

        // Configura o botão "Novo Requisitante"
        configurarBotaoNovoRequisitante();

        // Configura botões do formulário de cadastro
        configurarBotoesCadastroRequisitante();

        // Remove listener global antigo (se existir)
        if (window.globalClickListener)
        {
            document.removeEventListener("click", window.globalClickListener, true);
            console.log("🗑️ Listener global antigo removido");
        }

        // Cria função nomeada para o listener global
        // BLOQUEIO SELETIVO: Apenas botão btnRequisitante e elementos do accordion
        window.globalClickListener = function (e)
        {
            if (!estaValidando) return;

            // Permitir cliques no SweetAlert
            if (e.target.closest('.swal2-container') ||
                e.target.classList.contains('swal2-container'))
            {
                return; // ✅ SweetAlert pode funcionar normalmente
            }

            // Bloquear apenas: btnRequisitante e elementos do accordion
            const btnRequisitante = document.getElementById('btnRequisitante');
            const accordionRequisitante = document.getElementById('accordionRequisitante');

            const clickedBtn = e.target === btnRequisitante ||
                (btnRequisitante && btnRequisitante.contains(e.target));

            const clickedAccordion = accordionRequisitante &&
                (e.target === accordionRequisitante ||
                    accordionRequisitante.contains(e.target));

            if (clickedBtn || clickedAccordion)
            {
                console.log("🛑 Click bloqueado durante validação no:",
                    clickedBtn ? "botão" : "accordion");
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        };

        // Adiciona listener global para prevenir fechamento durante validação
        document.addEventListener("click", window.globalClickListener, true);
        console.log("✅ Listener global adicionado");
        console.log("🔍 window.globalClickListener referência:", window.globalClickListener ? "EXISTE" : "NULL");
        console.log("🔍 Tipo:", typeof window.globalClickListener);

        console.log("✅ Sistema de Requisitante inicializado!");
    }

    /**
     * Configura o botão "Novo Requisitante" (toggle)
     */
    function configurarBotaoNovoRequisitante()
    {
        const btnRequisitante = document.getElementById("btnRequisitante");

        if (!btnRequisitante)
        {
            console.warn("⚠️ btnRequisitante não encontrado");
            return;
        }

        // Remove listeners anteriores clonando o botão
        const novoBotao = btnRequisitante.cloneNode(true);
        btnRequisitante.parentNode.replaceChild(novoBotao, btnRequisitante);

        // Adiciona listener (TOGGLE) - fase de captura
        novoBotao.addEventListener("click", function (e)
        {
            console.log("🖱️ Clique no btnRequisitante detectado");
            console.log("   - estaValidando:", estaValidando);
            console.log("   - isProcessing:", isProcessing);

            // Ignorar se está validando
            if (estaValidando)
            {
                console.log("⏸️ Validação em andamento, ignorando clique");
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }

            if (isProcessing)
            {
                console.log("⏸️ Já processando, ignorando clique");
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }

            isProcessing = true;

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const sectionCadastro = document.getElementById("sectionCadastroRequisitante");

            if (!sectionCadastro)
            {
                console.warn("⚠️ sectionCadastroRequisitante não encontrado");
                isProcessing = false;
                return false;
            }

            // TOGGLE
            const estaOculto = (sectionCadastro.style.display === "none" || !sectionCadastro.style.display);
            if (estaOculto)
            {
                console.log("🆕 Abrindo formulário de cadastro de requisitante");
                abrirFormularioCadastroRequisitante();

                setTimeout(() =>
                {
                    isProcessing = false;
                }, 300);
            } else
            {
                console.log("➖ Fechando formulário de cadastro de requisitante");
                fecharFormularioCadastroRequisitante();
                setTimeout(() => { isProcessing = false; }, 300);
            }

            return false;
        }, true); // capture

        console.log("✅ Botão Novo Requisitante configurado (modo TOGGLE)");
    }

    /**
     * Abre o formulário de cadastro de requisitante
     */
    function abrirFormularioCadastroRequisitante()
    {
        try
        {
            // 1) Exibe o accordionRequisitante (caso esteja oculto)
            const accordionRequisitante = document.getElementById("accordionRequisitante");
            if (accordionRequisitante)
            {
                accordionRequisitante.style.display = "block";
                accordionRequisitante.style.height = "auto"; // 🔥 FORÇAR HEIGHT!
                accordionRequisitante.style.overflow = "visible"; // 🔥 FORÇAR OVERFLOW!
            }

            // 2) Exibe o sectionCadastroRequisitante
            const sectionCadastro = document.getElementById("sectionCadastroRequisitante");
            if (sectionCadastro)
            {
                sectionCadastro.style.display = "block";
                sectionCadastro.style.height = "auto"; // 🔥 FORÇAR HEIGHT!
                sectionCadastro.style.overflow = "visible"; // 🔥 FORÇAR OVERFLOW!
                sectionCadastro.classList.remove('d-none');
                sectionCadastro.classList.remove('collapse');
                sectionCadastro.classList.remove('collapsing');

                // 3) MUTATION OBSERVER EXPANDIDO - detecta TODAS as formas de fechamento
                const observer = new MutationObserver((mutations) =>
                {
                    // Verifica se o elemento ficou oculto de QUALQUER forma
                    const computedStyle = window.getComputedStyle(sectionCadastro);
                    const estaOculto = computedStyle.display === 'none' ||
                        computedStyle.visibility === 'hidden' ||
                        computedStyle.opacity === '0' ||
                        sectionCadastro.offsetHeight === 0 ||
                        sectionCadastro.classList.contains('d-none');

                    if (estaOculto)
                    {
                        console.error("🚨 ACCORDION FECHOU INESPERADAMENTE!");
                        console.error("   Display computado:", computedStyle.display);
                        console.error("   Visibility:", computedStyle.visibility);
                        console.error("   Opacity:", computedStyle.opacity);
                        console.error("   Height:", sectionCadastro.offsetHeight);
                        console.error("   Classes:", sectionCadastro.className);
                        console.error("   estaValidando:", estaValidando);

                        // Se está validando, reabrir FORÇADAMENTE
                        if (estaValidando)
                        {
                            console.log("🔓 FORÇANDO reabertura do accordion durante validação!");
                            sectionCadastro.style.display = "block";
                            sectionCadastro.style.visibility = "visible";
                            sectionCadastro.style.opacity = "1";
                            sectionCadastro.style.height = "auto"; // 🔥 FORÇAR HEIGHT!
                            sectionCadastro.style.overflow = "visible"; // 🔥 FORÇAR OVERFLOW!
                            sectionCadastro.classList.remove('d-none');
                            sectionCadastro.classList.remove('collapse');
                            sectionCadastro.classList.remove('collapsing');

                            if (accordionRequisitante)
                            {
                                accordionRequisitante.style.display = "block";
                                accordionRequisitante.style.height = "auto"; // 🔥 FORÇAR HEIGHT!
                                accordionRequisitante.style.overflow = "visible"; // 🔥 FORÇAR OVERFLOW!
                            }
                        }
                    }
                });

                observer.observe(sectionCadastro, {
                    attributes: true,
                    childList: true,
                    subtree: true
                });

                // Salvar observer para desconectar depois
                window.__accordionObserver = observer;
            }

            // 4) Limpa campos
            limparCamposCadastroRequisitante();

            // 4) CRÍTICO: Destruir e recriar ddtSetorRequisitante
            // Syncfusion não renderiza popup corretamente quando controle é criado com display:none
            setTimeout(() =>
            {
                const ddtSetor = document.getElementById("ddtSetorRequisitante");

                if (!ddtSetor)
                {
                    console.error("❌ ddtSetorRequisitante não encontrado no DOM");
                    return;
                }

                // Capturar dados de setores se ainda não existirem
                if (!window.SETORES_DATA || window.SETORES_DATA.length === 0)
                {
                    console.log("📦 Capturando dados de setores...");
                    capturarDadosSetores();
                }

                // Destruir instância antiga se existir
                if (ddtSetor.ej2_instances && ddtSetor.ej2_instances[0])
                {
                    console.log("🗑️ Destruindo instância antiga de ddtSetorRequisitante...");
                    ddtSetor.ej2_instances[0].destroy();
                }

                // Recriar o controle
                console.log("🔧 Recriando ddtSetorRequisitante...");

                const novoDropdown = new ej.dropdowns.DropDownTree({
                    fields: {
                        dataSource: window.SETORES_DATA || [],
                        value: 'SetorSolicitanteId',
                        text: 'Nome',
                        parentValue: 'SetorPaiId',
                        hasChildren: 'HasChild'
                    },
                    allowFiltering: true,
                    placeholder: 'Selecione o setor...',
                    sortOrder: 'Ascending',
                    showCheckBox: false,
                    filterType: 'Contains',
                    filterBarPlaceholder: 'Procurar...',
                    popupHeight: '200px'
                });

                novoDropdown.appendTo(ddtSetor);

                console.log(`✅ ddtSetorRequisitante recriado - ${window.SETORES_DATA?.length || 0} itens`);

            }, 100);

            console.log("✅ Formulário de cadastro de requisitante aberto");
        } catch (error)
        {
            console.error("❌ Erro ao abrir formulário:", error);
        }
    }

    /**
     * Fecha o formulário de cadastro de requisitante
     */
    function fecharFormularioCadastroRequisitante()
    {
        try
        {
            console.log("➖ Fechando formulário de cadastro de requisitante");
            console.log("   Stack trace:", new Error().stack);

            const sectionCadastro = document.getElementById("sectionCadastroRequisitante");
            if (sectionCadastro)
            {
                sectionCadastro.style.display = "none";

                // Reset da flag de processamento
                isProcessing = false;
            }

            console.log("✅ Formulário fechado");
        } catch (error)
        {
            console.error("❌ Erro ao fechar formulário:", error);
        }
    }

    /**
     * Limpa os campos do formulário de cadastro de requisitante
     */
    function limparCamposCadastroRequisitante()
    {
        try
        {
            console.log("🧹 Limpando campos do formulário de requisitante");

            // Campos de texto simples
            const txtPonto = document.getElementById("txtPonto");
            const txtNome = document.getElementById("txtNome");
            const txtRamal = document.getElementById("txtRamal");
            const txtEmail = document.getElementById("txtEmail");

            if (txtPonto) txtPonto.value = "";
            if (txtNome) txtNome.value = "";
            if (txtRamal) txtRamal.value = "";
            if (txtEmail) txtEmail.value = "";

            // Dropdown de Setor
            const ddtSetor = document.getElementById("ddtSetorRequisitante");
            console.log("🔍 ddtSetorRequisitante:", ddtSetor ? "encontrado" : "NÃO ENCONTRADO");

            if (ddtSetor)
            {
                console.log("🔍 ej2_instances:", ddtSetor.ej2_instances ? "existe" : "NÃO EXISTE");

                if (ddtSetor.ej2_instances && ddtSetor.ej2_instances[0])
                {
                    const dropdown = ddtSetor.ej2_instances[0];
                    console.log(`🔍 DataSource: ${dropdown.fields?.dataSource?.length || 0} itens`);
                    console.log("🔍 Campos configurados:", {
                        value: dropdown.fields.value,
                        text: dropdown.fields.text,
                        parentValue: dropdown.fields.parentValue,
                        hasChildren: dropdown.fields.hasChildren
                    });
                    console.log("🔍 Primeiros 3 itens:", dropdown.fields?.dataSource?.slice(0, 3));

                    dropdown.value = null;
                    dropdown.dataBind();
                    console.log("✅ ddtSetorRequisitante limpo");
                } else
                {
                    console.warn("⚠️ ddtSetorRequisitante não está inicializado");
                }
            }

            console.log("✅ Campos limpos");
        } catch (error)
        {
            console.error("❌ Erro ao limpar campos:", error);
        }
    }

    /**
     * Configura os botões do formulário de cadastro de requisitante
     */
    function configurarBotoesCadastroRequisitante()
    {
        // ===== BOTÃO SALVAR =====
        const btnSalvarRequisitante = document.getElementById("btnInserirRequisitante");
        if (btnSalvarRequisitante)
        {
            // Remove listeners anteriores
            const novoBotaoSalvar = btnSalvarRequisitante.cloneNode(true);
            btnSalvarRequisitante.parentNode.replaceChild(novoBotaoSalvar, btnSalvarRequisitante);

            // Adiciona novo listener
            novoBotaoSalvar.addEventListener("click", function (e)
            {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                salvarNovoRequisitante();
            }, true);

            console.log("✅ Botão Salvar configurado");
        } else
        {
            console.warn("⚠️ btnInserirRequisitante não encontrado");
        }

        // ===== BOTÃO FECHAR =====
        const btnCancelarRequisitante = document.getElementById("btnFecharAccordionRequisitante");
        if (btnCancelarRequisitante)
        {
            // Remove listeners anteriores
            const novoBotaoFechar = btnCancelarRequisitante.cloneNode(true);
            btnCancelarRequisitante.parentNode.replaceChild(novoBotaoFechar, btnCancelarRequisitante);

            // Adiciona novo listener
            novoBotaoFechar.addEventListener("click", function (e)
            {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                fecharFormularioCadastroRequisitante();
                limparCamposCadastroRequisitante();
            }, true);

            console.log("✅ Botão Fechar configurado");
        } else
        {
            console.warn("⚠️ btnFecharAccordionRequisitante não encontrado");
        }

        console.log("✅ Botões configurados com estilos padrão");
    }

    /**
     * Salva o novo requisitante chamando a API via AJAX
     */
    function salvarNovoRequisitante()
    {
        try
        {
            console.log("💾 Iniciando salvamento de requisitante.");

            // ===== OBTER CAMPOS =====
            const txtPonto = document.getElementById("txtPonto");
            const txtNome = document.getElementById("txtNome");
            const txtRamal = document.getElementById("txtRamal");
            const txtEmail = document.getElementById("txtEmail");
            const ddtSetor = document.getElementById("ddtSetorRequisitante");

            // ===== VALIDAÇÕES =====
            console.log("🔍 Iniciando validações - ativando flag estaValidando");
            estaValidando = true;

            if (!txtPonto || !txtPonto.value.trim())
            {
                console.log("❌ Validação falhou: Ponto obrigatório");

                // Agendar desativação da flag ANTES de mostrar alerta
                const resetTimer = setTimeout(() =>
                {
                    estaValidando = false;
                    console.log("✅ Flag estaValidando desativada (timeout Ponto)");
                }, 2000);

                Alerta.Alerta("Atenção", "O Ponto é obrigatório!");
                if (txtPonto) txtPonto.focus();
                return;
            }

            if (!txtNome || !txtNome.value.trim())
            {
                console.log("❌ Validação falhou: Nome obrigatório");

                const resetTimer = setTimeout(() =>
                {
                    estaValidando = false;
                    console.log("✅ Flag estaValidando desativada (timeout Nome)");
                }, 2000);

                Alerta.Alerta("Atenção", "O Nome é obrigatório!");
                if (txtNome) txtNome.focus();
                return;
            }

            if (!txtRamal || !txtRamal.value.trim())
            {
                console.log("❌ Validação falhou: Ramal obrigatório");

                const resetTimer = setTimeout(() =>
                {
                    estaValidando = false;
                    console.log("✅ Flag estaValidando desativada (timeout Ramal)");
                }, 2000);

                Alerta.Alerta("Atenção", "O Ramal é obrigatório!");
                if (txtRamal) txtRamal.focus();
                return;
            }

            let setorValue = null;
            if (ddtSetor && ddtSetor.ej2_instances && ddtSetor.ej2_instances[0])
            {
                const dropdown = ddtSetor.ej2_instances[0];
                setorValue = dropdown.value;
                console.log("🔍 Validando ddtSetorRequisitante:");
                console.log("  - Valor:", setorValue);
                console.log("  - DataSource:", dropdown.fields?.dataSource?.length || 0, "itens");
            } else
            {
                console.error("❌ ddtSetorRequisitante não está inicializado!");
            }

            if (!setorValue)
            {
                console.log("❌ Validação falhou: Setor obrigatório");

                const resetTimer = setTimeout(() =>
                {
                    estaValidando = false;
                    console.log("✅ Flag estaValidando desativada (timeout Setor)");
                }, 2000);

                Alerta.Alerta("Atenção", "O Setor do Requisitante é obrigatório!");
                return;
            }

            // Validações passaram
            console.log("✅ Todas as validações passaram");
            estaValidando = false;

            // ===== MONTAR OBJETO =====
            const objRequisitante = {
                Nome: txtNome.value.trim(),
                Ponto: txtPonto.value.trim(),
                Ramal: parseInt(txtRamal.value.trim()),
                Email: txtEmail ? txtEmail.value.trim() : "",
                SetorSolicitanteId: setorValue.toString()
            };

            console.log("📦 Dados coletados:", objRequisitante);

            // ===== CHAMAR API VIA AJAX =====
            $.ajax({
                type: "POST",
                url: "/api/Viagem/AdicionarRequisitante",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(objRequisitante),
                success: function (data)
                {
                    try
                    {
                        if (data.success)
                        {
                            console.log("✅ Requisitante adicionado com sucesso!");
                            console.log("📦 Resposta da API:", data);

                            if (typeof AppToast !== 'undefined')
                            {
                                AppToast.show('Verde', data.message);
                            } else if (typeof toastr !== 'undefined')
                            {
                                toastr.success(data.message);
                            }

                            // ===== ATUALIZAR DROPDOWN lstRequisitante =====
                            const lstRequisitante = document.getElementById("lstRequisitante");
                            if (lstRequisitante && lstRequisitante.ej2_instances && lstRequisitante.ej2_instances[0])
                            {
                                const comboRequisitante = lstRequisitante.ej2_instances[0];

                                const novoItem = {
                                    RequisitanteId: data.requisitanteid,
                                    Requisitante: txtNome.value.trim() + " - " + txtPonto.value.trim()
                                };

                                comboRequisitante.addItem(novoItem, 0);
                                comboRequisitante.value = data.requisitanteid;
                                comboRequisitante.dataBind();

                                console.log("✅ Requisitante adicionado ao dropdown");
                            }

                            // ===== ATUALIZAR RAMAL =====
                            const txtRamalRequisitanteSF = document.getElementById("txtRamalRequisitanteSF");
                            if (txtRamalRequisitanteSF && txtRamalRequisitanteSF.ej2_instances && txtRamalRequisitanteSF.ej2_instances[0])
                            {
                                const ramalTextBox = txtRamalRequisitanteSF.ej2_instances[0];
                                ramalTextBox.value = txtRamal.value.trim();
                                ramalTextBox.dataBind();
                                console.log("✅ Campo Ramal atualizado");
                            }

                            // ===== ATUALIZAR SETOR =====
                            const lstSetorRequisitanteAgendamento = document.getElementById("lstSetorRequisitanteAgendamento");
                            if (lstSetorRequisitanteAgendamento && lstSetorRequisitanteAgendamento.ej2_instances && lstSetorRequisitanteAgendamento.ej2_instances[0])
                            {
                                const comboSetor = lstSetorRequisitanteAgendamento.ej2_instances[0];
                                comboSetor.value = setorValue;
                                comboSetor.dataBind();
                                console.log("✅ Campo Setor atualizado");
                            }

                            // ===== FECHAR FORMULÁRIO =====
                            fecharFormularioCadastroRequisitante();
                            limparCamposCadastroRequisitante();

                        } else
                        {
                            console.error("❌ Erro ao adicionar requisitante:", data.message);

                            if (typeof AppToast !== 'undefined')
                            {
                                AppToast.show('Vermelho', data.message);
                            } else if (typeof toastr !== 'undefined')
                            {
                                toastr.error(data.message);
                            } else
                            {
                                Alerta.Erro("Atenção", data.message);
                            }
                        }
                    } catch (error)
                    {
                        console.error("❌ Erro no callback de sucesso:", error);
                        Alerta.TratamentoErroComLinha(
                            "requisitante_service.js",
                            "salvarNovoRequisitante.ajax.success",
                            error
                        );
                    }
                },
                error: function (jqXHR, textStatus, errorThrown)
                {
                    try
                    {
                        console.error("❌ Erro na requisição AJAX:", textStatus, errorThrown);
                        console.error("Resposta:", jqXHR.responseText);

                        Alerta.Erro("Atenção", "Erro ao adicionar requisitante. Verifique se já existe um requisitante com este ponto/nome!");

                        Alerta.TratamentoErroComLinha(
                            "requisitante_service.js",
                            "salvarNovoRequisitante.ajax.error",
                            new Error(textStatus + ": " + errorThrown)
                        );
                    } catch (error)
                    {
                        console.error("❌ Erro no callback de erro:", error);
                    }
                }
            });

        } catch (error)
        {
            estaValidando = false;
            console.error("❌ Erro ao salvar requisitante:", error);
            Alerta.TratamentoErroComLinha("requisitante_service.js", "salvarNovoRequisitante", error);
        }
    }

    // ===============================================================
    // EXPORTAR FUNÇÕES GLOBALMENTE
    // ===============================================================
    window.inicializarSistemaRequisitante = inicializarSistemaRequisitante;
    window.configurarBotaoNovoRequisitante = configurarBotaoNovoRequisitante;
    window.abrirFormularioCadastroRequisitante = abrirFormularioCadastroRequisitante;
    window.fecharFormularioCadastroRequisitante = fecharFormularioCadastroRequisitante;
    window.limparCamposCadastroRequisitante = limparCamposCadastroRequisitante;
    window.salvarNovoRequisitante = salvarNovoRequisitante;
    window.capturarDadosSetores = capturarDadosSetores;
})();
