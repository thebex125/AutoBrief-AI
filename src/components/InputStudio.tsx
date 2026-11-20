import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Upload,
  FileText,
  Sparkles,
  Play,
  Square,
  RefreshCw,
  Sliders,
  Radio,
  FileAudio,
  CheckCircle2,
  ArrowRight,
  Flame
} from 'lucide-react';
import { InputSourceMode } from '../types/actionPlan';

interface InputStudioProps {
  onAnalyze: (data: {
    mode: InputSourceMode;
    rawText: string;
    audioBlob?: Blob;
    context: string;
  }) => void;
  isLoading: boolean;
}

const SAMPLE_TRANSCRIPTS = {
  marketing: {
    context: 'Weekly Sprint: Kampanye Ramadhan 2026',
    text: `Raka: Selamat pagi tim, kita mulai weekly sync persiapan Ramadhan 2026. Target kita live promo tanggal 5 Maret.
Maya: Dari tim konten, video teaser influencer sudah 80% draft. Tapi butuh approval budget tambahan 15 juta untuk talent utama.
Budi: Mengenai budget tambahan, saya sudah review dan kita setujui maksimal 15 juta. Maya tolong submit form PO sebelum Kamis jam 15:00 ya.
Dimas: Terkait landing page promo, tim dev siap deploy. Tapi kita butuh materi banner resolusi tinggi dari Maya paling lambat Rabu sore.
Raka: Oke keputusan kita:
1. Budget talent disetujui 15 juta.
2. Maya submit PO sebelum Kamis jam 15:00 dan kirim banner HD ke Dimas sebelum Rabu 17:00.
3. Dimas integrasi payment gateway dan testing load traffic sebelum Jumat sore 20 November.
4. Budi siapkan dashboard analitik performa campaign minggu depan.
Ada sanggahan? Oke rapat kita tutup.`
  },
  product: {
    context: 'Product Launch & Security Audit Review',
    text: `Kevin: Halo tim, agenda hari ini adalah finalisasi deployment v2.4 dan hasil penetration testing.
Siti: Dari tim QA, masih ditemukan minor edge case pada autentikasi SSO saat session timeout.
Ahmad: Saya yang akan handle bug SSO tersebut hari ini. Target fix sebelum Kamis siang 20 November.
Kevin: Keputusan kita tunda rilis public selama 2 hari untuk pastikan audit keamanan 100% lulus.
Siti: Siap, saya jadwalkan re-test otomatis setelah commit Ahmad masuk.
Kevin: Kevin akan siapkan release notes dan beritahu stakeholder manajemen hari Rabu besok.`
  }
};

