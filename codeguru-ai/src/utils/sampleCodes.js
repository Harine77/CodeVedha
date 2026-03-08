const sampleCodes = {
  bubbleSort: {
    name: "Bubble Sort",
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

# Example usage
arr = [64, 34, 25, 12, 22, 11, 90]
result = bubble_sort(arr)
print(result)`,
    language: "python",
    expectedComplexity: "O(n²)",
    description: "Classic bubble sort with nested loops"
  },

  binarySearch: {
    name: "Binary Search",
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Example usage
arr = [11, 12, 22, 25, 34, 64, 90]
result = binary_search(arr, 25)
print(result)`,
    language: "python",
    expectedComplexity: "O(log n)",
    description: "Efficient binary search algorithm"
  },

  fibonacci: {
    name: "Fibonacci (Recursive)",
    code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Example usage
result = fibonacci(10)
print(result)`,
    language: "python",
    expectedComplexity: "O(2^n)",
    description: "Recursive fibonacci - exponential time"
  },

  twoSum: {
    name: "Two Sum (HashMap)",
    code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Example usage
nums = [2, 7, 11, 15]
result = two_sum(nums, 9)
print(result)`,
    language: "python",
    expectedComplexity: "O(n)",
    description: "Optimal two sum using hashmap"
  }
};

export default sampleCodes;

export const getSampleCodeNames = () => 
  Object.keys(sampleCodes).map(key => ({
    key,
    name: sampleCodes[key].name
  }));
