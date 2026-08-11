# TRAVIS PROMPT AI — Business Assistant

This is a deployable Next.js version of the demo.

## 1. Get an Anthropic API key
Go to https://console.anthropic.com/, sign up, and create an API key under "API Keys." Billing is separate from any Claude.ai subscription.

## 2. Deploy on Vercel
1. Go to https://vercel.com and sign in with your GitHub account.
2. Click "Add New → Project" and import this repository.
3. Before deploying, add an Environment Variable:
   - Key: ANTHROPIC_API_KEY
   - Value: your key from step 1
4. Click Deploy. In about a minute you'll get a live public URL.

## What's real vs. still a placeholder
Real: sign-up, onboarding, business profile/products/knowledge management, the live AI chat, Human Review Mode, dashboards, multi-business isolation, super-admin view.

Still placeholders: calendar/booking confirmation, WhatsApp/email sending, CRM sync, payments.

## Important limitation
All business data currently lives in browser memory only — it resets on refresh. Fine for demos; before real customers use it, add a real database and login.
