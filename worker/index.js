const RESERVED_SLUGS = new Set(['global', 'projects']);

export default {
  async fetch(request, env) {
    const { method } = request;
    const { pathname } = new URL(request.url);

    if (pathname === '/global') {
      if (method === 'GET') return getFile(env, 'resume-global.md');
      if (method === 'PUT') return putFile(request, env, 'resume-global.md');
    }

    if (pathname === '/projects' && method === 'GET') {
      return listProjects(env);
    }

    const match = pathname.match(/^\/projects\/([^/]+)$/);
    if (match) {
      const slug = match[1];
      if (RESERVED_SLUGS.has(slug)) return text('reserved slug', 400);
      if (method === 'GET') return getFile(env, `projects/${slug}.md`);
      if (method === 'PUT') return putFile(request, env, `projects/${slug}.md`);
      if (method === 'DELETE') return deleteFile(request, env, `projects/${slug}.md`);
    }

    return text('not found', 404);
  },
};

// ─── Handlers ────────────────────────────────────────────────

async function getFile(env, filePath) {
  const res = await github(env, 'GET', filePath);
  if (res.status === 404) return text('not found', 404);
  if (!res.ok) return text('upstream error', 502);
  const { content } = await res.json();
  return new Response(b64decode(content), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

async function listProjects(env) {
  const res = await github(env, 'GET', 'projects');
  if (!res.ok) return text('upstream error', 502);
  const files = await res.json();
  const slugs = files
    .filter(f => f.type === 'file' && f.name.endsWith('.md'))
    .map(f => f.name.slice(0, -3));
  return new Response(JSON.stringify(slugs), { headers: { 'Content-Type': 'application/json' } });
}

async function putFile(request, env, filePath) {
  if (!auth(request, env)) return text('unauthorized', 401);
  const content = await request.text();

  let sha;
  const existing = await github(env, 'GET', filePath);
  if (existing.ok) sha = (await existing.json()).sha;

  const body = { message: `update: ${filePath} via API`, content: b64encode(content), committer: BOT };
  if (sha) body.sha = sha;

  const res = await github(env, 'PUT', filePath, body);
  if (!res.ok) return text('upstream error', 502);
  return text('updated', 200);
}

async function deleteFile(request, env, filePath) {
  if (!auth(request, env)) return text('unauthorized', 401);

  const existing = await github(env, 'GET', filePath);
  if (existing.status === 404) return text('not found', 404);
  if (!existing.ok) return text('upstream error', 502);
  const { sha } = await existing.json();

  const res = await github(env, 'DELETE', filePath, { message: `delete: ${filePath} via API`, sha, committer: BOT });
  if (!res.ok) return text('upstream error', 502);
  return text('deleted', 200);
}

// ─── Helpers ─────────────────────────────────────────────────

const BOT = { name: 'ai-resume-hub[bot]', email: 'ai-resume-hub@users.noreply.github.com' };

function auth(request, env) {
  return request.headers.get('X-API-Key') === env.RESUME_API_KEY;
}

function text(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain' } });
}

function github(env, method, path, body) {
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'ai-resume-hub',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

function b64decode(b64) {
  const clean = b64.replace(/\n/g, '');
  const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  return btoa(String.fromCharCode(...bytes));
}
