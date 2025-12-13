// ====================================================================
// RECORRENCIA INIT - Inicialização dos controles de recorrência
// ====================================================================

/**
 * Inicializa todos os controles relacionados à recorrência
 * Deve ser chamado após o modal ser exibido e os controles renderizados
 */
window.inicializarControlesRecorrencia = function ()
{
    try
    {
        console.log("🔧 Inicializando controles de recorrência...");

        // Inicializar cada controle
        window.inicializarLstDiasMes();
        window.inicializarLstDias();
        window.inicializarTxtFinalRecorrencia();

        console.log("✅ Controles de recorrência inicializados");

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("recorrencia-init.js", "inicializarControlesRecorrencia", error);
    }
};

/**
 * Inicializa o dropdown de dias do mês (1-31)
 * ✅ EXPOSTA GLOBALMENTE para poder ser chamada de outros lugares
 */
window.inicializarLstDiasMes = function ()
{
    try
    {
        const lstDiasMesElement = document.getElementById("lstDiasMes");

        if (!lstDiasMesElement)
        {
            console.warn("⚠️ lstDiasMes não encontrado no DOM");
            return false;
        }

        // Aguardar instância Syncfusion
        if (!lstDiasMesElement.ej2_instances || !lstDiasMesElement.ej2_instances[0])
        {
            console.warn("⚠️ lstDiasMes ainda não foi renderizado");
            return false;
        }

        const lstDiasMesObj = lstDiasMesElement.ej2_instances[0];

        // Verificar se já está populado
        if (lstDiasMesObj.dataSource && lstDiasMesObj.dataSource.length > 0)
        {
            console.log("ℹ️ lstDiasMes já está populado");
            return true;
        }

        // Criar array com dias de 1 a 31
        const diasDoMes = [];
        for (let i = 1; i <= 31; i++)
        {
            diasDoMes.push({
                Value: i,
                Text: i.toString()
            });
        }

        // Definir dataSource
        lstDiasMesObj.dataSource = diasDoMes;
        lstDiasMesObj.dataBind();

        console.log("✅ lstDiasMes populado com 31 dias");
        return true;

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("recorrencia-init.js", "inicializarLstDiasMes", error);
        return false;
    }
};

/**
 * Inicializa o multiselect de dias da semana
 * ✅ EXPOSTA GLOBALMENTE para poder ser chamada de outros lugares
 */
window.inicializarLstDias = function ()
{
    try
    {
        const lstDiasElement = document.getElementById("lstDias");

        if (!lstDiasElement)
        {
            console.warn("⚠️ lstDias não encontrado no DOM");
            return false;
        }

        // Aguardar instância Syncfusion
        if (!lstDiasElement.ej2_instances || !lstDiasElement.ej2_instances[0])
        {
            console.warn("⚠️ lstDias ainda não foi renderizado");
            return false;
        }

        const lstDiasObj = lstDiasElement.ej2_instances[0];

        // Verificar se já está populado
        if (lstDiasObj.dataSource && lstDiasObj.dataSource.length > 0)
        {
            console.log("ℹ️ lstDias já está populado");
            return true;
        }

        // Dias da semana
        const diasDaSemana = [
            { Value: 0, Text: "Domingo" },
            { Value: 1, Text: "Segunda" },
            { Value: 2, Text: "Terça" },
            { Value: 3, Text: "Quarta" },
            { Value: 4, Text: "Quinta" },
            { Value: 5, Text: "Sexta" },
            { Value: 6, Text: "Sábado" }
        ];

        lstDiasObj.dataSource = diasDaSemana;
        lstDiasObj.dataBind();

        console.log("✅ lstDias populado com dias da semana");
        return true;

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("recorrencia-init.js", "inicializarLstDias", error);
        return false;
    }
};

/**
 * Inicializa o DatePicker de data final de recorrência
 * ✅ EXPOSTA GLOBALMENTE para poder ser chamada de outros lugares
 */
