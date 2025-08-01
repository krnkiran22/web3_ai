import React from 'react';


export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Help & FAQ</h1>
        <details className="mb-2">
          <summary className="font-semibold cursor-pointer">How do I connect my wallet?</summary>
          <div className="text-sm text-gray-700">Click the "Connect Wallet" button and approve the connection in MetaMask or WalletConnect.</div>
        </details>
        <details className="mb-2">
          <summary className="font-semibold cursor-pointer">What evidence can I upload?</summary>
          <div className="text-sm text-gray-700">You can upload PDFs or images (screenshots, receipts, etc.) as evidence. Files are stored on IPFS.</div>
        </details>
        <details className="mb-2">
          <summary className="font-semibold cursor-pointer">How do I pay the dispute fee?</summary>
          <div className="text-sm text-gray-700">After filling the dispute form, a payment modal will appear. Confirm the transaction in your wallet to pay the fee and submit the dispute.</div>
        </details>
        <details>
          <summary className="font-semibold cursor-pointer">Need more help?</summary>
          <div className="text-sm text-gray-700">Use the chat button on your dispute to talk to our AI assistant for guidance.</div>
        </details>
      </div>
    </div>
  );
}
