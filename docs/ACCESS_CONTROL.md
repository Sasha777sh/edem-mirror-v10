# EDEM Living LLM Access Control System

## Overview

The EDEM Living LLM implements a three-tier access control system that aligns with the spiritual journey concept of the application:

1. **Public (Light)** - Accessible to everyone, safe and gentle interactions
2. **Registered (Truth)** - Available to authenticated users, more direct and insightful interactions
3. **Guardian (Shadow)** - Reserved for certified users, deep and transformative interactions

## Access Matrix

| Feature | Public | Registered | Guardian |
|---------|--------|------------|----------|
| Light   | ✓      | ✓          | ✓        |
| Truth   |        | ✓          | ✓        |
| Shadow  |        |            | ✓        |

## Implementation

### 1. Database Schema

The system adds a `role` column to the `profiles` table using a custom enum type:

```sql
create type user_role as enum ('public','registered','guardian');

alter table public.profiles
  add column if not exists role user_role not null default 'public';
```

### 2. Core Logic

The access control logic is implemented in `src/lib/access.ts`:

```typescript
export type Role = 'public' | 'registered' | 'guardian';
export type Feature = 'light' | 'truth' | 'shadow';

const matrix: Record<Feature, Role[]> = {
  light: ['public','registered','guardian'],
  truth: ['registered','guardian'],
  shadow: ['guardian'],
};

export function hasAccess(feature: Feature, role: Role | null | undefined) {
  const r: Role = role ?? 'public';
  return matrix[feature].includes(r);
}
```

### 3. Server-Side Protection

API routes are protected using the `withAccess` guard:

```typescript
export const POST = withAccess('light', async (req: Request, _ctx: any, role: any) => {
  // Handler logic here
});
```

### 4. Client-Side Protection

UI components are protected using the `FeatureGate` component:

```tsx
<FeatureGate
  role={userRole}
  feature="shadow"
  fallback={<button className="btn-disabled">Тень — доступ по приглашению</button>}
>
  <button className="btn-primary">Войти в Тень</button>
</FeatureGate>
```

## Role Promotion

Users are promoted to higher roles through administrative actions:

1. **Public → Registered**: Automatically when creating an account
2. **Registered → Guardian**: Manual promotion by administrators after training/certification

The promotion script is available at `scripts/promoteGuardian.ts` and can be run with:

```bash
npm run promote:guardian <user-id>
```

## Security Considerations

1. Role checks are performed on both client and server sides
2. Server-side checks are authoritative and cannot be bypassed
3. Unauthorized access attempts are handled gracefully with fallback responses
4. All role updates must be performed server-side using service role keys

## Ethical Guidelines

The access control system ensures:

1. **Safety**: Public users only access safe, gentle interactions
2. **Progression**: Users must demonstrate readiness for deeper content
3. **Support**: Guardian users have access to the most transformative experiences
4. **Boundaries**: Clear limits prevent overwhelming or harmful interactions
