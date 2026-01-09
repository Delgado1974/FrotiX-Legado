using FrotiX.Filters;
using FrotiX.Models;
using FrotiX.Models.FontAwesome;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NavigationController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _env;
        private readonly IMemoryCache _cache;

        // Caminhos absolutos para garantir persistência correta
        private string NavJsonPath => Path.Combine(_env.ContentRootPath, "nav.json");
        private string NavJsonBackupPath => Path.Combine(_env.ContentRootPath, "nav.json.bak");
        private string FontAwesomeIconsJsonPath => Path.Combine(_env.ContentRootPath, "fontawesome-icons.json");

        // Configurações de cache para ícones FontAwesome
        private const string CacheKeyFontAwesomeIcons = "FontAwesomeIcons";
        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);

        public NavigationController(IUnitOfWork unitOfWork, IWebHostEnvironment env, IMemoryCache cache)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _env = env;
                _cache = cache;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "NavigationController", error);
            }
        }

        /// <summary>
        /// Retorna a estrutura completa do nav.json para a TreeView
        /// </summary>
        [HttpGet]
        [Route("GetTree")]
        public IActionResult GetTree()
        {
            try
            {
                var jsonText = System.IO.File.ReadAllText(NavJsonPath);
                var navigation = NavigationBuilder.FromJson(jsonText);

                var treeData = TransformToTreeData(navigation.Lists, null);

                return Json(new
                {
                    success = true,
                    data = treeData
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "GetTree", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar navegação: " + error.Message
                });
            }
        }

        /// <summary>
        /// Salva a estrutura completa e sincroniza com o BD
        /// </summary>
        [HttpPost]
        [Route("SaveTree")]
        public IActionResult SaveTree([FromBody] List<NavigationTreeItem> items)
        {
            try
            {
                // 1. Faz backup do arquivo atual
                if (System.IO.File.Exists(NavJsonPath))
                {
                    System.IO.File.Copy(NavJsonPath, NavJsonBackupPath, true);
                }

                // 2. Reconstrói a estrutura do nav.json
                var navigation = new
                {
                    version = "0.9",
                    lists = TransformFromTreeData(items)
                };

                // 3. Salva o arquivo nav.json
                var options = new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                };
                var jsonText = JsonSerializer.Serialize(navigation, options);
                System.IO.File.WriteAllText(NavJsonPath, jsonText);

                // 4. Sincroniza com a tabela Recurso
                SincronizarRecursos(items);

                return Json(new
                {
                    success = true,
                    message = "Navegação salva com sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "SaveTree", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao salvar navegação: " + error.Message
                });
            }
        }

        /// <summary>
        /// Adiciona novo item e cria Recurso correspondente no BD
        /// </summary>
        [HttpPost]
        [Route("AddItem")]
        public IActionResult AddItem([FromBody] NavigationItemDTO item)
        {
            try
            {
                // Verifica se já existe recurso com esse NomeMenu
                var recursoExistente = _unitOfWork.Recurso.GetFirstOrDefault(r =>
                    r.NomeMenu == item.NomeMenu);

                if (recursoExistente != null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Já existe um recurso com este Nome de Menu!"
                    });
                }

                // Cria novo Recurso no BD (com valores padrão para campos obrigatórios)
                var recurso = new Recurso
                {
                    RecursoId = Guid.NewGuid(),
                    Nome = !string.IsNullOrEmpty(item.Title) ? item.Title : "Novo Item",
                    NomeMenu = !string.IsNullOrEmpty(item.NomeMenu) ? item.NomeMenu : $"menu_{Guid.NewGuid():N}",
                    Descricao = $"Menu: {item.NomeMenu}",
                    Ordem = GetNextOrdem(),
                    Icon = !string.IsNullOrEmpty(item.Icon) ? item.Icon : "fa-regular fa-folder",
                    Href = !string.IsNullOrEmpty(item.Href) ? item.Href : "javascript:void(0);",
                    Ativo = true,
                    Nivel = 0,
                    HasChild = false // Novos itens não têm filhos inicialmente
                };
                _unitOfWork.Recurso.Add(recurso);
                
                // ✅ Salva o Recurso PRIMEIRO para garantir que existe no banco antes de criar ControleAcesso
                _unitOfWork.Save();

                // ✅ DEPOIS cria os registros de ControleAcesso (agora o RecursoId existe no banco)
                CriarControleAcessoParaTodosUsuarios(recurso.RecursoId);
                _unitOfWork.Save(); // Salva os ControleAcesso criados

                return Json(new
                {
                    success = true,
                    recursoId = recurso.RecursoId,
                    message = "Item adicionado com sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "AddItem", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao adicionar item: " + error.Message
                });
            }
        }

        /// <summary>
        /// Atualiza item existente e sincroniza NomeMenu no BD
        /// </summary>
        [HttpPost]
        [Route("UpdateItem")]
        public IActionResult UpdateItem([FromBody] NavigationItemDTO item)
        {
            try
            {
                // Busca o Recurso pelo NomeMenu antigo
                var recurso = _unitOfWork.Recurso.GetFirstOrDefault(r =>
                    r.NomeMenu == item.OldNomeMenu);

                if (recurso != null)
                {
                    recurso.Nome = item.Title;
                    recurso.NomeMenu = item.NomeMenu;
                    _unitOfWork.Recurso.Update(recurso);
                    _unitOfWork.Save();
                }

                return Json(new
                {
                    success = true,
                    message = "Item atualizado com sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "UpdateItem", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao atualizar item: " + error.Message
                });
            }
        }

        /// <summary>
        /// Remove item e seus registros relacionados no BD
        /// </summary>
        [HttpPost]
        [Route("DeleteItem")]
        public IActionResult DeleteItem([FromBody] DeleteNavigationItemRequest request)
        {
            try
            {
                var recurso = _unitOfWork.Recurso.GetFirstOrDefault(r =>
                    r.NomeMenu == request.NomeMenu);

                if (recurso != null)
                {
                    // Remove todos ControleAcesso deste recurso
                    var controlesAcesso = _unitOfWork.ControleAcesso.GetAll(ca =>
                        ca.RecursoId == recurso.RecursoId);

                    foreach (var ca in controlesAcesso)
                    {
                        _unitOfWork.ControleAcesso.Remove(ca);
                    }

                    // Remove o Recurso
                    _unitOfWork.Recurso.Remove(recurso);
                    _unitOfWork.Save();
                }

                return Json(new
                {
                    success = true,
                    message = "Item removido com sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "DeleteItem", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao remover item: " + error.Message
                });
            }
        }

        #region Endpoints para Navegação via Banco de Dados (Syncfusion)

        /// <summary>
        /// Retorna árvore de navegação do banco filtrada por usuário logado
        /// </summary>
        [HttpGet]
        [Route("GetTreeFromDb")]
        public IActionResult GetTreeFromDb()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // Busca todos os recursos ativos ordenados
                var todosRecursos = _unitOfWork.Recurso.GetAll(r => r.Ativo)
                    .OrderBy(r => r.Ordem)
                    .ToList();

                // Filtra por controle de acesso do usuário
                var recursosComAcesso = todosRecursos.Where(r =>
                {
                    var acesso = _unitOfWork.ControleAcesso.GetFirstOrDefault(
                        ca => ca.UsuarioId == userId && ca.RecursoId == r.RecursoId);
                    return acesso?.Acesso == true;
                }).ToList();

                // Monta árvore hierárquica
                var arvore = MontarArvoreRecursiva(recursosComAcesso, null);

                return Json(new { success = true, data = arvore });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "GetTreeFromDb", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        /// <summary>
        /// Retorna árvore completa para administração (sem filtro de acesso)
        /// </summary>
        [HttpGet]
        [Route("GetTreeAdmin")]
        public IActionResult GetTreeAdmin()
        {
            try
            {
                var todosRecursos = _unitOfWork.Recurso.GetAll()
                    .OrderBy(r => r.Ordem)
                    .ToList();

                Console.WriteLine($"[GetTreeAdmin] Total de recursos no banco: {todosRecursos.Count}");
                Console.WriteLine($"[GetTreeAdmin] Recursos raiz (ParentId = null): {todosRecursos.Count(r => r.ParentId == null)}");
                
                // ✅ Log dos primeiros 5 recursos raiz
                var recursosRaiz = todosRecursos.Where(r => r.ParentId == null).OrderBy(r => r.Ordem).Take(5).ToList();
                foreach (var raiz in recursosRaiz)
                {
                    Console.WriteLine($"[GetTreeAdmin] Raiz: {raiz.Nome} (Ordem: {raiz.Ordem}, Nivel: {raiz.Nivel}, ParentId: {raiz.ParentId})");
                }

                var arvore = MontarArvoreRecursiva(todosRecursos, null);
                
                Console.WriteLine($"[GetTreeAdmin] Total de itens raiz na árvore gerada: {arvore.Count}");
                
                // ✅ Conta total recursivamente
                int ContarItens(List<RecursoTreeDTO> items)
                {
                    if (items == null || items.Count == 0) return 0;
                    return items.Count + items.Sum(i => ContarItens(i.Items));
                }
                
                var totalNaArvore = ContarItens(arvore);
                Console.WriteLine($"[GetTreeAdmin] Total de itens na árvore (recursivo): {totalNaArvore}");
                Console.WriteLine($"[GetTreeAdmin] Diferença: {todosRecursos.Count - totalNaArvore}");

                return Json(new { success = true, data = arvore });
            }
            catch (Exception error)
            {
                Console.WriteLine($"[GetTreeAdmin] ERRO: {error.Message}");
                Console.WriteLine($"[GetTreeAdmin] StackTrace: {error.StackTrace}");
                Alerta.TratamentoErroComLinha("NavigationController.cs", "GetTreeAdmin", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        /// <summary>
        /// DEBUG: Endpoint para diagnóstico de problemas na carga da árvore
        /// </summary>
        [HttpGet]
        [Route("DebugTreeAdmin")]
        public IActionResult DebugTreeAdmin()
        {
            try
            {
                var todosRecursos = _unitOfWork.Recurso.GetAll().ToList();
                var totalRecursos = todosRecursos.Count;
                var recursosRaiz = todosRecursos.Where(r => r.ParentId == null).ToList();
                
                // ✅ Log detalhado para debug
                Console.WriteLine($"[DebugTreeAdmin] Total de recursos: {totalRecursos}");
                Console.WriteLine($"[DebugTreeAdmin] Recursos raiz (ParentId = null): {recursosRaiz.Count}");
                foreach (var raiz in recursosRaiz.Take(5))
                {
                    Console.WriteLine($"[DebugTreeAdmin] Raiz: {raiz.Nome} (Ordem: {raiz.Ordem}, Nivel: {raiz.Nivel})");
                }
                
                var arvore = MontarArvoreRecursiva(todosRecursos, null);
                
                // ✅ Conta total de itens na árvore recursivamente
                int ContarItens(List<RecursoTreeDTO> items)
                {
                    if (items == null || items.Count == 0) return 0;
                    return items.Count + items.Sum(i => ContarItens(i.Items));
                }
                
                var totalNaArvore = ContarItens(arvore);
                
                Console.WriteLine($"[DebugTreeAdmin] Total de itens na árvore gerada: {totalNaArvore}");
                Console.WriteLine($"[DebugTreeAdmin] Diferença: {totalRecursos - totalNaArvore}");

                return Json(new
                {
                    success = true,
                    totalRecursosNoBanco = totalRecursos,
                    totalRecursosRaiz = recursosRaiz.Count,
                    totalItensNaArvore = totalNaArvore,
                    diferenca = totalRecursos - totalNaArvore,
                    recursosRaizDetalhes = recursosRaiz.Select(r => new
                    {
                        id = r.RecursoId,
                        nome = r.Nome,
                        ordem = r.Ordem,
                        nivel = r.Nivel,
                        parentId = r.ParentId
                    }).ToList(),
                    primeiros5Recursos = todosRecursos.Take(5).Select(r => new
                    {
                        r.RecursoId,
                        r.Nome,
                        r.NomeMenu,
                        r.ParentId,
                        r.Ordem,
                        r.Ativo,
                        r.Nivel
                    }),
                    arvoreGerada = arvore
                });
            }
            catch (Exception error)
            {
                Console.WriteLine($"[DebugTreeAdmin] ERRO: {error.Message}");
                Console.WriteLine($"[DebugTreeAdmin] StackTrace: {error.StackTrace}");
                return Json(new
                {
                    success = false,
                    message = error.Message,
                    stackTrace = error.StackTrace,
                    innerException = error.InnerException?.Message
                });
            }
        }

        /// <summary>
        /// TESTE: Monta árvore em memória com dados fornecidos para verificar lógica
        /// </summary>
        [HttpGet]
        [Route("TestarMontagemArvore")]
        public IActionResult TestarMontagemArvore()
        {
            try
            {
                // ✅ Dados fornecidos pelo usuário (simulando banco)
                var recursosTeste = new List<Recurso>
                {
                    // Raiz (ParentId = null)
                    new Recurso { RecursoId = Guid.Parse("d0cef4a7-efb7-429c-9ab7-5bd77d38b386"), Nome = "Página Inicial", NomeMenu = "Página Inicial", Ordem = 1, ParentId = null, Nivel = 0, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("3c9dc854-c008-4774-ac86-1569cb2d7b8a"), Nome = "Agenda", NomeMenu = "Agenda", Ordem = 2, ParentId = null, Nivel = 0, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("e7d1611d-b13c-4f66-bb4b-8cd5e988092c"), Nome = "Nova Viagem", NomeMenu = "Nova Viagem", Ordem = 3, ParentId = null, Nivel = 0, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("29de13bd-15fd-40d4-9c6b-5a1a46e7dc6d"), Nome = "Gestão de Requisições", NomeMenu = "Gestão de Requisições", Ordem = 4, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("83969489-6b00-43c1-97d0-3dea354d3bec"), Nome = "Gestão de Viagens", NomeMenu = "Gestão de Viagens", Ordem = 5, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("d27514fe-567f-446e-8dd1-ecfdccafc63f"), Nome = "Gestão de Manutenção", NomeMenu = "Gestão de Manutenção", Ordem = 6, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("8586399a-7392-4cde-81bc-1a270685f85b"), Nome = "Gestão de Abastecimento", NomeMenu = "Gestão de Abastecimento", Ordem = 7, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("5b565573-987e-4a3d-ac7d-b88bd30786de"), Nome = "Gestão de Contratos", NomeMenu = "Gestão de Contratos", Ordem = 8, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("f9be17d9-77c3-43bc-a870-aa34bb3364f7"), Nome = "Gestão de Multas", NomeMenu = "Gestão de Multas", Ordem = 9, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("b7f25dcd-13c0-4082-8f14-1e7b7f8b747e"), Nome = "Gestão de Patrimônio", NomeMenu = "Gestão de Patrimônio", Ordem = 10, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("b3e9e1e5-826d-457f-8f6e-d4a1a224ec6e"), Nome = "Gestão de Cadastros", NomeMenu = "Gestão de Cadastros", Ordem = 11, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("30158f58-6890-4610-b99c-98d0ee4cab91"), Nome = "Gestão de Alertas", NomeMenu = "Gestão de Alertas", Ordem = 12, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("70901a41-a547-4603-8a4f-39971a21f7f6"), Nome = "TaxiLeg", NomeMenu = "TaxiLeg", Ordem = 13, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nome = "Administração", NomeMenu = "Administração", Ordem = 14, ParentId = null, Nivel = 0, Ativo = true, HasChild = true },
                    
                    // Filhos de Gestão de Requisições (4)
                    new Recurso { RecursoId = Guid.Parse("9577d8e0-38eb-4bcd-ab0c-5e884cdca7f1"), Nome = "Setores Solicitantes", NomeMenu = "Setores Solicitantes", Ordem = 401, ParentId = Guid.Parse("29de13bd-15fd-40d4-9c6b-5a1a46e7dc6d"), Nivel = 1, Ativo = true, HasChild = false },
                    
                    // Filhos de Gestão de Viagens (5)
                    new Recurso { RecursoId = Guid.Parse("ca6f657b-715f-4eb0-a871-00fc3faade9b"), Nome = "Insere Nova Viagem", NomeMenu = "Insere Nova Viagem", Ordem = 501, ParentId = Guid.Parse("83969489-6b00-43c1-97d0-3dea354d3bec"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("d62a86ca-e849-4239-9fb8-b2b33aacf9dc"), Nome = "Controle de Viagens", NomeMenu = "Controle de Viagens", Ordem = 502, ParentId = Guid.Parse("83969489-6b00-43c1-97d0-3dea354d3bec"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("75548376-b6aa-4157-a530-95e83c0040ea"), Nome = "Gerencia Eventos", NomeMenu = "Gerencia Eventos", Ordem = 503, ParentId = Guid.Parse("83969489-6b00-43c1-97d0-3dea354d3bec"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("bca818cf-450f-4c6d-8ec3-9033698878c0"), Nome = "Fluxo de Passageiros", NomeMenu = "Fluxo de Passageiros", Ordem = 504, ParentId = Guid.Parse("83969489-6b00-43c1-97d0-3dea354d3bec"), Nivel = 1, Ativo = true, HasChild = true },
                    new Recurso { RecursoId = Guid.Parse("4518bde4-e5ce-4cbf-ad4a-f1e89fcebf05"), Nome = "Gráficos Gerenciais", NomeMenu = "Viagens - Gráficos Gerenciais", Ordem = 505, ParentId = Guid.Parse("83969489-6b00-43c1-97d0-3dea354d3bec"), Nivel = 1, Ativo = true, HasChild = true },
                    
                    // Filhos de Gestão de Abastecimento (7)
                    new Recurso { RecursoId = Guid.Parse("2175b480-5546-44f6-854d-735440f24391"), Nome = "Abastecimentos", NomeMenu = "Abastecimentos", Ordem = 701, ParentId = Guid.Parse("8586399a-7392-4cde-81bc-1a270685f85b"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("f6c61ab4-f95a-4950-9e27-14c7d2a7d307"), Nome = "Importação de Dados", NomeMenu = "Importação de Dados", Ordem = 702, ParentId = Guid.Parse("8586399a-7392-4cde-81bc-1a270685f85b"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("2c31d63d-78d9-4e7a-992e-2af3dc6a9cae"), Nome = "Pendências de Abastecimento", NomeMenu = "Pendências de Abastecimento", Ordem = 703, ParentId = Guid.Parse("8586399a-7392-4cde-81bc-1a270685f85b"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("3c15419c-3c6b-456c-8f02-e3490aa4db51"), Nome = "Registro de Cupons", NomeMenu = "Registro de Cupons", Ordem = 704, ParentId = Guid.Parse("8586399a-7392-4cde-81bc-1a270685f85b"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("ec917b0d-9aa7-4270-81f6-5c393c56d29f"), Nome = "Dashboard de Abastecimento", NomeMenu = "Dashboard de Abastecimento", Ordem = 705, ParentId = Guid.Parse("8586399a-7392-4cde-81bc-1a270685f85b"), Nivel = 1, Ativo = true, HasChild = false },
                    
                    // Filhos de Administração (14)
                    new Recurso { RecursoId = Guid.Parse("025a38c5-5948-4ecb-8b83-f4d9b33da280"), Nome = "Cadastro de Usuários", NomeMenu = "Cadastro de Usuários", Ordem = 1401, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("72b57d33-45e4-452e-a101-8bf364ab1093"), Nome = "Gestão de Usuários", NomeMenu = "Gestão de Usuários", Ordem = 1402, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("d9c64834-b27c-447e-8372-3e683d96aa05"), Nome = "Insere Recursos", NomeMenu = "Insere Recursos", Ordem = 1403, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("7f1cf8fd-62de-4999-9b38-5ffde049d5fa"), Nome = "Gestão de Recursos", NomeMenu = "Gestão de Recursos", Ordem = 1404, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("948082da-bcd9-42c3-acd4-0004a823b14d"), Nome = "Atualiza Custo das Viagens", NomeMenu = "Atualiza Custo das Viagens", Ordem = 1405, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("fb5f8043-71b5-4505-b009-b108bcf4d86a"), Nome = "Edita Dados Viagem", NomeMenu = "Edita Dados Viagem", Ordem = 1406, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("835220e2-9f7a-4e1f-9ff2-23a951acfba8"), Nome = "Higieniza Origens/Destinos", NomeMenu = "Higieniza Origens/Destinos", Ordem = 1407, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("4d9055e5-9d47-4bcb-90f2-f5719f9591a6"), Nome = "Log de Erros", NomeMenu = "Log de Erros", Ordem = 1408, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("a892c31a-b919-437e-b1d9-eb860856850c"), Nome = "Monta Descrição Sem HTML", NomeMenu = "Monta Descrição", Ordem = 1409, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("8a06458e-9e73-40cb-9574-a9f5a2ee43e5"), Nome = "Gerar Estatísticas Viagens", NomeMenu = "Gerar Estatísticas Viagens", Ordem = 1410, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("657b2c65-8fbb-4d76-bde5-02b1afbcc0c3"), Nome = "Dashboard de Ajuste Estatístico dos Registros", NomeMenu = "Dashboard Ajuste Estatístico", Ordem = 1411, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false },
                    new Recurso { RecursoId = Guid.Parse("b1093c9d-1112-4a36-aeb5-e7866a3f0ab3"), Nome = "Gestão de Recursos e Navegação", NomeMenu = "Gestão de Recursos e Navegação", Ordem = 1412, ParentId = Guid.Parse("01837504-99e9-46f2-8765-55c438ae9712"), Nivel = 1, Ativo = true, HasChild = false }
                };

                Console.WriteLine($"[TestarMontagemArvore] Total de recursos de teste: {recursosTeste.Count}");
                Console.WriteLine($"[TestarMontagemArvore] Recursos raiz: {recursosTeste.Count(r => r.ParentId == null)}");
                
                var arvoreTeste = MontarArvoreRecursiva(recursosTeste, null);
                
                // Conta total recursivamente
                int ContarItens(List<RecursoTreeDTO> items)
                {
                    if (items == null || items.Count == 0) return 0;
                    return items.Count + items.Sum(i => ContarItens(i.Items));
                }
                
                var totalNaArvore = ContarItens(arvoreTeste);
                
                Console.WriteLine($"[TestarMontagemArvore] Total na árvore gerada: {totalNaArvore}");
                Console.WriteLine($"[TestarMontagemArvore] Itens raiz na árvore: {arvoreTeste.Count}");

                return Json(new
                {
                    success = true,
                    totalRecursosTeste = recursosTeste.Count,
                    recursosRaiz = recursosTeste.Count(r => r.ParentId == null),
                    totalNaArvore = totalNaArvore,
                    itensRaizNaArvore = arvoreTeste.Count,
                    diferenca = recursosTeste.Count - totalNaArvore,
                    estruturaArvore = arvoreTeste.Select(r => new
                    {
                        id = r.Id,
                        nome = r.Text,
                        ordem = r.Ordem,
                        nivel = r.Nivel,
                        temFilhos = r.HasChild,
                        quantidadeFilhos = r.Items?.Count ?? 0,
                        filhos = r.Items?.Select(f => new { id = f.Id, nome = f.Text, ordem = f.Ordem }).ToList()
                    }).ToList()
                });
            }
            catch (Exception error)
            {
                Console.WriteLine($"[TestarMontagemArvore] ERRO: {error.Message}");
                return Json(new
                {
                    success = false,
                    message = error.Message,
                    stackTrace = error.StackTrace
                });
            }
        }

        /// <summary>
        /// Classe auxiliar para armazenar dados de atualização
        /// </summary>
        private class RecursoUpdate
        {
            public Guid RecursoId { get; set; }
            public Guid? ParentId { get; set; }
            public int Nivel { get; set; }
            public double OrdemFinal { get; set; }
            public string Icon { get; set; }
            public string Href { get; set; }
            public string Nome { get; set; }
        }

        /// <summary>
        /// Salva alterações na árvore (reordenação, hierarquia) no banco de dados
        /// Usa estratégia de duas fases para evitar violação de UNIQUE INDEX em Ordem
        /// </summary>
        /// <remarks>
        /// Lê o body diretamente como string para evitar validação automática do [ApiController]
        /// </remarks>
        [HttpPost]
        [Route("SaveTreeToDb")]
        public async Task<IActionResult> SaveTreeToDb()
        {
            void Log(string msg)
            {
                var fullMsg = $"[SaveTreeToDb] {msg}";
                Console.WriteLine(fullMsg);
                System.Diagnostics.Debug.WriteLine(fullMsg);
            }

            try
            {
                // ✅ Lê o body diretamente como string para evitar validação automática
                Log("========================================");
                Log("Lendo body da requisição...");

                string jsonBody;
                using (var reader = new StreamReader(Request.Body))
                {
                    jsonBody = await reader.ReadToEndAsync();
                }

                Log($"JSON recebido ({jsonBody.Length} chars), deserializando...");

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                List<RecursoTreeDTO>? items = null;
                try
                {
                    items = JsonSerializer.Deserialize<List<RecursoTreeDTO>>(jsonBody, options);
                }
                catch (JsonException ex)
                {
                    Log($"❌ Erro ao deserializar JSON: {ex.Message}");
                    return Json(new { success = false, message = "Erro ao processar JSON: " + ex.Message });
                }

                Log($"Recebido {items?.Count ?? 0} itens para salvar");

                if (items == null || items.Count == 0)
                {
                    Log("❌ ERRO: items é NULL ou vazio!");
                    return Json(new { success = false, message = "Lista de itens é nula ou vazia. Verifique o JSON enviado." });
                }

                // Log dos primeiros 3 itens para debug
                foreach (var item in items.Take(3))
                {
                    Log($"Item: Id={item.Id}, Text={item.Text}, NomeMenu={item.NomeMenu}, Ordem={item.Ordem}");
                }

                var db = _unitOfWork.GetDbContext();

                // ============================================================
                // FASE 0: Coleta de atualizações (ordens finais e hierarquia)
                // ============================================================
                var updates = new List<RecursoUpdate>();
                var processedIds = new HashSet<Guid>();
                Log("Coletando atualizações...");
                ColetarAtualizacoes(items, null, 0, 0, updates, processedIds);
                Log($"Total de atualizações coletadas: {updates.Count}");

                if (updates.Count == 0)
                {
                    Log("⚠️ Nenhuma atualização encontrada. Nada a salvar.");
                    return Json(new { success = false, message = "Nenhuma alteração detectada na árvore." });
                }

                // ============================================================
                // Carrega entidades COM TRACKING (necessário para SaveChanges)
                // ============================================================
                var recursoIds = updates.Select(u => u.RecursoId).ToList();
                Log($"Buscando {recursoIds.Count} entidades rastreadas...");
                var recursosDict = db.Set<Recurso>()
                    .AsTracking()
                    .Where(r => recursoIds.Contains(r.RecursoId))
                    .ToDictionary(r => r.RecursoId);
                Log($"Entidades carregadas (rastreadas): {recursosDict.Count}");

                // ============================================================
                // FASE 1: Aplicar ordens temporárias negativas (previne duplicatas)
                // ============================================================
                Log("FASE 1: Aplicando ordens temporárias negativas...");
                int rowsAffectedPhase1 = 0;
                for (int i = 0; i < updates.Count; i++)
                {
                    var update = updates[i];
                    if (recursosDict.TryGetValue(update.RecursoId, out var recurso))
                    {
                        recurso.Ordem = -(i + 1); // valores únicos negativos
                        db.Entry(recurso).State = EntityState.Modified;
                    }
                    else
                    {
                        Log($"⚠️ Recurso não encontrado (fase 1): {update.RecursoId}");
                    }
                }
                rowsAffectedPhase1 = db.SaveChanges();
                Log($"FASE 1 concluída. Linhas afetadas: {rowsAffectedPhase1}");

                // ============================================================
                // FASE 2: Aplicar valores finais corretos
                // ============================================================
                Log("FASE 2: Aplicando valores finais...");
                foreach (var update in updates)
                {
                    if (recursosDict.TryGetValue(update.RecursoId, out var recurso))
                    {
                        recurso.ParentId = update.ParentId;
                        recurso.Nivel = update.Nivel;
                        recurso.Ordem = update.OrdemFinal;

                        if (!string.IsNullOrEmpty(update.Icon))
                            recurso.Icon = update.Icon;
                        if (!string.IsNullOrEmpty(update.Href))
                            recurso.Href = update.Href;

                        db.Entry(recurso).State = EntityState.Modified;
                    }
                    else
                    {
                        Log($"⚠️ Recurso não encontrado (fase 2): {update.RecursoId}");
                    }
                }
                var rowsAffectedPhase2 = db.SaveChanges();
                Log($"FASE 2 concluída. Linhas afetadas: {rowsAffectedPhase2}");

                var totalRows = rowsAffectedPhase1 + rowsAffectedPhase2;
                if (totalRows == 0)
                {
                    Log("⚠️ Nenhuma linha foi alterada nas duas fases.");
                    return Json(new { success = false, message = "Nenhuma alteração foi persistida." });
                }

                return Json(new { success = true, message = $"Navegação salva com sucesso! ({totalRows} registros atualizados)" });
            }
            catch (Exception error)
            {
                // Captura InnerException para ver o erro real do EF
                var errorMessage = error.Message;
                if (error.InnerException != null)
                {
                    errorMessage += " | Inner: " + error.InnerException.Message;
                    if (error.InnerException.InnerException != null)
                    {
                        errorMessage += " | Inner2: " + error.InnerException.InnerException.Message;
                    }
                }

                Log($"❌ ERRO: {errorMessage}");
                Log($"StackTrace: {error.StackTrace}");

                Alerta.TratamentoErroComLinha("NavigationController.cs", "SaveTreeToDb", error);
                return Json(new { success = false, message = errorMessage });
            }
        }

        /// <summary>
        /// Processa a árvore e aplica mudanças diretamente nas entidades rastreadas
        /// </summary>
        private void ProcessarArvoreComTracking(
            List<RecursoTreeDTO> items, 
            Guid? parentId, 
            int nivel, 
            double ordemBase, 
            Dictionary<Guid, Recurso> recursosDict,
            ref int processados,
            ref int modificados)
        {
            for (int i = 0; i < items.Count; i++)
            {
                var item = items[i];
                double ordemAtual = ordemBase + i + 1; // +1 para começar em 1

                if (Guid.TryParse(item.Id, out var recursoId))
                {
                    if (recursosDict.TryGetValue(recursoId, out var recurso))
                    {
                        processados++;

                        // Verifica se algo mudou
                        bool mudou = false;
                        if (recurso.ParentId != parentId)
                        {
                            System.Diagnostics.Debug.WriteLine($"[CHANGE] {recurso.Nome}: ParentId {recurso.ParentId} → {parentId}");
                            recurso.ParentId = parentId;
                            mudou = true;
                        }
                        if (recurso.Nivel != nivel)
                        {
                            System.Diagnostics.Debug.WriteLine($"[CHANGE] {recurso.Nome}: Nivel {recurso.Nivel} → {nivel}");
                            recurso.Nivel = nivel;
                            mudou = true;
                        }
                        if (Math.Abs(recurso.Ordem - ordemAtual) > 0.001)
                        {
                            System.Diagnostics.Debug.WriteLine($"[CHANGE] {recurso.Nome}: Ordem {recurso.Ordem} → {ordemAtual}");
                            recurso.Ordem = ordemAtual;
                            mudou = true;
                        }

                        if (mudou)
                        {
                            modificados++;
                        }

                        // Processa filhos recursivamente
                        if (item.Items?.Any() == true)
                        {
                            double ordemBaseFilhos = ordemAtual * 100;
                            ProcessarArvoreComTracking(item.Items, recursoId, nivel + 1, ordemBaseFilhos, recursosDict, ref processados, ref modificados);
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Coleta todas as atualizações necessárias recursivamente (previne duplicatas)
        /// </summary>
        private void ColetarAtualizacoes(List<RecursoTreeDTO> items, Guid? parentId, int nivel, double ordemBase, List<RecursoUpdate> updates, HashSet<Guid> processedIds)
        {
            for (int i = 0; i < items.Count; i++)
            {
                var item = items[i];
                double ordemAtual = ordemBase + i + 1; // 1-based para alinhar com front

                if (Guid.TryParse(item.Id, out var recursoId))
                {
                    // ✅ Verifica se já foi processado (previne duplicatas)
                    if (processedIds.Contains(recursoId))
                    {
                        Console.WriteLine($"[ColetarAtualizacoes] ⚠️ IGNORADO (duplicata): ID={recursoId}");
                        continue;
                    }

                    var recurso = _unitOfWork.Recurso.GetFirstOrDefault(r => r.RecursoId == recursoId);
                    if (recurso != null)
                    {
                        // ✅ Marca como processado
                        processedIds.Add(recursoId);

                        updates.Add(new RecursoUpdate
                        {
                            RecursoId = recursoId,
                            ParentId = parentId,
                            Nivel = nivel,
                            OrdemFinal = ordemAtual,
                            Icon = item.Icon,
                            Href = item.Href,
                            Nome = recurso.Nome
                        });

                        Console.WriteLine($"[ColetarAtualizacoes] Coletado: {recurso.Nome} | Ordem: {ordemAtual} | Nível: {nivel}");

                        // Processa filhos recursivamente
                        if (item.Items?.Any() == true)
                        {
                            double ordemBaseFilhos = ordemAtual * 100;
                            ColetarAtualizacoes(item.Items, recursoId, nivel + 1, ordemBaseFilhos, updates, processedIds);
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Migra dados do nav.json para a tabela Recurso no banco de dados
        /// </summary>
        [HttpPost]
        [Route("MigrateFromJson")]
        public IActionResult MigrateFromJson()
        {
            try
            {
                if (!System.IO.File.Exists(NavJsonPath))
                {
                    return Json(new { success = false, message = "Arquivo nav.json não encontrado!" });
                }

                var jsonText = System.IO.File.ReadAllText(NavJsonPath);
                var navigation = NavigationBuilder.FromJson(jsonText);

                int ordem = 0;
                int atualizados = 0;
                int criados = 0;

                ProcessarItensParaMigracao(navigation.Lists, null, 0, ref ordem, ref atualizados, ref criados);
                _unitOfWork.Save();

                return Json(new
                {
                    success = true,
                    message = $"Migração concluída! {criados} recursos criados, {atualizados} atualizados.",
                    criados,
                    atualizados
                });
            }
            catch (Exception error)
            {
                // Captura erro detalhado incluindo inner exception
                var mensagem = error.Message;
                if (error.InnerException != null)
                {
                    mensagem += " | Inner: " + error.InnerException.Message;
                    if (error.InnerException.InnerException != null)
                    {
                        mensagem += " | Inner2: " + error.InnerException.InnerException.Message;
                    }
                }
                Alerta.TratamentoErroComLinha("NavigationController.cs", "MigrateFromJson", error);
                return Json(new { success = false, message = mensagem });
            }
        }

        /// <summary>
        /// Adiciona ou atualiza um recurso no banco (para a tela unificada)
        /// </summary>
        [HttpPost]
        [Route("SaveRecurso")]
        public IActionResult SaveRecurso([FromBody] RecursoTreeDTO dto)
        {
            try
            {
                Recurso recurso;
                bool isNew = false;

                if (!string.IsNullOrEmpty(dto.Id) && Guid.TryParse(dto.Id, out var recursoId))
                {
                    recurso = _unitOfWork.Recurso.GetFirstOrDefault(r => r.RecursoId == recursoId);
                    if (recurso == null)
                    {
                        recurso = new Recurso { RecursoId = recursoId };
                        isNew = true;
                    }
                }
                else
                {
                    recurso = new Recurso { RecursoId = Guid.NewGuid() };
                    isNew = true;
                }

                // Atualiza propriedades (com valores padrão para campos obrigatórios)
                recurso.Nome = !string.IsNullOrEmpty(dto.Text) ? dto.Text : "Novo Item";
                recurso.NomeMenu = !string.IsNullOrEmpty(dto.NomeMenu) ? dto.NomeMenu : $"menu_{Guid.NewGuid():N}";
                recurso.Icon = !string.IsNullOrEmpty(dto.Icon) ? dto.Icon : "fa-duotone fa-folder";
                recurso.Href = !string.IsNullOrEmpty(dto.Href) ? dto.Href : "javascript:void(0);";
                recurso.Descricao = dto.Descricao;
                recurso.Ordem = dto.Ordem > 0 ? dto.Ordem : GetNextOrdem();
                recurso.Nivel = dto.Nivel;
                recurso.Ativo = dto.Ativo;
                recurso.HasChild = dto.HasChild;
                recurso.ParentId = Guid.TryParse(dto.ParentId, out var parentId) ? parentId : null;

                if (isNew)
                {
                    _unitOfWork.Recurso.Add(recurso);
                    // ✅ Salva o Recurso PRIMEIRO para garantir que existe no banco antes de criar ControleAcesso
                    _unitOfWork.Save();
                    
                    // ✅ DEPOIS cria os registros de ControleAcesso (agora o RecursoId existe no banco)
                    CriarControleAcessoParaTodosUsuarios(recurso.RecursoId);
                    _unitOfWork.Save(); // Salva os ControleAcesso criados
                }
                else
                {
                    _unitOfWork.Recurso.Update(recurso);
                    _unitOfWork.Save();
                }

                return Json(new
                {
                    success = true,
                    recursoId = recurso.RecursoId,
                    message = isNew ? "Recurso criado com sucesso!" : "Recurso atualizado com sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "SaveRecurso", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        /// <summary>
        /// Remove um recurso e seus controles de acesso
        /// </summary>
        [HttpPost]
        [Route("DeleteRecurso")]
        public IActionResult DeleteRecurso([FromBody] DeleteRecursoRequest request)
        {
            try
            {
                if (!Guid.TryParse(request.RecursoId, out var recursoId))
                {
                    return Json(new { success = false, message = "ID do recurso inválido!" });
                }

                var recurso = _unitOfWork.Recurso.GetFirstOrDefault(r => r.RecursoId == recursoId);
                if (recurso == null)
                {
                    return Json(new { success = false, message = "Recurso não encontrado!" });
                }

                // Verifica se tem filhos
                var temFilhos = _unitOfWork.Recurso.GetAll(r => r.ParentId == recursoId).Any();
                if (temFilhos)
                {
                    return Json(new { success = false, message = "Não é possível excluir recurso que possui subitens!" });
                }

                // Remove controles de acesso
                var controlesAcesso = _unitOfWork.ControleAcesso.GetAll(ca => ca.RecursoId == recursoId);
                foreach (var ca in controlesAcesso)
                {
                    _unitOfWork.ControleAcesso.Remove(ca);
                }

                // Remove o recurso
                _unitOfWork.Recurso.Remove(recurso);
                _unitOfWork.Save();

                return Json(new { success = true, message = "Recurso removido com sucesso!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "DeleteRecurso", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        /// <summary>
        /// Retorna lista de usuários com status de acesso para um recurso
        /// </summary>
        [HttpGet]
        [Route("GetUsuariosAcesso")]
        public IActionResult GetUsuariosAcesso(string recursoId)
        {
            try
            {
                if (!Guid.TryParse(recursoId, out var recId))
                {
                    return Json(new { success = false, message = "ID do recurso inválido!" });
                }

                var usuarios = _unitOfWork.AspNetUsers.GetAll(u => u.Status == true)
                    .OrderBy(u => u.NomeCompleto)
                    .Select(u => new
                    {
                        UsuarioId = u.Id,
                        Nome = u.NomeCompleto ?? u.UserName,
                        Acesso = _unitOfWork.ControleAcesso
                            .GetFirstOrDefault(ca => ca.UsuarioId == u.Id && ca.RecursoId == recId)?.Acesso ?? false
                    })
                    .ToList();

                return Json(new { success = true, data = usuarios });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "GetUsuariosAcesso", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        /// <summary>
        /// Atualiza o acesso de um usuário a um recurso
        /// </summary>
        [HttpPost]
        [Route("UpdateAcesso")]
        public IActionResult UpdateAcesso([FromBody] UpdateAcessoRequest request)
        {
            try
            {
                if (!Guid.TryParse(request.RecursoId, out var recursoId))
                {
                    return Json(new { success = false, message = "ID do recurso inválido!" });
                }

                var controle = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca =>
                    ca.UsuarioId == request.UsuarioId && ca.RecursoId == recursoId);

                if (controle == null)
                {
                    controle = new ControleAcesso
                    {
                        UsuarioId = request.UsuarioId,
                        RecursoId = recursoId,
                        Acesso = request.Acesso
                    };
                    _unitOfWork.ControleAcesso.Add(controle);
                }
                else
                {
                    controle.Acesso = request.Acesso;
                    _unitOfWork.ControleAcesso.Update(controle);
                }

                _unitOfWork.Save();

                return Json(new { success = true, message = "Acesso atualizado!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "UpdateAcesso", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        /// <summary>
        /// Habilita acesso para todos os usuários do sistema ao criar novo item
        /// </summary>
        [HttpPost]
        [Route("HabilitarAcessoTodosUsuarios")]
        public IActionResult HabilitarAcessoTodosUsuarios([FromBody] HabilitarAcessoRequest request)
        {
            try
            {
                if (!Guid.TryParse(request.RecursoId, out var recursoId))
                {
                    return Json(new { success = false, message = "ID do recurso inválido!" });
                }

                // Busca todos os usuários do sistema
                var todosUsuarios = _unitOfWork.AspNetUsers.GetAll();

                foreach (var usuario in todosUsuarios)
                {
                    // Verifica se já existe controle de acesso para este usuário e recurso
                    var controleExistente = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca =>
                        ca.UsuarioId == usuario.Id && ca.RecursoId == recursoId);

                    if (controleExistente == null)
                    {
                        // Cria novo registro com Acesso = true (habilitado)
                        var novoControle = new ControleAcesso
                        {
                            UsuarioId = usuario.Id,
                            RecursoId = recursoId,
                            Acesso = true
                        };
                        _unitOfWork.ControleAcesso.Add(novoControle);
                    }
                }

                _unitOfWork.Save();

                return Json(new { success = true, message = "Acesso habilitado para todos os usuários!" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "HabilitarAcessoTodosUsuarios", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        #endregion

        #region Métodos Auxiliares para Banco de Dados

        /// <summary>
        /// Monta árvore recursiva a partir de lista de recursos
        /// </summary>
        private List<RecursoTreeDTO> MontarArvoreRecursiva(List<Recurso> recursos, Guid? parentId)
        {
            // ✅ Comparação explícita para NULL para garantir que funciona corretamente
            return recursos
                .Where(r => 
                    (parentId == null && r.ParentId == null) || 
                    (parentId != null && r.ParentId == parentId)
                )
                .OrderBy(r => r.Ordem)
                .Select(r =>
                {
                    var dto = RecursoTreeDTO.FromRecurso(r);
                    dto.Items = MontarArvoreRecursiva(recursos, r.RecursoId);
                    dto.HasChild = dto.Items.Any();
                    return dto;
                })
                .ToList();
        }

        /// <summary>
        /// Atualiza recursos recursivamente a partir da árvore
        /// </summary>
        private void AtualizarRecursosRecursivamente(List<RecursoTreeDTO> items, Guid? parentId, int nivel, double ordemBase)
        {
            for (int i = 0; i < items.Count; i++)
            {
                var item = items[i];
                double ordemAtual = ordemBase + i;

                if (Guid.TryParse(item.Id, out var recursoId))
                {
                    var recurso = _unitOfWork.Recurso.GetFirstOrDefault(r => r.RecursoId == recursoId);
                    if (recurso != null)
                    {
                        Console.WriteLine($"[AtualizarRecursos] Atualizando: {recurso.Nome} | Ordem: {ordemAtual} | Nível: {nivel} | ParentId: {parentId}");

                        // ✅ Guarda valores originais para debug
                        var ordemAnterior = recurso.Ordem;
                        var parentIdAnterior = recurso.ParentId;

                        recurso.ParentId = parentId;
                        recurso.Nivel = nivel;
                        recurso.Ordem = ordemAtual;

                        // ✅ Atualiza Icon e Href apenas se fornecidos (não nulos/vazios)
                        if (!string.IsNullOrEmpty(item.Icon))
                        {
                            recurso.Icon = item.Icon;
                        }
                        if (!string.IsNullOrEmpty(item.Href))
                        {
                            recurso.Href = item.Href;
                        }

                        _unitOfWork.Recurso.Update(recurso);

                        Console.WriteLine($"[AtualizarRecursos] ✅ Atualizado: {recurso.Nome} | Ordem: {ordemAnterior} → {ordemAtual}");

                        // Processa filhos recursivamente
                        if (item.Items?.Any() == true)
                        {
                            // Calcula ordem base dos filhos: ordem do pai * 100
                            double ordemBaseFilhos = ordemAtual * 100;
                            Console.WriteLine($"[AtualizarRecursos] Processando {item.Items.Count} filhos de '{recurso.Nome}'");
                            AtualizarRecursosRecursivamente(item.Items, recursoId, nivel + 1, ordemBaseFilhos);
                        }
                    }
                    else
                    {
                        Console.WriteLine($"[AtualizarRecursos] ❌ Recurso não encontrado: ID={item.Id}");
                    }
                }
                else
                {
                    Console.WriteLine($"[AtualizarRecursos] ❌ ID inválido: {item.Id}");
                }
            }
        }

        /// <summary>
        /// Processa itens do nav.json para migração
        /// Usa ordenação hierárquica: Pai=1, Filhos=101-199, Netos=10101-10199
        /// </summary>
        private void ProcessarItensParaMigracao(List<ListItem> items, Guid? parentId, int nivel, ref int ordem, ref int atualizados, ref int criados, double ordemPai = 0)
        {
            if (items == null) return;

            int indiceLocal = 1; // Contador local para este nível

            foreach (var item in items)
            {
                try
                {
                    // Pula itens sem identificador
                    if (string.IsNullOrEmpty(item.NomeMenu) && string.IsNullOrEmpty(item.Title)) continue;

                    // Usa NomeMenu se existir, senão usa Title como fallback
                    var nomeMenuBusca = !string.IsNullOrEmpty(item.NomeMenu) ? item.NomeMenu : item.Title;
                    var recurso = _unitOfWork.Recurso.GetFirstOrDefault(r => r.NomeMenu == nomeMenuBusca);
                    bool isNew = false;

                // Calcula ordem hierárquica:
                // Nível 0: 1, 2, 3...
                // Nível 1: ordemPai * 100 + índice = 101, 102, 201, 202...
                // Nível 2: ordemPai * 100 + índice = 10101, 10102, 20101...
                double ordemCalculada;
                if (nivel == 0)
                {
                    ordemCalculada = indiceLocal;
                }
                else
                {
                    ordemCalculada = (ordemPai * 100) + indiceLocal;
                }

                if (recurso == null)
                    {
                        // Cria novo recurso (com valores padrão para campos obrigatórios)
                        recurso = new Recurso
                        {
                            RecursoId = Guid.NewGuid(),
                            Nome = item.Title ?? item.NomeMenu ?? "Sem Nome",
                            NomeMenu = nomeMenuBusca ?? $"menu_{Guid.NewGuid():N}",
                            Descricao = $"Menu: {nomeMenuBusca}",
                        Ordem = ordemCalculada,
                        ParentId = parentId,
                        Icon = item.Icon ?? "fa-duotone fa-folder",
                        Href = item.Href ?? "javascript:void(0);",
                        Ativo = true,
                        Nivel = nivel,
                        HasChild = item.HasChild
                    };
                    _unitOfWork.Recurso.Add(recurso);
                    isNew = true;
                    criados++;
                }
                else
                {
                    // Atualiza campos (com valores padrão para campos obrigatórios)
                    recurso.ParentId = parentId;
                    recurso.Icon = item.Icon ?? "fa-regular fa-folder";
                    recurso.Href = item.Href ?? "javascript:void(0);";
                    recurso.Nivel = nivel;
                    recurso.Ativo = true;
                    recurso.Ordem = ordemCalculada;
                    recurso.HasChild = item.HasChild;
                    _unitOfWork.Recurso.Update(recurso);
                    atualizados++;
                }

                // IMPORTANTE: Salva o Recurso ANTES de criar ControleAcesso
                _unitOfWork.Save();

                // Cria ControleAcesso apenas para novos recursos
                if (isNew)
                {
                    CriarControleAcessoParaTodosUsuarios(recurso.RecursoId);
                    _unitOfWork.Save();
                }

                // Processa filhos recursivamente passando a ordem do pai atual
                if (item.Items?.Any() == true)
                {
                    ProcessarItensParaMigracao(item.Items, recurso.RecursoId, nivel + 1, ref ordem, ref atualizados, ref criados, ordemCalculada);
                }

                indiceLocal++;
                ordem++;
                }
                catch (Exception ex)
                {
                    // Log do erro mas continua com os próximos itens
                    Console.WriteLine($"Erro ao migrar item '{item.NomeMenu ?? item.Title}': {ex.Message}");
                    indiceLocal++;
                    ordem++;
                }
            }
        }

        #endregion

        #region Métodos Auxiliares

        /// <summary>
        /// Transforma ListItem em NavigationTreeItem para a TreeView
        /// </summary>
        private List<NavigationTreeItem> TransformToTreeData(List<ListItem> items, string parentId)
        {
            var result = new List<NavigationTreeItem>();
            int index = 0;

            foreach (var item in items)
            {
                var id = string.IsNullOrEmpty(parentId)
                    ? $"item_{index}"
                    : $"{parentId}_{index}";

                var treeItem = new NavigationTreeItem
                {
                    Id = id,
                    Text = item.NomeMenu ?? item.Title,
                    Title = item.Title,
                    NomeMenu = item.NomeMenu,
                    Href = item.Href,
                    Icon = item.Icon,
                    IconCss = item.Icon,
                    ParentId = parentId,
                    HasChild = item.Items != null && item.Items.Count > 0,
                    Expanded = true
                };

                if (item.Items != null && item.Items.Count > 0)
                {
                    treeItem.Items = TransformToTreeData(item.Items, id);
                }

                result.Add(treeItem);
                index++;
            }

            return result;
        }

        /// <summary>
        /// Transforma NavigationTreeItem de volta para ListItem
        /// </summary>
        private List<object> TransformFromTreeData(List<NavigationTreeItem> items)
        {
            var result = new List<object>();

            foreach (var item in items)
            {
                var listItem = new Dictionary<string, object>
                {
                    { "title", EncodeHtmlEntities(item.Title ?? item.Text) },
                    { "nomeMenu", item.NomeMenu ?? item.Text },
                    { "roles", new string[0] },
                    { "hasChild", item.HasChild }
                };

                if (!string.IsNullOrEmpty(item.Icon))
                {
                    listItem["icon"] = item.Icon;
                }

                if (!string.IsNullOrEmpty(item.Href))
                {
                    listItem["href"] = item.Href;
                }

                if (item.Items != null && item.Items.Count > 0)
                {
                    listItem["items"] = TransformFromTreeData(item.Items);
                }

                result.Add(listItem);
            }

            return result;
        }

        /// <summary>
        /// Codifica caracteres especiais para HTML entities
        /// </summary>
        private string EncodeHtmlEntities(string text)
        {
            if (string.IsNullOrEmpty(text)) return text;

            return text
                .Replace("á", "&aacute;")
                .Replace("à", "&agrave;")
                .Replace("ã", "&atilde;")
                .Replace("â", "&acirc;")
                .Replace("é", "&eacute;")
                .Replace("ê", "&ecirc;")
                .Replace("í", "&iacute;")
                .Replace("ó", "&oacute;")
                .Replace("ô", "&ocirc;")
                .Replace("õ", "&otilde;")
                .Replace("ú", "&uacute;")
                .Replace("ç", "&ccedil;")
                .Replace("Á", "&Aacute;")
                .Replace("À", "&Agrave;")
                .Replace("Ã", "&Atilde;")
                .Replace("Â", "&Acirc;")
                .Replace("É", "&Eacute;")
                .Replace("Ê", "&Ecirc;")
                .Replace("Í", "&Iacute;")
                .Replace("Ó", "&Oacute;")
                .Replace("Ô", "&Ocirc;")
                .Replace("Õ", "&Otilde;")
                .Replace("Ú", "&Uacute;")
                .Replace("Ç", "&Ccedil;");
        }

        /// <summary>
        /// Sincroniza itens da TreeView com a tabela Recurso
        /// </summary>
        private void SincronizarRecursos(List<NavigationTreeItem> items)
        {
            foreach (var item in items)
            {
                if (!string.IsNullOrEmpty(item.NomeMenu))
                {
                    var recurso = _unitOfWork.Recurso.GetFirstOrDefault(r =>
                        r.NomeMenu == item.NomeMenu);

                    if (recurso == null)
                    {
                        // Cria novo recurso se não existir
                        recurso = new Recurso
                        {
                            RecursoId = Guid.NewGuid(),
                            Nome = item.Title ?? item.Text,
                            NomeMenu = item.NomeMenu,
                            Descricao = $"Menu: {item.NomeMenu}",
                            Ordem = GetNextOrdem(),
                            HasChild = item.HasChild
                        };
                        _unitOfWork.Recurso.Add(recurso);
                        CriarControleAcessoParaTodosUsuarios(recurso.RecursoId);
                    }
                    else
                    {
                        // Atualiza HasChild em recursos existentes
                        recurso.HasChild = item.HasChild;
                        _unitOfWork.Recurso.Update(recurso);
                    }
                }

                // Processa subitens recursivamente
                if (item.Items != null && item.Items.Count > 0)
                {
                    SincronizarRecursos(item.Items);
                }
            }

            _unitOfWork.Save();
        }

        /// <summary>
        /// Obtém a próxima ordem disponível para recursos
        /// </summary>
        private double GetNextOrdem()
        {
            var recursos = _unitOfWork.Recurso.GetAll().ToList();
            if (!recursos.Any()) return 1;
            return recursos.Max(r => r.Ordem) + 1;
        }

        /// <summary>
        /// Cria ControleAcesso para todos os usuários ativos
        /// </summary>
        private void CriarControleAcessoParaTodosUsuarios(Guid recursoId)
        {
            var usuarios = _unitOfWork.AspNetUsers.GetAll(u => u.Status == true);

            foreach (var usuario in usuarios)
            {
                var controleExistente = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca =>
                    ca.UsuarioId == usuario.Id && ca.RecursoId == recursoId);

                if (controleExistente == null)
                {
                    var novoControle = new ControleAcesso
                    {
                        UsuarioId = usuario.Id,
                        RecursoId = recursoId,
                        Acesso = true
                    };
                    _unitOfWork.ControleAcesso.Add(novoControle);
                }
            }
        }

        #endregion

        #region API - Ícones FontAwesome

        /// <summary>
        /// Lista ícones FontAwesome 7 Pro Duotone em estrutura HIERÁRQUICA por categorias
        /// Carrega do arquivo fontawesome-icons.json (traduzido PT-BR) e transforma para formato DropDownTree
        /// </summary>
        [HttpGet]
        [Route("GetIconesFontAwesomeHierarquico")]
        public IActionResult GetIconesFontAwesomeHierarquico()
        {
            try
            {
                // Tenta buscar do cache
                if (_cache.TryGetValue(CacheKeyFontAwesomeIcons, out List<object> cachedIcons))
                {
                    return Json(new { success = true, data = cachedIcons });
                }

                // Se não está no cache, carrega do JSON
                var icons = LoadFontAwesomeIconsFromJson();

                // Salva no cache por 24 horas
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = CacheDuration,
                    Priority = CacheItemPriority.Normal
                };
                _cache.Set(CacheKeyFontAwesomeIcons, icons, cacheOptions);

                return Json(new { success = true, data = icons });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "GetIconesFontAwesomeHierarquico", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        /// <summary>
        /// Carrega ícones do arquivo JSON traduzido e transforma para estrutura hierárquica do DropDownTree
        /// </summary>
        private List<object> LoadFontAwesomeIconsFromJson()
        {
            // Verifica se arquivo existe
            if (!System.IO.File.Exists(FontAwesomeIconsJsonPath))
            {
                throw new FileNotFoundException(
                    $"Arquivo fontawesome-icons.json não encontrado em: {FontAwesomeIconsJsonPath}");
            }

            // Lê e desserializa JSON
            var jsonText = System.IO.File.ReadAllText(FontAwesomeIconsJsonPath);
            var categorias = FontAwesomeIconsLoader.FromJson(jsonText);

            // Transforma para estrutura esperada pelo DropDownTree
            var result = new List<object>();

            foreach (var categoria in categorias.OrderBy(c => c.Categoria))
            {
                // Cria ID único para a categoria
                var catId = $"cat_{categoria.CategoriaOriginal}";

                // Ordena ícones dentro da categoria alfabeticamente pelo label
                var sortedIcons = categoria.Icones
                    .OrderBy(i => i.Label)
                    .Select(i => new
                    {
                        id = i.Id,              // "fa-duotone fa-bat"
                        text = i.Label,         // "Bastão" (exibido no dropdown)
                        name = i.Name,          // "bat" (nome curto)
                        parentId = catId,
                        keywords = i.Keywords   // Para busca futura
                    })
                    .ToList<object>();

                // Cria estrutura da categoria
                result.Add(new
                {
                    id = catId,
                    text = categoria.Categoria,
                    isCategory = true,
                    hasChild = sortedIcons.Count > 0,
                    expanded = false,
                    child = sortedIcons
                });
            }

            return result;
        }

        #endregion

        #region API - Páginas do Sistema

        [HttpGet]
        [Route("GetPaginasHierarquico")]
        public IActionResult GetPaginasHierarquico()
        {
            try
            {
                const string cacheKey = "PaginasHierarquicas";

                if (_cache.TryGetValue(cacheKey, out List<object> cachedPages))
                {
                    return Json(new { success = true, data = cachedPages });
                }

                var paginas = LoadPaginasFromFileSystem();

                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24),
                    Priority = CacheItemPriority.Normal
                };
                _cache.Set(cacheKey, paginas, cacheOptions);

                return Json(new { success = true, data = paginas });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "GetPaginasHierarquico", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        private List<object> LoadPaginasFromFileSystem()
        {
            var pagesPath = Path.Combine(_env.ContentRootPath, "Pages");

            if (!Directory.Exists(pagesPath))
            {
                throw new DirectoryNotFoundException($"Pasta Pages não encontrada em: {pagesPath}");
            }

            var result = new List<object>();

            var moduleDirs = Directory.GetDirectories(pagesPath)
                .Select(d => new DirectoryInfo(d))
                .Where(d => !d.Name.StartsWith("_") && !d.Name.Equals("Shared", StringComparison.OrdinalIgnoreCase))
                .OrderBy(d => d.Name)
                .ToList();

            foreach (var moduleDir in moduleDirs)
            {
                var moduleName = moduleDir.Name;
                var moduleId = $"module_{moduleName}";

                var pageFiles = moduleDir.GetFiles("*.cshtml", SearchOption.TopDirectoryOnly)
                    .Where(f => !f.Name.StartsWith("_"))
                    .OrderBy(f => f.Name)
                    .ToList();

                if (!pageFiles.Any())
                    continue;

                var children = pageFiles.Select(pageFile =>
                {
                    var pageName = Path.GetFileNameWithoutExtension(pageFile.Name);
                    var pageId = $"page_{moduleName}_{pageName}";
                    var paginaRef = $"{moduleName.ToLower()}_{pageName.ToLower()}.html";
                    var moduloAmigavel = GetFriendlyModuleName(moduleName);

                    return new
                    {
                        id = pageId,
                        text = pageName,              // ✅ NOME ORIGINAL DO ARQUIVO (Index, Upsert, etc)
                        displayText = $"({moduloAmigavel}) {pageName}",  // ✅ DISPLAY: (Veículos) Index
                        paginaRef = paginaRef,
                        pageName = pageName,
                        moduleName = moduleName,
                        parentId = moduleId
                    };
                }).ToList<object>();

                result.Add(new
                {
                    id = moduleId,
                    text = GetFriendlyModuleName(moduleName),
                    isCategory = true,
                    hasChild = children.Count > 0,
                    expanded = false,
                    child = children
                });
            }

            return result;
        }

        private string GetFriendlyPageName(string pageName)
        {
            return pageName switch
            {
                "Index" => "Listar",
                "Upsert" => "Criar/Editar",
                "UploadCNH" => "Upload CNH",
                "UploadCRLV" => "Upload CRLV",
                "UploadPDF" => "Upload PDF",
                "DashboardAbastecimento" => "Dashboard",
                "DashboardVeiculos" => "Dashboard",
                "DashboardMotoristas" => "Dashboard",
                "DashboardViagens" => "Dashboard",
                "DashboardLavagem" => "Dashboard",
                "DashboardEventos" => "Dashboard",
                "DashboardEconomildo" => "Dashboard Economildo",
                "DashboardAdministracao" => "Dashboard",
                "PBI" => "Power BI",
                "PBILotacaoMotorista" => "Power BI - Lotação",
                "PBILavagem" => "Power BI - Lavagem",
                "PBITaxiLeg" => "Power BI - Taxi Leg",
                _ => pageName
            };
        }

        private string GetFriendlyModuleName(string moduleName)
        {
            return moduleName switch
            {
                "Administracao" => "Administração",
                "AlertasFrotiX" => "Alertas FrotiX",
                "AtaRegistroPrecos" => "Ata de Registro de Preços",
                "Combustivel" => "Combustível",
                "Manutencao" => "Manutenção",
                "MovimentacaoPatrimonio" => "Movimentação de Patrimônio",
                "SecaoPatrimonial" => "Seções Patrimoniais",
                "SetorPatrimonial" => "Setores Patrimoniais",
                "SetorSolicitante" => "Setores Solicitantes",
                "Usuarios" => "Usuários",
                "Veiculo" => "Veículos",
                _ => moduleName
            };
        }

        /// <summary>
        /// Retorna o HTML renderizado da navegação lateral para atualização dinâmica
        /// </summary>
        [HttpGet]
        [Route("GetNavigationMenu")]
        public async Task<IActionResult> GetNavigationMenu()
        {
            try
            {
                // Invoca o ViewComponent de navegação e renderiza o HTML
                var result = await ViewComponentInvokeAsync("Navigation");

                if (result is ViewViewComponentResult viewResult)
                {
                    // Renderiza a view do ViewComponent para string
                    var htmlString = await RenderViewComponentToStringAsync(viewResult);
                    return Json(new { success = true, html = htmlString });
                }

                return Json(new { success = false, message = "Erro ao renderizar menu de navegação" });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NavigationController.cs", "GetNavigationMenu", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        /// <summary>
        /// Helper para invocar ViewComponent
        /// </summary>
        private async Task<IViewComponentResult> ViewComponentInvokeAsync(string componentName)
        {
            var viewComponent = new ViewComponents.NavigationViewComponent(
                HttpContext.RequestServices.GetRequiredService<INavigationModel>(),
                _unitOfWork
            );

            // Define ViewComponentContext manualmente
            viewComponent.ViewComponentContext = new ViewComponentContext
            {
                ViewContext = new ViewContext
                {
                    HttpContext = HttpContext
                }
            };

            return await Task.FromResult(viewComponent.Invoke());
        }

        /// <summary>
        /// Renderiza ViewComponent para string HTML
        /// </summary>
        private async Task<string> RenderViewComponentToStringAsync(ViewViewComponentResult viewResult)
        {
            try
            {
                // Simplificado: retorna marcador para refresh do lado do cliente
                // O cliente deve recarregar a página ou usar location.reload() parcial
                return "<div id='nav-reload-marker'>Navigation Updated</div>";
            }
            catch (Exception ex)
            {
                return $"<div>Error: {ex.Message}</div>";
            }
        }

        #endregion
    }

    /// <summary>
    /// Request para habilitar acesso de todos usuários a um recurso
    /// </summary>
    public class HabilitarAcessoRequest
    {
        public string RecursoId { get; set; }
    }
}
