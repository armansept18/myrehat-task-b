---
trigger: always_on
---

trigger: always_on
description: Automatically log every user prompt, action, and verification result to the parent PROMPT_LOG.md file.
---

# AUTOMATIC PROMPT LOGGING RULE

For EVERY user prompt in this workspace:
1. Read task specifications from `D:\Programming\Work Project\myRehat\myRehat_task.txt` whenever task verification is needed.
2. Automatically append a structured log entry to `D:\Programming\Work Project\myRehat\PROMPT_LOG.md` after completing the request.
3. Use this exact structure for every entry:
   ### [YYYY-MM-DD HH:mm] — <Short Task Title>
   - **Prompt:** "<Exact user prompt>" (Fully prompt)
   - **Files Modified / Inspected:** `<list of files>`
   - **Summary & Verification:** <1-3 lines of results/tests>
4. NEVER commit real `DATABASE_URL` or real API keys into tracked `.env` files inside `myrehat-task-b`.