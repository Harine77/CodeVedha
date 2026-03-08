import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaRedo, FaExpand, FaCompress } from 'react-icons/fa';

const DEFAULTS = {
  bubble_sort: [64, 34, 25, 12, 22, 11, 90],
  binary_search: { array: [11, 12, 22, 25, 34, 64, 90], target: 25 },
  tree_traversal: { traversal: 'inorder' },
  recursion: { n: 5 },
  dynamic_programming: { n: 5 }
};

const TREE_LAYOUT = {
  8: { x: 50, y: 14 },
  3: { x: 30, y: 34 },
  10: { x: 70, y: 34 },
  1: { x: 18, y: 54 },
  6: { x: 40, y: 54 },
  14: { x: 82, y: 54 },
  4: { x: 34, y: 74 },
  7: { x: 46, y: 74 },
  13: { x: 76, y: 74 }
};

const TREE_EDGES = [
  [8, 3], [8, 10], [3, 1], [3, 6], [6, 4], [6, 7], [10, 14], [14, 13]
];

const TREE_NODE_RADIUS = 4.2;
const RECURSION_NODE_RADIUS = 4.0;

const getEdgePoints = (parentNode, childNode, radius) => ({
  x1: parentNode.x,
  y1: parentNode.y + radius,
  x2: childNode.x,
  y2: childNode.y - radius
});

const inferAlgorithm = (label = '', sourceCode = '') => {
  const lower = label.toLowerCase();
  const normalizedCode = sourceCode.toLowerCase();

  const recursionRegexes = [
    /def\s+([a-zA-Z_]\w*)\s*\([^)]*\)[\s\S]*?\b\1\s*\(/m,
    /function\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{[\s\S]*?\b\1\s*\(/m,
    /const\s+([a-zA-Z_]\w*)\s*=\s*\([^)]*\)\s*=>[\s\S]*?\b\1\s*\(/m
  ];

  const isDP =
    /\bmemo\b|\bcache\b|\bdp\b/.test(normalizedCode) ||
    /dp\s*\[\s*\w+\s*\]/.test(normalizedCode) ||
    /for\s+\w+\s+in\s+range\([^)]*\)[\s\S]*dp\s*\[/.test(normalizedCode) ||
    /for\s*\([^)]*\)[\s\S]*dp\s*\[/.test(normalizedCode);

  if (isDP || lower.includes('dynamic') || lower.includes('memoization') || lower.includes('dp')) {
    return 'dynamic_programming';
  }

  if (recursionRegexes.some((regex) => regex.test(sourceCode)) || lower.includes('recursion') || lower.includes('recursive')) {
    return 'recursion';
  }

  if (lower.includes('tree') || lower.includes('dfs') || lower.includes('traversal') || lower.includes('bst')) {
    return 'tree_traversal';
  }

  if (lower.includes('graph')) {
    return 'graph';
  }

  if (lower.includes('binary')) {
    return 'binary_search';
  }

  return 'bubble_sort';
};

const buildBubbleSortSteps = (arr) => {
  const steps = [];
  const temp = [...arr];
  const n = temp.length;

  steps.push({ action: 'start', description: 'Starting Bubble Sort', array: [...temp], comparing: [] });

  for (let i = 0; i < n - 1; i += 1) {
    for (let j = 0; j < n - i - 1; j += 1) {
      steps.push({
        action: 'compare',
        description: `Comparing ${temp[j]} and ${temp[j + 1]}`,
        array: [...temp],
        comparing: [j, j + 1],
        pass: i + 1
      });

      if (temp[j] > temp[j + 1]) {
        [temp[j], temp[j + 1]] = [temp[j + 1], temp[j]];
        steps.push({
          action: 'swap',
          description: `Swapped ${temp[j + 1]} and ${temp[j]}`,
          array: [...temp],
          comparing: [j, j + 1],
          pass: i + 1
        });
      }
    }

    steps.push({
      action: 'sorted',
      description: `Element at index ${n - i - 1} is now fixed`,
      array: [...temp],
      sortedIndex: n - i - 1,
      pass: i + 1
    });
  }

  steps.push({ action: 'complete', description: 'Sorting complete', array: [...temp], comparing: [] });
  return steps;
};

const buildBinarySearchSteps = (arr, target) => {
  const steps = [];
  let left = 0;
  let right = arr.length - 1;

  steps.push({ action: 'start', description: `Searching for ${target}`, array: [...arr], left, right, mid: -1 });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      action: 'check',
      description: `Checking middle value ${arr[mid]} at index ${mid}`,
      array: [...arr],
      left,
      right,
      mid
    });

    if (arr[mid] === target) {
      steps.push({ action: 'found', description: `Found ${target} at index ${mid}`, array: [...arr], left, right, mid, found: true });
      return steps;
    }

    if (arr[mid] < target) {
      steps.push({ action: 'shift_right', description: `${arr[mid]} < ${target}, move right`, array: [...arr], left, right, mid });
      left = mid + 1;
    } else {
      steps.push({ action: 'shift_left', description: `${arr[mid]} > ${target}, move left`, array: [...arr], left, right, mid });
      right = mid - 1;
    }
  }

  steps.push({ action: 'not_found', description: `${target} not found`, array: [...arr], left: -1, right: -1, mid: -1 });
  return steps;
};

