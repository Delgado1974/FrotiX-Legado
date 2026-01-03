# CLAUDE.md - Instruções para o Claude Code

Este arquivo contém instruções e regras específicas do projeto FrotiX para o Claude Code.

## Regras de Git

### Commit e Push:
- Quando o usuário pedir para fazer commit, **sempre fazer push automaticamente** após o commit
- Fazer commit/push apenas dos arquivos gerados ou modificados na sessão atual do terminal

### Commits de Correção de Erros Próprios:
- Quando o commit for para corrigir erros que EU (Claude) gerei no próprio chat, o comentário do commit deve explicar:
  1. **O que eu fiz de errado** (ex: usei nome de propriedade incorreto)
  2. **O que fiz para consertar** (ex: corrigi para o nome correto da propriedade)

## Regras de CSS

### Onde colocar alterações de CSS:
- **CSS Local (no arquivo .cshtml da página)**: Quando o estilo será usado em apenas UMA página
- **CSS Global (frotix.css)**: Quando o estilo será usado em MAIS DE UMA página
