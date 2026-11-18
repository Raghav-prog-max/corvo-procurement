# Corvo procurement workspace

A full-stack, policy-driven PR-to-PO application. Node.js 22+ is the only local prerequisite; no npm install or API key is required.

```sh
npm start
```

Open http://127.0.0.1:4173. Local state persists in `.local/workspace.json`. The local development adapter uses a JSON store; the hosted app uses Cloudflare D1 (SQLite) with the checked-in migration. Run `npm test` for business-rule tests and `npm run build` to create the deployable Worker.

## Set up the supplied kit

1. In **Data library**, select the four `master_data` CSVs and the two `contracts` CSVs, then import.
2. Extract and review PDF-only signed contracts individually. Do not re-add existing register contracts: their recorded consumed values are retained. The app rejects duplicates.
3. In **Buyer workspace**, upload a PR batch CSV. Select policy v5.0 for an explicit baseline run, or choose effective dating.
4. Review requirements and their included PR lines. Approve to create an internal PO or sourcing document; an override requires a written reason and retains the original decision. These are internal records, not externally transmitted supplier orders.
5. Export the run's decisions. In **Policy center**, upload an amendment or describe a supported change, review/edit the JSON draft, validate, and approve activation. Reprocess the same batch with the new explicit policy version for Run 2.
6. In **Preferred suppliers**, choose the evaluation date and export the top three for each item.

Task CSVs and PDFs are intentionally absent from the source repository. Imports live in the database, separately from code. No external AI service processes uploaded data. The PDF reader is vendored Mozilla PDF.js (Apache 2.0; license in vendor).

## API

- `GET /api/state`: persisted workspace and run history.
- `POST /api/import`: JSON `{files:[{name:"item_master.csv",text:"..."}]}`.
- `POST /api/process-batch`: raw `text/csv`, multipart field `file`, or JSON `{csv:"...", policy_version:"5.0", label:"run 1"}`. Returns an immutable initial run plus rows, requirements and proposed consolidated POs. An explicit policy version is useful for controlled comparisons; otherwise the requirement date selects the version.
- `GET /api/export?run=RUN-…`: exact requested decision columns, one row per input line.
- `GET /api/preferred?asof=2026-11-01&csv=1`: four-column preferred-supplier export.
- `POST /api/policy/draft`: `{text:"..."}` or `{policy:{...}}`; `POST /api/policy/activate`: `{}`.
- `POST /api/contracts/parse`: `{text:"PDF extracted text"}`; `POST /api/contracts`: `{contract:{...},lines:[...]}`.
- `POST /api/chat`: `{text:"...",draft:{...}}`; return the draft with subsequent messages until confirmed.
- `POST /api/action`: `{run_id,group_id,action:"approve"}` or `{action:"override",route:"RFQ",comment:"..."}`.

## Policy schema

Versioned JSON stores effective date, clubbing and need-by windows, consolidation hours, history windows, ranking weights and ordered first-match rules. Conditions support `new_item`, `item_type`, `category`, `plant`, `emergency`, `value_lt/lte/gt/gte`, `has_history`, `usable_contract`. Equality conditions accept a value or an array. Add scoped rules through JSON without changing code. All compound conditions are AND; create multiple ordered rules for OR.

Document/chat interpretation is deliberately bounded and deterministic: threshold changes, windows and plant/category routing are supported. Unknown prose fails closed and must be represented in the editor. Scanned PDFs require OCR outside the app or manual structured entry. This is not an unrestricted natural-language policy compiler.

## Deployment and access

`dist/server/index.js` is a dependency-free Cloudflare Worker. Sites binds `DB`, applies `.openai/drizzle` migrations, and protects the owner-private deployment. The app is a single-owner workspace; actions are attributed to “Workspace owner”. It does not implement independent employee/buyer accounts or role enforcement. Do not expose the app publicly without adding authentication and role checks. Public source publication and public hosted access are separate operations.

For other Cloudflare hosting, bind a D1 database as `DB`, apply `drizzle/0000_workspace.sql`, then deploy the Worker. Build artifacts contain the UI, API and PDF reader, but no task data. Optimistic database revision checks reject competing writes. Workspace data currently uses a single D1 JSON aggregate; appropriate for the supplied evaluation dataset, not a large multi-tenant production system.
