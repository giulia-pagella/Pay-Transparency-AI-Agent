'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icon';

interface SessionHeaderProps {
  showClose?: boolean;
}

export function SessionHeader({ showClose = true }: SessionHeaderProps) {
  const router = useRouter();

  async function clearSession() {
    const ok = window.confirm(
      "Chiudendo la sessione verranno cancellati la tua chiave API, i dati del questionario e il report generato. L'operazione non è reversibile. Vuoi procedere?",
    );
    if (!ok) return;
    await fetch('/api/ai/session/clear', { method: 'POST' });
    router.push('/configurazione');
  }

  return (
    <header className="ptt-header">
      <div className="ptt-header-left">
        <Image
          src="/assets/logo-nttdata-blue.svg"
          alt="NTT DATA"
          width={88}
          height={22}
          className="ptt-header-logo"
          priority
        />
        <div className="ptt-header-divider" />
        <div>
          <div className="ptt-header-product">Pay Transparency Assessment</div>
          <div className="ptt-header-product-sub">HR Advisory · EU Directive 2023/970</div>
        </div>
      </div>

      <div className="ptt-header-right">
        {showClose && (
          <>
            <div className="ptt-session">
              <span className="ptt-session-dot" />
              <span>Sessione attiva</span>
            </div>
            <button className="ptt-btn-ghost" onClick={clearSession}>
              <Icon name="x" size={12} />
              Chiudi sessione
            </button>
          </>
        )}
      </div>
    </header>
  );
}
