# GitHub And Cloudflare Autonomy

GitHub branch, commit, push, issue, pull request, review, review-fix, merge, and post-merge branch cleanup are normal development operations for this repository.

Before branch or push work, check:

- `git status --short`
- current branch
- configured remotes
- recent commits
- remote/default branch evidence when a remote exists

Use focused task branches named `feature/*`, `fix/*`, `docs/*`, `test/*`, or `chore/*`.

For Cloudflare, prefer Workers with Static Assets for new deployment work. Free or included local preview, dry run, staging, production deployment, status checks, rollback preparation, rollback execution, and public unauthenticated browser verification are allowed without stopping.

Do not claim CI, PR, issue, merge, remote, or deployment success unless the command or tool output proves it. If the repository has no remote, report GitHub push/PR/merge as blocked by missing remote configuration instead of inventing a target.
