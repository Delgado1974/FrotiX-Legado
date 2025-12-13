// wwwroot/js/calendario-config.js

// Tradução manual para português do Brasil
function configurarCalendarioPtBR()
{
    // Definir traduções
    if (typeof ej !== 'undefined' && ej.base && ej.base.L10n)
    {
        ej.base.L10n.load({
            'pt-BR': {
                'calendar': {
                    today: 'Hoje'
                },
                'datepicker': {
                    placeholder: 'Selecione uma data',
                    today: 'Hoje'
                }
            }
        });
    }
}

function criarCalendario(elementoId, dataInicial)
{
    // Criar calendário com nomes em português manualmente
    var calendario = new ej.calendars.Calendar({
        value: dataInicial || new Date(),
        firstDayOfWeek: 0, // Domingo
        // Nomes dos dias da semana em português
        dayHeaderFormat: 'Short',
        // Eventos para traduzir manualmente
        created: function ()
        {
            traduzirCalendario(elementoId);
        },
        navigated: function ()
        {
            traduzirCalendario(elementoId);
        }
    });

    calendario.appendTo('#' + elementoId);
    return calendario;
}

function traduzirCalendario(elementoId)
{
    // Traduzir dias da semana
    var diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    var meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    setTimeout(function ()
    {
        // Traduzir cabeçalho dos dias
        var elemento = document.getElementById(elementoId);
        if (elemento)
        {
            var headers = elemento.querySelectorAll('.e-calendar th');
            headers.forEach(function (header, index)
            {
                if (index < diasSemana.length)
                {
                    header.textContent = diasSemana[index];
                }
            });

            // Traduzir o título do mês/ano
            var titulo = elemento.querySelector('.e-title');
            if (titulo)
            {
                var textoOriginal = titulo.textContent;
                // Tentar identificar e traduzir o mês
                var dataAtual = titulo.getAttribute('aria-label');
                // Esta é uma abordagem básica, você pode melhorar conforme necessário
            }
        }
    }, 100);
}

// Expor funções globalmente
window.CalendarioConfig = {
    configurar: configurarCalendarioPtBR,
    criar: criarCalendario,
    traduzir: traduzirCalendario
};
