using System;

namespace FrotiX.Models.DTO
    {
    public class ViagemCalendarDTO
        {
        public Guid id { get; set; }
        public string title { get; set; }
        public DateTime? start { get; set; }        // se trouxe assim
        public DateTime? end { get; set; }          // idem
        public DateTime? dataInicial { get; set; }  // <-- adicione este!
        public DateTime? horaInicio { get; set; }   // <-- adicione este!
        public DateTime? dataFinal { get; set; }    // <-- adicione este!
        public DateTime? horaFim { get; set; }      // <-- adicione este!
        public string backgroundColor { get; set; }
        public string textColor { get; set; }
        public string descricao { get; set; }
        }
    }


