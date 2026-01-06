using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FrotiX.Filters
{
    /// <summary>
    /// Desabilita a validação automática do ModelState para endpoints específicos.
    /// Útil quando [ApiController] está presente mas queremos validar manualmente.
    /// </summary>
    public class DisableModelValidationAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            // Limpa o ModelState antes da validação automática
            context.ModelState.Clear();
            base.OnActionExecuting(context);
        }
    }
}
