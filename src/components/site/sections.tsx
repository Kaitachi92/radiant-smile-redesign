import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Image as ImageIcon,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useRef, useState, type UIEvent } from "react";
import { Button } from "@/components/ui/button";
import { Appointment } from "./site-shell";
import { ScrollLogoAnimation } from "./scroll-logo-animation";
import { address, email, instagram, maps, photos, treatments, whatsapp } from "@/lib/site-data";

export type InstagramPost = {
  id: string;
  permalink: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnailUrl?: string;
  caption?: string;
  timestamp?: string;
};

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid site-width">
        <div className="hero-copy">
          <p className="eyebrow">Odontologia em Piracaia</p>
          <h1>
            Seu sorriso merece <em>cuidado de verdade.</em>
          </h1>
          <p className="hero-description">
            Um atendimento próximo, cuidadoso e individualizado, com atenção à sua saúde bucal em
            cada etapa.
          </p>
          <div className="hero-actions">
            <Appointment>Agendar uma consulta</Appointment>
            <Button variant="editorial" className="editorial-button" asChild>
              <Link to="/o-consultorio">
                Conheça o consultório <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <p className="location-note">
            <MapPin size={15} aria-hidden="true" />
            Atendimento odontológico em Piracaia — SP.
          </p>
        </div>
        <div className="hero-image-wrap hero-logo-wrap">
          <ScrollLogoAnimation />
        </div>
      </div>
      <div className="hero-foot site-width">
        <span>Presença. Escuta. Cuidado.</span>
        <a href="#cuidado">
          Conheça nossa forma de cuidar <ArrowDown size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

