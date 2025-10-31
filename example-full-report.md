# 📊 Technical Audit Report: EDEM Psychological Self-Help Platform

## 0) Context and Goals

### Current Implementation Status

The EDEM platform is a Next.js 14 SaaS application with TypeScript and Tailwind CSS that provides AI-powered psychological analysis through a chat interface. The platform features a complete implementation with:

- User authentication via Supabase
- Subscription management with multiple payment providers (Stripe, NOWPayments for crypto, YooKassa for Russian market)
- Rate limiting system with different tiers
- Referral system with bonus mechanics
- Free trial system with automatic processing
- Analytics tracking with PostHog integration
- Multi-level dialogue system (Shadow → Truth → Integration)

### Near-term Launch Goals (4-6 weeks)

1. **Core Chat Experience** - Fully functional EDEM Mirror chat with Shadow v2 onboarding
2. **Billing System** - Complete payment processing with all providers
3. **Therapist Dashboard** - Admin panel for therapist operations
4. **Marketing Funnel** - Landing page with conversion tracking
5. **Analytics Dashboard** - User insights and behavior tracking

### Current Load / Target Load

- **MAU**: Not yet launched (0)
- **DAU**: Not yet launched (0)
- **Expected RPS**: Minimal during launch (10-50), scaling to 100+ with growth
- **Peak Windows**: Evenings and weekends (typical for mental health apps)

### SLO/SLA Targets

- **Uptime**: 99.9%
- **Latency**: p95 < 500ms, p99 < 1000ms
- **Error Rate**: < 0.1%

## 1) Architecture and Environments

### Overall Architecture

```
[Client] ↔ [Next.js 14 Frontend] ↔ [Supabase Auth/API] ↔ [PostgreSQL DB]
                    ↓
         [Payment Providers: Stripe/NOWPayments/YooKassa]
                    ↓
           [Analytics: PostHog/Custom Events]
                    ↓
         [Telegram Bot Integration & Notifications]
```

### Services/Modules

1. **Frontend**: Next.js 14 with App Router, React components
2. **Authentication**: Supabase Auth with custom UI
3. **Database**: PostgreSQL with custom connection pooling
4. **API Layer**: Next.js API routes for all backend functionality
5. **AI Processing**: OpenAI integration (placeholder implementation)
6. **Payments**: Multi-provider system (Stripe, NOWPayments, YooKassa)
7. **Analytics**: PostHog for user tracking and feature flags
8. **Messaging**: Telegram bot integration
9. **Rate Limiting**: Redis/In-memory with Upstash support

### Environments

- **Development**: Local development with .env files
- **Production**: Vercel deployment with environment variables
- **No Staging Environment**: Currently missing

### Configuration/Secrets

- **Location**: .env files (example provided)
- **Vault**: No vault system implemented
- **Key Rotation**: Manual process, no automation

## 2) Data and Models

### ERD/Database Schema

The database schema includes the following core tables:

1. **users** - User accounts with email, name, avatar
2. **user_settings** - User preferences (voice, language, notifications)
3. **subscriptions** - Payment subscriptions with plan and status
4. **sessions** - Chat sessions with inputs and outputs
5. **journal** - User journal entries with tags and mood tracking
6. **usage_counters** - Rate limiting counters for demo usage
7. **referrals** - Referral tracking with codes and bonuses
8. **free_trials** - Free trial management
9. **analytics_events** - Custom event tracking
10. **onboarding_answers** - Shadow v2 onboarding data
11. **session_states** - Multi-level dialogue states (shadow/truth/integration)
12. **practices** - Assigned micro-practices for integration stage
13. **prompt_versions** - Versioned prompt templates for each stage
14. **rag_chunks** - Knowledge base chunks with embeddings

### Data Retention Policy

- **No formal retention policy** implemented
- **Backups**: Not specified in codebase
- **RPO/RTO**: Not defined
- **Recovery Plan**: Not documented

### Anonymization

- **PII Handling**: Basic email/name storage
- **No explicit anonymization** processes implemented
- **Data export/deletion**: Not implemented

## 3) Chat (EDEM Mirror) and LLM Layer

