import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarPlus, ClipboardList, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { suggestPriority } from "@/lib/ai.functions";
import { newId, useSavedActionItems, useTasks, type Priority, type Status, type Task } from "@/lib/flow-store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — FlowAssist" },
      {
        name: "description",
        content:
          "Track work across To Do, In Progress and Done, with AI-suggested priorities and meeting action items.",
      },
      { property: "og:title", content: "AI Task Planner — FlowAssist" },
      {
        property: "og:description",
        content: "Track work across To Do, In Progress and Done with AI-suggested priorities.",
      },
    ],
  }),
  component: PlannerPage,
});

const COLUMNS: Status[] = ["To Do", "In Progress", "Done"];

const priorityStyles: Record<Priority, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-primary/10 text-primary",
  Low: "bg-muted text-muted-foreground",
};

function PlannerPage() {
  const { tasks, setTasks } = useTasks();
  const { actionItems } = useSavedActionItems();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority | "AI">("AI");
  const [deadline, setDeadline] = useState("");
  const [adding, setAdding] = useState(false);
  const askPriority = useServerFn(suggestPriority);

  const addTask = async () => {
    if (!title.trim()) {
      toast.error("Give the task a title.");
      return;
    }
    setAdding(true);
    let resolved: Priority = priority === "AI" ? "Medium" : priority;
    if (priority === "AI") {
      try {
        const result = await askPriority({ data: { text: title } });
        resolved = result.priority;
        toast.success(`AI suggested ${resolved} priority.`);
      } catch (error) {
        toast.error(
          error instanceof Error ? `${error.message} Defaulted to Medium.` : "Defaulted to Medium priority.",
        );
      }
    }
    setTasks([
      ...tasks,
      { id: newId(), title: title.trim(), priority: resolved, deadline, status: "To Do" },
    ]);
    setTitle("");
    setDeadline("");
    setAdding(false);
  };

  const copyFromSummary = () => {
    const existing = new Set(tasks.map((t) => t.title.toLowerCase()));
    const fresh = actionItems
      .map((a) => a.trim())
      .filter((a) => a && !existing.has(a.toLowerCase()));
    if (fresh.length === 0) {
      toast.error("No new action items to copy. Summarize notes first.");
      return;
    }
    setTasks([
      ...tasks,
      ...fresh.map<Task>((a) => ({
        id: newId(),
        title: a,
        priority: "Medium",
        deadline: "",
        status: "To Do",
      })),
    ]);
    toast.success(`Copied ${fresh.length} action item${fresh.length > 1 ? "s" : ""}.`);
  };

  const addToGoogleCalendar = (task: Task) => {
    // All-day event: Google expects dates=YYYYMMDD/YYYYMMDD with an exclusive end date.
    const [year, month, day] = task.deadline.split("-").map((n) => parseInt(n, 10));
    const pad = (n: number) => String(n).padStart(2, "0");
    const start = `${year}${pad(month)}${pad(day)}`;
    const end = new Date(Date.UTC(year, month - 1, day + 1));
    const endStr = `${end.getUTCFullYear()}${pad(end.getUTCMonth() + 1)}${pad(end.getUTCDate())}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${start}/${endStr}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const patch = (id: string, changes: Partial<Task>) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)));

  return (
    <AppLayout
      title="AI Task Planner"
      subtitle="Add tasks manually or pull action items from your latest meeting summary."
    >
      <Card className="mb-6 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add a task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_auto] md:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Send revised proposal to Acme"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority | "AI")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI">Suggest with AI</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-deadline">Deadline</Label>
              <Input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={addTask} disabled={adding}>
                {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Add task
              </Button>
              <Button variant="outline" onClick={copyFromSummary}>
                <ClipboardList className="size-4" /> Copy from Summary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const items = tasks.filter((t) => t.status === column);
          return (
            <Card key={column} className="rounded-2xl">
              <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
                <CardTitle className="text-base">{column}</CardTitle>
                <Badge variant="secondary">{items.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 && <p className="text-sm text-muted-foreground">No tasks.</p>}
                {items.map((task) => (
                  <div key={task.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 text-sm font-medium text-foreground">{task.title}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete task"
                        className="shrink-0"
                        onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                      {task.deadline && (
                        <span className="text-xs text-muted-foreground">Due {task.deadline}</span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Select
                        value={task.status}
                        onValueChange={(v) => patch(task.id, { status: v as Status })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLUMNS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={task.priority}
                        onValueChange={(v) => patch(task.id, { priority: v as Priority })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["High", "Medium", "Low"] as Priority[]).map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
