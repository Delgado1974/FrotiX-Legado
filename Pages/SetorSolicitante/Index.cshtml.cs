using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;

namespace FrotiX.Pages.SetorSolicitante
{
    public class IndexModel :PageModel
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
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "Initialize" , error);
                return;
            }
        }

        public IndexModel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "IndexModel" , error);
            }
        }

        public class TreeGridItems
        {
            public TreeGridItems()
            {
                try
                {
                }
                catch (Exception error)
                {
                    Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "TreeGridItems" , error);
                }
            }

            public Guid SetorSolicitanteId
            {
                get; set;
            }
            public string Nome
            {
                get; set;
            }
            public string Sigla
            {
                get; set;
            }
            public int Ramal
            {
                get; set;
            }
            public string Status
            {
                get; set;
            }
            public Guid SetorPaiId
            {
                get; set;
            }

            public static List<TreeGridItems> GetSelfData()
            {
                try
                {
                    var ListaSetores = _unitOfWork.SetorSolicitante.GetAll();

                    List<TreeGridItems> BusinessObjectCollection = new List<TreeGridItems>();

                    string status = "";
                    string sigla = "";

                    foreach (var setor in ListaSetores)
                    {
                        status = "Inativo";
                        sigla = "";

                        if ((bool)setor.Status)
                        {
                            status = "Ativo";
                        }
                        if (setor.Sigla != null)
                        {
                            sigla = setor.Sigla;
                        }

                        BusinessObjectCollection.Add(
                            new TreeGridItems()
                            {
                                SetorSolicitanteId = setor.SetorSolicitanteId ,
                                Nome = setor.Nome ,
                                Sigla = sigla ,
                                Ramal = (int)setor.Ramal ,
                                Status = status ,
                                SetorPaiId = setor.SetorPaiId ?? Guid.Empty ,
                            }
                        );
                    }

                    return BusinessObjectCollection;
                }
                catch (Exception error)
                {
                    Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "GetSelfData" , error);
                    return default(List<TreeGridItems>);
                }
            }
        }
    }
}
