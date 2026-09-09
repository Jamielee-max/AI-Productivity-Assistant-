import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
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
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — FlowAssist" },
      {
        name: "description",
        content:
          "Draft an editable work email with the right tone — formal, friendly, persuasive or urgent.",
      },
      { property: "og:title", content: "Smart Email Generator — FlowAssist" },
      {
        property: "og:description",
        content: "Draft an editable work email with the right tone in seconds.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive", "Urgent"] as const;
type Tone = (typeof TONES)[number];

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const run = useServerFn(generateEmail);

  const handleGenerate = async () => {
    if (!recipient.trim() || !topic.trim()) {
      toast.error("Add a recipient and what the email is about.");
      return;
    }
    setLoading(true);
    try {
      const result = await run({ data: { recipient, topic, tone } });
      setSubject(result.subject);
      setBody(result.body);
      toast.success("Draft ready — edit it before sending.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate the email.");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  const sendEmail = () => {
    if (!subject.trim() && !body.trim()) {
      toast.error("Nothing to send yet — generate the email first.");
      return;
    }
    const trimmedRecipient = recipient.trim();
    if (!isValidEmail(recipient)) {
      toast.error(
        "The recipient doesn't look like a valid email address. Update it before sending."
      );
      return;
    }
    const params = new URLSearchParams();
    params.set("subject", subject);
    params.set("body", body);
    window.location.href = `mailto:${encodeURIComponent(recipient)}?${params.toString()}`;
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      toast.success("Email copied.");
    } catch {
      toast.error("Copying isn't available in this browser.");
    }
  };

  return (
    <AppLayout
      title="Smart Email Generator"
      subtitle="Describe the message and pick a tone — then edit the draft freely."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Email details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Priya, project manager at Acme"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic / task description</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What should the email say?"
                className="min-h-32"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Generating..." : "Generate Email"}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
            <CardTitle className="text-base">Draft</CardTitle>
            <Button variant="outline" size="sm" onClick={copyAll} disabled={!subject && !body}>
              <Copy className="size-4" /> Copy
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line appears here"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email body appears here"
                className="min-h-80"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
