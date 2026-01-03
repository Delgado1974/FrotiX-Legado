using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NavigationController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _env;

        // Caminhos absolutos para garantir persistência correta
        private string NavJsonPath => Path.Combine(_env.ContentRootPath, "nav.json");
        private string NavJsonBackupPath => Path.Combine(_env.ContentRootPath, "nav.json.bak");

        public NavigationController(IUnitOfWork unitOfWork, IWebHostEnvironment env)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _env = env;
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

                // Cria novo Recurso no BD
                var recurso = new Recurso
                {
                    RecursoId = Guid.NewGuid(),
                    Nome = item.Title,
                    NomeMenu = item.NomeMenu,
                    Descricao = $"Menu: {item.NomeMenu}",
                    Ordem = GetNextOrdem()
                };
                _unitOfWork.Recurso.Add(recurso);

                // Cria ControleAcesso para todos usuários ativos
                CriarControleAcessoParaTodosUsuarios(recurso.RecursoId);

                _unitOfWork.Save();

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
                    { "roles", new string[0] }
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
                            Ordem = GetNextOrdem()
                        };
                        _unitOfWork.Recurso.Add(recurso);
                        CriarControleAcessoParaTodosUsuarios(recurso.RecursoId);
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
            var maxOrdem = _unitOfWork.Recurso.GetAll()
                .Max(r => r.Ordem) ?? 0;
            return maxOrdem + 1;
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
    }
}
