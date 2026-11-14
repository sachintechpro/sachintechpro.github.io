"""Private SMTP-backed inquiry endpoint for the SachinTechpro portfolio.

Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and INQUIRY_TO in Render.
Never commit credentials. SMTP_USER must be authorized by the mail provider.
"""
import json
import os
import re
import smtplib
import ssl
import time
from collections import defaultdict, deque
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ORIGIN = "https://sachintechpro.github.io"
BUCKETS = defaultdict(deque)
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

class Handler(BaseHTTPRequestHandler):
    def respond(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Vary", "Origin")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            return self.respond(200, {"status": "ok", "mail_configured": all(os.getenv(k) for k in ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "INQUIRY_TO"))})
        return self.respond(404, {"error": "Not found"})

    def do_POST(self):
        if self.path != "/api/inquiry":
            return self.respond(404, {"error": "Not found"})
        if self.headers.get("Origin") != ORIGIN:
            return self.respond(403, {"error": "Origin not allowed"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not (0 < length <= 9000):
                return self.respond(413, {"error": "Invalid request size"})
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError("Invalid input")
        except (ValueError, json.JSONDecodeError):
            return self.respond(400, {"error": "Malformed request"})
        if data.get("website"):
            return self.respond(200, {"success": True})
        ip = self.client_address[0]
        now = time.monotonic()
        queue = BUCKETS[ip]
        while queue and now - queue[0] > 3600:
            queue.popleft()
        if len(queue) >= 5:
            return self.respond(429, {"error": "Too many inquiries; try later"})
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip()
        company = str(data.get("company", "")).strip()
        company_website = str(data.get("companyWebsite", "")).strip()
        address = str(data.get("address", "")).strip()
        country_code = str(data.get("countryCode", "+1")).strip()
        phone = str(data.get("phone", "")).strip()
        kind = str(data.get("type", "")).strip()
        project = str(data.get("project", "")).strip()
        timeline = str(data.get("timeline", "")).strip()
        allowed_types = {"Employment opportunity", "Contract engineering engagement", "Project-based development", "Technical consultation"}
        if not (1 <= len(name) <= 120 and len(email) <= 180 and EMAIL_RE.fullmatch(email) and len(company) <= 160 and len(company_website) <= 300 and (not company_website or re.fullmatch(r"https?://[^\\s/]+(?:/[^\\s]*)?", company_website)) and len(address) <= 500 and re.fullmatch(r"\+[1-9]\d{0,3}", country_code) and (not phone or (7 <= len(re.sub(r"\D", "", phone)) <= 15 and re.fullmatch(r"[0-9 ()+.-]+", phone))) and kind in allowed_types and 15 <= len(project) <= 4000 and len(timeline) <= 100):
            return self.respond(400, {"error": "Please check your form fields"})
        fields = ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "INQUIRY_TO")
        if not all(os.getenv(k) for k in fields):
            return self.respond(503, {"error": "Mail delivery not configured"})
        msg = EmailMessage()
        msg["Subject"] = "SachinTechpro inquiry: " + kind
        msg["From"] = os.environ["SMTP_USER"]
        msg["To"] = os.environ["INQUIRY_TO"]
        msg["Reply-To"] = email
        msg.set_content(
            f"Name: {name}\\n"
            f"Email: {email}\\n"
            f"Organization: {company}\\n"
            f"Website: {company_website or '(not provided)'}\\n"
            f"Address: {address or '(not provided)'}\\n"
            f"Phone: {country_code} {phone or '(not provided)'}\\n"
            f"Opportunity: {kind}\\n"
            f"Timeline: {timeline}\\n\\n"
            f"Project / request:\\n{project}\\n"
        )
        try:
            with smtplib.SMTP(os.environ["SMTP_HOST"], int(os.getenv("SMTP_PORT", "587")), timeout=15) as smtp:
                smtp.starttls(context=ssl.create_default_context())
                smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
                smtp.send_message(msg)
        except Exception:
            self.log_error("Mail sending failed")
            return self.respond(502, {"error": "Mail delivery failed"})
        queue.append(now)
        return self.respond(200, {"success": True})

if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", int(os.getenv("PORT", "10000"))), Handler).serve_forever()
