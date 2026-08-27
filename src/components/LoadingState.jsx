import { RefreshCw } from 'lucide-react';

export function LoadingState({ text = 'Loading...' }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm font-medium text-ink/60">
      <RefreshCw className="animate-spin" size={18} />
      {text}
    </div>
  );
}
