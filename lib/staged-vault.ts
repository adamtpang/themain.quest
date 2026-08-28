import "server-only";

import { createHash, randomUUID } from "crypto";
import {
  access,
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { parseDoNow } from "@/lib/life-command";

type FileManifest = Map<string, string>;
const BACKUP_DIRECTORY = ".tmq-process-backups";

type BackupEntry = {
  relative: string;
  initialHash?: string;
  incomingHash: string;
};

type BackupJournal = {
  operationId: string;
  status: "pending" | "complete" | "rolled-back" | "recovered";
  snapshotStatus?: "pending" | "synced";
  entries: BackupEntry[];
};

export type StagedVault = {
  root: string;
  vault: string;
  skillFile: string;
  initialManifest: FileManifest;
};

export type StagedVaultApplyResult = {
  changedFiles: number;
  operationRoot: string | null;
};

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fileHash(filePath: string): Promise<string> {
  const contents = await readFile(filePath);
  return createHash("sha256").update(contents).digest("hex");
}

async function manifest(root: string, current = root, result: FileManifest = new Map()): Promise<FileManifest> {
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    const relative = path.relative(root, absolute);
    if (relative.split(path.sep)[0] === BACKUP_DIRECTORY) continue;
    if (entry.isDirectory()) await manifest(root, absolute, result);
    else if (entry.isFile()) result.set(relative, await fileHash(absolute));
  }
  return result;
}

function journalPath(operationRoot: string): string {
  return path.join(operationRoot, "journal.json");
}

async function writeJournal(operationRoot: string, journal: BackupJournal): Promise<void> {
  await mkdir(operationRoot, { recursive: true });
  const destination = journalPath(operationRoot);
  const temporary = `${destination}.tmp-${randomUUID()}`;
  await writeFile(temporary, `${JSON.stringify(journal, null, 2)}\n`, "utf8");
  await rename(temporary, destination);
}

async function preserveInterruptedFile(source: string, destination: string): Promise<void> {
  if (!await exists(source)) return;
  await mkdir(path.dirname(destination), { recursive: true });
  await rename(source, destination);
}

async function restoreOriginal(backupPath: string, livePath: string, operationId: string): Promise<void> {
  const restorePath = `${livePath}.tmq-restore-${operationId}`;
  await mkdir(path.dirname(livePath), { recursive: true });
  await copyFile(backupPath, restorePath);
  await rename(restorePath, livePath);
}

async function recoverOperation(liveVault: string, operationRoot: string, journal: BackupJournal): Promise<void> {
  for (const entry of journal.entries) {
    const livePath = path.join(liveVault, entry.relative);
    const backupPath = path.join(operationRoot, "original", entry.relative);
    const interruptedPath = path.join(operationRoot, "interrupted", entry.relative);
    const incomingPath = `${livePath}.tmq-incoming-${journal.operationId}`;

    if (entry.initialHash) {
      if (!await exists(backupPath)) {
        if (await exists(livePath) && await fileHash(livePath) === entry.initialHash) continue;
        throw new Error("An interrupted Process backup needs manual recovery");
      }
      if (await exists(livePath)) {
        const liveHash = await fileHash(livePath);
        if (liveHash === entry.initialHash) {
          await preserveInterruptedFile(incomingPath, path.join(operationRoot, "incoming", entry.relative));
          continue;
        }
        if (liveHash !== entry.incomingHash) throw new Error("A live vault file changed after an interrupted Process run");
        await preserveInterruptedFile(livePath, interruptedPath);
      }
      await restoreOriginal(backupPath, livePath, journal.operationId);
    } else if (await exists(livePath)) {
      if (await fileHash(livePath) !== entry.incomingHash) {
        throw new Error("A new live vault file changed after an interrupted Process run");
      }
      await preserveInterruptedFile(livePath, interruptedPath);
    }

    await preserveInterruptedFile(incomingPath, path.join(operationRoot, "incoming", entry.relative));
  }
}

