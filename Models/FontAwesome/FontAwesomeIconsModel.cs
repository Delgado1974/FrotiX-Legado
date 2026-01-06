using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace FrotiX.Models.FontAwesome
{
    /// <summary>
    /// Root structure for fontawesome-icons.json
    /// </summary>
    public class FontAwesomeIconsData
    {
        [JsonPropertyName("version")]
        public string Version { get; set; } = "1.0";

        [JsonPropertyName("categories")]
        public List<FontAwesomeCategory> Categories { get; set; } = new();
    }

    /// <summary>
    /// Represents a category of icons (e.g., "Comum", "Veículos")
    /// </summary>
    public class FontAwesomeCategory
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("text")]
        public string Text { get; set; }

        [JsonPropertyName("isCategory")]
        public bool IsCategory { get; set; } = true;

        [JsonPropertyName("hasChild")]
        public bool HasChild { get; set; } = true;

        [JsonPropertyName("expanded")]
        public bool Expanded { get; set; } = false;

        [JsonPropertyName("icons")]
        public List<FontAwesomeIcon> Icons { get; set; } = new();
    }

    /// <summary>
    /// Represents a single FontAwesome icon
    /// </summary>
    public class FontAwesomeIcon
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("text")]
        public string Text { get; set; }

        [JsonPropertyName("parentId")]
        public string ParentId { get; set; }
    }

    /// <summary>
    /// Helper for loading and deserializing fontawesome-icons.json
    /// </summary>
    internal static class FontAwesomeIconsLoader
    {
        private static JsonSerializerOptions SerializerSettings()
        {
            return new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };
        }

        public static FontAwesomeIconsData FromJson(string json)
        {
            return JsonSerializer.Deserialize<FontAwesomeIconsData>(json, SerializerSettings())
                   ?? new FontAwesomeIconsData();
        }
    }
}
