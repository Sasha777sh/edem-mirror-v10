# EDEM Living LLM: User Privacy and Extended Content

## Overview

This document describes the implementation of user privacy controls and extended content (archetypes, emotions, rituals) for the EDEM Living LLM system.

## User Privacy Controls

### History Permission System

Users have full control over whether their interaction history is stored or not.

#### Implementation

1. **Database Structure**:
   - `user_preferences` table with `allow_history` flag
   - `session_history` table for storing interaction history
   - `user_echoes` table for storing personal truths

2. **UI Component**: `HistoryPermissionToggle.tsx`
   - Toggle switch for enabling/disabling history storage
   - Clear explanation of what each option means
   - Immediate feedback on changes

3. **API Endpoints**:
   - `PUT /api/edem-living-llm` - Toggle history permission
   - `POST /api/edem-living-llm/clear-history` - Clear existing history
   - `GET /api/edem-living-llm/preferences` - Get user preferences
   - `PUT /api/edem-living-llm/preferences` - Update user preferences

4. **Backend Logic**:
   - Check `allow_history` flag before storing any data
   - Automatically clear history when permission is revoked
   - Respect user privacy in all interactions

### Ethical Implementation

1. **Explicit Consent**:
   - Users must explicitly opt-in to history storage
   - Clear explanation of what data is stored and why
   - Easy opt-out mechanism

2. **Data Minimization**:
   - Only store necessary interaction data
   - Automatic cleanup based on retention preferences
   - No personal identification beyond user ID

3. **Transparency**:
   - Clear UI indicators of storage status
   - Access to stored data upon request
   - Ability to delete all stored data

## Extended Content

### New Archetypes

1. **Creator** - Рождаю новое из хаоса и вдохновения
2. **Guardian** - Защищаю то, что дорого, даже ценой себя
3. **Explorer** - Иду туда, где ещё никто не был
4. **Alchemist** - Превращаю боль в силу, страх в мудрость
5. **Hermit** - Нахожу истину в одиночестве и тишине
6. **Jester** - Смеюсь сквозь боль, чтобы освободить других
7. **Sovereign** - Принимаю свою власть и ответственность
8. **Martyr** - Жертвую собой ради других, забывая о себе
9. **Magician** - Вижу скрытые связи и раскрываю потенциал
10. **Nomad** - Иду без привязанностей, свободный и открытый

### New Emotions

1. **Confusion** - путаница, запутался, не понимаю
2. **Envy** - зависть, завидую, хотел бы
3. **Gratitude** - благодарность, благодарен, спасибо
4. **Hope** - надежда, верю, ожидаю
5. **Despair** - отчаяние, безнадежность, нет смысла
6. **Curiosity** - любопытство, интересно, хочу знать
7. **Contentment** - удовлетворенность, доволен, спокоен
8. **Boredom** - скука, скучаю, нечего делать
9. **Excitement** - волнение, возбуждение, энтузиазм
10. **Nostalgia** - ностальгия, по прошлому, тоска по

### New Rituals

Each new emotion has 3 associated rituals designed to help users work with that emotional state.

### New Scenes

Each new emotion has 4 time-specific scenes to create appropriate context.

## Performance Optimizations

### Caching Strategy

1. **In-Memory Cache**:
   - Cache emotion detection results
   - Cache scene selection results
   - Cache ritual selection results
   - 5-minute TTL for cache entries

2. **Efficient Algorithms**:
   - Index-based ritual selection instead of array filtering
   - Precomputed emotion mappings
   - Optimized string matching for emotion detection

### Database Optimizations

1. **Indexing**:
   - Indexes on frequently queried columns
   - Composite indexes for common query patterns
   - Regular cleanup of old data

2. **Query Optimization**:
   - Minimize database round trips
   - Use efficient JOINs where appropriate
   - Batch operations when possible

## User Feedback System

### Implementation

1. **Feedback Form Component**: `FeedbackForm.tsx`
   - Simple 1-5 rating system
   - Open text feedback field
   - Session and user context tracking

2. **Database Storage**:
   - `user_feedback` table with rating and text feedback
   - Timestamp and context tracking

3. **API Endpoint**: `POST /api/edem-living-llm/feedback`
   - Secure feedback submission
   - Input validation
   - Error handling

## Integration with Main Chat System

### EdemLivingChat Component Updates

1. **History Permission Toggle**:
   - Integrated into chat interface
   - Visible but non-intrusive
   - Clear status indicators

2. **Feedback Collection**:
   - Post-session feedback prompts
   - Optional but encouraged
   - Simple and quick to complete

3. **Extended Content Usage**:
   - Automatic detection of new emotions
   - Appropriate archetype suggestions
   - Context-aware ritual selection

## Testing

### Automated Tests

1. **Unit Tests**:
   - Emotion detection accuracy
   - Scene selection logic
   - Ritual appropriateness
   - Privacy control functionality

2. **Integration Tests**:
   - End-to-end chat flows
   - Privacy setting persistence
   - Feedback submission and storage

### Manual Testing

1. **User Experience Testing**:
   - Privacy toggle clarity
   - Feedback form usability
   - Extended content relevance

2. **Performance Testing**:
   - Response time measurements
   - Cache effectiveness
   - Database query performance

## Deployment

### Migration Scripts

1. **Database Migrations**:
   - `008_user_preferences.sql` - User preferences and history control
   - `009_user_feedback.sql` - User feedback storage

2. **Data Migration**:
   - Backward compatibility with existing data
   - Default settings for new features
   - Safe migration procedures

### Configuration

1. **Environment Variables**:
   - Database connection settings
   - Cache configuration
   - Privacy policy URLs

2. **Feature Flags**:
   - Gradual rollout of new features
   - A/B testing capabilities
   - Easy rollback options

## Future Enhancements

### Privacy Features

1. **Granular Controls**:
   - Selective history retention
   - Data portability options
   - Automatic expiration settings

2. **Enhanced Transparency**:
   - Data usage dashboards
   - Export capabilities
   - Audit trails

### Content Expansion

1. **Cultural Adaptation**:
   - Locale-specific content
   - Cultural sensitivity adjustments
   - Language-specific expressions

2. **Personalization**:
   - User-generated content
   - Custom archetypes and rituals
   - Learning from user preferences

### Performance Improvements

1. **Advanced Caching**:
   - Redis integration
   - Distributed caching
   - Cache warming strategies

2. **Database Scaling**:
   - Read replicas
   - Partitioning strategies
   - Query optimization tools

## Conclusion

The implementation of user privacy controls and extended content significantly enhances the EDEM Living LLM system while maintaining the highest ethical standards. Users now have full control over their data, and the system can respond to a much wider range of emotional states with appropriate archetypes, rituals, and scenes.