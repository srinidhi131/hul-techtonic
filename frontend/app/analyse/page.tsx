"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  FlaskConical,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import TopNav from "@/components/TopNav";


const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";


type Mode =
  | "demo"
  | "ai";


type Scenario = {
  id: string;
  title: string;
  signal: string;
  category_hint: string;
};


type AnalysisResult = {
  trend: string;
  custom: boolean;
  approved: boolean;

  category: string;
  market: string;
  consumer_need: string;

  opportunity_score: number;
  trend_velocity: number;
  brand_relevance: number;
  consumer_fit: number;
  sentiment: number;
  time_sensitivity: number;

  brand: string;
  brand_reason?: string;

  analysis_rationale?: string;
analysis_source?: string;
  status: string;
};


const ANALYSIS_STEPS = [
  "Understanding consumer signal",
  "Identifying consumer need",
  "Evaluating market relevance",
  "Scoring opportunity potential",
  "Matching HUL portfolio",
  "Creating opportunity workspace",
];


const PRELOADED_SCENARIOS: Scenario[] = [

  {
    id:
      "helmet-scalp",

    title:
      "Helmet Hair & Scalp Oiliness",

    signal:
      "Young professionals are increasingly discussing greasy scalp and flat hair after long two-wheeler commutes.",

    category_hint:
      "Haircare"
  },


  {
    id:
      "office-sweat",

    title:
      "Heat-Proof Office Confidence",

    signal:
      "Office commuters are searching for ways to manage sweat and body odour through long summer workdays.",

    category_hint:
      "Deodorant"
  },


  {
    id:
      "post-gym-hair",

    title:
      "Post-Gym Hair Reset",

    signal:
      "Urban women are discussing quick hair-refresh routines after workouts without doing a full wash.",

    category_hint:
      "Haircare"
  },


  {
    id:
      "barrier-repair",

    title:
      "Barrier Repair Skincare",

    signal:
      "Consumers are moving away from aggressive skincare routines and talking more about repairing damaged skin barriers.",

    category_hint:
      "Skincare"
  },


  {
    id:
      "quick-commerce-refill",

    title:
      "Quick-Commerce Beauty Refill",

    signal:
      "Consumers are increasingly buying skincare and personal-care essentials through quick-commerce when products run out unexpectedly.",

    category_hint:
      "Skincare"
  },


  {
    id:
      "hostel-haircare",

    title:
      "College Hostel Haircare",

    signal:
      "College students living in hostels are discussing low-effort hair routines because of hard water, limited time and shared bathrooms.",

    category_hint:
      "Haircare"
  },


  {
    id:
      "festive-recovery",

    title:
      "Festive Makeup Recovery",

    signal:
      "After wedding and festive seasons, consumers are searching for simple skincare routines to recover from heavy makeup and late nights.",

    category_hint:
      "Skincare"
  },


  {
    id:
      "humidity-fragrance",

    title:
      "Humidity-Proof Fragrance Confidence",

    signal:
      "Young consumers in coastal cities are discussing deodorant and freshness solutions that last through humid commutes and social plans.",

    category_hint:
      "Deodorant"
  },


  {
    id:
      "minimal-morning",

    title:
      "Minimal Morning Skincare",

    signal:
      "Young professionals are simplifying morning skincare because long routines do not fit increasingly early commute schedules.",

    category_hint:
      "Skincare"
  },


  {
    id:
      "travel-personal-care",

    title:
      "Travel-Sized Personal Care",

    signal:
      "Frequent domestic travellers are discussing compact, spill-proof personal-care products for short work trips and weekend travel.",

    category_hint:
      "Cross-category"
  }

];


function sleep(
  ms: number
) {

  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms
      )
  );
}


