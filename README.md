# Anas — Portfolio

Personal portfolio of **Anas**, a full-stack developer and final-year B.Tech CSE student from Delhi.

**Live:** https://developwithanas.vercel.app

![Preview](og-image.jpg)

## Features

- Editorial design with light and dark themes
- Projects with live-site previews, a journey timeline, achievements and skills
- Contact form that emails through [Resend](https://resend.com) via a Vercel serverless function, with WhatsApp and mail-app fallbacks
- SEO and social-share metadata, sitemap and robots.txt
- Responsive layout with reduced-motion support

## Tech

HTML, CSS and vanilla JavaScript, plus a Node.js serverless function (`api/contact.js`) deployed on Vercel.

## Run locally

Open `index.html` in a browser. To test the contact form locally:

```bash
cp .env.example .env.local   # add your RESEND_API_KEY
npx vercel dev
```

## Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | Resend API key |
| `CONTACT_TO` | no | Inbox for messages (default `developwithanas@gmail.com`) |
| `CONTACT_FROM` | no | Sender address (default `onboarding@resend.dev`) |

## Contact

developwithanas@gmail.com · [LinkedIn](https://www.linkedin.com/in/developwithanas/) · [GitHub](https://github.com/developwithanas)
