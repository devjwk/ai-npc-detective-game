"use client";

import { EVIDENCES, LOCATIONS, NPCS } from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

function EndingBanner({ ending }: { ending?: string }) {
  if (!ending) return null;
  const message =
    ending === "truth"
      ? "Truth Ending: You solved the case."
      : ending === "timeout"
        ? "Timeout Ending: You ran out of turns."
        : "False Accusation Ending: Your evidence was not enough.";
  return <div className="rounded-md border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm">{message}</div>;
}

export default function HomePage() {
  const {
    session,
    selectedNpc,
    chatInput,
    lastReply,
    lastHint,
    loading,
    start,
    move,
    collect,
    askNpc,
    accuse,
    askHint,
    setSelectedNpc,
    setChatInput
  } = useGameStore();

  const availableEvidence = EVIDENCES.filter((item) => item.location === session?.location);

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6">
      <h1 className="text-3xl font-bold">AI NPC Detective: Midnight Gallery</h1>
      <p className="mt-2 text-sm text-slate-300">
        Explore locations, collect clues, talk to NPCs, and accuse the suspect before turns run out.
      </p>

      <section className="mt-6 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
        <button
          onClick={() => start()}
          className="rounded bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={loading}
        >
          {session ? "Restart Session" : "Start Session"}
        </button>
        {session && (
          <div className="mt-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            <div>State: {session.state}</div>
            <div>Turns Left: {session.turn}</div>
            <div>Token Usage: {session.tokenUsage}</div>
          </div>
        )}
      </section>

      {session && (
        <>
          <section className="mt-4 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
            <h2 className="text-lg font-semibold">Location</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => move(loc.id)}
                  disabled={loading || session.ending !== undefined}
                  className={`rounded border px-3 py-1 text-sm ${
                    session.location === loc.id ? "border-indigo-400 bg-indigo-500/20" : "border-slate-600"
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
            <h2 className="text-lg font-semibold">Evidence in this location</h2>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {availableEvidence.map((ev) => (
                <button
                  key={ev.key}
                  onClick={() => collect(ev.key)}
                  disabled={loading || session.evidenceKeys.includes(ev.key) || session.ending !== undefined}
                  className="rounded border border-slate-600 px-3 py-2 text-left text-sm disabled:opacity-40"
                >
                  <div>{ev.label}</div>
                  <div className="text-xs text-slate-400">{ev.isCore ? "Core clue" : "Supporting clue"}</div>
                </button>
              ))}
            </div>
            <div className="mt-3 text-sm text-slate-300">Collected: {session.evidenceKeys.length} clues</div>
          </section>

          <section className="mt-4 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
            <h2 className="text-lg font-semibold">Talk to NPC</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {NPCS.map((npc) => (
                <button
                  key={npc.id}
                  onClick={() => setSelectedNpc(npc.id)}
                  className={`rounded border px-3 py-1 text-sm ${
                    selectedNpc === npc.id ? "border-indigo-400 bg-indigo-500/20" : "border-slate-600"
                  }`}
                >
                  {npc.name}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about timeline, insurance, keycard, sensor..."
              />
              <button
                onClick={() => askNpc()}
                disabled={loading || session.ending !== undefined}
                className="rounded bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Ask
              </button>
            </div>
            {lastReply && <p className="mt-3 rounded bg-slate-800 p-3 text-sm">{lastReply}</p>}
            <div className="mt-3">
              <button
                onClick={() => askHint()}
                disabled={loading || session.ending !== undefined}
                className="rounded border border-amber-400/50 bg-amber-500/10 px-3 py-1 text-sm"
              >
                Ask Hint (Ara)
              </button>
              {lastHint && <p className="mt-2 text-sm text-amber-200">{lastHint}</p>}
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
            <h2 className="text-lg font-semibold">Accuse suspect</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {NPCS.filter((npc) => npc.id !== "ara").map((npc) => (
                <button
                  key={npc.id}
                  onClick={() => accuse(npc.id)}
                  disabled={loading || session.ending !== undefined}
                  className="rounded border border-rose-400/50 bg-rose-500/10 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Accuse {npc.name}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <EndingBanner ending={session.ending} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
