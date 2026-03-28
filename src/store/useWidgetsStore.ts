import { create } from "zustand";
import { toast } from "sonner";

export interface Widget {
  id: string;
  userId: string;
  name: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor: string;
  productName: string;
  description: string;
  widgetTitle: string;
  welcomeMessage: string;
  isActive: boolean;
  customIcon?: string;
  adminEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatbotStore {
  // Chatbot Data
  chatbot: Widget[];
  selectedWidget: Widget | null;

  // Loading States
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;

  // Actions
  fetchChatbot: () => Promise<void>;
  createWidget: (
    data: Omit<Widget, "id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<Widget>;
  updateWidget: (
    id: string,
    data: Partial<Omit<Widget, "id" | "userId" | "createdAt" | "updatedAt">>
  ) => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
  setSelectedWidget: (widget: Widget | null) => void;
  getWidgetForEdit: (widgetId: string) => Promise<Widget>;
}

export const useChatbotStore = create<ChatbotStore>((set, get) => ({
  // Initial State
  chatbot: [],
  selectedWidget: null,

  isLoading: false,
  error: null,
  hasFetched: false,

  // Actions
  fetchChatbot: async () => {
    const { hasFetched, isLoading } = get();

    // Don't fetch if we already have the data or if we're currently loading
    if (hasFetched || isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/chatbot");
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      set({
        chatbot: data.chatbot.map(
          (widget: Widget & { createdAt: string; updatedAt: string }) => ({
            ...widget,
            createdAt: new Date(widget.createdAt),
            updatedAt: new Date(widget.updatedAt),
          })
        ),
        hasFetched: true,
      });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error("Failed to fetch chatbot");
    } finally {
      set({ isLoading: false });
    }
  },

  createWidget: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      const newWidget = {
        ...result.widget,
        createdAt: new Date(result.widget.createdAt),
        updatedAt: new Date(result.widget.updatedAt),
      };

      set((state) => ({
        chatbot: [...state.chatbot, newWidget],
      }));

      toast.success("Widget created successfully");

      return newWidget;
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error("Failed to create widget");
    } finally {
      set({ isLoading: false });
    }
  },

  updateWidget: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/chatbot/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      const updatedWidget = {
        ...result.widget,
        createdAt: new Date(result.widget.createdAt),
        updatedAt: new Date(result.widget.updatedAt),
      };

      set((state) => ({
        chatbot: state.chatbot.map((w) => (w.id === id ? updatedWidget : w)),
        selectedWidget:
          state.selectedWidget?.id === id
            ? updatedWidget
            : state.selectedWidget,
      }));

      toast.success("Widget updated successfully");
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error("Failed to update widget");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteWidget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/chatbot/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      set((state) => ({
        chatbot: state.chatbot.filter((w) => w.id !== id),
        selectedWidget:
          state.selectedWidget?.id === id ? null : state.selectedWidget,
      }));

      toast.success("Widget deleted successfully");
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error("Failed to delete widget");
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedWidget: (widget) => set({ selectedWidget: widget }),

  // Add method to get widget for editing (authenticated)
  getWidgetForEdit: async (widgetId: string) => {
    try {
      const response = await fetch(`/api/chatbot/${widgetId}/manage`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.widget;
    } catch (error) {
      toast.error("Failed to fetch widget");
      throw error;
    }
  },
}));
