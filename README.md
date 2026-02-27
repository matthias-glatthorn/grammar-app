# Grammar-app


## Project Overview

This project is a Single Page Application that allows users to:

- record spoken audio
- convert it to text
- correct grammatical errors via a backend service
- play back the corrected result

The implementation focuses on clean architecture, separation of concerns, and progressive enhancement using browser APIs.


## Development Setup & Run

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend runs on: http://localhost:3000


**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs on: http://localhost:5173



## Production Build & Run

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run build
npm start
```
Backend runs on: http://localhost:3000


**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run build
npm run preview
```
Frontend runs on: http://localhost:4173


## Requirements
- Record audio in browser
- Send audio + email to backend
- Process audio asynchronously
- Return corrected result
- Support both desktop and mobile devices


## Trade-offs

The following trade-offs were made to balance implementation time (2 hours) with architectural clarity.

**Asynchronous audio processing:**

To provide real asynchronous audio processing, the system would require a job-based architecture in the backend. In such a setup, the client would submit an audio processing job to the backend, which would then be handled by a queue (e.g. RabbitMQ). The backend would process the job independently of the request/response cycle, and the client would either poll for the result or be notified once processing is complete.

For the specific UI flow in this application, however, such an architecture would not provide a direct benefit, as the processing steps are inherently sequential (recording → transcription → correction → playback), and each step depends on the result of the previous one. In this implementation, I therefore chose a simpler synchronous request/response model using Promises. While this does not provide true asynchronous processing on a system level, it keeps the implementation lightweight and allows focusing on the overall application flow within the given time constraint.

**Speech-to-text and text-to-speech processing:**

For speech-to-text and text-to-speech processing, a production-ready system would typically rely on a centralized backend service or an external provider such as Azure Speech Services or OpenAI Whisper. This ensures consistent behavior across browsers and environments, avoids reliance on client-specific capabilities, and allows better control over processing, monitoring, and data handling. It also enables all audio data to be processed in a unified way, which is important for reliability and maintainability.

In addition, handling both transcription and audio generation in the backend allows for consistent voice configuration, better control over output formats, and the possibility to return processed audio directly to the client as part of a unified pipeline.

In this implementation, the backend speech-to-text functionality is implemented as a stub, while text-to-speech is handled in the frontend using browser-native capabilities. This allows the API contract and overall system flow to be demonstrated without introducing external dependencies or additional setup complexity.


**Grammar correction:**

