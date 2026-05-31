import { Scale, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LegalHeroProps {
  quota: number | null;
  maxQuota: number;
}

export default function LegalHero({ quota, maxQuota }: LegalHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-900 dark:via-teal-900 dark:to-green-900 py-14 lg:py-20">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <Badge className="bg-white/20 text-white hover:bg-white/30 px-6 py-2 text-sm font-semibold border border-white/30 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Layanan Informasi Hukum Desa
          </Badge>
        </div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl mb-6">
          <Scale className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-hero font-black text-white mb-4 leading-tight">
          Konsultasi Hukum AI
        </h1>
        <p className="text-subtitle text-emerald-50 mb-8 max-w-2xl mx-auto">
          Dapatkan informasi hukum dan prosedur administrasi desa dengan bantuan AI assistant. Cepat, akurat, dan gratis.
        </p>

        {/* Quota pill */}
        {quota !== null && (
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2.5">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">
              Sisa kuota: <strong>{quota}</strong> / {maxQuota} pertanyaan hari ini
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
