import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MACHINE_PATH = /([A-Za-z]:\\Users\\|\/home\/[a-z]|\/Users\/[A-Za-z])/;
const SECRET = /(gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;
const SKIP = new Set(['.git', 'node_modules', 'tests']);

function walk(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        if (SKIP.has(e.name)) return [];
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walk(p) : [p];
    });
}

export function check(root) {
    const problems = [];
    const read = (...p) => readFileSync(path.join(root, ...p), 'utf8');

    const plugin = JSON.parse(read('.claude-plugin', 'plugin.json'));
    const market = JSON.parse(read('.claude-plugin', 'marketplace.json'));
    if (!/^\d+\.\d+\.\d+$/.test(plugin.version ?? '')) problems.push('plugin.json: version must be semver');
    if (!market.plugins?.some((p) => p.name === plugin.name)) problems.push('marketplace.json: plugin not listed');

    const readme = read('README.md');
    for (const name of readdirSync(path.join(root, 'skills'))) {
        const at = `skills/${name}/SKILL.md`;
        if (!existsSync(path.join(root, at))) {
            problems.push(`${at}: missing`);
            continue;
        }
        const text = read(at);
        const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text)?.[1] ?? '';
        const description = /^description: (.+)$/m.exec(front)?.[1] ?? '';
        if (/^name: (.+)$/m.exec(front)?.[1] !== name) problems.push(`${at}: name must equal the directory`);
        if (!description.startsWith('This skill should be used when')) problems.push(`${at}: description form`);
        if (description.length > 1024) problems.push(`${at}: description over 1024 characters`);
        if (description.includes(': ')) problems.push(`${at}: description is not a plain YAML string`);
        if (/'(?:lol\.trq|com\.github\.trq-lol):[^']*:v?\d/.test(text)) problems.push(`${at}: pinned version`);
        if (!text.includes(`/lol.trq.${name}/main/llms.txt`)) problems.push(`${at}: no link to the library index`);
        if (!readme.includes(`| \`${name}\` |`)) problems.push(`README.md: ${name} not listed`);
    }

    for (const file of walk(root)) {
        const text = readFileSync(file, 'utf8');
        if (MACHINE_PATH.test(text)) problems.push(`${path.relative(root, file)}: machine path`);
        if (SECRET.test(text)) problems.push(`${path.relative(root, file)}: possible secret`);
    }
    return problems;
}

async function checkLinks(root) {
    const urls = new Set(
        walk(path.join(root, 'skills')).flatMap((f) => readFileSync(f, 'utf8').match(/https:\/\/[^\s)>'`]+/g) ?? []),
    );
    urls.delete('https://jitpack.io');
    const results = await Promise.all(
        [...urls]
            .filter((u) => !u.startsWith('https://maven.pkg.github.com/'))
            .map(async (u) => {
                const status = await fetch(u).then((r) => r.status, (e) => e.message);
                return status === 200 ? [] : [`${u}: ${status}`];
            }),
    );
    return results.flat();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    const root = path.resolve(import.meta.dirname, '..');
    const problems = check(root);
    if (process.argv.includes('--links')) problems.push(...(await checkLinks(root)));
    for (const p of problems) console.error(p);
    console.log(problems.length ? `${problems.length} problem(s)` : 'plugin ok');
    process.exitCode = problems.length ? 1 : 0;
}
