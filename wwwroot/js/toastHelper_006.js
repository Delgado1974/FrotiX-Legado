function showSyncfusionToast(message, type = "info", icon = "") {
    const toastId = "syncfusion-toast";

    if (!document.getElementById(toastId)) {
        const div = document.createElement("div");
        div.id = toastId;
        document.body.appendChild(div);
    }

    const toast = new ej.notifications.Toast({
        position: { X: 'Right', Y: 'Top' },
        timeOut: 4000,
        showCloseButton: true,
        animation: {
            show: { effect: 'ZoomIn', duration: 500 },
            hide: { effect: 'FadeOut', duration: 500 }
        },
        // 👇 Evento mágico
        beforeOpen: (args) => {
            const toastEl = args.element;

            toastEl.classList.remove(
                "custom-toast-success",
                "custom-toast-danger",
                "custom-toast-info",
                "custom-toast-warning"
            );

            toastEl.classList.add(`custom-toast-${type}`);
        }
    });

    toast.appendTo(`#${toastId}`);

    const content = `
        <div class="toast-content">
            <span class="toast-icon">${icon}</span>
            <span class="toast-text">${message}</span>
        </div>
    `;

    toast.show({
        content: content
        // ❌ Não usa cssClass aqui mais!
        // Pois a classe será adicionada corretamente no `beforeOpen`
    });
}
