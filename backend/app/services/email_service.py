import os
import smtplib
import logging
import json
import httpx
from datetime import datetime, timezone
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any

from app.core.config import settings

logger = logging.getLogger("finwise-email")
EMAIL_LOG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "emails.log")

def _record_email_locally(to_email: str, subject: str, body: str, meta: Optional[Dict[str, Any]] = None):
    """Fallback audit log so no notification or reset token is ever lost."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "to": to_email,
        "subject": subject,
        "body_preview": body[:500],
        "meta": meta or {}
    }
    try:
        with open(EMAIL_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        logger.error(f"Failed to record email to local audit log: {e}")

async def trigger_n8n_agent_webhook(event_type: str, payload: Dict[str, Any]):
    """Dispatches multi-agent automation events to n8n or external webhooks."""
    if not settings.N8N_WEBHOOK_URL:
        return
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                settings.N8N_WEBHOOK_URL,
                json={
                    "event": event_type,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "source": "finwise-multi-agent",
                    "data": payload
                }
            )
        logger.info(f"Successfully notified n8n webhook of event: {event_type}")
    except Exception as e:
        logger.warning(f"n8n webhook dispatch non-critical error: {e}")

def send_email(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
    """
    Sends an email using configured SMTP provider (e.g. Gmail, SendGrid, Amazon SES, or custom).
    Gracefully logs and dispatches even if live SMTP credentials are not yet populated.
    """
    if not text_content:
        text_content = html_content.replace("<br/>", "\n").replace("</p>", "\n").replace("<p>", "")

    _record_email_locally(to_email, subject, text_content)

    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info(f"[EMAIL SIMULATION] To: {to_email} | Subject: {subject} | SMTP not configured, logged to emails.log")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL or settings.SMTP_USER}>"
        msg["To"] = to_email

        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            if settings.SMTP_TLS:
                server.starttls()

        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL or settings.SMTP_USER, [to_email], msg.as_string())
        server.quit()
        logger.info(f"Successfully sent live email to {to_email} with subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via SMTP to {to_email}: {e}")
        return False

def send_password_reset_email(to_email: str, display_name: str, reset_url: str) -> bool:
    """Delivers a secure password recovery email with a one-time reset link."""
    subject = "FinWise AI — Password Reset Request"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F7F5; margin: 0; padding: 24px; color: #10251D; }}
        .card {{ max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #D9E2DC; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
        .logo {{ font-weight: 900; font-size: 20px; color: #10251D; margin-bottom: 24px; }}
        .accent {{ color: #16A36A; }}
        .button {{ display: inline-block; background-color: #16A36A; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; margin: 20px 0; }}
        .footer {{ font-size: 11px; color: #64748B; margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 16px; line-height: 1.5; }}
        .url-box {{ background: #F1F5F9; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 11px; word-break: break-all; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">finwise<span class="accent">AI</span></div>
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800;">Reset Your Password</h2>
        <p>Hello <strong>{display_name}</strong>,</p>
        <p>We received a request to reset the password for your FinWise AI account. Click the button below to choose a new, secure password:</p>
        <div style="text-align: center;">
          <a href="{reset_url}" class="button">Reset My Password</a>
        </div>
        <p style="font-size: 13px; color: #64748B;">This recovery link will expire in <strong>15 minutes</strong> for your security. If you did not make this request, you can safely ignore this email.</p>
        <div class="url-box">Direct link: {reset_url}</div>
        <div class="footer">
          This is an automated security notification sent by FinWise AI.<br/>
          Protected with end-to-end cryptographic token verification.
        </div>
      </div>
    </body>
    </html>
    """
    text_content = f"""
FinWise AI — Password Reset Request

Hello {display_name},

We received a request to reset the password for your account. Use the following link to choose a new password:
{reset_url}

This link is valid for 15 minutes. If you did not request this, please ignore this email.
    """
    return send_email(to_email, subject, html_content, text_content)

def send_password_changed_notification(to_email: str, display_name: str) -> bool:
    """Security alert confirming password has been changed."""
    subject = "FinWise AI Security Alert: Password Updated"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background-color: #F5F7F5; padding: 24px; color: #10251D;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #D9E2DC; padding: 32px;">
        <h2 style="margin-top: 0; color: #16A36A;">Password Successfully Changed</h2>
        <p>Hello <strong>{display_name}</strong>,</p>
        <p>The password for your FinWise AI account (<code>{to_email}</code>) was successfully updated just now.</p>
        <p style="color: #64748B; font-size: 13px;">If you performed this action, no further steps are required. If you did NOT change your password, please contact our support team immediately.</p>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html_content)

def send_login_notification(to_email: str, display_name: str, ip_address: Optional[str] = None) -> bool:
    """Security alert notifying user of an active login session."""
    subject = "FinWise AI: New Sign-in to Your Account"
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #F5F7F5; padding: 24px; color: #10251D;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #D9E2DC; padding: 32px;">
        <h3 style="margin-top: 0;">New Account Sign-in</h3>
        <p>Hello <strong>{display_name}</strong>,</p>
        <p>A successful sign-in occurred for your FinWise AI account at <strong>{now_str}</strong>.</p>
        {f'<p style="color: #64748B; font-size: 12px;">Origin IP: {ip_address}</p>' if ip_address else ''}
        <p style="font-size: 12px; color: #64748B;">If this was you, you're all set! If you did not sign in, please reset your password immediately.</p>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html_content)

def send_ai_agent_report_email(to_email: str, display_name: str, subject: str, report_body: str) -> bool:
    """Emails the user a synthesized financial report from the Multi-Agent AI system."""
    formatted_body = report_body.replace("\n", "<br/>")
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #F5F7F5; padding: 24px; color: #10251D;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #D9E2DC; padding: 32px;">
        <div style="font-weight: 900; font-size: 18px; color: #10251D; margin-bottom: 16px;">
          finwise<span style="color: #16A36A;">AI</span> Copilot Briefing
        </div>
        <h2 style="margin-top: 0; font-size: 18px;">{subject}</h2>
        <p>Hello <strong>{display_name}</strong>,</p>
        <p>Here is the automated financial analysis synthesized by your FinWise AI Multi-Agent Coordinator:</p>
        <div style="background: #F8FAFC; border-left: 4px solid #16A36A; padding: 16px; border-radius: 8px; font-size: 13px; line-height: 1.6;">
          {formatted_body}
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #64748B;">
          Delivered autonomously by your FinWise Multi-Agent financial planning graph.
        </p>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, f"FinWise AI Report: {subject}", html_content, report_body)
