import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChatInterface } from './ChatInterface';

// Replace with your deployed contract address and ABI
const DISPUTE_CONTRACT_ADDRESS = '0xYourDisputeContractAddress';
const DISPUTE_CONTRACT_ABI: any[] = [
  // ... ABI here ...
];

const CATEGORIES = [
  'NFT Trade',
  'Escrow',
  'DeFi',
  'Other',
];


const DisputePage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [txHash, setTxHash] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  // const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  // const [evidenceCid, setEvidenceCid] = useState('');
  const fee = '0.01'; // ETH, example
  const [submitting, setSubmitting] = useState(false);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      toast.error('MetaMask not found.');
      return;
    }
    try {
      const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
      await ethProvider.send('eth_requestAccounts', []);
      const signer = await ethProvider.getSigner();
      setWalletAddress(await signer.getAddress());
      setProvider(ethProvider);
      setContract(new ethers.Contract(DISPUTE_CONTRACT_ADDRESS, DISPUTE_CONTRACT_ABI, signer));
      toast.success('Wallet connected!');
    } catch (err) {
      toast.error('Wallet connection failed.');
    }
  };

  // Evidence upload removed

  // Submit dispute
  const submitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !contract) {
      toast.error('Connect your wallet first.');
      return;
    }
    if (!txHash || !contractAddress || !description) {
      toast.error('Fill all required fields.');
      return;
    }
    setSubmitting(true);
    // Evidence upload removed
    try {
      setShowPayment(true);
      // Wait for payment modal to complete
    } finally {
      setSubmitting(false);
    }
  };

  // Pay dispute fee and call contract
  const payAndSubmit = async () => {
    if (!contract) return;
    try {
      const tx = await contract.raiseDispute(
        txHash,
        contractAddress,
        description,
        category,
        '', // evidenceCid removed
        { value: ethers.parseEther(fee) }
      );
      toast.info('Submitting dispute...');
      await tx.wait();
      toast.success('Dispute submitted!');
      setShowPayment(false);
      fetchDisputes();
    } catch (err) {
      toast.error('Dispute submission failed.');
    }
  };

  // Fetch user's disputes
  const fetchDisputes = async () => {
    if (!contract || !walletAddress) return;
    try {
      const userDisputes = await contract.getUserDisputes(walletAddress);
      setDisputes(userDisputes);
    } catch (err) {
      setDisputes([]);
    }
  };

  useEffect(() => {
    if (contract && walletAddress) fetchDisputes();
    // eslint-disable-next-line
  }, [contract, walletAddress]);

  // UI
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastContainer />
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Raise a Dispute</h1>
        {!walletAddress ? (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        ) : (
          <div className="mb-4 text-sm text-gray-700">Connected: {walletAddress}</div>
        )}
        <form onSubmit={submitDispute} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            placeholder="Transaction Hash"
            value={txHash}
            onChange={e => setTxHash(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Contract Address"
            value={contractAddress}
            onChange={e => setContractAddress(e.target.value)}
            required
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Describe your dispute"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <select
            className="w-full border p-2 rounded"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {/* Evidence upload removed */}
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={submitting}
          >
            Submit Dispute
          </button>
        </form>
        {showPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-sm w-full">
              <h2 className="text-lg font-bold mb-2">Pay Dispute Fee</h2>
              <p className="mb-4">Fee: {fee} ETH</p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                onClick={payAndSubmit}
              >
                Pay & Submit
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowPayment(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Your Disputes</h2>
          <div className="space-y-2">
            {disputes.length === 0 && <div>No disputes found.</div>}
            {disputes.map((d, i) => (
              <div key={i} className="border rounded p-3 bg-gray-100 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">{d.category}</div>
                  <div className="text-xs text-gray-600">{d.txHash}</div>
                  <div className="text-xs text-gray-600">Status: {d.status}</div>
                </div>
                <button
                  className="mt-2 md:mt-0 bg-indigo-600 text-white px-3 py-1 rounded"
                  onClick={() => setShowChat(true)}
                >
                  View/Chat
                </button>
              </div>
            ))}
          </div>
        </div>
        {showChat && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-2xl w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setShowChat(false)}
              >
                ✕
              </button>
              <ChatInterface />
            </div>
          </div>
        )}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Help & FAQ</h2>
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
    </div>
  );
};

export default DisputePage;
