
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackSectionProps {
  output: string;
  onSubmitFeedback: (feedback: string, score: number) => void;
  initialPrompt?: string; // Added initialPrompt
}

const FeedbackSection = ({ output, onSubmitFeedback, initialPrompt }: FeedbackSectionProps) => {
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(3);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        {initialPrompt && (
          <div>
            <label className="block text-sm font-medium mb-3 text-white/90">Initial Prompt</label>
            <div className="bg-white/5 rounded-xl p-4 font-mono text-sm text-white/90 whitespace-pre-wrap border border-white/10">
              {initialPrompt}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-3 text-white/90">Generated Output</label>
          <div className="bg-white/5 rounded-xl p-4 font-mono text-sm text-white/90 whitespace-pre-wrap border border-white/10">
            {output}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-white/90">Feedback</label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What could be improved?"
            className="min-h-[100px] bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-white/90">Score</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Button
                key={value}
                variant={score === value ? "default" : "outline"}
                onClick={() => setScore(value)}
                className={`flex-1 ${
                  score === value 
                    ? "bg-[#F97316] hover:bg-orange-600 text-white" 
                    : "border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
                }`}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => {
            onSubmitFeedback(feedback, score);
            setFeedback("");
          }}
          className="w-full bg-[#F97316] hover:bg-orange-600 text-white py-6 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!feedback}
        >
          Improve from Feedback
        </Button>
      </div>
    </Card>
  );
};

export default FeedbackSection;
