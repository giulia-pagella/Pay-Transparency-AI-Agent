import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-4 text-4xl font-bold text-navy">Pay Transparency Assessment Tool</h1>
      <p className="mb-6 text-lg">
        Uno strumento guidato per comprendere la Direttiva UE sulla trasparenza retributiva, confrontare requisiti normativi tra paesi e valutare gli impatti organizzativi sulla tua azienda.
      </p>
      <p className="mb-8 rounded border-l-4 border-amber-400 bg-amber-50 p-4 text-sm">
        Il tool utilizza intelligenza artificiale per generare un report strutturato basato sulle tue risposte e su fonti normative verificate. Non sostituisce la consulenza legale professionale.
      </p>
      <Link href="/configurazione" className="btn btn-primary inline-block">
        Inizia assessment
      </Link>
    </main>
  );
}
