"""Verified inquiry workflow for the SachinTechpro portfolio.

Configure credentials only as private Render environment variables. No inquiry
records or message history are stored by this service.
"""
import base64
import hashlib
import hmac
import html
import json
import os
import re
import secrets
import smtplib
import ssl
import time
import urllib.parse
import urllib.request
from collections import defaultdict, deque
from email.message import EmailMessage
from email.utils import formataddr
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ORIGIN = "https://sachintechpro.github.io"
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_RE = re.compile(r"^\+[1-9]\d{7,14}$")
SITE_URL = "https://sachintechpro.github.io/"
BUCKETS = defaultdict(deque)
CHALLENGES = {}
PROJECTS = {"MarketOps 360", "Ternstone ValueOps", "Column & Key", "KindredPath", "Cedarline Insurance", "WorkerComp Insurance", "PlanBridge Retirement Ops", "Value & Delivery Workbench", "CommerceDesk", "PixelProof", "IdentityFlow"}
OPPORTUNITIES = {"Project Manager role", "Program Manager role", "Portfolio Manager role", "Forward Deployed Engineer / AI Solutions Engineer role", "Independent contract", "Project-based development", "Technical consultation", "Something else"}

def signing_key():
    value = os.getenv("VERIFY_SECRET", "")
    return value.encode("utf-8") if len(value) >= 32 else None

def b64(data):
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")

def unb64(value):
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))

def issue_token(data, ttl):
    key = signing_key()
    if not key:
        raise RuntimeError("Verification is not configured")
    payload = dict(data, exp=int(time.time()) + ttl)
    body = b64(json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))
    signature = b64(hmac.new(key, body.encode("ascii"), hashlib.sha256).digest())
    return body + "." + signature

