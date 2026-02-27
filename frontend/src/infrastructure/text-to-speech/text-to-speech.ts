export function speakText(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!("speechSynthesis" in window)) {
            reject(new Error("Speech synthesis not supported in this browser"));
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "de-DE";

        utterance.onend = () => {
            resolve();
        };

        utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event);
            reject(new Error("Speech synthesis failed"));
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    });
}