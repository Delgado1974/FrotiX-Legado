# Plano de Implementação: Validação Inteligente na Finalização de Viagem

## Resumo do Requisito

O usuário solicitou:
1. **Não permitir Data Final > Hoje** em qualquer tela de Finalização de Viagem
2. **IA para análise de Datas/Horas**: Alertas inteligentes e convincentes sobre inconsistências
3. **IA para análise de KM**: Alertas inteligentes sobre quilometragem
4. **IA Evolutiva por Veículo**: Aprender padrões de quilometragem habitual de cada veículo (placa) baseado no histórico

---

## 1. Telas Afetadas

| Tela | Arquivo | Campos |
|------|---------|--------|
| Lista Viagens (Modal Finalização) | `Pages\Viagens\Index.cshtml` | DataFinal, HoraFinal, KmFinal |
| Agenda (Modal Edição) | `Pages\Agenda\Index.cshtml` | txtDataFinal, txtHoraFinal, txtKmFinal |
| Criar/Editar Viagem | `Pages\Viagens\Upsert.cshtml` | ViagemObj.Viagem.DataFinal, KmFinal |
| Dashboard Viagens | `Pages\Viagens\DashboardViagens.cshtml` | txtDataFinalDashboard, txtKmFinalDashboard |
| Ajuste Custos | `Pages\Administracao\AjustaCustosViagem.cshtml` | txtDataFinal, txtKmFinal |

---

## 2. Arquitetura da Solução

### 2.1 Novo Serviço de Estatísticas por Veículo (Backend)

**Arquivo:** `Services/VeiculoEstatisticaService.cs`

```csharp
public class VeiculoEstatisticaService
{
    // Calcula estatísticas de km por veículo baseado no histórico
    public async Task<EstatisticaVeiculo> ObterEstatisticasAsync(Guid veiculoId)
    {
        // Busca últimas N viagens finalizadas do veículo
        // Calcula: média, mediana, desvio padrão, máximo, mínimo
    }
}
```

**Retorno:**
```json
{
    "veiculoId": "guid",
    "placa": "ABC-1234",
    "totalViagens": 150,
    "kmMedio": 45,
    "kmMediano": 42,
    "kmDesvioPadrao": 15,
    "kmMinimo": 5,
    "kmMaximo": 180,
    "duracaoMediaMinutos": 120,
    "percentil95Km": 85
}
```

### 2.2 Nova API Endpoint

**Arquivo:** `Controllers/ViagemController.cs`

```csharp
[HttpGet("EstatisticasVeiculo")]
public async Task<IActionResult> GetEstatisticasVeiculo(Guid veiculoId)
```

### 2.3 Novo Módulo JavaScript de Validação Inteligente

**Arquivo:** `wwwroot/js/validacao/ValidadorFinalizacaoIA.js`

```javascript
class ValidadorFinalizacaoIA {
    constructor() {
        this.cacheEstatisticas = new Map();
        this.tolerancia = 2.5; // 2.5 desvios padrão
    }

    // Valida Data Final não superior a hoje
    validarDataNaoFutura(dataFinal) {}

    // Analisa Data/Hora com mensagens inteligentes
    async analisarDatasHoras(dataInicial, horaInicial, dataFinal, horaFinal) {}

    // Analisa KM com contexto histórico do veículo
    async analisarKm(veiculoId, kmInicial, kmFinal) {}

    // Gera mensagem convincente baseada na análise
    gerarMensagemConvincente(tipo, dados) {}
}
```

---

## 3. Implementação Detalhada

### 3.1 Validação: Data Final Não Pode Ser Futura (Bloqueante)

**Mensagem:**
> "A Data Final não pode ser superior à data de hoje. Viagens só podem ser finalizadas com datas passadas ou de hoje."

**Implementação:** Já existe em `ViagemIndex.js` linha 2087-2097. Replicar para todas as telas.

### 3.2 Análise Inteligente de Datas/Horas

**Cenários a detectar:**

| Cenário | Condição | Mensagem de Alerta |
|---------|----------|-------------------|
| Duração muito longa | > 12 horas | "Esta viagem teria duração de X horas. O histórico mostra que viagens deste veículo duram em média Y horas. Confirma?" |
| Duração muito curta | < 5 minutos | "A duração de X minutos parece muito curta para uma viagem. Verifique os horários." |
| Hora Final < Hora Inicial (mesmo dia) | HoraFinal < HoraInicial | "A hora final (X) é anterior à hora inicial (Y). Isso não é possível no mesmo dia." |
| Viagem atravessa madrugada | DataFinal > DataInicial + 1 dia | "Esta viagem atravessa mais de 24 horas. Confirma que começou em DD/MM às HH:MM e terminou em DD/MM às HH:MM?" |
| Data muito antiga | DataFinal < 30 dias atrás | "Você está finalizando uma viagem de X dias atrás. Confirma?" |

### 3.3 Análise Inteligente de Quilometragem

**Cenários a detectar:**

| Cenário | Condição | Mensagem de Alerta |
|---------|----------|-------------------|
| KM zerado | KmFinal == KmInicial | "A quilometragem final é igual à inicial. Isso significa que o veículo não se deslocou." |
| KM negativo | KmFinal < KmInicial | "ERRO: A quilometragem final (X) é menor que a inicial (Y). Isso é impossível." |
| KM muito alto | KmRodado > 500 | "Esta viagem percorreu X km. Isso equivale a Y horas de viagem na velocidade média de 80km/h. Confirma?" |
| KM acima do padrão do veículo | KmRodado > média + 2.5*desvio | "Este veículo normalmente percorre entre A e B km por viagem. Você informou X km, que está X% acima do habitual." |

