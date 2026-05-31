import { Shield } from 'lucide-react';

/**
 * Marca d'água de propriedade — aparece em todas as páginas.
 * Visível e discreta, mostra que o site pertence a Corvo Dev.
 */
export function Watermark() {
  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
        <Shield className="w-3 h-3 text-blue-400" />
        <span className="text-[10px] font-semibold text-white/70 tracking-widest uppercase">
          Corvo Dev
        </span>
      </div>
    </div>
  );
}
