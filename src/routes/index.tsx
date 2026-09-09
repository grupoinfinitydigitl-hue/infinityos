import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import logo from "@/assets/tecnica4k-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";

const DRA_PHOTO_1 = "/images/dra-rhauana-1.jpg";
const DRA_PHOTO_2 = "/images/dra-rhauana-2.jpg";
const LOGO_INFINITY = "/images/grupo-infinity-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Técnica 4K — Grupo Infinity · Contorno corporal em Goiânia" },
      {
        name: "description",
        content:
          "O Grupo Infinity traz a Técnica 4K para Goiânia e Região: abordagem médica minimamente invasiva e individualizada para tratamento de gordura localizada e contorno corporal, com a Dra. Rhauana Ângela (CRM/GO 35139 · BA 38285).",
      },
      { property: "og:title", content: "Técnica 4K — Grupo Infinity" },
      {
        property: "og:description",
        content:
          "Uma abordagem médica avançada, minimamente invasiva e planejada para o seu corpo pelo Grupo Infinity. Agora em Goiânia e Região.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const WHATSAPP =
  "https://wa.me/5500000000000?text=Ol%C3%A1%2C%20quero%20agendar%20minha%20avalia%C3%A7%C3%A3o%20da%20T%C3%A9cnica%204K%20no%20Grupo%20Infinity.";
const INSTAGRAM = "https://www.instagram.com/drarhauana/";
const INSTAGRAM_GRUPO = "https://www.instagram.com/grupoinfinity_estetica/";

interface VideoItem {
  id: string;
  src: string;
  titulo: string;
  subtitulo: string;
  categoria: string;
}

// 9 Vídeos de procedimentos, casos reais e bastidores da Técnica 4K
const VIDEOS_DESTAQUE: VideoItem[] = [
  {
    id: "v1",
    src: "/videos/video-1.mp4",
    titulo: "Técnica Abdômen 4K",
    subtitulo: "Aplicação em pacientes pós-procedimentos prévios",
    categoria: "Caso Clínico",
  },
  {
    id: "v2",
    src: "/videos/video-2.mp4",
    titulo: "Resultados Individualizados",
    subtitulo: "Transparência, responsabilidade e acompanhamento contínuo",
    categoria: "Grupo Infinity",
  },
  {
    id: "v3",
    src: "/videos/video-3.mp4",
    titulo: "Contorno & Retração da Pele",
    subtitulo: "Tratamento de contorno corporal associado ao estímulo cutâneo",
    categoria: "Técnica 4K",
  },
  {
    id: "v4",
    src: "/videos/video-4.mp4",
    titulo: "Além da Redução de Gordura",
    subtitulo: "Planejamento anatômico estruturado para cada biotipo",
    categoria: "Metodologia 4K",
  },
  {
    id: "v5",
    src: "/videos/video-5.mp4",
    titulo: "Equipe Médica Especializada",
    subtitulo: "Foco em proporcionar um contorno seguro, natural e harmônico",
    categoria: "Segurança Médica",
  },
  {
    id: "v6",
    src: "/videos/video-6.mp4",
    titulo: "Flacidez & Gordura Localizada",
    subtitulo: "Abordagem personalizada para queixas corporais combinadas",
    categoria: "Avaliação Médica",
  },
  {
    id: "v7",
    src: "/videos/video-7.mp4",
    titulo: "História & Transformação",
    subtitulo: "Acompanhamento minucioso desde a consulta inicial",
    categoria: "Experiência Real",
  },
  {
    id: "v8",
    src: "/videos/video-8.mp4",
    titulo: "Resultado de Pós-Imediato",
    subtitulo: "Evolução clínica após protocolo e planejamento exclusivo",
    categoria: "Pós-Imediato",
  },
  {
    id: "v9",
    src: "/videos/video-9.mp4",
    titulo: "Cuidados Pós-Procedimento",
    subtitulo: "Orientações fundamentais para a recuperação e evolução biológica",
    categoria: "Acompanhamento",
  },
];

// Número que recebe as solicitações no WhatsApp (somente dígitos, com DDI e DDD).
const WHATSAPP_NUMERO = "5500000000000";

declare global {
  interface Window {
    instgrm?: { Embeds?: { process: () => void } };
  }
}

/* ---------- Reveal on scroll ---------- */
function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && setVisible(true),
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`fade-up ${visible ? "fade-up-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ---------- Primitives ---------- */
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow text-muted-foreground">{children}</p>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="heading-display text-4xl md:text-5xl text-foreground">{children}</h2>;
}

function CTAButton({ children, href = WHATSAPP }: { children: ReactNode; href?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-4 border border-primary px-8 py-4 text-xs font-medium tracking-[0.25em] uppercase text-primary transition-all duration-500 hover:bg-primary hover:text-primary-foreground"
    >
      {children}
      <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}

function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-4xl px-6 py-24 md:py-32 ${className}`}>
      {children}
    </section>
  );
}

