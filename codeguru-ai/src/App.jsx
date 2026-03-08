import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import CodeEditor from './components/shared/CodeEditor';
import LanguageSelector from './components/shared/LanguageSelector';
import ComplexityAnalysis from './components/analysis/ComplexityAnalysis';
import AlgorithmDetection from './components/analysis/AlgorithmDetection';
import OptimizationSuggestions from './components/analysis/OptimizationSuggestions';
import ComplexityChart from './components/visualization/ComplexityChart';
import AlgorithmAnimation from './components/visualization/AlgorithmAnimation';
import InterviewQuestions from './components/interview/InterviewQuestions';

// Utils
import {
  analyzeComplexity,
  identifyAlgorithms,
  generateOptimizations,
  generateInterviewQuestions,
  evaluateInterviewAnswer
} from './utils/geminiAPI';
import sampleCodes, { getSampleCodeNames } from './utils/sampleCodes';

// Hooks
import useMultilingual from './hooks/useMultilingual';

// Icons
import { FaCode, FaUserGraduate, FaChartLine, FaRocket, FaLightbulb, FaPlay, FaCheckCircle, FaTimes, FaBars } from 'react-icons/fa';

function App() {
  // STATE
  const [code, setCode] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState('python');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedSample, setSelectedSample] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [detectedAlgorithms, setDetectedAlgorithms] = useState(null);
  const [optimizations, setOptimizations] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getVisualizationAlgorithm = (detectedData, sourceCode = '') => {
    const allHints = [
      ...(detectedData?.algorithms || []),
      ...(detectedData?.patterns || []),
      ...(detectedData?.dataStructures || [])
    ].join(' ').toLowerCase();

    const normalizedCode = sourceCode.toLowerCase();

    const selfCallRegexes = [
      /def\s+([a-zA-Z_]\w*)\s*\([^)]*\)[\s\S]*?\b\1\s*\(/m,
      /function\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{[\s\S]*?\b\1\s*\(/m,
      /const\s+([a-zA-Z_]\w*)\s*=\s*\([^)]*\)\s*=>[\s\S]*?\b\1\s*\(/m
    ];
    const isRecursion = selfCallRegexes.some((regex) => regex.test(sourceCode));

    const isDP =
      /\bmemo\b|\bcache\b|\bdp\b/.test(normalizedCode) ||
      /dp\s*\[\s*\w+\s*\]/.test(normalizedCode) ||
      /for\s+\w+\s+in\s+range\([^)]*\)[\s\S]*dp\s*\[/.test(normalizedCode) ||
      /for\s*\([^)]*\)[\s\S]*dp\s*\[/.test(normalizedCode);

    if (isDP || allHints.includes('dynamic programming') || allHints.includes('memoization')) {
      return 'dynamic_programming';
    }

    if (isRecursion || allHints.includes('recursion') || allHints.includes('recursive')) {
      return 'recursion';
    }

    if (allHints.includes('tree') || allHints.includes('bst')) {
      return 'tree_traversal';
    }

    if (allHints.includes('graph')) {
      return 'graph';
    }

    if (
      allHints.includes('sort') ||
      /\.sort\(|bubble\s*sort|merge\s*sort|quick\s*sort|heap\s*sort|selection\s*sort|insertion\s*sort/.test(normalizedCode)
    ) {
      return 'bubble_sort';
    }

    if (allHints.includes('binary search')) {
      return 'binary_search';
    }

    return 'bubble_sort';
  };

  const getLanguageNameForApi = (code) => {
    const map = {
      en: 'English',
      hi: 'Hindi',
      ta: 'Tamil',
      te: 'Telugu',
      bn: 'Bengali',
      mr: 'Marathi'
    };
    return map[code] || 'English';
  };

  const getAlgorithmTypeForApi = (detectedData, sourceCode = '') => {
    const visualType = getVisualizationAlgorithm(detectedData, sourceCode);
    const typeMap = {
      bubble_sort: 'sorting',
      binary_search: 'sorting',
      tree_traversal: 'tree',
      recursion: 'recursion',
      dynamic_programming: 'dynamic programming',
      graph: 'graph'
    };
    return typeMap[visualType] || 'sorting';
  };

  // Hooks
  const { translate, isTranslating } = useMultilingual();

  // Load selected language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setSelectedLanguage(savedLanguage);
  }, []);

  // Listen for language changes from LanguageSelector
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLanguage = localStorage.getItem('selectedLanguage') || 'en';
      setSelectedLanguage(newLanguage);
    };

    window.addEventListener('storage', handleLanguageChange);
    
    // Custom event for same-window changes
    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-hide success after 2 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // FUNCTIONS
  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Analyzing code with Groq API...');

      const payload = {
        code,
        algorithm_type: getAlgorithmTypeForApi(detectedAlgorithms, code),
        language: getLanguageNameForApi(selectedLanguage)
      };
      
      // Keep calls sequential to reduce burst traffic against free-tier quota.
      const complexity = await analyzeComplexity(code, payload);
      const algorithms = await identifyAlgorithms(code, payload);

      let opts = null;
      
      // Generate optimizations if complexity is not optimal
      const avgComplexity = complexity?.timeComplexity?.average?.toLowerCase() || '';
      if (avgComplexity && !avgComplexity.includes('o(1)') && !avgComplexity.includes('o(log')) {
        console.log('Generating optimizations...');
        opts = await generateOptimizations(code, complexity, payload);
      }

      setAnalysisResults(complexity);
      setDetectedAlgorithms(algorithms);
      setOptimizations(opts);

      console.log('Analysis complete!');
      setShowSuccess(true);
    } catch (err) {
      console.error('API Error:', err);
      const message = err?.message || '';
      if (message.toLowerCase().includes('quota exceeded')) {
        setError('Groq quota exceeded. Please wait for quota reset or upgrade your plan, then try again.');
      } else {
        setError('API Error: Please check your Groq API key and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    if (!code.trim()) {
      setError('Please enter code to practice interview questions');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Generating interview questions with Groq API...');

      const payload = {
        code,
        algorithm_type: getAlgorithmTypeForApi(detectedAlgorithms, code),
        language: getLanguageNameForApi(selectedLanguage)
      };
      
      // Make real API call
      const questions = await generateInterviewQuestions(code, payload);
      
      setInterviewQuestions(questions);
      setActiveTab('interview');
      console.log('Interview ready!');
    } catch (err) {
      console.error('API Error:', err);
      setError('API Error: Please check your Groq API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnswer = async (question, userAnswer, expectedPoints) => {
    try {
      const feedback = await evaluateInterviewAnswer(question, userAnswer, expectedPoints, {
        language: getLanguageNameForApi(selectedLanguage)
      });
      return feedback;
    } catch (err) {
      console.error('Answer evaluation error:', err);
      return {
        score: 0,
        feedback: 'Failed to evaluate answer. Please try again.',
        coveredPoints: [],
        missedPoints: expectedPoints || [],
        interviewReadiness: 'Please try again'
      };
    }
  };

  const handleApplyOptimization = (optimizedCode) => {
    setCode(optimizedCode);
    setOptimizations(null);
    setAnalysisResults(null);
    setDetectedAlgorithms(null);
    // User can click "Analyze Code" again to see new results
  };

  const loadSampleCode = (sampleKey) => {
    if (!sampleKey) return;
    
    const sample = sampleCodes[sampleKey];
    if (sample) {
      setCode(sample.code);
      setProgrammingLanguage(sample.language);
      setSelectedSample(sampleKey);
      setAnalysisResults(null);
      setDetectedAlgorithms(null);
      setOptimizations(null);
      setInterviewQuestions(null);
      setError('');
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: FaCode },
    { id: 'interview', label: 'Interview', icon: FaUserGraduate },
    { id: 'visualize', label: 'Visualize', icon: FaChartLine }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* LOADING OVERLAY */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4"
            >
              <div className="spinner-lg"></div>
              <p className="text-xl font-semibold text-gray-800">
                Analyzing your code...
              </p>
              <p className="text-sm text-gray-500">
                This may take a few moments
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3"
          >
            <FaCheckCircle className="text-2xl" />
            <div>
              <p className="font-bold">Analysis Complete!</p>
              <p className="text-sm">Check your results below</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR TOAST */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl max-w-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <FaTimes className="text-xl mt-1" />
                <div>
                  <p className="font-bold mb-1">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError('')}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPACT NAVBAR */}
      <header className="sticky top-0 z-40 h-16 bg-gradient-to-r from-orange-500 via-sky-700 to-emerald-600 shadow-lg">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="h-full flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 whitespace-nowrap">
                <FaRocket className="text-white" />
                <span>CodeGuru AI IN</span>
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/25 text-white border border-white/40'
                        : 'text-white hover:bg-white/15'
                    }`}
                  >
                    <Icon className="text-sm" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex-1 flex items-center justify-end gap-2">
              <div className="hidden md:block">
                <LanguageSelector
                  variant="navbar"
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                <FaBars className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white shadow-lg overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="text-xl" />
                    {tab.label}
                  </button>
                );
              })}
              <div className="pt-4 border-t border-gray-200">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* TAB 1 - ANALYSIS */}
          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Code Editor Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaCode className="text-purple-500" />
                  Code Editor
                </h2>
              </div>
              
              {/* Sample Code Selector */}
              <div className="mb-4 flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaLightbulb className="text-yellow-500" />
                  Load Sample Code:
                </label>
                <select
                  value={selectedSample}
                  onChange={(e) => loadSampleCode(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 text-gray-800 rounded-lg font-medium hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">-- Choose a sample --</option>
                  {getSampleCodeNames().map(({ key, name }) => (
                    <option key={key} value={key}>
                      {name} ({sampleCodes[key].expectedComplexity})
                    </option>
                  ))}
                </select>
              </div>
              
              <CodeEditor
                code={code}
                onChange={setCode}
                language={programmingLanguage}
                onLanguageChange={setProgrammingLanguage}
              />

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={analyzeCode}
                  disabled={loading || !code.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:from-purple-700 hover:to-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FaPlay />
                      Analyze Code
                    </>
                  )}
                </button>

                <button
                  onClick={startInterview}
                  disabled={loading || !code.trim()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:from-green-700 hover:to-teal-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
                >
                  <FaUserGraduate />
                  Start Interview Practice
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            {analysisResults && (
              <div className="space-y-6">
                <ComplexityAnalysis
                  analysisData={analysisResults}
                  loading={loading}
                  error={null}
                />

                {detectedAlgorithms && (
                  <AlgorithmDetection
                    detectedData={detectedAlgorithms}
                    loading={loading}
                  />
                )}

                {optimizations && (
                  <OptimizationSuggestions
                    optimizations={[
                      {
                        currentCode: code,
                        optimizedCode: optimizations.optimizedCode,
                        currentComplexity: analysisResults.timeComplexity?.average,
                        optimizedComplexity: optimizations.newComplexity?.time,
                        newComplexity: optimizations.newComplexity,
                        tradeoffs: optimizations.tradeoffs || [],
                        explanation: optimizations.explanation
                      }
                    ]}
                    onApplyOptimization={handleApplyOptimization}
                    loading={loading}
                  />
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && !analysisResults && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="max-w-md mx-auto">
                  <FaLightbulb className="text-6xl text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Ready to Analyze Your Code?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Enter your code above and click "Analyze Code" to get insights on complexity, algorithms, and optimizations.
                  </p>
                  <button
                    onClick={() => loadSampleCode('bubbleSort')}
                    className="px-6 py-3 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors"
                  >
                    Try with Sample Code
                  </button>
                </div>
              </div>
            )}
            </motion.div>
          )}

          {/* TAB 2 - INTERVIEW */}
          {activeTab === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
            {!interviewQuestions && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FaUserGraduate className="text-6xl text-blue-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Interview Practice Mode
                </h3>
                <p className="text-gray-600 mb-6">
                  {code.trim() 
                    ? 'Click "Start Interview Practice" to generate technical interview questions based on your code.'
                    : 'Please enter some code first, then start the interview practice.'}
                </p>
                {code.trim() && (
                  <button
                    onClick={startInterview}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg text-lg font-bold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 shadow-xl transition-all"
                  >
                    {loading ? 'Generating Questions...' : 'Start Interview Practice'}
                  </button>
                )}
                {!code.trim() && (
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className="px-8 py-4 bg-purple-600 text-white rounded-lg text-lg font-bold hover:bg-purple-700 shadow-xl transition-all"
                  >
                    Go to Code Editor
                  </button>
                )}
              </div>
            )}

            {interviewQuestions && (
              <div>
                {/* Show code reference (read-only, collapsed) */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                  <details className="cursor-pointer">
                    <summary className="font-semibold text-gray-700 mb-2">
                      📝 Your Code (click to view)
                    </summary>
                    <div className="mt-4 max-h-48 overflow-auto">
                      <CodeEditor
                        code={code}
                        onChange={() => {}}
                        language={programmingLanguage}
                        onLanguageChange={() => {}}
                        readOnly={true}
                      />
                    </div>
                  </details>
                </div>

                <InterviewQuestions
                  questions={interviewQuestions}
                  codeContext={code}
                  onEvaluateAnswer={handleEvaluateAnswer}
                  onTryAnother={() => {
                    setInterviewQuestions(null);
                    setActiveTab('analysis');
                  }}
                />
              </div>
            )}
            </motion.div>
          )}

          {/* TAB 3 - VISUALIZE */}
          {activeTab === 'visualize' && (
            <motion.div
              key="visualize"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
            {analysisResults ? (
              <>
                {/* Complexity Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaChartLine className="text-blue-500" />
                    Complexity Visualization
                  </h2>
                  <ComplexityChart
                    detectedComplexity={analysisResults.timeComplexity?.average}
                  />
                </div>

                {/* Algorithm Animation */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaPlay className="text-green-500" />
                    Algorithm Animation
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Detected: {detectedAlgorithms?.algorithms?.length ? detectedAlgorithms.algorithms.join(', ') : getVisualizationAlgorithm(detectedAlgorithms, code).replace('_', ' ')}
                  </p>
                  <AlgorithmAnimation
                    algorithm={getVisualizationAlgorithm(detectedAlgorithms, code)}
                    sourceCode={code}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FaChartLine className="text-6xl text-purple-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No Analysis Data Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Please analyze your code first to see visualizations of complexity and algorithms.
                </p>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className="px-8 py-4 bg-purple-600 text-white rounded-lg text-lg font-bold hover:bg-purple-700 shadow-xl transition-all"
                >
                  Go to Analysis Tab
                </button>
              </div>
            )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold mb-2">
            Built with ❤️ for Indian Students
          </p>
          <p className="text-gray-400">
            Powered by Groq AI • Made in Bharat 🇮🇳
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-400">
            <span>Free & Open Source</span>
            <span>•</span>
            <span>Multi-Language Support</span>
            <span>•</span>
            <span>Practice Interview Questions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
