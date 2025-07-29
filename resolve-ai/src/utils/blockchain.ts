import { ethers } from 'ethers';

export interface TransactionInfo {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed?: string;
  status?: string;
  blockNumber?: number;
  timestamp?: number;
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    // Sepolia testnet RPC
    this.provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
  }

  async getTransactionInfo(txHash: string): Promise<TransactionInfo | null> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!tx) return null;

      const block = await this.provider.getBlock(tx.blockNumber || 0);

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: ethers.formatEther(tx.value),
        gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
        gasUsed: receipt ? ethers.formatUnits(receipt.gasUsed, 'wei') : undefined,
        status: receipt?.status === 1 ? 'Success' : 'Failed',
        blockNumber: tx.blockNumber || 0,
        timestamp: block?.timestamp || 0,
      };
    } catch (error) {
      console.error('Blockchain service error:', error);
      return null;
    }
  }

  async getAccountBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  async getLatestBlock(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Error getting latest block:', error);
      return 0;
    }
  }
}

export const blockchainService = new BlockchainService();
