const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!VITE_API_BASE_URL) {
  throw new Error("Missing VITE_API_BASE_URL");
}

export interface CorrectGrammarResponse {
  originalText: string;
  correctedText: string;
}

export async function correctGrammar(email: string, text: string): Promise<CorrectGrammarResponse> {
    let response: Response;

    try {
        response = await fetch(
            `${VITE_API_BASE_URL}/grammar/check`,
            { 
                method: "POST" ,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, text })
            }
        );
    } catch (error) {
        console.error("Network error while calling Grammar Correction API:", error);
        throw error;
    }

    if (!response.ok) {
        throw new Error("Grammar correction failed with error code " + response.status);
    }

    const data = await response.json() as CorrectGrammarResponse;
    return data;
}