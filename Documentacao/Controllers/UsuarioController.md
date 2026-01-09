# Documentação: UsuarioController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `UsuarioController` gerencia operações CRUD de usuários do sistema (AspNetUsers), incluindo gestão de status e carga patrimonial.

**Principais características:**

✅ **CRUD Completo**: Listagem, exclusão e atualização de status  
✅ **Carga Patrimonial**: Gestão de flag `DetentorCargaPatrimonial`  
✅ **Validação de Dependências**: Verifica controles de acesso antes de excluir

**Nota**: Controller implementado como partial class dividido em múltiplos arquivos.

---

## Endpoints API

### GET `/api/Usuario`

**Descrição**: Retorna lista de usuários com informações básicas

**Response**:
```json
{
  "data": [
    {
      "usuarioId": "guid",
      "nomeCompleto": "João Silva",
      "ponto": "PONTO_01",
      "detentorCargaPatrimonial": true,
      "status": true
    }
  ]
}
```

---

### POST `/api/Usuario/Delete`

**Descrição**: Exclui usuário com validação

**Validações**: Verifica se há controles de acesso associados (`ControleAcesso.UsuarioId`)

**Response**:
```json
{
  "success": false,
  "message": "Não foi possível remover o Usuário. Ele está associado a um ou mais recursos!"
}
```

---

### GET `/api/Usuario/UpdateStatusUsuario`

**Descrição**: Alterna status ativo/inativo

**Parâmetros**: `Id` (string) - ID do usuário

---

### GET `/api/Usuario/UpdateCargaPatrimonial`

**Descrição**: Alterna flag `DetentorCargaPatrimonial`

**Parâmetros**: `Id` (string) - ID do usuário

**Uso**: Define se usuário é detentor de carga patrimonial

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Usuario/Index.cshtml`
- **Pages**: Páginas administrativas

### O Que Este Controller Chama

- **`_unitOfWork.AspNetUsers`**: CRUD
- **`_unitOfWork.ControleAcesso`**: Validação de dependências

---

## Notas Importantes

1. **Partial Class**: Controller dividido em múltiplos arquivos
2. **Carga Patrimonial**: Flag específica para gestão patrimonial
3. **Controle de Acesso**: Usuários têm relacionamento com `ControleAcesso` para permissões

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do UsuarioController

**Arquivos Afetados**:
- `Controllers/UsuarioController.cs`
- `Controllers/UsuarioController.Usuarios.cs`

**Impacto**: Documentação de referência para operações de usuários

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
