var ManutencaoId = "";
var dataTableOcorrencias;
var dataTablePendencias;
var defaultRTE;
var ImagemSelecionada = "semimagem.jpg";
var dataTableItens;
// Variável global para controlar a linha selecionada
var linhaSelecionadaFoto = -1;
// Variável global para controlar modo visualização do modal de foto (OS Fechada/Cancelada)
window.modoVisualizacaoFoto = false;

document.getElementById("txtFileItem").addEventListener("change", async (e) =>
{
    const file = e.target.files?.[0];
    if (!file) return;

    imgViewerItem.src = URL.createObjectURL(file);

    // pega token (meta OU hidden)
    const token =
        document.querySelector('meta[name="request-verification-token"]')?.content ||
        document.querySelector('#uploadForm input[name="__RequestVerificationToken"]')?.value;

    console.log("Anti-forgery token:", token?.slice(0, 12) + "..."); // debug
    if (!token) { alert("Token antiforgery não encontrado na página."); return; }

    const fd = new FormData();
    fd.append("files", file, file.name);                  // casa com IEnumerable<IFormFile> files
    fd.append("__RequestVerificationToken", token);       // fallback via corpo

    const resp = await fetch("/Uploads/UploadPDF?handler=SaveIMGManutencao", {
        method: "POST",
        body: fd,
        headers: { "X-CSRF-TOKEN": token },                 // usa o HeaderName definido
        credentials: "same-origin"                          // envia cookie do antiforgery
    });

    if (!resp.ok)
    {
        const txt = await resp.text();                      // veja a mensagem do 400
        throw new Error("Falha no upload: " + resp.status + " - " + txt);
    }

    const data = await resp.json(); // { fileName: "guid.jpg" }
    window.ImagemSelecionada = data.fileName;
});


// Fecha o modal já aberto ao clicar em outro toggler (captura antes do BS)
document.addEventListener('click', function (e)
{
    try
    {
        const toggler = e.target.closest('[data-bs-toggle="modal"]');
        if (!toggler || !window.bootstrap || !bootstrap.Modal) return;

        const opened = document.querySelector('.modal.show');
        if (!opened) return;

        // Não fecha se o target é o mesmo modal (evita conflito)
        const targetSelector = toggler.getAttribute('data-bs-target');
        if (targetSelector && opened.matches(targetSelector)) return;

        // Garante uma instância válida (5.3.8 tem este método)
        const inst = bootstrap.Modal.getInstance(opened) || bootstrap.Modal.getOrCreateInstance(opened);
        if (inst && typeof inst.hide === 'function')
        {
            inst.hide();
        }
    }
    catch (error)
    {
        console.error("Erro ao fechar modal:", error);
    }
}, true);

// (Opcional) Se quiser garantir instância para todos os modais:
document.querySelectorAll('.modal').forEach(function (el)
{
    if (window.bootstrap?.Modal)
    {
        bootstrap.Modal.getInstance(el) || bootstrap.Modal.getOrCreateInstance(el, { backdrop: true, keyboard: true });
    }
});

// ===== Handler explícito para o botão "Adicionar Item" =====
// Garante que o modal seja aberto mesmo se houver conflito com outros handlers
document.addEventListener('DOMContentLoaded', function()
{
    try
    {
        const btnAdicionaItem = document.getElementById('btnAdicionaItem');
        if (btnAdicionaItem)
        {
            btnAdicionaItem.addEventListener('click', function(e)
            {
                try
                {
                    const modalEl = document.getElementById('modalManutencao');
                    if (modalEl && window.bootstrap?.Modal)
                    {
                        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                        if (modal)
                        {
                            modal.show();
                        }
                    }
                }
                catch (error)
                {
                    console.error("Erro ao abrir modalManutencao:", error);
                    Alerta.TratamentoErroComLinha("manutencao.js", "click.btnAdicionaItem", error);
                }
            });
        }
    }
    catch (error)
    {
        console.error("Erro ao configurar btnAdicionaItem:", error);
    }
});

// === Helpers de data (local, sem UTC) ===
function hojeLocalYYYYMMDD()
{
    try
    {
        const d = new Date();
        const pad = (n) =>
        {
            try
            {
                return String(n).padStart(2, "0");
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("manutencao.js", "pad", error);
            }
        };
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("manutencao.js", "hojeLocalYYYYMMDD", error);
    }
}

// Normaliza <input type="date"> SEM “pular” 1 dia.
// Aceita "DD/MM/YYYY", "YYYY-MM-DD" ou strings parseáveis por Date (sem toISOString!).
function normalizaInputDate($input)
{
    try
    {
        const raw = ($input && $input.val ? $input.val() : "").trim();
        if (!raw) return;

        // DD/MM/YYYY -> YYYY-MM-DD
        const ddmmyyyy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (ddmmyyyy)
        {
            const [, dd, mm, yyyy] = ddmmyyyy;
            $input.val(`${yyyy}-${mm}-${dd}`);
            return;
        }

        // Já está em YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return;

        // Outras formas parseáveis localmente
        const d = new Date(raw);
        if (!isNaN(d))
        {
            const pad = (n) =>
            {
                try
                {
                    return String(n).padStart(2, "0");
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha("manutencao.js", "pad", error);
                }
            };
            $input.val(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        }
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("manutencao.js", "normalizaInputDate", error);
    }
}

document.addEventListener("DOMContentLoaded", function ()
{
    try
    {
        const popoverTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="popover"]'),
        );
        popoverTriggerList.forEach(function (el)
        {
            try
            {
                new bootstrap.Popover(el);
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha(
                    "manutencao.js",
                    "callback@popoverTriggerList.forEach#0",
                    error,
                );
            }
        });

        // ===================== Helpers =====================
        const $ = window.jQuery;
        const $ds = $("#txtDataSolicitacao");

        // Converte DD/MM/YYYY -> YYYY-MM-DD (ou devolve o que já estiver correto)
        function toYMD(value)
        {
            try
            {
                if (!value) return "";
                const v = String(value).trim();
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(v))
                {
                    const [d, m, y] = v.split("/");
                    return `${y}-${m}-${d}`;
                }
                // Aceita YYYY-MM-DD ou recorta ISO
                if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
                if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);
                // Tenta moment.parseZone para não mexer com fuso
                if (window.moment)
                {
                    const m = moment.parseZone(
                        v,
                        [moment.ISO_8601, "DD/MM/YYYY", "YYYY-MM-DD"],
                        true,
                    );
                    if (m.isValid()) return m.format("YYYY-MM-DD");
                }
                return v;
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("manutencao.js", "toYMD", error);
            }
        }

        // Diferença em dias usando UTC (evita fuso)
        function diffDaysYMD(a, b)
        {
            try
            {
                if (!a || !b) return 0;
                const [ay, am, ad] = a.split("-").map(Number);
                const [by, bm, bd] = b.split("-").map(Number);
                const A = Date.UTC(ay, am - 1, ad);
                const B = Date.UTC(by, bm - 1, bd);
                return Math.round((A - B) / 86400000);
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("manutencao.js", "diffDaysYMD", error);
            }
        }

        // ===================== Bloco de usuários (como já existia) =====================
        if (typeof manutencaoId !== "undefined" && manutencaoId !== "" && manutencaoId !== "null")
        {
            // - Definir o texto da label de Criação;

            const DataCriacao = formatarDataBR(manutencaoDataCriacao);

            const HoraCriacao = formatarHora(manutencaoDataCriacao);

            $.ajax({
                url: "/api/Manutencao/RecuperaUsuario",
                type: "GET",
                data: { id: manutencaoIdUsuarioCriacao },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data)
                {
                    try
                    {
                        let usuarioCriacao = "";
                        $.each(data, function (key, val)
                        {
                            try
                            {
                                usuarioCriacao = val;
                            }
                            catch (error)
                            {
                                Alerta.TratamentoErroComLinha(
                                    "manutencao.js",
                                    "callback@$.each#1",
                                    error,
                                );
                            }
                        });
                        if (!usuarioCriacao)
                        {
                            document.getElementById("divUsuarioCriacao").style.display = "none";
                            document.getElementById("lblUsuarioCriacao").innerHTML = "";
                        } else
                        {
                            document.getElementById("divUsuarioCriacao").style.display = "block";
                            document.getElementById("lblUsuarioCriacao").innerHTML =
                                '<i class="fa-sharp-duotone fa-solid fa-user-plus"></i> <span>Criado por:</span> ' +
                                usuarioCriacao +
                                " em " +
                                DataCriacao +
                                " às " +
                                HoraCriacao;
                        }
                    }
                    catch (error)
                    {
                        TratamentoErroComLinha("manutencao.js", "(success: function)", error);
                    }
                },
                error: function (err)
                {
                    try
                    {
                        console.log(err);
                        alert("something went wrong");
                    }
                    catch (error)
                    {
                        TratamentoErroComLinha("manutencao.js", "(error: function)", error);
                    }
                },
            });

            // - Definir o texto da label de Alteração (se houver);
            if (typeof manutencaoIdUsuarioAlteracao !== "undefined" && manutencaoIdUsuarioAlteracao != null && manutencaoIdUsuarioAlteracao != "")
            {
                const DataAlteracao = formatarDataBR(manutencaoDataAlteracao);
                const HoraAlteracao = formatarHora(manutencaoDataAlteracao);

                $.ajax({
                    url: "/api/Manutencao/RecuperaUsuario",
                    type: "GET",
                    data: { id: manutencaoIdUsuarioAlteracao },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data)
                    {
                        try
                        {
                            let usuarioAlteracao = "";
                            $.each(data, function (key, val)
                            {
                                try
                                {
                                    usuarioAlteracao = val;
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "manutencao.js",
                                        "callback@$.each#alteracao",
                                        error,
                                    );
                                }
                            });
                            if (!usuarioAlteracao)
                            {
                                document.getElementById("divUsuarioAlteracao").style.display = "none";
                                document.getElementById("lblUsuarioAlteracao").innerHTML = "";
                            } else
                            {
                                document.getElementById("divUsuarioAlteracao").style.display = "block";
                                document.getElementById("lblUsuarioAlteracao").innerHTML =
                                    '<i class="fa-sharp-duotone fa-solid fa-user-pen"></i> <span>Alterado por:</span> ' +
                                    usuarioAlteracao +
                                    " em " +
                                    DataAlteracao +
                                    " às " +
                                    HoraAlteracao;
                            }
                        }
                        catch (error)
                        {
                            TratamentoErroComLinha("manutencao.js", "(success: function alteracao)", error);
                        }
                    },
                    error: function (err)
                    {
                        try
                        {
                            console.log(err);
                        }
                        catch (error)
                        {
                            TratamentoErroComLinha("manutencao.js", "(error: function alteracao)", error);
                        }
                    },
                });
            } else
            {
                var divAlteracao = document.getElementById("divUsuarioAlteracao");
                if (divAlteracao)
                {
                    divAlteracao.style.display = "none";
                    document.getElementById("lblUsuarioAlteracao").innerHTML = "";
                }
            }

            // - Definir o texto da label de Cancelamento;
            if (manutencaoIdUsuarioCancelamento != null && manutencaoIdUsuarioCancelamento != "")
            {

                const DataCancelamento = formatarDataBR(manutencaoDataCancelamento);

                const HoraCancelamento = formatarHora(manutencaoDataCancelamento);

                $.ajax({
                    url: "/api/Manutencao/RecuperaUsuario",
                    type: "GET",
                    data: { id: manutencaoIdUsuarioCancelamento },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data)
                    {
                        try
                        {
                            let usuarioCancelamento = "";
                            $.each(data, function (key, val)
                            {
                                try
                                {
                                    usuarioCancelamento = val;
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "manutencao.js",
                                        "callback@$.each#1",
                                        error,
                                    );
                                }
                            });
                            if (!usuarioCancelamento)
                            {
                                document.getElementById("divUsuarioCancelamento").style.display =
                                    "none";
                                document.getElementById("lblUsuarioCancelamento").innerHTML = "";
                            } else
                            {
                                document.getElementById("divUsuarioCancelamento").style.display =
                                    "block";
                                document.getElementById("lblUsuarioCancelamento").innerHTML =
                                    '<i class="fa-sharp-duotone fa-solid fa-user-xmark"></i> <span>Cancelado por:</span> ' +
                                    usuarioCancelamento +
                                    " em " +
                                    DataCancelamento +
                                    " às " +
                                    HoraCancelamento;
                            }
                        }
                        catch (error)
                        {
                            TratamentoErroComLinha("manutencao.js", "(success: function)", error);
                        }
                    },
                    error: function (err)
                    {
                        try
                        {
                            console.log(err);
                            alert("something went wrong");
                        }
                        catch (error)
                        {
                            TratamentoErroComLinha("manutencao.js", "(error: function)", error);
                        }
                    },
                });
            } else
            {
                document.getElementById("divUsuarioCancelamento").style.display = "none";
                document.getElementById("lblUsuarioCancelamento").innerHTML = "";
            }

            // - Definir o texto da label de Finalização;
            if (manutencaoIdUsuarioFinalizacao != null && manutencaoIdUsuarioFinalizacao != "")
            {

                const DataFinalizacao = formatarDataBR(manutencaoDataFinalizacao);

                const HoraFinalizacao = formatarHora(manutencaoDataFinalizacao);

                $.ajax({
                    url: "/api/Manutencao/RecuperaUsuario",
                    type: "GET",
                    data: { id: manutencaoIdUsuarioFinalizacao },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data)
                    {
                        try
                        {
                            let usuarioFinalizacao = "";
                            $.each(data, function (key, val)
                            {
                                try
                                {
                                    usuarioFinalizacao = val;
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "manutencao.js",
                                        "callback@$.each#1",
                                        error,
                                    );
                                }
                            });
                            if (!usuarioFinalizacao)
                            {
                                document.getElementById("divUsuarioFinalizacao").style.display =
                                    "none";
                                document.getElementById("lblUsuarioFinalizacao").innerHTML = "";
                            } else
                            {
                                document.getElementById("divUsuarioFinalizacao").style.display =
                                    "block";
                                document.getElementById("lblUsuarioFinalizacao").innerHTML =
                                    '<i class="fa-duotone fa-solid fa-user-check"></i> <span>Finalizado por:</span> ' +
                                    usuarioFinalizacao +
                                    " em " +
                                    DataFinalizacao +
                                    " às " +
                                    HoraFinalizacao;
                            }
                        }
                        catch (error)
                        {
                            TratamentoErroComLinha("manutencao.js", "(success: function)", error);
                        }
                    },
                    error: function (err)
                    {
                        try
                        {
                            console.log(err);
                            alert("something went wrong");
                        }
                        catch (error)
                        {
                            TratamentoErroComLinha("manutencao.js", "(error: function)", error);
                        }
                    },
                });
            } else
            {
                document.getElementById("divUsuarioFinalizacao").style.display = "none";
                document.getElementById("lblUsuarioFinalizacao").innerHTML = "";
            }
        } else
        {
            document.getElementById("divUsuarioCriacao").style.display = "none";
            document.getElementById("lblUsuarioCriacao").innerHTML = "";
            var divAlteracao = document.getElementById("divUsuarioAlteracao");
            if (divAlteracao)
            {
                divAlteracao.style.display = "none";
                document.getElementById("lblUsuarioAlteracao").innerHTML = "";
            }
            document.getElementById("divUsuarioCancelamento").style.display = "none";
            document.getElementById("lblUsuarioCancelamento").innerHTML = "";
            document.getElementById("divUsuarioFinalizacao").style.display = "none";
            document.getElementById("lblUsuarioFinalizacao").innerHTML = "";
        }

        // ===== Desabilita TUDO se estiver Fechada/Cancelada =====
        var StatusOS = manutencaoStatusOS;
        if (StatusOS === "Fechada" || StatusOS === "Cancelada")
        {
            $("#btnEdita").hide();
            $("#btnAdiciona").hide();

            var $keepBtn = $("#btnVoltarLista")
                .add("#btnVoltar")
                .add('a[href*="ListaManutencao"]')
                .add("a.btn.btn-vinho.form-control")
                .add('[data-bs-dismiss="modal"]')  // Botões de fechar modal
                .add("#btnFecharModal")            // Botão fechar específico
                .add(".modal .btn-vinho");         // Botões vinho dentro de modais

            var $keep = $keepBtn.add($keepBtn.parents());

            $("input, select, textarea, button")
                .not($keep)
                .prop("disabled", true)
                .css("opacity", 0.5);

            $("a, .btn")
                .not($keep)
                .attr("aria-disabled", "true")
                .attr("tabindex", "-1")
                .on("click.block", function (e)
                {
                    try
                    {
                        e.preventDefault();
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "manutencao.js",
                            "callback@$.not.attr.attr.on#1",
                            error,
                        );
                    }
                })
                .css("opacity", 0.5);

            $("div").not($keep).css("pointer-events", "none");

            $(
                'input:disabled, select:disabled, textarea:disabled, button:disabled, a[aria-disabled="true"], .btn[aria-disabled="true"]',
            ).css("cursor", "not-allowed");

            // ===== GARANTE que o botão Voltar fica HABILITADO =====
            var $btnVoltar = $("#btnVoltar, a[href*='ListaManutencao']");
            $btnVoltar
                .removeAttr("aria-disabled")
                .removeAttr("tabindex")
                .off("click.block")
                .prop("disabled", false)
                .css({
                    "opacity": "1",
                    "pointer-events": "auto",
                    "cursor": "pointer"
                });
            // Habilita pointer-events nos pais do botão Voltar
            $btnVoltar.parents().css("pointer-events", "auto");

            // ===== GARANTE que botões de FECHAR MODAL ficam HABILITADOS =====
            var $btnFecharModal = $('[data-bs-dismiss="modal"], #btnFecharModal, .modal .btn-vinho, .modal button.btn-vinho');
            $btnFecharModal
                .removeAttr("aria-disabled")
                .removeAttr("tabindex")
                .off("click.block")
                .prop("disabled", false)
                .css({
                    "opacity": "1",
                    "pointer-events": "auto",
                    "cursor": "pointer"
                });
            // Habilita pointer-events nos modais e seus elementos
            $(".modal, .modal-dialog, .modal-content, .modal-header, .modal-body, .modal-footer").css("pointer-events", "auto");
            $btnFecharModal.parents().css("pointer-events", "auto");

            // ===== HABILITA botões de FOTO para VISUALIZAÇÃO (OS Fechada/Cancelada) =====
            window.modoVisualizacaoFoto = true; // Flag global para modal saber que é visualização
            
            // Oculta botão "Adicionar Item" (não pode adicionar em OS fechada)
            $("#btnAdicionaItem").hide();
            
            // Oculta botão "Inserir Foto" no header do modal (só visualização)
            $("#btnAdicionarFoto").hide();
            
            // Nota: A reabilitação dos botões de foto é feita no drawCallback da DataTable
            // pois os botões são criados dinamicamente após o AJAX

            // ===== MUDA LABEL do grid para "Manutenções efetuadas no veículo" =====
            var lblItensSelecionados = document.querySelector("#tblItens")?.closest(".card")?.querySelector(".card-header span, .card-header h5, .card-header h6, .card-header .card-title");
            if (lblItensSelecionados)
            {
                lblItensSelecionados.innerHTML = '<i class="fa-duotone fa-solid fa-wrench me-2"></i>Manutenções efetuadas no veículo';
            }
            // Também tenta por ID específico se existir
            var lblItensById = document.getElementById("lblItensSelecionados");
            if (lblItensById)
            {
                lblItensById.innerHTML = '<i class="fa-duotone fa-solid fa-wrench me-2"></i>Manutenções efetuadas no veículo';
            }
        } else
        {
            // OS não está fechada/cancelada - modo normal
            window.modoVisualizacaoFoto = false;
        }
        
        if (StatusOS != "Aberta" && StatusOS !== "Fechada" && StatusOS !== "Cancelada")
        {
            // Nova OS: se o campo estiver vazio, define hoje (sem fuso)
            if (!$ds.val())
            {
                $ds.val(moment().format("YYYY-MM-DD"));
            }
        }

        // ===== Bloqueia lstStatus na EDIÇÃO de OS existente =====
        // A OS só pode ser fechada pelo botão "Baixar OS" na ListaManutencao
        if (typeof manutencaoId !== "undefined" && manutencaoId !== "" && manutencaoId !== "null" && manutencaoId !== "00000000-0000-0000-0000-000000000000")
        {
            var lstStatusEl = document.getElementById("lstStatus");
            if (lstStatusEl)
            {
                lstStatusEl.disabled = true;
                lstStatusEl.style.opacity = "0.6";
                lstStatusEl.style.cursor = "not-allowed";
                lstStatusEl.title = "O status só pode ser alterado através do botão 'Baixar OS' na tela de Controle de Manutenções";
            }
        }

        // ===================== FIX: manter Data da Solicitação sem +1 dia =====================
        // Cenário: ao carregar a Upsert em modo edição, a data aparece correta e um script tardio empurra +1.
        // Estratégia: capturar o valor inicial, normalizar para YYYY-MM-DD, e reverter alterações automáticas
        // de exatamente ±1 dia que ocorram logo após o load (sem atrapalhar quando o usuário alterar de fato).
        (function protectSolicDate()
        {
            try
            {
                const originalRaw = ($ds.val() || "").trim();
                if (!originalRaw) return; // sem valor inicial, nada a proteger

                const originalYMD = toYMD(originalRaw);
                if (!originalYMD) return;

                // Regrava já normalizado (garante padrío YYYY-MM-DD sem fuso)
                $ds.val(originalYMD);

                let userTouched = false;
                $ds.on("focus input change", function ()
                {
                    try
                    {
                        userTouched = true;
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "manutencao.js",
                            "callback@$ds.on#1",
                            error,
                        );
                    }
                });

                function guard()
                {
                    try
                    {
                        if (userTouched) return;
                        const cur = toYMD($ds.val());
                        if (!cur) return;
                        const d = diffDaysYMD(cur, originalYMD);
                        // se algum script empurrou exatamente 1 dia, voltamos ao original
                        if (d === 1 || d === -1)
                        {
                            $ds.val(originalYMD);
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha("manutencao.js", "guard", error);
                    }
                }

                // Executa algumas vezes após o carregamento para "ganhar" de scripts tardios
                setTimeout(guard, 50);
                setTimeout(guard, 150);
                setTimeout(guard, 350);
                setTimeout(guard, 800);
                window.addEventListener("load", guard);
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha(
                    "manutencao.js",
                    "callback@function protectSolicDate() { const orig#0",
                    error,
                );
            }
        })();

        if (window.FTXTooltip)
        {
            FTXTooltip.setAutoClose(1500); // 1.5 segundos ao invés de 1 segundo
        }

    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "DOMContentLoaded", error);
    }
});