### LLM Providers

- **Current Implementation**: OpenAI integration placeholder
- **Abstraction**: Basic wrapper exists but no fallback/retry logic
- **Quotas**: Not implemented

### Multi-Level Dialogue System

- **Stages**: Shadow → Truth → Integration with state machine
- **RAG System**: pgvector integration with metadata filtering
- **Prompt Templates**: Versioned templates for each stage
- **Signal Detection**: Heuristic-based user intent recognition

### Prompts

- **Versioning**: Basic prompt files exist but no version control
- **Source of Truth**: Hardcoded in lib files
- **Change Management**: Manual process
- **History**: Not tracked

### LLM Security

- **Injection Protection**: Basic safety filtering implemented
- **Jailbreak Protection**: Not implemented
- **Toxic Content**: Basic filtering
- **Filters**: Input sanitization present

### RAG System

- **Corpus Storage**: Not implemented
- **Vector Storage**: Not implemented
- **Embeddings**: Not implemented

### Caching/Performance

- **Token Cache**: Not implemented
- **Response Cache**: Not implemented
- **Deduplication**: Not implemented

## 4) Monetization and Access

### Subscriptions

- **Providers**: Stripe, NOWPayments (crypto), YooKassa (Russia)
- **Status Model**: active, canceled, past_due, incomplete, trialing
- **Webhooks**: Implemented for all providers
- **Idempotency**: Basic implementation

### Paywall

- **Access Control**: Subscription-based checks
- **Caching**: Basic in-memory caching
- **Endpoint Protection**: Implemented

### Limits

- **Rate Limiting**: Per-user/tier with Redis support
- **Abuse Protection**: Basic implementation
- **Bot Protection**: Not implemented

## 5) Integrations

### Current Integrations

- **Supabase**: Authentication and database
- **Stripe**: Payment processing
- **NOWPayments**: Crypto payments
- **YooKassa**: Russian market payments
- **Telegram**: Bot integration
- **PostHog**: Analytics and feature flags
- **Redis/Upstash**: Rate limiting
- **pgvector**: RAG system for multi-level dialogue

### Audio/Music

- **Generation Queue**: Not implemented
- **Media Storage**: Not implemented
- **Transcoding**: Not implemented

### Planned Integrations

- **Wearable Devices**: Not yet implemented
- **Social Networks**: Not yet implemented
- **Therapist Webhooks**: Not yet implemented

## 6) Observability and Quality

### Logs/Traces/Metrics

- **Logging**: Console logging in development
- **Metrics**: Basic analytics tracking
- **Traces**: Not implemented
- **Latency Tracking**: Basic PostHog integration

### Alerting

- **Rules**: Not defined
- **Channels**: Not implemented
- **On-call**: Not defined

### Testing

- **Unit Tests**: Minimal coverage
- **Integration Tests**: None identified
- **E2E Tests**: None identified
- **Smoke Tests**: None identified
- **Load Tests**: None identified

### A/B Testing

- **Feature Flags**: Implemented with PostHog
- **Experiment Framework**: Basic implementation

## 7) Marketing Funnel and Events

### Analytics Events

- **Core Events**: signup, start_session, paywall_view, purchase
- **Retention Tracking**: D1/D7 tracking planned but not implemented
- **Funnel Tracking**: Basic implementation

### Conversion Funnels

- **Landing → Calibration → Session → Payment**: Partially tracked
- **Attribution**: Basic UTM tracking

### Attribution

- **UTM Parameters**: Basic tracking
- **Postbacks**: Not implemented
- **Anti-fraud**: Not implemented

## 8) Security and Compliance

### PII/Consent

- **Consent Storage**: Not implemented
- **Consent Logs**: Not implemented
- **Data Export/Deletion**: Not implemented (DSR)

### Encryption

- **At-rest**: Database-level encryption assumed
- **In-transit**: TLS (HTTPS)
- **KMS**: Not implemented
- **Key Rotation**: Not implemented

### Age/Crisis Management

- **Age Gate**: Not implemented
- **Crisis Escalation**: Basic SOS modal
- **Help Numbers**: Not implemented

### GDPR/CCPA Compliance

