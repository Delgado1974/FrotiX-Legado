// alertas_upsert.js - Cadastro e Edição de Alertas FrotiX
// Versão com suporte completo a recorrência (TipoExibicao 1-8)

$(document).ready(function () 
{
    try
    {
        console.log('===== ALERTAS UPSERT CARREGADO =====');
        console.log('jQuery versão:', $.fn.jquery);
        console.log('Cards encontrados:', $('.tipo-alerta-card').length);

        inicializarControles();
        configurarEventHandlers();
        aplicarSelecaoInicial();
        configurarValidacao();
        configurarAvisoUsuarios();

        console.log('===== INICIALIZAÇÃO COMPLETA =====');
    }
    catch (error)
    {
        console.error('ERRO NA INICIALIZAÇÃO:', error);
        TratamentoErroComLinha("alertas_upsert.js", "document.ready", error);
    }
});

function inicializarControles() 
{
    try
    {
        //// Configurar tooltips Syncfusion
        //if (typeof ej !== 'undefined' && ej.popups && ej.popups.Tooltip) 
        //{
        //    var tooltip = new ej.popups.Tooltip({
        //        cssClass: 'ftx-tooltip-noarrow',
        //        position: 'TopCenter',
        //        isSticky: true,  // ✅ Mantém visível até clicar fora
        //        opensOn: 'Hover',
        //        closeDelay: 500,  // Delay de 500ms antes de fechar
        //        animation: {
        //            open: { effect: 'FadeIn', duration: 150 },
        //            close: { effect: 'FadeOut', duration: 150 }
        //        }
        //    });
        //    tooltip.appendTo('body');
        //}
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_upsert.js", "inicializarControles", error);
    }
}

function configurarEventHandlers() 
{
    try
    {
        console.log('>>> Configurando event handlers...');

        // Seleção de tipo de alerta
        $(document).off('click', '.tipo-alerta-card').on('click', '.tipo-alerta-card', function (e) 
        {
            try
            {
                console.log('===== CLICK DETECTADO =====');
                e.preventDefault();
                e.stopPropagation();

                // Remove seleção de todos
                $('.tipo-alerta-card').removeClass('selected');

                // Adiciona seleção ao clicado
                $(this).addClass('selected');

                var tipo = $(this).data('tipo');
                $('#TipoAlerta').val(tipo);

                console.log('Tipo selecionado:', tipo);
                console.log('Possui classe selected:', $(this).hasClass('selected'));
                console.log('Classes do card:', $(this).attr('class'));

                // Mostrar/ocultar campos relacionados
                configurarCamposRelacionados(tipo);
            }
            catch (error)
            {
                console.error('ERRO no click handler:', error);
                TratamentoErroComLinha("alertas_upsert.js", "tipo-alerta-card.click", error);
            }
        });

        // Mudança no tipo de exibição
        var tipoExibicaoDropdown = document.querySelector("#TipoExibicao");
        if (tipoExibicaoDropdown && tipoExibicaoDropdown.ej2_instances) 
        {
            tipoExibicaoDropdown.ej2_instances[0].change = function (args) 
            {
                try
                {
                    configurarCamposExibicao(args.value);
                }
                catch (error)
                {
                    TratamentoErroComLinha("alertas_upsert.js", "TipoExibicao.change", error);
                }
            };
        }

        // Submit do formulário
        $('#formAlerta').on('submit', function (e) 
        {
            try
            {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // Previne múltiplas chamadas

                if (!validarFormulario()) 
                {
                    return false;
                }

                // Desabilitar botão de submit para evitar cliques duplos
                var btnSubmit = $(this).find('button[type="submit"]');
                if (btnSubmit.length)
                {
                    btnSubmit.prop('disabled', true);
                }

                salvarAlerta();

                return false;
            }
            catch (error)
            {
                TratamentoErroComLinha("alertas_upsert.js", "formAlerta.submit", error);
                return false;
            }
        });

        console.log('>>> Event handlers configurados!');
    }
    catch (error)
    {
        console.error('ERRO em configurarEventHandlers:', error);
        TratamentoErroComLinha("alertas_upsert.js", "configurarEventHandlers", error);
    }
}

