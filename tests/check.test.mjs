import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { check } from '../scripts/check.mjs';

const root = path.resolve(import.meta.dirname, '..');

function edited(from, to) {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'plugin-'));
    try {
        for (const name of ['.claude-plugin', 'skills', 'README.md']) {
            cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
        }
        const file = path.join(dir, 'skills', 'alts', 'SKILL.md');
        const text = readFileSync(file, 'utf8');
        assert.ok(text.includes(from));
        writeFileSync(file, text.replace(from, () => to));
        return check(dir);
    } finally {
        rmSync(dir, { recursive: true });
    }
}

test('the plugin is valid', () => assert.deepEqual(check(root), []));
test('a wrong name is reported', () => assert.match(edited('name: alts', 'name: other')[0], /directory/));
test('a pinned version is reported', () => assert.match(edited('alts:VERSION\'', 'alts:v1.0.0\'')[0], /pinned/));
test('a machine path is reported', () => assert.match(edited('## Pitfalls', 'C:\\Users\\x')[0], /machine path/));
