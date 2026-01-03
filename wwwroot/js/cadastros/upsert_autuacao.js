/**
 * upsert_autuacao.js - REFATORADO COMPLETO
 * Gerenciamento de autuações e multas
 * Sistema FrotiX - Versão com Alerta.*
 * VERSÃO 100% COMPLETA - CORRIGIDO
 */

// ====================================================================
// VARIÁVEIS GLOBAIS
// ====================================================================

var ViagemId = null;
var FichaId = null;
var EscolhendoVeiculo = false;
var EscolhendoMotorista = false;

function stopEnterSubmitting(e)
{
    try
    {
        if (e.keyCode == 13)
        {
            var src = e.srcElement || e.target;
            console.log(src.tagName.toLowerCase());

            if (src.tagName.toLowerCase() !== "div")
            {
                if (e.preventDefault)
                {
                    e.preventDefault();
                } else
                {
                    e.returnValue = false;
                }
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("patrimonio.js", "stopEnterSubmitting", error);
    }
}

// ====================================================================
// FUNÇÕES DE PDF VIEWER
// ====================================================================

/**
 * Obtém a instância do PDF Viewer
 * returns {object|null} Instância do viewer ou null
 */
function getViewer()
{
    try
    {
        const viewerElement = document.getElementById('pdfviewer');
        return viewerElement?.ej2_instances?.[0] || null;
    } catch (err)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "getViewer", err);
        }
        return null;
    }
}

/**
 * Carrega um PDF no viewer
 * param {string} fileName - Nome do arquivo PDF
 */
function loadPdfInViewer(fileName)
{
    try
    {
        if (!fileName || fileName === '' || fileName === 'null')
        {
            console.warn("Nome de arquivo inválido para carregar no viewer");
            return;
        }

        const viewer = getViewer();
        if (!viewer)
        {
            console.error("Viewer não encontrado");
            return;
        }

        viewer.documentPath = fileName;
        viewer.dataBind();
        viewer.load(fileName, null);
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "loadPdfInViewer", error);
        }
        console.error(error);
    }
}

// ====================================================================
// CALLBACKS DO UPLOADER
// ====================================================================

/**
 * Callback quando arquivo é selecionado (validação)
 * param {object} args - Argumentos do evento
 */
function onAutuacaoUploadSelected(args)
{
    try
    {
        if (!args || !args.filesData || args.filesData.length === 0) return;

        const file = args.filesData[0];
        const fileName = (file?.name || "").toLowerCase();

        if (!fileName.endsWith(".pdf"))
        {
            args.cancel = true;

            if (window.AppToast?.show)
            {
                AppToast.show('Vermelho', 'Apenas arquivos PDF são permitidos', 3000);
            } else
            {
                Alerta.Warning('Arquivo Inválido', 'Apenas arquivos PDF são permitidos');
            }
        }
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "onAutuacaoUploadSelected", error);
        }
    }
}

/**
 * Callback de sucesso no upload
 * param {object} args - Argumentos do evento
 */
function onAutuacaoUploadSuccess(args)
{
    try
    {
        if (!args || !args.e) return;

        console.log('✅ Upload success args:', args);

        // Parse da resposta do servidor
        let serverResponse;
        try
        {
            serverResponse = typeof args.e.target.response === 'string'
                ? JSON.parse(args.e.target.response)
                : args.e.target.response;
        } catch (parseError)
        {
            console.error('Erro ao fazer parse da resposta:', parseError);
            return;
        }

        console.log('📦 Server response:', serverResponse);

        // Verifica se houve erro no servidor
        if (serverResponse.error)
        {
            console.error('❌ Erro do servidor:', serverResponse.error);
            if (window.AppToast?.show)
            {
                AppToast.show('Vermelho', serverResponse.error.message || 'Erro ao enviar arquivo', 3000);
            }
            return;
        }

        // Pega o nome do arquivo retornado pelo servidor
        const uploadedFiles = serverResponse.files || [];
        if (uploadedFiles.length === 0)
        {
            console.error('❌ Nenhum arquivo retornado pelo servidor');
            return;
        }

        const firstFile = uploadedFiles[0];
        const fileName = firstFile.name; // Nome normalizado com timestamp

        console.log('📄 Nome do arquivo recebido:', fileName);

        // ✅ CRÍTICO: Atualiza campo hidden com nome do arquivo
        $('#txtAutuacaoPDF').val(fileName);
        console.log('✅ Campo txtAutuacaoPDF atualizado:', fileName);

        // Carrega PDF no viewer
        loadPdfInViewer(fileName);

        if (window.AppToast?.show)
        {
            AppToast.show('Verde', 'PDF de Autuação enviado com sucesso!', 3000);
        }
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "onAutuacaoUploadSuccess", error);
        }
    }
}

/**
 * Callback de falha no upload
 * param {object} args - Argumentos do evento
 */
function onAutuacaoUploadFailure(args)
{
    try
    {
        console.error("Erro no upload:", args);

        if (window.AppToast?.show)
        {
            AppToast.show('Vermelho', 'Erro ao enviar arquivo PDF', 3000);
        } else
        {
            Alerta.Erro('Erro no Upload', 'Não foi possível enviar o arquivo PDF');
        }
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "onAutuacaoUploadFailure", error);
        }
    }
}

