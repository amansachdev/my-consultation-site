import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { verifySignature, validateBooking, cleanText, cleanPayment } from './validation.js';

// --- Helper: compute a valid HMAC-SHA256 hex signature ---
function hmacHex(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

// ────────────────────────────────────────────────────────────
//  verifySignature
// ────────────────────────────────────────────────────────────
describe('verifySignature', () => {
  const secret = 'test-secret-key';
  const payload = 'order_123|pay_456';

  it('valid HMAC → true', () => {
    const sig = hmacHex(payload, secret);
    expect(verifySignature(payload, sig, secret)).toBe(true);
  });

  it('wrong signature → false', () => {
    expect(verifySignature(payload, 'deadbeef', secret)).toBe(false);
  });

  it('empty signature → false', () => {
    expect(verifySignature(payload, '', secret)).toBe(false);
  });

  it('null signature → false', () => {
    expect(verifySignature(payload, null, secret)).toBe(false);
  });

  it('empty secret → false', () => {
    const sig = hmacHex(payload, secret);
    expect(verifySignature(payload, sig, '')).toBe(false);
  });

  it('null secret → false', () => {
    const sig = hmacHex(payload, secret);
    expect(verifySignature(payload, sig, null)).toBe(false);
  });

  it('different payload → false', () => {
    const sig = hmacHex(payload, secret);
    expect(verifySignature('different-payload', sig, secret)).toBe(false);
  });

  it('different length signatures → false (length check)', () => {
    // A signature that is shorter than expected
    expect(verifySignature(payload, 'ab', secret)).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
//  cleanText
// ────────────────────────────────────────────────────────────
describe('cleanText', () => {
  it('normal string', () => {
    expect(cleanText('hello', 10)).toBe('hello');
  });

  it('null → empty string', () => {
    expect(cleanText(null, 10)).toBe('');
  });

  it('undefined → empty string', () => {
    expect(cleanText(undefined, 10)).toBe('');
  });

  it('truncation at maxLength', () => {
    expect(cleanText('abcdefghij', 5)).toBe('abcde');
  });

  it('trimming whitespace', () => {
    expect(cleanText('  hello  ', 10)).toBe('hello');
  });

  it('trimming then truncating', () => {
    expect(cleanText('  abcdefghij  ', 5)).toBe('abcde');
  });
});

// ────────────────────────────────────────────────────────────
//  validateBooking
// ────────────────────────────────────────────────────────────
describe('validateBooking', () => {
  const validBody = {
    fullName: 'Jane Doe',
    age: 25,
    phone: '+91-9876543210',
    email: 'jane@example.com',
    consultationType: 'Psychiatric Consultation',
    preferredDate: '2025-03-15',
    preferredTime: '10:00',
    message: 'Looking forward to the session.',
  };

  it('valid complete booking → returns cleaned object', () => {
    const result = validateBooking(validBody);
    expect(result).not.toBeNull();
    expect(result.fullName).toBe('Jane Doe');
    expect(result.age).toBe(25);
    expect(result.phone).toBe('+91-9876543210');
    expect(result.email).toBe('jane@example.com');
    expect(result.consultationType).toBe('Psychiatric Consultation');
    expect(result.preferredDate).toBe('2025-03-15');
    expect(result.preferredTime).toBe('10:00');
    expect(result.message).toBe('Looking forward to the session.');
  });

  it('missing fullName → null', () => {
    expect(validateBooking({ ...validBody, fullName: '' })).toBeNull();
  });

  it('age below 18 → null', () => {
    expect(validateBooking({ ...validBody, age: 17 })).toBeNull();
  });

  it('age above 120 → null', () => {
    expect(validateBooking({ ...validBody, age: 121 })).toBeNull();
  });

  it('non-integer age (25.5) → null', () => {
    expect(validateBooking({ ...validBody, age: 25.5 })).toBeNull();
  });

  it('age as valid string "25" → works (Number coercion → integer)', () => {
    const result = validateBooking({ ...validBody, age: '25' });
    expect(result).not.toBeNull();
    expect(result.age).toBe(25);
  });

  it('age as non-integer string "25.5" → null', () => {
    expect(validateBooking({ ...validBody, age: '25.5' })).toBeNull();
  });

  it('missing phone → null', () => {
    expect(validateBooking({ ...validBody, phone: '' })).toBeNull();
  });

  it('missing email → null', () => {
    expect(validateBooking({ ...validBody, email: '' })).toBeNull();
  });

  it('missing consultationType → null', () => {
    expect(validateBooking({ ...validBody, consultationType: '' })).toBeNull();
  });

  it('missing preferredDate → null', () => {
    expect(validateBooking({ ...validBody, preferredDate: '' })).toBeNull();
  });

  it('missing preferredTime → null', () => {
    expect(validateBooking({ ...validBody, preferredTime: '' })).toBeNull();
  });

  it('message is optional (can be empty)', () => {
    const result = validateBooking({ ...validBody, message: '' });
    expect(result).not.toBeNull();
    expect(result.message).toBe('');
  });

  it('text truncation: fullName longer than 120 chars gets truncated', () => {
    const longName = 'A'.repeat(200);
    const result = validateBooking({ ...validBody, fullName: longName });
    expect(result).not.toBeNull();
    expect(result.fullName).toBe('A'.repeat(120));
  });

  it('whitespace trimming: name with leading/trailing spaces gets trimmed', () => {
    const result = validateBooking({ ...validBody, fullName: '  Jane Doe  ' });
    expect(result).not.toBeNull();
    expect(result.fullName).toBe('Jane Doe');
  });
});

// ────────────────────────────────────────────────────────────
//  cleanPayment
// ────────────────────────────────────────────────────────────
describe('cleanPayment', () => {
  it('valid payment object → returns cleaned fields', () => {
    const body = {
      payment: {
        orderId: 'order_123',
        paymentId: 'pay_456',
        signature: 'sig_789',
      },
    };
    const result = cleanPayment(body);
    expect(result).toEqual({
      orderId: 'order_123',
      paymentId: 'pay_456',
      signature: 'sig_789',
    });
  });

  it('missing payment → null', () => {
    expect(cleanPayment({})).toBeNull();
  });

  it('payment not an object (string) → null', () => {
    expect(cleanPayment({ payment: 'not-an-object' })).toBeNull();
  });

  it('null body → null', () => {
    expect(cleanPayment(null)).toBeNull();
  });

  it('undefined body → null', () => {
    expect(cleanPayment(undefined)).toBeNull();
  });

  it('missing orderId → null', () => {
    expect(cleanPayment({ payment: { paymentId: 'pay_456', signature: 'sig_789' } })).toBeNull();
  });

  it('missing paymentId → null', () => {
    expect(cleanPayment({ payment: { orderId: 'order_123', signature: 'sig_789' } })).toBeNull();
  });

  it('missing signature → null', () => {
    expect(cleanPayment({ payment: { orderId: 'order_123', paymentId: 'pay_456' } })).toBeNull();
  });
});
