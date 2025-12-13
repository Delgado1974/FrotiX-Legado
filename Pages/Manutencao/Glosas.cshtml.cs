using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ContratoEntity = FrotiX.Models.Contrato; // ajuste se necessário

namespace FrotiX.Pages.Manutencao
    {
    public class GlosasModel : PageModel
        {
        private readonly FrotiXDbContext _db;
        private readonly INotyfService _notyf;

        public GlosasModel(FrotiXDbContext db, INotyfService notyf)
            {
            _db = db;
            _notyf = notyf;
            }

        public List<SelectListItem> ContratoList { get; set; } = new();
        public List<int> Anos { get; set; } = new();
        public List<object> Meses { get; set; } = new();
        public int MesSelecionado { get; set; }
        public int AnoSelecionado { get; set; }

        public async Task<IActionResult> OnGetAsync(string? tipoContrato = null)
            {
            await SetViewModelAsync(tipoContrato);
            return Page();
            }

        private async Task SetViewModelAsync(string? tipoContrato)
            {
            ContratoList = await BuildContratoSelectListAsync(tipoContrato);

            var now = DateTime.Now;
            AnoSelecionado = now.Year;
            MesSelecionado = now.Month;

            for (int y = now.Year - 3; y <= now.Year + 1; y++)
                Anos.Add(y);

            Meses = System
                .Globalization.CultureInfo.GetCultureInfo("pt-BR")
                .DateTimeFormat.MonthNames.Where(m => !string.IsNullOrWhiteSpace(m))
                .Select(
                    (nome, idx) => new { Text = char.ToUpper(nome[0]) + nome[1..], Value = idx + 1 }
                )
                .Cast<object>()
                .ToList();
            }

        private async Task<List<SelectListItem>> BuildContratoSelectListAsync(string? tipoContrato)
            {
            var temTipo = !string.IsNullOrWhiteSpace(tipoContrato);

            // >>> FILTRA APENAS CONTRATOS ATIVOS (Status = true) <<<
            var query = _db.Set<ContratoEntity>()
                .AsNoTracking()
                .Where(c => c.Status == true && c.TipoContrato == "Locação");

            if (temTipo)
                query = query.Where(c => c.TipoContrato == tipoContrato);

            return await query
                .Include(c => c.Fornecedor) // left join
                .OrderByDescending(c => c.AnoContrato)
                .ThenByDescending(c => c.NumeroContrato)
                .Select(c => new SelectListItem
                    {
                    Value = c.ContratoId.ToString(),
                    Text = temTipo
                        ? (
                            $"{c.AnoContrato}/{c.NumeroContrato} - "
                            + (c.Fornecedor != null ? c.Fornecedor.DescricaoFornecedor : "")
                        )
                        : (
                            $"{c.AnoContrato}/{c.NumeroContrato} - "
                            + (c.Fornecedor != null ? c.Fornecedor.DescricaoFornecedor : "")
                            + $" ({c.TipoContrato})"
                        ),
                    })
                .ToListAsync();
            }
        }
    }


