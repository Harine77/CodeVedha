import { motion } from 'framer-motion';
import { 
  FaClock, 
  FaMemory, 
  FaExclamationTriangle, 
  FaLightbulb,
  FaChartLine 
} from 'react-icons/fa';

const ComplexityAnalysis = ({ analysisData, loading, error }) => {
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Loading skeleton component
  const SkeletonLoader = () => (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error component
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-900/20 border border-red-500/50 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <FaExclamationTriangle className="text-red-400 text-2xl mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-red-400 font-semibold text-lg mb-2">Analysis Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Loading state
  if (loading || !analysisData) {
    return <SkeletonLoader />;
  }

  const { timeComplexity, spaceComplexity, bottlenecks, reasoning } = analysisData;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* TIME COMPLEXITY CARD */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-600/20 rounded-lg">
            <FaClock className="text-purple-400 text-2xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Time Complexity</h3>
            <p className="text-slate-600 text-sm">Algorithm efficiency over input size</p>
          </div>
        </div>

        {/* Three Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Best Case */}
          <div className="card-colored bg-gradient-to-br from-emerald-600 to-emerald-700 border border-emerald-800 rounded-lg p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="label-strong text-white text-sm">Best Case</span>
              <FaChartLine className="text-white" />
            </div>
            <div className="value-strong text-4xl text-white font-mono">
              {timeComplexity?.best || 'N/A'}
            </div>
          </div>

          {/* Average Case */}
          <div className="card-colored bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-700 rounded-lg p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="label-strong text-white text-sm">Average Case</span>
              <FaChartLine className="text-white" />
            </div>
            <div className="value-strong text-4xl text-white font-mono">
              {timeComplexity?.average || 'N/A'}
            </div>
          </div>

          {/* Worst Case */}
          <div className="card-colored bg-gradient-to-br from-rose-500 to-rose-600 border border-rose-700 rounded-lg p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="label-strong text-white text-sm">Worst Case</span>
              <FaChartLine className="text-white" />
            </div>
            <div className="value-strong text-4xl text-white font-mono">
              {timeComplexity?.worst || 'N/A'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* SPACE COMPLEXITY CARD */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <FaMemory className="text-blue-400 text-2xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Space Complexity</h3>
            <p className="text-slate-600 text-sm">Memory usage analysis</p>
          </div>
        </div>

        <div className="card-colored bg-gradient-to-br from-sky-600 to-blue-700 border border-blue-800 rounded-lg p-6 transition-all">
          <div className="value-strong text-4xl text-white font-mono mb-2">
            {spaceComplexity || 'N/A'}
          </div>
          <p className="label-strong text-white text-sm">
            Additional memory required beyond input
          </p>
        </div>
      </motion.div>

      {/* BOTTLENECKS SECTION */}
      {bottlenecks && bottlenecks.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-600/20 rounded-lg">
              <FaExclamationTriangle className="text-orange-400 text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Performance Bottlenecks</h3>
              <p className="text-slate-600 text-sm">Critical lines affecting performance</p>
            </div>
          </div>

          <div className="space-y-3">
            {bottlenecks.map((bottleneck, index) => (
              <div 
                key={index}
                className="bg-white border border-orange-200 rounded-lg p-4 hover:border-orange-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-mono font-semibold flex-shrink-0">
                    Line {bottleneck.lineNumber || index + 1}
                  </span>
                  <div className="flex-1">
                    {bottleneck.code && (
                      <code className="block text-white bg-gray-900 px-3 py-2 rounded mb-2 text-sm font-mono">
                        {bottleneck.code}
                      </code>
                    )}
                    <p className="text-slate-700 text-sm">
                      <span className="text-orange-400 font-semibold">Issue: </span>
                      {bottleneck.reason || bottleneck}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* REASONING SECTION */}
      {reasoning && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl p-6 border border-violet-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <FaLightbulb className="text-purple-400 text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Mathematical Reasoning</h3>
              <p className="text-slate-600 text-sm">Detailed complexity analysis</p>
            </div>
          </div>

          <div className="bg-white border border-violet-200 rounded-lg p-6">
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
              {reasoning}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!timeComplexity && !spaceComplexity && !bottlenecks && !reasoning && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-sm"
        >
          <FaChartLine className="text-6xl text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Analysis Data</h3>
          <p className="text-slate-500">Submit your code to see complexity analysis</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ComplexityAnalysis;
