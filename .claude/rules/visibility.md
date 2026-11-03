# Visibility

The owner must always see which agent is running, what step it is on, and every command it runs. The formats are in section (e) of `.claude/flows/agent-handoff.md`.

- Before each step, print a start line naming the task, phase, agent and step.
- Print every command with its result as it runs. Never run a command silently.
- Before starting a subagent, print what it will do. When it returns, print its activity log in full before acting on its result.
- Every subagent keeps an activity log of each step and each command with its result, and returns it in its payload.
- Every handoff block lists the agents that ran and the commands run in that phase.
- Never summarise away a failed command; show the failure.