In a production-ready system, grammar correction would be handled by a dedicated backend service or an external provider. One option would be to run a self-contained service such as LanguageTool (e.g. https://hub.docker.com/r/erikvl87/languagetool) in a Dockerized environment, providing a controlled and consistent API.

Alternatively, AI-based solutions (e.g. LLMs) could be used to perform more context-aware corrections, at the cost of increased latency, external dependencies, and operational complexity.

In this implementation, grammar correction is implemented as a stub. This allows the API contract and overall system flow to be demonstrated without introducing additional infrastructure.

**System orchestration:**

In a fully realized system, the backend would orchestrate the entire processing pipeline, including transcription, grammar correction, and text-to-speech. This would allow the client to interact with a single endpoint and would simplify the frontend while improving scalability and maintainability.

In this implementation, I chose to orchestrate the flow in the frontend by calling separate backend endpoints. This keeps the backend services simple and focused, and allows the architecture and data flow to be demonstrated without introducing additional complexity in the backend.


## Architecture & Design Decisions

The following design decisions were made to keep the system simple, modular, and focused on the core requirements.

**Client-first speech processing (core architectural focus):**

A central focus of this implementation is to minimize data transfer and reduce load on the backend, especially for mobile users. Audio data can be significantly larger than text, so sending it to the backend for processing has a direct impact on latency, bandwidth usage, and infrastructure cost.

To address this, a production-ready system should leverage client-side capabilities wherever possible. Browser-native speech recognition APIs allow audio to be processed without routing it through the application's backend. While this processing is typically handled by underlying platform services (e.g. browser or OS-level providers), it still avoids transferring large audio payloads to the system’s own servers and helps offload processing.

However, browser-native speech recognition is not consistently supported across all browsers and environments. Relying solely on this approach would therefore lead to unreliable behavior and limited compatibility.

In this implementation, I adopted a progressive enhancement strategy: speech-to-text is performed using browser-native APIs when available, and falls back to a backend-based solution otherwise. This ensures broad compatibility while still optimizing for reduced backend load, improved performance, and better scalability where possible.

**Service abstraction via interfaces:**

Core functionalities such as speech-to-text and grammar correction are abstracted behind interfaces. This allows different implementations (e.g. stub vs real service) to be swapped without affecting the rest of the system, and keeps the architecture flexible and testable.

**Lightweight state management:**

A simple state machine is used to manage the application flow (e.g. idle → recording → processing → done). This keeps UI behavior predictable and avoids introducing additional dependencies for state management.

**Frontend architecture (Vanilla JavaScript):**

In a production-ready application, a frontend framework such as React, Angular, or Vue would typically be used to provide a structured component model, improved state management, and better testability.

In this implementation, I deliberately chose to use Vanilla JavaScript (with TypeScript) instead of a framework. Given the limited scope of the application, introducing a framework would not have provided significant benefits, as the UI is relatively simple and does not require complex component structures.

This decision was also made to focus on core browser APIs and direct DOM interaction, allowing the implementation to demonstrate a clear understanding of how the underlying platform works without additional abstraction layers.

Additionally, avoiding a frontend framework reduces external dependencies, eliminates the need for framework-specific updates, and keeps the application lightweight. This aligns with the goal of minimizing complexity where it does not provide clear value.

For larger or more complex applications, I would introduce a framework to improve maintainability, scalability, and developer experience.


### Engineering Considerations

The current architecture already reflects several important software engineering principles:

**Maintainability & extensibility:**
Clear separation of concerns and service abstractions allow individual parts of the system to be replaced or extended easily.

**Performance & scalability:**
The client-first speech processing approach reduces backend load and minimizes unnecessary data transfer.

**Stability:**
Fallback mechanisms ensure the application remains functional even when certain features are not supported.

**Security:**
Basic validation is implemented, but a production system would require more robust measures. In particular, sensitive data such as email addresses and audio recordings are transmitted to the backend and would need to be protected appropriately.


## Production Considerations & Future Improvements

To evolve this prototype into a production-ready system, several improvements would be required:

**Asynchronous processing:**
Introduce a job-based architecture (e.g. using a queue such as RabbitMQ) to handle long-running audio processing tasks more robustly and enable retries.

**Containerization:**
Dockerize the application to ensure consistent environments and simplify deployment. This would also allow running supporting services (e.g. grammar correction) in isolated containers.

**Grammar correction service:**
Replace the stub with a real implementation, e.g. by running LanguageTool in a Docker container for a self-contained solution, or by integrating external services such as AI-based APIs or Azure Language Services. Workflow tools like n8n could also be used to orchestrate more advanced processing pipelines.

**Speech processing in backend:**
Move speech-to-text and text-to-speech fully into the backend using services such as Azure Speech Services to ensure consistent behavior across all clients and return processed audio directly to the frontend.

**End-to-end audio pipeline:**
Return processed (corrected) audio from the backend instead of only text, aligning with the original requirement and enabling a fully server-driven pipeline.

**Testing:**
Add unit and integration tests for both frontend and backend to improve reliability and prevent regressions.

**Validation:**
Introduce proper input validation, file size limits, and rate limiting to protect the system from misuse.

**Security, data protection, and access control:**
A production-ready system would need to ensure that all sensitive data, such as email addresses and audio recordings, is transmitted and processed securely. This includes enforcing HTTPS for all communication and ensuring that data is handled in a way that prevents unauthorized access.

Additionally, authentication and authorization mechanisms would be required to ensure that users can only access their own data. This becomes especially important in a system with asynchronous processing (e.g. job queues), where results are retrieved at a later point in time. Without proper access control, there is a risk that users could access data belonging to others.

Further considerations include secure storage of audio data, data minimization, and compliance with data protection regulations (e.g. GDPR).

**Scalability and persistence:**  
Persist jobs and processing state (e.g. in a database or cache) to enable status tracking, retries, and horizontal scaling.