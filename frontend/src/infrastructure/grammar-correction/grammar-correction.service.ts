import { correctGrammar } from "../api/grammar-correction-api-client";

export class GrammarCorrectionService {
    async correct(email: string, text: string): Promise<string> {
        const { correctedText } = await correctGrammar(email, text);
        return correctedText
    }
}