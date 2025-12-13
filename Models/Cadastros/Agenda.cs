using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Models
    {

    public class AgendaViewModel
        {
        public string Status { get; set; }
        }


    public class Agenda
        {

        public Guid ViagemId { get; set; }

        public DateTime HoraInicial { get; set; }

        public DateTime HoraFinal { get; set; }

        public DateTime DataInicial { get; set; }

        public string Descricao { get; set; }

        public string Titulo { get; set; }

        public string Status { get; set; }

        public bool DiaTodo { get; set; }

        public string CorEvento { get; set; }

        public string CorTexto { get; set; }

        public string Finalidade { get; set; }
        }
    }


