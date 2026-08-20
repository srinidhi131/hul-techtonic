import {
  Heart,
  MessageCircle,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";

import ActionCard from "@/components/ActionCard";
import SignalSource from "@/components/SignalSource";
import StatusBar from "@/components/StatusBar";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-fade" />

      <div className="page-shell relative z-10 flex min-h-screen flex-col justify-center py-14">
        <section className="mx-auto w-full max-w-[1120px]">
          <div className="text-center">
            <div className="kicker flex items-center justify-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_18px_rgba(139,92,246,.75)]" />
              PROJECT NEXT
            </div>

            <div className="mt-6 text-[12px] font-medium uppercase tracking-[.18em] text-[#777C8C]">
              SIGNAL-TO-CAMPAIGN STUDIO
            </div>

            <h1 className="mx-auto mt-8 max-w-[880px] text-[46px] font-medium leading-[1.04] tracking-[-0.055em] text-[#F9F9FB] md:text-[58px]">
              How can I help <span className="text-violet-400">you</span> today?
            </h1>

            <p className="mx-auto mt-5 max-w-[620px] text-[14px] leading-7 text-[#9599A8]">
              Turn emerging consumer signals into decision-ready campaigns.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-[1180px] gap-8 md:grid-cols-2">
            <ActionCard
              href="/explore"
              title="Explore emerging signals"
              description="Discover opportunities detected and ranked by AI."
              icon="radar"
            />
            <ActionCard
              href="/analyse"
              title="Analyse a new trend"
              description="Evaluate a consumer signal or cultural moment for HUL."
              icon="pen"
            />
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-5">
              <div className="h-px flex-1 bg-white/[0.07]" />
              <div className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#747987]">
                Live signal inputs
              </div>
              <div className="h-px flex-1 bg-white/[0.07]" />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <SignalSource label="Social signals" icon={MessageCircle} />
              <SignalSource label="Search trends" icon={Search} />
              <SignalSource label="Creator conversations" icon={Users} />
              <SignalSource label="Consumer sentiment" icon={Heart} />
              <SignalSource label="Commerce & market data" icon={ShoppingBag} />
            </div>
          </div>

          <div className="mt-8">
            <StatusBar />
          </div>
        </section>
      </div>
    </main>
  );
}
