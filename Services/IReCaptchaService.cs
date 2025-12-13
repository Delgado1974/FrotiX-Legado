using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using FrotiX.Settings;
namespace FrotiX.Services
    {
    public interface IReCaptchaService
        {
        ReCaptchaSettings Configs { get; }
        bool ValidateReCaptcha(string token);
        }
    }


