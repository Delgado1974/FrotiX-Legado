using System;
using System.IO;
using System.Text;
using Syncfusion.DocIO;
using Syncfusion.DocIO.DLS;
using Syncfusion.DocIORenderer;
using Syncfusion.Pdf;
using Syncfusion.Pdf.Parsing;
using Syncfusion.EJ2.PdfViewer;
using SkiaSharp;

namespace FrotiX.Helpers
    {
    public static class SfdtHelper
        {
        public static byte[] SalvarImagemDeDocx(byte[] docxBytes)
            {
            using var docStream = new MemoryStream(docxBytes);
            using var document = new WordDocument(docStream, FormatType.Docx);
            using var renderer = new DocIORenderer();
            using var pdfDoc = renderer.ConvertToPDF(document);

            using var pdfStream = new MemoryStream();
            pdfDoc.Save(pdfStream);
            byte[] pdfBytes = pdfStream.ToArray();

            using var input = new MemoryStream(pdfBytes);
            using var loadedPdf = new PdfLoadedDocument(input);
            var pdfRenderer = new PdfRenderer();
            pdfRenderer.Load(input);

            using var bitmap = pdfRenderer.ExportAsImage(0);
            using var img = SKImage.FromBitmap(bitmap);
            using var encoded = img.Encode(SKEncodedImageFormat.Png, 100);
            return encoded.ToArray();
            }
        }
    }

