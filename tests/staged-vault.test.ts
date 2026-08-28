import assert from "node:assert/strict";
import { access, mkdtemp, mkdir, readFile, readdir, rm, unlink, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  createStagedVault,
  discardStagedVault,
  markSnapshotJournalSynced,
  pendingSnapshotJournals,
  validateAndApplyStagedVault,
} from "../lib/staged-vault";

const initialOutbox = `# ASAP SUCCESS CHECKLIST

### 09:00-09:10 · ✦ [Tier 1] [P9] Open the plan

- [ ] Put the plan on screen.

**Done means:** The plan is visible.
`;

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "tmq-stage-test-"));
  const vault = path.join(root, "vault");
  const skillDirectory = path.join(root, "skill");
  await Promise.all([mkdir(vault), mkdir(skillDirectory)]);
  await writeFile(path.join(vault, "🐆 outbox.md"), initialOutbox, "utf8");
  await writeFile(path.join(vault, "questbook.md"), "# Life plan\n", "utf8");
  const skillFile = path.join(skillDirectory, "SKILL.md");
  await writeFile(skillFile, "# Process\n", "utf8");
  return { root, vault, skillFile };
}

test("validated staged Markdown changes are applied to the live vault", async () => {
  const files = await fixture();
  const stage = await createStagedVault(files.vault, files.skillFile);
  try {
    const changed = `${initialOutbox}\n### 09:10-09:20 · ✦ [Tier 2] [P8] Eat breakfast\n\n- [ ] Put food on a plate.\n`;
    await writeFile(path.join(stage.vault, "🐆 outbox.md"), changed, "utf8");
    assert.equal((await validateAndApplyStagedVault(stage, files.vault)).changedFiles, 1);
    assert.equal(await readFile(path.join(files.vault, "🐆 outbox.md"), "utf8"), changed);
    const operations = await readdir(path.join(files.vault, ".tmq-process-backups"));
    assert.equal(operations.length, 1);
    assert.equal(
      await readFile(path.join(files.vault, ".tmq-process-backups", operations[0], "original", "🐆 outbox.md"), "utf8"),
      initialOutbox,
    );
    const nextStage = await createStagedVault(files.vault, files.skillFile);
    try {
      assert.equal([...nextStage.initialManifest.keys()].some((relative) => relative.includes(".tmq-process-backups")), false);
    } finally {
      await discardStagedVault(nextStage);
    }
  } finally {
    await discardStagedVault(stage);
    await rm(files.root, { recursive: true, force: true });
  }
});

test("a staged deletion is rejected and leaves the live vault untouched", async () => {
  const files = await fixture();
  const stage = await createStagedVault(files.vault, files.skillFile);
  try {
    await unlink(path.join(stage.vault, "questbook.md"));
    await assert.rejects(() => validateAndApplyStagedVault(stage, files.vault), /delete existing vault files/);
    assert.equal(await readFile(path.join(files.vault, "questbook.md"), "utf8"), "# Life plan\n");
  } finally {
    await discardStagedVault(stage);
    await rm(files.root, { recursive: true, force: true });
  }
});

test("removing a task from Markdown without preserving it elsewhere is rejected", async () => {
  const files = await fixture();
  const stage = await createStagedVault(files.vault, files.skillFile);
  try {
    await writeFile(path.join(stage.vault, "🐆 outbox.md"), `# ASAP SUCCESS CHECKLIST

### 09:00-09:10 · ✦ [Tier 1] [P9] Open the plan

- [ ] Do something else.
`, "utf8");
    await assert.rejects(() => validateAndApplyStagedVault(stage, files.vault), /preserve every existing task capture/);
    assert.equal(await readFile(path.join(files.vault, "🐆 outbox.md"), "utf8"), initialOutbox);
  } finally {
    await discardStagedVault(stage);
    await rm(files.root, { recursive: true, force: true });
  }
});

test("short task captures cannot disappear during Process", async () => {
  const files = await fixture();
  await writeFile(path.join(files.vault, "🐆 outbox.md"), `${initialOutbox}\n- [ ] Eat\n`, "utf8");
  const stage = await createStagedVault(files.vault, files.skillFile);
  try {
    await writeFile(path.join(stage.vault, "🐆 outbox.md"), initialOutbox, "utf8");
    await assert.rejects(() => validateAndApplyStagedVault(stage, files.vault), /preserve every existing task capture/);
  } finally {
    await discardStagedVault(stage);
    await rm(files.root, { recursive: true, force: true });
  }
});

test("completed applies remain pending until their private snapshot is synchronized", async () => {
  const files = await fixture();
  const stage = await createStagedVault(files.vault, files.skillFile);
  try {
    await writeFile(path.join(stage.vault, "questbook.md"), "# Life plan\n\nProgress kept.\n", "utf8");
    const applied = await validateAndApplyStagedVault(stage, files.vault);
    assert.ok(applied.operationRoot);
    assert.deepEqual(await pendingSnapshotJournals(files.vault), [applied.operationRoot]);
    await markSnapshotJournalSynced(applied.operationRoot);
    assert.deepEqual(await pendingSnapshotJournals(files.vault), []);
  } finally {
    await discardStagedVault(stage);
    await rm(files.root, { recursive: true, force: true });
  }
});

test("a corrupt unused journal is quarantined instead of blocking Process", async () => {
  const files = await fixture();
  const operationRoot = path.join(files.vault, ".tmq-process-backups", "corrupt-test");
  await mkdir(operationRoot, { recursive: true });
  await writeFile(path.join(operationRoot, "journal.json"), "not json", "utf8");
  const stage = await createStagedVault(files.vault, files.skillFile);
  try {
    const names = await readdir(operationRoot);
    assert.equal(names.some((name) => name.startsWith("journal.json.corrupt-")), true);
  } finally {
    await discardStagedVault(stage);
    await rm(files.root, { recursive: true, force: true });
  }
});

test("stale isolated Process directories are cleaned before the next run", async () => {
  const stale = await mkdtemp(path.join(tmpdir(), "themain-quest-process-stale-test-"));
  const old = new Date(Date.now() - 48 * 60 * 60 * 1000);
  await utimes(stale, old, old);
  const files = await fixture();
  const stage = await createStagedVault(files.vault, files.skillFile);
  try {
    await assert.rejects(() => access(stale));
  } finally {
    await discardStagedVault(stage);
    await rm(stale, { recursive: true, force: true });
    await rm(files.root, { recursive: true, force: true });
  }
});
