import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileX, Info, Check } from "lucide-react";
import { read, utils } from "xlsx";
import { useToast } from "@/components/ui/use-toast";

interface ImportTestCasesProps {
  onImport: (data: Array<{ userPrompt: string; expectedOutput: string }>, trainingCount: number) => void;
}

const ImportTestCases = ({ onImport }: ImportTestCasesProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [trainingCount, setTrainingCount] = useState<number>(8);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      let testCases: Array<{ userPrompt: string; expectedOutput: string }> = [];
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        // Process CSV file
        const text = await file.text();
        const lines = text.split(/\r?\n/);
        
        // Determine delimiter by checking first line
        const delimiter = lines[0].includes(';') ? ';' : ',';
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const columns = line.split(delimiter);
            if (columns.length >= 2) {
              testCases.push({
                userPrompt: columns[0].trim(),
                expectedOutput: columns[1].trim()
              });
            }
          }
        }
      } else {
        // Process Excel file
        const data = await file.arrayBuffer();
        const workbook = read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Skip header row
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length >= 2) {
            testCases.push({
              userPrompt: String(row[0] || ''),
              expectedOutput: String(row[1] || '')
            });
          }
        }
      }
      
      // Validate we have enough entries
      if (testCases.length === 0) {
        toast({
          title: "Error",
          description: "No valid test cases found in the file",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      if (testCases.length < trainingCount) {
        toast({
          title: "Not Enough Data",
          description: `File contains ${testCases.length} test cases, but you requested ${trainingCount} for training`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      // Notify success
      toast({
        title: "Import Successful",
        description: `Imported ${testCases.length} test cases (${trainingCount} for training, ${testCases.length - trainingCount} for testing)`,
      });
      
      // Pass the data to parent component
      onImport(testCases, trainingCount);
      
      // Reset
      setFile(null);
      
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process the file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const acceptedFileTypes = ".csv,.xlsx,.xls";
  const maxFileSizeInMB = 5;

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-medium text-white/90">Import Test Cases</h3>
        
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-2">
              <Upload className="w-8 h-8 text-white/60" />
              <p className="text-sm text-white/80">
                {file ? file.name : "Click to upload CSV or Excel file"}
              </p>
              <p className="text-xs text-white/60">
                First column will be used as "Initial Prompt", second as "Expected Output"
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept={acceptedFileTypes}
              onChange={handleFileChange}
            />
          </label>
          
          {file && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-white/10 rounded-full p-1.5">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-sm text-white/80">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-8 w-8 p-0 text-white/70 hover:text-white"
                  onClick={() => setFile(null)}
                >
                  <FileX className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="trainingCount" className="block text-sm font-medium text-white/70">
                  Test cases for training:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="trainingCount"
                    type="range"
                    min="1"
                    max="20"
                    value={trainingCount}
                    onChange={(e) => setTrainingCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="min-w-12 text-center text-white/90 bg-white/10 rounded-md px-2 py-1">
                    {trainingCount}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-sm text-white/80">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p>
                  The first {trainingCount} test cases will be used for training, and the rest will be used for testing.
                </p>
              </div>
              
              <Button
                onClick={processFile}
                className="w-full bg-[#F97316] hover:bg-orange-600 text-white py-4 rounded-xl font-medium transition-colors duration-200"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>Processing<span className="animate-pulse">...</span></>
                ) : (
                  "Import and Split Test Cases"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImportTestCases;
