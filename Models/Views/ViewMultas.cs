using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Services;
using FrotiX.Validations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Models
{
    public class ViewMultas
    {
        public Guid MultaId
        {
            get; set;
        }

        public Guid? MotoristaId
        {
            get; set;
        }

        public Guid? VeiculoId
        {
            get; set;
        }

        public Guid? OrgaoAutuanteId
        {
            get; set;
        }

        public Guid? TipoMultaId
        {
            get; set;
        }

        public string? AutuacaoPDF
        {
            get; set;
        }

        public string? PenalidadePDF
        {
            get; set;
        }

        public string? ComprovantePDF
        {
            get; set;
        }

        public string? NumInfracao
        {
            get; set;
        }

        public string? Data
        {
            get; set;
        }

        public string? Hora
        {
            get; set;
        }

        public string? Nome
        {
            get; set;
        }

        public string? Placa
        {
            get; set;
        }

        public string? Telefone
        {
            get; set;
        }

        public string? Sigla
        {
            get; set;
        }

        public string? Localizacao
        {
            get; set;
        }

        public string? Artigo
        {
            get; set;
        }

        public string? Vencimento
        {
            get; set;
        }

        public double? ValorAteVencimento
        {
            get; set;
        }

        public double? ValorPosVencimento
        {
            get; set;
        }

        public string? ProcessoEDoc
        {
            get; set;
        }

        public string? Status
        {
            get; set;
        }

        public string? Fase
        {
            get; set;
        }

        public string? Descricao
        {
            get; set;
        }

        public string? Observacao
        {
            get; set;
        }

        public bool Paga
        {
            get; set;
        }

        public string? DataPagamento
        {
            get; set;
        }

        public double? ValorPago
        {
            get; set;
        }
    }
}
