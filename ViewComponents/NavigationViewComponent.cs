using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace FrotiX.ViewComponents
{
    public class NavigationViewComponent : ViewComponent
    {
        private readonly INavigationModel _navigationModel;
        private readonly IUnitOfWork _unitOfWork;

        public NavigationViewComponent(INavigationModel navigationModel, IUnitOfWork unitOfWork)
        {
            _navigationModel = navigationModel;
            _unitOfWork = unitOfWork;
        }

        public IViewComponentResult Invoke()
        {
            try
            {
                // Tenta ler do banco de dados primeiro
                var arvoreDb = GetTreeFromDatabase();

                if (arvoreDb != null && arvoreDb.Any())
                {
                    Console.WriteLine($"NavigationViewComponent: Usando TreeView com {arvoreDb.Count} itens raiz do banco de dados");
                    // Usa Syncfusion TreeView com dados do BD
                    return View("TreeView", arvoreDb);
                }
                else
                {
                    Console.WriteLine("NavigationViewComponent: Nenhum dado retornado do banco, usando fallback JSON");
                }
            }
            catch (Exception ex)
            {
                // Log do erro, mas continua com fallback
                Console.WriteLine($"NavigationViewComponent: Erro ao ler navegação do BD: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"NavigationViewComponent: Inner: {ex.InnerException.Message}");
                }
            }

            // Fallback: usa nav.json
            Console.WriteLine("NavigationViewComponent: Usando navegação do JSON");
            var items = _navigationModel.Full;
            return View(items);
        }

        /// <summary>
        /// Lê a árvore de navegação do banco de dados
        /// </summary>
        private List<RecursoTreeDTO> GetTreeFromDatabase()
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            Console.WriteLine($"NavigationViewComponent: UserId = {userId ?? "NULL"}");

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("NavigationViewComponent: UserId não encontrado, usando JSON");
                return null;
            }

            // Busca todos os recursos
            var todoRecursos = _unitOfWork.Recurso.GetAll().ToList();
            Console.WriteLine($"NavigationViewComponent: Total de recursos no banco: {todoRecursos.Count}");

            // Verifica se a migração hierárquica foi feita (recursos de nível 0 com filhos)
            var temHierarquia = todoRecursos.Any(r => r.Nivel == 0) && todoRecursos.Any(r => r.ParentId != null);

            if (!temHierarquia && todoRecursos.Count == 0)
            {
                Console.WriteLine("NavigationViewComponent: Sem recursos no banco, usando JSON");
                return null;
            }

            // Busca recursos ativos ordenados
            var recursosAtivos = todoRecursos
                .Where(r => r.Ativo)
                .OrderBy(r => r.Ordem)
                .ToList();

            Console.WriteLine($"NavigationViewComponent: Recursos ativos: {recursosAtivos.Count}");

            // Busca controle de acesso do usuário
            var controlesAcesso = _unitOfWork.ControleAcesso
                .GetAll(ca => ca.UsuarioId == userId && ca.Acesso == true)
                .Select(ca => ca.RecursoId)
                .ToHashSet();

            Console.WriteLine($"NavigationViewComponent: Controles de acesso do usuário: {controlesAcesso.Count}");

            // Se usuário não tem nenhum acesso configurado, dá acesso a tudo (admin temporário)
            HashSet<Guid> idsComAcessoDireto;
            if (controlesAcesso.Count == 0)
            {
                Console.WriteLine("NavigationViewComponent: Usuário sem acessos configurados - concedendo acesso total temporário");
                idsComAcessoDireto = recursosAtivos.Select(r => r.RecursoId).ToHashSet();
            }
            else
            {
                idsComAcessoDireto = recursosAtivos
                    .Where(r => controlesAcesso.Contains(r.RecursoId))
                    .Select(r => r.RecursoId)
                    .ToHashSet();
            }

            // Inclui pais de recursos com acesso (para manter hierarquia)
            var idsComAcessoEPais = new HashSet<Guid>(idsComAcessoDireto);
            foreach (var recurso in recursosAtivos)
            {
                if (idsComAcessoDireto.Contains(recurso.RecursoId) && recurso.ParentId.HasValue)
                {
                    // Adiciona todos os ancestrais
                    var parentId = recurso.ParentId;
                    while (parentId.HasValue)
                    {
                        idsComAcessoEPais.Add(parentId.Value);
                        var parent = recursosAtivos.FirstOrDefault(r => r.RecursoId == parentId);
                        parentId = parent?.ParentId;
                    }
                }
            }

            // Filtra recursos com acesso ou que são pais necessários
            var recursosComAcesso = recursosAtivos
                .Where(r => idsComAcessoEPais.Contains(r.RecursoId))
                .ToList();

            Console.WriteLine($"NavigationViewComponent: {recursosComAcesso.Count} recursos finais para exibir");

            if (recursosComAcesso.Count == 0)
            {
                Console.WriteLine("NavigationViewComponent: Nenhum recurso para exibir, usando JSON");
                return null;
            }

            // Monta árvore hierárquica
            return MontarArvoreRecursiva(recursosComAcesso, null);
        }

        /// <summary>
        /// Monta a árvore hierárquica de recursos
        /// </summary>
        private List<RecursoTreeDTO> MontarArvoreRecursiva(List<Recurso> recursos, Guid? parentId)
        {
            return recursos
                .Where(r => r.ParentId == parentId)
                .OrderBy(r => r.Ordem)
                .Select(r =>
                {
                    var filhos = MontarArvoreRecursiva(recursos, r.RecursoId);
                    return new RecursoTreeDTO
                    {
                        Id = r.RecursoId.ToString(),
                        Text = r.Nome,
                        NomeMenu = r.NomeMenu,
                        Icon = r.Icon,
                        IconCss = r.Icon,
                        Href = r.Href,
                        ParentId = r.ParentId?.ToString(),
                        Ordem = r.Ordem,
                        Nivel = r.Nivel,
                        Ativo = r.Ativo,
                        HasChild = filhos.Any(),
                        Expanded = true,
                        Items = filhos
                    };
                })
                .ToList();
        }
    }
}


