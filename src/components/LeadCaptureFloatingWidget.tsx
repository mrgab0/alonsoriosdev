"use client";

import { useState, useEffect } from 'react';

/**
 * Simple floating widget that appears after a delay (default 7 s) and
 * captures the visitor's email. The email is sent to `/api/email/subscribe`
 * which stores the lead and dispatches a welcome email via Resend.
 *
 * The widget is shown only once per visitor using `localStorage` flag
 * `leadCaptureSeen` to avoid intrusiveness.
 */
export default function LeadCaptureFloatingWidget({
  delayMs = 7000,
}: {
  delayMs?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('leadCaptureSeen')) return;
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const submit = async () => {
    if (!email) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.sent) {
        setStatus('sent');
        setMessage('¡Gracias! Te enviamos un cupón de bienvenida.');
        localStorage.setItem('leadCaptureSeen', 'true');
      } else {
        throw new Error(data.error || 'Error al suscribirse');
      }
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded p-4 w-80 z-50">
      <h3 className="text-lg font-semibold mb-2">¡Suscríbete!</h3>
      <p className="text-sm mb-2">Obtén 10 % de descuento en tu primera compra.</p>
      {status === 'sent' ? (
        <p className="text-green-600">{message}</p>
      ) : (
        <>
          <input
            type="email"
            placeholder="tu@email.com"
            className="w-full border rounded px-2 py-1 mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'sending'}
          />
          <button
            className="w-full bg-indigo-600 text-white rounded py-1 hover:bg-indigo-700"
            onClick={submit}
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Enviando…' : 'Recibir cupón'}
          </button>
          {status === 'error' && (
            <p className="text-red-600 mt-1 text-sm">{message}</p>
          )}
        </>
      )}
    </div>
  );
}
