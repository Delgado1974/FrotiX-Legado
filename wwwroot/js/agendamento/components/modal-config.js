// ====================================================================
// MODAL CONFIG - Configurações originais de títulos, ícones e cores
// ====================================================================

/**
 * Estilo inline para títulos com fonte Outfit
 */
const TITLE_STYLE = "font-family: 'Outfit', sans-serif; font-weight: 700; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.2);";

/**
 * Configuração EXATA dos ícones e títulos do modal (versão original)
 */
window.ModalConfig = {
    NOVO_AGENDAMENTO: {
        html: `
            <h3 class='modal-title' style="${TITLE_STYLE}">
                <i class="fa-duotone fa-calendar-lines-pen" 
                   style="--fa-primary-color: #006400; --fa-secondary-color: #A9BA9D;"></i>
                Criar Agendamento
            </h3>`,
        tipo: 'novo'
    },

    EDITAR_AGENDAMENTO: {
        html: `
            <h3 class='modal-title' style="${TITLE_STYLE}">
                <i class="fa-duotone fa-calendar-lines-pen" 
                   style="--fa-primary-color: #002F6C; --fa-secondary-color: #7DA2CE;"></i>
                Editar Agendamento
            </h3>`,
        tipo: 'editar'
    },

    AGENDAMENTO_CANCELADO: {
        html: `
            <h3 class='modal-title' style="${TITLE_STYLE}">
                <i class="fa-duotone fa-calendar-xmark" 
                   style="--fa-primary-color: #8B0000; --fa-secondary-color: #FF4C4C;"></i>
                Agendamento Cancelado
            </h3>`,
        tipo: 'cancelado'
    },

    VIAGEM_ABERTA: {
        html: `
            <h3 class='modal-title' style="${TITLE_STYLE}">
                <i class='fa-duotone fa-solid fa-suitcase-rolling' aria-hidden='true'></i> 
                Exibindo Viagem (Aberta)
            </h3>`,
        tipo: 'aberta'
    },

    VIAGEM_REALIZADA: {
        htmlFunc: (statusTexto = 'Realizada') => `
            <h3 class='modal-title' style="${TITLE_STYLE}">
                <i class='fa-duotone fa-solid fa-suitcase-rolling' aria-hidden='true'></i> 
                Exibindo Viagem (${statusTexto} - 
                <span class='btn-vinho fw-bold fst-italic'>Edição Não Permitida</span>
                )
            </h3>`,
        tipo: 'realizada'
    },

    VIAGEM_CANCELADA: {
        htmlFunc: (statusTexto = 'Cancelada') => `
            <h3 class='modal-title' style="${TITLE_STYLE}">
                <i class='fa-duotone fa-solid fa-suitcase-rolling' aria-hidden='true'></i> 
                Exibindo Viagem (${statusTexto} - 
                <span class='btn-vinho fw-bold fst-italic'>Edição Não Permitida</span>
                )
            </h3>`,
        tipo: 'cancelada'
    },

    TRANSFORMAR_VIAGEM: {
        html: `
            <h3 class='modal-title' style="${TITLE_STYLE}">
                <i class="fa-duotone fa-calendar-lines-pen" 
                   style="--fa-primary-color: #002F6C; --fa-secondary-color: #7DA2CE;"></i>
                Transformar Agendamento em Viagem
            </h3>`,
        tipo: 'transformar'
    }
};

/**
 * Define título do modal com HTML exato da versão original
 * param {string} tipo - Tipo de modal (chave do ModalConfig)
 * param {string} statusTexto - Texto de status adicional (opcional)
 */
window.setModalTitle = function (tipo, statusTexto = null)
{
    try
    {
        const config = window.ModalConfig[tipo];

        if (!config)
        {
            console.warn("⚠️ Tipo de modal não encontrado:", tipo);
            return;
        }

        // Obter HTML do título
        let tituloHtml = '';
        if (config.htmlFunc)
        {
            // Se for função (para títulos dinâmicos com statusTexto)
            tituloHtml = config.htmlFunc(statusTexto);
        } else
        {
            // Se for HTML estático
            tituloHtml = config.html;
        }

        // Atualizar usando ID "Titulo" (como no original)
        const tituloElement = document.getElementById("Titulo");
        if (tituloElement)
        {
            tituloElement.innerHTML = tituloHtml;
        }

        // Fallback: tentar outros seletores comuns
        const seletores = [
            "#modalViagens .modal-title",
            "#modalViagemTitulo",
            "#modalViagens .modal-header h3",
            "#modalViagens .modal-header"
        ];

        seletores.forEach(seletor =>
        {
            try
            {
                const elemento = document.querySelector(seletor);
                if (elemento && elemento.id !== "Titulo")
                {
                    // Se o elemento não for o "Titulo" principal, inserir dentro dele
                    if (elemento.classList.contains('modal-header'))
                    {
                        // Se for o header, buscar ou criar o elemento de título dentro dele
                        let titleEl = elemento.querySelector('.modal-title, h3, h5');
                        if (titleEl)
                        {
                            titleEl.innerHTML = tituloHtml.replace(/<h3[^>]*>|<\/h3>/g, '');
                        }
                    } else
                    {
                        elemento.innerHTML = tituloHtml.replace(/<h3[^>]*>|<\/h3>/g, '');
                    }
                }
            } catch (e)
            {
                console.warn(`Erro ao definir título em ${seletor}:`, e);
            }
        });

        console.log("📋 Título do modal definido:", tipo);

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-config.js", "setModalTitle", error);
    }
};

/**
 * Reseta modal para estado inicial
 */
window.resetModal = function ()
{
    try
    {
        window.setModalTitle('NOVO_AGENDAMENTO');
        window.limparCamposModalViagens();
        window.inicializarCamposModal();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-config.js", "resetModal", error);
    }
};

/**
 * Garante que botões de fechar nunca sejam desabilitados
 */
window.garantirBotoesFechaHabilitados = function ()
{
    try
    {
        const seletores = [
            '#btnFecha',
            '#btnFechar',
            '#btnCancelar',
            '#modalViagens .btn-close',
            '#modalViagens [data-bs-dismiss="modal"]',
            '.modal-footer .btn-secondary'
        ];

        seletores.forEach(seletor =>
        {
            try
            {
                const elementos = document.querySelectorAll(seletor);
                elementos.forEach(el =>
                {
                    if (el)
                    {
                        el.disabled = false;
                        el.classList.remove('disabled');
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                    }
                });
            } catch (e)
            {
                console.warn(`Erro ao habilitar ${seletor}:`, e);
            }
        });

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("modal-config.js", "garantirBotoesFechaHabilitados", error);
    }
};

// Garantir que botões de fechar sempre estejam habilitados
setInterval(window.garantirBotoesFechaHabilitados, 1000);
