
# n8n-nodes-veritrust-a2a-registry

Community node for the **Veritrust A2A Agent Registry**.

## Install
- In n8n: **Settings → Community Nodes → Install**: `n8n-nodes-veritrust-a2a-registry`

## Credentials
- **Base URL**: e.g. `https://a2a.veritrust.vc`
- **API Key**: optional; sent as `Authorization: Bearer <key>` (or custom header)

## Operations
- **List Agents**
- **Get Agent** (by UUID)
- **Search Agents**
- **Register Agent** (by Agent Card URL)
- **Re-verify Agent** (by UUID)

## Notes
- Matches Veritrust Registry API endpoints: `/api/agents.php`, `/api/search.php`, `/api/register.php`, `/api/reverify.php`, `/api/health.php`.
