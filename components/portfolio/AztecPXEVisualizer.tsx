"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQDsStore } from "../../lib/aztec/mockStore";
import { LottiePlayer } from "../ui/LottiePlayer";

// ─── Types ────────────────────────────────────────────────────────────────────
type NoteStatus = "PENDING" | "COMMITTED" | "NULLIFIED";

interface PrivateNote {
  id: string;
  owner: string;
  amount: number;
  storageSlot: string;
  commitment: string;
  nullifier: string | null;
  status: NoteStatus;
  blockNumber: number;
  createdAt: number;
}

interface NullifierEvent {
  nullifier: string;
  noteId: string;
  blockNumber: number;
  timestamp: number;
}

// ─── Deterministic hash utility ───────────────────────────────────────────────
function deterministicHex(seed: string, len: number): string {
  let h = 0x12345678;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    h ^= (h << 13) | (h >>> 19);
  }
  let result = "";
  for (let i = 0; i < Math.ceil(len / 8); i++) {
    h = Math.imul(1664525, h) + 1013904223 | 0;
    result += (h >>> 0).toString(16).padStart(8, "0");
  }
  return result.slice(0, len);
}

function buildNote(
  id: string,
  owner: string,
  amount: number,
  blockNumber: number,
  status: NoteStatus = "COMMITTED"
): PrivateNote {
  const seed = `${owner}${amount}${blockNumber}${id}`;
  const commitment = "0x" + deterministicHex(seed + "commitment", 64);
  const nullifier = status === "NULLIFIED"
    ? "0x" + deterministicHex(seed + "nullifier", 64)
    : null;
  return {
    id,
    owner: owner.slice(0, 8) + "..." + owner.slice(-6),
    amount,
    storageSlot: "0x" + deterministicHex(seed + "slot", 8),
    commitment,
    nullifier,
    status,
    blockNumber,
    createdAt: Date.now() - Math.random() * 60000,
  };
}

// ─── Commitment Tree Node ─────────────────────────────────────────────────────
function CommitmentNode({
  note,
  isSelected,
  onClick,
}: {
  note: PrivateNote;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors: Record<NoteStatus, { bg: string; border: string; dot: string; text: string }> = {
    PENDING:   { bg: "bg-zinc-900/[0.04]",   border: "border-zinc-900/20",  dot: "bg-zinc-900/40",  text: "text-zinc-900/60"  },
    COMMITTED: { bg: "bg-white", border: "border-zinc-900/10", dot: "bg-zinc-900", text: "text-zinc-900"   },
    NULLIFIED: { bg: "bg-zinc-900/[0.02]", border: "border-zinc-900/5",  dot: "bg-zinc-900/20",    text: "text-zinc-900/30"   },
  };
  const c = colors[note.status];
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`
        relative w-full text-left p-3 border transition-all duration-200 cursor-pointer
        ${c.bg} ${c.border}
        ${isSelected ? "ring-1 ring-black/20 shadow-sm" : "hover:border-zinc-900/20"}
        ${note.status === "NULLIFIED" ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className={`w-1.5 h-1.5 shrink-0 ${c.dot}`} />
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-900/40">
          {note.status === "NULLIFIED" ? "SPENT" : note.status}
        </span>
        <span className="text-[8px] font-mono text-zinc-900/20 ml-auto">blk #{note.blockNumber.toLocaleString()}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-[22px] font-light font-mono leading-none ${note.status === "NULLIFIED" ? "line-through text-zinc-900/20" : "text-zinc-900"}`}>
          {note.amount}
        </span>
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-900/30">QDs</span>
      </div>
      <div className="mt-1.5 font-mono text-[7px] text-zinc-900/25 truncate">
        C: {note.commitment.slice(0, 18)}...
      </div>
      {note.nullifier && (
        <div className="mt-0.5 font-mono text-[7px] text-zinc-900/30 truncate">
          N: {note.nullifier.slice(0, 18)}...
        </div>
      )}
      {isSelected && (
        <motion.div
          layoutId="selectedNote"
          className="absolute inset-0 border border-zinc-900/20 pointer-events-none"
        />
      )}
    </motion.button>
  );
}

