'use client';

import { useState } from 'react';
import axios from 'axios';

// This is a minimal version to isolate the API issue
const MinimalChat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Using the exact request format from the original
      console.log('Sending request with message:', input);

      const result = await axios.post('http://localhost:5000/api/chat', {
        message: input.trim(),
      });

      console.log('Response received:', result.data);
      setResponse(result.data.response || 'No response content');
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to get response from the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Test API Connection</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="Enter a message"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Test Message'}
        </button>
      </form>

      {error && (
        <div className="p-2 mb-4 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      {response && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default MinimalChat;