function configurarCamposRelacionados(tipo) 
{
    try
    {
        // Ocultar todos os campos relacionados
        $('#divViagem, #divManutencao, #divMotorista, #divVeiculo').hide();
        $('#secaoVinculos').hide();

        // Limpar valores
        if (document.querySelector("#ViagemId")?.ej2_instances) 
        {
            document.querySelector("#ViagemId").ej2_instances[0].value = null;
        }
        if (document.querySelector("#ManutencaoId")?.ej2_instances) 
        {
            document.querySelector("#ManutencaoId").ej2_instances[0].value = null;
        }
        if (document.querySelector("#MotoristaId")?.ej2_instances) 
        {
            document.querySelector("#MotoristaId").ej2_instances[0].value = null;
        }
        if (document.querySelector("#VeiculoId")?.ej2_instances) 
        {
            document.querySelector("#VeiculoId").ej2_instances[0].value = null;
        }

        // Mostrar campo específico baseado no tipo
        switch (parseInt(tipo)) 
        {
            case 1: // Agendamento
                $('#divViagem').show();
                $('#secaoVinculos').show();
                break;
            case 2: // Manutenção
                $('#divManutencao').show();
                $('#secaoVinculos').show();
                break;
            case 3: // Motorista
                $('#divMotorista').show();
                $('#secaoVinculos').show();
                break;
            case 4: // Veículo
                $('#divVeiculo').show();
                $('#secaoVinculos').show();
                break;
            case 5: // Anúncio
            case 6: // Diversos
                // Não tem vínculos específicos
                break;
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_upsert.js", "configurarCamposRelacionados", error);
    }
}

/**
 * Configura a exibição dos campos baseado no TipoExibicao selecionado
 * 
 * TipoExibicao:
 * 1 = Ao abrir o sistema
 * 2 = Em Horário Específico
 * 3 = Em Data/Hora Específica
 * 4 = Recorrente - Diário
 * 5 = Recorrente - Semanal
 * 6 = Recorrente - Quinzenal
 * 7 = Recorrente - Mensal
 * 8 = Recorrente - Dias Variados
 */
function configurarCamposExibicao(tipoExibicao) 
{
    try
    {
        var tipo = parseInt(tipoExibicao);
        console.log('Configurando campos para TipoExibicao:', tipo);

        // ===================================================================
        // 1. ESCONDER TODOS OS CAMPOS PRIMEIRO
        // ===================================================================
        $('#divDataExibicao').hide();
        $('#divHorarioExibicao').hide();
        $('#divDataExpiracao').hide();
        $('#divDiasAlerta').hide();
        $('#divDiaMesAlerta').hide();
        $('#calendarContainerAlerta').hide();

        // ===================================================================
        // 2. AJUSTAR LABELS CONFORME O TIPO
        // ===================================================================
        var lblDataExibicao = document.getElementById('lblDataExibicao');
        var lblHorarioExibicao = document.getElementById('lblHorarioExibicao');

        // Reset labels para padrão
        if (lblDataExibicao) lblDataExibicao.textContent = 'Data de Exibição';
        if (lblHorarioExibicao) lblHorarioExibicao.textContent = 'Horário de Exibição';

        // ===================================================================
        // 3. MOSTRAR CAMPOS CONFORME O TIPO DE EXIBIÇÃO
        // ===================================================================
        switch (tipo) 
        {
            case 1: // Ao abrir o sistema
                // Apenas Data de Expiração (opcional)
                $('#divDataExpiracao').show();
                break;

            case 2: // Em Horário Específico
                // Horário + Data de Expiração
                $('#divHorarioExibicao').show();
                $('#divDataExpiracao').show();
                break;

            case 3: // Em Data/Hora Específica
                // Data + Horário + Data de Expiração
                $('#divDataExibicao').show();
                $('#divHorarioExibicao').show();
                $('#divDataExpiracao').show();
                break;

            case 4: // Recorrente - Diário (seg-sex automático)
                // Data Inicial + Horário (opcional) + Data Final
                if (lblDataExibicao) lblDataExibicao.textContent = 'Data Inicial';
                $('#divDataExibicao').show();
                $('#divHorarioExibicao').show();
                $('#divDataExpiracao').show();
                break;

            case 5: // Recorrente - Semanal
                // Data Inicial + Horário + Data Final + Dias da Semana
                if (lblDataExibicao) lblDataExibicao.textContent = 'Data Inicial';
                $('#divDataExibicao').show();
                $('#divHorarioExibicao').show();
                $('#divDataExpiracao').show();
                $('#divDiasAlerta').show();
                break;

            case 6: // Recorrente - Quinzenal
                // Data Inicial + Horário + Data Final + Dias da Semana
                if (lblDataExibicao) lblDataExibicao.textContent = 'Data Inicial';
                $('#divDataExibicao').show();
                $('#divHorarioExibicao').show();
                $('#divDataExpiracao').show();
                $('#divDiasAlerta').show();
                break;

            case 7: // Recorrente - Mensal
                // Data Inicial + Horário + Data Final + Dia do Mês
                if (lblDataExibicao) lblDataExibicao.textContent = 'Data Inicial';
                $('#divDataExibicao').show();
                $('#divHorarioExibicao').show();
                $('#divDataExpiracao').show();
                $('#divDiaMesAlerta').show();
                break;

            case 8: // Recorrente - Dias Variados
                // Horário + Data Final + Calendário
                $('#divHorarioExibicao').show();
                $('#divDataExpiracao').show();
                $('#calendarContainerAlerta').show();
                // Inicializar calendário se necessário
                if (typeof initCalendarioAlerta === 'function' && !window.calendarioAlertaInstance) {
                    initCalendarioAlerta();
                }
                break;

            default:
                // Tipo desconhecido - mostrar apenas Data de Expiração
                $('#divDataExpiracao').show();
                break;
        }

        console.log('Campos configurados para tipo:', tipo);
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_upsert.js", "configurarCamposExibicao", error);
    }
}

function aplicarSelecaoInicial() 
{
    try
    {
        // Aplicar seleção inicial do tipo de alerta
        var tipoAtual = $('#TipoAlerta').val();
        if (tipoAtual) 
        {
            $(`.tipo-alerta-card[data-tipo="${tipoAtual}"]`).addClass('selected');
            configurarCamposRelacionados(tipoAtual);
        }

        // Aplicar configuração inicial do tipo de exibição
        var tipoExibicaoDropdown = document.querySelector("#TipoExibicao");
        if (tipoExibicaoDropdown && tipoExibicaoDropdown.ej2_instances) 
        {
            var tipoExibicaoAtual = tipoExibicaoDropdown.ej2_instances[0].value;
            if (tipoExibicaoAtual) 
            {
                configurarCamposExibicao(tipoExibicaoAtual);
            }
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_upsert.js", "aplicarSelecaoInicial", error);
    }
}

function configurarValidacao() 
{
    try
    {
        // Adicionar validação customizada aos campos Syncfusion
        var tituloInput = document.querySelector("#Titulo");
        if (tituloInput && tituloInput.ej2_instances) 
        {
            tituloInput.ej2_instances[0].blur = function () 
            {
                validarCampo('Titulo', 'Título é obrigatório');
            };
        }

        var descricaoInput = document.querySelector("#Descricao");
        if (descricaoInput && descricaoInput.ej2_instances) 
        {
            descricaoInput.ej2_instances[0].blur = function () 
            {
                validarCampo('Descricao', 'Descrição é obrigatória');
            };
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_upsert.js", "configurarValidacao", error);
    }
}

function configurarAvisoUsuarios()
{
    try
    {
        var usuariosSelect = document.querySelector("#UsuariosIds");
        if (usuariosSelect && usuariosSelect.ej2_instances)
        {
            var multiselect = usuariosSelect.ej2_instances[0];

            // Criar div de aviso se não existir
            if (!$('#avisoTodosUsuarios').length)
            {
                var avisoHtml = '<div id="avisoTodosUsuarios" style="display:none; margin-top: 8px; padding: 8px 12px; background-color: #e0f2fe; border-left: 3px solid #0ea5e9; border-radius: 4px; font-size: 0.85rem; color: #0c4a6e;"><i class="fa-duotone fa-info-circle" style="margin-right: 6px;"></i>Nenhum usuário selecionado. O alerta será exibido para <strong>todos os usuários</strong>.</div>';
                $(usuariosSelect).closest('.col-md-12').append(avisoHtml);
            }

            // Evento de mudança no multiselect
            multiselect.change = function (args)
            {
                var usuarios = multiselect.value;
                if (!usuarios || usuarios.length === 0)
                {
                    $('#avisoTodosUsuarios').slideDown(200);
                    $('[data-valmsg-for="UsuariosIds"]').text('').hide();
                }
                else
                {
                    $('#avisoTodosUsuarios').slideUp(200);
                }
            };

            // Verificar estado inicial
            var valoresIniciais = multiselect.value;
            if (!valoresIniciais || valoresIniciais.length === 0)
            {
                $('#avisoTodosUsuarios').show();
            }
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_upsert.js", "configurarAvisoUsuarios", error);
    }
}

function validarCampo(campoId, mensagemErro) 
{
    try
    {
        var campo = document.querySelector(`#${campoId}`);
        var spanErro = $(`[data-valmsg-for="${campoId}"]`);

        if (campo && campo.ej2_instances) 
        {
            var valor = campo.ej2_instances[0].value;

            if (!valor || valor.trim() === '') 
            {
                spanErro.text(mensagemErro).show();
                return false;
            }
            else 
            {
                spanErro.text('').hide();
                return true;
            }
        }

        return true;
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_upsert.js", "validarCampo", error);
        return false;
    }
}

function validarFormulario() 
{
    try
    {
        var valido = true;

        // Validar título
        if (!validarCampo('Titulo', 'O título é obrigatório')) 
        {
            valido = false;
        }

        // Validar descrição
        if (!validarCampo('Descricao', 'A descrição é obrigatória')) 
        {
            valido = false;
        }

        // Validar tipo de alerta
        var tipoAlerta = $('#TipoAlerta').val();
        if (!tipoAlerta || tipoAlerta == '0') 
        {
            AppToast.show("Amarelo", "Selecione um tipo de alerta", 2000);
            valido = false;
        }

        // Usuários agora são opcionais (se vazio = todos os usuários)
        var usuariosSelect = document.querySelector("#UsuariosIds");
        if (usuariosSelect && usuariosSelect.ej2_instances) 
        {
            $('[data-valmsg-for="UsuariosIds"]').text('').hide();
        }

        // Validar campos de exibição conforme o tipo
        var tipoExibicao = parseInt(document.querySelector("#TipoExibicao")?.ej2_instances?.[0]?.value || 1);

        switch (tipoExibicao)
        {
            case 2: // Horário específico
                var horario = document.querySelector("#HorarioExibicao")?.ej2_instances?.[0]?.value;
                if (!horario) 
                {
                    AppToast.show("Amarelo", "Selecione o horário de exibição", 2000);
                    valido = false;
                }
                break;

            case 3: // Data/Hora específica
                var dataExib = document.querySelector("#DataExibicao")?.ej2_instances?.[0]?.value;
                if (!dataExib) 
                {
                    AppToast.show("Amarelo", "Selecione a data de exibição", 2000);
                    valido = false;
                }
                break;

            case 4: // Recorrente Diário
            case 5: // Recorrente Semanal
            case 6: // Recorrente Quinzenal
            case 7: // Recorrente Mensal
                var dataInicial = document.querySelector("#DataExibicao")?.ej2_instances?.[0]?.value;
                var dataFinal = document.querySelector("#DataExpiracao")?.ej2_instances?.[0]?.value;
                if (!dataInicial) 
                {
                    AppToast.show("Amarelo", "Selecione a data inicial da recorrência", 2000);
                    valido = false;
                }
                if (!dataFinal) 
                {
                    AppToast.show("Amarelo", "Selecione a data final da recorrência", 2000);
                    valido = false;
                }
                // Validar dias da semana para Semanal/Quinzenal
                if (tipoExibicao === 5 || tipoExibicao === 6)
                {
                    var diasSemana = document.querySelector("#lstDiasAlerta")?.ej2_instances?.[0]?.value;
                    if (!diasSemana || diasSemana.length === 0)
                    {
                        AppToast.show("Amarelo", "Selecione pelo menos um dia da semana", 2000);
                        valido = false;
                    }
                }
                // Validar dia do mês para Mensal
                if (tipoExibicao === 7)
                {
                    var diaMes = document.querySelector("#lstDiasMesAlerta")?.ej2_instances?.[0]?.value;
                    if (!diaMes)
                    {
                        AppToast.show("Amarelo", "Selecione o dia do mês", 2000);
                        valido = false;
                    }
                }
                break;

            case 8: // Recorrente Dias Variados
                var datasSelecionadas = window.datasAlertaSelecionadas || [];
                if (datasSelecionadas.length === 0)
                {
                    AppToast.show("Amarelo", "Selecione pelo menos uma data no calendário", 2000);
                    valido = false;
                }
                break;
        }

        return valido;
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_upsert.js", "validarFormulario", error);
        return false;
    }
}

function salvarAlerta() 
{
    // Prevenir múltiplas chamadas
    if (window.salvandoAlerta)
    {
        console.log('Já existe um salvamento em andamento, ignorando...');
        return;
    }

    try
    {
        window.salvandoAlerta = true;

        var dados = obterDadosFormulario();

        if (!dados)
        {
            console.error('Dados do formulário inválidos');
            window.salvandoAlerta = false;
            return;
        }

        Swal.fire({
            title: 'Salvando...',
            text: 'Aguarde enquanto o alerta é salvo',
            allowOutsideClick: false,
            didOpen: () =>
            {
                Swal.showLoading();
            }
        });

        $.ajax({
            url: '/api/AlertasFrotiX/Salvar',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dados),
            success: function (response) 
            {
                try
                {
                    window.salvandoAlerta = false;
                    Swal.close();

                    if (response.success) 
                    {
                        AppToast.show("Verde", response.message || "Alerta salvo com sucesso!", 2000);

                        // Redirecionar após 1.5 segundos
                        setTimeout(function () 
                        {
                            window.location.href = '/AlertasFrotiX';
                        }, 1500);
                    }
                    else 
                    {
                        Swal.fire('Erro', response.message || 'Erro ao salvar alerta', 'error');
                    }
                }
                catch (error)
                {
                    window.salvandoAlerta = false;
                    TratamentoErroComLinha("alertas_upsert.js", "salvarAlerta.success", error);
                }
            },
            error: function (xhr, status, error) 
            {
                window.salvandoAlerta = false;
                Swal.close();
                TratamentoErroComLinha("alertas_upsert.js", "salvarAlerta.error", error);

                var mensagem = 'Erro ao salvar alerta';
                if (xhr.responseJSON && xhr.responseJSON.message) 
                {
                    mensagem = xhr.responseJSON.message;
                }
                else if (xhr.status === 404) 
                {
                    mensagem = 'Rota não encontrada (404). Verifique se a URL /AlertasFrotiX/Salvar está correta.';
                }
                else if (xhr.status === 500) 
                {
                    mensagem = 'Erro no servidor. Verifique os logs do backend.';
                }

                Swal.fire('Erro', mensagem, 'error');

                // Re-habilitar botão de submit
                $('#formAlerta button[type="submit"]').prop('disabled', false);
            }
        });
    }
    catch (error)
    {
        window.salvandoAlerta = false;
        Swal.close();
        TratamentoErroComLinha("alertas_upsert.js", "salvarAlerta", error);

        // Re-habilitar botão de submit
        $('#formAlerta button[type="submit"]').prop('disabled', false);
    }
}

function obterDadosFormulario() 
{
    try
    {
        var tipoExibicao = parseInt(document.querySelector("#TipoExibicao")?.ej2_instances?.[0]?.value || 1);

        var dados = {
            AlertasFrotiXId: $('#AlertasFrotiXId').val(),
            Titulo: document.querySelector("#Titulo")?.ej2_instances?.[0]?.value || '',
            Descricao: document.querySelector("#Descricao")?.ej2_instances?.[0]?.value || '',
            TipoAlerta: parseInt($('#TipoAlerta').val()),
            Prioridade: parseInt(document.querySelector("#Prioridade")?.ej2_instances?.[0]?.value || 1),
            TipoExibicao: tipoExibicao,
            UsuariosIds: document.querySelector("#UsuariosIds")?.ej2_instances?.[0]?.value || []
        };

        // ===================================================================
        // CAMPOS OPCIONAIS DE VÍNCULOS (baseados no TipoAlerta)
        // ===================================================================
        var tipoAlerta = dados.TipoAlerta;

        if (tipoAlerta === 1) // Agendamento
        {
            var viagemId = document.querySelector("#ViagemId")?.ej2_instances?.[0]?.value;
            if (viagemId)
            {
                viagemId = String(viagemId).trim().replace(/[^a-f0-9\-]/gi, '');
                if (viagemId.length > 0) dados.ViagemId = viagemId;
            }
        }
        else if (tipoAlerta === 2) // Manutenção
        {
            var manutencaoId = document.querySelector("#ManutencaoId")?.ej2_instances?.[0]?.value;
            if (manutencaoId)
            {
                manutencaoId = String(manutencaoId).trim().replace(/[^a-f0-9\-]/gi, '');
                if (manutencaoId.length > 0) dados.ManutencaoId = manutencaoId;
            }
        }
        else if (tipoAlerta === 3) // Motorista
        {
            var motoristaId = document.querySelector("#MotoristaId")?.ej2_instances?.[0]?.value;
            if (motoristaId)
            {
                motoristaId = String(motoristaId).trim().replace(/[^a-f0-9\-]/gi, '');
                if (motoristaId.length > 0) dados.MotoristaId = motoristaId;
            }
        }
        else if (tipoAlerta === 4) // Veículo
        {
            var veiculoId = document.querySelector("#VeiculoId")?.ej2_instances?.[0]?.value;
            if (veiculoId)
            {
                veiculoId = String(veiculoId).trim().replace(/[^a-f0-9\-]/gi, '');
                if (veiculoId.length > 0) dados.VeiculoId = veiculoId;
            }
        }

        // ===================================================================
        // CAMPOS DE EXIBIÇÃO E RECORRÊNCIA (baseados no TipoExibicao)
        // ===================================================================

        // Data de Exibição (tipos 3, 4, 5, 6, 7)
        if (tipoExibicao >= 3 && tipoExibicao <= 7)
        {
            var dataExibicao = document.querySelector("#DataExibicao")?.ej2_instances?.[0]?.value;
            if (dataExibicao) dados.DataExibicao = dataExibicao;
        }

        // Horário de Exibição (tipos 2, 3, 4, 5, 6, 7, 8)
        if (tipoExibicao >= 2)
        {
            var horario = document.querySelector("#HorarioExibicao")?.ej2_instances?.[0]?.value;
            if (horario) dados.HorarioExibicao = horario;
        }

        // Data de Expiração (todos os tipos)
        var dataExpiracao = document.querySelector("#DataExpiracao")?.ej2_instances?.[0]?.value;
        if (dataExpiracao) dados.DataExpiracao = dataExpiracao;

        // ===================================================================
        // CAMPOS ESPECÍFICOS DE RECORRÊNCIA
        // ===================================================================

        // Dias da Semana (tipos 5 e 6)
        if (tipoExibicao === 5 || tipoExibicao === 6)
        {
            var diasSemana = document.querySelector("#lstDiasAlerta")?.ej2_instances?.[0]?.value;
            if (diasSemana && diasSemana.length > 0)
            {
                dados.DiasSemana = diasSemana;
            }
        }

        // Dia do Mês (tipo 7)
        if (tipoExibicao === 7)
        {
            var diaMes = document.querySelector("#lstDiasMesAlerta")?.ej2_instances?.[0]?.value;
            if (diaMes)
            {
                dados.DiaMesRecorrencia = parseInt(diaMes);
            }
        }

        // Datas Selecionadas (tipo 8)
        if (tipoExibicao === 8)
        {
            var datasSelecionadas = window.datasAlertaSelecionadas || [];
            if (datasSelecionadas.length > 0)
            {
                // Converter para string de datas ISO
                var datasFormatadas = datasSelecionadas.map(function(d) {
                    var data = new Date(d);
                    var mes = ('0' + (data.getMonth() + 1)).slice(-2);
                    var dia = ('0' + data.getDate()).slice(-2);
                    return data.getFullYear() + '-' + mes + '-' + dia;
                });
                dados.DatasSelecionadas = datasFormatadas.join(',');
            }
        }

        console.log('Dados do formulário preparados:', dados);
        return dados;
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_upsert.js", "obterDadosFormulario", error);
        return null;
    }
}

// ============================================================================
// DROPDOWN DE MOTORISTAS COM FOTO
// ============================================================================

function configurarDropdownMotoristaComFoto()
{
    try
    {
        const motoristaDropdown = document.getElementById('MotoristaId');
        if (!motoristaDropdown?.ej2_instances?.[0])
        {
            console.log('Dropdown de motoristas não encontrado');
            return;
        }

        const dropdown = motoristaDropdown.ej2_instances[0];

        // Template para itens da lista (dropdown aberta)
        dropdown.itemTemplate = function (data)
        {
            if (!data) return '';

            // A foto está armazenada no campo Group.Name (hack do backend)
            const foto = data.Group?.Name || '/images/placeholder-user.png';
            const texto = data.Text || '';

            return `
                <div class="motorista-item-alerta">
                    <img src="${foto}" 
                         class="motorista-foto-alerta-item" 
                         alt="Foto" 
                         onerror="this.src='/images/placeholder-user.png'" />
                    <span class="motorista-nome-alerta">${texto}</span>
                </div>`;
        };

        // Template para valor selecionado
        dropdown.valueTemplate = function (data)
        {
            if (!data) return '';

            const foto = data.Group?.Name || '/images/placeholder-user.png';
            const texto = data.Text || '';

            return `
                <div class="motorista-selected-alerta">
                    <img src="${foto}" 
                         class="motorista-foto-alerta-selected" 
                         alt="Foto"
                         onerror="this.src='/images/placeholder-user.png'" />
                    <span class="motorista-nome-alerta">${texto}</span>
                </div>`;
        };

        // Força re-render
        dropdown.dataBind();

        console.log('Dropdown de motoristas configurada com foto');
    } catch (error)
    {
        console.error('Erro ao configurar dropdown motorista:', error);
        if (typeof Alerta !== 'undefined')
        {
            Alerta.TratamentoErroComLinha("alertas_upsert.js", "configurarDropdownMotoristaComFoto", error);
        }
    }
}

// Inicializar após DOM carregar
document.addEventListener('DOMContentLoaded', function ()
{
    setTimeout(configurarDropdownMotoristaComFoto, 300);
});

// Também inicializar quando o tipo de alerta "Motorista" for selecionado
// (já que o campo fica oculto inicialmente)

// ============================================================================
// DROPDOWN DE AGENDAMENTOS COM CARD RICO
// ============================================================================

function configurarDropdownAgendamentoRico()
{
    try
    {
        const viagemDropdown = document.getElementById('ViagemId');
        if (!viagemDropdown?.ej2_instances?.[0])
        {
            console.log('Dropdown de viagens não encontrado');
            return;
        }

        const dropdown = viagemDropdown.ej2_instances[0];

        // Template RICO para itens da lista (cards com detalhes)
        dropdown.itemTemplate = function (data)
        {
            if (!data) return '';

            return `
                <div class="agendamento-card-item">
                    <div class="agendamento-card-header">
                        <div class="agendamento-card-title">
                            <i class="fa-duotone fa-calendar-check"></i>
                            <strong>${data.DataInicial || 'N/A'}</strong>
                            <span class="agendamento-hora">
                              <i class="fa-duotone fa-clock"></i>
                              <strong>${data.HoraInicio || ''}</strong>
                            </span>
                        </div>
                        <span class="agendamento-badge">${data.Finalidade || 'Diversos'}</span>
                    </div>
                    
                    <div class="agendamento-card-body">
                        <div class="agendamento-rota">
                            <span class="agendamento-origem">
                                <i class="fa-duotone fa-location-dot"></i>
                                ${data.Origem || 'N/A'}
                            </span>
                            <i class="fa-duotone fa-arrow-right agendamento-seta"></i>
                            <span class="agendamento-destino">
                                <i class="fa-duotone fa-flag-checkered"></i>
                                ${data.Destino || 'N/A'}
                            </span>
                        </div>
                        
                        <div class="agendamento-requisitante">
                            <i class="fa-duotone fa-user"></i>
                            <span>${data.Requisitante || 'Não informado'}</span>
                        </div>
                    </div>
                </div>`;
        };

        // Template SIMPLES para valor selecionado
        dropdown.valueTemplate = function (data)
        {
            if (!data) return '';

            return `
                <div class="agendamento-selected">
                    <i class="fa-duotone fa-calendar-check"></i>
                    <span class="agendamento-selected-text">
                        <strong>${data.DataInicial || 'N/A'}</strong> - 
                        ${data.Origem || 'N/A'} → ${data.Destino || 'N/A'}
                    </span>
                </div>`;
        };

        // Customizar o filtro para buscar em múltiplos campos
        dropdown.filtering = function (e)
        {
            if (!e.text) return;

            const query = e.text.toLowerCase();
            const filtered = dropdown.dataSource.filter(item =>
            {
                return (
                    (item.DataInicial && item.DataInicial.toLowerCase().includes(query)) ||
                    (item.Origem && item.Origem.toLowerCase().includes(query)) ||
                    (item.Destino && item.Destino.toLowerCase().includes(query)) ||
                    (item.Requisitante && item.Requisitante.toLowerCase().includes(query)) ||
                    (item.Finalidade && item.Finalidade.toLowerCase().includes(query))
                );
            });

            e.updateData(filtered);
        };

        dropdown.dataBind();

        console.log('Dropdown de agendamentos configurada com cards ricos');
    } catch (error)
    {
        console.error('Erro ao configurar dropdown agendamento:', error);
        if (typeof Alerta !== 'undefined')
        {
            Alerta.TratamentoErroComLinha("alertas_upsert.js", "configurarDropdownAgendamentoRico", error);
        }
    }
}

// Inicializar após DOM carregar
document.addEventListener('DOMContentLoaded', function ()
{
    setTimeout(configurarDropdownAgendamentoRico, 300);
});

function configurarDropdownManutencaoRico()
{
    try
    {
        const el = document.getElementById('ManutencaoId');
        const ddl = el?.ej2_instances?.[0];
        if (!ddl) return;

        // Se o dataSource for só Text/Value, reatribui para o dataset completo (se disponível)
        if (ddl.dataSource?.length && ddl.dataSource[0].Text !== undefined && window.__manutencoesDS)
        {
            ddl.dataSource = window.__manutencoesDS;
            ddl.fields = { text: 'NumOS', value: 'ManutencaoId' };
            ddl.dataBind();
        }

        // CARD do item (popup)
        ddl.itemTemplate = function (data)
        {
            if (!data) return '';

            // mantém seu helper simples p/ campos não datados
            const linha = (icon, val) =>
                `<span class="manutencao-dado"><i class="fa-duotone ${icon}"></i>${val || '—'}</span>`;

            // novo helper com legenda para datas
            const linhaData = (icon, rotulo, val) =>
                `<span class="manutencao-dado">
       <i class="fa-duotone ${icon}" aria-hidden="true"></i>
       <span class="manutencao-legenda">${rotulo}:</span>
       <span class="manutencao-valor">${val || '—'}</span>
     </span>`;

            const reservaTxt = (data.ReservaEnviado === 'Sim')
                ? (data.CarroReserva || 'Reserva enviada')
                : 'Reserva não enviada';

            return `
                    <div class="manutencao-card-item">
                        <div class="manutencao-card-header">
                        <div class="manutencao-card-title">
                            <i class="fa-duotone fa-screwdriver-wrench"></i>
                            <strong>OS ${data.NumOS || '—'}</strong>
                        </div>
                        </div>

                        <div class="manutencao-card-body">
                        <div class="manutencao-linha">
                            ${linhaData('fa-calendar-plus', 'Solicitação', data.DataSolicitacao)}
                            ${linhaData('fa-calendar-lines-pen', 'Disponibilização', data.DataDisponibilidade)}
                        </div>
                        <div class="manutencao-linha">
                            ${linhaData('fa-calendar-arrow-up', 'Entrega', data.DataEntrega)}
                            ${linhaData('fa-calendar-arrow-down', 'Devolução', data.DataDevolucao)}
                        </div>
                        <div class="manutencao-linha">
                            ${linha('fa-car-side', data.Veiculo)}
                            ${linha('fa-key', reservaTxt)}
                        </div>
                        </div>
                    </div>`;
        };

        // Valor selecionado (compacto)
        ddl.valueTemplate = function (data)
        {
            if (!data) return '';
            return `
<div class="manutencao-selected">
  <i class="fa-duotone fa-screwdriver-wrench"></i>
  <span class="manutencao-selected-text"><strong>OS ${data.NumOS || ''}</strong> — ${data.Veiculo || ''}</span>
</div>`;
        };

        // Filtro por múltiplos campos
        ddl.filtering = function (e)
        {
            const q = (e.text || '').toLowerCase();
            if (!q) return;
            const src = ddl.dataSource || [];
            e.updateData(src.filter(d =>
                (d.NumOS || '').toLowerCase().includes(q) ||
                (d.Veiculo || '').toLowerCase().includes(q) ||
                (d.CarroReserva || '').toLowerCase().includes(q)
            ));
        };

        ddl.dataBind();
        console.log('ManutencaoId com cards ricos ✅');
    } catch (err)
    {
        console.error('Erro ao configurar dropdown manutenção:', err);
        if (typeof Alerta !== 'undefined')
        {
            Alerta.TratamentoErroComLinha("alertas_upsert.js", "configurarDropdownManutencaoRico", err);
        }
    }
}

// chame junto com as outras inicializações
document.addEventListener('DOMContentLoaded', () =>
{
    setTimeout(configurarDropdownManutencaoRico, 300);
});
