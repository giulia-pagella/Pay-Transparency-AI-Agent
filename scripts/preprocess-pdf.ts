import fs from 'node:fs/promises';
import path from 'node:path';
import pdfParse from 'pdf-parse';

type RegulationDraft = {
  country_code: string;
  country_name: string;
  document_type: string;
  document_title: string;
  status: 'draft' | 'definitive';
  version: string;
  date: string;
  source_pdf_filename: string;
  source_url: string | null;
  sections: Array<{
    topic: string;
    title: string;
    content: string;
    article_references: string[];
    needs_review?: boolean;
  }>;
};

const INPUT_DIR = path.join(process.cwd(), 'data/regulations/source_pdfs');
const OUTPUT_DIR = path.join(process.cwd(), 'data/regulations/processed');

function inferMeta(fileName: string) {
  const base = fileName.toLowerCase();
  if (base.includes('direttiva')) {
    return {
      country_code: 'EU',
      country_name: 'Unione Europea',
      document_type: 'direttiva',
      document_title: 'Direttiva UE 2023/970',
      status: 'definitive' as const,
      output: 'eu_directive_2023_970.json',
    };
  }
  return {
    country_code: 'IT',
    country_name: 'Italia',
    document_type: 'bozza_decreto',
    document_title: 'Schema di decreto legislativo di recepimento della Direttiva UE 2023/970',
    status: 'draft' as const,
    output: 'italia_bozza_decreto.json',
  };
}

function splitSections(text: string) {
  const chunks = text.split(/\n(?=Art\.|ART\.|Titolo|CAPO)/g).slice(0, 20);
  if (chunks.length === 0) return [{ title: 'Testo estratto', content: text }];
  return chunks.map((chunk, i) => ({
    title: chunk.split('\n')[0].slice(0, 120) || `Sezione ${i + 1}`,
    content: chunk.slice(0, 3000),
  }));
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const files = (await fs.readdir(INPUT_DIR)).filter((f) => f.toLowerCase().endsWith('.pdf'));

  for (const file of files) {
    const fullPath = path.join(INPUT_DIR, file);
    const data = await fs.readFile(fullPath);
    const parsed = await pdfParse(data);
    const meta = inferMeta(file);
    const sections = splitSections(parsed.text).map((s) => ({
      topic: 'da_revisionare',
      title: s.title,
      content: s.content,
      article_references: [],
      needs_review: true,
    }));

    const output: RegulationDraft = {
      country_code: meta.country_code,
      country_name: meta.country_name,
      document_type: meta.document_type,
      document_title: meta.document_title,
      status: meta.status,
      version: new Date().toISOString().slice(0, 7),
      date: new Date().toISOString().slice(0, 10),
      source_pdf_filename: file,
      source_url: null,
      sections,
    };

    await fs.writeFile(path.join(OUTPUT_DIR, meta.output), JSON.stringify(output, null, 2), 'utf8');
    console.log(`Creato ${meta.output}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
