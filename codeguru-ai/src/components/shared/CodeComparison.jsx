import { motion } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { FaArrowRight } from 'react-icons/fa';

const CodeComparison = ({ 
  beforeCode = '', 
  afterCode = '', 
  beforeComplexity = 'O(n²)', 
  afterComplexity = 'O(n)', 
  language = 'python' 
}) => {
  
  // Calculate if it's an improvement
  const isImprovement = beforeComplexity !== afterComplexity;

  // Animation for the arrow
  const arrowVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    glow: {
      boxShadow: [
        '0 0 10px rgba(34, 197, 94, 0.3)',
        '0 0 20px rgba(34, 197, 94, 0.6)',
        '0 0 10px rgba(34, 197, 94, 0.3)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        
        {/* LEFT COLUMN - BEFORE */}
        <div className="w-full">
          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 backdrop-blur-sm rounded-xl border border-red-500/30 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-red-900/30 px-4 py-3 border-b border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-300 font-semibold">Current Code</span>
              </div>
              <div className="px-3 py-1 bg-red-900/40 border border-red-500/50 rounded-full">
                <span className="text-red-200 font-mono text-sm font-semibold">
                  {beforeComplexity}
                </span>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="border-b border-red-500/20">
              <Editor
                height="300px"
                language={language}
                value={beforeCode}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  renderLineHighlight: 'none',
                  contextmenu: false,
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto'
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* CENTER ARROW */}
        <div className="flex items-center justify-center md:mt-24 order-last md:order-none">
          <div className="flex flex-col items-center gap-3">
            {/* Arrow Icon with Animation */}
            <motion.div
              variants={glowVariants}
              animate={isImprovement ? "glow" : ""}
              className="p-4 bg-gradient-to-r from-purple-600/30 to-green-600/30 rounded-full border-2 border-green-500/50"
            >
              <motion.div
                variants={arrowVariants}
                animate={isImprovement ? "pulse" : ""}
              >
                <FaArrowRight className="text-3xl text-green-400 rotate-0 md:rotate-0" />
              </motion.div>
            </motion.div>

            {/* Complexity Improvement Text */}
            {isImprovement && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-green-900/30 border border-green-500/40 rounded-lg px-4 py-2 text-center"
              >
                <div className="text-xs text-gray-400 mb-1">Optimization</div>
                <div className="flex items-center gap-2 text-green-300 font-mono text-sm font-semibold whitespace-nowrap">
                  <span className="text-red-300">{beforeComplexity}</span>
                  <FaArrowRight className="text-xs" />
                  <span className="text-green-300">{afterComplexity}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - AFTER */}
        <div className="w-full">
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-xl border border-green-500/30 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-green-900/30 px-4 py-3 border-b border-green-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-300 font-semibold">Optimized Code</span>
              </div>
              <div className="px-3 py-1 bg-green-900/40 border border-green-500/50 rounded-full">
                <span className="text-green-200 font-mono text-sm font-semibold">
                  {afterComplexity}
                </span>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="border-b border-green-500/20">
              <Editor
                height="300px"
                language={language}
                value={afterCode}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  renderLineHighlight: 'none',
                  contextmenu: false,
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto'
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Arrow (shown between stacked editors on mobile) */}
      <div className="md:hidden flex justify-center my-4">
        <motion.div
          variants={arrowVariants}
          animate={isImprovement ? "pulse" : ""}
          className="p-3 bg-gradient-to-b from-green-600/30 to-emerald-600/30 rounded-full border-2 border-green-500/50"
        >
          <FaArrowRight className="text-2xl text-green-400 rotate-90" />
        </motion.div>
      </div>
    </div>
  );
};

export default CodeComparison;
