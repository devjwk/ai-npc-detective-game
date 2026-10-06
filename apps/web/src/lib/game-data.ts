import type { Evidence, NpcProfile } from "./types";

export const CORRECT_SUSPECT = "mina";
export const MAX_TURNS = 18;

export const EVIDENCES: Evidence[] = [
  { key: "brokenSensorLog", label: "Broken sensor log", location: "security_room", isCore: true },
  { key: "insuranceEmail", label: "Insurance email thread", location: "lobby", isCore: true },
  { key: "nightShiftNote", label: "Night shift correction note", location: "security_room", isCore: true },
  { key: "cameraBlindSpotMap", label: "Camera blind spot map", location: "security_room", isCore: false },
  { key: "paintFragment", label: "Paint fragment", location: "studio", isCore: false },
  { key: "vaultKeyTrace", label: "Vault key trace", location: "vault", isCore: true },
  { key: "footprintPhoto", label: "Footprint photo", location: "lobby", isCore: false },
  { key: "maintenanceTicket", label: "Lighting maintenance ticket", location: "vault", isCore: true },
  { key: "alarmPanelScreenshot", label: "Alarm panel screenshot", location: "security_room", isCore: false },
  { key: "phoneTranscript", label: "Phone transcript", location: "lobby", isCore: false },
  { key: "deliveryManifest", label: "Delivery manifest", location: "studio", isCore: false },
  { key: "witnessMemo", label: "Witness memo", location: "lobby", isCore: false }
];

export const NPCS: NpcProfile[] = [
  {
    id: "mina",
    name: "Mina (Curator)",
    personality: "Calm and articulate. Avoids direct confession.",
    knownFacts: ["Insurance policy updated last month", "Lights flickered before alarm"],
    hiddenFacts: ["Mina manipulated the lighting circuit for insurance fraud"],
    forbiddenTopics: ["Direct confession without enough evidence"],
    location: "lobby"
  },
  {
    id: "jae",
    name: "Jae (Security)",
    personality: "Defensive and terse. Tries to protect museum image.",
    knownFacts: ["Sensor failed at 22:14", "One camera had a blind spot"],
    hiddenFacts: ["Jae moved a keycard record after the incident"],
    forbiddenTopics: ["Admitting evidence tampering too early"],
    location: "security_room"
  },
  {
    id: "sol",
    name: "Sol (Artist)",
    personality: "Emotional and observant. Gives contextual hints.",
    knownFacts: ["Heard argument near vault", "Saw Mina in a hurry"],
    hiddenFacts: ["Sol noticed the staged damage pattern"],
    forbiddenTopics: ["Giving final culprit directly"],
    location: "studio"
  },
  {
    id: "ara",
    name: "Ara (Archivist)",
    personality: "Helpful guide. Provides progressive hints.",
    knownFacts: ["Tracks records and timestamps", "Knows where clues are archived"],
    hiddenFacts: ["None"],
    forbiddenTopics: [],
    location: "vault"
  }
];

export const LOCATIONS = [
  { id: "lobby", label: "Lobby" },
  { id: "vault", label: "Vault" },
  { id: "security_room", label: "Security Room" },
  { id: "studio", label: "Studio" }
] as const;
