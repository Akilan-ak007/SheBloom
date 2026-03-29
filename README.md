# SheBloom — Maternal Health Care Companion

**She doesn't need another app. She needs you.**

SheBloom is an open-source, gentle companion guide designed not for the pregnant mother, but for the **caretakers**—husbands, fathers, brothers, and friends. It bridges the time, knowledge, and emotional gaps that caretakers face, adapting to their schedule (whether they have 5 minutes or 5 hours) to provide actionable, verified care advice.

## 🌟 Project Ideology

1. **The Time Problem**: Caretaking happens in the margins of life. SheBloom adapts to the caretaker's daily rhythm, offering time-scaled actions.
2. **The Knowledge Problem**: It removes the guesswork out of pregnancy trimesters, dietary restrictions, and warning signs.
3. **The Emotional Problem**: It teaches the language of care, translating medical events into human emotional needs.
4. **100% Free Rural Accessibility**: We believe life-saving alerts shouldn't cost money per minute. We bypass expensive telecom integrations (like Twilio/Vapi) using local device capabilities.

## 🏗️ Architecture & Stack

This repository is structured as a monorepo containing our frontend and backend systems.

- **`apps/web` (Frontend & Native App)**
  - Built with **Next.js**.
  - Wrapped with **Capacitor by Ionic** to natively deploy to iOS and Android across rural areas while reusing 100% of our web UI.
  - Features offline reliability via IndexedDB & Capacitor Storage.

- **`apps/api` (Backend & Real-Time Engine)**
  - Built with **Elysia.js** for extreme performance.
  - Hosts a `ws://` endpoint acting as a bridge between IoT devices and our apps.
  - Manages cron jobs for checking medication/care compliance.

- **Database**
  - **Neon PostgreSQL** managed via **Drizzle ORM**.
  - Stores user data, care circles, and timeline tasks with low-latency serverless edge access.

- **Real-Time IoT Integration**
  - Interfaces with physical hardware (like **ESP32** sensors) transmitting live environment data (temperature, humidity).
  - Elysia broadcasts this data in real-time to both the Doctor's Dashboard and the Caretaker App.

- **Zero-Cost Agentic Alerting System**
  - We use **Capacitor Local Push Notifications** combined with the native **Web Speech API**.
  - **How it works:** When a scheduled care action is missed (e.g., 10 AM medication), Elysia sends a silent push payload to the phone. The Capacitor app accesses the device's native TTS engine to announce alerts out loud (e.g., in Tamil: "வணக்கம், மருந்து நேரம் முடிந்துவிட்டது") directly from the speaker.
  - **Result:** $0.00 recurring cost, permanently.

## 🚀 Getting Started

*(More detailed installation instructions to come)*