export default function AnalysePage() {

  const router =
    useRouter();


  const [
    mode,
    setMode
  ] =
    useState<Mode>(
      "demo"
    );


  const [
    signal,
    setSignal
  ] =
    useState("");


  const [
    selectedScenario,
    setSelectedScenario
  ] =
    useState<string | null>(
      null
    );


  const [
    loading,
    setLoading
  ] =
    useState(false);


  const [
    step,
    setStep
  ] =
    useState(-1);


  const [
    result,
    setResult
  ] =
    useState<AnalysisResult | null>(
      null
    );


  const [
    error,
    setError
  ] =
    useState("");


  // =====================================================
  // RESET BETWEEN MODES
  // =====================================================

  function switchMode(
    newMode: Mode
  ) {

    if (
      loading
    ) {
      return;
    }


    setMode(
      newMode
    );


    setResult(
      null
    );


    setError(
      ""
    );


    setSelectedScenario(
      null
    );


    setSignal(
      ""
    );
  }


  // =====================================================
  // ANALYSIS ANIMATION
  // =====================================================

  async function runAnalysisAnimation() {

    for (
      let index = 0;
      index <
      ANALYSIS_STEPS.length;
      index++
    ) {

      setStep(
        index
      );


      await sleep(
        index ===
          ANALYSIS_STEPS.length - 1
          ? 450
          : 420
      );
    }
  }


  // =====================================================
  // LIVE AI MODE
  // =====================================================

  async function analyseWithAI() {

    if (
      !signal.trim()
    ) {
      return;
    }


    try {

      setLoading(
        true
      );

      setResult(
        null
      );

      setError(
        ""
      );

      setStep(
        0
      );


      const request =
        fetch(
          `${API_BASE}/analyse/custom`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                trend:
                  signal
              })
          }
        );


      await runAnalysisAnimation();


      const response =
        await request;


      if (
        !response.ok
      ) {

        const responseData =
          await response.json();


        throw new Error(
          responseData?.detail ||
          "Unable to analyse signal."
        );
      }


      const data:
        AnalysisResult =
          await response.json();


      setResult(
        data
      );


      setLoading(
        false
      );

      setStep(
        -1
      );

    } catch (
      analysisError
    ) {

      setLoading(
        false
      );

      setStep(
        -1
      );


      setError(
  "live_ai_unavailable"
);
    }
  }


  // =====================================================
  // DEMO MODE
  // =====================================================

  async function runDemoScenario(
    scenario: Scenario
  ) {

    try {

      setSelectedScenario(
        scenario.id
      );


      setSignal(
        scenario.signal
      );


      setLoading(
        true
      );


      setResult(
        null
      );


      setError(
        ""
      );


      setStep(
        0
      );


      const request =
        fetch(
          `${API_BASE}/analyse/demo/${encodeURIComponent(
            scenario.id
          )}`,
          {
            method:
              "POST"
          }
        );


      await runAnalysisAnimation();


      const response =
        await request;


      if (
        !response.ok
      ) {

        const responseData =
          await response.json();


        throw new Error(
          responseData?.detail ||
          "Unable to load demo scenario."
        );
      }


      const data:
        AnalysisResult =
          await response.json();


      setResult(
        data
      );


      setLoading(
        false
      );


      setStep(
        -1
      );

    } catch (
      demoError
    ) {

      setLoading(
        false
      );


      setStep(
        -1
      );


      setError(
        demoError instanceof Error
          ? demoError.message
          : "Unable to run demo scenario."
      );
    }
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen">

      <div className="page-shell">

        <TopNav />


        <section
          className="
            pb-24
            pt-10
          "
        >

          {/* ===============================================
              HEADER
              =============================================== */}

          <div className="kicker">
            AI SIGNAL ANALYSIS
          </div>


          <div
            className="
              mt-4
              flex
              flex-col
              justify-between
              gap-7
              lg:flex-row
              lg:items-end
            "
          >

            <div>

              <h1
                className="
                  max-w-[760px]
                  text-[50px]
                  font-medium
                  tracking-[-0.055em]
                  text-[#F6F7FB]
                  md:text-[56px]
                "
              >
                Create a new opportunity
              </h1>


              <p
                className="
                  mt-4
                  max-w-[680px]
                  text-[14px]
                  leading-7
                  text-[#8A8F9C]
                "
              >
                Explore a pre-generated AI scenario
                or analyse an unseen consumer signal
                with the live model.
              </p>

            </div>


            {/* MODE TOGGLE */}

            <div
              className="
                flex
                rounded-[14px]
                border
                border-white/[0.07]
                bg-white/[0.015]
                p-1
              "
            >

              <button
                disabled={
                  loading
                }
                onClick={() =>
                  switchMode(
                    "demo"
                  )
                }
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-[10px]
                  px-4
                  py-2.5
                  text-[10px]
                  font-semibold
                  transition

                  ${
                    mode ===
                    "demo"
                      ? "bg-violet-500 text-white shadow-lg"
                      : "text-[#777C8A] hover:text-white"
                  }
                `}
              >
                <FlaskConical
                  size={13}
                />

                Demo Mode
              </button>


              <button
                disabled={
                  loading
                }
                onClick={() =>
                  switchMode(
                    "ai"
                  )
                }
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-[10px]
                  px-4
                  py-2.5
                  text-[10px]
                  font-semibold
                  transition

                  ${
                    mode ===
                    "ai"
                      ? "bg-violet-500 text-white shadow-lg"
                      : "text-[#777C8A] hover:text-white"
                  }
                `}
              >
                <Bot
                  size={13}
                />

                Live AI
              </button>

            </div>

          </div>


          {/* ===============================================
              DEMO MODE
              =============================================== */}

          {mode ===
            "demo" &&
            !result &&
            !loading && (

            <>

              <div
                className="
                  mt-9
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div>

                  <div
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[.17em]
                      text-violet-300/80
                    "
                  >
                    Pre-generated AI scenarios
                  </div>


                  <p
                    className="
                      mt-2
                      text-[11px]
                      text-[#747987]
                    "
                  >
                    Curated consumer signals for
                    predictable demonstration flows.
                  </p>

                </div>


                <div
                  className="
                    rounded-full
                    border
                    border-white/[0.06]
                    bg-white/[0.015]
                    px-3
                    py-1.5
                    text-[9px]
                    uppercase
                    tracking-[.12em]
                    text-[#696E7C]
                  "
                >
                  10 scenarios
                </div>

              </div>


              <div
                className="
                  mt-6
                  grid
                  gap-4
                  md:grid-cols-2
                "
              >

                {PRELOADED_SCENARIOS.map(
                  (
                    scenario,
                    index
                  ) => (

                    <button
                      key={
                        scenario.id
                      }
                      onClick={() =>
                        runDemoScenario(
                          scenario
                        )
                      }
                      className="
                        group
                        flex
                        items-start
                        gap-5
                        rounded-[20px]
                        border
                        border-white/[0.06]
                        bg-white/[0.012]
                        p-5
                        text-left
                        transition
                        hover:-translate-y-0.5
                        hover:border-violet-400/20
                        hover:bg-violet-500/[0.025]
                      "
                    >

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-violet-400/12
                          bg-violet-500/[0.04]
                          text-[10px]
                          font-semibold
                          text-violet-300
                        "
                      >
                        {String(
                          index +
                            1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>


                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-4
                          "
                        >

                          <div>

                            <h3
                              className="
                                text-[14px]
                                font-semibold
                                tracking-[-0.02em]
                                text-[#EDEEF2]
                              "
                            >
                              {scenario.title}
                            </h3>


                            <div
                              className="
                                mt-1
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[.13em]
                                text-violet-300/60
                              "
                            >
                              {scenario.category_hint}
                            </div>

                          </div>


                          <ChevronRight
                            size={15}
                            className="
                              mt-1
                              shrink-0
                              text-[#555A68]
                              transition
                              group-hover:translate-x-0.5
                              group-hover:text-violet-300
                            "
                          />

                        </div>


                        <p
                          className="
                            mt-3
                            text-[11px]
                            leading-5
                            text-[#7B808E]
                          "
                        >
                          {scenario.signal}
                        </p>

                      </div>

                    </button>

                  )
                )}

              </div>

            </>

          )}


          {/* ===============================================
              LIVE AI MODE
              =============================================== */}

          {mode ===
            "ai" &&
            !result &&
            !loading && (

            <div
              className="
                relative
                mt-10
                overflow-hidden
                rounded-[28px]
                border
                border-violet-400/12
                bg-[#0B0D13]
                p-7
                md:p-8
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  right-[-100px]
                  top-[-100px]
                  h-[300px]
                  w-[300px]
                  rounded-full
                  bg-violet-500/[0.06]
                  blur-[90px]
                "
              />


              <div className="relative">

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[.16em]
                    text-violet-300
                  "
                >
                  <Bot
                    size={13}
                  />

                  Live AI analysis
                </div>


                <h2
                  className="
                    mt-3
                    text-[22px]
                    font-semibold
                    tracking-[-0.035em]
                    text-[#F0F1F4]
                  "
                >
                  What are you seeing in the market?
                </h2>


                <textarea
                  value={
                    signal
                  }
                  onChange={(
                    event
                  ) =>
                    setSignal(
                      event.target.value
                    )
                  }
                  placeholder="Describe an emerging consumer behaviour, search pattern, conversation or market signal..."
                  className="
                    mt-6
                    min-h-[175px]
                    w-full
                    resize-none
                    rounded-[18px]
                    border
                    border-white/[0.07]
                    bg-[#080A0F]
                    p-5
                    text-[15px]
                    leading-7
                    text-white
                    outline-none
                    placeholder:text-[#4D5260]
                    focus:border-violet-400/25
                  "
                />


                <div
                  className="
                    mt-5
                    flex
                    flex-col
                    justify-between
                    gap-4
                    sm:flex-row
                    sm:items-center
                  "
                >

                  <div
                    className="
                      max-w-[480px]
                      text-[10px]
                      leading-5
                      text-[#676C79]
                    "
                  >
                    The live model interprets only
                    the custom signal. Scoring,
                    workflow controls and downstream
                    execution remain deterministic.
                  </div>


                  <button
                    disabled={
                      !signal.trim()
                    }
                    onClick={
                      analyseWithAI
                    }
                    className="
                      flex
                      shrink-0
                      items-center
                      justify-center
                      gap-2.5
                      rounded-xl
                      bg-violet-500
                      px-5
                      py-3.5
                      text-[11px]
                      font-semibold
                      text-white
                      transition
                      hover:bg-violet-400
                      disabled:cursor-not-allowed
                      disabled:opacity-35
                    "
                  >
                    <Sparkles
                      size={14}
                    />

                    Analyse with AI
                  </button>

                </div>

              </div>

            </div>

          )}


          {/* ===============================================
              ANALYSIS STATE
              =============================================== */}

          {loading && (

            <div
              className="
                mt-10
                rounded-[26px]
                border
                border-violet-400/15
                bg-[#0B0D13]
                p-8
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-violet-400/20
                    bg-violet-500/[0.07]
                    text-violet-400
                  "
                >
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                </div>


                <div>

                  <div
                    className="
                      text-[14px]
                      font-medium
                      text-[#F1F2F5]
                    "
                  >
                    {mode ===
                    "ai"
                      ? "AI is analysing the signal"
                      : "Loading AI-generated scenario"}
                  </div>


                  <div
                    className="
                      mt-1
                      text-[10px]
                      text-[#737887]
                    "
                  >
                    Building a new
                    opportunity workspace
                  </div>

                </div>

              </div>


              <div
                className="
                  mt-7
                  grid
                  gap-3
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >

                {ANALYSIS_STEPS.map(
                  (
                    item,
                    index
                  ) => {

                    const complete =
                      index <
                      step;


                    const active =
                      index ===
                      step;


                    return (
                      <div
                        key={
                          item
                        }
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-[14px]
                          border
                          border-white/[0.055]
                          bg-white/[0.012]
                          px-4
                          py-3
                        "
                      >

                        <div
                          className={`
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-full
                            border

                            ${
                              complete
                                ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                                : active
                                ? "border-violet-400/25 bg-violet-500/[0.07] text-violet-300"
                                : "border-white/[0.06] text-[#4D5260]"
                            }
                          `}
                        >

                          {complete ? (

                            <Check
                              size={11}
                            />

                          ) : active ? (

                            <Loader2
                              size={11}
                              className="animate-spin"
                            />

                          ) : (

                            <TrendingUp
                              size={10}
                            />

                          )}

                        </div>


                        <span
                          className={`
                            text-[10px]

                            ${
                              active
                                ? "text-[#E4E5EA]"
                                : complete
                                ? "text-[#9296A3]"
                                : "text-[#565B68]"
                            }
                          `}
                        >
                          {item}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>


              <div
                className="
                  mt-7
                  h-[3px]
                  overflow-hidden
                  rounded-full
                  bg-white/[0.05]
                "
              >
                <div
                  className="
                    h-full
                    bg-gradient-to-r
                    from-violet-500
                    to-violet-300
                    transition-all
                    duration-500
                  "
                  style={{
                    width:
                      `${
                        ((step +
                          1) /
                          ANALYSIS_STEPS.length) *
                        100
                      }%`
                  }}
                />
              </div>

            </div>

          )}


          {/* ===============================================
              RESULT
              =============================================== */}

          {result &&
            !loading && (

            <div
              className="
                relative
                mt-10
                overflow-hidden
                rounded-[28px]
                border
                border-violet-400/15
                bg-gradient-to-br
                from-violet-500/[0.07]
                via-[#0E1017]
                to-[#090A0F]
                p-8
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  right-[-120px]
                  top-[-120px]
                  h-[340px]
                  w-[340px]
                  rounded-full
                  bg-violet-500/[0.07]
                  blur-[100px]
                "
              />


              <div className="relative">

                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[.17em]
                      text-emerald-300
                    "
                  >
                    <Check
                      size={13}
                    />

                    Opportunity created
                  </div>


                  <div
                    className="
                      rounded-full
                      border
                      border-white/[0.06]
                      bg-white/[0.015]
                      px-3
                      py-1.5
                      text-[9px]
                      uppercase
                      tracking-[.12em]
                      text-[#747987]
                    "
                  >
                    {result.analysis_source === "live_ai"
  ? "Live AI analysis"
  : result.analysis_source === "pre_generated_ai"
  ? "Pre-generated AI scenario"
  : "Analysis complete"}
                  </div>

                </div>


                <h2
                  className="
                    mt-5
                    text-[38px]
                    font-semibold
                    tracking-[-0.05em]
                    text-[#F4F5F8]
                  "
                >
                  {result.trend}
                </h2>


                <div
                  className="
                    mt-8
                    grid
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                  "
                >

                  {[
                    [
                      "Category",
                      result.category
                    ],

                    [
                      "Market",
                      result.market
                    ],

                    [
                      "Opportunity Score",
                      `${Number(
                        result.opportunity_score
                      ).toFixed(
                        1
                      )}/100`
                    ],

                    [
                      "Recommended Brand",
                      result.brand
                    ]

                  ].map(
                    (
                      [
                        label,
                        value
                      ]
                    ) => (

                      <div
                        key={
                          label
                        }
                        className="
                          rounded-[16px]
                          border
                          border-white/[0.055]
                          bg-white/[0.012]
                          p-5
                        "
                      >

                        <div
                          className="
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[.15em]
                            text-[#666B79]
                          "
                        >
                          {label}
                        </div>


                        <div
                          className="
                            mt-2
                            text-[16px]
                            font-medium
                            text-[#E4E5E9]
                          "
                        >
                          {value}
                        </div>

                      </div>

                    )
                  )}

                </div>


                <div
                  className="
                    mt-5
                    rounded-[18px]
                    border
                    border-white/[0.06]
                    bg-white/[0.012]
                    p-5
                  "
                >

                  <div
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[.15em]
                      text-[#666B79]
                    "
                  >
                    Consumer need
                  </div>


                  <p
                    className="
                      mt-3
                      max-w-[800px]
                      text-[13px]
                      leading-6
                      text-[#B3B6C0]
                    "
                  >
                    {result.consumer_need}
                  </p>

                </div>
                  
                  {result.analysis_rationale && (
  <div
    className="
      mt-4
      rounded-[18px]
      border
      border-violet-400/10
      bg-violet-500/[0.025]
      p-5
    "
  >
    <div
      className="
        flex
        items-center
        gap-2
        text-[9px]
        font-semibold
        uppercase
        tracking-[.15em]
        text-violet-300/80
      "
    >
      <Sparkles size={11} />

      AI interpretation
    </div>

    <p
      className="
        mt-3
        max-w-[820px]
        text-[12px]
        leading-6
        text-[#A6AAB5]
      "
    >
      {result.analysis_rationale}
    </p>
  </div>
)}

                <div
                  className="
                    mt-7
                    flex
                    flex-wrap
                    items-center
                    gap-3
                  "
                >

                  <button
                    onClick={() =>
                      router.push(
                        `/opportunity/${encodeURIComponent(
                          result.trend
                        )}`
                      )
                    }
                    className="
                      group
                      flex
                      items-center
                      gap-2.5
                      rounded-xl
                      bg-violet-500
                      px-5
                      py-3.5
                      text-[11px]
                      font-semibold
                      text-white
                      transition
                      hover:bg-violet-400
                    "
                  >
                    Open opportunity

                    <ArrowRight
                      size={14}
                      className="
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />
                  </button>


                  <button
                    onClick={() => {
                      setResult(
                        null
                      );

                      setSignal(
                        ""
                      );

                      setSelectedScenario(
                        null
                      );
                    }}
                    className="
                      rounded-xl
                      border
                      border-white/[0.07]
                      px-5
                      py-3.5
                      text-[10px]
                      text-[#858A99]
                      transition
                      hover:bg-white/[0.03]
                      hover:text-white
                    "
                  >
                    Create another
                  </button>

                </div>

              </div>

            </div>

          )}


          {error && (
  <div
    className="
      mt-6
      rounded-[18px]
      border
      border-rose-400/15
      bg-rose-400/[0.025]
      px-5
      py-4
    "
  >
    <div
      className="
        text-[11px]
        font-semibold
        text-rose-300
      "
    >
      Live AI is currently unavailable
    </div>

    <p
      className="
        mt-2
        max-w-[720px]
        text-[10px]
        leading-5
        text-[#8B8F9C]
      "
    >
      The live model could not complete this analysis.
      Check API access or billing, then try again.
      You can continue exploring the Studio using Demo Mode.
    </p>

    <button
      onClick={() => {
        setError("");
        switchMode("demo");
      }}
      className="
        mt-4
        rounded-lg
        border
        border-white/[0.07]
        bg-white/[0.02]
        px-4
        py-2.5
        text-[10px]
        font-medium
        text-[#C3C6CF]
        transition
        hover:border-violet-400/20
        hover:bg-violet-500/[0.04]
        hover:text-white
      "
    >
      Switch to Demo Mode
    </button>
  </div>
)}

        </section>

      </div>

    </main>
  );
}