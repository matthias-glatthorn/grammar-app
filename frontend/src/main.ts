import { AudioRecorder } from './infrastructure/audio-recorder/audio-recorder';
import { GrammarCorrectionService } from './infrastructure/grammar-correction/grammar-correction.service';
import { BackendSpeechToTextService } from './infrastructure/speech-to-text/backend-speech-to-text.service';
import { BrowserSpeechToTextService } from './infrastructure/speech-to-text/browser-speech-to-text.service';
import { SpeechToTextError, type SpeechToTextService } from './infrastructure/speech-to-text/speech-to-text.service';
import { speakText } from './infrastructure/text-to-speech/text-to-speech';
import { createAppState } from './state/app-state';
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div class="card">
        <input id="email-input" type="email" name="email" placeholder="Your e-mail address" required>
    </div>
    <h3 id="state-headline"></h3>
    <div class="card">
        <div id="original-text" class="original-text"></div>
        <div id="corrected-text" class="corrected-text"></div>
        <audio id="audio" controls hidden></audio>
    </div>
    <div class="card">
      <button id="record-btn" type="button"></button>
      <button id="reset-btn" type="button">Reset</button>
    </div>
  </div>
`

const emailInputEl = document.querySelector<HTMLInputElement>("#email-input")!;
const stateHeadlineEl = document.querySelector<HTMLDivElement>("#state-headline")!;
const originalTextEl = document.querySelector<HTMLDivElement>("#original-text")!;
const correctedTextEl = document.querySelector<HTMLDivElement>("#corrected-text")!;
const audioEl = document.querySelector<HTMLAudioElement>("#audio")!;
const recordBtnEl = document.querySelector<HTMLButtonElement>("#record-btn")!;
const resetBtnEl = document.querySelector<HTMLButtonElement>("#reset-btn")!;

const audioRecorder = new AudioRecorder();
let audioUrl = "";

let speechToTextService: SpeechToTextService = createSpeechToTextService();
const grammarCorrectionService = new GrammarCorrectionService();

let originalText = "";
let correctedText = "";

const appState = createAppState(render);
appState.set("idle");

recordBtnEl.addEventListener("click", async () => {
    switch (appState.get()) {
        case "idle":
            const isValid = emailInputEl.checkValidity();
            if (isValid) {
                await audioRecorder.start();
                appState.set("recording");
                speechToTextService.start();
            }

            emailInputEl.reportValidity()
            break;
        case "recording":
            const audioBlob = await audioRecorder.stop();
            if (!audioBlob) {
                console.warn("No audio recorded");
                appState.set("idle");
                return;
            }
            audioUrl = URL.createObjectURL(audioBlob);
            audioEl.src = audioUrl;
            appState.set("stt");
            originalText = await speechToTextService.stop(audioBlob);
            appState.set("correcting");
            correctedText = await grammarCorrectionService.correct(emailInputEl.value, originalText);
            appState.set("speaking");
            try {
                await speakText(correctedText);
            } catch (error) {
                console.error("Error during text-to-speech:", error);
                appState.set("done");
            }
            appState.set("done");
            break;
    }
});

resetBtnEl.addEventListener("click", async () => {
    originalText = "";
    audioUrl = "";
    await audioRecorder.stop();

    speechToTextService.abort();

    appState.set("idle");
});

const ORIGINAL_PREFIX = "<strong>Original:</strong> ";
const CORRECTED_PREFIX = "<strong>Corrected:</strong> ";

function render() {
    switch (appState.get()) {
        case "idle":
            emailInputEl.disabled = false;
            stateHeadlineEl.textContent = "Ready to record";
            originalTextEl.innerHTML = "";
            correctedTextEl.innerHTML = "";
            audioEl.hidden = true;
            recordBtnEl.textContent = "Start Recording";
            recordBtnEl.disabled = false;
            break;
        case "recording":
            emailInputEl.disabled = true;
            stateHeadlineEl.textContent = "Recording ...";
            originalTextEl.innerHTML = "";
            correctedTextEl.innerHTML = "";
            audioEl.hidden = true;
            recordBtnEl.textContent = "Stop Recording";
            recordBtnEl.disabled = false;
            break;
        case "stt":
            emailInputEl.disabled = true;
            stateHeadlineEl.textContent = "Converting speech to text ...";
            originalTextEl.innerHTML = "";
            correctedTextEl.innerHTML = "";
            audioEl.hidden = false;
            recordBtnEl.textContent = "Stop Recording";
            recordBtnEl.disabled = true;
            break;
        case "correcting":
            emailInputEl.disabled = true;
            stateHeadlineEl.textContent = "Correcting grammar ...";
            originalTextEl.innerHTML = ORIGINAL_PREFIX + originalText;
            correctedTextEl.innerHTML = "";
            audioEl.hidden = false;
            recordBtnEl.textContent = "Stop Recording";
            recordBtnEl.disabled = true;
            break;
        case "speaking":
            emailInputEl.disabled = true;
            stateHeadlineEl.textContent = "Speaking corrected text ...";
            originalTextEl.innerHTML = ORIGINAL_PREFIX + originalText;
            correctedTextEl.innerHTML = CORRECTED_PREFIX + correctedText;
            audioEl.hidden = false;
            recordBtnEl.textContent = "Stop Recording";
            recordBtnEl.disabled = true;
            break;
        case "done":
            emailInputEl.disabled = true;
            stateHeadlineEl.textContent = "Done!";
            originalTextEl.innerHTML = ORIGINAL_PREFIX + originalText;
            correctedTextEl.innerHTML = CORRECTED_PREFIX + correctedText;
            audioEl.hidden = false;
            recordBtnEl.textContent = "Stop Recording";
            recordBtnEl.disabled = true;
            break;
    }
}

function createSpeechToTextService() {
    if (isSpeechToTextSupported()) {
        const browserSTT = new BrowserSpeechToTextService();
        browserSTT.onError((error) => {
            if (
                error instanceof SpeechToTextError &&
                error.message === "network"
            ) {
                console.warn("Fallback to backend due to network error");
                speechToTextService = new BackendSpeechToTextService();
                return;
            }
            appState.set("done");
            throw error;
        });
        return browserSTT;
    }
    return new BackendSpeechToTextService();
}

function isSpeechToTextSupported(): boolean {
    return !!(
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
    );
}