function removeHTML(str)
{
    try
    {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = str;
        return tmp.textContent || tmp.innerText || "";
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("manutencao.js", "removeHTML", error);
    }
}

function escAttr(s)
{
    return String(s)
        .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function SelecionaLinha(
    ViagemId,
    Ficha,
    DataOcorrencia,
    Motorista,
    Resumo,
    Descricao,
    MotoristaId,
    ImagemOcorrencia,
    ItemManutencaoId,
    origemBtn            // 👈 botão da tabela de origem
)
{
    try
    {
        //Descricao = removeHTML(Descricao || "");
        //Resumo = removeHTML(Resumo || "");

        // Verifica se tem foto (incluindo semimagem.jpg como "sem foto")
        const img = ImagemOcorrencia || '';
        const temFoto = img && img !== '' && img !== 'null' && img.toLowerCase() !== 'semimagem.jpg';
        
        // Botão de foto condicional
        const botaoFoto = temFoto 
            ? `<button type="button"
                        class="btn btn-sm btnFoto js-ver-foto"
                        style="background: linear-gradient(135deg, #17a2b8, #138496); 
                               color: white; 
                               border: none; 
                               border-radius: 5px; 
                               padding: 6px 8px;
                               transition: all 0.3s ease;
                               box-shadow: 0 2px 4px rgba(23,162,184,0.3);"
                        data-bs-toggle="modal" 
                        data-bs-target="#modalFotoManutencao"
                        data-ejtip="Ver Foto"
                        onmouseover="this.style.transform='translateY(-2px)'; 
                                   this.style.boxShadow='0 6px 20px rgba(23,162,184,0.6), 0 0 15px rgba(23,162,184,0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; 
                                  this.style.boxShadow='0 2px 4px rgba(23,162,184,0.3)'">
                  <i class="fa-duotone fa-camera-polaroid"
                     style="--fa-primary-color: #ffffff; 
                            --fa-secondary-color: #e1f7fe; 
                            --fa-secondary-opacity: 0.8;"></i>
                </button>`
            : `<button type="button"
                        class="btn btn-sm btnFoto js-ver-foto"
                        style="background: linear-gradient(135deg, #fd7e14, #e96b02); 
                               color: white; 
                               border: none; 
                               border-radius: 5px; 
                               padding: 6px 8px;
                               transition: all 0.3s ease;
                               box-shadow: 0 2px 4px rgba(253,126,20,0.3);"
                        data-bs-toggle="modal" 
                        data-bs-target="#modalFotoManutencao"
                        data-ejtip="Inserir Foto"
                        onmouseover="this.style.transform='translateY(-2px)'; 
                                   this.style.boxShadow='0 6px 20px rgba(253,126,20,0.6), 0 0 15px rgba(253,126,20,0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; 
                                  this.style.boxShadow='0 2px 4px rgba(253,126,20,0.3)'">
                  <i class="fa-duotone fa-camera-viewfinder"
                     style="--fa-primary-color: #ffffff; 
                            --fa-secondary-color: #fff3e0; 
                            --fa-secondary-opacity: 0.8;"></i>
                </button>`;

        // 1) adiciona no destino
        $('#tblItens').DataTable().row.add({
            tipoItem: "Ocorrência",
            numFicha: Ficha,
            dataItem: DataOcorrencia,
            nomeMotorista: Motorista,
            resumo: Resumo,
            acoes: `
                        <div class="col-acao">
                            <div class="d-flex gap-2 justify-content-center">
                                <button type="button"
                                        class="btn btn-sm btn-delete js-devolver-item"
                                        style="background: linear-gradient(135deg, #dc3545, #c82333); 
                                               color: white; 
                                               border: none; 
                                               border-radius: 5px; 
                                               padding: 6px 8px;
                                               transition: all 0.3s ease;
                                               box-shadow: 0 2px 4px rgba(220,53,69,0.3);"
                                        data-ejtip="Devolver Item"
                                        onmouseover="this.style.transform='translateY(-2px)'; 
                                                   this.style.boxShadow='0 6px 20px rgba(220,53,69,0.6), 0 0 15px rgba(220,53,69,0.4)'"
                                        onmouseout="this.style.transform='translateY(0)'; 
                                                  this.style.boxShadow='0 2px 4px rgba(220,53,69,0.3)'">
                                  <i class="fa-duotone fa-up-from-bracket"
                                     style="--fa-primary-color: #ffffff; 
                                            --fa-secondary-color: #ffebee; 
                                            --fa-secondary-opacity: 0.8;"></i>
                                </button>
        
                                ${botaoFoto}
                            </div>
                        </div>
                        `,
            itemManutencaoId: ItemManutencaoId,   // mantém no dataset da linha (pode esconder a coluna)
            descricao: Descricao,
            resumoTexto: Resumo,
            motoristaId: MotoristaId,
            imagemOcorrencia: ImagemOcorrencia,
            viagemId: ViagemId
        }).draw(false);
        // 2) remove a linha da tabela de origem
        //    (ajuste o seletor '#tblOrigem' para o id real da sua tabela de origem)
        const dtOrigem = $(origemBtn).closest('table').DataTable(); // ou $('#tblOrigem').DataTable()
        dtOrigem.row($(origemBtn).closest('tr')).remove().draw(false);
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("manutencao.js", "SelecionaLinha", error);
    }
}

//// Remover item
//$(document).on('click', '.js-remover-item', function ()
//{
//    const id = this.dataset.itemId;
//    RemoveItem(id, this);
//});

//function RemoveItem(itemId, buttonElement)
//{
//    try
//    {
//        const table = $('#tblItens').DataTable();
//        let rowToRemove = null;

//        // Encontra a linha a ser removida
//        if (buttonElement)
//        {
//            rowToRemove = table.row($(buttonElement).closest('tr'));
//        } else
//        {
//            const rowIndex = table.rows().eq(0).filter(function (index)
//            {
//                const rowData = table.row(index).data();
//                return rowData && String(rowData.itemManutencaoId) === String(itemId);
//            });
//            if (rowIndex.length > 0)
//            {
//                rowToRemove = table.row(rowIndex[0]);
//            }
//        }

//        if (rowToRemove && rowToRemove.any())
//        {
//            // IMPORTANTE: Limpa tooltips Syncfusion antes de remover a linha
//            const $row = $(rowToRemove.node());
//            $row.find('[data-ejtip]').each(function ()
//            {
//                const el = this;
//                if (el.ej2_instances)
//                {
//                    el.ej2_instances.forEach(instance =>
//                    {
//                        if (instance instanceof ej.popups.Tooltip)
//                        {
//                            try
//                            {
//                                instance.destroy();
//                            } catch (e)
//                            {
//                                console.warn("Erro ao destruir tooltip:", e);
//                            }
//                        }
//                    });
//                }
//            });

//            // Remove a linha
//            rowToRemove.remove().draw(false);
//            AppToast.show("Verde", "Item removido com sucesso!", 2000);
//        } else
//        {
//            AppToast.show("Amarelo", "Item não encontrado na tabela", 2000);
//        }

//    } catch (error)
//    {
//        console.error("Erro ao remover item:", error);
//        AppToast.show("Vermelho", "Erro ao remover o item", 2000);
//        Alerta.TratamentoErroComLinha("manutencao.js", "RemoveItem", error);
//    }
//}

function SelecionaLinhaPendencia(
    ViagemId,
    Ficha,
    DataOcorrencia,
    Motorista,
    Resumo,
    Descricao,
    MotoristaId,
    ImagemOcorrencia,
    ItemManutencaoId,
    origemBtn            // 👈 botão da tabela de origem
)
{
    try
    {
        Descricao = removeHTML(Descricao);

        // Verifica se tem foto (incluindo semimagem.jpg como "sem foto")
        const img = ImagemOcorrencia || '';
        const temFoto = img && img !== '' && img !== 'null' && img.toLowerCase() !== 'semimagem.jpg';
        
        // Botão de foto condicional
        const botaoFoto = temFoto 
            ? `<button type="button"
                        class="btn btn-sm btnFoto js-ver-foto"
                        style="background: linear-gradient(135deg, #17a2b8, #138496); 
                               color: white; 
                               border: none; 
                               border-radius: 5px; 
                               padding: 6px 8px;
                               transition: all 0.3s ease;
                               box-shadow: 0 2px 4px rgba(23,162,184,0.3);"
                        data-bs-toggle="modal" 
                        data-bs-target="#modalFotoManutencao"
                        data-ejtip="Ver Foto"
                        onmouseover="this.style.transform='translateY(-2px)'; 
                                   this.style.boxShadow='0 6px 20px rgba(23,162,184,0.6), 0 0 15px rgba(23,162,184,0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; 
                                  this.style.boxShadow='0 2px 4px rgba(23,162,184,0.3)'">
                  <i class="fa-duotone fa-camera-polaroid"
                     style="--fa-primary-color: #ffffff; 
                            --fa-secondary-color: #e1f7fe; 
                            --fa-secondary-opacity: 0.8;"></i>
                </button>`
            : `<button type="button"
                        class="btn btn-sm btnFoto js-ver-foto"
                        style="background: linear-gradient(135deg, #fd7e14, #e96b02); 
                               color: white; 
                               border: none; 
                               border-radius: 5px; 
                               padding: 6px 8px;
                               transition: all 0.3s ease;
                               box-shadow: 0 2px 4px rgba(253,126,20,0.3);"
                        data-bs-toggle="modal" 
                        data-bs-target="#modalFotoManutencao"
                        data-ejtip="Inserir Foto"
                        onmouseover="this.style.transform='translateY(-2px)'; 
                                   this.style.boxShadow='0 6px 20px rgba(253,126,20,0.6), 0 0 15px rgba(253,126,20,0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; 
                                  this.style.boxShadow='0 2px 4px rgba(253,126,20,0.3)'">
                  <i class="fa-duotone fa-camera-viewfinder"
                     style="--fa-primary-color: #ffffff; 
                            --fa-secondary-color: #fff3e0; 
                            --fa-secondary-opacity: 0.8;"></i>
                </button>`;

        $("#tblItens")
            .DataTable()
            .row.add({
                tipoItem: "Pendência",
                numFicha: Ficha,
                dataItem: DataOcorrencia,
                nomeMotorista: Motorista,
                resumo: Resumo,
                acoes: `
                        <div class="col-acao">
                            <div class="d-flex gap-2 justify-content-center">
                                <button type="button"
                                        class="btn btn-sm btn-delete js-devolver-item"
                                        style="background: linear-gradient(135deg, #dc3545, #c82333); 
                                               color: white; 
                                               border: none; 
                                               border-radius: 5px; 
                                               padding: 6px 8px;
                                               transition: all 0.3s ease;
                                               box-shadow: 0 2px 4px rgba(220,53,69,0.3);"
                                        data-ejtip="Devolver Item"
                                        onmouseover="this.style.transform='translateY(-2px)'; 
                                                   this.style.boxShadow='0 6px 20px rgba(220,53,69,0.6), 0 0 15px rgba(220,53,69,0.4)'"
                                        onmouseout="this.style.transform='translateY(0)'; 
                                                  this.style.boxShadow='0 2px 4px rgba(220,53,69,0.3)'">
                                  <i class="fa-duotone fa-up-from-bracket"
                                     style="--fa-primary-color: #ffffff; 
                                            --fa-secondary-color: #ffebee; 
                                            --fa-secondary-opacity: 0.8;"></i>
                                </button>
        
                                ${botaoFoto}
                            </div>
                        </div>
                        `,
                itemManutencaoId: ItemManutencaoId,
                descricao: Descricao,
                resumoTexto: Resumo,
                motoristaId: MotoristaId,
                imagemOcorrencia: ImagemOcorrencia,
                viagemId: ViagemId,
            })
            .draw(false);

        // 2) remove a linha da tabela de origem
        //    (ajuste o seletor '#tblOrigem' para o id real da sua tabela de origem)
        const dtOrigem = $(origemBtn).closest('table').DataTable(); // ou $('#tblOrigem').DataTable()
        dtOrigem.row($(origemBtn).closest('tr')).remove().draw(false);

    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("manutencao.js", "SelecionaLinhaPendencia", error);
    }
}

class Ocorrencia
{
    constructor(
        noFichaVistoria,
        data,
        motorista,
        resumo,
        viagemId,
        descricao,
        motoristaId,
        imagemOcorrencia,
        itemManutencaoId,
    )
    {
        try
        {
            this.noFichaVistoria = noFichaVistoria;
            this.data = data;
            this.motorista = motorista;
            this.resumo = resumo;
            this.viagemId = viagemId;
            this.descricao = descricao;
            this.motoristaId = motoristaId;
            this.imagemOcorrencia = imagemOcorrencia;
            this.itemManutencaoId = itemManutencaoId;
        }
        catch (error)
        {
            Alerta.TratamentoErroComLinha("manutencao.js", "constructor", error);
        }
    }
}

//$("#tblItens").on("click", "a.btn-delete", function () {
//    try
//    {
//        var data = dataTableItens.row($(this).parents("tr")).data();
//        if (!data) return;

//        if (data["tipoItem"] === "Ocorrência") {
//            let Ocorrencias = [];

//            if (dataTableOcorrencias.data().count() > 0) {
//                for (var i = 0; i < dataTableOcorrencias.data().count(); i++) {
//                    let ocorrencia = new Ocorrencia(
//                        dataTableOcorrencias.cell(i, 0).data(),
//                        dataTableOcorrencias.cell(i, 1).data(),
//                        dataTableOcorrencias.cell(i, 2).data(),
//                        dataTableOcorrencias.cell(i, 3).data(),
//                        dataTableOcorrencias.cell(i, 4).data(),
//                        dataTableOcorrencias.cell(i, 5).data(),
//                        dataTableOcorrencias.cell(i, 6).data(),
//                        dataTableOcorrencias.cell(i, 7).data(),
//                        dataTableOcorrencias.cell(i, 8).data(),
//                    );

//                    Ocorrencias.push(ocorrencia);
//                    dataTableOcorrencias.row(i).remove().draw(false);
//                }
//            }

//            $("#tblOcorrencia")
//                .DataTable()
//                .row.add({
//                    noFichaVistoria: data["numFicha"],
//                    dataInicial: data["dataItem"],
//                    nomeMotorista: data["nomeMotorista"],
//                    resumoOcorrencia: data["resumo"],
//                    viagemId: data["viagemId"],
//                    descricaoOcorrencia: data["descricao"],
//                    motoristaId: data["motoristaId"],
//                    imagemOcorrencia: data["imagemOcorrencia"],
//                    itemManutencaoId: data["itemManutencaoId"],
//                })
//                .draw(false);

//            Ocorrencias.forEach((o) => {
//                try
//                {
//                    $("#tblOcorrencia")
//                        .DataTable()
//                        .row.add({
//                            noFichaVistoria: o.noFichaVistoria,
//                            dataInicial: o.data,
//                            nomeMotorista: o.motorista,
//                            resumoOcorrencia: o.resumo,
//                            viagemId: o.viagemId,
//                            descricaoOcorrencia: o.descricao,
//                            motoristaId: o.motoristaId,
//                            imagemOcorrencia: o.imagemOcorrencia,
//                            itemManutencaoId: o.itemManutencaoId,
//                        })
//                        .draw(false);
//                }
//                catch (error)
//                {
//                    Alerta.TratamentoErroComLinha(
//                        "manutencao.js",
//                        "callback@Ocorrencias.forEach#0",
//                        error,
//                    );
//                }
//            });
//        } else if (data["tipoItem"] === "Pendência") {
//            let Pendencias = [];

//            if (dataTablePendencias.data().count() > 0) {
//                for (var i = 0; i < dataTablePendencias.data().count(); i++) {
//                    let pendencia = new Ocorrencia(
//                        dataTablePendencias.cell(i, 0).data(),
//                        dataTablePendencias.cell(i, 1).data(),
//                        dataTablePendencias.cell(i, 2).data(),
//                        dataTablePendencias.cell(i, 3).data(),
//                        dataTablePendencias.cell(i, 4).data(),
//                        dataTablePendencias.cell(i, 5).data(),
//                        dataTablePendencias.cell(i, 6).data(),
//                        dataTablePendencias.cell(i, 7).data(),
//                        dataTablePendencias.cell(i, 8).data(),
//                        dataTablePendencias.cell(i, 9).data(),
//                    );

//                    Pendencias.push(pendencia);
//                    dataTablePendencias.row(i).remove().draw(false);
//                }
//            }

//            $("#tblPendencia")
//                .DataTable()
//                .row.add({
//                    numFicha: data["numFicha"],
//                    dataItem: data["dataItem"],
//                    nome: data["nomeMotorista"],
//                    resumo: data["resumo"],
//                    itemManutencaoId: data["itemManutencaoId"],
//                    descricao: data["descricao"],
//                    motoristaId: data["motoristaId"],
//                    imagemOcorrencia: data["imagemOcorrencia"],
//                    viagemId: data["viagemId"],
//                })
//                .draw(false);

//            Pendencias.forEach((p) => {
//                try
//                {
//                    $("#tblPendencia")
//                        .DataTable()
//                        .row.add({
//                            numFicha: p.noFichaVistoria,
//                            dataItem: p.data,
//                            nome: p.motorista,
//                            resumo: p.resumo,
//                            itemManutencaoId: p.itemManutencaoId,
//                            descricao: p.descricao,
//                            motoristaId: p.motoristaId,
//                            imagemOcorrencia: p.imagemOcorrencia,
//                            viagemId: p.viagemId,
//                        })
//                        .draw(false);
//                }
//                catch (error)
//                {
//                    Alerta.TratamentoErroComLinha(
//                        "manutencao.js",
//                        "callback@Pendencias.forEach#0",
//                        error,
//                    );
//                }
//            });
//        }

//        dataTableItens.row($(this).parents("tr")).remove().draw(false);
//    }
//    catch (error)
//    {
//        TratamentoErroComLinha("manutencao.js", "click.btn-delete", error);
//    }
//});

$("#tblOcorrencia").on("click", "a.btnSeleciona", function ()
{
    try
    {
        dataTableOcorrencias.row($(this).parents("tr")).remove().draw(false);
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "click.btnSeleciona.tblOcorrencia", error);
    }
});

