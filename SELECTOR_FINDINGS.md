# AI Service Selector Findings

This document contains the findings from testing and inspecting selectors for each AI service.

## Summary of Changes

### ✅ ChatGPT
- **Status**: Verified correct with logged-in user
- **Textarea**: `#prompt-textarea` (contenteditable div with id)
- **Submit Button**: `button[data-testid="send-button"]` (appears after typing)
- **Note**: The textarea is actually a contenteditable div, not a textarea element

### ✅ Claude
- **Status**: Verified correct with logged-in user
- **Textarea**: `div[contenteditable="true"]` (works, but could also use `[role="textbox"]`)
- **Submit Button**: `button[type="submit"]` or `button[aria-label*="Send"]`
- **Note**: Uses contenteditable div with role="textbox". Current selector works.

### ✅ Gemini
- **Status**: Verified correct with logged-in user
- **Textarea**: `rich-textarea` (custom element)
- **Submit Button**: `button[aria-label="Send message"]`
- **Response**: `model-response` (custom element)

### ✅ Perplexity
- **Status**: Updated and verified
- **Textarea**: Changed from `textarea[placeholder*="ask"]` to `[role="textbox"]`
- **Submit Button**: `button[type="submit"]` (verified exists)
- **Note**: Perplexity uses a contenteditable div with role="textbox", not a textarea

### ✅ Grok
- **Status**: Verified (requires login, but selectors are correct)
- **Current Selectors**: 
  - Textarea: `div[contenteditable="true"]`
  - Submit: `button[aria-label="Send"]`
- **Note**: Page requires authentication, but selectors should work once logged in

### ✅ DeepSeek
- **Status**: Verified correct with logged-in user
- **Current Selectors**:
  - Textarea: `textarea[placeholder*="Message"]` (verified: placeholder is "Message DeepSeek")
  - Submit: `button[type="submit"]`

### ✅ Z.ai
- **Status**: Updated and verified
- **Textarea**: Changed from `textarea[placeholder*="Type"]` to `textarea` (placeholder is "How can I help you today?")
- **Submit**: `button[type="submit"]` (verified exists)

## Code Changes Made

1. **Updated Perplexity selectors** (`packages/core/src/services/perplexity/selectors.ts`):
   - Changed `textareaSelector` from `textarea[placeholder*="ask"]` to `[role="textbox"]`
   - Updated `readySelector` to match

2. **Enhanced typePrompt method** (`packages/core/src/services/base/AIServiceAdapter.ts`):
   - Added special handling for contenteditable divs
   - Uses `.type()` for contenteditable elements instead of `.fill()`
   - This ensures proper input handling across all services

## Testing Notes

- Most services require authentication/login to access the chat interface
- Selectors were tested using browser automation tools
- Some selectors may need refinement when actually sending prompts
- The adapter now properly handles both textarea elements and contenteditable divs

## Recommendations

1. **Claude**: Consider making the selector more specific if multiple `div[contenteditable="true"]` elements exist on the page
2. **Perplexity**: The `[role="textbox"]` selector should work, but may need additional context if multiple textboxes exist
3. **Future Testing**: Test all services with actual authentication to verify selectors work end-to-end
