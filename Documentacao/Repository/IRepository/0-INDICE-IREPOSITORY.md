# Índice: Documentação de IRepository

> **Última Atualização**: 08/01/2026  
> **Versão**: 1.0

---

## 📋 Status da Documentação

**Total de Arquivos**: ~103 interfaces  
**Documentados (Principais)**: 2/103  
**Padrão Documentado**: ✅ Sim

---

## ✅ Interfaces Base Documentadas

- [x] [`IRepository.md`](./IRepository.md) - Interface genérica base
- [x] [`IUnitOfWork.md`](./IUnitOfWork.md) - Interface Unit of Work (principal + extensões)

---

## 📝 Interfaces Específicas

**Total**: ~100 interfaces específicas seguindo o padrão `I{Entidade}Repository : IRepository<{Entidade}>`

### Padrão de Nomenclatura

- `I{Entidade}Repository.cs`
- Herda de `IRepository<{Entidade}>`
- Define métodos específicos quando necessário

### Exemplos

- `IVeiculoRepository : IRepository<Veiculo>`
- `IMotoristaRepository : IRepository<Motorista>`
- `IViewAbastecimentosRepository : IRepository<ViewAbastecimentos>`

---

## 📚 Documentação de Referência

Para entender como as interfaces específicas funcionam, consulte:
- [`IRepository.md`](./IRepository.md) - Contrato base
- [`../PADRAO-REPOSITORIES-ESPECIFICOS.md`](../PADRAO-REPOSITORIES-ESPECIFICOS.md) - Padrão completo

---

**Última atualização**: 08/01/2026  
**Versão**: 1.0