/* ---------- Card de Vídeo com Autoplay inteligente ---------- */
function VideoCard({ video }: { video: VideoItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // IntersectionObserver: só toca o vídeo quando visível na tela
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          } else {
            el.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  return (
    <div
      onClick={togglePlay}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-primary-foreground/15 bg-card/60 shadow-xl transition-all duration-500 hover:border-champagne hover:shadow-2xl cursor-pointer"
    >
      {/* Container de Vídeo vertical estilo Reels (9:16) */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={video.src}
          playsInline
          muted
          loop
          autoPlay
          preload="metadata"
          className="h-full w-full object-cover"
        />

        {/* Gradiente escuro no topo e base para leitura clara */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

        {/* Badge superior com Categoria */}
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-block rounded-full bg-black/50 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-champagne backdrop-blur-md border border-champagne/30">
            {video.categoria}
          </span>
        </div>

        {/* Botão de Ativar/Desativar Som */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Ativar som" : "Desativar som"}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-primary-foreground backdrop-blur-md transition-all duration-300 hover:bg-champagne hover:text-espresso border border-white/20"
        >
          {isMuted ? (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        {/* Indicador de Pausado */}
        {!isPlaying && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-champagne border border-champagne/40">
              <svg className="h-6 w-6 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        )}

        {/* Informações na base do vídeo */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-left">
          <h3 className="heading-display text-lg text-primary-foreground leading-snug">
            {video.titulo}
          </h3>
          <p className="mt-1.5 text-xs text-primary-foreground/75 leading-relaxed line-clamp-2">
            {video.subtitulo}
          </p>
          <div className="mt-3 flex items-center justify-between text-[0.65rem] text-champagne font-medium uppercase tracking-[0.15em]">
            <span>Grupo Infinity</span>
            <span className="opacity-70">Toque p/ pausar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Data ---------- */
const regioes = [
  { nome: "Abdômen", desc: "Para regiões com gordura localizada e alterações de contorno." },
  { nome: "Flancos", desc: "Para áreas laterais do abdômen e cintura." },
  { nome: "Dorso", desc: "Para regiões de gordura localizada na parte posterior do tronco." },
  { nome: "Braços", desc: "Para áreas específicas com gordura localizada." },
  { nome: "Coxas", desc: "Para regiões determinadas durante a avaliação." },
  { nome: "Glúteos", desc: "Quando houver indicação para tratamento do contorno da região." },
  { nome: "Papada", desc: "Para gordura localizada na região submentoniana, quando indicada." },
];

const planejamento = [
  "Sua anatomia",
  "A região a ser tratada",
  "A quantidade de tecido adiposo",
  "As características da sua pele",
  "Suas condições clínicas",
  "Seus objetivos",
];

const etapas = [
  {
    n: "01",
    titulo: "Avaliação",
    desc: "Anamnese, histórico clínico, medicamentos, exame físico, características da pele, tecido subcutâneo e parede abdominal quando aplicável.",
  },
  {
    n: "02",
    titulo: "Exames",
    desc: "A avaliação pode incluir exames laboratoriais e exames de imagem, de acordo com a indicação médica.",
  },
  {
    n: "03",
    titulo: "Planejamento",
    desc: "São definidas as áreas, a extensão e a estratégia de tratamento.",
  },
  {
    n: "04",
    titulo: "Procedimento",
    desc: "A abordagem é realizada de forma progressiva e controlada, com acompanhamento dos sinais vitais e das condições clínicas.",
  },
  {
    n: "05",
    titulo: "Recuperação e acompanhamento",
    desc: "O paciente recebe orientações para o período após o procedimento e segue acompanhamento conforme sua evolução.",
  },
];

/* ---------- Formulário de agendamento ---------- */
function FormularioAgendamento() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [regiao, setRegiao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const n = nome.trim();
    const t = telefone.trim();
    const r = regiao.trim();
    if (n.length < 2 || t.length < 8 || r.length < 2) {
      setErro("Preencha nome, telefone e região corretamente.");
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const { error } = await supabase
        .from("solicitacoes")
        .insert({ nome: n.slice(0, 100), telefone: t.slice(0, 30), regiao: r.slice(0, 100) });
      if (error) throw error;
      setEnviado(true);
      const msg = `Olá! Quero agendar minha avaliação da Técnica 4K.%0ANome: ${encodeURIComponent(n)}%0ATelefone: ${encodeURIComponent(t)}%0ARegião de interesse: ${encodeURIComponent(r)}`;
      window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${msg}`, "_blank", "noopener,noreferrer");
      setNome("");
      setTelefone("");
      setRegiao("");
    } catch {
      setErro("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mt-12 space-y-5 text-left">
      <CampoTexto
        label="Nome"
        value={nome}
        onChange={setNome}
        placeholder="Como podemos te chamar"
      />
      <CampoTexto
        label="Telefone / WhatsApp"
        value={telefone}
        onChange={setTelefone}
        placeholder="(62) 90000-0000"
        type="tel"
      />
      <CampoTexto
        label="Região de interesse"
        value={regiao}
        onChange={setRegiao}
        placeholder="Abdômen, flancos, papada…"
      />
      {erro && <p className="text-xs text-destructive">{erro}</p>}
      {enviado && !erro && (
        <p className="text-xs text-muted-foreground">
          Solicitação registrada. Se a conversa no WhatsApp não abrir, verifique o bloqueio de
          pop-ups do seu navegador.
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="group inline-flex w-full items-center justify-center gap-4 border border-primary px-8 py-4 text-xs font-medium uppercase tracking-[0.25em] text-primary transition-all duration-500 hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
      >
        {enviando ? "Enviando…" : "Solicitar avaliação"}
        <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
          →
        </span>
      </button>
      <p className="text-center text-[0.7rem] leading-relaxed text-muted-foreground">
        Ao enviar, seus dados são registrados para contato da equipe e a conversa é aberta no
        WhatsApp. O agendamento é confirmado após retorno da equipe.
      </p>
    </form>
  );
}

function CampoTexto({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        required
        maxLength={100}
        value={value}
        placeholder={placeholder ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-champagne"
      />
    </label>
  );
}

const faqs = [
  {
    q: "A Técnica 4K é uma cirurgia?",
    a: "É uma abordagem médica minimamente invasiva para tratamento de gordura localizada e melhora do contorno corporal, realizada com anestesia local/tumescente e utilização de cânulas ou microcânulas.",
  },
  {
    q: "A Técnica 4K emagrece?",
    a: "Não. A técnica é voltada ao tratamento de gordura localizada e ao contorno corporal. Ela não deve ser apresentada como método de emagrecimento.",
  },
  {
    q: "Quais regiões podem ser tratadas?",
    a: "A região depende da avaliação e da indicação médica. A proposta pode contemplar diferentes áreas com gordura localizada, de acordo com as características de cada paciente.",
  },
  {
    q: "O procedimento utiliza anestesia?",
    a: "Sim. O protocolo prevê anestesia local/tumescente, com a solução e a dose calculadas individualmente pelo médico.",
  },
  {
    q: "O laser de diodo é utilizado em todos os procedimentos?",
    a: "Não. Ele pode ser associado quando houver indicação médica e deve ser utilizado de acordo com os parâmetros técnicos e medidas de segurança aplicáveis.",
  },
  {
    q: "Vou precisar de pós-operatório?",
    a: "A técnica é minimamente invasiva, mas existem cuidados após o procedimento. Dependendo do caso, podem ser indicados curativos, compressão, hidratação, mobilização, restrições de esforço e acompanhamento profissional.",
  },
  {
    q: "A Técnica 4K substitui uma lipoaspiração?",
    a: "Não deve ser apresentada como substituta universal de procedimentos cirúrgicos. Em casos de grande excesso de pele, hérnias, diástases importantes ou outras alterações anatômicas, outra abordagem pode ser mais adequada.",
  },
  {
    q: "O resultado é garantido?",
    a: "Não. Os resultados variam de acordo com as características de cada paciente e não deve ser prometido um resultado estético específico.",
  },
  {
    q: "Quanto tempo dura o procedimento?",
    a: "O protocolo institucional estabelece um tempo planejado de até 2 horas e 30 minutos, de acordo com o planejamento do caso.",
  },
];

/* ---------- Page ---------- */
function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <a href="#topo" className="flex items-center gap-3">
            <img src={LOGO_INFINITY} alt="Grupo Infinity" className="h-8 w-auto object-contain" />
            <span className="hidden sm:inline-block text-xs uppercase tracking-[0.25em] font-medium text-foreground">
              Técnica 4K
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground md:flex">
            <a href="#a-tecnica" className="transition-colors hover:text-foreground">
              A técnica
            </a>
            <a href="#videos" className="text-champagne transition-colors hover:text-foreground">
              Vídeos
            </a>
            <a href="#regioes" className="transition-colors hover:text-foreground">
              Regiões
            </a>
            <a href="#processo" className="transition-colors hover:text-foreground">
              Processo
            </a>
            <a href="#grupo-infinity" className="transition-colors hover:text-foreground">
              Grupo Infinity
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              Dúvidas
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-foreground/90 font-semibold transition-colors hover:text-primary"
            >
              <img src="/images/infinity-os-logo.png" alt="Infinity OS" className="h-4 w-auto object-contain" />
              <span>Infinity OS</span>
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 border border-border/80 bg-card/60 px-3 py-1.5 rounded text-[0.65rem] font-medium uppercase tracking-[0.16em] text-foreground hover:border-champagne transition-all"
            >
              <img src="/images/infinity-os-logo.png" alt="Infinity OS" className="h-3.5 w-auto object-contain" />
              <span>Área Médica</span>
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-primary px-5 py-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-primary transition-all duration-500 hover:bg-primary hover:text-primary-foreground"
            >
              Agendar avaliação
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="topo" className="relative overflow-hidden pt-28 md:pt-36">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 md:grid-cols-2 md:gap-16 md:pb-32">
          <Reveal>
            <Eyebrow>Grupo Infinity · Técnica 4K em Goiânia e Região</Eyebrow>
            <h1 className="heading-display mt-6 text-5xl text-foreground md:text-6xl lg:text-[4.2rem]">
              O contorno que você deseja,{" "}
              <em className="font-normal italic text-primary">com uma abordagem diferente.</em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Uma técnica médica avançada, minimamente invasiva e planejada para o seu corpo — para
              quem deseja tratar gordura localizada e melhorar o contorno corporal sem
              necessariamente recorrer a uma cirurgia de grande porte.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Menos invasividade. Mais planejamento.
              <br />
              <span className="text-foreground">Um tratamento pensado para você.</span>
            </p>
            <div className="mt-10">
              <CTAButton>Quero agendar minha avaliação</CTAButton>
            </div>
          </Reveal>
          <Reveal className="relative">
            <div className="absolute -left-4 -top-4 hidden h-full w-full border border-champagne md:block" />
            <img
              src={DRA_PHOTO_1}
              alt="Dra. Rhauana Ângela, médica responsável pela Técnica 4K em Goiânia"
              className="relative aspect-[4/5] w-full object-cover object-top shadow-2xl"
            />
            <div className="absolute bottom-6 left-6 bg-background/95 px-5 py-3 backdrop-blur-sm border border-border/60 shadow-md">
              <p className="heading-display text-lg">Dra. Rhauana Ângela</p>
              <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                Médica Esteticista · CRM/GO 35139 · BA 38285
              </p>
            </div>
          </Reveal>
        </div>
        <div className="hairline mx-auto max-w-6xl" />
      </section>

      {/* Uma nova possibilidade */}
      <Section>
        <Reveal className="text-center">
          <Eyebrow>Uma nova possibilidade chega a Goiânia e Região</Eyebrow>
          <SectionTitle>
            <span className="mt-6 block">
              Nem todo incômodo com o corpo está relacionado ao peso.
            </span>
          </SectionTitle>
          <p className="mx-auto mt-8 max-w-2xl leading-relaxed text-muted-foreground">
            Às vezes, existe uma região específica que permanece incomodando mesmo depois de
            emagrecer, treinar e cuidar da alimentação. É para situações como essa que a Técnica 4K
            apresenta uma proposta diferente: tratar gordura localizada e trabalhar o contorno
            corporal a partir de um planejamento individualizado.
          </p>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-px bg-border sm:grid-cols-3">
            {[
              "Não existe um padrão único.",
              "Cada corpo tem uma anatomia.",
              "Cada paciente precisa de uma avaliação.",
            ].map((t) => (
              <div key={t} className="bg-background px-6 py-8">
                <p className="heading-display text-xl">{t}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            É por isso que o tratamento começa antes do procedimento.
          </p>
          <div className="mt-10">
            <CTAButton>Quero saber se a Técnica 4K é para mim</CTAButton>
          </div>
        </Reveal>
      </Section>

      {/* Casos Reais e Resultados em Vídeo (3º Bloco) */}
      <section id="videos" className="bg-espresso text-primary-foreground py-24 md:py-32">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Reveal className="text-center">
            <p className="eyebrow text-champagne/90">Resultados e Procedimentos em Vídeo</p>
            <h2 className="heading-display mt-6 text-4xl md:text-5xl">
              Veja a Técnica 4K na prática
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-primary-foreground/75">
              Casos clínicos, avaliações, pós-imediato e explicações médicas gravadas diretamente no
              dia a dia da equipe do Grupo Infinity.
            </p>
          </Reveal>

          {/* Grade com os 9 Vídeos em Autoplay inteligente */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {VIDEOS_DESTAQUE.map((video) => (
              <Reveal key={video.id}>
                <VideoCard video={video} />
              </Reveal>
            ))}
          </div>

          {/* Aviso ético CFM */}
          <Reveal className="mt-16 text-center">
            <div className="mx-auto max-w-3xl rounded-xl border border-primary-foreground/15 bg-background/10 p-6 backdrop-blur-sm">
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-champagne font-medium mb-2">
                Aviso Legal Ético · Resolução CFM nº 2.336/2023
              </p>
              <p className="text-xs leading-relaxed text-primary-foreground/60">
                Os vídeos apresentados possuem finalidade exclusivamente educativa e informativa
                sobre a Técnica 4K e suas etapas. Os resultados são estritamente individuais e
                dependem da resposta biológica, anatomia e cuidados de cada paciente. A realização
                de qualquer procedimento médico pressupõe avaliação presencial individualizada.
              </p>
            </div>
            <div className="mt-10">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-4 border border-champagne px-10 py-4 text-xs font-medium uppercase tracking-[0.25em] text-champagne transition-all duration-500 hover:bg-champagne hover:text-espresso"
              >
                Quero avaliar meu caso no WhatsApp
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Você não precisa emagrecer */}
      <section className="bg-sand">
        <Section>
          <Reveal className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
            <div>
              <Eyebrow>Gordura localizada</Eyebrow>
              <h2 className="heading-display mt-6 text-4xl text-foreground md:text-5xl">
                Você não precisa necessariamente emagrecer.
              </h2>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                Talvez o que incomode você seja uma área específica. A Técnica 4K é voltada ao
                tratamento de gordura localizada e à melhora do contorno corporal.{" "}
                <span className="text-foreground">Não é um tratamento para emagrecimento.</span> É
                uma abordagem para regiões específicas, quando existe indicação médica.
              </p>
            </div>
            <ul className="space-y-0 divide-y divide-border border-y border-border">
              {[
                "Aquela gordura localizada que permanece mesmo depois de emagrecer",
                "A região abdominal que não acompanha o restante do corpo",
                "Os flancos, o dorso, os braços, as coxas, a papada",
                "Ou aquela área que simplesmente não entrega o contorno que você gostaria de ver",
              ].map((item) => (
                <li key={item} className="flex items-baseline gap-4 py-5">
                  <span className="h-px w-6 shrink-0 translate-y-[-4px] bg-champagne" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Section>
      </section>

      {/* O que é */}
      <Section id="a-tecnica">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>O que é a Técnica 4K?</Eyebrow>
          <p className="heading-display mt-8 text-3xl leading-snug text-foreground md:text-4xl">
            Uma abordagem médica minimamente invasiva para tratamento do tecido adiposo subcutâneo.
          </p>
          <p className="mt-8 leading-relaxed text-muted-foreground">
            O procedimento é realizado com anestesia local/tumescente e utiliza cânulas ou
            microcânulas adequadas para uma abordagem controlada da gordura localizada. Quando
            indicado pelo médico, pode ser associado o laser de diodo, como auxílio no processo de
            retração cutânea. Tudo dentro de um planejamento individualizado, definido de acordo com
            a anatomia, a região a ser tratada e as condições de cada paciente.
          </p>
        </Reveal>
      </Section>

      {/* Regiões */}
      <section id="regioes" className="bg-espresso text-primary-foreground">
        <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <Reveal className="text-center">
            <p className="eyebrow text-primary-foreground/60">
              Uma técnica. Diferentes possibilidades.
            </p>
            <h2 className="heading-display mt-6 text-4xl md:text-5xl">
              Planejada para diferentes regiões do corpo
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-primary-foreground/70">
              Conforme avaliação e indicação médica.
            </p>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-px bg-primary-foreground/15 sm:grid-cols-2 lg:grid-cols-3">
            {regioes.map((r) => (
              <Reveal key={r.nome}>
                <div className="group h-full bg-espresso p-8 transition-colors duration-500 hover:bg-olive-deep">
                  <h3 className="heading-display text-2xl">{r.nome}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-primary-foreground/65">
                    {r.desc}
                  </p>
                </div>
              </Reveal>
            ))}
            <Reveal className="sm:col-span-2">
              <div className="flex h-full flex-col justify-center bg-espresso p-8">
                <p className="text-sm leading-relaxed text-primary-foreground/70">
                  A região tratada e a extensão do procedimento são sempre definidas individualmente
                  pelo médico.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Por que é diferente */}
      <Section>
        <Reveal className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
          <div className="md:sticky md:top-32">
            <Eyebrow>Por que a Técnica 4K é diferente?</Eyebrow>
            <SectionTitle>
              <span className="mt-6 block">Porque não existe tratamento “pronto”.</span>
            </SectionTitle>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              A extensão e a quantidade de tecido abordado devem ser definidas individualmente pelo
              médico, sempre priorizando a segurança clínica.
            </p>
          </div>
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              O planejamento considera
            </p>
            <ol className="divide-y divide-border border-y border-border">
              {planejamento.map((item, i) => (
                <li key={item} className="flex items-baseline gap-6 py-5">
                  <span className="heading-display text-lg text-champagne">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Section>

      {/* Minimamente invasiva + pós */}
      <section className="bg-sand">
        <Section className="grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <Eyebrow>Minimamente invasiva</Eyebrow>
            <h3 className="heading-display mt-5 text-3xl md:text-4xl">
              Uma abordagem diferente das grandes cirurgias.
            </h3>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              A Técnica 4K utiliza anestesia local/tumescente e cânulas ou microcânulas para a
              abordagem do tecido adiposo subcutâneo. Isso faz parte da proposta de uma técnica
              minimamente invasiva, realizada com avaliação, monitorização e equipe assistencial.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              O protocolo prevê médico responsável, enfermeiro, instrumentador, monitorização e
              recursos de suporte de emergência compatíveis com o ambiente assistencial.
            </p>
          </Reveal>
          <Reveal>
            <Eyebrow>E o pós-procedimento?</Eyebrow>
            <h3 className="heading-display mt-5 text-3xl md:text-4xl">
              Uma recuperação pensada para uma abordagem minimamente invasiva.
            </h3>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              A Técnica 4K não deve ser confundida com uma cirurgia de grande porte. Ainda assim,
              existem cuidados após o procedimento: de acordo com a orientação médica, podem ser
              indicados curativos, compressão, hidratação, caminhadas leves, restrições de esforço,
              medicamentos prescritos e acompanhamento fisioterapêutico quando necessário.
            </p>
            <p className="mt-6 border-l-2 border-champagne pl-5 text-sm italic leading-relaxed">
              Menos invasividade não significa ausência de cuidados. Significa uma proposta de
              tratamento diferente, com recuperação orientada individualmente.
            </p>
          </Reveal>
        </Section>
      </section>

      {/* Laser */}
      <Section>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Tecnologia que pode fazer parte do planejamento</Eyebrow>
          <h3 className="heading-display mt-6 text-3xl md:text-4xl">Laser de diodo</h3>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Quando houver indicação médica, o laser de diodo poderá ser associado à técnica para
            auxiliar no processo de retração cutânea. Sua utilização depende de avaliação
            individual, treinamento específico da equipe, proteção ocular, controle dos parâmetros e
            medidas de prevenção de lesões térmicas.
          </p>
        </Reveal>
      </Section>

      {/* Processo */}
      <section id="processo" className="bg-sand">
        <div className="mx-auto w-full max-w-4xl px-6 py-24 md:py-32">
          <Reveal className="text-center">
            <Eyebrow>Segurança começa antes do procedimento</Eyebrow>
            <SectionTitle>
              <span className="mt-6 block">
                Você não chega para fazer a Técnica 4K e simplesmente começa.
              </span>
            </SectionTitle>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Existe um processo.
            </p>
          </Reveal>
          <div className="mt-16 space-y-0">
            {etapas.map((e) => (
              <Reveal key={e.n}>
                <div className="grid gap-4 border-t border-border py-8 md:grid-cols-[80px_200px_1fr] md:gap-8">
                  <span className="heading-display text-4xl text-champagne">{e.n}</span>
                  <h3 className="heading-display text-2xl">{e.titulo}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Filosofia + indicação */}
      <Section>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Contorno corporal</Eyebrow>
          <h2 className="heading-display mt-6 text-4xl md:text-5xl">
            Não é sobre ter o corpo de outra pessoa.{" "}
            <em className="italic text-primary">É sobre valorizar o seu próprio contorno.</em>
          </h2>
          <p className="mt-8 leading-relaxed text-muted-foreground">
            A Técnica 4K não parte da ideia de que todos os corpos precisam ser tratados da mesma
            maneira. Ela parte de uma ideia mais simples: identificar o que realmente incomoda e
            avaliar o que pode ser tratado. Por isso, a indicação é individual. E o planejamento
            também.
          </p>
        </Reveal>

        <Reveal className="mt-16 grid gap-px bg-border md:grid-cols-2">
          <div className="bg-background p-10">
            <h3 className="heading-display text-2xl">Para quem é a Técnica 4K?</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A técnica pode ser indicada para pacientes clinicamente estáveis, com gordura
              localizada e alteração de contorno corporal compatível com a abordagem. É necessário
              apresentar condições anatômicas e cutâneas adequadas, expectativas realistas e
              ausência de contraindicações clínicas. A avaliação médica é indispensável.
            </p>
          </div>
          <div className="bg-background p-10">
            <h3 className="heading-display text-2xl">Quando não é a melhor opção?</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Nem todo paciente é candidato. Gestação, infecção ativa, doenças sistêmicas
              descompensadas, alterações importantes de coagulação, instabilidade cardiovascular e
              determinadas condições renais, hepáticas ou cardiopulmonares podem contraindicar ou
              exigir avaliação específica. Grandes excessos de pele, hérnias, diástases importantes
              ou outras alterações anatômicas também podem exigir outra abordagem.
            </p>
          </div>
        </Reveal>
        <Reveal className="mt-10 text-center">
          <p className="heading-display text-2xl">
            Por isso, a primeira etapa não é o procedimento.{" "}
            <em className="italic text-primary">É a avaliação.</em>
          </p>
        </Reveal>
      </Section>

      {/* Grupo Infinity */}
      <section
        id="grupo-infinity"
        className="relative overflow-hidden bg-espresso text-primary-foreground py-24 md:py-32"
      >
        <div className="mx-auto w-full max-w-5xl px-6">
          <Reveal className="text-center">
            <div className="mx-auto mb-8 flex justify-center">
              <img
                src={LOGO_INFINITY}
                alt="Grupo Infinity"
                className="h-24 md:h-32 w-auto object-contain brightness-110 drop-shadow-xl"
              />
            </div>
            <p className="eyebrow text-champagne/90">Sobre o Grupo Infinity</p>
            <h2 className="heading-display mt-4 text-4xl md:text-5xl text-primary-foreground">
              Ciência, tecnologia e cuidado humanizado.
            </h2>
            <div className="mx-auto mt-8 max-w-3xl space-y-6 text-base md:text-lg leading-relaxed text-primary-foreground/90 font-light">
              <p>
                Há cinco anos, o Grupo Infinity nasceu com o propósito de transformar a experiência
                em medicina estética e regenerativa por meio de uma atuação que une tecnologia,
                conhecimento médico e cuidado humanizado.
              </p>
              <p>
                Ao longo dessa trajetória, desenvolveu sua própria metodologia, consolidou uma
                equipe multidisciplinar e realizou mais de mil procedimentos associados à Técnica
                4K.
              </p>
              <p>
                Hoje, com estrutura própria e um modelo assistencial completo, o Grupo Infinity
                segue em expansão, levando sua experiência para novos mercados e construindo
                parcerias estratégicas com o mesmo compromisso que marcou sua história: segurança,
                qualidade e cuidado com cada paciente.
              </p>
            </div>
          </Reveal>

          {/* Destaques / Métricas */}
          <div className="mt-16 grid grid-cols-1 gap-px bg-primary-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
            <Reveal>
              <div className="h-full bg-espresso/90 p-8 text-center transition-colors hover:bg-olive-deep">
                <p className="heading-display text-5xl md:text-6xl text-champagne">5</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-primary-foreground/75 font-medium">
                  Anos de história
                </p>
                <p className="mt-4 text-xs leading-relaxed text-primary-foreground/60">
                  Transformando a medicina estética e regenerativa com inovação contínua.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="h-full bg-espresso/90 p-8 text-center transition-colors hover:bg-olive-deep">
                <p className="heading-display text-5xl md:text-6xl text-champagne">+1.000</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-primary-foreground/75 font-medium">
                  Procedimentos
                </p>
                <p className="mt-4 text-xs leading-relaxed text-primary-foreground/60">
                  Mais de mil procedimentos realizados associados à Técnica 4K.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="h-full bg-espresso/90 p-8 text-center transition-colors hover:bg-olive-deep">
                <div className="flex h-14 items-center justify-center">
                  <p className="heading-display text-2xl md:text-3xl text-champagne">Metodologia</p>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-primary-foreground/75 font-medium">
                  Própria e Exclusiva
                </p>
                <p className="mt-4 text-xs leading-relaxed text-primary-foreground/60">
                  Protocolo próprio desenvolvido com precisão, segurança e acompanhamento.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="h-full bg-espresso/90 p-8 text-center transition-colors hover:bg-olive-deep">
                <div className="flex h-14 items-center justify-center">
                  <p className="heading-display text-2xl md:text-3xl text-champagne">Segurança</p>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-primary-foreground/75 font-medium">
                  Equipe Multidisciplinar
                </p>
                <p className="mt-4 text-xs leading-relaxed text-primary-foreground/60">
                  Estrutura própria, equipe assistencial completa e padrão de excelência.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-14 text-center">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-4 border border-champagne px-10 py-4 text-xs font-medium uppercase tracking-[0.25em] text-champagne transition-all duration-500 hover:bg-champagne hover:text-espresso"
            >
              Falar com a equipe do Grupo Infinity
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* Depoimentos */}
      <Section>
        <Reveal className="text-center">
          <Eyebrow>O que nossas pacientes estão dizendo</Eyebrow>
          <SectionTitle>
            <span className="mt-6 block">
              Experiências reais de quem já passou pela Técnica 4K.
            </span>
          </SectionTitle>
        </Reveal>
        <div className="mt-14 grid gap-px bg-border md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Reveal key={i}>
              <figure className="flex h-full flex-col justify-between bg-background p-10">
                <blockquote className="heading-display text-xl italic leading-relaxed text-muted-foreground">
                  “Depoimento real em breve.”
                </blockquote>
                <figcaption className="mt-8 text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Nome da paciente · Cidade/UF
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Depoimentos devem ser reais e não representam garantia de resultado.
        </p>
      </Section>

      {/* Talvez você já tenha tentado de tudo */}
      <section className="bg-sand">
        <Section className="text-center">
          <Reveal>
            <Eyebrow>Talvez você já tenha tentado de tudo</Eyebrow>
            <div className="heading-display mx-auto mt-8 flex max-w-2xl flex-wrap items-baseline justify-center gap-x-4 text-3xl text-muted-foreground md:text-4xl">
              <span>Dietas.</span>
              <span>Treinos.</span>
              <span>Mudanças de rotina.</span>
              <span>Tratamentos estéticos.</span>
            </div>
            <p className="mx-auto mt-8 max-w-xl leading-relaxed text-muted-foreground">
              E mesmo assim existe aquela região que continua incomodando. Talvez o que você procura
              não seja emagrecer mais. Talvez você esteja procurando uma abordagem específica para
              uma região específica.
            </p>
            <p className="heading-display mt-8 text-2xl">
              É aí que começa a avaliação da Técnica 4K.
            </p>
          </Reveal>
        </Section>
      </section>

      {/* Acessível e sofisticado */}
      <Section>
        <Reveal className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="relative order-2 md:order-1">
            <div className="absolute -right-4 -top-4 hidden h-full w-full border border-champagne md:block" />
            <img
              src={DRA_PHOTO_2}
              alt="Dra. Rhauana Ângela em seu consultório"
              className="relative aspect-[4/5] w-full object-cover object-top shadow-2xl"
            />
            <div className="absolute bottom-6 right-6 bg-background/95 px-5 py-3 backdrop-blur-sm border border-border/60 shadow-md">
              <p className="heading-display text-lg">Dra. Rhauana Ângela</p>
              <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                Médica Esteticista · CRM/GO 35139 · BA 38285
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <Eyebrow>Um procedimento mais acessível também pode ser sofisticado</Eyebrow>
            <h2 className="heading-display mt-6 text-4xl md:text-5xl">
              Tecnologia e técnica não precisam estar distantes da sua realidade.
            </h2>
            <ul className="mt-8 space-y-3">
              {[
                "Tecnologia",
                "Planejamento médico",
                "Abordagem minimamente invasiva",
                "Tratamento individualizado",
                "Investimento mais acessível do que procedimentos cirúrgicos de maior porte, conforme o caso",
              ].map((item) => (
                <li key={item} className="flex items-baseline gap-4 text-sm">
                  <span className="h-px w-5 shrink-0 translate-y-[-4px] bg-champagne" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <CTAButton>Quero conhecer as condições</CTAButton>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Formulário de agendamento */}
      <section id="agendar" className="bg-sand">
        <div className="mx-auto w-full max-w-xl px-6 py-24 md:py-32">
          <Reveal className="text-center">
            <Eyebrow>Agende sua avaliação</Eyebrow>
            <SectionTitle>
              <span className="mt-6 block">Deixe seus dados e fale com a equipe</span>
            </SectionTitle>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              Preencha nome, telefone e a região que mais incomoda você. Sua solicitação é enviada
              direto para o WhatsApp da equipe.
            </p>
            <FormularioAgendamento />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-sand">
        <div className="mx-auto w-full max-w-3xl px-6 py-24 md:py-32">
          <Reveal className="text-center">
            <Eyebrow>Perguntas frequentes</Eyebrow>
            <SectionTitle>
              <span className="mt-6 block">Tudo o que você precisa saber</span>
            </SectionTitle>
          </Reveal>
          <div className="mt-14 divide-y divide-border border-y border-border">
            {faqs.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left [&::-webkit-details-marker]:hidden">
                  <span className="heading-display text-xl md:text-2xl">{f.q}</span>
                  <span className="heading-display shrink-0 text-2xl text-champagne transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-espresso text-primary-foreground">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
          <Reveal>
            <p className="eyebrow text-primary-foreground/60">
              Você não precisa decidir pelo procedimento agora
            </p>
            <h2 className="heading-display mt-6 text-4xl md:text-5xl">
              Primeiro, descubra se ele faz sentido para você.
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-primary-foreground/70">
              A Técnica 4K começa com uma avaliação médica. É nesse momento que serão analisados seu
              corpo, sua anatomia, a região que incomoda você e a possibilidade de indicação da
              técnica. Seu próximo passo pode ser simplesmente entender suas possibilidades.
            </p>
            <div className="mt-12">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-4 border border-champagne px-10 py-5 text-xs font-medium uppercase tracking-[0.25em] text-champagne transition-all duration-500 hover:bg-champagne hover:text-espresso"
              >
                Agendar minha avaliação
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <img
              src={LOGO_INFINITY}
              alt="Grupo Infinity"
              className="h-16 w-auto object-contain drop-shadow-sm"
            />
            <p className="heading-display text-2xl text-foreground">
              Tecnologia, conhecimento médico e cuidado humanizado.
            </p>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Grupo Infinity · Técnica 4K · Goiânia e Região
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <a
                href={INSTAGRAM_GRUPO}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground hover:underline"
              >
                @grupoinfinity_estetica
              </a>
              <span>·</span>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground hover:underline"
              >
                @drarhauana
              </a>
            </div>
          </div>
          <div className="hairline my-10" />
          <div className="mx-auto max-w-2xl space-y-4 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
            <p className="font-medium uppercase tracking-[0.18em]">Atenção</p>
            <p>
              A Técnica 4K é um procedimento médico e sua realização depende de avaliação e
              indicação profissional. Os resultados podem variar de acordo com características
              individuais. O procedimento possui riscos e contraindicações, que devem ser discutidos
              durante a consulta médica presencial.
            </p>
            <p>
              Dra. Rhauana Ângela · Médica Esteticista · CRM/GO 35139 · CRM/BA 38285 · Goiânia e
              Região
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
