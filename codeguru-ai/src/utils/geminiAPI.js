import Groq from 'groq-sdk';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const LANGUAGE_MAP = {
  en: 'English',
  english: 'English',
  hi: 'Hindi',
  hindi: 'Hindi',
  ta: 'Tamil',
  tamil: 'Tamil',
  te: 'Telugu',
  telugu: 'Telugu',
  bn: 'Bengali',
  bengali: 'Bengali',
  mr: 'Marathi',
  marathi: 'Marathi'
};

const normalizeRequestOptions = (options = {}) => {
  // Backward compatibility: old signature passed a string.
  if (typeof options === 'string') {
    return {
      language: LANGUAGE_MAP[options.toLowerCase()] || 'English',
      algorithmType: 'unknown'
    };
  }

  const rawLanguage = String(options.language || options.selectedLanguage || 'English').toLowerCase();
  const language = LANGUAGE_MAP[rawLanguage] || 'English';
  const algorithmType = String(options.algorithm_type || options.algorithmType || 'unknown');

  return { language, algorithmType };
};

const buildLanguageInstruction = (language = 'English') => {
  return `IMPORTANT LANGUAGE RULES:
- Respond fully in ${language}.
- Do NOT mix languages.
- Keep algorithm notation and code tokens intact (e.g., O(n), dp[i], fib()).
- Keep the explanation beginner-friendly and easy to understand.`;
};

const parseJSONResponse = (text) => {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (error) {
    try {
      // Recover from common JSON issues (single quotes, trailing commas, leading prose)
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const candidate = text.slice(firstBrace, lastBrace + 1)
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/'/g, '"');
        return JSON.parse(candidate);
      }
    } catch (repairError) {
      console.warn('JSON repair failed:', repairError);
    }
    console.warn('Could not parse JSON, returning raw text');
    return { raw: text };
  }
};

const uniqueList = (items = []) => [...new Set(items.filter(Boolean))];

