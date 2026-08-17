# Security Specification

## Data Invariants
1. `users`: Users can only read their own profile unless they are an ADMIN or EDITOR. Users cannot change their own role. Only an ADMIN can change roles. (We will bootstrap the first admin or rely on email_verified + a specific email logic).
2. `articles`:
   - Any user can read `PUBLISHED` articles.
   - Only authenticated users with role ADMIN, EDITOR, or REPORTER can read DRAFT, REVIEW, or ARCHIVED articles.
   - Only REPORTERs, EDITORs, and ADMINs can create DRAFTs.
   - Only EDITORs and ADMINs can update `status` to `PUBLISHED`.
   - `authorId` must match the creator's UID.

## "Dirty Dozen" Payloads
1. Unauthorized User Read PII: Attempt to read another user's profile.
2. User Role Escalation: Attempt to update own role to 'ADMIN'.
3. Anonymous Article Creation: Attempt to create an article without being signed in.
4. User Creates Article: Authenticated user with 'USER' role attempts to create an article.
5. Reporter Publishes Article: User with 'REPORTER' role attempts to set status to 'PUBLISHED'.
6. Spoof Author ID: Reporter attempts to create an article with another user's `authorId`.
7. Toxic String Poisoning: Attempt to inject a 100KB string into the `title` field.
8. Array Bomb: Attempt to add 50 elements to the `tags` array.
9. Type Mutation: Attempt to set `publishedAt` to a boolean.
10. Shadow Field Update: Update with a hidden `isAdmin: true` field.
11. Update Unaffected Field: Try to update `createdAt` during a normal edit.
12. Terminal State Bypass: (N/A here, but updating an ARCHIVED article should be restricted).

## Implementation Rules
We will define an `isAdmin(uid)` and `isEditor(uid)` and `isReporter(uid)` function by reading the `/databases/$(database)/documents/users/$(uid)` document.
