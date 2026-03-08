import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, 
  FaDatabase, 
  FaLayerGroup, 
  FaLightbulb,
  FaCode,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaArrowRight,
  FaCube,
  FaProjectDiagram,
  FaList,
  FaStream
} from 'react-icons/fa';

const AlgorithmDetection = ({ detectedData, loading }) => {
  const [expandedAlgorithm, setExpandedAlgorithm] = useState(null);
  const [expandedPattern, setExpandedPattern] = useState(null);

  // Helper function to parse algorithm/data structure strings
  const parseItem = (item) => {
    if (typeof item === 'string') {
      // Check if it's in "type: name" format
      const parts = item.split(':');
      if (parts.length > 1) {
        return { name: parts[1].trim(), type: parts[0].trim() };
      }
      return { name: item, type: null };
    }
    return item;
  };

  // Get icon for algorithm type
  const getAlgorithmIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('sort')) return <FaStream className="text-blue-400" />;
    if (lowerName.includes('search')) return <FaSearch className="text-green-400" />;
    if (lowerName.includes('dynamic') || lowerName.includes('dp')) return <FaLayerGroup className="text-purple-400" />;
    if (lowerName.includes('greedy')) return <FaLightbulb className="text-yellow-400" />;
    if (lowerName.includes('graph') || lowerName.includes('tree')) return <FaProjectDiagram className="text-pink-400" />;
    return <FaCode className="text-cyan-400" />;
  };

  // Get icon for data structure
  const getDataStructureIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('array') || lowerName.includes('list')) return <FaList className="text-blue-400" />;
    if (lowerName.includes('hash') || lowerName.includes('map') || lowerName.includes('dict')) return <FaDatabase className="text-green-400" />;
    if (lowerName.includes('tree')) return <FaProjectDiagram className="text-purple-400" />;
    if (lowerName.includes('graph')) return <FaProjectDiagram className="text-pink-400" />;
    if (lowerName.includes('stack') || lowerName.includes('queue')) return <FaStream className="text-orange-400" />;
    return <FaCube className="text-cyan-400" />;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-slate-200 rounded w-24"></div>
                <div className="h-10 bg-slate-200 rounded w-32"></div>
                <div className="h-10 bg-slate-200 rounded w-28"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!detectedData || (!detectedData.algorithms?.length && !detectedData.dataStructures?.length && !detectedData.patterns?.length)) {
    return (
      <div className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-sm">
        <FaSearch className="text-6xl text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Algorithms Detected</h3>
        <p className="text-slate-500">Submit your code to identify algorithms and patterns</p>
      </div>
    );
  }

  const { algorithms = [], dataStructures = [], patterns = [], alternatives = [] } = detectedData;

  return (
    <div className="space-y-6">
      
      {/* ALGORITHMS DETECTED */}
      {algorithms.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <FaCode className="text-blue-400 text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Algorithms Detected</h3>
              <p className="text-slate-600 text-sm">Algorithmic approaches in your code</p>
            </div>
          </div>

          <motion.div variants={containerVariants} className="flex flex-wrap gap-3">
            {algorithms.map((algo, index) => {
              const parsedAlgo = parseItem(algo);
              const algoName = parsedAlgo.name || algo;
              const isExpanded = expandedAlgorithm === index;

              return (
                <motion.div key={index} variants={itemVariants} className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setExpandedAlgorithm(isExpanded ? null : index)}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-sky-300 rounded-lg hover:border-sky-500 transition-all text-slate-800 font-medium shadow-sm"
                  >
                    {getAlgorithmIcon(algoName)}
                    <span>{algoName}</span>
                    {isExpanded ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
                  </motion.button>

                  <AnimatePresence>
                    {isExpanded && parsedAlgo.explanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm"
                      >
                        {parsedAlgo.explanation}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* DATA STRUCTURES */}
      {dataStructures.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 border border-emerald-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-600/20 rounded-lg">
              <FaDatabase className="text-green-400 text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Data Structures Used</h3>
              <p className="text-slate-600 text-sm">Storage and organization methods</p>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {dataStructures.map((ds, index) => {
              const parsedDS = parseItem(ds);
              const dsName = parsedDS.name || ds;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white border border-emerald-200 rounded-lg p-4 hover:border-emerald-400 transition-all shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-600/20 rounded-lg flex-shrink-0">
                      {getDataStructureIcon(dsName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-900 font-semibold mb-1 truncate">{dsName}</h4>
                      {parsedDS.usage && (
                        <p className="text-slate-500 text-xs">{parsedDS.usage}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* PATTERNS IDENTIFIED */}
      {patterns.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-gradient-to-br from-violet-50 to-rose-50 rounded-xl p-6 border border-violet-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <FaLayerGroup className="text-purple-400 text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Patterns Identified</h3>
              <p className="text-slate-600 text-sm">Problem-solving techniques detected</p>
            </div>
          </div>

          <motion.div variants={containerVariants} className="flex flex-wrap gap-3">
            {patterns.map((pattern, index) => {
              const parsedPattern = parseItem(pattern);
              const patternName = parsedPattern.name || pattern;
              const isExpanded = expandedPattern === index;

              return (
                <motion.div key={index} variants={itemVariants} className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setExpandedPattern(isExpanded ? null : index)}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-violet-300 rounded-lg hover:border-violet-500 transition-all text-slate-800 font-medium shadow-sm"
                  >
                    <FaLayerGroup className="text-purple-300" />
                    <span>{patternName}</span>
                    {isExpanded ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
                  </motion.button>

                  <AnimatePresence>
                    {isExpanded && parsedPattern.explanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm"
                      >
                        {parsedPattern.explanation}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* BETTER ALTERNATIVES */}
      {alternatives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-emerald-50 to-lime-50 rounded-xl p-6 border border-emerald-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-600/20 rounded-lg">
              <FaLightbulb className="text-green-400 text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Better Alternatives</h3>
              <p className="text-slate-600 text-sm">Suggested optimizations and improvements</p>
            </div>
          </div>

          <div className="space-y-3">
            {alternatives.map((alt, index) => {
              const current = alt.current || '';
              const alternative = alt.alternative || alt.suggestion || '';
              const benefit = alt.benefit || alt.improvement || '';

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-emerald-200 rounded-lg p-4 hover:border-emerald-400 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-400 text-xl mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      {current && (
                        <p className="text-slate-700 text-sm mb-2">
                          <span className="text-red-400 font-semibold">Current: </span>
                          {current}
                        </p>
                      )}
                      
                      {alternative && (
                        <p className="text-slate-700 text-sm mb-2">
                          <span className="text-green-400 font-semibold">Alternative: </span>
                          {alternative}
                        </p>
                      )}
                      
                      {benefit && (
                        <div className="flex items-center gap-2 mt-2">
                          <FaArrowRight className="text-green-400 text-sm" />
                          <span className="text-green-300 text-sm font-medium">{benefit}</span>
                        </div>
                      )}

                      {/* Show complexity improvement if present */}
                      {alt.complexityImprovement && (
                        <div className="mt-2 px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-lg inline-block">
                          <span className="text-green-300 font-mono text-sm">{alt.complexityImprovement}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AlgorithmDetection;
