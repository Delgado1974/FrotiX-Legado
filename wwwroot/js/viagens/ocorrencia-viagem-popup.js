// =====================================================
// OCORRENCIA-VIAGEM-POPUP.JS
// Popup de ocorrências abertas ao selecionar veículo
// =====================================================

var OcorrenciaViagemPopup = (function () {

    function verificar(veiculoId, veiculoDescricao, callback) {
        if (!veiculoId || veiculoId === '00000000-0000-0000-0000-000000000000') {
            if (callback) callback();
            return;
        }

        $.get('/api/OcorrenciaViagem/ContarAbertasPorVeiculo', { veiculoId: veiculoId }, function (res) {
            if (res.success && res.count > 0) {
                mostrarPopup(veiculoId, veiculoDescricao, res.count, callback);
            } else {
                if (callback) callback();
            }
        });
    }

    function mostrarPopup(veiculoId, veiculoDescricao, count, callback) {
        var modalHtml = `
            <div class="modal fade" id="modalOcorrenciasAbertas" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title">
                                <i class="fa fa-exclamation-triangle me-2"></i>
                                Ocorrências Abertas - ${veiculoDescricao}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-warning">
                                <strong>Atenção!</strong> Este veículo possui <strong>${count}</strong> ocorrência(s) em aberto.
                            </div>
                            <div id="listaOcorrenciasAbertas">
                                <div class="text-center"><i class="fa fa-spinner fa-spin"></i> Carregando...</div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-primary" id="btnContinuarComOcorrencias">
                                Continuar mesmo assim
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

        $('body').append(modalHtml);
        var modal = new bootstrap.Modal(document.getElementById('modalOcorrenciasAbertas'));
        modal.show();

        carregarOcorrencias(veiculoId);

        $('#btnContinuarComOcorrencias').on('click', function () {
            modal.hide();
            if (callback) callback();
        });

        $('#modalOcorrenciasAbertas').on('hidden.bs.modal', function () {
            $(this).remove();
        });
    }

    function carregarOcorrencias(veiculoId) {
        $.get('/api/OcorrenciaViagem/ListarAbertasPorVeiculo', { veiculoId: veiculoId }, function (res) {
            if (res.success) {
                var html = '';
                res.data.forEach(function (oc) {
                    html += criarItemOcorrencia(oc);
                });
                $('#listaOcorrenciasAbertas').html(html || '<p class="text-muted">Nenhuma ocorrência encontrada.</p>');
            }
        });
    }

    function criarItemOcorrencia(oc) {
        var badgeClass = 'bg-secondary';
        if (oc.urgencia === 'Crítica') badgeClass = 'bg-danger';
        else if (oc.urgencia === 'Alta') badgeClass = 'bg-warning text-dark';
        else if (oc.urgencia === 'Média') badgeClass = 'bg-info';

        return `
            <div class="card mb-2 border-start border-warning border-4">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${oc.resumo}</strong>
                            <br><small class="text-muted">Ficha: ${oc.noFichaVistoria || 'N/A'} | ${oc.dataCriacao}</small>
                        </div>
                        <div>
                            <span class="badge ${badgeClass}">${oc.urgencia} (${oc.diasEmAberto} dias)</span>
                            <button class="btn btn-sm btn-success ms-1" onclick="OcorrenciaViagemPopup.darBaixa('${oc.ocorrenciaViagemId}')">
                                <i class="fa fa-check"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function darBaixa(ocorrenciaId) {
        if (!confirm('Confirma dar baixa nesta ocorrência?')) return;

        $.post('/api/OcorrenciaViagem/DarBaixa', { ocorrenciaId: ocorrenciaId }, function (res) {
            if (res.success) {
                AppToast.show('Verde', 'Ocorrência baixada!', 2000);
                var veiculoId = $('#modalOcorrenciasAbertas').data('veiculo-id');
                carregarOcorrencias(veiculoId);
            } else {
                AppToast.show('Vermelho', res.message, 3000);
            }
        });
    }

    return {
        verificar: verificar,
        darBaixa: darBaixa
    };
})();
