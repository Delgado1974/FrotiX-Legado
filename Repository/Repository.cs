// Repository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

using FrotiX.Repository.IRepository;

using Microsoft.EntityFrameworkCore;

namespace FrotiX.Repository
    {
    /// <summary>
    /// Implementação genérica de repositório para EF Core.
    /// Não contém nenhuma lógica específica de domínio.
    /// </summary>
    public class Repository<T> :IRepository<T>
        where T : class
        {
        protected readonly DbContext _db;
        protected readonly DbSet<T> dbSet;

        public Repository(DbContext db)
            {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            dbSet = _db.Set<T>();
            }

        /// <summary>
        /// Monta a query base aplicando filtro, includes (CSV) e AsNoTracking.
        /// </summary>
        protected IQueryable<T> PrepareQuery(
            Expression<Func<T , bool>> filter = null ,
            string includeProperties = null ,
            bool asNoTracking = false
        )
            {
            IQueryable<T> query = dbSet;

            if (asNoTracking)
                query = query.AsNoTracking();

            if (filter != null)
                query = query.Where(filter);

            if (!string.IsNullOrWhiteSpace(includeProperties))
                {
                foreach (
                    var inc in includeProperties.Split(
                        new[] { ',' } ,
                        StringSplitOptions.RemoveEmptyEntries
                    )
                )
                    {
                    var path = inc.Trim();
                    if (!string.IsNullOrEmpty(path))
                        query = query.Include(path);
                    }
                }

            return query;
            }

        public T Get(object id)
            {
            if (id == null)
                return null;
            return dbSet.Find(id);
            }

        public T GetFirstOrDefault(
            Expression<Func<T , bool>> filter = null ,
            string includeProperties = null
        )
            {
            try
                {
                return PrepareQuery(filter , includeProperties , asNoTracking: true).FirstOrDefault();
                }
            catch (InvalidOperationException ex) when (ex.Message.Contains("second operation"))
                {
                // Erro de concorrência - tentar novamente com um novo contexto
                // ou simplesmente retornar null e deixar o chamador lidar
                return null;
                }
            catch (Exception)
                {
                // Logar o erro para debug
                throw; // Re-lançar o erro para não esconder problemas
                }
            }

        public async Task<T> GetFirstOrDefaultAsync(
            Expression<Func<T , bool>> filter = null ,
            string includeProperties = null
        )
            {
            try
                {
                return await PrepareQuery(filter , includeProperties , asNoTracking: true)
                    .FirstOrDefaultAsync();
                }
            catch (InvalidOperationException ex) when (ex.Message.Contains("second operation"))
                {
                // Erro de concorrência - tentar novamente com um novo contexto
                // ou simplesmente retornar null e deixar o chamador lidar
                return null;
                }
            catch (Exception ex)
                {
                // Logar o erro para debug
                throw; // Re-lançar o erro para não esconder problemas
                }
            }

        public IEnumerable<T> GetAll(
            Expression<Func<T , bool>> filter = null ,
            Func<IQueryable<T> , IOrderedQueryable<T>> orderBy = null ,
            string includeProperties = null ,
            bool asNoTracking = true
        )
            {
            var q = PrepareQuery(filter , includeProperties , asNoTracking);
            if (orderBy != null)
                q = orderBy(q);
            return q.ToList();
            }

        public async Task<IEnumerable<T>> GetAllAsync(
            Expression<Func<T , bool>> filter = null ,
            Func<IQueryable<T> , IOrderedQueryable<T>> orderBy = null ,
            string includeProperties = null ,
            bool asNoTracking = true ,
            int? take = null
        )
            {
            var q = PrepareQuery(filter , includeProperties , asNoTracking);
            if (orderBy != null)
                q = orderBy(q);
            if (take.HasValue)
                q = q.Take(take.Value);
            return await q.ToListAsync();
            }

        /// <summary>
        /// ✅ Versão materializada (compat com páginas antigas).
        /// Implementada a partir da variante IQueryable + ToList().
        /// </summary>
        public IEnumerable<TResult> GetAllReduced<TResult>(
            Expression<Func<T , TResult>> selector ,
            Expression<Func<T , bool>> filter = null ,
            Func<IQueryable<T> , IOrderedQueryable<T>> orderBy = null ,
            string includeProperties = null ,
            bool asNoTracking = true
        )
            {
            return GetAllReducedIQueryable(
                    selector ,
                    filter ,
                    orderBy ,
                    includeProperties ,
                    asNoTracking
                )
                .ToList();
            }

        public IQueryable<TResult> GetAllReducedIQueryable<TResult>(
            Expression<Func<T , TResult>> selector ,
            Expression<Func<T , bool>> filter = null ,
            Func<IQueryable<T> , IOrderedQueryable<T>> orderBy = null ,
            string includeProperties = null ,
            bool asNoTracking = true
        )
            {
            if (selector == null)
                throw new ArgumentNullException(nameof(selector));

            var q = PrepareQuery(filter , includeProperties , asNoTracking);
            if (orderBy != null)
                q = orderBy(q);

            return q.Select(selector);
            }

        public void Add(T entity)
            {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            dbSet.Add(entity);
            }

        public async Task AddAsync(T entity)
            {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            await dbSet.AddAsync(entity);
            }

        public void Update(T entity)
            {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            dbSet.Update(entity);
            }

        public void Remove(object id)
            {
            if (id == null)
                return;
            var entity = dbSet.Find(id);
            if (entity != null)
                dbSet.Remove(entity);
            }

        public void Remove(T entity)
            {
            if (entity == null)
                return;
            dbSet.Remove(entity);
            }
        }
    }
