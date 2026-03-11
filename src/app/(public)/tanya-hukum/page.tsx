"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Scale,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  BookOpen,
  Shield,
  Zap,
  MessageSquare,
  Send,
} from "lucide-react";
import { aiService } from "@/services/ai.service";

const exampleQuestions = [
  "Bagaimana prosedur pengurusan KTP yang hilang?",
  "Apa syarat pengurusan surat keterangan usaha?",
  "Bagaimana cara mengurus surat keterangan tidak mampu?",
  "Apa saja dokumen yang diperlukan untuk menikah?",
];

const features = [
  {
    icon: Zap,
    title: "Respons Cepat",
    description:
      "Dapatkan jawaban dalam hitungan detik dengan teknologi AI terkini.",
  },
  {
    icon: Shield,
    title: "Informasi Akurat",
    description:
      "Berdasarkan regulasi dan prosedur hukum Indonesia yang berlaku.",
  },
  {
    icon: BookOpen,
    title: "Edukasi Hukum",
    description: "Pelajari hak dan kewajiban Anda sebagai warga desa.",
  },
  {
    icon: CheckCircle2,
    title: "Gratis & Mudah",
    description: "Akses informasi hukum tanpa biaya tambahan setiap harinya.",
  },
];

export default function TanyaHukumPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setAnswered(false);

    try {
      const response = await aiService.askQuestion(question);
      setAnswer(response.data.answer);
      setQuota(response.data.remaining_quota);
      setAnswered(true);
    } catch (error: any) {
      setAnswer(
        `Error: ${error.response?.data?.message || "Gagal mendapatkan jawaban"}`,
      );
      setAnswered(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/20 rounded-full blur-3xl animate-pulse [animation-delay:1000ms]"></div>
      </div>

      <Navbar currentPage="tanya-hukum" />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-900 dark:via-teal-900 dark:to-green-900 py-16 lg:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-white/20 text-white hover:bg-white/30 px-6 py-2 text-sm font-semibold border border-white/30 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Layanan Informasi Hukum Desa
            </Badge>
          </div>

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl mb-6">
            <Scale className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-hero font-black text-white mb-4 leading-tight">
            Konsultasi Hukum AI
          </h1>

          <p className="text-subtitle text-emerald-50 mb-8 max-w-2xl mx-auto">
            Dapatkan informasi hukum dan prosedur administrasi desa dengan
            bantuan AI assistant. Cepat, akurat, dan gratis.
          </p>

          {quota !== null && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">
                Sisa kuota hari ini: <strong>{quota} pertanyaan</strong>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 space-y-8">
        {/* ── ASK CARD ── */}
        <Card className="border-2 border-emerald-100 hover:border-emerald-200 dark:border-gray-800 dark:hover:border-gray-700 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  Ajukan Pertanyaan Hukum
                </CardTitle>
                <CardDescription className="text-base text-gray-500 dark:text-gray-400 mt-0.5">
                  Ketik pertanyaan Anda tentang hukum atau prosedur administrasi
                  desa
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Contoh: Bagaimana prosedur mengurus surat tanah warisan di kantor desa?"
                disabled={loading}
                rows={5}
                required
                className="resize-none text-base leading-relaxed border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus-visible:ring-emerald-500/20 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 rounded-xl placeholder:text-gray-400"
              />

              <Button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI sedang berpikir...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Tanya AI Sekarang
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── THINKING DOTS ── */}
        {loading && (
          <div className="flex items-center gap-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            Memproses pertanyaan Anda...
          </div>
        )}

        {/* ── ANSWER CARD ── */}
        {answered && answer && (
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 shadow-2xl bg-white dark:bg-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Green header bar */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-black text-lg">Jawaban AI</span>
            </div>

            <CardContent className="px-7 pt-6 pb-7 space-y-5">
              <p
                className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-line [&_strong]:text-emerald-800 dark:[&_strong]:text-emerald-400 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{
                  __html: answer.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>",
                  ),
                }}
              />

              <div className="h-px bg-emerald-50 dark:bg-gray-700" />

              {/* Disclaimer */}
              <div className="flex gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-100 dark:border-amber-900/40 px-4 py-4">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
                  <strong>Disclaimer:</strong> Informasi ini bersifat umum dan
                  tidak menggantikan konsultasi hukum profesional. Untuk kasus
                  spesifik, harap konsultasi dengan ahli hukum atau petugas
                  desa.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── EXAMPLE QUESTIONS ── */}
        <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-xl font-black text-gray-900 dark:text-gray-100">
                Contoh Pertanyaan
              </CardTitle>
            </div>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Klik salah satu pertanyaan di bawah untuk memulai
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exampleQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => setQuestion(q)}
                  disabled={loading}
                  className="group w-full h-auto py-4 px-5 border-2 border-emerald-100 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-emerald-800 dark:hover:text-emerald-400 font-normal text-sm text-left justify-start leading-snug transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer whitespace-normal break-words overflow-hidden"
                >
                  <ChevronRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mr-2.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span className="break-words">{q}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── FEATURES ── */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-display font-black mb-3 bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Kenapa Layanan Ini?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Teknologi AI untuk memudahkan akses informasi hukum bagi seluruh
              warga desa
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group border-2 border-emerald-100 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                >
                  <CardHeader>
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
