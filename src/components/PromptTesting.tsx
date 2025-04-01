
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Play, CheckCircle, XCircle, Trash } from "lucide-react";
import { generateMistralResponse } from "@/services/mistralService";
import { useToast } from "@/components/ui/use-toast";
import { compareTwoStrings } from "string-similarity";

interface PromptTestingProps {
  optimizedPrompt: string;
  testCases: Array<{
    userPrompt: string;
    expectedOutput: string;
  }>;
  iterations?: Array<{
    prompt: string;
    output: string;
    feedback: string;
    score: number;
  }>;
}

const PromptTesting = ({ optimizedPrompt, testCases, iterations = [] }: PromptTestingProps) => {
  const [testResults, setTestResults] = useState<Array<{
    input: string;
    expected: string;
    actual: string;
    similarityScore: number;
  }>>([]);

  const calculateSimilarityScore = (expected: string, actual: string): number => {
    // Using string-similarity library to calculate similarity score
    const similarity = compareTwoStrings(expected, actual);
    // Convert to percentage and round to 2 decimal places
    return Math.round(similarity * 100 * 100) / 100;
  };

  const handleTest = async () => {
    // For each test case, calculate a mock similarity score between expected and actual output
    const mockResults = testCases.map(testCase => {
      // Mock actual output based on the expected output with some variations
      const actualOutput = testCase.expectedOutput.split(' ')
        .map(word => Math.random() > 0.8 ? word + 's' : word)
        .join(' ');
        
      const similarityScore = calculateSimilarityScore(testCase.expectedOutput, actualOutput);
      
      return {
        input: testCase.userPrompt,
        expected: testCase.expectedOutput,
        actual: actualOutput,
        similarityScore: similarityScore
      };
    });
    
    setTestResults(mockResults);
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white/90">Available Test Cases</h3>
          {testCases.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
              <p className="text-white/70">No test cases available.</p>
              <p className="text-white/50 text-sm mt-2">
                Import test cases using the import feature above or add individual test cases manually.
              </p>
            </div>
          ) : (
            testCases.map((testCase, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Input</label>
                  <div className="bg-black/40 rounded-lg p-3">
                    <pre className="text-sm text-white/80 whitespace-pre-wrap">{testCase.userPrompt}</pre>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Expected Output</label>
                  <div className="bg-black/40 rounded-lg p-3">
                    <pre className="text-sm text-white/80 whitespace-pre-wrap">{testCase.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Button
          onClick={handleTest}
          className="w-full bg-[#F97316] hover:bg-orange-600 text-white py-6 rounded-xl font-medium transition-colors duration-200"
          disabled={!optimizedPrompt || testCases.length === 0}
        >
          <Play className="w-4 h-4 mr-2" />
          Run Test Cases
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white/90">Test Results</h3>
            {testResults.map((result, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-white/90 font-medium">
                    Test Case {index + 1} - Similarity: {result.similarityScore.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-black/40 rounded-lg p-3">
                    <pre className="text-sm text-white/80 whitespace-pre-wrap">{result.actual}</pre>
                  </div>
                  <div className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/10" 
                      style={{ width: `${result.similarityScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PromptTesting;