const fallbackDetectFromCode = (code = '') => {
  const normalized = code.toLowerCase();
  const algorithms = [];
  const dataStructures = [];
  const patterns = [];

  const recursionRegexes = [
    /def\s+([a-zA-Z_]\w*)\s*\([^)]*\)[\s\S]*?\b\1\s*\(/m,
    /function\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{[\s\S]*?\b\1\s*\(/m,
    /const\s+([a-zA-Z_]\w*)\s*=\s*\([^)]*\)\s*=>[\s\S]*?\b\1\s*\(/m
  ];

  if (recursionRegexes.some((regex) => regex.test(code))) {
    algorithms.push('Recursion');
    patterns.push('recursive calls');
  }

  const hasDP =
    /\bmemo\b|\bcache\b|\bdp\b/.test(normalized) ||
    /dp\s*\[\s*\w+\s*\]/.test(normalized) ||
    /for\s+\w+\s+in\s+range\([^)]*\)[\s\S]*dp\s*\[/.test(normalized) ||
    /for\s*\([^)]*\)[\s\S]*dp\s*\[/.test(normalized);

  if (hasDP) {
    algorithms.push('Dynamic Programming');
    patterns.push('tabulation/memoization');
    dataStructures.push('dp array/table');
  }

  if (/max_ending_here|max_so_far|current_sum|max_sum/.test(normalized)) {
    algorithms.push('Dynamic Programming: Kadane\'s Algorithm');
    patterns.push('dynamic programming');
    patterns.push('single pass');
  }

  if (/while\s*\(\s*left\s*<=\s*right\s*\)|mid\s*=\s*\(left\s*\+\s*right\)/.test(normalized)) {
    algorithms.push('Searching: Binary Search');
    patterns.push('binary search');
  }

  if (/for\s*\([^)]*\)\s*\{?[\s\S]*for\s*\(/.test(normalized)) {
    patterns.push('nested loops');
  }

  if (/\.sort\(|quick|merge sort|heap sort|bubble sort|selection sort|insertion sort/.test(normalized)) {
    algorithms.push('Sorting');
  }

  if (/dfs|depth[-\s]?first|stack\s*<|stack\(/.test(normalized)) {
    patterns.push('DFS');
    dataStructures.push('stack');
  }

  if (/bfs|breadth[-\s]?first|queue\s*<|deque|queue\(/.test(normalized)) {
    patterns.push('BFS');
    dataStructures.push('queue');
  }

  if (/\b(dict|map|hashmap|unordered_map|object\s*\{|\{\s*\})\b/.test(normalized)) {
    dataStructures.push('hashmap/dictionary');
  }

  if (/\barray\b|\[[^\]]*\]/.test(normalized)) {
    dataStructures.push('array');
  }

  if (/tree|node\s*\(|left\s*=|right\s*=/.test(normalized)) {
    dataStructures.push('tree');
  }

  return {
    algorithms: uniqueList(algorithms),
    dataStructures: uniqueList(dataStructures),
    patterns: uniqueList(patterns),
    alternatives: []
  };
};

const isAuthError = (message = '') => {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('invalid api key') || lowerMessage.includes('authentication') || lowerMessage.includes('401');
};

const isRateLimitError = (message = '') => {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('429') || lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests');
};

const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = error?.message || '';
      console.error(`Attempt ${i + 1} failed:`, error);

      if (isAuthError(message)) {
        throw new Error('Invalid Groq API Key. Please check your VITE_GROQ_API_KEY in .env.');
      }

      if (i < maxRetries - 1) {
        const backoffMs = isRateLimitError(message) ? delay * Math.pow(2, i + 1) : delay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  const errorMsg = lastError?.message || 'Unknown error';
  throw new Error(`API Error: ${errorMsg}`);
};

const ensureGroqConfig = () => {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not found. Please set VITE_GROQ_API_KEY in your .env file.');
  }
};

const requestGroq = async (prompt, { expectJSON = true, temperature = 0.3 } = {}) => {
  ensureGroqConfig();

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = completion?.choices?.[0]?.message?.content?.trim() || '';
  if (!text) {
    throw new Error('Groq returned an empty response.');
  }

  return expectJSON ? parseJSONResponse(text) : text;
};

/**
 * 1. Analyze code complexity
 */
export const analyzeComplexity = async (code, options = {}) => {
  return retryWithBackoff(async () => {
    const { language, algorithmType } = normalizeRequestOptions(options);
    const languageInstruction = buildLanguageInstruction(language);

    const prompt = `Analyze this algorithm code and provide a beginner-friendly explanation.

Algorithm type hint: ${algorithmType}

${languageInstruction}

Code:
\`\`\`
${code}
\`\`\`

Provide a detailed analysis in this EXACT JSON format:
{
  "timeComplexity": {
    "best": "O(...)",
    "average": "O(...)",
    "worst": "O(...)"
  },
  "spaceComplexity": "O(...)",
  "bottlenecks": [
    {
      "lineNumber": "approximate line number",
      "code": "the problematic line",
      "reason": "why this is a bottleneck"
    }
  ],
  "reasoning": "Include: (1) what the algorithm does, (2) step-by-step explanation, (3) time complexity explanation, (4) space complexity explanation"
}

Return ONLY valid JSON, no additional text.`;

    const parsed = await requestGroq(prompt, { expectJSON: true, temperature: 0.2 });

    return {
      timeComplexity: parsed.timeComplexity || { best: 'N/A', average: 'N/A', worst: 'N/A' },
      spaceComplexity: parsed.spaceComplexity || 'N/A',
      bottlenecks: parsed.bottlenecks || [],
      reasoning: parsed.reasoning || parsed.raw || 'No reasoning provided.'
    };
  });
};

/**
 * 2. Identify algorithms, data structures, and patterns
 */
export const identifyAlgorithms = async (code, options = {}) => {
  return retryWithBackoff(async () => {
    const { language, algorithmType } = normalizeRequestOptions(options);
    const languageInstruction = buildLanguageInstruction(language);

    const prompt = `Analyze this algorithm code and identify all algorithms, data structures, and patterns used.

Algorithm type hint: ${algorithmType}

${languageInstruction}

Code:
\`\`\`
${code}
\`\`\`

Provide analysis in this EXACT JSON format:
{
  "algorithms": ["sorting: quick sort", "searching: binary search", "dynamic programming", "greedy approach", etc.],
  "dataStructures": ["array", "hashmap/dictionary", "stack", "queue", "tree", "graph", "heap", etc.],
  "patterns": ["sliding window", "two pointers", "binary search", "DFS", "BFS", "backtracking", "divide and conquer", etc.],
  "alternatives": [
    {
      "current": "current approach used",
      "alternative": "alternative algorithm/pattern",
      "benefit": "explain in ${language} why the alternative might be better"
    }
  ]
}

Return ONLY valid JSON, no additional text.`;

    const parsed = await requestGroq(prompt, { expectJSON: true, temperature: 0.2 });

    const modelResult = {
      algorithms: parsed.algorithms || [],
      dataStructures: parsed.dataStructures || [],
      patterns: parsed.patterns || [],
      alternatives: parsed.alternatives || []
    };

    const emptyModelResult =
      !modelResult.algorithms.length &&
      !modelResult.dataStructures.length &&
      !modelResult.patterns.length;

    if (emptyModelResult) {
      return fallbackDetectFromCode(code);
    }

    return {
      algorithms: uniqueList(modelResult.algorithms),
      dataStructures: uniqueList(modelResult.dataStructures),
      patterns: uniqueList(modelResult.patterns),
      alternatives: modelResult.alternatives
    };
  });
};

/**
 * 3. Generate code optimizations
 */
export const generateOptimizations = async (code, currentComplexity, options = {}) => {
  return retryWithBackoff(async () => {
    const { language, algorithmType } = normalizeRequestOptions(options);
    const languageInstruction = buildLanguageInstruction(language);

    const prompt = `Given this algorithm code with complexity ${currentComplexity}, suggest optimizations.

Algorithm type hint: ${algorithmType}

${languageInstruction}

Code:
\`\`\`
${code}
\`\`\`

Provide optimization in this EXACT JSON format:
{
  "optimizedCode": "the fully optimized code",
  "newComplexity": {
    "time": "O(...)",
    "space": "O(...)"
  },
  "tradeoffs": [
    "trade-off 1: more space for less time",
    "trade-off 2: ..."
  ],
  "explanation": "Detailed beginner-friendly explanation in ${language} of what changed, why it's better, and the optimization technique used."
}

Return ONLY valid JSON, no additional text.`;

    const parsed = await requestGroq(prompt, { expectJSON: true, temperature: 0.3 });

    return {
      optimizedCode: parsed.optimizedCode || code,
      newComplexity: parsed.newComplexity || { time: 'N/A', space: 'N/A' },
      tradeoffs: parsed.tradeoffs || [],
      explanation: parsed.explanation || parsed.raw || 'No explanation provided.'
    };
  });
};

/**
 * 4. Generate interview questions based on code
 */
export const generateInterviewQuestions = async (code, options = {}) => {
  return retryWithBackoff(async () => {
    const { language, algorithmType } = normalizeRequestOptions(options);
    const languageInstruction = buildLanguageInstruction(language);

    const prompt = `Based on this algorithm code, generate 5 technical interview questions.

Algorithm type hint: ${algorithmType}

${languageInstruction}

Code:
\`\`\`
${code}
\`\`\`

Provide questions in this EXACT JSON format:
{
  "questions": [
    {
      "question": "What is the time complexity of this approach?",
      "expectedPoints": [
        "Should mention O(n) or O(n^2) etc.",
        "Should explain why",
        "Should mention best/average/worst cases"
      ]
    }
  ]
}

Generate 5 diverse questions covering: complexity, optimization, edge cases, scalability, and alternative approaches.

Return ONLY valid JSON, no additional text.`;

    const parsed = await requestGroq(prompt, { expectJSON: true, temperature: 0.5 });
    return parsed.questions || [];
  });
};

/**
 * 5. Evaluate interview answer
 */
export const evaluateInterviewAnswer = async (question, userAnswer, expectedPoints = [], options = {}) => {
  return retryWithBackoff(async () => {
    const { language } = normalizeRequestOptions(options);
    const languageInstruction = buildLanguageInstruction(language);

    const prompt = `Evaluate this interview answer like a technical interviewer.

${languageInstruction}

Question: ${question}

Expected Points to Cover:
${expectedPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

User's Answer:
${userAnswer}

Provide evaluation in this EXACT JSON format:
{
  "score": 85,
  "feedback": "Detailed constructive feedback on the answer",
  "coveredPoints": ["Point 1 that was covered well"],
  "missedPoints": ["Important point that was missed"],
  "interviewReadiness": "Senior",
  "suggestions": ["Suggestion 1 for improvement"]
}

Score should be 0-100. interviewReadiness should be one of: "Beginner", "Intermediate", "Senior", "Principal".

Return ONLY valid JSON, no additional text.`;

    const parsed = await requestGroq(prompt, { expectJSON: true, temperature: 0.2 });

    return {
      score: parsed.score || 0,
      feedback: parsed.feedback || 'Unable to evaluate',
      coveredPoints: parsed.coveredPoints || [],
      missedPoints: parsed.missedPoints || [],
      interviewReadiness: parsed.interviewReadiness || 'Beginner',
      suggestions: parsed.suggestions || []
    };
  });
};

/**
 * 6. Translate text to Indian languages
 */
export const translateToLanguage = async (text, targetLanguage) => {
  return retryWithBackoff(async () => {
    const languageNames = {
      hi: 'Hindi',
      ta: 'Tamil',
      te: 'Telugu',
      bn: 'Bengali',
      mr: 'Marathi'
    };

    const languageName = languageNames[targetLanguage] || 'Hindi';

    const prompt = `Translate the following text to ${languageName}.

IMPORTANT RULES:
1. Keep ALL technical terms in English (e.g., O(n), HashMap, Array, Time Complexity, Space Complexity, etc.)
2. Keep code snippets unchanged
3. Keep numbers and mathematical notations unchanged
4. Only translate natural language explanations

Text to translate:
${text}

Return ONLY the translated text, no additional commentary.`;

    const translatedText = await requestGroq(prompt, { expectJSON: false, temperature: 0.2 });
    return translatedText.trim();
  });
};

export const testAPIConnection = async () => {
  try {
    const responseText = await requestGroq('Say "API connected successfully"', { expectJSON: false, temperature: 0 });
    return { success: true, message: responseText };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default {
  analyzeComplexity,
  identifyAlgorithms,
  generateOptimizations,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  translateToLanguage,
  testAPIConnection
};
