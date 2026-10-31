'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';

interface ChatMessage {
  id: string;
  sender: string;
  senderRole?: string;
  isMe: boolean;
  text: string;
  fileAttachment?: string;
  timestamp?: string;
}

interface ProjectChatCardProps {
  onToast?: (msg: string) => void;
  currentUserRole?: 'freelancer' | 'team_member' | 'client';
}

export const ProjectChatCard: React.FC<ProjectChatCardProps> = ({
  onToast,
  currentUserRole = 'freelancer',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'Kunal Shah',
      senderRole: 'CRED Founder (Client)',
      isMe: false,
      text: 'Shared the updated micro-interaction benchmark in the Drive folder.',
      fileAttachment: 'drive.link/tokens.zip',
      timestamp: '10:42 AM',
    },
    {
      id: 'msg_2',
      sender: 'You (Arjun)',
      senderRole: 'Lead Director',
      isMe: true,
      text: 'Got them! Riya is finalizing the rough cut animation passes today.',
      timestamp: '10:45 AM',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const senderName =
      currentUserRole === 'freelancer'
        ? 'You (Arjun)'
        : currentUserRole === 'team_member'
        ? 'You (Rohan / Riya)'
        : 'You (Kunal Shah)';

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: senderName,
      isMe: true,
      text: inputMessage.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    if (onToast) {
      onToast('Message sent to client & team channel!');
    }
  };

  const handleCopyAttachment = (link: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://${link}`);
      if (onToast) {
        onToast(`Copied asset link: ${link}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Project Chat & Files
        </h3>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online</span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="space-y-4 mb-4 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
        {messages.map((msg) => {
          if (msg.isMe) {
            return (
              <div key={msg.id} className="flex flex-col items-end">
                <div className="max-w-[85%] bg-indigo-600 text-white rounded-2xl rounded-tr-xs p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-indigo-200 block mb-1">
                    {msg.sender}
                  </span>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    {msg.text}
                  </p>
                  {msg.fileAttachment && (
                    <button
                      type="button"
                      onClick={() => handleCopyAttachment(msg.fileAttachment!)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-white font-mono text-[11px] rounded-lg border border-indigo-500/50 transition-colors"
                    >
                      <span>📎</span>
                      <span>{msg.fileAttachment}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <div key={msg.id} className="flex flex-col items-start">
                <div className="max-w-[85%] bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl rounded-tl-xs p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    {msg.sender}
                  </span>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-800">
                    {msg.text}
                  </p>
                  {msg.fileAttachment && (
                    <button
                      type="button"
                      onClick={() => handleCopyAttachment(msg.fileAttachment!)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] rounded-lg border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                      title="Click to copy asset link"
                    >
                      <Icons.Link2 className="w-3 h-3 text-slate-400" />
                      <span>{msg.fileAttachment}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Input Row */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Write a message to client..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
            inputMessage.trim()
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98]'
              : 'bg-indigo-400/60 text-white/80 cursor-not-allowed'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
};

