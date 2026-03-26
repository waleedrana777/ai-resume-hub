import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from '../index.js';

const ENV = {
  GITHUB_TOKEN: 'test-github-token',
  RESUME_API_KEY: 'test-api-key',
  GITHUB_OWNER: 'waleedrana777',
  GITHUB_REPO: 'ai-resume-hub',
};

function req(method, path, opts = {}) {
  return new Request(`https://ai-resume-hub.workers.dev${path}`, { method, ...opts });
}

function b64(str) {
  return Buffer.from(str).toString('base64');
}

function mockGitHub(responses) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
    const key = `${options?.method ?? 'GET'} ${url}`;
    for (const [pattern, response] of responses) {
      if (key.includes(pattern)) return response;
    }
    return new Response('not found', { status: 404 });
  });
}

afterEach(() => vi.restoreAllMocks());

// ─── GET /global ───────────────────────────────────────────
describe('GET /global', () => {
  it('returns resume-global.md content as plain text', async () => {
    mockGitHub([
      ['resume-global.md', new Response(JSON.stringify({ content: b64('# Global Resume\n'), sha: 'abc' }), { status: 200 })]
    ]);
    const res = await worker.fetch(req('GET', '/global'), ENV);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
    expect(await res.text()).toBe('# Global Resume\n');
  });

  it('returns 404 when file does not exist on GitHub', async () => {
    mockGitHub([['resume-global.md', new Response('', { status: 404 })]]);
    const res = await worker.fetch(req('GET', '/global'), ENV);
    expect(res.status).toBe(404);
    expect(await res.text()).toBe('not found');
  });

  it('returns 502 when GitHub returns error', async () => {
    mockGitHub([['resume-global.md', new Response('', { status: 500 })]]);
    const res = await worker.fetch(req('GET', '/global'), ENV);
    expect(res.status).toBe(502);
  });
});

// ─── GET /projects ─────────────────────────────────────────
describe('GET /projects', () => {
  it('returns JSON array of project slugs', async () => {
    const files = [
      { name: 'prompt-ai.md', type: 'file' },
      { name: 'ecommerce-dashboard.md', type: 'file' },
      { name: '.gitkeep', type: 'file' },
    ];
    mockGitHub([
      ['contents/projects', new Response(JSON.stringify(files), { status: 200 })]
    ]);
    const res = await worker.fetch(req('GET', '/projects'), ENV);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    const slugs = await res.json();
    expect(slugs).toEqual(['prompt-ai', 'ecommerce-dashboard']);
  });
});

// ─── GET /projects/:name ────────────────────────────────────
describe('GET /projects/:name', () => {
  it('returns project resume content as plain text', async () => {
    mockGitHub([
      ['projects/prompt-ai.md', new Response(JSON.stringify({ content: b64('# Prompt AI Resume\n'), sha: 'def' }), { status: 200 })]
    ]);
    const res = await worker.fetch(req('GET', '/projects/prompt-ai'), ENV);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('# Prompt AI Resume\n');
  });

  it('returns 404 for unknown project', async () => {
    mockGitHub([['projects/unknown.md', new Response('', { status: 404 })]]);
    const res = await worker.fetch(req('GET', '/projects/unknown'), ENV);
    expect(res.status).toBe(404);
  });

  it('returns 400 for reserved slug "global"', async () => {
    const res = await worker.fetch(req('GET', '/projects/global'), ENV);
    expect(res.status).toBe(400);
    expect(await res.text()).toBe('reserved slug');
  });
});
