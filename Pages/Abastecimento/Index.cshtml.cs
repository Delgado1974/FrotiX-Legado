/*
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                          ║
 * ║  📚 DOCUMENTAÇÃO DISPONÍVEL                                              ║
 * ║                                                                          ║
 * ║  Este arquivo está completamente documentado em:                         ║
 * ║  📄 Documentacao/Pages/Abastecimento - Index.md                           ║
 * ║                                                                          ║
 * ║  Última atualização: 08/01/2026                                          ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Pages.Abastecimento
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

        public void OnGet()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "OnGet" , error);
                return;
            }
        }
    }

    public class ListaVeiculos
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

        public ListaVeiculos()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "ListaVeiculos" , error);
            }
        }

        public ListaVeiculos(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "ListaVeiculos" , error);
            }
        }

        public List<ListaVeiculos> VeiculosList()
        {
            try
            {
                List<ListaVeiculos> veiculos = new();
                try
                {
                    var result = (
                        from v in _unitOfWork.Veiculo.GetAll()
                        join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                        join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                        orderby v.Placa
                        select new
                        {
                            Id = v.VeiculoId ,
                            Descricao = v.Placa
                                + " - "
                                + ma.DescricaoMarca
                                + "/"
                                + m.DescricaoModelo ,
                        }
                    ).OrderBy(v => v.Descricao);

                    foreach (var veiculo in result)
                    {
                        veiculos.Add(
                            new ListaVeiculos { Descricao = veiculo.Descricao , Id = veiculo.Id }
                        );
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(
                        ErroHelper.MontarScriptErro("ListaVeiculos" , "VeiculosList" , ex)
                    );
                }

                return veiculos;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "VeiculosList" , error);
                return default(List<ListaVeiculos>);
            }
        }
    }

    public class ListaCombustivel
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

        public ListaCombustivel()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "ListaCombustivel" , error);
            }
        }

        public ListaCombustivel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "ListaCombustivel" , error);
            }
        }

        public List<ListaCombustivel> CombustivelList()
        {
            try
            {
                List<ListaCombustivel> combustiveis = new();
                try
                {
                    var result = _unitOfWork.Combustivel.GetAll();
                    foreach (var combustivel in result)
                    {
                        combustiveis.Add(
                            new ListaCombustivel
                            {
                                Descricao = combustivel.Descricao ,
                                Id = combustivel.CombustivelId ,
                            }
                        );
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(
                        ErroHelper.MontarScriptErro("ListaCombustivel" , "CombustivelList" , ex)
                    );
                }

                return combustiveis;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "CombustivelList" , error);
                return default(List<ListaCombustivel>);
            }
        }
    }

    public class ListaUnidade
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

        public ListaUnidade()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "ListaUnidade" , error);
            }
        }

        public ListaUnidade(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "ListaUnidade" , error);
            }
        }

        public List<ListaUnidade> UnidadeList()
        {
            try
            {
                List<ListaUnidade> unidades = new();
                try
                {
                    var result = _unitOfWork.Unidade.GetAll().OrderBy(d => d.Descricao);
                    foreach (var unidade in result)
                    {
                        unidades.Add(
                            new ListaUnidade
                            {
                                Descricao = unidade.Descricao ,
                                Id = unidade.UnidadeId ,
                            }
                        );
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(
                        ErroHelper.MontarScriptErro("ListaUnidade" , "UnidadeList" , ex)
                    );
                }

                return unidades;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "UnidadeList" , error);
                return default(List<ListaUnidade>);
            }
        }
    }

    public class ListaMotorista
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

        public ListaMotorista()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "ListaMotorista" , error);
            }
        }

        public ListaMotorista(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "ListaMotorista" , error);
            }
        }

        public List<ListaMotorista> MotoristaList()
        {
            try
            {
                List<ListaMotorista> motoristas = new();
                try
                {
                    var result = _unitOfWork.ViewMotoristas.GetAll().OrderBy(n => n.Nome);
                    foreach (var motorista in result)
                    {
                        motoristas.Add(
                            new ListaMotorista
                            {
                                Descricao = motorista.MotoristaCondutor ,
                                Id = motorista.MotoristaId ,
                            }
                        );
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(
                        ErroHelper.MontarScriptErro("ListaMotorista" , "MotoristaList" , ex)
                    );
                }

                return motoristas;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "MotoristaList" , error);
                return default(List<ListaMotorista>);
            }
        }
    }
}
