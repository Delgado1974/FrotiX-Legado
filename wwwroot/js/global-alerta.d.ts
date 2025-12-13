// Tipagem para o objeto Alerta
interface AlertaAPI
{
    Confirmar(titulo: string, texto: string, confirm?: string, cancel?: string): Promise<boolean>;
    Erro(titulo: string, texto: string, confirm?: string): void;
    Sucesso(titulo: string, texto: string, confirm?: string): void;
    Info(titulo: string, texto: string, confirm?: string): void;
    Alerta(titulo: string, texto: string, confirm?: string): void;
}

// Tipagem para o objeto SweetAlertInterop
interface SweetAlertInteropAPI
{
    ShowConfirm(titulo: string, texto: string, confirm?: string, cancel?: string): Promise<boolean>;
    ShowInfo(titulo: string, texto: string, confirm?: string): Promise<void>;
    ShowSuccess(titulo: string, texto: string, confirm?: string): Promise<void>;
    ShowWarning(titulo: string, texto: string, confirm?: string): Promise<void>;
    ShowError(titulo: string, texto: string, confirm?: string): Promise<void>;
    ShowCustomAlert(icon: string, iconHtml: string, title: string, message: string, confirm: string, cancel?: string): Promise<boolean>;
    ShowPreventionAlert(message: string): Promise<boolean>;
    ShowNotification(message: string, color?: string): void;
    ShowErrorUnexpected(classe: string, metodo: string, erro: Error): Promise<void>;
}

// Declaração global
declare var Alerta: AlertaAPI;
declare var SweetAlertInterop: SweetAlertInteropAPI;
