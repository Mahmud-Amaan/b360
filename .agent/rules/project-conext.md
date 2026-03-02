---
trigger: always_on
---

# AI Voice Agent – Project Context

This project implements an AI-powered voice agent for a multi-tenant SaaS system. It allows tenants to provision phone numbers and handle inbound calls using a shared AI knowledge base. The system integrates with existing chat widgets and tools, ensuring consistent behavior across text and voice channels. Key aspects:

- **Multi-Channel AI**: Single AI brain shared across chat and voice.
- **Tenant-Based Routing**: Calls resolved purely by dialed number; no authentication needed.
- **Stateless Calls**: Each call is independent; all state persisted in Neon (PostgreSQL).
- **Voice AI Runtime**: Uses Vapi for per-call AI agents with dynamic prompt construction.
- **Telephony Integration**: Twilio handles number provisioning and inbound call webhooks.
- **Tool Integration**: Supports booking meetings, saving leads, and other tenant-specific actions.
- **Analytics & Dashboard**: Event-driven call and tool analytics for tenants.
- **Scalable & Modular**: Designed for future features like outbound calls, human handoff, and multiple numbers per tenant.

The system prioritizes reliability, tenant isolation, and reusability of AI logic across channels, avoiding low-level telephony management while providing a fully automated voice interface.
you can suggest better approachs or ideas if u want.
