'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../ui/Icons';

export type PerspectiveRole = 'freelancer' | 'team_member' | 'client';

export interface ChatMessage {
  id: string;
  authorRole: PerspectiveRole;
  authorName: string;
  authorTitle: string;
  text: string;
  fileAttachment?: string;
  timestamp: string;
}

interface ProjectChatCardProps {
  onToast?: (msg: string) => void;
  currentUserRole?: PerspectiveRole;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    authorRole: 'client',
    authorName: 'Kunal Shah',
    authorTitle: 'CRED Founder (Client)',
    text: 'Shared the updated micro-interaction benchmark in the Drive folder.',
    fileAttachment: 'drive.link/tokens.zip',
    timestamp: '10:42 AM',
  },
  {
    id: 'msg_2',
    authorRole: 'freelancer',
    authorName: 'Arjun Verma',
    authorTitle: 'Lead Director (Freelancer)',
    text: 'Got them! Riya is finalizing the rough cut animation passes today.',
    timestamp: '10:45 AM',
  },
];

export const ProjectChatCard: React.FC<ProjectChatCardProps> = ({
  onToast,
  currentUserRole = 'freelancer',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('paidflow_project_chat_v3');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((m) => {
              if (m.authorRole) return m;
              const isKunal =
                (m.sender || '').toLowerCase().includes('kunal') ||
                (m.senderRole || '').toLowerCase().includes('client') ||
                m.isMe === false;
              return {
                id: m.id || `msg_${Date.now()}_${Math.random()}`,
                authorRole: isKunal ? ('client' as const) : ('freelancer' as const),
                authorName: isKunal ? 'Kunal Shah' : 'Arjun Verma',
                authorTitle: isKunal ? 'CRED Founder (Client)' : 'Lead Director (Freelancer)',
                text: m.text || '',
                fileAttachment: m.fileAttachment,
                timestamp: m.timestamp || 'Just now',
              };
            });
          }
        }
      } catch (e) {
        console.warn('Failed to load chat from localStorage', e);
      }
    }
    return DEFAULT_MESSAGES;
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingAuthor, setTypingAuthor] = useState('Kunal Shah');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachmentLink, setAttachmentLink] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('paidflow_project_chat_v3', JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to persist chat messages', e);
      }
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Generate intelligent perspective-aware auto-reply
  const triggerAutoReply = (userText: string, sentAsRole: PerspectiveRole) => {
    setIsTyping(true);

    if (sentAsRole === 'client') {
      // If client sent the message, Arjun (freelancer) auto-replies
      setTypingAuthor('Arjun Verma');
      setTimeout(() => {
        setIsTyping(false);
        const lower = userText.toLowerCase();
        let replyText = 'Thanks Kunal! We are incorporating this into the timeline right away.';

        if (lower.includes('approved') || lower.includes('approve') || lower.includes('great') || lower.includes('looks')) {
          replyText = 'Appreciate the quick sign-off Kunal! Preparing the final delivery exports and master files now.';
        } else if (lower.includes('payment') || lower.includes('upi') || lower.includes('cleared') || lower.includes('paid')) {
          replyText = 'Payment received to 9079879010@fam! Receipt generated and Milestone 2 unlocked.';
        } else if (lower.includes('drive') || lower.includes('stems') || lower.includes('file')) {
          replyText = 'Received the asset package. Syncing with DaVinci resolve timeline.';
        }

        const replyMsg: ChatMessage = {
          id: `msg_auto_${Date.now()}`,
          authorRole: 'freelancer',
          authorName: 'Arjun Verma',
          authorTitle: 'Lead Director (Freelancer)',
          text: replyText,
          timestamp: 'Just now',
        };

        setMessages((prev) => [...prev, replyMsg]);
        if (onToast) onToast('New reply from Arjun Verma (Freelancer)');
      }, 1400);
    } else {
      // If freelancer or team member sent the message, Kunal (client) auto-replies
      setTypingAuthor('Kunal Shah');
      setTimeout(() => {
        setIsTyping(false);
        const lower = userText.toLowerCase();
        let replyText = 'Awesome speed! Reviewing this with our design sprint lead now.';
        let replyAttachment: string | undefined = undefined;

        if (lower.includes('invoice') || lower.includes('payment') || lower.includes('upi') || lower.includes('tranche')) {
          replyText = 'Received the UPI tranche link! Approving payment directly to 9079879010@fam from CRED accounts.';
        } else if (lower.includes('figma') || lower.includes('tokens') || lower.includes('color') || lower.includes('spec')) {
          replyText = 'Tokens are confirmed! We added 3 extra responsive micro-interactions for the mobile viewport.';
          replyAttachment = 'figma.com/@cred/motion-v2.tokens';
        } else if (lower.includes('render') || lower.includes('cut') || lower.includes('version') || lower.includes('v1') || lower.includes('v2')) {
          replyText = 'Just pulled up the preview stream. The ease-in-out pacing on the 30s teaser feels super crisp!';
        } else if (lower.includes('asset') || lower.includes('guideline') || lower.includes('pdf')) {
          replyText = 'Here are the finalized high-res SVG brand assets and typography scale.';
          replyAttachment = 'assets.cred.club/brand-guidelines-2026.pdf';
        } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
          replyText = 'Hey Arjun! How is today’s milestone progressing? We are hyped for the final handoff.';
        }

        const replyMsg: ChatMessage = {
          id: `msg_auto_${Date.now()}`,
          authorRole: 'client',
          authorName: 'Kunal Shah',
          authorTitle: 'CRED Founder (Client)',
          text: replyText,
          fileAttachment: replyAttachment,
          timestamp: 'Just now',
        };

        setMessages((prev) => [...prev, replyMsg]);
        if (onToast) onToast('New reply from Kunal Shah (CRED Client)');
      }, 1400);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const textToSend = inputMessage.trim();
    if (!textToSend && !attachmentLink.trim()) {
      inputRef.current?.focus();
      return;
    }

    const currentAuthorName =
      currentUserRole === 'freelancer'
        ? 'Arjun Verma'
        : currentUserRole === 'team_member'
        ? 'Riya Sharma'
        : 'Kunal Shah';

    const currentAuthorTitle =
      currentUserRole === 'freelancer'
        ? 'Lead Director (Freelancer)'
        : currentUserRole === 'team_member'
        ? 'Video Editor'
        : 'CRED Founder (Client)';

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      authorRole: currentUserRole,
      authorName: currentAuthorName,
      authorTitle: currentAuthorTitle,
      text: textToSend || 'Shared project attachment asset.',
      fileAttachment: attachmentLink.trim() || undefined,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setAttachmentLink('');
    setShowAttachMenu(false);

    if (onToast) {
      onToast(`Message sent as ${currentAuthorName}!`);
    }

    // Trigger auto-reply from the other perspective
    triggerAutoReply(textToSend, currentUserRole);
  };

  const handleSendQuickPrompt = (promptText: string, attachment?: string) => {
    setInputMessage(promptText);
    if (attachment) setAttachmentLink(attachment);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCopyAttachment = (link: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://${link}`);
      if (onToast) {
        onToast(`Copied asset link: ${link}`);
      }
    }
  };

  const handleClearHistory = () => {
    setMessages(DEFAULT_MESSAGES);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('paidflow_project_chat_v3');
    }
    if (onToast) {
      onToast('Reset chat thread to benchmark state');
    }
  };

  // Dynamic role UI themes
  const perspectiveBadge =
    currentUserRole === 'freelancer'
      ? { label: 'Viewing as Freelancer (Arjun)', pillColor: 'bg-indigo-50 text-indigo-700 border-indigo-200', btnColor: 'bg-indigo-600 hover:bg-indigo-700', bubbleBg: 'bg-indigo-600' }
      : currentUserRole === 'client'
      ? { label: 'Viewing as Client (Kunal Shah)', pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', btnColor: 'bg-emerald-600 hover:bg-emerald-700', bubbleBg: 'bg-emerald-600' }
      : { label: 'Viewing as Team Member (Riya)', pillColor: 'bg-amber-50 text-amber-800 border-amber-200', btnColor: 'bg-amber-600 hover:bg-amber-700', bubbleBg: 'bg-amber-600' };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Project Chat & Files</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${perspectiveBadge.pillColor}`}>
              {perspectiveBadge.label}
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">CRED Pulse: 30s Brand Video & Teaser</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className="text-[10px] text-slate-400 hover:text-slate-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
            title="Reset Chat"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Messages Thread Container (Dynamically evaluates 1st-person vs 3rd-person) */}
      <div className="space-y-3.5 mb-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
        {messages.map((msg) => {
          // Dynamic 1st-person check based on CURRENT ACTIVE PERSPECTIVE!
          const is1stPerson = msg.authorRole === currentUserRole;

          if (is1stPerson) {
            // 1st PERSON MESSAGE -> Appears on the RIGHT in current role's theme color!
            return (
              <div key={msg.id} className="flex flex-col items-end">
                <div
                  className={`max-w-[85%] text-white rounded-2xl rounded-tr-xs p-3.5 sm:p-4 shadow-2xs ${perspectiveBadge.bubbleBg}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-[11px] font-bold opacity-90">
                      You ({msg.authorName})
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>

                  {msg.fileAttachment && (
                    <button
                      type="button"
                      onClick={() => handleCopyAttachment(msg.fileAttachment!)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white font-mono text-[11px] rounded-xl border border-white/30 transition-colors cursor-pointer"
                      title="Click to copy link"
                    >
                      <Icons.Link2 className="w-3.5 h-3.5 opacity-80" />
                      <span>{msg.fileAttachment}</span>
                      <Icons.Copy className="w-3 h-3 opacity-80 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            );
          } else {
            // 3rd PERSON MESSAGE -> Appears on the LEFT in light gray card with author details!
            return (
              <div key={msg.id} className="flex flex-col items-start">
                <div className="max-w-[85%] bg-slate-50 border border-slate-200/90 text-slate-800 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-2xs">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-800">
                        {msg.authorName}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                          msg.authorRole === 'client'
                            ? 'bg-emerald-100 text-emerald-800'
                            : msg.authorRole === 'team_member'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {msg.authorRole === 'client' ? 'Client' : msg.authorRole === 'team_member' ? 'Editor' : 'Freelancer'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-800 whitespace-pre-line">
                    {msg.text}
                  </p>

                  {msg.fileAttachment && (
                    <button
                      type="button"
                      onClick={() => handleCopyAttachment(msg.fileAttachment!)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                      title="Click to copy asset link"
                    >
                      <Icons.Link2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{msg.fileAttachment}</span>
                      <Icons.Copy className="w-3 h-3 text-slate-400 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            );
          }
        })}

        {/* Real-time Typing indicator */}
        {isTyping && (
          <div className="flex flex-col items-start animate-in fade-in">
            <div className="bg-slate-100 text-slate-600 rounded-2xl rounded-tl-xs px-4 py-2.5 flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">{typingAuthor}</span>
              <span className="text-slate-400">is typing</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Role-Specific Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none text-[11px]">
        {currentUserRole === 'freelancer' && (
          <>
            <button
              type="button"
              onClick={() =>
                handleSendQuickPrompt(
                  'Rough cut animation pass v2 is uploaded for review!',
                  'drive.link/cred-cut-v2.mp4'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold shrink-0 transition-colors"
            >
              🚀 Share Render Pass
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendQuickPrompt(
                  'Milestone 2 UPI tranche invoice is generated: ₹1,45,000 for final DaVinci master sign-off.'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold shrink-0 border border-emerald-100 transition-colors"
            >
              💳 Share UPI Invoice
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendQuickPrompt(
                  'Could you please share the brand guidelines PDF so we can lock color space?'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold shrink-0 border border-amber-100 transition-colors"
            >
              📋 Request Assets
            </button>
          </>
        )}

        {currentUserRole === 'client' && (
          <>
            <button
              type="button"
              onClick={() =>
                handleSendQuickPrompt(
                  'Approved the v2 DaVinci color master & audio stems! Looks stunning.'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold shrink-0 border border-emerald-200 transition-colors"
            >
              ✅ Approve v2 Motion Teaser
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendQuickPrompt(
                  'Cleared ₹1,45,000 UPI tranche payment to 9079879010@fam via CRED Treasury desk.'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold shrink-0 border border-indigo-200 transition-colors"
            >
              💳 Clear Milestone Tranche
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendQuickPrompt(
                  'Shared the updated sound stems and 4K assets in Google Drive.',
                  'drive.link/cred-4k-stems.zip'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold shrink-0 transition-colors"
            >
              📁 Share 4K Stems
            </button>
          </>
        )}

        {currentUserRole === 'team_member' && (
          <>
            <button
              type="button"
              onClick={() =>
                handleSendQuickPrompt(
                  'Color pass export is finished and ready for Arjun’s lead sign-off.',
                  'drive.link/color-pass-v2.xml'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold shrink-0 border border-amber-200 transition-colors"
            >
              ✂️ Export Complete
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendQuickPrompt('Ready for lead review before client presentation.')
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold shrink-0 transition-colors"
            >
              👀 Ready for Review
            </button>
          </>
        )}
      </div>

      {/* Attachment Form (Toggled via Paperclip) */}
      {showAttachMenu && (
        <div className="mb-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs animate-in fade-in">
          <Icons.Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Paste Google Drive, Figma, or file link (e.g. drive.link/render_v2.mp4)..."
            value={attachmentLink}
            onChange={(e) => setAttachmentLink(e.target.value)}
            className="flex-1 bg-transparent outline-none text-xs text-slate-800 placeholder:text-slate-400"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowAttachMenu(false)}
            className="text-slate-400 hover:text-slate-700 px-1 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Input Row */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
            showAttachMenu || attachmentLink
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
          }`}
          title="Attach File or Link"
        >
          <Icons.Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder={
            currentUserRole === 'client'
              ? 'Write a message to Arjun & team as Kunal Shah...'
              : currentUserRole === 'team_member'
              ? 'Write an update as Riya (Editor)...'
              : 'Write a message to client as Arjun...'
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
        />

        <button
          type="submit"
          className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all text-white active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shrink-0 ${perspectiveBadge.btnColor}`}
        >
          <span>
            {currentUserRole === 'client'
              ? 'Send as Kunal'
              : currentUserRole === 'team_member'
              ? 'Send as Riya'
              : 'Send as Arjun'}
          </span>
          <Icons.Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
