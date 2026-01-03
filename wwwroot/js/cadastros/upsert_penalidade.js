/**
 * upsert_penalidade.js - DEFINITIVAMENTE CORRETO
 * Gerenciamento de penalidades e multas
 * Sistema FrotiX - Versão FINAL CORRIGIDA
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
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "stopEnterSubmitting", error);
    }
}

// ====================================================================
// FUNÇÕES DE PDF VIEWER
// ====================================================================

/**
 * Obtém a instância do PDF Viewer
 * @param {string} viewerId - ID do elemento viewer
 * @returns {Object|null} Instância do viewer ou null
 */
function getViewer(viewerId)
{
    try
    {
        const viewerElement = document.getElementById(viewerId);
        return viewerElement?.ej2_instances?.[0] || null;
    } catch (err)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "getViewer", err);
        return null;
    }
}

/**
 * Verifica se um arquivo PDF existe no servidor antes de carregá-lo
 * @param {string} fileName - Nome do arquivo PDF
 * @returns {Promise<boolean>} Promise que resolve com true se o arquivo existe
 */
async function checkFileExists(fileName)
{
    try
    {
        if (!fileName || fileName === '' || fileName === 'null')
        {
            return false;
        }

        const response = await fetch(`/api/Multa/CheckFileExists?fileName=${encodeURIComponent(fileName)}`);

        if (!response.ok)
        {
            console.error(`❌ Erro ao verificar arquivo: ${response.status} ${response.statusText}`);
            return false;
        }

        const result = await response.json();
        console.log(`🔍 Verificação de arquivo ${fileName}:`, result);

        return result.exists === true;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "checkFileExists", error);
        console.error("❌ Erro na verificação de arquivo:", error);
        return false;
    }
}

/**
 * Carrega um PDF no viewer especificado - COM VERIFICAÇÃO DE EXISTÊNCIA
 * @param {string} fileName - Nome do arquivo PDF
 * @param {string} viewerId - ID do elemento viewer
 */
async function loadPdfInViewer(fileName, viewerId)
{
    try
    {
        if (!fileName || fileName === '' || fileName === 'null')
        {
            console.warn(`⚠️ Nome de arquivo inválido para carregar no viewer ${viewerId}`);
            return;
        }

        const viewer = getViewer(viewerId);
        if (!viewer)
        {
            console.error(`❌ Viewer ${viewerId} não encontrado`);
            return;
        }

        // VERIFICA SE O ARQUIVO EXISTE ANTES DE CARREGAR
        console.log(`🔍 Verificando existência do arquivo ${fileName} antes de carregar...`);
        const fileExists = await checkFileExists(fileName);

        if (!fileExists)
        {
            console.warn(`⚠️ Arquivo ${fileName} não encontrado no servidor. PDF não será carregado no viewer ${viewerId}.`);

            // Limpa o viewer se houver documento carregado
            try
            {
                viewer.unload();
            } catch (unloadError)
            {
                console.log("Viewer já estava vazio");
            }

            return;
        }

        // Arquivo existe, prossegue com o carregamento
        viewer.documentPath = fileName;
        viewer.dataBind();
        viewer.load(fileName, null);
        console.log(`✅ PDF carregado no viewer ${viewerId}: ${fileName}`);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "loadPdfInViewer", error);
        console.error("❌ Erro ao carregar PDF:", error);
    }
}

// ====================================================================
// CALLBACKS DO UPLOADER - AUTUAÇÃO
// ====================================================================

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
            AppToast.show('Vermelho', 'Apenas arquivos PDF são permitidos', 3000);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onAutuacaoUploadSelected", error);
    }
}

