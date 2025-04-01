
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play } from "lucide-react";

interface TestCaseProps {
  onRun: (userPrompt: string, expectedOutput: string) => void;
}

const TestCase = ({ onRun }: TestCaseProps) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3 text-white/90">
            Initial Prompt
          </label>
          <Textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
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
            onChange={(e) => setExpectedOutput(e.target.value)}
            placeholder="Describe your expected output..."
            className="min-h-[120px] bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
          />
        </div>

        <Button
          onClick={() => onRun(userPrompt, expectedOutput)}
          className="w-full bg-[#F97316] hover:bg-orange-600 text-white py-6 rounded-xl font-medium transition-colors duration-200"
          disabled={!userPrompt || !expectedOutput}
        >
          <Play className="w-4 h-4 mr-2" />
          Run Test
        </Button>
      </div>
    </Card>
  );
};

export default TestCase;
