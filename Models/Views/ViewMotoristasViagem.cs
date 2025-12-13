using System;

namespace FrotiX.Models.Views
    {
    public class ViewMotoristasViagem
        {

        public Guid MotoristaId { get; set; }

        public string? Nome { get; set; }

        public bool Status { get; set; }

        public string? MotoristaCondutor { get; set; }

        public string? TipoCondutor { get; set; }

        public byte[]? Foto { get; set; }


        }
    }


