import { describe, it, expect } from 'vitest';
import { scorePhq9, scoreGad7, isComplete } from './assessmentScoring.js';

// --- Helper to build a 9-item array summing to a target score ---
function phq9Responses(total, item9Value = 0) {
  // Distribute the score across items 0-7, then set item 8 to item9Value
  const responses = new Array(9).fill(0);
  responses[8] = item9Value;
  let remaining = total - item9Value;
  for (let i = 0; i < 8 && remaining > 0; i++) {
    const value = Math.min(3, remaining);
    responses[i] = value;
    remaining -= value;
  }
  return responses;
}

// --- Helper to build a 7-item array summing to a target score ---
function gad7Responses(total) {
  const responses = new Array(7).fill(0);
  let remaining = total;
  for (let i = 0; i < 7 && remaining > 0; i++) {
    const value = Math.min(3, remaining);
    responses[i] = value;
    remaining -= value;
  }
  return responses;
}

describe('scorePhq9', () => {
  describe('severity boundaries', () => {
    it('all zeros → Minimal depression (0)', () => {
      const result = scorePhq9([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(result.total).toBe(0);
      expect(result.severity).toBe('Minimal depression');
    });

    it('score 4 → Minimal depression', () => {
      const result = scorePhq9(phq9Responses(4));
      expect(result.total).toBe(4);
      expect(result.severity).toBe('Minimal depression');
    });

    it('score 5 → Mild depression', () => {
      const result = scorePhq9(phq9Responses(5));
      expect(result.total).toBe(5);
      expect(result.severity).toBe('Mild depression');
    });

    it('score 9 → Mild depression', () => {
      const result = scorePhq9(phq9Responses(9));
      expect(result.total).toBe(9);
      expect(result.severity).toBe('Mild depression');
    });

    it('score 10 → Moderate depression', () => {
      const result = scorePhq9(phq9Responses(10));
      expect(result.total).toBe(10);
      expect(result.severity).toBe('Moderate depression');
    });

    it('score 14 → Moderate depression', () => {
      const result = scorePhq9(phq9Responses(14));
      expect(result.total).toBe(14);
      expect(result.severity).toBe('Moderate depression');
    });

    it('score 15 → Moderately severe depression', () => {
      const result = scorePhq9(phq9Responses(15));
      expect(result.total).toBe(15);
      expect(result.severity).toBe('Moderately severe depression');
    });

    it('score 19 → Moderately severe depression', () => {
      const result = scorePhq9(phq9Responses(19));
      expect(result.total).toBe(19);
      expect(result.severity).toBe('Moderately severe depression');
    });

    it('score 20 → Severe depression', () => {
      const result = scorePhq9(phq9Responses(20));
      expect(result.total).toBe(20);
      expect(result.severity).toBe('Severe depression');
    });

    it('all threes (27) → Severe depression', () => {
      const result = scorePhq9([3, 3, 3, 3, 3, 3, 3, 3, 3]);
      expect(result.total).toBe(27);
      expect(result.severity).toBe('Severe depression');
    });
  });

  describe('suicidal ideation flag', () => {
    it('item 9 (index 8) = 0 → suicidalIdeation false', () => {
      const result = scorePhq9([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(result.suicidalIdeation).toBe(false);
      expect(result.isHighRisk).toBe(false);
    });

    it('item 9 (index 8) = 1 → suicidalIdeation true', () => {
      const result = scorePhq9([0, 0, 0, 0, 0, 0, 0, 0, 1]);
      expect(result.suicidalIdeation).toBe(true);
      expect(result.isHighRisk).toBe(true);
    });

    it('item 9 (index 8) = 2 → suicidalIdeation true', () => {
      const result = scorePhq9([0, 0, 0, 0, 0, 0, 0, 0, 2]);
      expect(result.suicidalIdeation).toBe(true);
      expect(result.isHighRisk).toBe(true);
    });

    it('item 9 (index 8) = 3 → suicidalIdeation true', () => {
      const result = scorePhq9([0, 0, 0, 0, 0, 0, 0, 0, 3]);
      expect(result.suicidalIdeation).toBe(true);
      expect(result.isHighRisk).toBe(true);
    });

    it('isHighRisk mirrors suicidalIdeation', () => {
      const noRisk = scorePhq9([3, 3, 3, 3, 3, 3, 3, 3, 0]);
      expect(noRisk.isHighRisk).toBe(noRisk.suicidalIdeation);
      expect(noRisk.isHighRisk).toBe(false);

      const risk = scorePhq9([0, 0, 0, 0, 0, 0, 0, 0, 1]);
      expect(risk.isHighRisk).toBe(risk.suicidalIdeation);
      expect(risk.isHighRisk).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('string values are coerced via Number()', () => {
      const result = scorePhq9(['2', '1', '0', '0', '0', '0', '0', '0', '0']);
      expect(result.total).toBe(3);
      expect(result.severity).toBe('Minimal depression');
    });

    it('undefined/null values are treated as 0', () => {
      const result = scorePhq9([undefined, null, 0, 0, 0, 0, 0, 0, 0]);
      expect(result.total).toBe(0);
      expect(result.severity).toBe('Minimal depression');
    });
  });
});

describe('scoreGad7', () => {
  describe('severity boundaries', () => {
    it('all zeros → Minimal anxiety (0)', () => {
      const result = scoreGad7([0, 0, 0, 0, 0, 0, 0]);
      expect(result.total).toBe(0);
      expect(result.severity).toBe('Minimal anxiety');
    });

    it('score 4 → Minimal anxiety', () => {
      const result = scoreGad7(gad7Responses(4));
      expect(result.total).toBe(4);
      expect(result.severity).toBe('Minimal anxiety');
    });

    it('score 5 → Mild anxiety', () => {
      const result = scoreGad7(gad7Responses(5));
      expect(result.total).toBe(5);
      expect(result.severity).toBe('Mild anxiety');
    });

    it('score 9 → Mild anxiety', () => {
      const result = scoreGad7(gad7Responses(9));
      expect(result.total).toBe(9);
      expect(result.severity).toBe('Mild anxiety');
    });

    it('score 10 → Moderate anxiety', () => {
      const result = scoreGad7(gad7Responses(10));
      expect(result.total).toBe(10);
      expect(result.severity).toBe('Moderate anxiety');
    });

    it('score 14 → Moderate anxiety', () => {
      const result = scoreGad7(gad7Responses(14));
      expect(result.total).toBe(14);
      expect(result.severity).toBe('Moderate anxiety');
    });

    it('score 15 → Severe anxiety', () => {
      const result = scoreGad7(gad7Responses(15));
      expect(result.total).toBe(15);
      expect(result.severity).toBe('Severe anxiety');
    });

    it('all threes (21) → Severe anxiety', () => {
      const result = scoreGad7([3, 3, 3, 3, 3, 3, 3]);
      expect(result.total).toBe(21);
      expect(result.severity).toBe('Severe anxiety');
    });
  });

  describe('isHighRisk', () => {
    it('score < 15 → false', () => {
      expect(scoreGad7(gad7Responses(14)).isHighRisk).toBe(false);
    });

    it('score 15 → true', () => {
      expect(scoreGad7(gad7Responses(15)).isHighRisk).toBe(true);
    });

    it('score > 15 → true', () => {
      expect(scoreGad7(gad7Responses(18)).isHighRisk).toBe(true);
    });
  });
});

describe('isComplete', () => {
  it('correct length, all numbers → true', () => {
    expect(isComplete([0, 1, 2, 3], 4)).toBe(true);
  });

  it('wrong length → false', () => {
    expect(isComplete([0, 1, 2], 4)).toBe(false);
  });

  it('contains string → false', () => {
    expect(isComplete([0, '1', 2, 3], 4)).toBe(false);
  });

  it('contains undefined → false', () => {
    expect(isComplete([0, undefined, 2, 3], 4)).toBe(false);
  });

  it('empty array with 0 expected → true', () => {
    expect(isComplete([], 0)).toBe(true);
  });
});
