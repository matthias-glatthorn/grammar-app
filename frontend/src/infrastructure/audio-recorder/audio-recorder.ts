export class AudioRecorder {
    private mediaRecorder?: MediaRecorder;
    private stream?: MediaStream;
    private chunks: BlobPart[] = [];

    async start(): Promise<void> {
        if (this.isRecording()) {
            throw new Error("Recorder already started");
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
            throw new Error("Microphone access denied");
        }

        this.mediaRecorder = new MediaRecorder(this.stream);
        this.chunks = [];

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) {
                this.chunks.push(event.data);
            }
        };

        this.mediaRecorder.start();
    }

    private isRecording(): boolean {
        return this.mediaRecorder?.state === "recording";
    }

    async stop(): Promise<Blob | null> {
        if (!this.isRecording()) {
            return null;
        }

        return new Promise((resolve) => {
            this.mediaRecorder!.onstop = () => {
                const blob = new Blob(this.chunks, { type: "audio/webm" });

                this.stream?.getTracks().forEach(track => track.stop());

                this.mediaRecorder = undefined;
                this.stream = undefined;
                this.chunks = [];

                resolve(blob);
            };

            this.mediaRecorder!.stop();
        });
    }
}