const buildTreeSteps = (traversal = 'inorder') => {
  const orders = {
    inorder: [1, 3, 4, 6, 7, 8, 10, 13, 14],
    preorder: [8, 3, 1, 6, 4, 7, 10, 14, 13],
    postorder: [1, 4, 7, 6, 3, 13, 14, 10, 8]
  };

  const sequence = orders[traversal] || orders.inorder;
  const steps = [{
    action: 'start',
    traversal,
    current: null,
    visited: [],
    description: `Starting ${traversal} traversal`
  }];

  sequence.forEach((nodeValue, index) => {
    steps.push({
      action: 'visit',
      traversal,
      current: nodeValue,
      visited: sequence.slice(0, index + 1),
      description: `Visit node ${nodeValue}`
    });
  });

  steps.push({
    action: 'complete',
    traversal,
    current: null,
    visited: sequence,
    description: `${traversal} traversal complete`
  });

  return steps;
};

const buildRecursionFibVisualization = (nInput) => {
  const n = Math.max(1, Math.min(8, Number(nInput) || DEFAULTS.recursion.n));
  let idCounter = 0;

  const createNode = (value, parentId = null, depth = 0) => {
    const node = {
      id: ++idCounter,
      n: value,
      label: `fib(${value})`,
      parentId,
      depth,
      children: [],
      result: value <= 1 ? value : null,
      x: 0,
      y: 0
    };

    if (value > 1) {
      node.children.push(createNode(value - 1, node.id, depth + 1));
      node.children.push(createNode(value - 2, node.id, depth + 1));
      node.result = node.children[0].result + node.children[1].result;
    }

    return node;
  };

  const root = createNode(n);

  const countLeaves = (node) => {
    if (!node.children.length) return 1;
    return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
  };

  const getMaxDepth = (node) => {
    if (!node.children.length) return node.depth;
    return Math.max(...node.children.map(getMaxDepth));
  };

  const leafCount = countLeaves(root);
  const maxDepth = getMaxDepth(root);
  let nextLeaf = 1;

  const xStep = 100 / (leafCount + 1);
  const yStep = 82 / (maxDepth + 1 || 1);

  const assignPositions = (node) => {
    if (!node.children.length) {
      node.x = nextLeaf * xStep;
      nextLeaf += 1;
    } else {
      node.children.forEach(assignPositions);
      node.x = node.children.reduce((sum, child) => sum + child.x, 0) / node.children.length;
    }
    node.y = 8 + node.depth * yStep;
  };

  assignPositions(root);

  const nodes = [];
  const edges = [];

  const flatten = (node) => {
    nodes.push(node);
    node.children.forEach((child) => {
      edges.push({ from: node.id, to: child.id });
      flatten(child);
    });
  };

  flatten(root);

  const nodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]));

  const steps = [{
    action: 'start',
    description: `Starting recursion call tree for fib(${n})`,
    visibleIds: [],
    resolvedIds: [],
    activeId: null,
    returnValue: null
  }];

  const visible = new Set();
  const resolved = new Set();

  const snapshot = (payload) => ({
    ...payload,
    visibleIds: [...visible],
    resolvedIds: [...resolved]
  });

  const traverse = (node) => {
    visible.add(node.id);
    steps.push(snapshot({
      action: 'call',
      description: `Call ${node.label}`,
      activeId: node.id,
      returnValue: null
    }));

    node.children.forEach(traverse);

    resolved.add(node.id);
    steps.push(snapshot({
      action: 'return',
      description: `${node.label} returns ${node.result}`,
      activeId: node.id,
      returnValue: node.result
    }));
  };

  traverse(root);

  steps.push(snapshot({
    action: 'complete',
    description: `Completed recursion: fib(${n}) = ${root.result}`,
    activeId: root.id,
    returnValue: root.result
  }));

  return {
    n,
    nodes,
    edges,
    nodeMap,
    steps,
    rootResult: root.result
  };
};