// ====================================================================
// FUNÇÃO DE FORMATAÇÃO DE MOEDA
// ====================================================================

/**
 * Formata campo de input como moeda
 * param {object} a - Elemento do campo
 * param {object} e - Evento
 * param {string} r - Separador decimal
 * param {string} t - Separador de milhares
 */
function moeda(input, sep, dec, event)
{
    try
    {
        let digitado = "",
            i = j = 0,
            tamanho = tamanho2 = 0,
            limpo = ajustado = "",
            tecla = window.Event ? event.which : event.keyCode;

        if (tecla === 13 || tecla === 8) return true;

        digitado = String.fromCharCode(tecla);

        if ("0123456789".indexOf(digitado) === -1) return false;

        // Remove o prefixo R$ para processar apenas números
        let valorAtual = input.value.replace('R$ ', '');

        for (tamanho = valorAtual.length, i = 0;
             i < tamanho && (valorAtual.charAt(i) === "0" || valorAtual.charAt(i) === dec);
             i++);

        for (limpo = ""; i < tamanho; i++)
        {
            if ("0123456789".indexOf(valorAtual.charAt(i)) !== -1)
            {
                limpo += valorAtual.charAt(i);
            }
        }

        limpo += digitado;
        tamanho = limpo.length;

        if (tamanho === 0)
        {
            input.value = "";
        }
        else if (tamanho === 1)
        {
            input.value = "R$ 0" + dec + "0" + limpo;
        }
        else if (tamanho === 2)
        {
            input.value = "R$ 0" + dec + limpo;
        }
        else
        {
            for (ajustado = "", j = 0, i = tamanho - 3; i >= 0; i--)
            {
                if (j === 3)
                {
                    ajustado += sep;
                    j = 0;
                }
                ajustado += limpo.charAt(i);
                j++;
            }

            input.value = "R$ ";
            tamanho2 = ajustado.length;

            for (i = tamanho2 - 1; i >= 0; i--)
            {
                input.value += ajustado.charAt(i);
            }

            input.value += dec + limpo.substr(tamanho - 2, tamanho);
        }

        return false;
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "moeda", error);
        }
        return false;
    }
}

// ====================================================================
// RTE: ANEXA CSRF AO UPLOAD DE IMAGENS
// ====================================================================

/**
 * Callback do toolbar do Rich Text Editor
 * param {object} e - Evento
 */
function toolbarClick(e)
{
    try
    {
        if (e.item.id == "rte_toolbar_Image")
        {
            var element = document.getElementById('rte_upload');
            if (element?.ej2_instances?.[0])
            {
                element.ej2_instances[0].uploading = function (args)
                {
                    const token = document.getElementsByName('__RequestVerificationToken')[0]?.value;
                    if (token) args.currentRequest.setRequestHeader('XSRF-TOKEN', token);
                };
            }
        }
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "toolbarClick", error);
        }
    }
}

// ====================================================================
// VERIFICAÇÃO DE MULTA EXISTENTE
// ====================================================================

$(document).on('focusout', '#txtNumeroInfracao', function ()
{
    try
    {
        const numeroInfracao = $(this).val();
        if (!numeroInfracao) return;

        $.ajax({
            url: "/api/Multa/MultaExistente",
            method: "GET",
            data: { numeroInfracao: numeroInfracao },
            success: function (res)
            {
                try
                {
                    const existe = Array.isArray(res.data) ? res.data[0] : res.data;

                    if (existe === true)
                    {
                        if (window.AppToast?.show)
                        {
                            AppToast.show('Amarelo', 'Já existe uma Multa com este número de infração', 4000);
                        } else if (window.Alerta?.Warning)
                        {
                            Alerta.Warning("Alerta no Número da Infração", "Já existe uma Multa inserida com esta numeração");
                        } else
                        {
                            alert("Já existe uma Multa inserida com esta numeração");
                        }
                    }
                } catch (error)
                {
                    if (window.Alerta?.TratamentoErroComLinha)
                    {
                        Alerta.TratamentoErroComLinha("upsert_autuacao.js", "MultaExistente.success", error);
                    }
                }
            },
            error: function (xhr, status, error)
            {
                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "MultaExistente.error", new Error(error));
                }
            }
        });
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "txtNumeroInfracao.focusout", error);
        }
    }
});

// ====================================================================
// FUNÇÕES DE SELECT (CONTROLE DE ESTADO)
// ====================================================================

function lstVeiculo_Select()
{
    try
    {
        EscolhendoVeiculo = true;
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstVeiculo_Select", error);
        }
    }
}

function lstMotorista_Select()
{
    try
    {
        EscolhendoMotorista = true;
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstMotorista_Select", error);
        }
    }
}

// ====================================================================
// FUNÇÕES DE MUDANÇA - VEÍCULO
// ====================================================================

