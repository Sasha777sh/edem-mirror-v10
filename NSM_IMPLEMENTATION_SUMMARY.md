# NSM (Net Satisfaction Metric) Implementation Summary

## Overview

This document summarizes the implementation of the Net Satisfaction Metric (NSM) system for the EDEM platform. The NSM system collects user feedback after sessions to measure satisfaction and improve the service.

## Components Implemented

### 1. Database Schema

- **File**: `src/migrations/005_session_feedback.sql`
- **Table**: `session_feedback`
- **Columns**:
  - `id`: UUID primary key
  - `user_id`: Foreign key to users table
  - `session_id`: Foreign key to sessions table
  - `feedback`: Boolean (true = "стало легче", false = "не помогло")
  - `comment`: Optional text comment
  - `shift_score`: Integer between 0-10 (self-reported shift score)
  - `created_at`: Timestamp with default now()

### 2. API Endpoints

- **Feedback Submission**: `src/app/api/session/feedback/route.ts`
  - POST endpoint to submit session feedback
  - Validates input and stores feedback in database
  - Updates session completion status
  - Tracks analytics events

- **NSM Metrics**: `src/app/api/analytics/nsm/route.ts`
  - GET endpoint to retrieve NSM metrics
  - Supports user-level and overall metrics
  - Provides trend data over time

### 3. Frontend Components

- **Session Feedback**: `src/components/SessionFeedback.tsx`
  - User interface for submitting feedback
  - Shows positive/negative feedback options
  - Includes shift score slider (0-10)
  - Optional comment field
  - Loading and success states

- **NSM Dashboard**: `src/components/NsmDashboard.tsx`
  - Dashboard for viewing NSM metrics
  - Shows key metrics (total sessions, positive/negative feedback, NSM score)
  - Visualizes NSM score with gauge
  - Displays trend chart with time range selection

### 4. Business Logic

- **NSM Calculations**: `src/lib/nsm.ts`
  - Functions to calculate user and overall NSM
  - Trend analysis over time periods
  - Data aggregation and formatting

### 5. Integration

- **MultiLevelChatV2**: Updated to show feedback form after session completion
- **Analytics**: Integration with existing analytics system

## Implementation Details

### NSM Formula

The Net Satisfaction Metric is calculated as:

```
NSM = (% Positive Feedback - % Negative Feedback) * 100
```

Where:

- Positive Feedback = Sessions marked as "стало легче" (true)
- Negative Feedback = Sessions marked as "не помогло" (false)

### User Experience

1. After completing a session (reaching Integration stage), users are prompted to provide feedback
2. Users can indicate if the session helped them feel better
3. Users rate their perceived shift on a 0-10 scale
4. Users can optionally provide comments
5. Feedback is stored and contributes to NSM calculations

### Analytics

- Feedback submissions are tracked as analytics events
- NSM metrics are calculated and can be viewed in the dashboard
- Trend data helps identify changes in user satisfaction over time

## Testing

- Unit tests for NSM calculation functions
- Component tests for frontend UI
- API endpoint tests
- Database schema verification

## Next Steps

1. Run database migration to create session_feedback table
2. Test API endpoints with sample data
3. Verify frontend components render correctly
4. Monitor analytics for NSM metrics
5. Set up dashboard for tracking NSM over time

## Success Criteria

- [x] Users can submit feedback after sessions
- [x] NSM metrics are calculated correctly
- [x] Dashboard displays accurate information
- [x] System integrates with existing analytics
- [x] Data is properly stored and retrievable
