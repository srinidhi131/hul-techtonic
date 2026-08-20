import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import TopNav from "@/components/TopNav";
import { getSignals } from "@/lib/api";
import BrandDecision from "@/components/BrandDecision";
import DeleteOpportunity from "@/components/DeleteOpportunity";
import WorkflowProgress from "@/components/WorkflowProgress";

function normalizeTrend(value: string) {
  return decodeURIComponent(value)
    .replace(/^#/, "")
    .toLowerCase();
}


function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="text-[#A8ACB9]">
          {label}
        </span>

        <span className="font-medium text-[#E8E9EE]">
          {value}/100
        </span>
      </div>

      <div className="h-[7px] overflow-hidden rounded-full bg-white/[0.055]">
        <div
          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-violet-500
            to-violet-300
          "
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}


export default async function OpportunityPage({
  params,
}: {
  params: Promise<{
    trend: string;
  }>;
}) {
  const { trend } = await params;

  const signals = await getSignals();

  const selected = signals.find(
    (signal) =>
      normalizeTrend(signal.trend) ===
      normalizeTrend(trend)
  );


  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!selected) {
  return (
    <main className="min-h-screen">
      <div className="page-shell">

        <TopNav />

        <WorkflowProgress
          active="insight"
        />

        <div
          className="
            panel
            mt-20
            rounded-[22px]
            p-10
            text-center
          "
        >
          <div
            className="
              text-[24px]
              font-semibold
              text-[#F4F5F8]
            "
          >
            Opportunity not found
          </div>

          <p
            className="
              mt-3
              text-[12px]
              text-[#7F8492]
            "
          >
            This opportunity may have been deleted
            or is no longer available.
          </p>

          <Link
            href="/explore"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.02]
              px-4
              py-3
              text-[11px]
              text-[#B7BAC4]
              transition
              hover:bg-white/[0.04]
              hover:text-white
            "
          >
            <ArrowLeft size={14} />

            Return to Opportunity Radar
          </Link>

        </div>

      </div>
    </main>
  );
}


  // =====================================================
  // SCORE BREAKDOWN
  // =====================================================

  const scoreItems: [string, number][] = [
  [
    "Trend velocity",
    selected.trend_velocity ?? 0,
  ],

  [
    "Brand relevance",
    selected.brand_relevance ?? 0,
  ],

  [
    "Consumer fit",
    selected.consumer_fit ?? 0,
  ],

  [
    "Sentiment strength",
    selected.sentiment ?? 0,
  ],

  [
    "Time sensitivity",
    selected.time_sensitivity ?? 0,
  ],
];

  const BRAND_ALTERNATIVES: Record<
    string,
    {
      brand: string;
      score: number;
      reason: string;
    }[]
  > = {

    "#MonsoonHairCare": [
      {
        brand: "TRESemmé",
        score: 89,
        reason:
          "Strong premium fit with styling, frizz control and performance-led hair care.",
      },
      {
        brand: "Dove Hair",
        score: 71,
        reason:
          "Relevant to damage care and nourishment, but less directly linked to styling-led monsoon conversations.",
      },
    ],


    "#SweatProofConfidence": [
      {
        brand: "Dove Deodorant",
        score: 74,
        reason:
          "Relevant personal-care fit with confidence and underarm-care positioning.",
      },
    ],


    "#SkinCyclingIndia": [
      {
        brand: "Lakmé",
        score: 82,
        reason:
          "Strong beauty authority and relevance among digitally active skincare consumers.",
      },
      {
        brand: "Dove Skincare",
        score: 69,
        reason:
          "Relevant care credentials, but weaker fit with structured skincare routines.",
      },
    ],


    "#QuickCommerceBeauty": [
      {
        brand: "Lakmé",
        score: 86,
        reason:
          "Strong fit with beauty discovery, impulse purchase and digital-first commerce.",
      },
      {
        brand: "Dove Skincare",
        score: 65,
        reason:
          "Relevant skincare portfolio, but weaker association with beauty-led impulse commerce.",
      },
    ],
  };

  return (
    <main className="min-h-screen pb-20">

      <div className="page-shell">

        <TopNav />
        <WorkflowProgress active="insight" />

        {/* =================================================
            PAGE
            ================================================= */}

        <section className="pt-8">


          {/* ===============================================
              BACK
              =============================================== */}

          <Link
            href="/explore"
            className="
              inline-flex
              items-center
              gap-2
              text-[12px]
              text-[#7F8492]
              transition
              hover:text-[#D3D5DD]
            "
          >
            <ArrowLeft size={14} />

            Opportunity Radar
          </Link>


          {/* ===============================================
              HERO / OPPORTUNITY SUMMARY
              =============================================== */}

          <div
            className="
              mt-8
              grid
              gap-8
              xl:grid-cols-[1.35fr_.8fr]
            "
          >

            {/* LEFT */}

            <div>

              <div className="kicker">
                02 · Understand
              </div>


              <div className="mt-5 flex flex-wrap items-center gap-3">

                <span
                  className="
                    rounded-full
                    border
                    border-violet-400/15
                    bg-violet-500/[0.05]
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[.15em]
                    text-violet-300
                  "
                >
                  Emerging opportunity
                </span>


                <span className="text-[11px] text-[#666B79]">
                  AI-ranked signal
                </span>

              </div>


              <h1
                className="
                  mt-6
                  text-[48px]
                  font-medium
                  leading-[1.02]
                  tracking-[-0.055em]
                  text-[#F8F8FB]
                  md:text-[62px]
                "
              >
                {selected.trend}
              </h1>


              <p
                className="
                  mt-5
                  max-w-[730px]
                  text-[17px]
                  leading-8
                  text-[#A0A4B1]
                "
              >
                {selected.consumer_need}
              </p>


              {/* META */}

              <div className="mt-8 flex flex-wrap gap-3">

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/[0.07]
                    bg-white/[0.018]
                    px-3.5
                    py-2
                    text-[11px]
                    text-[#A1A5B1]
                  "
                >
                  <MapPin
                    size={14}
                    className="text-violet-400"
                  />

                  {selected.market}
                </div>


                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/[0.07]
                    bg-white/[0.018]
                    px-3.5
                    py-2
                    text-[11px]
                    text-[#A1A5B1]
                  "
                >
                  <Clock3
                    size={14}
                    className="text-violet-400"
                  />

                  {selected.window ?? "Emerging"}
                </div>


                <div
                  className="
                    rounded-full
                    border
                    border-white/[0.07]
                    bg-white/[0.018]
                    px-3.5
                    py-2
                    text-[11px]
                    text-[#A1A5B1]
                  "
                >
                  {selected.category
                    .charAt(0)
                    .toUpperCase() +
                    selected.category.slice(1)}
                </div>

              </div>
            </div>


            {/* =============================================
                SCORE CARD
                ============================================= */}

            <div
              className="
                panel
                flex
                min-h-[275px]
                flex-col
                justify-between
                rounded-[24px]
                p-7
              "
            >

              <div>

                <div
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[.18em]
                    text-[#707584]
                  "
                >
                  Opportunity score
                </div>


                <div className="mt-4 flex items-end gap-2">

                  <div
                    className="
                      text-[66px]
                      font-semibold
                      leading-none
                      tracking-[-0.06em]
                      text-violet-400
                    "
                  >
                    {selected.opportunity_score.toFixed(1)}
                  </div>

                  <div className="mb-2 text-[14px] text-[#626775]">
                    /100
                  </div>

                </div>

              </div>


              <div className="border-t border-white/[0.06] pt-5">

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[12px]
                    text-emerald-300
                  "
                >
                  <Sparkles size={15} />

                  High-priority opportunity
                </div>


                <p
                  className="
                    mt-2
                    text-[12px]
                    leading-5
                    text-[#787D8B]
                  "
                >
                  Strong enough to move into brand
                  evaluation and campaign development.
                </p>

              </div>
            </div>

          </div>


          {/* =================================================
              INTELLIGENCE + BRAND
              ================================================= */}

          <div
            className="
              mt-10
              grid
              gap-6
              xl:grid-cols-[1.25fr_.75fr]
            "
          >


            {/* ===============================================
                OPPORTUNITY INTELLIGENCE
                =============================================== */}

            <section
              className="
                panel
                rounded-[24px]
                p-7
                md:p-8
              "
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[.18em]
                      text-[#707584]
                    "
                  >
                    Opportunity intelligence
                  </div>


                  <h2
                    className="
                      mt-2
                      text-[23px]
                      font-semibold
                      tracking-[-0.035em]
                      text-[#F3F4F7]
                    "
                  >
                    Why this signal matters
                  </h2>

                </div>


                <span
                  className="
                    rounded-full
                    border
                    border-white/[0.07]
                    bg-white/[0.02]
                    px-3
                    py-1.5
                    text-[10px]
                    text-[#858A98]
                  "
                >
                  Weighted model
                </span>

              </div>


              {/* SCORE BARS */}

              <div className="mt-8 space-y-6">

                {scoreItems.map(
                  ([label, value]) => (
                    <ScoreBar
                      key={label}
                      label={label}
                      value={value}
                    />
                  )
                )}

              </div>


              {/* METRICS */}

              <div
                className="
                  mt-8
                  grid
                  gap-4
                  border-t
                  border-white/[0.06]
                  pt-7
                  md:grid-cols-3
                "
              >

                {/* MOMENTUM */}

                <div>

                  <div
                    className="
                      text-[10px]
                      uppercase
                      tracking-[.16em]
                      text-[#666B79]
                    "
                  >
                    Momentum
                  </div>

                  <div
                    className="
                      mt-2
                      text-[16px]
                      font-semibold
                      text-[#E9EAF0]
                    "
                  >
                    {selected.growth ?? "+100%"}
                  </div>

                  <div className="mt-1 text-[11px] text-[#717684]">
                    vs. recent baseline
                  </div>

                </div>


                {/* MARKET */}

                <div>

                  <div
                    className="
                      text-[10px]
                      uppercase
                      tracking-[.16em]
                      text-[#666B79]
                    "
                  >
                    Market
                  </div>

                  <div
                    className="
                      mt-2
                      text-[16px]
                      font-semibold
                      text-[#E9EAF0]
                    "
                  >
                    {selected.market}
                  </div>

                  <div className="mt-1 text-[11px] text-[#717684]">
                    primary signal geography
                  </div>

                </div>


                {/* WINDOW */}

                <div>

                  <div
                    className="
                      text-[10px]
                      uppercase
                      tracking-[.16em]
                      text-[#666B79]
                    "
                  >
                    Action window
                  </div>

                  <div
                    className="
                      mt-2
                      text-[16px]
                      font-semibold
                      text-[#E9EAF0]
                    "
                  >
                    {selected.window ?? "Emerging"}
                  </div>

                  <div className="mt-1 text-[11px] text-[#717684]">
                    before signal decay
                  </div>

                </div>

              </div>


              {/* AI INTERPRETATION */}

              {selected.insight_summary && (

                <div
                  className="
                    mt-7
                    border-t
                    border-white/[0.06]
                    pt-6
                  "
                >

                  <div
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[.17em]
                      text-[#666B79]
                    "
                  >
                    AI interpretation
                  </div>


                  <p
                    className="
                      mt-3
                      text-[13px]
                      leading-6
                      text-[#9095A4]
                    "
                  >
                    {selected.insight_summary}
                  </p>

                </div>

              )}

            </section>

            <section
              className="
    panel
    rounded-[24px]
    p-7
    md:p-8
  "
            >
              <BrandDecision
                trend={selected.trend}
                recommendedBrand={
                  selected.brand ??
                  "HUL BRAND"
                }
                recommendedReason={
                  selected.brand_reason ??
                  "Requires portfolio-level relevance scoring."
                }
                alternatives={
                  BRAND_ALTERNATIVES[
                  selected.trend
                  ] ?? []
                }
              />
            </section>



          </div>

        </section>

      </div>

    </main>
  );
}