function lstVeiculo_Change()
{
    try
    {
        const cmp = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
        if (!cmp || !cmp.value) return;

        $.ajax({
            url: "/api/Multa/PegaInstrumentoVeiculo",
            method: "GET",
            data: { Id: cmp.value },
            success: function (data)
            {
                try
                {
                    const cVeic = document.getElementById("lstContratoVeiculo")?.ej2_instances?.[0];
                    const aVeic = document.getElementById("lstAtaVeiculo")?.ej2_instances?.[0];

                    console.log('📦 Resposta PegaInstrumentoVeiculo:', data);

                    // ✅ CORREÇÃO: API retorna 'instrumentoid' e 'instrumento'
                    if (data.success && data.instrumentoid)
                    {
                        if (data.instrumento === "contrato")
                        {
                            // É um contrato
                            if (cVeic) cVeic.value = data.instrumentoid;
                            if (aVeic) aVeic.value = '';
                            console.log('✅ Contrato definido:', data.instrumentoid);
                        }
                        else if (data.instrumento === "ata")
                        {
                            // É uma ata
                            if (aVeic) aVeic.value = data.instrumentoid;
                            if (cVeic) cVeic.value = '';
                            console.log('✅ Ata definida:', data.instrumentoid);
                        }
                    }
                    else
                    {
                        // Sem contrato ou ata
                        if (cVeic) cVeic.value = '';
                        if (aVeic) aVeic.value = '';
                        console.warn('⚠️ Veículo sem contrato ou ata');

                        if (window.AppToast?.show)
                        {
                            AppToast.show('Amarelo', 'O veículo escolhido não possui contrato ou ata', 3000);
                        }
                        else if (window.Alerta?.Warning)
                        {
                            Alerta.Warning("Atenção ao Instrumento do Veículo", "O veículo escolhido não possui contrato ou ata");
                        }
                        else
                        {
                            alert("O veículo escolhido não possui contrato ou ata");
                        }
                    }
                }
                catch (innerError)
                {
                    console.error('❌ Erro ao processar resposta:', innerError);
                    if (window.Alerta?.TratamentoErroComLinha)
                    {
                        Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstVeiculo_Change.success", innerError);
                    }
                }
            },
            error: function (xhr, status, error)
            {
                console.error('❌ Erro na requisição AJAX:');
                console.error('Status:', status);
                console.error('Error:', error);
                console.error('XHR:', xhr);

                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstVeiculo_Change.error", new Error(error));
                }
            }
        });
    }
    catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstVeiculo_Change", error);
        }
    }
}

function lstContratoVeiculo_Change()
{
    try
    {
        if (EscolhendoVeiculo)
        {
            EscolhendoVeiculo = false;
            return;
        }

        // Limpa ata se houver
        const aVeic = document.getElementById("lstAtaVeiculo")?.ej2_instances?.[0];
        if (aVeic) aVeic.value = '';

        const v = document.getElementById("lstVeiculo")?.ej2_instances?.[0]?.value;
        const c = document.getElementById("lstContratoVeiculo")?.ej2_instances?.[0]?.value;
        if (!v || !c) return;

        $.ajax({
            url: "/api/Multa/ValidaContratoVeiculo",
            method: "GET",
            data: { veiculoId: v, contratoId: c },
            success: function (data)
            {
                if (data.success === false)
                {
                    if (window.AppToast?.show)
                    {
                        AppToast.show('Vermelho', 'O veículo escolhido não pertence a esse contrato', 3000);
                    } else if (window.Alerta?.Warning)
                    {
                        Alerta.Warning("Alerta no Contrato do Veículo", "O veículo escolhido não pertence a esse contrato");
                    } else
                    {
                        alert("O veículo escolhido não pertence a esse contrato");
                    }

                    const lstV = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
                    if (lstV) lstV.value = '';
                }
            },
            error: function (xhr, status, error)
            {
                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstContratoVeiculo_Change.error", new Error(error));
                }
            }
        });
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstContratoVeiculo_Change", error);
        }
    }
}

function lstAtaVeiculo_Change()
{
    try
    {
        if (EscolhendoVeiculo)
        {
            EscolhendoVeiculo = false;
            return;
        }

        const v = document.getElementById("lstVeiculo")?.ej2_instances?.[0]?.value;
        const a = document.getElementById("lstAtaVeiculo")?.ej2_instances?.[0]?.value;
        if (!v || !a) return;

        const cVeic = document.getElementById("lstContratoVeiculo")?.ej2_instances?.[0];
        if (a && cVeic?.value)
        {
            cVeic.value = '';
        }

        $.ajax({
            url: "/api/Multa/ValidaAtaVeiculo",
            method: "GET",
            data: { veiculoId: v, ataId: a },
            success: function (data)
            {
                if (data.success === false)
                {
                    if (window.AppToast?.show)
                    {
                        AppToast.show('Vermelho', 'O veículo escolhido não pertence a essa ata', 3000);
                    } else if (window.Alerta?.Warning)
                    {
                        Alerta.Warning("Alerta na Ata do Veículo", "O veículo escolhido não pertence a essa ata");
                    } else
                    {
                        alert("O veículo escolhido não pertence a essa ata");
                    }

                    const lstV = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
                    if (lstV) lstV.value = '';
                }
            },
            error: function (xhr, status, error)
            {
                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstAtaVeiculo_Change.error", new Error(error));
                }
            }
        });
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstAtaVeiculo_Change", error);
        }
    }
}

