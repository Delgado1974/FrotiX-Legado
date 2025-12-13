/*! rgb2hex shim (BS4→BS5) – MIT */
(function (win) {
    if (typeof win.rgb2hex === 'function') return; // já existe? sai.

    // Converte uma cor CSS para #RRGGBB (ignora alpha). Aceita:
    // - "#abc", "#aabbcc", "#aabbccdd"
    // - "rgb(r,g,b)" / "rgba(r,g,b,a)"
    // - nomes/var(...) → usa computed style para resolver
    win.rgb2hex = function rgb2hex(input) {
        if (!input || typeof input !== 'string') return null;

        var s = input.trim();

        // #hex direto
        if (s[0] === '#') {
            if (s.length === 4) {
                // #abc → #aabbcc
                return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
            }
            if (s.length === 7) return s.toLowerCase().slice(0, 7);
            if (s.length === 9) return s.toLowerCase().slice(0, 7); // descarta alpha (#RRGGBBAA)
            return null;
        }

        // rgb/rgba(...)
        var m = s.match(
            /^rgba?\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i
        );
        if (m) {
            var r = Math.max(0, Math.min(255, parseInt(m[1], 10)));
            var g = Math.max(0, Math.min(255, parseInt(m[2], 10)));
            var b = Math.max(0, Math.min(255, parseInt(m[3], 10)));
            var toHex = function (n) {
                return n.toString(16).padStart(2, '0');
            };
            return '#' + toHex(r) + toHex(g) + toHex(b);
        }

        // nomes de cor ou var(--x): resolve via computed style
        try {
            var el = document.createElement('span');
            el.style.color = s;
            document.body.appendChild(el);
            var rgb = getComputedStyle(el).color;
            document.body.removeChild(el);
            return rgb2hex(rgb);
        } catch {
            return null;
        }
    };
})(window);
