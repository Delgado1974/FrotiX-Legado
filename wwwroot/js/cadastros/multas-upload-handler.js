// ====================================================================
// MULTAS UPLOAD HANDLER
// Gerenciador centralizado para múltiplos uploaders de PDF
// ====================================================================

var MultasUpload = (function ()
{
    'use strict';

    // ====================================================================
    // FUNÇÕES PRIVADAS - HELPERS
    // ====================================================================

    /**
     * Obtém instância de um viewer específico
     */
    function getViewer(viewerId)
    {
        try
        {
            return document.getElementById(viewerId)?.ej2_instances?.[0] || null;
        }
        catch (err)
        {
            if (window.Alerta?.TratamentoErroComLinha)
            {
                Alerta.TratamentoErroComLinha("multas-upload-handler.js", "getViewer", err);
            }
            return null;
        }
    }

    /**
     * Carrega PDF em um viewer específico
     */
    function loadPdfInViewer(fileName, viewerId)
    {
        try
        {
            if (!fileName || fileName === '' || fileName === 'null')
            {
                console.warn("Nome de arquivo inválido para carregar no viewer");
                return;
            }

            const viewer = getViewer(viewerId);
            if (!viewer)
            {
                console.error("Viewer não encontrado:", viewerId);
                return;
            }

            viewer.documentPath = fileName;
            viewer.dataBind();
            viewer.load(fileName, null);
        }
        catch (error)
        {
            if (window.Alerta?.TratamentoErroComLinha)
            {
                Alerta.TratamentoErroComLinha("multas-upload-handler.js", "loadPdfInViewer", error);
            }
            console.error(error);
        }
    }

    /**
     * Extrai payload da resposta do servidor
     */
    function extractPayload(args)
    {
        try
        {
            if (args?.response?.response)
            {
                return JSON.parse(args.response.response);
            }
            else if (args?.e?.target?.response)
            {
                return JSON.parse(args.e.target.response);
            }
            else if (typeof args?.response === "string")
            {
                return JSON.parse(args.response);
            }
            return null;
        }
        catch (error)
        {
            if (window.Alerta?.TratamentoErroComLinha)
            {
                Alerta.TratamentoErroComLinha("multas-upload-handler.js", "extractPayload", error);
            }
            return null;
        }
    }

    // ====================================================================
    // CALLBACKS GENÉRICOS
    // ====================================================================

    /**
     * Validação genérica de arquivo selecionado
     */
    function onUploadSelected(args)
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
                }
                else
                {
                    alert("Apenas arquivos PDF são permitidos.");
                }
            }
        }
        catch (error)
        {
            if (window.Alerta?.TratamentoErroComLinha)
            {
                Alerta.TratamentoErroComLinha("multas-upload-handler.js", "onUploadSelected", error);
            }
        }
    }

    /**
     * Callback genérico de falha
     */
    function onUploadFailure(args)
    {
        try
        {
            let msg = "Falha no upload do PDF";

            if (args?.response?.responseText)
            {
                msg += ": " + args.response.responseText;
            }

            if (window.AppToast?.show)
            {
                AppToast.show('Vermelho', msg, 4000);
            }
            else
            {
                alert(msg);
            }
        }
        catch (error)
        {
            if (window.Alerta?.TratamentoErroComLinha)
            {
                Alerta.TratamentoErroComLinha("multas-upload-handler.js", "onUploadFailure", error);
            }
        }
    }

    /**
     * Factory para criar callback de sucesso específico
     */
    function createSuccessHandler(inputId, viewerId, successMessage)
    {
        return function (args)
        {
            try
            {
                const payload = extractPayload(args);

                if (!payload || !payload.fileName)
                {
                    console.warn("Upload OK, mas não veio fileName na resposta");

                    if (window.AppToast?.show)
                    {
                        AppToast.show('Amarelo', 'Arquivo enviado, mas houve problema ao processar', 3000);
                    }
                    return;
                }

                // Atualiza campo hidden
                $(inputId).val(payload.fileName);

                // Carrega no viewer
                loadPdfInViewer(payload.fileName, viewerId);

                // Mostra mensagem de sucesso
                if (window.AppToast?.show)
                {
                    AppToast.show('Verde', successMessage, 3000);
                }
            }
            catch (error)
            {
                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("multas-upload-handler.js", "successHandler", error);
                }
                console.error(error);
            }
        };
    }

    // ====================================================================
    // CALLBACKS ESPECÍFICOS PARA CADA TIPO DE UPLOAD
    // ====================================================================

    var onUploadSuccess_Autuacao = createSuccessHandler(
        '#txtAutuacaoPDF',
        'pdfviewerAutuacao',
        'PDF de Autuação enviado com sucesso!'
    );

    var onUploadSuccess_Penalidade = createSuccessHandler(
        '#txtPenalidadePDF',
        'pdfviewerPenalidade',
        'PDF de Penalidade enviado com sucesso!'
    );

    var onUploadSuccess_Comprovante = createSuccessHandler(
        '#txtComprovantePDF',
        'pdfviewerComprovante',
        'Comprovante enviado com sucesso!'
    );

    var onUploadSuccess_EDoc = createSuccessHandler(
        '#txtEDocPDF',
        'pdfviewerEDoc',
        'Processo e-Doc enviado com sucesso!'
    );

    var onUploadSuccess_OutrosDocumentos = createSuccessHandler(
        '#txtOutrosDocumentosPDF',
        'pdfviewerOutrosDocumentos',
        'Documento enviado com sucesso!'
    );

    // ====================================================================
    // API PÚBLICA
    // ====================================================================

    return {
        // Callbacks genéricos
        onUploadSelected: onUploadSelected,
        onUploadFailure: onUploadFailure,

        // Callbacks específicos de sucesso
        onUploadSuccess_Autuacao: onUploadSuccess_Autuacao,
        onUploadSuccess_Penalidade: onUploadSuccess_Penalidade,
        onUploadSuccess_Comprovante: onUploadSuccess_Comprovante,
        onUploadSuccess_EDoc: onUploadSuccess_EDoc,
        onUploadSuccess_OutrosDocumentos: onUploadSuccess_OutrosDocumentos,

        // Utilitários expostos
        loadPdfInViewer: loadPdfInViewer,
        getViewer: getViewer
    };
})();