// ====================================================================
// FUNÇÕES DE MUDANÇA - MOTORISTA
// ====================================================================

function lstMotorista_Change()
{
    try
    {
        const m = document.getElementById("lstMotorista")?.ej2_instances?.[0]?.value;
        if (!m) return;

        $.ajax({
            url: "/api/Multa/PegaContratoMotorista",
            method: "GET",
            data: { Id: m },
            success: function (data)
            {
                const c = document.getElementById("lstContratoMotorista")?.ej2_instances?.[0];

                if (data.contratoid)
                {
                    if (c) c.value = data.contratoid;
                } else
                {
                    if (c) c.value = '';

                    if (window.AppToast?.show)
                    {
                        AppToast.show('Amarelo', 'O motorista escolhido não possui contrato', 3000);
                    } else if (window.Alerta?.Warning)
                    {
                        Alerta.Warning("Atenção ao Contrato do Motorista", "O motorista escolhido não possui contrato");
                    } else
                    {
                        alert("O motorista escolhido não possui contrato");
                    }
                }
            },
            error: function (xhr, status, error)
            {
                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstMotorista_Change.error", new Error(error));
                }
            }
        });
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstMotorista_Change", error);
        }
    }
}

function lstContratoMotorista_Change()
{
    try
    {
        if (EscolhendoMotorista)
        {
            EscolhendoMotorista = false;
            return;
        }

        const m = document.getElementById("lstMotorista")?.ej2_instances?.[0]?.value;
        const c = document.getElementById("lstContratoMotorista")?.ej2_instances?.[0]?.value;
        if (!m || !c) return;

        $.ajax({
            url: "/api/Multa/ValidaContratoMotorista",
            method: "GET",
            data: { motoristaId: m, contratoId: c },
            success: function (data)
            {
                if (data.success === false)
                {
                    if (window.AppToast?.show)
                    {
                        AppToast.show('Vermelho', 'O motorista escolhido não pertence a esse contrato', 3000);
                    } else if (window.Alerta?.Warning)
                    {
                        Alerta.Warning("Alerta no Contrato do Motorista", "O motorista escolhido não pertence a esse contrato");
                    } else
                    {
                        alert("O motorista escolhido não pertence a esse contrato");
                    }

                    const lstM = document.getElementById("lstMotorista")?.ej2_instances?.[0];
                    if (lstM) lstM.value = '';
                }
            },
            error: function (xhr, status, error)
            {
                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstContratoMotorista_Change.error", new Error(error));
                }
            }
        });
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstContratoMotorista_Change", error);
        }
    }
}

// ====================================================================
// FUNÇÕES DE ÓRGÃO E EMPENHO
// ====================================================================

function lstOrgaoChange()
{
    try
    {
        console.log('🔄 lstOrgaoChange disparado');

        const lstEmpenhos = document.getElementById("lstEmpenhos")?.ej2_instances?.[0];
        const lstOrgao = document.getElementById("lstOrgao")?.ej2_instances?.[0];

        console.log('📋 lstEmpenhos instance:', lstEmpenhos);
        console.log('🏢 lstOrgao instance:', lstOrgao);

        // Limpa dropdown de empenhos
        if (lstEmpenhos)
        {
            lstEmpenhos.dataSource = [];
            lstEmpenhos.dataBind();
            lstEmpenhos.text = "";
            console.log('🧹 lstEmpenhos limpo');
        }
        else
        {
            console.error('❌ lstEmpenhos não encontrado!');
        }

        $('#txtEmpenhoMultaId').attr('value', "");

        const orgaoId = lstOrgao?.value;

        console.log('🏢 Órgão selecionado:', orgaoId);

        if (!orgaoId)
        {
            console.warn('⚠️ Nenhum órgão selecionado');
            return;
        }

        console.log(`🔍 Buscando empenhos para o órgão: ${orgaoId}`);

        // Busca empenhos do órgão
        $.ajax({
            url: "/Multa/UpsertAutuacao?handler=AJAXPreencheListaEmpenhos",
            method: "GET",
            data: { id: orgaoId },
            success: function (res)
            {
                try
                {
                    console.log('📦 Resposta do servidor:', res);
                    console.log('📊 Dados retornados:', res.data);
                    console.log('🎯 lstEmpenhos instance:', lstEmpenhos);

                    // Handler retorna apenas { data: [...] }, sem res.success
                    if (res.data && Array.isArray(res.data) && lstEmpenhos)
                    {
                        console.log(`✅ Recebidos ${res.data.length} empenhos do servidor`);

                        // ⚠️ CORREÇÃO: Mapeia os dados para PascalCase (como Syncfusion espera)
                        let EmpenhoList = [];
                        for (let i = 0; i < res.data.length; i++)
                        {
                            let item = res.data[i];
                            // Aceita tanto camelCase quanto PascalCase do servidor
                            let empenho = {
                                EmpenhoMultaId: item.empenhoMultaId || item.EmpenhoMultaId,
                                NotaEmpenho: item.notaEmpenho || item.NotaEmpenho
                            };
                            EmpenhoList.push(empenho);
                            console.log(`📝 Empenho ${i}:`, empenho);
                        }

                        lstEmpenhos.dataSource = EmpenhoList;
                        lstEmpenhos.dataBind();

                        console.log('✅ lstEmpenhos atualizado com sucesso');
                        console.log('📊 DataSource atualizado:', EmpenhoList);

                        if (res.data.length === 0)
                        {
                            console.warn('⚠️ Nenhum empenho encontrado para este órgão');
                            if (window.AppToast?.show)
                            {
                                AppToast.show('Amarelo', 'Nenhum empenho cadastrado para este órgão', 3000);
                            }
                        }
                    }
                    else
                    {
                        console.error('❌ Dados inválidos ou lstEmpenhos não encontrado');
                        console.log('res.data:', res.data);
                        console.log('Array?', Array.isArray(res.data));
                        console.log('lstEmpenhos:', lstEmpenhos);
                    }
                } catch (innerError)
                {
                    console.error('❌ Erro ao processar resposta:', innerError);
                    if (window.Alerta?.TratamentoErroComLinha)
                    {
                        Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstOrgaoChange.ajax.success", innerError);
                    }
                }
            },
            error: function (xhr, status, error)
            {
                console.error('❌ Erro na requisição AJAX:');
                console.error('Status:', status);
                console.error('Error:', error);
                console.error('XHR:', xhr);
                console.error('Response Text:', xhr.responseText);
                console.error('Status Code:', xhr.status);

                if (window.AppToast?.show)
                {
                    AppToast.show('Vermelho', 'Erro ao buscar empenhos do órgão', 3000);
                }

                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstOrgaoChange.ajax.error", new Error(error));
                }
            }
        });
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstOrgaoChange", error);
        }
    }
}
function lstEmpenhosChange()
{
    try
    {
        const lstEmpenhos = document.getElementById("lstEmpenhos")?.ej2_instances?.[0];
        if (!lstEmpenhos) return;

        $('#txtEmpenhoMultaId').attr('value', lstEmpenhos.value);

        const empenhoid = String(lstEmpenhos.value);

        $.ajax({
            url: "/Multa/UpsertAutuacao?handler=PegaSaldoEmpenho",
            method: "GET",
            datatype: "json",
            data: { id: empenhoid },
            success: function (res)
            {
                var saldoempenho = res.data;
                $("#txtSaldoEmpenho").val(
                    Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoempenho)
                );
            },
            error: function (xhr, status, error)
            {
                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstEmpenhosChange.error", new Error(error));
                }
            }
        });
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "lstEmpenhosChange", error);
        }
    }
}

