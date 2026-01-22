import { useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useChatContext, Message } from '@/contexts/ChatContext';
import { toast } from 'sonner';
import { encodeFunctionData, keccak256, toHex, parseEther } from 'viem';
import { ESCROW_CONTRACT, ESCROW_ABI, PROVIDER_AGENT_ADDRESS, PROVIDER_AGENT_ID } from '@/contracts/escrow';

export interface ImageData {
  base64: string;
  mimeType: string;
}

const COST_PER_MESSAGE = 0.03;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useChat() {
  const { messages, setMessages, clearChat, currentSessionId, createNewSession, saveMessageToDb } = useChatContext();
  const [isTyping, setIsTyping] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const { isConnected, address, balance, refreshBalance } = useWallet();

  const sendMessage = useCallback(async (content: string, imageData?: ImageData) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check balance first
    if (balance < COST_PER_MESSAGE) {
      toast.error('Insufficient balance. Please deposit more USDC.');
      return;
    }

    // Check if MetaMask is available
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      toast.error('MetaMask is required for transactions');
      return;
    }

    // Add user message immediately (with image preview if attached)
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: content || (imageData ? '[Image attached]' : ''),
      isUser: true,
      timestamp: new Date(),
      imagePreview: imageData ? `data:${imageData.mimeType};base64,${imageData.base64}` : undefined,
    };
    setMessages(prev => [...prev, userMessage]);

    // Create session if none exists (don't clear messages since we already added user message)
    if (!currentSessionId) {
      await createNewSession({ clearMessages: false });
    }

    // Step 1: Create Escrow Transaction
    setIsPaying(true);
    toast.info('Please sign the transaction to pay for this query ($0.02)');

    let txHash: string;

    try {
      // Create task hash from the query
      const taskHash = keccak256(toHex(content));

      // Encode the function call
      const data = encodeFunctionData({
        abi: ESCROW_ABI,
        functionName: 'createEscrow',
        args: [PROVIDER_AGENT_ADDRESS, taskHash, PROVIDER_AGENT_ID],
      });

      // Send transaction via MetaMask (Direct Transfer)
      // First ensure we're on Arc Testnet
      const ARC_CHAIN_ID = '0x4cef52'; // 5042002 in hex
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ARC_CHAIN_ID }],
        });
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: ARC_CHAIN_ID,
              chainName: 'Arc Testnet',
              nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
              rpcUrls: ['https://rpc.testnet.arc.network'],
              blockExplorerUrls: ['https://explorer.testnet.arc.network'],
            }],
          });
        }
      }

      // Send 0.02 USDC directly to the Agent
      txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: PROVIDER_AGENT_ADDRESS, // Send directly to Agent
          value: toHex(parseEther(COST_PER_MESSAGE.toString())),
          data: '0x', // No data needed for native transfer
        }],
      });

      toast.success('Payment confirmed! Processing your query...');
    } catch (error: any) {
      console.error('Payment error:', error);
      setIsPaying(false);

      // User rejected the transaction
      if (error.code === 4001) {
        toast.error('Transaction cancelled');
        // Remove the user message since they cancelled
        setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        return;
      }

      toast.error(`Payment failed: ${error.message || 'Unknown error'}`);
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `Payment failed: ${error.message}. Please try again.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    } finally {
      setIsPaying(false);
    }

    // Step 2: Send query to backend (now that payment is confirmed)
    setIsTyping(true);

    try {
      // Build conversation history for context (exclude images to save bandwidth)
      const conversationHistory = messages.map(m => ({
        role: m.isUser ? 'user' : 'model',
        content: m.content,
      }));

      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          txHash, // Include the transaction hash for verification
          userAddress: address,
          imageData: imageData ? { base64: imageData.base64, mimeType: imageData.mimeType } : undefined,
          conversationHistory, // Pass previous messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        escrowId: data.escrowId,
        txHash,
        agentsUsed: data.agentsUsed,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save both messages to database
      await saveMessageToDb(userMessage);
      await saveMessageToDb(aiMessage);

      toast.success(`Query completed • Paid $${COST_PER_MESSAGE}`);

      // Refresh balance from blockchain
      if (refreshBalance) {
        refreshBalance();
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(`Error: ${(error as Error).message}`);

      // Add error message (but they already paid)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `Sorry, I encountered an error after your payment: ${(error as Error).message}. Your payment of $${COST_PER_MESSAGE} was recorded (tx: ${txHash?.slice(0, 10)}...)`,
        isUser: false,
        timestamp: new Date(),
        txHash,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [isConnected, address, balance, refreshBalance, messages, setMessages, currentSessionId, createNewSession, saveMessageToDb]);

  return { messages, isTyping, isPaying, sendMessage, clearChat };
}

// Re-export Message type
export type { Message } from '@/contexts/ChatContext';
