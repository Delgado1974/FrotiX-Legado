using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ViagemLimpezaController :ControllerBase
    {
        private readonly IViagemRepository _viagemRepo;

        public ViagemLimpezaController(IViagemRepository viagemRepo)
        {
            try
            {
                _viagemRepo = viagemRepo;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ViagemLimpezaController.cs" ,
                    "ViagemLimpezaController" ,
                    error
                );
            }
        }

        [HttpGet("origens")]
        public async Task<ActionResult<List<string>>> GetOrigens()
        {
            try
            {
                var origens = await _viagemRepo.GetDistinctOrigensAsync();
                return Ok(origens);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemLimpezaController.cs" , "GetOrigens" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    message = "Erro ao carregar origens"
                });
            }
        }

        [HttpGet("destinos")]
        public async Task<ActionResult<List<string>>> GetDestinos()
        {
            try
            {
                var destinos = await _viagemRepo.GetDistinctDestinosAsync();
                return Ok(destinos);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemLimpezaController.cs" , "GetDestinos" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    message = "Erro ao carregar destinos"
                });
            }
        }

        [HttpPost("corrigir-origem")]
        public async Task<IActionResult> CorrigirOrigem([FromBody] CorrecaoRequest request)
        {
            try
            {
                await _viagemRepo.CorrigirOrigemAsync(request.Anteriores , request.NovoValor);
                return NoContent();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ViagemLimpezaController.cs" ,
                    "CorrigirOrigem" ,
                    error
                );
                return StatusCode(500 , new
                {
                    success = false ,
                    message = "Erro ao corrigir origem"
                });
            }
        }

        [HttpPost("corrigir-destino")]
        public async Task<IActionResult> CorrigirDestino([FromBody] CorrecaoRequest request)
        {
            try
            {
                await _viagemRepo.CorrigirDestinoAsync(request.Anteriores , request.NovoValor);
                return NoContent();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ViagemLimpezaController.cs" ,
                    "CorrigirDestino" ,
                    error
                );
                return StatusCode(500 , new
                {
                    success = false ,
                    message = "Erro ao corrigir destino"
                });
            }
        }
    }

    public class CorrecaoRequest
    {
        public List<string> Anteriores
        {
            get; set;
        }
        public string NovoValor
        {
            get; set;
        }
    }
}