// ====================================================================
// PROCURA VIAGEM E FICHA
// ====================================================================

// ✅ CORRIGIDO: Alterado para POST e parâmetros corretos conforme Controller
$(document).on('click', '.btnViagem', function ()
{
    try
    {
        // Valida Data da Infração
        if (!document.getElementById("txtDataInfracao").value)
        {
            if (window.AppToast?.show)
            {
                AppToast.show('Vermelho', 'A Data da Infração deve ser informada!', 3000);
            } else
            {
                Alerta.Warning('Atenção', 'A Data da Infração deve ser informada!');
            }
            return;
        }

        // ✅ NOVO: Valida Hora da Infração
        if (!document.getElementById("txtHoraInfracao").value)
        {
            if (window.AppToast?.show)
            {
                AppToast.show('Vermelho', 'A Hora da Infração deve ser informada!', 3000);
            } else
            {
                Alerta.Warning('Atenção', 'A Hora da Infração deve ser informada!');
            }
            return;
        }

        // ✅ CORRIGIDO: Obtém Data e Hora separadamente
        const data = document.getElementById("txtDataInfracao").value;
        const hora = document.getElementById("txtHoraInfracao").value;
        const veiculoId = document.getElementById("lstVeiculo")?.ej2_instances?.[0]?.value;

        // Valida Veículo
        if (!veiculoId)
        {
            if (window.AppToast?.show)
            {
                AppToast.show('Vermelho', 'O Veículo deve ser informado!', 3000);
            } else
            {
                Alerta.Warning('Atenção', 'O Veículo deve ser informado!');
            }
            return;
        }

        $.ajax({
            type: "POST",  // ✅ CORRIGIDO: Era GET, deve ser POST
            url: "/api/Multa/ProcuraViagem",
            data: {
                Data: data,           // ✅ CORRIGIDO: Era dataInfracao
                Hora: hora,           // ✅ NOVO: Hora não era enviada
                VeiculoId: veiculoId  // ✅ CORRIGIDO: Era veiculoId (lowercase)
            },
            dataType: "json",
            success: function (data)
            {
                try
                {
                    if (data.success === true)
                    {
                        ViagemId = data.viagemid;
                        // ✅ CORRIGIDO: Era data.ficha, deve ser data.nofichavistoria
                        $('#txtNoFichaVistoria').attr('value', data.nofichavistoria);
                        $('#txtNoFichaVistoriaEscondido').attr('value', data.nofichavistoria);

                        // Atualiza motorista
                        const lstMotorista = document.getElementById("lstMotorista")?.ej2_instances?.[0];
                        if (lstMotorista)
                        {
                            lstMotorista.value = data.motoristaid;
                        }

                        if (window.AppToast?.show)
                        {
                            AppToast.show('Verde', 'Viagem encontrada!', 3000);
                        }
                    } else
                    {
                        $('#txtNoFichaVistoria').attr('value', '');
                        $('#txtNoFichaVistoriaEscondido').attr('value', '');

                        if (window.AppToast?.show)
                        {
                            AppToast.show('Vermelho', data.message || 'Viagem não encontrada', 3000);
                        } else
                        {
                            Alerta.Warning('Atenção', data.message || 'Viagem não encontrada');
                        }
                    }
                } catch (innerError)
                {
                    if (window.Alerta?.TratamentoErroComLinha)
                    {
                        Alerta.TratamentoErroComLinha("upsert_autuacao.js", "btnViagem.ajax.success", innerError);
                    }
                }
            },
            error: function (xhr, status, error)
            {
                console.log(error);

                if (window.AppToast?.show)
                {
                    AppToast.show('Vermelho', 'Erro ao procurar viagem', 3000);
                } else
                {
                    Alerta.Erro('Erro', 'Algo deu errado ao procurar a viagem');
                }

                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "btnViagem.ajax.error", new Error(error));
                }
            }
        });
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "btnViagem.click", error);
        }
    }
});

