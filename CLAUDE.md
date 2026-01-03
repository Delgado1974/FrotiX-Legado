# CLAUDE.md - Instruções para o Claude Code

Este arquivo contém instruções e regras específicas do projeto FrotiX para o Claude Code.

## Regras Gerais

### Memorização:
- Quando o usuário disser "memorize", "guarde na memória" ou similar, **adicionar a instrução neste arquivo CLAUDE.md**
- Claude não tem memória persistente entre sessões - este arquivo é a "memória eterna"

## Regras de Git

### Commit e Push:
- Quando o usuário pedir para fazer commit, **sempre fazer push automaticamente** após o commit
- **IMPORTANTE:** Fazer commit/push **APENAS** dos arquivos gerados ou modificados na sessão/janela atual
- **NUNCA** incluir arquivos staged de sessões anteriores - ignorá-los completamente
- Usar `git commit -- <arquivos>` para commitar apenas arquivos específicos da sessão quando necessário

### Commits de Correção de Erros Próprios:
- Quando o commit for para corrigir erros que EU (Claude) gerei no próprio chat, o comentário do commit deve explicar:
  1. **O que eu fiz de errado** (ex: usei nome de propriedade incorreto)
  2. **O que fiz para consertar** (ex: corrigi para o nome correto da propriedade)

## Regras de CSS

### Onde colocar alterações de CSS:
- **CSS Local (no arquivo .cshtml da página)**: Quando o estilo será usado em apenas UMA página
- **CSS Global (frotix.css)**: Quando o estilo será usado em MAIS DE UMA página

## Regras de Ícones

### Ícone padrão para botões "Voltar à Lista":
- O ícone dos botões "Voltar à Lista" e semelhantes é **sempre**: `fa-duotone fa-rotate-left icon-space icon-rotate-left`
- **NUNCA** alterar este ícone para outro (como fa-arrow-left)

## Regras de Botões

### Botão "Voltar à Lista" - Localização determina a classe:
- **No Header da página** (dentro de `ftx-card-header`, `ftx-card-actions`, ou similar): usar `btn btn-header-orange`
- **No rodapé/corpo do formulário**: usar `btn btn-voltar` (cor marrom #68432C)

## Padrão FrotiX para Páginas de Criação/Atualização (Upsert)

### Estrutura do Header:
- Container: `<div class="ftx-card-header d-flex justify-content-between align-items-center">`
- Título: `<h2 class="titulo-paginas mb-0">` com ícone `fa-duotone` (cor primária laranja #C67750, secundária branca - automático dentro do header)
- Botão "Voltar à Lista": `btn btn-header-orange` com ícone `fa-duotone fa-rotate-left icon-space icon-rotate-left` (gira continuamente)

### Botões de Ação (rodapé do formulário):

#### Botão Criar (novo registro):
- Classe: `btn btn-azul btn-submit-spin`
- Ícone: `fa-duotone fa-floppy-disk icon-space icon-pulse`
- Texto: **"Criar [Objeto]"** (ex: "Criar Viagem", "Criar Operador", "Criar Usuário")
- Comportamento: **pulsa** enquanto visível → **gira** ao clicar (processando)

#### Botão Atualizar (edição):
- Classe: `btn btn-azul btn-submit-spin`
- Ícone: `fa-duotone fa-floppy-disk icon-space icon-pulse`
- Texto: **"Atualizar [Objeto]"** (ex: "Atualizar Viagem", "Atualizar Operador", "Atualizar Usuário")
- Comportamento: **pulsa** enquanto visível → **gira** ao clicar (processando)

#### Botão Cancelar Operação:
- Classe: `btn btn-ftx-fechar`
- Ícone: `fa-duotone fa-circle-xmark icon-space icon-pulse`
- Texto: **"Cancelar Operação"**
- Comportamento: **pulsa** continuamente

### Classes CSS importantes:
| Classe | Descrição |
|--------|-----------|
| `btn-header-orange` | Botão laranja para header com borda preta e outline branco no hover |
| `btn-azul` | Botão azul para ações principais (Criar e Atualizar) |
| `btn-ftx-fechar` | Botão vinho para cancelar operação |
| `icon-pulse` | Animação de pulsação contínua no ícone |
| `icon-spin` | Animação de rotação contínua no ícone |
| `icon-rotate-left` | Animação de rotação anti-horária (para ícone de voltar) |
| `btn-submit-spin` | Classe para ativar spinning no ícone ao clicar no submit |

### JavaScript necessário para spinning ao clicar:
```javascript
document.querySelectorAll('.btn-submit-spin').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.classList.remove('icon-pulse');
            icon.classList.add('icon-spin');
        }
    });
});
```
