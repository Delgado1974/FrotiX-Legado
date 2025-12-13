// Program.cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;

namespace FrotiX
{
    public class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                // EnableTracing();
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception ex)
            {
                // Ordem preferida: (arquivo, função, erro)
                Alerta.TratamentoErroComLinha("Program.cs" , "Main" , ex);
                throw;
            }
        }

        static void EnableTracing()
        {
            try
            {
                System.Diagnostics.Trace.Listeners.Add(
                    new System.Diagnostics.TextWriterTraceListener(File.CreateText("log.txt"))
                );
                System.Diagnostics.Trace.AutoFlush = true;
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("Program.cs" , "EnableTracing" , ex);
                throw;
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            try
            {
                return Host.CreateDefaultBuilder(args)
                    .ConfigureWebHostDefaults(webBuilder =>
                    {
                        webBuilder.UseStartup<Startup>();
                    });
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("Program.cs" , "CreateHostBuilder" , ex);

                // Fallback mínimo para satisfazer o compilador
                return Host.CreateDefaultBuilder(args)
                    .ConfigureWebHostDefaults(webBuilder =>
                    {
                        webBuilder.UseStartup<Startup>();
                    });
            }
        }
    }
}
