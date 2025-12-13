// ====================================================================
// CONTROLS INIT - Inicialização programática dos controles Syncfusion
// ====================================================================

/**
 * Inicializa todos os event handlers dos controles Syncfusion
 * Deve ser chamado APÓS o DOM estar pronto E após os controles serem renderizados
 */
window.inicializarEventHandlersControles = function () {
    try {
        console.log('🎯 Inicializando event handlers dos controles...');

        // ============================================
        // FINALIDADE
        // ============================================
        const lstFinalidade = document.getElementById('lstFinalidade');
        if (lstFinalidade && lstFinalidade.ej2_instances && lstFinalidade.ej2_instances[0]) {
            const finalidadeObj = lstFinalidade.ej2_instances[0];

            // Remover eventos anteriores se existirem
            finalidadeObj.change = null;

            // Adicionar novo evento
            finalidadeObj.change = function (args) {
                if (window.lstFinalidade_Change) {
                    window.lstFinalidade_Change(args);
                }
            };

            console.log('✅ lstFinalidade: change event configurado');
        }

        // ============================================
        // MOTORISTA
        // ============================================
        const lstMotorista = document.getElementById('lstMotorista');
        if (lstMotorista && lstMotorista.ej2_instances && lstMotorista.ej2_instances[0]) {
            const motoristaObj = lstMotorista.ej2_instances[0];

            console.log('🔧 Inicializando lstMotorista...');

            // Atribuir evento created
            motoristaObj.created = function () {
                if (window.onLstMotoristaCreated) {
                    window.onLstMotoristaCreated();
                }
            };

            // Atribuir evento change
            motoristaObj.change = function (args) {
                if (window.MotoristaValueChange) {
                    window.MotoristaValueChange(args);
                }
            };

            // Aplicar templates IMEDIATAMENTE
            motoristaObj.itemTemplate = function (data) {
                if (!data) return '';

                let imgSrc = (data.FotoBase64 && data.FotoBase64.startsWith('data:image'))
                    ? data.FotoBase64
                    : '/images/barbudo.jpg';

                return `
            <div class="d-flex align-items-center">
                <img src="${imgSrc}" 
                     alt="Foto" 
                     style="height:40px; width:40px; border-radius:50%; margin-right:10px; object-fit: cover;" 
                     onerror="this.src='/images/barbudo.jpg';" />
                <span>${data.Nome || data.MotoristaCondutor || ''}</span>
            </div>`;
            };

            motoristaObj.valueTemplate = function (data) {
                if (!data) return '';

                let imgSrc = (data.FotoBase64 && data.FotoBase64.startsWith('data:image'))
                    ? data.FotoBase64
                    : '/images/barbudo.jpg';

                return `
            <div class="d-flex align-items-center">
                <img src="${imgSrc}" 
                     alt="Foto" 
                     style="height:30px; width:30px; border-radius:50%; margin-right:10px; object-fit: cover;" 
                     onerror="this.src='/images/barbudo.jpg';" />
                <span>${data.Nome || data.MotoristaCondutor || ''}</span>
            </div>`;
            };

            // Aplicar templates imediatamente
            if (window.onLstMotoristaCreated) {
                window.onLstMotoristaCreated();
            }

            console.log('✅ lstMotorista configurado');
        }

        // ============================================
        // VEÍCULO
        // ============================================
        const lstVeiculo = document.getElementById('lstVeiculo');
        if (lstVeiculo && lstVeiculo.ej2_instances && lstVeiculo.ej2_instances[0]) {
            const veiculoObj = lstVeiculo.ej2_instances[0];

            veiculoObj.change = null;
            veiculoObj.change = function (args) {
                if (window.VeiculoValueChange) {
                    window.VeiculoValueChange(args);
                }
            };

            console.log('✅ lstVeiculo: change event configurado');
        }

        // ============================================
        // REQUISITANTE
        // ============================================
        const lstRequisitante = document.getElementById('lstRequisitante');
        if (lstRequisitante && lstRequisitante.ej2_instances && lstRequisitante.ej2_instances[0]) {
            const requisitanteObj = lstRequisitante.ej2_instances[0];

            console.log('🔧 Configurando eventos do lstRequisitante...');
            console.log('   Antes - select:', requisitanteObj.select);
            console.log('   Antes - change:', requisitanteObj.change);

            // ===== EVENTO SELECT (NOVO!) =====
            // Dispara quando um item é selecionado da lista
            // Usado para preencher automaticamente ramal e setor
            requisitanteObj.select = null;
            requisitanteObj.select = function (args) {
                if (window.onSelectRequisitante) {
                    window.onSelectRequisitante(args);
                }
            };

            // ===== EVENTO CHANGE (ORIGINAL) =====
            // Dispara quando o valor do campo muda (inclusive digitação)
            requisitanteObj.change = null;
            requisitanteObj.change = function (args) {
                if (window.RequisitanteValueChange) {
                    window.RequisitanteValueChange(args);
                }
            };

            console.log('   Depois - select:', requisitanteObj.select);
            console.log('   Depois - change:', requisitanteObj.change);
            console.log('✅ lstRequisitante: select e change events configurados');
        }

        // ============================================
        // REQUISITANTE EVENTO
        // ============================================
        const lstRequisitanteEvento = document.getElementById('lstRequisitanteEvento');
        if (lstRequisitanteEvento && lstRequisitanteEvento.ej2_instances && lstRequisitanteEvento.ej2_instances[0]) {
            const requisitanteEventoObj = lstRequisitanteEvento.ej2_instances[0];

            requisitanteEventoObj.change = null;
            requisitanteEventoObj.change = function (args) {
                if (window.RequisitanteEventoValueChange) {
                    window.RequisitanteEventoValueChange(args);
                }
            };

            console.log('✅ lstRequisitanteEvento: change event configurado');
        }

        // ============================================
        // SETOR REQUISITANTE (no accordion)
        // ============================================
        //const ddtSetorRequisitante = document.getElementById('ddtSetorRequisitante');
        //if (ddtSetorRequisitante && ddtSetorRequisitante.ej2_instances && ddtSetorRequisitante.ej2_instances[0])
        //{
        //    const setorReqObj = ddtSetorRequisitante.ej2_instances[0];

        //    // NOTA: Este estava com change="MotoristaValueChange" mas provavelmente está errado
        //    // Deixando sem evento por enquanto ou você pode adicionar um específico
        //    setorReqObj.change = null;

        //    console.log('✅ ddtSetorRequisitante: inicializado (sem evento específico)');
        //}

        // ============================================
        // DIAS DA SEMANA (MultiSelect com blur)
        // ============================================
        const lstDias = document.getElementById('lstDias');
        if (lstDias && lstDias.ej2_instances && lstDias.ej2_instances[0]) {
            const diasObj = lstDias.ej2_instances[0];

            // Adicionar evento de blur
            diasObj.blur = null;
            diasObj.blur = function (args) {
                if (window.onBlurLstDias) {
                    window.onBlurLstDias(args);
                }
            };

            console.log('✅ lstDias: blur event configurado');
        }

        // ============================================
        // RICH TEXT EDITOR (Descrição)
        // ============================================
        const rteDescricao = document.getElementById('rteDescricao');
        if (rteDescricao && rteDescricao.ej2_instances && rteDescricao.ej2_instances[0]) {
            const rteObj = rteDescricao.ej2_instances[0];

            // Created event
            if (window.onCreate) {
                rteObj.created = function () {
                    window.onCreate();
                };
            }

            // ToolbarClick event
            if (window.toolbarClick) {
                rteObj.toolbarClick = function (args) {
                    window.toolbarClick(args);
                };
            }

            console.log('✅ rteDescricao: created e toolbarClick events configurados');
        }

        // ============================================
        // RECORRENTE
        // ============================================
        const lstRecorrente = document.getElementById('lstRecorrente');
        if (lstRecorrente && lstRecorrente.ej2_instances && lstRecorrente.ej2_instances[0]) {
            const recorrenteObj = lstRecorrente.ej2_instances[0];

            recorrenteObj.change = null;
            recorrenteObj.change = function (args) {
                if (window.RecorrenteValueChange) {
                    window.RecorrenteValueChange(args);
                }
            };

            console.log('✅ lstRecorrente: change event configurado');
        }

        // ============================================
        // PERÍODOS (se existir)
        // ============================================
        const lstPeriodos = document.getElementById('lstPeriodos');
        if (lstPeriodos && lstPeriodos.ej2_instances && lstPeriodos.ej2_instances[0]) {
            const periodosObj = lstPeriodos.ej2_instances[0];

            // Verificar se existe função de change para períodos
            if (window.PeriodosValueChange) {
                periodosObj.change = function (args) {
                    window.PeriodosValueChange(args);
                };
                console.log('✅ lstPeriodos: change event configurado');
            }
        }

        console.log('✅ Todos os event handlers foram configurados!');

    } catch (error) {
        Alerta.TratamentoErroComLinha("controls-init.js", "inicializarEventHandlersControles", error);
    }
};
