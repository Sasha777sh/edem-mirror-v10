# QA Test Specification for EDEM Living LLM Application

## Overview
This document outlines the comprehensive testing requirements for the EDEM Living LLM psychological self-help platform. The application features a multi-level dialogue system with RAG capabilities, mental profiling, and spiritual intelligence.

## Application Components to Test

### 1. Authentication System
- Social login (Google, Apple, Telegram)
- Email/password authentication
- Magic link functionality
- Session management
- Logout functionality

### 2. Landing Page
- Responsive design across devices
- Audio autoplay functionality
- Interactive demo chat
- Registration modal
- Performance loading times

### 3. Multi-Level Dialogue System
- Stage transitions (Shadow → Truth → Integration)
- Voice selection (Soft, Hard, Therapist)
- RAG integration and context awareness
- Practice assignment and tracking
- Session state management

### 4. EDEM Living LLM Core Features
- Emotion detection engine
- Scene selection based on time/context
- Ritual generation personalization
- Ritual memory tracking
- Silence mode functionality
- Archetype identification
- Light symbol exit feature

### 5. Mental Profiling System
- User preference management
- History permission controls
- Archetype detection accuracy
- Style adaptation responsiveness

### 6. User Privacy Controls
- History storage toggle
- Data deletion functionality
- Privacy preference persistence
- Consent management

### 7. Feedback System
- Feedback form functionality
- Rating submission
- Text feedback collection
- Data storage validation

### 8. Database & API
- All API endpoints response times
- Database migration scripts
- Data integrity checks
- Error handling

### 9. RAG System
- Vector search accuracy
- Embedding generation
- Corpus import functionality
- Search filtering

### 10. Analytics & Monitoring
- PostHog event tracking
- User interaction metrics
- Performance monitoring
- Error logging

## Testing Types Required

### 1. Functional Testing
- Verify all user flows work as expected
- Test all input validation
- Check edge cases and error conditions
- Validate data processing and storage

### 2. UI/UX Testing
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Responsive design on mobile, tablet, and desktop
- Accessibility compliance (WCAG 2.1 AA)
- Usability testing

### 3. Performance Testing
- Page load times < 3 seconds
- API response times < 1 second
- Concurrent user handling
- Database query performance

### 4. Security Testing
- Authentication security
- Data encryption
- Input sanitization
- OWASP Top 10 compliance

### 5. Compatibility Testing
- Browser compatibility
- Device compatibility
- OS compatibility
- Screen resolution testing

### 6. Integration Testing
- Supabase integration
- OpenAI API integration
- PostHog analytics integration
- Stripe payment integration

### 7. Regression Testing
- After each update, verify existing functionality
- Test critical user paths
- Validate API endpoints

## Test Scenarios

### Authentication Flow
1. User can register with Google
2. User can register with Apple
3. User can register with Telegram
4. User can register with email
5. User can login with existing credentials
6. User can reset password
7. Session persists across page reloads
8. User can logout successfully

### Dialogue System
1. User can progress through Shadow stage
2. User can progress through Truth stage
3. User can progress through Integration stage
4. Stage transitions work correctly
5. Voice selection affects response style
6. RAG provides relevant context
7. Practices are assigned correctly
8. Session state is maintained

### EDEM Living LLM Features
1. Emotion detection works accurately
2. Scene selection matches context
3. Rituals are personalized
4. Ritual memory prevents repetition
5. Silence mode activates properly
6. Archetype identification is accurate
7. Light symbol exit works
8. Voice style system functions

### Mental Profiling
1. User preferences are saved
2. History permission toggle works
3. Archetype detection accuracy
4. Style adaptation responsiveness

### Privacy Controls
1. History storage toggle functions
2. User data is deleted when requested
3. Privacy preferences persist
4. Consent is properly managed

### Feedback System
1. Feedback form submits correctly
2. Ratings are stored
3. Text feedback is saved
4. Data appears in database

### RAG System
1. Vector search returns relevant results
2. Embeddings are generated correctly
3. Corpus import works
4. Search filters function

## Test Data Requirements

### User Accounts
- Test accounts for each authentication method
- Accounts with different archetypes
- Accounts with varying history preferences

### Dialogue Content
- Sample inputs for each emotion category
- Inputs for different times of day
- Inputs for various user archetypes

### RAG Corpus
- Test data for each domain (Anxiety, Breakup, Sleep)
- Edge cases for search queries
- Multilingual content if applicable

## Acceptance Criteria

### Performance
- Page load time < 3 seconds
- API response time < 1 second
- Database queries < 500ms

### Reliability
- 99.9% uptime
- Error rate < 0.1%
- Successful API responses > 99%

### Usability
- Intuitive navigation
- Clear error messages
- Accessible design
- Mobile-friendly interface

### Security
- No unauthorized data access
- Secure authentication
- Encrypted data transmission
- Protection against common vulnerabilities

## Testing Tools & Environment

### Tools
- Cypress for end-to-end testing
- Jest for unit testing
- Postman for API testing
- Lighthouse for performance testing
- axe for accessibility testing

### Environments
- Local development environment
- Staging environment
- Production environment

## Reporting Requirements

### Test Reports
- Daily test execution reports
- Weekly test summary reports
- Bug reports with reproduction steps
- Performance benchmark reports

### Metrics to Track
- Test coverage percentage
- Bug discovery rate
- Test execution time
- Defect resolution time

## Bug Prioritization

### Critical (P0)
- System crashes
- Data loss
- Security vulnerabilities
- Authentication failures

### High (P1)
- Major functionality issues
- Performance degradation
- Incorrect data processing
- UI blocking issues

### Medium (P2)
- Minor functionality issues
- UI/UX improvements
- Documentation issues
- Edge case failures

### Low (P3)
- Typographical errors
- Minor UI inconsistencies
- Enhancement requests
- Non-critical improvements

## Test Schedule

### Phase 1: Unit Testing (2 days)
- Component testing
- API endpoint testing
- Database validation

### Phase 2: Integration Testing (3 days)
- Authentication flows
- RAG system integration
- Third-party API integrations

### Phase 3: System Testing (4 days)
- End-to-end user flows
- Performance testing
- Security testing

### Phase 4: User Acceptance Testing (2 days)
- Real user testing
- Feedback collection
- Final validation

## Deliverables

1. Test plan document
2. Test cases and scripts
3. Test execution reports
4. Bug reports and tracking
5. Performance benchmark reports
6. Final test summary report

## Success Criteria

The testing phase is considered successful when:
- All critical and high-priority bugs are resolved
- Test coverage reaches 90%+
- Performance benchmarks are met
- Security requirements are satisfied
- User acceptance testing is completed with positive feedback