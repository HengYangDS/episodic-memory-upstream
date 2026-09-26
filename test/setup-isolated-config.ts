import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Isolate every test run from the developer's real ~/.config/superpowers.
 * Without this, getSuperpowersDir()'s ensureDir side effect creates real dirs
 * (and sometimes a real db.sqlite) when EPISODIC_MEMORY_CONFIG_DIR is unset.
 * See https://github.com/obra/episodic-memory/issues/119
 */
const isolatedRoot = mkdtempSync(join(tmpdir(), 'episodic-memory-vitest-'));

process.env.EPISODIC_MEMORY_CONFIG_DIR = join(isolatedRoot, 'superpowers');
process.env.CLAUDE_CONFIG_DIR = join(isolatedRoot, 'claude');
process.env.CODEX_HOME = join(isolatedRoot, 'codex');
// Keep model downloads in the disposable package tree rather than each test's
// isolated configuration directory or the developer's durable model cache.
process.env.EPISODIC_MEMORY_MODEL_CACHE_DIR = join(
  dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', '@huggingface', 'transformers', '.cache'
);

// Clear any ambient summarizer-billing signals so tests get deterministic
// cost-guard (#104) and timeout (#160) behavior regardless of the developer's
// shell. No test needs a real API key — they all mock the SDK query(). Tests
// that exercise the metered guard set these vars in their own bodies.
delete process.env.ANTHROPIC_API_KEY;
delete process.env.EPISODIC_MEMORY_ALLOW_METERED_API;
delete process.env.EPISODIC_MEMORY_API_BASE_URL;
delete process.env.EPISODIC_MEMORY_API_TOKEN;
delete process.env.EPISODIC_MEMORY_SUMMARY_TIMEOUT_MS;
