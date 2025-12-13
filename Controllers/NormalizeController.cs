using FrotiX.TextNormalization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NormalizeController :ControllerBase
    {
        private readonly NormalizationService _normalizer;

        public NormalizeController(NormalizationService normalizer)
        {
            try
            {
                _normalizer = normalizer;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NormalizeController.cs" , "NormalizeController" , error);
            }
        }

        public record NormalizeRequest(string Text);

        [HttpPost]
        public async Task<ActionResult<string>> Post([FromBody] NormalizeRequest body)
        {
            try
            {
                if (body is null || string.IsNullOrWhiteSpace(body.Text))
                    return BadRequest("Text is required.");

                var result = await _normalizer.NormalizeAsync(body.Text);
                return Ok(result);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NormalizeController.cs" , "Post" , error);
                return StatusCode(500 , "Erro ao normalizar texto");
            }
        }
    }
}
