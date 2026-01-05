// =====================================================
// OCORRENCIA-VIAGEM.JS
// Gerencia ocorrências no modal de finalização de viagem
// =====================================================

var OcorrenciaViagem = (function () {
    var ocorrencias = [];
    var contadorOcorrencias = 0;

    function init() {
        $('#btnAdicionarOcorrencia').off('click').on('click', adicionarOcorrencia);
        atualizarContador();
    }

    function adicionarOcorrencia() {
        contadorOcorrencias++;
        var html = criarCardOcorrencia(contadorOcorrencias);
        $('#listaOcorrencias').append(html);

        // Inicializar tooltips Bootstrap no card recém-adicionado
        var card = $(`.card-ocorrencia[data-index="${contadorOcorrencias}"]`);
        card.find('[data-bs-toggle="tooltip"]').each(function() {
            new bootstrap.Tooltip(this, {
                customClass: 'tooltip-ftx-azul'
            });
        });

        atualizarContador();
    }

    function criarCardOcorrencia(index) {
        return `
            <div class="card card-ocorrencia mb-2" data-index="${index}" data-confirmada="false">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-warning text-dark badge-status">Ocorrência #${index}</span>
                        <div class="btn-group btn-group-sm">
                            <button type="button" class="btn btn-azul btn-confirmar-ocorrencia"
                                    onclick="OcorrenciaViagem.confirmarOcorrencia(${index})"
                                    data-bs-toggle="tooltip"
                                    data-bs-custom-class="tooltip-ftx-azul"
                                    data-bs-placement="top"
                                    title="Confirmar ocorrência">
                                <i class="fa-duotone fa-check"></i>
                            </button>
                            <button type="button" class="btn btn-vinho"
                                    onclick="OcorrenciaViagem.removerOcorrencia(${index})"
                                    data-bs-toggle="tooltip"
                                    data-bs-custom-class="tooltip-ftx-azul"
                                    data-bs-placement="top"
                                    title="Remover ocorrência">
                                <i class="fa-duotone fa-circle-xmark"></i>
                            </button>
                        </div>
                    </div>
                    <div class="mb-2 container-resumo">
                        <input type="text" class="form-control form-control-sm input-resumo"
                               placeholder="Resumo da ocorrência *" maxlength="200" required>
                        <div class="label-resumo" style="display: none;"></div>
                    </div>
                    <div class="mb-2 container-descricao">
                        <textarea class="form-control form-control-sm input-descricao" rows="2"
                                  placeholder="Descrição detalhada (opcional)"></textarea>
                        <div class="label-descricao" style="display: none;"></div>
                    </div>
                    <div class="mb-2">
                        <input type="file" class="form-control form-control-sm input-imagem"
                               accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm"
                               onchange="OcorrenciaViagem.previewImagem(this, ${index})">
                        <div class="preview-container mt-1" id="preview-${index}"></div>
                        <input type="hidden" class="input-imagem-url">
                    </div>
                </div>
            </div>`;
    }

    function removerOcorrencia(index) {
        $(`.card-ocorrencia[data-index="${index}"]`).remove();
        atualizarContador();
    }

    function confirmarOcorrencia(index) {
        var card = $(`.card-ocorrencia[data-index="${index}"]`);

        // Validar se tem resumo
        var resumo = card.find('.input-resumo').val().trim();
        if (!resumo) {
            card.find('.input-resumo').addClass('is-invalid');
            card.addClass('shake');
            setTimeout(function () {
                card.removeClass('shake');
                card.find('.input-resumo').removeClass('is-invalid');
            }, 500);
            return;
        }

        // Marcar como confirmada
        card.attr('data-confirmada', 'true');

        // Transformar inputs em labels
        var descricao = card.find('.input-descricao').val().trim();

        // Criar labels com os valores
        card.find('.label-resumo').html('<strong>Resumo:</strong> ' + resumo).show();
        card.find('.input-resumo').hide();

        if (descricao) {
            card.find('.label-descricao').html('<strong>Descrição:</strong> ' + descricao).show();
        }
        card.find('.input-descricao').hide();

        // Desabilitar input de imagem
        card.find('.input-imagem').prop('disabled', true).hide();

        // Esconder botão de confirmar e mudar badge
        card.find('.btn-confirmar-ocorrencia').hide();
        card.find('.badge-status').removeClass('bg-warning text-dark').addClass('bg-success text-white').text('Confirmada #' + index);
    }

    function atualizarContador() {
        var total = $('.card-ocorrencia').length;
        var badge = $('#badgeContadorOcorrencias');
        badge.text(total);
        if (total > 0) {
            badge.removeClass('bg-secondary').addClass('bg-warning');
        } else {
            badge.removeClass('bg-warning').addClass('bg-secondary');
        }
    }

    function previewImagem(input, index) {
        var container = $('#preview-' + index);
        container.empty();

        if (input.files && input.files[0]) {
            var file = input.files[0];
            var isVideo = file.type.startsWith('video/');

            if (isVideo) {
                container.html('<video src="' + URL.createObjectURL(file) + '" controls class="img-thumbnail" style="max-height:100px;"></video>');
            } else {
                container.html('<img src="' + URL.createObjectURL(file) + '" class="img-thumbnail" style="max-height:100px;">');
            }

            uploadImagem(file, index);
        }
    }

    function uploadImagem(file, index) {
        var formData = new FormData();
        formData.append('arquivo', file);

        $.ajax({
            url: '/api/OcorrenciaViagem/UploadImagem',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                if (res.success) {
                    var card = $(`.card-ocorrencia[data-index="${index}"]`);
                    card.find('.input-imagem-url').val(res.url);
                }
            }
        });
    }

    function temOcorrencias() {
        return $('.card-ocorrencia').length > 0;
    }

    function validarOcorrencias() {
        var valido = true;
        $('.card-ocorrencia').each(function () {
            var resumo = $(this).find('.input-resumo').val().trim();
            if (!resumo) {
                $(this).addClass('border-danger shake');
                setTimeout(function () { $('.shake').removeClass('shake'); }, 500);
                valido = false;
            }
        });
        return valido;
    }

    function coletarOcorrenciasSimples() {
        var lista = [];
        console.log("📋 Coletando ocorrências simples para envio junto com viagem...");
        
        $('.card-ocorrencia').each(function (idx) {
            var item = {
                Resumo: $(this).find('.input-resumo').val().trim(),
                Descricao: $(this).find('.input-descricao').val().trim(),
                ImagemOcorrencia: $(this).find('.input-imagem-url').val() || ''
            };
            console.log("   Ocorrência " + (idx + 1) + ":", item);
            lista.push(item);
        });
        return lista;
    }

    function coletarOcorrencias(viagemId, veiculoId, motoristaId) {
        var lista = [];
        console.log("📋 Coletando ocorrências...");
        console.log("   viagemId:", viagemId);
        console.log("   veiculoId:", veiculoId);
        console.log("   motoristaId:", motoristaId);
        
        $('.card-ocorrencia').each(function (idx) {
            var item = {
                ViagemId: viagemId,
                VeiculoId: veiculoId,
                MotoristaId: motoristaId || '00000000-0000-0000-0000-000000000000',
                Resumo: $(this).find('.input-resumo').val().trim(),
                Descricao: $(this).find('.input-descricao').val().trim(),
                ImagemOcorrencia: $(this).find('.input-imagem-url').val() || ''
            };
            console.log("   Ocorrência " + (idx + 1) + ":", item);
            lista.push(item);
        });
        return lista;
    }

    function salvarOcorrencias(viagemId, veiculoId, motoristaId, callback) {
        try {
            console.log("💾 Iniciando salvamento de ocorrências...");
            
            // Validar IDs obrigatórios
            if (!viagemId || viagemId === '' || viagemId === 'undefined') {
                console.error("❌ ViagemId inválido:", viagemId);
                if (callback) callback({ success: false, message: 'ViagemId inválido' });
                return;
            }
            if (!veiculoId || veiculoId === '' || veiculoId === 'undefined') {
                console.error("❌ VeiculoId inválido:", veiculoId);
                if (callback) callback({ success: false, message: 'VeiculoId inválido' });
                return;
            }
            
            var lista = coletarOcorrencias(viagemId, veiculoId, motoristaId);
            if (lista.length === 0) {
                console.log("ℹ️ Nenhuma ocorrência para salvar.");
                if (callback) callback({ success: true, message: 'Nenhuma ocorrência para salvar.' });
                return;
            }

            console.log("📤 Enviando " + lista.length + " ocorrência(s) para API...");
            console.log("   Payload:", JSON.stringify(lista, null, 2));

            $.ajax({
                url: '/api/OcorrenciaViagem/CriarMultiplas',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(lista),
                success: function (res) {
                    console.log("✅ Resposta da API:", res);
                    if (callback) callback(res);
                },
                error: function (xhr, status, error) {
                    console.error("❌ Erro AJAX:", { status: status, error: error, response: xhr.responseText });
                    if (callback) callback({ success: false, message: 'Erro de comunicação: ' + error });
                }
            });
        } catch (ex) {
            console.error("❌ Exceção em salvarOcorrencias:", ex);
            if (callback) callback({ success: false, message: 'Exceção: ' + ex.message });
        }
    }

    function limparOcorrencias() {
        $('#listaOcorrencias').empty();
        contadorOcorrencias = 0;
        atualizarContador();
    }

    return {
        init: init,
        adicionarOcorrencia: adicionarOcorrencia,
        removerOcorrencia: removerOcorrencia,
        confirmarOcorrencia: confirmarOcorrencia,
        previewImagem: previewImagem,
        temOcorrencias: temOcorrencias,
        validarOcorrencias: validarOcorrencias,
        coletarOcorrenciasSimples: coletarOcorrenciasSimples,
        salvarOcorrencias: salvarOcorrencias,
        limparOcorrencias: limparOcorrencias
    };
})();

$(document).ready(function () {
    OcorrenciaViagem.init();
});
