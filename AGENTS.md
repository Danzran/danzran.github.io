# Shared portfolio context

These instructions apply to the whole repository.

## Required reading

Before working on the portfolio, redesign prototypes, visual assets, animation, or related research, read [DESIGN-PROGRESS.md](DESIGN-PROGRESS.md). Then read the notes relevant to the folder you will work in.

`DESIGN-PROGRESS.md` is the canonical current-state handoff. Older research files, mockup prompts, and coordination notes are historical context; they do not override a newer user decision recorded in the handoff. Direct user instructions take precedence.

## Required progress updates

Every agent working on this project must maintain `DESIGN-PROGRESS.md` as part of its task, without waiting for the user to request another update.

- Refresh it after meaningful changes or discoveries, and always before handing work back to the user or another agent.
- Update the UTC timestamp, current status, affected artifact links, decisions, validation evidence, limitations, and next steps as applicable.
- Append a concise dated work-log entry with the agent, outcome, changed paths, and checks performed.
- Distinguish explicit user preferences from agent suggestions, implemented features from proposed ideas, and observed results from unverified reports. Never turn an agent's favorite mockup into an approved user decision.
- Record failures and unfinished work honestly. Do not mark something validated, selected, published, or complete without evidence.
- Keep the current-state sections concise. Preserve useful history in the work log and link to detailed prompts or research rather than copying entire transcripts.
- For parallel work, the coordinator owns the shared handoff while workers have separate write scopes. Workers must report their changes, checks, and remaining work; the coordinator integrates those reports into the document before final handoff. A standalone agent updates it directly.
- Re-read the current handoff before editing it when another agent may have changed it. Merge updates; do not overwrite another agent's progress.

## Working conventions

- Inspect the working tree before editing and preserve unrelated user or agent changes.
- Keep exploratory work in the existing draft/mockup folders or a clearly named new folder. Do not replace the root portfolio merely as a side effect of an experiment.
- Keep source assets and previous variations available. Save new image variations under distinct filenames and record their exact prompts and reference roles.
- Check real content before promoting generated mockup copy, dates, scores, or measurements into a portfolio page.
- Keep important information readable and provide reduced-motion and phone-layout treatments when implementing animation.
- Do not commit, push, switch branches, or publish unless the user's current task explicitly authorizes that action.
