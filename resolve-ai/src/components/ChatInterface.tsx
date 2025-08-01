import React, { useState, useRef, useEffect } from 'react';
import { blockchainService } from '../utils/blockchain';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  onAnalyzeTransaction?: (txHash: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onAnalyzeTransaction }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your Web3 dispute resolution assistant powered by Alith. I can help you analyze transactions, investigate NFT trades, and resolve DeFi issues. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get a client_id from backend and open WebSocket
  useEffect(() => {
    fetch('http://localhost:8000/start_chat')
      .then((res) => res.json())
      .then((data) => {
        const ws = new WebSocket(`ws://localhost:8000/ws?client_id=${data.client_id}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: event.data,
              sender: 'ai',
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        };

        ws.onerror = () => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: 'Error communicating with AI backend.',
              sender: 'ai',
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        };
      });

    return () => {
      wsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const extractTransactionHash = (text: string): string | null => {
    const txHashRegex = /0x[a-fA-F0-9]{64}/;
    const match = text.match(txHashRegex);
    return match ? match[0] : null;
  };

  const formatTransactionInfo = (txInfo: any): string => {
    return `
**Transaction Analysis:**
- Hash: ${txInfo.hash}
- Status: ${txInfo.status}
- From: ${txInfo.from}
- To: ${txInfo.to}
- Value: ${txInfo.value} ETH
- Gas Price: ${txInfo.gasPrice} gwei
- Block: ${txInfo.blockNumber}
- Timestamp: ${new Date(txInfo.timestamp * 1000).toLocaleString()}
    `.trim();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !wsRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let contextualMessage = inputValue;
    const txHash = extractTransactionHash(inputValue);

    if (txHash) {
      const txInfo = await blockchainService.getTransactionInfo(txHash);
      if (txInfo) {
        const formattedTxInfo = formatTransactionInfo(txInfo);
        contextualMessage = `${inputValue}\n\n${formattedTxInfo}`;
        onAnalyzeTransaction?.(txHash);
      }
    }

    // Add conversation context to the message
    const recentMessages = messages.slice(-4);
    if (recentMessages.length > 0) {
      const conversationContext = recentMessages
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      contextualMessage = `Previous conversation:\n${conversationContext}\n\nNew message: ${contextualMessage}`;
    }

    wsRef.current.send(contextualMessage);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: 'Chat cleared. How can I help you with your Web3 dispute resolution needs?',
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-resolve-accent rounded-full animate-pulse"></div>
          <h2 className="text-xl font-semibold text-white">ResolveAI Assistant</h2>
          <span className="px-2 py-1 text-xs bg-resolve-accent/20 text-resolve-accent rounded-full">
            Powered by Alith
          </span>
        </div>
        <button
          onClick={clearChat}
          className="px-3 py-1 text-sm text-gray-400 hover:text-resolve-accent transition-colors"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-gray-800">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-resolve-accent to-resolve-accent-dark text-gray-900 shadow-lg'
                  : 'bg-gray-800 text-gray-100 border border-gray-700 shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <div className={`text-xs mt-2 ${
                message.sender === 'user' ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-md">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-resolve-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-resolve-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-resolve-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-gray-400 text-sm ml-2">AI is analyzing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="flex space-x-3">
          <input
            ref={null}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about a transaction, NFT trade, or DeFi issue... (e.g., 'Analyze this transaction: 0x123...')"
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-resolve-accent focus:border-resolve-accent transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-resolve-accent to-resolve-accent-dark hover:from-resolve-accent-dark hover:to-resolve-accent disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 rounded-lg transition-all font-medium shadow-lg transform hover:scale-105 active:scale-95"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500">
            💡 Tip: Include transaction hashes (0x...) for automatic blockchain analysis
          </div>
          <div className="text-xs text-resolve-accent">
            Sepolia Testnet • Web3 Dispute Resolution
          </div>
        </div>
      </div>
    </div>
  );
};