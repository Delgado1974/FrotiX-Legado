using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Pages.Viagens
{
    public class FluxoPassageirosModel : PageModel
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
                Alerta.TratamentoErroComLinha("FluxoPassageiros.cshtml.cs", "Initialize", error);
                return;
            }
        }

        public FluxoPassageirosModel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("FluxoPassageiros.cshtml.cs", "FluxoPassageirosModel", error);
            }
        }

        public void OnGet()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("FluxoPassageiros.cshtml.cs", "OnGet", error);
                return;
            }
        }
    }

    public class ListaEconomildos
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaEconomildos()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("FluxoPassageiros.cshtml.cs", "ListaEconomildos", error);
            }
        }

        public ListaEconomildos(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("FluxoPassageiros.cshtml.cs", "ListaEconomildos", error);
            }
        }

        public List<ListaEconomildos> VeiculosList()
        {
            try
            {
                List<ListaEconomildos> veiculos = new List<ListaEconomildos>();

                var result = (
                    from v in _unitOfWork.Veiculo.GetAll()
                    join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                    join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                    where
                        (v.Categoria == "Coletivos Pequenos" || v.Categoria == "Ônibus")
                        && (v.Economildo == true)
                    select new
                    {
                        Id = v.VeiculoId,
                        Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,
                    }
                ).OrderBy(v => v.Descricao);

                foreach (var veiculo in result)
                {
                    veiculos.Add(
                        new ListaEconomildos
                        {
                            Descricao = veiculo.Descricao,
                            Id = veiculo?.Id ?? Guid.Empty,
                        }
                    );
                }

                return veiculos;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("FluxoPassageiros.cshtml.cs", "VeiculosList", error);
                return default(List<ListaEconomildos>);
            }
        }
    }

    public class ListaMotoristaMOB
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotoristaMOB()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("FluxoPassageiros.cshtml.cs", "ListaMotoristaMOB", error);
            }
        }

        public ListaMotoristaMOB(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("FluxoPassageiros.cshtml.cs", "ListaMotoristaMOB", error);
            }
        }

        public List<ListaMotoristaMOB> MotoristaList()
        {
            try
            {
                List<ListaMotoristaMOB> motoristas = new List<ListaMotoristaMOB>();

                var objMotorista = _unitOfWork.ViewMotoristas.GetAll().OrderBy(n => n.Nome);

                foreach (var motorista in objMotorista)
                {
                    motoristas.Add(
                        new ListaMotoristaMOB
                        {
                            Descricao = motorista.MotoristaCondutor,
                            Id = motorista.MotoristaId,
                        }
                    );
                }

                return motoristas;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("FluxoPassageiros.cshtml.cs", "MotoristaList", error);
                return default(List<ListaMotoristaMOB>);
            }
        }
    }
}