function onAutuacaoUploadSuccess(args)
{
    try
    {
        if (!args || !args.e) return;

        console.log('✅ Upload Autuação success args:', args);

        const serverResponse = typeof args.e.target.response === 'string'
            ? JSON.parse(args.e.target.response)
            : args.e.target.response;

        console.log('📦 Server response:', serverResponse);

        if (serverResponse.error)
        {
            console.error('❌ Erro do servidor:', serverResponse.error);
            AppToast.show('Vermelho', serverResponse.error.message || 'Erro ao enviar arquivo', 3000);
            return;
        }

        const uploadedFiles = serverResponse.files || [];
        if (uploadedFiles.length === 0)
        {
            console.error('❌ Nenhum arquivo retornado pelo servidor');
            return;
        }

        const fileName = uploadedFiles[0].name;
        $('#txtAutuacaoPDF').val(fileName);
        console.log('✅ txtAutuacaoPDF atualizado:', fileName);

        loadPdfInViewer(fileName, 'pdfviewerAutuacao');
        AppToast.show('Verde', 'PDF de Autuação enviado com sucesso!', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onAutuacaoUploadSuccess", error);
    }
}

function onAutuacaoUploadFailure(args)
{
    try
    {
        console.error("Erro no upload de Autuação:", args);
        AppToast.show('Vermelho', 'Erro ao enviar PDF de Autuação', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onAutuacaoUploadFailure", error);
    }
}

// ====================================================================
// CALLBACKS DO UPLOADER - PENALIDADE
// ====================================================================

function onPenalidadeUploadSelected(args)
{
    try
    {
        if (!args || !args.filesData || args.filesData.length === 0) return;

        const file = args.filesData[0];
        const fileName = (file?.name || "").toLowerCase();

        if (!fileName.endsWith(".pdf"))
        {
            args.cancel = true;
            AppToast.show('Vermelho', 'Apenas arquivos PDF são permitidos', 3000);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onPenalidadeUploadSelected", error);
    }
}

function onPenalidadeUploadSuccess(args)
{
    try
    {
        if (!args || !args.e) return;

        console.log('✅ Upload Penalidade success args:', args);

        const serverResponse = typeof args.e.target.response === 'string'
            ? JSON.parse(args.e.target.response)
            : args.e.target.response;

        console.log('📦 Server response:', serverResponse);

        if (serverResponse.error)
        {
            console.error('❌ Erro do servidor:', serverResponse.error);
            AppToast.show('Vermelho', serverResponse.error.message || 'Erro ao enviar arquivo', 3000);
            return;
        }

        const uploadedFiles = serverResponse.files || [];
        if (uploadedFiles.length === 0)
        {
            console.error('❌ Nenhum arquivo retornado pelo servidor');
            return;
        }

        const fileName = uploadedFiles[0].name;
        $('#txtPenalidadePDF').val(fileName);
        console.log('✅ txtPenalidadePDF atualizado:', fileName);

        loadPdfInViewer(fileName, 'pdfviewerPenalidade');
        AppToast.show('Verde', 'PDF de Penalidade enviado com sucesso!', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onPenalidadeUploadSuccess", error);
    }
}

function onPenalidadeUploadFailure(args)
{
    try
    {
        console.error("Erro no upload de Penalidade:", args);
        AppToast.show('Vermelho', 'Erro ao enviar PDF de Penalidade', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onPenalidadeUploadFailure", error);
    }
}

// ====================================================================
// CALLBACKS DO UPLOADER - E-DOC
// ====================================================================

function onEDocUploadSelected(args)
{
    try
    {
        if (!args || !args.filesData || args.filesData.length === 0) return;

        const file = args.filesData[0];
        const fileName = (file?.name || "").toLowerCase();

        if (!fileName.endsWith(".pdf"))
        {
            args.cancel = true;
            AppToast.show('Vermelho', 'Apenas arquivos PDF são permitidos', 3000);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onEDocUploadSelected", error);
    }
}

function onEDocUploadSuccess(args)
{
    try
    {
        if (!args || !args.e) return;

        console.log('✅ Upload e-Doc success args:', args);

        const serverResponse = typeof args.e.target.response === 'string'
            ? JSON.parse(args.e.target.response)
            : args.e.target.response;

        console.log('📦 Server response:', serverResponse);

        if (serverResponse.error)
        {
            console.error('❌ Erro do servidor:', serverResponse.error);
            AppToast.show('Vermelho', serverResponse.error.message || 'Erro ao enviar arquivo', 3000);
            return;
        }

        const uploadedFiles = serverResponse.files || [];
        if (uploadedFiles.length === 0)
        {
            console.error('❌ Nenhum arquivo retornado pelo servidor');
            return;
        }

        const fileName = uploadedFiles[0].name;
        $('#txtProcessoEdocPDF').val(fileName);
        console.log('✅ txtProcessoEdocPDF atualizado:', fileName);

        loadPdfInViewer(fileName, 'pdfviewerEDoc');
        AppToast.show('Verde', 'PDF de e-Doc enviado com sucesso!', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onEDocUploadSuccess", error);
    }
}

function onEDocUploadFailure(args)
{
    try
    {
        console.error("Erro no upload de e-Doc:", args);
        AppToast.show('Vermelho', 'Erro ao enviar PDF de e-Doc', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onEDocUploadFailure", error);
    }
}

// ====================================================================
// CALLBACKS DO UPLOADER - COMPROVANTE
// ====================================================================

function onComprovanteUploadSelected(args)
{
    try
    {
        if (!args || !args.filesData || args.filesData.length === 0) return;

        const file = args.filesData[0];
        const fileName = (file?.name || "").toLowerCase();

        if (!fileName.endsWith(".pdf"))
        {
            args.cancel = true;
            AppToast.show('Vermelho', 'Apenas arquivos PDF são permitidos', 3000);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onComprovanteUploadSelected", error);
    }
}

function onComprovanteUploadSuccess(args)
{
    try
    {
        if (!args || !args.e) return;

        console.log('✅ Upload Comprovante success args:', args);

        const serverResponse = typeof args.e.target.response === 'string'
            ? JSON.parse(args.e.target.response)
            : args.e.target.response;

        console.log('📦 Server response:', serverResponse);

        if (serverResponse.error)
        {
            console.error('❌ Erro do servidor:', serverResponse.error);
            AppToast.show('Vermelho', serverResponse.error.message || 'Erro ao enviar arquivo', 3000);
            return;
        }

        const uploadedFiles = serverResponse.files || [];
        if (uploadedFiles.length === 0)
        {
            console.error('❌ Nenhum arquivo retornado pelo servidor');
            return;
        }

        const fileName = uploadedFiles[0].name;
        $('#txtComprovantePDF').val(fileName);
        console.log('✅ txtComprovantePDF atualizado:', fileName);

        loadPdfInViewer(fileName, 'pdfviewerComprovante');
        AppToast.show('Verde', 'PDF de Comprovante enviado com sucesso!', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onComprovanteUploadSuccess", error);
    }
}

function onComprovanteUploadFailure(args)
{
    try
    {
        console.error("Erro no upload de Comprovante:", args);
        AppToast.show('Vermelho', 'Erro ao enviar PDF de Comprovante', 3000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "onComprovanteUploadFailure", error);
    }
}

// ====================================================================
// FUNÇÃO DE FORMATAÇÃO DE MOEDA
// ====================================================================

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
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "moeda", error);
        return false;
    }
}

// ====================================================================
// EVENTO DE CHANGE DO ÓRGÃO AUTUANTE
// ====================================================================

function lstOrgaoChange()
{
    try
    {
        console.log('🔄 lstOrgaoChange disparado');

        const lstEmpenhos = document.getElementById("lstEmpenhos")?.ej2_instances?.[0];
        const lstOrgao = document.getElementById("lstOrgao")?.ej2_instances?.[0];

        // Limpa dropdown de empenhos
        if (lstEmpenhos)
        {
            lstEmpenhos.dataSource = [];
            lstEmpenhos.dataBind();
            lstEmpenhos.text = "";
            console.log('🧹 lstEmpenhos limpo');
        }

        $('#txtEmpenhoSaldo').val('');

        const orgaoId = lstOrgao?.value;
        console.log('🏢 Órgão selecionado:', orgaoId);

        if (!orgaoId)
        {
            console.warn('⚠️ Nenhum órgão selecionado');
            return;
        }

        // Busca empenhos do órgão
        $.ajax({
            url: "/Multa/UpsertPenalidade?handler=AJAXPreencheListaEmpenhos",
            method: "GET",
            data: { id: orgaoId },
            success: function (res)
            {
                try
                {
                    console.log('📦 Resposta do servidor:', res);

                    if (res.data && Array.isArray(res.data) && lstEmpenhos)
                    {
                        console.log(`✅ Recebidos ${res.data.length} empenhos do servidor`);

                        // ✅ CORREÇÃO CRÍTICA: Mapeia os dados para PascalCase
                        let EmpenhoList = [];
                        for (let i = 0; i < res.data.length; i++)
                        {
                            let item = res.data[i];
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

                        if (res.data.length === 0)
                        {
                            AppToast.show('Amarelo', 'Nenhum empenho cadastrado para este órgão', 3000);
                        }
                    }
                } catch (innerError)
                {
                    Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstOrgaoChange.ajax.success", innerError);
                }
            },
            error: function (xhr, status, error)
            {
                Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstOrgaoChange.ajax.error", new Error(error));
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstOrgaoChange", error);
    }
}

// ====================================================================
// EVENTO DE CHANGE DO EMPENHO
// ====================================================================

function lstEmpenhosChange()
{
    try
    {
        const lstEmpenhos = document.getElementById("lstEmpenhos")?.ej2_instances?.[0];
        if (!lstEmpenhos || !lstEmpenhos.value)
        {
            $('#txtEmpenhoSaldo').val('');
            return;
        }

        const empenhoid = String(lstEmpenhos.value);
        console.log('💰 lstEmpenhos changed:', empenhoid);

        $.ajax({
            url: "/Multa/UpsertPenalidade?handler=PegaSaldoEmpenho",
            method: "GET",
            datatype: "json",
            data: { id: empenhoid },
            success: function (res)
            {
                try
                {
                    console.log('💵 Saldo recebido:', res);
                    var saldoempenho = res.data;
                    $("#txtEmpenhoSaldo").val(
                        Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoempenho)
                    );
                    console.log('✅ Saldo atualizado:', saldoempenho);
                } catch (innerError)
                {
                    Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstEmpenhosChange.success", innerError);
                }
            },
            error: function (xhr, status, error)
            {
                Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstEmpenhosChange.error", new Error(error));
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstEmpenhosChange", error);
    }
}

// ====================================================================
// EVENTOS DO VEÍCULO
// ====================================================================

function lstVeiculo_Change()
{
    try
    {
        const cmp = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
        if (!cmp || !cmp.value) return;

        // ✅ CORREÇÃO: Chama API PegaInstrumentoVeiculo igual ao UpsertAutuacao
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

                    if (data.success && data.instrumentoid)
                    {
                        if (data.instrumento === "contrato")
                        {
                            if (cVeic) cVeic.value = data.instrumentoid;
                            if (aVeic) aVeic.value = '';
                            console.log('✅ Contrato definido:', data.instrumentoid);
                        }
                        else if (data.instrumento === "ata")
                        {
                            if (aVeic) aVeic.value = data.instrumentoid;
                            if (cVeic) cVeic.value = '';
                            console.log('✅ Ata definida:', data.instrumentoid);
                        }
                    }
                    else
                    {
                        if (cVeic) cVeic.value = '';
                        if (aVeic) aVeic.value = '';
                        AppToast.show('Amarelo', 'O veículo escolhido não possui contrato ou ata', 3000);
                    }
                } catch (innerError)
                {
                    Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstVeiculo_Change.success", innerError);
                }
            },
            error: function (xhr, status, error)
            {
                Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstVeiculo_Change.error", new Error(error));
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstVeiculo_Change", error);
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
                    AppToast.show('Vermelho', 'O veículo escolhido não pertence a esse contrato', 3000);
                    const lstV = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
                    if (lstV) lstV.value = '';
                }
            },
            error: function (xhr, status, error)
            {
                Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstContratoVeiculo_Change.error", new Error(error));
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstContratoVeiculo_Change", error);
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

        const cVeic = document.getElementById("lstContratoVeiculo")?.ej2_instances?.[0];
        if (cVeic) cVeic.value = '';

        const v = document.getElementById("lstVeiculo")?.ej2_instances?.[0]?.value;
        const a = document.getElementById("lstAtaVeiculo")?.ej2_instances?.[0]?.value;
        if (!v || !a) return;

        $.ajax({
            url: "/api/Multa/ValidaAtaVeiculo",
            method: "GET",
            data: { veiculoId: v, ataId: a },
            success: function (data)
            {
                if (data.success === false)
                {
                    AppToast.show('Vermelho', 'O veículo escolhido não pertence a essa ata', 3000);
                    const lstV = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
                    if (lstV) lstV.value = '';
                }
            },
            error: function (xhr, status, error)
            {
                Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstAtaVeiculo_Change.error", new Error(error));
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstAtaVeiculo_Change", error);
    }
}

// ====================================================================
// EVENTOS DO MOTORISTA
// ====================================================================

function lstMotorista_Change()
{
    try
    {
        const m = document.getElementById("lstMotorista")?.ej2_instances?.[0]?.value;
        if (!m) return;

        // ✅ CORREÇÃO: Chama API PegaContratoMotorista igual ao UpsertAutuacao
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
                    console.log('✅ Contrato do motorista definido:', data.contratoid);
                } else
                {
                    if (c) c.value = '';
                    AppToast.show('Amarelo', 'O motorista escolhido não possui contrato', 3000);
                }
            },
            error: function (xhr, status, error)
            {
                Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstMotorista_Change.error", new Error(error));
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstMotorista_Change", error);
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
                    AppToast.show('Vermelho', 'O motorista escolhido não pertence a esse contrato', 3000);
                    const lstM = document.getElementById("lstMotorista")?.ej2_instances?.[0];
                    if (lstM) lstM.value = '';
                }
            },
            error: function (xhr, status, error)
            {
                Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstContratoMotorista_Change.error", new Error(error));
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "lstContratoMotorista_Change", error);
    }
}

// ====================================================================
// BOTÕES DE VIAGEM E FICHA
// ====================================================================

$("#btnViagem").on("click", function ()
{
    try
    {
        const lstVeiculo = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
        if (!lstVeiculo || !lstVeiculo.value)
        {
            Alerta.Warning("Atenção", "Selecione um veículo primeiro");
            return;
        }

        ViagemId = lstVeiculo.value;
        const modalViagem = new bootstrap.Modal(document.getElementById('modalViagem'));
        modalViagem.show();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "btnViagem.click", error);
    }
});

$("#btnFicha").on("click", function ()
{
    try
    {
        const txtNoFichaVistoria = document.getElementById("txtNoFichaVistoria");
        const noFicha = txtNoFichaVistoria?.value;

        if (!noFicha)
        {
            AppToast.show('Amarelo', 'Informe o número da Ficha de Vistoria', 3000);
            return;
        }

        // Verifica se a ficha existe antes de abrir o modal
        $.ajax({
            type: "get",
            url: "/api/Viagem/VerificaFichaExiste",
            data: { noFichaVistoria: noFicha },
            success: function (res)
            {
                try
                {
                    if (res && res.success && res.data && res.data.existe)
                    {
                        // Ficha existe - abre o modal
                        FichaId = res.data.fichaId;
                        ViagemId = res.data.viagemId;
                        const modalFicha = new bootstrap.Modal(document.getElementById('modalFicha'));
                        modalFicha.show();
                    }
                    else
                    {
                        AppToast.show('Vermelho', `Ficha de Vistoria Nº ${noFicha} não encontrada`, 4000);
                    }
                } catch (innerError)
                {
                    Alerta.TratamentoErroComLinha("upsert_penalidade.js", "btnFicha.verificaFicha.success", innerError);
                }
            },
            error: function (xhr, status, error)
            {
                AppToast.show('Vermelho', 'Erro ao verificar Ficha de Vistoria', 3000);
                Alerta.TratamentoErroComLinha("upsert_penalidade.js", "btnFicha.verificaFicha.error", new Error(error));
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "btnFicha.click", error);
    }
});

// ====================================================================
// MODAL VIAGEM - BOOTSTRAP 5
// ====================================================================

document.getElementById('modalViagem')?.addEventListener('show.bs.modal', function ()
{
    try
    {
        const id = ViagemId;
        const label = document.getElementById("DynamicModalLabelViagem");
        if (label) label.innerHTML = "";

        $.ajax({
            type: "get",
            url: "/api/Viagem/PegaViagemModal",
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
                            label.innerHTML = `Viagem Nº ${res.data.noViagem}`;
                        }
                        $("#CorpoModalViagem").html(res.data.html);
                    }
                } catch (innerError)
                {
                    Alerta.TratamentoErroComLinha("upsert_penalidade.js", "modalViagem.success", innerError);
                }
            },
            error: function (xhr, status, error)
            {
                Alerta.TratamentoErroComLinha("upsert_penalidade.js", "modalViagem.error", new Error(error));
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "modalViagem.show", error);
    }
});

// ====================================================================
// MODAL FICHA DE VISTORIA - BOOTSTRAP 5
// ====================================================================

document.getElementById('modalFicha')?.addEventListener('show.bs.modal', function ()
{
    try
    {
        const noFicha = document.getElementById("txtNoFichaVistoria")?.value;
        const label = document.getElementById("DynamicModalLabelFicha");
        const imgViewer = document.getElementById("imgViewer");

        if (label) label.innerHTML = `<i class="fa-duotone fa-file-lines"></i> Ficha de Vistoria Nº ${noFicha}`;

        // Carrega a imagem da ficha via API
        if (imgViewer && ViagemId)
        {
            $.ajax({
                url: '/api/Viagem/ObterFichaVistoria',
                type: 'GET',
                data: { viagemId: ViagemId },
                success: function (response)
                {
                    try
                    {
                        if (response.success && response.temImagem)
                        {
                            imgViewer.src = response.imagemBase64;
                            imgViewer.style.display = 'block';
                        }
                        else
                        {
                            imgViewer.style.display = 'none';
                            AppToast.show('Amarelo', 'Ficha de Vistoria não possui imagem cadastrada', 3000);
                        }
                    } catch (innerError)
                    {
                        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "modalFicha.obterFicha.success", innerError);
                    }
                },
                error: function (xhr, status, error)
                {
                    imgViewer.style.display = 'none';
                    AppToast.show('Vermelho', 'Erro ao carregar imagem da Ficha de Vistoria', 3000);
                    Alerta.TratamentoErroComLinha("upsert_penalidade.js", "modalFicha.obterFicha.error", new Error(error));
                }
            });
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "modalFicha.show", error);
    }
});

// ====================================================================
// MÁSCARA DE MOEDA BRASILEIRA DURANTE DIGITAÇÃO
// ====================================================================

function aplicarMascaraMoeda()
{
    try
    {
        $('.moeda-brasileira').each(function ()
        {
            const campo = $(this);

            if (campo.val())
            {
                const valorNumerico = parseFloat(campo.val());
                if (!isNaN(valorNumerico))
                {
                    campo.val(formatarMoeda(valorNumerico));
                }
            }

            campo.off('focus blur keyup');

            campo.on('focus', function ()
            {
                let valor = $(this).val();
                valor = valor.replace(/[^\d,]/g, '');
                $(this).val(valor);
            });

            campo.on('blur', function ()
            {
                let valor = $(this).val();
                if (valor === '' || valor === '0' || valor === '0,00')
                {
                    $(this).val('');
                    return;
                }

                valor = valor.replace(/\./g, '').replace(',', '.');
                const numero = parseFloat(valor);

                if (!isNaN(numero))
                {
                    $(this).val(formatarMoeda(numero));
                }
            });

            campo.on('keyup', function (e)
            {
                let valor = $(this).val();
                valor = valor.replace(/[^\d,]/g, '');

                const partes = valor.split(',');
                if (partes.length > 2)
                {
                    valor = partes[0] + ',' + partes.slice(1).join('');
                }

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
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "aplicarMascaraMoeda", error);
    }
}

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
        setTimeout(function ()
        {
            // Vincula eventos dos Uploaders
            const uploaderAutuacao = document.getElementById("uploaderAutuacao")?.ej2_instances?.[0];
            if (uploaderAutuacao)
            {
                uploaderAutuacao.selected = onAutuacaoUploadSelected;
                uploaderAutuacao.success = onAutuacaoUploadSuccess;
                uploaderAutuacao.failure = onAutuacaoUploadFailure;
                console.log('✅ Eventos do Uploader Autuação vinculados');
            }

            const uploaderPenalidade = document.getElementById("uploaderPenalidade")?.ej2_instances?.[0];
            if (uploaderPenalidade)
            {
                uploaderPenalidade.selected = onPenalidadeUploadSelected;
                uploaderPenalidade.success = onPenalidadeUploadSuccess;
                uploaderPenalidade.failure = onPenalidadeUploadFailure;
                console.log('✅ Eventos do Uploader Penalidade vinculados');
            }

            const uploaderEDoc = document.getElementById("uploaderEDoc")?.ej2_instances?.[0];
            if (uploaderEDoc)
            {
                uploaderEDoc.selected = onEDocUploadSelected;
                uploaderEDoc.success = onEDocUploadSuccess;
                uploaderEDoc.failure = onEDocUploadFailure;
                console.log('✅ Eventos do Uploader e-Doc vinculados');
            }

            const uploaderComprovante = document.getElementById("uploaderComprovante")?.ej2_instances?.[0];
            if (uploaderComprovante)
            {
                uploaderComprovante.selected = onComprovanteUploadSelected;
                uploaderComprovante.success = onComprovanteUploadSuccess;
                uploaderComprovante.failure = onComprovanteUploadFailure;
                console.log('✅ Eventos do Uploader Comprovante vinculados');
            }

            // Carrega PDFs existentes
            const autuacaoPdfExistente = $('#txtAutuacaoPDF').val();
            if (autuacaoPdfExistente && autuacaoPdfExistente !== '')
            {
                loadPdfInViewer(autuacaoPdfExistente, 'pdfviewerAutuacao');
            }

            const penalidadePdfExistente = $('#txtPenalidadePDF').val();
            if (penalidadePdfExistente && penalidadePdfExistente !== '')
            {
                loadPdfInViewer(penalidadePdfExistente, 'pdfviewerPenalidade');
            }

            const edocPdfExistente = $('#txtProcessoEdocPDF').val();
            if (edocPdfExistente && edocPdfExistente !== '')
            {
                loadPdfInViewer(edocPdfExistente, 'pdfviewerEDoc');
            }

            const comprovantePdfExistente = $('#txtComprovantePDF').val();
            if (comprovantePdfExistente && comprovantePdfExistente !== '')
            {
                loadPdfInViewer(comprovantePdfExistente, 'pdfviewerComprovante');
            }

            // Eventos de Change para Dropdowns
            const lstOrgao = document.getElementById("lstOrgao")?.ej2_instances?.[0];
            if (lstOrgao) lstOrgao.change = lstOrgaoChange;

            const lstEmpenhos = document.getElementById("lstEmpenhos")?.ej2_instances?.[0];
            if (lstEmpenhos) lstEmpenhos.change = lstEmpenhosChange;

            const lstVeiculo = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
            if (lstVeiculo) lstVeiculo.change = lstVeiculo_Change;

            const lstContratoVeiculo = document.getElementById("lstContratoVeiculo")?.ej2_instances?.[0];
            if (lstContratoVeiculo) lstContratoVeiculo.change = lstContratoVeiculo_Change;

            const lstAtaVeiculo = document.getElementById("lstAtaVeiculo")?.ej2_instances?.[0];
            if (lstAtaVeiculo) lstAtaVeiculo.change = lstAtaVeiculo_Change;

            const lstMotorista = document.getElementById("lstMotorista")?.ej2_instances?.[0];
            if (lstMotorista) lstMotorista.change = lstMotorista_Change;

            const lstContratoMotorista = document.getElementById("lstContratoMotorista")?.ej2_instances?.[0];
            if (lstContratoMotorista) lstContratoMotorista.change = lstContratoMotorista_Change;

            // Carrega saldo no modo EDIÇÃO
            if (lstEmpenhos && lstEmpenhos.value)
            {
                console.log('💰 Modo EDIÇÃO - carregando saldo do empenho');
                lstEmpenhosChange();
            }

            // ===== CONTROLE DO BOTÃO VER FICHA =====
            const txtNoFichaVistoria = document.getElementById('txtNoFichaVistoria');
            const btnFicha = document.getElementById('btnFicha');

            // Função para habilitar/desabilitar o botão
            function atualizarBotaoFicha()
            {
                if (btnFicha)
                {
                    const temValor = txtNoFichaVistoria && txtNoFichaVistoria.value && txtNoFichaVistoria.value.trim() !== '';
                    btnFicha.disabled = !temValor;
                }
            }

            // Evento de input no campo
            if (txtNoFichaVistoria)
            {
                txtNoFichaVistoria.addEventListener('input', atualizarBotaoFicha);
                txtNoFichaVistoria.addEventListener('change', atualizarBotaoFicha);

                // Verifica estado inicial (modo edição)
                atualizarBotaoFicha();
            }

            // Nota: Máscara de moeda agora é feita via onkeypress no HTML

            console.log('✅ Inicialização completa do upsert_penalidade.js');
        }, 500);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("upsert_penalidade.js", "document.ready", error);
    }
});