$("#tblPendencia").on("click", "a.btnSeleciona", function ()
{
    try
    {
        dataTablePendencias.row($(this).parents("tr")).remove().draw(false);
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "click.btnSeleciona.tblPendencia", error);
    }
});

// Botão Fechar do Modal
//=============================
$("#btnFechar").click(function (e)
{
    try
    {
        // Limpa backdrop e restaura scroll do body (Bootstrap 5 adiciona overflow:hidden inline)
        $(".modal-backdrop").remove();
        $("body").removeClass("modal-open").css({
            'overflow': '',
            'padding-right': ''
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "click.btnFechar", error);
    }
});

function onCreate()
{
    try
    {
        defaultRTE = this;
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "onCreate", error);
    }
}


// 2) Seu código do modal (com limpeza segura do Kendo Upload)
$("#modalManutencao")
    .on("shown.bs.modal", function ()
    {
        try
        {
            defaultRTE.refreshUI();
            document.getElementById("txtData").value = moment(Date()).format("YYYY-MM-DD");

            // Exibe "Sem Imagem"
            $("#imgViewerItem").attr("src", "/DadosEditaveis/ImagensOcorrencias/semimagem.jpg");
        } catch (error)
        {
            TratamentoErroComLinha("manutencao.js", "modalManutencao.shown.bs.modal", error);
        }
    })
    // Limpa DEPOIS de fechar de fato
    .on("hidden.bs.modal", function ()
    {
        try
        {
            document.getElementById("txtData").value = "";
            document.getElementById("txtResumo").value = "";

            var descricao = document.getElementById("rteManutencao").ej2_instances[0];
            descricao.value = "";

            var motorista = document.getElementById("lstMotorista").ej2_instances[0];
            motorista.value = "";

            // Limpa o Upload (sem quebrar se não estiver inicializado)
            var $file = $("#txtFileItem");
            if ($file.length)
            {
                var upload =
                    (typeof $file.getKendoUpload === "function" && $file.getKendoUpload()) ||
                    $file.data("kendoUpload");

                if (upload && typeof upload.clearAllFiles === "function")
                {
                    upload.clearAllFiles();
                } else if (upload && typeof upload.removeAllFiles === "function")
                {
                    upload.removeAllFiles();
                } else
                {
                    $file.val("");
                    var $wrap = $file.closest(".k-upload");
                    if ($wrap.length)
                    {
                        $wrap.find(".k-file").remove();
                        $wrap.find(".k-upload-status").text("");
                    }
                }
            }
            
            // Garante restauração do scroll do body (Bootstrap 5 adiciona overflow:hidden inline)
            setTimeout(() => {
                $(".modal-backdrop").remove();
                $("body").removeClass("modal-open").css({
                    'overflow': '',
                    'padding-right': ''
                });
            }, 100);
        } catch (error)
        {
            TratamentoErroComLinha("manutencao.js", "modalManutencao.hidden.bs.modal", error);
        }
    });

// Botão Inserir Item de Ocorrência do Modal
//==========================================
$("#btnInsereItem").click(function (e)
{
    try
    {
        e.preventDefault();

        // Pega o arquivo de imagem selecionado
        ImagemOcorrencia = ImagemSelecionada;

        // debugger;

        DataItem = $("#txtData").val();
        Resumo = $("#txtResumo").val();

        DataItem =
            DataItem.substring(8, 10) +
            "/" +
            DataItem.substring(5, 7) +
            "/" +
            DataItem.substring(0, 4);

        if (Resumo === "")
        {
            Alerta.Erro(
                "Informação Ausente",
                "O Resumo do Item é obrigatório",
                "Ok"

            );
            return;
        }

        var Descricao = document.getElementById("rteManutencao").ej2_instances[0];
        var Motorista = document.getElementById("lstMotorista").ej2_instances[0];

        // Verifica se tem foto (incluindo semimagem.jpg como "sem foto")
        const img = ImagemOcorrencia || '';
        const temFoto = img && img !== '' && img !== 'null' && img.toLowerCase() !== 'semimagem.jpg';
        
        // Botão de foto condicional
        const botaoFoto = temFoto 
            ? `<button type="button"
                        class="btn btn-sm btnFoto js-ver-foto"
                        style="background: linear-gradient(135deg, #17a2b8, #138496); 
                               color: white; 
                               border: none; 
                               border-radius: 5px; 
                               padding: 6px 8px;
                               transition: all 0.3s ease;
                               box-shadow: 0 2px 4px rgba(23,162,184,0.3);"
                        data-bs-toggle="modal" 
                        data-bs-target="#modalFotoManutencao"
                        data-ejtip="Ver Foto"
                        onmouseover="this.style.transform='translateY(-2px)'; 
                                   this.style.boxShadow='0 6px 20px rgba(23,162,184,0.6), 0 0 15px rgba(23,162,184,0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; 
                                  this.style.boxShadow='0 2px 4px rgba(23,162,184,0.3)'">
                  <i class="fa-duotone fa-camera-polaroid"
                     style="--fa-primary-color: #ffffff; 
                            --fa-secondary-color: #e1f7fe; 
                            --fa-secondary-opacity: 0.8;"></i>
                </button>`
            : `<button type="button"
                        class="btn btn-sm btnFoto js-ver-foto"
                        style="background: linear-gradient(135deg, #fd7e14, #e96b02); 
                               color: white; 
                               border: none; 
                               border-radius: 5px; 
                               padding: 6px 8px;
                               transition: all 0.3s ease;
                               box-shadow: 0 2px 4px rgba(253,126,20,0.3);"
                        data-bs-toggle="modal" 
                        data-bs-target="#modalFotoManutencao"
                        data-ejtip="Inserir Foto"
                        onmouseover="this.style.transform='translateY(-2px)'; 
                                   this.style.boxShadow='0 6px 20px rgba(253,126,20,0.6), 0 0 15px rgba(253,126,20,0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; 
                                  this.style.boxShadow='0 2px 4px rgba(253,126,20,0.3)'">
                  <i class="fa-duotone fa-camera-viewfinder"
                     style="--fa-primary-color: #ffffff; 
                            --fa-secondary-color: #fff3e0; 
                            --fa-secondary-opacity: 0.8;"></i>
                </button>`;

        $("#tblItens")
            .DataTable()
            .row.add({
                tipoItem: "Inserção Manual",
                numFicha: "N/A",
                dataItem: DataItem,
                nomeMotorista: Motorista.text,
                resumo: `<div class='text-center'><a aria-label='&#9881; (${removeHTML(Descricao.value)})' data-microtip-position='top' role='tooltip' data-microtip-size='medium' style='cursor:pointer;'>${Resumo}</a></div>`,
                itemManutencaoId: `<button type="button"
                                            class="btn btn-sm btn-delete js-remover-item"
                                            style="background: linear-gradient(135deg, #dc3545, #c82333); 
                                                   color: white; 
                                                   border: none; 
                                                   border-radius: 5px; 
                                                   padding: 6px 8px;
                                                   transition: all 0.3s ease;
                                                   box-shadow: 0 2px 4px rgba(220,53,69,0.3);"
                                            data-ejtip="Excluir Item"
                                            onmouseover="this.style.transform='translateY(-2px)'; 
                                                       this.style.boxShadow='0 6px 20px rgba(220,53,69,0.6), 0 0 15px rgba(220,53,69,0.4)'"
                                            onmouseout="this.style.transform='translateY(0)'; 
                                                      this.style.boxShadow='0 2px 4px rgba(220,53,69,0.3)'">
                                      <i class="fa-duotone fa-trash-can"
                                         style="--fa-primary-color: #ffffff; 
                                                --fa-secondary-color: #ffebee; 
                                                --fa-secondary-opacity: 0.8;"></i>
                                    </button>
        
                                    ${botaoFoto}`,
                itemManutencaoId: "",
                descricao: removeHTML(Descricao.value),
                resumo: Resumo,
                motoristaId: Motorista.value,
                imagemOcorrencia: ImagemOcorrencia,
                viagemId: "",
            })
            .draw(false);

        // Fecha o modal usando Bootstrap 5 corretamente
        const modalEl = document.getElementById('modalManutencao');
        if (modalEl && window.bootstrap?.Modal)
        {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
        
        // Garante limpeza do backdrop e overflow (fallback)
        setTimeout(() => {
            $(".modal-backdrop").remove();
            $("body").removeClass("modal-open").css({
                'overflow': '',
                'padding-right': ''
            });
        }, 300);
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "click.btnInsereItem", error);
    }
});

$("#tblItens tbody").on("click", "tr", function ()
{
    try
    {
        LinhaSelecionada = dataTableItens.row(this).index();
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "click.tr.tblItens", error);
    }
});

/* ==========================================
   Handlers delegados para abrir modais de foto
   (necessário pois botões são criados dinamicamente)
   ========================================== */

