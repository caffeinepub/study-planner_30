# Study Planner

## Current State
New project. Empty backend actor and default frontend scaffolding.

## Requested Changes (Diff)

### Add
- Subjects: create, list, delete (with color coding)
- Study Goals: create, list, update progress, delete (linked to a subject)
- Study Sessions: log sessions with subject, duration, date, notes
- Study Schedule: create recurring or one-time schedule entries with day/time/subject
- Dashboard: overview of goals progress, weekly study hours, upcoming schedule
- No authentication required -- open access for all users

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: stable storage for subjects, goals, sessions, schedule entries
2. CRUD endpoints for each entity
3. Aggregate queries: weekly study hours total, goals with progress percentage
4. Frontend: dashboard page, subjects page, goals page, sessions log page, schedule page
5. Navigation between pages