// ✅ CORRIGIDO E AMPLIADO: Procura Ficha e exibe imagem no modal
$(document).on('click', '.btnFicha', function ()
{
    try
    {
        const noFicha = document.getElementById("txtNoFichaVistoria").value;

        if (!noFicha)
        {
            if (window.AppToast?.show)
            {
                AppToast.show('Vermelho', 'O número da Ficha de Vistoria deve ser informado!', 3000);
            } else
            {
                Alerta.Warning('Atenção', 'O número da Ficha de Vistoria deve ser informado!');
            }
            return;
        }

        // Converte para número inteiro
        const noFichaInt = parseInt(noFicha, 10);
        if (isNaN(noFichaInt) || noFichaInt <= 0)
        {
            if (window.AppToast?.show)
            {
                AppToast.show('Vermelho', 'O número da Ficha de Vistoria deve ser um número válido!', 3000);
            } else
            {
                Alerta.Warning('Atenção', 'O número da Ficha de Vistoria deve ser um número válido!');
            }
            return;
        }

        // PASSO 1: Procura a ficha no banco (verifica se existe viagem com essa ficha)
        $.ajax({
            type: "POST",
            url: "/api/Multa/ProcuraFicha",
            data: { NoFichaVistoria: noFichaInt },
            dataType: "json",
            success: function (data)
            {
                try
                {
                    if (data.success === true)
                    {
                        ViagemId = data.viagemid;

                        // PASSO 2: Busca a imagem da ficha de vistoria
                        $.ajax({
                            type: "GET",
                            url: "/api/Multa/PegaImagemFichaVistoria",
                            data: { noFicha: noFichaInt },
                            dataType: "json",
                            success: function (imgData)
                            {
                                try
                                {
                                    if (imgData.success === true && imgData.imagemBase64)
                                    {
                                        // Atualiza título do modal
                                        const labelFicha = document.getElementById("DynamicModalLabelFicha");
                                        if (labelFicha)
                                        {
                                            labelFicha.innerHTML = `<i class="fa-solid fa-file-lines"></i> Ficha de Vistoria Nº ${imgData.noFichaVistoria}`;
                                        }

                                        // Atualiza a imagem no modal
                                        const imgElement = document.getElementById("imgFichaVistoria");
                                        if (imgElement)
                                        {
                                            imgElement.src = imgData.imagemBase64;
                                        }

                                        // Abre o modal (Bootstrap 5)
                                        const modalElement = document.getElementById('modalFicha');
                                        if (modalElement)
                                        {
                                            const modal = new bootstrap.Modal(modalElement);
                                            modal.show();
                                        }

                                        if (window.AppToast?.show)
                                        {
                                            AppToast.show('Verde', 'Ficha de Vistoria carregada!', 2000);
                                        }
                                    }
                                    else
                                    {
                                        // Ficha existe mas não tem imagem
                                        if (window.AppToast?.show)
                                        {
                                            AppToast.show('Amarelo', imgData.message || 'Esta viagem não possui imagem da Ficha de Vistoria', 4000);
                                        } else
                                        {
                                            Alerta.Warning('Atenção', imgData.message || 'Esta viagem não possui imagem da Ficha de Vistoria');
                                        }
                                    }
                                }
                                catch (innerError)
                                {
                                    if (window.Alerta?.TratamentoErroComLinha)
                                    {
                                        Alerta.TratamentoErroComLinha("upsert_autuacao.js", "btnFicha.PegaImagemFichaVistoria.success", innerError);
                                    }
                                }
                            },
                            error: function (xhr, status, error)
                            {
                                console.error('Erro ao buscar imagem:', error);
                                if (window.AppToast?.show)
                                {
                                    AppToast.show('Vermelho', 'Erro ao carregar imagem da ficha', 3000);
                                }

                                if (window.Alerta?.TratamentoErroComLinha)
                                {
                                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "btnFicha.PegaImagemFichaVistoria.error", new Error(error));
                                }
                            }
                        });
                    }
                    else
                    {
                        // Ficha não encontrada
                        if (window.AppToast?.show)
                        {
                            AppToast.show('Vermelho', data.message || 'Ficha de Vistoria não encontrada', 3000);
                        } else
                        {
                            Alerta.Warning('Atenção', data.message || 'Ficha de Vistoria não encontrada');
                        }
                    }
                }
                catch (innerError)
                {
                    if (window.Alerta?.TratamentoErroComLinha)
                    {
                        Alerta.TratamentoErroComLinha("upsert_autuacao.js", "btnFicha.ajax.success", innerError);
                    }
                }
            },
            error: function (xhr, status, error)
            {
                console.log(error);

                if (window.AppToast?.show)
                {
                    AppToast.show('Vermelho', 'Erro ao procurar ficha', 3000);
                } else
                {
                    Alerta.Erro('Erro', 'Algo deu errado ao procurar a ficha');
                }

                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "btnFicha.ajax.error", new Error(error));
                }
            }
        });
    }
    catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "btnFicha.click", error);
        }
    }
});

