
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, PlayCircle } from "lucide-react";

interface TestCaseProps {
  onRun: (userPrompt: string, expectedOutput: string) => void;
  onRunAll?: () => void;
  currentPrompt?: string;
  currentExpectedOutput?: string;
  onChange?: (prompt: string, expectedOutput: string) => void;
}

const TestCase = ({ 
  onRun, 
  onRunAll,
  currentPrompt = "", 
  currentExpectedOutput = "", 
  onChange 
}: TestCaseProps) => {
  const [userPrompt, setUserPrompt] = useState(currentPrompt);
  const [expectedOutput, setExpectedOutput] = useState(currentExpectedOutput);

  // Update the state when props change
  useEffect(() => {
    setUserPrompt(currentPrompt);
    setExpectedOutput(currentExpectedOutput);
  }, [currentPrompt, currentExpectedOutput]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setUserPrompt(newPrompt);
    if (onChange) {
      onChange(newPrompt, expectedOutput);
    }
  };

  const handleExpectedOutputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newExpectedOutput = e.target.value;
    setExpectedOutput(newExpectedOutput);
    if (onChange) {
      onChange(userPrompt, newExpectedOutput);
    }
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3 text-white/90">
            Initial Prompt
          </label>
          <Textarea
            value={userPrompt}
            onChange={handlePromptChange}
            placeholder="Enter your initial prompt here..."
            className="min-h-[120px] bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-white/90">
            Expected Output
          </label>
          <Textarea
            value={expectedOutput}
            onChange={handleExpectedOutputChange}
            placeholder="Describe your expected output..."
            className="min-h-[120px] bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => onRun(userPrompt, expectedOutput)}
            className="bg-[#F97316] hover:bg-orange-600 text-white py-6 rounded-xl font-medium transition-colors duration-200"
            disabled={!userPrompt || !expectedOutput}
          >
            <Play className="w-4 h-4 mr-2" />
            Run Test
          </Button>
          
          {onRunAll && (
            <Button
              onClick={onRunAll}
              className="bg-white/10 hover:bg-white/20 text-white py-6 rounded-xl font-medium transition-colors duration-200"
              disabled={!userPrompt || !expectedOutput}
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Run All Tests
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TestCase;
