import assert from 'node:assert/strict';
import { createInitialPipelineState, canEnterCodegen, nextStep } from '../packages/ai/dist/pipeline.js';

const state = createInitialPipelineState();
assert.equal(state.stage, 'understand');
assert.equal(canEnterCodegen(state), false);
assert.equal(nextStep('prd'), 'user_stories');
assert.equal(nextStep('docs_pack'), null);

const approved = { ...state, stage: 'await_approval', approvedForCode: true };
assert.equal(canEnterCodegen(approved), true);

console.log('pipeline.test.mjs passed');
