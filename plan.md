# Multi-AI Prompt Platform - Implementation Plan

## Overview
A platform that sends the same prompt to multiple AI services (ChatGPT, Claude, Gemini, Perplexity, Grok, DeepSeek, Z.ai)
simultaneously via browser automation.

**Architecture:** Monorepo with shared TypeScript core library supporting CLI (MVP), Next.js web app, and Tauri desktop app.

---

## Phase 1: Project Setup

### 1.1 Initialize Monorepo Structure
```
multi-ai-at-once/
├── packages/
│   ├── core/          # Shared TypeScript library
│   ├── cli/           # CLI interface (MVP)
│   ├── web/           # Next.js web app (future)
│   └── desktop/       # Tauri desktop app (future)
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

### 1.2 Initialize Root Files
- Run `pnpm init` to create root `package.json`
- Create `pnpm-workspace.yaml` with `packages: ['packages/*']`
- Create `turbo.json` for build orchestration
- Create `tsconfig.base.json` with shared TypeScript config

### 1.3 Install Core Dependencies
```bash
pnpm add -D -w typescript turbo @types/node
pnpm add -w playwright
npx playwright install chromium
```

---

## Phase 2: Core Library (packages/core)

### 2.1 Initialize Core Package
```bash
cd packages/core
pnpm init
mkdir -p src/{types,services,browser,config,response,errors}
```

### 2.2 Create Type Definitions
**File:** `packages/core/src/types/index.ts`
- Define `AIServiceName` type (union of service names)
- Define `IAIService` interface
- Define `AIResponse` interface
- Define `MultiAIConfig`, `BrowserConfig`, `OutputConfig` interfaces

### 2.3 Implement BrowserManager
**File:** `packages/core/src/browser/BrowserManager.ts`
- Wrap Playwright's Browser API
- Methods: `initialize()`, `createContext()`, `openPage()`, `getPage()`, `close()`
- Manage multiple browser contexts and pages for concurrent AI access

### 2.4 Create Base AIServiceAdapter
**File:** `packages/core/src/services/base/AIServiceAdapter.ts`
- Abstract base class implementing `IAIService`
- Common methods: `waitForElement()`, `typeInElement()`, `clickElement()`
- Abstract methods: `sendPrompt()`, `waitForResponse()`

### 2.5 Implement AI Service Adapters

For each service (ChatGPT, Claude, Gemini, Perplexity, Grok, DeepSeek, Z.ai):
- Create `packages/core/src/services/{service}/selectors.ts` - DOM selectors (URL, textarea, submit button, response container)
- Create `packages/core/src/services/{service}/ChatGPTAdapter.ts` (and similar for others)

**Key selectors for each service:**
| Service | URL | Textarea Selector | Submit Selector |
|---------|-----|-------------------|-----------------|
| ChatGPT | https://chatgpt.com/ | `#prompt-textarea` | `button[data-testid="send-button"]` |
| Claude | https://claude.ai/ | `div[contenteditable="true"]` | `button[type="submit"]` |
| Gemini | https://gemini.google.com/ | `rich-textarea` | `button[aria-label="Send message"]` |
| Perplexity | https://www.perplexity.ai/ | `textarea[placeholder*="ask"]` | `button[type="submit"]` |
| Grok | https://grok.com/ | `div[contenteditable="true"]` | `button[aria-label="Send"]` |
| DeepSeek | https://chat.deepseek.com/ | `textarea[placeholder*="Message"]` | `button[type="submit"]` |
| Z.ai | https://z.ai/ | *(to be determined)* | *(to be determined)* |

### 2.6 Implement ConfigManager
**File:** `packages/core/src/config/ConfigManager.ts`
- Load/save config from `~/.multi-ai-config.json`
- Methods: `load()`, `save()`, `get()`, `update()`

### 2.7 Core Package Exports
**File:** `packages/core/src/index.ts` - Export all public APIs
**File:** `packages/core/package.json` - Configure package with `main` and `types` pointing to `dist/`

