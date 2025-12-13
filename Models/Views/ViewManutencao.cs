using System;

namespace FrotiX.Models
{
    public class ViewManutencao
    {
        // Chaves
        public Guid ManutencaoId
        {
            get; set;
        }

        public Guid? ContratoId
        {
            get; set;
        }

        public Guid VeiculoId
        {
            get; set;
        }

        // Strings básicas
        public string? NumOS
        {
            get; set;
        }

        public string? ResumoOS
        {
            get; set;
        }

        public string? StatusOS
        {
            get; set;
        }

        // Datas formatadas (char(10) no banco)
        public string? DataSolicitacao
        {
            get; set;
        }

        public string? DataDisponibilidade
        {
            get; set;
        }

        public string? DataRecolhimento
        {
            get; set;
        }

        public string? DataRecebimentoReserva
        {
            get; set;
        }

        public string? DataDevolucaoReserva
        {
            get; set;
        }

        public string? DataEntrega
        {
            get; set;
        }

        public string? DataDevolucao
        {
            get; set;
        }

        // Datas cruas (datetime no banco)
        public DateTime? DataSolicitacaoRaw
        {
            get; set;
        }

        public DateTime? DataDevolucaoRaw
        {
            get; set;
        }

        // Descrições e textos
        public string? DescricaoVeiculo
        {
            get; set;
        } // varchar(151)

        public string? PlacaDescricao
        {
            get; set;
        } // varchar(164)

        public string? Sigla
        {
            get; set;
        } // varchar(50)

        public string? CombustivelDescricao
        {
            get; set;
        } // varchar(50)

        public string? Placa
        {
            get; set;
        } // varchar(10)

        public string? Reserva
        {
            get; set;
        } // varchar(7)

        public string? Descricao
        {
            get; set;
        } // varchar(100)

        // Campos numéricos inteiros
        public int? Quantidade
        {
            get; set;
        } // int

        public int? DiasGlosa
        {
            get; set;
        } // int

        public int? Dias
        {
            get; set;
        } // int

        public int? NumItem
        {
            get; set;
        } // int

        // Campos numéricos decimais - ATENÇÃO AOS TIPOS ESPECÍFICOS!
        public double? ValorUnitario
        {
            get; set;
        } // float no banco = double no C#

        public decimal? ValorGlosa
        {
            get; set;
        } // decimal no banco = decimal no C#

        // Campos de UI (todos varchar)
        public string? Habilitado
        {
            get; set;
        } // varchar(50)

        public string? Icon
        {
            get; set;
        } // varchar(21)

        public string? HabilitadoEditar
        {
            get; set;
        } // varchar(8)

        public string? OpacityEditar
        {
            get; set;
        } // varchar(33)

        public string? OpacityTooltipEditarEditar
        {
            get; set;
        } // varchar(25)

        public string? HabilitadoBaixar
        {
            get; set;
        } // varchar(8)

        public string? ModalBaixarAttrs
        {
            get; set;
        } // varchar(50)

        public string? OpacityBaixar
        {
            get; set;
        } // varchar(33)

        public string? Tooltip
        {
            get; set;
        } // varchar(25)

        public string? HabilitadoCancelar
        {
            get; set;
        } // varchar(8)

        public string? OpacityCancelar
        {
            get; set;
        } // varchar(33)

        public string? TooltipCancelar
        {
            get; set;
        } // varchar(20)

        public string? Veiculo
        {
            get; set;
        } // varchar(20)

        public string? CarroReserva
        {
            get; set;
        } // varchar(20)

        public bool? ReservaEnviado
        {
            get; set;
        } // varchar(20)
    }
}
