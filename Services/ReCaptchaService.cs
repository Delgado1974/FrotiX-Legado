using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text.Json.Serialization;
using FrotiX.Settings;
using FrotiX.Models;

namespace FrotiX.Services
    {
    public class ReCaptchaService : IReCaptchaService
        {
        private readonly ReCaptchaSettings _settings;
        public ReCaptchaSettings Configs { get { return _settings; } }

        public ReCaptchaService(IOptions<ReCaptchaSettings> settings)
            {
            _settings = settings.Value;
            }

        public bool ValidateReCaptcha(string token)
            {
            string url = "https://www.google.com/recaptcha/api/siteverify?";
            bool ret = false;
            HttpClient httpClient = new HttpClient();

            var res = httpClient.GetAsync($"{url}secret={_settings.Secret}&response={token}").Result;
            if (res.StatusCode == HttpStatusCode.OK)
                {
                string content = res.Content.ReadAsStringAsync().Result;
                //CaptchaResponse response = JsonSerializer.Deserialize<CaptchaResponse>(content);
                //if (response.success)
                //    ret = true;
                }
            return ret;
            }
        }
    }


