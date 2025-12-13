namespace FrotiX.Models
{
    public class ToastMessage
    {
        public string Texto
        {
            get; set;
        }
        public string Cor
        {
            get; set;
        }
        public int Duracao
        {
            get; set;
        }

        public ToastMessage(string texto , string cor = "Verde" , int duracao = 2000)
        {
            Texto = texto;
            Cor = cor;
            Duracao = duracao;
        }
    }

    public enum ToastColor
    {
        Verde,
        Vermelho,
        Laranja
    }
}
