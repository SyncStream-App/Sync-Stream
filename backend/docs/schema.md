<!-- backend/docs/schema.md -->
# SyncStream Database Schema

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, references auth.users |
| username | text | unique, set during onboarding |
| email | text | from auth provider |
| avatar_url | text | Cloudinary URL |
| banner_url | text | Cloudinary URL |
| bio | text | optional |
| watch_hours | int | default 0 |
| badges | text[] | default empty array |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto-updated by trigger |

RLS: enabled. Public read. Owner write only.

### follows
| Column | Type | Notes |
|--------|------|-------|
| follower_id | uuid | FK → users.id |
| following_id | uuid | FK → users.id |
| created_at | timestamptz | auto |

RLS: enabled. Public read. Owner insert/delete only.