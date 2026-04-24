'use client';

import { useRouter } from 'next/navigation';

export function SessionHeader({ showClose = true }: { showClose?: boolean }) {
  const router = useRouter();

  async function clearSession() {
    const ok = window.confirm(
      'Chiudendo la sessione verranno cancellati la tua chiave API, i dati del questionario e il report generato. L\'operazione non è reversibile. Vuoi procedere?',
    );
    if (!ok) return;
    await fetch('/api/ai/session/clear', { method: 'POST' });
    router.push('/configurazione');
  }

  return (
    <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
      <h2 className="font-semibold text-navy">Pay Transparency Assessment</h2>
      {showClose ? (
        <button className="btn btn-secondary" onClick={clearSession}>
          Chiudi sessione
        </button>
      ) : null}
    </header>
  );
}
