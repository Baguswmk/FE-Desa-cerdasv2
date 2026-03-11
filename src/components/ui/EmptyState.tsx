import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Empty list / zero-data state component.
 * Use when a page has fetched data but the result set is empty.
 *
 * Usage:
 *   {items.length === 0 && (
 *     <EmptyState
 *       icon={<Heart className="w-16 h-16 text-emerald-600" />}
 *       title="Belum Ada Donasi"
 *       description="Mulai berbagi dengan memberikan donasi untuk kegiatan desa."
 *       action={<Link href="/kegiatan"><Button>Lihat Kegiatan</Button></Link>}
 *     />
 *   )}
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="inline-block p-5 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-black text-gray-900 mb-3">{title}</h3>
      {description && (
        <p className="text-gray-600 font-medium max-w-md mx-auto mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
