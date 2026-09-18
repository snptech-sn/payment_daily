# Security Specification

## 1. Data Invariants
- Each user profile `/users/{userId}` can only be read or written by the authenticated user whose `request.auth.uid == userId`.
- User transactions `/users/{userId}/transactions/{transactionId}` can only be accessed or modified by the owner whose `request.auth.uid == userId`.
- User settings `/users/{userId}/settings/{settingsId}` can only be accessed or modified by the owner whose `request.auth.uid == userId`.
- No user can access or view another user's financial transactions or budget settings.

## 2. The "Dirty Dozen" Threat Scenarios
1. Anonymous or unauthenticated user trying to read `/users/{userId}` -> PERMISSION_DENIED.
2. Authenticated user `user_A` trying to read `/users/user_B/transactions/{id}` -> PERMISSION_DENIED.
3. Authenticated user `user_A` trying to create a transaction under `/users/user_B/transactions/{id}` -> PERMISSION_DENIED.
4. Authenticated user `user_A` trying to update `/users/user_B/settings/{id}` -> PERMISSION_DENIED.
5. Authenticated user `user_A` trying to delete `/users/user_B/transactions/{id}` -> PERMISSION_DENIED.
6. Writing a transaction with invalid numeric amount (< 0 or NaN or non-number) -> PERMISSION_DENIED.
7. Writing a transaction with type other than "income" or "expense" -> PERMISSION_DENIED.
8. Writing a transaction with currency other than "USD" or "KHR" -> PERMISSION_DENIED.
9. Injecting oversized string (> 128 chars for ID, > 500 chars for note) -> PERMISSION_DENIED.
10. Spoofing `userId` field in transaction data to not match authenticated user `request.auth.uid` -> PERMISSION_DENIED.
11. Querying across all users without scoping to authenticated user's subcollection -> PERMISSION_DENIED.
12. Attempting to modify immutable fields or path variables -> PERMISSION_DENIED.
