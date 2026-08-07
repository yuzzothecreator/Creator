# ADR 0001: Approve before code

## Status

Accepted

## Context

AI app builders often jump straight to codegen, producing brittle architecture and teaching poor habits.

## Decision

Creator uses a mandatory multi-step planning pipeline. Codegen is blocked until the user explicitly approves the implementation plan.

## Consequences

- Longer time-to-first-file
- Higher architectural quality and mentoring value
- Clear audit trail of decisions in `pipeline_steps`
