(function () {
    "use strict";

    $(document).ready(function () {
        try {
            // Inicializa visibilidade dos campos ao carregar
            inicializarCampos();

            // Setup dos event listeners
            setupEventListeners();

            // Carrega listas dependentes se estiver editando
            var veiculoId = $('#VeiculoObj_Veiculo_VeiculoId').val();
            if (veiculoId && veiculoId !== '00000000-0000-0000-0000-000000000000') {
                var marcaId = $('#listamarca').val();
                if (marcaId) {
                    GetModeloList(marcaId);
                }

                // CORRIGIDO: usar o ID correto do dropdown (#lstcontratos)
                var contratoId = $('#lstcontratos').val();
                if (contratoId) {
                    GetItemContratualList(contratoId);
                }

                // CORRIGIDO: usar o ID correto do dropdown (#lstatas)
                var ataId = $('#lstatas').val();
                if (ataId) {
                    GetItemAtaList(ataId);
                }
            }
        } catch (error) {
            Alerta.TratamentoErroComLinha("veiculo_upsert.js", "document.ready", error);
        }
    });

    function inicializarCampos() {
        try {
            // Verifica estado do checkbox Veiculo Próprio
            var veiculoProprio = $('#chkVeiculoProprio').is(':checked');
            toggleCamposVeiculoProprio(veiculoProprio);

            // Esconde listas de Item Contratual e Item Ata se não houver seleção
            var contratoId = $('#lstcontratos').val();
            if (!contratoId) {
                $('#lblItemContrato').hide();
                $('#lstItemVeiculo').hide();
            } else {
                $('#lblItemContrato').show();
                $('#lstItemVeiculo').show();
            }

            var ataId = $('#lstatas').val();
            if (!ataId) {
                $('#lblItemAta').hide();
                $('#lstItemVeiculoAta').hide();
            } else {
                $('#lblItemAta').show();
                $('#lstItemVeiculoAta').show();
            }
        } catch (error) {
            Alerta.TratamentoErroComLinha("veiculo_upsert.js", "inicializarCampos", error);
        }
    }

    function setupEventListeners() {
        try {
            // ========== UPLOAD CRLV ==========
            // Botão dispara o input file
            $('#btnUploadCRLV').on('click', function () {
                try {
                    $('#inputCRLV').click();
                } catch (error) {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "btnUploadCRLV.click", error);
                }
            });

            // Quando selecionar arquivo
            $('#inputCRLV').on('change', function () {
                try {
                    var file = this.files[0];
                    if (file) {
                        // Validar tamanho (max 10MB)
                        if (file.size > 10 * 1024 * 1024) {
                            AppToast.show('Vermelho', 'Arquivo muito grande. Máximo: 10MB', 3000);
                            $(this).val('');
                            return;
                        }

                        // Validar extensão
                        var extensoesValidas = ['.pdf', '.jpg', '.jpeg', '.png'];
                        var nomeArquivo = file.name.toLowerCase();
                        var extensaoValida = extensoesValidas.some(function (ext) {
                            return nomeArquivo.endsWith(ext);
                        });

                        if (!extensaoValida) {
                            AppToast.show('Vermelho', 'Formato inválido. Use PDF, JPG ou PNG', 3000);
                            $(this).val('');
                            return;
                        }

                        // Mostra indicador de novo arquivo
                        $('#nomeCRLVNovo').text(file.name);
                        $('#infoCRLVNovo').show();
                        $('#txtBtnCRLV').text('Substituir CRLV');

                        AppToast.show('Verde', 'Arquivo selecionado: ' + file.name, 2000);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "inputCRLV.change", error);
                }
            });

            // Remover arquivo selecionado
            $('#btnRemoverCRLV').on('click', function () {
                try {
                    $('#inputCRLV').val('');
                    $('#infoCRLVNovo').hide();
                    
                    // Se já tinha CRLV cadastrado, mantém texto "Substituir"
                    var temCRLVExistente = $('#infoCRLVExistente').length > 0;
                    $('#txtBtnCRLV').text(temCRLVExistente ? 'Substituir CRLV' : 'Upload do CRLV');
                    
                    AppToast.show('Amarelo', 'Arquivo removido', 2000);
                } catch (error) {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "btnRemoverCRLV.click", error);
                }
            });

            // Marca - carrega modelos
            $('#listamarca').on('change', function () {
                try {
                    var id = $(this).val();
                    if (id) {
                        GetModeloList(id);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "listamarca.change", error);
                }
            });

            // Contrato - carrega itens contratuais
            $('#lstcontratos').on('change', function () {
                try {
                    var id = $(this).val();
                    if (id) {
                        // Limpa Ata e Item Ata
                        $('#lstatas').val('');
                        $('#lstItemVeiculoAta').hide().val('');
                        $('#lblItemAta').hide();
                        
                        // Desmarca Veículo Próprio
                        $('#chkVeiculoProprio').prop('checked', false);
                        toggleCamposVeiculoProprio(false);
                        
                        // Carrega itens do contrato
                        GetItemContratualList(id);
                        
                        // Mostra Label e Select de Item Contrato
                        $('#lblItemContrato').show();
                        $('#lstItemVeiculo').show();
                    } else {
                        // Se limpou o contrato, esconde item
                        $('#lblItemContrato').hide();
                        $('#lstItemVeiculo').hide().val('');
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "lstcontratos.change", error);
                }
            });

            // Ata - carrega itens da ata
            $('#lstatas').on('change', function () {
                try {
                    var id = $(this).val();
                    if (id) {
                        // Limpa Contrato e Item Contrato
                        $('#lstcontratos').val('');
                        $('#lstItemVeiculo').hide().val('');
                        $('#lblItemContrato').hide();
                        
                        // Desmarca Veículo Próprio
                        $('#chkVeiculoProprio').prop('checked', false);
                        toggleCamposVeiculoProprio(false);
                        
                        // Carrega itens da ata
                        GetItemAtaList(id);
                        
                        // Mostra Label e Select de Item Ata
                        $('#lblItemAta').show();
                        $('#lstItemVeiculoAta').show();
                    } else {
                        // Se limpou a ata, esconde item
                        $('#lblItemAta').hide();
                        $('#lstItemVeiculoAta').hide().val('');
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "lstatas.change", error);
                }
            });

            // Checkbox Veículo Próprio - controla visibilidade dos campos
            $('#chkVeiculoProprio').on('change', function () {
                try {
                    var isChecked = $(this).is(':checked');
                    toggleCamposVeiculoProprio(isChecked);
                } catch (error) {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "chkVeiculoProprio.change", error);
                }
            });

            // Validação e Formatação de Placa
            $('#txtPlaca').on('focusout', function () {
                try {
                    var placa = $(this).val();
                    
                    if (placa) {
                        // Formata: remove espaços, remove hífens, converte para maiúsculo
                        placa = placa.replace(/\s+/g, '').replace(/-/g, '').toUpperCase();
                        $(this).val(placa);
                        
                        // Verifica se placa já existe
                        if (placa.length >= 4) {
                            var ultimos4 = placa.substr(placa.length - 4);
                            verificarPlacaExistente(ultimos4);
                        }
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "txtPlaca.focusout", error);
                }
            });

            // Validação antes de submeter formulário
            $('form').on('submit', function (e) {
                try {
                    console.log('Submit interceptado, validando...');
                    if (!validarCamposObrigatorios()) {
                        console.log('Validação FALHOU - impedindo submit');
                        e.preventDefault();
                        return false;
                    }
                    console.log('Validação OK - permitindo submit');
                    return true;
                } catch (error) {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "form.submit", error);
                    e.preventDefault();
                    return false;
                }
            });

        } catch (error) {
            Alerta.TratamentoErroComLinha("veiculo_upsert.js", "setupEventListeners", error);
        }
    }

    function toggleCamposVeiculoProprio(veiculoProprio) {
        try {
            if (veiculoProprio) {
                // É PRÓPRIO
                // Mostra Patrimônio
                $('#divPatrimonio').show();
                
                // DESABILITA Contrato e Ata (mas mantém visíveis)
                $('#lstcontratos').prop('disabled', true);
                $('#lstatas').prop('disabled', true);
                
                // Esconde e limpa Items
                $('#lstItemVeiculo').hide().val('');
                $('#lstItemVeiculoAta').hide().val('');
                $('#lblItemContrato').hide();
                $('#lblItemAta').hide();
                
                // Limpa valores de Contrato e Ata
                $('#lstcontratos').val('');
                $('#lstatas').val('');
            } else {
                // NÃO É PRÓPRIO
                // Esconde Patrimônio e limpa valor
                $('#divPatrimonio').hide();
                $('#txtPatrimonio').val('');
                
                // HABILITA Contrato e Ata
                $('#lstcontratos').prop('disabled', false);
                $('#lstatas').prop('disabled', false);
            }
        } catch (error) {
            Alerta.TratamentoErroComLinha("veiculo_upsert.js", "toggleCamposVeiculoProprio", error);
        }
    }

    function GetModeloList(marcaId) {
        try {
            $.ajax({
                url: "/Veiculo/Upsert?handler=ModeloList",
                method: "GET",
                data: { id: marcaId },
                success: function (res) {
                    try {
                        var options = '<option value="">-- Selecione um Modelo --</option>';

                        if (res && res.data && res.data.length) {
                            res.data.forEach(function (obj) {
                                options += '<option value="' + obj.modeloId + '">' + obj.descricaoModelo + '</option>';
                            });
                        }

                        $('#ModeloId').html(options);

                        // Seleciona modelo se já existir
                        var modeloIdSelecionado = $('#Veiculo_ModeloId').val();
                        if (modeloIdSelecionado) {
                            $('#ModeloId').val(modeloIdSelecionado);
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetModeloList.success", error);
                    }
                },
                error: function (xhr) {
                    try {
                        console.error("Erro ao carregar modelos:", xhr);
                        AppToast.show('Erro ao carregar modelos', 'Vermelho', 2000);
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetModeloList.error", error);
                    }
                }
            });
        } catch (error) {
            Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetModeloList", error);
        }
    }

    function GetItemContratualList(contratoId) {
        try {
            $.ajax({
                url: "/Veiculo/Upsert?handler=ItemContratual",
                method: "GET",
                data: { id: contratoId },
                success: function (res) {
                    try {
                        var options = '<option value="">-- Selecione um Item Contratual --</option>';

                        if (res && res.data && res.data.length) {
                            res.data.forEach(function (obj) {
                                options += '<option value="' + obj.itemVeiculoId + '">' + obj.descricao + '</option>';
                            });
                        }

                        $('#lstItemVeiculo').html(options);

                        // Seleciona item se já existir
                        var itemIdSelecionado = $('#Veiculo_ItemId').val();
                        if (itemIdSelecionado) {
                            $('#lstItemVeiculo').val(itemIdSelecionado);
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetItemContratualList.success", error);
                    }
                },
                error: function (xhr) {
                    try {
                        console.error("Erro ao carregar itens contratuais:", xhr);
                        AppToast.show('Erro ao carregar itens contratuais', 'Vermelho', 2000);
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetItemContratualList.error", error);
                    }
                }
            });
        } catch (error) {
            Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetItemContratualList", error);
        }
    }

    function GetItemAtaList(ataId) {
        try {
            $.ajax({
                url: "/Veiculo/Upsert?handler=ItemAta",
                method: "GET",
                data: { id: ataId },
                success: function (res) {
                    try {
                        var options = '<option value="">-- Selecione um Item da Ata --</option>';

                        if (res && res.data && res.data.length) {
                            res.data.forEach(function (obj) {
                                options += '<option value="' + obj.itemVeiculoAtaId + '">' + obj.descricao + '</option>';
                            });
                        }

                        $('#lstItemVeiculoAta').html(options);

                        // Seleciona item se já existir
                        var itemAtaIdSelecionado = $('#Veiculo_ItemAtaId').val();
                        if (itemAtaIdSelecionado) {
                            $('#lstItemVeiculoAta').val(itemAtaIdSelecionado);
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetItemAtaList.success", error);
                    }
                },
                error: function (xhr) {
                    try {
                        console.error("Erro ao carregar itens da ata:", xhr);
                        AppToast.show('Erro ao carregar itens da ata', 'Vermelho', 2000);
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetItemAtaList.error", error);
                    }
                }
            });
        } catch (error) {
            Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetItemAtaList", error);
        }
    }

    function verificarPlacaExistente(ultimos4Digitos) {
        try {
            $.ajax({
                url: "/Veiculo/Upsert?handler=VerificaPlaca",
                method: "GET",
                datatype: "json",
                data: { id: ultimos4Digitos },
                success: function (res) {
                    try {
                        if (res && res.data === "Existe Placa") {
                            Alerta.Warning(
                                "Alerta na Placa",
                                "Já existe uma Placa contendo esses valores!",
                                "Ok"
                            );
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "verificarPlacaExistente.success", error);
                    }
                },
                error: function (xhr) {
                    try {
                        console.error("Erro ao verificar placa:", xhr);
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "verificarPlacaExistente.error", error);
                    }
                }
            });
        } catch (error) {
            Alerta.TratamentoErroComLinha("veiculo_upsert.js", "verificarPlacaExistente", error);
        }
    }


    function validarCamposObrigatorios() {
        try {
            var camposErro = [];

            // Marca
            if (!$('#listamarca').val()) {
                camposErro.push('Marca');
            }

            // Modelo
            if (!$('#ModeloId').val()) {
                camposErro.push('Modelo');
            }

            // Placa
            var placa = $('#txtPlaca').val();
            if (!placa || placa.trim() === '') {
                camposErro.push('Placa');
            }

            // Quilometragem
            var km = $('#VeiculoObj_Veiculo_Quilometragem').val();
            if (!km || km.trim() === '') {
                camposErro.push('Quilometragem');
            }

            // Unidade Vinculada
            if (!$('#VeiculoObj_Veiculo_UnidadeId').val()) {
                camposErro.push('Unidade Vinculada');
            }

            // Combustível
            if (!$('#VeiculoObj_Veiculo_CombustivelId').val()) {
                camposErro.push('Combustível');
            }

            // Categoria
            if (!$('#VeiculoObj_Veiculo_Categoria').val()) {
                camposErro.push('Categoria');
            }

            // Data de Ingresso na Frota
            var dataIngresso = $('#txtDataChegada').val();
            if (!dataIngresso || dataIngresso.trim() === '') {
                camposErro.push('Data de Ingresso na Frota');
            }

            // Contrato OU Ata OU Veículo Próprio
            var contratoId = $('#lstcontratos').val();
            var ataId = $('#lstatas').val();
            var veiculoProprio = $('#chkVeiculoProprio').is(':checked');

            if (!contratoId && !ataId && !veiculoProprio) {
                camposErro.push('Contrato, Ata ou Veículo Próprio (escolha ao menos um)');
            }

            // Se tem Contrato E o campo está visível, precisa Item Contratual
            if (contratoId && $('#lstItemVeiculo').is(':visible') && !$('#lstItemVeiculo').val()) {
                camposErro.push('Item Contratual (obrigatório quando há Contrato)');
            }

            // Se tem Ata E o campo está visível, precisa Item da Ata
            if (ataId && $('#lstItemVeiculoAta').is(':visible') && !$('#lstItemVeiculoAta').val()) {
                camposErro.push('Item da Ata (obrigatório quando há Ata)');
            }

            // Se Veículo Próprio E campo está visível, precisa Patrimônio
            if (veiculoProprio && $('#txtPatrimonio').is(':visible')) {
                var patrimonio = $('#txtPatrimonio').val();
                if (!patrimonio || patrimonio.trim() === '') {
                    camposErro.push('Nº Patrimônio (obrigatório para Veículo Próprio)');
                }
            }

            // Se encontrou erros, exibe alerta
            if (camposErro.length > 0) {
                var mensagem = 'Campos obrigatórios não preenchidos:\n\n• ' + camposErro.join('\n• ');
                console.log('Validação falhou. Campos:', camposErro);
                Alerta.Warning('Validação de Campos', mensagem, 'Ok');
                return false;
            }

            console.log('Validação passou! Submetendo formulário...');
            return true;
        } catch (error) {
            Alerta.TratamentoErroComLinha("veiculo_upsert.js", "validarCamposObrigatorios", error);
            return false;
        }
    }

})();
