# Approach and AI disclosure

Built with assistance from OpenAI Codex for requirement analysis, implementation, documentation and testing. No runtime LLM or paid API key is needed. No assignment data is hardcoded into the engine or checked into the source repository. Mozilla PDF.js extracts selectable PDF text in the browser.

The implementation separates a pure procurement engine (`engine.js`), policy/contract parsing (`policy.js`), HTTP application API (`server.js`), and responsive buyer interface (`ui.html`). The build embeds these in a Cloudflare Worker with D1 persistence. Local Node development uses a small persisted adapter and the same API/engine code.

The engine resolves items, validates rows, groups requirements, chooses a policy version, values and routes each group while tracking contract ceilings, then consolidates eligible POs. All decisions include their policy clause and valuation/selection evidence. Supplier rankings are explainable and consistent across buyer suggestions, PO reference prices and date-based CSV export.

Policy changes are reviewable data. Thresholds, timing windows, ranking weights, ordered condition rules and outcomes live in versioned JSON. A bounded text interpreter produces drafts for common amendments; the structured editor supports new combinations of plant, category, value, urgency, history and contract conditions. Nothing activates without explicit buyer approval. Unsupported prose produces an error requiring structured review. This tradeoff avoids pretending that unrestricted document interpretation is reliable.

Validation includes business-rule unit tests, full-sample processing against the provided worked examples, API smoke checks, and browser checks of the principal workflows. The full sample and contract text used for verification remain outside the deliverable source tree. See DECISIONS.md for scope and production limitations.
