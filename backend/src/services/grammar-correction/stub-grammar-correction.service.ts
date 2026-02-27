import type { GrammarCorrectionService, GrammarRequest, GrammarResult } from "./grammar-correction.service";

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export class StubGrammarCorrectionService implements GrammarCorrectionService {
    async correct(input: GrammarRequest): Promise<GrammarResult> {
        await delay(2000);

        console.log("StubGrammarCorrectionService received request:", {
            ...input
        });

        const words = input.text.trim().split(/\s+/);

        const correctedText = words
            .map((word, i) => {
                if (i % 2 === 0) return word.toUpperCase();
                return word;
            })
            .join(" ");

        return {
            originalText: input.text,
            correctedText: "(Stub) " + correctedText,
        };
    }
}