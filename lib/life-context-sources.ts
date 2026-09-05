import "server-only";

import { readFile } from "fs/promises";
import path from "path";
import { getLifeCommandData } from "@/lib/life-command";
import { buildLifeContextBrief, type LifeContextSources } from "@/lib/life-context";

export type LifeContextResult = {
  markdown: string;
  generatedAt: string;
  sources: string[];
};

const QUESTBOOK_FILES = ["questbook.md"] as const;
const VAULT_QUESTBOOK_FILES = ["0. 🗺️ QUESTBOOK.md", "🗺️ QUESTBOOK.md"] as const;
const VAULT_CHARACTER_FILES = ["🧙 CHARACTER.md"] as const;

export function resolveVaultPath(): string | null {
  const configured = process.env.OBSIDIAN_VAULT_PATH?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production" && process.env.USERPROFILE) {
    return path.join(process.env.USERPROFILE, "ObsidianVault");
  }
  return null;
}

async function firstReadable(candidates: string[]): Promise<{ text: string; file: string } | null> {
  for (const file of candidates) {
    try {
      return { text: await readFile(file, "utf8"), file };
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Gathers the brief's inputs from the repository and the vault. Every input
 * is optional: a missing file drops a section instead of failing the whole
 * brief, and the `sources` list records what was actually read.
 */
export async function loadLifeContext(options: { repoRoot?: string } = {}): Promise<LifeContextResult> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const vault = resolveVaultPath();
  const sources: string[] = [];

  const questbook = await firstReadable([
    ...QUESTBOOK_FILES.map((file) => path.join(repoRoot, file)),
    ...(vault ? VAULT_QUESTBOOK_FILES.map((file) => path.join(vault, file)) : []),
  ]);
  if (questbook) sources.push(questbook.file);

  const deathguide = await firstReadable([path.join(repoRoot, "deathguide.md")]);
  if (deathguide) sources.push(deathguide.file);

  const character = vault
    ? await firstReadable(VAULT_CHARACTER_FILES.map((file) => path.join(vault, file)))
    : null;
  if (character) sources.push(character.file);

  let oneMove: LifeContextSources["oneMove"] = null;
  let recentSkipReasons: string[] = [];
  try {
    const data = await getLifeCommandData();
    const open = data.quests.filter((quest) => !quest.completed && !quest.skipped);
    if (open.length) {
      oneMove = {
        title: open[0].title,
        category: open[0].category,
        estimatedMinutes: open[0].estimatedMinutes,
        openCount: open.length,
      };
      sources.push(`live outbox (${data.source})`);
    }
    recentSkipReasons = data.flowLearning.recentSkipReasons;
  } catch {
    // The live outbox is optional. The questbook alone still makes a brief.
  }

  const generatedAt = new Date().toISOString();
  const markdown = buildLifeContextBrief({
    generatedAt,
    questbook: questbook?.text ?? null,
    deathguide: deathguide?.text ?? null,
    character: character?.text ?? null,
    oneMove,
    recentSkipReasons,
  });

  return { markdown, generatedAt, sources };
}
