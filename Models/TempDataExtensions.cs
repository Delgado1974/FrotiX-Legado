using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Newtonsoft.Json;


namespace FrotiX.Models
    {

    public static class TempDataExtensions
        {
        public static void Put<T>(this ITempDataDictionary tempData, string key, T value)
            {
            tempData[key] = JsonConvert.SerializeObject(value);
            }

        public static T Get<T>(this ITempDataDictionary tempData, string key)
            {
            if (tempData.TryGetValue(key, out object o))
                {
                return o == null ? default : JsonConvert.DeserializeObject<T>((string)o);
                }
            return default;
            }
        }
    }