// ====================================================================
// INICIALIZAÇÃO NA CARGA DA PÁGINA
// ====================================================================

$(document).ready(function ()
{
    try
    {
        console.log("MultasUpload Handler inicializado com sucesso!");

        // Carrega PDFs existentes ao editar (modo edição)
        setTimeout(function ()
        {
            try
            {
                // Autuação
                const autuacaoPDF = $('#txtAutuacaoPDF').val();
                if (autuacaoPDF && autuacaoPDF !== '' && autuacaoPDF !== 'null')
                {
                    MultasUpload.loadPdfInViewer(autuacaoPDF, 'pdfviewerAutuacao');
                }

                // Penalidade
                const penalidadePDF = $('#txtPenalidadePDF').val();
                if (penalidadePDF && penalidadePDF !== '' && penalidadePDF !== 'null')
                {
                    MultasUpload.loadPdfInViewer(penalidadePDF, 'pdfviewerPenalidade');
                }

                // Comprovante
                const comprovantePDF = $('#txtComprovantePDF').val();
                if (comprovantePDF && comprovantePDF !== '' && comprovantePDF !== 'null')
                {
                    MultasUpload.loadPdfInViewer(comprovantePDF, 'pdfviewerComprovante');
                }

                // EDoc
                const edocPDF = $('#txtEDocPDF').val();
                if (edocPDF && edocPDF !== '' && edocPDF !== 'null')
                {
                    MultasUpload.loadPdfInViewer(edocPDF, 'pdfviewerEDoc');
                }

                // Outros Documentos
                const outrosPDF = $('#txtOutrosDocumentosPDF').val();
                if (outrosPDF && outrosPDF !== '' && outrosPDF !== 'null')
                {
                    MultasUpload.loadPdfInViewer(outrosPDF, 'pdfviewerOutrosDocumentos');
                }
            }
            catch (error)
            {
                if (window.Alerta?.TratamentoErroComLinha)
                {
                    Alerta.TratamentoErroComLinha("multas-upload-handler.js", "carregarPDFsExistentes", error);
                }
            }
        }, 1500);
    }
    catch (error)
    {
        if (window.Alerta?.TratamentoErroComLinha)
        {
            Alerta.TratamentoErroComLinha("multas-upload-handler.js", "document.ready", error);
        }
    }
});
