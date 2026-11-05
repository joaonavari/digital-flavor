import { createPortal } from "react-dom";
import { Toaster as Sonner } from "sonner";
import estilos from "./Toast.module.css";

const IconeSucesso = () => (
  <svg className={estilos.sucesso} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.7 2.7L16 9.8" />
  </svg>
);

const IconeErro = () => (
  <svg className={estilos.erro} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5v.01" />
  </svg>
);

const IconeInfo = () => (
  <svg className={estilos.info} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.5v.01" />
  </svg>
);

/**
 * Montado uma única vez, direto no <body>: assim continua visível e anunciado
 * pelo leitor de tela mesmo quando uma folha deixa o resto do app inerte.
 */
export function Toaster() {
  return createPortal(
    <Sonner
      position="top-center"
      theme="system"
      visibleToasts={3}
      offset={16}
      mobileOffset={{ top: "max(env(safe-area-inset-top), 12px)", left: "12px", right: "12px" }}
      containerAriaLabel="Notificações"
      icons={{ success: <IconeSucesso />, error: <IconeErro />, info: <IconeInfo /> }}
      toastOptions={{ duration: 4000 }}
    />,
    document.body,
  );
}
