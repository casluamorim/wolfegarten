import { useText } from "@/hooks/use-site-content";

interface Props {
  message?: string;
}

/** Botão flutuante de WhatsApp, contextual por página. */
export function WhatsAppFAB({ message }: Props) {
  const whatsapp = useText("contact.whatsapp", "5547988178508");
  if (!whatsapp) return null;
  const text = message ?? "Olá! Gostaria de mais informações sobre o Wölfegarten.";
  const href = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Conversar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 md:bottom-8 md:right-8"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M19.11 17.21c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.14-.42-2.17-1.34-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.13-.61-1.46-.84-2-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.64 1.11 2.82.13.18 1.93 2.94 4.68 4.12.65.28 1.16.45 1.56.58.66.21 1.26.18 1.73.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.31zM16.01 5.33c-5.89 0-10.67 4.78-10.67 10.66 0 1.87.49 3.71 1.42 5.33L5.33 26.67l5.5-1.44c1.56.85 3.32 1.3 5.18 1.3 5.89 0 10.66-4.78 10.66-10.66S21.9 5.33 16.01 5.33z" />
      </svg>
    </a>
  );
}
