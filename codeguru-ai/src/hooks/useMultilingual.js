import { useState, useCallback, useEffect, useRef } from 'react';
import { translateToLanguage } from '../utils/geminiAPI';

const useMultilingual = () => {
  
  // STATE
  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Ref to avoid stale closure in translate function
  const cacheRef = useRef(translationCache);

  // Keep ref in sync with state
  useEffect(() => {
    cacheRef.current = translationCache;
  }, [translationCache]);

  // Load cache from localStorage on mount
  useEffect(() => {
    const savedCache = localStorage.getItem('translationCache');
    if (savedCache) {
      try {
        const parsed = JSON.parse(savedCache);
        setTranslationCache(parsed);
        cacheRef.current = parsed;
      } catch (error) {
        console.error('Failed to load translation cache:', error);
      }
    }
  }, []);

  // Save cache to localStorage
  const saveCache = useCallback((cache) => {
    try {
      localStorage.setItem('translationCache', JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }, []);

  // Generate cache key
  const generateCacheKey = (text, sourceLanguage, targetLanguage) => {
    const textPreview = text.substring(0, 50).replace(/\s+/g, '_');
    return `${sourceLanguage}-${targetLanguage}-${textPreview}`;
  };

  // PRESERVE TECHNICAL TERMS
  const preserveTechnicalTerms = (text) => {
    const technicalPatterns = [
      // Big-O notation: O(n), O(n²), O(log n), etc.
      /O\([^)]+\)/g,
      
      // Data structures
      /\b(HashMap|HashSet|Array|ArrayList|LinkedList|Stack|Queue|Tree|Graph|Heap|BST|AVL|Trie|Deque)\b/g,
      
      // Programming languages
      /\b(JavaScript|Python|Java|C\+\+|TypeScript|SQL|HTML|CSS|React|Vue|Angular|Node\.js)\b/g,
      
      // Technical terms
      /\b(API|JSON|XML|HTTP|HTTPS|REST|GraphQL|CRUD|DOM|SDK|CLI)\b/g,
      
      // Keywords
      /\b(async|await|Promise|callback|function|class|const|let|var|return|if|else|for|while|switch|case)\b/g,
      
      // Algorithms and patterns
      /\b(DFS|BFS|DP|Dynamic Programming|Greedy|Backtracking|Divide and Conquer|Binary Search|Merge Sort|Quick Sort)\b/g,
      
      // Code snippets (preserve anything in backticks)
      /`[^`]+`/g,
      
      // Numbers with units
      /\b\d+\s*(ms|seconds|bytes|KB|MB|GB)\b/g
    ];

    const replacements = [];
    let processedText = text;
    const foundTerms = new Set();

    technicalPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Avoid duplicate replacements
          if (!foundTerms.has(match)) {
            foundTerms.add(match);
            const placeholder = `{{TECH_${replacements.length}}}`;
            replacements.push(match);
            // Replace all occurrences of this term
            processedText = processedText.split(match).join(placeholder);
          }
        });
      }
    });

    return { processedText, replacements };
  };

  // Restore technical terms
  const restoreTechnicalTerms = (text, replacements) => {
    let restoredText = text;
    replacements.forEach((term, index) => {
      const placeholder = `{{TECH_${index}}}`;
      // Replace all occurrences of the placeholder
      restoredText = restoredText.split(placeholder).join(term);
    });
    return restoredText;
  };

  // TRANSLATE FUNCTION
  const translate = useCallback(async (text, targetLanguage, sourceLanguage = 'en') => {
    try {
      // If target is English or same as source, return as-is
      if (targetLanguage === 'en' || targetLanguage === sourceLanguage) {
        return text;
      }

      // If text is empty, return it
      if (!text || text.trim() === '') {
        return text;
      }

      // Generate cache key
      const cacheKey = generateCacheKey(text, sourceLanguage, targetLanguage);

      // Check cache first using ref to avoid stale closure
      if (cacheRef.current[cacheKey]) {
        console.log('Translation cache hit:', cacheKey);
        return cacheRef.current[cacheKey];
      }

      // Start translation
      console.log('Translating to', targetLanguage, ':', text.substring(0, 50) + '...');
      setIsTranslating(true);

      // Preserve technical terms
      const { processedText, replacements } = preserveTechnicalTerms(text);

      // Call Gemini API
      const translatedText = await translateToLanguage(processedText, targetLanguage);

      // Restore technical terms
      const finalText = restoreTechnicalTerms(translatedText, replacements);

      // Update cache
      const newCache = {
        ...cacheRef.current,
        [cacheKey]: finalText
      };
      
      setTranslationCache(newCache);
      cacheRef.current = newCache;
      saveCache(newCache);

      console.log('Translation complete:', finalText.substring(0, 50) + '...');
      return finalText;

    } catch (error) {
      console.error('Translation failed:', error);
      // Return original text on error
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [saveCache]);

  // Clear cache
  const clearCache = useCallback(() => {
    setTranslationCache({});
    cacheRef.current = {};
    localStorage.removeItem('translationCache');
    console.log('Translation cache cleared');
  }, []);

  return {
    translate,
    isTranslating,
    clearCache
  };
};

export default useMultilingual;
