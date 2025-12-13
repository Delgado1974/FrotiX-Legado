/*! jquery.throttle-debounce (shim) – MIT */
(function (root) {
    var $ = root.jQuery || root.$;
    if (!$) return; // se jQuery não estiver carregado ainda, não faz nada

    if ($.throttle && $.debounce) return; // já existe

    function throttle(delay, no_trailing, callback, debounce_mode) {
        var timeout_id,
            last_exec = 0;
        if (typeof no_trailing !== 'boolean') {
            debounce_mode = callback;
            callback = no_trailing;
            no_trailing = undefined;
        }
        function wrapper() {
            var self = this,
                elapsed = Date.now() - last_exec,
                args = arguments;
            var exec = function () {
                last_exec = Date.now();
                callback.apply(self, args);
            };
            if (debounce_mode && !timeout_id) exec();
            if (timeout_id) clearTimeout(timeout_id);
            if (debounce_mode === undefined && elapsed > delay) {
                exec();
            } else if (no_trailing !== true) {
                timeout_id = setTimeout(
                    debounce_mode
                        ? function () {
                              timeout_id = void 0;
                          }
                        : function () {
                              exec();
                              timeout_id = void 0;
                          },
                    debounce_mode === undefined ? delay - elapsed : delay
                );
            }
        }
        return wrapper;
    }
    function debounce(delay, at_begin, callback) {
        return callback === undefined
            ? throttle(delay, at_begin, false)
            : throttle(delay, callback, at_begin !== false);
    }

    $.throttle = $.throttle || throttle;
    $.debounce = $.debounce || debounce;
})(window);
