import { SpeechToTextError, type SpeechToTextService } from "./speech-to-text.service";


export class BrowserSpeechToTextService implements SpeechToTextService {
    private recognition: any;
    private isStopping = false;

    private transcript = "";
    private stopResolve?: (text: string) => void;
    private errorHandler?: (error: SpeechToTextError) => void;

    onError(cb: (error: SpeechToTextError) => void) {
        this.errorHandler = cb;
    }

    start() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = "de-DE";
        this.recognition.interimResults = true;
        this.recognition.continuous = true;
        this.isStopping = false;

        this.transcript = "";
        this.recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    this.transcript += event.results[i][0].transcript + " ";
                }
            }
        };

        this.recognition.onerror = (event: any) => {
            if (event.error === "aborted") return;

            this.isStopping = true;
            this.recognition.stop();

            const error = new SpeechToTextError(event.error);
            this.errorHandler?.(error);
        }

        this.recognition.onend = () => {
            if (this.isStopping) {
                const result = this.transcript.trim();
                this.stopResolve?.(result);
                this.cleanup();
                return;
            }

            this.recognition.start();
        };

        this.recognition.start();
    }

    stop(): Promise<string> {
        if (!this.recognition) {
            return Promise.reject(
                new SpeechToTextError("Speech recognition not initialized")
            );
        }

        return new Promise((resolve) => {
            this.isStopping = true;
            this.stopResolve = resolve;

            this.recognition.stop();
        });
    }

    abort(): void {
        this.isStopping = true;
        this.recognition?.abort();
        this.cleanup();
    }

    private cleanup() {
        this.recognition = null;
        this.stopResolve = undefined;
    }
}