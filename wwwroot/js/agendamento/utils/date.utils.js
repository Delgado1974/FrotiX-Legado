// ====================================================================
// DATE UTILS - Utilitários para manipulação de datas
// ====================================================================

/**
 * Arredonda hora para o próximo intervalo especificado
 * param {Date|string} hora - Data/hora a ser arredondada
 * param {number} intervaloMinutos - Intervalo em minutos (ex: 10, 15, 30, 60)
 * returns {string} Hora arredondada no formato "HH:mm"
 */
window.arredondarHora = function (hora, intervaloMinutos = 10)
{
    try
    {
        const m = moment(hora);
        const minutos = m.minutes();
        const resto = minutos % intervaloMinutos;

        if (resto !== 0)
        {
            m.add(intervaloMinutos - resto, 'minutes');
        }

        m.seconds(0);
        m.milliseconds(0);

        return m.format("HH:mm");
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("date.utils.js", "arredondarHora", error);
        return "00:00";
    }
};

/**
 * Converte Date para string no formato YYYY-MM-DD
 * param {Date|string} d - Data
 * returns {string} Data no formato YYYY-MM-DD
 */
window.toDateOnlyString = function (d)
{
    try
    {
        const dt = d instanceof Date ? d : new Date(d);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        return `${y}-${m}-${dd}`;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("date.utils.js", "toDateOnlyString", error);
        return null;
    }
};

/**
 * Converte para Date apenas com data (sem hora)
 * param {Date|string} date - Data
 * returns {Date} Data sem hora
 */
window.toLocalDateOnly = function (date)
{
    try
    {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("date.utils.js", "toLocalDateOnly", error);
        return null;
    }
};

/**
 * Converte data e hora para string ISO local
 * param {Date} date - Data
 * param {string} timeStr - Hora no formato "HH:mm"
 * returns {string} Data/hora no formato ISO local
 */
window.toLocalDateTimeString = function (date, timeStr)
{
    try
    {
        if (!date) return null;
        const [hh, mm] = (timeStr || "").split(":").map(Number);
        const d = new Date(date);
        if (!isNaN(hh) && !isNaN(mm))
        {
            d.setHours(hh, mm, 0, 0);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
        }
        return null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("date.utils.js", "toLocalDateTimeString", error);
        return null;
    }
};

/**
 * Formata data no padrío DD/MM/YYYY
 * param {Date} dateObj - Data
 * returns {string} Data formatada
 */
window.formatDate = function (dateObj)
{
    try
    {
        const day = ("0" + dateObj.getDate()).slice(-2);
        const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("date.utils.js", "formatDate", error);
        return "";
    }
};

/**
 * Formata data local
 * param {Date} d - Data
 * returns {string} Data formatada
 */
window.fmtDateLocal = function (d)
{
    try
    {
        const dt = new Date(d);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const day = String(dt.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("date.utils.js", "fmtDateLocal", error);
        return "";
    }
};

/**
 * Cria string de data/hora local
 * param {string} yyyyMMdd - Data no formato YYYY-MM-DD
 * param {string} hhmm - Hora no formato HH:mm
 * returns {string} DateTime local
 */
window.makeLocalDateTime = function (yyyyMMdd, hhmm)
{
    try
    {
        const [hh, mm] = String(hhmm || "00:00").split(":");
        return `${yyyyMMdd}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("date.utils.js", "makeLocalDateTime", error);
        return "";
    }
};

/**
 * Parseia data em vários formatos
 * param {*} d - Data em qualquer formato
 * returns {Date|null} Data parseada ou null
 */
window.parseDate = function (d)
{
    try
    {
        if (!d) return null;

        if (d instanceof Date && !isNaN(d))
        {
            return d;
        }

        const s = String(d).trim();

        // DD/MM/YYYY
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s))
        {
            const [dia, mes, ano] = s.split("/");
            return new Date(Number(ano), Number(mes) - 1, Number(dia));
        }

        // YYYY-MM-DD
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s))
        {
            const [ano, mes, dia] = s.split("-");
            return new Date(Number(ano), Number(mes) - 1, Number(dia));
        }

        const parsed = Date.parse(s);
        if (!isNaN(parsed))
        {
            return new Date(parsed);
        }

        return null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("date.utils.js", "parseDate", error);
        return null;
    }
};

/**
 * Adiciona dias a uma data
 * param {string} dateString - Data em string
 * param {number} days - Número de dias
 * returns {string|null} Nova data ou null
 */
window.addDaysLocal = function (dateString, days)
{
    try
    {
        if (!dateString) return null;
        const d = new Date(dateString);
        if (isNaN(d)) return null;
        d.setDate(d.getDate() + (Number.isFinite(days) ? days : 0));
        const pad = (n) => String(n).padStart(2, '0');
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("date.utils.js", "addDaysLocal", error);
        return null;
    }
};

/**
 * Delay assíncrono
 * param {number} ms - Milissegundos
 * returns {Promise}
 */
window.delay = function (ms)
{
    try
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("date.utils.js", "delay", error);
        return Promise.resolve();
    }
};
