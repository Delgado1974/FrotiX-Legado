/**
 * usuario-index.js
 * Gestão de Usuários - FrotiX
 * =============================
 */

(function () {
    "use strict";

    // =============================================
    // VARIÁVEIS GLOBAIS
    // =============================================
    let dataTableUsuarios = null;
    let dataTableRecursos = null;
    let modalControleAcessoInstance = null;
    let modalFotoInstance = null;

    // =============================================
    // INICIALIZAÇÃO
    // =============================================
    document.addEventListener('DOMContentLoaded', function () {
        try {
            inicializarDataTableUsuarios();
            inicializarModais();
            configurarEventosDelegados();
        } catch (error) {
            Alerta.TratamentoErroComLinha("usuario-index.js", "DOMContentLoaded", error);
        }
    });

    // =============================================
    // INICIALIZAR MODAIS BOOTSTRAP
    // =============================================
    function inicializarModais() {
        try {
            // Modal Controle de Acesso
            const modalControleAcessoEl = document.getElementById('modalControleAcesso');
            if (modalControleAcessoEl) {
                modalControleAcessoInstance = new bootstrap.Modal(modalControleAcessoEl);

                modalControleAcessoEl.addEventListener('hidden.bs.modal', function () {
                    try {
                        document.getElementById('txtUsuarioIdRecurso').value = '';
                        document.getElementById('txtNomeUsuarioRecurso').textContent = '';
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("usuario-index.js", "modalControleAcesso.hidden", error);
                    }
                });
            }

            // Modal Foto
            const modalFotoEl = document.getElementById('modalFoto');
            if (modalFotoEl) {
                modalFotoInstance = new bootstrap.Modal(modalFotoEl);

                modalFotoEl.addEventListener('hidden.bs.modal', function () {
                    try {
                        document.getElementById('txtNomeUsuarioFoto').textContent = '';
                        document.getElementById('divFotoContainer').innerHTML = '';
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("usuario-index.js", "modalFoto.hidden", error);
                    }
                });
            }

        } catch (error) {
            Alerta.TratamentoErroComLinha("usuario-index.js", "inicializarModais", error);
        }
    }

    // =============================================
    // CARREGAR RECURSOS DO USUÁRIO
    // =============================================
    function carregarRecursosUsuario(usuarioId) {
        try {
            // Destroi tabela anterior se existir
            if ($.fn.DataTable.isDataTable('#tblRecursos')) {
                $('#tblRecursos').DataTable().clear().destroy();
            }

            dataTableRecursos = $('#tblRecursos').DataTable({
                order: [[0, 'asc']],
                columnDefs: [
                    { targets: 0, className: "text-left" },
                    { targets: 1, className: "text-center", width: "130px" }
                ],
                responsive: true,
                ajax: {
                    url: "/api/Usuario/PegaRecursosUsuario",
                    type: "GET",
                    datatype: "json",
                    data: { usuarioId: usuarioId },
                    error: function (xhr, error, code) {
                        console.error("Erro ao carregar recursos:", error);
                        AppToast.show("Vermelho", "Erro ao carregar recursos do usuário", 5000);
                    }
                },
                columns: [
                    { data: "nome" },
                    {
                        data: "acesso",
                        render: function (data, type, row) {
                            try {
                                const url = `/api/Usuario/UpdateStatusAcesso?IDS=${row.ids}`;
                                if (data === true) {
                                    return `<a href="javascript:void(0)" 
                                               class="btn btn-xs ftx-badge-status btn-verde updateStatusAcesso" 
                                               data-url="${url}" 
                                               data-ejtip="Clique para remover acesso">
                                                <i class="fa-solid fa-unlock me-1"></i>Com Acesso
                                            </a>`;
                                } else {
                                    return `<a href="javascript:void(0)" 
                                               class="btn btn-xs ftx-badge-status fundo-cinza updateStatusAcesso" 
                                               data-url="${url}" 
                                               data-ejtip="Clique para conceder acesso">
                                                <i class="fa-solid fa-lock me-1"></i>Sem Acesso
                                            </a>`;
                                }
                            } catch (error) {
                                Alerta.TratamentoErroComLinha("usuario-index.js", "render.acesso", error);
                                return '';
                            }
                        }
                    }
                ],
                language: {
                    url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                    emptyTable: "Nenhum recurso disponível"
                }
            });
        } catch (error) {
            Alerta.TratamentoErroComLinha("usuario-index.js", "carregarRecursosUsuario", error);
        }
    }

    // =============================================
    // DATATABLE DE USUÁRIOS
    // =============================================
    function inicializarDataTableUsuarios() {
        try {
            dataTableUsuarios = $('#tblUsuario').DataTable({
                order: [[0, 'asc']],
                columnDefs: [
                    { targets: 0, className: "text-left", width: "35%" },
                    { targets: 1, className: "text-center", width: "80px" },
                    { targets: 2, className: "text-center", width: "110px" },
                    { targets: 3, className: "text-center", width: "90px" },
                    { targets: 4, className: "text-center ftx-actions", width: "160px", orderable: false }
                ],
                responsive: true,
                ajax: {
                    url: "/api/Usuario/GetAll",
                    type: "GET",
                    datatype: "json",
                    error: function (xhr, error, code) {
                        console.error("Erro ao carregar usuários:", error);
                        AppToast.show("Vermelho", "Erro ao carregar lista de usuários", 5000);
                    }
                },
                columns: [
                    {
                        // Coluna Nome com Avatar
                        data: null,
                        render: function (data, type, row) {
                            try {
                                const nome = row.nomeCompleto || 'Sem Nome';
                                const foto = row.fotoBase64;

                                let avatarHtml = '';
                                if (foto) {
                                    avatarHtml = `<img src="data:image/jpeg;base64,${foto}" 
                                                       class="ftx-avatar-img btnAbrirFoto" 
                                                       alt="${nome}"
                                                       data-id="${row.usuarioId}"
                                                       data-nome="${nome}"
                                                       data-foto="${foto}"
                                                       data-ejtip="Clique para ampliar foto"
                                                       style="cursor:pointer;" />`;
                                } else {
                                    avatarHtml = `<div class="ftx-avatar" data-ejtip="Usuário sem foto">
                                                    <span class="ftx-avatar-ico"><i class="fa-solid fa-user"></i></span>
                                                  </div>`;
                                }

                                return `<div class="d-flex align-items-center ftx-row-gap">
                                            ${avatarHtml}
                                            <span>${nome}</span>
                                        </div>`;
                            } catch (error) {
                                Alerta.TratamentoErroComLinha("usuario-index.js", "render.nomeCompleto", error);
                                return '';
                            }
                        }
                    },
                    {
                        // Coluna Ponto
                        data: "ponto",
                        render: function (data) {
                            return data || '-';
                        }
                    },
                    {
                        // Coluna Detentor Carga Patrimonial - Padrão FrotiX
                        data: "detentorCargaPatrimonial",
                        render: function (data, type, row) {
                            try {
                                const url = `/api/Usuario/UpdateCargaPatrimonial?Id=${row.usuarioId}`;
                                if (data === true) {
                                    return `<a href="javascript:void(0)" 
                                               class="btn btn-xs ftx-badge-status btn-verde updateCargaPatrimonial" 
                                               data-url="${url}" 
                                               data-ejtip="Clique para remover como Detentor">
                                                <i class="fa-solid fa-check me-1"></i>Sim
                                            </a>`;
                                } else {
                                    return `<a href="javascript:void(0)" 
                                               class="btn btn-xs ftx-badge-status fundo-cinza updateCargaPatrimonial" 
                                               data-url="${url}" 
                                               data-ejtip="Clique para definir como Detentor">
                                                <i class="fa-solid fa-xmark me-1"></i>Não
                                            </a>`;
                                }
                            } catch (error) {
                                Alerta.TratamentoErroComLinha("usuario-index.js", "render.detentorCarga", error);
                                return '';
                            }
                        }
                    },
                    {
                        // Coluna Status - Padrão FrotiX
                        data: "status",
                        render: function (data, type, row) {
                            try {
                                const url = `/api/Usuario/UpdateStatusUsuario?Id=${row.usuarioId}`;
                                if (data === true) {
                                    return `<a href="javascript:void(0)" 
                                               class="btn btn-xs ftx-badge-status btn-verde updateStatusUsuario" 
                                               data-url="${url}" 
                                               data-ejtip="Clique para inativar">
                                                <i class="fa-solid fa-circle-check me-1"></i>Ativo
                                            </a>`;
                                } else {
                                    return `<a href="javascript:void(0)" 
                                               class="btn btn-xs ftx-badge-status fundo-cinza updateStatusUsuario" 
                                               data-url="${url}" 
                                               data-ejtip="Clique para ativar">
                                                <i class="fa-solid fa-circle-xmark me-1"></i>Inativo
                                            </a>`;
                                }
                            } catch (error) {
                                Alerta.TratamentoErroComLinha("usuario-index.js", "render.status", error);
                                return '';
                            }
                        }
                    },
                    {
                        // Coluna Ações
                        data: null,
                        render: function (data, type, row) {
                            try {
                                const temFoto = row.fotoBase64 ? '' : ' disabled';
                                const tooltipFoto = row.fotoBase64 ? 'Visualizar foto' : 'Sem foto';

                                return `<a href="/Usuarios/Upsert?id=${row.usuarioId}" 
                                           class="btn btn-editar btn-icon-28" 
                                           data-ejtip="Editar usuário">
                                            <i class="fa-duotone fa-pen-to-square"></i>
                                        </a>
                                        <button type="button" 
                                                class="btn btn-verde btn-icon-28 btnRecursos" 
                                                data-id="${row.usuarioId}"
                                                data-nome="${row.nomeCompleto || 'Usuário'}"
                                                data-ejtip="Gerenciar recursos">
                                            <i class="fa-duotone fa-shield-keyhole"></i>
                                        </button>
                                        <button type="button" 
                                                class="btn btn-foto btn-icon-28 btnFoto${temFoto}" 
                                                data-id="${row.usuarioId}"
                                                data-nome="${row.nomeCompleto || 'Usuário'}"
                                                data-foto="${row.fotoBase64 || ''}"
                                                data-ejtip="${tooltipFoto}">
                                            <i class="fa-duotone fa-id-badge"></i>
                                        </button>
                                        <button type="button" 
                                                class="btn btn-vinho btn-icon-28 btnExcluir" 
                                                data-id="${row.usuarioId}"
                                                data-nome="${row.nomeCompleto || 'Usuário'}"
                                                data-ejtip="Excluir usuário">
                                            <i class="fa-duotone fa-trash-can"></i>
                                        </button>`;
                            } catch (error) {
                                Alerta.TratamentoErroComLinha("usuario-index.js", "render.acoes", error);
                                return '';
                            }
                        }
                    }
                ],
                language: {
                    url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                    emptyTable: "Nenhum usuário cadastrado"
                }
            });
        } catch (error) {
            Alerta.TratamentoErroComLinha("usuario-index.js", "inicializarDataTableUsuarios", error);
        }
    }

    // =============================================
    // EVENTOS DELEGADOS (CLIQUES NA TABELA)
    // =============================================
    function configurarEventosDelegados() {
        try {
            // Clique na foto da tabela para abrir modal
            $(document).on('click', '.btnAbrirFoto', function (e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();

                    const nome = $(this).data('nome');
                    const foto = $(this).data('foto');

                    abrirModalFoto(nome, foto);
                } catch (error) {
                    Alerta.TratamentoErroComLinha("usuario-index.js", "click.btnAbrirFoto", error);
                }
            });

            // Botão Foto nos botões de ação
            $(document).on('click', '.btnFoto:not(.disabled)', function (e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();

                    const nome = $(this).data('nome');
                    const foto = $(this).data('foto');

                    if (foto) {
                        abrirModalFoto(nome, foto);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("usuario-index.js", "click.btnFoto", error);
                }
            });

            // Botão Recursos - Abrir Modal
            $(document).on('click', '.btnRecursos', function (e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();

                    const usuarioId = $(this).data('id');
                    const nomeUsuario = $(this).data('nome');

                    document.getElementById('txtUsuarioIdRecurso').value = usuarioId;
                    document.getElementById('txtNomeUsuarioRecurso').textContent = nomeUsuario;

                    carregarRecursosUsuario(usuarioId);

                    if (modalControleAcessoInstance) {
                        modalControleAcessoInstance.show();
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("usuario-index.js", "click.btnRecursos", error);
                }
            });

            // Update Status Usuário
            $(document).on('click', '.updateStatusUsuario', function (e) {
                try {
                    e.preventDefault();
                    const url = $(this).data('url');
                    executarAcaoAjax(url, "Status atualizado!", function () {
                        dataTableUsuarios.ajax.reload(null, false);
                    });
                } catch (error) {
                    Alerta.TratamentoErroComLinha("usuario-index.js", "click.updateStatusUsuario", error);
                }
            });

            // Update Carga Patrimonial
            $(document).on('click', '.updateCargaPatrimonial', function (e) {
                try {
                    e.preventDefault();
                    const url = $(this).data('url');
                    executarAcaoAjax(url, "Carga patrimonial atualizada!", function () {
                        dataTableUsuarios.ajax.reload(null, false);
                    });
                } catch (error) {
                    Alerta.TratamentoErroComLinha("usuario-index.js", "click.updateCargaPatrimonial", error);
                }
            });

            // Update Status Acesso (no modal de recursos)
            $(document).on('click', '.updateStatusAcesso', function (e) {
                try {
                    e.preventDefault();
                    const url = $(this).data('url');
                    executarAcaoAjax(url, "Acesso atualizado!", function () {
                        if (dataTableRecursos) {
                            dataTableRecursos.ajax.reload(null, false);
                        }
                    });
                } catch (error) {
                    Alerta.TratamentoErroComLinha("usuario-index.js", "click.updateStatusAcesso", error);
                }
            });

            // Excluir Usuário
            $(document).on('click', '.btnExcluir', function (e) {
                try {
                    e.preventDefault();
                    const usuarioId = $(this).data('id');
                    const nome = $(this).data('nome');
                    confirmarExclusao(usuarioId, nome);
                } catch (error) {
                    Alerta.TratamentoErroComLinha("usuario-index.js", "click.btnExcluir", error);
                }
            });

        } catch (error) {
            Alerta.TratamentoErroComLinha("usuario-index.js", "configurarEventosDelegados", error);
        }
    }

    // =============================================
    // ABRIR MODAL DE FOTO
    // =============================================
    function abrirModalFoto(nome, foto) {
        try {
            document.getElementById('txtNomeUsuarioFoto').textContent = nome;

            const container = document.getElementById('divFotoContainer');

            if (foto && foto.trim() !== '') {
                container.innerHTML = `<img src="data:image/jpeg;base64,${foto}" 
                                            class="img-foto-usuario" 
                                            alt="Foto de ${nome}" />`;
            } else {
                container.innerHTML = `<div class="no-foto-placeholder">
                                           <i class="fa-duotone fa-user-slash"></i>
                                           <p>Usuário sem foto cadastrada</p>
                                       </div>`;
            }

            if (modalFotoInstance) {
                modalFotoInstance.show();
            }
        } catch (error) {
            Alerta.TratamentoErroComLinha("usuario-index.js", "abrirModalFoto", error);
        }
    }

    // =============================================
    // FUNÇÕES AUXILIARES
    // =============================================
    function executarAcaoAjax(url, mensagemSucesso, callback) {
        try {
            $.ajax({
                url: url,
                type: "GET",
                success: function (response) {
                    try {
                        if (response.success) {
                            AppToast.show("Verde", response.message || mensagemSucesso, 3000);
                            if (typeof callback === 'function') {
                                callback();
                            }
                        } else {
                            AppToast.show("Vermelho", response.message || "Erro ao executar ação", 5000);
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("usuario-index.js", "executarAcaoAjax.success", error);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Erro AJAX:", error);
                    AppToast.show("Vermelho", "Erro ao executar ação", 5000);
                }
            });
        } catch (error) {
            Alerta.TratamentoErroComLinha("usuario-index.js", "executarAcaoAjax", error);
        }
    }

    function confirmarExclusao(usuarioId, nome) {
        try {
            Swal.fire({
                title: 'Confirmar Exclusão',
                html: `Deseja realmente excluir o usuário <strong>${nome}</strong>?<br><br>
                       <small class="text-danger">Esta ação não pode ser desfeita.</small>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#8B0000',
                cancelButtonColor: '#6c757d',
                confirmButtonText: '<i class="fa-solid fa-trash-can me-1"></i> Sim, Excluir',
                cancelButtonText: '<i class="fa-solid fa-xmark me-1"></i> Cancelar',
                reverseButtons: true
            }).then((result) => {
                try {
                    if (result.isConfirmed) {
                        excluirUsuario(usuarioId);
                    }
                } catch (error) {
                    Alerta.TratamentoErroComLinha("usuario-index.js", "confirmarExclusao.then", error);
                }
            });
        } catch (error) {
            Alerta.TratamentoErroComLinha("usuario-index.js", "confirmarExclusao", error);
        }
    }

    function excluirUsuario(usuarioId) {
        try {
            $.ajax({
                url: "/api/Usuario/Delete",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ Id: usuarioId }),
                success: function (response) {
                    try {
                        if (response.success) {
                            AppToast.show("Verde", response.message || "Usuário excluído!", 3000);
                            dataTableUsuarios.ajax.reload(null, false);
                        } else {
                            AppToast.show("Vermelho", response.message || "Erro ao excluir", 5000);
                        }
                    } catch (error) {
                        Alerta.TratamentoErroComLinha("usuario-index.js", "excluirUsuario.success", error);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Erro ao excluir:", error);
                    AppToast.show("Vermelho", "Erro ao excluir usuário", 5000);
                }
            });
        } catch (error) {
            Alerta.TratamentoErroComLinha("usuario-index.js", "excluirUsuario", error);
        }
    }

})();
