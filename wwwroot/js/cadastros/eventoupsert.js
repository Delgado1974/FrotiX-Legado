$(document).ready(function ()
{
    try
    {
        // Preenchimento inicial dos DDTs ao editar
        if (eventoId !== '00000000-0000-0000-0000-000000000000' && eventoId !== null)
        {
            const ddtReq = document.getElementById("lstRequisitanteEvento")?.ej2_instances?.[0];
            const ddtSet = document.getElementById("ddtSetorRequisitanteEvento")?.ej2_instances?.[0];
            if (ddtReq) ddtReq.value = requisitanteId;
            if (ddtSet) ddtSet.value = setorsolicitanteId;
        } else
        {
            // Seta data inicial padrío hoje se novo
            const hoje = new Date().toISOString().slice(0, 10);
            const di = document.getElementById("txtDataInicialEvento");
            if (di && !di.value) di.value = hoje;
        }

        //// Validação simples de datas (final >= inicial)
        //$("#txtDataFinalEvento, #txtDataInicialEvento").on("change", function ()
        //{
        //    const di = $("#txtDataInicialEvento").val();
        //    const df = $("#txtDataFinalEvento").val();
        //    if (!!di && !!df && df < di)
        //    {
        //        $("#txtDataFinalEvento").val("");
        //        AppToast.show('Vermelho', "A data final deve ser maior ou igual à data inicial.");
        //    }
        //});

        // Evita números negativos nos participantes
        $("#txtQtdParticipantes").on("input", function ()
        {
            const v = parseInt(this.value || "0", 10);
            if (v < 0) this.value = 0;
        });

        // Função para carregar estatísticas das viagens
        // Função para carregar estatísticas das viagens
        function carregarEstatisticasViagens()
        {
            $.ajax({
                url: "/api/viagem/ObterTotalCustoViagensEvento",
                type: "GET",
                data: { Id: eventoId },
                success: function (response)
                {
                    if (response.success)
                    {
                        // Preencher campos de estatísticas
                        $("#totalViagens").val(response.totalViagens);
                        $("#custoTotalViagens").val(response.totalCustoFormatado);
                        $("#viagensSemCusto").val(response.viagensSemCusto || "0");

                        // Calcular e preencher média
                        const media = response.custoMedioFormatado ||
                            formatarMoeda(response.totalViagens > 0 ? response.totalCusto / response.totalViagens : 0);
                        $("#custoMedioViagem").val(media);

                        // Adicionar classes de destaque se necessário
                        if (response.viagensSemCusto > 0)
                        {
                            $("#viagensSemCusto").addClass('text-danger');
                        }

                        console.log('Estatísticas carregadas:', response);
                    }
                },
                error: function (xhr, status, error)
                {
                    console.error('Erro ao carregar estatísticas:', error);
                    // Valores padrío em caso de erro
                    $("#totalViagens").val("0");
                    $("#custoTotalViagens").val("R$ 0,00");
                    $("#custoMedioViagem").val("R$ 0,00");
                    $("#viagensSemCusto").val("0");
                }
            });
        }

        // Função auxiliar para formatar moeda
        function formatarMoeda(valor)
        {
            if (!valor && valor !== 0) return "R$ 0,00";
            return parseFloat(valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        }


        // Inicializa DataTable apenas se a tabela existir (edição)
        if ($("#tblViagens").length)
        {
            initEventoTable();
        }

        function initEventoTable()
        {
            try
            {
                // Inicializar o DataTable
                const table = $('#tblViagens').DataTable({
                    lengthChange: false,
                    searching: false,
                    ordering: false,
                    deferRender: true,
                    responsive: true,
                    processing: true,
                    ajax: {
                        url: "/api/viagem/listaviagensevento",
                        type: "GET",
                        data: { Id: eventoId },
                        dataSrc: 'data',
                        beforeSend: function ()
                        {
                            console.time('Requisição API');
                        },
                        complete: function (data)
                        {
                            // Após carregar os dados, buscar o total
                            console.timeEnd('Requisição API');
                            console.log('Quantidade de registros:', data.responseJSON?.data?.length);
                            carregarEstatisticasViagens();
                        }
                    },
                    columns: [
                        {
                            data: "noFichaVistoria",
                            className: "text-center",
                            width: "5%",
                            render: function (data)
                            {
                                return data || '-';
                            }
                        },
                        {
                            data: "dataInicial",
                            className: "text-center",
                            width: "7%",
                            render: function (data, type, row)
                            {
                                if (!data) return '-';
                                if (type === 'display')
                                {
                                    const date = new Date(data);
                                    const dia = date.getDate().toString().padStart(2, '0');
                                    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
                                    const ano = date.getFullYear();
                                    return `${dia}/${mes}/${ano}`;
                                }
                                return data;
                            }
                        },
                        {
                            data: "horaInicio",
                            className: "text-center",
                            width: "5%",
                            render: function (data, type, row)
                            {
                                if (!data) return '-';
                                if (type === 'display')
                                {
                                    const date = new Date(data);
                                    const horas = date.getHours().toString().padStart(2, '0');
                                    const minutos = date.getMinutes().toString().padStart(2, '0');
                                    return `${horas}:${minutos}`;
                                }
                                return data;
                            }
                        },
                        {
                            data: "nomeRequisitante",
                            className: "text-left",
                            width: "20%"
                        },
                        {
                            data: "nomeSetor",
                            className: "text-left",
                            width: "20%"
                        },
                        {
                            data: "nomeMotorista",
                            className: "text-left",
                            width: "15%",
                            render: function (data)
                            {
                                return data || '<span class="text-muted">-</span>';
                            }
                        },
                        {
                            data: "descricaoVeiculo",
                            className: "text-left",
                            width: "25%"
                        },
                        {
                            data: "custoViagem",
                            className: "text-right",
                            width: "13%",
                            render: function (data, type, row)
                            {
                                if (type === 'display')
                                {
                                    if (data === null || data === undefined)
                                    {
                                        return '<span class="text-muted">-</span>';
                                    }
                                    return data.toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    });
                                }
                                return parseFloat(data) || 0;
                            }
                        },
                        {
                            data: null,
                            visible: false,
                            orderable: false,
                            searchable: false,
                            defaultContent:
                                '<button class="btn btn-sm btn-primary btn-edit"><i class="fa fa-edit"></i></button> ' +
                                '<button class="btn btn-sm btn-vinho btn-delete"><i class="fa fa-trash"></i></button>'
                        }
                    ],
                    language: {
                        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                        processing: "Carregando...",
                        emptyTable: "Nenhuma viagem realizada encontrada para este evento"
                    },
                    pageLength: 10,
                    dom: 'rtip'
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("UpsertEvento.cshtml", "initEventoTable", error);
            }
        }

        // Carregar dados ao iniciar a página
        carregarEstatisticasViagens();

        // Atualizar estatísticas quando a tabela for redesenhada
        $('#tblViagens').on('draw.dt', function ()
        {
            carregarEstatisticasViagens();
        });


        // Função para atualizar o total via Ajax
        function atualizarTotalViagens()
        {
            $.ajax({
                url: "/api/viagem/ObterTotalCustoViagensEvento",
                type: "GET",
                data: { Id: eventoId },
                success: function (response)
                {
                    if (response.success)
                    {
                        // Atualizar o título com os totais
                        $("#TituloViagens").html(
                            `Viagens associadas ao Evento - ` +
                            `Total de ${response.totalViagens} viagem(ns) - ` +
                            `Custo Total: ${response.totalCustoFormatado}`
                        );

                        // Se você tiver outros campos para preencher
                        $("#totalViagens").text(response.totalViagens);
                        $("#custoTotal").text(response.totalCustoFormatado);

                        // Log para debug
                        console.log('Total calculado com sucesso:', response);
                    } else
                    {
                        console.error('Erro ao calcular total:', response.error);
                        $("#TituloViagens").html(
                            `Viagens associadas ao Evento - Erro ao calcular total`
                        );
                    }
                },
                error: function (xhr, status, error)
                {
                    console.error('Erro na requisição:', error);
                    $("#TituloViagens").html(
                        `Viagens associadas ao Evento - Erro ao carregar total`
                    );
                }
            });
        }

        // Chamar a função ao carregar a página
        atualizarTotalViagens();

        // Se quiser atualizar quando a tabela for recarregada
        $('#tblViagens').on('draw.dt', function ()
        {
            atualizarTotalViagens();
        });

        // Preenchimento inicial ao editar
        if (eventoId !== '00000000-0000-0000-0000-000000000000' && eventoId !== null)
        {
            const ddtReq = document.getElementById("lstRequisitanteEvento")?.ej2_instances?.[0];
            const ddlSetor = document.getElementById('ddlSetorRequisitanteEvento');

            if (ddtReq && requisitanteId)
            {
                ddtReq.value = [requisitanteId];
            }

            if (ddlSetor && setorsolicitanteId)
            {
                ddlSetor.value = setorsolicitanteId;
            }
        }

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("UpsertEvento.cshtml", "document.ready", error);
    }
});



// Adicione esta função antes do DataTable
function calcularTotalViagens()
{
    const table = $('#tblViagens').DataTable();
    let total = 0;

    // Pegar todos os dados da coluna de custo
    table.rows({ page: 'current' }).every(function ()
    {
        const data = this.data();
        if (data && data.custoViagem)
        {
            total += parseFloat(data.custoViagem) || 0;
        }
    });

    // Atualizar o título
    $("#TituloViagens").html(
        `Viagens associadas ao Evento - Custo Total: R$ ${total.toFixed(2).replace('.', ',')}`
    );

    return total;
}


document.addEventListener('DOMContentLoaded', function ()
{
    // Função para atualizar o campo de texto do setor
    function atualizarCampoSetor()
    {
        // Aguarda um momento para garantir que o DropDownTree foi atualizado
        setTimeout(function ()
        {
            // Obtém a instância do DropDownTree de Setor
            var setorDropDown = document.getElementById('ddtSetorRequisitanteEvento');
            if (setorDropDown && setorDropDown.ej2_instances && setorDropDown.ej2_instances[0])
            {
                var setorInstance = setorDropDown.ej2_instances[0];

                // Obtém o texto selecionado
                var textoSetor = setorInstance.text || '';

                // Se não houver texto, tenta obter de outras formas
                if (!textoSetor && setorInstance.value)
                {
                    // Tenta encontrar o texto baseado no value
                    var selectedData = setorInstance.treeData;
                    if (selectedData && selectedData.length > 0)
                    {
                        textoSetor = findTextByValue(selectedData, setorInstance.value[0]);
                    }
                }

                // Atualiza o campo de texto
                document.getElementById('txtSetorRequisitante').value = textoSetor;
            }
        }, 100);
    }

    // Função auxiliar para encontrar texto pelo valor
    function findTextByValue(data, value)
    {
        for (var i = 0; i < data.length; i++)
        {
            if (data[i].SetorSolicitanteId === value)
            {
                return data[i].Nome;
            }
            // Se houver subnós, procura recursivamente
            if (data[i].child)
            {
                var found = findTextByValue(data[i].child, value);
                if (found) return found;
            }
        }
        return '';
    }

    // Monitora mudanças no DropDownTree oculto
    var setorDropDown = document.getElementById('ddtSetorRequisitanteEvento');
    if (setorDropDown)
    {
        setorDropDown.addEventListener('change', atualizarCampoSetor);

        // Se já houver um valor inicial, atualiza
        setTimeout(atualizarCampoSetor, 500);
    }

    // Observer para detectar mudanças no DOM do DropDownTree
    var observer = new MutationObserver(function (mutations)
    {
        mutations.forEach(function (mutation)
        {
            if (mutation.type === 'attributes' || mutation.type === 'childList')
            {
                atualizarCampoSetor();
            }
        });
    });

    // Observa mudanças no DropDownTree de Setor
    if (setorDropDown)
    {
        observer.observe(setorDropDown, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['value']
        });
    }
});