// Handler para botões de foto na tabela de Ocorrências
$(document).on("click", "#tblOcorrencia [data-bs-target='#modalFotoOcorrencia']", function(e)
{
    try
    {
        e.preventDefault();
        e.stopPropagation();
        
        const modalEl = document.getElementById('modalFotoOcorrencia');
        if (modalEl && window.bootstrap?.Modal)
        {
            // Armazena dados do botão para o evento show.bs.modal
            $(modalEl).data('triggerBtn', this);
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    }
    catch (error)
    {
        console.error("Erro ao abrir modalFotoOcorrencia:", error);
        Alerta.TratamentoErroComLinha("manutencao.js", "click.modalFotoOcorrencia", error);
    }
});

// Handler para botões de foto na tabela de Pendências
$(document).on("click", "#tblPendencia [data-bs-target='#modalFotoPendencia']", function(e)
{
    try
    {
        e.preventDefault();
        e.stopPropagation();
        
        const modalEl = document.getElementById('modalFotoPendencia');
        if (modalEl && window.bootstrap?.Modal)
        {
            $(modalEl).data('triggerBtn', this);
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    }
    catch (error)
    {
        console.error("Erro ao abrir modalFotoPendencia:", error);
        Alerta.TratamentoErroComLinha("manutencao.js", "click.modalFotoPendencia", error);
    }
});

// Handler para botões de foto na tabela de Itens Selecionados
$(document).on("click", "#tblItens [data-bs-target='#modalFotoManutencao']", function(e)
{
    try
    {
        e.preventDefault();
        e.stopPropagation();
        
        const modalEl = document.getElementById('modalFotoManutencao');
        if (modalEl && window.bootstrap?.Modal)
        {
            $(modalEl).data('triggerBtn', this);
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    }
    catch (error)
    {
        console.error("Erro ao abrir modalFotoManutencao:", error);
        Alerta.TratamentoErroComLinha("manutencao.js", "click.modalFotoManutencao", error);
    }
});

/* ==========================================
   Modal da Foto da Ocorrência (Bootstrap 5)
   ========================================== */
(function ()
{
    try
    {
        const modalElement = document.getElementById('modalFotoOcorrencia');
        if (!modalElement)
        {
            console.warn('[manutencao.js] Elemento #modalFotoOcorrencia não encontrado');
            return;
        }

        // Configurar evento show.bs.modal
        modalElement.addEventListener('show.bs.modal', function (event)
        {
            try
            {
                // Pega a imagem do data attribute do botão que disparou o modal
                // Tenta primeiro o relatedTarget, depois o botão armazenado via jQuery
                var btnClicado = event.relatedTarget || $(modalElement).data('triggerBtn');
                var imagemOcorrencia = $(btnClicado).data('imagem') || '';
                
                // Limpa o botão armazenado
                $(modalElement).removeData('triggerBtn');
                
                $("#imgViewerOcorrencia").removeAttr("src");

                if (imagemOcorrencia && imagemOcorrencia !== '' && imagemOcorrencia !== 'null')
                {
                    $("#imgViewerOcorrencia").attr(
                        "src",
                        "/DadosEditaveis/ImagensOcorrencias/" + imagemOcorrencia
                    );
                } else
                {
                    $("#imgViewerOcorrencia").attr(
                        "src",
                        "/DadosEditaveis/ImagensOcorrencias/semimagem.jpg"
                    );
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("manutencao.js", "modalFotoOcorrencia.show.bs.modal", error);
            }
        });

        // Configurar evento hide.bs.modal
        modalElement.addEventListener('hide.bs.modal', function (event)
        {
            try
            {
                $("#imgViewerOcorrencia").removeAttr("src");
                
                // Garante restauração do scroll do body (Bootstrap 5 adiciona overflow:hidden inline)
                setTimeout(() => {
                    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 150);
            }
            catch (error)
            {
                TratamentoErroComLinha("manutencao.js", "modalFotoOcorrencia.hide.bs.modal", error);
            }
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "init@modalFotoOcorrencia", error);
    }
})();

/* ==========================================
   Modal da Foto da Pendência (Bootstrap 5)
   ========================================== */
(function ()
{
    try
    {
        const modalElement = document.getElementById('modalFotoPendencia');
        if (!modalElement)
        {
            console.warn('[manutencao.js] Elemento #modalFotoPendencia não encontrado');
            return;
        }

        // Configurar evento show.bs.modal
        modalElement.addEventListener('show.bs.modal', function (event)
        {
            try
            {
                // Pega a imagem do data attribute do botão que disparou o modal
                // Tenta primeiro o relatedTarget, depois o botão armazenado via jQuery
                var btnClicado = event.relatedTarget || $(modalElement).data('triggerBtn');
                var imagemPendencia = $(btnClicado).data('foto') || $(btnClicado).data('imagem') || '';
                
                // Limpa o botão armazenado
                $(modalElement).removeData('triggerBtn');
                
                $("#imgViewerPendencia").removeAttr("src");

                if (imagemPendencia && imagemPendencia !== '' && imagemPendencia !== 'null')
                {
                    $("#imgViewerPendencia").attr(
                        "src",
                        "/DadosEditaveis/ImagensOcorrencias/" + decodeURIComponent(imagemPendencia)
                    );
                } else
                {
                    $("#imgViewerPendencia").attr(
                        "src",
                        "/DadosEditaveis/ImagensOcorrencias/semimagem.jpg"
                    );
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("manutencao.js", "modalFotoPendencia.show.bs.modal", error);
            }
        });

        // Configurar evento hide.bs.modal
        modalElement.addEventListener('hide.bs.modal', function (event)
        {
            try
            {
                $("#imgViewerPendencia").removeAttr("src");
                
                // Garante restauração do scroll do body (Bootstrap 5 adiciona overflow:hidden inline)
                setTimeout(() => {
                    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 150);
            }
            catch (error)
            {
                TratamentoErroComLinha("manutencao.js", "modalFotoPendencia.hide.bs.modal", error);
            }
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "init@modalFotoPendencia", error);
    }
})();

//Modal da Foto do Item de Manutenção - Pode Editar
//-------------------------------------------------
// supondo que seu DataTable já exista em dataTableItens
// e que a coluna 10 guarda o nome do arquivo da imagem

//(function ()
//{
//    const modalEl = document.getElementById('modalFotoManutencao');
//    // cria a instância (importante!)
//    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl, {
//        keyboard: true,
//        backdrop: 'static'
//    });

//    modalEl.addEventListener('show.bs.modal', function (event)
//    {
//        try
//        {
//            document.getElementById('imgViewerNovo').removeAttribute('src');

//            const btn = event.relatedTarget; // botão que abriu
//            let tr = btn ? btn.closest('tr') : null;
//            if (tr && tr.classList.contains('child')) tr = tr.previousElementSibling;

//            // exemplo com DataTables (ajuste #id da sua tabela):
//            const row = (tr && $.fn.dataTable) ? $('#suaTabela').DataTable().row(tr) : null;
//            if (!row || !row.any())
//            {
//                bootstrap.Modal.getInstance(modalEl)?.hide();
//                return;
//            }

//            const dados = row.data();
//            const foto = Array.isArray(dados) ? dados[10] : dados?.foto;
//            const temFoto = foto && foto !== 'null';

//            document.getElementById('imgViewerNovo').src =
//                temFoto ? '/DadosEditaveis/ImagensOcorrencias/' + foto
//                    : '/DadosEditaveis/ImagensOcorrencias/semimagem.jpg';
//        } catch (err)
//        {
//            console.error('modalFotoManutencao.show', err);
//        }
//    });

//    modalEl.addEventListener('hide.bs.modal', function ()
//    {
//        try
//        {
//            document.getElementById('imgViewerNovo').removeAttribute('src');
//            const upload = $('#txtFileItemNovo').data('kendoUpload');
//            if (upload) upload.clearAllFiles();
//        } catch (err)
//        {
//            console.error('modalFotoManutencao.hide', err);
//        }
//    });

//    // Abrir via JS (se precisar): bsModal.show();
//})();


// Inicialização do modal de foto
// Inicialização do modal de foto
(function initModalFoto()
{
    if (window.__bindModalFoto) return;
    window.__bindModalFoto = true;

    // Define BASE como variável global do window
    window.BASE_IMAGENS = "/DadosEditaveis/ImagensOcorrencias/";
    const BASE = window.BASE_IMAGENS; // mantém a constante local
    const modalEl = document.getElementById('modalFotoManutencao');
    const imgEl = document.getElementById('imgViewerNovo');

    if (!modalEl || !imgEl)
    {
        console.warn("Modal ou imagem não encontrados");
        return;
    }

    // Evento para abrir o modal
    modalEl.addEventListener('show.bs.modal', function (event)
    {
        try
        {
            // Tenta primeiro o relatedTarget, depois o botão armazenado via jQuery
            const btn = event.relatedTarget || $(modalEl).data('triggerBtn');
            
            // Limpa o botão armazenado
            $(modalEl).removeData('triggerBtn');
            
            if (!btn)
            {
                console.warn("Botão não encontrado para modalFotoManutencao");
                imgEl.src = BASE + "semimagem.jpg";
                return;
            }

            // Encontra a linha do botão clicado diretamente na tabela
            const table = $('#tblItens').DataTable();
            const $tr = $(btn).closest('tr');

            // Se for uma linha child (responsive), pega a anterior
            const $actualTr = $tr.hasClass('child') ? $tr.prev() : $tr;

            // Pega o índice da linha
            linhaSelecionadaFoto = table.row($actualTr).index();

            console.log("Linha selecionada:", linhaSelecionadaFoto);

            // Pega os dados da linha
            const rowData = table.row(linhaSelecionadaFoto).data();
            const fotoAtual = rowData?.imagemOcorrencia || "";

            const temFoto = fotoAtual && fotoAtual.toLowerCase() !== "null" && fotoAtual !== "";

            // Exibe a foto atual
            imgEl.src = temFoto ? (BASE + encodeURIComponent(fotoAtual)) : (BASE + "semimagem.jpg");

            console.log("Foto carregada:", fotoAtual);

            // ===== MODO VISUALIZAÇÃO: Oculta controles de upload =====
            const modoVisualizacao = window.modoVisualizacaoFoto === true;
            
            // Elementos a ocultar em modo visualização
            const elementosUpload = [
                "#txtFileItem", "#txtFileItemNovo",      // Inputs de arquivo
                "#divUploadFoto", "#divControlesUpload", // Containers de upload
                ".upload-container", ".k-upload",        // Kendo upload
                "#btnGravarFoto", "#btnSalvarFoto",      // Botões de gravar
                "#lblSelecionarFoto", "#lblInstrucaoUpload" // Labels de instrução
            ];
            
            elementosUpload.forEach(selector =>
            {
                const el = modalEl.querySelector(selector) || document.querySelector(selector);
                if (el)
                {
                    el.style.display = modoVisualizacao ? "none" : "";
                }
            });
            
            // Também oculta o input file pelo ID mais comum
            const inputFile = document.getElementById("txtFileItemNovo");
            if (inputFile)
            {
                const wrapper = inputFile.closest(".mb-3, .form-group, .upload-wrapper");
                if (wrapper)
                {
                    wrapper.style.display = modoVisualizacao ? "none" : "";
                } else
                {
                    inputFile.style.display = modoVisualizacao ? "none" : "";
                }
            }
            
            // Altera o título do modal em modo visualização
            const modalTitle = modalEl.querySelector(".modal-title");
            if (modalTitle)
            {
                modalTitle.textContent = modoVisualizacao ? "Visualizar Foto" : "Foto do Item";
            }
            
            // Oculta botão de gravar no footer
            const footerButtons = modalEl.querySelectorAll(".modal-footer button:not([data-bs-dismiss]), .modal-footer .btn-primary, .modal-footer .btn-success");
            footerButtons.forEach(btn =>
            {
                if (btn.textContent.toLowerCase().includes("gravar") || 
                    btn.textContent.toLowerCase().includes("salvar") ||
                    btn.classList.contains("btn-primary") ||
                    btn.classList.contains("btn-success"))
                {
                    btn.style.display = modoVisualizacao ? "none" : "";
                }
            });

            // ===== GARANTE que botões de FECHAR ficam HABILITADOS =====
            const botoesFechar = modalEl.querySelectorAll('[data-bs-dismiss="modal"], .btn-vinho, #btnFecharModal');
            botoesFechar.forEach(btnFechar =>
            {
                btnFechar.removeAttribute("aria-disabled");
                btnFechar.removeAttribute("tabindex");
                btnFechar.disabled = false;
                btnFechar.style.opacity = "1";
                btnFechar.style.pointerEvents = "auto";
                btnFechar.style.cursor = "pointer";
            });

        } catch (error)
        {
            console.error("Erro ao abrir modal:", error);
            imgEl.src = BASE + "semimagem.jpg";
            linhaSelecionadaFoto = -1;
        }
    });

    // Evento hide.bs.modal simplificado
    modalEl.addEventListener('hide.bs.modal', function ()
    {
        // Apenas força limpeza de backdrop
        setTimeout(() =>
        {
            document.querySelectorAll('.modal-backdrop').forEach(backdrop =>
            {
                backdrop.remove();
            });
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 300);
    });
})();

function fecharModaisAbertos()
{
    document.querySelectorAll('.modal.show').forEach(el =>
    {
        // cria a instância se não existir e fecha com segurança
        const inst = bootstrap.Modal.getOrCreateInstance(el);
        inst.hide();
    });
}

//Carrega a foto no controle e redimensiona o painel
//==================================================
$("#txtFile").change(function (event)
{
    try
    {
        var files = event.target.files;
        $("#imgViewer").attr("src", window.URL.createObjectURL(files[0]));
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "change.txtFile", error);
    }
});

$("#txtFileItem").change(function (event)
{
    try
    {
        var files = event.target.files;
        ImagemSelecionada = files[0].name;
        var image = document.getElementById("imgViewerItem");
        image.src = URL.createObjectURL(event.target.files[0]);
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "change.txtFileItem", error);
    }
});

//Desabilita o Drop Zone
//kendo.ui.Upload.fn._supportsDrop = function () { return false; };

//$("#txtFileItem").kendoUpload({
//    async: {
//        saveUrl: "/Uploads/UploadPDF?handler=SaveIMGManutencao",
//        removeUrl: "/Uploads/UploadPDF?handler=RemoveIMGManutencao"
//    },
//    localization: {
//        select: "Selecione a imagem...",
//        headerStatusUploaded: "Arquivo Carregado",
//        uploadSuccess: "Arquivo Carregado com Sucesso"
//    },
//    //validation: {
//    //    allowedExtensions: [".jpg"],
//    //},
//    success: function onSuccess(e)
//    {
//        try
//        {
//            // Aqui poderia colocar algo se quiser tratar upload com sucesso
//        } catch (error)
//        {
//            TratamentoErroComLinha("manutencao.js", "onSuccess.txtFileItem", error);
//        }
//    }
//});

//Desabilita o Drop Zone
//kendo.ui.Upload.fn._supportsDrop = function () { return false; };

//$("#txtFileItemNovo").kendoUpload({
//    async: {
//        saveUrl: "/Uploads/UploadPDF?handler=SaveIMGManutencaoNovo",
//        removeUrl: "/Uploads/UploadPDF?handler=RemoveIMGManutencaoNovo"
//    },
//    localization: {
//        select: "Selecione a imagem...",
//        headerStatusUploaded: "Arquivo Carregado",
//        uploadSuccess: "Arquivo Carregado com Sucesso"
//    },
//    validation: {
//        allowedExtensions: [".jpg"],
//    },
//    success: function onSuccess(e)
//    {
//        try
//        {
//            var files = e.files;
//            ImagemSelecionada = files[0].name;
//            $('#imgViewerNovo').attr('src', "/DadosEditaveis/ImagensOcorrencias/" + files[0].name);
//        } catch (error)
//        {
//            TratamentoErroComLinha("manutencao.js", "onSuccess.txtFileItemNovo", error);
//        }
//    }
//});

//// Botão Inserir Foto Item de Ocorrência do Modal
//$("#btnAdicionarFoto").click(function (e) {
//    try
//    {
//        e.preventDefault();

//        //Pega o arquivo de imagem selecionado
//        ImagemOcorrencia = ImagemSelecionada;

//        dataTableItens.cell(LinhaSelecionada, 10).data(ImagemOcorrencia).draw();

//        $("#modalFotoManutencao").hide();
//        $("div").removeClass("modal-backdrop");
//        $("body").removeClass("modal-open");
//    }
//    catch (error)
//    {
//        TratamentoErroComLinha("manutencao.js", "click.btnAdicionarFoto", error);
//    }
//});

function fnExibeReserva()
{
    try
    {
        if (document.getElementById("lstReserva").value === "1")
        {
            document.getElementById("divReserva").style.display = "block";
        } else
        {
            document.getElementById("divReserva").style.display = "none";
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "fnExibeReserva", error);
    }
}

// --------------- Cria a tabela de Itens da OS-----------------
// =============================================================

$(document).ready(function ()
{
    try
    {
        // Esconde blocos
        document.getElementById("divOcorrencias").style.display = "none";
        document.getElementById("divPendencias").style.display = "none";
        document.getElementById("divItens").style.display = "none";

        //if (document.getElementById("txtManutencaoId").value != null)
        //{
        //    manutencaoId = document.getElementById("txtManutencaoId").value;
        //}

        if (manutencaoId != null && manutencaoId != "00000000-0000-0000-0000-000000000000")
        {
            //Pega ID da Manutenção
            ManutencaoId = manutencaoId;

            //Impede mudança do Veículo (Syncfusion)
            var lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
            lstVeiculo.enabled = false;

            //Preenche a Lista de Itens da OS
            VeiculoChange();

            // Reserva
            var ReservaEnviado = manutencaoReservaEnviado;
            if (ReservaEnviado === true)
            {
                document.getElementById("lstReserva").value = "1";
                fnExibeReserva();
            } else if (ReservaEnviado === false)
            {
                document.getElementById("lstReserva").value = "0";
            }

            // Manutenção Preventiva
            //var ManutencaoPreventiva = manutencaoManutencaoPreventiva;
            //if (ManutencaoPreventiva === 'True')
            //{
            //    document.getElementById("chkManutencaoPreventiva").checked = true;
            //    document.getElementById("txtQuilometragemManutencao").style.display = "block";
            //}

            // ===== Desabilita TUDO se estiver Fechada =====
            var StatusOS = manutencaoStatusOS;

            if (StatusOS === "Fechada")
            {
                // Esconde o botão Atualizar
                $("#btnEdita").hide();
                $("#btnAdiciona").hide();

                // Mantém apenas o botão Voltar à Lista ativo
                var $keepBtn = $("#btnVoltarLista")
                    .add("#btnVoltar")
                    .add('a[href*="ListaManutencao"]')
                    .add("a.btn.btn-vinho.form-control");

                // Inclui também TODOS os ancestrais do botão, para não bloquear o clique por herança de pointer-events
                var $keep = $keepBtn.add($keepBtn.parents());

                // Desabilita inputs/selects/textarea/button (exceto o botão de voltar)
                $("input, select, textarea, button")
                    .not($keep)
                    .prop("disabled", true)
                    .css("opacity", 0.5);

                // Links e botões visuais (.btn): impedem clique mas mantêm hover/tooltip
                $("a, .btn")
                    .not($keep)
                    .attr("aria-disabled", "true")
                    .attr("tabindex", "-1")
                    .on("click.block", function (e)
                    {
                        try
                        {
                            e.preventDefault();
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha(
                                "manutencao.js",
                                "callback@$.not.attr.attr.on#1",
                                error,
                            );
                        }
                    })
                    .css("opacity", 0.5);

                // Desabilita DIVs clicáveis sem bloquear os ancestrais do botão
                // Obs: aplicar pointer-events em todas as divs pode bloquear a página toda, por isso poupamos ancestrais.
                $("div").not($keep).css("pointer-events", "none");

                // Opcional: cursor de "não permitido" nos elementos desabilitados
                $(
                    'input:disabled, select:disabled, textarea:disabled, button:disabled, a[aria-disabled="true"], .btn[aria-disabled="true"]',
                ).css("cursor", "not-allowed");

                // ===== GARANTE que o botão Voltar fica HABILITADO =====
                var $btnVoltar = $("#btnVoltar, a[href*='ListaManutencao']");
                $btnVoltar
                    .removeAttr("aria-disabled")
                    .removeAttr("tabindex")
                    .off("click.block")
                    .css({
                        "opacity": "1",
                        "pointer-events": "auto",
                        "cursor": "pointer"
                    });
                $btnVoltar.parents().css("pointer-events", "auto");
            }
        } else
        {
            // Nova OS
            document.getElementById("txtDataSolicitacao").value =
                moment(Date()).format("YYYY-MM-DD");
        }

        try
        {
            DataTable.datetime("DD/MM/YYYY");

            dataTableItens = $("#tblItens").DataTable({
                autoWidth: false,
                dom: "Bfrtip",
                bFilter: false,
                buttons: [],
                aaSorting: [],
                columnDefs: [
                    { targets: 0, className: "text-center", width: "5%" },
                    { targets: 1, className: "text-center", width: "4%" },
                    { targets: 2, className: "text-center", width: "4%" },
                    { targets: 3, className: "text-left", width: "20%" },
                    {
                        targets: 4,
                        className: "text-center",
                        width: "30%",
                        render: function (data, type, full, meta)
                        {
                            try
                            {
                                return `<div class="text-center">
                            <a aria-label="&#9881; (${full.descricao})"
                               data-microtip-position="top"
                               role="tooltip"
                               data-microtip-size="medium"
                               style="cursor:pointer;"
                               data-id='${data}'>${full.resumo}</a></div>`;
                            }
                            catch (error)
                            {
                                Alerta.TratamentoErroComLinha(
                                    "manutencao.js",
                                    "render",
                                    error,
                                );
                            }
                        },
                    },
                    {
                        targets: 5,
                        className: "text-center",
                        width: "5%",
                        render: function (data, type, full, meta)
                        {
                            const foto = full.imagemOcorrencia || "";
                            const fotoAttr = encodeURIComponent(foto);
                            const rowIndex = meta.row;
                            
                            // Define ícone e tooltip baseado no tipo de item
                            const isManual = full.tipoItem === "Inserção Manual";
                            const iconeRemover = isManual 
                                ? "fa-trash-can" 
                                : "fa-up-from-bracket";
                            const tooltipRemover = isManual 
                                ? "Excluir Item" 
                                : "Devolver Item";

                            return `
                                        <div class="col-acao">
                                            <div class="d-flex gap-2 justify-content-center">
                                                <button type="button"
                                                        class="btn btn-sm btn-delete js-remover-item"
                                                        style="background: linear-gradient(135deg, #dc3545, #c82333); 
                                                               color: white; 
                                                               border: none; 
                                                               border-radius: 5px; 
                                                               padding: 6px 8px;
                                                               transition: all 0.3s ease;
                                                               box-shadow: 0 2px 4px rgba(220,53,69,0.3);"
                                                        data-item-id="${full.itemManutencaoId}"
                                                        data-ejtip="${tooltipRemover}"
                                                        onmouseover="this.style.transform='translateY(-2px)'; 
                                                                   this.style.boxShadow='0 6px 20px rgba(220,53,69,0.6), 0 0 15px rgba(220,53,69,0.4)'"
                                                        onmouseout="this.style.transform='translateY(0)'; 
                                                                  this.style.boxShadow='0 2px 4px rgba(220,53,69,0.3)'">
                                                  <i class="fa-duotone ${iconeRemover}"
                                                     style="--fa-primary-color: #ffffff; 
                                                            --fa-secondary-color: #ffebee; 
                                                            --fa-secondary-opacity: 0.8;"></i>
                                                </button>
                    
                                                ${(() => {
                                                    const temFoto = foto && foto !== '' && foto !== 'null' && foto.toLowerCase() !== 'semimagem.jpg';
                                                    if (temFoto) {
                                                        return `<button type="button"
                                                        class="btn btn-sm btnFoto js-ver-foto"
                                                        style="background: linear-gradient(135deg, #17a2b8, #138496); 
                                                               color: white; 
                                                               border: none; 
                                                               border-radius: 5px; 
                                                               padding: 6px 8px;
                                                               transition: all 0.3s ease;
                                                               box-shadow: 0 2px 4px rgba(23,162,184,0.3);"
                                                        data-bs-toggle="modal" 
                                                        data-bs-target="#modalFotoManutencao"
                                                        data-foto="${fotoAttr}"
                                                        data-row-index="${rowIndex}"
                                                        data-ejtip="Ver Foto"
                                                        onmouseover="this.style.transform='translateY(-2px)'; 
                                                                   this.style.boxShadow='0 6px 20px rgba(23,162,184,0.6), 0 0 15px rgba(23,162,184,0.4)'"
                                                        onmouseout="this.style.transform='translateY(0)'; 
                                                                  this.style.boxShadow='0 2px 4px rgba(23,162,184,0.3)'">
                                                  <i class="fa-duotone fa-camera-polaroid"
                                                     style="--fa-primary-color: #ffffff; 
                                                            --fa-secondary-color: #e1f7fe; 
                                                            --fa-secondary-opacity: 0.8;"></i>
                                                </button>`;
                                                    } else {
                                                        return `<button type="button"
                                                        class="btn btn-sm btnFoto js-ver-foto"
                                                        style="background: linear-gradient(135deg, #fd7e14, #e96b02); 
                                                               color: white; 
                                                               border: none; 
                                                               border-radius: 5px; 
                                                               padding: 6px 8px;
                                                               transition: all 0.3s ease;
                                                               box-shadow: 0 2px 4px rgba(253,126,20,0.3);"
                                                        data-bs-toggle="modal" 
                                                        data-bs-target="#modalFotoManutencao"
                                                        data-foto="${fotoAttr}"
                                                        data-row-index="${rowIndex}"
                                                        data-ejtip="Inserir Foto"
                                                        onmouseover="this.style.transform='translateY(-2px)'; 
                                                                   this.style.boxShadow='0 6px 20px rgba(253,126,20,0.6), 0 0 15px rgba(253,126,20,0.4)'"
                                                        onmouseout="this.style.transform='translateY(0)'; 
                                                                  this.style.boxShadow='0 2px 4px rgba(253,126,20,0.3)'">
                                                  <i class="fa-duotone fa-camera-viewfinder"
                                                     style="--fa-primary-color: #ffffff; 
                                                            --fa-secondary-color: #fff3e0; 
                                                            --fa-secondary-opacity: 0.8;"></i>
                                                </button>`;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    `;
                        }
                    },
                    { targets: 6, className: "text-center", width: "10%", visible: false },
                    { targets: 7, className: "text-center", width: "10%", visible: false },
                    { targets: 8, className: "text-center", width: "10%", visible: false },
                    { targets: 9, className: "text-center", width: "10%", visible: false },
                    { targets: 10, className: "text-center", width: "10%", visible: false },
                    { targets: 11, className: "text-center", width: "10%", visible: false },
                ],

                responsive: true,
                ajax: {
                    url: "/api/manutencao/ItensOS",
                    data: { Id: ManutencaoId },
                    type: "GET",
                    datatype: "json",
                },
                columns: [
                    { data: "tipoItem" },
                    { data: "numFicha" },
                    { data: "dataItem" },
                    { data: "nomeMotorista" },
                    { data: "resumo" },
                    { data: "itemManutencaoId" }, // render acima
                    { data: "itemManutencaoId" },
                    { data: "descricao" },
                    { data: "resumo" },
                    { data: "motoristaId" },
                    { data: "imagemOcorrencia" },
                    { data: "viagemId" },
                ],

                language: {
                    emptyTable: "Nenhum registro encontrado",
                    info: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                    infoEmpty: "Mostrando 0 até 0 de 0 registros",
                    infoFiltered: "(Filtrados de _MAX_ registros)",
                    infoThousands: ".",
                    loadingRecords: "Carregando...",
                    processing: "Processando...",
                    zeroRecords: "Nenhum registro encontrado",
                    search: "Pesquisar",
                    paginate: {
                        next: "Próximo",
                        previous: "Anterior",
                        first: "Primeiro",
                        last: "Último",
                    },
                    aria: {
                        sortAscending: ": Ordenar colunas de forma ascendente",
                        sortDescending: ": Ordenar colunas de forma descendente",
                    },
                    select: {
                        rows: { _: "Selecionado %d linhas", 1: "Selecionado 1 linha" },
                        cells: { 1: "1 célula selecionada", _: "%d células selecionadas" },
                        columns: { 1: "1 coluna selecionada", _: "%d colunas selecionadas" },
                    },
                    buttons: {
                        copySuccess: {
                            1: "Uma linha copiada com sucesso",
                            _: "%d linhas copiadas com sucesso",
                        },
                        collection:
                            'Coleção  <span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span>',
                        colvis: "Visibilidade da Coluna",
                        colvisRestore: "Restaurar Visibilidade",
                        copy: "Copiar",
                        copyKeys:
                            "Pressione ctrl ou u2318 + C para copiar os dados da tabela para a área de transferência do sistema. Para cancelar, clique nesta mensagem ou pressione Esc..",
                        copyTitle: "Copiar para a Área de Transferência",
                        csv: "CSV",
                        excel: "Excel",
                        pageLength: {
                            "-1": "Mostrar todos os registros",
                            _: "Mostrar %d registros",
                        },
                        pdf: "PDF",
                        print: "Imprimir",
                    },
                    autoFill: {
                        cancel: "Cancelar",
                        fill: "Preencher todas as células com",
                        fillHorizontal: "Preencher células horizontalmente",
                        fillVertical: "Preencher células verticalmente",
                    },
                    lengthMenu: "Exibir _MENU_ resultados por página",
                    searchBuilder: {
                        add: "Adicionar Condição",
                        button: { 0: "Construtor de Pesquisa", _: "Construtor de Pesquisa (%d)" },
                        clearAll: "Limpar Tudo",
                        condition: "Condição",
                        conditions: {
                            date: {
                                after: "Depois",
                                before: "Antes",
                                between: "Entre",
                                empty: "Vazio",
                                equals: "Igual",
                                not: "Não",
                                notBetween: "Não Entre",
                                notEmpty: "Não Vazio",
                            },
                            number: {
                                between: "Entre",
                                empty: "Vazio",
                                equals: "Igual",
                                gt: "Maior Que",
                                gte: "Maior ou Igual a",
                                lt: "Menor Que",
                                lte: "Menor ou Igual a",
                                not: "Não",
                                notBetween: "Não Entre",
                                notEmpty: "Não Vazio",
                            },
                            string: {
                                contains: "Contém",
                                empty: "Vazio",
                                endsWith: "Termina Com",
                                equals: "Igual",
                                not: "Não",
                                notEmpty: "Não Vazio",
                                startsWith: "Começa Com",
                            },
                            array: {
                                contains: "Contém",
                                empty: "Vazio",
                                equals: "Igual à",
                                not: "Não",
                                notEmpty: "Não vazio",
                                without: "Não possui",
                            },
                        },
                        data: "Data",
                        deleteTitle: "Excluir regra de filtragem",
                        logicAnd: "E",
                        logicOr: "Ou",
                        title: { 0: "Construtor de Pesquisa", _: "Construtor de Pesquisa (%d)" },
                        value: "Valor",
                    },
                    searchPanes: {
                        clearMessage: "Limpar Tudo",
                        collapse: { 0: "Painéis de Pesquisa", _: "Painéis de Pesquisa (%d)" },
                        count: "{total}",
                        countFiltered: "{shown} ({total})",
                        emptyPanes: "Nenhum Painel de Pesquisa",
                        loadMessage: "Carregando Painéis de Pesquisa...",
                        title: "Filtros Ativos",
                    },
                    thousands: ".",
                    datetime: {
                        previous: "Anterior",
                        next: "Próximo",
                        hours: "Hora",
                        minutes: "Minuto",
                        seconds: "Segundo",
                        amPm: ["am", "pm"],
                        unknown: "-",
                        months: {
                            0: "Janeiro",
                            1: "Fevereiro",
                            2: "Março",
                            3: "Abril",
                            4: "Maio",
                            5: "Junho",
                            6: "Julho",
                            7: "Agosto",
                            8: "Setembro",
                            9: "Outubro",
                            10: "Novembro",
                            11: "Dezembro",
                        },
                        weekdays: [
                            "Domingo",
                            "Segunda-feira",
                            "Terça-feira",
                            "Quarta-feira",
                            "Quinte-feira",
                            "Sexta-feira",
                            "Sábado",
                        ],
                    },
                    editor: {
                        close: "Fechar",
                        create: { button: "Novo", submit: "Criar", title: "Criar novo registro" },
                        edit: { button: "Editar", submit: "Atualizar", title: "Editar registro" },
                        error: {
                            system: 'Ocorreu um erro no sistema (<a target="\\" rel="nofollow" href="\\">Mais informações</a>).',
                        },
                        multi: {
                            noMulti:
                                "Essa entrada pode ser editada individualmente, mas não como parte do grupo",
                            restore: "Desfazer alterações",
                            title: "Multiplos valores",
                            info: "Os itens selecionados contêm valores diferentes...",
                        },
                        remove: {
                            button: "Remover",
                            confirm: {
                                _: "Tem certeza que quer deletar %d linhas?",
                                1: "Tem certeza que quer deletar 1 linha?",
                            },
                            submit: "Remover",
                            title: "Remover registro",
                        },
                    },
                    decimal: ",",
                },
                width: "100%",
                
                // Callback executado após cada draw da tabela
                drawCallback: function(settings)
                {
                    try
                    {
                        // Se OS está Fechada/Cancelada, reabilita botões de foto para visualização
                        var statusOS = window.manutencaoStatusOS || manutencaoStatusOS || "";
                        var osFechadaOuCancelada = (statusOS === "Fechada" || statusOS === "Cancelada");
                        
                        console.log("drawCallback - Status OS:", statusOS, "| Fechada/Cancelada:", osFechadaOuCancelada);
                        
                        if (osFechadaOuCancelada)
                        {
                            // Reabilita botões de foto para visualização
                            var $botoesF = $("#tblItens .js-ver-foto, #tblItens .btnFoto, #tblItens [data-bs-target='#modalFotoManutencao']");
                            console.log("Botões de foto encontrados:", $botoesF.length);
                            
                            $botoesF.each(function() {
                                $(this)
                                    .removeAttr("aria-disabled")
                                    .removeAttr("tabindex")
                                    .off("click.block")
                                    .prop("disabled", false)
                                    .css({
                                        "opacity": "1",
                                        "pointer-events": "auto",
                                        "cursor": "pointer"
                                    });
                            });
                            
                            // Habilita pointer-events em toda a estrutura da tabela
                            $("#tblItens").css("pointer-events", "auto");
                            $("#tblItens tbody").css("pointer-events", "auto");
                            $("#tblItens td").css("pointer-events", "auto");
                            $botoesF.parents("td, tr, div, .col-acao").css("pointer-events", "auto");
                            
                            // Desabilita botões de remover (mantém desabilitados)
                            var $botoesRemover = $("#tblItens .js-remover-item, #tblItens .btn-delete");
                            $botoesRemover
                                .prop("disabled", true)
                                .css({
                                    "opacity": "0.35",
                                    "pointer-events": "none",
                                    "cursor": "not-allowed"
                                });
                        }
                    }
                    catch (error)
                    {
                        console.error("Erro no drawCallback:", error);
                    }
                }
            });
        }
        catch (error)
        {
            TratamentoErroComLinha("manutencao.js", "document.ready.dataTableItensInit", error);
        }
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("manutencao.js", "callback@$.ready#0", error);
    }
});

//$('#chkManutencaoPreventiva').on('change', function ()
//{
//    try
//    {
//        if (document.getElementById("chkManutencaoPreventiva").checked === true)
//        {
//            document.getElementById("txtQuilometragemManutencao").style.display = "block";
//        } else
//        {
//            document.getElementById("txtQuilometragemManutencao").style.display = "none";
//            document.getElementById("txtQuilometragemManutencao").value = "";
//        }
//    } catch (error)
//    {
//        TratamentoErroComLinha("manutencao.js", "change.chkManutencaoPreventiva", error);
//    }
//});

$("#btnAdiciona").click(function (event)
{
    try
    {
        event.preventDefault();
        InsereRegistro();
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "click.btnAdiciona", error);
    }
});

$("#btnEdita").click(function (event)
{
    try
    {
        event.preventDefault();
        InsereRegistro();
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "click.btnEdita", error);
    }
});

function PreenchePagina()
{
    try
    {
        // Obtém VeiculoId do componente Syncfusion
        VeiculoId = document.getElementById("lstVeiculo").ej2_instances[0].value;

        if (VeiculoId != "" && VeiculoId != null)
        {
            document.getElementById("divOcorrencias").style.display = "block";
            document.getElementById("divPendencias").style.display = "block";
            document.getElementById("divItens").style.display = "block";

            try
            {
                if ($("#txtOS").val() === "" || $("#txtOS").val() === null)
                {
                    // Monta o número da OS
                    document.getElementById("txtDataSolicitacao").value =
                        moment(Date()).format("YYYY-MM-DD");
                    let DataOS = document.getElementById("txtDataSolicitacao").value;
                    console.log("DataOS 1: " + DataOS);
                    DataOS =
                        DataOS.substring(0, 4) +
                        "." +
                        DataOS.substring(5, 7) +
                        "." +
                        DataOS.substring(8, 10) +
                        "-";
                    console.log("DataOS 2: " + DataOS);
                    let VeiculoPlaca = document.getElementById("lstVeiculo").ej2_instances[0].text;
                    let indiceEspaco = VeiculoPlaca.indexOf(" ");
                    VeiculoPlaca = VeiculoPlaca.substring(0, indiceEspaco);
                    VeiculoPlaca = VeiculoPlaca.replace("-", "").replace(" ", "");
                    console.log("VeiculoPlaca: " + VeiculoPlaca);
                    $("#txtOS").attr("value", DataOS + VeiculoPlaca);
                }
            }
            catch (error)
            {
                TratamentoErroComLinha("manutencao.js", "VeiculoChange.MontaNumeroOS", error);
            }

            // BLOCO DE LINGUAGEM EM VARIÁVEL PARA USO EM AMBOS OS DATATABLES
            var languageDataTable = {
                emptyTable: "Nenhum registro encontrado",
                info: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 até 0 de 0 registros",
                infoFiltered: "(Filtrados de _MAX_ registros)",
                loadingRecords: "Carregando...",
                processing: "Processando...",
                zeroRecords: "Nenhum registro encontrado",
                search: "Pesquisar",
                paginate: {
                    next: "Próximo",
                    previous: "Anterior",
                    first: "Primeiro",
                    last: "Último",
                },
                value: "Valor",
                leftTitle: "Critérios Externos",
                rightTitle: "Critérios Internos",
                searchPanes: {
                    clearMessage: "Limpar Tudo",
                    collapse: {
                        0: "Painéis de Pesquisa",
                        _: "Painéis de Pesquisa (%d)",
                    },
                    count: "{total}",
                    countFiltered: "{shown} ({total})",
                    emptyPanes: "Nenhum Painel de Pesquisa",
                    loadMessage: "Carregando Painéis de Pesquisa...",
                    title: "Filtros Ativos",
                },
                thousands: ".",
                datetime: {
                    previous: "Anterior",
                    next: "Próximo",
                    hours: "Hora",
                    minutes: "Minuto",
                    seconds: "Segundo",
                    amPm: ["am", "pm"],

                    unknown: "-",
                    months: {
                        0: "Janeiro",
                        1: "Fevereiro",
                        2: "Março",
                        3: "Abril",
                        4: "Maio",
                        5: "Junho",
                        6: "Julho",
                        7: "Agosto",
                        8: "Setembro",
                        9: "Outubro",
                        10: "Novembro",
                        11: "Dezembro",
                    },
                    weekdays: [
                        "Domingo",
                        "Segunda-feira",
                        "Terça-feira",
                        "Quarta-feira",
                        "Quinte-feira",
                        "Sexta-feira",
                        "Sábado",
                    ],
                },
                editor: {
                    close: "Fechar",
                    create: {
                        button: "Novo",
                        submit: "Criar",
                        title: "Criar novo registro",
                    },
                    edit: {
                        button: "Editar",
                        submit: "Atualizar",
                        title: "Editar registro",
                    },
                    error: {
                        system: 'Ocorreu um erro no sistema (<a target="\\" rel="nofollow" href="\\">Mais informações<\/a>).',
                    },
                    multi: {
                        noMulti:
                            "Essa entrada pode ser editada individualmente, mas não como parte do grupo",
                        restore: "Desfazer alterações",
                        title: "Multiplos valores",
                        info: "Os itens selecionados contêm valores diferentes para esta entrada. Para editar e definir todos os itens para esta entrada com o mesmo valor, clique ou toque aqui, caso contrário, eles manterío seus valores individuais.",
                    },
                    remove: {
                        button: "Remover",
                        confirm: {
                            _: "Tem certeza que quer deletar %d linhas?",
                            1: "Tem certeza que quer deletar 1 linha?",
                        },
                        submit: "Remover",
                        title: "Remover registro",
                    },
                },
                decimal: ",",
            };

            // =====================================================================
            // OS FECHADA/CANCELADA: NÃO preencher grids de Ocorrências/Pendências disponíveis
            // =====================================================================
            var osFechada = typeof manutencaoStatusOS !== "undefined" && 
                           (manutencaoStatusOS === "Fechada" || manutencaoStatusOS === "Cancelada");

            // Esconde as divs de Ocorrências e Pendências disponíveis se OS estiver Fechada/Cancelada
            if (osFechada)
            {
                document.getElementById("divOcorrencias").style.display = "none";
                document.getElementById("divPendencias").style.display = "none";
            }

            try
            {
                DataTable.datetime("DD/MM/YYYY");

                // Configura dataTableOcorrencias - APENAS se OS NÃO estiver Fechada/Cancelada
                if (!osFechada)
                {
                    if (typeof dataTableOcorrencias !== "undefined" && dataTableOcorrencias)
                    {
                        dataTableOcorrencias.destroy();
                    }
                    $("#tblOcorrencia tbody").empty();

                    dataTableOcorrencias = $("#tblOcorrencia").DataTable({
                    autoWidth: false,
                    dom: "Bfrtip",
                    bFilter: false,
                    buttons: [],
                    aaSorting: [],
                    columnDefs: [
                        { targets: 0, className: "text-center", width: "4%" },
                        { targets: 1, className: "text-center", width: "4%" },
                        { targets: 2, className: "text-left", width: "20%" },
                        {
                            targets: 3,
                            className: "text-center",
                            width: "30%",
                            render: function (data, type, full)
                            {
                                try
                                {
                                    return `<div class="text-center">
                                                <a aria-label="&#9881; (${removeHTML(full.descricaoOcorrencia)})" data-microtip-position="top" role="tooltip" data-microtip-size="medium" style="cursor:pointer;"
                                                data-id='${data}'>${full.resumoOcorrencia}</a></div>`;
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "manutencao.js",
                                        "render",
                                        error,
                                    );
                                }
                            },
                        },
                        { targets: 4, className: "text-center", width: "5%" },
                        { targets: 5, className: "text-center", width: "5%", visible: false },
                        { targets: 6, className: "text-center", width: "5%", visible: false },
                        { targets: 7, className: "text-center", width: "10%", visible: false },
                        { targets: 8, className: "text-center", width: "10%", visible: false },
                        //{ targets: 9, className: "text-center", width: "1%" },
                    ],

                    responsive: true,
                    ajax: {
                        url: "/api/manutencao/OcorrenciasVeiculosManutencao",
                        data: { id: VeiculoId },
                        type: "GET",
                        datatype: "json",
                    },
                    columns: [
                        { data: "noFichaVistoria" },
                        { data: "dataInicial" },
                        { data: "nomeMotorista" },
                        { data: "resumoOcorrencia" },
                        {
                            data: "viagemId",
                            render: function (data, type, full)
                            {
                                try
                                {
                                    return `
                                                <div class="col-acao">
                                                    <div class="d-flex gap-2 justify-content-center">
                                                        <button type="button"
                                                                class="btn btn-sm js-selecionar-ocorrencia"
                                                                style="background: linear-gradient(135deg, #28a745, #218838); 
                                                                       color: white; 
                                                                       border: none; 
                                                                       border-radius: 5px; 
                                                                       padding: 6px 8px;
                                                                       transition: all 0.3s ease;
                                                                       box-shadow: 0 2px 4px rgba(40,167,69,0.3);"
                                                                data-ejtip="Selecionar Ocorrência"
                                                                data-viagem-id=${JSON.stringify(full.viagemId)}
                                                                data-ficha=${JSON.stringify(full.noFichaVistoria)}
                                                                data-data=${JSON.stringify(full.dataInicial)}
                                                                data-motorista=${JSON.stringify(full.nomeMotorista)}
                                                                data-resumo=${JSON.stringify(full.resumoOcorrencia || "")}
                                                                data-descricao=${JSON.stringify(removeHTML(full.descricaoOcorrencia || ""))}
                                                                data-motorista-id=${JSON.stringify(full.motoristaId)}
                                                                data-imagem=${JSON.stringify(full.imagemOcorrencia)}
                                                                data-item-id=${JSON.stringify(full.itemManutencaoId)}
                                                                onmouseover="this.style.transform='translateY(-2px)'; 
                                                                           this.style.boxShadow='0 6px 20px rgba(40,167,69,0.6), 0 0 15px rgba(40,167,69,0.4)'"
                                                                onmouseout="this.style.transform='translateY(0)'; 
                                                                          this.style.boxShadow='0 2px 4px rgba(40,167,69,0.3)'">
                                                          <i class="fa-duotone fa-arrow-down-to-bracket"
                                                             style="--fa-primary-color: #ffffff; 
                                                                    --fa-secondary-color: #e8f5e8; 
                                                                    --fa-secondary-opacity: 0.8;"></i>
                                                        </button>
                        
                                                        ${(() => {
                                                            const img = full.imagemOcorrencia || '';
                                                            const temFoto = img && img !== '' && img !== 'null' && img.toLowerCase() !== 'semimagem.jpg';
                                                            if (temFoto) {
                                                                return `<button type="button"
                                                                class="btn btn-sm js-ver-foto"
                                                                style="background: linear-gradient(135deg, #17a2b8, #138496); 
                                                                       color: white; 
                                                                       border: none; 
                                                                       border-radius: 5px; 
                                                                       padding: 6px 8px;
                                                                       transition: all 0.3s ease;
                                                                       box-shadow: 0 2px 4px rgba(23,162,184,0.3);"
                                                                data-ejtip="Ver Foto"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#modalFotoOcorrencia"
                                                                data-viagem-id=${JSON.stringify(full.viagemId)}
                                                                data-imagem=${JSON.stringify(full.imagemOcorrencia)}
                                                                data-item-id=${JSON.stringify(full.itemManutencaoId)}
                                                                onmouseover="this.style.transform='translateY(-2px)'; 
                                                                           this.style.boxShadow='0 6px 20px rgba(23,162,184,0.6), 0 0 15px rgba(23,162,184,0.4)'"
                                                                onmouseout="this.style.transform='translateY(0)'; 
                                                                          this.style.boxShadow='0 2px 4px rgba(23,162,184,0.3)'">
                                                          <i class="fa-duotone fa-camera-polaroid"
                                                             style="--fa-primary-color: #ffffff; 
                                                                    --fa-secondary-color: #e1f7fe; 
                                                                    --fa-secondary-opacity: 0.8;"></i>
                                                        </button>`;
                                                            } else {
                                                                return `<button type="button"
                                                                class="btn btn-sm"
                                                                style="background: linear-gradient(135deg, #9e9e9e, #757575); 
                                                                       color: white; 
                                                                       border: none; 
                                                                       border-radius: 5px; 
                                                                       padding: 6px 8px;
                                                                       opacity: 0.6;
                                                                       cursor: not-allowed;
                                                                       box-shadow: none;"
                                                                data-ejtip="Sem Foto"
                                                                disabled>
                                                          <i class="fa-duotone fa-camera-slash"
                                                             style="--fa-primary-color: #ffffff; 
                                                                    --fa-secondary-color: #e0e0e0; 
                                                                    --fa-secondary-opacity: 0.8;"></i>
                                                        </button>`;
                                                            }
                                                        })()}
                                                    </div>
                                                </div>
                                            `;
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "ocorrencias.js",
                                        "render",
                                        error,
                                    );
                                }
                            },
                        }, { data: "descricaoOcorrencia" },
                        { data: "motoristaId" },
                        { data: "imagemOcorrencia" },
                        { data: "itemManutencaoId" },
                        //{
                        //    data: null,
                        //    render: function (data, type, row, meta) {
                        //        try
                        //        {
                        //            return meta.row + meta.settings._iDisplayStart + 1;
                        //        }
                        //        catch (error)
                        //        {
                        //            Alerta.TratamentoErroComLinha(
                        //                "manutencao.js",
                        //                "render",
                        //                error,
                        //            );
                        //        }
                        //    },
                        //},
                    ],

                    language: languageDataTable,
                    width: "100%",
                });
                } // Fim do if (!osFechada) para dataTableOcorrencias
            }
            catch (error)
            {
                TratamentoErroComLinha(
                    "manutencao.js",
                    "VeiculoChange.DataTableOcorrencias",
                    error,
                );
            }
            try
            {
                // Configura dataTablePendencias - APENAS se OS NÃO estiver Fechada/Cancelada
                if (!osFechada)
                {
                    if (typeof dataTablePendencias !== "undefined" && dataTablePendencias)
                    {
                        dataTablePendencias.destroy();
                    }
                    $("#tblPendencia tbody").empty();

                    dataTablePendencias = $("#tblPendencia").DataTable({
                    autoWidth: false,
                    dom: "Bfrtip",
                    bFilter: false,
                    buttons: [],
                    aaSorting: [],
                    columnDefs: [
                        { targets: 0, className: "text-center", width: "4%" },
                        { targets: 1, className: "text-center", width: "4%" },
                        { targets: 2, className: "text-left", width: "20%" },
                        {
                            targets: 3,
                            className: "text-center",
                            width: "30%",
                            render: function (data, type, full)
                            {
                                try
                                {
                                    return `<div class="text-center">
                                            <a aria-label="&#9881; (${removeHTML(full.descricao)})" data-microtip-position="top" role="tooltip" data-microtip-size="medium" style="cursor:pointer;"
                                            data-id='${data}'>${full.resumo}</a></div>`;
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "manutencao.js",
                                        "render",
                                        error,
                                    );
                                }
                            },
                        },
                        { targets: 4, className: "text-center", width: "5%" },
                        { targets: 5, className: "text-center", width: "5%", visible: false },
                        { targets: 6, className: "text-center", width: "5%", visible: false },
                        { targets: 7, className: "text-center", width: "10%", visible: false },
                        { targets: 8, className: "text-center", width: "10%", visible: false },
                        { targets: 9, className: "text-center", width: "10%", visible: false },
                        //{ targets: 10, className: "text-center", width: "1%" },
                    ],

                    responsive: true,
                    ajax: {
                        url: "/api/manutencao/OcorrenciasVeiculosPendencias",
                        data: { id: VeiculoId },
                        type: "GET",
                        datatype: "json",
                    },
                    columns: [
                        { data: "numFicha" },
                        { data: "dataItem" },
                        { data: "nome" },
                        { data: "resumo" },
                        {
                            data: "itemManutencaoId",
                            render: function (data, type, full, meta)
                            {
                                try
                                {
                                    const foto = full.imagemOcorrencia || "";
                                    const fotoAttr = encodeURIComponent(foto);
                                    const rowIndex = meta.row;

                                    return `
                                            <div class="col-acao">
                                                <div class="d-flex gap-2 justify-content-center">
                                                    <button type="button"
                                                            class="btn btn-sm js-selecionar-pendencia"
                                                            style="background: linear-gradient(135deg, #28a745, #218838); 
                                                                   color: white; 
                                                                   border: none; 
                                                                   border-radius: 5px; 
                                                                   padding: 6px 8px;
                                                                   transition: all 0.3s ease;
                                                                   box-shadow: 0 2px 4px rgba(40,167,69,0.3);"
                                                            data-ejtip="Selecionar Pendência"
                                                            data-viagem-id="${full.viagemId}"
                                                            data-ficha="${full.numFicha}"
                                                            data-data="${full.dataItem}"
                                                            data-nome="${full.nome}"
                                                            data-resumo="${full.resumo}"
                                                            data-descricao="${removeHTML(full.descricao)}"
                                                            data-motorista-id="${full.motoristaId}"
                                                            data-imagem="${full.imagemOcorrencia}"
                                                            data-item-id="${full.itemManutencaoId}"
                                                            onmouseover="this.style.transform='translateY(-2px)'; 
                                                                       this.style.boxShadow='0 6px 20px rgba(40,167,69,0.6), 0 0 15px rgba(40,167,69,0.4)'"
                                                            onmouseout="this.style.transform='translateY(0)'; 
                                                                      this.style.boxShadow='0 2px 4px rgba(40,167,69,0.3)'">
                                                      <i class="fa-duotone fa-arrow-down-to-bracket"
                                                         style="--fa-primary-color: #ffffff; 
                                                                --fa-secondary-color: #e8f5e8; 
                                                                --fa-secondary-opacity: 0.8;"></i>
                                                    </button>
                        
                                                    ${(() => {
                                                        const temFoto = foto && foto !== '' && foto !== 'null' && foto.toLowerCase() !== 'semimagem.jpg';
                                                        if (temFoto) {
                                                            return `<button type="button"
                                                            class="btn btn-sm js-ver-foto-pendencia"
                                                            style="background: linear-gradient(135deg, #17a2b8, #138496); 
                                                                   color: white; 
                                                                   border: none; 
                                                                   border-radius: 5px; 
                                                                   padding: 6px 8px;
                                                                   transition: all 0.3s ease;
                                                                   box-shadow: 0 2px 4px rgba(23,162,184,0.3);"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#modalFotoPendencia"
                                                            data-foto="${fotoAttr}"
                                                            data-row-index="${rowIndex}"
                                                            data-ejtip="Ver Foto"
                                                            onmouseover="this.style.transform='translateY(-2px)'; 
                                                                       this.style.boxShadow='0 6px 20px rgba(23,162,184,0.6), 0 0 15px rgba(23,162,184,0.4)'"
                                                            onmouseout="this.style.transform='translateY(0)'; 
                                                                      this.style.boxShadow='0 2px 4px rgba(23,162,184,0.3)'">
                                                      <i class="fa-duotone fa-camera-polaroid"
                                                         style="--fa-primary-color: #ffffff; 
                                                                --fa-secondary-color: #e1f7fe; 
                                                                --fa-secondary-opacity: 0.8;"></i>
                                                    </button>`;
                                                        } else {
                                                            return `<button type="button"
                                                            class="btn btn-sm"
                                                            style="background: linear-gradient(135deg, #9e9e9e, #757575); 
                                                                   color: white; 
                                                                   border: none; 
                                                                   border-radius: 5px; 
                                                                   padding: 6px 8px;
                                                                   opacity: 0.6;
                                                                   cursor: not-allowed;
                                                                   box-shadow: none;"
                                                            data-ejtip="Sem Foto"
                                                            disabled>
                                                      <i class="fa-duotone fa-camera-slash"
                                                         style="--fa-primary-color: #ffffff; 
                                                                --fa-secondary-color: #e0e0e0; 
                                                                --fa-secondary-opacity: 0.8;"></i>
                                                    </button>`;
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        `;
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "manutencao.js",
                                        "render",
                                        error,
                                    );
                                }
                            },
                        }, { data: "descricao" },
                        { data: "motoristaId" },
                        { data: "imagemOcorrencia" },
                        { data: "itemManutencaoId" },
                        { data: "viagemId" },
                        //{
                        //    data: null,
                        //    render: function (data, type, row, meta) {
                        //        try
                        //        {
                        //            return meta.row + meta.settings._iDisplayStart + 1;
                        //        }
                        //        catch (error)
                        //        {
                        //            Alerta.TratamentoErroComLinha(
                        //                "manutencao.js",
                        //                "render",
                        //                error,
                        //            );
                        //        }
                        //    },
                        //},
                    ],

                    language: languageDataTable,
                    width: "100%",
                });
                } // Fim do if (!osFechada) para dataTablePendencias
            }
            catch (error)
            {
                TratamentoErroComLinha("manutencao.js", "VeiculoChange.DataTablePendencias", error);
            }
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "VeiculoChange", error);
    }
}

$(document).on('click', '.js-selecionar-ocorrencia', function ()
{
    const d = this.dataset;
    SelecionaLinha(
        d.viagemId,
        d.ficha,
        d.data,
        d.motorista,
        d.resumo,
        d.descricao,
        d.motoristaId,
        d.imagem,
        d.itemId,
        this                 // 👈 passa o botão clicado
    );
});

function InsereRegistro()
{
    try
    {
        if (document.getElementById("txtOS").value === "")
        {
            Alerta.Erro(
                "Informação Ausente",
                "O número da OS é obrigatório",
                "Ok"
            );
            return;
        }

        if (document.getElementById("txtDataSolicitacao").value === "")
        {
            Alerta.Erro(
                "Informação Ausente",
                "A data de solicitação é obrigatória",
                "Ok"
            );
            return;
        }

        if (document.getElementById("lstStatus").value === "")
        {
            Alerta.Erro(
                "Informação Ausente",
                "O Status deve ser informado!",
                "OK"
            );
            return;
        }

        if (
            document.getElementById("txtDataDisponibilidade").value != "" &&
            document.getElementById("txtDataDisponibilidade").value != null
        )
        {
            if (
                document.getElementById("txtDataSolicitacao").value >
                document.getElementById("txtDataDisponibilidade").value
            )
            {
                Alerta.Erro(
                    "Informação Errada",
                    "A Data de Disponibilização não pode ser superior à Data de Solicitação",
                );
                return;
            }
        }

        if (
            document.getElementById("txtDataEntrega").value != "" &&
            document.getElementById("txtDataEntrega").value != null
        )
        {
            if (
                document.getElementById("txtDataSolicitacao").value >
                document.getElementById("txtDataEntrega").value
            )
            {
                Alerta.Erro(
                    "Informação Errada",
                    "A Data de Entrega\\Recolhimento não pode ser superior à Data de Solicitação",
                );
                return;
            }
        }

        if (
            document.getElementById("txtDataDevolucao").value != "" &&
            document.getElementById("txtDataDevolucao").value != null
        )
        {
            if (
                document.getElementById("txtDataEntrega").value >
                document.getElementById("txtDataDevolucao").value
            )
            {
                Alerta.Erro(
                    "Informação Errada",
                    "A Data de Devolução não pode ser superior à Data de Entrega\\Recolhimento",
                );
                return;
            }
        }

        if (
            document.getElementById("txtDataDisponibilidade").value != "" &&
            document.getElementById("txtDataDisponibilidade").value != null
        )
        {
            if (
                document.getElementById("txtDataSolicitacao").value >
                document.getElementById("txtDataDisponibilidade").value
            )
            {
                Alerta.Erro(
                    "Informação Errada",
                    "A Data de Disponibilização não pode ser inferior à Data de Solicitação",
                );
                return;
            }
        }

        if (
            document.getElementById("txtDataRecebimentoReserva").value != "" &&
            document.getElementById("txtDataRecebimentoReserva").value != null
        )
        {
            if (
                document.getElementById("txtDataSolicitacao").value >
                document.getElementById("txtDataRecebimentoReserva").value
            )
            {
                Alerta.Erro(
                    "Informação Errada",
                    "A Data de Chegada do Reserva não pode ser inferior à Data de Solicitação",
                );
                return;
            }
        }

        if (
            document.getElementById("txtDataDevolucaoReserva").value != "" &&
            document.getElementById("txtDataDevolucaoReserva").value != null
        )
        {
            if (
                document.getElementById("txtDataDevolucaoReserva").value <
                document.getElementById("txtDataRecebimentoReserva").value
            )
            {
                Alerta.Erro(
                    "Informação Errada",
                    "A Data de Saída do Reserva não pode ser superior à Data de Chegada dele",
                );
                return;
            }
        }

        var dtItens = $("#tblItens").DataTable();
        if (dtItens.rows().count() === 0)
        {
            Alerta.Erro(
                "Informação Ausente",
                "É preciso informar ao menos um item para manutenção",
            );

            //swal({
            //    title: "Informação Ausente",
            //    text: "É preciso informar ao menos um item para manutenção",
            //    icon: "error",
            //    buttons: { ok: "Ok" },
            //    dangerMode: true
            //});
            return;
        }

        $("#btnEdita").prop("disabled", true);
        $("#btnAdiciona").prop("disabled", true);

        var veiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        var veiculoreserva = document.getElementById("lstVeiculoReserva").ej2_instances[0];

        if (manutencaoId === null || manutencaoId === "00000000-0000-0000-0000-000000000000")
        {
            ManutencaoId = "00000000-0000-0000-0000-000000000000";
        }

        var objManutencao = JSON.stringify({
            ManutencaoId: ManutencaoId,
            NumOS: $("#txtOS").val(),
            DataSolicitacao: $("#txtDataSolicitacao").val(),
            DataDisponibilidade: $("#txtDataDisponibilidade").val(),
            DataEntrega: $("#txtDataEntrega").val(),
            VeiculoId: veiculo.value,
            ResumoOS: $("#txtResumoOS").val(),
            DataDevolucao: $("#txtDataDevolucao").val(),
            StatusOS: $("#lstStatus").val(),
            ReservaEnviado: parseInt($("#lstReserva").val()),
            VeiculoReservaId: veiculoreserva.value,
            DataRecebimentoReserva: $("#txtDataRecebimentoReserva").val(),
            DataDevolucaoReserva: $("#txtDataDevolucaoReserva").val(),
            //    "ManutencaoPreventiva": document.getElementById("chkManutencaoPreventiva").checked,
            //    "QuilometragemManutencao": $('#txtQuilometragemManutencao').val()
        });

        var StatusManutencao = $("#lstStatus").val();
        var NumOS = $("#txtOS").val();
        var DataOS = $("#txtDataSolicitacao").val();

        if (manutencaoId === null || manutencaoId === "00000000-0000-0000-0000-000000000000")
        {
            $.ajax({
                type: "post",
                url: "api/Manutencao/InsereOS",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: objManutencao,
                success: function (data)
                {
                    try
                    {
                        var ManutencaoId = data.data;
                        var Linhas = dtItens.rows().count();

                        for (var i = 0; i < Linhas; i++)
                        {
                            try
                            {
                                var dataOS = $("#tblItens").DataTable().row(i).data();
                                var StatusItem =
                                    StatusManutencao === "Fechada" ? "Baixada" : "Manutenção";

                                var objItemOS = JSON.stringify({
                                    ManutencaoId: ManutencaoId,
                                    TipoItem: dataOS["tipoItem"],
                                    NumFicha: dataOS["numFicha"],
                                    DataItem:
                                        dataOS["dataItem"].substring(6, 10) +
                                        "-" +
                                        dataOS["dataItem"].substring(3, 5) +
                                        "-" +
                                        dataOS["dataItem"].substring(0, 2),
                                    Resumo: dataOS["resumo"],
                                    Descricao: dataOS["descricao"],
                                    Status: StatusItem,
                                    MotoristaId: dataOS["motoristaId"],
                                    ViagemId: dataOS["viagemId"],
                                    ImagemOcorrencia: dataOS["imagemOcorrencia"],
                                    NumOS: NumOS,
                                    DataOS: DataOS,
                                });

                                $.ajax({
                                    type: "post",
                                    url: "api/Manutencao/InsereItemOS",
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    data: objItemOS,
                                    success: function (data)
                                    {
                                        try
                                        {
                                        }
                                        catch (error)
                                        {
                                            Alerta.TratamentoErroComLinha(
                                                "manutencao.js",
                                                "success",
                                                error,
                                            );
                                        }
                                    },
                                    error: function (data)
                                    {
                                        try
                                        {
                                            AppToast.show("Vermelho", data.message, 3000);
                                            console.log(data);
                                        }
                                        catch (error)
                                        {
                                            TratamentoErroComLinha(
                                                "manutencao.js",
                                                "ajax.InsereItemOS.error",
                                                error,
                                            );
                                        }
                                    },
                                });
                            }
                            catch (error)
                            {
                                TratamentoErroComLinha("manutencao.js", "loop.InsereItemOS", error);
                            }
                        }
                        AppToast.show("Verde", "OS de Manutenção Adicionada com Sucesso!", 1000);
                        setTimeout(() =>
                        {
                            location.replace("/manutencao/listamanutencao");
                        }, 1000);
                    }
                    catch (error)
                    {
                        TratamentoErroComLinha("manutencao.js", "ajax.InsereOS.success", error);
                    }
                },
                error: function (data)
                {
                    try
                    {
                        AppToast.show("Vermelho", data.message, 3000);
                        console.log(data);
                    }
                    catch (error)
                    {
                        TratamentoErroComLinha("manutencao.js", "ajax.InsereOS.error", error);
                    }
                },
            });
        } else
        {
            $.ajax({
                type: "post",
                url: "api/Manutencao/InsereOS",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: objManutencao,
                success: function (data)
                {
                    try
                    {
                        var LinhasOcorrencias = dataTableOcorrencias.rows().count();
                        for (var i = 0; i < LinhasOcorrencias; i++)
                        {
                            try
                            {
                                var dataOcorrencia = $("#tblOcorrencia").DataTable().row(i).data();
                                if (
                                    dataOcorrencia["itemManutencaoId"] != null &&
                                    dataOcorrencia["itemManutencaoId"] != ""
                                )
                                {
                                    var objItemOcorrencia = JSON.stringify({
                                        ItemManutencaoId: dataOcorrencia["itemManutencaoId"],
                                    });

                                    $.ajax({
                                        type: "post",
                                        url: "api/Manutencao/ApagaConexaoOcorrencia",
                                        contentType: "application/json; charset=utf-8",
                                        dataType: "json",
                                        data: objItemOcorrencia,
                                        success: function (data)
                                        {
                                            try
                                            {
                                            }
                                            catch (error)
                                            {
                                                Alerta.TratamentoErroComLinha(
                                                    "manutencao.js",
                                                    "success",
                                                    error,
                                                );
                                            }
                                        },
                                        error: function (data)
                                        {
                                            try
                                            {
                                                AppToast.show("Vermelho", data.message, 3000);
                                                console.log(data);
                                            }
                                            catch (error)
                                            {
                                                TratamentoErroComLinha(
                                                    "manutencao.js",
                                                    "ajax.ApagaConexaoOcorrencia.error",
                                                    error,
                                                );
                                            }
                                        },
                                    });
                                }
                            }
                            catch (error)
                            {
                                TratamentoErroComLinha(
                                    "manutencao.js",
                                    "loop.ApagaConexaoOcorrencia",
                                    error,
                                );
                            }
                        }

                        var LinhasPendencias = dataTablePendencias.rows().count();
                        for (var i = 0; i < LinhasPendencias; i++)
                        {
                            try
                            {
                                var dataPendencia = $("#tblPendencia").DataTable().row(i).data();
                                if (
                                    dataPendencia["itemManutencaoId"] != null &&
                                    dataPendencia["itemManutencaoId"] != ""
                                )
                                {
                                    var objItemPendencia = JSON.stringify({
                                        ItemManutencaoId: dataPendencia["itemManutencaoId"],
                                    });

                                    $.ajax({
                                        type: "post",
                                        url: "api/Manutencao/ApagaConexaoPendencia",
                                        contentType: "application/json; charset=utf-8",
                                        dataType: "json",
                                        data: objItemPendencia,
                                        success: function (data)
                                        {
                                            try
                                            {
                                            }
                                            catch (error)
                                            {
                                                Alerta.TratamentoErroComLinha(
                                                    "manutencao.js",
                                                    "success",
                                                    error,
                                                );
                                            }
                                        },
                                        error: function (data)
                                        {
                                            try
                                            {
                                                AppToast.show("Vermelho", data.message, 3000);
                                                console.log(data);
                                            }
                                            catch (error)
                                            {
                                                TratamentoErroComLinha(
                                                    "manutencao.js",
                                                    "ajax.ApagaConexaoPendencia.error",
                                                    error,
                                                );
                                            }
                                        },
                                    });
                                }
                            }
                            catch (error)
                            {
                                TratamentoErroComLinha(
                                    "manutencao.js",
                                    "loop.ApagaConexaoPendencia",
                                    error,
                                );
                            }
                        }

                        var objManutencaoIdOnly = JSON.stringify({ ManutencaoId: ManutencaoId });
                        var StatusManutencaoEdit = $("#lstStatus").val();

                        // Primeiro apaga os itens existentes, depois insere os novos
                        $.ajax({
                            type: "post",
                            url: "api/Manutencao/ApagaItens",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            data: objManutencaoIdOnly,
                            success: function (data)
                            {
                                try
                                {
                                    // AGORA que os itens foram apagados, inserimos os novos
                                    var Linhas = dtItens.rows().count();
                                    var promessas = [];

                                    for (var i = 0; i < Linhas; i++)
                                    {
                                        try
                                        {
                                            const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';
                                            const nonEmpty = v => v !== null && v !== undefined && String(v).trim() !== '';

                                            const dataOS = $("#tblItens").DataTable().row(i).data();

                                            // dd/MM/yyyy -> yyyy-MM-dd
                                            const [dd, mm, yyyy] = String(dataOS.dataItem || '').split('/');
                                            const dataISO = `${yyyy}-${mm}-${dd}`;

                                            var StatusItem = StatusManutencaoEdit === "Fechada" ? "Baixada" : "Manutenção";

                                            const payload = {
                                                ManutencaoId: ManutencaoId,
                                                TipoItem: dataOS.tipoItem,
                                                NumFicha: dataOS.numFicha,
                                                DataItem: dataISO,
                                                Resumo: dataOS.resumo,
                                                Descricao: dataOS.descricao,
                                                Status: StatusItem,
                                                ImagemOcorrencia: dataOS.imagemOcorrencia,
                                                NumOS: $("#txtOS").val(),
                                                DataOS: $("#txtDataSolicitacao").val(),

                                                // adiciona só se tiver valor e não for Guid.Empty
                                                ...(nonEmpty(dataOS.motoristaId) && dataOS.motoristaId !== EMPTY_GUID
                                                    ? { MotoristaId: dataOS.motoristaId } : {}),
                                                ...(nonEmpty(dataOS.viagemId) && dataOS.viagemId !== EMPTY_GUID
                                                    ? { ViagemId: dataOS.viagemId } : {}),
                                            };

                                            const objItemOS = JSON.stringify(payload);

                                            var promessa = $.ajax({
                                                type: "post",
                                                url: "api/Manutencao/InsereItemOS",
                                                contentType: "application/json; charset=utf-8",
                                                dataType: "json",
                                                data: objItemOS
                                            });
                                            promessas.push(promessa);
                                        }
                                        catch (error)
                                        {
                                            Alerta.TratamentoErroComLinha("manutencao.js", "loop.InsereItemOS", error);
                                        }
                                    }

                                    // Aguarda todas as inserções terminarem
                                    $.when.apply($, promessas).done(function() {
                                        AppToast.show("Verde", "OS de Manutenção Registrada com Sucesso!", 1000);
                                        setTimeout(() => {
                                            location.replace("/manutencao/listamanutencao");
                                        }, 1000);
                                    }).fail(function() {
                                        AppToast.show("Amarelo", "OS atualizada, mas houve erros em alguns itens.", 3000);
                                    });
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "manutencao.js",
                                        "ApagaItens.success",
                                        error,
                                    );
                                }
                            },
                            error: function (data)
                            {
                                try
                                {
                                    AppToast.show("Vermelho", "Erro ao remover itens antigos: " + data.message, 3000);
                                    console.log(data);
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "manutencao.js",
                                        "ajax.ApagaItens.error",
                                        error,
                                    );
                                }
                            },
                        });
                    }
                    catch (error)
                    {
                        TratamentoErroComLinha("manutencao.js", "ajax.InsereOS.success", error);
                    }
                },
                error: function (data)
                {
                    try
                    {
                        AppToast.show("Vermelho", data.message, 3000);
                        console.log(data);
                    }
                    catch (error)
                    {
                        TratamentoErroComLinha("manutencao.js", "ajax.InsereOS.error", error);
                    }
                },
            });
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("manutencao.js", "InsereRegistro", error);
    }
}

// Evento para selecionar nova foto (preview)
// Evento para selecionar nova foto (com upload)
document.getElementById("txtFileItemNovo").addEventListener("change", async function (e)
{
    try
    {
        const file = e.target.files?.[0];
        if (!file) return;

        // Mostra preview da nova foto
        const imgEl = document.getElementById('imgViewerNovo');
        imgEl.src = URL.createObjectURL(file);

        // Pega token (meta OU hidden)
        const token =
            document.querySelector('meta[name="request-verification-token"]')?.content ||
            document.querySelector('#uploadForm input[name="__RequestVerificationToken"]')?.value;

        console.log("Anti-forgery token:", token?.slice(0, 12) + "..."); // debug

        if (!token)
        {
            AppToast.show("Vermelho", "Token antiforgery não encontrado na página", 3000);
            return;
        }

        // Prepara FormData
        const fd = new FormData();
        fd.append("files", file, file.name);                  // casa com IEnumerable<IFormFile> files
        fd.append("__RequestVerificationToken", token);       // fallback via corpo

        // Faz o upload
        const resp = await fetch("/Uploads/UploadPDF?handler=SaveIMGManutencao", {
            method: "POST",
            body: fd,
            headers: { "X-CSRF-TOKEN": token },                 // usa o HeaderName definido
            credentials: "same-origin"                          // envia cookie do antiforgery
        });

        if (!resp.ok)
        {
            const txt = await resp.text();                      // veja a mensagem do 400
            throw new Error("Falha no upload: " + resp.status + " - " + txt);
        }

        const data = await resp.json(); // { fileName: "guid.jpg" }
        window.ImagemSelecionada = data.fileName;

        AppToast.show("Verde", "Foto carregada com sucesso!", 2000);

    } catch (error)
    {
        console.error("Erro no upload:", error);
        AppToast.show("Vermelho", "Erro ao fazer upload da foto: " + error.message, 5000);
    }
});

// Botão para inserir/atualizar foto na tabela
$("#btnAdicionarFoto").off('click').on('click', function (e)
{
    try
    {
        e.preventDefault();

        if (linhaSelecionadaFoto === -1)
        {
            AppToast.show("Amarelo", "Nenhuma linha selecionada", 2000);
            return;
        }

        if (!window.ImagemSelecionada)
        {
            AppToast.show("Amarelo", "Selecione uma foto primeiro", 2000);
            return;
        }

        const table = $('#tblItens').DataTable();
        const rowData = table.row(linhaSelecionadaFoto).data();

        if (rowData)
        {
            rowData.imagemOcorrencia = window.ImagemSelecionada;
            table.row(linhaSelecionadaFoto).data(rowData).draw(false);

            AppToast.show("Verde", "Foto atualizada com sucesso!", 2000);

            // USA A FUNÇÃO DE FECHAMENTO ROBUSTA
            forceCloseModal();

        } else
        {
            AppToast.show("Vermelho", "Erro: linha não encontrada", 2000);
        }

    } catch (error)
    {
        console.error("Erro ao adicionar foto:", error);
        AppToast.show("Vermelho", "Erro ao atualizar a foto", 2000);
    }
});

// Remove o código antigo do modal para evitar conflitos
// Atualiza o botão fechar
$("#btnFecharModal").off('click').on('click', function (e)
{
    e.preventDefault();
    forceCloseModal();
});

// Função robusta para fechar o modal
// E na função forceCloseModal, faça toda a limpeza:
function forceCloseModal()
{
    try
    {
        const BASE = "/DadosEditaveis/ImagensOcorrencias/";
        const modalEl = document.getElementById('modalFotoManutencao');

        // Limpa variáveis imediatamente
        linhaSelecionadaFoto = -1;
        window.ImagemSelecionada = null;

        // Limpa input e imagem
        const fileInput = document.getElementById('txtFileItemNovo');
        if (fileInput) fileInput.value = '';

        const imgEl = document.getElementById('imgViewerNovo');
        if (imgEl) imgEl.src = BASE + "semimagem.jpg";

        // Fecha via Bootstrap 5
        if (modalEl)
        {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal)
            {
                modal.hide();
            } else
            {
                // Se não existir instância, cria e fecha
                const newModal = new bootstrap.Modal(modalEl);
                newModal.hide();
            }
        }

        // Força limpeza após delay
        setTimeout(() =>
        {
            document.querySelectorAll('.modal-backdrop').forEach(backdrop =>
            {
                backdrop.remove();
            });

            if (modalEl)
            {
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
                modalEl.setAttribute('aria-hidden', 'true');
            }

            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';

        }, 200);

    } catch (error)
    {
        console.error("Erro ao fechar modal:", error);
    }
}

