// Vercel serverless function: POST /api/contact
// Sends the portfolio contact form to your inbox through Resend.
//
// Environment variables (set them in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY   required  – from https://resend.com/api-keys
//   CONTACT_TO       optional  – inbox that receives messages (default: developwithanas@gmail.com)
//   CONTACT_FROM     optional  – sender. Without your own verified domain, Resend only allows
//                                "onboarding@resend.dev", and only to the email you signed up with.

const TO = process.env.CONTACT_TO || "developwithanas@gmail.com";
const FROM = process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>";

const ALLOWED_TYPES = ["Website", "Web app", "Android app", "Backend / API", "AI / ML", "Job opportunity"];
const ALLOWED_BUDGETS = ["Under ₹10k", "₹10k – ₹50k", "₹50k+", "Not sure yet"];

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot: real visitors never fill this hidden field. Pretend success for bots.
  if (body.company) return res.status(200).json({ ok: true });

  const name = String(body.name || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 200);
  const message = String(body.message || "").trim().slice(0, 5000);
  const types = (Array.isArray(body.types) ? body.types : []).filter((t) => ALLOWED_TYPES.includes(t));
  const budget = ALLOWED_BUDGETS.includes(body.budget) ? body.budget : "";

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ ok: false, error: "Please fill in your name, a valid email and a message." });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ ok: false, error: "Email service is not configured." });
  }

  const subject = `New enquiry from ${name}` + (types.length ? ` — ${types.join(", ")}` : "");
  const rows = [
    ["Name", name],
    ["Email", email],
    ["Interested in", types.join(", ") || "—"],
    ["Budget", budget || "—"],
  ];

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#15120f">
    <h2 style="font-weight:600;margin:0 0 16px">New message from your portfolio</h2>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="padding:8px 12px;background:#f4eee6;width:130px;color:#7a7068">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(v)}</td></tr>`).join("")}
    </table>
    <p style="white-space:pre-wrap;font-size:15px;line-height:1.6;margin:20px 0;padding:16px;border-left:3px solid #b5562a;background:#fffaf5">${esc(message)}</p>
    <p style="font-size:12px;color:#7a7068">Reply to this email to answer ${esc(name)} directly.</p>
  </div>`;

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\n${message}`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [TO], reply_to: email, subject, html, text }),
    });

    if (!r.ok) {
      console.error("Resend error", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "Could not send right now. Please try WhatsApp or email." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resend request failed", err);
    return res.status(502).json({ ok: false, error: "Could not send right now. Please try WhatsApp or email." });
  }
};
