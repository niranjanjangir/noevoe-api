# noevoe

This repository is the back-end service for noevoe app. noevoe is a hobby learning app powered by AI. It uses LLMs to prepare small lessons to help you achieve capabalities on the hobby you wish to learn (and enjoy :p). You can choose how far you want to go to enjoy the hobby, it will prepare the lessons accordingly. It is based on the philosophy that "Hobbies are meant to be enjoyed".

## Technical Description
- Generative AI powered by Gemini and Groq's open source GPT modal
- REST APIs to generate curriculum (path) from user's input about the hobby, their goal, and current level of expertise
- Gemini is primary provider, which falls-back to Groq
- Appropriate measures added to stop misuse of LLM

---

### 1. Tech-stack
This back-end service is built using Node.js with Express.js framework and TypeScript. Generative AI service is provided by Gemini and Groq APIs

#### Installation:
1. Clone the repository and navigate to the `noevoe-api` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your environment variables by creating a `.env` file in the root directory. An example file is provided as `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

### CAUTION
The current version of the app does not have authentication in place. Hence, all the API endpoints are public.

**NO External Validation Only Enjoyment!**
