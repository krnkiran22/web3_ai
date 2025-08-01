import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChatInterface } from "./ChatInterface";

// Replace with your deployed contract address and ABI
const DISPUTE_CONTRACT_ADDRESS = "0xYourDisputeContractAddress";
const DISPUTE_CONTRACT_ABI: any[] = [
  // ... ABI here ...
];

// Pinata configuration
const PINATA_API_KEY = "054159cdf22f9af8e68e";
const PINATA_SECRET_API_KEY =
  "3e27a4fef7b5ab6c0a3cd15a2036a65deba0f224c70332e1170e3e7fe6ba7ccf";
const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwMWYyMzg4Zi0xMTY3LTQ0OGYtYTJkYi0yNjFjMTY2ZDYwMzUiLCJlbWFpbCI6Imdva2t1bGwwNEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMDU0MTU5Y2RmMjJmOWFmOGU2OGUiLCJzY29wZWRLZXlTZWNyZXQiOiIzZTI3YTRmZWY3YjVhYjZjMGEzY2QxNWEyMDM2YTY1ZGViYTBmMjI0YzcwMzMyZTExNzBlM2U3ZmU2YmE3Y2NmIiwiZXhwIjoxNzg1NTU2NTI1fQ.a2PBwGcqua0Mg1YrgfkHU7xmFkAj6EIJBpd1uCcBJEE";

const FORM_STEPS = [
  { id: 1, title: "Transaction Hash", icon: "🔗" },
  { id: 2, title: "Describe Issue", icon: "📝" },
  { id: 3, title: "Upload Proof", icon: "📸" },
  { id: 4, title: "Contract Details", icon: "📋" },
  { id: 5, title: "Review & Store", icon: "💾" },
];

