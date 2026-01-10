# AlertasBackgroundService.cs

## Visão Geral
Serviço de **background** (`BackgroundService`) que verifica e envia alertas agendados via SignalR. Executa verificação a cada minuto e envia notificações em tempo real para usuários conectados.

## Localização
`Services/AlertasBackgroundService.cs`

## Dependências
- `Microsoft.Extensions.Hosting` (`BackgroundService`)
- `Microsoft.AspNetCore.SignalR` (`IHubContext<AlertasHub>`)
- `Microsoft.Extensions.DependencyInjection` (`IServiceProvider`)
- `FrotiX.Hubs` (`AlertasHub`)
- `FrotiX.Repository.IRepository` (`IUnitOfWork`, `IAlertasFrotiXRepository`)
- `FrotiX.Models` (`TipoAlerta`)

## Características

### Background Service
- Herda de `BackgroundService` (implementação base de `IHostedService`)
- Executa em thread separada
- Não bloqueia inicialização da aplicação

### Timer-Based
- Verifica alertas a cada **1 minuto**
- Usa `Timer` do .NET para execução periódica

### SignalR Integration
- Envia notificações em tempo real via `AlertasHub`
- Notifica usuários específicos (`Clients.User(usuarioId)`)

---

## Métodos Principais

### `ExecuteAsync(CancellationToken)`
**Propósito**: Inicia o serviço de alertas.

**Fluxo**:
1. Registra log de inicialização
2. Cria `Timer` que executa `VerificarAlertasAgendados` a cada minuto
3. Inicia imediatamente (`TimeSpan.Zero`)
4. Repete a cada 1 minuto

**Complexidade**: Baixa

---

### `VerificarAlertasAgendados(object state)` (privado, async void)
**Propósito**: Verifica alertas agendados e envia notificações.

**Fluxo**:
1. Cria escopo de serviços isolado
2. Obtém `IAlertasFrotiXRepository` e `IUnitOfWork`
3. Busca alertas para notificar via `GetAlertasParaNotificarAsync()`
4. Para cada alerta:
   - Filtra usuários não notificados (`!au.Notificado && !au.Lido`)
   - Para cada usuário:
     - Envia notificação via SignalR (`NovoAlerta`)
     - Marca como notificado (`au.Notificado = true`)
   - Salva alterações (`SaveAsync()`)
5. Verifica alertas expirados via `VerificarAlertasExpirados()`

**Payload SignalR**:
```csharp
{
    alertaId: Guid,
    titulo: string,
    descricao: string,
    tipo: TipoAlerta,
    prioridade: string,
    iconeCss: string,      // Ex: "fa-duotone fa-calendar-check"
    corBadge: string,      // Ex: "#0ea5e9"
    textoBadge: string,    // Ex: "Agendamento"
    dataInsercao: DateTime
}
```

**Complexidade**: Média-Alta (consultas ao banco + SignalR)

---

### `VerificarAlertasExpirados(IUnitOfWork, IAlertasFrotiXRepository)` (privado)
**Propósito**: Desativa alertas que passaram da data de expiração.

**Fluxo**:
1. Busca alertas ativos com `DataExpiracao < agora`
2. Marca como inativos (`Ativo = false`)
3. Atualiza via `alertasRepo.Update()`
4. Salva alterações
5. Registra log com quantidade desativada

**Complexidade**: Média (consulta e atualização)

---

### `StopAsync(CancellationToken)`
**Propósito**: Para o serviço graciosamente.

**Fluxo**:
1. Registra log de finalização
2. Para o timer (`Change(Timeout.Infinite, 0)`)
3. Dispose do timer
4. Chama `base.StopAsync()`

**Complexidade**: Baixa

---

## Métodos Auxiliares

### `ObterIconePorTipo(TipoAlerta tipo)`
Retorna classe CSS do FontAwesome baseada no tipo:
- `Agendamento`: `"fa-duotone fa-calendar-check"`
- `Manutencao`: `"fa-duotone fa-screwdriver-wrench"`
- `Motorista`: `"fa-duotone fa-id-card-clip"`
- `Veiculo`: `"fa-duotone fa-car-bus"`
- `Anuncio`: `"fa-duotone fa-bullhorn"`
- `Default`: `"fa-duotone fa-circle-info"`

---

### `ObterCorPorTipo(TipoAlerta tipo)`
Retorna cor hexadecimal do badge:
- `Agendamento`: `"#0ea5e9"` (azul)
- `Manutencao`: `"#f59e0b"` (laranja)
- `Motorista`: `"#14b8a6"` (verde-água)
- `Veiculo`: `"#7c3aed"` (roxo)
- `Anuncio`: `"#dc2626"` (vermelho)
- `Default`: `"#6c757d"` (cinza)

---

### `ObterTextoPorTipo(TipoAlerta tipo)`
Retorna texto do badge:
- `Agendamento`: `"Agendamento"`
- `Manutencao`: `"Manutenção"`
- `Motorista`: `"Motorista"`
- `Veiculo`: `"Veículo"`
- `Anuncio`: `"Anúncio"`
- `Default`: `"Diversos"`

---

## Contribuição para o Sistema FrotiX

### 🔔 Notificações em Tempo Real
- Usuários recebem alertas instantaneamente via SignalR
- Não precisam recarregar página ou fazer polling
- Melhora experiência do usuário

### ⏰ Agendamento
- Alertas podem ser agendados para datas futuras
- Sistema verifica e envia automaticamente
- Desativa alertas expirados automaticamente

### 🎨 Personalização Visual
- Ícones, cores e textos personalizados por tipo
- Facilita identificação rápida do tipo de alerta
- Consistência visual com o resto da aplicação

### 👥 Notificação Seletiva
- Notifica apenas usuários não notificados
- Evita spam de notificações
- Rastreia status de notificação e leitura

## Observações Importantes

1. **Async Void**: O método `VerificarAlertasAgendados` é `async void`, o que pode causar problemas se houver exceções não tratadas. Considere usar `async Task` e tratar exceções adequadamente.

2. **Escopo de Serviços**: Usa `IServiceProvider.CreateScope()` para criar escopo isolado. Isso é necessário porque `IUnitOfWork` é scoped.

3. **Timer Thread Safety**: O `Timer` executa em thread pool. Garanta que operações sejam thread-safe.

4. **Error Handling**: Cada alerta é processado individualmente com try-catch. Se um alerta falhar, os outros continuam sendo processados.

5. **Performance**: Verifica alertas a cada minuto. Se houver muitos alertas, pode impactar performance. Considere otimizar consulta ou aumentar intervalo.

6. **SignalR Connection**: Se usuário não estiver conectado ao SignalR, notificação será perdida. Considere armazenar notificações pendentes para entrega quando conectar.

## Registro no DI Container

```csharp
// Startup.cs ou Program.cs
services.AddHostedService<AlertasBackgroundService>();
```

## Arquivos Relacionados
- `Hubs/AlertasHub.cs`: Hub SignalR para notificações
- `Repository/IRepository/IAlertasFrotiXRepository.cs`: Repositório de alertas
- `Models/AlertasFrotiX.cs`: Entidade de alerta
- `Models/TipoAlerta.cs`: Enum de tipos de alerta
