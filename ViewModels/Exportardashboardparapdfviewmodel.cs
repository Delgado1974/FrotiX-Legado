using System;
using System.Collections.Generic;

namespace FrotiX.ViewModels
{
    /// <summary>
    /// ViewModel para receber dados do dashboard para exportação PDF
    /// Usado no POST do JavaScript para enviar gráficos e cards visuais em Base64
    /// </summary>
    public class ExportarDashboardParaPDFViewModel
    {
        /// <summary>
        /// Data inicial do período
        /// </summary>
        public DateTime DataInicio { get; set; }

        /// <summary>
        /// Data final do período
        /// </summary>
        public DateTime DataFim { get; set; }

        /// <summary>
        /// Dicionário com os gráficos em Base64 PNG
        /// Key: Nome do gráfico (status, motoristas, veiculos, finalidades, requisitantes, setores)
        /// Value: String Base64 do PNG (com prefixo data:image/png;base64,...)
        /// </summary>
        public Dictionary<string , string> Graficos { get; set; } = new Dictionary<string , string>();

        /// <summary>
        /// Dicionário com os cards visuais em Base64 PNG (capturados com html2canvas)
        /// Key: ID do card (cardCustoTotal, cardTotalViagens, cardCustoMedio, cardKmTotal, cardKmMedio,
        ///                  cardViagensFinalizadas, cardViagensEmAndamento, cardViagensAgendadas, cardViagensCanceladas)
        /// Value: String Base64 do PNG (com prefixo data:image/png;base64,...)
        /// </summary>
        public Dictionary<string , string> Cards { get; set; } = new Dictionary<string , string>();
    }
}
