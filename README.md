# 🔍 TruthLens AI — Real-Time Fake News Detection

**TruthLens AI** is an advanced web app that detects fake news using multiple AI models and provides detailed explanations, confidence scores, and analysis across content, structure, credibility, and linguistics. Built with a modern full-stack architecture, it offers a seamless user experience and a transparent, feedback-driven AI system.

---

## 🚀 Features

* **Multi-Model Analysis**: Choose from:

  * Built-in rule-based model
  * Hugging Face models via `transformers.js`
  * Custom API endpoints
  * User-managed HF models

* **Explainable Results**:

  * Confidence score
  * Reasoning summary
  * Key decision factors
  * Detailed category-wise flags (content, structure, etc.)

* **User System**:

  * Sign-up/login via Supabase Auth
  * Personal analysis history
  * Custom AI settings and model management

* **Feedback Loop for Improvement**:

  * Rate AI analysis
  * Feedback enriched with metrics and stored
  * Used for offline model fine-tuning

* **Performance Optimizations**:

  * Atomic rate limiting (custom SQL)
  * Data caching and optimized queries

---

## 🛠️ Tech Stack

**Frontend**:

* React + Vite + TypeScript
* Tailwind CSS + shadcn/ui
* React Query
* `@huggingface/transformers` (browser models)

**Backend (Supabase)**:

* PostgreSQL for data
* Supabase Auth
* Custom SQL functions for rate-limiting and logic
* Optional Supabase Storage

---

## 🤖 AI Architecture

* **Client-Side**: In-browser models (via `transformers.js`)
* **Server-Side**: Custom APIs for remote models
* **Feedback-to-Finetune Pipeline**:

  1. Collect ratings + comments
  2. Enrich with text metrics + weights
  3. Store in `feedback_training`
  4. Offline fine-tuning ready

---

## 🧱 Database Overview

* `profiles`: User data
* `analysis_history`: Saved results
* `user_settings`: Model/API preferences
* `custom_models`: User-added HF models
* `feedback` + `feedback_training`: Raw + enriched feedback

---

## 🧪 Run Locally

```bash
git clone https://github.com/B-Bazinga/TruthLens-AI.git
cd TruthLens-AI

# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Setup environment variables
cp .env.example .env

# Start dev server
bun run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---