// Modal de foto de pendência (só visualização)
(function initModalFotoPendencia()
{
    const BASE = "/DadosEditaveis/ImagensOcorrencias/";
    const modalEl = document.getElementById('modalFotoPendencia');
    const imgEl = document.getElementById('imgViewerPendencia');

    if (!modalEl || !imgEl) return;

    // Evento para exibir foto
    document.addEventListener('click', function (e)
    {
        const btn = e.target.closest('[data-bs-target="#modalFotoPendencia"]');
        if (!btn) return;

        const foto = btn.dataset.foto ? decodeURIComponent(btn.dataset.foto) : "";
        const temFoto = foto && foto.toLowerCase() !== "null" && foto !== "";

        imgEl.src = temFoto ? (BASE + encodeURIComponent(foto)) : (BASE + "semimagem.jpg");
    });

    // Limpa ao fechar
    modalEl.addEventListener('hide.bs.modal', () =>
    {
        imgEl.removeAttribute('src');
    });
})();

// Evento delegado para selecionar pendência
$(document).on('click', '.js-selecionar-pendencia', function ()
{
    const d = this.dataset;
    SelecionaLinhaPendencia(
        d.viagemId, d.ficha, d.data, d.nome,
        d.resumo, d.descricao, d.motoristaId,
        d.imagem, d.itemId,
        this                 // 👈 passa o botão clicado
    );
});

