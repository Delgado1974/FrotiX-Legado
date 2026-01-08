using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.Versioning;
using Microsoft.Extensions.Caching.Memory;

namespace FrotiX.Services
    {
    [SupportedOSPlatform("windows")]
    public class MotoristaFotoService
        {
        private readonly IMemoryCache _cache;

        public MotoristaFotoService(IMemoryCache cache)
            {
            _cache = cache;
            }

        public string ObterFotoBase64(Guid motoristaId, byte[] fotoOriginal)
            {
            if (fotoOriginal == null || fotoOriginal.Length == 0)
                return null;

            string cacheKey = $"foto_{motoristaId}";

            if (_cache.TryGetValue(cacheKey, out string fotoBase64))
                return fotoBase64;

            var resized = fotoOriginal.Length > 50_000
                ? RedimensionarImagem(fotoOriginal, 60, 60)
                : fotoOriginal;

            if (resized == null)
                return null;

            fotoBase64 = $"data:image/jpeg;base64,{Convert.ToBase64String(resized)}";

            _cache.Set(cacheKey, fotoBase64, TimeSpan.FromHours(1));
            return fotoBase64;
            }

        public byte[] RedimensionarImagem(byte[] imagemBytes, int largura, int altura)
            {
            try
                {
                using var inputStream = new MemoryStream(imagemBytes);
                using var imagemOriginal = Image.FromStream(inputStream);
                using var imagemRedimensionada = new Bitmap(largura, altura);
                using var graphics = Graphics.FromImage(imagemRedimensionada);

                graphics.CompositingQuality = CompositingQuality.HighSpeed;
                graphics.InterpolationMode = InterpolationMode.Low;
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.DrawImage(imagemOriginal, 0, 0, largura, altura);

                using var outputStream = new MemoryStream();
                imagemRedimensionada.Save(outputStream, ImageFormat.Jpeg);
                return outputStream.ToArray();
                }
            catch
                {
                return null;
                }
            }
        }
    }


