import { create } from "zustand";
import { toast } from "sonner";

export interface Chatbot {
  id: string;
  userId: string;
  name: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor: string;
  productName: string;
  description: string;
  chatbotTitle: string;
  welcomeMessage: string;
  isActive: boolean;
  customIcon?: string;
  adminEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatbotsStore {
  // Chatbots Data
  chatbots: Chatbot[];
  selectedChatbot: Chatbot | null;

  // Loading States
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;

  // Actions
  fetchChatbots: () => Promise<void>;
  createChatbot: (
    data: Omit<Chatbot, "id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<Chatbot>;
  updateChatbot: (
    id: string,
    data: Partial<Omit<Chatbot, "id" | "userId" | "createdAt" | "updatedAt">>
  ) => Promise<void>;
  deleteChatbot: (id: string) => Promise<void>;
  setSelectedChatbot: (chatbot: Chatbot | null) => void;
  getChatbotForEdit: (chatbotId: string) => Promise<Chatbot>;
}

export const useChatbotsStore = create<ChatbotsStore>((set, get) => ({
  // Initial State
  chatbots: [],
  selectedChatbot: null,

  isLoading: false,
  error: null,
  hasFetched: false,

  // Actions
  fetchChatbots: async () => {
    const { hasFetched, isLoading } = get();

    // Don't fetch if we already have the data or if we're currently loading
    if (hasFetched || isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/chatbots");
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      set({
        chatbots: data.chatbots.map(
          (chatbot: Chatbot & { createdAt: string; updatedAt: string }) => ({
            ...chatbot,
            createdAt: new Date(chatbot.createdAt),
            updatedAt: new Date(chatbot.updatedAt),
          })
        ),
        hasFetched: true,
      });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error("Failed to fetch chatbots");
    } finally {
      set({ isLoading: false });
    }
  },

  createChatbot: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      const newChatbot = {
        ...result.chatbot,
        createdAt: new Date(result.chatbot.createdAt),
        updatedAt: new Date(result.chatbot.updatedAt),
      };

      set((state) => ({
        chatbots: [...state.chatbots, newChatbot],
      }));

      toast.success("Chatbot created successfully");

      return newChatbot;
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error("Failed to create chatbot");
    } finally {
      set({ isLoading: false });
    }
  },

  updateChatbot: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      const updatedChatbot = {
        ...result.chatbot,
        createdAt: new Date(result.chatbot.createdAt),
        updatedAt: new Date(result.chatbot.updatedAt),
      };

      set((state) => ({
        chatbots: state.chatbots.map((w) => (w.id === id ? updatedChatbot : w)),
        selectedChatbot:
          state.selectedChatbot?.id === id
            ? updatedChatbot
            : state.selectedChatbot,
      }));

      toast.success("Chatbot updated successfully");
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error("Failed to update chatbot");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteChatbot: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      set((state) => ({
        chatbots: state.chatbots.filter((w) => w.id !== id),
        selectedChatbot:
          state.selectedChatbot?.id === id ? null : state.selectedChatbot,
      }));

      toast.success("Chatbot deleted successfully");
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error("Failed to delete chatbot");
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedChatbot: (chatbot) => set({ selectedChatbot: chatbot }),

  // Add method to get chatbot for editing (authenticated)
  getChatbotForEdit: async (chatbotId: string) => {
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/manage`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.chatbot;
    } catch (error) {
      toast.error("Failed to fetch chatbot");
      throw error;
    }
  },
}));
