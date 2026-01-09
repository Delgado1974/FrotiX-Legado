/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/JavaScript/higienizarviagens_054.js.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo gerencia a funcionalidade de higienização/unificação de origens
    e destinos de viagens. Para entender completamente a funcionalidade,
    consulte a documentação acima.
    ═══════════════════════════════════════════════════════════════════════════════
*/

// ===== FUNÇÕES DE LOADING - PADRÃO FROTIX =====
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

// Alias para compatibilidade com código existente
function showLoading() { mostrarLoading(); }
function hideLoading() { esconderLoading(); }

function normalizarTexto(texto)
{
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\//g, '/')
        .trim()
        .toLowerCase();
}

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
                if (!valor) return false;
                // Adicione o log aqui 👇
                console.log(
                    '[Comparação]',
                    'valor:', valor,
                    '| normalizado:', normalizarTexto(valor),
                    '| texto:', texto,
                    '| textoNormalizado:', textoNormalizado
                );
                return normalizarTexto(valor) === textoNormalizado;
            });
            return item
                ? (typeof item === 'string' ? { text: item, value: item } : item)
                : null;
        }).filter(Boolean);

        // Adiciona na lista de destino
        destino.addItems(itensParaMover);

        // Remove da lista de origem (agora cobre ambos os formatos)
        origem.dataSource = dataOrigem.filter(item => !textosSelecionados.includes(typeof item === 'string' ? item : item.text));
        origem.dataBind();

        // Animação opcional nos itens adicionados
        setTimeout(() =>
        {
            const listboxElement = destino.element;
            const items = listboxElement.querySelectorAll("li.e-list-item");
            items.forEach(item =>
            {
                if (textosSelecionados.includes(item.textContent.trim()))
                {
                    item.classList.add("entering", "highlighted");
                    setTimeout(() => item.classList.remove("entering", "highlighted"), 1000);
                }
            });
        }, 200);

        atualizarContador(origemId);
        atualizarContador(destinoId);
    } catch (error)
    {
        console.error(error);
        Swal.fire("Erro", "Falha ao mover itens: " + error.message, "error");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    try {
        const pares = [
            ["listOrigens", "listOrigensSelecionadas"],
            ["listOrigensSelecionadas", "listOrigens"],
            ["listDestinos", "listDestinosSelecionados"],
            ["listDestinosSelecionados", "listDestinos"]
        ];

        pares.forEach(([origemId, destinoId]) => {
            const list = document.getElementById(origemId).ej2_instances[0];
            list.element.addEventListener("dblclick", () => moverSelecionados(origemId, destinoId));
        });

        document.getElementById("btnGravarOrigem").addEventListener("click", gravarOrigem);
        document.getElementById("btnGravarDestino").addEventListener("click", gravarDestino);
    } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Erro na inicialização: " + error.message, "error");
    }
});

function gravarUnificacaoViagens() {
    try {
        const novoValor = document.getElementById("txtUnificar").value.trim();
        const origemList = document.getElementById("listOrigensSelecionadas").ej2_instances[0];
        const destinoList = document.getElementById("listDestinosSelecionados").ej2_instances[0];

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

function gravarOrigem() {
    try {
        const novaOrigem = document.getElementById("txtNovaOrigem").value.trim();
        const origensSelecionadas = obterTextosDaLista("listOrigensSelecionadas");

        if (!novaOrigem) {
            Swal.fire("Atenção", "Informe o novo valor de origem.", "warning");
            return;
        }

        if (origensSelecionadas.length === 0) {
            Swal.fire("Atenção", "Selecione ao menos uma origem para unificar.", "warning");
            return;
        }

        const dados = {
            novoValor: novaOrigem,
            origensSelecionadas: origensSelecionadas,
            destinosSelecionados: []
        };

        enviarRequisicaoUnificacao(dados);

    } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Falha ao gravar origem: " + error.message, "error");
    }
}

function gravarDestino() {
    try {
        const novoDestino = document.getElementById("txtNovoDestino").value.trim();
        const destinosSelecionados = obterTextosDaLista("listDestinosSelecionados");

        if (!novoDestino) {
            Swal.fire("Atenção", "Informe o novo valor de destino.", "warning");
            return;
        }

        if (destinosSelecionados.length === 0) {
            Swal.fire("Atenção", "Selecione ao menos um destino para unificar.", "warning");
            return;
        }

        const dados = {
            novoValor: novoDestino,
            destinosSelecionados: destinosSelecionados,
            origensSelecionadas: []
        };

        enviarRequisicaoUnificacao(dados);

    } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Falha ao gravar destino: " + error.message, "error");
    }
}

function enviarRequisicaoUnificacao(dados)
{
    try
    {
        showLoading();
        fetch('/api/viagem/unificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
            .then(response =>
            {
                if (!response.ok) throw new Error("Erro ao gravar a unificação.");
                return response.json();
            })
            .then(() =>
            {
                hideLoading();
                Swal.fire("Sucesso", "Unificação realizada com sucesso!", "success").then(() => location.reload());
            })
            .catch(error =>
            {
                hideLoading();
                console.error(error);
                Swal.fire("Erro", error.message, "error");
            });
    } catch (error)
    {
        hideLoading();
        console.error(error);
        Swal.fire("Erro", "Falha ao enviar os dados: " + error.message, "error");
    }
}

function atualizarListbox(id, itens) {
    try {
        const listbox = document.getElementById(id).ej2_instances[0];
        listbox.dataSource = itens;
        listbox.dataBind();
    } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Falha ao atualizar lista: " + error.message, "error");
    }
}

function atualizarContador(listBoxId)
{
    try
    {
        const list = document.getElementById(listBoxId).ej2_instances[0];
        const count = list.getDataList().length;

        const badgeMap = {
            listOrigens: "badgeOrigens",
            listOrigensSelecionadas: "badgeOrigensSelecionadas",
            listDestinos: "badgeDestinos",
            listDestinosSelecionados: "badgeDestinosSelecionados"
        };

        const badgeId = badgeMap[listBoxId];
        if (badgeId)
        {
            const badge = document.getElementById(badgeId);
            if (badge)
            {
                // badge normal
                const badgeNum = badge.querySelector('.badge-num');
                if (badgeNum)
                {
                    badgeNum.innerText = count;
                } else
                {
                    badge.innerText = count;
                }
            }
        }
    } catch (error)
    {
        console.error(error);
        Swal.fire("Erro", "Falha ao atualizar contador: " + error.message, "error");
    }
}
function obterTextosDaLista(listId) {
    try {
        const list = document.getElementById(listId).ej2_instances[0];
        const lista = list.getDataList();

        return lista
            .map(item => typeof item === 'string' ? item : item?.text)
            .filter(texto => !!texto && texto.trim())
            .map(texto => texto.trim());

    } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Erro ao ler itens da lista: " + error.message, "error");
        return [];
    }
}
