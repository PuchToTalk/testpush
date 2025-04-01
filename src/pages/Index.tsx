
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TestCase from "@/components/TestCase";
import FeedbackSection from "@/components/prompt/FeedbackSection";
import OptimizedPrompt from "@/components/prompt/OptimizedPrompt";
import PromptTesting from "@/components/PromptTesting";
import { ApiKeyForm } from "@/components/prompt/ApiKeyForm";
import ImportTestCases from "@/components/prompt/ImportTestCases";
import { generateMistralResponse } from "@/services/mistralService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

const Index = () => {
  const { toast } = useToast();
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [iterations, setIterations] = useState<Array<{
    prompt: string;
    output: string;
    feedback: string;
    score: number;
  }>>([]);
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [trainingCases, setTrainingCases] = useState<Array<{
    userPrompt: string;
    expectedOutput: string;
  }>>([]);
  const [testingCases, setTestingCases] = useState<Array<{
    userPrompt: string;
    expectedOutput: string;
  }>>([]);
  const [activeTab, setActiveTab] = useState("training");
  const [currentExpectedOutput, setCurrentExpectedOutput] = useState("");
  const [activeTrainingCase, setActiveTrainingCase] = useState(0);

  const handleRun = async (userPrompt: string, expectedOutput: string) => {
    const apiKey = localStorage.getItem('mistralApiKey');
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Mistral API key first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await generateMistralResponse(userPrompt, apiKey);
      setGeneratedOutput(response);
      setCurrentPrompt(userPrompt);
      setCurrentExpectedOutput(expectedOutput);
      
      // Add to training cases if not already present
      if (!trainingCases.some(tc => tc.userPrompt === userPrompt)) {
        setTrainingCases([...trainingCases, { userPrompt, expectedOutput }]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate response from Mistral API. Please check your API key and try again.",
        variant: "destructive",
      });
    }
  };

  const handleRunAllTests = async () => {
    const apiKey = localStorage.getItem('mistralApiKey');
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Mistral API key first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Run the first case if we haven't run any yet
      if (trainingCases.length > 0 && !generatedOutput) {
        const firstCase = trainingCases[activeTrainingCase];
        await handleRun(firstCase.userPrompt, firstCase.expectedOutput);
      }

      toast({
        title: "Running Tests",
        description: `Started test run for ${trainingCases.length} training cases`,
      });
      
      // Future implementation could run all tests sequentially
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run all tests. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = async (feedback: string, score: number) => {
    const apiKey = localStorage.getItem('mistralApiKey');
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Mistral API key first.",
        variant: "destructive",
      });
      return;
    }

    const newIterations = [...iterations, {
      prompt: currentPrompt,
      output: generatedOutput,
      feedback,
      score,
    }];
    setIterations(newIterations);

    if (score === 5) {
      setOptimizedPrompt(currentPrompt);
    } else {
      try {
        const improvementPrompt = `
Initial Prompt: ${currentPrompt}
Generated Output: ${generatedOutput}
User Feedback (Score ${score}/5): ${feedback}
Expected Quality Level: The output should be improved based on the feedback.

Please provide an improved version of the output that addresses the feedback.`;

        const improvedOutput = await generateMistralResponse(improvementPrompt, apiKey);
        setGeneratedOutput(improvedOutput);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate improved response. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleImportTestCases = (allCases: Array<{ userPrompt: string; expectedOutput: string }>, trainingCount: number) => {
    const trainingSet = allCases.slice(0, trainingCount);
    const testingSet = allCases.slice(trainingCount);
    
    setTrainingCases(trainingSet);
    setTestingCases(testingSet);
    
    // Set the current prompt and expected output to the first training case if available
    if (trainingSet.length > 0) {
      const firstCase = trainingSet[0];
      setCurrentPrompt(firstCase.userPrompt);
      setCurrentExpectedOutput(firstCase.expectedOutput);
      setActiveTrainingCase(0);
      
      // Don't automatically run the test, just set up the UI
      setGeneratedOutput("");
    }
    
    setActiveTab("training");
    
    toast({
      title: "Test Cases Ready",
      description: `${trainingSet.length} cases for training and ${testingSet.length} cases for testing`,
    });
  };

  const handleAddTrainingCase = () => {
    setTrainingCases([...trainingCases, { userPrompt: "", expectedOutput: "" }]);
    setActiveTrainingCase(trainingCases.length);
    setCurrentPrompt("");
    setCurrentExpectedOutput("");
    setGeneratedOutput("");
  };

  const handleSelectTrainingCase = (index: number) => {
    const selectedCase = trainingCases[index];
    setActiveTrainingCase(index);
    setCurrentPrompt(selectedCase.userPrompt);
    setCurrentExpectedOutput(selectedCase.expectedOutput);
    setGeneratedOutput(""); // Clear previous output when switching cases
  };

  const handleUpdateTrainingCase = (index: number, updatedCase: { userPrompt: string; expectedOutput: string }) => {
    const updatedCases = [...trainingCases];
    updatedCases[index] = updatedCase;
    setTrainingCases(updatedCases);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] dark:bg-[#0F0F0F] text-white p-4 md:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-orange-500 mb-8">
          Prompt Refinement Garden
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
          <div className="space-y-8">
            <ApiKeyForm />
            <ImportTestCases onImport={handleImportTestCases} />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-black/40 border-b border-white/10 p-0 h-12">
                <TabsTrigger 
                  value="training" 
                  className="px-8 h-full data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-none border-r border-white/10"
                >
                  Training ({trainingCases.length} Test Cases)
                </TabsTrigger>
                <TabsTrigger 
                  value="testing"
                  className="px-8 h-full data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-none border-r border-white/10"
                >
                  Testing ({testingCases.length} Test Cases)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="training" className="mt-6 space-y-8">
                {trainingCases.length > 0 && (
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {trainingCases.map((testCase, index) => (
                      <Card 
                        key={index}
                        className={`p-4 cursor-pointer transition-all hover:bg-white/10 ${index === activeTrainingCase ? 'border-[#F97316] bg-white/10' : 'bg-black/40 border-white/10'}`}
                        onClick={() => handleSelectTrainingCase(index)}
                      >
                        <div className="line-clamp-3 text-sm text-white/80">
                          <span className="font-medium text-white/90">Case {index + 1}:</span> {testCase.userPrompt || "Empty prompt"}
                        </div>
                      </Card>
                    ))}
                    <Button 
                      variant="outline" 
                      className="h-full min-h-[100px] border-dashed border-white/20 bg-black/40 hover:bg-white/10"
                      onClick={handleAddTrainingCase}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Add Test Case
                    </Button>
                  </div>
                )}

                {trainingCases.length === 0 && (
                  <Card className="bg-black/40 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden p-8 text-center">
                    <div className="space-y-4">
                      <p className="text-white/70">No training cases available yet.</p>
                      <Button 
                        variant="outline" 
                        className="border-white/20 bg-black/40 hover:bg-white/10"
                        onClick={handleAddTrainingCase}
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Add Training Case
                      </Button>
                    </div>
                  </Card>
                )}

                {trainingCases.length > 0 && (
                  <>
                    <TestCase 
                      onRun={handleRun}
                      onRunAll={handleRunAllTests}
                      currentPrompt={currentPrompt}
                      currentExpectedOutput={currentExpectedOutput}
                      onChange={(prompt, expected) => {
                        setCurrentPrompt(prompt);
                        setCurrentExpectedOutput(expected);
                        // Update the current training case
                        if (activeTrainingCase !== undefined && trainingCases[activeTrainingCase]) {
                          handleUpdateTrainingCase(activeTrainingCase, {
                            userPrompt: prompt,
                            expectedOutput: expected
                          });
                        }
                      }}
                    />
                    
                    {generatedOutput && (
                      <FeedbackSection 
                        output={generatedOutput}
                        onSubmitFeedback={handleFeedback}
                        initialPrompt={currentPrompt}
                      />
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="testing" className="mt-6">
                <PromptTesting 
                  optimizedPrompt={optimizedPrompt} 
                  testCases={testingCases}
                  iterations={iterations}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="relative">
            <div className="sticky top-8">
              <OptimizedPrompt 
                prompt={optimizedPrompt}
                iterations={iterations}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
