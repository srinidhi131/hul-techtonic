import { ShieldCheck, Sparkles } from "lucide-react";

export default function StatusBar() {
  return (
    <div className="panel grid grid-cols-1 divide-y divide-white/[0.06] rounded-[18px] px-5 py-4 md:grid-cols-3 md:divide-x md:divide-y-0">
      <div className="flex items-center justify-center gap-3 py-2 text-[12px] text-[#B8BBC6]">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,.55)]" />
        <span>4 active opportunities</span>
      </div>

      <div className="flex items-center justify-center gap-3 py-2 text-[12px] text-[#B8BBC6]">
        <Sparkles size={15} className="text-violet-400" />
        <span>AI opportunity scoring enabled</span>
      </div>

      <div className="flex items-center justify-center gap-3 py-2 text-[12px] text-[#B8BBC6]">
        <ShieldCheck size={15} className="text-violet-400" />
        <span>Human approval required</span>
      </div>
    </div>
  );
}
