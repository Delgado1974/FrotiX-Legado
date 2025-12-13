using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Validations;

namespace FrotiX.Models
    {
    public class FornecedorViewModel
        {
        public Guid FornecedorId { get; set; }
        }

    public class Fornecedor
        {

        [Key]
        public Guid FornecedorId { get; set; }

        [Required(ErrorMessage = "(O nome do fornecedor é obrigatório)")]
        [Display(Name = "Nome do Fornecedor")]
        public string DescricaoFornecedor { get; set; }

        [Required(ErrorMessage = "(O CNPJ do fornecedor é obrigatório)")]
        [Display(Name = "CNPJ")]
        public string CNPJ { get; set; }

        [Display(Name = "Endereço")]
        public string? Endereco { get; set; }

        [Required(ErrorMessage = "(O contato é obrigatório)")]
        [Display(Name = "Contato (1º)")]
        public string Contato01 { get; set; }

        [ValidaZero(ErrorMessage = "(O telefone é obrigatório)")]
        [Required(ErrorMessage = "(O telefone é obrigatório)")]
        [Display(Name = "Telefone/Celular (1º)")]
        public string Telefone01 { get; set; }

        [Display(Name = "Contato (2º)")]
        public string? Contato02 { get; set; }

        [Display(Name = "Telefone/Celular (2º)")]
        public string? Telefone02 { get; set; }

        [Display(Name = "Ativo/Inativo")]
        public bool Status { get; set; }

        }
    }


