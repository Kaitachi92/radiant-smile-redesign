import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { address, email, whatsapp } from "@/lib/site-data";

const navigation = [
  { to: "/", label: "Início" },
  { to: "/a-doutora", label: "A doutora" },
  { to: "/tratamentos", label: "Tratamentos" },
  { to: "/o-consultorio", label: "O consultório" },
  { to: "/contato", label: "Contato" },
] as const;

export function Brand({ variant = "mark" }: { variant?: "mark" | "full" }) {
  return (
    <Link
      to="/"
      className={`brand brand-${variant}`}
      aria-label="Dra. Rebeca Galdino, cirurgiã-dentista — início"
    >
      <span className="brand-copy">
        <img
          className="brand-logo"
          src="/images/logo-rebeca-galdino.png"
          alt=""
          width="1080"
          height="350"
          decoding="async"
        />
        <span className="brand-sub">Cirurgiã-dentista</span>
      </span>
    </Link>
  );
}

export function Appointment({
  children = "Agendar consulta",
}: {
  children?: ReactNode;
  inverse?: boolean;
}) {
  return (
    <Button variant="appointment" className="appointment-button" asChild>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer">
        {children}
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </Button>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header className="site-header">
        <div className="site-width header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Navegação principal">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="nav-link"
                data-active={pathname === item.to}
                aria-current={pathname === item.to ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Appointment />
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="mobile-toggle"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="menu-celular"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
        {open && (
          <nav id="menu-celular" className="mobile-nav" aria-label="Navegação principal">
            {navigation.map((item) => (
              <Link
                to={item.to}
                key={item.to}
                onClick={() => setOpen(false)}
                className="nav-link"
                data-active={pathname === item.to}
                aria-current={pathname === item.to ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Appointment />
          </nav>
        )}
      </header>
      <main id="conteudo">{children}</main>
      <footer className="footer">
        <div className="site-width">
          <div className="footer-main">
            <div className="footer-brand-block">
              <Brand variant="full" />
              <p>
                Odontologia com presença,
                <br />
                cuidado em cada detalhe.
                <br />
                Piracaia — São Paulo.
              </p>
            </div>
            <nav className="footer-links" aria-label="Navegação do rodapé">
              <span className="footer-label">Navegação</span>
              {navigation.slice(1).map((item) => (
                <Link to={item.to} key={item.to}>
                  {item.label}
                </Link>
              ))}
              <Link to="/politica-de-privacidade">Política de privacidade</Link>
            </nav>
            <div className="footer-links footer-contact">
              <span className="footer-label">Fale com o consultório</span>
              <p>
                {address}
                <br />
                CEP 12970-000
              </p>
              <a href={`mailto:${email}`}>{email}</a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                Agendar pelo WhatsApp <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Dra. Rebeca Galdino. Todos os direitos reservados.
            </span>
            <span>CRO-SP 121.330 · Identificação profissional conforme o logotipo oficial.</span>
          </div>
        </div>
      </footer>
      <Button
        asChild
        variant="appointment"
        size="icon"
        className="whatsapp-fixed appointment-button"
      >
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com o consultório pelo WhatsApp"
          title="Falar pelo WhatsApp"
        >
          <MessageCircle size={21} aria-hidden="true" />
        </a>
      </Button>
    </>
  );
}
