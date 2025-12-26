using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public partial class ItensContratoController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ItensContratoController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "Constructor", error);
            }
        }

        // ============================================================
        // CONTRATOS E ATAS - LISTAGEM PARA DROPDOWN
        // ============================================================

        [HttpGet]
        [Route("ListaContratos")]
        public IActionResult ListaContratos(bool status = true)
        {
            try
            {
                var contratos = _unitOfWork.Contrato.GetAll(
                    filter: c => c.Status == status,
                    includeProperties: "Fornecedor"
                )
                .OrderBy(c => c.NumeroContrato)
                .ThenBy(c => c.AnoContrato)
                .Select(c => new
                {
                    value = c.ContratoId,
                    text = $"{c.NumeroContrato}/{c.AnoContrato} - {c.TipoContrato} - {c.Fornecedor.DescricaoFornecedor}",
                    tipoContrato = c.TipoContrato
                })
                .ToList();

                return Ok(new { success = true, data = contratos });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "ListaContratos", error);
                return Ok(new { success = false, message = "Erro ao carregar contratos" });
            }
        }

        [HttpGet]
        [Route("ListaAtas")]
        public IActionResult ListaAtas(bool status = true)
        {
            try
            {
                var atas = _unitOfWork.AtaRegistroPrecos.GetAll(
                    filter: a => a.Status == status,
                    includeProperties: "Fornecedor"
                )
                .OrderBy(a => a.NumeroAta)
                .ThenBy(a => a.AnoAta)
                .Select(a => new
                {
                    value = a.AtaId,
                    text = $"{a.NumeroAta}/{a.AnoAta} - {a.Fornecedor.DescricaoFornecedor}"
                })
                .ToList();

                return Ok(new { success = true, data = atas });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "ListaAtas", error);
                return Ok(new { success = false, message = "Erro ao carregar atas" });
            }
        }

        // ============================================================
        // DETALHES DO CONTRATO/ATA SELECIONADO
        // ============================================================

        [HttpGet]
        [Route("GetContratoDetalhes")]
        public IActionResult GetContratoDetalhes(Guid id)
        {
            try
            {
                var contrato = _unitOfWork.Contrato.GetFirstOrDefault(
                    filter: c => c.ContratoId == id,
                    includeProperties: "Fornecedor"
                );

                if (contrato == null)
                {
                    return Ok(new { success = false, message = "Contrato não encontrado" });
                }

                var resumo = new
                {
                    contratoId = contrato.ContratoId,
                    numeroContrato = contrato.NumeroContrato,
                    anoContrato = contrato.AnoContrato,
                    contratoCompleto = $"{contrato.NumeroContrato}/{contrato.AnoContrato}",
                    tipoContrato = contrato.TipoContrato,
                    objeto = contrato.Objeto,
                    fornecedor = contrato.Fornecedor?.DescricaoFornecedor ?? "",
                    dataInicio = contrato.DataInicio?.ToString("dd/MM/yyyy"),
                    dataFim = contrato.DataFim?.ToString("dd/MM/yyyy"),
                    valor = contrato.Valor,
                    status = contrato.Status,
                    // Flags Terceirização
                    contratoEncarregados = contrato.ContratoEncarregados,
                    contratoOperadores = contrato.ContratoOperadores,
                    contratoMotoristas = contrato.ContratoMotoristas,
                    contratoLavadores = contrato.ContratoLavadores,
                    // Quantidades
                    quantidadeEncarregado = contrato.QuantidadeEncarregado ?? 0,
                    quantidadeOperador = contrato.QuantidadeOperador ?? 0,
                    quantidadeMotorista = contrato.QuantidadeMotorista ?? 0,
                    quantidadeLavador = contrato.QuantidadeLavador ?? 0,
                    // Custos
                    custoMensalEncarregado = contrato.CustoMensalEncarregado ?? 0,
                    custoMensalOperador = contrato.CustoMensalOperador ?? 0,
                    custoMensalMotorista = contrato.CustoMensalMotorista ?? 0,
                    custoMensalLavador = contrato.CustoMensalLavador ?? 0
                };

                return Ok(new { success = true, data = resumo });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetContratoDetalhes", error);
                return Ok(new { success = false, message = "Erro ao carregar detalhes do contrato" });
            }
        }

        [HttpGet]
        [Route("GetAtaDetalhes")]
        public IActionResult GetAtaDetalhes(Guid id)
        {
            try
            {
                var ata = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(
                    filter: a => a.AtaId == id,
                    includeProperties: "Fornecedor"
                );

                if (ata == null)
                {
                    return Ok(new { success = false, message = "Ata não encontrada" });
                }

                var resumo = new
                {
                    ataId = ata.AtaId,
                    numeroAta = ata.NumeroAta,
                    anoAta = ata.AnoAta,
                    ataCompleta = $"{ata.NumeroAta}/{ata.AnoAta}",
                    objeto = ata.Objeto,
                    fornecedor = ata.Fornecedor?.DescricaoFornecedor ?? "",
                    dataInicio = ata.DataInicio?.ToString("dd/MM/yyyy"),
                    dataFim = ata.DataFim?.ToString("dd/MM/yyyy"),
                    valor = ata.Valor,
                    status = ata.Status
                };

                return Ok(new { success = true, data = resumo });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetAtaDetalhes", error);
                return Ok(new { success = false, message = "Erro ao carregar detalhes da ata" });
            }
        }

        // ============================================================
        // VEÍCULOS DO CONTRATO
        // ============================================================

        [HttpGet]
        [Route("GetVeiculosContrato")]
        public IActionResult GetVeiculosContrato(Guid contratoId)
        {
            try
            {
                // Busca TODAS as repactuações do contrato
                var repactuacoes = _unitOfWork.RepactuacaoContrato.GetAll(
                    filter: r => r.ContratoId == contratoId
                ).Select(r => r.RepactuacaoContratoId).ToList();

                // Busca TODOS os itens de TODAS as repactuações do contrato
                var itensContrato = new Dictionary<Guid, (int? NumItem, string Descricao)>();
                if (repactuacoes.Any())
                {
                    var itens = _unitOfWork.ItemVeiculoContrato.GetAll(
                        filter: i => repactuacoes.Contains(i.RepactuacaoContratoId)
                    ).ToList();
                    
                    foreach (var item in itens)
                    {
                        // Se já existe, mantém o mais recente (último adicionado)
                        itensContrato[item.ItemVeiculoId] = (item.NumItem, item.Descricao);
                    }
                }

                // Busca veículos vinculados ao contrato
                var veiculosContrato = _unitOfWork.VeiculoContrato.GetAll(
                    filter: vc => vc.ContratoId == contratoId
                ).ToList();

                var veiculoIds = veiculosContrato.Select(vc => vc.VeiculoId).ToList();

                // Busca os veículos completos para pegar o ItemVeiculoId (que está na tabela Veiculo)
                var veiculosCompletos = _unitOfWork.Veiculo.GetAll(
                    filter: v => veiculoIds.Contains(v.VeiculoId)
                ).ToDictionary(v => v.VeiculoId);

                // Busca ViewVeiculos para dados de exibição (MarcaModelo, etc)
                var viewVeiculos = _unitOfWork.ViewVeiculos.GetAll(
                    filter: v => veiculoIds.Contains(v.VeiculoId)
                ).ToDictionary(v => v.VeiculoId);

                var veiculos = veiculosContrato
                    .Where(vc => viewVeiculos.ContainsKey(vc.VeiculoId))
                    .Select(vc =>
                    {
                        var viewVeiculo = viewVeiculos[vc.VeiculoId];
                        var veiculoCompleto = veiculosCompletos.ContainsKey(vc.VeiculoId) ? veiculosCompletos[vc.VeiculoId] : null;
                        
                        // ItemVeiculoId está na tabela Veiculo
                        var itemVeiculoId = veiculoCompleto?.ItemVeiculoId;
                        
                        // Verifica se tem item associado
                        var temItem = itemVeiculoId.HasValue && itensContrato.ContainsKey(itemVeiculoId.Value);
                        var numItem = temItem ? itensContrato[itemVeiculoId.Value].NumItem : (int?)null;
                        var descricaoItem = temItem ? $"Item {itensContrato[itemVeiculoId.Value].NumItem} - {itensContrato[itemVeiculoId.Value].Descricao}" : "";

                        return new
                        {
                            veiculoId = vc.VeiculoId,
                            contratoId = contratoId,
                            placa = viewVeiculo.Placa,
                            marcaModelo = viewVeiculo.MarcaModelo,
                            itemVeiculoId = itemVeiculoId,
                            numItem = numItem,
                            descricaoItem = descricaoItem,
                            status = viewVeiculo.Status
                        };
                    })
                    .OrderBy(v => v.placa)
                    .ToList();

                // Conta ativos e inativos
                var qtdAtivos = veiculos.Count(v => v.status == true);
                var qtdInativos = veiculos.Count(v => v.status == false);

                return Ok(new { success = true, data = veiculos, qtdAtivos = qtdAtivos, qtdInativos = qtdInativos });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetVeiculosContrato", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        // DEBUG: Endpoint temporário para verificar ItemVeiculoId
        [HttpGet]
        [Route("DebugItensVeiculos")]
        public IActionResult DebugItensVeiculos(Guid contratoId)
        {
            try
            {
                // Busca todas as repactuações
                var repactuacoes = _unitOfWork.RepactuacaoContrato.GetAll(
                    filter: r => r.ContratoId == contratoId
                ).Select(r => new { r.RepactuacaoContratoId, r.DataRepactuacao, r.Descricao }).ToList();

                // Busca todos os itens de todas as repactuações
                var repactuacaoIds = repactuacoes.Select(r => r.RepactuacaoContratoId).ToList();
                var itensContrato = _unitOfWork.ItemVeiculoContrato.GetAll(
                    filter: i => repactuacaoIds.Contains(i.RepactuacaoContratoId)
                ).Select(i => new { 
                    i.ItemVeiculoId, 
                    i.NumItem, 
                    i.Descricao,
                    i.RepactuacaoContratoId
                }).ToList();

                // Busca veículos do contrato
                var veiculosContrato = _unitOfWork.VeiculoContrato.GetAll(
                    filter: vc => vc.ContratoId == contratoId
                ).Select(vc => vc.VeiculoId).ToList();

                // Busca veículos completos com ItemVeiculoId
                var veiculos = _unitOfWork.Veiculo.GetAll(
                    filter: v => veiculosContrato.Contains(v.VeiculoId)
                ).Select(v => new {
                    v.VeiculoId,
                    v.Placa,
                    v.ItemVeiculoId,
                    ItemVeiculoIdStr = v.ItemVeiculoId.HasValue ? v.ItemVeiculoId.Value.ToString() : "NULL"
                }).ToList();

                return Ok(new { 
                    success = true, 
                    repactuacoes = repactuacoes,
                    itensDisponiveis = itensContrato,
                    veiculosComItemId = veiculos
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "DebugItensVeiculos", error);
                return Ok(new { success = false, message = error.Message });
            }
        }

        [HttpGet]
        [Route("GetVeiculosDisponiveis")]
        public IActionResult GetVeiculosDisponiveis(Guid contratoId)
        {
            try
            {
                var veiculosNoContrato = _unitOfWork.VeiculoContrato.GetAll(
                    filter: vc => vc.ContratoId == contratoId
                ).Select(vc => vc.VeiculoId).ToList();

                var veiculos = _unitOfWork.ViewVeiculos.GetAll(
                    filter: v => v.Status == true && !veiculosNoContrato.Contains(v.VeiculoId)
                )
                .Select(v => new
                {
                    value = v.VeiculoId,
                    text = $"{v.Placa} - {v.MarcaModelo}"
                })
                .OrderBy(v => v.text)
                .ToList();

                return Ok(new { success = true, data = veiculos });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetVeiculosDisponiveis", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpGet]
        [Route("GetItensContrato")]
        public IActionResult GetItensContrato(Guid contratoId)
        {
            try
            {
                var repactuacao = _unitOfWork.RepactuacaoContrato.GetAll(
                    filter: r => r.ContratoId == contratoId
                ).OrderByDescending(r => r.DataRepactuacao).FirstOrDefault();

                if (repactuacao == null)
                {
                    return Ok(new { success = true, data = new List<object>() });
                }

                var itens = _unitOfWork.ItemVeiculoContrato.GetAll(
                    filter: i => i.RepactuacaoContratoId == repactuacao.RepactuacaoContratoId
                )
                .Select(i => new
                {
                    value = i.ItemVeiculoId,
                    text = $"Item {i.NumItem} - {i.Descricao}",
                    numItem = i.NumItem,
                    descricao = i.Descricao,
                    quantidade = i.Quantidade,
                    valorUnitario = i.ValorUnitario
                })
                .OrderBy(i => i.numItem)
                .ToList();

                return Ok(new { success = true, data = itens });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetItensContrato", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpPost]
        [Route("IncluirVeiculoContrato")]
        public IActionResult IncluirVeiculoContrato([FromBody] ICIncluirVeiculoContratoVM model)
        {
            try
            {
                var existe = _unitOfWork.VeiculoContrato.GetFirstOrDefault(
                    vc => vc.VeiculoId == model.VeiculoId && vc.ContratoId == model.ContratoId
                );

                if (existe != null)
                {
                    return Ok(new { success = false, message = "Este veículo já está associado ao contrato!" });
                }

                // Cria vínculo VeiculoContrato
                var veiculoContrato = new VeiculoContrato
                {
                    VeiculoId = model.VeiculoId,
                    ContratoId = model.ContratoId
                };

                _unitOfWork.VeiculoContrato.Add(veiculoContrato);

                // Se informou ItemVeiculoId, atualiza na tabela Veiculo
                if (model.ItemVeiculoId.HasValue)
                {
                    var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.VeiculoId == model.VeiculoId);
                    if (veiculo != null)
                    {
                        veiculo.ItemVeiculoId = model.ItemVeiculoId;
                        _unitOfWork.Veiculo.Update(veiculo);
                    }
                }

                _unitOfWork.Save();

                return Ok(new { success = true, message = "Veículo incluído no contrato com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "IncluirVeiculoContrato", error);
                return Ok(new { success = false, message = "Erro ao incluir veículo no contrato" });
            }
        }

        [HttpPost]
        [Route("RemoverVeiculoContrato")]
        public IActionResult RemoverVeiculoContrato([FromBody] ICRemoverVeiculoContratoVM model)
        {
            try
            {
                var veiculoContrato = _unitOfWork.VeiculoContrato.GetFirstOrDefault(
                    vc => vc.VeiculoId == model.VeiculoId && vc.ContratoId == model.ContratoId
                );

                if (veiculoContrato == null)
                {
                    return Ok(new { success = false, message = "Associação não encontrada!" });
                }

                // Remove a associação VeiculoContrato
                _unitOfWork.VeiculoContrato.Remove(veiculoContrato);

                // Limpa os campos do veículo
                var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.VeiculoId == model.VeiculoId);
                if (veiculo != null)
                {
                    veiculo.ItemVeiculoId = null;
                    veiculo.ContratoId = null;
                    _unitOfWork.Veiculo.Update(veiculo);
                }

                _unitOfWork.Save();

                return Ok(new { success = true, message = "Veículo removido do contrato com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "RemoverVeiculoContrato", error);
                return Ok(new { success = false, message = "Erro ao remover veículo do contrato" });
            }
        }

        // ============================================================
        // ENCARREGADOS DO CONTRATO
        // ============================================================

        [HttpGet]
        [Route("GetEncarregadosContrato")]
        public IActionResult GetEncarregadosContrato(Guid contratoId)
        {
            try
            {
                var encarregadosContrato = _unitOfWork.EncarregadoContrato.GetAll(
                    filter: ec => ec.ContratoId == contratoId
                ).ToList();

                var encarregadoIds = encarregadosContrato.Select(ec => ec.EncarregadoId).ToList();

                var encarregados = _unitOfWork.Encarregado.GetAll(
                    filter: e => encarregadoIds.Contains(e.EncarregadoId)
                )
                .Select(e => new
                {
                    encarregadoId = e.EncarregadoId,
                    contratoId = contratoId,
                    nome = e.Nome,
                    ponto = e.Ponto,
                    celular01 = e.Celular01,
                    status = e.Status
                })
                .OrderBy(e => e.nome)
                .ToList();

                return Ok(new { success = true, data = encarregados });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetEncarregadosContrato", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpGet]
        [Route("GetEncarregadosDisponiveis")]
        public IActionResult GetEncarregadosDisponiveis(Guid contratoId)
        {
            try
            {
                var noContrato = _unitOfWork.EncarregadoContrato.GetAll(
                    filter: ec => ec.ContratoId == contratoId
                ).Select(ec => ec.EncarregadoId).ToList();

                var encarregados = _unitOfWork.Encarregado.GetAll(
                    filter: e => e.Status == true && !noContrato.Contains(e.EncarregadoId)
                )
                .Select(e => new
                {
                    value = e.EncarregadoId,
                    text = $"{e.Nome} ({e.Ponto})"
                })
                .OrderBy(e => e.text)
                .ToList();

                return Ok(new { success = true, data = encarregados });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetEncarregadosDisponiveis", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpPost]
        [Route("IncluirEncarregadoContrato")]
        public IActionResult IncluirEncarregadoContrato([FromBody] ICIncluirEncarregadoContratoVM model)
        {
            try
            {
                var existe = _unitOfWork.EncarregadoContrato.GetFirstOrDefault(
                    ec => ec.EncarregadoId == model.EncarregadoId && ec.ContratoId == model.ContratoId
                );

                if (existe != null)
                {
                    return Ok(new { success = false, message = "Este encarregado já está associado ao contrato!" });
                }

                var encarregadoContrato = new EncarregadoContrato
                {
                    EncarregadoId = model.EncarregadoId,
                    ContratoId = model.ContratoId
                };

                _unitOfWork.EncarregadoContrato.Add(encarregadoContrato);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Encarregado incluído no contrato com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "IncluirEncarregadoContrato", error);
                return Ok(new { success = false, message = "Erro ao incluir encarregado no contrato" });
            }
        }

        [HttpPost]
        [Route("RemoverEncarregadoContrato")]
        public IActionResult RemoverEncarregadoContrato([FromBody] ICRemoverEncarregadoContratoVM model)
        {
            try
            {
                var encarregadoContrato = _unitOfWork.EncarregadoContrato.GetFirstOrDefault(
                    ec => ec.EncarregadoId == model.EncarregadoId && ec.ContratoId == model.ContratoId
                );

                if (encarregadoContrato == null)
                {
                    return Ok(new { success = false, message = "Associação não encontrada!" });
                }

                _unitOfWork.EncarregadoContrato.Remove(encarregadoContrato);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Encarregado removido do contrato com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "RemoverEncarregadoContrato", error);
                return Ok(new { success = false, message = "Erro ao remover encarregado do contrato" });
            }
        }

        // ============================================================
        // OPERADORES DO CONTRATO
        // ============================================================

        [HttpGet]
        [Route("GetOperadoresContrato")]
        public IActionResult GetOperadoresContrato(Guid contratoId)
        {
            try
            {
                var operadoresContrato = _unitOfWork.OperadorContrato.GetAll(
                    filter: oc => oc.ContratoId == contratoId
                ).ToList();

                var operadorIds = operadoresContrato.Select(oc => oc.OperadorId).ToList();

                var operadores = _unitOfWork.Operador.GetAll(
                    filter: o => operadorIds.Contains(o.OperadorId)
                )
                .Select(o => new
                {
                    operadorId = o.OperadorId,
                    contratoId = contratoId,
                    nome = o.Nome,
                    ponto = o.Ponto,
                    celular01 = o.Celular01,
                    status = o.Status
                })
                .OrderBy(o => o.nome)
                .ToList();

                return Ok(new { success = true, data = operadores });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetOperadoresContrato", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpGet]
        [Route("GetOperadoresDisponiveis")]
        public IActionResult GetOperadoresDisponiveis(Guid contratoId)
        {
            try
            {
                var noContrato = _unitOfWork.OperadorContrato.GetAll(
                    filter: oc => oc.ContratoId == contratoId
                ).Select(oc => oc.OperadorId).ToList();

                var operadores = _unitOfWork.Operador.GetAll(
                    filter: o => o.Status == true && !noContrato.Contains(o.OperadorId)
                )
                .Select(o => new
                {
                    value = o.OperadorId,
                    text = $"{o.Nome} ({o.Ponto})"
                })
                .OrderBy(o => o.text)
                .ToList();

                return Ok(new { success = true, data = operadores });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetOperadoresDisponiveis", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpPost]
        [Route("IncluirOperadorContrato")]
        public IActionResult IncluirOperadorContrato([FromBody] ICIncluirOperadorContratoVM model)
        {
            try
            {
                var existe = _unitOfWork.OperadorContrato.GetFirstOrDefault(
                    oc => oc.OperadorId == model.OperadorId && oc.ContratoId == model.ContratoId
                );

                if (existe != null)
                {
                    return Ok(new { success = false, message = "Este operador já está associado ao contrato!" });
                }

                var operadorContrato = new OperadorContrato
                {
                    OperadorId = model.OperadorId,
                    ContratoId = model.ContratoId
                };

                _unitOfWork.OperadorContrato.Add(operadorContrato);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Operador incluído no contrato com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "IncluirOperadorContrato", error);
                return Ok(new { success = false, message = "Erro ao incluir operador no contrato" });
            }
        }

        [HttpPost]
        [Route("RemoverOperadorContrato")]
        public IActionResult RemoverOperadorContrato([FromBody] ICRemoverOperadorContratoVM model)
        {
            try
            {
                var operadorContrato = _unitOfWork.OperadorContrato.GetFirstOrDefault(
                    oc => oc.OperadorId == model.OperadorId && oc.ContratoId == model.ContratoId
                );

                if (operadorContrato == null)
                {
                    return Ok(new { success = false, message = "Associação não encontrada!" });
                }

                _unitOfWork.OperadorContrato.Remove(operadorContrato);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Operador removido do contrato com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "RemoverOperadorContrato", error);
                return Ok(new { success = false, message = "Erro ao remover operador do contrato" });
            }
        }

        // ============================================================
        // MOTORISTAS DO CONTRATO
        // ============================================================

        [HttpGet]
        [Route("GetMotoristasContrato")]
        public IActionResult GetMotoristasContrato(Guid contratoId)
        {
            try
            {
                var motoristasContrato = _unitOfWork.MotoristaContrato.GetAll(
                    filter: mc => mc.ContratoId == contratoId
                ).ToList();

                var motoristaIds = motoristasContrato.Select(mc => mc.MotoristaId).ToList();

                var motoristas = _unitOfWork.ViewMotoristas.GetAll(
                    filter: m => motoristaIds.Contains(m.MotoristaId)
                )
                .Select(m => new
                {
                    motoristaId = m.MotoristaId,
                    contratoId = contratoId,
                    nome = m.Nome,
                    ponto = m.Ponto,
                    cnh = m.CNH,
                    categoriaCNH = m.CategoriaCNH,
                    celular01 = m.Celular01,
                    sigla = m.Sigla,
                    status = m.Status
                })
                .OrderBy(m => m.nome)
                .ToList();

                return Ok(new { success = true, data = motoristas });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetMotoristasContrato", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpGet]
        [Route("GetMotoristasDisponiveis")]
        public IActionResult GetMotoristasDisponiveis(Guid contratoId)
        {
            try
            {
                var noContrato = _unitOfWork.MotoristaContrato.GetAll(
                    filter: mc => mc.ContratoId == contratoId
                ).Select(mc => mc.MotoristaId).ToList();

                var motoristas = _unitOfWork.ViewMotoristas.GetAll(
                    filter: m => m.Status == true && !noContrato.Contains(m.MotoristaId)
                )
                .Select(m => new
                {
                    value = m.MotoristaId,
                    text = $"{m.Nome} ({m.Ponto})"
                })
                .OrderBy(m => m.text)
                .ToList();

                return Ok(new { success = true, data = motoristas });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetMotoristasDisponiveis", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpPost]
        [Route("IncluirMotoristaContrato")]
        public IActionResult IncluirMotoristaContrato([FromBody] ICIncluirMotoristaContratoVM model)
        {
            try
            {
                var existe = _unitOfWork.MotoristaContrato.GetFirstOrDefault(
                    mc => mc.MotoristaId == model.MotoristaId && mc.ContratoId == model.ContratoId
                );

                if (existe != null)
                {
                    return Ok(new { success = false, message = "Este motorista já está associado ao contrato!" });
                }

                var motoristaContrato = new MotoristaContrato
                {
                    MotoristaId = model.MotoristaId,
                    ContratoId = model.ContratoId
                };

                _unitOfWork.MotoristaContrato.Add(motoristaContrato);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Motorista incluído no contrato com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "IncluirMotoristaContrato", error);
                return Ok(new { success = false, message = "Erro ao incluir motorista no contrato" });
            }
        }

        [HttpPost]
        [Route("RemoverMotoristaContrato")]
        public IActionResult RemoverMotoristaContrato([FromBody] ICRemoverMotoristaContratoVM model)
        {
            try
            {
                var motoristaContrato = _unitOfWork.MotoristaContrato.GetFirstOrDefault(
                    mc => mc.MotoristaId == model.MotoristaId && mc.ContratoId == model.ContratoId
                );

                if (motoristaContrato == null)
                {
                    return Ok(new { success = false, message = "Associação não encontrada!" });
                }

                _unitOfWork.MotoristaContrato.Remove(motoristaContrato);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Motorista removido do contrato com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "RemoverMotoristaContrato", error);
                return Ok(new { success = false, message = "Erro ao remover motorista do contrato" });
            }
        }

        // ============================================================
        // LAVADORES DO CONTRATO
        // ============================================================

        [HttpGet]
        [Route("GetLavadoresContrato")]
        public IActionResult GetLavadoresContrato(Guid contratoId)
        {
            try
            {
                var lavadoresContrato = _unitOfWork.LavadorContrato.GetAll(
                    filter: lc => lc.ContratoId == contratoId
                ).ToList();

                var lavadorIds = lavadoresContrato.Select(lc => lc.LavadorId).ToList();

                var lavadores = _unitOfWork.Lavador.GetAll(
                    filter: l => lavadorIds.Contains(l.LavadorId)
                )
                .Select(l => new
                {
                    lavadorId = l.LavadorId,
                    contratoId = contratoId,
                    nome = l.Nome,
                    ponto = l.Ponto,
                    celular01 = l.Celular01,
                    status = l.Status
                })
                .OrderBy(l => l.nome)
                .ToList();

                return Ok(new { success = true, data = lavadores });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetLavadoresContrato", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpGet]
        [Route("GetLavadoresDisponiveis")]
        public IActionResult GetLavadoresDisponiveis(Guid contratoId)
        {
            try
            {
                var noContrato = _unitOfWork.LavadorContrato.GetAll(
                    filter: lc => lc.ContratoId == contratoId
                ).Select(lc => lc.LavadorId).ToList();

                var lavadores = _unitOfWork.Lavador.GetAll(
                    filter: l => l.Status == true && !noContrato.Contains(l.LavadorId)
                )
                .Select(l => new
                {
                    value = l.LavadorId,
                    text = $"{l.Nome} ({l.Ponto})"
                })
                .OrderBy(l => l.text)
                .ToList();

                return Ok(new { success = true, data = lavadores });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetLavadoresDisponiveis", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpPost]
        [Route("IncluirLavadorContrato")]
        public IActionResult IncluirLavadorContrato([FromBody] ICIncluirLavadorContratoVM model)
        {
            try
            {
                var existe = _unitOfWork.LavadorContrato.GetFirstOrDefault(
                    lc => lc.LavadorId == model.LavadorId && lc.ContratoId == model.ContratoId
                );

                if (existe != null)
                {
                    return Ok(new { success = false, message = "Este lavador já está associado ao contrato!" });
                }

                var lavadorContrato = new LavadorContrato
                {
                    LavadorId = model.LavadorId,
                    ContratoId = model.ContratoId
                };

                _unitOfWork.LavadorContrato.Add(lavadorContrato);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Lavador incluído no contrato com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "IncluirLavadorContrato", error);
                return Ok(new { success = false, message = "Erro ao incluir lavador no contrato" });
            }
        }

        [HttpPost]
        [Route("RemoverLavadorContrato")]
        public IActionResult RemoverLavadorContrato([FromBody] ICRemoverLavadorContratoVM model)
        {
            try
            {
                var lavadorContrato = _unitOfWork.LavadorContrato.GetFirstOrDefault(
                    lc => lc.LavadorId == model.LavadorId && lc.ContratoId == model.ContratoId
                );

                if (lavadorContrato == null)
                {
                    return Ok(new { success = false, message = "Associação não encontrada!" });
                }

                _unitOfWork.LavadorContrato.Remove(lavadorContrato);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Lavador removido do contrato com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "RemoverLavadorContrato", error);
                return Ok(new { success = false, message = "Erro ao remover lavador do contrato" });
            }
        }

        // ============================================================
        // VEÍCULOS DA ATA
        // ============================================================

        [HttpGet]
        [Route("GetVeiculosAta")]
        public IActionResult GetVeiculosAta(Guid ataId)
        {
            try
            {
                var veiculosAta = _unitOfWork.VeiculoAta.GetAll(
                    filter: va => va.AtaId == ataId
                ).ToList();

                var veiculoIds = veiculosAta.Select(va => va.VeiculoId).ToList();

                var veiculos = _unitOfWork.ViewVeiculos.GetAll(
                    filter: v => veiculoIds.Contains(v.VeiculoId)
                )
                .Select(v => new
                {
                    veiculoId = v.VeiculoId,
                    ataId = ataId,
                    placa = v.Placa,
                    marcaModelo = v.MarcaModelo,
                    descricaoItem = "",
                    status = v.Status
                })
                .OrderBy(v => v.placa)
                .ToList();

                var qtdAtivos = veiculos.Count(v => v.status == true);
                var qtdInativos = veiculos.Count(v => v.status == false);

                return Ok(new { success = true, data = veiculos, qtdAtivos = qtdAtivos, qtdInativos = qtdInativos });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetVeiculosAta", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpGet]
        [Route("GetVeiculosDisponiveisAta")]
        public IActionResult GetVeiculosDisponiveisAta(Guid ataId)
        {
            try
            {
                var veiculosNaAta = _unitOfWork.VeiculoAta.GetAll(
                    filter: va => va.AtaId == ataId
                ).Select(va => va.VeiculoId).ToList();

                var veiculos = _unitOfWork.ViewVeiculos.GetAll(
                    filter: v => v.Status == true && !veiculosNaAta.Contains(v.VeiculoId)
                )
                .Select(v => new
                {
                    value = v.VeiculoId,
                    text = $"{v.Placa} - {v.MarcaModelo}"
                })
                .OrderBy(v => v.text)
                .ToList();

                return Ok(new { success = true, data = veiculos });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "GetVeiculosDisponiveisAta", error);
                return Ok(new { success = false, data = new List<object>() });
            }
        }

        [HttpPost]
        [Route("IncluirVeiculoAta")]
        public IActionResult IncluirVeiculoAta([FromBody] ICIncluirVeiculoAtaVM model)
        {
            try
            {
                var existe = _unitOfWork.VeiculoAta.GetFirstOrDefault(
                    va => va.VeiculoId == model.VeiculoId && va.AtaId == model.AtaId
                );

                if (existe != null)
                {
                    return Ok(new { success = false, message = "Este veículo já está associado à ata!" });
                }

                var veiculoAta = new VeiculoAta
                {
                    VeiculoId = model.VeiculoId,
                    AtaId = model.AtaId
                };

                _unitOfWork.VeiculoAta.Add(veiculoAta);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Veículo incluído na ata com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "IncluirVeiculoAta", error);
                return Ok(new { success = false, message = "Erro ao incluir veículo na ata" });
            }
        }

        [HttpPost]
        [Route("RemoverVeiculoAta")]
        public IActionResult RemoverVeiculoAta([FromBody] ICRemoverVeiculoAtaVM model)
        {
            try
            {
                var veiculoAta = _unitOfWork.VeiculoAta.GetFirstOrDefault(
                    va => va.VeiculoId == model.VeiculoId && va.AtaId == model.AtaId
                );

                if (veiculoAta == null)
                {
                    return Ok(new { success = false, message = "Associação não encontrada!" });
                }

                // Remove a associação VeiculoAta
                _unitOfWork.VeiculoAta.Remove(veiculoAta);

                // Limpa os campos do veículo
                var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.VeiculoId == model.VeiculoId);
                if (veiculo != null)
                {
                    veiculo.ItemVeiculoId = null;
                    veiculo.AtaId = null;
                    _unitOfWork.Veiculo.Update(veiculo);
                }

                _unitOfWork.Save();

                return Ok(new { success = true, message = "Veículo removido da ata com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContratoController.cs", "RemoverVeiculoAta", error);
                return Ok(new { success = false, message = "Erro ao remover veículo da ata" });
            }
        }
    }
}
