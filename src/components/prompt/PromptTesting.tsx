
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

const PromptTesting = ({ optimizedPrompt, testCases: initialTestCases, iterations = [] }: PromptTestingProps) => {
  const { toast } = useToast();
  const [customTestCases, setCustomTestCases] = useState<Array<{
    userPrompt: string;
    expectedOutput: string;
  }>>(initialTestCases);
  
  const [newTestCase, setNewTestCase] = useState({
    userPrompt: "",
    expectedOutput: ""
  });
  
  const [testResults, setTestResults] = useState<Array<{
    input: string;
    expected: string;
    actual: string;
    similarityScore: number;
  }>>([]);
  
  const [isRunningTests, setIsRunningTests] = useState(false);

  const addNewTestCase = () => {
    if (newTestCase.userPrompt.trim() && newTestCase.expectedOutput.trim()) {
      setCustomTestCases([...customTestCases, newTestCase]);
      setNewTestCase({ userPrompt: "", expectedOutput: "" });
    }
  };

  const removeTestCase = (index: number) => {
    setCustomTestCases(customTestCases.filter((_, i) => i !== index));
    setTestResults(testResults.filter((_, i) => i !== index));
  };

  const formatFeedbackHistory = () => {
    if (iterations.length === 0) return "";
    
    return iterations.map((iter, idx) => 
      `- Feedback ${idx + 1} (Score: ${iter.score}/5): ${iter.feedback}`
    ).join('\n');
  };

  const formatTrainingExamples = () => {
    if (iterations.length === 0) return "";
    
    return iterations.map((iter, idx) => 
      `Example ${idx + 1}:
Initial Input: "${iter.prompt}"
Expected Output: "${iter.output}"
Feedback: "${iter.feedback}"
Score: ${iter.score}/5`
    ).join('\n\n');
  };

  const calculateSimilarityScore = (expected: string, actual: string): number => {
    // Using string-similarity library to calculate similarity score
    const similarity = compareTwoStrings(expected, actual);
    // Convert to percentage and round to 2 decimal places
    return Math.round(similarity * 100 * 100) / 100;
  };

  const runTests = async () => {
    const apiKey = localStorage.getItem('mistralApiKey');
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Mistral API key first.",
        variant: "destructive",
      });
      return;
    }

    if (!optimizedPrompt) {
      toast({
        title: "Missing Optimized Prompt",
        description: "Please complete the training phase to generate an optimized prompt.",
        variant: "destructive",
      });
      return;
    }

    setIsRunningTests(true);
    const newResults = [];
    
    try {
      const trainingExamples = formatTrainingExamples();
      
      for (let i = 0; i < customTestCases.length; i++) {
        const testCase = customTestCases[i];
        const feedbackSummary = formatFeedbackHistory();
        
        const executionPrompt = `
Generate an appropriate response based on the following information:

Initial Prompt: "${testCase.userPrompt}"
Expected Output Format: "${testCase.expectedOutput}"

${feedbackSummary ? `User Feedback History:\n${feedbackSummary}\n` : ''}
${trainingExamples ? `Training Examples (Learn from these patterns):\n${trainingExamples}\n\n` : ''}

Your response should:
- Follow the format and style defined in the expected output
- Ensure consistent structure matching the expected output pattern
- Be precise and concise in the response
- Address all the feedback points from the User Feedback History
- Apply patterns learned from the training examples

Please generate a response that fulfills these requirements based on the initial prompt: "${testCase.userPrompt}"`;

        const response = await generateMistralResponse(executionPrompt, apiKey);
        const similarityScore = calculateSimilarityScore(testCase.expectedOutput, response);
        
        newResults.push({
          input: testCase.userPrompt,
          expected: testCase.expectedOutput,
          actual: response,
          similarityScore: similarityScore
        });
      }
      
      setTestResults(newResults);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run test cases with Mistral API.",
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const calculateAverageScore = () => {
    if (testResults.length === 0) {
      return null;
    }
    
    const sum = testResults.reduce((acc, result) => acc + result.similarityScore, 0);
    return (sum / testResults.length).toFixed(1);
  };

  const averageScore = calculateAverageScore();

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white/90">Custom Test Cases</h3>
            {testResults.length > 0 && averageScore && (
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm">Average Similarity:</span>
                <span className="font-bold text-white bg-white/10 rounded-full px-3 py-1">
                  {averageScore}%
                </span>
              </div>
            )}
          </div>
          
          {customTestCases.map((testCase, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-white/90 font-medium">Test Case {index + 1}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeTestCase(index)}
                  className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-red-500/20"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
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

              {testResults[index] && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/70">Actual Output</label>
                    <div className="bg-black/40 rounded-lg p-3">
                      <pre className="text-sm text-white/80 whitespace-pre-wrap">{testResults[index].actual}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/70">Similarity Score</label>
                    <div className="bg-gradient-to-r from-red-500 to-green-500 h-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white/10" 
                        style={{ width: `${testResults[index].similarityScore}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-white/60 text-center">
                      {testResults[index].similarityScore}%
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          <div className="bg-white/5 rounded-xl p-4 border border-dashed border-white/10 space-y-3">
            <h4 className="text-white/90 font-medium">Add New Test Case</h4>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Input</label>
              <Textarea
                value={newTestCase.userPrompt}
                onChange={(e) => setNewTestCase({...newTestCase, userPrompt: e.target.value})}
                placeholder="Enter test input..."
                className="min-h-[80px] bg-black/30 border-white/10 rounded-lg text-white placeholder:text-white/40"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Expected Output</label>
              <Textarea
                value={newTestCase.expectedOutput}
                onChange={(e) => setNewTestCase({...newTestCase, expectedOutput: e.target.value})}
                placeholder="Enter expected output..."
                className="min-h-[80px] bg-black/30 border-white/10 rounded-lg text-white placeholder:text-white/40"
              />
            </div>
            
            <Button
              onClick={addNewTestCase}
              variant="outline"
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
              disabled={!newTestCase.userPrompt || !newTestCase.expectedOutput}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Test Case
            </Button>
          </div>
        </div>

        <Button
          onClick={runTests}
          className="w-full bg-[#F97316] hover:bg-orange-600 text-white py-6 rounded-xl font-medium transition-colors duration-200"
          disabled={isRunningTests || !optimizedPrompt || customTestCases.length === 0}
        >
          {isRunningTests ? (
            <>Running Tests<span className="animate-pulse">...</span></>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Test Cases
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default PromptTesting;