export function AboutSection({ full = false }: { full?: boolean }) {
  return (
    <section id="cuidado" className="section about-section">
      <div className="site-width editorial-grid">
        <div className="editorial-media">
          <img
            className="doctor-portrait"
            src={photos.portrait}
            alt="Dra. Rebeca Galdino em seu consultório"
            width="1200"
            height="1600"
            loading="lazy"
            decoding="async"
          />
          <p className="image-caption">Retrato divulgado no site oficial da Dra. Rebeca Galdino.</p>
        </div>
        <div className="editorial-copy">
          <p className="eyebrow">A doutora</p>
          <h2 className="section-title">
            Mais do que cuidar dos dentes, <em>cuidar de pessoas.</em>
          </h2>
          <p className="section-copy">
            Cada pessoa chega ao consultório com necessidades, expectativas e dúvidas diferentes.
            Por isso, o atendimento começa pela escuta e respeita as particularidades de cada
            paciente.
          </p>
          <p className="section-copy">
            Cuidar da saúde bucal também é criar espaço para uma conversa atenta, com informações
            claras em cada etapa.
          </p>
          {full ? (
            <p className="notice">
              Formação, trajetória e registros profissionais serão apresentados após confirmação
              pela Dra. Rebeca.
            </p>
          ) : (
            <Button variant="editorial" className="editorial-button" asChild>
              <Link to="/a-doutora">
                Conheça a Dra. Rebeca <ArrowUpRight />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export function TreatmentRow({ t, index }: { t: (typeof treatments)[number]; index: number }) {
  return (
    <Link
      to="/tratamentos/$slug"
      params={{ slug: t.slug }}
      className="treatment-card"
      aria-label={`Saiba mais sobre ${t.name}`}
    >
      <span className="treatment-card-index">{String(index + 1).padStart(2, "0")}</span>
      <div className="treatment-card-copy">
        <h3>{t.name}</h3>
        <p>{t.short}</p>
      </div>
      <span className="treatment-card-arrow" aria-hidden="true">
        <ArrowUpRight size={18} />
      </span>
    </Link>
  );
}

export function TreatmentsSection() {
  return (
    <section className="section treatments-section">
      <div className="site-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Tratamentos</p>
            <h2 className="section-title">
              Cuidado para cada <em>momento do seu sorriso.</em>
            </h2>
          </div>
          <Link to="/tratamentos" className="text-link">
            Ver todos os tratamentos <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="treatment-grid">
          {treatments.slice(0, 6).map((treatment, index) => (
            <TreatmentRow key={treatment.slug} t={treatment} index={index} />
          ))}
        </div>
        <p className="image-caption treatment-disclaimer">
          A indicação de cada tratamento depende de avaliação odontológica. Consulte a
          disponibilidade atual com o consultório.
        </p>
      </div>
    </section>
  );
}

export function InstagramSection({ posts = [] }: { posts?: InstagramPost[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToPost = (index: number) => {
    const track = trackRef.current;
    const slide = track?.querySelectorAll<HTMLElement>("[data-instagram-slide]")[index];
    if (!track || !slide) return;

    track.scrollLeft = slide.offsetLeft - track.offsetLeft;
    setActiveIndex(index);
  };

  const updateActivePost = (event: UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    const trackLeft = track.getBoundingClientRect().left;
    const slides = Array.from(track.querySelectorAll<HTMLElement>("[data-instagram-slide]"));
    const nearestSlide = slides.reduce(
      (nearest, slide, index) =>
        Math.abs(slide.getBoundingClientRect().left - trackLeft) <
        Math.abs(slides[nearest].getBoundingClientRect().left - trackLeft)
          ? index
          : nearest,
      0,
    );

    setActiveIndex(nearestSlide);
  };

  return (
    <section className="section instagram-section" aria-labelledby="instagram-title">
      <div className="site-width">
        <div className="section-heading instagram-heading">
          <div>
            <p className="eyebrow">No Instagram</p>
            <h2 className="section-title" id="instagram-title">
              Acompanhe de perto o nosso dia a dia.
            </h2>
            <p className="section-copy instagram-description">
              Dicas de saúde bucal, tratamentos, bastidores do consultório e sorrisos que inspiram.
            </p>
          </div>
          <a
            className="appointment-button instagram-follow"
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Seguir no Instagram <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>

        {posts.length > 0 ? (
          <>
            <div
              className="instagram-track"
              ref={trackRef}
              role="region"
              aria-label="Publicações do Instagram da Dra. Rebeca Galdino"
              aria-roledescription="carrossel"
              onScroll={updateActivePost}
            >
              {posts.map((post, index) => {
                const date = post.timestamp && new Date(post.timestamp);
                const formattedDate =
                  date && !Number.isNaN(date.getTime())
                    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date)
                    : undefined;

                return (
                  <article
                    className="instagram-slide"
                    data-instagram-slide
                    key={post.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} de ${posts.length}`}
                  >
                    <a
                      className="instagram-post"
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir publicação de ${formattedDate ?? "data não informada"} no Instagram`}
                    >
                      <div className="instagram-image-wrap">
                        <img
                          className="instagram-image"
                          src={
                            post.mediaType === "VIDEO"
                              ? post.thumbnailUrl || post.mediaUrl
                              : post.mediaUrl
                          }
                          alt={
                            post.caption ||
                            "Publicação da Dra. Rebeca Galdino no Instagram"
                          }
                          loading={index < 2 ? "eager" : "lazy"}
                          decoding="async"
                        />
                        {post.mediaType === "VIDEO" && (
                          <span className="instagram-video-badge">Vídeo</span>
                        )}
                        <span className="instagram-open-badge" aria-hidden="true">
                          <Instagram size={20} />
                        </span>
                      </div>
                      <div className="instagram-post-copy">
                        {formattedDate && (
                          <time dateTime={post.timestamp}>{formattedDate}</time>
                        )}
                        {post.caption && <p>{post.caption}</p>}
                      </div>
                    </a>
                  </article>
                );
              })}
            </div>
            <div className="instagram-controls">
              <div className="instagram-pagination" aria-label="Posição no carrossel">
                {posts.map((post, index) => (
                  <button
                    className="instagram-dot"
                    key={post.id}
                    type="button"
                    aria-label={`Ir para publicação ${index + 1}`}
                    aria-current={activeIndex === index ? "true" : undefined}
                    onClick={() => scrollToPost(index)}
                  />
                ))}
              </div>
              <div className="instagram-arrows">
                <button
                  className="instagram-arrow"
                  type="button"
                  aria-label="Publicação anterior"
                  disabled={activeIndex === 0}
                  onClick={() => scrollToPost(activeIndex - 1)}
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button
                  className="instagram-arrow"
                  type="button"
                  aria-label="Próxima publicação"
                  disabled={activeIndex === posts.length - 1}
                  onClick={() => scrollToPost(activeIndex + 1)}
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
              <p className="instagram-position" aria-live="polite" aria-atomic="true">
                {activeIndex + 1} / {posts.length}
              </p>
            </div>
          </>
        ) : (
          <div className="instagram-empty" role="status">
            <span className="instagram-empty-icon">
              <Instagram size={28} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <p className="instagram-empty-title">Publicações reais aguardando conexão</p>
            <p>
              As publicações do perfil oficial aparecerão aqui após a configuração da API do
              Instagram. Enquanto isso, acompanhe a Dra. Rebeca diretamente no perfil.
            </p>
            <a href={instagram} target="_blank" rel="noopener noreferrer">
              Ver perfil oficial <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

const carePrinciples = [
  {
    title: "Escuta e atenção individual.",
    description:
      "Cada pessoa tem sua história. Escutar suas necessidades é o ponto de partida para um cuidado individualizado.",
    icon: HeartHandshake,
  },
  {
    title: "Clareza em cada etapa.",
    description:
      "Informações compreensíveis sobre o tratamento, com espaço para perguntas e decisões bem informadas.",
    icon: MessageCircle,
  },
  {
    title: "Cuidado com a sua experiência.",
    description:
      "Atenção ao conforto e ao acolhimento durante a consulta, respeitando o tempo de cada pessoa.",
    icon: ShieldCheck,
  },
];

const firstVisitSteps = [
  {
    title: "Entre em contato.",
    description: "Escolha o canal de atendimento e consulte a disponibilidade de horários.",
    icon: MessageCircle,
  },
  {
    title: "Agende sua consulta.",
    description: "Receba as orientações necessárias para sua visita.",
    icon: CalendarDays,
  },
  {
    title: "Conheça suas possibilidades.",
    description:
      "Converse com a profissional sobre suas necessidades e as opções de cuidado indicadas para você.",
    icon: HeartHandshake,
  },
];

export function Principles({ process = false }: { process?: boolean }) {
  const items = process ? firstVisitSteps : carePrinciples;

  return (
    <section className={`section principles-section${process ? " process-section" : ""}`}>
      <div className="site-width">
        <div className="section-heading principles-heading">
          <div>
            <p className="eyebrow">{process ? "Sua primeira consulta" : "Nossa forma de cuidar"}</p>
            <h2 className="section-title">
              {process ? (
                <>
                  O primeiro passo é <em>uma boa conversa.</em>
                </>
              ) : (
                <>
                  Um atendimento <em>pensado para você.</em>
                </>
              )}
            </h2>
          </div>
          {process && (
            <a className="text-link" href={whatsapp} target="_blank" rel="noreferrer">
              Fale com o consultório <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="principles">
          {items.map(({ title, description, icon: Icon }, index) => (
            <article className="principle" key={title}>
              <div className="principle-topline">
                <span className="principle-icon">
                  <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="number">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PhotoPending({ label }: { label: string }) {
  return (
    <div className="photo-placeholder">
      <ImageIcon size={25} strokeWidth={1.35} aria-hidden="true" />
      <p>{label}</p>
      <small>Imagem real e autorizada aguardando envio pelo consultório.</small>
    </div>
  );
}

export function ClinicSection({ full = false }: { full?: boolean }) {
  return (
    <section className="section clinic-section">
      <div className="site-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">O consultório</p>
            <h2 className="section-title">
              Um espaço preparado <em>para receber você.</em>
            </h2>
          </div>
          <div className="clinic-intro">
            <p className="section-copy">Conheça o ambiente onde acontece o nosso atendimento.</p>
            <a href={maps} target="_blank" rel="noopener noreferrer" className="text-link">
              Ver localização <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="clinic-gallery">
          <PhotoPending label="Recepção do consultório" />
          <PhotoPending label="Sala de atendimento" />
          {full && (
            <>
              <PhotoPending label="Fachada do consultório" />
              <PhotoPending label="Ambientes e equipamentos" />
            </>
          )}
        </div>
        {full && (
          <p className="notice">
            As fotografias da clínica e dos ambientes aguardam envio e autorização de uso. Nenhuma
            imagem de outro consultório foi utilizada.
          </p>
        )}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="cta-band">
      <div className="site-width cta-inner">
        <div>
          <p className="eyebrow">Vamos conversar?</p>
          <h2>Seu cuidado começa com uma boa conversa.</h2>
          <p>Fale diretamente com o consultório e consulte a disponibilidade de horários.</p>
        </div>
        <Appointment>Falar com o consultório</Appointment>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section className="section contact-section">
      <div className="site-width contact-grid">
        <div className="contact-copy">
          <p className="eyebrow">Perto de você</p>
          <h2 className="section-title">
            Seu cuidado tem <em>um endereço.</em>
          </h2>
          <div className="contact-details">
            <div className="contact-detail">
              <span className="contact-icon">
                <MapPin size={19} aria-hidden="true" />
              </span>
              <div>
                <h3>Nosso consultório</h3>
                <p>
                  {address}
                  <br />
                  CEP 12970-000
                </p>
                <a href={maps} target="_blank" rel="noopener noreferrer">
                  Como chegar <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="contact-detail">
              <span className="contact-icon">
                <MessageCircle size={19} aria-hidden="true" />
              </span>
              <div>
                <h3>WhatsApp</h3>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  (11) 99651-4034 · Agendar ou tirar dúvidas
                </a>
              </div>
            </div>
            <div className="contact-detail">
              <span className="contact-icon">
                <Mail size={19} aria-hidden="true" />
              </span>
              <div>
                <h3>E-mail</h3>
                <a href={`mailto:${email}`}>{email}</a>
              </div>
            </div>
          </div>
        </div>
        <div className="map-wrap">
          <iframe
            className="map"
            title="Localização do consultório da Dra. Rebeca Galdino em Piracaia"
            src="https://maps.google.com/maps?q=Av.%20Jan%20Antonin%20Bata%20121%20Piracaia%20SP&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="image-caption">Av. Jan Antonin Bata, 121 · Piracaia, SP</p>
        </div>
      </div>
    </section>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro">
      <div className="site-width">
        <nav aria-label="Caminho da página" className="breadcrumb">
          <Link to="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{eyebrow}</span>
        </nav>
        <div className="page-intro-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="section-copy">{description}</p>
        </div>
      </div>
    </section>
  );
}
