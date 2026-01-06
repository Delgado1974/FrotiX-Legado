using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace FrotiX.Filters
{
    /// <summary>
    /// Desabilita a validação automática do ModelState para endpoints específicos.
    /// Útil quando [ApiController] está presente mas queremos validar manualmente.
    /// IMPORTANTE: Este filtro deve executar ANTES da validação do [ApiController].
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
    public class DisableModelValidationAttribute : Attribute, IResourceFilter
    {
        /// <summary>
        /// Executa ANTES da validação automática do [ApiController]
        /// </summary>
        public void OnResourceExecuting(ResourceExecutingContext context)
        {
            // Desabilita completamente o ModelState para este request
            context.ModelState.Clear();

            // Remove todas as validações pendentes
            foreach (var key in context.ModelState.Keys.ToList())
            {
                context.ModelState.Remove(key);
            }
        }

        /// <summary>
        /// Executa DEPOIS da action
        /// </summary>
        public void OnResourceExecuted(ResourceExecutedContext context)
        {
            // Nada a fazer aqui
        }
    }
}
