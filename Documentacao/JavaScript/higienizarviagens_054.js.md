# Documentação: higienizarviagens_054.js - Sistema de Higienização de Viagens

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

O arquivo **higienizarviagens_054.js** gerencia a funcionalidade de higienização/unificação de origens e destinos de viagens, permitindo consolidar valores duplicados ou similares através de interface com Syncfusion ListBox.

**Principais funcionalidades:**
- ✅ **Unificação de origens** - Consolidar múltiplas origens em um único valor
- ✅ **Unificação de destinos** - Consolidar múltiplos destinos em um único valor
- ✅ **Interface ListBox** - Seleção múltipla com drag-and-drop (Syncfusion)
- ✅ **Movimentação de itens** - Mover itens entre listas (origem ↔ selecionados)
- ✅ **Contadores dinâmicos** - Badges mostrando quantidade de itens
- ✅ **Loading overlay** - Feedback visual durante operações

---

## Arquivos Envolvidos

1. **wwwroot/js/higienizarviagens_054.js** - Arquivo principal (334 linhas)
2. **Pages/Administracao/HigienizarViagens.cshtml** - Página que utiliza o script
3. **Syncfusion EJ2 ListBox** - Componente de lista usado na interface
4. **API:** `/api/viagem/unificar` - Endpoint que processa unificação

---

## Problema

Viagens podem ter origens e destinos com variações (ex: "São Paulo", "Sao Paulo", "SP"), causando inconsistências em relatórios e análises. Precisamos de ferramenta para unificar esses valores.

## Solução

Criar interface com duas ListBoxes (disponíveis e selecionados) para cada tipo (origem/destino), permitindo selecionar múltiplos valores e unificá-los em um único valor através de API.

---

## Código Principal

### Funções de Loading

```javascript
function mostrarLoading(texto) {
    const overlay = document.getElementById('loadingOverlayHigienizar');
    if (overlay) {
        if (texto) {
            const loadingText = overlay.querySelector('.ftx-loading-text');
            if (loadingText) loadingText.textContent = texto;
        }
        overlay.style.display = 'flex';
    }
    // Desabilita todos os botões da tela
    document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('btn-disabled-loading');
    });
}

function esconderLoading() {
    const overlay = document.getElementById('loadingOverlayHigienizar');
    if (overlay) {
        overlay.style.display = 'none';
    }
    // Reabilita todos os botões
    document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('btn-disabled-loading');
    });
}
```

### Movimentação de Itens entre Listas

```javascript
function moverSelecionados(origemId, destinoId)
{
    try
    {
        const origem = document.getElementById(origemId).ej2_instances[0];
        const destino = document.getElementById(destinoId).ej2_instances[0];

        const selectedElements = origem.getSelectedItems();
        const textosSelecionados = selectedElements.map(el => el.innerText.trim()).filter(Boolean);
        const dataOrigem = origem.getDataList();
        const dataDestino = destino.getDataList();

        if (!textosSelecionados.length) return;

        // Detecta se a lista é de objetos ou strings
        const itensParaMover = textosSelecionados.map(texto =>
        {
            const textoNormalizado = normalizarTexto(texto);
            const item = dataOrigem.find(i =>
            {
                const valor = typeof i === 'string' ? i : i.text;
                return normalizarTexto(valor) === textoNormalizado;
            });
            return item
                ? (typeof item === 'string' ? { text: item, value: item } : item)
                : null;
        }).filter(Boolean);

        // Adiciona na lista de destino
        destino.addItems(itensParaMover);

        // Remove da lista de origem
        origem.dataSource = dataOrigem.filter(item => 
            !textosSelecionados.includes(typeof item === 'string' ? item : item.text)
        );
        origem.dataBind();

        atualizarContador(origemId);
        atualizarContador(destinoId);
    } catch (error)
    {
        console.error(error);
        Swal.fire("Erro", "Falha ao mover itens: " + error.message, "error");
    }
}
```

**✅ Comentários:**
- Normaliza texto para comparação case-insensitive e sem acentos
- Suporta listas de strings ou objetos `{text, value}`
- Atualiza contadores após movimentação
- Double-click também move itens (configurado no DOMContentLoaded)

### Unificação de Valores

```javascript
function gravarUnificacaoViagens() {
    try {
        const novoValor = document.getElementById("txtUnificar").value.trim();
        const origens = obterTextosDaLista("listOrigensSelecionadas");
        const destinos = obterTextosDaLista("listDestinosSelecionados");

        if (!novoValor || (origens.length === 0 && destinos.length === 0)) {
            Swal.fire("Atenção", "Informe o novo valor e selecione pelo menos uma origem ou destino.", "warning");
            return;
        }

        const dados = {
            novoValor: novoValor,
            origensSelecionadas: origens,
            destinosSelecionados: destinos
        };

        fetch('/api/viagem/unificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao gravar a unificação.');
                return response.json();
            })
            .then(() => {
                Swal.fire("Sucesso", "Unificação concluída com sucesso!", "success").then(() => location.reload());
            })
            .catch(error => {
                console.error(error);
                Swal.fire("Erro", error.message, "error");
            });

    } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Erro ao preparar a unificação: " + error.message, "error");
    }
}
```

---

## Fluxo de Funcionamento

1. **Carregamento:** Página carrega listas de origens e destinos únicos do banco
2. **Seleção:** Usuário seleciona itens nas listas disponíveis
3. **Movimentação:** Itens são movidos para listas de selecionados (duplo-clique ou botões)
4. **Unificação:** Usuário informa novo valor e clica em "Gravar"
5. **API:** Sistema envia requisição POST para `/api/viagem/unificar`
6. **Atualização:** Backend atualiza todas as viagens com valores selecionados
7. **Recarregamento:** Página recarrega para mostrar resultado

---

## Exemplo de Uso

```html
<!-- HTML da página -->
<div id="listOrigens"></div>
<div id="listOrigensSelecionadas"></div>
<button onclick="gravarOrigem()">Unificar Origens</button>

<script>
    // Após carregar dados, inicializar ListBoxes
    // Movimentação automática via double-click configurada no DOMContentLoaded
</script>
```

---

## Troubleshooting

**ListBox não inicializa:** Verificar se Syncfusion está carregado antes deste script  
**Itens não movem:** Verificar se IDs das ListBoxes estão corretos (`ej2_instances[0]`)  
**Unificação falha:** Verificar endpoint `/api/viagem/unificar` e logs do servidor

---

## Referências

- **Página:** `Pages/Administracao/HigienizarViagens.cshtml`
- **API:** `Controllers/ViagemController.cs` → `Unificar` endpoint
- **Syncfusion:** Biblioteca externa (EJ2 ListBox)
