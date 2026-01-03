using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Pages.Manutencao
{
    public class ListaManutencaoModel :PageModel
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
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "Initialize" , error);
                return;
            }
        }

        public ListaManutencaoModel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "ListaManutencaoModel" , error);
            }
        }

        public void OnGet()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "OnGet" , error);
                return;
            }
        }
    }

    public class ListaVeiculosManutencao
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

        public ListaVeiculosManutencao()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "ListaVeiculosManutencao" , error);
            }
        }

        public ListaVeiculosManutencao(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "ListaVeiculosManutencao" , error);
            }
        }

        public List<ListaVeiculosManutencao> VeiculosList()
        {
            try
            {
                List<ListaVeiculosManutencao> veiculos = new List<ListaVeiculosManutencao>();

                var result = (
                    from v in _unitOfWork.Veiculo.GetAll()
                    join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                    join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                    orderby v.Placa
                    select new
                    {
                        Id = v.VeiculoId ,
                        Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo ,
                    }
                ).OrderBy(v => v.Descricao);

                foreach (var veiculo in result)
                {
                    veiculos.Add(
                        new ListaVeiculosManutencao { Descricao = veiculo.Descricao , Id = veiculo.Id }
                    );
                }

                return veiculos;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "VeiculosList" , error);
                return default(List<ListaVeiculosManutencao>);
            }
        }
    }

    public class ListaVeiculosReservaManutencao
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

        public ListaVeiculosReservaManutencao()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "ListaVeiculosReservaManutencao" , error);
            }
        }

        public ListaVeiculosReservaManutencao(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "ListaVeiculosReservaManutencao" , error);
            }
        }

        public List<ListaVeiculosReservaManutencao> VeiculosReservaList()
        {
            try
            {
                List<ListaVeiculosReservaManutencao> veiculos = new List<ListaVeiculosReservaManutencao>();

                var result = (
                    from v in _unitOfWork.Veiculo.GetAll()
                    join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                    join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                    where v.Reserva == true
                    orderby v.Placa
                    select new
                    {
                        Id = v.VeiculoId ,
                        Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo ,
                    }
                ).OrderBy(v => v.Descricao);

                foreach (var veiculo in result)
                {
                    veiculos.Add(
                        new ListaVeiculosReservaManutencao
                        {
                            Descricao = veiculo.Descricao ,
                            Id = veiculo.Id ,
                        }
                    );
                }

                return veiculos;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "VeiculosReservaList" , error);
                return default(List<ListaVeiculosReservaManutencao>);
            }
        }
    }

    public class ListaStatusManutencao
    {
        public string Status
        {
            get; set;
        }
        public string StatusId
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusManutencao()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "ListaStatusManutencao" , error);
            }
        }

        public ListaStatusManutencao(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "ListaStatusManutencao" , error);
            }
        }

        public List<ListaStatusManutencao> StatusList()
        {
            try
            {
                List<ListaStatusManutencao> status = new List<ListaStatusManutencao>();

                status.Add(new ListaStatusManutencao { Status = "Todas" , StatusId = "Todas" });
                status.Add(new ListaStatusManutencao { Status = "Abertas" , StatusId = "Aberta" });
                status.Add(new ListaStatusManutencao { Status = "Canceladas" , StatusId = "Cancelada" });
                status.Add(new ListaStatusManutencao { Status = "Fechadas/Baixadas" , StatusId = "Fechada" });

                return status;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaManutencao.cshtml.cs" , "StatusList" , error);
                return default(List<ListaStatusManutencao>);
            }
        }
    }
}
