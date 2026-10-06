export type SessionModel = {
  id: string;
  state: string;
  turn: number;
  selectedEnding?: string;
  accusation?: string;
};