// ====================================================================
// BOTÃO BAIXAR PDF - CONVERTE IMAGEM DA FICHA PARA PDF
// ====================================================================
$(document).on('click', '#btnBaixarPDF', function ()
{
    try
    {
        const imgElement = document.getElementById('imgFichaVistoria');

        if (!imgElement || !imgElement.src || imgElement.src === '')
        {
            if (window.AppToast?.show)
            {
                AppToast.show('Vermelho', 'Nenhuma imagem carregada para converter', 3000);
            }
            return;
        }

        // Pega o número da ficha do título do modal
        const labelFicha = document.getElementById('DynamicModalLabelFicha');
        let noFicha = 'FichaVistoria';
        if (labelFicha)
        {
            const match = labelFicha.innerText.match(/\d+/);
            if (match)
            {
                noFicha = `FichaVistoria_${match[0]}`;
            }
        }

        // Cria o PDF usando jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Cria uma imagem temporária para obter dimensões
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imgElement.src;

        img.onload = function ()
        {
            try
            {
                // Dimensões do A4 em mm
                const pageWidth = 210;
                const pageHeight = 297;
                const margin = 10;

                // Calcula dimensões mantendo proporção
                const imgWidth = img.width;
                const imgHeight = img.height;
                const ratio = imgWidth / imgHeight;

                let finalWidth = pageWidth - (margin * 2);
                let finalHeight = finalWidth / ratio;

                // Se a altura ultrapassar a página, ajusta
                if (finalHeight > pageHeight - (margin * 2))
                {
                    finalHeight = pageHeight - (margin * 2);
                    finalWidth = finalHeight * ratio;
                }

                // Centraliza na página
                const x = (pageWidth - finalWidth) / 2;
                const y = (pageHeight - finalHeight) / 2;

                // Adiciona a imagem ao PDF
                pdf.addImage(imgElement.src, 'JPEG', x, y, finalWidth, finalHeight);

                // Faz o download
                pdf.save(`${noFicha}.pdf`);

                if (window.AppToast?.show)
                {
                    AppToast.show('Verde', 'PDF gerado com sucesso!', 2000);
                }
            }
            catch (innerError)
            {
                console.error('Erro ao gerar PDF:', innerError);
                if (window.AppToast?.show)
                {
                    AppToast.show('Vermelho', 'Erro ao gerar o PDF', 3000);
                }
                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "btnBaixarPDF.img.onload", innerError);
                }
            }
        };

        img.onerror = function ()
        {
            if (window.AppToast?.show)
            {
                AppToast.show('Vermelho', 'Erro ao processar a imagem', 3000);
            }
        };
    }
    catch (error)
    {
        console.error('Erro:', error);
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "btnBaixarPDF.click", error);
        }
    }
});


// ====================================================================
// MODAL FICHA DE VISTORIA - BOOTSTRAP 5
// ====================================================================

document.getElementById('modalFicha')?.addEventListener('show.bs.modal', function ()
{
    try
    {
        const id = ViagemId;
        const label = document.getElementById("DynamicModalLabelFicha");
        if (label) label.innerHTML = "";

        $.ajax({
            type: "get",
            url: "/api/Viagem/PegaFichaModal",
            data: { id: id },
            async: false,
            success: function (res)
            {
                try
                {
                    if (res && res.data)
                    {
                        if (label)
                        {
                            label.innerHTML = `Ficha de Vistoria Nº ${res.data.noFichaVistoria}`;
                        }

                        $("#CorpoModalFicha").html(res.data.html);
                    }
                } catch (innerError)
                {
                    if (window.Alerta?.TratamentoErroComLinha)
                    {
                        Alerta.TratamentoErroComLinha("upsert_autuacao.js", "modalFicha.show.success", innerError);
                    }
                }
            },
            error: function (xhr, status, error)
            {
                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("upsert_autuacao.js", "modalFicha.show.error", new Error(error));
                }
            }
        });
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "modalFicha.show", error);
        }
    }
});

// ====================================================================
// MÁSCARA DE MOEDA BRASILEIRA DURANTE DIGITAÇÃO
// ====================================================================

/**
 * Aplica máscara de moeda brasileira em campos
 */
