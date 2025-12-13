using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Pages.Multa
{
    public class ListaEmpenhosMultaModel :PageModel
    {
        public static IUnitOfWork _unitOfWork;

        public ListaEmpenhosMultaModel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaEmpenhosMulta.cshtml.cs" , "ListaEmpenhosMultaModel" , error);
            }
        }

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaEmpenhosMulta.cshtml.cs" , "Initialize" , error);
                return;
            }
        }

        public void OnGet()
        {
            try
            {
                // Método vazio - lógica está no Initialize
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaEmpenhosMulta.cshtml.cs" , "OnGet" , error);
                return;
            }
        }
    }

    public class ListaOrgaoAutuante
    {
        public string Descricao
        {
            get; set;
        }
        public Guid Id
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaOrgaoAutuante()
        {
            try
            {
                // Construtor vazio
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaEmpenhosMulta.cshtml.cs" , "ListaOrgaoAutuante" , error);
            }
        }

        public ListaOrgaoAutuante(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaEmpenhosMulta.cshtml.cs" , "ListaOrgaoAutuante" , error);
            }
        }

        public List<ListaOrgaoAutuante> OrgaoAutuanteList()
        {
            try
            {
                List<ListaOrgaoAutuante> orgaosautuantes = new List<ListaOrgaoAutuante>();

                var result = _unitOfWork.OrgaoAutuante.GetAll().OrderBy(n => n.Nome);

                foreach (var orgao in result)
                {
                    orgaosautuantes.Add(new ListaOrgaoAutuante
                    {
                        Descricao = orgao.Nome + " (" + orgao.Sigla + ")" ,
                        Id = orgao.OrgaoAutuanteId
                    });
                }

                return orgaosautuantes;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaEmpenhosMulta.cshtml.cs" , "OrgaoAutuanteList" , error);
                return default(List<ListaOrgaoAutuante>);
            }
        }
    }
}
