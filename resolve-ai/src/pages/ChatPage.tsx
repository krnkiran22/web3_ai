import React, { useState } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { blockchainService } from '../utils/blockchain';

export const ChatPage: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<{
    latestBlock: number;
    isConnected: boolean;
  }>({ latestBlock: 0, isConnected: false });

  React.useEffect(() => {
    // Check network status on component mount
    const checkNetworkStatus = async () => {
      try {
        const latestBlock = await blockchainService.getLatestBlock();
        setNetworkStatus({ latestBlock, isConnected: true });
      } catch (error) {
        console.error('Network connection failed:', error);
        setNetworkStatus({ latestBlock: 0, isConnected: false });
      }
    };

    checkNetworkStatus();
    
    // Update network status every 30 seconds
    const interval = setInterval(checkNetworkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyzeTransaction = (txHash: string) => {
    setSelectedTransaction(txHash);
  };

  const exampleQueries = [
    "Analyze this failed NFT trade: 0x123...",
    "Why did my DeFi transaction fail?",
    "Check if this smart contract is legitimate",
    "Investigate suspicious wallet activity",
    "Help me understand this gas fee issue"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-resolve-accent to-resolve-accent-dark rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-gray-900 font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ResolveAI</h1>
                <p className="text-sm text-resolve-accent">Web3 Dispute Resolution Assistant</p>
              </div>
            </div>
            
            {/* Network Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  networkStatus.isConnected ? 'bg-resolve-accent' : 'bg-red-400'
                }`}></div>
                <span className="text-sm text-gray-300">
                  {networkStatus.isConnected 
                    ? `Sepolia • Block ${networkStatus.latestBlock}`
                    : 'Disconnected'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors">
                  <div className="text-white font-medium">Transaction Analysis</div>
                  <div className="text-sm text-gray-400">Analyze blockchain transactions</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors">
                  <div className="text-white font-medium">NFT Verification</div>
                  <div className="text-sm text-gray-400">Verify NFT authenticity</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors">
                  <div className="text-white font-medium">DeFi Investigation</div>
                  <div className="text-sm text-gray-400">Investigate DeFi protocols</div>
                </button>
              </div>
            </div>

            {/* Example Queries */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Example Queries</h3>
              <div className="space-y-2">
                {exampleQueries.map((query, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-400 p-2 bg-gray-700/30 rounded cursor-pointer hover:bg-gray-600/30 transition-colors"
                    onClick={() => {
                      // You could implement auto-filling the chat input here
                      console.log('Example query clicked:', query);
                    }}
                  >
                    "{query}"
                  </div>
                ))}
              </div>
            </div>

            {/* Current Analysis */}
            {selectedTransaction && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Current Analysis</h3>
                <div className="text-sm">
                  <div className="text-gray-400">Transaction Hash:</div>
                  <div className="text-white font-mono text-xs break-all">
                    {selectedTransaction}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="h-full">
              <ChatInterface onAnalyzeTransaction={handleAnalyzeTransaction} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Powered by Groq AI • Connected to Sepolia Testnet
            </div>
            <div className="text-sm text-gray-400">
              Built for Web3 Dispute Resolution
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
