# Documentação: AgendaController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `AgendaController` é um dos controllers mais complexos do sistema FrotiX. Gerencia o sistema completo de agendamento de viagens, incluindo agendamentos recorrentes, transformação de agendamentos em viagens, e integração com calendário FullCalendar.

**Principais características:**

✅ **Agendamentos Recorrentes**: Suporta recorrência diária, semanal, quinzenal e mensal  
✅ **Dias da Semana**: Permite seleção de dias específicos (segunda a domingo)  
✅ **Transformação**: Converte agendamentos em viagens abertas/realizadas  
✅ **Calendário**: Integração com FullCalendar via `ViewViagensAgenda`  
✅ **Validações Complexas**: Verifica conflitos, datas e status  
✅ **Estatísticas**: Atualiza estatísticas após transformação em viagem realizada  
✅ **Timezone**: Ajuste de -3 horas para timezone brasileiro

**⚠️ CRÍTICO**: Qualquer alteração afeta o sistema de agendamento e calendário.

---

## Endpoints API

### GET `/api/Agenda/CarregaViagens`

**Descrição**: **ENDPOINT PRINCIPAL** - Carrega viagens/agendamentos para exibição no calendário FullCalendar

**Parâmetros**: 
- `start` (DateTime) - Data início do período
- `end` (DateTime) - Data fim do período

**Lógica**:
1. Ajusta período com -3 horas (timezone brasileiro)
2. Busca em `ViewViagensAgenda` com filtro de data
3. Processa dados para formato FullCalendar
4. Calcula `end` como `start + 1 hora`

**Response**:
```json
{
  "data": [
    {
      "id": "guid-viagem-id",
      "title": "Viagem para Centro",
      "start": "2026-01-08T10:00:00",
      "end": "2026-01-08T11:00:00",
      "backgroundColor": "#3D5771",
      "textColor": "#FFFFFF",
      "descricao": "Descrição da viagem"
    }
  ]
}
```

**Quando é chamado**: 
- Ao carregar calendário na página `Pages/Agenda/Index.cshtml`
- Ao navegar entre meses no calendário

---

### POST `/api/Agenda/Agendamento`

**Descrição**: **ENDPOINT CRÍTICO** - Cria ou atualiza agendamento/viagem

**Request Body**: `AgendamentoViagem`

**Lógica Complexa (3 Seções)**:

#### SEÇÃO 1: Agendamentos Recorrentes Novos

**Condição**: `isNew == true && Recorrente == "S"`

**Processo**:
1. Cria primeira viagem com primeira data selecionada
2. Define `RecorrenciaViagemId` como ID da primeira viagem
3. Loop para datas adicionais selecionadas:
   - Cria viagem para cada data
   - Define `RecorrenciaViagemId` igual ao da primeira
4. Loop para intervalos (D, S, Q, M):
   - **D**: Diário (incremento 1 dia)
   - **S**: Semanal (incremento 7 dias)
   - **Q**: Quinzenal (incremento 15 dias)
   - **M**: Mensal (incremento 30 dias)
   - Cria viagens até `DataFinalRecorrencia`

**Campos Especiais**:
- `UsuarioIdAgendamento`: Preenchido automaticamente
- `DataAgendamento`: Preenchido automaticamente
- `FoiAgendamento`: `false` ao criar (só `true` quando transformar em viagem)
- `StatusAgendamento`: `true` para agendamentos

**Quando é chamado**: Ao criar novo agendamento recorrente

---

#### SEÇÃO 2: Update (Edição ou Transformação)

**Condição**: `isNew == false`

**Processo**:
1. Busca agendamento existente
2. Preserva `DataInicial` original (exceto se `Status == "Agendada"`)
3. Atualiza campos via `AtualizarDados()`
4. **Transformação em Viagem**:
   - Se `FoiAgendamento == true` e `Status == "Aberta" ou "Realizada"`:
     - Define `UsuarioIdCriacao` e `DataCriacao` (se ainda não preenchidos)
   - Se `Status == "Realizada"` e tem `DataFinal`/`HoraFim`:
     - Define `UsuarioIdFinalizacao` e `DataFinalizacao` (se ainda não preenchidos)
