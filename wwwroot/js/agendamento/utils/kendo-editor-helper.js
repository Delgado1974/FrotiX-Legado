/**
 * ============================================
 * KENDO EDITOR HELPER v4 - Controle robusto de instâncias
 * ============================================
 * 
 * ARQUIVO: ~/js/agendamento/utils/kendo-editor-helper.js
 */

(function (window) {
    'use strict';

    // ============================================
    // ESTADO
    // ============================================
    let pendingValue = null;

    // ============================================
    // CONFIGURAÇÃO
    // ============================================
    const TOOLS = [
        "bold", "italic", "underline", "strikethrough",
        "justifyLeft", "justifyCenter", "justifyRight", "justifyFull",
        "insertUnorderedList", "insertOrderedList",
        "indent", "outdent",
        "createLink", "unlink",
        "insertImage",
        "viewHtml",
        "formatting",
        "fontName",
        "fontSize",
        "foreColor",
        "backColor",
        "cleanFormatting"
    ];

    // ============================================
    // FUNÇÕES AUXILIARES
    // ============================================

    /**
     * Obtém a instância do Kendo Editor se existir
     */
    function getEditorInstance() {
        const textarea = document.getElementById("rteDescricao");
        if (textarea) {
            return $(textarea).data("kendoEditor");
        }
        return null;
    }

    /**
     * Obtém o HTML do editor
     */
    function getHtml() {
        try {
            const editor = getEditorInstance();
            if (editor) {
                return editor.value() || "";
            }
            return pendingValue || "";
        } catch (error) {
            console.error("[KendoEditorHelper] Erro ao obter HTML:", error);
            return "";
        }
    }

    /**
     * Define o HTML do editor
     */
    function setHtml(html) {
        try {
            const editor = getEditorInstance();
            if (editor) {
                editor.value(html || "");
                console.log("[KendoEditorHelper] HTML definido no editor");
            } else {
                pendingValue = html;
                console.log("[KendoEditorHelper] HTML guardado para aplicar depois");
            }
        } catch (error) {
            console.error("[KendoEditorHelper] Erro ao definir HTML:", error);
        }
    }

    // ============================================
    // FUNÇÕES PRINCIPAIS
    // ============================================

    /**
     * Destrói COMPLETAMENTE o Kendo Editor e limpa o DOM
     */
    function destroyKendoEditor() {
        try {
            const textarea = document.getElementById("rteDescricao");
            if (!textarea) return;

            // Obter instância existente
            const editor = $(textarea).data("kendoEditor");
            
            if (editor) {
                // Destruir a instância
                editor.destroy();
                console.log("[KendoEditorHelper] Instância destruída");
            }

            // IMPORTANTE: Remover wrapper HTML criado pelo Kendo
            const wrapper = $(textarea).closest(".k-editor");
            if (wrapper.length) {
                // Mover o textarea para fora do wrapper antes de remover
                wrapper.before(textarea);
                wrapper.remove();
                console.log("[KendoEditorHelper] Wrapper removido");
            }

            // Limpar dados do jQuery
            $(textarea).removeData("kendoEditor");
            
            // Mostrar textarea original
            $(textarea).show().css({
                "height": "250px",
                "width": "100%"
            });

            // Limpar ej2_instances
            delete textarea.ej2_instances;

            pendingValue = null;
            
            console.log("[KendoEditorHelper] Editor destruído completamente");

        } catch (error) {
            console.error("[KendoEditorHelper] Erro ao destruir:", error);
        }
    }

    /**
     * Inicializa o Kendo Editor (apenas se não existir)
     */
    function initKendoEditor() {
        try {
            const textarea = document.getElementById("rteDescricao");
            if (!textarea) {
                console.warn("[KendoEditorHelper] Textarea #rteDescricao não encontrado");
                return null;
            }

            // Se já existe instância, apenas aplicar valor pendente
            let editor = $(textarea).data("kendoEditor");
            if (editor) {
                console.log("[KendoEditorHelper] Instância já existe, reutilizando");
                if (pendingValue !== null) {
                    editor.value(pendingValue);
                    pendingValue = null;
                    console.log("[KendoEditorHelper] Valor pendente aplicado");
                }
                return editor;
            }

            // Verificar se há wrapper órfão (de inicialização anterior mal destruída)
            const orphanWrapper = $(textarea).closest(".k-editor");
            if (orphanWrapper.length) {
                console.warn("[KendoEditorHelper] Wrapper órfão encontrado, limpando...");
                orphanWrapper.before(textarea);
                orphanWrapper.remove();
                $(textarea).removeData("kendoEditor");
            }

            // Criar novo editor
            $(textarea).kendoEditor({
                tools: TOOLS,
                resizable: {
                    content: true,
                    toolbar: false
                }
            });

            editor = $(textarea).data("kendoEditor");

            // Aplicar valor pendente
            if (pendingValue !== null && editor) {
                editor.value(pendingValue);
                pendingValue = null;
                console.log("[KendoEditorHelper] Valor pendente aplicado");
            }

            // Criar camada de compatibilidade
            createCompatibilityLayer(textarea);

            console.log("[KendoEditorHelper] Editor inicializado com sucesso");
            return editor;

        } catch (error) {
            console.error("[KendoEditorHelper] Erro ao inicializar:", error);
            return null;
        }
    }

    /**
     * Limpa o conteúdo
     */
    function clearContent() {
        pendingValue = null;
        setHtml("");
    }

    /**
     * Refresh do editor
     */
    function refreshEditor() {
        try {
            const editor = getEditorInstance();
            if (editor) {
                editor.refresh();
            }
        } catch (error) {
            // Ignorar
        }
    }

    // ============================================
    // CAMADA DE COMPATIBILIDADE SYNCFUSION
    // ============================================

    function createCompatibilityLayer(textarea) {
        if (!textarea) return;
        if (textarea.ej2_instances) return; // Já existe

        const compatObj = {
            get value() {
                return getHtml();
            },
            set value(val) {
                setHtml(val);
            },
            getHtml: function () {
                return getHtml();
            },
            getValue: function () {
                return getHtml();
            },
            dataBind: function () {
                refreshEditor();
            },
            refresh: function () {
                refreshEditor();
            },
            enabled: true
        };

        textarea.ej2_instances = [compatObj];
    }

    /**
     * Cria camada de compatibilidade inicial (antes do editor existir)
     */
    function createInitialCompatibilityLayer() {
        const textarea = document.getElementById("rteDescricao");
        if (textarea && !textarea.ej2_instances) {
            createCompatibilityLayer(textarea);
            console.log("[KendoEditorHelper] Camada de compatibilidade inicial criada");
        }
    }

    // ============================================
    // INTEGRAÇÃO COM MODAL
    // ============================================

    function setupModalIntegration() {
        const modal = document.getElementById("modalViagens");
        if (!modal) {
            console.warn("[KendoEditorHelper] Modal #modalViagens não encontrado");
            return;
        }

        // Remover TODOS os listeners anteriores
        $(modal).off('shown.bs.modal.kendoEditor hidden.bs.modal.kendoEditor');

        // Quando modal abrir
        $(modal).on('shown.bs.modal.kendoEditor', function () {
            setTimeout(function () {
                initKendoEditor();
            }, 100);
        });

        // Quando modal fechar - destruir COMPLETAMENTE
        $(modal).on('hidden.bs.modal.kendoEditor', function () {
            destroyKendoEditor();
            // Recriar camada de compatibilidade para próxima abertura
            setTimeout(createInitialCompatibilityLayer, 50);
        });

        console.log("[KendoEditorHelper] Integração com modal configurada");
    }

    // ============================================
    // SOBRESCREVER refreshComponenteSafe
    // ============================================

    const originalRefresh = window.refreshComponenteSafe;

    window.refreshComponenteSafe = function (componentId) {
        if (componentId === "rteDescricao") {
            refreshEditor();
            return;
        }
        if (typeof originalRefresh === 'function') {
            originalRefresh(componentId);
        }
    };

    // ============================================
    // API PÚBLICA
    // ============================================

    window.KendoEditorHelper = {
        init: initKendoEditor,
        destroy: destroyKendoEditor,
        getHtml: getHtml,
        setHtml: setHtml,
        clear: clearContent,
        refresh: refreshEditor,
        setupModalIntegration: setupModalIntegration,

        get instance() {
            return getEditorInstance();
        },

        get isInitialized() {
            return getEditorInstance() !== null;
        }
    };

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    $(document).ready(function () {
        createInitialCompatibilityLayer();
        setupModalIntegration();
    });

    console.log("[KendoEditorHelper] Módulo carregado v4");

})(window);
