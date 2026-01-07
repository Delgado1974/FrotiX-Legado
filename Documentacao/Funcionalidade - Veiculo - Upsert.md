# Documentação: Cadastro de Veículo (Upsert)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades Específicas](#funcionalidades-específicas)
4. [Frontend](#frontend)
5. [Validações](#validações)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Cadastro de Veículo (Upsert)** é responsável pela criação (Insert) e atualização (Update) dos registros de veículos no sistema. O termo "Upsert" refere-se à capacidade da página de lidar com ambas as operações. Ela apresenta um formulário detalhado, dividido em seções lógicas, com validações dinâmicas e carregamento assíncrono de dependências.

### Características Principais

- ✅ **Formulário Completo**: Cadastro de todas as características técnicas, legais e administrativas do veículo.
- ✅ **Carregamento em Cascata**: Seleção de Marca carrega Modelos; Contrato carrega Itens.
- ✅ **Upload de CRLV**: Envio direto de arquivo PDF/Imagem do documento do veículo.
- ✅ **Log de Auditoria**: Exibe quem criou/alterou o registro e quando (apenas edição).
- ✅ **Validações Dinâmicas**: Regras mudam conforme o tipo de vínculo (Contrato, Ata ou Próprio).
- ✅ **Verificação de Duplicidade**: Alerta em tempo real se a placa já existe.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Veiculo/
│       ├── Upsert.cshtml            # Interface (HTML Razor)
│       └── Upsert.cshtml.cs         # Lógica Backend (PageModel)
│
├── Controllers/
│   └── VeiculoController.cs         # Alguns endpoints auxiliares (se houver)
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── veiculo_upsert.js    # Lógica Frontend (jQuery)
│   └── css/
│       └── frotix.css               # Estilos globais
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **Razor Pages** | Renderização server-side e binding de dados (`OnGet`, `OnPost`) |
| **AJAX (jQuery)** | Carregamento dinâmico de listas (Modelos, Itens) |
| **ASP.NET Core Validation** | Validação no servidor (ModelState) |
| **Notyf** | Notificações toast (Sucesso/Erro) |
| **Input File** | Upload de arquivo multipart/form-data |

---

## Funcionalidades Específicas

### 1. Seção: Identificação do Veículo
- **Marca/Modelo**: Dropdowns encadeados. Ao selecionar Marca, busca Modelos via AJAX.
- **Placa**: Campo com máscara e formatação automática (uppercase, sem hífens). Valida duplicidade ao sair do campo (`focusout`).

### 2. Seção: Documentação
- **Renavam**: Campo numérico.
- **Ano Fabricação/Modelo**: Dropdowns com anos gerados dinamicamente (2003 até ano atual + 1).
- **Upload CRLV**:
    - Aceita PDF, JPG, PNG (Max 10MB).
    - Mostra nome do arquivo selecionado.
    - Em edição, permite "Substituir CRLV" ou manter o atual.

### 3. Seção: Origem do Veículo
Define como o veículo entrou na frota. O comportamento dos campos muda dinamicamente:
- **Contrato**: Habilita seleção de Item Contratual. Desabilita Ata e Patrimônio.
- **Ata de Registro**: Habilita seleção de Item da Ata. Desabilita Contrato e Patrimônio.
- **Veículo Próprio**: Habilita campo Patrimônio. Desabilita Contrato e Ata.

*Lógica Frontend*: Controlada pela função `toggleCamposVeiculoProprio` e eventos `change` nos dropdowns.

### 4. Seção: Configurações
Checkboxes booleanos para flags do sistema:
- **Veículo Próprio**: Ativa modo de veículo próprio.
- **Ativo/Inativo**: Define status inicial.
- **Veículo Reserva**: Marca como reserva técnica.
- **Veículo de Economildo**: Flag específica para projeto Economildo.

---

## Frontend

### JavaScript (`veiculo_upsert.js`)

**Carregamento de Listas (Cascata)**:
```javascript
function GetModeloList(marcaId) {
    $.ajax({
        url: "/Veiculo/Upsert?handler=ModeloList",
        data: { id: marcaId },
        success: function (res) {
             // Popula dropdown #ModeloId
        }
    });
}
```

**Validação de Placa**:
```javascript
$('#txtPlaca').on('focusout', function () {
    var placa = $(this).val(); // Formata
    // ... chama handler VerificaPlaca
});
```

**Validação de Submit**:
Intercepta o submit do formulário para garantir regras de negócio no cliente antes de enviar.
```javascript
$('form').on('submit', function (e) {
    if (!validarCamposObrigatorios()) {
        e.preventDefault(); // Impede envio
        return false;
    }
});
```

---

## Validações

### Validações Backend (`Upsert.cshtml.cs`)

Além das validações de frontend, o servidor realiza verificações robustas:

1. **Campos Obrigatórios**: Placa, Marca, Modelo, Km, Unidade, Combustível, Categoria, Data Ingresso.
2. **Unicidade**:
   - **Placa**: Verifica se já existe outro veículo com a mesma placa (ignorando o próprio ID em caso de edição).
   - **Renavam**: Verifica se já existe outro veículo com o mesmo Renavam.
3. **Consistência de Vínculo**:
   - Deve ter **pelo menos um**: Contrato, Ata OU Veículo Próprio.
   - Se Contrato → Item Contratual obrigatório.
   - Se Ata → Item Ata obrigatório.
   - Se Próprio → Patrimônio obrigatório.

*Método responsável*: `ChecaInconstancias(Guid id)`

### Mensagens de Erro
As mensagens são exibidas via `_notyf` (Toastr) no canto superior direito.
- ❌ "Já existe um veículo com essa placa!"
- ❌ "Você precisa definir se o veículo é próprio ou se pertence a um Contrato ou a uma Ata!"

---

## Troubleshooting

### Problema: Modelo não carrega ao selecionar Marca
**Sintoma**: Seleciona marca "Ford", dropdown Modelo continua vazio ou com "Selecione".
**Causa Possível**: Erro no AJAX ou handler `OnGetModeloList`.
**Verificação**: Checar Console do navegador (F12) por erros 500 ou 404 na requisição `/Veiculo/Upsert?handler=ModeloList`.

### Problema: Erro ao salvar arquivo (Upload)
**Sintoma**: Formulário reseta ou exibe erro ao tentar salvar com CRLV.
**Causa Possível**: Arquivo maior que limite do servidor (IIS default ~30MB, mas verifique validação de 10MB no JS) ou permissão de pasta.
**Solução**: Verificar `FileSize` no JS e logs do servidor.

### Problema: Placa duplicada não detectada no frontend
**Sintoma**: Usuário digita placa existente e não recebe alerta, só erro ao salvar.
**Causa**: Evento `focusout` falhou ou API `VerificaPlaca` retornou erro silencioso.
**Solução**: Verificar se a função `verificarPlacaExistente` está sendo chamada.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de cadastro/edição de veículos (Upsert).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
