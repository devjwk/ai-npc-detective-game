type MemoryRecord = {
  text: string;
  tokens: Set<string>;
  createdAt: number;
};

const memoryIndex = new Map<string, MemoryRecord[]>();

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2)
  );
}

function overlapScore(a: Set<string>, b: Set<string>) {
  let score = 0;
  for (const token of a) {
    if (b.has(token)) score += 1;
  }
  return score;
}

export function addMemoryEmbedding(sessionId: string, text: string) {
  const records = memoryIndex.get(sessionId) ?? [];
  records.push({ text, tokens: tokenize(text), createdAt: Date.now() });
  if (records.length > 50) {
    records.shift();
  }
  memoryIndex.set(sessionId, records);
}

export function searchMemory(sessionId: string, query: string, limit = 3): string[] {
  const records = memoryIndex.get(sessionId) ?? [];
  const queryTokens = tokenize(query);

  return records
    .map((record) => ({
      text: record.text,
      score: overlapScore(record.tokens, queryTokens),
      createdAt: record.createdAt
    }))
    .sort((a, b) => (b.score === a.score ? b.createdAt - a.createdAt : b.score - a.score))
    .filter((item) => item.score > 0)
    .slice(0, limit)
    .map((item) => item.text);
}
