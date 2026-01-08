# Documentação: Contrato (Funcionalidade)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Listagem (Index)](#listagem-index)
4. [Cadastro/Edição (Upsert)](#cadastroedicao-upsert)
5. [Itens do Contrato](#itens-do-contrato)
6. [Endpoints API](#endpoints-api)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O módulo de **Contratos** gerencia os acordos firmados com fornecedores. É um dos módulos mais complexos devido à variedade de tipos de contrato (Locação, Terceirização, Serviços) e suas regras específicas de faturamento e itens associados.

### Características Principais
- ✅ **Tipos de Contrato**: Suporte a Locação (veículos), Terceirização (mão de obra) e Serviços.
- ✅ **Gestão de Vigência**: Controle de datas de início, fim e prorrogações.
- ✅ **Repactuação**: Histórico de alterações de valores e itens (Aditivos).
- ✅ **Itens do Contrato**: Página dedicada para visualizar e gerenciar o que foi contratado (veículos, motoristas, etc.).
- ✅ **Terceirização**: Configuração detalhada de cargos (Encarregados, Operadores, Motoristas, Lavadores) com custos unitários.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Contrato/
│       ├── Index.cshtml             # Listagem
│       ├── Upsert.cshtml            # Formulário Principal
│       ├── ItensContrato.cshtml     # Gestão detalhada de itens
│
├── Controllers/
│   └── ContratoController.cs        # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       ├── contrato.js          # Lógica da Listagem
│   │       ├── itenscontrato.js     # Lógica dos Itens
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **Syncfusion Grid** | Tabela de itens dentro do Upsert |
| **Syncfusion Dropdown** | Seletores de itens |
| **jQuery InputMask** | Máscaras de moeda |
| **Bootstrap 5** | Tabs e Modais (ItensContrato) |

---

## Listagem (Index)

Exibe os contratos cadastrados com filtros e status.

### Colunas Principais
- Contrato / Processo
- Objeto
- Empresa (Fornecedor)
- Vigência
- Valores (Anual/Mensal)
- Status

---

## Cadastro/Edição (Upsert)

A página `Upsert.cshtml` adapta-se dinamicamente ao **Tipo de Contrato** selecionado.

### Lógica Condicional por Tipo
1. **Locação**:
   - Exibe grid `grdVeiculos` para adicionar veículos contratados.
   - Calcula total baseado na quantidade * valor unitário.
2. **Terceirização**:
   - Exibe seção `#divTerceirizacao` com checkboxes para cargos (Encarregado, Operador, etc.).
   - Habilita campos de quantidade e custo mensal para cada cargo selecionado.
3. **Serviços**:
   - Formulário simplificado focado no valor global.

### Repactuação
Em modo de edição, permite selecionar uma repactuação (aditivo) para visualizar os valores históricos daquela versão do contrato.

```javascript
$('#lstRepactuacao').on('change', function () {
    // Carrega dados da repactuação selecionada via AJAX
    // Atualiza grids e valores na tela
});
```

---

## Itens do Contrato

A página `ItensContrato.cshtml` oferece uma visão operacional dos itens.

### Funcionalidades
- **Switch Contrato/Ata**: Alterna entre contratos formais e atas de registro de preço.
- **Abas de Categoria**: Separa Veículos, Encarregados, Motoristas, etc. em abas.
- **Contadores**: Mostra quantidade contratada vs. quantidade ativa no sistema.
- **Ações**: Incluir/Excluir itens do contrato (ex: vincular um novo carro ao contrato de locação).

---

## Endpoints API

### POST `/api/Contrato/InsereContrato`
Cria um novo contrato e sua repactuação inicial.

### POST `/api/Contrato/EditaContrato`
Atualiza dados cadastrais do contrato.

### POST `/api/Contrato/InsereItemContrato`
Adiciona um item (ex: veículo) a uma repactuação específica.

### GET `/api/GridContrato/DataSource`
Retorna os itens de veículo para o grid do Syncfusion.

---

## Troubleshooting

### Grid de Veículos não salva
**Causa**: O evento de salvar do Syncfusion Grid não está acionando o endpoint correto ou erro de validação.
**Solução**: Verifique se `api/Contrato/InsereItemContrato` está sendo chamado no loop de inserção do JavaScript `InsereRegistro`.

### Valores de Terceirização zerados
**Causa**: Os checkboxes de cargos não foram marcados ou os inputs estavam desabilitados no momento do submit.
**Solução**: O JS deve habilitar os campos antes de serializar ou pegar os valores diretamente dos inputs mesmo desabilitados (se for lógica de visualização).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do módulo de Contratos, incluindo Upsert complexo e gestão de Itens.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
