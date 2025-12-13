// src/vendors.js
// 1) jQuery (exposto globalmente, útil para libs legadas como Bootbox)
import $ from 'jquery';
window.$ = window.jQuery = $;

// 2) Bootstrap 5
// Opção A (ESM): importa módulos e deixa acessível em window.bootstrap
import * as bootstrap from 'bootstrap';
// Observação: usando ESM, o Popper é resolvido via @popperjs/core (peer dep)
window.bootstrap = bootstrap;

// 3) Shims jQuery -> Bootstrap 5 (para $.fn.modal/tooltip/popover/collapse)
import './bs5-jquery-shims';

// 4) Bootbox 6 (compatível com BS5, requer jQuery)
import bootbox from 'bootbox';
window.bootbox = bootbox;

// (Opcional) Locale padrío pt-BR, remova se não quiser
try {
    bootbox.setLocale('pt-BR');
} catch {
    /* ignore */
}

// Exporte algo apenas para facilitar debugging
export default { $, bootbox, bootstrap };
