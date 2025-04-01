
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, CheckCircle, RefreshCw } from "lucide-react";
import { generateMistralResponse } from "@/services/mistralService";
import { useToast } from "@/components/ui/use-toast";

interface OptimizedPromptProps {
  prompt: string;
  iterations: Array<{
    prompt: string;
    output: string;
    feedback: string;
    score: number;
  }>;
}

const OptimizedPrompt = ({ prompt, iterations }: OptimizedPromptProps) => {
  const { toast } = useToast();
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateOptimizedPrompt = async () => {
    const apiKey = localStorage.getItem('mistralApiKey');
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Mistral API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const improvementRules = iterations.map(iter => iter.feedback).join('\n- ');
      const testCases = iterations.map((iter, index) => `
Test Case ${index + 1}:
Initial Prompt: "${iter.prompt}"
Objective: "${summarizePrompt(iter.prompt)}"
Function Signature: "${summarizeExpectedOutput(iter.output)}"
`).join('\n\n');

      const analysisPrompt = `
Task: Create a generalized prompt template based on the following test cases and improvement rules.

${testCases}

Requirements:
${improvementRules ? `- ${improvementRules}` : 'No improvement rules yet.'}

Please generate a template that:
1. Extracts and generalizes the core objective from all test cases
2. Creates a flexible function signature that can handle variations in expected outputs
3. Maintains all improvement rules as requirements
4. Structures the prompt in a clear, reusable format

Generate the template in this format:
Core Objective: [Generalized goal]
Function Signature: [Abstract expected output format in words, not showing actual output]
Requirements: [List of requirements]`;

      const optimizedVersion = await generateMistralResponse(analysisPrompt, apiKey);
      setOptimizedPrompt(optimizedVersion);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate optimized prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const summarizePrompt = (promptText: string): string => {
    // Extract key objective without specific details
    return promptText.length > 100 ? `${promptText.substring(0, 100)}...` : promptText;
  };

  const summarizeExpectedOutput = (output: string): string => {
    // Convert specific output to general description
    const words = output.split(' ');
    if (words.length > 20) {
      return `${words.slice(0, 20).join(' ')}...`;
    }
    return output;
  };

  useEffect(() => {
    if (prompt && iterations.length > 0) {
      generateOptimizedPrompt();
    }
  }, [prompt, iterations]);

  return (
    <Card className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-orange-500">
            Evolving Prompt
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={generateOptimizedPrompt}
            disabled={isGenerating || !prompt}
            className="bg-white/5 hover:bg-white/10 text-white border-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
        
        <div className="space-y-6">
          {optimizedPrompt && (
            <div className="space-y-4">
              <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <pre className="whitespace-pre-wrap text-white/90 font-mono text-sm">
                  {optimizedPrompt}
                </pre>
              </div>
              
              <Button
                onClick={() => navigator.clipboard.writeText(optimizedPrompt)}
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10"
              >
                <ClipboardCopy className="w-4 h-4 mr-2" />
                Copy Prompt
              </Button>
            </div>
          )}

          {iterations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white/90">Improvement Rules</h3>
              <ul className="space-y-3">
                {iterations.map((iteration, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-3 bg-white/5 rounded-lg p-3 text-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-white/90 mb-1">Initial Prompt:</div>
                          <pre className="text-white/70 text-xs mb-2 whitespace-pre-wrap">{iteration.prompt}</pre>
                          <div className="font-medium text-white/90 mb-1">Feedback:</div>
                          <div className="text-white/80">{iteration.feedback}</div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OptimizedPrompt;
