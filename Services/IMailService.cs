using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using FrotiX.Models;
namespace FrotiX.Services
    {
    public interface IMailService
        {
        Task SendEmailAsync(MailRequest mailRequest);
        }
    }


