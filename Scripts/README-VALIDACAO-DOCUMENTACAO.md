# Scripts de Validação de Documentação

## 📋 Visão Geral

Scripts para garantir que a documentação seja sempre atualizada quando o código é alterado.

## 🔧 Scripts Disponíveis

### 1. `ValidarDocumentacao.ps1`

Script PowerShell que valida se arquivos alterados têm documentação atualizada.

#### Uso Manual

```powershell
# Validar arquivos modificados no working directory
.\Scripts\ValidarDocumentacao.ps1

# Modo verbose (mostra todos os arquivos verificados)
.\Scripts\ValidarDocumentacao.ps1 -Verbose
```

#### Uso em Git Hook (Pre-Commit)

O script é automaticamente executado antes de cada commit através do hook `.git/hooks/pre-commit`.

#### O que o script faz:

1. ✅ Identifica arquivos alterados (`.cs`, `.cshtml`, `.js`, `.css`)
2. ✅ Verifica se existe documentação correspondente
3. ✅ Compara datas de modificação (arquivo vs documentação)
4. ✅ Alerta se documentação está desatualizada
5. ✅ Bloqueia commit se documentação não foi atualizada (modo pre-commit)

#### Saída do Script

```
╔═══════════════════════════════════════════════════════════════╗
║  Validação de Documentação - FrotiX                          ║
╚═══════════════════════════════════════════════════════════════╝

✅ Arquivos com documentação atualizada: 5
⚠️  Arquivos sem documentação: 0
❌ Arquivos com documentação desatualizada: 2

⚠️⚠️⚠️  ATENÇÃO: DOCUMENTAÇÃO DESATUALIZADA ⚠️⚠️⚠️

Arquivo: Controllers/VeiculoController.cs
  Documentação: Documentacao/Controllers/VeiculoController.md
  Arquivo modificado em: 08/01/2026 14:30:00
  Doc modificada em: 08/01/2026 10:15:00
```

## 🔄 Git Hook: Pre-Commit

### Instalação Automática

O hook é criado automaticamente quando você executa o script pela primeira vez.

### Instalação Manual

1. Copie o conteúdo de `.git/hooks/pre-commit` (se não existir)
2. Ou execute:
   ```bash
   cp Scripts/pre-commit.example .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```

### Como Funciona

1. Quando você faz `git commit`
2. O hook executa `ValidarDocumentacao.ps1 -PreCommit`
3. Se documentação estiver desatualizada, o commit é **BLOQUEADO**
4. Você deve atualizar a documentação e commitar novamente

### Desabilitar Temporariamente

```bash
# Renomear o hook temporariamente
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# Reabilitar depois
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

**⚠️ NÃO RECOMENDADO**: Desabilitar o hook pode causar documentação desatualizada.

## 🎯 Mapeamento de Arquivos para Documentações

O script usa o seguinte mapeamento:

| Arquivo | Documentação |
|---------|--------------|
| `Models/*.cs` | `Documentacao/Models/*.md` |
| `Models/Cadastros/*.cs` | `Documentacao/Models/Cadastros/*.md` |
| `Models/Views/*.cs` | `Documentacao/Models/Views/*.md` |
| `Controllers/*.cs` | `Documentacao/Controllers/*.md` |
| `Pages/*.cshtml` | `Documentacao/Pages/*.md` |
| `Services/*.cs` | `Documentacao/Services/*.md` |
| `Helpers/*.cs` | `Documentacao/Helpers/*.md` |
| `wwwroot/js/*.js` | `Documentacao/JavaScript/*.md` |

## 📝 Processo Recomendado

### Ao Alterar Código:

1. **Fazer alterações no código**
2. **Atualizar documentação imediatamente**:
   - Adicionar entrada em "PARTE 2: LOG DE MODIFICAÇÕES"
   - Atualizar seções relevantes
   - Atualizar data de "Última Atualização"
3. **Executar validação**:
   ```powershell
   .\Scripts\ValidarDocumentacao.ps1
   ```
4. **Commitar código + documentação juntos**:
   ```bash
   git add Arquivo.cs Documentacao/Arquivo.md
   git commit -m "feat: Adiciona funcionalidade X
   
   docs: Atualiza documentação de Arquivo.cs"
   ```

## ⚙️ Configuração Avançada

### Ajustar Margem de Tempo

No script `ValidarDocumentacao.ps1`, linha ~80:

```powershell
# Margem de 5 minutos (ajustável)
if ($diferenca.TotalMinutes -lt -5) {
```

Altere `-5` para o valor desejado (em minutos).

### Adicionar Novos Mapeamentos

No script `ValidarDocumentacao.ps1`, seção `$MapeamentoDocs`:

```powershell
$MapeamentoDocs = @{
    # Adicionar novo mapeamento aqui
    "NovoDiretorio/.*\.cs$" = "Documentacao/NovoDiretorio/"
}
```

## 🐛 Troubleshooting

### Erro: "Script não pode ser executado"

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Hook não está executando

1. Verificar se arquivo existe: `.git/hooks/pre-commit`
2. Verificar permissões: `chmod +x .git/hooks/pre-commit`
3. Verificar se PowerShell está no PATH

### Falsos Positivos

Se o script detectar documentação desatualizada mas você acabou de atualizar:

1. Verificar se salvou o arquivo `.md`
2. Executar novamente: `.\Scripts\ValidarDocumentacao.ps1`
3. Se persistir, verificar datas de modificação manualmente

## 📚 Referências

- [Diretrizes de Documentação](../.claude/Claude.md)
- [Índice Geral de Documentações](../Documentacao/0-INDICE-GERAL.md)
- [Índice de Models](../Documentacao/Models/0-INDICE-MODELS.md)

---

**Última atualização**: 08/01/2026  
**Versão**: 1.0
