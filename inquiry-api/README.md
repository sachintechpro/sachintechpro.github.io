# Portfolio inquiry API

A small Python backend receiving the public portfolio contact form and emailing project inquiries through a private SMTP account.

## Render deployment
- Repository: `sachintechpro/sachintechpro.github.io`
- Runtime: Python
- Build command: `echo ready`
- Start command: `python inquiry-api/server.py`
- Intended Render service name: `sachintechpro-inquiries`
- Environment: `SMTP_HOST`, `SMTP_PORT` (typically 587), `SMTP_USER`, `SMTP_PASSWORD` and `INQUIRY_TO` (private recipient).
- Configure mail provider credentials only in Render environment settings; **never commit secrets**.
- Health check: `GET /health`
- The public form posts to `POST /api/inquiry` with CORS restricted to the GitHub Pages site.

No inquiry email is sent until the mail provider is configured and the service is deployed. Production hardening could include provider-side bot protection and persistent distributed rate limits.
