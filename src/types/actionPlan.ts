/**
 * AutoBrief AI — Core Action Plan Data Contracts & JSON Schema
 * Track: Anna AI App Builder Program (DoraHacks)
 *
 * Defines strict TypeScript interfaces and JSON Schema for deterministic
 * LLM Structured Output inside the Anna AI OS Sandbox.
 */

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type ActionItemStatus = 'todo' | 'in_progress' | 'completed';

export type InputSourceMode = 'voice_record' | 'audio_upload' | 'raw_text';

export type AgentStageId =
  | 'voice_scribe'
  | 'speaker_diarization'
  | 'decision_action_miner'
  | 'responsibility_matcher';

/**
 * 1. MeetingSummary: High-level executive metadata & synthesis
 */
export interface MeetingSummary {
  title: string;
  context: string;
  meetingDate: string;
  durationMinutes: number;
  participants: string[];
  executiveOverview: string;
  keyTopics: string[];
  overallSentiment: 'positive' | 'neutral' | 'urgent' | 'critical';
  confidenceScore: number;
}

/**
 * 2. KeyDecision: Concrete agreements and strategic resolutions locked during the meeting
 */
export interface KeyDecision {
  id: string;
  topic: string;
  decision: string;
  rationale: string;
  owner: string;
  impactLevel: PriorityLevel;
  timestampRef?: string;
}

/**
 * 3. ActionItem: Assigned operational task with PIC, priority, dueDate/deadline, and status
 */
export interface ActionItem {
  id: string;
  task: string;
  description: string;
  pic: string;
  picRole?: string;
  priority: PriorityLevel;
  dueDate: string;
  /** Alias for dueDate to support external webhook/schema consumers */
  deadline: string;
  estimatedHours?: number;
  status: ActionItemStatus;
  sourceQuote?: string;
}

/**
 * 4. FollowUpDraft: Multi-channel ready-to-send communication templates
 */
export interface FollowUpDraft {
  whatsappSummary: string;
  emailSubject: string;
  emailBody: string;
  slackMarkdown: string;
  notionExportPayload: {
    pageTitle: string;
    databaseRows: Array<{
      task: string;
      assignee: string;
      priority: PriorityLevel;
      due: string;
      status: ActionItemStatus;
    }>;
  };
}

/**
 * Telemetry trace step for the 4-Agent Anna AI Orchestration Visualizer
 */
export interface AgentOrchestrationStep {
  stageId: AgentStageId;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  elapsedSeconds: number;
  detailMessage: string;
}

/**
 * Root Output Payload: AutoBriefActionPlan
 */
export interface AutoBriefActionPlan {
  id: string;
  createdAt: string;
  inputMode: InputSourceMode;
  meetingSummary: MeetingSummary;
  decisionsMade: KeyDecision[];
  actionItems: ActionItem[];
  followUpDraft: FollowUpDraft;
  agentTrace?: AgentOrchestrationStep[];
}

/**
 * Strict JSON Schema (Draft-07 / Structured Output Contract)
 * Passed to Anna AI OS Reverse Sampling / LLM Response Format
 */
export const ACTION_PLAN_JSON_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'AutoBriefActionPlan',
  type: 'object',
  required: ['meetingSummary', 'decisionsMade', 'actionItems', 'followUpDraft'],
  properties: {
    meetingSummary: {
      type: 'object',
      required: [
        'title',
        'context',
        'meetingDate',
        'durationMinutes',
        'participants',
        'executiveOverview',
        'keyTopics',
        'overallSentiment',
        'confidenceScore'
      ],
      properties: {
        title: { type: 'string', description: 'Concise, automatically inferred meeting title' },
        context: { type: 'string', description: 'Meeting category or project context' },
        meetingDate: { type: 'string', description: 'ISO date or formatted human date (YYYY-MM-DD)' },
        durationMinutes: { type: 'number', description: 'Estimated or actual meeting duration in minutes' },
        participants: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of identified speakers/participants'
        },
        executiveOverview: {
          type: 'string',
          description: '2-3 sentence sharp executive synthesis of the conversation'
        },
        keyTopics: {
          type: 'array',
          items: { type: 'string' }
        },
        overallSentiment: {
          type: 'string',
          enum: ['positive', 'neutral', 'urgent', 'critical']
        },
        confidenceScore: {
          type: 'number',
          minimum: 0,
          maximum: 100
        }
      }
    },
    decisionsMade: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'topic', 'decision', 'rationale', 'owner', 'impactLevel'],
        properties: {
          id: { type: 'string' },
          topic: { type: 'string' },
          decision: { type: 'string' },
          rationale: { type: 'string' },
          owner: { type: 'string' },
          impactLevel: { type: 'string', enum: ['High', 'Medium', 'Low'] },
          timestampRef: { type: 'string' }
        }
      }
    },
    actionItems: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'task', 'description', 'pic', 'priority', 'dueDate', 'deadline', 'status'],
        properties: {
          id: { type: 'string' },
          task: { type: 'string', description: 'Clear imperative action title' },
          description: { type: 'string', description: 'Concrete acceptance criteria or detail' },
          pic: { type: 'string', description: 'Assigned Person In Charge (PIC)' },
          picRole: { type: 'string' },
          priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
          dueDate: { type: 'string', description: 'Target deadline date' },
          deadline: { type: 'string', description: 'Mirror of dueDate for external integrations' },
          estimatedHours: { type: 'number' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'completed'] },
          sourceQuote: { type: 'string' }
        }
      }
    },
    followUpDraft: {
      type: 'object',
      required: ['whatsappSummary', 'emailSubject', 'emailBody', 'slackMarkdown', 'notionExportPayload'],
      properties: {
        whatsappSummary: {
          type: 'string',
          description: 'Ready-to-paste WhatsApp/Telegram bulleted recap with emojis and PIC tags'
        },
        emailSubject: { type: 'string' },
        emailBody: { type: 'string' },
        slackMarkdown: { type: 'string' },
        notionExportPayload: {
          type: 'object',
          required: ['pageTitle', 'databaseRows'],
          properties: {
            pageTitle: { type: 'string' },
            databaseRows: {
              type: 'array',
              items: {
                type: 'object',
                required: ['task', 'assignee', 'priority', 'due', 'status'],
                properties: {
                  task: { type: 'string' },
                  assignee: { type: 'string' },
                  priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
                  due: { type: 'string' },
                  status: { type: 'string', enum: ['todo', 'in_progress', 'completed'] }
                }
              }
            }
          }
        }
      }
    }
  }
} as const;
