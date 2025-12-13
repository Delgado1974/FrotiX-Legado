using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Pages.Ocorrencia
{
    public class OcorrenciasModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;

        public OcorrenciasModel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Ocorrencias.cshtml.cs", "OcorrenciasModel", error);
            }
        }

        public void OnGet()
        {
            try
            {
                // Página carrega dados via AJAX
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Ocorrencias.cshtml.cs", "OnGet", error);
            }
        }
    }

    public class ListaVeiculosOcorrencias
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculosOcorrencias()
        {
        }

        public ListaVeiculosOcorrencias(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Ocorrencias.cshtml.cs", "ListaVeiculosOcorrencias", error);
            }
        }

        public List<ListaVeiculosOcorrencias> VeiculosList()
        {
            try
            {
                // CORREÇÃO: Usar ViewVeiculos ao invés de joins manuais
                var veiculos = _unitOfWork.ViewVeiculos
                    .GetAll()
                    .OrderBy(v => v.VeiculoCompleto)
                    .Select(v => new ListaVeiculosOcorrencias
                    {
                        Id = v.VeiculoId,
                        Descricao = v.VeiculoCompleto ?? v.Placa
                    })
                    .ToList();

                return veiculos;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Ocorrencias.cshtml.cs", "VeiculosList", error);
                return new List<ListaVeiculosOcorrencias>();
            }
        }
    }

    public class ListaMotoristaOcorrencias
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotoristaOcorrencias()
        {
        }

        public ListaMotoristaOcorrencias(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Ocorrencias.cshtml.cs", "ListaMotoristaOcorrencias", error);
            }
        }

        public List<ListaMotoristaOcorrencias> MotoristaList()
        {
            try
            {
                var motoristas = _unitOfWork.ViewMotoristas
                    .GetAll()
                    .OrderBy(m => m.Nome)
                    .Select(m => new ListaMotoristaOcorrencias
                    {
                        Id = m.MotoristaId,
                        Descricao = m.MotoristaCondutor ?? m.Nome
                    })
                    .ToList();

                return motoristas;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Ocorrencias.cshtml.cs", "MotoristaList", error);
                return new List<ListaMotoristaOcorrencias>();
            }
        }
    }

    public class ListaStatusOcorrencias
    {
        public string Status { get; set; }
        public string StatusId { get; set; }

        public ListaStatusOcorrencias()
        {
        }

        public ListaStatusOcorrencias(IUnitOfWork unitOfWork)
        {
        }

        public List<ListaStatusOcorrencias> StatusList()
        {
            try
            {
                return new List<ListaStatusOcorrencias>
                {
                    new ListaStatusOcorrencias { Status = "Todas", StatusId = "Todas" },
                    new ListaStatusOcorrencias { Status = "Abertas", StatusId = "Aberta" },
                    new ListaStatusOcorrencias { Status = "Baixadas", StatusId = "Baixada" },
                    new ListaStatusOcorrencias { Status = "Pendentes", StatusId = "Pendente" },
                    new ListaStatusOcorrencias { Status = "Manutenção", StatusId = "Manutenção" }
                };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Ocorrencias.cshtml.cs", "StatusList", error);
                return new List<ListaStatusOcorrencias>();
            }
        }
    }
}
