# ADR 0002: OpenRouter as primary AI gateway

## Status

Accepted

## Context

Creator needs multi-model routing (planner/coder/critic) without maintaining every provider SDK.

## Decision

Use OpenRouter as the primary completions gateway, with offline stubs when `OPENROUTER_API_KEY` is absent.

## Consequences

- One integration surface
- Easy model swaps via env
- Depends on OpenRouter availability/pricing
