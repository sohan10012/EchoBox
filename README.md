# EchoBox — Premium Anonymous Conversation Platform

> Create your space. Share your link. Converse in real-time with continuous anonymous messaging. No awkwardness. Just real thoughts.

EchoBox is an anonymous group conversation platform engineered with React, TypeScript, Tailwind CSS, Framer Motion, and AWS Serverless microservices.

---

## 1. Core Architecture & Product Shift

EchoBox is designed for **continuous anonymous conversations**, not merely one-off form submissions.

- **Zero-Friction Visitor Experience**: Anyone with a room URL can join instantly without registration or sign-up.
- **Session-Scoped Anonymous Personas**: Every visitor receives a stable, memorable pseudonym (e.g. *Curious Fox*, *Silent Panda*, *Cosmic Owl*) paired with a gradient avatar, persisted in `sessionStorage`.
- **Identity Re-generation**: Visitors can explicitly re-roll their persona via the "Change Identity" control with confirmation dialog.
- **Real-Time Group Chat Stream**: Messages update live via background polling (4–6s) with automatic visibility pausing and deduplication.
- **Fixed Multiline Composer**: Supports 2,000 character limits, live counter, keyboard shortcuts (`Enter` to submit, `Shift+Enter` for newline), and in-flight submission locks.
- **Owner Spaces Dashboard**: Metric overview, responsive room grid, live status tracking, and conversation thread viewing.

---

## 2. Tech Stack

- **Frontend Core**: React 18 with Vite
- **Type Safety**: TypeScript 5.6
- **Styling**: Tailwind CSS with custom `#090909` dark palette & light theme toggle
- **Motion & Interactions**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Effects**: Canvas Confetti
- **Cloud Backend**: AWS API Gateway + AWS Lambda + Amazon DynamoDB

---

## 3. Environment Configuration & Deployment

### Environment Variables
EchoBox requires a single environment variable pointing to the AWS API Gateway base URL:

```bash
# .env
VITE_API_BASE_URL=https://bnbpmiljw9.execute-api.ap-south-1.amazonaws.com
```

*Note: The frontend contains zero AWS credentials, access keys, or secret tokens. The API Gateway endpoint is a public HTTPS URL.*

### Vercel Deployment

EchoBox is configured for immediate deployment on Vercel:
1. Push the repository to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Set the Build Command to `npm run build` and Output Directory to `dist`.
4. Add the `VITE_API_BASE_URL` environment variable.
5. Deploy!

*SPA routing rewrites are pre-configured in `vercel.json` to handle client-side routes like `/room/:roomId` and `/dashboard`.*

---

## 4. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Type check & build for production
npm run build
```

---

## 5. Security & Authorization Notice

The current serverless backend on AWS does not yet enforce AWS Cognito JWT authorization on room management or feedback retrieval operations. 

Please read the complete security analysis and production hardening roadmap in:
👉 [`docs/BACKEND_SECURITY_AUDIT.md`](docs/BACKEND_SECURITY_AUDIT.md)

---

## 6. License

MIT © EchoBox Inc.
