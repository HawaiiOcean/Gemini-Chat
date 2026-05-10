import { FormEvent, useRef, useState, useEffect } from 'react';
import { SendHorizonal, StopCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  isGenerating: boolean;
  onStop: () => void;
}

export function ChatInput({ onSend, disabled, isGenerating, onStop }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full relative">
      <form
        onSubmit={handleSubmit}
        className="relative w-full"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini anything..."
          className="block max-h-[200px] min-h-[56px] w-full p-4 pr-16 bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm resize-none text-[#1F1F1F] dark:bg-[#18181b] dark:border-gray-800 dark:text-gray-100 placeholder-gray-400 transition-shadow"
          disabled={disabled && !isGenerating}
          rows={3}
        />
        
        {isGenerating ? (
          <button
            type="button"
            onClick={onStop}
            className="absolute bottom-4 right-4 p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 shadow-sm transition-all dark:bg-gray-800 dark:text-gray-400 flex items-center justify-center h-8 w-8"
          >
            <StopCircle size={16} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:bg-blue-400 flex items-center justify-center h-8 w-8 shrink-0"
          >
            <SendHorizonal size={16} />
          </button>
        )}
      </form>
      <p className="text-center text-[10px] text-gray-400 mt-4">Gemini may display inaccurate info, so double-check its responses.</p>
    </div>
  );
}
