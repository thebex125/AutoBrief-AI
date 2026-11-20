import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  AutoBriefActionPlan,
  ActionItem,
  PriorityLevel,
  ActionItemStatus,
  KeyDecision
} from '../types/actionPlan';
import {
  CheckCircle2,
  Circle,
  Copy,
  Download,
  Calendar,
  Clock,
  Users,
  Target,
  Sparkles,
  ExternalLink,
  Filter,
  Check,
  Search,
  Plus,
  Edit2,
  Trash2,
  Share2,
  FileCode,
  Flame,
  ArrowRight
} from 'lucide-react';

interface ActionBoardProps {
  plan: AutoBriefActionPlan;
  onUpdateActionItems?: (items: ActionItem[]) => void;
  onReset?: () => void;
}

export const ActionBoard: React.FC<ActionBoardProps> = ({
  plan,
  onUpdateActionItems,
  onReset
}) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>(plan.actionItems);
  const [decisions, setDecisions] = useState<KeyDecision[]>(plan.decisionsMade);
  const [selectedPic, setSelectedPic] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // In-line task editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskPic, setEditTaskPic] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<PriorityLevel>('Medium');
  const [editTaskDue, setEditTaskDue] = useState('');

  // Add new task state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPic, setNewTaskPic] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('High');
  const [newTaskDue, setNewTaskDue] = useState('2026-11-25');

  // Follow-up tab
  const [activeExportTab, setActiveExportTab] = useState<'whatsapp' | 'slack' | 'notion' | 'schema'>('whatsapp');

  const updateItems = (updated: ActionItem[]) => {
    setActionItems(updated);
    onUpdateActionItems?.(updated);
  };

  const toggleTaskStatus = (id: string) => {
    const updated = actionItems.map((item) => {
      if (item.id === id) {
        const nextStatus: ActionItemStatus =
          item.status === 'completed' ? 'todo' : 'completed';
        return { ...item, status: nextStatus };
      }
      return item;
    });
    updateItems(updated);

    // Trigger confetti if all tasks are completed
    const allDone = updated.every((i) => i.status === 'completed');
    if (allDone && updated.length > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleCycleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = actionItems.map((item) => {
      if (item.id === id) {
        let nextStatus: ActionItemStatus = 'todo';
        if (item.status === 'todo') nextStatus = 'in_progress';
        else if (item.status === 'in_progress') nextStatus = 'completed';
        else nextStatus = 'todo';
        return { ...item, status: nextStatus };
      }
      return item;
    });
    updateItems(updated);
  };

  const startEdit = (item: ActionItem) => {
    setEditingTaskId(item.id);
    setEditTaskTitle(item.task);
    setEditTaskPic(item.pic);
    setEditTaskPriority(item.priority);
    setEditTaskDue(item.dueDate);
  };

  const saveEdit = (id: string) => {
    const updated = actionItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          task: editTaskTitle.trim() || item.task,
          pic: editTaskPic.trim() || item.pic,
          priority: editTaskPriority,
          dueDate: editTaskDue.trim() || item.dueDate,
          deadline: editTaskDue.trim() || item.dueDate
        };
      }
      return item;
    });
    updateItems(updated);
    setEditingTaskId(null);
  };

  const deleteTask = (id: string) => {
    const updated = actionItems.filter((item) => item.id !== id);
    updateItems(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newItem: ActionItem = {
      id: `TASK-${Date.now()}`,
      task: newTaskTitle.trim(),
      description: 'Ad-hoc action item ditambahkan melalui Action Board.',
      pic: newTaskPic.trim() || 'Tim',
      priority: newTaskPriority,
      dueDate: newTaskDue.trim() || '2026-11-25',
      deadline: newTaskDue.trim() || '2026-11-25',
      status: 'todo'
    };

    updateItems([newItem, ...actionItems]);
    setNewTaskTitle('');
    setNewTaskPic('');
    setIsAddingTask(false);
  };

  // Filter options
  const uniquePics = Array.from(new Set(actionItems.map((item) => item.pic))).filter(Boolean);

  const filteredItems = actionItems.filter((item) => {
    const matchPic = selectedPic === 'ALL' || item.pic === selectedPic;
    const matchPriority = selectedPriority === 'ALL' || item.priority === selectedPriority;
    const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchSearch =
      !searchQuery.trim() ||
      item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPic && matchPriority && matchStatus && matchSearch;
  });

  const completedCount = actionItems.filter((i) => i.status === 'completed').length;
  const progressPercent = Math.round((completedCount / (actionItems.length || 1)) * 100);

  // Copy Follow-Up Handlers
  const handleCopyText = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadMarkdown = () => {
    const content = [
      `# ${plan.meetingSummary.title}`,
      `**Date:** ${plan.meetingSummary.meetingDate} | **Duration:** ${plan.meetingSummary.durationMinutes} mins`,
      `**Participants:** ${plan.meetingSummary.participants.join(', ')}`,
      '',
      `## Executive Overview`,
      plan.meetingSummary.executiveOverview,
      '',
      `## Key Decisions`,
      ...decisions.map(
        (d, idx) => `${idx + 1}. **${d.decision}** (Owner: @${d.owner}) - ${d.rationale}`
      ),
      '',
      `## Action Items`,
      ...actionItems.map(
        (a) =>
          `- [${a.status === 'completed' ? 'x' : ' '}] **${a.task}** | PIC: @${a.pic} | Due: ${a.dueDate} | Priority: ${a.priority} | Status: ${a.status}`
      ),
      '',
      `---`,
      `*Generated autonomously by AutoBrief AI on Anna AI OS*`
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutoBrief-${plan.meetingSummary.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE MEETING SUMMARY CARD */}
      <div className="relative rounded-3xl glass-panel glass-panel-hover p-6 md:p-8 shadow-2xl overflow-hidden border border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                ACTION BOARD
              </span>
              <span className="text-xs font-mono text-cyan-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                AI Confidence: {plan.meetingSummary.confidenceScore}%
              </span>
              <span className="text-xs font-mono text-indigo-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                Sentiment: {plan.meetingSummary.overallSentiment.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {plan.meetingSummary.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400 font-sans">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyanSpark" />
                {plan.meetingSummary.meetingDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyanSpark" />
                {plan.meetingSummary.durationMinutes} Menit Sesi
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyanSpark" />
                {plan.meetingSummary.participants.length} Partisipan:
                <span className="text-slate-200 font-semibold ml-1">
                  {plan.meetingSummary.participants.join(', ')}
                </span>
              </span>
            </div>
          </div>

          {onReset && (
            <button
              onClick={onReset}
              className="text-xs px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 transition font-medium self-start shadow"
            >
              ← Process New Meeting
            </button>
          )}
        </div>

        {/* Executive Overview Paragraph */}
        <div className="mt-6 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyanSpark" />
            Executive Synthesis
          </h4>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans">
            {plan.meetingSummary.executiveOverview}
          </p>
        </div>

        {/* Key Decisions Agreed */}
        {decisions.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigoBrand-light" />
              Key Decisions Locked ({decisions.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {decisions.map((dec) => (
                <div
                  key={dec.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-indigoBrand/40 transition shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-400">
                      {dec.topic}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                      @{dec.owner}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1.5">
                    {dec.decision}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {dec.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. TASK PROGRESS & FILTER TOOLBAR */}
      <div className="relative rounded-3xl glass-panel p-6 shadow-xl border border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Progress bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emeraldVerified" />
                Action Items Completion
              </span>
              <span className="font-mono text-cyan-300 font-semibold">
                {completedCount} of {actionItems.length} Done ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigoBrand via-cyanSpark to-emeraldVerified rounded-full"
              />
            </div>
          </div>

          {/* Add Task Button & Quick Exports */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="text-xs px-3.5 py-2.5 rounded-xl font-bold bg-indigoBrand hover:bg-indigoBrand-light text-white flex items-center gap-1.5 transition shadow-lg shadow-indigoBrand/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Task</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="text-xs px-3.5 py-2.5 rounded-xl font-semibold bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800 flex items-center gap-1.5 transition shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download MD</span>
            </button>
          </div>
        </div>

        {/* Inline Add Task Form */}
        <AnimatePresence>
          {isAddingTask && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddTask}
              className="mt-5 p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3"
            >
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Tambah Action Item Baru
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nama tugas (contoh: Review kontrak vendor)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyanSpark"
                  required
                />
                <input
                  type="text"
                  placeholder="PIC (contoh: Raka)..."
                  value={newTaskPic}
                  onChange={(e) => setNewTaskPic(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyanSpark"
                  required
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyanSpark"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 text-xs hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigoBrand text-white text-xs font-bold hover:bg-indigoBrand-light"
                >
                  Simpan Tugas
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-3">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari tugas atau PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 outline-none focus:border-cyanSpark font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" /> PIC:
            </span>
            <button
              onClick={() => setSelectedPic('ALL')}
              className={`text-xs px-3 py-1 rounded-xl transition font-medium ${
                selectedPic === 'ALL'
                  ? 'bg-indigoBrand text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Semua ({actionItems.length})
            </button>
            {uniquePics.map((pic) => {
              const count = actionItems.filter((i) => i.pic === pic).length;
              return (
                <button
                  key={pic}
                  onClick={() => setSelectedPic(pic)}
                  className={`text-xs px-3 py-1 rounded-xl transition font-medium ${
                    selectedPic === pic
                      ? 'bg-indigoBrand text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  @{pic} ({count})
                </button>
              );
            })}

            <div className="h-4 w-[1px] bg-slate-800 mx-2 hidden md:block" />

            <span className="text-xs text-slate-400 font-mono mr-1">Priority:</span>
            {['ALL', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`text-xs px-2.5 py-1 rounded-xl transition font-medium ${
                  selectedPriority === p
                    ? 'bg-cyanSpark/20 text-cyan-300 border border-cyanSpark/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {p}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-slate-800 mx-2 hidden md:block" />

            <span className="text-xs text-slate-400 font-mono mr-1">Status:</span>
            {['ALL', 'todo', 'in_progress', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`text-xs px-2.5 py-1 rounded-xl transition font-mono ${
                  selectedStatus === st
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TASK CARDS LIST */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl glass-panel p-12 text-center text-slate-500 border border-slate-800">
            <Target className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-medium">Tidak ada tugas yang cocok dengan filter atau pencarian.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCompleted = item.status === 'completed';
            const isInProgress = item.status === 'in_progress';
            const isEditing = editingTaskId === item.id;

            let priorityClass = 'bg-slate-800/80 text-slate-400 border-slate-700';
            if (item.priority === 'High') {
              priorityClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
            } else if (item.priority === 'Medium') {
              priorityClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            } else if (item.priority === 'Low') {
              priorityClass = 'bg-slate-500/15 text-slate-400 border-slate-700';
            }

            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group p-4 md:p-5 rounded-2xl border transition-all duration-200 relative ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'glass-panel hover:border-slate-700 hover:shadow-xl'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => toggleTaskStatus(item.id)}
                    className="mt-0.5 text-slate-500 hover:text-emeraldVerified transition shrink-0"
                    title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emeraldVerified" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  {/* Task Info / Editing */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-indigo-500/40">
                        <input
                          type="text"
                          value={editTaskTitle}
                          onChange={(e) => setEditTaskTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white outline-none focus:border-cyanSpark"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="PIC"
                            value={editTaskPic}
                            onChange={(e) => setEditTaskPic(e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                          />
                          <select
                            value={editTaskPriority}
                            onChange={(e) => setEditTaskPriority(e.target.value as PriorityLevel)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Due Date"
                            value={editTaskDue}
                            onChange={(e) => setEditTaskDue(e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingTaskId(null)}
                            className="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="px-3 py-1 rounded-lg bg-indigoBrand text-white text-xs font-bold"
                          >
                            Simpan Perubahan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3
                            className={`text-sm md:text-base font-semibold leading-snug ${
                              isCompleted
                                ? 'line-through text-slate-500'
                                : 'text-slate-100 group-hover:text-white'
                            }`}
                          >
                            {item.task}
                          </h3>

                          {/* Priority, Status & Deadline Badges */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Interactive Status Cycle Button */}
                            <button
                              onClick={(e) => handleCycleStatus(item.id, e)}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition ${
                                item.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : item.status === 'in_progress'
                                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                              title="Klik untuk ganti status (Todo -> In Progress -> Done)"
                            >
                              {item.status.replace('_', ' ')}
                            </button>

                            <span
                              className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold ${priorityClass}`}
                            >
                              {item.priority}
                            </span>

                            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-cyanSpark" />
                              {item.dueDate}
                            </span>

                            {/* Quick edit & delete buttons */}
                            <button
                              onClick={() => startEdit(item)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition"
                              title="Edit tugas"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTask(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition"
                              title="Hapus tugas"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                            {item.description}
                          </p>
                        )}

                        {/* PIC & Source Quote */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-slate-800/60 text-xs">
                          <div className="inline-flex items-center gap-1.5 font-medium text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-800/40">
                            <Users className="w-3 h-3 text-cyanSpark" />
                            <span>PIC: @{item.pic}</span>
                            {item.picRole && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({item.picRole})
                              </span>
                            )}
                          </div>

                          {item.sourceQuote && (
                            <span className="text-[11px] text-slate-500 italic truncate max-w-md font-sans">
                              "{item.sourceQuote}"
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 4. WORLD CLASS MULTI-CHANNEL FOLLOW-UP SUITE */}
      <div className="relative rounded-3xl glass-panel p-6 md:p-8 shadow-2xl border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyanSpark" />
              One-Click Follow-Up Suite
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Draf pesan siap kirim untuk WhatsApp, Slack, Notion Table, atau skema JSON Anna AI OS.
            </p>
          </div>

          {/* Export Format Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveExportTab('whatsapp')}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                activeExportTab === 'whatsapp'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setActiveExportTab('slack')}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                activeExportTab === 'slack'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Slack
            </button>
            <button
              onClick={() => setActiveExportTab('notion')}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                activeExportTab === 'notion'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Notion JSON
            </button>
            <button
              onClick={() => setActiveExportTab('schema')}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                activeExportTab === 'schema'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Anna OS Schema
            </button>
          </div>
        </div>

        {/* Tab Content & Copy Button */}
        <div className="mt-5 space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                let textToCopy = '';
                if (activeExportTab === 'whatsapp') textToCopy = plan.followUpDraft.whatsappSummary;
                else if (activeExportTab === 'slack') textToCopy = plan.followUpDraft.slackMarkdown;
                else if (activeExportTab === 'notion')
                  textToCopy = JSON.stringify(plan.followUpDraft.notionExportPayload, null, 2);
                else textToCopy = JSON.stringify(plan, null, 2);
                handleCopyText(textToCopy, activeExportTab);
              }}
              className="text-xs px-4 py-2 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition shadow"
            >
              {copiedType === activeExportTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyanSpark" />
                  <span>Salin Draf {activeExportTab.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto shadow-inner">
            {activeExportTab === 'whatsapp' && plan.followUpDraft.whatsappSummary}
            {activeExportTab === 'slack' && plan.followUpDraft.slackMarkdown}
            {activeExportTab === 'notion' &&
              JSON.stringify(plan.followUpDraft.notionExportPayload, null, 2)}
            {activeExportTab === 'schema' && JSON.stringify(plan, null, 2)}
          </div>
        </div>
      </div>
    </div>
  );
};
