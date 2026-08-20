"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  History,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import TopNav from "@/components/TopNav";
import WorkflowProgress from "@/components/WorkflowProgress";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";


type GovernanceCheck = {
  name: string;
  status: "pass" | "review" | "escalate";
  detail: string;
};


type GovernanceMarket = {
  market: string;
  overall_status: "pass" | "review" | "escalate";
  checks: GovernanceCheck[];
};


type GovernanceResponse = {
  trend: string;
  brand: string;
  campaign: string;

  decision: string | null;
  feedback: string | null;
  route_to: string | null;

  markets: GovernanceMarket[];
};


type Revision = {
  version: number;
  target: string;
  feedback: string;
  before: string;
  after: string;
  field: string;
  status: string;
};


const REGEN_STEPS = [
  "Analysing reviewer feedback",
  "Preserving approved strategy",
  "Regenerating affected content",
  "Re-running governance checks",
];


function sleep(ms: number) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}


export default function GovernancePage() {
  const params =
    useParams();

  const router =
    useRouter();


  const trend =
    decodeURIComponent(
      Array.isArray(params.trend)
        ? params.trend[0]
        : (params.trend as string)
    );


  const [
    data,
    setData
  ] =
    useState<GovernanceResponse | null>(
      null
    );


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    feedback,
    setFeedback
  ] =
    useState("");


  const [
    routeTo,
    setRouteTo
  ] =
    useState("");


  const [
    regenerating,
    setRegenerating
  ] =
    useState(false);


  const [
    regenerationStep,
    setRegenerationStep
  ] =
    useState(-1);


  const [
    latestRevision,
    setLatestRevision
  ] =
    useState<Revision | null>(
      null
    );


  const [
    revisions,
    setRevisions
  ] =
    useState<Revision[]>(
      []
    );


  const [
    approved,
    setApproved
  ] =
    useState(false);


  const [
    approving,
    setApproving
  ] =
    useState(false);


  /* =====================================================
     LOAD GOVERNANCE
     ===================================================== */

  useEffect(() => {

    async function loadGovernance() {

      try {

        const response =
          await fetch(
            `${API_BASE}/governance/${encodeURIComponent(
              trend
            )}`
          );


        if (!response.ok) {

          throw new Error(
            "Governance loading failed"
          );
        }


        const result =
          await response.json();


        setData(
          result
        );


        if (
          result.decision ===
          "approve"
        ) {

          setApproved(
            true
          );
        }


        const stateResponse =
          await fetch(
            `${API_BASE}/state/${encodeURIComponent(
              trend
            )}`
          );


        if (
          stateResponse.ok
        ) {

          const state =
            await stateResponse.json();


          setRevisions(
            state?.governance?.revisions ??
            []
          );
        }


        setLoading(
          false
        );

      } catch {

        setError(
          "Could not load governance validation."
        );

        setLoading(
          false
        );
      }
    }


    loadGovernance();

  }, [trend]);


  /* =====================================================
     REGENERATE
     ===================================================== */

  async function regenerate() {

    if (
      !feedback.trim() ||
      !routeTo
    ) {

      return;
    }


    setRegenerating(
      true
    );

    setLatestRevision(
      null
    );

    setRegenerationStep(
      0
    );


    try {

      await sleep(
        500
      );


      setRegenerationStep(
        1
      );


      await sleep(
        500
      );


      const request =
        fetch(
          `${API_BASE}/governance/${encodeURIComponent(
            trend
          )}/regenerate`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                feedback,
                route_to:
                  routeTo,
              }),
          }
        );


      setRegenerationStep(
        2
      );


      await sleep(
        650
      );


      const response =
        await request;


      if (
        !response.ok
      ) {

        throw new Error(
          "Regeneration failed"
        );
      }


      const result:
        Revision =
          await response.json();


      setRegenerationStep(
        3
      );


      await sleep(
        650
      );


      setLatestRevision(
        result
      );


      setRevisions(
        (
          previous
        ) => [
          ...previous,
          result,
        ]
      );


      setFeedback(
        ""
      );

      setRouteTo(
        ""
      );


      // Campaign has changed, so any previous
      // approval is invalidated.

      setApproved(
        false
      );


      setRegenerating(
        false
      );

      setRegenerationStep(
        -1
      );

    } catch {

      setRegenerating(
        false
      );

      setRegenerationStep(
        -1
      );

      setError(
        "Could not regenerate the selected section."
      );
    }
  }


  /* =====================================================
     APPROVE
     ===================================================== */

  async function approveCampaign() {

    try {

      setApproving(
        true
      );


      const response =
        await fetch(
          `${API_BASE}/governance/${encodeURIComponent(
            trend
          )}/decision`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                decision:
                  "approve",

                feedback:
                  null,

                route_to:
                  null,
              }),
          }
        );


      if (
        !response.ok
      ) {

        throw new Error(
          "Approval failed"
        );
      }


      await sleep(
        500
      );


      setApproved(
        true
      );


      setApproving(
        false
      );

    } catch {

      setApproving(
        false
      );

      setError(
        "Could not approve campaign."
      );
    }
  }


  /* =====================================================
     STATUS STYLE
     ===================================================== */

  function statusStyle(
    status: string
  ) {

    if (
      status === "pass"
    ) {

      return {
        icon:
          <CheckCircle2
            size={14}
          />,

        label:
          "PASS",

        className:
          "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300",
      };
    }


    if (
      status === "escalate"
    ) {

      return {
        icon:
          <AlertTriangle
            size={14}
          />,

        label:
          "ESCALATE",

        className:
          "border-rose-400/15 bg-rose-400/[0.05] text-rose-300",
      };
    }


    return {
      icon:
        <AlertTriangle
          size={14}
        />,

      label:
        "REVIEW",

      className:
        "border-amber-400/15 bg-amber-400/[0.05] text-amber-300",
    };
  }


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {

    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#07080D]
        "
      >

        <div className="text-center">

          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-violet-400/20
              bg-violet-500/[0.08]
              text-violet-400
            "
          >

            <ShieldCheck
              size={24}
              className="animate-pulse"
            />

          </div>


          <div
            className="
              mt-6
              text-[16px]
              font-semibold
              text-[#F5F5F8]
            "
          >
            Running governance checks
          </div>


          <div
            className="
              mt-2
              text-[12px]
              text-[#858A99]
            "
          >
            Validating claims, brand tone,
            language and cultural relevance...
          </div>

        </div>

      </main>
    );
  }


  if (
    !data
  ) {

    return null;
  }


  /* =====================================================
     REVIEW COUNT
     ===================================================== */

  const reviewCount =
    data.markets.reduce(
      (
        total,
        market
      ) =>
        total +
        market.checks.filter(
          (check) =>
            check.status !==
            "pass"
        ).length,

      0
    );


  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <main className="min-h-screen">

      <div className="page-shell">

        <TopNav />
        <WorkflowProgress active="govern" />

        <section className="pb-24 pt-8">


          {/* BACK */}

          <button
            onClick={() =>
              router.back()
            }
            className="
              flex
              items-center
              gap-2
              text-[12px]
              text-[#777C8C]
              transition
              hover:text-white
            "
          >

            <ArrowLeft
              size={14}
            />

            Regional Campaign Studio

          </button>


          {/* HEADER */}

          <div className="mt-9">

            <div className="kicker">
              05 · Govern
            </div>


            <div
              className="
                mt-4
                flex
                flex-col
                justify-between
                gap-6
                md:flex-row
                md:items-end
              "
            >

              <div>

                <h1
                  className="
                    text-[46px]
                    font-medium
                    tracking-[-0.05em]
                    text-[#F8F8FB]
                  "
                >
                  Governance Validation
                </h1>


                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    items-center
                    gap-3
                    text-[13px]
                  "
                >

                  <span className="text-[#8D92A1]">
                    {data.trend}
                  </span>


                  <span className="text-[#525765]">
                    ×
                  </span>


                  <span
                    className="
                      font-semibold
                      text-violet-400
                    "
                  >
                    {data.brand}
                  </span>


                  <span className="text-[#525765]">
                    ·
                  </span>


                  <span className="text-[#777C8C]">
                    {data.campaign}
                  </span>

                </div>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-violet-400/15
                  bg-violet-500/[0.05]
                  px-3.5
                  py-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[.13em]
                  text-violet-300
                "
              >

                <Sparkles
                  size={13}
                />

                AI pre-check complete

              </div>

            </div>

          </div>


          {/* SUMMARY */}

          <div
            className="
              mt-9
              grid
              gap-5
              md:grid-cols-3
            "
          >

            <div
              className="
                panel
                rounded-[20px]
                p-6
              "
            >

              <div
                className="
                  text-[10px]
                  uppercase
                  tracking-[.16em]
                  text-[#6F7482]
                "
              >
                Markets validated
              </div>


              <div
                className="
                  mt-3
                  text-[30px]
                  font-semibold
                  tracking-[-0.04em]
                  text-[#F4F4F7]
                "
              >
                {data.markets.length}
              </div>

            </div>


            <div
              className="
                panel
                rounded-[20px]
                p-6
              "
            >

              <div
                className="
                  text-[10px]
                  uppercase
                  tracking-[.16em]
                  text-[#6F7482]
                "
              >
                Items requiring review
              </div>


              <div
                className="
                  mt-3
                  text-[30px]
                  font-semibold
                  tracking-[-0.04em]
                  text-amber-300
                "
              >
                {reviewCount}
              </div>

            </div>


            <div
              className="
                panel
                rounded-[20px]
                p-6
              "
            >

              <div
                className="
                  text-[10px]
                  uppercase
                  tracking-[.16em]
                  text-[#6F7482]
                "
              >
                Human revisions
              </div>


              <div
                className="
                  mt-3
                  text-[30px]
                  font-semibold
                  tracking-[-0.04em]
                  text-violet-400
                "
              >
                {revisions.length}
              </div>

            </div>

          </div>


          {/* MARKET VALIDATION */}

          <div
            className="
              mt-7
              grid
              gap-5
              xl:grid-cols-3
            "
          >

            {data.markets.map(
              (
                market
              ) => {

                const overall =
                  statusStyle(
                    market.overall_status
                  );


                return (
                  <article
                    key={
                      market.market
                    }
                    className="
                      panel
                      rounded-[22px]
                      p-6
                    "
                  >

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >

                      <div>

                        <div
                          className="
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[.16em]
                            text-[#666B79]
                          "
                        >
                          Market validation
                        </div>


                        <h2
                          className="
                            mt-2
                            text-[23px]
                            font-semibold
                            tracking-[-0.04em]
                            text-[#F4F4F7]
                          "
                        >
                          {market.market}
                        </h2>

                      </div>


                      <span
                        className={`
                          flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          px-2.5
                          py-1.5
                          text-[8px]
                          font-semibold
                          ${overall.className}
                        `}
                      >

                        {overall.icon}

                        {overall.label}

                      </span>

                    </div>


                    <div
                      className="
                        mt-6
                        space-y-3
                        border-t
                        border-white/[0.06]
                        pt-5
                      "
                    >

                      {market.checks.map(
                        (
                          check
                        ) => {

                          const style =
                            statusStyle(
                              check.status
                            );


                          return (
                            <div
                              key={
                                check.name
                              }
                              className="
                                rounded-[14px]
                                border
                                border-white/[0.055]
                                bg-white/[0.012]
                                p-4
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-center
                                  justify-between
                                  gap-3
                                "
                              >

                                <div
                                  className="
                                    text-[11px]
                                    font-medium
                                    text-[#DFE1E7]
                                  "
                                >
                                  {check.name}
                                </div>


                                <span
                                  className={`
                                    rounded-full
                                    border
                                    px-2
                                    py-1
                                    text-[7px]
                                    font-semibold
                                    ${style.className}
                                  `}
                                >
                                  {style.label}
                                </span>

                              </div>


                              <p
                                className="
                                  mt-2
                                  text-[10px]
                                  leading-5
                                  text-[#747987]
                                "
                              >
                                {check.detail}
                              </p>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </article>
                );
              }
            )}

          </div>


          {/* =================================================
              HUMAN DECISION
              ================================================= */}

          <section
            className="
              mt-8
              rounded-[24px]
              border
              border-violet-400/15
              bg-gradient-to-br
              from-violet-500/[0.065]
              via-[#101119]
              to-[#0C0D13]
              p-8
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <MessageSquare
                size={18}
                className="text-violet-400"
              />


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
                  Human decision point
                </div>


                <h2
                  className="
                    mt-1
                    text-[23px]
                    font-semibold
                    tracking-[-0.035em]
                    text-[#F4F4F7]
                  "
                >
                  Review, revise or approve
                </h2>

              </div>

            </div>


            {!approved && (

              <>
                {/* FEEDBACK */}

                <div
                  className="
                    mt-7
                    grid
                    gap-5
                    lg:grid-cols-[1.25fr_.75fr]
                  "
                >

                  <div>

                    <div
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[.15em]
                        text-[#737887]
                      "
                    >
                      What needs to change?
                    </div>


                    <textarea
                      value={
                        feedback
                      }
                      onChange={(
                        e
                      ) =>
                        setFeedback(
                          e.target.value
                        )
                      }
                      disabled={
                        regenerating
                      }
                      placeholder="Example: Reduce the humidity-performance claim and make the copy feel more emotional."
                      className="
                        mt-3
                        min-h-[130px]
                        w-full
                        resize-none
                        rounded-[16px]
                        border
                        border-white/[0.08]
                        bg-[#0D0F15]
                        p-4
                        text-[13px]
                        leading-6
                        text-white
                        outline-none
                        placeholder:text-[#555A68]
                        focus:border-violet-400/30
                        disabled:opacity-40
                      "
                    />

                  </div>


                  <div>

                    <div
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[.15em]
                        text-[#737887]
                      "
                    >
                      Apply changes to
                    </div>


                    <div
                      className="
                        mt-3
                        space-y-2
                      "
                    >

                      {[
                        "Campaign Brief",
                        "Kerala",
                        "Tamil Nadu",
                        "Karnataka Urban",
                      ].map(
                        (
                          target
                        ) => (

                          <button
                            key={
                              target
                            }
                            disabled={
                              regenerating
                            }
                            onClick={() =>
                              setRouteTo(
                                target
                              )
                            }
                            className={`
                              flex
                              w-full
                              items-center
                              justify-between
                              rounded-xl
                              border
                              px-4
                              py-3
                              text-left
                              text-[11px]
                              transition
                              ${
                                routeTo ===
                                target
                                  ? "border-violet-400/40 bg-violet-500/[0.07] text-white"
                                  : "border-white/[0.07] bg-white/[0.015] text-[#9296A4] hover:border-violet-400/20"
                              }
                            `}
                          >

                            {target}


                            {routeTo ===
                              target && (

                              <Check
                                size={13}
                                className="text-violet-400"
                              />

                            )}

                          </button>

                        )
                      )}

                    </div>

                  </div>

                </div>


                {/* REGEN BUTTON */}

                {!regenerating && (

                  <div
                    className="
                      mt-6
                      flex
                      flex-wrap
                      items-center
                      gap-3
                    "
                  >

                    <button
                      disabled={
                        !feedback.trim() ||
                        !routeTo
                      }
                      onClick={
                        regenerate
                      }
                      className="
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
                        disabled:cursor-not-allowed
                        disabled:opacity-35
                      "
                    >

                      <RefreshCw
                        size={14}
                      />

                      Regenerate selected section

                    </button>


                    <span
                      className="
                        text-[10px]
                        text-[#666B79]
                      "
                    >
                      Only the selected section will change.
                    </span>

                  </div>

                )}


                {/* =============================================
                    VISUAL REGENERATION
                    ============================================= */}

                {regenerating && (

                  <div
                    className="
                      mt-7
                      rounded-[20px]
                      border
                      border-violet-400/15
                      bg-[#0B0D13]
                      p-6
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-violet-400/20
                          bg-violet-500/[0.07]
                          text-violet-400
                        "
                      >

                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />

                      </div>


                      <div>

                        <div
                          className="
                            text-[13px]
                            font-medium
                            text-[#F1F2F5]
                          "
                        >
                          Regenerating {routeTo}
                        </div>


                        <div
                          className="
                            mt-1
                            text-[10px]
                            text-[#737887]
                          "
                        >
                          Applying Brand Manager feedback
                        </div>

                      </div>

                    </div>


                    <div
                      className="
                        mt-6
                        space-y-3
                      "
                    >

                      {REGEN_STEPS.map(
                        (
                          step,
                          index
                        ) => {

                          const completed =
                            index <
                            regenerationStep;


                          const active =
                            index ===
                            regenerationStep;


                          return (
                            <div
                              key={
                                step
                              }
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <div
                                className={`
                                  flex
                                  h-5
                                  w-5
                                  items-center
                                  justify-center
                                  rounded-full
                                  border
                                  ${
                                    completed
                                      ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300"
                                      : active
                                      ? "border-violet-400/30 bg-violet-500/[0.08] text-violet-300"
                                      : "border-white/[0.07] text-[#515664]"
                                  }
                                `}
                              >

                                {completed ? (
                                  <Check
                                    size={10}
                                  />
                                ) : (
                                  <span
                                    className={`
                                      h-1.5
                                      w-1.5
                                      rounded-full
                                      ${
                                        active
                                          ? "animate-pulse bg-violet-400"
                                          : "bg-[#515664]"
                                      }
                                    `}
                                  />
                                )}

                              </div>


                              <span
                                className={`
                                  text-[11px]
                                  ${
                                    completed
                                      ? "text-[#9EA2AF]"
                                      : active
                                      ? "text-[#E2E3E8]"
                                      : "text-[#555A68]"
                                  }
                                `}
                              >
                                {step}
                              </span>

                            </div>
                          );
                        }
                      )}

                    </div>


                    <div
                      className="
                        mt-6
                        h-[3px]
                        overflow-hidden
                        rounded-full
                        bg-white/[0.06]
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
                              ((regenerationStep +
                                1) /
                                REGEN_STEPS.length) *
                              100
                            }%`,
                        }}
                      />

                    </div>

                  </div>

                )}


                {/* =============================================
                    BEFORE / AFTER
                    ============================================= */}

                {latestRevision &&
                  !regenerating && (

                  <div
                    className="
                      mt-7
                      rounded-[20px]
                      border
                      border-emerald-400/15
                      bg-emerald-400/[0.025]
                      p-6
                    "
                  >

                    <div
                      className="
                        flex
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
                          text-[12px]
                          font-medium
                          text-emerald-300
                        "
                      >

                        <CheckCircle2
                          size={15}
                        />

                        {latestRevision.target} regenerated

                      </div>


                      <div
                        className="
                          rounded-full
                          border
                          border-white/[0.07]
                          px-2.5
                          py-1
                          text-[9px]
                          text-[#747987]
                        "
                      >
                        V{latestRevision.version}
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

                      <div
                        className="
                          rounded-[15px]
                          border
                          border-white/[0.06]
                          bg-black/10
                          p-4
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
                          Before
                        </div>


                        <p
                          className="
                            mt-3
                            text-[12px]
                            leading-6
                            text-[#828795]
                          "
                        >
                          {latestRevision.before}
                        </p>

                      </div>


                      <div
                        className="
                          rounded-[15px]
                          border
                          border-violet-400/12
                          bg-violet-500/[0.035]
                          p-4
                        "
                      >

                        <div
                          className="
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[.15em]
                            text-violet-300/70
                          "
                        >
                          After
                        </div>


                        <p
                          className="
                            mt-3
                            text-[12px]
                            leading-6
                            text-[#E3E4E9]
                          "
                        >
                          {latestRevision.after}
                        </p>

                      </div>

                    </div>


                    <div
                      className="
                        mt-4
                        text-[10px]
                        leading-5
                        text-[#717684]
                      "
                    >
                      Feedback applied: “{latestRevision.feedback}”
                    </div>


                    <div
                      className="
                        mt-5
                        flex
                        items-center
                        gap-2
                        text-[10px]
                        text-violet-300
                      "
                    >

                      <RefreshCw
                        size={11}
                      />

                      You can request another regeneration before approval.

                    </div>

                  </div>

                )}


                {/* =============================================
                    REVISION HISTORY
                    ============================================= */}

                {revisions.length >
                  0 && (

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
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <History
                        size={14}
                        className="text-violet-400"
                      />


                      <div
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[.16em]
                          text-[#737887]
                        "
                      >
                        Revision history
                      </div>

                    </div>


                    <div
                      className="
                        mt-4
                        space-y-2
                      "
                    >

                      {revisions
                        .slice()
                        .reverse()
                        .map(
                          (
                            revision
                          ) => (

                            <div
                              key={
                                `${revision.version}-${revision.target}`
                              }
                              className="
                                flex
                                items-center
                                justify-between
                                gap-4
                                rounded-xl
                                border
                                border-white/[0.055]
                                bg-white/[0.012]
                                px-4
                                py-3
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-3
                                "
                              >

                                <div
                                  className="
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-violet-500/[0.06]
                                    text-[9px]
                                    font-semibold
                                    text-violet-300
                                  "
                                >
                                  V{revision.version}
                                </div>


                                <div>

                                  <div
                                    className="
                                      text-[11px]
                                      text-[#D7D9E0]
                                    "
                                  >
                                    {revision.target}
                                  </div>


                                  <div
                                    className="
                                      mt-0.5
                                      text-[9px]
                                      text-[#666B79]
                                    "
                                  >
                                    Human feedback applied
                                  </div>

                                </div>

                              </div>


                              <CheckCircle2
                                size={13}
                                className="text-emerald-300"
                              />

                            </div>

                          )
                        )}

                    </div>

                  </div>

                )}


                {/* APPROVE */}

                <div
                  className="
                    mt-8
                    border-t
                    border-white/[0.06]
                    pt-6
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      justify-between
                      gap-5
                      md:flex-row
                      md:items-center
                    "
                  >

                    <div>

                      <div
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[.15em]
                          text-[#737887]
                        "
                      >
                        Final human decision
                      </div>


                      <div
                        className="
                          mt-2
                          text-[14px]
                          font-medium
                          text-[#E2E3E8]
                        "
                      >
                        Approve the current campaign version?
                      </div>

                    </div>


                    <button
                      disabled={
                        regenerating ||
                        approving
                      }
                      onClick={
                        approveCampaign
                      }
                      className="
                        flex
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
                        disabled:opacity-40
                      "
                    >

                      {approving ? (
                        <RefreshCw
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <ShieldCheck
                          size={14}
                        />
                      )}

                      {approving
                        ? "Recording approval..."
                        : "Approve current version"}

                    </button>

                  </div>

                </div>

              </>

            )}


            {/* ===============================================
                APPROVED STATE
                =============================================== */}

            {approved && (

              <div
                className="
                  mt-7
                  rounded-[20px]
                  border
                  border-emerald-400/15
                  bg-emerald-400/[0.035]
                  p-6
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    justify-between
                    gap-5
                    md:flex-row
                    md:items-center
                  "
                >

                  <div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-[11px]
                        font-semibold
                        text-emerald-300
                      "
                    >

                      <CheckCircle2
                        size={15}
                      />

                      Governance approved

                    </div>


                    <h3
                      className="
                        mt-3
                        text-[20px]
                        font-semibold
                        tracking-[-0.03em]
                        text-[#F2F3F6]
                      "
                    >
                      Campaign ready for activation
                    </h3>


                    <p
                      className="
                        mt-2
                        text-[11px]
                        leading-5
                        text-[#7E8391]
                      "
                    >
                      Current campaign version has
                      completed AI validation and
                      human approval.
                    </p>

                  </div>


                  <button
                    onClick={() =>
                      router.push(
                        `/launch/${encodeURIComponent(
                          trend
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
                    Continue to activation

                    <ArrowRight
                      size={15}
                      className="
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />

                  </button>

                </div>

              </div>

            )}

          </section>


          {error && (

            <div
              className="
                mt-5
                text-[11px]
                text-rose-300
              "
            >
              {error}
            </div>

          )}

        </section>

      </div>

    </main>
  );
}