def read_token(token, purpose):
    try:
        body, signature = token.split(".", 1)
        key = signing_key()
        if not key:
            return None
        expected = b64(hmac.new(key, body.encode("ascii"), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            return None
        payload = json.loads(unb64(body))
        if payload.get("purpose") != purpose or int(payload.get("exp", 0)) < int(time.time()):
            return None
        return payload
    except (ValueError, TypeError, json.JSONDecodeError, UnicodeDecodeError):
        return None

def sender_email():
    return "Sachin.techpro@gmail.com"

def inquiry_recipient():
    return os.getenv("INQUIRY_TO", "Sachin.techpro@gmail.com")

def mail_configured():
    return bool(os.getenv("SMTP_HOST") and os.getenv("SMTP_PASSWORD"))

def mail_message(to, subject, text, html_body=None, reply_to=None):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = formataddr(("SachinTechpro", sender_email()))
    msg["To"] = to
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(text)
    if html_body:
        msg.add_alternative(html_body, subtype="html")
    with smtplib.SMTP(os.environ["SMTP_HOST"], int(os.getenv("SMTP_PORT", "587")), timeout=18) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        smtp.login(os.getenv("SMTP_USER", sender_email()), os.environ["SMTP_PASSWORD"])
        smtp.send_message(msg)

def smtp_ready():
    return mail_configured() and signing_key() is not None

def twilio_ready():
    return all(os.getenv(k) for k in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"))

def twilio_send(to, from_number, body=None, content_sid=None, content_variables=None):
    sid = os.environ["TWILIO_ACCOUNT_SID"]
    url = "https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json"
    values = {"To": to, "From": from_number}
    if content_sid:
        values["ContentSid"] = content_sid
        values["ContentVariables"] = json.dumps(content_variables or {})
    else:
        values["Body"] = body or ""
    data = urllib.parse.urlencode(values).encode("utf-8")
    auth = base64.b64encode((sid + ":" + os.environ["TWILIO_AUTH_TOKEN"]).encode("utf-8")).decode("ascii")
    request = urllib.request.Request(url, data=data, headers={"Authorization": "Basic " + auth, "Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(request, timeout=18) as response:
        result = json.loads(response.read().decode("utf-8"))
    return result.get("sid") is not None

def limited(key, maximum, window):
    now = time.monotonic()
    queue = BUCKETS[key]
    while queue and now - queue[0] > window:
        queue.popleft()
    if len(queue) >= maximum:
        return False
    queue.append(now)
    return True

def clean(value, limit):
    return str(value or "").strip()[:limit]

def first_name(name):
    return clean(name, 120).split(" ")[0] if clean(name, 120) else "there"

class Handler(BaseHTTPRequestHandler):
    def respond(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Vary", "Origin")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Vary", "Origin")
        self.end_headers()

    def body(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not (0 < length <= 16000):
                return None
            value = json.loads(self.rfile.read(length))
            return value if isinstance(value, dict) else None
        except (ValueError, json.JSONDecodeError):
            return None

    def do_GET(self):
        if self.path == "/health":
            return self.respond(200, {"status":"ok","email_configured":mail_configured(),"verification_configured":smtp_ready(),"sms_configured":twilio_ready(),"whatsapp_configured":bool(os.getenv("TWILIO_WHATSAPP_FROM") and os.getenv("TWILIO_WHATSAPP_CONTENT_SID") and twilio_ready())})
        return self.respond(404, {"error":"Not found"})

    def do_POST(self):
        if self.headers.get("Origin") != ORIGIN:
            return self.respond(403, {"error":"Origin not allowed"})
        data = self.body()
        if data is None:
            return self.respond(400, {"error":"Malformed request"})
        if data.get("website"):
            return self.respond(200, {"success":True})
        ip = self.client_address[0]

        if self.path == "/api/verify/email/start":
            name, email = clean(data.get("name"), 120), clean(data.get("email"), 180).lower()
            if not (name and EMAIL_RE.fullmatch(email)):
                return self.respond(400, {"error":"Enter your name and a valid email address."})
            if not smtp_ready():
                return self.respond(503, {"error":"Email verification is not configured yet. Please try again later."})
            if not limited("email:" + ip, 4, 3600):
                return self.respond(429, {"error":"Too many confirmation requests. Please try again later."})
            try:
                token = issue_token({"purpose":"email-confirm","name":name,"email":email}, 1200)
                link = SITE_URL + "#verify-email=" + urllib.parse.quote(token, safe="._-")
                person = html.escape(first_name(name))
                safe_link = html.escape(link, quote=True)
                text = f"Hi {first_name(name)},\n\nThanks for reaching out to SachinTechpro. Confirm your email to continue: {link}\n\nThis link expires in 20 minutes. If you didn’t request it, you can ignore this email.\n\nSachinTechpro"
                body = f'<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#29251f"><p>Hi {person},</p><p>Thanks for reaching out to SachinTechpro. Confirm your email to continue your inquiry.</p><p style="margin:28px 0"><a href="{safe_link}" style="background:#53796a;color:#fff;text-decoration:none;padding:14px 22px;border-radius:28px;font-weight:bold">Confirm my email</a></p><p style="color:#716b62;font-size:14px">This link expires in 20 minutes. If you didn’t request it, you can ignore this message.</p><p>Warmly,<br><strong>SachinTechpro</strong></p></div>'
                mail_message(email, "SachinTechpro · Confirm your email", text, body)
            except Exception:
                self.log_error("Email verification could not be delivered")
                return self.respond(502, {"error":"I couldn’t send the confirmation email. Please try again shortly."})
            return self.respond(200, {"success":True})

        if self.path == "/api/verify/email/confirm":
            data_token = read_token(clean(data.get("token"), 3000), "email-confirm")
            if not data_token:
                return self.respond(400, {"error":"That confirmation link is invalid or expired."})
            proof = issue_token({"purpose":"email-proof","name":data_token["name"],"email":data_token["email"]}, 1800)
            return self.respond(200, {"success":True,"proof":proof,"name":data_token["name"],"email":data_token["email"]})

        if self.path == "/api/verify/phone/start":
            proof_data = read_token(clean(data.get("emailProof"), 3000), "email-proof")
            phone = clean(data.get("phone"), 24)
            if not proof_data or not PHONE_RE.fullmatch(phone):
                return self.respond(400, {"error":"Please confirm your email first and enter a valid mobile number."})
            if not signing_key() or not twilio_ready():
                return self.respond(503, {"error":"Mobile verification is not configured yet. Please try again later."})
            if not limited("sms:" + ip, 5, 3600) or not limited("sms-number:" + phone, 4, 3600):
                return self.respond(429, {"error":"Too many code requests. Please wait before trying again."})
            nonce = secrets.token_urlsafe(24)
            digest = hmac.new(signing_key(), nonce.encode("ascii"), hashlib.sha256).digest()
            code = str(int.from_bytes(digest[:4], "big") % 1000000).zfill(6)
            challenge = issue_token({"purpose":"phone-challenge","name":proof_data["name"],"email":proof_data["email"],"phone":phone,"nonce":nonce}, 600)
            try:
                twilio_send(phone, os.environ["TWILIO_FROM_NUMBER"], f"SachinTechpro: Hi {first_name(proof_data['name'])}, your verification code is {code}. It expires in 10 minutes. If you didn’t request it, ignore this text.")
            except Exception:
                self.log_error("Verification text could not be delivered")
                return self.respond(502, {"error":"I couldn’t send the verification text. Check the number and try again."})
            current_time = int(time.time())
            for old_nonce, state in list(CHALLENGES.items()):
                if state["expires"] < current_time:
                    CHALLENGES.pop(old_nonce, None)
            CHALLENGES[nonce] = {"attempts":0,"expires":current_time+600}
            return self.respond(200, {"success":True,"challenge":challenge})

        if self.path == "/api/verify/phone/confirm":
            challenge_data = read_token(clean(data.get("challenge"), 3000), "phone-challenge")
            code = clean(data.get("code"), 6)
            if not challenge_data or not re.fullmatch(r"\d{6}", code):
                return self.respond(400, {"error":"That code is invalid or expired. Request a new one and try again."})
            nonce = challenge_data["nonce"]
            record = CHALLENGES.get(nonce)
            if not record or record["expires"] < int(time.time()):
                return self.respond(400, {"error":"That code is invalid or expired. Request a new one and try again."})
            record["attempts"] += 1
            if record["attempts"] > 5:
                CHALLENGES.pop(nonce, None)
                return self.respond(429, {"error":"Too many incorrect attempts. Request a new code."})
            digest = hmac.new(signing_key(), nonce.encode("ascii"), hashlib.sha256).digest()
            expected = str(int.from_bytes(digest[:4], "big") % 1000000).zfill(6)
            if not hmac.compare_digest(code, expected):
                return self.respond(400, {"error":"That code didn’t match. Check the text and try again."})
            CHALLENGES.pop(nonce, None)
            phone_proof = issue_token({"purpose":"phone-proof","name":challenge_data["name"],"email":challenge_data["email"],"phone":challenge_data["phone"]}, 1800)
            return self.respond(200, {"success":True,"proof":phone_proof})

        if self.path == "/api/inquiry":
            email_proof = read_token(clean(data.get("emailProof"), 3000), "email-proof")
            phone_proof = read_token(clean(data.get("phoneProof"), 3000), "phone-proof")
            name = clean(data.get("name"), 120)
            email = clean(data.get("email"), 180).lower()
            phone_number = clean(data.get("phone"), 24)
            company = clean(data.get("company"), 160)
            title = clean(data.get("companyTitle"), 160)
            company_website = clean(data.get("companyWebsite"), 300)
            address = clean(data.get("businessAddress"), 500)
            opportunity = clean(data.get("opportunity"), 120)
            project = clean(data.get("project"), 100)
            message = clean(data.get("message"), 4000)
            visit_consent = bool(data.get("visitConsent"))
            sms_consent = bool(data.get("smsConsent"))
            whatsapp_consent = bool(data.get("whatsappConsent"))
            url_ok = not company_website or bool(re.fullmatch(r"https?://[^\s/]+(?:/[^\s]*)?", company_website))
            if not (email_proof and phone_proof and email_proof["email"] == email and phone_proof["email"] == email and phone_proof["phone"] == phone_number and phone_proof["name"].casefold() == name.casefold() and EMAIL_RE.fullmatch(email) and PHONE_RE.fullmatch(phone_number) and opportunity in OPPORTUNITIES and (not project or project in PROJECTS) and 15 <= len(message) <= 4000 and url_ok):
                return self.respond(400, {"error":"Please check your details and complete both verification steps."})
            if not mail_configured():
                return self.respond(503, {"error":"The inquiry email service is not configured yet. Please try again later."})
            if not limited("inquiry:" + ip, 5, 3600):
                return self.respond(429, {"error":"Too many inquiries. Please try again later."})
            first = html.escape(first_name(name))
            safe_message = html.escape(message).replace("\n", "<br>")
            safe = lambda value: html.escape(value or "Not provided")
            subject = f"SachinTechpro inquiry · {opportunity}"
            details = (f"Name: {name}\nEmail: {email}\nMobile: {phone_number}\nOrganization: {company or 'Not provided'}\nTitle: {title or 'Not provided'}\nWebsite: {company_website or 'Not provided'}\nBusiness address: {address or 'Not provided'}\nVisit request consent: {'Yes' if visit_consent else 'No'}\nOpportunity: {opportunity}\nProject: {project or 'Not specified'}\nSMS follow-up consent: {'Yes' if sms_consent else 'No'}\nWhatsApp follow-up consent: {'Yes' if whatsapp_consent else 'No'}\n\nMessage:\n{message}")
            owner_html = f'<div style="font-family:Arial,sans-serif;color:#29251f"><h2>New verified inquiry</h2><p><strong>{safe(name)}</strong> · {safe(opportunity)}</p><p>Email: {safe(email)}<br>Mobile: {safe(phone_number)}<br>Organization: {safe(company)}<br>Title: {safe(title)}<br>Website: {safe(company_website)}<br>Business address: {safe(address)}</p><p>Visit request consent: {"Yes" if visit_consent else "No"}<br>SMS follow-up: {"Yes" if sms_consent else "No"}<br>WhatsApp follow-up: {"Yes" if whatsapp_consent else "No"}<br>Project: {safe(project)}</p><p>{safe_message}</p></div>'
            try:
                mail_message(inquiry_recipient(), subject, details, owner_html, reply_to=email)
            except Exception:
                self.log_error("Inquiry notification could not be delivered")
                return self.respond(502, {"error":"I couldn’t deliver your inquiry right now. Please try again later."})
            email_receipt = True
            try:
                receipt_text = f"Hi {first_name(name)},\n\nThank you for contacting SachinTechpro about {opportunity}. I’ve received your message and will review it personally.\n\nWarmly,\nSachinTechpro"
                receipt_html = f'<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#29251f"><p>Hi {first},</p><p>Thank you for contacting SachinTechpro about <strong>{html.escape(opportunity)}</strong>. I’ve received your note and will review it personally.</p><p>Warmly,<br><strong>SachinTechpro</strong></p></div>'
                mail_message(email, f"SachinTechpro · Thanks for reaching out, {first_name(name)}", receipt_text, receipt_html)
            except Exception:
                self.log_error("Inquiry receipt email could not be delivered")
                email_receipt = False
            sms_receipt = False
            if sms_consent and twilio_ready():
                try:
                    sms_receipt = twilio_send(phone_number, os.environ["TWILIO_FROM_NUMBER"], f"SachinTechpro: Hi {first_name(name)}, thanks for reaching out about {opportunity}. I’ve received your inquiry and will follow up personally. Reply STOP to opt out.")
                except Exception:
                    self.log_error("Optional follow-up text could not be delivered")
            wa_receipt = False
            if whatsapp_consent and twilio_ready() and os.getenv("TWILIO_WHATSAPP_FROM") and os.getenv("TWILIO_WHATSAPP_CONTENT_SID"):
                try:
                    wa_receipt = twilio_send("whatsapp:" + phone_number, os.environ["TWILIO_WHATSAPP_FROM"], content_sid=os.environ["TWILIO_WHATSAPP_CONTENT_SID"], content_variables={"1":first_name(name),"2":opportunity})
                except Exception:
                    self.log_error("Optional WhatsApp follow-up could not be delivered")
            return self.respond(200, {"success":True,"emailReceipt":email_receipt,"smsReceipt":sms_receipt,"whatsappReceipt":wa_receipt})

        return self.respond(404, {"error":"Not found"})

    def log_message(self, fmt, *args):
        pass

    def log_error(self, message):
        print(message, flush=True)

if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", int(os.getenv("PORT", "10000"))), Handler).serve_forever()
