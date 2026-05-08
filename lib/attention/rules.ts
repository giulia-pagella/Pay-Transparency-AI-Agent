import type { MaturityAssessment } from '@/lib/schemas/maturity';

type Attention = 'alta' | 'media' | 'bassa';

const matrix: Record<number, { direct: Attention; indirect: Attention }> = {
  1: { direct: 'alta', indirect: 'alta' },
  2: { direct: 'alta', indirect: 'media' },
  3: { direct: 'media', indirect: 'media' },
  4: { direct: 'bassa', indirect: 'bassa' },
};

const up = (a: Attention): Attention => (a === 'bassa' ? 'media' : a === 'media' ? 'alta' : 'alta');

export function calculateAttention(
  maturityAssessment: MaturityAssessment,
  selectedValues: Record<string, number | null>,
  hasDraftSource: boolean,
) {
  const byArea: Record<string, Attention | null> = {};

  for (const area of maturityAssessment.areas) {
    const value = selectedValues[area.id];
    if (!value) {
      byArea[area.id] = null;
      continue;
    }
    const base = area.has_direct_obligation ? matrix[value].direct : matrix[value].indirect;
    byArea[area.id] = hasDraftSource ? up(base) : base;
  }

  const present = Object.values(byArea).filter(Boolean) as Attention[];
  const overall: Attention = present.includes('alta') ? 'alta' : present.includes('media') ? 'media' : 'bassa';

  return { byArea, overall };
}

// ─── New weighted scoring model ────────────────────────────────────────────

export type AttentionLevelBreakdown = {
  maturity: { value: number; weight: 0.5; contribution: number };
  organization: { value: number; weight: 0.25; contribution: number };
  timeToCompliance: { value: number; weight: 0.15; contribution: number };
  sectorRisk: { value: number; weight: 0.10; contribution: number };
};

export type AttentionLevelResult = {
  score: number;
  level: Attention;
  breakdown: AttentionLevelBreakdown;
  escalationBlocked: boolean;
  triggers: string[];
};

const HIGH_RISK_SECTORS = ['automotive', 'bancario', 'assicurativo', 'energy', 'telco', 'retail'];
const LOW_RISK_SECTORS = ['public sector', 'pubbl'];

function sectorRiskValue(sector: string): number {
  const s = sector.toLowerCase();
  if (HIGH_RISK_SECTORS.some((k) => s.includes(k))) return 100;
  if (LOW_RISK_SECTORS.some((k) => s.includes(k))) return 30;
  return 60;
}

function orgBaseValue(empRange: string): number {
  if (['<50', '50-99', '100-149', '150-249'].includes(empRange)) return 20;
  if (['250-499', '500-999'].includes(empRange)) return 50;
  return 75; // '1000+' — can't distinguish 1000-4999 from 5000+ with current questionnaire
}

export function calculateAttentionLevel(
  maturityValues: Record<string, number | null>,
  company: { employee_range: string; organizational_model: string; sector: string },
  selectedCountries: string[],
  selectedRegulations: Array<{ status: 'definitive' | 'draft' }>,
): AttentionLevelResult {
  const filled = Object.values(maturityValues).filter((v): v is number => v !== null);

  // Maturity factor: low maturity → high score
  const mean = filled.length > 0 ? filled.reduce((s, v) => s + v, 0) / filled.length : 2.5;
  const maturityValue = Math.round(((4 - mean) / 3) * 100);

  // Organization factor
  const orgModel = company.organizational_model.toLowerCase();
  const isMultiEntityNational = orgModel.includes('multi-entità');
  const isMultiCountry = selectedCountries.length > 1;
  let orgValue = orgBaseValue(company.employee_range);
  if (isMultiEntityNational) orgValue = Math.min(100, orgValue + 15);
  if (isMultiCountry) orgValue = Math.min(100, orgValue + 10);

  // Time-to-compliance factor
  const hasDefinitive = selectedRegulations.some((r) => r.status === 'definitive');
  // Without exact deadline data: 'definitive' = already in force (100), 'draft' only = upcoming (70)
  const timeToComplianceValue = hasDefinitive ? 100 : 70;

  // Sector risk factor
  const sectorValue = sectorRiskValue(company.sector);

  // Weighted score
  const maturityContrib = Math.round(maturityValue * 0.5);
  const orgContrib = Math.round(orgValue * 0.25);
  const timeContrib = Math.round(timeToComplianceValue * 0.15);
  const sectorContrib = Math.round(sectorValue * 0.10);
  const score = maturityContrib + orgContrib + timeContrib + sectorContrib;

  // Base level from score thresholds
  let level: Attention;
  let escalationBlocked = false;

  if (score <= 35) {
    level = 'bassa';
  } else if (score <= 65) {
    level = 'media';
  } else {
    // score ≥ 66: check override conditions before assigning Alta
    const areasIniziali = filled.filter((v) => v === 1).length;
    const areasInzialiOrParziali = filled.filter((v) => v <= 2).length;
    const conditionA = areasIniziali >= 2 || areasInzialiOrParziali >= 5;

    const isOver1000 = company.employee_range === '1000+';
    const conditionB = isOver1000 && (hasDefinitive || isMultiCountry || isMultiEntityNational);

    if (conditionA && conditionB) {
      level = 'alta';
    } else {
      level = 'media';
      escalationBlocked = true;
    }
  }

  // Build triggers list
  const triggers: string[] = [];
  if (isMultiEntityNational) triggers.push('multi-entità nazionale');
  if (isMultiCountry) triggers.push(`${selectedCountries.length} paesi selezionati`);
  if (hasDefinitive) {
    const n = selectedRegulations.filter((r) => r.status === 'definitive').length;
    triggers.push(`normativa già vigente in ${n} ${n === 1 ? 'paese' : 'paesi'}`);
  }
  const nIniziali = filled.filter((v) => v === 1).length;
  if (nIniziali > 0) triggers.push(`${nIniziali} ${nIniziali === 1 ? 'area' : 'aree'} con gap profondi`);
  const nParziali = filled.filter((v) => v === 2).length;
  if (nParziali > 0) triggers.push(`${nParziali} ${nParziali === 1 ? 'area' : 'aree'} con gap da colmare`);
  if (sectorValue === 100) triggers.push(`settore ad alta visibilità (${company.sector})`);
  if (sectorValue === 30) triggers.push(`settore a bassa esposizione regolatoria (${company.sector})`);

  return {
    score,
    level,
    breakdown: {
      maturity: { value: maturityValue, weight: 0.5, contribution: maturityContrib },
      organization: { value: orgValue, weight: 0.25, contribution: orgContrib },
      timeToCompliance: { value: timeToComplianceValue, weight: 0.15, contribution: timeContrib },
      sectorRisk: { value: sectorValue, weight: 0.10, contribution: sectorContrib },
    },
    escalationBlocked,
    triggers,
  };
}