- **Minimal Checklist**: Not implemented
- **Data Processing**: Basic compliance

## 9) Therapist Dashboard and Operations

### Queue System

- **Card Distribution**: Not implemented
- **SLA Model**: Not defined
- **Status Model**: Not implemented

### Specialist Verification

- **Document Verification**: Not implemented
- **Access Levels**: Not implemented
- **Action Logging**: Not implemented

### Notes Editing

- **Versioning**: Not implemented
- **Audit Log**: Not implemented
- **User Export**: Not implemented

## 10) Performance and Cost

### Latency Targets

- **Chat Path**: Not measured
- **Payment Path**: Not measured
- **Dashboard**: Not measured

### Scaling

- **Horizontal Scaling**: Not configured
- **Vertical Scaling**: Not configured
- **Auto-scaling Rules**: Not defined

### Cost Model

- **Per-message Cost**: Not calculated
- **Per-user Cost**: Not calculated
- **Forecast**: Not available

## 11) Risks and Technical Debt

### Technical Debt (Priority)

1. **High**: No staging environment, missing observability
2. **Medium**: No data retention policy, limited security measures
3. **Low**: Missing documentation for some components

### Single Points of Failure

1. **Database**: Single PostgreSQL instance
2. **LLM Provider**: Dependency on single provider (OpenAI)
3. **Payment Processing**: No fallback between payment providers

### People Dependencies

1. **Single Developer**: Knowledge concentrated in one person
2. **Missing Documentation**: Operational procedures not documented

## 12) Roadmap (90 Days)

### MVP Milestones

1. **Week 1-2**: Complete chat flow implementation with multi-level dialogue
2. **Week 3-4**: Payment system testing and optimization
3. **Week 5-6**: Therapist dashboard MVP
4. **Week 7-8**: Analytics and monitoring implementation
5. **Week 9-12**: Security and compliance measures

### Readiness Criteria

- **Chat System**: Complete working flow with all voices
- **Payment System**: All providers tested and working
- **Dashboard**: Therapist interface functional
- **Monitoring**: Basic observability in place

### Release and Rollback Plan

- **Deployment**: Vercel with manual promotion
- **Rollback**: Manual process, no automation

## 📦 Report Attachments

### Diagrams

1. **Architecture Diagram**: Component interaction diagram
2. **ERD**: Entity relationship diagram (in SQL schema)
3. **Sequence Diagrams**:
   - Chat message flow
   - Payment processing
   - Therapist escalation

### API Documentation

- **OpenAPI/Swagger**: Not implemented

### Developer Setup

- **README**: Basic setup instructions provided
- **5-minute Setup**: Partially achievable with existing documentation

### Cost Analysis

- **Cost Model**: Not calculated
- **Projections**: Not available

### Risk List

- **Risk Register**: Partially documented in this report

## 🧾 Status Table

| Section | Element | Status | Comment / Risks | Responsible | Deadline |
|---------|---------|--------|-----------------|-------------|----------|
| Architecture | Component Schema | Partially | No sequence diagrams | Development Team | 15.09 |
| Data | ERD + SQL Schema | Done | Available in migrations | Development Team | 12.09 |
| Chat/LLM | Provider Abstraction | Partially | Basic wrapper only | Development Team | 25.09 |
| Chat/LLM | Prompt Versioning | Partially | No history tracking | Development Team | 18.09 |
| Chat/LLM | Multi-Level Dialogue | Partially | State machine implemented | Development Team | 30.09 |
| Monetization | Payment Webhooks | Done | All providers implemented | Development Team | 10.09 |
| Integrations | Telegram Bot | Partially | Basic integration | Development Team | 20.09 |
| Observability | Logs/Metrics/Alerts | Partially | Basic PostHog only | Development Team | 22.09 |
| Security | DSR (Export/Delete) | No | Requires implementation | Development Team | 30.09 |
| Therapists | Queue/SLA | No | Requires model definition | Product Team | 27.09 |
| Quality | E2E Tests | Partially | Only manual testing | QA Team | 01.10 |
| Cost | $/1k Messages | Partially | Not calculated | Finance Team | 19.09 |
