# AutoBrief AI — Autonomous Meeting & Voice-to-Action-Plan Agent
**Track:** Anna AI App Builder Program | DoraHacks Global Hackathon  
**Category:** Productivity & Autonomous Workflows  
**Tagline:** *"From Spoken Words to Executed Tasks in 10 Seconds."*

---

## 1. Tech Stack (Lightweight, Fast & Anna AI OS Native)

| Layer | Technology | Role in AutoBrief AI |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18 + Vite 6 + TypeScript** | Instant zero-latency SPA inside the Anna AI OS frame. |
| **Styling & Design System** | **Tailwind CSS + Lucide Icons** | Dark-first "Smart Productivity" theme (`#0B0F19` canvas, Indigo `#4F46E5` primary, Cyan `#06B6D4` AI spark). |
| **Data Contract** | **TypeScript + JSON Schema Draft-07** | Strict validation in `src/types/actionPlan.ts` (`MeetingSummary`, `KeyDecision`, `ActionItem`, `FollowUpDraft`). |
| **AI & Sandbox Runtime** | **Anna AI OS Reverse Sampling + Executa Bridge** | Multi-agent orchestration in `src/services/annaOrchestrator.ts` with zero-config offline deterministic fallback. |

---

## 2. Core Data Schema (`src/types/actionPlan.ts`)

Setiap output ekstraksi rapat divalidasi terhadap kontrak `AutoBriefActionPlan` & `ACTION_PLAN_JSON_SCHEMA`:
- **`meetingSummary`** (`MeetingSummary`): `title`, `context`, `meetingDate`, `durationMinutes`, `participants[]`, `executiveOverview`, `keyTopics[]`, `overallSentiment`, `confidenceScore`.
- **`decisionsMade`** (`KeyDecision[]`): `id`, `topic`, `decision`, `rationale`, `owner`, `impactLevel` (`'High' | 'Medium' | 'Low'`).
- **`actionItems`** (`ActionItem[]`): `id`, `task`, `description`, `pic`, `picRole`, `priority` (`'High' | 'Medium' | 'Low'`), `dueDate`, `deadline`, `estimatedHours`, `status` (`'todo' | 'in_progress' | 'completed'`), `sourceQuote`.
- **`followUpDraft`** (`FollowUpDraft`): `whatsappSummary`, `emailSubject`, `emailBody`, `slackMarkdown`, dan `notionExportPayload`.

---

## 3. AI Module Architecture & Anna AI OS Sandbox Pipeline

```
[Step 1: Input Studio]
  ├── Live Voice Capture (Web Audio API / MediaRecorder + Waveform Visualizer)
  ├── Audio File Upload (.mp3, .m4a, .wav, .ogg)
  └── Raw Notes / Chat Transcript Paste
          │
          ▼
[Step 2: 4-Stage Multi-Agent Orchestrator (src/services/annaOrchestrator.ts)]
  ├── Agent 1: Voice Scribe Agent (Audio-to-Text via window.anna.audio.transcribe & text normalization)
  ├── Agent 2: Speaker Diarization (Participant & role identification)
  ├── Agent 3: Decision & Action Miner (Separates strategic decisions from operational tasks)
  └── Agent 4: Responsibility & Due-Date Matcher (Assigns PIC, priority, deadline & multi-channel drafts)
          │
          ├──► [Primary Path]: Anna AI OS Reverse Sampling (window.anna.llm.complete + ACTION_PLAN_JSON_SCHEMA)
          └──► [Zero-Config Sandbox Fallback]: Deterministic local synthesis (guarantees 100% offline/judge demo reliability)
          │
          ▼
[Step 3: Interactive Action Board & 1-Click Follow-Up]
  ├── Filter by PIC & Priority Badges (High/Medium/Low)
  ├── Interactive Task Completion Checkboxes
  └── 1-Click Copy WhatsApp Summary / Export Notion JSON / Formal Email Recap
```

---

## 4. Repository Structure

```text
C:\Projects\AutoBrief\
├── anna-manifest.json             # Anna AI OS Sandboxed App Manifest & Permissions
├── package.json                   # React + Vite + TypeScript + Tailwind dependencies
├── tsconfig.json                  # Strict TypeScript configuration
├── README.md                      # Architecture Blueprint & Documentation
└── src/
    ├── types/
    │   └── actionPlan.ts          # Core TypeScript Interfaces & JSON Schema Draft-07
    └── services/
        └── annaOrchestrator.ts    # Audio/Text Pipeline, 4-Agent Prompt Orchestrator & Anna OS Bridge
```
