// ====================================================================
// DIALOGS - Diálogos e modais do sistema
// ====================================================================

/**
 * Mostra diálogo de inconsistência de dia da semana
 */
window.showDialogDiasSemana = function ()
{
    try
    {
        // Create a new instance of Syncfusion Dialog
        const dialog = new ej.popups.Dialog({
            header: '<div style="display: flex; align-items: center; justify-content: space-between;">' +
                '<i class="fa fa-exclamation-triangle" aria-hidden="true" style="color: #e67e22;"></i>' +
                '<span style="flex-grow: 1; text-align: center;">Dia da semana inconsistente</span>' +
                '<i class="fa fa-exclamation-triangle" aria-hidden="true" style="color: #e67e22;"></i>' +
                '</div>',
            content: '<div style="font-size: 1.1em; color: #555; line-height: 1.5;">' +
                '<p><i class="fa fa-calendar" aria-hidden="true" style="color: #3498db;"></i> O dia da semana da data inicial não corresponde a nenhum dos dias selecionados.</p>' +
                '<p><strong>O que deseja fazer?</strong></p>' +
                '</div>',
            showCloseIcon: true,
            closeOnEscape: false,
            isModal: true,
            position: { X: "center", Y: "center" },
            buttons: [
                {
                    click: function ()
                    {
                        dialog.hide();
                    },
                    buttonModel: {
                        content: '<i class="fa-light fa-rocket-launch" aria-hidden="true"></i> Ignorar',
                        isPrimary: true,
                        cssClass: 'e-success custom-button'
                    }
                },
                {
                    click: function ()
                    {
                        const txtDataInicial = document.getElementById('txtDataInicial');
                        if (txtDataInicial && txtDataInicial.ej2_instances && txtDataInicial.ej2_instances[0])
                        {
                            txtDataInicial.ej2_instances[0].value = null;
                            txtDataInicial.ej2_instances[0].dataBind();
                        } else
                        {
                            $('#txtDataInicial').val('');
                        }
                        $('#txtDataInicial').focus();
                        dialog.hide();
                    },
                    buttonModel: {
                        content: '<i class="fa fa-calendar" aria-hidden="true"></i> Mudar Data Inicial',
                        cssClass: 'e-warning custom-button'
                    }
                },
                {
                    click: function ()
                    {
                        const diasSelect = document.getElementById('lstDias').ej2_instances[0];
                        if (diasSelect instanceof ej.dropdowns.MultiSelect)
                        {
                            diasSelect.value = [];
                        }
                        dialog.hide();
                    },
                    buttonModel: {
                        content: '<i class="fa-regular fa-broom-ball" aria-hidden="true"></i> Limpar Dias da Semana',
                        cssClass: 'e-danger custom-button'
                    }
                }
            ],
            animationSettings: { effect: 'Zoom' },
            cssClass: 'custom-dialog',
            width: '450px',
            height: 'auto',
            visible: true,
            close: () =>
            {
                dialog.destroy();
            }
        });

        // Append dialog to the specified container
        dialog.appendTo('#dialog-container-diassemana');
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("dialogs.js", "showDialogDiasSemana", error);
    }
};

/**
 * Callbacks de diálogo (legacy - manter para compatibilidade)
 */
window.onChange = function (args)
{
    try
    {
        if (window.dialogObj)
        {
            if (args.checked)
            {
                window.dialogObj.overlayClick = function ()
                {
                    window.dialogObj.hide();
                };
            } else
            {
                window.dialogObj.overlayClick = function ()
                {
                    window.dialogObj.show();
                };
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("dialogs.js", "onChange", error);
    }
};

window.dialogClose = function ()
{
    try
    {
        if (window.dialogBtn)
        {
            window.dialogBtn.style.display = 'block';
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("dialogs.js", "dialogClose", error);
    }
};

window.dialogOpen = function ()
{
    try
    {
        if (window.dialogBtn)
        {
            window.dialogBtn.style.display = 'none';
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("dialogs.js", "dialogOpen", error);
    }
};

window.dlgButtonClick = function ()
{
    try
    {
        if (window.dialogObj)
        {
            window.dialogObj.hide();
        }
        // Lógica para inserir o requisitante
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("dialogs.js", "dlgButtonClick", error);
    }
};

window.dlgButtonCloseClick = function ()
{
    try
    {
        if (window.dialogObj)
        {
            window.dialogObj.hide();
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("dialogs.js", "dlgButtonCloseClick", error);
    }
};
