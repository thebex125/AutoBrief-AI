import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { InputStudio } from './components/InputStudio';
import { OrchestrationVisualizer } from './components/OrchestrationVisualizer';
import { ActionBoard } from './components/ActionBoard';
import {
  AutoBriefActionPlan,
  AgentOrchestrationStep,
  InputSourceMode,
  ActionItem
} from './types/actionPlan';
import { runAutoBriefOrchestration } from './services/annaOrchestrator';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Layers,
  Radio,
  FileCheck2
} from 'lucide-react';

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orchestrationSteps, setOrchestrationSteps] = useState<AgentOrchestrationStep[]>([]);
  const [currentPlan, setCurrentPlan] = useState<AutoBriefActionPlan | null>(null);

  const handleAnalyze = async (data: {
    mode: InputSourceMode;
    rawText: string;
    audioBlob?: Blob;
    context: string;
  }) => {
    setIsLoading(true);
    setOrchestrationSteps([]);
    setCurrentPlan(null);

    try {
      const plan = await runAutoBriefOrchestration({
        mode: data.mode,
        rawText: data.rawText,
        audioBlob: data.audioBlob,
        meetingContext: data.context,
        referenceDate: '2026-11-20',
        onStepUpdate: (steps) => {
          setOrchestrationSteps([...steps]);
        }
      });

      // Smooth transition delay so users appreciate the completed 4-agent trace
      setTimeout(() => {
        setCurrentPlan(plan);
        setIsLoading(false);
      }, 750);
    } catch (err) {
      console.error('Orchestration failed', err);
      setIsLoading(false);
      alert('Terjadi kesalahan saat memproses rapat. Silakan coba kembali.');
    }
  };

  const handleUpdateActionItems = (items: ActionItem[]) => {
    if (currentPlan) {
      setCurrentPlan({
        ...currentPlan,
        actionItems: items
      });
    }
  };

  const handleReset = () => {
    setCurrentPlan(null);
    setOrchestrationSteps([]);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-indigoBrand selection:text-white relative bg-grid-pattern">
      {/* Ambient background glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-indigoBrand/15 via-cyanSpark/5 to-transparent blur-[120px] pointer-events-none" />

      {/* 1. TOP NAVIGATION BAR */}
      <header className="border-b border-white/[0.08] bg-[#07090E]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigoBrand via-indigo-500 to-cyanSpark flex items-center justify-center shadow-lg shadow-indigoBrand/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AutoBrief AI
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Autonomous Meeting & Voice-to-Action-Plan Agent
              </p>
            </div>
          </div>

          {/* Anna AI OS Sandbox Status Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-slate-800 text-xs font-mono shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Anna OS Sandboxed</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400">Reverse Sampling</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 text-xs font-semibold text-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-cyanSpark" />
              <span>DoraHacks Demo</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Hero Section (only when no plan is active) */}
        {!currentPlan && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto pt-4 pb-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-xs font-semibold text-cyan-300 mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyanSpark" />
              <span>Anna AI App Builder Program &bull; DoraHacks $6,000 USD Prize Pool</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Turn Chaotic Meetings Into <br />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Autonomous Action Plans
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Satu klik untuk mengonversi rekaman suara atau catatan rapat acak menjadi daftar tugas terstruktur dengan pembagian PIC, tenggat waktu, dan draf follow-up WhatsApp/Slack.
            </p>
          </motion.div>
        )}

        {/* STEP 1: INPUT STUDIO */}
        <div className={currentPlan ? 'hidden' : 'block'}>
          <InputStudio onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* STEP 2: ORCHESTRATION TRACE */}
        {isLoading && orchestrationSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <OrchestrationVisualizer steps={orchestrationSteps} />
          </motion.div>
        )}

        {/* STEP 3: INTERACTIVE ACTION BOARD */}
        {currentPlan && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <ActionBoard
              plan={currentPlan}
              onUpdateActionItems={handleUpdateActionItems}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#07090E]/60 backdrop-blur-md py-6 mt-16 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigoBrand-light" />
            <span>AutoBrief AI &bull; Built with React 18, Vite, TypeScript & Tailwind CSS</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Anna AI OS Reverse Sampling</span>
            <span className="text-slate-700">&bull;</span>
            <span className="text-slate-400 font-mono">DoraHacks Hackathon</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
