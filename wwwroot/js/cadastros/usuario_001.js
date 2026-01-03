var dataTable;

$(document).ready(function () {
    try
    {
        loadList();

        $(document).on("click", ".btn-delete", function () {
            try
            {
                var Id = $(this).data("id");

                Alerta.Confirmar(
                    "Você tem certeza que deseja apagar este Usuário?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"

                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({ Id: Id });
                            var url = "/api/Usuario/Delete";
                            $.ajax({
                                url: url,
                                type: "POST",
                                data: dataToPost,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data) {
                                    try
                                    {
                                        if (data.success) {
                                            AppToast.show('Verde', data.message);
                                            dataTable.ajax.reload();
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "usuario_<num>.js",
                                            "success",
                                            error,
                                        );
                                    }
                                },
                                error: function (err) {
                                    try
                                    {
                                        console.log(err);
                                        alert("something went wrong");
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "usuario_<num>.js",
                                            "error",
                                            error,
                                        );
                                    }
                                },
                            });
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "usuario_<num>.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("usuario_<num>.js", "callback@$.on#2", error);
            }
        });

        $(document).on("click", ".updateStatusUsuario", function () {
            try
            {
                var url = $(this).data("url");
                var currentElement = $(this);

                $.get(url, function (data) {
                    try
                    {
                        if (data.success) {
                            AppToast.show('Verde', "Status alterado com sucesso!");
                            var text = "Ativo";

                            if (data.type == 1) {
                                text = "Inativo";
                                currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                            } else
                                currentElement.removeClass("fundo-cinza").addClass("btn-verde");

                            currentElement.text(text);
                        } else alert("Something went wrong!");
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "usuario_<num>.js",
                            "callback@$.get#1",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("usuario_<num>.js", "callback@$.on#2", error);
            }
        });

        $(document).on("click", ".updateCargaPatrimonial", function () {
            try
            {
                var url = $(this).data("url");
                var currentElement = $(this);

                $.get(url, function (data) {
                    try
                    {
                        if (data.success) {
                            AppToast.show('Verde', "Carga Patrimonial alterada com sucesso!");
                            var text = "Sim";

                            if (data.type == 1) {
                                text = "Não";
                                currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                            } else
                                currentElement.removeClass("fundo-cinza").addClass("btn-verde");

                            currentElement.text(text);
                        } else alert("Something went wrong!");
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "usuario_<num>.js",
                            "callback@$.get#1",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("usuario_<num>.js", "callback@$.on#2", error);
            }
        });

        // Handler para abrir modal de Senha (elementos dinâmicos - Bootstrap 5)
        $(document).on("click", ".btn-modal-senha", function (e) {
            try {
                e.preventDefault();
                var usuarioId = $(this).data("id");
                $('#txtUsuarioIdSenha').val(usuarioId);
                var modalElement = document.getElementById('modalSenha');
                if (modalElement) {
                    var modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            } catch (error) {
                Alerta.TratamentoErroComLinha("usuario_001.js", "btn-modal-senha.click", error);
            }
        });

        // Handler para abrir modal de Controle de Acesso (elementos dinâmicos - Bootstrap 5)
        $(document).on("click", ".btn-modal-acesso", function (e) {
            try {
                e.preventDefault();
                var usuarioId = $(this).data("id");
                $('#txtUsuarioIdAcesso').val(usuarioId);
                var modalElement = document.getElementById('modalControleAcesso');
                if (modalElement) {
                    var modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            } catch (error) {
                Alerta.TratamentoErroComLinha("usuario_001.js", "btn-modal-acesso.click", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("usuario_<num>.js", "callback@$.ready#0", error);
    }
});

function loadList() {
    try
    {
        dataTable = $("#tblUsuario").DataTable({
            columnDefs: [
                {
                    targets: 0, //Nome
                    className: "text-left",
                    width: "15%",
                },
                {
                    targets: 1, //Ponto
                    className: "text-center",
                    width: "6%",
                },
                {
                    targets: 2, //Carga Patrimonial
                    className: "text-center",
                    width: "10%",
                },
                {
                    targets: 3, //Status
                    className: "text-center",
                    width: "8%",
                },
                {
                    targets: 4, //Ação
                    className: "text-center",
                    width: "8%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/usuario",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "nomeCompleto" },
                { data: "ponto" },
                {
                    data: "detentorCargaPatrimonial",
                    render: function (data, type, row, meta) {
                        try
                        {
                            if (data)
                                return (
                                    '<a href="javascript:void" class="updateCargaPatrimonial btn btn-verde btn-xs text-white" data-url="/api/Usuario/updateCargaPatrimonial?Id=' +
                                    row.usuarioId +
                                    '">Sim</a>'
                                );
                            else
                                return (
                                    '<a href="javascript:void" class="updateCargaPatrimonial btn btn-xs fundo-cinza text-white text-bold" data-url="/api/Usuario/updateCargaPatrimonial?Id=' +
                                    row.usuarioId +
                                    '">Não</a>'
                                );
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("usuario_<num>.js", "render", error);
                        }
                    },
                },
                {
                    data: "status",
                    render: function (data, type, row, meta) {
                        try
                        {
                            if (data)
                                return (
                                    '<a href="javascript:void" class="updateStatusUsuario btn btn-verde btn-xs text-white" data-url="/api/Usuario/updateStatusUsuario?Id=' +
                                    row.usuarioId +
                                    '">Ativo</a>'
                                );
                            else
                                return (
                                    '<a href="javascript:void" class="updateStatusUsuario btn btn-xs fundo-cinza text-white text-bold" data-url="/api/Usuario/updateStatusUsuario?Id=' +
                                    row.usuarioId +
                                    '">Inativo</a>'
                                );
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("usuario_<num>.js", "render", error);
                        }
                    },
                },
                {
                    data: "usuarioId",
                    render: function (data) {
                        try
                        {
                            return `<div class="text-center">
                                <a href="/Usuarios/Upsert?id=${data}" class="btn btn-azul btn-xs text-white" aria-label="Editar o Usuário!" data-microtip-position="top" role="tooltip" style="cursor:pointer;">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn-delete btn btn-vinho btn-xs text-white" aria-label="Excluir o Usuário!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                                <a class="btn btn-modal-senha btn-dark btn-xs text-white" aria-label="Altera a Senha!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}'>
                                    <i class="fa-thin fa-camera-retro"></i>
                                </a>
                                <a class="btn btn-modal-acesso btn-xs text-white btn-fundo-laranja" aria-label="Controle de Acesso!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}'>
                                    <i class="fa-thin fa-diagram-successor"></i>
                                </a>
                    </div>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("usuario_<num>.js", "render", error);
                        }
                    },
                },
            ],

            language: {
                url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                emptyTable: "Sem Dados para Exibição",
            },
            width: "100%",
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("usuario_<num>.js", "loadList", error);
    }
}