const buildDPSteps = (nInput) => {
  const n = Math.max(1, Math.min(25, Number(nInput) || DEFAULTS.dynamic_programming.n));
  const dp = new Array(n + 1).fill(null);
  const steps = [{
    action: 'start',
    description: `Starting DP table build for n = ${n}`,
    array: [...dp],
    current: null,
    formula: null
  }];

  dp[0] = 0;
  steps.push({
    action: 'base',
    description: 'Base case: dp[0] = 0',
    array: [...dp],
    current: 0,
    formula: 'dp[0] = 0'
  });

  if (n >= 1) {
    dp[1] = 1;
    steps.push({
      action: 'base',
      description: 'Base case: dp[1] = 1',
      array: [...dp],
      current: 1,
      formula: 'dp[1] = 1'
    });
  }

  for (let i = 2; i <= n; i += 1) {
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({
      action: 'fill',
      description: `Compute dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i]}`,
      array: [...dp],
      current: i,
      formula: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}]`
    });
  }

  steps.push({
    action: 'complete',
    description: `DP complete: fib(${n}) = ${dp[n]}`,
    array: [...dp],
    current: n,
    formula: `answer = dp[${n}] = ${dp[n]}`
  });

  return { n, steps };
};

const AlgorithmAnimation = ({ algorithm = 'bubble_sort', inputData = null, sourceCode = '' }) => {
  const containerRef = useRef(null);

  const [selectedAlgorithm, setSelectedAlgorithm] = useState(inferAlgorithm(algorithm, sourceCode));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [traversalType, setTraversalType] = useState('inorder');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [parameterValue, setParameterValue] = useState('5');
  const [recursionScene, setRecursionScene] = useState({ nodes: [], edges: [], nodeMap: {}, n: 5, rootResult: 5 });

  useEffect(() => {
    setSelectedAlgorithm(inferAlgorithm(algorithm, sourceCode));
  }, [algorithm, sourceCode]);

  useEffect(() => {
    if (selectedAlgorithm === 'recursion' || selectedAlgorithm === 'dynamic_programming') {
      setParameterValue(String(5));
    }
    if (selectedAlgorithm === 'binary_search') {
      setParameterValue(String(DEFAULTS.binary_search.target));
    }
  }, [selectedAlgorithm]);

  const initialize = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setSortedIndices([]);

    if (selectedAlgorithm === 'bubble_sort') {
      const data = Array.isArray(inputData) ? inputData : DEFAULTS.bubble_sort;
      setSteps(buildBubbleSortSteps(data));
      return;
    }

    if (selectedAlgorithm === 'binary_search') {
      const payload = inputData?.array ? inputData : DEFAULTS.binary_search;
      const target = Number(parameterValue);
      const resolvedTarget = Number.isFinite(target) ? target : payload.target;
      setSteps(buildBinarySearchSteps(payload.array, resolvedTarget));
      return;
    }

    if (selectedAlgorithm === 'tree_traversal') {
      setSteps(buildTreeSteps(traversalType));
      return;
    }

    if (selectedAlgorithm === 'recursion') {
      const scene = buildRecursionFibVisualization(parameterValue);
      setRecursionScene(scene);
      setSteps(scene.steps);
      return;
    }

    if (selectedAlgorithm === 'dynamic_programming') {
      const dp = buildDPSteps(parameterValue);
      setSteps(dp.steps);
      return;
    }

    setSteps([{ action: 'start', description: 'Graph visualization is planned for a future update.' }]);
  }, [inputData, parameterValue, selectedAlgorithm, traversalType]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentStep((previous) => {
        const next = previous + 1;
        if (next >= steps.length - 1) {
          setIsPlaying(false);
        }

        if (steps[next]?.sortedIndex !== undefined) {
          setSortedIndices((old) => [...old, steps[next].sortedIndex]);
        }

        return Math.min(next, steps.length - 1);
      });
    }, 900 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps, speed]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  const step = steps[currentStep] || {};

  const recursionVisibleSet = useMemo(() => new Set(step.visibleIds || []), [step.visibleIds]);
  const recursionResolvedSet = useMemo(() => new Set(step.resolvedIds || []), [step.resolvedIds]);

  return (
    <div
      ref={containerRef}
      className={`bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-xl p-6 border border-cyan-200 shadow-sm ${
        isFullscreen ? 'h-screen overflow-auto' : ''
      }`}
    >
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            {!isPlaying ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsPlaying(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all"
              >
                <FaPlay /> Play
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsPlaying(false)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all"
              >
                <FaPause /> Pause
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={initialize}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-all"
            >
              <FaRedo /> Restart
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </motion.button>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-slate-700 text-sm font-medium">Speed:</label>
            {[0.5, 1, 2].map((value) => (
              <button
                key={value}
                onClick={() => setSpeed(value)}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                  speed === value
                    ? 'bg-violet-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {value}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-slate-700 text-sm font-medium">Animation:</label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className="px-4 py-2 bg-white text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="bubble_sort">Sorting</option>
              <option value="binary_search">Binary Search</option>
              <option value="tree_traversal">Tree</option>
              <option value="recursion">Recursion</option>
              <option value="dynamic_programming">Dynamic Programming</option>
              <option value="graph">Graph (Coming Soon)</option>
            </select>
          </div>

          {(selectedAlgorithm === 'recursion' || selectedAlgorithm === 'dynamic_programming') && (
            <div className="flex items-center gap-2">
              <label className="text-slate-700 text-sm font-medium">Input value:</label>
              <input
                type="number"
                min="1"
                max={selectedAlgorithm === 'recursion' ? 8 : 25}
                value={parameterValue}
                onChange={(e) => setParameterValue(e.target.value)}
                className="w-24 px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={initialize}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold"
              >
                Run Visualization
              </button>
            </div>
          )}

          {selectedAlgorithm === 'tree_traversal' && (
            <div className="flex items-center gap-3">
              <label className="text-slate-700 text-sm font-medium">Traversal:</label>
              <select
                value={traversalType}
                onChange={(e) => setTraversalType(e.target.value)}
                className="px-4 py-2 bg-white text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="inorder">Inorder</option>
                <option value="preorder">Preorder</option>
                <option value="postorder">Postorder</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 bg-white rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-violet-700 font-semibold text-sm">Step {Math.min(currentStep + 1, steps.length)} / {steps.length || 1}</span>
          <span className="text-slate-500 text-sm uppercase tracking-wide">{selectedAlgorithm.replace('_', ' ')}</span>
        </div>
        <p className="text-slate-700 text-sm">{step.description || 'Ready to animate algorithm behavior.'}</p>
        {step.formula && <p className="text-violet-700 font-mono text-sm mt-1">{step.formula}</p>}
      </div>

      <div className={`${isFullscreen ? 'min-h-[75vh]' : 'min-h-[320px]'} bg-white rounded-xl p-6 border border-slate-200`}>
        {selectedAlgorithm === 'bubble_sort' && (
          <div className="flex items-end justify-center gap-2 h-64">
            {(step.array || DEFAULTS.bubble_sort).map((value, index) => {
              const comparing = step.comparing?.includes(index);
              const sorted = sortedIndices.includes(index) || step.action === 'complete';
              return (
                <div key={`${index}-${value}`} className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: comparing ? 1.08 : 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ height: `${value * 2.2}px` }}
                    className={`w-12 rounded-t-md ${sorted ? 'bg-emerald-500' : comparing ? 'bg-amber-400' : 'bg-sky-500'}`}
                  />
                  <span className="text-xs mt-2 text-slate-700 font-mono">{value}</span>
                </div>
              );
            })}
          </div>
        )}

        {selectedAlgorithm === 'binary_search' && (
          <div className="space-y-6">
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {(step.array || DEFAULTS.binary_search.array).map((value, index) => {
                const inRange = step.left !== undefined && index >= step.left && index <= step.right;
                const isMid = index === step.mid;
                const found = step.found && isMid;

                return (
                  <motion.div
                    key={index}
                    animate={{ scale: isMid ? 1.12 : 1, opacity: inRange || found ? 1 : 0.35 }}
                    className={`w-14 h-14 flex items-center justify-center rounded-md text-sm font-bold border ${
                      found
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : isMid
                        ? 'bg-amber-400 text-slate-900 border-amber-500'
                        : inRange
                        ? 'bg-sky-500 text-white border-sky-600'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {value}
                  </motion.div>
                );
              })}
            </div>
            <p className="text-center text-slate-700">
              Target: <span className="font-mono font-bold text-violet-700">{Number.isFinite(Number(parameterValue)) ? Number(parameterValue) : DEFAULTS.binary_search.target}</span>
            </p>
          </div>
        )}

        {selectedAlgorithm === 'tree_traversal' && (
          <div className="space-y-5">
            <div className={`${isFullscreen ? 'h-[70vh]' : 'h-72'} relative rounded-lg bg-slate-50 border border-slate-200 overflow-hidden`}>
              <svg viewBox="0 0 100 90" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
                {TREE_EDGES.map(([from, to]) => {
                  const parentNode = TREE_LAYOUT[from];
                  const childNode = TREE_LAYOUT[to];
                  const edge = getEdgePoints(parentNode, childNode, TREE_NODE_RADIUS);

                  return (
                    <line
                      key={`${from}-${to}`}
                      x1={edge.x1}
                      y1={edge.y1}
                      x2={edge.x2}
                      y2={edge.y2}
                      stroke="#94a3b8"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  );
                })}

                {Object.entries(TREE_LAYOUT).map(([nodeValue, pos]) => {
                  const value = Number(nodeValue);
                  const visited = step.visited?.includes(value);
                  const current = step.current === value;
                  const nodeFill = current ? '#fbbf24' : visited ? '#10b981' : '#ffffff';
                  const nodeStroke = current ? '#d97706' : visited ? '#059669' : '#94a3b8';
                  const textColor = current || visited ? '#ffffff' : '#334155';

                  return (
                    <g key={nodeValue} transform={`translate(${pos.x} ${pos.y})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={current ? TREE_NODE_RADIUS + 0.7 : TREE_NODE_RADIUS}
                        fill={nodeFill}
                        stroke={nodeStroke}
                        strokeWidth={current ? '1.6' : '1'}
                      />
                      <text
                        x="0"
                        y="0.9"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={textColor}
                        fontSize="4.2"
                        fontWeight="700"
                      >
                        {nodeValue}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-sm text-slate-600 mb-1">Traversal output ({traversalType}):</p>
              <p className="font-mono text-violet-700 text-sm">
                {step.visited?.length ? step.visited.join(' -> ') : 'No nodes visited yet'}
              </p>
            </div>
          </div>
        )}

        {selectedAlgorithm === 'recursion' && (
          <div className="space-y-4">
            <div className={`${isFullscreen ? 'h-[68vh]' : 'h-80'} relative rounded-lg bg-slate-50 border border-slate-200 overflow-hidden`}>
              <svg viewBox="0 0 100 90" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
                {recursionScene.edges.map((edge) => {
                  if (!recursionVisibleSet.has(edge.from) || !recursionVisibleSet.has(edge.to)) {
                    return null;
                  }
                  const fromNode = recursionScene.nodeMap[edge.from];
                  const toNode = recursionScene.nodeMap[edge.to];
                  const points = getEdgePoints(fromNode, toNode, RECURSION_NODE_RADIUS);
                  return (
                    <line
                      key={`${edge.from}-${edge.to}`}
                      x1={points.x1}
                      y1={points.y1}
                      x2={points.x2}
                      y2={points.y2}
                      stroke="#94a3b8"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  );
                })}

                {recursionScene.nodes.map((node) => {
                  if (!recursionVisibleSet.has(node.id)) {
                    return null;
                  }

                  const isActive = step.activeId === node.id;
                  const isResolved = recursionResolvedSet.has(node.id);
                  const fill = isActive ? '#f59e0b' : isResolved ? '#10b981' : '#38bdf8';

                  return (
                    <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={RECURSION_NODE_RADIUS}
                        fill={fill}
                        stroke={isResolved ? '#059669' : '#0f172a'}
                        strokeWidth={isActive ? '1.5' : '1'}
                      />
                      <text
                        x="0"
                        y="0.7"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="2.5"
                        fontWeight="700"
                      >
                        {node.n}
                      </text>
                      <text
                        x="0"
                        y={RECURSION_NODE_RADIUS + 2.3}
                        textAnchor="middle"
                        fill="#334155"
                        fontSize="2.2"
                        fontWeight="600"
                      >
                        {node.label}
                      </text>
                      {isResolved && (
                        <text
                          x="0"
                          y={RECURSION_NODE_RADIUS + 4.7}
                          textAnchor="middle"
                          fill="#059669"
                          fontSize="2.2"
                          fontWeight="700"
                        >
                          ret={node.result}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-sm text-slate-600">Default example uses Fibonacci recursion with n = {recursionScene.n}.</p>
              {step.returnValue !== null && (
                <p className="text-sm font-semibold text-emerald-700 mt-1">Current return value: {step.returnValue}</p>
              )}
            </div>
          </div>
        )}

        {selectedAlgorithm === 'dynamic_programming' && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-3">Default example uses DP Fibonacci with n = {Math.max(1, Number(parameterValue) || 5)}.</p>
              <div className="flex flex-wrap gap-2">
                {(step.array || []).map((value, index) => {
                  const isCurrent = step.current === index;
                  const isFilled = value !== null;
                  return (
                    <div
                      key={index}
                      className={`w-16 h-16 rounded-lg border flex flex-col items-center justify-center ${
                        isCurrent
                          ? 'bg-amber-100 border-amber-400'
                          : isFilled
                          ? 'bg-emerald-100 border-emerald-400'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      <span className="text-[11px] text-slate-600 font-semibold">dp[{index}]</span>
                      <span className={`font-mono font-bold ${isFilled ? 'text-slate-800' : 'text-slate-400'}`}>
                        {value ?? '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedAlgorithm === 'graph' && (
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-600 font-semibold">Graph visualization is planned for a future update.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgorithmAnimation;
