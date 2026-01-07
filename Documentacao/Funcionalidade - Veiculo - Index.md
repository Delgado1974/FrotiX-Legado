# Documentação: Gestão de Veículos (Index)

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
6. [Validações](#validações)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Gestão de Veículos** é a listagem principal de todos os veículos cadastrados no sistema FrotiX. Ela permite visualizar, filtrar, adicionar, editar, excluir e alterar o status (ativo/inativo) dos veículos.

### Características Principais

- ✅ **Listagem Completa**: Exibe todos os veículos com informações essenciais.
- ✅ **DataTable Interativo**: Paginação, ordenação e pesquisa rápida.
- ✅ **Ações Rápidas**: Edição e exclusão direta na linha do registro.
- ✅ **Toggle de Status**: Ativar/Desativar veículo com um clique.
- ✅ **Feedback Visual**: Toasts de sucesso/erro e confirmação para ações destrutivas.
- ✅ **Proteção de Integridade**: Impede exclusão de veículos com vínculos (Contratos, Viagens).

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Veiculo/
│       └── Index.cshtml             # Página principal (HTML + CSS inline)
│
├── Controllers/
│   └── VeiculoController.cs         # Endpoints da API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── veiculo_index.js     # Lógica do DataTable e ações
│   └── css/
│       └── frotix.css               # Estilos globais
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização da página |
| **jQuery DataTables** | Grid de listagem avançada |
| **Bootstrap 5** | Layout e componentes visuais |
| **Font Awesome Duotone** | Ícones |
| **SweetAlert2** | Modais de confirmação |
| **Toastr** | Notificações flutuantes |

---

## Funcionalidades Específicas

### 1. Listagem de Veículos
Utiliza o plugin DataTables para exibir os dados retornados pela API.

**Colunas Exibidas:**
1. **Placa**: Identificador visual do veículo.
2. **Marca/Modelo**: Descrição combinada.
3. **Contrato**: Origem do veículo (ex: Contrato X, Próprio).
4. **Sigla**: Sigla da unidade vinculada.
5. **Combustível**: Tipo de combustível principal.
6. **Consumo**: Média de consumo (km/l).
7. **Km**: Quilometragem atual.
8. **Reserva**: Indicador se é veículo reserva.
9. **Status**: Botão interativo (Ativo/Inativo).
10. **Ação**: Botões de Editar e Excluir.

### 2. Alterar Status (Ativo/Inativo)
Permite alterar o status do veículo diretamente na grid.
- **Visual**: Botão Verde (Ativo) ou Cinza (Inativo).
- **Comportamento**: Clique dispara requisição AJAX para alternar status.
- **Feedback**: Atualiza a cor e ícone do botão instantaneamente após sucesso.

### 3. Exclusão de Veículo
Permite remover um veículo do sistema, desde que não possua vínculos impeditivos.
- **Fluxo**: Clique no ícone de lixeira → Confirmação SweetAlert → Requisição API.
- **Validação Backend**: Verifica se existe vínculo com Contratos ou Viagens.

---

## Endpoints API

**Base URL**: `/api/Veiculo`

### 1. GET `/api/Veiculo`
Retorna a lista de todos os veículos para popular o DataTable.

**Response (JSON)**:
```json
{
  "data": [
    {
      "veiculoId": "uuid",
      "placa": "ABC1234",
      "marcaModelo": "Ford / Ka",
      "origemVeiculo": "Contrato 123",
      "sigla": "ADM",
      "descricao": "Gasolina",
      "consumo": 12.5,
      "quilometragem": 50000,
      "veiculoReserva": "Não",
      "status": true,
      // ... outros campos
    }
  ]
}
```

### 2. POST `/api/Veiculo/Delete`
Remove um veículo do banco de dados.

**Body**:
```json
{
  "VeiculoId": "uuid-do-veiculo"
}
```

**Response (Sucesso)**:
```json
{
  "success": true,
  "message": "Veículo removido com sucesso"
}
```

**Response (Erro - Vínculo Encontrado)**:
```json
{
  "success": false,
  "message": "Não foi possível remover o veículo. Ele está associado a uma ou mais viagens!"
}
```

### 3. GET `/api/Veiculo/UpdateStatusVeiculo`
Alterna o status do veículo (toggle).

**Parâmetros**:
- `Id`: UUID do veículo

**Response**:
```json
{
  "success": true,
  "message": "Atualizado Status do Veículo [Nome: ABC1234] (Inativo)",
  "type": 1 // 1 = Inativo, 0 = Ativo
}
```

---

## Frontend

### Estrutura HTML Principal
```html
<table id="tblVeiculo" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Placa</th>
            <th>Marca/Modelo</th>
            <!-- ... -->
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

### JavaScript (`veiculo_index.js`)

**Inicialização do DataTable**:
```javascript
dataTable = $("#tblVeiculo").DataTable({
    ajax: {
        url: "/api/veiculo",
        type: "GET",
        datatype: "json"
    },
    columns: [
        { data: "placa" },
        // ... configurações de colunas e renders customizados
    ],
    // ...
});
```

**Renderização de Status (Custom Render)**:
```javascript
render: function (data, type, row, meta) {
    if (data) {
        return `<a ... class="btn btn-verde ...">Ativo</a>`;
    } else {
        return `<a ... class="btn fundo-cinza ...">Inativo</a>`;
    }
}
```

---

## Validações

### Validações de Exclusão (Backend)
O sistema impede a exclusão física do registro se houver integridade referencial a ser mantida:

1. **Vínculo com Contratos**: Verifica tabela `VeiculoContrato`.
   - *Mensagem*: "Não foi possível remover o veículo. Ele está associado a um ou mais contratos!"
2. **Vínculo com Viagens**: Verifica tabela `Viagem`.
   - *Mensagem*: "Não foi possível remover o veículo. Ele está associado a uma ou mais viagens!"

---

## Troubleshooting

### Problema: Botão de Excluir exibe erro genérico
**Sintoma**: Ao tentar excluir, aparece toast vermelho "Algo deu errado".
**Causa**: Exceção não tratada no servidor ou falha de rede.
**Solução**: Verificar logs do servidor (`LogErros`).

### Problema: Status não muda visualmente
**Sintoma**: Clica no botão de status, toast de sucesso aparece, mas botão não muda de cor.
**Causa**: Falha na manipulação do DOM no callback `success` do AJAX.
**Verificação**:
```javascript
// O código espera que 'this' seja o elemento clicado, mas no callback do $.get o contexto pode mudar se não for salvo antes
var currentElement = $(this); // Isso é feito corretamente no código atual
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de listagem de veículos (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
