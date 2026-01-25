Here is the refined, high-impact `README.md` for **NeuroLearn AI**. This version is strictly tailored to the **Gemini 3 Flash Preview** architecture, the course architect logic, and the adaptive reasoning features we've implemented.

---

# 🧠 NeuroLearn AI: The Course Architect

### *Next-Gen Learning Powered by Gemini 3 Flash Preview*

**NeuroLearn AI** is a sophisticated educational engine that transforms raw user intent into structured, multimodal learning experiences. Using **Gemini 3 Flash’s** ultra-low latency and tiered reasoning depths, it "architects" a custom syllabus from a single text prompt and guides the learner through a tactile, skeuomorphic "digital book" environment.

## 🚀 The Core Innovation

Unlike standard LLM wrappers, NeuroLearn AI utilizes **Gemini 3 Flash's Agentic Reasoning** to act as a pedagogical engineer. It doesn't just answer questions—it builds a curriculum.

* **Dynamic Syllabus Generation:** Gemini 3 takes a messy prompt (e.g., *"Teach me the history of jazz but focus on the influence of African polyrhythms"*) and outputs a 5-module JSON schema with lesson content and suggested inquiries.
* **Adaptive Reasoning (Thinking Levels):** The system utilizes Gemini 3's native `thinkingLevel` configuration, allowing the tutor to scale from "Minimal" (definitions) to "High" (complex logic synthesis).
* **Context-Aware TutorBot:** A floating AI assistant anchored to the specific lesson context, capable of real-time voice interaction and "Ghost-Thinking" visualizations.

## 🛠 Tech Stack

* **Intelligence Engine:** Google Gemini 3 Flash Preview
* **Framework:** Next.js 15 (App Router)
* **Motion:** Framer Motion (Tactile page-flip animations)
* **UI/UX:** Tailwind CSS (Custom skeuomorphic "Paper" design)
* **Voice:** Web Speech API (Seamless STT & TTS)

---

## 🗺 Roadmap

### 🟢 Phase 1: Interactive Mastery (Current)

* **Prompt-to-Syllabus:** Instant curriculum generation from text inputs.
* **Ghost-Reasoning UI:** A visual "thinking" indicator that maps Gemini 3’s internal processing steps.
* **Manual Reasoning Toggles:** User-controlled depth settings (Minimal, Low, Medium, High).

### 🟡 Phase 2: Cognitive Agency (Q1 2026)

* **Multimodal Knowledge Seeds:** Upload PDFs, handwritten notes, or YouTube URLs to "seed" the Gemini 3 Architect.
* **Self-Triage Reasoning:** An autonomous layer that analyzes query complexity and auto-scales the Gemini 3 `thinkingLevel`.
* **Live Diagrams:** Integration with Mermaid.js to render live flowcharts based on Gemini 3 outputs.

### 🔴 Phase 3: The Cognitive Ecosystem (Future)

* **Spaced Repetition (SRS):** A dashboard that notifies users when to review specific modules based on individual forgetting curves.
* **Voice Cloning:** Integration with high-fidelity prosody models for a more human-like tutor experience.

---

## ⚡ Quick Start

1. **Clone the Repo:**
```bash
git clone https://github.com/kenneth256/neurolearn-ai.git
cd neurolearn-ai
pnpm install

```


2. **Environment Variables:**
Create a `.env.local` file in the root directory:
```text
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_3_key_here

```


3. **Launch:**
```bash
pnpm dev

```



## 🛡 Security Note

This project uses `NEXT_PUBLIC_` variables for rapid client-side STT/TTS interaction. For production environments, Gemini 3 logic should be migrated to **Next.js Server Actions** to protect API credentials.

---

