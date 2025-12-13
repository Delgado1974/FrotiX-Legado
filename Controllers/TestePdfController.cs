using Microsoft.AspNetCore.Mvc;

namespace FrotiX.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestePdfController : Controller
    {
        [HttpGet("Ping")]
        public IActionResult Ping()
        {
            return Ok(new { success = true , message = "TestePdf funcionando!" });
        }
    }
}
