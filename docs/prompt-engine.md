# EDEM Prompt Engine Documentation

## Overview

The EDEM Prompt Engine is a core component of the EDEM Living LLM system that generates dynamic prompts for the LLM based on emotional context, scene setting, rituals, and user archetypes.

## Features

1. **Emotion Detection** - Analyzes user input to detect primary and secondary emotions
2. **Scene Selection** - Chooses appropriate scenes based on emotion and time of day
3. **Ritual Selection** - Selects personalized rituals based on emotion and user history
4. **Context Integration** - Combines all elements into a structured prompt for the LLM

## How It Works

### 1. Emotion Detection

The engine analyzes user input to identify emotional states:

- **Anxiety**: тревога, боюсь, страх, волнуюсь, нервничаю, тревожусь
- **Shame**: стыд, стыжусь, пристыжён, пристыжена, стыдно, осуждаю
- **Anger**: злость, злюсь, ржу, обида, обижён, обижена
- **Sadness**: грусть, печаль, грущу, печалюсь, тоска, тоскую
- **Loneliness**: одиночество, один, одна, никто не, никто мне
- **Guilt**: виноват, виновата, виновен, винить, сожалею, сожаление
- **Neutral**: Default fallback for general thoughts and reflections

### 2. Scene Selection

Based on the detected emotion and current time of day, the engine selects an appropriate scene:

- **Morning** (6:00-11:59): Window light, toothbrush, keys on table, candle
- **Afternoon** (12:00-17:59): Hands on table, unread message, unopened door, book page
- **Evening** (18:00-21:59): Kettle on stove, bathroom mirror, window in darkness, cup of tea
- **Night** (22:00-5:59): Empty bed, pillow, wall, tree outside window

### 3. Ritual Selection

Rituals are selected based on the emotional category:

- **Loss**: тревога, грусть, одиночество
- **Shame**: стыд
- **Control**: злость
- **Guilt**: вина

### 4. Archetype Integration

The engine incorporates user archetypes into the prompt:

- **Seeker**: Я ищу правду, даже если она пугает
- **Healer**: Я здесь, чтобы исцелиться и передать это другим
- **Warrior**: Я не отступаю, когда становится больно
- **Child**: Я хочу быть увиденным и любимым таким, какой я есть

## API Usage

### Endpoint

```
POST /api/edem/prompt
```

### Request Body

```json
{
  "stage": "shadow|truth|integration",
  "voice": "soft|hard|therapist",
  "archetype": "seeker|healer|warrior|child",
  "input": "User's input text",
  "memory": ["previous ritual 1", "previous ritual 2"]
}
```

### Response

```json
{
  "prompt": "Generated prompt for the LLM"
}
```

### Example Request

```json
{
  "stage": "shadow",
  "voice": "soft",
  "archetype": "seeker",
  "input": "Я чувствую тревогу и страх перед будущим",
  "memory": []
}
```

### Example Response

```
EDEM Living LLM - Stage: shadow
Voice: soft (Мягкий голос поддержки, но без сюсюканья. Тепло, но честно.)
Archetype: seeker (Я ищу правду, даже если она пугает.)

[EMOTIONAL CONTEXT]
Primary emotion: anxiety (33% intensity)
Secondary emotion: neutral
Time of day: morning

[SCENE: Пустая кровать]
Белоснежная простыня

[RITUAL]
Почувствуй, где в теле пустота

[USER INPUT]
Я чувствую тревогу и страх перед будущим

[INSTRUCTIONS]
1. Respond in the specified voice style (Мягкий голос поддержки, но без сюсюканья. Тепло, но честно.)
2. Incorporate the emotional context and scene setting
3. Guide the user through the ritual
4. Use the archetype characteristics in your response
5. Keep responses concise and focused

[RESPONSE FORMAT]
Begin with an empathetic acknowledgment of the user's emotions.
Transition into the scene setting.
Guide the user through the ritual steps.
End with an open question or invitation for reflection.
```

## Testing

To test the prompt engine locally:

```bash
npm run test-prompt-engine
```

This will run several test cases with different emotional inputs and verify that the engine generates appropriate prompts.