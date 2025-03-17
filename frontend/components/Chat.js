'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage,
      });

      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.',
          error: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Chat with the 3D Printing Pro AI Assistant</h1>

      <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded-md bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-black text-center mt-10">
            Send a message to start the conversation
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded-lg ${
                message.role === 'user' ? 'bg-blue-100 border border-blue-300 ml-10' : 'bg-white mr-10 border border-gray-300'} ${message.error ? 'border-red-500 text-red-500' : ''}`}
            >
              <div className="text-black font-bold mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="text-black whitespace-pre-wrap">{message.content}</div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-center p-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;