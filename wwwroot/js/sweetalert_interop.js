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
            ${cancelButtonText ? `<button id="btnCancel" style="
              background: #555;
              border: none;
              color: #fff;
              padding: 10px 20px;
              margin-right: 10px;
              font-size: 14px;
              border-radius: 5px;
              cursor: pointer;
            ">${cancelButtonText}</button>` : ''}

            <button id="btnConfirm" style="
              background: #7b5ae0;
              border: none;
              color: #fff;
              padding: 10px 20px;
              font-size: 14px;
              border-radius: 5px;
              cursor: pointer;
            ">${confirmButtonText}</button>
          </div>
        </div>`;

        return new Promise((resolve) =>
        {
            Swal.fire({
                showConfirmButton: false,
                html: msg,
                backdrop: true,
                heightAuto: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                // REMOVIDO: allowEnterKey: false, // Esta propriedade foi deprecada
                focusConfirm: false, // Adicionado para prevenir foco automático
                customClass: {
                    popup: 'swal2-popup swal2-no-border swal2-no-shadow'
                },
                didOpen: () =>
                {
                    const popup = document.querySelector('.swal2-popup');
                    if (popup)
                    {
                        popup.style.border = 'none';
                        popup.style.boxShadow = 'none';
                        popup.style.background = 'transparent';
                    }
                    const confirmBtn = document.getElementById('btnConfirm');
                    if (confirmBtn) confirmBtn.onclick = () => { Swal.close(); resolve(true); };
                    const cancelBtn = document.getElementById('btnCancel');
                    if (cancelBtn) cancelBtn.onclick = () => { Swal.close(); resolve(false); };
                },
                didClose: () =>
                {
                    // Limpeza universal após qualquer SweetAlert fechar
                }
            });
        });
    },

    ShowInfo: async function (title, text, confirmButtonText = "OK")
    {
        const iconHtml = '<img src="/images/info_sorridente_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        return await this.ShowCustomAlert('info', iconHtml, title, text, confirmButtonText);
    },

    ShowSuccess: async function (title, text, confirmButtonText = "OK")
    {
        const iconHtml = '<img src="/images/success_oculos_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        return await this.ShowCustomAlert('success', iconHtml, title, text, confirmButtonText);
    },

    ShowWarning: async function (title, text, confirmButtonText = "OK")
    {
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 72 72" style="display:block;margin:0 auto 12px;">
                            <circle cx="36" cy="36" r="32" fill="#ffe066" stroke="#fff" stroke-width="4"/>
                            <rect x="32" y="18" width="8" height="28" rx="4" fill="#222"/>
                            <circle cx="36" cy="54" r="5" fill="#222"/>
                        </svg>`;
        const message = iconSvg + `<div>${text}</div>`;
        const iconHtml = '<img src="/images/alerta_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        return await this.ShowCustomAlert('warning', iconHtml, title, message, confirmButtonText);
    },

    ShowError: async function (title, text, confirmButtonText = "OK")
    {
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 72 72" style="display:block;margin:0 auto 12px;">
                            <circle cx="36" cy="36" r="32" fill="#ff4040" stroke="#fff" stroke-width="4"/>
                            <line x1="20" y1="20" x2="52" y2="52" stroke="#ffe066" stroke-width="8" stroke-linecap="round"/>
                            <line x1="52" y1="20" x2="20" y2="52" stroke="#ffe066" stroke-width="8" stroke-linecap="round"/>
                        </svg>`;
        const message = iconSvg + `<div>${text}</div>`;
        const iconHtml = '<img src="/images/erro_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        return await this.ShowCustomAlert('error', iconHtml, title, message, confirmButtonText);
    },

    ShowConfirm: async function (title, text, confirmButtonText, cancelButtonText)
    {
        const iconHtml = '<img src="/images/confirmar_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        return await this.ShowCustomAlert('question', iconHtml, title, text, confirmButtonText, cancelButtonText);
    },

    ShowConfirm3: async function (title, text, buttonTodos = "Todos", buttonAtual = "Atual", buttonCancel = "Cancelar")
    {
        const iconHtml = '<img src="/images/confirmar_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';

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
        <p>${text}</p>
      </div>

      <div style="background:#3b3b5c; padding: 15px; text-align: center;">
        <button id="btnTodos" style="
          background: #4CAF50;
          border: none;
          color: #fff;
          padding: 10px 20px;
          margin-right: 10px;
          font-size: 14px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
          <i class="fa-solid fa-users" style="margin-right: 5px;"></i>${buttonTodos}
        </button>
        
        <button id="btnAtual" style="
          background: #2196F3;
          border: none;
          color: #fff;
          padding: 10px 20px;
          margin-right: 10px;
          font-size: 14px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        " onmouseover="this.style.background='#0b7dda'" onmouseout="this.style.background='#2196F3'">
          <i class="fa-solid fa-user" style="margin-right: 5px;"></i>${buttonAtual}
        </button>

        <button id="btnCancel" style="
          background: #555;
          border: none;
          color: #fff;
          padding: 10px 20px;
          font-size: 14px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        " onmouseover="this.style.background='#333'" onmouseout="this.style.background='#555'">
          <i class="fa-solid fa-xmark" style="margin-right: 5px;"></i>${buttonCancel}
        </button>
      </div>
    </div>`;

        return new Promise((resolve) =>
        {
            Swal.fire({
                showConfirmButton: false,
                html: msg,
                backdrop: true,
                heightAuto: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                // REMOVIDO: allowEnterKey: false,
                focusConfirm: false,
                customClass: {
                    popup: 'swal2-popup swal2-no-border swal2-no-shadow'
                },
                didOpen: () =>
                {
                    const popup = document.querySelector('.swal2-popup');
                    if (popup)
                    {
                        popup.style.border = 'none';
                        popup.style.boxShadow = 'none';
                        popup.style.background = 'transparent';
                    }

                    // Configurar os três botões
                    const btnTodos = document.getElementById('btnTodos');
                    if (btnTodos) btnTodos.onclick = () =>
                    {
                        Swal.close();
                        resolve("Todos");
                    };

                    const btnAtual = document.getElementById('btnAtual');
                    if (btnAtual) btnAtual.onclick = () =>
                    {
                        Swal.close();
                        resolve("Atual");
                    };

                    const btnCancel = document.getElementById('btnCancel');
                    if (btnCancel) btnCancel.onclick = () =>
                    {
                        Swal.close();
                        resolve(false);
                    };
                },
                didClose: () =>
                {
                    // Se fechado de outra forma (ESC, clique fora se habilitado), retorna false
                    // resolve(false); // Comentado para evitar dupla resolução
                }
            });
        });
    },

    ShowErrorUnexpected: async function (classe, metodo, erro)
    {
        console.log('=== ShowErrorUnexpected INICIADO ===');
        console.log('Classe:', classe);
        console.log('Método:', metodo);
        console.log('Erro:', erro);
        console.log('Tipo do erro:', typeof erro);

        if (erro && typeof erro === 'object')
        {
            console.log('Propriedades do erro:', Object.keys(erro));
            try
            {
                console.log('Erro serializado:', JSON.stringify(erro, null, 2));
            } catch (e)
            {
                console.log('Erro não serializável');
            }
        }

        let linhaMetodo = 'desconhecida';
        let arquivoInicio = classe;
        let arquivoFim = 'desconhecido';
        let mensagemErro = 'Erro desconhecido';
        let stackTrace = null;
        let innerErro = null;

        // ===== PROCESSAR A MENSAGEM DE ERRO =====
        if (typeof erro === 'string')
        {
            mensagemErro = erro;
            console.log('✓ Erro é string:', mensagemErro);
        }
        else if (erro && typeof erro === 'object')
        {
            console.log('🔍 Processando objeto de erro...');

            const tipoErro = erro.name || erro.constructor?.name;
            console.log('Tipo do erro:', tipoErro);

            if (erro instanceof Error || tipoErro?.endsWith('Error'))
            {
                mensagemErro = erro.message;
                console.log('✓ Mensagem extraída de Error.message:', mensagemErro);
            }

            if (!mensagemErro || mensagemErro === '[object Object]')
            {
                const possiveisMensagens = [
                    erro.erro,
                    erro.message,
                    erro.mensagem,
                    erro.msg,
                    erro.error,
                    erro.description,
                    erro.statusText,
                    erro.errorMessage,
                    erro.detail
                ];

                mensagemErro = possiveisMensagens.find(m => m && typeof m === 'string' && m.trim() !== '');

                if (mensagemErro)
                {
                    console.log('✓ Mensagem encontrada em propriedade alternativa:', mensagemErro);
                }
            }

            if (!mensagemErro || mensagemErro === '[object Object]')
            {
                if (erro.toString && typeof erro.toString === 'function')
                {
                    const strErro = erro.toString();
                    if (strErro && strErro !== '[object Object]')
                    {
                        mensagemErro = strErro;
                        console.log('✓ Mensagem extraída via toString():', mensagemErro);
                    }
                }
            }

            if (!mensagemErro || mensagemErro === '[object Object]')
            {
                try
                {
                    const serializado = JSON.stringify(erro, null, 2);
                    if (serializado && serializado !== '{}' && serializado !== 'null')
                    {
                        mensagemErro = serializado;
                        console.log('✓ Mensagem serializada do objeto');
                    } else
                    {
                        mensagemErro = 'Erro sem informações disponíveis';
                    }
                } catch (e)
                {
                    console.error('❌ Erro ao serializar:', e);
                    mensagemErro = 'Erro ao processar mensagem de erro';
                }
            }

            console.log('✓ Mensagem final extraída:', mensagemErro);

            stackTrace = erro.stack || null;
            innerErro = erro.innerErro || erro.innerException || null;

            // ===== PRIORIDADE 1: USAR DETALHES DO C# =====
            if (erro.detalhes)
            {
                console.log('📌 Usando detalhes fornecidos pelo C#');
                if (erro.detalhes.arquivo)
                {
                    arquivoInicio = erro.detalhes.arquivo;
                    console.log('✓ Arquivo do C#:', arquivoInicio);
                }
                if (erro.detalhes.linha)
                {
                    linhaMetodo = erro.detalhes.linha;
                    console.log('✓ Linha do C#:', linhaMetodo);
                }
                if (erro.detalhes.metodo && !metodo)
                {
                    metodo = erro.detalhes.metodo;
                }
            }

            // Verificar propriedades alternativas
            if (erro.linha && linhaMetodo === 'desconhecida') 
            {
                linhaMetodo = erro.linha;
            }
            if (erro.arquivo && arquivoInicio === classe) 
            {
                arquivoInicio = erro.arquivo;
            }

            // ===== PRIORIDADE 2: EXTRAIR DO STACK TRACE =====
            const precisaExtrairStack = (linhaMetodo === 'desconhecida' || arquivoInicio === classe);

            if (stackTrace && precisaExtrairStack)
            {
                console.log('📚 Stack trace encontrado, processando...');
                console.log('Stack trace completo:', stackTrace);

                const linhas = stackTrace.split('\n').filter(l => l.trim());
                console.log('Linhas do stack:', linhas);

                let primeiroFrameUsuario = null;
                let ultimoFrameUsuario = null;
                let todosFrames = [];

                // Lista de arquivos/pastas de bibliotecas para ignorar
                const ignorarArquivos = [
                    'vendor', 'vendors', 'bundle', 'jquery', 'bootstrap',
                    'node_modules', 'lib', 'libraries', 'plugins', 'min.js',
                    'chunk', 'runtime', 'webpack', 'polyfill'
                ];

                // Função para verificar se é um arquivo de biblioteca
                const ehBiblioteca = (nomeArquivo) =>
                {
                    const arquivoLower = nomeArquivo.toLowerCase();
                    return ignorarArquivos.some(ignore => arquivoLower.includes(ignore));
                };

                // Processar cada linha do stack
                for (let i = 0; i < linhas.length; i++)
                {
                    const linha = linhas[i];

                    // Tentar vários padrões de regex
                    let match = null;

                    // Padrío 1: Linha com parêntese
                    match = linha.match(/^\s*\((?:https?:)?\/\/[^\/]+\/(?:.*\/)?([\w\-_.]+\.(?:js|ts|jsx|tsx|cshtml))(?:\?[^:]*)?:(\d+):\d+\)/i);

                    // Padrío 2: Chrome com "at"
                    if (!match)
                    {
                        match = linha.match(/at\s+(?:.*\s+)?\((?:https?:)?\/\/[^\/]+\/(?:.*\/)?([\w\-_.]+\.(?:js|ts|jsx|tsx|cshtml))(?:\?[^:]*)?:(\d+):\d+\)/i);
                    }

                    // Padrío 3: Chrome simples
                    if (!match)
                    {
                        match = linha.match(/at\s+(?:.*\s+)?\(?([\w\-_.]+\.(?:js|ts|jsx|tsx|cshtml)):(\d+):\d+\)?/i);
                    }

                    // Padrío 4: Firefox
                    if (!match)
                    {
                        match = linha.match(/@([\w\-_.]+\.(?:js|ts|jsx|tsx|cshtml)):(\d+):\d+/i);
                    }

                    // Padrío 5: Genérico
                    if (!match)
                    {
                        match = linha.match(/([\w\-_.]+\.(?:js|cs|ts|jsx|tsx|cshtml)):(\d+)/i);
                    }

                    if (match)
                    {
                        const nomeArquivo = match[1];
                        const numeroLinha = match[2];

                        console.log(`Frame ${i}: ${nomeArquivo}:${numeroLinha}`);

                        const frameInfo = { arquivo: nomeArquivo, linha: numeroLinha };
                        todosFrames.push(frameInfo);

                        // Verificar se NÃO é biblioteca
                        if (!ehBiblioteca(nomeArquivo))
                        {
                            console.log(`✓ Frame de código de usuário: ${nomeArquivo}:${numeroLinha}`);

                            if (!primeiroFrameUsuario)
                            {
                                primeiroFrameUsuario = frameInfo;
                                console.log('✓ Primeiro frame de usuário identificado:', primeiroFrameUsuario);
                            }

                            ultimoFrameUsuario = frameInfo;
                        }
                        else
                        {
                            console.log(`⊘ Frame ignorado (biblioteca): ${nomeArquivo}`);
                        }
                    }
                }

                // Aplicar os valores extraídos
                if (primeiroFrameUsuario)
                {
                    arquivoInicio = primeiroFrameUsuario.arquivo;
                    linhaMetodo = primeiroFrameUsuario.linha;
                    console.log('✓ Arquivo onde erro foi gerado:', arquivoInicio, 'Linha:', linhaMetodo);
                }
                else if (todosFrames.length > 0)
                {
                    arquivoInicio = todosFrames[0].arquivo;
                    linhaMetodo = todosFrames[0].linha;
                    console.log('⚠️ Usando primeiro frame disponível');
                }

                if (ultimoFrameUsuario)
                {
                    arquivoFim = ultimoFrameUsuario.arquivo;
                    console.log('✓ Último arquivo de usuário:', arquivoFim);
                }
                else if (todosFrames.length > 0)
                {
                    arquivoFim = todosFrames[todosFrames.length - 1].arquivo;
                    console.log('⚠️ Usando último frame disponível');
                }
            }
            else
            {
                console.warn('⚠️ Stack trace não encontrado no objeto de erro');
            }
        }

        const iconHtml = '<img src="/images/assustado_radioativo_3D.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        const title = 'Erro Sem Tratamento';

        let message = `
        <div style="text-align: left; padding: 10px;">
            <p style="margin: 8px 0;">
                <i class="fa-duotone fa-file-code" style="color:#64b5f6;margin-right:8px;"></i>
                <b style="color:#64b5f6;">Erro Gerado em:</b> <span style="color: #fff;">${arquivoInicio}</span>
            </p>
            <p style="margin: 8px 0;">
                <i class="fa-duotone fa-function" style="color:#9370db;margin-right:8px;"></i>
                <b style="color:#9370db;">Método:</b> <span style="color: #64b5f6;">${metodo}</span>
            </p>
            <p style="margin: 8px 0;">
                <i class="fa-duotone fa-hashtag" style="color:#f76c6c;margin-right:8px;"></i>
                <b style="color:#f76c6c;">Linha:</b> <span style="color:#f76c6c; font-weight:bold; font-size: 18px;">${linhaMetodo}</span>
            </p>
            <p style="margin: 8px 0;">
                <i class="fa-duotone fa-circle-exclamation" style="color:#ff6f6f;margin-right:8px;"></i>
                <b style="color:#ff6f6f;">Erro:</b> <span style="color: #ffcc00;">${mensagemErro}</span>
            </p>
            <p style="margin: 8px 0;">
                <i class="fa-duotone fa-flag-checkered" style="color:#ff9933;margin-right:8px;"></i>
                <b style="color:#ff9933;">Término do Erro:</b> <span style="color: #fff;">${arquivoFim}</span>
            </p>`;

        if (innerErro)
        {
            message += `
            <p style="margin: 8px 0; padding: 8px; background: #3b2f2f; border-left: 3px solid #ff6f6f;">
                <b style="color:#ff9999;">💥 Inner Exception:</b><br/>
                <span style="color: #ffcc00;">${innerErro}</span>
            </p>`;
        }

        if (stackTrace)
        {
            message += `
            <details style="margin-top: 15px; cursor: pointer;">
                <summary style="color:#64b5f6; font-weight: bold; padding: 5px; background: #2b2b40; border-radius: 4px;">
                    📋 Ver Stack Trace Completo
                </summary>
                <pre style="
                    background: #1a1a2e;
                    border: 1px solid #444;
                    padding: 12px;
                    white-space: pre-wrap;
                    word-break: break-word;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 12px;
                    max-height: 300px;
                    overflow-y: auto;
                    color: #e0e0e0;
                    margin-top: 8px;
                    border-radius: 4px;
                ">${stackTrace}</pre>
            </details>`;
        }

        message += `</div>`;

        console.log('=== ShowErrorUnexpected RESUMO ===');
        console.log('Erro Gerado em:', arquivoInicio);
        console.log('Método:', metodo);
        console.log('Linha do Método:', linhaMetodo);
        console.log('Mensagem:', mensagemErro);
        console.log('Término do Erro:', arquivoFim);
        console.log('Stack presente?', !!stackTrace);
        console.log('Inner erro presente?', !!innerErro);
        console.log('=== ShowErrorUnexpected EXIBINDO ALERTA ===');

        return await this.ShowCustomAlert('error', iconHtml, title, message, "OK");
    },

    ShowPreventionAlert: async function (message)
    {
        const iconHtml = '<img src="/images/confirmar_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        const title = 'Atenção ao Preenchimento dos Dados';
        const confirmText = 'Tenho certeza! 💪🏼';
        const cancelText = 'Me enganei! 😟';
        const confirmado = await this.ShowCustomAlert('warning', iconHtml, title, message, confirmText, cancelText);
        return confirmado;
    },

    ShowNotification: function (message, color = "#28a745")
    {
        let notify = document.getElementById("sweet-alert-notify");
        if (!notify)
        {
            notify = document.createElement("div");
            notify.id = "sweet-alert-notify";
            notify.style.position = "fixed";
            notify.style.top = "20px";
            notify.style.right = "20px";
            notify.style.zIndex = "10000";
            notify.style.minWidth = "200px";
            notify.style.padding = "12px 20px";
            notify.style.borderRadius = "8px";
            notify.style.fontSize = "16px";
            notify.style.fontFamily = "'Segoe UI', sans-serif";
            notify.style.color = "white";
            notify.style.display = "none";
            document.body.appendChild(notify);
        }

        notify.textContent = message;
        notify.style.backgroundColor = color;
        notify.style.display = "block";

        setTimeout(() =>
        {
            notify.style.display = "none";
        }, 3000);
    },

    // =====================================================================
    // VALIDAÇÃO IA - Design específico para alertas de validação inteligente
    // =====================================================================

    /**
     * Mostra alerta de validação IA (erro bloqueante)
     * Design: Fundo escuro com destaque em vermelho/laranja
     */
    ShowValidacaoIAErro: async function (titulo, mensagem, confirmButtonText = "Entendi")
    {
        const iconHtml = `
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #ff416c, #ff4b2b); margin-bottom: 15px; box-shadow: 0 4px 15px rgba(255, 65, 108, 0.4);">
                <i class="fa-duotone fa-triangle-exclamation" style="font-size: 36px; color: white;"></i>
            </div>`;

        const msg = `
        <div style="background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden; font-family: 'Segoe UI', sans-serif; color: #e0e0e0; border: 1px solid #ff416c40;">
          <div style="background: linear-gradient(135deg, #1a1a2e, #0f0f23); padding: 25px; text-align: center; border-bottom: 2px solid #ff416c;">
            ${iconHtml}
            <div style="font-size: 22px; color: #ff6b6b; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${titulo}</div>
          </div>

          <div style="padding: 25px; font-size: 15px; line-height: 1.7; text-align: left; background: #16213e;">
            <div style="background: #1a1a2e; border-radius: 8px; padding: 15px; border-left: 4px solid #ff416c;">
              ${mensagem}
            </div>
          </div>

          <div style="background: #0f0f23; padding: 20px; text-align: center; border-top: 1px solid #ffffff10;">
            <button id="btnConfirmIA" style="
              background: linear-gradient(135deg, #ff416c, #ff4b2b);
              border: none;
              color: #fff;
              padding: 12px 30px;
              font-size: 15px;
              font-weight: bold;
              border-radius: 8px;
              cursor: pointer;
              box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3);
              transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255, 65, 108, 0.4)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255, 65, 108, 0.3)';">
              <i class="fa-duotone fa-check" style="margin-right: 8px;"></i>${confirmButtonText}
            </button>
          </div>
        </div>`;

        return new Promise((resolve) =>
        {
            Swal.fire({
                showConfirmButton: false,
                html: msg,
                backdrop: 'rgba(0,0,0,0.85)',
                heightAuto: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                focusConfirm: false,
                customClass: {
                    popup: 'swal2-popup swal2-no-border swal2-no-shadow'
                },
                didOpen: () =>
                {
                    const popup = document.querySelector('.swal2-popup');
                    if (popup)
                    {
                        popup.style.border = 'none';
                        popup.style.boxShadow = '0 0 50px rgba(255, 65, 108, 0.2)';
                        popup.style.background = 'transparent';
                    }
                    const confirmBtn = document.getElementById('btnConfirmIA');
                    if (confirmBtn) confirmBtn.onclick = () => { Swal.close(); resolve(true); };
                }
            });
        });
    },

    /**
     * Mostra alerta de validação IA (confirmação)
     * Design: Fundo escuro com destaque em amarelo/laranja
     */
    ShowValidacaoIAConfirmar: async function (titulo, mensagem, confirmButtonText = "Confirmar", cancelButtonText = "Corrigir")
    {
        const iconHtml = `
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #f7971e, #ffd200); margin-bottom: 15px; box-shadow: 0 4px 15px rgba(247, 151, 30, 0.4);">
                <i class="fa-duotone fa-brain-circuit" style="font-size: 36px; color: #1a1a2e;"></i>
            </div>`;

        const msg = `
        <div style="background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden; font-family: 'Segoe UI', sans-serif; color: #e0e0e0; border: 1px solid #f7971e40;">
          <div style="background: linear-gradient(135deg, #1a1a2e, #0f0f23); padding: 25px; text-align: center; border-bottom: 2px solid #f7971e;">
            ${iconHtml}
            <div style="font-size: 22px; color: #ffd200; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${titulo}</div>
            <div style="font-size: 12px; color: #888; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">
              <i class="fa-duotone fa-robot" style="margin-right: 5px;"></i>Análise Inteligente
            </div>
          </div>

          <div style="padding: 25px; font-size: 15px; line-height: 1.7; text-align: left; background: #16213e;">
            <div style="background: #1a1a2e; border-radius: 8px; padding: 15px; border-left: 4px solid #f7971e;">
              ${mensagem}
            </div>
          </div>

          <div style="background: #0f0f23; padding: 20px; text-align: center; border-top: 1px solid #ffffff10; display: flex; justify-content: center; gap: 15px;">
            <button id="btnCancelIA" style="
              background: #3d3d5c;
              border: 1px solid #555;
              color: #ccc;
              padding: 12px 25px;
              font-size: 15px;
              font-weight: 500;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.3s ease;
            " onmouseover="this.style.background='#4d4d6c'; this.style.borderColor='#777';"
               onmouseout="this.style.background='#3d3d5c'; this.style.borderColor='#555';">
              <i class="fa-duotone fa-pen-to-square" style="margin-right: 8px;"></i>${cancelButtonText}
            </button>
            <button id="btnConfirmIA" style="
              background: linear-gradient(135deg, #f7971e, #ffd200);
              border: none;
              color: #1a1a2e;
              padding: 12px 25px;
              font-size: 15px;
              font-weight: bold;
              border-radius: 8px;
              cursor: pointer;
              box-shadow: 0 4px 15px rgba(247, 151, 30, 0.3);
              transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(247, 151, 30, 0.4)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(247, 151, 30, 0.3)';">
              <i class="fa-duotone fa-check-double" style="margin-right: 8px;"></i>${confirmButtonText}
            </button>
          </div>
        </div>`;

        return new Promise((resolve) =>
        {
            Swal.fire({
                showConfirmButton: false,
                html: msg,
                backdrop: 'rgba(0,0,0,0.85)',
                heightAuto: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                focusConfirm: false,
                customClass: {
                    popup: 'swal2-popup swal2-no-border swal2-no-shadow'
                },
                didOpen: () =>
                {
                    const popup = document.querySelector('.swal2-popup');
                    if (popup)
                    {
                        popup.style.border = 'none';
                        popup.style.boxShadow = '0 0 50px rgba(247, 151, 30, 0.2)';
                        popup.style.background = 'transparent';
                    }
                    const confirmBtn = document.getElementById('btnConfirmIA');
                    if (confirmBtn) confirmBtn.onclick = () => { Swal.close(); resolve(true); };
                    const cancelBtn = document.getElementById('btnCancelIA');
                    if (cancelBtn) cancelBtn.onclick = () => { Swal.close(); resolve(false); };
                }
            });
        });
    }
};

function limparResiduosModalVanilla()
{
    document.querySelectorAll('.swal2-container, .swal2-backdrop-show').forEach(e => e.remove());

    document.querySelectorAll('div').forEach(div =>
    {
        const style = getComputedStyle(div);
        if (
            (style.position === 'fixed' || style.position === 'absolute') &&
            parseInt(style.zIndex || 0) >= 2000 &&
            (parseInt(style.width) === window.innerWidth || style.width === '100vw' || style.left === '0px') &&
            (parseInt(style.height) === window.innerHeight || style.height === '100vh' || style.top === '0px')
        )
        {
            if (
                !div.classList.contains('fc') &&
                !div.classList.contains('fc-view-harness') &&
                !div.classList.contains('modal-backdrop') &&
                !div.closest('.modal')
            )
            {
                div.remove();
            }
        }
    });
}
