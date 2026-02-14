const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes': string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!BLOCK_SPAM) return true; // Escape hatch if needed
  if (!TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return false;
  }

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const formData = new FormData();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  try {
    const result = await fetch(url, {
      body: formData,
      method: 'POST',
    });

    const outcome: TurnstileVerifyResponse = await result.json();
    if (!outcome.success) {
      console.error('Turnstile verification failed:', outcome['error-codes']);
    }
    return outcome.success;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

// Optional: Feature flag to disable spam check easily
const BLOCK_SPAM = true;
