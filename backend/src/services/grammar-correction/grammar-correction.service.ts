export type GrammarRequest = {
  text: string;
  email: string;
}

export type GrammarResult = {
  originalText: string;
  correctedText: string;
}

export interface GrammarCorrectionService {
  correct(input: GrammarRequest): Promise<GrammarResult>;
}