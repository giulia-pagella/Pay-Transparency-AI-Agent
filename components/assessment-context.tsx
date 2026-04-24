'use client';

import { createContext, useContext, useMemo, useState } from 'react';

export type CompanyData = {
  company_name: string;
  sector: string;
  employee_range: string;
  organizational_model: string;
};

type Store = {
  company: CompanyData;
  countries: string[];
  maturity: Record<string, number | null>;
  setCompany: (x: CompanyData) => void;
  setCountries: (x: string[]) => void;
  setMaturity: (x: Record<string, number | null>) => void;
  resetAssessment: () => void;
};

const Ctx = createContext<Store | null>(null);

const defaultCompany: CompanyData = {
  company_name: '',
  sector: '',
  employee_range: '',
  organizational_model: '',
};

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanyData>(defaultCompany);
  const [countries, setCountries] = useState<string[]>([]);
  const [maturity, setMaturity] = useState<Record<string, number | null>>({});

  const value = useMemo(
    () => ({
      company,
      countries,
      maturity,
      setCompany,
      setCountries,
      setMaturity,
      resetAssessment: () => {
        setCompany(defaultCompany);
        setCountries([]);
        setMaturity({});
      },
    }),
    [company, countries, maturity],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAssessment() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('AssessmentProvider mancante');
  return ctx;
}
