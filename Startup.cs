using AspNetCoreHero.ToastNotification;
using AspNetCoreHero.ToastNotification.Extensions;
using FrotiX.Cache;
using FrotiX.Data;
using FrotiX.Filters;
using FrotiX.Hubs;
using FrotiX.Middlewares;
using FrotiX.Models;
using FrotiX.Repository;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using FrotiX.Services.WhatsApp;
using FrotiX.Settings;
using FrotiX.TextNormalization.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using System;
using System.Globalization;
using System.IO.Compression;
using System.Linq;
using Telerik.Reporting.Cache.File;
using Telerik.Reporting.Services;
using Microsoft.AspNetCore.Server.Kestrel.Core;

namespace FrotiX
{
    public class Startup
    {
        private readonly IWebHostEnvironment _environment;

        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            try
            {
                Configuration = configuration;
                _environment = environment; // ⭐ ADICIONE ESTA LINHA

                // Define valores numéricos em Reais
                CultureInfo.DefaultThreadCurrentCulture = new CultureInfo("pt-BR");
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha(ex, "Startup.cs", ".ctor");
            }
        }

        public IConfiguration Configuration
        {
            get;
        }

        // Serviços / DI
        public void ConfigureServices(IServiceCollection services)
        {
            try
            {
                services.Configure<FormOptions>(options =>
                {
                    options.MultipartBodyLengthLimit = 104857600; // 100MB
                    options.ValueLengthLimit = 104857600;
                    options.ValueCountLimit = 10000;
                });

                services.Configure<KestrelServerOptions>(options =>
                {
                    options.Limits.MaxRequestBodySize = 104857600; // 100MB
                });

                services.Configure<IISServerOptions>(options =>
                {
                    options.MaxRequestBodySize = 104857600; // 100MB
                });

                // Adicionar compressão
                services.AddResponseCompression(options =>
                {
                    options.EnableForHttps = true;
                    options.Providers.Add<BrotliCompressionProvider>();
                    options.Providers.Add<GzipCompressionProvider>();
                });

                services.Configure<BrotliCompressionProviderOptions>(options =>
                {
                    options.Level = CompressionLevel.Optimal;
                });

                services.Configure<GzipCompressionProviderOptions>(options =>
                {
                    options.Level = CompressionLevel.Optimal;
                });

                // ⭐ CORS - Configuração melhorada para Telerik Reports
                services.AddCors(options =>
                {
                    options.AddPolicy("CorsPolicy",
                        builder => builder
                            .AllowAnyOrigin()
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .WithExposedHeaders("Content-Disposition")); // Importante para downloads de PDF
                });

                // Configuração do Telerik Reporting
                services.TryAddSingleton<IReportSourceResolver, CustomReportSourceResolver>();
                services.TryAddSingleton<IReportServiceConfiguration>(sp =>
                    new ReportServiceConfiguration
                    {
                        ReportingEngineConfiguration = sp.GetService<IConfiguration>(),
                        HostAppId = "FrotiXApp",
                        Storage = new FileStorage(),
                        ReportSourceResolver = sp.GetRequiredService<IReportSourceResolver>()
                    });

                // Habilitar IO síncrono (necessário para o Telerik Reporting)
                services.Configure<IISServerOptions>(options =>
                {
                    options.AllowSynchronousIO = true;
                });

                // Adicione temporariamente no Startup.cs para testar:
                var testConn = Configuration.GetConnectionString("DefaultConnection");
                Console.WriteLine($"Connection String: {testConn}");

                // Define cultura ANTES do Syncfusion
                services.Configure<RequestLocalizationOptions>(options =>
                {
                    var supportedCultures = new[] { "pt-BR" };
                    options.DefaultRequestCulture = new RequestCulture("pt-BR");
                    options.SupportedCultures = supportedCultures.Select(c => new CultureInfo(c)).ToList();
                    options.SupportedUICultures = supportedCultures.Select(c => new CultureInfo(c)).ToList();
                });

                // Cache em memória e hosted service de warmup
                services.AddMemoryCache();
                services.AddHostedService<CacheWarmupService>();

                // ========================================================
                // ⭐ SISTEMA DE LOG DE ERROS - SERVIÇOS
                // ========================================================
                services.AddSingleton<ILogService, LogService>();
                
                // Filtros de exceção (devem ser Scoped para injeção de dependência)
                services.AddScoped<GlobalExceptionFilter>();
                services.AddScoped<AsyncExceptionFilter>();
                services.AddScoped<PageExceptionFilter>();
                services.AddScoped<AsyncPageExceptionFilter>();
                // ========================================================

                // ⭐ Controllers com Newtonsoft configurado corretamente
                services.AddControllers()
                    .AddNewtonsoftJson();

                // ⭐ SWAGGER - Configuração (apenas APIs)
                services.AddEndpointsApiExplorer();
                services.AddSwaggerGen(c =>
                {
                    c.SwaggerDoc("v1", new OpenApiInfo
                    {
                        Title = "FrotiX API",
                        Version = "v1",
                        Description = "API do Sistema de Gestão de Frotas - Câmara dos Deputados"
                    });

                    // Documentar APENAS endpoints que começam com /api
                    c.DocInclusionPredicate((docName, apiDesc) =>
                    {
                        if (apiDesc.RelativePath == null) return false;
                        return apiDesc.RelativePath.StartsWith("api/", StringComparison.OrdinalIgnoreCase);
                    });

                    // Resolver conflitos de rota
                    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());

                    // Usar FullName para evitar conflitos de tipo
                    c.CustomSchemaIds(type => type.FullName);
                });

                services.Configure<SmartSettings>(
                    Configuration.GetSection(SmartSettings.SectionName)
                );
                services.AddSingleton(s => s.GetRequiredService<IOptions<SmartSettings>>().Value);

                services.Configure<CookiePolicyOptions>(options =>
                {
                    options.CheckConsentNeeded = context => true;
                    options.MinimumSameSitePolicy = SameSiteMode.None;
                });

                // ========================================================
                // CONFIGURAÇÕES DE BANCO DE DADOS E IDENTITY
                // ========================================================
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options
                        .UseSqlServer(Configuration.GetConnectionString("DefaultConnection"))
                        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
                });

                // Registro único do FrotiXDbContext
                services.AddDbContext<FrotiXDbContext>(options =>
                {
                    options.EnableSensitiveDataLogging();
                    options
                        .UseSqlServer(Configuration.GetConnectionString("DefaultConnection"))
                        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
                });

                services
                    .AddIdentity<IdentityUser, IdentityRole>(options =>
                        options.SignIn.RequireConfirmedAccount = false
                    )
                    .AddRoleManager<RoleManager<IdentityRole>>()
                    .AddEntityFrameworkStores<ApplicationDbContext>();

                services.AddScoped<IUnitOfWork, UnitOfWork>();
                services.AddScoped<ICorridasTaxiLegRepository, CorridasTaxiLegRepository>();

                services.AddScoped<IViagemEstatisticaRepository, ViagemEstatisticaRepository>();
                services.AddScoped<ViagemEstatisticaService>();

                // Repositórios de Alertas
                services.AddScoped<IAlertasFrotiXRepository, AlertasFrotiXRepository>();
                services.AddScoped<IAlertasUsuarioRepository, AlertasUsuarioRepository>();

                services.Configure<IdentityOptions>(opts =>
                {
                    opts.Password.RequireNonAlphanumeric = false;
                    opts.Password.RequireLowercase = false;
                    opts.Password.RequireUppercase = false;
                    opts.Password.RequireDigit = false;
                });

                services.AddTransient<IEmailSender, EmailSender>();

                // 🔒 Filtro global: exige usuário autenticado + Filtros de Log de Erros
                services.AddControllersWithViews(options =>
                {
                    var policy = new AuthorizationPolicyBuilder()
                        .RequireAuthenticatedUser()
                        .Build();
                    options.Filters.Add(new AuthorizeFilter(policy));

                    // ⭐ Filtros globais de exceção para log de erros (Controllers)
                    options.Filters.Add<GlobalExceptionFilter>();
                    options.Filters.Add<AsyncExceptionFilter>();
                });

                services
                    .AddRazorPages()
                    .AddRazorPagesOptions(options =>
                    {
                        // raiz "/" aponta para o dashboard
                        options.Conventions.AddPageRoute("/intel/analyticsdashboard", "");
                    })
                    .AddMvcOptions(options =>
                    {
                        options.MaxModelValidationErrors = 50;
                        options.ModelBindingMessageProvider.SetValueMustNotBeNullAccessor(_ =>
                            "O campo é obrigatório."
                        );
                        
                        // ⭐ Filtros de exceção também para Razor Pages via MvcOptions
                        options.Filters.Add<PageExceptionFilter>();
                        options.Filters.Add<AsyncPageExceptionFilter>();
                    });

                services.AddRazorPages().AddRazorRuntimeCompilation();

                services.ConfigureApplicationCookie(options =>
                {
                    options.Cookie.Name = "FrotiX";
                    options.LoginPath = "/Identity/Account/LoginFrotiX";
                    options.LogoutPath = "/Identity/Account/Logout";
                    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
                    options.ExpireTimeSpan = TimeSpan.FromHours(10);
                    options.SlidingExpiration = true;
                });

                services.AddAntiforgery(o => o.HeaderName = "X-CSRF-TOKEN");

                services.AddNotyf(config =>
                {
                    config.DurationInSeconds = 10;
                    config.IsDismissable = true;
                    config.Position = NotyfPosition.TopRight;
                });

                services.AddSession(options =>
                {
                    options.IdleTimeout = TimeSpan.FromHours(10);
                    options.Cookie.HttpOnly = true;
                    options.Cookie.IsEssential = true;
                });

                services.Configure<MailSettings>(Configuration.GetSection("MailSettings"));
                services.AddTransient<IMailService, MailService>();
                services.AddHttpContextAccessor();
                services.AddTransient<IActionContextAccessor, ActionContextAccessor>();
                services.AddScoped<IRazorRenderService, RazorRenderService>();
                services.AddKendo();
                services.AddScoped<INavigationModel, NavigationModel>();
                services.AddScoped<IViagemRepository, ViagemRepository>();

                services.AddMemoryCache();
                services.AddScoped<MotoristaFotoService>();
                services.AddScoped<MotoristaCache>();
                services.AddScoped<IGlosaService, GlosaService>();

                services.AddScoped<IToastService, ToastService>();

                // >>> Normalizador de texto habilitado (JSON cache + Azure NER auto via env + fallback)
                services.AddTextNormalization();

                services.AddRouting(options =>
                {
                    options.LowercaseUrls = true;  // URLs em lowercase
                    options.LowercaseQueryStrings = false;
                });

                // === Providers de TempData necessários para o Alerta gravar o payload ===
                services.AddSingleton<ITempDataProvider, CookieTempDataProvider>();
                services.AddSingleton<ITempDataDictionaryFactory, TempDataDictionaryFactory>();
                // =======================================================================

                services.Configure<FormOptions>(options =>
                {
                    options.MultipartBodyLengthLimit = 104857600; // 100 MB
                    options.ValueLengthLimit = int.MaxValue;
                    options.MultipartHeadersLengthLimit = int.MaxValue;
                });

                // *** SignalR para o sistema de Alertas ***
                services.AddSignalR(options =>
                {
                    options.EnableDetailedErrors = true; // Útil para debug
                    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
                    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
                });

                services.AddKendo();

                services.Configure<EvolutionApiOptions>(Configuration.GetSection("WhatsApp"));

                services.AddHttpClient<IWhatsAppService, EvolutionApiWhatsAppService>((sp, client) =>
                {
                    var opts = sp.GetRequiredService<IOptions<EvolutionApiOptions>>().Value;
                    if (string.IsNullOrWhiteSpace(opts.BaseUrl))
                        throw new InvalidOperationException("WhatsApp.BaseUrl não configurado.");

                    client.BaseAddress = new Uri(opts.BaseUrl.TrimEnd('/'));
                    // Autorização: Evolution API com API Key em header 'apikey' (ou 'Authorization: Bearer')
                    if (!string.IsNullOrWhiteSpace(opts.ApiKey))
                    {
                        client.DefaultRequestHeaders.Remove("apikey");
                        client.DefaultRequestHeaders.Add("apikey", opts.ApiKey);
                    }
                    // Se seu provedor exigir Bearer:
                    // client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", opts.ApiKey);
                })
                // timeouts robustos para WhatsApp
                .SetHandlerLifetime(TimeSpan.FromMinutes(5));
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha(ex, "Startup.cs", "ConfigureServices");
            }
        }

        // Pipeline HTTP
        public void Configure(
            IApplicationBuilder app,
            IWebHostEnvironment env,
            ILoggerFactory loggerFactory)
        {
            try
            {
                // ========================================================
                // ⭐ SISTEMA DE LOG DE ERROS - MIDDLEWARE (PRIMEIRO!)
                // IMPORTANTE: Deve ser o PRIMEIRO middleware para capturar
                // todos os erros, inclusive os de outros middlewares
                // ========================================================
                app.UseErrorLogging();
                // ========================================================

                // Configurar página de erro
                if (env.IsDevelopment())
                {
                    app.UseDeveloperExceptionPage();
                }
                else
                {
                    app.UseExceptionHandler("/Error");
                    app.UseHsts();
                }

                // ⭐ SWAGGER - Middleware (habilitado em todos os ambientes)
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FrotiX API v1");
                    c.RoutePrefix = "swagger";
                });

                var supportedCultures = new[]
                {
                    new CultureInfo("pt-BR"),
                };

                var localizationOptions = new RequestLocalizationOptions()
                .SetDefaultCulture("pt-BR")
                .AddSupportedCultures(supportedCultures.Select(c => c.Name).ToArray())
                .AddSupportedUICultures(supportedCultures.Select(c => c.Name).ToArray());

                // IMPORTANTE: Configurar o AppToast
                AppToast.Configure(
                    app.ApplicationServices.GetRequiredService<IHttpContextAccessor>(),
                    app.ApplicationServices.GetRequiredService<ITempDataDictionaryFactory>()
                );
                app.UseRequestLocalization(localizationOptions);

                // Para capturar erros de status code (404, 401, etc)
                app.UseStatusCodePagesWithReExecute("/Error", "?statusCode={0}");

                // Register Syncfusion license
                Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense(
                    "Ngo9BigBOggjHTQxAR8/V1JFaF5cXGRCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXZfeHRSR2NYV0x2XUNWYEg="
                );

                // === Expor dependências para o Alerta (para gravar TempData e acessar HttpContext) ===
                Alerta.HttpCtx = app.ApplicationServices.GetRequiredService<IHttpContextAccessor>();
                Alerta.TempFactory =
                    app.ApplicationServices.GetRequiredService<ITempDataDictionaryFactory>();
                Alerta.LoggerFactory = loggerFactory;
                // ================================================================================

                app.UseResponseCompression();

                // Middleware global de exceções (se já captura e registra, mantemos)
                app.UseMiddleware<UiExceptionMiddleware>();

                app.UseHttpsRedirection();

                app.UseStaticFiles();

                app.UseRouting();

                // ⭐ CORS - IMPORTANTE: deve vir DEPOIS de UseRouting e ANTES de UseAuthentication
                app.UseCors("CorsPolicy");

                app.UseAuthentication();
                app.UseAuthorization();
                app.UseSession();
                app.UseNotyf();

                app.UseEndpoints(endpoints =>
                {
                    // ⭐ Mapear controllers - isso inclui o ReportsController
                    endpoints.MapControllers();
                    endpoints.MapRazorPages();

                    // *** Mapear o Hub do SignalR ***
                    endpoints.MapHub<AlertasHub>("/alertasHub");
                });

                // ========================================================
                // ⭐ LOG: Sistema de log inicializado
                // ========================================================
                var logService = app.ApplicationServices.GetService<ILogService>();
                logService?.Info("FrotiX Web inicializado com sucesso", "Startup.cs", "Configure");
                // ========================================================
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha(ex, "Startup.cs", "Configure");
            }
        }
    }
}
