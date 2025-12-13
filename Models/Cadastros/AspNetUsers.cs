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
        public string Id
        {
            get; set;
        }

        public string? UserName
        {
            get; set;
        }
        public string? NormalizedUserName
        {
            get; set;
        }
        public string? Email
        {
            get; set;
        }
        public string? NormalizedEmail
        {
            get; set;
        }

        // MUDANÇAS AQUI: bool → bool?
        public bool? EmailConfirmed
        {
            get; set;
        }

        public string? PasswordHash
        {
            get; set;
        }
        public string? SecurityStamp
        {
            get; set;
        }
        public string? ConcurrencyStamp
        {
            get; set;
        }
        public string? PhoneNumber
        {
            get; set;
        }

        // MUDANÇAS AQUI: bool → bool?
        public bool? PhoneNumberConfirmed
        {
            get; set;
        }
        public bool? TwoFactorEnabled
        {
            get; set;
        }
        public bool? LockoutEnabled
        {
            get; set;
        }

        public int? AccessFailedCount
        {
            get; set;
        }
        public string? Discriminator
        {
            get; set;
        }

        [Required(ErrorMessage = "(O nome completo é obrigatório)")]
        public string? NomeCompleto
        {
            get; set;
        }

        [Required(ErrorMessage = "(O ponto é obrigatório)")]
        public string? Ponto
        {
            get; set;
        }

        // MUDANÇAS AQUI: bool → bool?
        public bool? PrecisaMudarSenha
        {
            get; set;
        }

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
