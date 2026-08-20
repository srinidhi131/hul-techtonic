import Link from "next/link";
import { Zap } from "lucide-react";

export default function TopNav() {
  return (
    <div className="flex items-center justify-between py-8">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/[0.07] text-violet-400">
          <Zap size={18} />
        </div>
        <div>
          <div className="text-[13px] font-semibold tracking-[-0.02em]">
            Signal-to-Campaign Studio
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-[.2em] text-[#777C8C]">
            Project NEXT
          </div>
        </div>
      </Link>

      <div className="rounded-full border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 text-[10px] font-medium tracking-[.08em] text-[#8F93A3]">
        AI-NATIVE BRAND OPERATIONS
      </div>
    </div>
  );
}
