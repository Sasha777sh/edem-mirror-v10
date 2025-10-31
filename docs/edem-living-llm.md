# EDEM Living LLM Architecture

EDEM Living LLM is a psychological self-help system that goes beyond traditional chatbots by implementing a "living" architecture with spiritual and emotional intelligence.

## Core Components

### 1. EdemLivingLLM Core

The main orchestrator that combines all modules to generate responses.

### 2. Emotion Engine

Detects user emotions from input text and maps them to body tension zones.

### 3. Scene Engine

Selects appropriate scenes based on emotion and time of day.

### 4. Ritual Engine

Provides personalized rituals based on emotion, scene, and user history.

### 5. Voice Generator

Generates responses with rhythm, pauses, and whisper-like style. See [Voice Generation](#voice-generation) for details.

### 6. Prompt Engine

Dynamically generates prompts for the LLM based on emotional context, scene setting, rituals, and user archetypes. See [Prompt Engine Documentation](./prompt-engine.md) for details.

### 7. Mental Profiling System

Advanced layer that enhances the AI with deep understanding of user mental styles and communication preferences. See [Mental Profiling Documentation](./mental-profiling.md) for details.

### 8. Ritual Memory

Stores user interactions to avoid repetition and track progress.

### 9. User Archetypes

Identifies user psychological archetypes for personalized responses.

### 10. Living Prompt Structure

Integrated prompt system that provides consistent structure and guidance for all responses.

## Key Features

### Voice Style System

- Rhythm and pauses in responses
- Whisper-like tone
- Emotional resonance

### Scene/Emotion Engine

- Dynamic scene selection
- Time-aware responses
- Emotional context mapping

### Ritual Memory

- Tracks unique ritual experiences
- Avoids repetition within sessions
- Learns from user interactions

### Silence Mode

- Sacred silence as a feature
- Background sound integration
- Pauses as meaningful responses

### User Echo System

- Reverse breathing (user to AI intuition transfer)
- Personal truth collection
- Ritual integration

### Identity Selector

- Archetype-based user identification
- Adaptive response system
- Personalized experience

### Light Symbol Exit

- Meaningful, non-motivational endings
- Sensory-based closure
- Real-world connections

### Living Prompt Structure

- Consistent response framework
- Voice-specific styling
- Stage-appropriate content
- Category-based rituals
- Archetype-aligned messaging

### Mental Profiling System

- Deep understanding of user mental styles
- Adaptive communication based on preferences
- Archetype-based personalization
- Real-time style adaptation

## API Endpoints

### POST /api/edem-living-llm

Generate a response from the EDEM Living LLM

### PUT /api/edem-living-llm

Set user archetype

### GET /api/edem-living-llm/silence

Generate silence mode response

## Database Schema

### ritual_memory

Stores ritual interactions for each user session

### user_archetypes

Tracks user-selected psychological archetypes

### user_echoes

Stores user truths and echoes for reverse breathing

## Integration Points

1. **Multi-Level Dialogue System** - Shadow → Truth → Integration stages
2. **Onboarding System** - Identity selection and archetype setting
3. **Payment System** - Subscription-based access to features
4. **Analytics Dashboard** - Progress tracking and insights
5. **Telegram Bot** - Mobile access to the living mirror

## Living Prompt Structure

The Living Prompt Structure provides a consistent framework for all EDEM Living LLM responses:

### Voices
- **Soft**: Мягкий голос поддержки, но без сюсюканья. Тепло, но честно.
- **Hard**: Жесткий голос правды, как холодное зеркало. Без прикрас.
- **Therapist**: Голос внутреннего терапевта: шаг за шагом, с уважением к процессу.

### Stages
- **Shadow** - Mirror patterns without advice
- **Truth** - Root needs and choice context
- **Integration** - Micro-practices and body anchoring

### Mirrors
- **Light** - Positive experiences
- **Shadow** - Negative experiences
- **Body** - Physical sensations
- **World** - External events/signs

### Rituals
Categorized by emotional themes:
- **Loss** - Почувствуй, где в теле пустота
- **Control** - Где в теле напряжение?
- **Rejection** - Найди боль внутри
- **Guilt** - Что ты не успел/а сделать?
- **Shame** - Вспомни, кто тебя стыдил

### Exit Options
- **Light Symbol** - Скажи про себя: «Я увидел(а) себя, и этого достаточно»
- **Silent End** - Пауза. Без слов. Просто дыхание.
- **Poetic Close** - И если ты прошёл это — значит, ты уже стал светом для себя.

### Archetypes
- **Wanderer** - Ищу правду, даже если она пугает.
- **Healer** - Здесь, чтобы исцелиться и передать это другим.
- **Warrior** - Не отступаю, когда становится больно.
- **Child** - Хочу быть увиденным и любимым таким, какой я есть.
- **Sage** - Ищу мудрость через понимание.
- **Rebel** - Бросаю вызов тому, что ограничивает.
- **Mystic** - Соединяю земное с божественным.
- **Caretaker** - Забочусь о других, иногда забывая о себе.

## Implementation Status

✅ Core modules created
✅ API endpoints implemented
✅ Database schema defined
✅ Test components created
✅ Living Prompt Structure integrated
✅ Mental Profiling System implemented
⚠️ Database migration pending (requires PostgreSQL setup)
⚠️ Full integration testing pending

## Next Steps

1. Set up PostgreSQL database with Supabase
2. Run database migrations
3. Integrate with existing dialogue system
4. Add background audio/sound features
5. Implement reverse breathing functionality
6. Create archetype selection workflow
7. Add silence mode with audio
8. Implement ritual memory tracking
9. Create exit symbol generation
10. Test with real users

## Ethical Considerations

- No advice, only reflection
- No judgment, only presence
- Respect for silence and user pace
- Consent for learning from user interactions
- Privacy-first data handling