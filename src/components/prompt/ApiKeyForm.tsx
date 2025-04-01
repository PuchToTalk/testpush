
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export const ApiKeyForm = () => {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem('mistralApiKey');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mistralApiKey', apiKey);
    toast({
      title: "API Key Saved",
      description: "Your Mistral API key has been saved successfully.",
    });
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h3 className="text-lg font-medium text-white/90">Mistral API Key</h3>
        <div className="space-y-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Mistral API key"
            className="bg-white/5 border-white/10 text-white"
          />
          <Button
            type="submit"
            className="w-full bg-[#F97316] hover:bg-orange-600"
          >
            <Key className="w-4 h-4 mr-2" />
            Save API Key
          </Button>
        </div>
      </form>
    </Card>
  );
};
