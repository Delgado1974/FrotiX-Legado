using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;

namespace FrotiX.Pages.Unidade
{
    public class VisualizaLotacoes :PageModel
    {
        public static IUnitOfWork _unitOfWork;

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VisualizaLotacoes.cshtml.cs" , "Initialize" , error);
                return;
            }
        }

        public VisualizaLotacoes(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VisualizaLotacoes.cshtml.cs" , "VisualizaLotacoes" , error);
            }
        }

        public void OnGet()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VisualizaLotacoes.cshtml.cs" , "OnGet" , error);
                return;
            }
        }
    }

    public class ListaCategoria
    {
        public string Categoria
        {
            get; set;
        }
        public string CategoriaId
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaCategoria()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VisualizaLotacoes.cshtml.cs" , "ListaCategoria" , error);
            }
        }

        public ListaCategoria(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VisualizaLotacoes.cshtml.cs" , "ListaCategoria" , error);
            }
        }

        public List<ListaCategoria> CategoriasList()
        {
            try
            {
                List<ListaCategoria> status = new List<ListaCategoria>();

                status.Add(new ListaCategoria { Categoria = "Presidência" , CategoriaId = "Presidência" });
                status.Add(new ListaCategoria { Categoria = "Mesa" , CategoriaId = "Mesa" });
                status.Add(new ListaCategoria { Categoria = "DG" , CategoriaId = "DG" });
                status.Add(new ListaCategoria { Categoria = "SGM" , CategoriaId = "SGM" });
                status.Add(new ListaCategoria { Categoria = "Liderança" , CategoriaId = "Liderança" });
                status.Add(new ListaCategoria { Categoria = "Secom" , CategoriaId = "Secom" });
                status.Add(new ListaCategoria { Categoria = "SNE" , CategoriaId = "SNE" });
                status.Add(new ListaCategoria { Categoria = "Fixos" , CategoriaId = "Fixos" });
                status.Add(new ListaCategoria { Categoria = "Gerais" , CategoriaId = "Gerais" });
                status.Add(new ListaCategoria { Categoria = "Depol" , CategoriaId = "Depol" });

                return status;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VisualizaLotacoes.cshtml.cs" , "CategoriasList" , error);
                return default(List<ListaCategoria>);
            }
        }
    }
}