$(document).on('click', '.js-remover-item', function ()
{
    const id = this.dataset.itemId;
    RemoveItem(id, this);
});

// Variável global para controlar o debounce
var removeItemDebounce = false;

function RemoveItem(itemId, buttonElement)
{
    // Debounce: evita execução múltipla
    if (removeItemDebounce)
    {
        console.log("RemoveItem bloqueada por debounce");
        return;
    }

    removeItemDebounce = true;
    console.log("RemoveItem executando...");

    try
    {
        const table = $('#tblItens').DataTable();
        const $tr = $(buttonElement).closest('tr');
        const data = table.row($tr).data();

        if (!data)
        {
            AppToast.show("Amarelo", "Item não encontrado na tabela", 3000);
            return;
        }

        if (data["tipoItem"] === "Ocorrência")
        {
            let Ocorrencias = [];

            if (dataTableOcorrencias && dataTableOcorrencias.data().count() > 0)
            {
                for (var i = 0; i < dataTableOcorrencias.data().count(); i++)
                {
                    let ocorrencia = new Ocorrencia(
                        dataTableOcorrencias.cell(i, 0).data(),
                        dataTableOcorrencias.cell(i, 1).data(),
                        dataTableOcorrencias.cell(i, 2).data(),
                        dataTableOcorrencias.cell(i, 3).data(),
                        dataTableOcorrencias.cell(i, 4).data(),
                        dataTableOcorrencias.cell(i, 5).data(),
                        dataTableOcorrencias.cell(i, 6).data(),
                        dataTableOcorrencias.cell(i, 7).data(),
                        dataTableOcorrencias.cell(i, 8).data(),
                    );

                    Ocorrencias.push(ocorrencia);
                    dataTableOcorrencias.row(i).remove().draw(false);
                }
            }

            $("#tblOcorrencia")
                .DataTable()
                .row.add({
                    noFichaVistoria: data["numFicha"],
                    dataInicial: data["dataItem"],
                    nomeMotorista: data["nomeMotorista"],
                    resumoOcorrencia: data["resumo"],
                    viagemId: data["viagemId"],
                    descricaoOcorrencia: data["descricao"],
                    motoristaId: data["motoristaId"],
                    imagemOcorrencia: data["imagemOcorrencia"],
                    itemManutencaoId: data["itemManutencaoId"],
                })
                .draw(false);

            Ocorrencias.forEach((o) =>
            {
                try
                {
                    $("#tblOcorrencia")
                        .DataTable()
                        .row.add({
                            noFichaVistoria: o.noFichaVistoria,
                            dataInicial: o.data,
                            nomeMotorista: o.motorista,
                            resumoOcorrencia: o.resumo,
                            viagemId: o.viagemId,
                            descricaoOcorrencia: o.descricao,
                            motoristaId: o.motoristaId,
                            imagemOcorrencia: o.imagemOcorrencia,
                            itemManutencaoId: o.itemManutencaoId,
                        })
                        .draw(false);
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha(
                        "manutencao.js",
                        "callback@Ocorrencias.forEach#0",
                        error,
                    );
                }
            });

        }
        else if (data["tipoItem"] === "Pendência")
        {
            let Pendencias = [];

            if (dataTablePendencias && dataTablePendencias.data().count() > 0)
            {
                for (var i = 0; i < dataTablePendencias.data().count(); i++)
                {
                    let pendencia = new Ocorrencia(
                        dataTablePendencias.cell(i, 0).data(),
                        dataTablePendencias.cell(i, 1).data(),
                        dataTablePendencias.cell(i, 2).data(),
                        dataTablePendencias.cell(i, 3).data(),
                        dataTablePendencias.cell(i, 4).data(),
                        dataTablePendencias.cell(i, 5).data(),
                        dataTablePendencias.cell(i, 6).data(),
                        dataTablePendencias.cell(i, 7).data(),
                        dataTablePendencias.cell(i, 8).data(),
                        dataTablePendencias.cell(i, 9).data(),
                    );

                    Pendencias.push(pendencia);
                    dataTablePendencias.row(i).remove().draw(false);
                }
            }

            $("#tblPendencia")
                .DataTable()
                .row.add({
                    numFicha: data["numFicha"],
                    dataItem: data["dataItem"],
                    nome: data["nomeMotorista"],
                    resumo: data["resumo"],
                    itemManutencaoId: data["itemManutencaoId"],
                    descricao: data["descricao"],
                    motoristaId: data["motoristaId"],
                    imagemOcorrencia: data["imagemOcorrencia"],
                    viagemId: data["viagemId"],
                })
                .draw(false);

            Pendencias.forEach((p) =>
            {
                try
                {
                    $("#tblPendencia")
                        .DataTable()
                        .row.add({
                            numFicha: p.noFichaVistoria,
                            dataItem: p.data,
                            nome: p.motorista,
                            resumo: p.resumo,
                            itemManutencaoId: p.itemManutencaoId,
                            descricao: p.descricao,
                            motoristaId: p.motoristaId,
                            imagemOcorrencia: p.imagemOcorrencia,
                            viagemId: p.viagemId,
                        })
                        .draw(false);
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha(
                        "manutencao.js",
                        "callback@Pendencias.forEach#0",
                        error,
                    );
                }
            });
        }

        // Remove da tabela de itens
        table.row($tr).remove().draw(false);
        AppToast.show("Verde", "Item removido e devolvido à lista original!", 2000);

    }
    catch (error)
    {
        console.error("Erro ao remover item:", error);
        AppToast.show("Vermelho", "Erro ao remover o item", 3000);
        Alerta.TratamentoErroComLinha("manutencao.js", "RemoveItem", error);
    }
    finally
    {
        // Libera o debounce após 1 segundo
        setTimeout(() =>
        {
            removeItemDebounce = false;
            console.log("Debounce liberado");
        }, 1000);
    }
}

