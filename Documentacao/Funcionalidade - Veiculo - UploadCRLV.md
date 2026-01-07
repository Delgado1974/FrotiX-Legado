# Documentação: Upload de CRLV

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades Específicas](#funcionalidades-específicas)
4. [Endpoints API](#endpoints-api)
5. [Frontend](#frontend)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Upload de CRLV** é uma interface dedicada para a gestão digitalizada do Certificado de Registro e Licenciamento de Veículo (CRLV). Ela permite o upload, substituição e visualização do documento PDF associado a um veículo específico.

### Características Principais

- ✅ **Upload Assíncrono**: Uso do componente Syncfusion Uploader para envio sem refresh.
- ✅ **Visualização Integrada**: Componente Syncfusion PDF Viewer para ler o documento na própria página.
- ✅ **Persistência no Banco**: O arquivo é salvo como binário (`byte[]`) diretamente no registro do veículo.
- ✅ **Feedback Visual**: Toasts de sucesso/erro e barra de progresso.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Veiculo/
│       ├── UploadCRLV.cshtml            # Interface (HTML + Scripts inline)
│       └── UploadCRLV.cshtml.cs         # PageModel (Backend básico)
│
├── Controllers/
│   ├── UploadCRLVController.cs          # API para salvar/remover arquivo
│   └── PdfViewerController.cs           # API para servir o arquivo ao viewer
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **Syncfusion Uploader** | Componente de upload de arquivos (`ejs-uploader`) |
| **Syncfusion PDF Viewer** | Componente de visualização de PDF (`ejs-pdfviewer`) |
| **ASP.NET Core API** | Endpoints para manipulação do binário |
| **Bootstrap 5** | Layout |

---

## Funcionalidades Específicas

### 1. Upload de Arquivo
Utiliza o componente `<ejs-uploader>` configurado para aceitar apenas `.pdf`.
- **Configuração Async**: Aponta para `api/UploadCRLV/Save` e `api/UploadCRLV/Remove`.
- **Parâmetro Extra**: Envia `veiculoId` na Query String para identificar o registro.

### 2. Visualização de PDF
Utiliza o componente `<ejs-pdfviewer>`.
- **Service URL**: Aponta para `/api/PdfViewer`.
- **Carregamento Inicial**: Se o veículo já possui CRLV (`Model.CRLV == 1`), o viewer é carregado automaticamente via AJAX no `document.ready`.
- **Pós-Upload**: Após um upload bem-sucedido, o viewer é recarregado com o novo arquivo.

### 3. Remoção de Arquivo
Permite remover o arquivo atual. O componente Uploader chama o endpoint de remoção, que seta o campo `CRLV` como `null` no banco.

---

## Endpoints API

### 1. POST `/api/UploadCRLV/Save`
Recebe o arquivo e salva no banco.
- **Query Param**: `veiculoId` (Guid).
- **Body**: `UploadFiles` (List<IFormFile>).
- **Lógica**: Busca o veículo pelo ID, converte o arquivo para `byte[]` e atualiza a propriedade `CRLV`.

### 2. POST `/api/UploadCRLV/Remove`
Remove o arquivo do banco.
- **Query Param**: `veiculoId` (Guid).
- **Lógica**: Busca o veículo e define `CRLV = null`.

### 3. POST `/api/PdfViewer/GetDocument`
Recupera o documento para exibição.
- **Query Param**: `id` (Guid do veículo).
- **Retorno**: Stream do arquivo PDF.

---

## Frontend

### Scripts Inline (`UploadCRLV.cshtml`)

O script da página gerencia os eventos dos componentes Syncfusion.

**Upload Concluído (`onActionComplete`)**:
```javascript
window.onActionComplete = function(args) {
    // ... verifica sucesso ...
    // Mostra a div do viewer
    // Faz requisição AJAX para pegar o documento e carregar no viewer
    pdfViewer.ej2_instances[0].load(result, null);
};
```

**Configuração de Localização (`L10n`)**:
Define textos em português para os botões e mensagens dos componentes Uploader e PDF Viewer (ex: "Procurar...", "Baixar", "Imprimir").

---

## Troubleshooting

### Problema: "Erro ao carregar documento PDF"
**Sintoma**: Upload funciona, mas viewer fica branco ou exibe erro.
**Causa**: O endpoint `/api/PdfViewer/GetDocument` pode estar retornando erro 500 ou 404, ou o arquivo no banco está corrompido (tamanho 0).
**Solução**: Verificar se o `veiculoId` está correto na URL e se o banco contém dados na coluna `CRLV`.

### Problema: Upload falha com arquivos grandes
**Sintoma**: Erro "Falha no upload" ou "InvalidMaxFileSize".
**Causa**: Limite de tamanho de requisição no IIS ou validação do componente.
**Solução**: Verificar `web.config` (`maxAllowedContentLength`) e configuração do `ejs-uploader` (embora o código atual mostre mensagem customizada para 4MB, o limite real é definido no servidor).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de Upload de CRLV.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
