import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaArrowRight, 
  FaCopy, 
  FaCheckCircle,
  FaBalanceScale,
  FaLightbulb,
  FaCode,
  FaRocket,
  FaExclamationCircle
} from 'react-icons/fa';

const OptimizationSuggestions = ({ optimizations, onApplyOptimization, loading }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Copy to clipboard function
  const handleCopyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Parse complexity to show improvement
  const calculateImprovement = (current, optimized) => {
    const complexityOrder = {
      'O(1)': 1,
      'O(log n)': 2,
      'O(n)': 3,
      'O(n log n)': 4,
      'O(n²)': 5,
      'O(n^2)': 5,
      'O(n³)': 6,
      'O(n^3)': 6,
      'O(2^n)': 7,
      'O(n!)': 8
    };

    const currentOrder = complexityOrder[current] || 5;
    const optimizedOrder = complexityOrder[optimized] || 3;
    
    if (currentOrder > optimizedOrder) {
      const improvement = Math.round(((currentOrder - optimizedOrder) / currentOrder) * 100);
      return improvement > 0 ? `${improvement}% faster` : null;
    }
    return null;
  };

  // Add line numbers to code
  const addLineNumbers = (code) => {
    if (!code) return [];
    const lines = code.split('\n');
    return lines.map((line, index) => ({
      number: index + 1,
      content: line
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-2/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-64 bg-gray-700 rounded"></div>
                <div className="h-64 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state - code is already optimal
  if (!optimizations || optimizations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-xl p-12 border border-green-500/40 text-center"
      >
        <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Your code is already optimal! 🎉</h3>
        <p className="text-gray-300">No further optimizations detected. Great job!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {optimizations.map((optimization, index) => {
        const currentLines = addLineNumbers(optimization.currentCode || optimization.optimizedCode);
        const optimizedLines = addLineNumbers(optimization.optimizedCode);
        const improvement = calculateImprovement(
          optimization.currentComplexity || optimization.newComplexity?.time,
          optimization.optimizedComplexity || optimization.newComplexity?.time
        );

        return (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl border border-purple-500/30 shadow-2xl overflow-hidden"
          >
            {/* HEADER SECTION */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-purple-500/30">
              <div className="flex flex-wrap items-center gap-4">
                {/* Current Complexity */}
                <div className="px-4 py-2 bg-red-900/40 border border-red-500/50 rounded-lg">
                  <span className="text-red-300 text-sm font-semibold">Current: </span>
                  <span className="text-red-200 font-mono font-bold text-lg">
                    {optimization.currentComplexity || optimization.newComplexity?.time || 'N/A'}
                  </span>
                </div>

                {/* Arrow */}
                <FaArrowRight className="text-purple-400 text-2xl" />

                {/* Optimized Complexity */}
                <div className="px-4 py-2 bg-green-900/40 border border-green-500/50 rounded-lg">
                  <span className="text-green-300 text-sm font-semibold">Optimized: </span>
                  <span className="text-green-200 font-mono font-bold text-lg">
                    {optimization.optimizedComplexity || optimization.newComplexity?.time || 'N/A'}
                  </span>
                </div>

                {/* Improvement Percentage */}
                {improvement && (
                  <div className="px-4 py-2 bg-green-600/30 border border-green-500/50 rounded-lg">
                    <FaRocket className="inline mr-2 text-green-400" />
                    <span className="text-green-200 font-semibold">{improvement}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CODE COMPARISON */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaCode className="text-purple-400 text-xl" />
                <h3 className="text-lg font-bold text-white">Code Comparison</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Current Code */}
                {optimization.currentCode && (
                  <div className="bg-gray-900/70 rounded-lg border border-red-500/30 overflow-hidden">
                    <div className="bg-red-900/30 px-4 py-2 border-b border-red-500/30">
                      <span className="text-red-300 font-semibold text-sm">Current Code</span>
                    </div>
                    <div className="p-4 overflow-x-auto max-h-96 overflow-y-auto">
                      <pre className="text-sm">
                        <code>
                          {currentLines.map((line) => (
                            <div key={line.number} className="flex">
                              <span className="text-gray-600 select-none mr-4 text-right w-8">
                                {line.number}
                              </span>
                              <span className="text-gray-300">{line.content}</span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Optimized Code */}
                <div className="bg-gray-900/70 rounded-lg border border-green-500/30 overflow-hidden">
                  <div className="bg-green-900/30 px-4 py-2 border-b border-green-500/30">
                    <span className="text-green-300 font-semibold text-sm">Optimized Code</span>
                  </div>
                  <div className="p-4 overflow-x-auto max-h-96 overflow-y-auto">
                    <pre className="text-sm">
                      <code>
                        {optimizedLines.map((line) => (
                          <div key={line.number} className="flex">
                            <span className="text-gray-600 select-none mr-4 text-right w-8">
                              {line.number}
                            </span>
                            <span className="text-green-300">{line.content}</span>
                          </div>
                        ))}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* TRADE-OFFS SECTION */}
              {(optimization.tradeoffs || optimization.tradeOffs) && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FaBalanceScale className="text-yellow-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-300 font-semibold mb-2">Trade-offs</h4>
                      {Array.isArray(optimization.tradeoffs || optimization.tradeOffs) ? (
                        <ul className="space-y-1">
                          {(optimization.tradeoffs || optimization.tradeOffs).map((tradeoff, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                              <FaExclamationCircle className="text-yellow-400 mt-1 flex-shrink-0 text-xs" />
                              <span>{tradeoff}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-300 text-sm">
                          {optimization.tradeoffs || optimization.tradeOffs}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* WHY IT WORKS SECTION */}
              {optimization.explanation && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FaLightbulb className="text-purple-400 text-xl mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-purple-300 font-semibold mb-3">Why This Works</h4>
                      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {optimization.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-3">
                {/* Copy Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCopyCode(optimization.optimizedCode, index)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    copiedIndex === index
                      ? 'bg-green-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {copiedIndex === index ? (
                    <>
                      <FaCheckCircle />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy />
                      Copy Optimized Code
                    </>
                  )}
                </motion.button>

                {/* Apply Button */}
                {onApplyOptimization && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onApplyOptimization(optimization.optimizedCode)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all"
                  >
                    <FaRocket />
                    Apply to Editor
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default OptimizationSuggestions;
