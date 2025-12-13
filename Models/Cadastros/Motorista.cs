using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models
{
    public class MotoristaViewModel
    {
        public Guid MotoristaId
        {
            get; set;
        }

        public Guid? ContratoId
        {
            get; set;
        }

        public Motorista? Motorista
        {
            get; set;
        }

        public string? NomeUsuarioAlteracao
        {
            get; set;
        }

        public IEnumerable<SelectListItem>? UnidadeList
        {
            get; set;
        }

        public IEnumerable<SelectListItem>? ContratoList
        {
            get; set;
        }

        public IEnumerable<SelectListItem>? CondutorList
        {
            get; set;
        }
    }

    public class Motorista
    {
        [Key]
        public Guid MotoristaId
        {
            get; set;
        }

        [StringLength(100 , ErrorMessage = "o Nome não pode exceder 100 caracteres")]
        [Required(ErrorMessage = "(O Nome é obrigatório)")]
        [Display(Name = "Nome do Motorista")]
        public string? Nome
        {
            get; set;
        }

        [StringLength(20 , ErrorMessage = "o Ponto não pode exceder 20 caracteres")]
        [Display(Name = "Ponto")]
        public string? Ponto
        {
            get; set;
        }

        [DataType(DataType.DateTime)]
        [Required(ErrorMessage = "(A data de nascimento é obrigatória)")]
        [Display(Name = "Data de Nascimento")]
        public DateTime? DataNascimento
        {
            get; set;
        }

        [StringLength(20 , ErrorMessage = "O CPF não pode exceder 20 caracteres")]
        [Required(ErrorMessage = "(O CPF é obrigatório)")]
        [Display(Name = "CPF")]
        public string? CPF
        {
            get; set;
        }

        [StringLength(20 , ErrorMessage = "A CNH não pode exceder 20 caracteres")]
        [Required(ErrorMessage = "(A CNH é obrigatória)")]
        [Display(Name = "CNH")]
        public string? CNH
        {
            get; set;
        }

        [StringLength(10 , ErrorMessage = "A Categoria da CNH não pode exceder 10 caracteres")]
        [Required(ErrorMessage = "(A categoria da CNH é obrigatória)")]
        [Display(Name = "Categoria da Habilitação")]
        public string? CategoriaCNH
        {
            get; set;
        }

        [DataType(DataType.DateTime)]
        [Required(ErrorMessage = "(A data de vencimento da CNH é obrigatória)")]
        [Display(Name = "Data de Vencimento CNH")]
        public DateTime? DataVencimentoCNH
        {
            get; set;
        }

        [StringLength(50 , ErrorMessage = "O celular não pode exceder 50 caracteres")]
        [Required(ErrorMessage = "(O celular é obrigatório)")]
        [Display(Name = "Primeiro Celular")]
        public string? Celular01
        {
            get; set;
        }

        [StringLength(50 , ErrorMessage = "O celular não pode exceder 50 caracteres")]
        [Display(Name = "Segundo Celular")]
        public string? Celular02
        {
            get; set;
        }

        [DataType(DataType.DateTime)]
        [Required(ErrorMessage = "(A data de ingresso é obrigatória)")]
        [Display(Name = "Data de Ingresso")]
        public DateTime? DataIngresso
        {
            get; set;
        }

        [Display(Name = "Origem da Indicação")]
        public string? OrigemIndicacao
        {
            get; set;
        }

        [Display(Name = "Tipo de Condutor")]
        public string? TipoCondutor
        {
            get; set;
        }

        public byte[]? Foto
        {
            get; set;
        }

        public byte[]? CNHDigital
        {
            get; set;
        }

        [Display(Name = "Ativo/Inativo")]
        public bool Status
        {
            get; set;
        }

        public DateTime? DataAlteracao
        {
            get; set;
        }

        public string? UsuarioIdAlteracao
        {
            get; set;
        }

        [Display(Name = "Código QCard")]
        public int? CodMotoristaQCard
        {
            get; set;
        }

        [Display(Name = "Unidade Vinculada")]
        public Guid? UnidadeId
        {
            get; set;
        }

        [ForeignKey("UnidadeId")]
        public virtual Unidade? Unidade
        {
            get; set;
        }

        //[ValidaLista(ErrorMessage = "(O contrato é obrigatório)")]
        //[Required(ErrorMessage = "(O contrato é obrigatório)")]
        [Display(Name = "Contrato")]
        public Guid? ContratoId
        {
            get; set;
        }

        [ForeignKey("ContratoId")]
        public virtual Contrato? Contrato
        {
            get; set;
        }

        [NotMapped]
        public IFormFile? ArquivoFoto
        {
            get; set;
        }

        [Required(ErrorMessage = "(Você deve indicar se o Motorista é Efetivo ou Ferista)")]
        [Display(Name = "Efetivo / Ferista")]
        public string? EfetivoFerista
        {
            get; set;
        }
    }
}