function processarRemocaoItem(data, $tr)
{
    try
    {
        if (data["tipoItem"] === "Ocorrência")
        {
            // Move item de volta para tblOcorrencia
            let Ocorrencias = [];

            if (dataTableOcorrencias.data().count() > 0)
            {
                for (var i = 0; i < dataTableOcorrencias.data().count(); i++)
                {
                    let ocorrencia = new Ocorrencia(
                        dataTableOcorrencias.cell(i, 0).data(),
                        dataTableOcorrencias.cell(i, 1).data(),
                        dataTableOcorrencias.cell(i, 2).data(),
                        dataTableOcorrencias.cell(i, 3).data(),
                        dataTableOcorrencias.cell(i, 4).data(),
                        dataTableOcorrencias.cell(i, 5).data(),
                        dataTableOcorrencias.cell(i, 6).data(),
                        dataTableOcorrencias.cell(i, 7).data(),
                        dataTableOcorrencias.cell(i, 8).data(),
                    );
                    Ocorrencias.push(ocorrencia);
                    dataTableOcorrencias.row(i).remove().draw(false);
                }
            }

            $("#tblOcorrencia").DataTable().row.add({
                noFichaVistoria: data["numFicha"],
                dataInicial: data["dataItem"],
                nomeMotorista: data["nomeMotorista"],
                resumoOcorrencia: data["resumo"],
                viagemId: data["viagemId"],
                descricaoOcorrencia: data["descricao"],
                motoristaId: data["motoristaId"],
                imagemOcorrencia: data["imagemOcorrencia"],
                itemManutencaoId: data["itemManutencaoId"],
            }).draw(false);

            Ocorrencias.forEach((o) =>
            {
                $("#tblOcorrencia").DataTable().row.add({
                    noFichaVistoria: o.noFichaVistoria,
                    dataInicial: o.data,
                    nomeMotorista: o.motorista,
                    resumoOcorrencia: o.resumo,
                    viagemId: o.viagemId,
                    descricaoOcorrencia: o.descricao,
                    motoristaId: o.motoristaId,
                    imagemOcorrencia: o.imagemOcorrencia,
                    itemManutencaoId: o.itemManutencaoId,
                }).draw(false);
            });

        } else if (data["tipoItem"] === "Pendência")
        {
            // Move item de volta para tblPendencia
            let Pendencias = [];

            if (dataTablePendencias.data().count() > 0)
            {
                for (var i = 0; i < dataTablePendencias.data().count(); i++)
                {
                    let pendencia = new Ocorrencia(
                        dataTablePendencias.cell(i, 0).data(),
                        dataTablePendencias.cell(i, 1).data(),
                        dataTablePendencias.cell(i, 2).data(),
                        dataTablePendencias.cell(i, 3).data(),
                        dataTablePendencias.cell(i, 4).data(),
                        dataTablePendencias.cell(i, 5).data(),
                        dataTablePendencias.cell(i, 6).data(),
                        dataTablePendencias.cell(i, 7).data(),
                        dataTablePendencias.cell(i, 8).data(),
                        dataTablePendencias.cell(i, 9).data(),
                    );
                    Pendencias.push(pendencia);
                    dataTablePendencias.row(i).remove().draw(false);
                }
            }

            $("#tblPendencia").DataTable().row.add({
                numFicha: data["numFicha"],
                dataItem: data["dataItem"],
                nome: data["nomeMotorista"],
                resumo: data["resumo"],
                itemManutencaoId: data["itemManutencaoId"],
                descricao: data["descricao"],
                motoristaId: data["motoristaId"],
                imagemOcorrencia: data["imagemOcorrencia"],
                viagemId: data["viagemId"],
            }).draw(false);

            Pendencias.forEach((p) =>
            {
                $("#tblPendencia").DataTable().row.add({
                    numFicha: p.noFichaVistoria,
                    dataItem: p.data,
                    nome: p.motorista,
                    resumo: p.resumo,
                    itemManutencaoId: p.itemManutencaoId,
                    descricao: p.descricao,
                    motoristaId: p.motoristaId,
                    imagemOcorrencia: p.imagemOcorrencia,
                    viagemId: p.viagemId,
                }).draw(false);
            });
        }

        // Remove da tabela de itens
        dataTableItens.row($tr).remove().draw(false);
        AppToast.show("Verde", "Item removido e devolvido à lista original!", 2000);

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("manutencao.js", "processarRemocaoItem", error);
    }
}
