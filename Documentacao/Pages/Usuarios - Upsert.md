# Documentação: Usuarios - Upsert

> **Última Atualização**: 08/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Frontend](#frontend)
4. [Endpoints API](#endpoints-api)
5. [Validações](#validações)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

Página de criação e edição de usuários do sistema FrotiX. Permite cadastrar novos usuários ou editar informações de usuários existentes, incluindo dados pessoais, foto e configurações de acesso.

### Características Principais
- ✅ **Criação e Edição**: Formulário único para criar novos usuários ou editar existentes
- ✅ **Validações Automáticas**: Formatação automática de campos (Ponto, Nome, Email, Celular)
- ✅ **Upload de Foto**: Suporte para upload de foto do usuário (JPG, PNG, GIF - máx 2MB)
- ✅ **Validações Frontend e Backend**: Validações em tempo real no frontend e validações de segurança no backend
- ✅ **Integração com Identity**: Usa ASP.NET Core Identity para autenticação

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/Usuarios/Upsert.cshtml
├── Pages/Usuarios/Upsert.cshtml.cs
```

### Informações de Roteamento

- **Módulo**: `Usuarios`
- **Página**: `Upsert`
- **Rota (Razor Pages)**: `/<convenção Razor Pages>`
- **@model**: `FrotiX.Pages.Usuarios.UpsertModel`

---

## Frontend

### Assets referenciados na página

- **CSS** (2):
  - `~/css/dropify.min.css`
  - `~/css/ftx-card-styled.css`
- **JS** (1):
  - `~/js/dropify.min.js`

### Observações detectadas
- Contém `@section ScriptsBlock`.
- Contém `@section HeadBlock`.

---

## Endpoints API

> **TODO**: Listar endpoints consumidos pela página e incluir trechos reais de código do Controller/Handler quando aplicável.

---

## Upload de Foto

### Foto Padrão

Quando um usuário é criado ou atualizado sem foto, o sistema utiliza automaticamente a imagem padrão localizada em:
```
/wwwroot/Images/sucesso_transparente.png
```

**Comportamento**:
- **Criação**: Ao abrir a página para criar novo usuário, a foto padrão já é exibida
- **Inserção sem foto**: Se o usuário não enviar foto ao criar, a foto padrão é salva automaticamente
- **Edição sem foto**: Se o usuário não tiver foto e não enviar uma nova, a foto padrão é salva
- **Remoção de foto**: Se o usuário remover a foto no Dropify, volta para a foto padrão

**Código Backend**:

```csharp
private byte[] CarregarFotoPadrao()
{
    string caminhoFotoPadrao = Path.Combine(_hostingEnvironment.WebRootPath, "Images", "sucesso_transparente.png");
    if (System.IO.File.Exists(caminhoFotoPadrao))
    {
        return System.IO.File.ReadAllBytes(caminhoFotoPadrao);
    }
    return null;
}

// No OnPostSubmit
byte[] fotoBytes = null;
if (FotoUpload != null && FotoUpload.Length > 0)
{
    // Processa foto enviada
    fotoBytes = /* ... */;
}
else
{
    // Usa foto padrão se não houver foto enviada
    fotoBytes = CarregarFotoPadrao();
}
```

**Código Frontend**:

```javascript
// Quando Dropify remove o arquivo, volta para a foto padrão
dropifyInstance.on('dropify.afterClear', function() {
    imgPreview.src = '/Images/sucesso_transparente.png';
    imgPreview.classList.remove('d-none');
});
```

---

## Validações

> **TODO**: Listar validações do frontend e backend (com trechos reais do código).

---

## Troubleshooting

### Problema: Campo Ponto não está formatando corretamente

**Sintoma**: O campo Ponto não está sendo formatado como `p_XXXX` ao perder o foco.

**Causa Possível**: JavaScript não está sendo carregado ou há erro no console.

**Solução**: 
1. Verificar se o arquivo `dropify.min.js` está sendo carregado
2. Verificar console do navegador para erros JavaScript
3. Verificar se os IDs dos campos estão corretos (`txtPonto`, `txtUserName`)

---

### Problema: Email não está sendo validado corretamente

**Sintoma**: Email aceita domínios diferentes de @camara.leg.br.

**Causa Possível**: Validação frontend não está sendo aplicada ou backend não está validando.

**Solução**:
1. Verificar se o evento `blur` está sendo disparado no campo email
2. Verificar se a validação backend está sendo executada no `OnPostSubmit`/`OnPostEdit`
3. Verificar se `ModelState.IsValid` está sendo checado antes de salvar

---

### Problema: Celular não aceita formato correto

**Sintoma**: Celular não está sendo formatado como `(xx) xxxx-xxxx`.

**Causa Possível**: Máscara JavaScript não está sendo aplicada.

**Solução**:
1. Verificar se o evento `input` está sendo disparado
2. Verificar se o regex de validação está correto: `/^\(\d{2}\) \d{4}-\d{4}$/`
3. Verificar se a classe `is-invalid` está sendo aplicada quando formato está incorreto

---

### Problema: Dropify mostra mensagem invertida

**Sintoma**: A mensagem "Arraste ou clique para selecionar" aparece com o texto acima do ícone.

**Causa Possível**: CSS do Dropify não está configurado corretamente.

**Solução**: Verificar se o CSS customizado está aplicando `flex-direction: column` e `order` corretamente nos elementos do Dropify.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Correção do Dropify (nome de arquivo e tooltip)

**Descrição**:
- ✅ Corrigido problema que mostrava nome de arquivo estranho (caracteres base64) no Dropify
- ✅ Removidas tooltips nativas do Dropify que não seguiam o padrão FrotiX
- ✅ Adicionado CSS para ocultar `.dropify-filename` 
- ✅ Configurado template customizado do Dropify para não mostrar nome do arquivo
- ✅ Adicionado JavaScript para remover atributos `title` após inicialização

**Padrão FrotiX de Tooltips**:
- Usar atributo `data-ejtip="Texto do tooltip"` nos elementos
- Sistema global de tooltips em `/wwwroot/js/syncfusion_tooltips.js`
- Estilo definido em `/wwwroot/css/frotix.css`
- NÃO usar `title` ou tooltips nativos de componentes

**Arquivos Modificados**:
- `Pages/Usuarios/Upsert.cshtml` - CSS e JavaScript do Dropify ajustados

**Status**: ✅ **Concluído**

---

## [08/01/2026] - Implementação de Foto Padrão

**Descrição**:
- ✅ Implementada funcionalidade de foto padrão (`/Images/sucesso_transparente.png`)
- ✅ Foto padrão é carregada automaticamente ao criar novo usuário
- ✅ Foto padrão é usada quando não há foto informada na inserção ou atualização
- ✅ Foto padrão é restaurada quando usuário remove foto no Dropify
- ✅ Método `CarregarFotoPadrao()` criado para carregar imagem padrão do sistema de arquivos

**Arquivos Modificados**:
- `Pages/Usuarios/Upsert.cshtml.cs` - Adicionado método `CarregarFotoPadrao()` e lógica para usar foto padrão
- `Pages/Usuarios/Upsert.cshtml` - Atualizado HTML e JavaScript para exibir foto padrão
- `Documentacao/Pages/Usuarios - Upsert.md` - Documentação atualizada

**Status**: ✅ **Concluído**

---

## [08/01/2026] - Implementação de Validações e Melhorias

**Descrição**:
- ✅ Adicionadas validações `MaxLength`/`StringLength` no modelo `AspNetUsers` baseado nos tamanhos do banco de dados
- ✅ Corrigida formatação do campo Ponto para `p_XXXX` (minúsculo) ao perder foco
- ✅ Implementada sincronização automática entre Ponto e Login
- ✅ Adicionada validação de Ramal como apenas numérico (0-99999)
- ✅ Implementada validação de Email obrigatoriamente terminando em @camara.leg.br
- ✅ Implementada validação de Celular no formato (xx) xxxx-xxxx obrigatório
- ✅ Corrigido CSS do Dropify para exibir mensagem corretamente
- ✅ Adicionadas validações no backend (`OnPostSubmit` e `OnPostEdit`)
- ✅ Atualizada documentação completa com todas as validações

**Arquivos Modificados**:
- `Models/Cadastros/AspNetUsers.cs` - Adicionadas validações Data Annotations
- `Pages/Usuarios/Upsert.cshtml` - Corrigido JavaScript e CSS
- `Pages/Usuarios/Upsert.cshtml.cs` - Adicionadas validações backend
- `Documentacao/Pages/Usuarios - Upsert.md` - Documentação completa

**Status**: ✅ **Concluído**

---

## [08/01/2026 18:24] - Criação automática da documentação (stub)

**Descrição**:
- Criado esqueleto de documentação automaticamente a partir da estrutura de arquivos e referências encontradas na página.

**Status**: ✅ **Substituído pela versão completa**
