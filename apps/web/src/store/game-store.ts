"use client";

import { create } from "zustand";
import { EVIDENCES } from "@/lib/game-data";
import type { GameSession, LocationId, NpcId } from "@/lib/types";

type GameStore = {
  session: GameSession | null;
  selectedNpc: NpcId;
  chatInput: string;
  lastReply: string;
  lastHint: string;
  loading: boolean;
  start: () => Promise<void>;
  move: (location: LocationId) => Promise<void>;
  collect: (evidenceKey: string) => Promise<void>;
  askNpc: () => Promise<void>;
  accuse: (npcId: NpcId) => Promise<void>;
  askHint: () => Promise<void>;
  setSelectedNpc: (npcId: NpcId) => void;
  setChatInput: (text: string) => void;
};

async function postJSON(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  selectedNpc: "mina",
  chatInput: "",
  lastReply: "",
  lastHint: "",
  loading: false,
  start: async () => {
    set({ loading: true });
    try {
      const data = await postJSON("/api/session/start", {});
      set({ session: data.session, lastReply: "", lastHint: "" });
    } finally {
      set({ loading: false });
    }
  },
  move: async (location) => {
    const { session } = get();
    if (!session) return;
    set({ loading: true });
    try {
      const data = await postJSON("/api/session/move", { sessionId: session.id, location });
      set({ session: data.session });
    } finally {
      set({ loading: false });
    }
  },
  collect: async (evidenceKey) => {
    const { session } = get();
    if (!session) return;
    const evidence = EVIDENCES.find((item) => item.key === evidenceKey);
    if (!evidence || evidence.location !== session.location) return;

    set({ loading: true });
    try {
      const data = await postJSON("/api/evidence/collect", { sessionId: session.id, evidenceKey });
      set({ session: data.session });
    } finally {
      set({ loading: false });
    }
  },
  askNpc: async () => {
    const { session, selectedNpc, chatInput } = get();
    if (!session || !chatInput.trim()) return;
    set({ loading: true });
    try {
      const data = await postJSON("/api/dialogue", {
        sessionId: session.id,
        npcId: selectedNpc,
        message: chatInput
      });
      set({ session: data.session, lastReply: data.reply.answer, chatInput: "" });
    } finally {
      set({ loading: false });
    }
  },
  accuse: async (npcId) => {
    const { session } = get();
    if (!session) return;
    set({ loading: true });
    try {
      const data = await postJSON("/api/ending/evaluate", {
        sessionId: session.id,
        accusation: npcId
      });
      set({ session: data.session });
    } finally {
      set({ loading: false });
    }
  },
  askHint: async () => {
    const { session } = get();
    if (!session) return;
    set({ loading: true });
    try {
      const data = await postJSON("/api/hint", { sessionId: session.id });
      set({ lastHint: data.hint });
    } finally {
      set({ loading: false });
    }
  },
  setSelectedNpc: (npcId) => set({ selectedNpc: npcId }),
  setChatInput: (text) => set({ chatInput: text })
}));
