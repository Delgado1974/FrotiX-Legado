window.loadSyncfusionLocalization = async function ()
{
    const culture = 'pt-BR';

    const cldrFiles = [
        '/cldr/ca-gregorian.json',
        '/cldr/numbers.json',
        '/cldr/timeZoneNames.json',
        '/cldr/currencies.json',
        '/cldr/numberingSystems.json',
        '/cldr/weekData.json'
    ];

    const cldrData = await Promise.all(cldrFiles.map(url => fetch(url).then(res => res.json())));

    if (typeof ej !== 'undefined' && ej.base)
    {
        ej.base.loadCldr(...cldrData);
        ej.base.setCulture(culture);
        ej.base.L10n.load({
            'pt-BR': {
                calendar: {
                    today: 'Hoje',
                    weekHeader: 'Sm',
                    firstDayOfWeek: 0,
                    dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
                    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                    monthNames: [
                        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                    ],
                    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
                },
                datepicker: {
                    placeholder: 'Selecione uma data',
                    today: 'Hoje',
                    close: 'Fechar'
                },
                timepicker: {
                    placeholder: 'Selecione um horário',
                    now: 'Agora',
                    ok: 'OK',
                    cancel: 'Cancelar'
                },
                datetimepicker: {
                    placeholder: 'Selecione data e horário',
                    today: 'Hoje',
                    now: 'Agora',
                    ok: 'OK',
                    cancel: 'Cancelar'
                },
                grid: {
                    EmptyRecord: 'Nenhum registro encontrado',
                    GroupDropArea: 'Arraste um cabeçalho de coluna aqui para agrupar',
                    UnGroup: 'Clique aqui para desagrupar',
                    EmptyDataSourceError: 'DataSource não deve estar vazio no carregamento inicial',
                    Add: 'Adicionar',
                    Edit: 'Editar',
                    Cancel: 'Cancelar',
                    Update: 'Atualizar',
                    Delete: 'Excluir',
                    Print: 'Imprimir',
                    FilterButton: 'Filtrar',
                    ClearButton: 'Limpar',
                    Search: 'Buscar',
                    Save: 'Salvar',
                    ConfirmDelete: 'Tem certeza de que deseja excluir este registro?',
                    True: 'Verdadeiro',
                    False: 'Falso',
                    ChooseDate: 'Escolha uma data',
                },
                pager: {
                    currentPageInfo: '{0} de {1} páginas',
                    totalItemsInfo: '({0} itens)',
                    firstPageTooltip: 'Primeira página',
                    lastPageTooltip: 'Última página',
                    nextPageTooltip: 'Próxima página',
                    previousPageTooltip: 'Página anterior',
                    nextPagerTooltip: 'Próximo pager',
                    previousPagerTooltip: 'Pager anterior',
                    pagerDropDown: 'Itens por página',
                    pagerAllDropDown: 'Itens',
                    All: 'Todos'
                },
                dropdowns: {
                    noRecordsTemplate: 'Nenhum registro encontrado',
                    actionFailureTemplate: 'Erro ao carregar os dados',
                    select: 'Selecionar',
                    selectAllText: 'Selecionar tudo',
                    unSelectAllText: 'Desmarcar tudo',
                    placeholder: 'Selecione'
                },
                numerictextbox: {
                    incrementTitle: 'Incrementar valor',
                    decrementTitle: 'Decrementar valor'
                },
                textbox: {
                    placeholder: 'Insira texto'
                },
                buttons: {
                    yes: 'Sim',
                    no: 'Não'
                },
                dialog: {
                    close: 'Fechar'
                },
                richtexteditor: {
                    bold: 'Negrito',
                    italic: 'Itálico',
                    underline: 'Sublinhado',
                    strikethrough: 'Tachado',
                    superscript: 'Sobrescrito',
                    subscript: 'Subscrito',
                    justifyLeft: 'Alinhar à esquerda',
                    justifyCenter: 'Centralizar',
                    justifyRight: 'Alinhar à direita',
                    justifyFull: 'Justificar',
                    undo: 'Desfazer',
                    redo: 'Refazer',
                    clearAll: 'Limpar tudo',
                    cut: 'Cortar',
                    copy: 'Copiar',
                    paste: 'Colar',
                    fontName: 'Fonte',
                    fontSize: 'Tamanho da fonte',
                    format: 'Formato',
                    alignments: 'Alinhamentos',
                    lists: 'Listas',
                    orderedList: 'Lista ordenada',
                    unorderedList: 'Lista não ordenada',
                    insertLink: 'Inserir link',
                    openLink: 'Abrir link',
                    editLink: 'Editar link',
                    removeLink: 'Remover link',
                    image: 'Imagem',
                    fileManager: 'Gerenciador de arquivos',
                    table: 'Tabela',
                    insertTable: 'Inserir tabela',
                    insertRowBefore: 'Inserir linha acima',
                    insertRowAfter: 'Inserir linha abaixo',
                    deleteRow: 'Excluir linha',
                    insertColumnLeft: 'Inserir coluna à esquerda',
                    insertColumnRight: 'Inserir coluna à direita',
                    deleteColumn: 'Excluir coluna',
                    deleteTable: 'Excluir tabela',
                }
            }
        });
    }
}