async function recoverInterruptedApplies(liveVault: string): Promise<void> {
  const backupRoot = path.join(liveVault, BACKUP_DIRECTORY);
  if (!await exists(backupRoot)) return;
  for (const entry of await readdir(backupRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const operationRoot = path.join(backupRoot, entry.name);
    const file = journalPath(operationRoot);
    if (!await exists(file)) continue;
    let journal: BackupJournal;
    try {
      journal = JSON.parse(await readFile(file, "utf8")) as BackupJournal;
    } catch {
      const hasMovedFiles = await exists(path.join(operationRoot, "original"))
        || await exists(path.join(operationRoot, "interrupted"));
      if (hasMovedFiles) throw new Error("A corrupt Process recovery journal needs manual recovery");
      await rename(file, `${file}.corrupt-${Date.now()}`);
      continue;
    }
    if (journal.status !== "pending") continue;
    await recoverOperation(liveVault, operationRoot, journal);
    await writeJournal(operationRoot, { ...journal, status: "recovered" });
  }
}

async function cleanupStaleStages(): Promise<void> {
  const systemTemp = path.resolve(tmpdir());
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const entry of await readdir(systemTemp, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("themain-quest-process-")) continue;
    const candidate = path.resolve(systemTemp, entry.name);
    if (path.dirname(candidate) !== systemTemp) continue;
    const details = await stat(candidate);
    if (details.mtimeMs < cutoff) await rm(candidate, { recursive: true, force: true });
  }
}

function searchableText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function preservedTaskFragments(relative: string, contents: string): string[] {
  const fragments = [...contents.matchAll(/^\s*[-*]\s+\[[ xX]\]\s+(.+)$/gm)].map((match) => match[1]);
  if (/inbox/i.test(path.basename(relative))) {
    fragments.push(...[...contents.matchAll(/^\s*[-*]\s+(?!\[[ xX]\]\s*)(.+)$/gm)].map((match) => match[1]));
  }
  if (path.basename(relative) === "🐆 outbox.md") {
    fragments.push(...parseDoNow(contents).map((quest) => quest.title));
  }
  return fragments.map(searchableText).filter(Boolean);
}

