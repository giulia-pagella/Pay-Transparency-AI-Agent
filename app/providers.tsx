'use client';

import { AssessmentProvider } from '@/components/assessment-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AssessmentProvider>{children}</AssessmentProvider>;
}
