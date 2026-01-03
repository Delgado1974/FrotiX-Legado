using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace FrotiX.Controllers
{
    public partial class ContratoController
    {
        /// <summary>
        /// Verifica se o contrato possui dependências que impedem sua exclusão
        /// </summary>
        [HttpGet]
        [Route("VerificarDependencias")]
        public IActionResult VerificarDependencias(Guid id)
        {
            int veiculosContrato = 0;
            int encarregados = 0;
            int operadores = 0;
            int lavadores = 0;
            int motoristas = 0;
            int empenhos = 0;
            int notasFiscais = 0;

            try
            {
                // Cada verificação em try/catch separado para não falhar se uma tabela não existir

                try
                {
                    veiculosContrato = _unitOfWork.VeiculoContrato
                        .GetAll(x => x.ContratoId == id)
                        .Count();
                }
                catch { }

                try
                {
                    encarregados = _unitOfWork.Encarregado
                        .GetAll(x => x.ContratoId == id)
                        .Count();
                }
                catch { }

                try
                {
                    operadores = _unitOfWork.Operador
                        .GetAll(x => x.ContratoId == id)
                        .Count();
                }
                catch { }

                try
                {
                    lavadores = _unitOfWork.Lavador
                        .GetAll(x => x.ContratoId == id)
                        .Count();
                }
                catch { }

                try
                {
                    motoristas = _unitOfWork.Motorista
                        .GetAll(x => x.ContratoId == id)
                        .Count();
                }
                catch { }

                try
                {
                    empenhos = _unitOfWork.Empenho
                        .GetAll(x => x.ContratoId == id)
                        .Count();
                }
                catch { }

                try
                {
                    notasFiscais = _unitOfWork.NotaFiscal
                        .GetAll(x => x.ContratoId == id)
                        .Count();
                }
                catch { }

                var possuiDependencias = veiculosContrato > 0 || encarregados > 0 || 
                                         operadores > 0 || lavadores > 0 || motoristas > 0 ||
                                         empenhos > 0 || notasFiscais > 0;

                return Json(new
                {
                    success = true,
                    possuiDependencias = possuiDependencias,
                    veiculosContrato = veiculosContrato,
                    encarregados = encarregados,
                    operadores = operadores,
                    lavadores = lavadores,
                    motoristas = motoristas,
                    empenhos = empenhos,
                    notasFiscais = notasFiscais
                });
            }
            catch (System.Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Erro ao verificar dependências: " + ex.Message
                });
            }
        }
    }
}
