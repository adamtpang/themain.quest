// Builds the life-context brief and, with --send, mails it to summon.guide
// through the repos.chat mailbox so the guides there can read it.
//
//   npm run life:context                 print the brief
//   npm run life:context -- --out FILE   also write it to FILE
//   npm run life:context -- --send       also send it as a repos.chat notice
//
// Sending goes through the repos.chat CLI on purpose: it validates that both
// manifests exist in the workspace and writes the message atomically. This
// script never writes into .repo-connect directly.

import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { briefWordCount } from "../lib/life-context";
import { loadLifeContext } from "../lib/life-context-sources";

const REPO_ID = "themain.quest";
const RECIPIENT = "summon.guide";
const SUBJECT = "life-context";

function option(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function reposCommand(workspaceRoot: string): { command: string; prefix: string[] } {
  const local = path.join(workspaceRoot, "repos.chat", "repos.mjs");
  if (existsSync(local)) return { command: process.execPath, prefix: [local] };
  return { command: process.platform === "win32" ? "repos.cmd" : "repos", prefix: [] };
}

async function main(): Promise<number> {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const workspaceRoot = option("root") ?? path.resolve(repoRoot, "..");
  const result = await loadLifeContext({ repoRoot });

  const out = option("out");
  if (out) await writeFile(path.resolve(out), result.markdown, "utf8");

  if (!hasFlag("send") || hasFlag("print")) {
    process.stdout.write(result.markdown);
  }
  console.error(`\n[life-context] ${briefWordCount(result.markdown)} words from: ${result.sources.join("; ") || "no sources"}`);

  if (!hasFlag("send")) return 0;

  const temp = await mkdtemp(path.join(tmpdir(), "life-context-"));
  const bodyFile = path.join(temp, "brief.md");
  await writeFile(bodyFile, result.markdown, "utf8");
  try {
    const { command, prefix } = reposCommand(workspaceRoot);
    const args = [
      ...prefix,
      "send",
      "--root", workspaceRoot,
      "--from", REPO_ID,
      "--to", RECIPIENT,
      "--kind", "notice",
      "--subject", SUBJECT,
      "--body-file", bodyFile,
    ];
    const sent = spawnSync(command, args, { encoding: "utf8", shell: command.endsWith(".cmd") });
    if (sent.status !== 0) {
      console.error(sent.stderr || sent.stdout || `repos send exited ${sent.status}`);
      return 1;
    }
    const id = sent.stdout.match(/"id":\s*"([^"]+)"/)?.[1] ?? "unknown";
    console.error(`[life-context] sent notice ${id} to ${RECIPIENT} (${SUBJECT})`);
    return 0;
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
