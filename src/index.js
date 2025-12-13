document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    root.innerHTML = '<h1>Bem-vindo ao Projeto com Hot Module Replacement!</h1>';

    // Função que irá se modificar quando houver alterações
    const updateContent = () => {
        root.innerHTML = '<h1>Atualização com HMR Funcional!</h1>';
    };

    // Habilitar HMR se disponível
    if (module.hot) {
        module.hot.accept(updateContent);
    }
});
