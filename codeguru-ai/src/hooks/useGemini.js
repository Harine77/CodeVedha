import { useState, useCallback } from 'react';
import { analyzeCode, getCodeSuggestions, generateInterviewQuestion } from '../utils/gemini';

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = useCallback(async (code, language) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyzeCode(code, language);
      setResult(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (code, context) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCodeSuggestions(code, context);
      setResult(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateQuestion = useCallback(async (topic, difficulty) => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateInterviewQuestion(topic, difficulty);
      setResult(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    result,
    analyze,
    getSuggestions,
    generateQuestion,
    reset,
  };
};
