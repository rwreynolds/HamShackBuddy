'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';


// Define types for our messages
interface Message {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
  timestamp?: Date;
}

// Component props type
interface ChatProps {
  assistantName?: string;
}

const Chat: React.FC<ChatProps> = ({ assistantName = "HAM Shack Buddy" }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat with timestamp
    setMessages((prev) => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage,
      });

      // Add assistant response to chat with timestamp
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.',
          error: true,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp to a readable string
  const formatTime = (date?: Date): string => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-200">{assistantName}</h1>

      <div className="flex-1 overflow-y-auto mb-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50 shadow-sm">
        {messages.length === 0 ? (
          <div className="text-gray-600 text-center mt-10">
            Send a message to start the conversation
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-4 rounded-lg shadow ${
                message.role === 'user' 
                  ? 'bg-blue-50 border-2 border-blue-200 ml-10' 
                  : 'bg-white border-2 border-gray-300 mr-10'
              } ${message.error ? 'border-red-400 bg-red-50' : ''}`}
            >
              <div className="flex justify-between mb-2">
                <div className="font-bold text-gray-800">
                  {message.role === 'user' ? 'You' : assistantName}
                </div>
                <div className="text-xs text-gray-600">
                  {formatTime(message.timestamp)}
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-gray-900">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // @ts-expect-error xxx
                    code({inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        // @ts-expect-error xxx
                        <SyntaxHighlighter
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          style={tomorrow as any}
                          language={match[1]}
                          PreTag="div"
                          className="rounded border border-gray-300 my-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={`${className} px-1 py-0.5 bg-gray-100 rounded text-gray-900`} {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({children}) => <p className="mb-2 text-gray-900">{children}</p>,
                    ul: ({children}) => <ul className="list-disc pl-5 mb-2 text-gray-900">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-5 mb-2 text-gray-900">{children}</ol>,
                    li: ({children}) => <li className="mb-1 text-gray-900">{children}</li>,
                    h1: ({children}) => <h1 className="text-xl font-bold mb-2 mt-3 text-gray-900">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-bold mb-2 mt-3 text-gray-900">{children}</h2>,
                    h3: ({children}) => <h3 className="text-md font-bold mb-1 mt-3 text-gray-900">{children}</h3>,
                    a: ({href, children}) => <a href={href} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-3 italic my-2 text-gray-700">{children}</blockquote>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-center p-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <div className="mt-2 text-gray-700">Generating response...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          placeholder="Type your message... (Markdown supported)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 font-medium shadow-sm"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>

      <div className="text-xs text-gray-400 mt-2 text-center">
        Supports Markdown: **bold**, *italic*, `code`, ```code blocks```, # headings, and more
      </div>
    </div>
  );
};

export default Chat;