import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "./login";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso Seguro — Infinity OS" },
      { name: "description", content: "Sistema Integrado de Gestão Clínica do Grupo Infinity." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});