window.inicializarTxtFinalRecorrencia = function ()
{
    try
    {
        const txtFinalRecorrenciaElement = document.getElementById("txtFinalRecorrencia");

        if (!txtFinalRecorrenciaElement)
        {
            console.warn("⚠️ txtFinalRecorrencia não encontrado no DOM");
            return false;
        }

        // Aguardar instância Syncfusion
        if (!txtFinalRecorrenciaElement.ej2_instances || !txtFinalRecorrenciaElement.ej2_instances[0])
        {
            console.warn("⚠️ txtFinalRecorrencia ainda não foi renderizado");
            return false;
        }

        const txtFinalRecorrenciaObj = txtFinalRecorrenciaElement.ej2_instances[0];

        // Definir data mínima como hoje
        const hoje = new Date();
        txtFinalRecorrenciaObj.min = hoje;

        console.log("✅ txtFinalRecorrencia configurado");
        return true;

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("recorrencia-init.js", "inicializarTxtFinalRecorrencia", error);
        return false;
    }
};

/**
* ============================================
* INICIALIZAÇÃO DO DROPDOWN DE PERÍODOS
* ============================================
* 
* Este código deve ser executado quando o modal abre
* para transformar o input em um DropDownList
*/

/**
 * Inicializa ou reconstrói o dropdown de períodos
 */
window.inicializarDropdownPeriodos = function ()
{
    try
    {
        console.log("🔧 Inicializando dropdown de períodos...");

        const lstPeriodosElement = document.getElementById("lstPeriodos");

        if (!lstPeriodosElement)
        {
            console.error("❌ Elemento lstPeriodos não encontrado!");
            return;
        }

        // Destruir instância anterior se existir
        if (lstPeriodosElement.ej2_instances && lstPeriodosElement.ej2_instances[0])
        {
            console.log("🗑️ Destruindo instância anterior...");
            lstPeriodosElement.ej2_instances[0].destroy();
        }

        // Dados dos períodos
        const periodos = [
            { PeriodoId: "D", Periodo: "Diário" },
            { PeriodoId: "S", Periodo: "Semanal" },
            { PeriodoId: "Q", Periodo: "Quinzenal" },
            { PeriodoId: "M", Periodo: "Mensal" },
            { PeriodoId: "V", Periodo: "Dias Variados" }
        ];

        // Criar nova instância do DropDownList
        const dropdownPeriodos = new ej.dropdowns.DropDownList({
            dataSource: periodos,
            fields: {
                text: 'Periodo',
                value: 'PeriodoId'
            },
            placeholder: 'Selecione o período...',
            popupHeight: '200px',
            // change: window.PeriodosValueChange,  // ❌ REMOVIDO - Substituído por recorrencia-logic.js
            floatLabelType: 'Never',
            cssClass: 'e-outline',
            width: '100%'
        });

        // Renderizar o dropdown
        dropdownPeriodos.appendTo(lstPeriodosElement);

        console.log("✅ Dropdown de períodos inicializado com sucesso!");
        console.log("   📊 Total de períodos:", periodos.length);

    } catch (error)
    {
        console.error("❌ Erro ao inicializar dropdown de períodos:", error);
        if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("recorrencia-init.js", "inicializarDropdownPeriodos", error);
        }
    }
};

/**
 * Reconstrói o dropdown de períodos (útil para resetar)
 */
window.rebuildLstPeriodos = function ()
{
    try
    {
        console.log("🔄 Reconstruindo dropdown de períodos...");
        window.inicializarDropdownPeriodos();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("recorrencia-init.js", "rebuildLstPeriodos", error);
    }
};

/**
* ============================================
* AUTO-INICIALIZAÇÃO
* ============================================
*/

// Aguardar o Syncfusion carregar
if (typeof ej !== 'undefined' && ej.dropdowns && ej.dropdowns.DropDownList)
{
    console.log("✅ Syncfusion DropDownList disponível");

    // Aguardar um pouco para garantir que o elemento existe
    setTimeout(() =>
    {
        try
        {
            if (document.getElementById("lstPeriodos"))
            {
                window.inicializarDropdownPeriodos();
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("recorrencia-init.js", "auto-init", error);
        }
    }, 500);
}
else
{
    console.warn("⚠️ Syncfusion ainda não carregado, aguardando...");
}
