import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { summarizeNotes } from "@/lib/ai.functions";
import { useSavedActionItems } from "@/lib/flow-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — FlowAssist" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into key decisions, action items and deadlines you can edit and reuse.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — FlowAssist" },
      {
        property: "og:description",
        content: "Turn raw meeting notes into key decisions, action items and deadlines.",
      },
    ],
  }),
  component: SummarizerPage,
});

type Summary = { keyDecisions: string[]; actionItems: string[]; deadlines: string[] };

function EditableList({
  title,
  items,
  onChange,
}: {
  title: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
          <Plus className="size-4" /> Add item
        </Button>
      </CardContent>
    </Card>
  );
}

function SummarizerPage() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const run = useServerFn(summarizeNotes);
  const { setActionItems } = useSavedActionItems();

  const handleSummarize = async () => {
    if (!notes.trim()) {
      toast.error("Paste some meeting notes first.");
      return;
    }
    setLoading(true);
    try {
      const result = await run({ data: { notes } });
      setSummary(result);
      setActionItems(result.actionItems);
      toast.success("Summary ready — action items are available in the Task Planner.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not summarize the notes.");
    } finally {
      setLoading(false);
    }
  };

  const update = (patch: Partial<Summary>) => {
    if (!summary) return;
    const next = { ...summary, ...patch };
    setSummary(next);
    if (patch.actionItems) setActionItems(patch.actionItems);
  };

  return (
    <AppLayout
      title="Meeting Notes Summarizer"
      subtitle="Paste raw notes and get an editable summary of decisions, actions and deadlines."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Raw notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your meeting notes here..."
              className="min-h-64"
            />
            <Button onClick={handleSummarize} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Summarizing..." : "Summarize"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <EditableList
            title="Key Decisions"
            items={summary?.keyDecisions ?? []}
            onChange={(keyDecisions) => update({ keyDecisions })}
          />
          <EditableList
            title="Action Items"
            items={summary?.actionItems ?? []}
            onChange={(actionItems) => update({ actionItems })}
          />
          <EditableList
            title="Deadlines"
            items={summary?.deadlines ?? []}
            onChange={(deadlines) => update({ deadlines })}
          />
        </div>
      </div>
    </AppLayout>
  );
}
