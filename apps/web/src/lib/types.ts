export type NpcId = "mina" | "jae" | "sol" | "ara";
export type LocationId = "lobby" | "vault" | "security_room" | "studio";

export type Evidence = {
  key: string;
  label: string;
  location: LocationId;
  isCore: boolean;
};

export type NpcProfile = {
  id: NpcId;
  name: string;
  personality: string;
  knownFacts: string[];
  hiddenFacts: string[];
  forbiddenTopics: string[];
  location: LocationId;
};

export type GameSession = {
  id: string;
  state: "intro" | "explore" | "dialogue" | "deduction" | "ending";
  turn: number;
  location: LocationId;
  evidenceKeys: string[];
  logs: Array<{ npcId: NpcId; role: "user" | "assistant"; content: string; tokens: number }>;
  memorySummaries: string[];
  hintLevel: number;
  accusation?: NpcId;
  ending?: "truth" | "false_accusation" | "timeout";
  tokenUsage: number;
};
