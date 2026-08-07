import {
  PIPELINE_STEP_ORDER,
  type ExperienceMode,
  type MentoringPayload,
  type PipelineStepType,
} from '@creator/shared';
import { CreatorAgents } from './agents.js';
import { ModelRouter } from './router.js';

export interface PipelineState {
  stage: PipelineStepType;
  approvedForCode: boolean;
  context: Record<string, unknown>;
  steps: Array<{
    type: PipelineStepType;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_user' | 'skipped';
    payload?: unknown;
    mentoring?: MentoringPayload;
    error?: string;
  }>;
}

export function createInitialPipelineState(): PipelineState {
  return {
    stage: 'understand',
    approvedForCode: false,
    context: {},
    steps: PIPELINE_STEP_ORDER.map((type) => ({
      type,
      status: type === 'understand' ? 'pending' : 'pending',
    })),
  };
}

export function canEnterCodegen(state: PipelineState): boolean {
  return state.approvedForCode === true && state.stage === 'await_approval';
}

export function nextStep(current: PipelineStepType): PipelineStepType | null {
  const idx = PIPELINE_STEP_ORDER.indexOf(current);
  if (idx < 0 || idx >= PIPELINE_STEP_ORDER.length - 1) return null;
  return PIPELINE_STEP_ORDER[idx + 1] ?? null;
}

export class PipelineEngine {
  private readonly agents: CreatorAgents;

  constructor(router = new ModelRouter()) {
    this.agents = new CreatorAgents(router);
  }

  async advance(input: {
    state: PipelineState;
    idea: string;
    mode: ExperienceMode;
    userAnswers?: string;
  }): Promise<PipelineState> {
    const state: PipelineState = structuredClone(input.state);
    let stage = state.stage;

    if (stage === 'clarify' && input.userAnswers) {
      state.context.clarifications = input.userAnswers;
      stage = 'prd';
      state.stage = stage;
    }

    if (stage === 'await_approval') {
      const step = state.steps.find((s) => s.type === 'await_approval');
      if (step) {
        step.status = 'awaiting_user';
        step.payload = {
          message: 'Approve the implementation plan to start code generation.',
          canApprove: true,
        };
        step.mentoring = {
          why: 'Code without an approved plan creates thrash and insecure shortcuts.',
          tradeoffs: ['Speed now vs rework later'],
          security: ['Unreviewed plans often miss authz boundaries'],
          performance: ['Premature codegen locks suboptimal data models'],
          commonMistakes: ['Skipping approval because “it looks obvious”'],
          seniorTips: ['Treat approval as an architecture review gate'],
          nextStep: 'Click Approve to unlock codegen.',
        };
      }
      return state;
    }

    if (stage === 'codegen' && !state.approvedForCode) {
      throw new Error('Codegen blocked: implementation plan is not approved.');
    }

    const stepState = state.steps.find((s) => s.type === stage);
    if (!stepState) throw new Error(`Unknown stage ${stage}`);
    stepState.status = 'running';

    try {
      const result = await this.agents.runPipelineStep({
        step: stage,
        idea: input.idea,
        context: state.context,
        mode: input.mode,
      });

      stepState.status = stage === 'clarify' ? 'awaiting_user' : 'completed';
      stepState.payload = result.payload;
      stepState.mentoring = {
        why: result.mentoring.why,
        tradeoffs: [],
        security: result.mentoring.securityNotes,
        performance: result.mentoring.performanceNotes,
        commonMistakes: result.mentoring.commonMistakes,
        seniorTips: result.mentoring.seniorTips,
        nextStep: result.mentoring.nextStep,
        beginnerExercises: result.mentoring.exercises,
      };

      state.context[stage] = result.payload;

      if (stage === 'clarify') {
        state.stage = 'clarify';
        return state;
      }

      const nxt = nextStep(stage);
      if (nxt) state.stage = nxt;
      return state;
    } catch (error) {
      stepState.status = 'failed';
      stepState.error = error instanceof Error ? error.message : 'Unknown pipeline error';
      throw error;
    }
  }

  approve(state: PipelineState): PipelineState {
    const next = structuredClone(state);
    if (next.stage !== 'await_approval') {
      throw new Error('Can only approve at await_approval stage');
    }
    next.approvedForCode = true;
    const step = next.steps.find((s) => s.type === 'await_approval');
    if (step) step.status = 'completed';
    next.stage = 'codegen';
    return next;
  }
}
