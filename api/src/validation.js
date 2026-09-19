import { createHmac, timingSafeEqual } from 'node:crypto';

export function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export function verifySignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function validateBooking(body) {
  const booking = {
    fullName: cleanText(body.fullName, 120),
    age: Number(body.age),
    phone: cleanText(body.phone, 30),
    email: cleanText(body.email, 160),
    consultationType: cleanText(body.consultationType, 80),
    preferredDate: cleanText(body.preferredDate, 20),
    preferredTime: cleanText(body.preferredTime, 20),
    message: cleanText(body.message, 1000),
  };
  const error = !booking.fullName || !Number.isInteger(booking.age) || booking.age < 18 || booking.age > 120 || !booking.phone || !booking.email || !booking.consultationType || !booking.preferredDate || !booking.preferredTime;
  return error ? null : booking;
}

export function cleanPayment(body) {
  const payment = body?.payment;
  if (!payment || typeof payment !== 'object') return null;
  const orderId = cleanText(payment.orderId, 80);
  const paymentId = cleanText(payment.paymentId, 80);
  const signature = cleanText(payment.signature, 160);
  return orderId && paymentId && signature ? { orderId, paymentId, signature } : null;
}
