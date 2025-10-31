---
trigger: manual
---
# EDEM Chat Rules

## Onboarding Protocol

- **Current version**: shadow_v2_6q
- **Language**: Russian only
- **Flow**: Linear progression through 6 steps before truth_cut

## Voice Personalities

- **soft**: Supportive but direct
- **hard**: Truth without embellishment  
- **therapist**: Structured, step-by-step

## FSM Requirements

- All transitions must be linear
- No step skipping allowed
- State persistence in sessions table
- Proper error handling for invalid steps

## Response Format

- JSON only: `{"nextStep": "...", "utterance": "...", "update": {...}}`
- utterance max 140 characters
- Temperature 0.7 for truth_cut, 0.3 for onboarding
