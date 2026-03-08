import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQuestionCircle, 
  FaArrowRight, 
  FaClock,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';

const InterviewQuestions = ({ 
  code, 
  codeContext,
  questions = [], 
  onEvaluateAnswer,
  onComplete,
  onTryAnother
}) => {
  
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [scores, setScores] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStartTime]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    setIsSubmitting(true);

    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      // Call the evaluation function (Gemini API)
      const evaluation = await onEvaluateAnswer(
        currentQuestion.question,
        currentAnswer,
        currentQuestion.expectedPoints
      );

      // Store results
      setUserAnswers([...userAnswers, currentAnswer]);
      setFeedbacks([...feedbacks, evaluation]);
      setScores([...scores, evaluation.score || 0]);
      
      // Show feedback
      setShowFeedback(true);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Failed to evaluate answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setShowFeedback(false);
      setElapsedTime(0);
      setQuestionStartTime(Date.now());
    } else {
      // All questions completed
      setIsComplete(true);
      if (onComplete) {
        onComplete({
          answers: [...userAnswers, currentAnswer],
          feedbacks: feedbacks,
          scores: scores,
          totalScore: scores.reduce((a, b) => a + b, 0) / scores.length
        });
      }
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + (showFeedback ? 1 : 0)) / questions.length) * 100;

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  const effectiveCode = code ?? codeContext ?? '';

  // If no questions provided
  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-sm">
        <FaQuestionCircle className="text-6xl text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Questions Available</h3>
        <p className="text-slate-500">Generate interview questions first</p>
      </div>
    );
  }

  // Final summary screen
  if (isComplete) {
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const passedCount = scores.filter(s => s >= 60).length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center">
          <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Interview Complete!</h2>
          <p className="text-slate-600 mb-6">You've answered all {questions.length} questions</p>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {averageScore.toFixed(0)}%
              </div>
              <div className="text-slate-600 text-sm">Average Score</div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {passedCount}/{questions.length}
              </div>
              <div className="text-slate-600 text-sm">Questions Passed (&gt;=60%)</div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {scores.length}
              </div>
              <div className="text-slate-600 text-sm">Total Answered</div>
            </div>
          </div>

          {/* Individual Scores */}
          <div className="space-y-3 mb-6">
            {questions.map((q, index) => (
              <div 
                key={index}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 text-sm">Question {index + 1}</span>
                  <span className={`font-bold font-mono ${
                    scores[index] >= 80 ? 'text-green-400' :
                    scores[index] >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {scores[index]}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (onTryAnother) {
                onTryAnother();
              } else {
                window.location.reload();
              }
            }}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
          >
            Try Another Code
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentFeedback = feedbacks[feedbacks.length - 1];

  return (
    <div className="space-y-6">
      
      {/* PROGRESS BAR */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-700 text-sm font-medium">
            Interview Progress
          </span>
          <span className="text-purple-400 font-semibold">
            {currentQuestionIndex + (showFeedback ? 1 : 0)}/{questions.length} completed
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showFeedback ? (
          /* QUESTION CARD */
          <motion.div
            key={`question-${currentQuestionIndex}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <FaQuestionCircle className="text-blue-400 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h3>
                  <p className="text-slate-600 text-sm">Interview Practice</p>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                <FaClock className="text-slate-500" />
                <span className="text-slate-800 font-mono font-semibold">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
              <p className="text-slate-800 text-lg leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Expected Points (Hints) */}
            {currentQuestion.expectedPoints && currentQuestion.expectedPoints.length > 0 && (
              <div className="mb-6">
                <p className="text-slate-600 text-sm mb-2">Topics to cover:</p>
                <div className="space-y-1">
                  {currentQuestion.expectedPoints.slice(0, 3).map((point, index) => (
                    <div key={index} className="flex items-start gap-2 text-slate-700 text-sm">
                      <span className="text-violet-500">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {effectiveCode && (
              <p className="text-slate-500 text-xs mb-4">
                Answers should reference the provided code snippet.
              </p>
            )}

            {/* Answer Textarea */}
            <div className="mb-4">
              <label className="block text-slate-800 font-medium mb-2">
                Your Answer:
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here... Be detailed and explain your reasoning."
                className="w-full min-h-[200px] p-4 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y"
                rows={8}
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-slate-500 text-sm">
                  {currentAnswer.length} characters
                </span>
                {currentAnswer.length < 50 && currentAnswer.length > 0 && (
                  <span className="text-yellow-400 text-sm">
                    Try to provide more details (min 50 characters recommended)
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: currentAnswer.trim() ? 1.02 : 1 }}
              whileTap={{ scale: currentAnswer.trim() ? 0.98 : 1 }}
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim() || isSubmitting}
              className={`w-full px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                !currentAnswer.trim() || isSubmitting
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Evaluating your answer...
                </>
              ) : (
                <>
                  Submit Answer
                  <FaArrowRight />
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          /* FEEDBACK CARD */
          <motion.div
            key={`feedback-${currentQuestionIndex}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Score Display */}
            <div className="card-gradient bg-gradient-to-br from-violet-700 to-fuchsia-700 rounded-xl p-6 border border-violet-800 shadow-xl">
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold mb-2 ${
                  currentFeedback?.score >= 80 ? 'text-green-400' :
                  currentFeedback?.score >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {currentFeedback?.score || 0}%
                </div>
                <div className="label-strong text-white text-lg">
                  {currentFeedback?.interviewReadiness || 'Score'}
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-800">
                <h4 className="label-strong text-white mb-2">Feedback:</h4>
                <p className="text-white text-sm leading-relaxed">
                  {currentFeedback?.feedback || 'No feedback available'}
                </p>
              </div>

              {/* Covered Points */}
              {currentFeedback?.coveredPoints && currentFeedback.coveredPoints.length > 0 && (
                <div className="card-colored bg-emerald-600 rounded-lg p-4 mb-4 border border-emerald-700">
                  <h4 className="label-strong text-white mb-2">✓ Points Covered:</h4>
                  <ul className="space-y-1">
                    {currentFeedback.coveredPoints.map((point, index) => (
                      <li key={index} className="text-white text-sm flex items-start gap-2">
                        <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missed Points */}
              {currentFeedback?.missedPoints && currentFeedback.missedPoints.length > 0 && (
                <div className="card-colored bg-rose-600 rounded-lg p-4 mb-4 border border-rose-700">
                  <h4 className="label-strong text-white mb-2">⚠ Points to Improve:</h4>
                  <ul className="space-y-1">
                    {currentFeedback.missedPoints.map((point, index) => (
                      <li key={index} className="text-white text-sm flex items-start gap-2">
                        <span className="text-white flex-shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNextQuestion}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <FaArrowRight />
                  </>
                ) : (
                  <>
                    See Final Results
                    <FaCheckCircle />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewQuestions;