export async function createStagedVault(liveVault: string, processSkillFile: string): Promise<StagedVault> {
  await cleanupStaleStages();
  const root = await mkdtemp(path.join(tmpdir(), "themain-quest-process-"));
  const stagedVault = path.join(root, "vault");
  const stagedSkillDirectory = path.join(root, "process-skill");
  try {
    const [vaultStats, skillStats] = await Promise.all([stat(liveVault), stat(processSkillFile)]);
    if (!vaultStats.isDirectory()) throw new Error("The configured Obsidian vault is not a directory");
    if (!skillStats.isFile()) throw new Error("The configured Process skill is not a file");

    await recoverInterruptedApplies(liveVault);
    const initialManifest = await manifest(liveVault);
    await cp(liveVault, stagedVault, {
      recursive: true,
      force: false,
      errorOnExist: true,
      filter: (source) => path.relative(liveVault, source).split(path.sep)[0] !== BACKUP_DIRECTORY,
    });
    await cp(path.dirname(processSkillFile), stagedSkillDirectory, { recursive: true, force: false, errorOnExist: true });
    const stagedSkillFile = path.join(stagedSkillDirectory, path.basename(processSkillFile));
    const stagedSkillText = await readFile(stagedSkillFile, "utf8");
    const isolatedUserRoot = path.join(root, "isolated-user-root");
    const rewrittenSkill = stagedSkillText
      .split(liveVault).join(stagedVault)
      .replace(/[A-Za-z]:\\Users\\[^\\\s`]+/g, isolatedUserRoot);
    await writeFile(stagedSkillFile, `# Dashboard vault-only safety override

This isolated copy may read and edit Markdown inside ${stagedVault} only. Skip every instruction that requires a live calendar, browser, external application, Aether repository, subagent, message, or network request. Never attempt an original absolute path. The dashboard button performs only the vault portion of Process. Preserve every captured task and idea.

${rewrittenSkill}`, "utf8");
    return {
      root,
      vault: stagedVault,
      skillFile: stagedSkillFile,
      initialManifest,
    };
  } catch (cause) {
    await rm(root, { recursive: true, force: true });
    throw cause;
  }
}

export async function discardStagedVault(stage: StagedVault): Promise<void> {
  await rm(stage.root, { recursive: true, force: true });
}

export async function pendingSnapshotJournals(liveVault: string): Promise<string[]> {
  const backupRoot = path.join(liveVault, BACKUP_DIRECTORY);
  if (!await exists(backupRoot)) return [];
  const pending: string[] = [];
  for (const entry of await readdir(backupRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const operationRoot = path.join(backupRoot, entry.name);
    const file = journalPath(operationRoot);
    if (!await exists(file)) continue;
    try {
      const journal = JSON.parse(await readFile(file, "utf8")) as BackupJournal;
      if (journal.status === "complete" && journal.snapshotStatus !== "synced") pending.push(operationRoot);
    } catch {
      continue;
    }
  }
  return pending;
}

export async function markSnapshotJournalSynced(operationRoot: string): Promise<void> {
  const file = journalPath(operationRoot);
  const journal = JSON.parse(await readFile(file, "utf8")) as BackupJournal;
  await writeJournal(operationRoot, { ...journal, snapshotStatus: "synced" });
}

export async function validateAndApplyStagedVault(stage: StagedVault, liveVault: string): Promise<StagedVaultApplyResult> {
  const stagedManifest = await manifest(stage.vault);
  const missing = [...stage.initialManifest.keys()].filter((relative) => !stagedManifest.has(relative));
  if (missing.length > 0) throw new Error("Process attempted to delete existing vault files");

  const changed = [...stagedManifest.entries()]
    .filter(([relative, hash]) => stage.initialManifest.get(relative) !== hash)
    .map(([relative]) => relative);
  const disallowed = changed.filter((relative) => path.extname(relative).toLowerCase() !== ".md");
  if (disallowed.length > 0) throw new Error("Process attempted to change a non-Markdown vault file");

  const stagedOutbox = path.join(stage.vault, "🐆 outbox.md");
  const outboxText = await readFile(stagedOutbox, "utf8");
  if (parseDoNow(outboxText).length === 0) {
    throw new Error("Process produced an outbox with no playable day-scoped quests");
  }

  const stagedMarkdown = await Promise.all(
    [...stagedManifest.keys()]
      .filter((relative) => path.extname(relative).toLowerCase() === ".md")
      .map((relative) => readFile(path.join(stage.vault, relative), "utf8")),
  );
  const stagedCorpus = searchableText(stagedMarkdown.join("\n"));
  const originalFragments = (
    await Promise.all(
      [...stage.initialManifest.keys()]
        .filter((relative) => path.extname(relative).toLowerCase() === ".md")
        .map(async (relative) => preservedTaskFragments(relative, await readFile(path.join(liveVault, relative), "utf8"))),
    )
  ).flat();
  if (originalFragments.some((fragment) => !stagedCorpus.includes(fragment))) {
    throw new Error("Process did not preserve every existing task capture in the staged vault");
  }

  for (const relative of changed) {
    const stagedText = await readFile(path.join(stage.vault, relative), "utf8");
    if (stagedText.includes("\u2014")) throw new Error("Process introduced a disallowed em dash");

    const livePath = path.join(liveVault, relative);
    const initialHash = stage.initialManifest.get(relative);
    if (initialHash) {
      if (!await exists(livePath) || await fileHash(livePath) !== initialHash) {
        throw new Error("A live vault file changed while Process was running");
      }
    } else if (await exists(livePath)) {
      throw new Error("A new live vault file conflicts with Process output");
    }
  }

  if (changed.length === 0) return { changedFiles: 0, operationRoot: null };

  const operationId = randomUUID();
  const operationRoot = path.join(liveVault, BACKUP_DIRECTORY, operationId);
  const entries: BackupEntry[] = changed.map((relative) => ({
    relative,
    initialHash: stage.initialManifest.get(relative),
    incomingHash: stagedManifest.get(relative)!,
  }));
  const journal: BackupJournal = { operationId, status: "pending", snapshotStatus: "pending", entries };
  await writeJournal(operationRoot, journal);

  try {
    for (const entry of entries) {
      const stagedPath = path.join(stage.vault, entry.relative);
      const livePath = path.join(liveVault, entry.relative);
      await mkdir(path.dirname(livePath), { recursive: true });
      const incomingPath = `${livePath}.tmq-incoming-${operationId}`;
      await copyFile(stagedPath, incomingPath);

      if (entry.initialHash) {
        if (!await exists(livePath) || await fileHash(livePath) !== entry.initialHash) {
          throw new Error("A live vault file changed immediately before Process could apply it");
        }
        const backupPath = path.join(operationRoot, "original", entry.relative);
        await mkdir(path.dirname(backupPath), { recursive: true });
        await rename(livePath, backupPath);
        if (await fileHash(backupPath) !== entry.initialHash) {
          await restoreOriginal(backupPath, livePath, operationId);
          throw new Error("A live vault file changed during the Process commit");
        }
      } else if (await exists(livePath)) {
        throw new Error("A new live vault file appeared immediately before Process could apply it");
      }

      await rename(incomingPath, livePath);
    }
    await writeJournal(operationRoot, { ...journal, status: "complete" });
  } catch (cause) {
    try {
      await recoverOperation(liveVault, operationRoot, journal);
      await writeJournal(operationRoot, { ...journal, status: "rolled-back" });
    } catch (recoveryCause) {
      throw new Error(`Process failed and its durable backup needs manual recovery: ${recoveryCause instanceof Error ? recoveryCause.message : "unknown recovery error"}`);
    }
    throw cause;
  }
  return { changedFiles: changed.length, operationRoot };
}