5. Atualiza quilometragem do veículo se `KmFinal` informado
6. Atualiza estatísticas se `Status == "Realizada"`

**Quando é chamado**: 
- Ao editar agendamento existente
- Ao transformar agendamento em viagem

---

#### SEÇÃO 3: Novo Agendamento Simples (Não Recorrente)

**Condição**: `ViagemId == Guid.Empty` e não é recorrente

**Processo**:
1. Cria nova viagem
2. Define `UsuarioIdAgendamento` e `DataAgendamento`
3. Atualiza quilometragem do veículo se necessário

**Quando é chamado**: Ao criar agendamento único (não recorrente)

---

### POST `/api/Agenda/ApagaAgendamento`

**Descrição**: Exclui agendamento/viagem

**Request Body**: `AgendamentoViagem` com `ViagemId`

**Response**:
```json
{
  "success": true,
  "message": "Agendamento apagado com sucesso"
}
```

---

### POST `/api/Agenda/CancelaAgendamento`

**Descrição**: Cancela agendamento (não exclui, apenas marca como cancelado)

**Request Body**: `AgendamentoViagem` com `ViagemId` e `Descricao`

**Lógica**:
- Define `Status = "Cancelada"`
- Define `UsuarioIdCancelamento` e `DataCancelamento`
- Atualiza descrição

---

### GET `/api/Agenda/ObterAgendamento`

**Descrição**: Obtém agendamento específico por ID

**Parâmetros**: `viagemId` (Guid)

**Response**: Objeto `Viagem` completo

---

### GET `/api/Agenda/VerificarAgendamento`

**Descrição**: Verifica se existe agendamento em data/hora específica

**Parâmetros**:
- `data` (string) - Data no formato parseável
- `horaInicio` (string opcional) - Hora no formato TimeSpan
- `viagemIdRecorrente` (Guid opcional) - ID de recorrência

**Response**:
```json
{
  "existe": true
}
```

**Uso**: Para validação de conflitos antes de criar agendamento

---

### GET `/api/Agenda/GetDatasViagem`

**Descrição**: Obtém todas as datas de uma recorrência

**Parâmetros**:
- `viagemId` (Guid)
- `recorrenciaViagemId` (Guid opcional)
- `editarProximos` (bool) - Se true, retorna apenas datas futuras

**Response**: Lista de `DateTime` ordenadas

---

### GET `/api/Agenda/BuscarViagensRecorrencia`

**Descrição**: Busca viagens de uma recorrência (otimizado)

**Parâmetros**: `id` (Guid) - ID da recorrência ou viagem

**Response**: Lista de viagens com campos reduzidos

**Otimizações**:
- Usa `AsNoTracking` para performance
- Projeta apenas campos necessários
- Limita a 100 registros
- Filtra canceladas

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Agenda/Index.cshtml` - Interface principal de calendário
- **JavaScript**: FullCalendar via AJAX

### O Que Este Controller Chama

- **`_context.ViewViagensAgenda`**: View otimizada para calendário
- **`_unitOfWork.Viagem`**: CRUD de viagens/agendamentos
- **`_unitOfWork.Veiculo`**: Atualização de quilometragem
- **`_viagemEstatisticaService`**: Atualização de estatísticas
- **`User.FindFirst(ClaimTypes.NameIdentifier)`**: ID do usuário logado

---

## Notas Importantes

1. **Timezone**: Ajuste de -3 horas para timezone brasileiro
2. **Recorrência**: Sistema complexo com múltiplos loops e validações
3. **Transformação**: Lógica específica para transformar agendamento em viagem
4. **FoiAgendamento**: Campo crítico para rastrear origem do agendamento
5. **Estatísticas**: Atualizadas automaticamente ao transformar em viagem realizada

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do AgendaController

**Arquivos Afetados**:
- `Controllers/AgendaController.cs`

**Impacto**: Documentação de referência para sistema de agendamento

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
