import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel de solicitações — Técnica 4K" },
      {
        name: "description",
        content: "Acompanhe quantas pessoas solicitaram avaliação da Técnica 4K e quando.",
      },
      { property: "og:title", content: "Painel de solicitações — Técnica 4K" },
      {
        property: "og:description",
        content: "Acompanhe as solicitações de avaliação recebidas pelo site.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

type Solicitacao = {
  id: string;
  nome: string;
  telefone: string;
  regiao: string;
  created_at: string;
};

const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function Painel() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["solicitacoes"],
    queryFn: async (): Promise<Solicitacao[]> => {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select("id, nome, telefone, regiao, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const lista = data ?? [];
  const agora = Date.now();
  const ultimos7 = lista.filter(
    (s) => agora - new Date(s.created_at).getTime() < 7 * 24 * 60 * 60 * 1000,
  ).length;
  const hoje = lista.filter(
    (s) => new Date(s.created_at).toDateString() === new Date().toDateString(),
  ).length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-muted-foreground">Painel</p>
            <h1 className="heading-display mt-4 text-4xl">Solicitações de avaliação</h1>
          </div>
          <div className="flex gap-6 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:text-foreground hover:underline">
              Ver site
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth" });
              }}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-px bg-border sm:grid-cols-3">
          <Metrica rotulo="Total" valor={lista.length} />
          <Metrica rotulo="Últimos 7 dias" valor={ultimos7} />
          <Metrica rotulo="Hoje" valor={hoje} />
        </div>

        <div className="mt-12">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {error && (
            <p className="text-sm text-destructive">Não foi possível carregar as solicitações.</p>
          )}
          {!isLoading && !error && lista.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação recebida até agora.</p>
          )}
          {lista.length > 0 && (
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-5 py-4 font-medium">Nome</th>
                    <th className="px-5 py-4 font-medium">Telefone</th>
                    <th className="px-5 py-4 font-medium">Região</th>
                    <th className="px-5 py-4 font-medium">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-4">{s.nome}</td>
                      <td className="px-5 py-4">
                        <a
                          href={`https://wa.me/${s.telefone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline-offset-4 hover:underline"
                        >
                          {s.telefone}
                        </a>
                      </td>
                      <td className="px-5 py-4">{s.regiao}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {fmt.format(new Date(s.created_at))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Metrica({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="bg-background px-8 py-10">
      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">{rotulo}</p>
      <p className="heading-display mt-3 text-5xl">{valor}</p>
    </div>
  );
}