// ─── Transfer Flow Visualizer ─────────────────────────────────────────────────
function TransferFlowDiagram({
  fromAmount,
  toAmount,
  change,
}: {
  fromAmount: number;
  toAmount: number;
  change: number;
}) {
  const steps = [
    { label: "Input Note", sub: `${fromAmount} QDs committed`, color: "border-zinc-900/15 bg-zinc-900/[0.02]", arrow: true },
    { label: "Nullifier Emitted", sub: "Note destroyed (double-spend proof)", color: "border-zinc-900/20 bg-zinc-900/[0.04]", arrow: true },
    { label: "Output Note 1", sub: `${toAmount} QDs to recipient`, color: "border-zinc-900/10 bg-white", arrow: false },
    { label: "Output Note 2", sub: `${change} QDs change (self)`, color: "border-zinc-900/10 bg-white", arrow: false },
  ];

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className={`border p-3 ${step.color}`}>
            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-900/50 mb-0.5">{step.label}</div>
            <div className="text-[8px] font-mono text-zinc-900/35">{step.sub}</div>
          </div>
          {step.arrow && (
            <div className="flex items-center justify-center">
              <div className="w-px h-3 bg-zinc-900/10" />
            </div>
          )}
          {i === 1 && (
            <div className="flex items-center gap-1.5 pl-3">
              <div className="w-px h-3 bg-zinc-900/10 ml-3" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function NoteDetailPanel({ note, onClose }: { note: PrivateNote; onClose: () => void }) {
  const rows = [
    { label: "Storage Slot",   value: note.storageSlot,               mono: true  },
    { label: "Commitment",     value: note.commitment,                 mono: true  },
    { label: "Nullifier",      value: note.nullifier ?? "Not emitted", mono: true  },
    { label: "Owner (trunc)",  value: note.owner,                      mono: true  },
    { label: "Block Included", value: `#${note.blockNumber.toLocaleString()}`, mono: false },
    { label: "Status",         value: note.status,                     mono: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="border border-zinc-900/10 bg-white overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900/8 bg-zinc-900/[0.015]">
        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-900/50">
          Private Note Detail
        </div>
        <button
          onClick={onClose}
          className="text-[8px] font-black uppercase tracking-widest text-zinc-900/30 hover:text-zinc-900 border border-zinc-900/10 hover:border-zinc-900 px-2 py-1 transition-all"
        >
          Close
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-baseline gap-2 border-b border-zinc-900/5 pb-3">
          <span className={`text-3xl font-light font-mono ${note.status === "NULLIFIED" ? "line-through text-zinc-900/20" : "text-zinc-900"}`}>
            {note.amount}
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900/30">QDs</span>
        </div>
        {rows.map(({ label, value, mono }) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-900/30 shrink-0 mt-0.5">
              {label}
            </span>
            <span className={`text-right text-[8px] break-all text-zinc-900/60 ${mono ? "font-mono" : "font-black uppercase tracking-widest"}`}>
              {value}
            </span>
          </div>
        ))}
        {note.status !== "NULLIFIED" && (
          <div className="mt-2 border border-zinc-900/8 bg-zinc-900/[0.015] p-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-zinc-900/30 mb-1">
              Aztec SDK equivalent
            </div>
            <pre className="text-[7px] font-mono text-zinc-900/50 whitespace-pre-wrap leading-relaxed">
{`const note = await pxe.getNotes({
  owner: aztecAddress,
  storageSlot: Fr("${note.storageSlot}"),
  status: NoteStatus.ACTIVE,
});`}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Live Nullifier Log ───────────────────────────────────────────────────────
function NullifierLog({ events }: { events: NullifierEvent[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  return (
    <div className="border border-zinc-900/8 bg-zinc-900/[0.015] overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-900/8 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-zinc-900/60" />
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-900/40">
          Nullifier Tree Log
        </span>
      </div>
      <div className="h-28 overflow-y-auto p-3 space-y-1.5 font-mono">
        {events.length === 0 ? (
          <div className="text-[8px] text-zinc-900/20 uppercase tracking-widest py-4 text-center">
            No nullifiers emitted yet
          </div>
        ) : (
          events.map((ev, i) => (
            <motion.div
              key={ev.nullifier}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[8px] text-zinc-900/40 leading-relaxed"
            >
              <span className="text-zinc-900/20">[blk #{ev.blockNumber}]</span>
              {"  "}
              <span className="text-zinc-900/30">NULLIFIED</span>
              {"  "}
              <span>{ev.nullifier.slice(0, 20)}...</span>
            </motion.div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AztecPXEVisualizer() {
  const { balance, history, aztecAddress } = useQDsStore();
  const [notes, setNotes] = useState<PrivateNote[]>([]);
  const [nullifierLog, setNullifierLog] = useState<NullifierEvent[]>([]);
  const [selectedNote, setSelectedNote] = useState<PrivateNote | null>(null);
  const [activeView, setActiveView] = useState<"NOTES" | "FLOW" | "CIRCUIT">("NOTES");
  const [lottieData, setLottieData] = useState<any>(null);
  const blockRef = useRef(104431);

  // Preload Lottie
  useEffect(() => {
    import('../../public/system-shots/Transaction Complete.json')
      .then(m => setLottieData(m.default || m))
      .catch(() => {});
  }, []);

  // Rebuild note set from history + current balance
  useEffect(() => {
    if (!aztecAddress) return;
    const addr = aztecAddress;
    const generatedNotes: PrivateNote[] = [];
    const newNullifiers: NullifierEvent[] = [];

    // Current balance = one live COMMITTED note
    if (balance > 0) {
      generatedNotes.push(
        buildNote("note_current", addr, balance, blockRef.current, "COMMITTED")
      );
    }

    // Sent transactions = NULLIFIED notes (spent inputs)
    history
      .filter((tx) => tx.type === "send")
      .slice(0, 5)
      .forEach((tx, i) => {
        const note = buildNote(
          `note_spent_${i}`,
          addr,
          tx.amount,
          blockRef.current - (i + 1) * 3,
          "NULLIFIED"
        );
        generatedNotes.push(note);
        newNullifiers.push({
          nullifier: note.nullifier!,
          noteId: note.id,
          blockNumber: note.blockNumber,
          timestamp: Date.now() - i * 15000,
        });
      });

    // Received transactions = COMMITTED notes (could be spent already if balance changed)
    history
      .filter((tx) => tx.type === "receive")
      .slice(0, 3)
      .forEach((tx, i) => {
        generatedNotes.push(
          buildNote(
            `note_recv_${i}`,
            addr,
            tx.amount,
            blockRef.current - (i + 1) * 2,
            i === 0 && balance === 0 ? "NULLIFIED" : "COMMITTED"
          )
        );
      });

    setNotes(generatedNotes);
    setNullifierLog(newNullifiers);
  }, [balance, history, aztecAddress]);

  const totalNotes      = notes.length;
  const liveNotes       = notes.filter((n) => n.status !== "NULLIFIED").length;
  const nullifiedNotes  = notes.filter((n) => n.status === "NULLIFIED").length;
  const pendingNotes    = notes.filter((n) => n.status === "PENDING").length;

  // Example flow values
  const exampleSend     = Math.floor(balance * 0.3);
  const exampleChange   = balance - exampleSend;

  const TABS = [
    { id: "NOTES"   as const, label: "Note Tree"      },
    { id: "FLOW"    as const, label: "TX Flow"        },
    { id: "CIRCUIT" as const, label: "Circuit Params" },
  ];

  if (!aztecAddress) {
    return (
      <div className="border border-zinc-900/8 bg-zinc-900/[0.015] p-8 text-center">
        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-900/30">
          Connect to Aztec PXE to visualize your Private Note Tree
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-900/30">
            PXE State Structure
          </div>
          <div className="text-[8px] font-mono text-zinc-900/20 mt-0.5">
            Private Execution Environment · Note UTXO Model
          </div>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "Active",      val: liveNotes,      color: "text-zinc-900" },
            { label: "Spent",     val: nullifiedNotes, color: "text-zinc-900/40"     },
            { label: "Pending",   val: pendingNotes,   color: "text-zinc-900/60"   },
          ].map(({ label, val, color }) => (
            <div key={label} className="text-center">
              <div className={`text-[16px] font-light font-mono leading-none ${color}`}>{val}</div>
              <div className="text-[7px] font-black uppercase tracking-widest text-zinc-900/25 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900/8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`px-4 py-2.5 text-[8px] font-black uppercase tracking-widest transition-all
              ${activeView === tab.id
                ? "border-b-[1.5px] border-zinc-900 text-zinc-900"
                : "text-zinc-900/30 hover:text-zinc-900"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* NOTE TREE */}
      <AnimatePresence mode="wait">
        {activeView === "NOTES" && (
          <motion.div
            key="notes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {notes.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-zinc-900/8">
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-900/25">
                  No notes in PXE database
                </div>
                <div className="text-[8px] font-mono text-zinc-900/15 mt-1">
                  Send or receive QDs to populate the note tree
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <AnimatePresence>
                  {notes.map((note) => (
                    <div key={note.id} className="relative">
                      {note.status === "COMMITTED" && lottieData && (
                        <div className="absolute top-2 right-2 pointer-events-none opacity-40 mix-blend-multiply w-12 h-12 z-10">
                          <LottiePlayer animationData={lottieData} loop={false} width={48} height={48} speed={1.2} />
                        </div>
                      )}
                      <CommitmentNode
                        note={note}
                        isSelected={selectedNote?.id === note.id}
                        onClick={() =>
                          setSelectedNote(selectedNote?.id === note.id ? null : note)
                        }
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <AnimatePresence>
              {selectedNote && (
                <NoteDetailPanel
                  note={selectedNote}
                  onClose={() => setSelectedNote(null)}
                />
              )}
            </AnimatePresence>

            <NullifierLog events={nullifierLog} />

            {/* Architecture callout */}
            <div className="border border-zinc-900/8 bg-zinc-900/[0.01] p-4">
              <div className="text-[8px] font-black uppercase tracking-widest text-zinc-900/30 mb-2">
                How Aztec Notes Work
              </div>
              <div className="text-[8px] font-mono text-zinc-900/40 leading-relaxed space-y-1">
                <div>Each QD transfer destroys input Notes (emitting Nullifiers)</div>
                <div>and creates encrypted output Notes in the Note Hash Tree.</div>
                <div>Only you can decrypt your Notes via your incoming viewing key.</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TRANSFER FLOW */}
        {activeView === "FLOW" && (
          <motion.div
            key="flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="border border-zinc-900/8 bg-zinc-900/[0.01] p-4">
              <div className="text-[8px] font-black uppercase tracking-widest text-zinc-900/30 mb-3">
                UTXO-style Private Transfer (simulated)
              </div>
              <TransferFlowDiagram
                fromAmount={balance}
                toAmount={exampleSend}
                change={exampleChange}
              />
            </div>
            <div className="border border-zinc-900/8 bg-zinc-900/[0.015] p-4 space-y-2">
              <div className="text-[8px] font-black uppercase tracking-widest text-zinc-900/30">
                Kernel Circuit enforces
              </div>
              {[
                "sum(inputs) == sum(outputs) + fee",
                "nullifier not in NullifierTree",
                "Schnorr signature valid",
                "note_commitment in NoteHashTree",
              ].map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-zinc-900/60 shrink-0" />
                  <span className="text-[8px] font-mono text-zinc-900/40">{rule}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CIRCUIT PARAMS */}
        {activeView === "CIRCUIT" && (
          <motion.div
            key="circuit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[
              { label: "Proof System",         value: "UltraHonk"                   },
              { label: "Backend",              value: "Barretenberg (Aztec Labs)"   },
              { label: "Circuit Language",     value: "Noir v0.36.0"                },
              { label: "Constraint System",    value: "Ultra PLONK"                 },
              { label: "Note Commitment Tree", value: "Poseidon2 / depth 32"        },
              { label: "Nullifier Tree",       value: "Indexed Merkle / depth 20"   },
              { label: "Key Derivation",       value: "Schnorr · BN254 curve"       },
              { label: "Fee Mechanism",        value: "Fee Juice (gas abstraction)"  },
              { label: "L1 Bridge",            value: "Portal Contracts (Sepolia)"  },
              { label: "Sequencer",            value: "rpc.testnet.aztec-labs.com"  },
              { label: "Node Version",         value: "4.3.1"                       },
              { label: "Block Height",         value: `#${blockRef.current.toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-zinc-900/5 last:border-0">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-900/30">
                  {label}
                </span>
                <span className="text-[8px] font-mono text-zinc-900/60">{value}</span>
              </div>
            ))}
            <div className="border border-zinc-900/8 bg-zinc-900/[0.01] p-4 mt-2">
              <div className="text-[8px] font-black uppercase tracking-widest text-zinc-900/30 mb-2">
                Noir circuit snippet
              </div>
              <pre className="text-[7px] font-mono text-zinc-900/45 leading-relaxed whitespace-pre-wrap">{`fn transfer(
  sender_note: Note,
  recipient: AztecAddress,
  amount: Field,
  sender_key: SecretKey,
) -> (Note, Note) {
  let nullifier = sender_note
    .compute_nullifier(sender_key);
  let recipient_note = Note::new(
    recipient, amount
  );
  let change_note = Note::new(
    sender_note.owner,
    sender_note.amount - amount,
  );
  (recipient_note, change_note)
}`}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
