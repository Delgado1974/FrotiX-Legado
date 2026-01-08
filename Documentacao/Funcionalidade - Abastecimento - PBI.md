# Documentação: Abastecimento - Power BI (PBI)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades Específicas](#funcionalidades-específicas)
4. [Frontend](#frontend)
5. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Abastecimento - PBI** exibe um relatório incorporado do Microsoft Power BI, focado na análise de abastecimentos por veículo. Ela permite a visualização interativa de métricas e gráficos gerados externamente na plataforma Power BI.

### Características Principais

- ✅ **Power BI Embedded**: Integração via `iframe` com relatório hospedado.
- ✅ **Modais de Cadastro Rápido**: Permite inserir Requisitantes e Setores Solicitantes sem sair da tela (embora o foco principal seja o relatório, o código inclui esses modais, possivelmente reutilizados ou legados).
- ✅ **Layout Fullscreen**: O iframe ocupa largura total e altura considerável (900px) para melhor visualização.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Abastecimento/
│       ├── PBI.cshtml               # View Principal (HTML + JS inline)
│       └── PBI.cshtml.cs            # PageModel (Backend)
│
├── wwwroot/
│   └── css/
│       └── frotix.css               # Estilos globais
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Estrutura da página |
| **Power BI** | Relatórios analíticos incorporados |
| **Syncfusion DropDownTree** | Seleção hierárquica de setores nos modais |
| **Bootstrap 5** | Modais e layout |

---

## Funcionalidades Específicas

### 1. Relatório Power BI
O núcleo da página é um `iframe` que carrega um relatório público ou autenticado do Power BI.

**Implementação**:
```html
<iframe title="Frotix Atualizado - Relatório por Veículo"
        width="100%"
        height="900"
        src="https://app.powerbi.com/view?r=eyJrIjoiNmVhZjNhYTktZGYwNy00NDdkLTk5NGEtNTc2NzU1OTUzMjEwIiwidCI6IjU2MjFkNjRmLTRjZjgtNDdmNS1iMzc5LTJiMmFiNzljMWM1ZiJ9"
        frameborder="0"
        allowFullScreen="true">
</iframe>
```

### 2. Modais de Cadastro (Requisitante/Setor)
A página inclui código para dois modais: "Inserir Novo Requisitante" e "Inserir Novo Setor Solicitante". Eles utilizam AJAX para submeter dados à API de Viagem (`/api/Viagem/AdicionarRequisitante`, `/api/Viagem/AdicionarSetor`).

> ⚠️ **Nota**: A presença destes modais nesta página específica de Power BI parece atípica e pode ser um resquício de copiar/colar de outra funcionalidade (como cadastro de viagens), já que a página exibe apenas o relatório. No entanto, eles estão no código fonte.

**Exemplo de Chamada AJAX (Inserir Setor)**:
```javascript
$.ajax({
    type: "post",
    url: "/api/Viagem/AdicionarSetor",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: objSetor,
    success: function (data) {
        AppToast.show('Verde', data.message);
        PreencheListaSetores();
        $("#modalSetor").hide();
    },
    error: function (data) {
        console.log(data);
    }
});
```

---

## Frontend

### Scripts Inline

A página contém scripts para manipulação dos modais e validação de formulários, além de integração com componentes Syncfusion (DropDownTree).

**Prevenção de Submit com Enter**:
```javascript
function stopEnterSubmitting(e) {
    if (e.keyCode == 13) {
        var src = e.srcElement || e.target;
        if (src.tagName.toLowerCase() != "div") {
            if (e.preventDefault) { e.preventDefault(); }
            else { e.returnValue = false; }
        }
    }
}
```

---

## Troubleshooting

### Problema: Relatório não carrega (Tela cinza/branca no iframe)
**Causa**: Link do Power BI expirado, sem permissão ou bloqueado por política de segurança (CORS/X-Frame-Options).
**Solução**: Verificar se a URL no `src` do iframe ainda é válida e pública.

### Problema: Modais não abrem
**Causa**: IDs duplicados ou falta de trigger button visível.
**Observação**: Não há botões visíveis no código HTML principal (`PBI.cshtml`) para abrir esses modais (`#modalRequisitante`, `#modalSetor`). Eles existem no DOM mas podem estar inacessíveis ao usuário final nesta tela.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de Power BI de Abastecimento.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
