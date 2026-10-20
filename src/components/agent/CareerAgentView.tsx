import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Bookmark,
  FileEdit,
  RotateCcw
} from 'lucide-react';
import { AgentMessage, ParsedResume } from '../../types';
import { careerAgentService, ToolExecutionResult } from '../../services/agentTools';

interface CareerAgentViewProps {
  userId: string;
  activeResume: ParsedResume | null;
  onOpenTailorModal?: (jobIdOrTitle: string) => void;
}

const INITIAL_MESSAGES: AgentMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'agent',
    content: `Hello! I am your **ResumeAI Career Agent**. I am directly connected to your active resume profile, job match ranking pipeline, and application tracker.\n\nAsk me to find jobs, explain matching scores, detect skill gaps, or draft tailored materials!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

const SUGGESTED_PROMPTS = [
  'Find data analyst & machine learning jobs that match my resume.',
  'Explain why Nexus AI Labs matches my skills.',
  'Identify the skills I am missing for Senior Backend Engineer.',
  'Draft a tailored cover letter for Apex Cloud Solutions.',
  'Show my current application tracker pipeline status.',
  'Save Machine Learning Engineer at Nexus AI Labs to my list.'
];

export const CareerAgentView: React.FC<CareerAgentViewProps> = ({
  userId,
  activeResume
}) => {
  const [messages, setMessages] = useState<AgentMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isProcessing) return;

    const userMsg: AgentMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const { responseText, toolResult } = await careerAgentService.handleUserMessage(
        text,
        activeResume,
        userId
      );

      const agentMsg: AgentMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCall: toolResult ? {
          toolName: toolResult.toolName,
          params: { query: text },
          status: toolResult.success ? 'success' : 'failed',
          result: toolResult.data
        } : undefined
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: AgentMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        content: `Error executing task: ${err?.message || 'Unknown agent execution failure.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Agent Header */}
      <div className="p-4 px-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">ResumeAI Autonomous Career Agent</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active Candidate Context: <span className="text-indigo-300 font-medium">{activeResume ? activeResume.name : 'No active resume'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Prompts Banner */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs whitespace-nowrap min-w-max">
          <span className="text-slate-500 font-semibold flex items-center gap-1 pl-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Suggestions:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-full bg-slate-800/90 hover:bg-indigo-600/20 border border-slate-700/80 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 text-xs transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-1.5 flex-1">
                {/* Tool Invocation Badge */}
                {msg.toolCall && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    <span>Executed tool:</span>
                    <strong className="text-white">{msg.toolCall.toolName}</strong>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-1" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>

                <div className={`text-[10px] text-slate-500 px-1 ${isUser ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-start gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              <span>Analyzing intent and executing backend function...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Career Agent (e.g. 'Identify skill gaps for ML Engineer', 'Draft cover letter for Nexus AI Labs')..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl transition shadow-lg shadow-indigo-600/25 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
