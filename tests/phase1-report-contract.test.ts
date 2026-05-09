import { describe, expect, it } from 'vitest';
import maturity from '@/data/maturity-assessment.json';
import { assessQuality } from '@/lib/ai/gemini';
import { buildReportSkeleton, repairReportFromAi } from '@/lib/report/assembler';
import { maturityAssessmentSchema } from '@/lib/schemas/maturity';
import type { Regulation } from '@/lib/schemas/regulations';
import { reportSchema } from '@/lib/schemas/report';

const company = {
  company_name: 'Aurora Retail S.p.A.',
  sector: 'retail',
  employee_range: '100-149',
  organizational_model: 'mono-entita nazionale',
};

const assessmentInput = {
  company,
  selected_countries: ['IT'],
  maturity: {
    talent_attraction: 2,
    recruiting: 2,
    pay_structure: 2,
    job_architecture: 2,
    performance: 3,
    career_paths: 3,
  },
};

const obligation = (i: number) => ({
  article: `Articolo ${i}`,
  title: `Obbligo ${i}`,
  description: `Descrizione operativa dell'obbligo ${i}.`,
  subject: 'datore di lavoro',
  source_tag: 'FONTE UE',
});

const recommendation = (i: number, temporal_tag = 'Immediata') => ({
  id: `R${i}`,
  priority: i === 1 ? 'Alta' : 'Media',
  temporal_tag,
  related_areas: ['talent_attraction'],
  related_countries: ['IT'],
  title: `Raccomandazione ${i}`,
  short_description: `Sintesi operativa della raccomandazione ${i}.`,
  concrete_actions: [
    'Definire range retributivi per annunci',
    'Documentare owner e calendario operativo',
  ],
  directive_articles: ['Articolo 5'],
});

const maturityArea = (overrides = {}) => ({
  area_id: 'talent_attraction',
  area_name: 'Talent Attraction',
  maturity_level: 'Parziale',
  attention: 'Media',
  directive_articles: ['Articolo 5'],
  analysis: 'Prima frase diagnostica. Seconda frase diagnostica. Terza frase diagnostica.',
  ...overrides,
});

function validAiDraft(overrides: Record<string, unknown> = {}) {
  return {
    executive_summary: {
      headline: 'Processi retributivi da rafforzare per coprire gli obblighi italiani sul retail Aurora Retail S.p.A.',
      paragraph:
        'Aurora Retail S.p.A. opera nel settore retail con 100-149 dipendenti e un perimetro italiano. Il report valuta sei aree e individua processi da consolidare. La normativa richiede trasparenza pre-assuntiva e reporting documentabile. Le priorita operative sono collegate agli articoli della Direttiva.',
      key_points: ['Richiede range negli annunci.', 'Prevede dati payroll coerenti.', 'Necessita criteri documentati.', 'Deve presidiare reporting.'],
    },
    eu_directive: {
      key_obligations: [obligation(1), obligation(2), obligation(3)],
    },
    maturity: [maturityArea()],
    recommendations: [
      recommendation(1, 'Immediata'),
      recommendation(2, 'Entro 6 mesi'),
      recommendation(3, 'Entro 12 mesi'),
      recommendation(4, 'Entro 12 mesi'),
    ],
    roadmap: {
      roadmap_intro: 'Roadmap sintetica per ordinare le priorita operative.',
      engagement_priorities: ['Priorita una', 'Priorita due', 'Priorita tre'],
    },
    countries_comparison: {
      thesis: null,
      timeline: [],
      table_rows: [],
    },
    ...overrides,
  };
}

function regulation(country_code: string, country_name: string, status: 'definitive' | 'draft'): Regulation {
  return {
    country_code,
    country_name,
    document_type: 'normativa',
    document_title: `Fonte ${country_name}`,
    status,
    version: '2026-01',
    date: '2026-01-01',
    source_pdf_filename: null,
    source_url: null,
    sections: [
      {
        topic: 'trasparenza_preassunzione',
        title: 'Trasparenza preassunzione',
        content: 'Contenuto normativo sufficientemente lungo per superare la validazione dello schema.',
        article_references: ['Articolo 5'],
      },
    ],
  };
}

