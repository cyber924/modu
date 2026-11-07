# Firebase Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Role-Based Access Control (RBAC)**:
   - Users are registered in the `users` collection.
   - Standard registration sets `role = 'customer'`. Only established admins or system accounts can elevate roles to `partner` or `admin`.
   - Users can only read and write their own `users/{userId}` record, except admins who can read all user records.
2. **Inquiry Classification & Lengths**:
   - Title length: 2 to 120 characters.
   - Content length: 5 to 3000 characters.
   - `parentCategory` must be one of `shopping`, `travel`, `restaurant`, or `other`.
   - `status` must be one of `pending`, `routing`, or `replied`.
3. **AI-driven Analysis Protection**:
   - Only system processes or administrators can modify the `aiAnalysis` block to avoid users spoofing sentiment or AI drafts.

---

## 2. Updated Dirty Dozen Scenarios

1. **Unauthenticated Inquiry Write**: Creating an inquiry without a valid auth token. -> `PERMISSION_DENIED`
2. **Self-Assigned Partner/Admin Role**: A user trying to create/update their `/users/{userId}` with `role = "admin"` or `"partner"`. -> `PERMISSION_DENIED`
3. **Inquiry Owner Spoofing**: Attempting to set `authorId` or `authorEmail` to a different user's credentials. -> `PERMISSION_DENIED`
4. **Illegal Category Spill**: Setting `parentCategory` to an undefined category (e.g. `malicious`). -> `PERMISSION_DENIED`
5. **AI Sentiment Injection**: Normal user attempting to modify `aiAnalysis.sentiment` to trick the priority list. -> `PERMISSION_DENIED`
6. **Reply Spoofing**: Normal user editing an inquiry to inject their own reply content under `reply`. -> `PERMISSION_DENIED`
7. **Cross-User Inquiry Reading**: A customer trying to execute a `get` or `list` query on another customer's inquiries. -> `PERMISSION_DENIED`
8. **Size Poisoning (Large Title)**: Sending 10KB string for `title`. -> `PERMISSION_DENIED`
9. **Size Poisoning (Large Content)**: Sending 1MB string for `content`. -> `PERMISSION_DENIED`
10. **Modification of Immutable Fields**: Modifying `createdAt` or `authorId` on an existing inquiry. -> `PERMISSION_DENIED`
11. **Premature Status Transition**: Standard customer setting status directly to `replied` upon creation. -> `PERMISSION_DENIED`
12. **Blanket Collection Scraping**: Performing a collection group query without proper filter bindings. -> `PERMISSION_DENIED`
