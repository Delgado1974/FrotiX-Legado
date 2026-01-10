using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;

namespace FrotiX.Models
{
    public class UsuarioViewModel
    {
        public string Id
        {
            get; set;
        }
        public AspNetUsers AspNetUsers
        {
            get; set;
        }
    }

    public class AspNetUsers :IdentityUser
    {
        [Key]
        public new string Id
        {
            get; set;
        }

        public new string? UserName
        {
            get; set;
        }
        public new string? NormalizedUserName
        {
            get; set;
        }
        [StringLength(256, ErrorMessage = "(O email deve ter no máximo 256 caracteres)")]
        [RegularExpression(@"^[^\s@]+@camara\.leg\.br$", ErrorMessage = "(O email deve terminar em @camara.leg.br e não pode conter espaços)")]
        public new string? Email
        {
            get; set;
        }
        public new string? NormalizedEmail
        {
            get; set;
        }

        // MUDANÇAS AQUI: bool → bool?
        public new bool? EmailConfirmed
        {
            get; set;
        }

        public new string? PasswordHash
        {
            get; set;
        }
        public new string? SecurityStamp
        {
            get; set;
        }
        public new string? ConcurrencyStamp
        {
            get; set;
        }
        public new string? PhoneNumber
        {
            get; set;
        }

        // MUDANÇAS AQUI: bool → bool?
        public new bool? PhoneNumberConfirmed
        {
            get; set;
        }
        public new bool? TwoFactorEnabled
        {
            get; set;
        }
        public new bool? LockoutEnabled
        {
            get; set;
        }

        public new int? AccessFailedCount
        {
            get; set;
        }
        public string? Discriminator
        {
            get; set;
        }

        [Required(ErrorMessage = "(O nome completo é obrigatório)")]
        [StringLength(200, ErrorMessage = "(O nome completo deve ter no máximo 200 caracteres)")]
        public string? NomeCompleto
        {
            get; set;
        }

        [Required(ErrorMessage = "(O ponto é obrigatório)")]
        [StringLength(50, ErrorMessage = "(O ponto deve ter no máximo 50 caracteres)")]
        public string? Ponto
        {
            get; set;
        }

        // MUDANÇAS AQUI: bool → bool?
        public bool? PrecisaMudarSenha
        {
            get; set;
        }

        [Range(0, 99999, ErrorMessage = "(O ramal deve ser um número entre 0 e 99999)")]
        public int? Ramal
        {
            get; set;
        }

        // MUDANÇAS AQUI: bool → bool?
        public bool? Status
        {
            get; set;
        }

        public byte[]? Foto
        {
            get; set;
        }
        public DateTime? Criacao
        {
            get; set;
        }
        public DateTime? UltimoLogin
        {
            get; set;
        }

        // MUDANÇAS AQUI: bool → bool?
        public bool? DetentorCargaPatrimonial
        {
            get; set;
        }

        public string? UsuarioIdAlteracao
        {
            get; set;
        }
    }
}