describe('phase 1 report contract', () => {
  it('schema accetta il contratto target', () => {
    const report = {
      metadata: {
        ...company,
        generated_at: '2026-05-09T12:00:00.000Z',
        selected_countries: ['IT'],
        completed_areas_count: 6,
        has_draft_sources: true,
        has_partial_data_flag: true,
        tool_version: '1.0.0',
      },
      executive_summary: {
        overall_attention: 'media',
        headline: 'Headline completa per il report.',
        paragraph: 'Paragrafo completo per il report.',
        key_points: ['A', 'B', 'C', 'D'],
      },
      perimeter: {
        company_block: company,
        countries_analyzed: [{ code: 'IT', name: 'Italia', status: 'draft' }],
        excluded_scope: 'Fuori perimetro.',
      },
      eu_directive: {
        overview: 'Overview.',
        key_obligations: [obligation(1), obligation(2), obligation(3)],
        timeline_summary: 'Timeline.',
      },
      country_analysis: [],
      countries_comparison: {
        thesis: null,
        timeline: [],
        table_rows: [],
        narrative: '',
      },
      impacts_by_area: [],
      maturity: [
        {
          ...maturityArea(),
          current_level: 2,
          current_level_label: 'Parziale',
          gap_description: 'Gap.',
          recommendation: 'Legacy opzionale.',
        },
      ],
      recommendations: [
        recommendation(1, 'Immediata'),
        recommendation(2, 'Entro 6 mesi'),
        recommendation(3, 'Entro 12 mesi'),
        recommendation(4, 'Entro 12 mesi'),
      ].map((r) => ({ ...r, description: r.short_description })),
      roadmap: {
        roadmap_intro: 'Intro roadmap.',
        engagement_priorities: ['Una', 'Due', 'Tre'],
      },
      limits: {
        scope_limitations: 'Limite.',
        methodological_caveats: 'Caveat.',
        draft_warning: 'Bozza.',
        partial_data_warning: 'Parziale.',
      },
      sources: [],
    };

    expect(() => reportSchema.parse(report)).not.toThrow();
  });

  it('assembler normalizza legacy e camelCase verso target senza perdere legacy', () => {
    const parsedMaturity = maturityAssessmentSchema.parse(maturity);
    const skeleton = buildReportSkeleton({
      company,
      selectedCountries: ['IT'],
      completedAreasCount: 6,
      hasDraftSources: true,
      hasPartialDataFlag: true,
      selectedRegulations: [regulation('IT', 'Italia', 'draft')],
      euRegulation: regulation('EU', 'Unione Europea', 'definitive'),
      maturityConfig: parsedMaturity,
      maturityValues: Object.fromEntries(parsedMaturity.areas.map((area) => [area.id, 2])),
      attentionByArea: Object.fromEntries(parsedMaturity.areas.map((area) => [area.id, 'media' as const])),
      overallAttention: 'media',
    });

    const repaired = repairReportFromAi(
      {
        ...validAiDraft({
          eu_directive: {
            overview: 'Overview.',
            timeline_summary: 'Timeline.',
            key_obligations: [1, 2, 3].map((i) => ({
              article_reference: `Articolo ${i}`,
              title: `Obbligo ${i}`,
              description: `Descrizione ${i}.`,
            })),
          },
          countries_comparison: {
            comparison_table: [{ topic: 'Tema', cells: { IT: 'Valore' } }],
            narrative: 'Narrativa.',
          },
          roadmap_intro: 'Intro legacy.',
          engagement_priorities: ['Priorita una', 'Priorita due', 'Priorita tre'],
          recommendations: [
            {
              ...recommendation(1, 'Immediata'),
              temporal_tag: undefined,
              short_description: undefined,
              concrete_actions: undefined,
              directive_articles: undefined,
              temporalTag: 'Immediata',
              shortDescription: 'Short one.',
              concreteActions: ['Azione concreta uno', 'Azione concreta due'],
              directiveArticles: ['Articolo 5'],
            },
            {
              ...recommendation(2, 'Entro 6 mesi'),
              temporal_tag: undefined,
              short_description: undefined,
              concrete_actions: undefined,
              directive_articles: undefined,
              temporalTag: 'Entro 6 mesi',
              shortDescription: 'Short two.',
              concreteActions: ['Azione concreta uno', 'Azione concreta due'],
              directiveArticles: ['Articolo 6'],
            },
            {
              ...recommendation(3, 'Entro 12 mesi'),
              temporal_tag: undefined,
              short_description: undefined,
              concrete_actions: undefined,
              directive_articles: undefined,
              temporalTag: 'Entro 12 mesi',
              shortDescription: 'Short three.',
              concreteActions: ['Azione concreta uno', 'Azione concreta due'],
              directiveArticles: ['Articolo 7'],
            },
            {
              ...recommendation(4, 'Entro 12 mesi'),
              temporal_tag: undefined,
              short_description: undefined,
              concrete_actions: undefined,
              directive_articles: undefined,
              temporalTag: 'Entro 12 mesi',
              shortDescription: 'Short four.',
              concreteActions: ['Azione concreta uno', 'Azione concreta due'],
              directiveArticles: ['Articolo 8'],
            },
          ],
        }),
      },
      skeleton,
    );

    expect(repaired.eu_directive.key_obligations[0]).toMatchObject({
      article: 'Articolo 1',
      article_reference: 'Articolo 1',
      subject: 'datore di lavoro',
      source_tag: 'FONTE UE',
    });
    expect(repaired.countries_comparison.table_rows).toHaveLength(1);
    expect(repaired.roadmap.roadmap_intro).toBe('Intro legacy.');
    expect(repaired.recommendations[0].temporal_tag).toBe('Immediata');
    expect(repaired.recommendations[0].short_description).toBe('Short one.');
    expect(() => reportSchema.parse(repaired)).not.toThrow();
  });

  it('quality check fallisce per obligation senza subject', () => {
    const draft = validAiDraft({
      eu_directive: { key_obligations: [obligation(1), { ...obligation(2), subject: undefined }, obligation(3)] },
    });
    expect(assessQuality(draft, { assessmentInput }).join(' ')).toContain('subject');
  });

  it('quality check fallisce se le raccomandazioni non sono 4', () => {
    const draft = validAiDraft({ recommendations: [recommendation(1), recommendation(2), recommendation(3)] });
    expect(assessQuality(draft, { assessmentInput }).join(' ')).toContain('esattamente 4');
  });

  it('quality check fallisce se roadmap manca priorities', () => {
    const draft = validAiDraft({ roadmap: { roadmap_intro: 'Intro.' } });
    expect(assessQuality(draft, { assessmentInput }).join(' ')).toContain('engagement_priorities');
  });

  it('quality check fallisce se maturity manca attention', () => {
    const draft = validAiDraft({ maturity: [maturityArea({ attention: undefined })] });
    expect(assessQuality(draft, { assessmentInput }).join(' ')).toContain('attention');
  });
});
