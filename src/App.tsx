/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Message, streamMessage } from './lib/gemini';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { AnimatePresence } from 'motion/react';
import { Bot, Plus } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    const userMsgId = crypto.randomUUID();
    const modelMsgId = crypto.randomUUID();
    
    const newMessages = [
      ...messages,
      { id: userMsgId, role: 'user' as const, text }
    ];
    
    setMessages([
      ...newMessages,
      { id: modelMsgId, role: 'model', text: '', isStreaming: true }
    ]);
    
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      const generator = streamMessage(messages, text);
      
      let fullText = '';
      for await (const chunk of generator) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, text: fullText } 
            : msg
        ));
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));
      
    } catch (e) {
      console.error(e);
      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId 
          ? { ...msg, text: msg.text + '\n\n**Error:** An error occurred while communicating with the model.', isStreaming: false, isError: true } 
          : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'model') {
            return prev.map(m => m.id === lastMsg.id ? { ...m, isStreaming: false } : m);
        }
        return prev;
    });
  };

  const handleNewChat = () => {
    handleStop();
    setMessages([]);
  };

  return (
    <div className="w-full h-screen bg-[#F8F9FA] flex overflow-hidden font-sans text-[#1F1F1F] dark:bg-[#09090b] dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-[#E5E7EB] hidden md:flex flex-col shrink-0 dark:bg-[#18181b] dark:border-gray-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Bot size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">Gemini Studio</span>
          </div>
          
          <button 
            onClick={handleNewChat}
            className="w-full py-3 px-4 bg-[#F0F4F8] hover:bg-[#E1E7EF] transition-colors rounded-xl flex items-center gap-3 text-sm font-medium text-blue-700 mb-6 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400"
          >
            <Plus size={18} strokeWidth={2} />
            New Conversation
          </button>

          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Recent Chats</p>
            <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 font-medium cursor-pointer dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 truncate">Frontend Design Strategy</div>
            <div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer dark:text-gray-400 dark:hover:bg-gray-800/50 truncate">API Integration logic</div>
            <div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer dark:text-gray-400 dark:hover:bg-gray-800/50 truncate">Tailwind Configuration</div>
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-[#E5E7EB] dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs border border-orange-200 dark:bg-orange-900/30 dark:border-orange-800/50 dark:text-orange-400 shrink-0">JD</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">John Developer</p>
              <p className="text-[11px] text-gray-400 truncate">Pro Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-[#E5E7EB] bg-white flex items-center justify-between px-4 md:px-8 dark:bg-[#18181b] dark:border-gray-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-tighter shrink-0 dark:bg-green-900/30 dark:text-green-400">Gemini 3.1 Pro</span>
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate hidden sm:block">/ New Conversation</h2>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <a href="https://aistudio.google.com/app/prompts/new_chat" target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-medium hover:underline dark:text-blue-400">Open in AI Studio</a>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 hidden sm:block dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">Share</button>
          </div>
        </header>

        {/* Chat Viewport */}
        <div 
          ref={listRef}
          className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center opacity-80 transition-opacity animate-in fade-in duration-700">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl shadow-blue-500/20">
                <Bot className="h-8 w-8" />
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-center text-gray-800 dark:text-gray-100">
                How can I help you today?
              </h1>
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 bg-[#F8F9FA] dark:bg-[#09090b] shrink-0 border-t border-[#E5E7EB] dark:border-gray-800 md:border-t-0">
          <ChatInput 
            onSend={handleSend} 
            disabled={isGenerating} 
            isGenerating={isGenerating} 
            onStop={handleStop} 
          />
        </div>
      </main>

      {/* Right Controls (Bento Style) */}
      <aside className="w-[280px] bg-white border-l border-[#E5E7EB] p-6 hidden lg:flex flex-col shrink-0 dark:bg-[#18181b] dark:border-gray-800 overflow-y-auto">
        <h3 className="text-sm font-bold mb-6">Model Settings</h3>
        
        <div className="grid gap-4">
          {/* Parameter Card */}
          <div className="p-4 bg-[#F9FAFB] rounded-xl border border-gray-100 dark:bg-[#09090b] dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Temperature</span>
              <span className="text-xs font-mono text-gray-800 dark:text-gray-300">0.7</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800">
              <div className="h-full bg-blue-500 w-[70%]"></div>
            </div>
          </div>

          {/* Parameter Card */}
          <div className="p-4 bg-[#F9FAFB] rounded-xl border border-gray-100 dark:bg-[#09090b] dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Top K</span>
              <span className="text-xs font-mono text-gray-800 dark:text-gray-300">40</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800">
              <div className="h-full bg-purple-500 w-[40%]"></div>
            </div>
          </div>

          {/* Safety Section */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm mt-4 dark:bg-[#18181b] dark:border-gray-800 dark:shadow-none">
            <p className="text-xs font-bold mb-3">Safety Settings</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Harassment</span>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded text-gray-600 dark:bg-gray-800 dark:text-gray-400">Medium</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Hate Speech</span>
                <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded dark:bg-green-900/30 dark:text-green-400">Low</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Sexually Explicit</span>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded text-gray-600 dark:bg-gray-800 dark:text-gray-400">Medium</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-block p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl dark:bg-blue-900/10 dark:border-blue-800/50">
              <p className="text-[10px] text-blue-400">Integration Active</p>
              <p className="text-xs font-bold text-blue-700 uppercase mt-1 tracking-widest dark:text-blue-500">Connected</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
