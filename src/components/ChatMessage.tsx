import { Message } from '../lib/gemini';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';
import { motion } from 'motion/react';

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 max-w-[85%] md:max-w-[80%]",
        isUser && "self-end flex-row-reverse"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shrink-0 mt-1",
        isUser ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400" : "bg-blue-600 text-white"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={cn(
        "p-5 rounded-2xl shadow-sm leading-relaxed overflow-x-auto",
        isUser 
          ? "bg-blue-600 text-white rounded-tr-none dark:bg-blue-600" 
          : "bg-white border border-[#E5E7EB] rounded-tl-none text-gray-800 dark:bg-[#18181b] dark:border-gray-800 dark:text-gray-200"
      )}>
        <div className={cn(
          "prose prose-sm max-w-none break-words dark:prose-invert",
          isUser && "text-white prose-invert prose-p:text-white prose-headings:text-white prose-a:text-blue-200",
          message.isError && "text-red-500 dark:text-red-400"
        )}>
          <Markdown remarkPlugins={[remarkGfm]}>
            {message.text}
          </Markdown>
          {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 align-middle bg-blue-400 animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
