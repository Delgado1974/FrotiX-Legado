
using FrotiX.Repository;
using global::FrotiX.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Cache
    {
    public class MotoristaCache
        {
        private readonly IUnitOfWork _unitOfWork;
        private List<object> _cachedMotoristas;
        private readonly object _lock = new();

        private readonly IServiceScopeFactory _scopeFactory;


        public MotoristaCache(IUnitOfWork unitOfWork, IServiceScopeFactory scopeFactory)
            {
            _unitOfWork = unitOfWork;
            _scopeFactory = scopeFactory;
            LoadMotoristas(); // Carrega ao iniciar
            }

        public void LoadMotoristas()
            {
            lock (_lock)
                {
                var motoristas = _unitOfWork.ViewMotoristasViagem.GetAllReduced(
                    selector: m => new
                        {
                        m.MotoristaId,
                        Nome = m.MotoristaCondutor,
                        m.Foto
                        },
                    orderBy: q => q.OrderBy(m => m.MotoristaCondutor)
                ).ToList();

                _cachedMotoristas = motoristas.Select(m =>
                {
                    string fotoBase64;

                    if (m.Foto != null && m.Foto.Length > 0)
                        {
                        try
                            {
                            fotoBase64 = $"data:image/jpeg;base64,{Convert.ToBase64String(m.Foto)}";
                            }
                        catch
                            {
                            fotoBase64 = "/images/barbudo.jpg";
                            }
                        }
                    else
                        {
                        fotoBase64 = "/images/barbudo.jpg";
                        }

                    return new
                        {
                        m.MotoristaId,
                        Nome = m.Nome,
                        Foto = fotoBase64
                        };
                }).Cast<object>().ToList();
                }
            }


        public List<object> GetMotoristas()
            {
            return _cachedMotoristas?.Select(m =>
            {
                dynamic motorista = m;
                if (string.IsNullOrWhiteSpace(motorista.Foto))
                    {
                    motorista.Foto = "/images/barbudo.jpg";
                    }
                return motorista;
            }).ToList<object>();
            }
        }
    }


public class MotoristaDto
    {
    public Guid MotoristaId { get; set; }
    public string Nome { get; set; }
    public string Foto { get; set; }
    }


