# CodeGuru AI IN

CodeGuru AI IN is an interactive algorithm learning and interview-prep platform.
It analyzes user code with Groq LLMs, detects algorithm style, and shows visual animations for sorting, tree traversal, recursion, and dynamic programming.

## Production

- Primary URL: `https://codeguru-ai.vercel.app`
- Deployment URL: `https://codeguru-1q9eu75cj-harines-projects-4603449d.vercel.app`

## Key Features

- AI-powered code analysis with beginner-friendly explanations
- Automatic algorithm detection from code + pattern heuristics
- Complexity analysis:
- Best / Average / Worst time complexity
- Space complexity
- Bottleneck identification with reasoning
- Optimization suggestions with improved code and trade-offs
- Interview practice mode:
- AI-generated interview questions
- Answer evaluation with score and feedback
- Multi-language explanation support (language selector driven)
- Visualization modes:
- Sorting animation
- Tree traversal visualization
- Recursion call-tree visualization
- Dynamic programming table visualization
- Fullscreen animation mode for clearer step-by-step understanding

## Tech Stack

- Frontend: React + Vite
- Styling/UI: Tailwind CSS + custom CSS + Framer Motion
- Code Editor: Monaco Editor (`@monaco-editor/react`)
- AI Provider: Groq (`groq-sdk`)
- Charts/Visualization: Recharts + custom SVG visualizers
- Icons: React Icons
- Deployment: Vercel

## Project Structure

```text
src/
	components/
		analysis/
		interview/
		shared/
		visualization/
	hooks/
	utils/
	App.jsx
```

## Environment Variables

Create `.env` in `codeguru-ai/`:

```bash
VITE_GROQ_API_KEY=your_groq_api_key
# Optional
VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (typically `http://localhost:5173` or next available port).

## Build

```bash
npm run build
npm run preview
```

## Deployment (Vercel)

```bash
npx vercel --prod
```

Set required env vars in Vercel Project Settings before deploying.

## License

MIT
