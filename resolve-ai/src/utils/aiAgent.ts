import { Agent } from 'alith';

// Initialize the Alith agent following the pattern from your Python backend
export const agent = new Agent({
  model: "llama3-70b-8192",
  apiKey: "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", // Replace with your actual API key
  baseUrl: "https://api.groq.com/openai/v1",
  preamble: "You are a helpful AI assistant specializing in Web3 dispute resolution. You help analyze blockchain transactions, NFT trades, DeFi failures, and provide insights for dispute resolution. Be friendly, concise, and provide actionable advice.",
});
