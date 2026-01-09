# Documentação: sweetalert_interop.js - Camada de Renderização de Alertas

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

O arquivo **sweetalert_interop.js** é a camada de baixo nível que renderiza modais de alerta usando SweetAlert2, com design customizado seguindo padrão visual FrotiX (tema escuro, bonequinhos personalizados, gradientes).

**Principais funcionalidades:**
- ✅ **Alertas básicos** (Info, Success, Warning, Error) com ícones personalizados
- ✅ **Confirmações** simples e com 3 opções
- ✅ **Erros não tratados** com stack trace e detalhes técnicos
- ✅ **Validação IA** com badge especial e design diferenciado
- ✅ **Notificações** toast-style simples
- ✅ **Design FrotiX** - Tema escuro, gradientes, bonequinhos

---

## Arquivos Envolvidos

1. **wwwroot/js/sweetalert_interop.js** - Arquivo principal (759 linhas)
2. **wwwroot/js/alerta.js** - Wrapper que usa este arquivo
3. **SweetAlert2** - Biblioteca externa (CDN)
4. **wwwroot/Images/** - Ícones/bonequinhos usados nos modais

---

## Problema

SweetAlert2 padrão não segue design FrotiX. Precisamos de camada que renderize modais com tema escuro, ícones personalizados e comportamento específico.

## Solução

Criar objeto `SweetAlertInterop` com métodos que geram HTML customizado e configuram SweetAlert2 com classes e callbacks específicos.

---

## Código Principal

### Estrutura Base

```javascript
window.SweetAlertInterop = {
    ShowCustomAlert: async function (icon, iconHtml, title, message, confirmButtonText, cancelButtonText = null)
    {
        const msg = `
        <div style="background:#1e1e2f; border-radius: 8px; overflow: hidden; font-family: 'Segoe UI', sans-serif; color: #e0e0e0;">
          <div style="background:#2d2d4d; padding: 20px; text-align: center;">
            <div style="margin-bottom: 10px;">
              <div style="display: inline-block; max-width: 200px; width: 100%;">
                ${iconHtml}
              </div>
            </div>
            <div style="font-size: 20px; color: #c9a8ff; font-weight: bold;">${title}</div>
          </div>
          <div style="padding: 20px; font-size: 15px; line-height: 1.6; text-align: center; background:#1e1e2f">
            <p>${message}</p>
          </div>
          <div style="background:#3b3b5c; padding: 15px; text-align: center;">
            ${cancelButtonText ? `<button id="btnCancel">${cancelButtonText}</button>` : ''}
            <button id="btnConfirm">${confirmButtonText}</button>
          </div>
        </div>`;

        return new Promise((resolve) => {
            Swal.fire({
                showConfirmButton: false,
                html: msg,
                backdrop: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {
                    popup: 'swal2-popup swal2-no-border swal2-no-shadow'
                },
                didOpen: () => {
                    const popup = document.querySelector('.swal2-popup');
                    if (popup) {
                        popup.style.background = 'transparent';
                        popup.style.boxShadow = 'none';
                        popup.style.border = 'none';
                    }
                    // Configura botões
                    document.getElementById('btnConfirm').onclick = () => { Swal.close(); resolve(true); };
                    if (cancelButtonText) {
                        document.getElementById('btnCancel').onclick = () => { Swal.close(); resolve(false); };
                    }
                }
            });
        });
    },
    // ... outros métodos
};
```

### Métodos Disponíveis

**Alertas Básicos:**
- `ShowInfo(title, text, confirmButtonText)` - Modal informativo (bonequinho sorridente)
- `ShowSuccess(title, text, confirmButtonText)` - Modal de sucesso (bonequinho com óculos)
- `ShowWarning(title, text, confirmButtonText)` - Modal de aviso (bonequinho alerta)
- `ShowError(title, text, confirmButtonText)` - Modal de erro (bonequinho erro)

**Confirmações:**
- `ShowConfirm(title, text, confirmButtonText, cancelButtonText)` - Confirmação simples
- `ShowConfirm3(title, text, buttonTodos, buttonAtual, buttonCancel)` - Confirmação com 3 opções

**Especiais:**
- `ShowErrorUnexpected(classe, metodo, erro)` - Erro não tratado com stack trace
- `ShowValidacaoIAConfirmar(titulo, mensagem, confirm, cancel)` - Validação IA com badge
- `ShowNotification(message, color)` - Notificação toast-style simples

---

## Exemplo de Uso

```javascript
// Alerta de sucesso
await SweetAlertInterop.ShowSuccess("Sucesso", "Registro salvo!");

// Confirmação
const confirmado = await SweetAlertInterop.ShowConfirm(
    "Confirmar Exclusão",
    "Deseja realmente excluir?",
    "Sim, excluir",
    "Cancelar"
);

// Erro não tratado
await SweetAlertInterop.ShowErrorUnexpected(
    "viagem.js",
    "salvarViagem",
    {
        message: "Erro ao salvar",
        stack: "at viagem.js:123..."
    }
);
```

---

## Design FrotiX

**Cores:**
- Fundo escuro: `#1e1e2f`, `#2d2d4d`, `#3b3b5c`
- Texto: `#e0e0e0`, `#c9a8ff` (títulos)
- Botões: `#7b5ae0` (confirmar), `#555` (cancelar)

**Ícones:**
- `/images/info_sorridente_transparente.png`
- `/images/success_oculos_transparente.png`
- `/images/alerta_transparente.png`
- `/images/erro_transparente.png`

---

## Troubleshooting

**Modal não aparece:** Verificar se SweetAlert2 está carregado antes deste arquivo  
**Botões não funcionam:** Verificar se IDs `btnConfirm`/`btnCancel` existem no HTML gerado  
**Design quebrado:** Verificar se CSS do SweetAlert2 não está sobrescrevendo estilos inline

---

## Referências

- **Wrapper:** `wwwroot/js/alerta.js`
- **SweetAlert2:** Biblioteca externa (CDN)
- **Carregamento:** `Pages/Shared/_ScriptsBasePlugins.cshtml`
