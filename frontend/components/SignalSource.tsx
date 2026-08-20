import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  icon: LucideIcon;
};

export default function SignalSource({ label, icon: Icon }: Props) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-white/[0.075] bg-white/[0.018] px-4 py-2.5 text-[12px] text-[#B3B6C1]">
      <Icon size={15} strokeWidth={1.8} className="text-violet-400" />
      <span>{label}</span>
    </div>
  );
}