export const InputStudio: React.FC<InputStudioProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<InputSourceMode>('raw_text');
  const [context, setContext] = useState('Weekly Sprint: Kampanye Ramadhan 2026');
  const [rawText, setRawText] = useState(SAMPLE_TRANSCRIPTS.marketing.text);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // File Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Dynamic Audio Visualizer simulation bars (28 bars)
  const [waveHeights, setWaveHeights] = useState<number[]>(
    Array.from({ length: 28 }, () => 20)
  );

  useEffect(() => {
    let waveInterval: number | null = null;
    if (isRecording) {
      waveInterval = window.setInterval(() => {
        setWaveHeights(
          Array.from({ length: 28 }, () => Math.floor(Math.random() * 85) + 15)
        );
      }, 100);
    } else {
      setWaveHeights(Array.from({ length: 28 }, () => 18));
    }

    return () => {
      if (waveInterval) clearInterval(waveInterval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Akses mikrofon tidak diizinkan atau tidak didukung di peramban ini.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    let textToSend = rawText;
    let audioBlobToSend: Blob | undefined = undefined;

    if (activeTab === 'voice_record') {
      if (recordedAudioBlob) {
        audioBlobToSend = recordedAudioBlob;
        textToSend = rawText || `[Rekaman Suara Rapat Otentik (${formatSeconds(recordingSeconds)}) - Diskusi: ${context}]`;
      } else if (!rawText) {
        alert('Silakan rekam audio atau isi catatan terlebih dahulu.');
        return;
      }
    } else if (activeTab === 'audio_upload') {
      if (uploadedFile) {
        audioBlobToSend = uploadedFile;
        textToSend = rawText || `[File Audio Terunggah: ${uploadedFile.name} (${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB) - Diskusi: ${context}]`;
      } else if (!rawText) {
        alert('Silakan unggah file audio atau masukkan transkrip.');
        return;
      }
    } else {
      if (!rawText.trim()) {
        alert('Silakan masukkan catatan atau transkrip rapat.');
        return;
      }
    }

    onAnalyze({
      mode: activeTab,
      rawText: textToSend,
      audioBlob: audioBlobToSend,
      context: context.trim() || 'General Team Sync'
    });
  };

  const loadPreset = (key: 'marketing' | 'product') => {
    const preset = SAMPLE_TRANSCRIPTS[key];
    setContext(preset.context);
    setRawText(preset.text);
  };

  return (
    <div className="relative rounded-3xl p-1 bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent shadow-2xl transition-all duration-300">
      <div className="glass-panel rounded-[22px] p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle Ambient Glow inside card */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigoBrand/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyanSpark/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Card Top Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-white/[0.08] gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                PHASE 1: INGESTION STUDIO
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Whisper &Diacritics Ready
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              Capture Voice & Meeting Stream
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pilih kanal masukan terbaik untuk mengekstraksi keputusan penting dan mendelegasikan tugas secara otonom.
            </p>
          </div>

          {/* Quick Demo Presets */}
          <div className="flex items-center gap-2 self-start lg:self-auto bg-slate-950/70 p-2 rounded-2xl border border-white/[0.08] backdrop-blur-md">
            <span className="text-xs text-slate-400 px-2 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyanSpark" />
              Demo Presets:
            </span>
            <button
              type="button"
              onClick={() => loadPreset('marketing')}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/40 border border-slate-700/60 text-slate-200 hover:text-white transition-all font-medium"
            >
              Ramadhan Sprint
            </button>
            <button
              type="button"
              onClick={() => loadPreset('product')}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-cyan-600/30 hover:border-cyan-500/40 border border-slate-700/60 text-slate-200 hover:text-white transition-all font-medium"
            >
              Product Security
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 relative z-10">
          {/* Context Input Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <span>Project & Meeting Context</span>
              <span className="text-[10px] text-slate-500 lowercase font-normal">(wajib untuk akurasi diarization)</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Contoh: Sprint Marketing, Review Klien, Pengetesan Fitur Baru..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/[0.08] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-100 text-sm transition shadow-inner placeholder:text-slate-600"
              />
              <div className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-mono">
                UTF-8
              </div>
            </div>
          </div>

          {/* Luxury Segmented Control Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Input Modality
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-white/[0.08] backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab('raw_text')}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'raw_text'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 scale-[1.01]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Raw Text / Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('voice_record')}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'voice_record'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 scale-[1.01]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Live Voice Record</span>
                {isRecording && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('audio_upload')}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'audio_upload'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 scale-[1.01]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Audio Upload</span>
              </button>
            </div>
          </div>

          {/* TAB 1: RAW TEXT INPUT */}
          {activeTab === 'raw_text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Format dialog bebas (Nama: Kalimat atau poin notulen)
                </span>
                <span className="font-mono text-slate-500">{rawText.length} karakter</span>
              </div>
              <textarea
                rows={9}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Tempel catatan atau transkrip rapat di sini..."
                className="w-full p-4 rounded-2xl bg-slate-950/70 border border-white/[0.08] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-100 text-sm font-mono leading-relaxed transition shadow-inner resize-y placeholder:text-slate-600"
              />
            </div>
          )}

          {/* TAB 2: LIVE VOICE RECORD WITH DYNAMIC WAVEFORM */}
          {activeTab === 'voice_record' && (
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-white/[0.08] flex flex-col items-center justify-center space-y-6">
              {/* Dynamic Equalizer Waveform Canvas (Aceternity / Manus style) */}
              <div className="w-full max-w-xl h-24 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900/40 rounded-xl border border-white/[0.04]">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${h}%`,
                      transition: 'height 0.12s ease-in-out'
                    }}
                    className={`w-2 rounded-full transition-all ${
                      isRecording
                        ? 'bg-gradient-to-t from-cyanSpark via-indigo-400 to-indigo-600 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                        : recordedAudioBlob
                        ? 'bg-gradient-to-t from-emerald-500 to-cyan-400 opacity-80'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Timer and Status */}
              <div className="text-center">
                <div className="text-3xl font-mono font-bold tracking-tight text-white">
                  {formatSeconds(recordingSeconds)}
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-2">
                  {isRecording ? (
                    <span className="flex items-center gap-1.5 text-red-400 font-semibold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Merekam audio langsung via browser...
                    </span>
                  ) : recordedAudioBlob ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Rekaman siap diproses ({(recordedAudioBlob.size / 1024).toFixed(1)} KB)
                    </span>
                  ) : (
                    <span>Klik mikrofon untuk mulai merekam audio rapat</span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Mulai Rekam Suara</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Square className="w-4 h-4" />
                    <span>Hentikan Rekaman</span>
                  </button>
                )}

                {recordedAudioBlob && !isRecording && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecordedAudioBlob(null);
                      setRecordingSeconds(0);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rekam Ulang</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO UPLOAD */}
          {activeTab === 'audio_upload' && (
            <div className="p-8 rounded-2xl bg-slate-950/70 border-2 border-dashed border-white/[0.12] hover:border-indigo-500/50 flex flex-col items-center justify-center text-center space-y-4 transition-all duration-300 relative group cursor-pointer">
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                <FileAudio className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {uploadedFile ? uploadedFile.name : 'Tarik & lepas file audio ke sini, atau klik untuk telusuri'}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Mendukung .mp3, .wav, .m4a, .ogg (Maks. 50 MB)
                </p>
              </div>
              {uploadedFile && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB siap dianalisis</span>
                </div>
              )}
            </div>
          )}

          {/* SUBMIT BUTTON WITH SHIMMER & LUXURY HOVER */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
                isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'btn-shimmer text-white shadow-glow-indigo hover:scale-[1.01] active:scale-[0.99] border border-white/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Menjalankan 4-Stage Multi-Agent Orchestration...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-cyan-200" />
                  <span>Jalankan AutoBrief Multi-Agent Analysis</span>
                  <ArrowRight className="w-5 h-5 text-indigo-200 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
