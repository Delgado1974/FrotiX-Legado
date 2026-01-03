// ====================================================================
// FORMATTERS - Funções de formatação e utilitários gerais
// ====================================================================

/**
 * Parse int seguro
 * param {*} v - Valor
 * returns {number|null} Número ou null
 */
window.parseIntSafe = function (v)
{
    try
    {
        const n = parseInt(v, 10);
        return Number.isFinite(n) ? n : null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("formatters.js", "parseIntSafe", error);
        return null;
    }
};

/**
 * Formata data para exibição local
 * param {Date} d - Data
 * returns {string} Data formatada
 */
window.formatDateLocal = function (d)
{
    try
    {
        return window.formatDate(d);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("formatters.js", "formatDateLocal", error);
        return new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo"
        }).format(d);
    }
};

/**
 * Obtém nome do script atual
 * returns {string} Nome do script
 */
window.__getScriptName = function ()
{
    try
    {
        let script = document.currentScript;
        if (!script)
        {
            const scripts = document.getElementsByTagName("script");
            script = scripts[scripts.length - 1];
        }
        const src = script.src || "";
        const m = src.match(/(ViagemUpsert_\d+)(?:\.min)?\.js$/i);
        return m ? m[1] : "ViagemUpsert";
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("formatters.js", "__getScriptName", error);
        return "ViagemUpsert";
    }
};

// Executar e armazenar
window.__scriptName = window.__getScriptName();

/**
 * Remove data da lista (callback para template)
 * param {number} timestamp - Timestamp da data
 */
window.removeDate = function (timestamp)
{
    try
    {
        window.selectedDates = window.selectedDates.filter(d => d.Timestamp !== timestamp);

        const listBox = document.getElementById("lstDiasCalendario");
        if (listBox && listBox.ej2_instances && listBox.ej2_instances[0])
        {
            listBox.ej2_instances[0].dataSource = window.selectedDates;
            listBox.ej2_instances[0].dataBind();
        }

        const calendarObj = document.getElementById("calDatasSelecionadas");
        if (calendarObj && calendarObj.ej2_instances && calendarObj.ej2_instances[0])
        {
            const cal = calendarObj.ej2_instances[0];
            const dateToRemove = new Date(timestamp);

            let currentSelectedDates = cal.values || [];
            currentSelectedDates = currentSelectedDates.filter(date =>
            {
                const normalizedDate = new Date(date).setHours(0, 0, 0, 0);
                return normalizedDate !== timestamp;
            });

            cal.values = currentSelectedDates;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("formatters.js", "removeDate", error);
    }
};

/**
 * Calcula distância da viagem
 */
window.calcularDistanciaViagem = function ()
{
    try
    {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmFinalStr = $("#txtKmFinal").val();
        const txtQuilometragem = $("#txtQuilometragem");

        if (!kmInicialStr || !kmFinalStr)
        {
            txtQuilometragem.val("");
            txtQuilometragem.removeClass("distancia-alerta");
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(",", "."));
        const kmFinal = parseFloat(kmFinalStr.replace(",", "."));

        if (isNaN(kmInicial) || isNaN(kmFinal))
        {
            txtQuilometragem.val("");
            txtQuilometragem.removeClass("distancia-alerta");
            return;
        }

        const kmPercorrido = Math.round(kmFinal - kmInicial);
        txtQuilometragem.val(kmPercorrido);

        // Aplicar estilo vermelho negrito se > 100km
        if (kmPercorrido > 100)
        {
            txtQuilometragem.addClass("distancia-alerta");
        }
        else
        {
            txtQuilometragem.removeClass("distancia-alerta");
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("formatters.js", "calcularDistanciaViagem", error);
    }
};

/**
 * Calcula duração da viagem
 */
window.calcularDuracaoViagem = function ()
{
    try
    {
        const dataInicialStr = $("#txtDataInicial").val();
        const horaInicialStr = $("#txtHoraInicial").val();
        const dataFinalStr = $("#txtDataFinal").val();
        const horaFinalStr = $("#txtHoraFinal").val();

        if (!dataInicialStr || !horaInicialStr || !dataFinalStr || !horaFinalStr)
        {
            $("#txtDuracao").val("");
            return;
        }

        const parseDataHora = (data, hora) =>
        {
            try
            {
                if (data.includes("/"))
                {
                    const [dia, mes, ano] = data.split("/");
                    return new Date(`${ano}-${mes}-${dia}T${hora}`);
                } else if (data.includes("-"))
                {
                    return new Date(`${data}T${hora}`);
                } else
                {
                    return null;
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("formatters.js", "parseDataHora", error);
                return null;
            }
        };

        const dtInicial = parseDataHora(dataInicialStr, horaInicialStr);
        const dtFinal = parseDataHora(dataFinalStr, horaFinalStr);

        if (!dtInicial || !dtFinal || dtFinal <= dtInicial)
        {
            $("#txtDuracao").val("");
            return;
        }

        const diffMs = dtFinal - dtInicial;
        const diffHoras = (diffMs / (1000 * 60 * 60)).toFixed(2);
        $("#txtDuracao").val(Math.round(diffHoras));
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("formatters.js", "calcularDuracaoViagem", error);
    }
};

/**
 * Sincroniza listbox e badges com datas
 */
window.syncListBoxAndBadges = function ()
{
    try
    {
        const listBox = document.getElementById("lstDiasCalendario");
        if (listBox && listBox.ej2_instances && listBox.ej2_instances[0] && window.selectedDates)
        {
            listBox.ej2_instances[0].dataSource = window.selectedDates;
            listBox.ej2_instances[0].dataBind();
        }

        const totalItems = window.selectedDates ? window.selectedDates.length : 0;
        const badge1 = document.getElementById("itensBadge");
        const badge2 = document.getElementById("itensBadgeHTML");

        if (badge1) badge1.textContent = totalItems;
        if (badge2) badge2.textContent = totalItems;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("formatters.js", "syncListBoxAndBadges", error);
    }
};

/**
 * Atualiza listbox HTML com datas
 * param {Array} datas - Array de datas
 */
window.atualizarListBoxHTMLComDatas = function (datas)
{
    try
    {
        window.datasSelecionadas = [...datas];

        const listBoxHTML = document.getElementById("lstDiasCalendarioHTML");
        const divDiasSelecionados = document.getElementById("diasSelecionadosTexto");

        if (!listBoxHTML) return;

        listBoxHTML.innerHTML = "";
        let contDatas = 0;

        datas.forEach(data =>
        {
            try
            {
                const dataFormatada = moment(data).format("DD/MM/YYYY");
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.innerHTML = `<span>${dataFormatada}</span>`;
                listBoxHTML.appendChild(li);
                contDatas += 1;
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("formatters.js", "atualizarListBoxHTMLComDatas_forEach", error);
            }
        });

        const badge2 = document.getElementById("itensBadgeHTML");
        if (badge2) badge2.textContent = contDatas;

        if (divDiasSelecionados)
        {
            divDiasSelecionados.textContent = `Dias Selecionados (${datas.length})`;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("formatters.js", "atualizarListBoxHTMLComDatas", error);
    }
};
