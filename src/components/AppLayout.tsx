import { Link } from "@tanstack/react-router";
import { FileText, KanbanSquare, Mail, Workflow } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Meeting Notes", icon: FileText },
  { to: "/planner", label: "Task Planner", icon: KanbanSquare },
  { to: "/email", label: "Email Generator", icon: Mail },
] as const;

export const DISCLAIMER =
  "AI-generated content may contain errors. Please review before use. Do not enter confidential or sensitive information.";

export function AppLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <aside className="border-b border-border bg-card md:min-h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center gap-2 px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Workflow className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">FlowAssist</p>
            <p className="truncate text-xs text-muted-foreground">Productivity Assistant</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "bg-primary/10 text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-accent" }}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </header>
          {children}
        </main>
        <footer className="border-t border-border bg-card px-4 py-4 md:px-8">
          <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
        </footer>
      </div>
    </div>
  );
}
