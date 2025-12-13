// motorista_upsert.js
// Validação e submit do formulário de Motoristas

$(document).ready(function ()
{
    try
    {
        // Inicializar Status como checked e imagem padrão se for novo motorista
        const motoristaId = $("#MotoristaObj_Motorista_MotoristaId").val();
        if (!motoristaId || motoristaId === "00000000-0000-0000-0000-000000000000")
        {
            $("#chkStatus").prop("checked", true);

            // Carregar imagem padrão barbudo.jpg
            $("#imgPreview").attr("src", "/Images/barbudo.jpg");
            $("#imgPreview").show();
            $("#txtSemFoto").hide();
        }

        // Aguardar um momento para garantir que jQuery Mask está carregado
        setTimeout(function ()
        {
            try
            {
                aplicarMascaras();
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("motorista_upsert.js", "setTimeout.aplicarMascaras", error);
            }
        }, 100);

        // Validar CPF quando campo perde o foco
        $("#txtCPF").on("blur", function ()
        {
            try
            {
                var cpf = $(this).val()?.trim();

                // Se campo estiver vazio, não validar (será validado no submit)
                if (!cpf || cpf === "")
                {
                    return;
                }

                // Validar CPF
                if (!validarCPF(cpf))
                {
                    // LIMPA o campo ANTES de mostrar erro (evita loop)
                    $(this).val('');

                    // Agora mostra o erro
                    Alerta.Erro("CPF Inválido", "O CPF informado não é válido. Verifique os dígitos digitados.");
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("motorista_upsert.js", "txtCPF.blur", error);
            }
        });

        // Preview da foto quando usuário seleciona arquivo
        $("#fotoUpload").on("change", function (e)
        {
            try
            {
                var file = e.target.files[0];

                if (file)
                {
                    // Validar tipo de arquivo
                    var tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                    if (!tiposPermitidos.includes(file.type))
                    {
                        Alerta.Erro("Formato Inválido", "Por favor, selecione uma imagem nos formatos: JPG, PNG ou GIF");
                        $(this).val('');
                        return;
                    }

                    // Validar tamanho (máximo 5MB)
                    var tamanhoMaximo = 5 * 1024 * 1024; // 5MB em bytes
                    if (file.size > tamanhoMaximo)
                    {
                        Alerta.Erro("Arquivo Muito Grande", "A foto deve ter no máximo 5MB");
                        $(this).val('');
                        return;
                    }

                    // Ler arquivo e mostrar preview
                    var reader = new FileReader();

                    reader.onload = function (event)
                    {
                        try
                        {
                            $("#imgPreview").attr("src", event.target.result);
                            $("#imgPreview").show();
                            $("#txtSemFoto").hide();
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("motorista_upsert.js", "fotoUpload.reader.onload", error);
                        }
                    };

                    reader.onerror = function ()
                    {
                        try
                        {
                            Alerta.Erro("Erro ao Carregar Imagem", "Não foi possível carregar a imagem selecionada");
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("motorista_upsert.js", "fotoUpload.reader.onerror", error);
                        }
                    };

                    reader.readAsDataURL(file);
                }
                else
                {
                    // Limpar preview se nenhum arquivo foi selecionado
                    $("#imgPreview").hide();
                    $("#txtSemFoto").show();
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("motorista_upsert.js", "fotoUpload.change", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("motorista_upsert.js", "document.ready", error);
    }
});

// Função chamada no onclick do botão de submit
function validarFormulario()
{
    try
    {
        return validarCamposObrigatorios();
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("motorista_upsert.js", "validarFormulario", error);
        return false;
    }
}

function validarCamposObrigatorios()
{
    try
    {
        // Nome *
        const nome = $("#txtNome").val()?.trim();
        if (!nome || nome === "")
        {
            Alerta.Erro("Informação Ausente", "O campo Nome é obrigatório.");
            $("#txtNome").focus();
            return false;
        }

        // CPF *
        const cpf = $("#txtCPF").val()?.trim();
        if (!cpf || cpf === "")
        {
            Alerta.Erro("Informação Ausente", "O campo CPF é obrigatório.");
            $("#txtCPF").focus();
            return false;
        }

        // Validar CPF
        if (!validarCPF(cpf))
        {
            Alerta.Erro("CPF Inválido", "O CPF informado não é válido. Verifique os dígitos digitados.");
            $("#txtCPF").focus();
            return false;
        }

        // Data de Nascimento *
        const dataNascimento = $("#txtDataNascimento").val()?.trim();
        if (!dataNascimento || dataNascimento === "")
        {
            Alerta.Erro("Informação Ausente", "O campo Data de Nascimento é obrigatório.");
            $("#txtDataNascimento").focus();
            return false;
        }

        // Primeiro Celular *
        const celular01 = $("#txtCelular01").val()?.trim();
        if (!celular01 || celular01 === "")
        {
            Alerta.Erro("Informação Ausente", "O campo Primeiro Celular é obrigatório.");
            $("#txtCelular01").focus();
            return false;
        }

        // CNH *
        const cnh = $("#txtCNH").val()?.trim();
        if (!cnh || cnh === "")
        {
            Alerta.Erro("Informação Ausente", "O campo CNH é obrigatório.");
            $("#txtCNH").focus();
            return false;
        }

        // Categoria Habilitação *
        const categoriaCNH = $("#txtCategoriaCNH").val()?.trim();
        if (!categoriaCNH || categoriaCNH === "")
        {
            Alerta.Erro("Informação Ausente", "O campo Categoria Habilitação é obrigatório.");
            $("#txtCategoriaCNH").focus();
            return false;
        }

        // Data Vencimento CNH *
        const dataVencimentoCNH = $("#txtDataVencimentoCNH").val()?.trim();
        if (!dataVencimentoCNH || dataVencimentoCNH === "")
        {
            Alerta.Erro("Informação Ausente", "O campo Data Vencimento CNH é obrigatório.");
            $("#txtDataVencimentoCNH").focus();
            return false;
        }

        // Data Ingresso *
        const dataIngresso = $("#txtDataIngresso").val()?.trim();
        if (!dataIngresso || dataIngresso === "")
        {
            Alerta.Erro("Informação Ausente", "O campo Data Ingresso é obrigatório.");
            $("#txtDataIngresso").focus();
            return false;
        }

        // Unidade Vinculada *
        const unidadeId = $("#ddlUnidade").val();
        if (!unidadeId || unidadeId === "")
        {
            Alerta.Erro("Informação Ausente", "O campo Unidade Vinculada é obrigatório.");
            $("#ddlUnidade").focus();
            return false;
        }

        // Tipo Condutor *
        const tipoCondutor = $("#ddlTipoCondutor").val();
        if (!tipoCondutor || tipoCondutor === "")
        {
            Alerta.Erro("Informação Ausente", "O campo Tipo Condutor é obrigatório.");
            $("#ddlTipoCondutor").focus();
            return false;
        }

        // Efetivo / Ferista *
        const efetivoFerista = $("#ddlEfetivoFerista").val();
        if (!efetivoFerista || efetivoFerista === "")
        {
            Alerta.Erro("Informação Ausente", "O campo Efetivo / Ferista é obrigatório.");
            $("#ddlEfetivoFerista").focus();
            return false;
        }

        // Se chegou até aqui, todos os campos obrigatórios estão preenchidos
        return true;
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("motorista_upsert.js", "validarCamposObrigatorios", error);
        return false;
    }
}

function aplicarMascaras()
{
    try
    {
        // Verificar se jQuery Mask Plugin está disponível
        if (typeof $.fn.mask === 'undefined')
        {
            console.error('jQuery Mask Plugin NÃO ESTÁ DISPONÍVEL!');
            console.log('$.fn.mask:', $.fn.mask);
            console.log('jQuery versão:', $.fn.jquery);

            // Apenas aplicar uppercase para Categoria CNH
            $("#txtCategoriaCNH").on("input", function ()
            {
                try
                {
                    $(this).val($(this).val().toUpperCase());
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha("motorista_upsert.js", "txtCategoriaCNH.input", error);
                }
            });
            return;
        }

        console.log('jQuery Mask Plugin disponível! Aplicando máscaras...');

        // Máscara CPF: 000.000.000-00
        $("#txtCPF").mask("000.000.000-00");

        // Máscara Celular: (00) 00000-0000
        $("#txtCelular01").mask("(00) 00000-0000");
        $("#txtCelular02").mask("(00) 00000-0000");

        // Máscara CNH: 00000000000 (11 dígitos)
        $("#txtCNH").mask("00000000000");

        // Uppercase automático para Categoria CNH
        $("#txtCategoriaCNH").on("input", function ()
        {
            try
            {
                $(this).val($(this).val().toUpperCase());
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("motorista_upsert.js", "txtCategoriaCNH.input", error);
            }
        });

        console.log('Máscaras aplicadas com sucesso!');
    }
    catch (error)
    {
        console.error('ERRO ao aplicar máscaras:', error);
        Alerta.TratamentoErroComLinha("motorista_upsert.js", "aplicarMascaras", error);
    }
}

function validarCPF(cpf)
{
    try
    {
        // Remove caracteres não numéricos
        cpf = cpf.replace(/[^\d]/g, '');

        // Verifica se tem 11 dígitos
        if (cpf.length !== 11)
        {
            return false;
        }

        // Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
        if (/^(\d)\1{10}$/.test(cpf))
        {
            return false;
        }

        // Validação do primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++)
        {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = soma % 11;
        let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;

        if (digitoVerificador1 !== parseInt(cpf.charAt(9)))
        {
            return false;
        }

        // Validação do segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++)
        {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = soma % 11;
        let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;

        if (digitoVerificador2 !== parseInt(cpf.charAt(10)))
        {
            return false;
        }

        // CPF válido
        return true;
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("motorista_upsert.js", "validarCPF", error);
        return false;
    }
}
