import React from 'react';
import { UserCheck, Bot, Heart, Sparkles, Activity, ShieldAlert, Brain } from 'lucide-react';

export default function AvatarAssistant({ state = 'IDLE', message = 'Hello! I am MediSense AI, your human-centered health information assistant.' }) {
  // States: IDLE, LISTENING, THINKING, ASKING, PROCESSING, RESPONDING, WARNING

  let avatarBg = 'bg-sky-600 text-white shadow-sky-600/20';
  let badgeText = 'IDLE • READY';
  let badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
  let pulseAnimation = '';

  if (state === 'LISTENING') {
    avatarBg = 'bg-teal-600 text-white shadow-teal-600/30';
    badgeText = 'LISTENING TO INPUT';
    badgeColor = 'bg-teal-50 text-teal-800 border-teal-200';
    pulseAnimation = 'animate-pulse';
  } else if (state === 'THINKING' || state === 'PROCESSING') {
    avatarBg = 'bg-indigo-600 text-white shadow-indigo-600/30';
    badgeText = 'THINKING • ANALYZING NLP & ML';
    badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    pulseAnimation = 'animate-bounce';
  } else if (state === 'ASKING') {
    avatarBg = 'bg-amber-500 text-white shadow-amber-500/30';
    badgeText = 'ASKING ADAPTIVE QUESTION';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (state === 'RESPONDING') {
    avatarBg = 'bg-emerald-600 text-white shadow-emerald-600/30';
    badgeText = 'RESPONDING WITH RAG EVIDENCE';
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (state === 'WARNING') {
    avatarBg = 'bg-rose-600 text-white shadow-rose-600/30';
    badgeText = 'EMERGENCY SAFETY ALERT';
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
    pulseAnimation = 'animate-ping';
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar Icon Circle */}
          <div className={`w-12 h-12 rounded-2xl ${avatarBg} flex items-center justify-center font-bold text-xl shadow-md transition-all ${pulseAnimation}`}>
            {state === 'WARNING' ? <ShieldAlert className="w-6 h-6" /> : (state === 'THINKING' ? <Brain className="w-6 h-6" /> : <Bot className="w-6 h-6" />)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">MediSense Assistant</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeColor}`}>
                {badgeText}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Human-Centered Decision-Support Persona</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Non-Diagnostic Educational Tool</span>
        </div>
      </div>

      {/* Dynamic Conversational Thought Bubble */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <span>{message}</span>
      </div>
    </div>
  );
}