### 3.4 IA Evolutiva por Veículo

**Algoritmo:**

1. Ao abrir modal de finalização, buscar `veiculoId` da viagem
2. Chamar API `GET /api/Viagem/EstatisticasVeiculo?veiculoId=X`
3. Cachear resultado por 5 minutos
4. Usar estatísticas para calibrar alertas:
   - Se veículo tem histórico de viagens longas → tolerância maior
   - Se veículo tem histórico de viagens curtas → alertar acima do padrão
5. Calcular "pontuação de anomalia" usando Z-score

**Fórmula Z-Score:**
```
z = (kmRodado - kmMedio) / kmDesvioPadrao
Se |z| > 2.5 → alerta amarelo (confirmação)
Se |z| > 3.5 → alerta vermelho (requer justificativa)
```

---

## 4. Arquivos a Criar/Modificar

### 4.1 Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `wwwroot/js/validacao/ValidadorFinalizacaoIA.js` | Classe principal de validação inteligente |
| `Services/VeiculoEstatisticaService.cs` | Serviço de cálculo de estatísticas |
| `Models/DTOs/EstatisticaVeiculoDto.cs` | DTO para estatísticas |

### 4.2 Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `Controllers/ViagemController.cs` | Adicionar endpoint `EstatisticasVeiculo` |
| `wwwroot/js/cadastros/ViagemIndex.js` | Integrar ValidadorFinalizacaoIA |
| `wwwroot/js/agendamento/components/validacao.js` | Integrar ValidadorFinalizacaoIA |
| `Pages/Viagens/Index.cshtml` | Incluir script ValidadorFinalizacaoIA.js |
| `Pages/Agenda/Index.cshtml` | Incluir script ValidadorFinalizacaoIA.js |
| `Pages/Viagens/DashboardViagens.cshtml` | Integrar validação |
| `Pages/Administracao/AjustaCustosViagem.cshtml` | Integrar validação |

---

## 5. Mensagens Convincentes (Exemplos)

### 5.1 Duração Anômala
```
🕐 ATENÇÃO: Duração Incomum

Esta viagem teria duração de 18 horas e 45 minutos.

📊 O que sabemos sobre este veículo (ABC-1234):
• Média das últimas 50 viagens: 2h 30min
• Maior viagem registrada: 6h 15min
• Esta viagem seria 7x maior que a média

❓ Isso está correto?
[ Sim, é isso mesmo ] [ Deixa eu revisar ]
```

### 5.2 Quilometragem Anômala
```
🛣️ ATENÇÃO: Quilometragem Fora do Padrão

Você informou 450 km rodados nesta viagem.

📊 Histórico do veículo XYZ-5678:
• Média por viagem: 45 km
• 95% das viagens: até 85 km
• Esta viagem seria 10x maior que o normal

💡 Se realmente percorreu 450 km, isso equivale a:
• Aproximadamente 5h30 de viagem a 80 km/h
• Ida e volta São Paulo ↔ Campinas

❓ Os valores estão corretos?
[ Confirmar valores ] [ Corrigir KM Final ]
```

### 5.3 Erro Bloqueante
```
❌ ERRO: Quilometragem Impossível

O Km Final (12.500) é MENOR que o Km Inicial (15.200).

Isso significaria que o veículo andou -2.700 km,
o que é fisicamente impossível.

🔧 Por favor, corrija o valor do Km Final.
```

---

## 6. Ordem de Implementação

1. **Fase 1 - Backend (Estatísticas)**
   - Criar `EstatisticaVeiculoDto.cs`
   - Criar `VeiculoEstatisticaService.cs`
   - Adicionar endpoint na API

2. **Fase 2 - Frontend (Validador IA)**
   - Criar `ValidadorFinalizacaoIA.js`
   - Implementar validações básicas (data futura, km negativo)
   - Implementar análise de datas/horas
   - Implementar análise de km

3. **Fase 3 - Integração nas Telas**
   - Integrar em `Pages/Viagens/Index.cshtml` (modal principal)
   - Integrar em `Pages/Agenda/Index.cshtml`
   - Integrar em demais telas

4. **Fase 4 - IA Evolutiva**
   - Conectar validador à API de estatísticas
   - Implementar cache de estatísticas
   - Calibrar tolerâncias baseadas em histórico

---

## 7. Considerações Técnicas

### 7.1 Performance
- Cache de estatísticas no frontend (5 minutos)
- Cache no backend com `IMemoryCache` (10 minutos por veículo)
- Lazy loading das estatísticas (só busca quando necessário)

### 7.2 Experiência do Usuário
- Alertas amarelos: permitem continuar com confirmação
- Alertas vermelhos: bloqueiam até correção
- Mensagens com dados concretos (não genéricas)
- Ícones visuais para facilitar compreensão

### 7.3 Compatibilidade
- Manter compatibilidade com validações existentes
- Não quebrar fluxos atuais
- Validação adicional, não substitutiva

---

## 8. Critérios de Sucesso

- [ ] Data Final > Hoje bloqueada em todas as telas
- [ ] Alertas inteligentes para duração anômala
- [ ] Alertas inteligentes para km anômalo
- [ ] Sistema aprende padrão de cada veículo
- [ ] Mensagens convincentes e contextualizadas
- [ ] Sem alertas desnecessários para veículos com padrões atípicos
