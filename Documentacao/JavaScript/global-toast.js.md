# Documentação: global-toast.js - Sistema de Notificações Toast

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

O arquivo **global-toast.js** fornece sistema de notificações toast nativo (sem dependências), com animações suaves, barra de progresso e suporte a múltiplos estilos (Verde, Vermelho, Amarelo).

**Principais funcionalidades:**
- ✅ **Toast nativo** sem dependências externas
- ✅ **Três estilos** (Verde/Sucesso, Vermelho/Erro, Amarelo/Aviso)
- ✅ **Barra de progresso** animada
- ✅ **Fechamento automático** configurável
- ✅ **Fechamento manual** (clique ou ESC)
- ✅ **Posicionamento customizável**

---

## Arquivos Envolvidos

1. **wwwroot/js/global-toast.js** - Arquivo principal (294 linhas)
2. **Pages/Shared/_ScriptsBasePlugins.cshtml** - Carregamento global
3. **Services/AppToast.cs** - Integração backend (TempData)

---

## Problema

Precisamos de sistema de notificações leve, confiável e sem dependências, que funcione mesmo se outras bibliotecas falharem.

## Solução

Implementar toast puro em JavaScript vanilla, com animações CSS, barra de progresso via `requestAnimationFrame`, e API simples.

---

## Código Principal

```javascript
(function ()
{
    'use strict';

    const STYLE_MAP = {
        "Verde": {
            gradient: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
            icon: '<i class="fa-duotone fa-solid fa-thumbs-up">...</i>'
        },
        "Vermelho": {
            gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
            icon: '<i class="fa-duotone fa-solid fa-face-eyes-xmarks">...</i>'
        },
        "Amarelo": {
            gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
            icon: '<i class="fa-duotone fa-solid fa-circle-radiation">...</i>'
        }
    };

    let container = null;
    let currentToast = null;
    let closeTimer = null;
    let animationFrameId = null;

    function show(estilo, mensagem, duracaoMs) {
        close(); // Fecha toast anterior

        const timeout = Number.isFinite(duracaoMs) ? Math.max(0, duracaoMs) : 3000;
        const style = STYLE_MAP[estilo] || STYLE_MAP["Amarelo"];
        const text = sanitizeText(mensagem);

        // Cria elemento do toast
        const toast = document.createElement('div');
        toast.className = 'app-toast-item';
        toast.innerHTML = `
            <div style="display:flex;align-items:center;gap:16px;padding:16px 20px;">
                ${style.icon}
                <div style="flex:1;">
                    <div style="font-size:16px;font-weight:700;color:#fff;">${text}</div>
                    <div style="position:relative;width:100%;height:4px;background:rgba(255,255,255,0.3);">
                        <div id="progress" style="height:100%;width:100%;background:#fff;transform-origin:left;"></div>
                    </div>
                </div>
            </div>
        `;

        getContainer().appendChild(toast);
        currentToast = toast;

        // Anima barra de progresso
        if (timeout > 0) {
            animateProgress(timeout);
            closeTimer = setTimeout(() => close(), timeout);
        }

        // Clique fecha
        toast.addEventListener('click', () => close());
    }

    window.AppToast = Object.freeze({
        show: show,
        close: close,
        setPosition: setPosition,
        version: '5.0-final'
    });
})();
```

**✅ Comentários:**
- Previne múltiplas inicializações
- Sanitiza texto para prevenir XSS
- Usa `requestAnimationFrame` para animação suave da barra
- Fecha toast anterior antes de mostrar novo
- Suporta fechamento por clique ou ESC

---

## Exemplo de Uso

```javascript
// Toast de sucesso
AppToast.show("Verde", "Registro salvo com sucesso!", 2000);

// Toast de erro
AppToast.show("Vermelho", "Erro ao salvar registro", 3000);

// Toast de aviso
AppToast.show("Amarelo", "Atenção: dados não salvos", 2000);

// Fechar manualmente
AppToast.close();

// Alterar posição
AppToast.setPosition("Left", "Bottom");
```

**Integração com Backend (C#):**

```csharp
// Em um Controller ou PageModel
AppToast.ShowSuccess("Registro salvo!");
// Ou
AppToast.show("Verde", "Mensagem personalizada", 2000);
```

---

## Troubleshooting

**Toast não aparece:** Verificar se arquivo está carregado e `AppToast` existe no `window`  
**Múltiplos toasts:** Sistema fecha anterior automaticamente, mas verificar se não há múltiplas inicializações  
**Barra de progresso não anima:** Verificar se `requestAnimationFrame` está disponível no navegador

---

## Referências

- **Backend Integration:** `Services/AppToast.cs`
- **Carregamento:** `Pages/Shared/_ScriptsBasePlugins.cshtml`
