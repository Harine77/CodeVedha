import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaStar, FaQuoteLeft } from 'react-icons/fa';

const InterviewFeedback = ({ 
  userAnswer = '',
  score = 0,
  expectedPoints = [],
  coveredPoints = [],
  missedPoints = [],
  feedback = '',
  interviewReadiness = 0
}) => {
  
  const [displayScore, setDisplayScore] = useState(0);

  // Animated count-up effect for score
  useEffect(() => {
    let startTime = null;
    const duration = 1500; // 1.5 seconds

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setDisplayScore(Math.floor(progress * score));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Get color based on score
  const getScoreColor = (value) => {
    if (value >= 76) return { bg: 'bg-green-600', text: 'text-green-400', border: 'border-green-500' };
    if (value >= 51) return { bg: 'bg-yellow-600', text: 'text-yellow-400', border: 'border-yellow-500' };
    return { bg: 'bg-red-600', text: 'text-red-400', border: 'border-red-500' };
  };

  // Get readiness label
  const getReadinessLabel = (value) => {
    if (value >= 76) return { label: 'Interview Ready!', icon: <FaTrophy /> };
    if (value >= 51) return { label: 'Good Progress', icon: <FaStar /> };
    return { label: 'Needs More Work', icon: <FaTimesCircle /> };
  };

  const scoreColors = getScoreColor(score);
  const readinessInfo = getReadinessLabel(interviewReadiness || score);

  return (
    <div className="space-y-6">
      
      {/* SCORE SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30 shadow-xl"
      >
        <div className="flex flex-col items-center">
          {/* Circular Score Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-32 h-32 rounded-full ${scoreColors.bg} border-4 ${scoreColors.border} flex items-center justify-center shadow-2xl mb-4`}
          >
            <div className="text-center">
              <div className="text-5xl font-bold text-white">
                {displayScore}
              </div>
              <div className="text-white text-xs font-semibold">/ 100</div>
            </div>
          </motion.div>

          <h3 className={`text-2xl font-bold ${scoreColors.text} mb-2`}>
            Your Score
          </h3>
          
          <div className="flex items-center gap-2 text-gray-400">
            {readinessInfo.icon}
            <span className="text-sm">{readinessInfo.label}</span>
          </div>
        </div>
      </motion.div>

      {/* YOUR ANSWER SECTION */}
      {userAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaQuoteLeft className="text-purple-400 text-xl" />
            <h3 className="text-xl font-bold text-white">What You Said</h3>
          </div>
          
          <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-700 max-h-48 overflow-y-auto">
            <p className="text-gray-300 text-sm leading-relaxed italic">
              "{userAnswer}"
            </p>
          </div>
        </motion.div>
      )}

      {/* EXPECTED KEY POINTS SECTION */}
      {(coveredPoints.length > 0 || missedPoints.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 shadow-xl"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-blue-400" />
            Key Points Analysis
          </h3>

          <div className="space-y-3">
            {/* Covered Points */}
            {coveredPoints.map((point, index) => (
              <motion.div
                key={`covered-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-3 bg-green-900/20 border border-green-500/30 rounded-lg p-4"
              >
                <FaCheckCircle className="text-green-400 text-xl mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-green-300 text-sm font-medium">{point}</p>
                </div>
              </motion.div>
            ))}

            {/* Missed Points */}
            {missedPoints.map((point, index) => (
              <motion.div
                key={`missed-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (coveredPoints.length + index) * 0.1 }}
                className="flex items-start gap-3 bg-red-900/20 border border-red-500/30 rounded-lg p-4"
              >
                <FaTimesCircle className="text-red-400 text-xl mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-300 text-sm font-medium">{point}</p>
                </div>
              </motion.div>
            ))}

            {/* If expectedPoints is provided but not split into covered/missed */}
            {coveredPoints.length === 0 && missedPoints.length === 0 && expectedPoints.length > 0 && (
              expectedPoints.map((point, index) => (
                <div
                  key={`expected-${index}`}
                  className="flex items-start gap-3 bg-gray-900/50 border border-gray-700 rounded-lg p-4"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">{point}</p>
                </div>
              ))
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span className="text-gray-300 text-sm">
                <span className="font-bold text-green-400">{coveredPoints.length}</span> covered
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaTimesCircle className="text-red-400" />
              <span className="text-gray-300 text-sm">
                <span className="font-bold text-red-400">{missedPoints.length}</span> missed
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI FEEDBACK SECTION */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-xl"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            Feedback & Suggestions
          </h3>
          
          <div className="bg-gray-900/50 rounded-lg p-5 border border-purple-500/20">
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {feedback}
            </p>
          </div>
        </motion.div>
      )}

      {/* INTERVIEW READINESS METER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Interview Readiness</h3>
          <span className={`font-bold font-mono ${scoreColors.text}`}>
            {interviewReadiness || score}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-gray-700 rounded-full h-6 overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${interviewReadiness || score}%` }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className={`h-full ${scoreColors.bg} rounded-full flex items-center justify-end px-2`}
          >
            {(interviewReadiness || score) > 10 && (
              <span className="text-white text-xs font-semibold">
                {interviewReadiness || score}%
              </span>
            )}
          </motion.div>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>Needs Work</span>
          <span>Good</span>
          <span>Interview Ready!</span>
        </div>

        {/* Markers */}
        <div className="relative w-full h-2 mt-1">
          <div className="absolute left-0 w-0.5 h-2 bg-red-500"></div>
          <div className="absolute left-1/2 w-0.5 h-2 bg-yellow-500 -translate-x-1/2"></div>
          <div className="absolute right-0 w-0.5 h-2 bg-green-500"></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewFeedback;
