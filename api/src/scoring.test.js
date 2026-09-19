import { describe, it, expect } from 'vitest';
import { scoreAssessment } from './scoring.js';
import { scorePhq9, scoreGad7 } from '../../src/utils/assessmentScoring.js';

// --- Helper to build a 9-item array summing to a target score ---
function phq9Responses(total, item9Value = 0) {
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

describe('scoreAssessment — PHQ-9', () => {
  describe('severity boundaries', () => {
    it('all zeros → Minimal depression (0)', () => {
      const result = scoreAssessment('PHQ-9', [0, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(result.score).toBe(0);
      expect(result.severity).toBe('Minimal depression');
    });

    it('score 4 → Minimal depression', () => {
      const result = scoreAssessment('PHQ-9', phq9Responses(4));
      expect(result.score).toBe(4);
      expect(result.severity).toBe('Minimal depression');
    });

    it('score 5 → Mild depression', () => {
      const result = scoreAssessment('PHQ-9', phq9Responses(5));
      expect(result.score).toBe(5);
      expect(result.severity).toBe('Mild depression');
    });

    it('score 9 → Mild depression', () => {
      const result = scoreAssessment('PHQ-9', phq9Responses(9));
      expect(result.score).toBe(9);
      expect(result.severity).toBe('Mild depression');
    });

    it('score 10 → Moderate depression', () => {
      const result = scoreAssessment('PHQ-9', phq9Responses(10));
      expect(result.score).toBe(10);
      expect(result.severity).toBe('Moderate depression');
    });

    it('score 14 → Moderate depression', () => {
      const result = scoreAssessment('PHQ-9', phq9Responses(14));
      expect(result.score).toBe(14);
      expect(result.severity).toBe('Moderate depression');
    });

    it('score 15 → Moderately severe depression', () => {
      const result = scoreAssessment('PHQ-9', phq9Responses(15));
      expect(result.score).toBe(15);
      expect(result.severity).toBe('Moderately severe depression');
    });

    it('score 19 → Moderately severe depression', () => {
      const result = scoreAssessment('PHQ-9', phq9Responses(19));
      expect(result.score).toBe(19);
      expect(result.severity).toBe('Moderately severe depression');
    });

    it('score 20 → Severe depression', () => {
      const result = scoreAssessment('PHQ-9', phq9Responses(20));
      expect(result.score).toBe(20);
      expect(result.severity).toBe('Severe depression');
    });

    it('all threes (27) → Severe depression', () => {
      const result = scoreAssessment('PHQ-9', [3, 3, 3, 3, 3, 3, 3, 3, 3]);
      expect(result.score).toBe(27);
      expect(result.severity).toBe('Severe depression');
    });
  });

  describe('isHighRisk (suicidal ideation)', () => {
    it('item 9 = 0 → false', () => {
      expect(scoreAssessment('PHQ-9', [0, 0, 0, 0, 0, 0, 0, 0, 0]).isHighRisk).toBe(false);
    });

    it('item 9 = 1 → true', () => {
      expect(scoreAssessment('PHQ-9', [0, 0, 0, 0, 0, 0, 0, 0, 1]).isHighRisk).toBe(true);
    });

    it('item 9 = 3 → true', () => {
      expect(scoreAssessment('PHQ-9', [0, 0, 0, 0, 0, 0, 0, 0, 3]).isHighRisk).toBe(true);
    });
  });
});

describe('scoreAssessment — GAD-7', () => {
  describe('severity boundaries', () => {
    it('all zeros → Minimal anxiety (0)', () => {
      const result = scoreAssessment('GAD-7', [0, 0, 0, 0, 0, 0, 0]);
      expect(result.score).toBe(0);
      expect(result.severity).toBe('Minimal anxiety');
    });

    it('score 4 → Minimal anxiety', () => {
      const result = scoreAssessment('GAD-7', gad7Responses(4));
      expect(result.score).toBe(4);
      expect(result.severity).toBe('Minimal anxiety');
    });

    it('score 5 → Mild anxiety', () => {
      const result = scoreAssessment('GAD-7', gad7Responses(5));
      expect(result.score).toBe(5);
      expect(result.severity).toBe('Mild anxiety');
    });

    it('score 9 → Mild anxiety', () => {
      const result = scoreAssessment('GAD-7', gad7Responses(9));
      expect(result.score).toBe(9);
      expect(result.severity).toBe('Mild anxiety');
    });

    it('score 10 → Moderate anxiety', () => {
      const result = scoreAssessment('GAD-7', gad7Responses(10));
      expect(result.score).toBe(10);
      expect(result.severity).toBe('Moderate anxiety');
    });

    it('score 14 → Moderate anxiety', () => {
      const result = scoreAssessment('GAD-7', gad7Responses(14));
      expect(result.score).toBe(14);
      expect(result.severity).toBe('Moderate anxiety');
    });

    it('score 15 → Severe anxiety', () => {
      const result = scoreAssessment('GAD-7', gad7Responses(15));
      expect(result.score).toBe(15);
      expect(result.severity).toBe('Severe anxiety');
    });

    it('all threes (21) → Severe anxiety', () => {
      const result = scoreAssessment('GAD-7', [3, 3, 3, 3, 3, 3, 3]);
      expect(result.score).toBe(21);
      expect(result.severity).toBe('Severe anxiety');
    });
  });

  describe('isHighRisk', () => {
    it('score < 15 → false', () => {
      expect(scoreAssessment('GAD-7', gad7Responses(14)).isHighRisk).toBe(false);
    });

    it('score 15 → true', () => {
      expect(scoreAssessment('GAD-7', gad7Responses(15)).isHighRisk).toBe(true);
    });

    it('score > 15 → true', () => {
      expect(scoreAssessment('GAD-7', gad7Responses(18)).isHighRisk).toBe(true);
    });
  });
});

describe('scoreAssessment — input validation (strict)', () => {
  it('non-array → null', () => {
    expect(scoreAssessment('PHQ-9', 'not an array')).toBeNull();
  });

  it('wrong length for PHQ-9 → null', () => {
    expect(scoreAssessment('PHQ-9', [0, 0, 0])).toBeNull();
  });

  it('wrong length for GAD-7 → null', () => {
    expect(scoreAssessment('GAD-7', [0, 0, 0])).toBeNull();
  });

  it('values outside 0-3 (negative) → null', () => {
    expect(scoreAssessment('PHQ-9', [-1, 0, 0, 0, 0, 0, 0, 0, 0])).toBeNull();
  });

  it('values outside 0-3 (> 3) → null', () => {
    expect(scoreAssessment('PHQ-9', [4, 0, 0, 0, 0, 0, 0, 0, 0])).toBeNull();
  });

  it('non-integer values (float) → null', () => {
    expect(scoreAssessment('PHQ-9', [1.5, 0, 0, 0, 0, 0, 0, 0, 0])).toBeNull();
  });

  it('non-integer values (string) → null', () => {
    expect(scoreAssessment('PHQ-9', ['1', '0', '0', '0', '0', '0', '0', '0', '0'])).toBeNull();
  });

  it('unknown assessment type → null', () => {
    expect(scoreAssessment('UNKNOWN', [0, 0, 0, 0, 0, 0, 0, 0, 0])).toBeNull();
  });

  it('null responses → null', () => {
    expect(scoreAssessment('PHQ-9', null)).toBeNull();
  });

  it('undefined responses → null', () => {
    expect(scoreAssessment('PHQ-9', undefined)).toBeNull();
  });
});

describe('cross-check: server vs client scoring', () => {
  const testCases = [
    { responses: [0, 0, 0, 0, 0, 0, 0, 0, 0], label: 'all zeros' },
    { responses: [1, 1, 1, 1, 1, 0, 0, 0, 0], label: 'score 5' },
    { responses: [3, 3, 3, 1, 0, 0, 0, 0, 0], label: 'score 10' },
    { responses: [3, 3, 3, 3, 3, 0, 0, 0, 0], label: 'score 15' },
    { responses: [3, 3, 3, 3, 3, 3, 2, 0, 0], label: 'score 20' },
    { responses: [3, 3, 3, 3, 3, 3, 3, 3, 3], label: 'max score' },
    { responses: [0, 0, 0, 0, 0, 0, 0, 0, 1], label: 'suicidal ideation' },
  ];

  for (const { responses, label } of testCases) {
    it(`PHQ-9 ${label}: same severity and risk flag`, () => {
      const server = scoreAssessment('PHQ-9', responses);
      const client = scorePhq9(responses);
      expect(server.severity).toBe(client.severity);
      expect(server.isHighRisk).toBe(client.isHighRisk);
      expect(server.score).toBe(client.total);
    });
  }

  const gad7Cases = [
    { responses: [0, 0, 0, 0, 0, 0, 0], label: 'all zeros' },
    { responses: [1, 1, 1, 1, 1, 0, 0], label: 'score 5' },
    { responses: [3, 3, 3, 1, 0, 0, 0], label: 'score 10' },
    { responses: [3, 3, 3, 3, 3, 0, 0], label: 'score 15' },
    { responses: [3, 3, 3, 3, 3, 3, 3], label: 'max score' },
  ];

  for (const { responses, label } of gad7Cases) {
    it(`GAD-7 ${label}: same severity and risk flag`, () => {
      const server = scoreAssessment('GAD-7', responses);
      const client = scoreGad7(responses);
      expect(server.severity).toBe(client.severity);
      expect(server.isHighRisk).toBe(client.isHighRisk);
      expect(server.score).toBe(client.total);
    });
  }
});