function aplicarMascaraMoeda()
{
    try
    {
        $('.moeda-brasileira').each(function ()
        {
            const campo = $(this);

            // Formata valor inicial se existir
            if (campo.val())
            {
                const valorNumerico = parseFloat(campo.val());
                if (!isNaN(valorNumerico))
                {
                    campo.val(formatarMoeda(valorNumerico));
                }
            }

            // Remove listeners antigos para evitar duplicação
            campo.off('focus blur keyup');

            // Ao focar, remove formatação para facilitar edição
            campo.on('focus', function ()
            {
                let valor = $(this).val();
                valor = valor.replace(/[^\d,]/g, ''); // Remove tudo exceto números e vírgula
                $(this).val(valor);
            });

            // Ao sair, formata como moeda
            campo.on('blur', function ()
            {
                let valor = $(this).val();
                if (valor === '' || valor === '0' || valor === '0,00')
                {
                    $(this).val('');
                    return;
                }

                // Converte para número
                valor = valor.replace(/\./g, '').replace(',', '.');
                const numero = parseFloat(valor);

                if (!isNaN(numero))
                {
                    $(this).val(formatarMoeda(numero));
                }
            });

            // Durante digitação
            campo.on('keyup', function (e)
            {
                let valor = $(this).val();

                // Remove tudo que não é número ou vírgula
                valor = valor.replace(/[^\d,]/g, '');

                // Garante apenas uma vírgula
                const partes = valor.split(',');
                if (partes.length > 2)
                {
                    valor = partes[0] + ',' + partes.slice(1).join('');
                }

                // Limita casas decimais a 2
                if (partes.length === 2 && partes[1].length > 2)
                {
                    valor = partes[0] + ',' + partes[1].substring(0, 2);
                }

                $(this).val(valor);
            });
        });
    }
    catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "aplicarMascaraMoeda", error);
        }
    }
}

/**
 * Formata número como moeda brasileira
 * @param {number} valor - Valor numérico
 * @returns {string} Valor formatado
 */
function formatarMoeda(valor)
{
    try
    {
        return valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    catch (error)
    {
        return valor.toString();
    }
}

// ====================================================================
// INICIALIZAÇÃO DOS EVENTOS - DOCUMENT READY
// ====================================================================

$(document).ready(function ()
{
    try
    {
        // Aguarda inicialização dos componentes Syncfusion
        setTimeout(function ()
        {
            // ✅ CRÍTICO: Vincula eventos do Uploader
            const uploaderAutuacao = document.getElementById("uploaderAutuacao")?.ej2_instances?.[0];
            if (uploaderAutuacao)
            {
                uploaderAutuacao.selected = onAutuacaoUploadSelected;
                uploaderAutuacao.success = onAutuacaoUploadSuccess;
                uploaderAutuacao.failure = onAutuacaoUploadFailure;
                console.log('✅ Eventos do Uploader vinculados');
            }

            // ✅ Carrega PDF existente se estiver em modo de edição
            const autucaoPdfExistente = $('#txtAutuacaoPDF').val();
            if (autucaoPdfExistente && autucaoPdfExistente !== '')
            {
                console.log('📄 Carregando PDF existente:', autucaoPdfExistente);
                loadPdfInViewer(autucaoPdfExistente);
            }

            // Eventos de Change para Dropdowns e Comboboxes
            const lstOrgao = document.getElementById("lstOrgao")?.ej2_instances?.[0];
            if (lstOrgao) lstOrgao.change = lstOrgaoChange;

            const lstEmpenhos = document.getElementById("lstEmpenhos")?.ej2_instances?.[0];
            if (lstEmpenhos) lstEmpenhos.change = lstEmpenhosChange;

            const lstVeiculo = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
            if (lstVeiculo)
            {
                lstVeiculo.change = lstVeiculo_Change;
                lstVeiculo.select = lstVeiculo_Select;
            }

            const lstContratoVeiculo = document.getElementById("lstContratoVeiculo")?.ej2_instances?.[0];
            if (lstContratoVeiculo) lstContratoVeiculo.change = lstContratoVeiculo_Change;

            const lstAtaVeiculo = document.getElementById("lstAtaVeiculo")?.ej2_instances?.[0];
            if (lstAtaVeiculo) lstAtaVeiculo.change = lstAtaVeiculo_Change;

            const lstMotorista = document.getElementById("lstMotorista")?.ej2_instances?.[0];
            if (lstMotorista)
            {
                lstMotorista.change = lstMotorista_Change;
                lstMotorista.select = lstMotorista_Select;
            }

            const lstContratoMotorista = document.getElementById("lstContratoMotorista")?.ej2_instances?.[0];
            if (lstContratoMotorista) lstContratoMotorista.change = lstContratoMotorista_Change;

            // ✅ NOVO: Carrega saldo do empenho se estiver em modo EDIÇÃO
            if (lstEmpenhos && lstEmpenhos.value)
            {
                console.log('💰 Modo EDIÇÃO detectado - carregando saldo do empenho:', lstEmpenhos.value);
                lstEmpenhosChange();
            }

            // ✅ Aplica máscara de moeda nos campos
            aplicarMascaraMoeda();
        }, 500);
    } catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("upsert_autuacao.js", "document.ready", error);
        }
    }
});