---

## Phase 3: CLI Interface (packages/cli)

### 3.1 Initialize CLI Package
```bash
cd packages/cli
pnpm init
mkdir -p src/{commands,ui,utils}
```

### 3.2 Install CLI Dependencies
```bash
pnpm add commander chalk ora inquirer cli-table3
pnpm add -D @types/node @types/inquirer
```

### 3.3 Create Main CLI Entry Point
**File:** `packages/cli/src/index.ts`
- Using Commander.js
- Commands: `prompt`, `config`, `list`

### 3.4 Implement Prompt Command
**File:** `packages/cli/src/commands/prompt.ts`
- Load config
- Initialize BrowserManager
- Create service adapters based on config
- Send prompts concurrently using `Promise.allSettled()`
- Display results with formatted output

### 3.5 Implement Config Command
**File:** `packages/cli/src/commands/config.ts`
- `--set <key=value>` - Update config
- `--get <key>` - View config value
- `--reset` - Reset to defaults

### 3.6 Implement List Command
**File:** `packages/cli/src/commands/list.ts`
- Display available AI services
- Show status (configured/available)

### 3.7 Add CLI Bin Script
**File:** `packages/cli/package.json` - Add `"bin": {"multi-ai": "./dist/index.js"}`

---

## Phase 4: Build & Test

### 4.1 Add Build Scripts
- Add `build` script to each package using `tsc`
- Configure TypeScript to compile to `dist/`

### 4.2 Test CLI Workflow
```bash
# Build core and CLI
pnpm --filter @multi-ai/core build
pnpm --filter @multi-ai/cli build

# Test CLI
node packages/cli/dist/index.js prompt "What is 2+2?"
node packages/cli/dist/index.js prompt "Explain quantum computing" -s chatgpt,claude
node packages/cli/dist/index.js list
```

---

## Critical Files Summary

| File | Purpose |
|------|---------|
| `packages/core/src/types/index.ts` | Type definitions for entire project |
| `packages/core/src/browser/BrowserManager.ts` | Playwright wrapper, manages browser/contexts/pages |
| `packages/core/src/services/base/AIServiceAdapter.ts` | Abstract base class for all AI adapters |
| `packages/core/src/services/chatgpt/selectors.ts` | DOM selectors (template for other services) |
| `packages/core/src/services/chatgpt/ChatGPTAdapter.ts` | First concrete implementation |
| `packages/core/src/index.ts` | Core package exports |
| `packages/cli/src/index.ts` | CLI entry point |
| `packages/cli/src/commands/prompt.ts` | Main prompt command orchestrator |

---

## Verification Steps

1. **Build packages:**
```bash
pnpm install
pnpm build
```

2. **Test CLI with single service:**
```bash
pnpm cli prompt "Hello, world!" -s chatgpt
```

3. **Test CLI with multiple services:**
```bash
pnpm cli prompt "What is the capital of France?" -s chatgpt,claude,gemini
```

4. **Test config commands:**
```bash
pnpm cli config --get services
pnpm cli config --set services=chatgpt,claude
```

5. **Test browser automation manually:**
- Verify browser opens to correct URLs
- Verify prompt is typed into textarea
- Verify submit button is clicked
- Verify response is captured

---

## Future Phases (Not in Initial Implementation)

- **Phase 5:** Next.js web app (`packages/web/`)
- **Phase 6:** Tauri desktop app (`packages/desktop/`)
- **Phase 7:** Advanced features (prompt templates, history, comparison UI)


If you need specific details from before exiting plan mode (like exact code snippets, error messages, or content you generated), read
the full transcript at: /Users/harjjotsinghh/.claude/projects/-Users-harjjotsinghh-Documents-Projects-multi-ai-at-once/2be729d7-17cf-4d
67-abbf-2b42ddd2872e.jsonl