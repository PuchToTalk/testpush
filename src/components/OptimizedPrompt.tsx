
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, CheckCircle } from "lucide-react";

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
  const rules = iterations.map(iteration => ({
    text: iteration.feedback,
    score: iteration.score
  }));

  return (
    <Card className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden">
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-orange-500">
          Evolving Prompt
        </h2>
        
        <div className="space-y-6">
          {prompt && (
            <div className="space-y-4">
              <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <pre className="whitespace-pre-wrap text-white/90 font-mono text-sm">
                  {prompt}
                </pre>
              </div>
              
              <Button
                onClick={() => navigator.clipboard.writeText(prompt)}
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10"
              >
                <ClipboardCopy className="w-4 h-4 mr-2" />
                Copy Prompt
              </Button>
            </div>
          )}

          {rules.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white/90">Improvement Rules</h3>
              <ul className="space-y-3">
                {rules.map((rule, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-3 bg-white/5 rounded-lg p-3 text-sm"
                  >
                    <CheckCircle className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
                    <span className="text-white/80">{rule.text}</span>
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
