import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  FaTrophy, 
  FaRocket, 
  FaLightbulb, 
  FaDownload,
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';

const InterviewSummary = ({
  scores = [],
  strengths = [],
  improvements = [],
  nextSteps = [],
  onTryAgain,
  onDownload
}) => {
  
  const [displayScore, setDisplayScore] = useState(0);

  // Calculate average score
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;

  // Animated count-up effect for average score
  useEffect(() => {
    let startTime = null;
    const duration = 2000; // 2 seconds

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setDisplayScore(Math.floor(progress * averageScore));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [averageScore]);

  // Get color based on score
  const getScoreColor = (value) => {
    if (value >= 76) return '#10B981'; // green
    if (value >= 51) return '#EAB308'; // yellow
    return '#EF4444'; // red
  };

  const getScoreColorClass = (value) => {
    if (value >= 76) return { bg: 'bg-green-600', text: 'text-green-400', ring: 'ring-green-500' };
    if (value >= 51) return { bg: 'bg-yellow-600', text: 'text-yellow-400', ring: 'ring-yellow-500' };
    return { bg: 'bg-red-600', text: 'text-red-400', ring: 'ring-red-500' };
  };

  // Prepare chart data
  const chartData = scores.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score,
    color: getScoreColor(score)
  }));

  // Get performance level
  const getPerformanceLevel = (score) => {
    if (score >= 76) return 'Excellent';
    if (score >= 51) return 'Good';
    return 'Needs Work';
  };

  const scoreColors = getScoreColorClass(averageScore);
  const performanceLevel = getPerformanceLevel(averageScore);

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-purple-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{payload[0].payload.name}</p>
          <p className="text-purple-400">Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  // Calculate circle SVG path
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-8 border border-purple-500/40 shadow-xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <FaTrophy className="text-7xl text-yellow-400 mx-auto mb-4" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-2">Interview Complete!</h1>
        <p className="text-gray-300 text-lg">Here's your performance summary</p>
      </motion.div>

      {/* OVERALL SCORE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Overall Performance</h2>
        
        <div className="flex flex-col items-center">
          {/* Circular Progress Ring */}
          <div className="relative w-48 h-48 mb-4">
            <svg className="w-48 h-48 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                stroke="#374151"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="96"
                cy="96"
                r={radius}
                stroke={getScoreColor(averageScore)}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </svg>
            
            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-6xl font-bold ${scoreColors.text}`}>
                {displayScore}
              </div>
              <div className="text-gray-400 text-sm font-semibold">/ 100</div>
            </div>
          </div>

          <div className={`px-6 py-3 ${scoreColors.bg} rounded-full`}>
            <span className="text-white font-bold text-lg">{performanceLevel}</span>
          </div>
        </div>
      </motion.div>

      {/* PERFORMANCE BREAKDOWN CHART */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 shadow-xl"
      >
        <h3 className="text-xl font-bold text-white mb-4">Performance Breakdown</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Score Legend */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-300">Excellent (76-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 rounded"></div>
            <span className="text-gray-300">Good (51-75)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-gray-300">Needs Work (0-50)</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* STRENGTHS SECTION */}
        {strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <FaTrophy className="text-green-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white">What You Did Well</h3>
            </div>

            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <FaCheckCircle className="text-green-400 text-lg mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">{strength}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* AREAS FOR IMPROVEMENT SECTION */}
        {improvements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                <FaLightbulb className="text-yellow-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Work On These</h3>
            </div>

            <ul className="space-y-3">
              {improvements.map((improvement, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <FaArrowRight className="text-yellow-400 text-lg mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">{improvement}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* NEXT STEPS SECTION */}
      {nextSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <FaRocket className="text-purple-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white">Recommended Next Steps</h3>
          </div>

          <ul className="space-y-3">
            {nextSteps.map((step, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-start gap-3 bg-gray-900/30 rounded-lg p-3 border border-purple-500/20"
              >
                <span className="text-purple-400 font-bold flex-shrink-0">{index + 1}.</span>
                <span className="text-gray-200">{step}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* ACTION BUTTONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        {/* Try Another Code */}
        {onTryAgain && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTryAgain}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold text-lg transition-all shadow-lg"
          >
            <FaRocket />
            Try Another Code
          </motion.button>
        )}

        {/* Download Report */}
        {onDownload && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDownload}
            className="flex items-center gap-3 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-lg transition-all shadow-lg"
          >
            <FaDownload />
            Download Report
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default InterviewSummary;
