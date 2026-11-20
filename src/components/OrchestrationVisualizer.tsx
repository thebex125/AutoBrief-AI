import React from 'react';
import { AgentOrchestrationStep } from '../types/actionPlan';
import {
  Mic,
  Users,
  BrainCircuit,
  CheckSquare,
  CheckCircle2,
  Clock,
  Loader2,
  Terminal,
  Cpu,
  Sparkles
} from 'lucide-react';

interface OrchestrationVisualizerProps {
  steps: AgentOrchestrationStep[];
  currentStage?: string;
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  voice_scribe: <Mic className="w-5 h-5" />,
  speaker_diarization: <Users className="w-5 h-5" />,
  decision_action_miner: <BrainCircuit className="w-5 h-5" />,
  responsibility_matcher: <CheckSquare className="w-5 h-5" />
};

export const OrchestrationVisualizer: React.FC<OrchestrationVisualizerProps> = ({ steps }) => {
  return (
    <div className="relative rounded-3xl p-1 bg-gradient-to-b from-cyan-500/20 via-indigo-500/10 to-transparent shadow-2xl transition-all duration-300">
      <div className="glass-panel rounded-[22px] p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyanSpark/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigoBrand/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                PHASE 2: ORCHESTRATION TRACE
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Sequential Agentic Mesh
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2">
              <span>Anna AI OS Multi-Agent Chain</span>
              <Sparkles className="w-5 h-5 text-cyanSpark animate-spin" style={{ animationDuration: '4s' }} />
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Visualisasi penalaran terdistribusi dari transkrip mentah menuju rencana kerja definitif.
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-mono text-cyanSpark bg-slate-950/80 px-3.5 py-2 rounded-xl border border-white/[0.08] backdrop-blur-md shadow-inner">
            <Loader2 className="w-4 h-4 animate-spin text-cyanSpark" />
            <span>Real-time Host Pipeline</span>
          </div>
        </div>

        {/* Agents Timeline Steps */}
        <div className="mt-6 space-y-4 relative z-10">
          {steps.map((step, idx) => {
            const isDone = step.status === 'completed';
            const isRunning = step.status === 'running';
            const isPending = step.status === 'pending';

            return (
              <div
                key={step.stageId || idx}
                className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  isRunning
                    ? 'bg-slate-900/90 border-cyanSpark/60 shadow-glass-md shadow-cyanSpark/10 scale-[1.01]'
                    : isDone
                    ? 'bg-slate-950/50 border-white/[0.08] text-slate-300'
                    : 'bg-slate-950/20 border-white/[0.04] text-slate-500 opacity-50'
                }`}
              >
                {/* Active Stage Glowing Accent Bar */}
                {isRunning && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-cyanSpark to-indigoBrand animate-pulse" />
                )}

                <div className="flex items-start gap-4">
                  {/* Stage Icon Container */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emeraldVerified shadow-sm'
                        : isRunning
                        ? 'bg-cyan-950/70 border-cyanSpark text-cyanSpark animate-pulse shadow-glow-cyan'
                        : 'bg-slate-900/50 border-slate-800 text-slate-600'
                    }`}
                  >
                    {STAGE_ICONS[step.stageId] || <BrainCircuit className="w-5 h-5" />}
                  </div>

                  {/* Content & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50">
                          AGENT 0{idx + 1}
                        </span>
                        <h4
                          className={`text-sm sm:text-base font-bold truncate ${
                            isRunning ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-400'
                          }`}
                        >
                          {step.agentName}
                        </h4>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isDone && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emeraldVerified bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                          </span>
                        )}
                        {isRunning && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-cyanSpark bg-cyanSpark/10 px-2.5 py-1 rounded-full border border-cyanSpark/40 animate-pulse">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sedang Menalar...
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-800/80">
                            <Clock className="w-3.5 h-3.5" /> Antrean
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Agent Real-time Output / Trace Log */}
                    {step.details && (
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] text-xs font-mono text-slate-300 flex items-start gap-2.5">
                        <Terminal className="w-4 h-4 text-cyanSpark shrink-0 mt-0.5" />
                        <span className="leading-relaxed break-words">{step.details}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
