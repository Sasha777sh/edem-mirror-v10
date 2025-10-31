# EDEM Mental Profiling System

## Overview

The EDEM Mental Profiling System is an advanced layer that enhances the EDEM Living LLM with deep understanding of user mental styles and communication preferences. This system enables the AI to adapt its responses to match the user's unique way of thinking and communicating.

## Architecture

```
+ Input
   ↓
[ Emotion Engine ] ← Detects primary emotions from text
   ↓
[ Archetype Profiler ] ← Identifies mental style and archetype
   ↓
[ Style Adapter ] ← Adapts communication style based on profile
   ↓
[ Scene + Ritual + Prompt ]
   ↓
[ Output ]
```

## Components

### 1. Archetype Profiler

Detects the user's mental style and archetype based on input patterns.

#### Mental Styles
- **Communication**: direct, metaphorical, analytical, intuitive
- **Pace**: fast, slow, rhythmic
- **Tone**: soft, firm, neutral, playful
- **Preference**: body, mind, emotion, spirit

#### Archetypes
- **Wanderer**: Ищу правду, даже если она пугает
- **Healer**: Здесь, чтобы исцелиться и передать это другим
- **Warrior**: Не отступаю, когда становится больно
- **Child**: Хочу быть увиденным и любимым таким, какой я есть
- **Sage**: Ищу мудрость через понимание
- **Rebel**: Бросаю вызов тому, что ограничивает
- **Mystic**: Соединяю земное с божественным
- **Caretaker**: Забочусь о других, иногда забывая о себе

### 2. Style Adapter

Adapts the communication style based on the user's mental profile, current emotion, and dialogue stage.

#### Adaptation Parameters
- **Voice**: soft, hard, therapist
- **Rhythm**: short, medium, long
- **Metaphor**: 0-1 scale
- **Directness**: 0-1 scale
- **Body Focus**: 0-1 scale
- **Pause Frequency**: 0-1 scale

## How It Works

### 1. Mental Style Detection

The system analyzes user input to identify:
- Communication patterns (direct, metaphorical, etc.)
- Pace of thinking (fast, slow, rhythmic)
- Emotional tone (soft, firm, etc.)
- Content preference (body, mind, emotion, spirit)

### 2. Archetype Profiling

Based on input patterns and keywords, the system identifies the user's archetype:
- Looks for archetype-specific language patterns
- Matches content themes to archetype characteristics
- Considers existing user preferences

### 3. Style Adaptation

The system adapts the response style based on:
- User's mental profile
- Current emotional state
- Dialogue stage (shadow, truth, integration)

## Examples

### Example 1: Loneliness with Mystic Archetype

**Input**: "Жена ушла, я страдаю. Хочу вернуть. Все пусто внутри."

**Profile**:
- Mental Style: metaphorical, fast, neutral, emotion
- Archetype: mystic

**Adaptation**:
- Voice: soft
- Rhythm: short
- Metaphor: 0%
- Directness: 100%
- Body Focus: 100%
- Pause Frequency: 30%

### Example 2: Anger with Warrior Archetype

**Input**: "Меня бесит, что она ушла! Я боролся за нашу семью!"

**Profile**:
- Mental Style: direct, rhythmic, neutral, emotion
- Archetype: warrior

**Adaptation**:
- Voice: soft (selected based on mental style mapping)
- Rhythm: medium
- Metaphor: 0%
- Directness: 100%
- Body Focus: 90%
- Pause Frequency: 20%

### Example 3: Analytical with Sage Archetype

**Input**: "Хочу понять причины расставания. Какова была моя роль в этом?"

**Profile**:
- Mental Style: metaphorical, rhythmic, neutral, emotion
- Archetype: sage

**Adaptation**:
- Voice: soft
- Rhythm: long
- Metaphor: 30%
- Directness: 70%
- Body Focus: 100%
- Pause Frequency: 50%

## Benefits

### For Users
- **Personalized Experience**: Responses feel tailored to their unique mental style
- **Natural Communication**: The AI communicates in a way that feels familiar and comfortable
- **Deeper Connection**: Enhanced emotional resonance through style matching
- **Reduced Friction**: No need to adapt to the AI's communication style

### For the System
- **Enhanced Empathy**: Better ability to connect with users on a mental level
- **Improved Engagement**: Higher user satisfaction through personalized communication
- **Greater Effectiveness**: More impactful responses that match user preferences
- **Scalable Personalization**: Systematic approach to adapting to different mental styles

## Implementation

### Core Modules
1. **archetype-profiler.ts**: Detects mental styles and archetypes
2. **style-adapter.ts**: Adapts communication style based on profiles
3. **promptEngine.ts**: Integrates profiling into prompt generation

### Integration Points
- **Emotion Engine**: Uses emotional context for style adaptation
- **Scene Engine**: Selects scenes appropriate to mental style
- **Ritual Engine**: Chooses rituals that match user preferences
- **Voice Generator**: Adapts voice characteristics to mental profile

## Testing

To test the mental profiling system:

```bash
npm run test-mental-profile
```

This runs several test cases with different emotional inputs and archetypes to verify that the system correctly profiles users and adapts communication styles.

## Future Enhancements

### 1. Learning System
- Track user preferences over time
- Adapt profiling accuracy based on user feedback
- Refine archetype detection through interaction history

### 2. Advanced Adaptation
- Context-aware style adaptation
- Multi-turn dialogue style consistency
- Cross-session preference memory

### 3. Expanded Archetypes
- Cultural archetype variations
- Age-based mental style patterns
- Professional/role-based communication styles

## Ethical Considerations

### Privacy
- All profiling is done in real-time and not stored
- No personal data is collected or retained
- Users can opt out of profiling features

### Bias Prevention
- Regular auditing of archetype detection algorithms
- Diverse training data for mental style recognition
- Continuous refinement to reduce cultural biases

### Transparency
- Clear documentation of profiling methods
- User controls over adaptation features
- Explanation of how profiling affects responses