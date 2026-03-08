// Mock data for offline testing when Gemini API is unavailable

// MOCK ANALYSIS RESULTS
export const mockAnalysisResults = {
  timeComplexity: {
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)"
  },
  spaceComplexity: "O(1)",
  bottlenecks: [
    { line: 3, reason: "Nested loop causes quadratic time complexity" },
    { line: 4, reason: "Repeated comparison operations in inner loop" },
    { line: 5, reason: "Swap operation executed multiple times" }
  ],
  reasoning: "This bubble sort algorithm uses two nested loops. The outer loop runs n times, and the inner loop runs n-1, n-2... times, resulting in O(n²) time complexity. The best case occurs when the array is already sorted (O(n) with early termination). Space complexity is O(1) as we only use a constant amount of extra space for the swap operation."
};

// MOCK ALGORITHM DETECTION
export const mockDetectedAlgorithms = {
  algorithms: [
    { 
      name: "Bubble Sort", 
      explanation: "Classic comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order"
    }
  ],
  dataStructures: [
    { 
      name: "Array", 
      usage: "Used to store and manipulate collection of elements. Provides O(1) access time but O(n) for insertion/deletion"
    },
    {
      name: "Loop Variables",
      usage: "Integer counters used for iteration control"
    }
  ],
  patterns: [
    { 
      name: "Nested Loops", 
      explanation: "Two loops causing O(n²) complexity - a common pattern in brute-force algorithms"
    },
    {
      name: "In-place Modification",
      explanation: "Algorithm modifies the array directly without using additional data structures"
    }
  ],
  alternatives: [
    { 
      suggestion: "Use QuickSort for average case optimization", 
      improvement: "O(n²) → O(n log n) average case" 
    },
    {
      suggestion: "Use MergeSort for guaranteed performance",
      improvement: "O(n²) → O(n log n) worst case, but requires O(n) space"
    },
    {
      suggestion: "Use built-in sort() method",
      improvement: "Highly optimized implementation (typically Timsort in Python)"
    }
  ]
};

// MOCK OPTIMIZATIONS
export const mockOptimizations = {
  optimizedCode: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = merge_sort(numbers)
print(sorted_numbers)`,
  newComplexity: "O(n log n)",
  tradeoffs: [
    "Uses O(n) additional space for temporary arrays",
    "More complex implementation than bubble sort",
    "Excellent for large datasets (1000+ elements)",
    "Stable sort - maintains relative order of equal elements",
    "Not in-place - requires extra memory"
  ],
  explanation: "Merge sort is a divide-and-conquer algorithm that divides the array into two halves, recursively sorts them, and then merges the sorted halves. This approach achieves O(n log n) time complexity in all cases (best, average, worst). The algorithm divides the array log(n) times and merges n elements at each level, resulting in O(n log n) operations. While it uses more memory than bubble sort, the performance improvement is significant for larger datasets: a 1000-element array would require ~1,000,000 operations with bubble sort vs ~10,000 with merge sort."
};

// MOCK INTERVIEW QUESTIONS
export const mockInterviewQuestions = [
  {
    question: "What is the time complexity of this bubble sort algorithm and why?",
    difficulty: "Easy",
    expectedPoints: [
      "Mentions O(n²) for average and worst case",
      "Explains the nested loop structure",
      "Discusses best case O(n) with optimizations",
      "Identifies the comparison and swap operations as the primary operations"
    ],
    hints: [
      "Consider how many times the inner loop executes",
      "Think about the worst case scenario (reverse sorted array)"
    ]
  },
  {
    question: "How would you optimize this sorting algorithm for better performance?",
    difficulty: "Medium",
    expectedPoints: [
      "Suggests using more efficient algorithms like QuickSort or MergeSort",
      "Mentions O(n log n) time complexity",
      "Explains the trade-offs (e.g., space vs time)",
      "Discusses when to use different sorting algorithms"
    ],
    hints: [
      "Consider divide-and-conquer approaches",
      "Think about the space-time tradeoff"
    ]
  },
  {
    question: "Can you identify any specific bottlenecks in this implementation?",
    difficulty: "Medium",
    expectedPoints: [
      "Points out the nested loops as the main bottleneck",
      "Mentions unnecessary comparisons (could use early termination)",
      "Discusses the swap operation overhead",
      "Suggests adding a 'swapped' flag for optimization"
    ],
    hints: [
      "Look at the loop structure",
      "Consider what happens when the array is already sorted"
    ]
  },
  {
    question: "What is the space complexity of this algorithm and can it be improved?",
    difficulty: "Easy",
    expectedPoints: [
      "Identifies O(1) space complexity",
      "Explains it's an in-place algorithm",
      "Mentions that improving time complexity often requires more space",
      "Discusses the space-time tradeoff principle"
    ],
    hints: [
      "Count how many additional variables are used",
      "Consider whether the algorithm modifies the original array"
    ]
  },
  {
    question: "In what scenarios would bubble sort actually be a good choice?",
    difficulty: "Hard",
    expectedPoints: [
      "Small datasets (< 50 elements)",
      "Nearly sorted arrays (with optimization)",
      "When memory is extremely limited",
      "Educational purposes to teach sorting concepts",
      "When simplicity is more important than performance"
    ],
    hints: [
      "Think about the characteristics of bubble sort",
      "Consider scenarios where O(n²) is acceptable"
    ]
  }
];

// MOCK INTERVIEW FEEDBACK
export const mockInterviewFeedback = {
  score: 75,
  feedback: "Good understanding of the algorithm! You correctly identified the time complexity and explained the nested loop structure. To improve, try discussing more optimization strategies and real-world applications.",
  coveredPoints: [
    "Mentioned O(n²) complexity",
    "Explained nested loops",
    "Identified comparison operations"
  ],
  missedPoints: [
    "Did not discuss best case scenario",
    "Could elaborate on space complexity",
    "Missing mentions of alternative algorithms"
  ],
  interviewReadiness: "Intermediate - Keep practicing algorithm optimization and edge cases"
};

// Helper function to check if mock data should be used
export const shouldUseMockData = () => {
  // Return true if no Gemini API key is set
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !apiKey || apiKey.trim() === '' || apiKey === 'your_api_key_here';
};

// Helper to simulate API delay for realistic testing
export const simulateApiDelay = (ms = 1500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper to get mock data with simulated delay
export const getMockDataWithDelay = async (dataType) => {
  await simulateApiDelay();
  
  switch(dataType) {
    case 'analysis':
      return mockAnalysisResults;
    case 'algorithms':
      return mockDetectedAlgorithms;
    case 'optimizations':
      return mockOptimizations;
    case 'questions':
      return mockInterviewQuestions;
    case 'feedback':
      return mockInterviewFeedback;
    default:
      throw new Error('Unknown data type');
  }
};

// Export all mock data as default
export default {
  mockAnalysisResults,
  mockDetectedAlgorithms,
  mockOptimizations,
  mockInterviewQuestions,
  mockInterviewFeedback,
  shouldUseMockData,
  simulateApiDelay,
  getMockDataWithDelay
};
