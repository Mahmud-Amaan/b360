import { create } from "zustand";
import { toast } from "sonner";

export interface Agent {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    phoneNumber: string;
    phoneSid: string;
    voice: string;
    welcomeMessage: string | null;
    businessContext: string | null;
    businessType: string | null;
    availabilityContext: string | null;
    adminEmail: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface AgentsStore {
    // Agents Data
    agents: Agent[];
    selectedAgent: Agent | null;

    // Loading States
    isLoading: boolean;
    error: string | null;
    hasFetched: boolean;

    // Actions
    fetchAgents: () => Promise<void>;
    createAgent: (
        data: Omit<Agent, "id" | "userId" | "createdAt" | "updatedAt">
    ) => Promise<Agent | undefined>;
    updateAgent: (
        id: string,
        data: Partial<Omit<Agent, "id" | "userId" | "createdAt" | "updatedAt">>
    ) => Promise<void>;
    deleteAgent: (id: string) => Promise<void>;
    setSelectedAgent: (agent: Agent | null) => void;
    getAgentById: (agentId: string) => Promise<Agent>;
}

export const useAgentsStore = create<AgentsStore>((set, get) => ({
    // Initial State
    agents: [],
    selectedAgent: null,

    isLoading: false,
    error: null,
    hasFetched: false,

    // Actions
    fetchAgents: async () => {
        const { hasFetched, isLoading } = get();

        if (hasFetched || isLoading) return;

        set({ isLoading: true, error: null });
        try {
            const response = await fetch("/api/agents");
            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            set({
                agents: data.agents.map(
                    (agent: Agent & { createdAt: string; updatedAt: string }) => ({
                        ...agent,
                        createdAt: new Date(agent.createdAt),
                        updatedAt: new Date(agent.updatedAt),
                    })
                ),
                hasFetched: true,
            });
        } catch (error) {
            set({ error: (error as Error).message });
            toast.error("Failed to fetch agents");
        } finally {
            set({ isLoading: false });
        }
    },

    createAgent: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch("/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            const newAgent = {
                ...result.agent,
                createdAt: new Date(result.agent.createdAt),
                updatedAt: new Date(result.agent.updatedAt),
            };

            set((state) => ({
                agents: [...state.agents, newAgent],
            }));

            toast.success("Agent created successfully");

            return newAgent;
        } catch (error) {
            set({ error: (error as Error).message });
            toast.error("Failed to create agent");
        } finally {
            set({ isLoading: false });
        }
    },

    updateAgent: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/agents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            const updatedAgent = {
                ...result.agent,
                createdAt: new Date(result.agent.createdAt),
                updatedAt: new Date(result.agent.updatedAt),
            };

            set((state) => ({
                agents: state.agents.map((a) => (a.id === id ? updatedAgent : a)),
                selectedAgent:
                    state.selectedAgent?.id === id
                        ? updatedAgent
                        : state.selectedAgent,
            }));

            toast.success("Agent updated successfully");
        } catch (error) {
            set({ error: (error as Error).message });
            toast.error("Failed to update agent");
        } finally {
            set({ isLoading: false });
        }
    },

    deleteAgent: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/agents/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            set((state) => ({
                agents: state.agents.filter((a) => a.id !== id),
                selectedAgent:
                    state.selectedAgent?.id === id ? null : state.selectedAgent,
            }));

            toast.success("Agent deleted successfully");
        } catch (error) {
            set({ error: (error as Error).message });
            toast.error("Failed to delete agent");
        } finally {
            set({ isLoading: false });
        }
    },

    setSelectedAgent: (agent) => set({ selectedAgent: agent }),

    getAgentById: async (agentId: string) => {
        try {
            const response = await fetch(`/api/agents/${agentId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data.agent;
        } catch (error) {
            toast.error("Failed to fetch agent");
            throw error;
        }
    },
}));
