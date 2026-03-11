import { redirect } from "next/navigation";

// Server-side redirect — no client JS needed, no flash loading spinner.
// Redirects directly to /kegiatan on first load.
export default function HomePage() {
  redirect("/kegiatan");
}
