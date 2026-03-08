import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ComplexityChart = ({ detectedComplexity = 'O(n)' }) => {
  
  // Normalize complexity string for comparison
  const normalizeComplexity = (complexity) => {
    if (!complexity) return '';
    return complexity.toLowerCase().replace(/\s/g, '');
  };

  // Generate data points for n = 0 to 100
  const generateData = () => {
    const data = [];
    for (let n = 0; n <= 100; n++) {
      const point = {
        n: n,
        'O(1)': 1,
        'O(log n)': n === 0 ? 0 : Math.log2(n),
        'O(n)': n,
        'O(n log n)': n === 0 ? 0 : n * Math.log2(n),
        'O(n²)': n * n,
        'O(2^n)': n <= 20 ? Math.pow(2, n) : null // Cap at n=20 for exponential
      };
      data.push(point);
    }
    return data;
  };

  const data = generateData();

  // Complexity configurations
  const complexities = [
    {
      key: 'O(1)',
      color: '#3B82F6', // blue
      name: 'O(1) - Constant'
    },
    {
      key: 'O(log n)',
      color: '#10B981', // green
      name: 'O(log n) - Logarithmic'
    },
    {
      key: 'O(n)',
      color: '#EAB308', // yellow
      name: 'O(n) - Linear'
    },
    {
      key: 'O(n log n)',
      color: '#F97316', // orange
      name: 'O(n log n) - Linearithmic'
    },
    {
      key: 'O(n²)',
      color: '#EF4444', // red
      name: 'O(n²) - Quadratic'
    },
    {
      key: 'O(2^n)',
      color: '#991B1B', // dark red
      name: 'O(2^n) - Exponential'
    }
  ];

  // Check if a complexity matches the detected one
  const isDetected = (complexityKey) => {
    const normalized = normalizeComplexity(complexityKey);
    const detectedNormalized = normalizeComplexity(detectedComplexity);
    return normalized === detectedNormalized || 
           complexityKey === detectedComplexity ||
           normalized.includes(detectedNormalized) ||
           detectedNormalized.includes(normalized);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-purple-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">Input Size: n = {label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {
                  entry.value !== null 
                    ? entry.value < 1000 
                      ? entry.value.toFixed(2) 
                      : entry.value.toExponential(2)
                    : 'N/A'
                } operations
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => {
          const detected = isDetected(entry.value);
          return (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${
                detected
                  ? 'bg-cyan-600/30 border border-cyan-500/50 scale-110'
                  : 'bg-gray-800/50 border border-gray-700'
              }`}
            >
              <div
                className="w-8 h-1 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span
                className={`text-sm ${
                  detected ? 'text-cyan-300 font-bold' : 'text-gray-300 font-medium'
                }`}
              >
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-xl">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">Big-O Complexity Visualization</h3>
        <p className="text-gray-400 text-sm">
          Compare growth rates of different time complexities
          {detectedComplexity && (
            <span className="ml-2 text-cyan-400 font-semibold">
              (Detected: {detectedComplexity})
            </span>
          )}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          
          <XAxis
            dataKey="n"
            stroke="#9CA3AF"
            label={{ value: 'Input Size (n)', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
          />
          
          <YAxis
            stroke="#9CA3AF"
            label={{ value: 'Operations', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            scale="log"
            domain={[1, 'auto']}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend content={<CustomLegend />} />

          {/* Render lines for each complexity */}
          {complexities.map((complexity) => {
            const detected = isDetected(complexity.key);
            return (
              <Line
                key={complexity.key}
                type="monotone"
                dataKey={complexity.key}
                name={complexity.name}
                stroke={detected ? '#06B6D4' : complexity.color} // Cyan for detected
                strokeWidth={detected ? 4 : 2}
                dot={detected ? { fill: '#06B6D4', r: 3 } : false}
                activeDot={detected ? { r: 6 } : { r: 4 }}
                animationDuration={1500}
                connectNulls={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Info Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {complexities.map((complexity) => {
          const detected = isDetected(complexity.key);
          return (
            <div
              key={complexity.key}
              className={`p-3 rounded-lg border transition-all ${
                detected
                  ? 'bg-cyan-900/30 border-cyan-500/50 scale-105'
                  : 'bg-gray-900/30 border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: detected ? '#06B6D4' : complexity.color }}
                />
                <span className={`font-mono font-semibold ${detected ? 'text-cyan-300' : 'text-gray-300'}`}>
                  {complexity.key}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {complexity.key === 'O(1)' && 'Constant time - Best case'}
                {complexity.key === 'O(log n)' && 'Logarithmic - Binary search'}
                {complexity.key === 'O(n)' && 'Linear - Single pass'}
                {complexity.key === 'O(n log n)' && 'Linearithmic - Merge sort'}
                {complexity.key === 'O(n²)' && 'Quadratic - Nested loops'}
                {complexity.key === 'O(2^n)' && 'Exponential - Recursive fibonacci'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComplexityChart;
