# NSM (Net Satisfaction Metric) Implementation Test Plan

## Overview

This document outlines the test plan for verifying the NSM implementation in the EDEM platform. The NSM system collects user feedback after sessions to measure satisfaction and improve the service.

## Components to Test

### 1. Database Schema

- [ ] session_feedback table creation
- [ ] Proper indexes for performance
- [ ] Foreign key constraints

### 2. API Endpoints

- [ ] POST /api/session/feedback - Submit feedback
- [ ] GET /api/analytics/nsm - Retrieve NSM metrics

### 3. Frontend Components

- [ ] SessionFeedback component - User interface for feedback
- [ ] NsmDashboard component - Analytics dashboard
- [ ] MultiLevelChatV2 integration - Shows feedback form after session

### 4. Business Logic

- [ ] NSM calculation functions
- [ ] Trend analysis
- [ ] Data aggregation

## Test Scenarios

### Database Tests

1. Run migration script to create session_feedback table

   ```
   -- Execute the 005_session_feedback.sql migration
   ```

2. Verify table structure

   ```
   -- Check columns, data types, constraints
   SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'session_feedback';
   ```

3. Verify indexes

   ```
   -- Check if indexes were created properly
   SELECT indexname FROM pg_indexes WHERE tablename = 'session_feedback';
   ```

### API Tests

1. Test feedback submission

   ```
   POST /api/session/feedback
   Body: {
     "sessionId": "test-session-id",
     "feedback": true,
     "comment": "This session was very helpful",
     "shiftScore": 8
   }
   Expected: 200 OK with { "success": true }
   ```

2. Test unauthorized access

   ```
   POST /api/session/feedback (without auth)
   Expected: 401 Unauthorized
   ```

3. Test NSM metrics retrieval

   ```
   GET /api/analytics/nsm
   Expected: 200 OK with NSM metrics
   ```

### Frontend Tests

1. SessionFeedback component
   - [ ] Renders correctly
   - [ ] Handles positive feedback submission
   - [ ] Handles negative feedback submission
   - [ ] Shows shift score slider
   - [ ] Allows optional comments
   - [ ] Shows loading state during submission
   - [ ] Shows success message after submission

2. NsmDashboard component
   - [ ] Renders key metrics
   - [ ] Shows NSM gauge visualization
   - [ ] Displays trend chart
   - [ ] Allows time range selection
   - [ ] Handles loading states
   - [ ] Handles error states

3. MultiLevelChatV2 integration
   - [ ] Shows feedback prompt after integration stage
   - [ ] Opens feedback modal when button is clicked
   - [ ] Passes correct session ID to feedback component

### Business Logic Tests

1. NSM calculation
   - [ ] Correctly calculates percentage from feedback data
   - [ ] Handles edge cases (no data, all positive, all negative)
   - [ ] Returns proper data structure

2. Trend analysis
   - [ ] Groups data by date
   - [ ] Calculates daily NSM scores
   - [ ] Returns data in correct format

## Implementation Verification Checklist

### Phase 1: Core Components

- [x] Create session_feedback database table
- [x] Implement feedback submission API endpoint
- [x] Implement NSM calculation functions
- [x] Create SessionFeedback React component
- [x] Create NsmDashboard React component
- [x] Integrate feedback form into MultiLevelChatV2

### Phase 2: Testing

- [ ] Run database migration
- [ ] Verify table structure
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Verify business logic calculations

### Phase 3: Monitoring

- [ ] Set up analytics tracking for feedback submissions
- [ ] Create dashboard for NSM metrics
- [ ] Establish alerts for significant changes in NSM

## Success Criteria

1. Users can successfully submit feedback after sessions
2. NSM metrics are calculated correctly
3. Dashboard displays accurate information
4. System performs well under load
5. Data is properly stored and retrievable

## Rollback Plan

If issues are discovered:

1. Disable feedback collection feature flag
2. Revert database migration if necessary
3. Fix issues and redeploy
4. Re-enable feature once issues are resolved

## Next Steps

1. Run database migration in staging environment
2. Deploy frontend components to staging
3. Execute test scenarios
4. Monitor system performance
5. Deploy to production if all tests pass
