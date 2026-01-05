// IRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace FrotiX.Repository.IRepository
    {
    /// <summary>
    /// Contrato genérico de repositório para entidades EF Core.
    /// Mantém apenas operações genéricas (sem acoplamento a tipos do domínio).
    /// </summary>
    public interface IRepository<T>
        where T : class
        {
        /// <summary>Obtém uma entidade pela chave primária (chave simples).</summary>
        T Get(object id);

        /// <summary>Obtém a primeira entidade que satisfaz o filtro.</summary>
        T GetFirstOrDefault(
            Expression<Func<T , bool>> filter = null ,
            string includeProperties = null
        );

        /// <summary>Obtém a primeira entidade que satisfaz o filtro (assíncrono).</summary>
        Task<T> GetFirstOrDefaultAsync(
            Expression<Func<T , bool>> filter = null ,
            string includeProperties = null
        );

        /// <summary>Retorna um conjunto materializado de entidades.</summary>
        IEnumerable<T> GetAll(
            Expression<Func<T , bool>> filter = null ,
            Func<IQueryable<T> , IOrderedQueryable<T>> orderBy = null ,
            string includeProperties = null ,
            bool asNoTracking = true
        );

        /// <summary>Retorna um conjunto materializado de entidades (assíncrono).</summary>
        Task<IEnumerable<T>> GetAllAsync(
            Expression<Func<T , bool>> filter = null ,
            Func<IQueryable<T> , IOrderedQueryable<T>> orderBy = null ,
            string includeProperties = null ,
            bool asNoTracking = true ,
            int? take = null
        );

        /// <summary>
        /// ✅ Versão materializada (compat com páginas antigas).
        /// Projeta e já materializa a lista (ToList()).
        /// </summary>
        IEnumerable<TResult> GetAllReduced<TResult>(
            Expression<Func<T , TResult>> selector ,
            Expression<Func<T , bool>> filter = null ,
            Func<IQueryable<T> , IOrderedQueryable<T>> orderBy = null ,
            string includeProperties = null ,
            bool asNoTracking = true
        );

        /// <summary>
        /// Retorna um IQueryable projetado (DTO/lista leve), sem materializar.
        /// O EF Core traduz a expressão para SQL parametrizado.
        /// </summary>
        IQueryable<TResult> GetAllReducedIQueryable<TResult>(
            Expression<Func<T , TResult>> selector ,
            Expression<Func<T , bool>> filter = null ,
            Func<IQueryable<T> , IOrderedQueryable<T>> orderBy = null ,
            string includeProperties = null ,
            bool asNoTracking = true
        );

        /// <summary>Adiciona a entidade ao contexto.</summary>
        void Add(T entity);

        /// <summary>Adiciona a entidade ao contexto (assíncrono).</summary>
        Task AddAsync(T entity);

        /// <summary>Atualiza a entidade no contexto.</summary>
        void Update(T entity);

        /// <summary>Remove a entidade pela chave (chave simples).</summary>
        void Remove(object id);

        /// <summary>Remove a entidade informada.</summary>
        void Remove(T entity);
        }
    }
