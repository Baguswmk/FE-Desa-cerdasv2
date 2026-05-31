import { Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface ExampleQuestionsProps {
  questions: string[];
  onSubmit: (override: string) => void;
  loading: boolean;
  quota: number | null;
}

export default function ExampleQuestions({
  questions,
  onSubmit,
  loading,
  quota,
}: ExampleQuestionsProps) {
  return (
    <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <CardTitle className="text-xl font-black text-gray-900 dark:text-gray-100">
            Contoh Pertanyaan
          </CardTitle>
        </div>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Klik salah satu untuk langsung mengirim ke AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {questions.map((q, i) => (
            <Button
              key={i}
              variant="outline"
              onClick={() => onSubmit(q)}
              disabled={loading || quota === 0}
              className="group w-full h-auto py-4 px-5 border-2 border-emerald-100 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-emerald-800 dark:hover:text-emerald-400 font-normal text-sm text-left justify-start leading-snug transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer whitespace-normal break-words overflow-hidden"
            >
              <ChevronRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mr-2.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
              <span className="break-words">{q}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
