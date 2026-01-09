# Documentação: syncfusion_tooltips.js - Sistema Global de Tooltips

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

O arquivo **syncfusion_tooltips.js** inicializa e gerencia tooltips globais usando Syncfusion EJ2, substituindo tooltips do Bootstrap 5 e fornecendo interface consistente em toda a aplicação.

**Principais funcionalidades:**
- ✅ **Tooltips globais** para elementos com `data-ejtip`
- ✅ **Remoção automática** de tooltips Bootstrap conflitantes
- ✅ **Suporte a elementos dinâmicos** via MutationObserver
- ✅ **Fechamento automático** após 2 segundos
- ✅ **Design customizado** sem setas, estilo FrotiX

---

## Arquivos Envolvidos

1. **wwwroot/js/syncfusion_tooltips.js** - Arquivo principal (211 linhas)
2. **Pages/Shared/_ScriptsBasePlugins.cshtml** - Carregamento global
3. **Syncfusion EJ2** - Biblioteca externa (ej.popups.Tooltip)

---

## Problema

Bootstrap 5 e Syncfusion podem conflitar ao gerenciar tooltips. Precisamos de sistema único que funcione com elementos estáticos e dinâmicos (DataTables, modais).

## Solução

Criar instância global do Syncfusion Tooltip que detecta elementos com `data-ejtip`, remove atributos Bootstrap, e atualiza automaticamente quando novos elementos são adicionados ao DOM.

---

## Código Principal

```javascript
(function ()
{
    function initializeTooltip()
    {
        // Verifica se o Syncfusion está carregado
        if (typeof ej === 'undefined' || !ej.popups || !ej.popups.Tooltip)
        {
            console.warn('Syncfusion não carregado. Tentando novamente em 500ms...');
            setTimeout(initializeTooltip, 500);
            return;
        }

        // Desabilita tooltips do Bootstrap 5
        document.querySelectorAll('[data-ejtip]').forEach(function (el)
        {
            el.removeAttribute('data-bs-toggle');
            el.removeAttribute('data-bs-original-title');
            el.removeAttribute('title');
            
            if (window.bootstrap?.Tooltip?.getInstance)
            {
                const bsTooltip = window.bootstrap.Tooltip.getInstance(el);
                bsTooltip?.dispose();
            }
        });

        // Cria instância GLOBAL
        window.ejTooltip = new ej.popups.Tooltip({
            target: '[data-ejtip]',
            opensOn: 'Hover',
            position: 'TopCenter',
            showTipPointer: false, // Sem setas
            content: function (args) {
                return args.getAttribute('data-ejtip') || 'Sem descrição';
            },
            afterOpen: function (args) {
                // Fecha automaticamente após 2 segundos
                setTimeout(() => this.close(), 2000);
            }
        });

        window.ejTooltip.appendTo('body');
    }

    // Observer para elementos dinâmicos
    const observer = new MutationObserver(() => {
        document.querySelectorAll('[data-ejtip]').forEach(function (el) {
            el.removeAttribute('data-bs-toggle');
            el.removeAttribute('data-bs-original-title');
            el.removeAttribute('title');
        });
        if (window.ejTooltip) window.ejTooltip.refresh();
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
```

**✅ Comentários:**
- Aguarda Syncfusion carregar (retry a cada 500ms)
- Remove atributos Bootstrap para evitar conflitos
- Usa MutationObserver para detectar elementos dinâmicos
- Fecha automaticamente após 2s para não poluir tela

---

## Exemplo de Uso

```html
<!-- Tooltip simples -->
<button data-ejtip="Clique para salvar">Salvar</button>

<!-- Tooltip em elemento dinâmico (DataTable) -->
<script>
    // Após criar elemento dinamicamente
    const btn = document.createElement('button');
    btn.setAttribute('data-ejtip', 'Editar registro');
    // Tooltip será aplicado automaticamente
</script>

<!-- Atualizar tooltips manualmente -->
<script>
    refreshTooltips(); // Função global disponível
</script>
```

---

## Troubleshooting

**Tooltips não aparecem:** Verificar se Syncfusion está carregado antes deste arquivo  
**Conflito com Bootstrap:** Sistema remove atributos automaticamente, mas verificar ordem de carregamento  
**Elementos dinâmicos:** MutationObserver deve detectar, mas chamar `refreshTooltips()` se necessário

---

## Referências

- **Syncfusion EJ2:** Biblioteca externa
- **Carregamento:** `Pages/Shared/_ScriptsBasePlugins.cshtml`
