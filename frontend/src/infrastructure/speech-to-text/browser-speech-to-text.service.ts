import type { SpeechToTextService } from "./speech-to-text.service";

type EndReason = "manual" | "error" | null;

export class BrowserSpeechToTextService implements SpeechToTextService {
    readonly type = "browser";
    
    private transcript = "";

    start(): Promise<void> {
        return new Promise((resolve, reject) => {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = "de-DE";
            recognition.interimResults = false;
            recognition.continuous = true;
            let endReason: EndReason = null;

            this.transcript = "";
            recognition.onresult = (event: any) => {
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        this.transcript += event.results[i][0].transcript + " ";
                    }
                }
            };

            recognition.onerror = (event: any) => {
                endReason = "error";
                recognition.stop();
                reject(new Error(event.error ?? "Speech recognition error"));
            }

            recognition.onend = () => {
                if (endReason === "error") {
                    return;
                }
                if (endReason === "manual") {
                    resolve();
                    return;
                }
                recognition.start();
            };

            recognition.start();
        });


        
        





    }

    stop(): Promise<string> {
        return new Promise((resolve) => {
            resolve(this.transcript.trim());
        });
    }
}