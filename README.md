# TruthLens AI: Advanced Fake News Detection (2025)

## 🚀 Project Overview

TruthLens AI is a sophisticated web application designed to combat misinformation by providing real-time, AI-powered analysis of news articles. It goes beyond simple "real" or "fake" predictions by offering a detailed breakdown of its reasoning, confidence scores, and analysis across multiple vectors like linguistic patterns, structural integrity, and source credibility.

This project demonstrates a robust, full-stack architecture leveraging modern technologies to deliver a seamless user experience and a powerful, scalable AI backend. It is built to showcase proficiency in front-end development, backend integration with Supabase, and the practical application of AI and machine learning principles.

## ✨ Key Features

*   **Multi-Model AI Analysis**: Users can select from various AI models for analysis:
    *   A custom-tuned, rule-based **Built-in Model**.
    *   State-of-the-art **Hugging Face Transformers models** via `transformers.js`.
    *   Integration with user-defined **Custom API Endpoints**.
    *   Support for user-managed **Custom Hugging Face Models**.
*   **Transparent & Detailed Results**: The AI provides not just a prediction, but a comprehensive report including:
    *   **Confidence Score**: A percentage indicating the AI's certainty.
    *   **AI Explanation**: A human-readable summary of the reasoning.
    *   **Key Factors**: A list of the most influential data points in the decision.
    *   **Detailed Categorical Analysis**: In-depth flags and metrics for Content, Structure, Credibility, and Linguistics.
*   **User Authentication & Profiles**: Secure user sign-up, sign-in, and profile management using Supabase Auth.
*   **Persistent Analysis History**: All user analyses are saved to their profile, allowing them to track and review past results.
*   **AI Feedback & Continuous Improvement Loop**:
    *   Users can rate the AI's analysis, providing crucial feedback.
    *   This feedback is processed and stored in a dedicated `feedback_training` table, enriched with calculated metrics like `training_weight` and textual features.
    *   This structured data is primed for periodic model fine-tuning, creating a virtuous cycle of improvement.
*   **Personalized AI Settings**: Users can configure their preferred AI model, manage custom models, and set API keys through a dedicated settings page.
*   **Optimized Performance**:
    *   **Atomic Rate Limiting**: A custom PostgreSQL function in Supabase prevents race conditions and ensures fair usage.
    *   **Data Caching**: Smart caching of user settings and models to reduce database load and improve UI responsiveness.
    *   **Optimized Queries**: Efficient, paginated queries for fetching analysis history.

## 🛠️ Tech Stack & System Architecture

This project is built with a modern, scalable tech stack, ideal for a full-stack AI application.

### Frontend
*   **React & Vite**: For a fast, modern, and efficient development experience.
*   **TypeScript**: To ensure type safety and code quality.
*   **Tailwind CSS & shadcn/ui**: For a beautiful, responsive, and accessible user interface built with utility-first principles.
*   **`@tanstack/react-query`**: For robust data fetching, caching, and state management.
*   **`@huggingface/transformers`**: To run machine learning models directly in the browser.

### Backend (Powered by Supabase)
*   **Supabase Database**: A powerful PostgreSQL database for storing all application data.
*   **Supabase Auth**: Manages user authentication, including social logins and MFA.
*   **Supabase Storage**: (If applicable) For storing user-uploaded files or model assets.
*   **Custom PostgreSQL Functions**: Written to handle complex backend logic atomically and efficiently (e.g., `check_and_increment_rate_limit`).

### System Flow
1.  **User Interaction**: The user interacts with the React frontend.
2.  **Authentication**: Supabase Auth handles all user sign-up and login requests securely.
3.  **API Layer**: The React application communicates with the Supabase backend via the Supabase client library.
4.  **AI Analysis**:
    *   The `useAIAnalysis` hook determines which model to use based on user settings.
    *   For in-browser models (`transformers.js`), the analysis runs on the client-side.
    *   For custom endpoints, a request is made to the specified URL.
5.  **Data Persistence**: Analysis results, user feedback, and settings are all persisted in the Supabase PostgreSQL database.
6.  **Feedback Loop**: User feedback is processed by the `useFeedbackTraining` hook and stored in a structured format, ready for the next fine-tuning cycle.

## 🤖 AI & Machine Learning Integration

The core of TruthLens AI is its intelligent analysis system, designed to be both powerful and transparent.

### The Feedback-to-Fine-Tuning Pipeline
This is a critical component demonstrating an understanding of production-level ML systems:
1.  **Collect**: User provides a rating (1-5 stars) and optional text feedback.
2.  **Enrich**: The system programmatically extracts features from the article text (e.g., complexity, emotional tone) and calculates a `training_weight`. This transforms simple feedback into rich, actionable training data.
3.  **Store**: The enriched data is saved to the `feedback_training` table.
4.  **Fine-Tune (Offline Process)**: The data in `feedback_training` is designed to be used by a data scientist or ML engineer to periodically retrain and improve the underlying models. This separation of concerns (app vs. training) is a best practice.

This architecture shows a deep understanding of how to build systems that learn and improve over time, a key skill for an AI Software Developer.

## 🗄️ Database Schema

The database is designed to be relational and scalable. Key tables include:
*   `profiles`: Stores public user data, linked to `auth.users`.
*   `analysis_history`: Records every analysis performed by a user.
*   `user_settings`: Manages each user's personalized AI preferences.
*   `custom_models`: Allows users to add and manage their own Hugging Face models.
*   `feedback`: The raw feedback from users.
*   `feedback_training`: The enriched, processed feedback ready for model training.

## 👨‍💻 Running the Project Locally

To run this project in your local development environment, follow these steps:

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/B-Bazinga/TruthLens-AI.git
    cd TruthLens-AI
    ```

2.  **Install Dependencies (with Bun)**
    This project uses [Bun](https://bun.sh/) for fast, modern JavaScript/TypeScript development. If you don't have Bun installed, [install it here](https://bun.sh/docs/installation):
    ```sh
    curl -fsSL https://bun.sh/install | bash
    ```
    Then install dependencies:
    ```sh
    bun install
    ```
    > **Note:** If you prefer npm, you can still use `npm install`, but Bun is recommended for best compatibility and speed.

3.  **Set Up Environment Variables**
    - Copy the provided `.env.example` file to `.env` and update the values as needed for your own Supabase project:
    ```sh
    cp .env.example .env
    ```
    - **Never commit your `.env` file to a public repository.**

4.  **Start the Development Server**
    ```sh
    bun run dev
    ```
    The application will be available at `http://localhost:5173`.

---
