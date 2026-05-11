declare module 'pdf-parse' {
  interface PdfData {
    text: string;
    numpages: number;
    info: Record<string, unknown>;
  }

  function pdfParse(dataBuffer: Buffer | Uint8Array): Promise<PdfData>;

  export = pdfParse;
}
