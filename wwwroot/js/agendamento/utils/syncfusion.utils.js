// ====================================================================
// SYNCFUSION UTILS - Utilitários para componentes Syncfusion
// ====================================================================

/**
 * Obtém instância Syncfusion de um elemento
 * param {string} id - ID do elemento
 * returns {Object|null} Instância Syncfusion ou null
 */
window.getSyncfusionInstance = function (id)
{
    try
    {
        const el = document.getElementById(id);
        if (el && Array.isArray(el.ej2_instances) && el.ej2_instances.length > 0 && el.ej2_instances[0])
        {
            return el.ej2_instances[0];
        }
        return null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "getSyncfusionInstance", error);
        return null;
    }
};

/**
 * Obtém primeiro valor de um componente Syncfusion
 * param {Object} inst - Instância Syncfusion
 * returns {*} Primeiro valor ou null
 */
window.getSfValue0 = function (inst)
{
    try
    {
        if (!inst) return null;
        const v = inst.value;
        if (Array.isArray(v)) return v.length ? v[0] : null;
        return v ?? null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "getSfValue0", error);
        return null;
    }
};

/**
 * Limpa tooltips globais Syncfusion
 * param {number} timeout - Timeout em ms
 */
window.limpaTooltipsGlobais = function (timeout = 200)
{
    try
    {
        setTimeout(() =>
        {
            try
            {
                document.querySelectorAll(".e-tooltip-wrap").forEach(t =>
                {
                    try
                    {
                        t.remove();
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "limpaTooltipsGlobais_remove", error);
                    }
                });

                document.querySelectorAll(".e-control.e-tooltip").forEach(el =>
                {
                    try
                    {
                        const instance = el.ej2_instances?.[0];
                        if (instance?.destroy) instance.destroy();
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "limpaTooltipsGlobais_destroy", error);
                    }
                });

                document.querySelectorAll("[title]").forEach(el =>
                {
                    try
                    {
                        el.removeAttribute("title");
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "limpaTooltipsGlobais_removeAttr", error);
                    }
                });

                $('[data-bs-toggle="tooltip"]').tooltip("dispose");
                $(".tooltip").remove();
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("syncfusion.utils.js", "limpaTooltipsGlobais_timeout", error);
            }
        }, timeout);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "limpaTooltipsGlobais", error);
    }
};

/**
 * Rebuilda lista de períodos
 */
window.rebuildLstPeriodos = function ()
{
    try
    {
        new ej.dropdowns.DropDownList({
            dataSource: window.dataPeriodos || [],
            fields: {
                value: "PeriodoId",
                text: "Periodo"
            },
            placeholder: "Selecione o período",
            allowFiltering: true,
            showClearButton: true,
            sortOrder: "Ascending"
        }).appendTo("#lstPeriodos");
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "rebuildLstPeriodos", error);
    }
};

/**
 * Inicializa tooltips Syncfusion em modal
 */
