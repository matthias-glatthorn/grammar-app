const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!VITE_API_BASE_URL) {
  throw new Error("Missing VITE_API_BASE_URL");
}

export interface TranscribeResponse {
  text: string;
}

export async function transcribe(audioBlob: Blob): Promise<TranscribeResponse> {
    let response: Response;

    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
        response = await fetch(`${VITE_API_BASE_URL}/stt/transcribe`, {
            method: "POST",
            body: formData
        });
    } catch (error) {
        console.error("Network error while calling STT API:", error);
        throw error;
    }

    if (!response.ok) {
        throw new Error("Speech to text failed with error code " + response.status);
    }

    const data: TranscribeResponse = await response.json();
    return data;
}