import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import { useText } from "@/hooks/use-site-content";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.6 6.3a5.7 5.7 0 0 1-3.4-1.1V15a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.8a2.8 2.8 0 1 0 1.9 2.7V2h2.7a3.5 3.5 0 0 0 3.5 3.4v2.9z" />
    </svg>
  );
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.5 3.5A11 11 0 0 0 3.2 17.3L2 22l4.8-1.2A11 11 0 1 0 20.5 3.5zM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.7.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.5-5.9c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3c-.2.3-1 1-1 2.4s1 2.8 1.1 3a7.7 7.7 0 0 0 4 3.4c1.4.5 1.9.4 2.5.4.8-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1l-.4-.2z" />
    </svg>
  );
}

const ICON_CLS = "h-4 w-4";

export function SocialIcons({ className = "" }: { className?: string }) {
  const ig = useText("social.instagram", "");
  const fb = useText("social.facebook", "");
  const yt = useText("social.youtube", "");
  const li = useText("social.linkedin", "");
  const tt = useText("social.tiktok", "");
  const wa = useText("social.whatsapp", "");
  const waPhone = useText("contact.whatsapp", "");
  const waHref = wa || (waPhone ? `https://wa.me/${waPhone.replace(/\D/g, "")}` : "");

  const items: { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [];
  if (ig) items.push({ href: ig, label: "Instagram", Icon: Instagram });
  if (fb) items.push({ href: fb, label: "Facebook", Icon: Facebook });
  if (li) items.push({ href: li, label: "LinkedIn", Icon: Linkedin });
  if (yt) items.push({ href: yt, label: "YouTube", Icon: Youtube });
  if (tt) items.push({ href: tt, label: "TikTok", Icon: TikTokIcon });
  if (waHref) items.push({ href: waHref, label: "WhatsApp", Icon: WhatsAppIcon });

  if (!items.length) return null;
  return (
    <div className={`flex items-center gap-5 ${className}`}>
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-offwhite/70 transition-all duration-500 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
        >
          <Icon className={ICON_CLS} />
          <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 ring-1 ring-gold/40 transition-opacity duration-500 group-hover:opacity-100" />
        </a>
      ))}
    </div>
  );
}
