# Multi-AI CLI Setup

## Quick Start

The CLI is built and ready to use. Here are several ways to run it:

### Option 1: Use the wrapper script (Easiest)
```bash
./multi-ai.sh [command] [options]
```

Example:
```bash
./multi-ai.sh list
./multi-ai.sh prompt "Hello" -s chatgpt
./multi-ai.sh config cookies list
```

### Option 2: Use node directly
```bash
node packages/cli/dist/index.js [command] [options]
```

### Option 3: Create a global alias (Recommended for frequent use)

Add this to your `~/.zshrc` or `~/.bashrc`:
```bash
alias multi-ai='node /Users/harjjotsinghh/Documents/Projects/multi-ai-at-once/packages/cli/dist/index.js'
```

Then reload your shell:
```bash
source ~/.zshrc  # or source ~/.bashrc
```

### Option 4: Install globally with pnpm

First, set up pnpm's global bin directory:
```bash
pnpm setup
```

Then link the CLI:
```bash
cd packages/cli
pnpm link --global
```

Or create a symlink manually:
```bash
ln -s /Users/harjjotsinghh/Documents/Projects/multi-ai-at-once/packages/cli/dist/index.js ~/.local/bin/multi-ai
# Make sure ~/.local/bin is in your PATH
```

## Testing the CLI

Test that everything works:
```bash
# Using the wrapper script
./multi-ai.sh --help
./multi-ai.sh list
./multi-ai.sh config list
./multi-ai.sh config cookies list
```

## Importing Cookies

1. Install the "Get cookies.txt LOCALLY" browser extension
2. Export cookies from an AI service website (e.g., chatgpt.com)
3. Import them:
   ```bash
   ./multi-ai.sh config cookies import ~/Downloads/chatgpt.com_cookies.txt --service chatgpt
   ```

## Using the CLI

Once set up, you can use commands like:
```bash
multi-ai prompt "Your question" -s chatgpt,claude,gemini
multi-ai config cookies list
multi-ai config cookies import <file> --service <service>
```
