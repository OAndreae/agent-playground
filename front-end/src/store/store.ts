import { create } from 'zustand';

interface FiresideChatState {
  // Form fields
  guestName: string;
  guestBio: string;
  audienceProfile: string;

  // UI state
  isGenerating: boolean;
  error: string | null;

  // Stream response
  streamResponse: Response | null;

  // Preparation notes
  preparationNotes: string;

  // Actions
  updateField: (field: 'guestName' | 'guestBio' | 'audienceProfile', value: string) => void;
  clearForm: () => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  setStreamResponse: (response: Response | null) => void;
  setPreparationNotes: (notes: string) => void;
}

export const useFiresideChatStore = create<FiresideChatState>((set) => ({
  // Initial state
  guestName: '',
  guestBio: '',
  audienceProfile: '',
  isGenerating: false,
  error: null,
  streamResponse: null,
  preparationNotes: '',

  // Actions
  updateField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
      error: null,
    })),

  clearForm: () =>
    set({
      guestName: '',
      guestBio: '',
      audienceProfile: '',
      isGenerating: false,
      error: null,
      streamResponse: null,
      preparationNotes: '',
    }),

  setIsGenerating: (isGenerating) =>
    set((state) => ({
      ...state,
      isGenerating,
      error: isGenerating ? null : state.error,
    })),

  setError: (error) =>
    set((state) => ({
      ...state,
      error,
      isGenerating: false,
    })),

  setStreamResponse: (streamResponse) =>
    set((state) => ({
      ...state,
      streamResponse,
    })),

  setPreparationNotes: (notes) =>
    set((state) => ({
      ...state,
      preparationNotes: notes,
    })),
}));
