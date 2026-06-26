import { useState, useCallback } from 'react';
import { apiService } from '@/services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export const useAIChat = (villageId: string | undefined, year: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (question: string) => {
    if (!villageId || !question.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.post<{ answer: string }>(`/api/v1/ai/${villageId}/chat?year=${year}`, {
        question: userMessage.content,
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.answer,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get response from AI.';
      setError(errorMsg);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'I encountered an error analyzing the data. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [villageId, year]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
  };
};