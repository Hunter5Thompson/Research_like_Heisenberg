import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Paper } from '../types';
import { Send, Bot, User, Search, Loader2, ExternalLink } from 'lucide-react';
import { generateRagResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Props {
  collectedPapers: Paper[];
}

export const RagChat: React.FC<Props> = ({ collectedPapers }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: collectedPapers.length > 0 
        ? `I have access to your collection of ${collectedPapers.length} papers. Ask me anything about them, or ask me to search for more details.` 
        : "Your collection is empty. Go to the 'Discover' tab to find papers from Heisenberg, Pauli, or Schrödinger first."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate thinking state
    const thinkingId = 'thinking-' + Date.now();
    setMessages(prev => [...prev, { id: thinkingId, role: 'model', text: '', isThinking: true }]);

    try {
      const response = await generateRagResponse(messages.concat(userMsg), collectedPapers, userMsg.text);
      
      setMessages(prev => prev.filter(m => m.id !== thinkingId).concat({
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        sources: response.sources
      }));
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== thinkingId).concat({
        id: 'error',
        role: 'model',
        text: "Sorry, I couldn't process that request."
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <Bot className="text-blue-400" /> Assistant
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          {collectedPapers.length} Papers in Context
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] rounded-2xl p-4 
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}
            `}>
              {msg.isThinking ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="animate-spin w-4 h-4" /> Analyzing Quantum Archives...
                </div>
              ) : (
                <>
                  <div className="prose prose-invert prose-sm">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-slate-500 font-bold mb-2 flex items-center gap-1">
                        <Search size={12} /> GROUNDED SOURCES
                      </p>
                      <div className="space-y-1">
                        {msg.sources.map((src, idx) => (
                          <a 
                            key={idx} 
                            href={src.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block text-xs text-blue-400 hover:text-blue-300 truncate flex items-center gap-1"
                          >
                            <ExternalLink size={10} /> {src.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={collectedPapers.length === 0 ? "Collect papers first to enable full context..." : "Ask about the collected papers..."}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};