const DisputePage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Form data
  const [txHash, setTxHash] = useState("");
  const [description, setDescription] = useState("");
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [contractAddress, setContractAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showDisputes, setShowDisputes] = useState(false);
  const [showIpfsSuccess, setShowIpfsSuccess] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [uploadingToIpfs, setUploadingToIpfs] = useState(false);

  // Upload file to Pinata IPFS
  const uploadFileToPinata = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: "dispute-evidence",
        timestamp: new Date().toISOString(),
      },
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload file to IPFS");
    }

    const result = await response.json();
    return result.IpfsHash;
  };

  // Upload JSON data to Pinata IPFS
  const uploadJsonToPinata = async (jsonData: any): Promise<string> => {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: jsonData,
          pinataMetadata: {
            name: `dispute-${Date.now()}.json`,
            keyvalues: {
              type: "dispute-data",
              timestamp: new Date().toISOString(),
            },
          },
          pinataOptions: {
            cidVersion: 0,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload JSON to IPFS");
    }

    const result = await response.json();
    return result.IpfsHash;
  };

  // Store all dispute data to IPFS
  const storeDisputeDataToIpfs = async (): Promise<string> => {
    setUploadingToIpfs(true);
    try {
      // Upload files first
      const fileHashes: string[] = [];
      for (const file of proofFiles) {
        const fileHash = await uploadFileToPinata(file);
        fileHashes.push(fileHash);
      }

      // Create dispute data object
      const disputeData = {
        txHash,
        description,
        contractAddress,
        recipientAddress,
        evidenceFiles: fileHashes,
        timestamp: new Date().toISOString(),
        submitter: walletAddress,
        version: "1.0",
      };

      // Upload dispute data JSON
      const dataHash = await uploadJsonToPinata(disputeData);
      return dataHash;
    } finally {
      setUploadingToIpfs(false);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      toast.error("MetaMask not found.");
      return;
    }
    try {
      const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
      await ethProvider.send("eth_requestAccounts", []);
      const signer = await ethProvider.getSigner();
      setWalletAddress(await signer.getAddress());
      setProvider(ethProvider);
      setContract(
        new ethers.Contract(
          DISPUTE_CONTRACT_ADDRESS,
          DISPUTE_CONTRACT_ABI,
          signer
        )
      );
      toast.success("Wallet connected!");
    } catch (err) {
      toast.error("Wallet connection failed.");
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProofFiles((prev) => [...prev, ...files]);
  };

  // Remove file
  const removeFile = (index: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return txHash.trim() !== "";
      case 2:
        return description.trim() !== "";
      case 3:
        return true; // Proof is optional
      case 4:
        return recipientAddress.trim() !== ""; // Contract address is optional
      default:
        return true;
    }
  };

  // Go to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, FORM_STEPS.length));
    } else {
      toast.error("Please fill in the required fields");
    }
  };

  // Go to previous step
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit data to IPFS
  const submitToIpfs = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(4)) {
      toast.error("Please complete all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      // Store data to IPFS
      toast.info("Uploading data to IPFS...");
      const disputeIpfsHash = await storeDisputeDataToIpfs();
      setIpfsHash(disputeIpfsHash);

      toast.success("Data successfully stored on IPFS!");

      // Show IPFS success modal
      setShowIpfsSuccess(true);

      // Reset form
      setTxHash("");
      setDescription("");
      setProofFiles([]);
      setContractAddress("");
      setRecipientAddress("");
      setCurrentStep(1);
    } catch (error) {
      toast.error("Failed to store data on IPFS. Please try again.");
      console.error("IPFS upload error:", error);
    } finally {
      setSubmitting(false);
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

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔗</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Transaction Hash
              </h2>
              <p className="text-gray-400">
                Enter the transaction hash related to your dispute
              </p>
            </div>
            <div>
              <input
                className="w-full bg-gray-800 border border-gray-600 text-white p-4 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="0x1234567890abcdef..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Describe Your Issue
              </h2>
              <p className="text-gray-400">
                Provide detailed information about your dispute
              </p>
            </div>
            <div>
              <textarea
                className="w-full bg-gray-800 border border-gray-600 text-white p-4 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                placeholder="Describe what happened, what you expected, and what went wrong..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📸</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Upload Proof Photos
              </h2>
              <p className="text-gray-400">
                Add screenshots, receipts, or other evidence (optional)
              </p>
            </div>
            <div>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF (MAX. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                />
              </label>
              {proofFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {proofFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                    >
                      <span className="text-white text-sm">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Contract Details
              </h2>
              <p className="text-gray-400">
                Provide contract and recipient information
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contract Address (Optional)
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-600 text-white p-4 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="0x1234567890abcdef..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Address *
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-600 text-white p-4 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="0x1234567890abcdef..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">💾</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Review & Store
              </h2>
              <p className="text-gray-400">
                Review your data before storing it permanently on IPFS
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Transaction Hash:
                </label>
                <p className="text-white break-all">{txHash}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Description:
                </label>
                <p className="text-white">{description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Proof Files:
                </label>
                <p className="text-white">
                  {proofFiles.length} file(s) uploaded
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Recipient Address:
                </label>
                <p className="text-white break-all">{recipientAddress}</p>
              </div>
              {contractAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-300">
                    Contract Address:
                  </label>
                  <p className="text-white break-all">{contractAddress}</p>
                </div>
              )}
              <div className="border-t border-gray-600 pt-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <span>🌐</span>
                  <span className="text-sm font-medium">
                    Data will be stored permanently on IPFS
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ToastContainer theme="dark" />

      {/* Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">
              🌐 IPFS Data Storage
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {!walletAddress ? (
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                onClick={connectWallet}
              >
                <span>🔗</span>
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <span>✅</span>
                <span className="text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {FORM_STEPS.map((step) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    currentStep >= step.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                {step.id < FORM_STEPS.length && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all duration-200 ${
                      currentStep > step.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">
              Step {currentStep} of {FORM_STEPS.length}:{" "}
              {FORM_STEPS[currentStep - 1]?.title}
            </h2>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-2xl">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                currentStep === 1
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600 text-white transform hover:scale-105"
              }`}
            >
              <span>←</span>
              <span>Previous</span>
            </button>

            {currentStep < FORM_STEPS.length ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  !validateStep(currentStep)
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105"
                }`}
              >
                <span>Next</span>
                <span>→</span>
              </button>
            ) : (
              <button
                onClick={submitToIpfs}
                disabled={submitting || uploadingToIpfs}
                className={`px-8 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  submitting || uploadingToIpfs
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105"
                }`}
              >
                {uploadingToIpfs ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Uploading to IPFS...</span>
                  </>
                ) : submitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>�</span>
                    <span>Store on IPFS</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Your IPFS Data Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => {
              setShowDisputes(true);
              fetchDisputes();
            }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 text-lg font-semibold shadow-lg"
          >
            <span>🌐</span>
            <span>View Your IPFS Data</span>
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
              {disputes.length}
            </span>
          </button>
        </div>

        {/* IPFS Data Modal */}
        {showDisputes && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto relative border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <span>🌐</span>
                  <span>Your IPFS Data</span>
                </h2>
                <button
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowDisputes(false)}
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
              <div className="space-y-4">
                {disputes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-400 text-lg">No IPFS data found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Your stored data will appear here
                    </p>
                  </div>
                ) : (
                  disputes.map((d, i) => (
                    <div
                      key={i}
                      className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-all duration-200"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <div className="font-semibold text-white">
                            {d.category || "General"}
                          </div>
                          <div className="text-sm text-gray-400 break-all">
                            {d.txHash}
                          </div>
                          <div className="text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                d.status === "Resolved"
                                  ? "bg-green-600 text-white"
                                  : d.status === "In Progress"
                                  ? "bg-yellow-600 text-white"
                                  : "bg-blue-600 text-white"
                              }`}
                            >
                              {d.status}
                            </span>
                          </div>
                        </div>
                        <button
                          className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                          onClick={() => {
                            setShowDisputes(false);
                            setShowChat(true);
                          }}
                        >
                          <span>💬</span>
                          <span>View/Chat</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChat && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 h-[80vh] relative border border-gray-700">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowChat(false)}
              >
                <span className="text-2xl">✕</span>
              </button>
              <div className="h-full">
                <ChatInterface />
              </div>
            </div>
          </div>
        )}

        {/* Help & FAQ Section */}
        <div className="mt-12 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <span>❓</span>
            <span>Help & FAQ</span>
          </h2>
          <div className="space-y-4">
            <details className="bg-gray-700/50 rounded-lg">
              <summary className="font-semibold cursor-pointer p-4 text-white hover:bg-gray-700/70 rounded-lg transition-colors">
                What is IPFS?
              </summary>
              <div className="px-4 pb-4 text-gray-300">
                IPFS (InterPlanetary File System) is a decentralized storage
                network that ensures your data is permanently stored and
                accessible from anywhere in the world.
              </div>
            </details>
            <details className="bg-gray-700/50 rounded-lg">
              <summary className="font-semibold cursor-pointer p-4 text-white hover:bg-gray-700/70 rounded-lg transition-colors">
                What data gets stored?
              </summary>
              <div className="px-4 pb-4 text-gray-300">
                All your form data including transaction hash, description,
                proof files, and addresses are securely stored on IPFS with a
                unique hash for permanent access.
              </div>
            </details>
            <details className="bg-gray-700/50 rounded-lg">
              <summary className="font-semibold cursor-pointer p-4 text-white hover:bg-gray-700/70 rounded-lg transition-colors">
                Is my data secure?
              </summary>
              <div className="px-4 pb-4 text-gray-300">
                Yes! Data stored on IPFS is cryptographically hashed and
                distributed across multiple nodes, making it tamper-proof and
                permanently accessible.
              </div>
            </details>
            <details className="bg-gray-700/50 rounded-lg">
              <summary className="font-semibold cursor-pointer p-4 text-white hover:bg-gray-700/70 rounded-lg transition-colors">
                How do I access my stored data?
              </summary>
              <div className="px-4 pb-4 text-gray-300">
                After storing data, you'll receive an IPFS hash. Click "View on
                IPFS" to access your data anytime, anywhere using this unique
                identifier.
              </div>
            </details>
          </div>
        </div>

        {/* IPFS Success Modal */}
        {showIpfsSuccess && ipfsHash && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-700">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Success! Data Stored on IPFS
                </h2>
                <p className="text-gray-400">
                  Your dispute data has been securely stored on the
                  decentralized web
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300 font-medium">IPFS Hash:</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(ipfsHash)}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="bg-gray-800 rounded p-3 border border-gray-600">
                  <code className="text-green-400 text-sm break-all font-mono">
                    {ipfsHash}
                  </code>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() =>
                    window.open(
                      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                      "_blank"
                    )
                  }
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>🌐</span>
                  <span>View on IPFS</span>
                </button>
                <button
                  onClick={() => setShowIpfsSuccess(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>✅</span>
                  <span>Close</span>
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Keep this hash safe - it's your permanent record on IPFS
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputePage;
