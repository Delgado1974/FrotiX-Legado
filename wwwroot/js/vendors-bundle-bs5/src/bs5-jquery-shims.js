// src/bs5-jquery-shims.js
// Adapta chamadas jQuery-style do BS4 para o BS5 (que não depende de jQuery).
// Mantém APIs comuns: $(el).modal('show'|'hide'|'toggle'|'dispose'), tooltip/popover/collapse

(function attachShims(factory) {
    if (typeof window !== 'undefined') {
        factory(window.jQuery, window.bootstrap);
    }
})(function ($, bootstrap) {
    if (!$ || !bootstrap) return;

    const map = {
        modal: bootstrap.Modal,
        tooltip: bootstrap.Tooltip,
        popover: bootstrap.Popover,
        collapse: bootstrap.Collapse,
    };

    function ensureInstance(ClassRef, el, maybeOptions) {
        let inst = ClassRef.getInstance(el);
        if (!inst) {
            const opts =
                (typeof maybeOptions === 'object' && maybeOptions) || {};
            inst = new ClassRef(el, opts);
        }
        return inst;
    }

    Object.keys(map).forEach((pluginName) => {
        const ClassRef = map[pluginName];

        // Evita sobrescrever se já existir (por ex., se Bootstrap expôs plugins via jQuery)
        if ($.fn[pluginName]) return;

        $.fn[pluginName] = function (arg, ...rest) {
            return this.each(function () {
                const el = this;
                const inst = ensureInstance(
                    ClassRef,
                    el,
                    typeof arg === 'object' ? arg : undefined
                );

                // Métodos usuais
                if (typeof arg === 'string') {
                    const method = arg;
                    if (typeof inst[method] === 'function') {
                        inst[method](...rest);
                        return;
                    }
                    switch (method) {
                        case 'show':
                            inst.show();
                            break;
                        case 'hide':
                            inst.hide();
                            break;
                        case 'toggle':
                            if (pluginName === 'collapse') inst.toggle();
                            else inst.show();
                            break;
                        case 'dispose':
                            inst.dispose();
                            break;
                        default:
                            // silencioso para compatibilidade
                            break;
                    }
                }
            });
        };
    });
});
