// Gemini AI utility functions
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const REQUESTED_MODEL = (import.meta.env.VITE_GEMINI_MODEL || '').trim();
const FALLBACK_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'];

let genAI;
let model;
let modelInitPromise;

const normalizeModelName = (name = '') => name.replace(/^models\//, '').trim();

const listGenerateContentModels = async () => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
  if (!response.ok) {
    throw new Error(`ListModels failed with status ${response.status}`);
  }

  const data = await response.json();
  return (data.models || [])
    .filter(
      (item) =>
        Array.isArray(item.supportedGenerationMethods) &&
        item.supportedGenerationMethods.includes('generateContent')
    )
    .map((item) => normalizeModelName(item.name))
    .filter(Boolean);
};

const pickBestModel = (availableModels) => {
  const candidates = [REQUESTED_MODEL, ...FALLBACK_MODELS]
    .map(normalizeModelName)
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);

  for (const candidate of candidates) {
    if (availableModels.includes(candidate)) {
      return candidate;
    }
  }

  return availableModels.find((name) => name.startsWith('gemini')) || availableModels[0] || FALLBACK_MODELS[0];
};

export const initializeGemini = async () => {
  if (!API_KEY) {
    throw new Error('Please set VITE_GEMINI_API_KEY in your .env file');
  }
  if (model) {
    return model;
  }
  if (modelInitPromise) {
    return modelInitPromise;
  }

  modelInitPromise = (async () => {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(API_KEY);
    }

    let selectedModel = normalizeModelName(REQUESTED_MODEL || FALLBACK_MODELS[0]);
    try {
      const availableModels = await listGenerateContentModels();
      selectedModel = pickBestModel(availableModels);
    } catch (error) {
      console.warn('Could not fetch model list, using configured fallback model:', error);
    }

    model = genAI.getGenerativeModel({ model: selectedModel });
    return model;
  })();

  try {
    return await modelInitPromise;
  } catch (error) {
    modelInitPromise = undefined;
    throw error;
  }
};

export const analyzeCode = async (code, language = 'javascript') => {
  try {
    const model = await initializeGemini();
    const prompt = `Analyze this ${language} code and provide:
1. Code quality assessment
2. Potential bugs or issues
3. Suggestions for improvement
4. Best practices recommendations

Code:
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed, student-friendly explanation suitable for Indian students learning programming.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing code:', error);
    throw error;
  }
};

export const getCodeSuggestions = async (code, context = '') => {
  try {
    const model = await initializeGemini();
    const prompt = `Given this code context: ${context}

Code:
\`\`\`
${code}
\`\`\`

Provide helpful suggestions and improvements in simple terms for students.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting suggestions:', error);
    throw error;
  }
};

export const generateInterviewQuestion = async (topic, difficulty = 'medium') => {
  try {
    const model = await initializeGemini();
    const prompt = `Generate a ${difficulty} level coding interview question on ${topic}.
Include:
1. Problem statement
2. Example inputs and outputs
3. Constraints
4. Hints for solving

Make it suitable for Indian students preparing for tech interviews.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating question:', error);
    throw error;
  }
};