window.initializeModalTooltips = function ()
{
    try
    {
        const tooltipElements = document.querySelectorAll('[data-ejtip]');
        tooltipElements.forEach(function (element)
        {
            try
            {
                new ej.popups.Tooltip({
                    target: element
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("syncfusion.utils.js", "initializeModalTooltips_forEach", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "initializeModalTooltips", error);
    }
};

/**
 * Configura RichTextEditor para paste de imagens
 * param {string} rteId - ID do RichTextEditor
 */
window.setupRTEImagePaste = function (rteId)
{
    try
    {
        const rteDescricao = document.getElementById(rteId);
        if (!rteDescricao || !rteDescricao.ej2_instances || !rteDescricao.ej2_instances[0])
        {
            return;
        }

        const rte = rteDescricao.ej2_instances[0];

        rte.element.addEventListener("paste", function (event)
        {
            try
            {
                const clipboardData = event.clipboardData;

                if (clipboardData && clipboardData.items)
                {
                    const items = clipboardData.items;

                    for (let i = 0; i < items.length; i++)
                    {
                        const item = items[i];

                        if (item.type.indexOf("image") !== -1)
                        {
                            const blob = item.getAsFile();
                            const reader = new FileReader();

                            reader.onloadend = function ()
                            {
                                try
                                {
                                    const base64Image = reader.result.split(",")[1];
                                    const pastedHtml = `<img src="data:image/png;base64,${base64Image}" />`;
                                    rte.executeCommand('insertHTML', pastedHtml);
                                } catch (error)
                                {
                                    Alerta.TratamentoErroComLinha("syncfusion.utils.js", "setupRTEImagePaste_onloadend", error);
                                }
                            };

                            reader.readAsDataURL(blob);
                            break;
                        }
                    }
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("syncfusion.utils.js", "setupRTEImagePaste_paste", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "setupRTEImagePaste", error);
    }
};

/**
 * Configuração global de localização Syncfusion para PT-BR
 */
window.configurarLocalizacaoSyncfusion = function ()
{
    try
    {
        // Configurar L10n (textos dos componentes)
        const L10n = ej.base.L10n;
        L10n.load({
            pt: {
                calendar: {
                    today: "Hoje"
                }
            },
            "pt-BR": {
                calendar: {
                    today: "Hoje"
                },
                richtexteditor: {
                    alignments: "Alinhamentos",
                    justifyLeft: "Alinhar à Esquerda",
                    justifyCenter: "Centralizar",
                    justifyRight: "Alinhar à Direita",
                    justifyFull: "Justificar",
                    fontName: "Nome da Fonte",
                    fontSize: "Tamanho da Fonte",
                    fontColor: "Cor da Fonte",
                    backgroundColor: "Cor de Fundo",
                    bold: "Negrito",
                    italic: "Itálico",
                    underline: "Sublinhado",
                    strikethrough: "Tachado",
                    clearFormat: "Limpa Formatação",
                    clearAll: "Limpa Tudo",
                    cut: "Cortar",
                    copy: "Copiar",
                    paste: "Colar",
                    unorderedList: "Lista com Marcadores",
                    orderedList: "Lista Numerada",
                    indent: "Aumentar Identação",
                    outdent: "Diminuir Identação",
                    undo: "Desfazer",
                    redo: "Refazer",
                    superscript: "Sobrescrito",
                    subscript: "Subscrito",
                    createLink: "Inserir Link",
                    openLink: "Abrir Link",
                    editLink: "Editar Link",
                    removeLink: "Remover Link",
                    image: "Inserir Imagem",
                    replace: "Substituir",
                    align: "Alinhar",
                    caption: "Título da Imagem",
                    remove: "Remover",
                    insertLink: "Inserir Link",
                    display: "Exibir",
                    altText: "Texto Alternativo",
                    dimension: "Mudar Tamanho",
                    fullscreen: "Maximizar",
                    maximize: "Maximizar",
                    minimize: "Minimizar",
                    lowerCase: "Caixa Baixa",
                    upperCase: "Caixa Alta",
                    print: "Imprimir",
                    formats: "Formatos",
                    sourcecode: "Visualizar Código",
                    preview: "Exibir",
                    viewside: "ViewSide",
                    insertCode: "Inserir Código",
                    linkText: "Exibir Texto",
                    linkTooltipLabel: "Título",
                    linkWebUrl: "Endereço Web",
                    linkTitle: "Entre com um título",
                    linkurl: "http://exemplo.com",
                    linkOpenInNewWindow: "Abrir Link em Nova Janela",
                    linkHeader: "Inserir Link",
                    dialogInsert: "Inserir",
                    dialogCancel: "Cancelar",
                    dialogUpdate: "Atualizar",
                    imageHeader: "Inserir Imagem",
                    imageLinkHeader: "Você pode proporcionar um link da web",
                    mdimageLink: "Favor proporcionar uma URL para sua imagem",
                    imageUploadMessage: "Solte a imagem aqui ou busque para o upload",
                    imageDeviceUploadMessage: "Clique aqui para o upload",
                    imageAlternateText: "Texto Alternativo",
                    alternateHeader: "Texto Alternativo",
                    browse: "Procurar",
                    imageUrl: "http://exemplo.com/imagem.png",
                    imageCaption: "Título",
                    imageSizeHeader: "Tamanho da Imagem",
                    imageHeight: "Altura",
                    imageWidth: "Largura",
                    textPlaceholder: "Entre com um Texto",
                    inserttablebtn: "Inserir Tabela",
                    tabledialogHeader: "Inserir Tabela",
                    tableWidth: "Largura",
                    cellpadding: "Espaçamento de célula",
                    cellspacing: "Espaçamento de célula",
                    columns: "Número de colunas",
                    rows: "Número de linhas",
                    tableRows: "Linhas da Tabela",
                    tableColumns: "Colunas da Tabela",
                    tableCellHorizontalAlign: "Alinhamento Horizontal da Célular",
                    tableCellVerticalAlign: "Alinhamento Vertical da Célular",
                    createTable: "Criar Tabela",
                    removeTable: "Remover Tabela",
                    tableHeader: "Cabeçalho da Tabela",
                    tableRemove: "Remover Tabela",
                    tableCellBackground: "Cor de Fundo da Célula",
                    tableEditProperties: "Editar Propriedades da Tabela",
                    styles: "Estilos",
                    insertColumnLeft: "Inserir Coluna à Esquerda",
                    insertColumnRight: "Inserir Coluna à Direita",
                    deleteColumn: "Remover Coluna",
                    insertRowBefore: "Inserir Linha Acima",
                    insertRowAfter: "Inserir Linha Abaixo",
                    deleteRow: "Remover Linha",
                    tableEditHeader: "Editar Tabela",
                    TableHeadingText: "Cabeçalho",
                    TableColText: "Coluna",
                    imageInsertLinkHeader: "Inserir Link",
                    editImageHeader: "Editar Imagem",
                    alignmentsDropDownLeft: "Alinhar Esquerda",
                    alignmentsDropDownCenter: "Alinhar Centro",
                    alignmentsDropDownRight: "Alinhar Direita",
                    alignmentsDropDownJustify: "Alinhar Justificar",
                    imageDisplayDropDownInline: "Na Linha",
                    imageDisplayDropDownBreak: "Quebrar",
                    tableInsertRowDropDownBefore: "Inserir linha acima",
                    tableInsertRowDropDownAfter: "Inserir linha abaixo",
                    tableInsertRowDropDownDelete: "Deletar linha",
                    tableInsertColumnDropDownLeft: "Inserir coluna esquerda",
                    tableInsertColumnDropDownRight: "Inserir coluna direita",
                    tableInsertColumnDropDownDelete: "Deletar coluna",
                    tableVerticalAlignDropDownTop: "Alinhar Topo",
                    tableVerticalAlignDropDownMiddle: "Alinhar Meio",
                    tableVerticalAlignDropDownBottom: "Alinhar Inferior",
                    tableStylesDropDownDashedBorder: "Bordas Tracejadas",
                    tableStylesDropDownAlternateRows: "Linhas Alternadas",
                    pasteFormat: "Formato de Colagem",
                    pasteFormatContent: "Escolha o formato que deseja colar.",
                    plainText: "Texto Sem Formatação",
                    cleanFormat: "Limpar",
                    keepFormat: "Manter",
                    formatsDropDownParagraph: "Parágrafo",
                    formatsDropDownCode: "Código",
                    formatsDropDownQuotation: "Citação",
                    formatsDropDownHeading1: "Cabeçalho 1",
                    formatsDropDownHeading2: "Cabeçalho 2",
                    formatsDropDownHeading3: "Cabeçalho 3",
                    formatsDropDownHeading4: "Cabeçalho 4",
                    fontNameSegoeUI: "SegoeUI",
                    fontNameArial: "Arial",
                    fontNameGeorgia: "Georgia",
                    fontNameImpact: "Impact",
                    fontNameTahoma: "Tahoma",
                    fontNameTimesNewRoman: "Times New Roman",
                    fontNameVerdana: "Verdana"
                }
            }
        });

        // Configurar cultura pt-BR (para nomes de meses e dias)
        if (ej.base && ej.base.setCulture)
        {
            ej.base.setCulture('pt-BR');
        }

        // Carregar dados CLDR para português
        if (ej.base && ej.base.loadCldr)
        {
            const ptBRCldr = {
                "main": {
                    "pt-BR": {
                        "identity": {
                            "version": {
                                "_cldrVersion": "36"
                            },
                            "language": "pt"
                        },
                        "dates": {
                            "calendars": {
                                "gregorian": {
                                    "months": {
                                        "format": {
                                            "abbreviated": {
                                                "1": "jan",
                                                "2": "fev",
                                                "3": "mar",
                                                "4": "abr",
                                                "5": "mai",
                                                "6": "jun",
                                                "7": "jul",
                                                "8": "ago",
                                                "9": "set",
                                                "10": "out",
                                                "11": "nov",
                                                "12": "dez"
                                            },
                                            "wide": {
                                                "1": "janeiro",
                                                "2": "fevereiro",
                                                "3": "março",
                                                "4": "abril",
                                                "5": "maio",
                                                "6": "junho",
                                                "7": "julho",
                                                "8": "agosto",
                                                "9": "setembro",
                                                "10": "outubro",
                                                "11": "novembro",
                                                "12": "dezembro"
                                            }
                                        }
                                    },
                                    "days": {
                                        "format": {
                                            "abbreviated": {
                                                "sun": "dom",
                                                "mon": "seg",
                                                "tue": "ter",
                                                "wed": "qua",
                                                "thu": "qui",
                                                "fri": "sex",
                                                "sat": "sáb"
                                            },
                                            "wide": {
                                                "sun": "domingo",
                                                "mon": "segunda",
                                                "tue": "terça",
                                                "wed": "quarta",
                                                "thu": "quinta",
                                                "fri": "sexta",
                                                "sat": "sábado"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            ej.base.loadCldr(ptBRCldr);
        }

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "configurarLocalizacaoSyncfusion", error);
    }
};

/**
 * Callbacks globais do RTE (mantidos para compatibilidade)
 */
window.onCreate = function ()
{
    try
    {
        window.defaultRTE = this;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "onCreate", error);
    }
};

window.toolbarClick = function (e)
{
    try
    {
        if (e.item.id == "rte_toolbar_Image")
        {
            const element = document.getElementById("rte_upload");
            if (element && element.ej2_instances && element.ej2_instances[0])
            {
                element.ej2_instances[0].uploading = function (args)
                {
                    try
                    {
                        args.currentRequest.setRequestHeader("XSRF-TOKEN", document.getElementsByName("__RequestVerificationToken")[0].value);
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "toolbarClick_uploading", error);
                    }
                };
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "toolbarClick", error);
    }
};

/**
 * Callback de mudança de data (calendário)
 */
window.onDateChange = function (args)
{
    try
    {
        window.selectedDates = args.values;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("syncfusion.utils.js", "onDateChange", error);
    }
};
