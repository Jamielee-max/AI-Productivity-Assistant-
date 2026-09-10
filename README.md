# FlowAssist AI - Workplace Productivity AI Assistant

Build a modern responsive web app called "FlowAssist — AI Workplace Productivity Assistant." Create dashboard layout with sidebar navigation to Meeting Notes Summarizer, AI Task Planner, and Smart Email Generator. Summarizer: raw-notes textarea, Summarize action, editable outputs divided into Key Decisions, Action Items, Deadlines. Task Planner: columns To Do/In Progress/Done, manually add tasks with title priority High/Medium/Low and deadline, Copy from Summary to bring action items into tasks, use AI to suggest priority from task text when added. Email Generator: recipient, topic/task description, tone Formal/Friendly/Persuasive/Urgent, Generate Email, editable full email with subject and body. Use Lovable Cloud/AI as needed for functional AI capabilities. Clean modern SaaS styling, rounded cards, professional colors, desktop/mobile responsive. Include footer disclaimer exactly: "AI-generated content may contain errors. Please review before use. Do not enter confidential or sensitive information." Prioritize simple correct functionality over advanced effects.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/51af0d27-abef-4763-95b3-3baff84485d1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Overview

FlowAssist is an AI-powered productivity dashboard that turns raw meeting notes into completed action items — automatically. Instead of offering disconnected AI tools, FlowAssist chains three features into a single pipeline: notes go in, prioritized tasks come out, and follow-up emails are generated with one click.

FlowAssist doesn't just generate content — it connects directly to the tools people already use, letting users send real emails and add real calendar events with one click, straight from the AI output.

## Problem It Solves

Meeting notes are usually written, shared once, and then forgotten — action items get lost and follow-ups never get sent. FlowAssist closes that gap by connecting summarization, planning, and communication into one workflow.

## Features

### 1. Meeting Notes Summarizer
- Paste raw meeting notes
- AI extracts key decisions, action items, owners, and deadlines into structured, editable cards
- Output is color-coded for quick scanning (decisions, action items, deadlines)

### 2. AI Task Planner
- Action items from the Summarizer can be added directly into a prioritized task board (High/Medium/Low)
- Tasks can also be added manually
- Kanban-style view: To Do / In Progress / Done
- One-click "Add to calendar" — opens Google Calendar with the task title and deadline pre-filled, so tasks can be added straight to a real calendar

### 3. Smart Email Generator
- Generate a follow-up email directly from a task or topic
- Choose tone: Formal, Friendly, Persuasive, or Urgent Reminder
- Auto-fills context from the original meeting notes and deadline
- One-click "Send" — opens the user's default email client (e.g. Gmail, Outlook) with the subject and body pre-filled, ready to send

## Tools Used
- **Lovable AI** — used to build the entire application (UI, logic, and functionality) through structured, iterative prompts — no manual coding
- **AI Language Model** (built into Lovable) — powers the Meeting Notes Summarizer, Task Planner suggestions, and Email Generator outputs
- **GitHub** — version control and project submission

## Responsible AI Use
- All AI-generated content (summaries, tasks, emails) is fully editable before use
- Users are advised not to paste sensitive/confidential company data into the notes field
- AI outputs may contain inaccuracies and should be reviewed before being sent or acted on
- No real emails are sent automatically by the app — the "Send" button opens the user's own email client, so the user always reviews and confirms before sending
- No calendar accounts are connected or accessed — the "Add to calendar" button generates a pre-filled Google Calendar link only

## Setup Instructions

This project was built entirely using Lovable AI (no local setup or installation required).

1. View the live app here: **[insert your published Lovable app link]**
2. To view the source/project on Lovable: **[insert Lovable project share link]**
3. This repository contains the exported project files and documentation for submission purposes
4. No API keys, environment variables, or local build steps are needed to view or use the app

## Prompts Used

Below are the core prompts used to build FlowAssist in Lovable, showing the structured, iterative prompt engineering process:

- **Initial build prompt:** Defined the 3-feature dashboard (Meeting Notes Summarizer, Task Planner, Email Generator) with sidebar navigation, structured AI outputs, and a responsible AI disclaimer.
- **Visual design prompt:** Requested a premium, modern look (similar to Linear/Notion) with a deliberate color palette, clear typographic hierarchy, and a refined sidebar — explicitly without changing any functionality.
- **Color refinement prompt:** Added a confident accent color plus distinct tints per output category (Decisions, Action Items, Deadlines) for quick visual scanning, while keeping the base background clean and neutral.
- **Responsive design prompt:** Fixed mobile navigation by replacing an overflowing horizontal tab bar with a mobile-friendly menu, without altering functionality.
- **Calendar integration prompt:** Added a "Add to calendar" button per task that opens a pre-filled Google Calendar event link — no login or backend required.
- **Email send prompt:** Added a "Send" button that opens the user's default email client with the generated subject and body pre-filled via a mailto link.

## Team Members
- Jaime-lee Pareshs Gordon — sole developer, prompt engineering, UI direction


## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
