"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  MapPin,
  Radio,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import TopNav from "@/components/TopNav";

import WorkflowProgress from "@/components/WorkflowProgress";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";


type LaunchMarket = {
  market: string;
  status: string;
  execution: string;
  channels: string[];
};


type LaunchResponse = {
  trend: string;
  brand: string;
  campaign: string;
  status: string;
  activated: boolean;
  markets: LaunchMarket[];
};


const ACTIVATION_STEPS = [
  "Packaging approved creative",
  "Preparing regional executions",
  "Connecting channel destinations",
  "Recording human approval",
  "Activating campaign",
];


function sleep(ms: number) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}


export default function LaunchPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const searchParams =
  useSearchParams();

  const fromRadar =
    searchParams.get("from") === "radar";
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
    useState<LaunchResponse | null>(
      null
    );


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    activating,
    setActivating
  ] =
    useState(false);


  const [
    activationStep,
    setActivationStep
  ] =
    useState(-1);


  const [
    error,
    setError
  ] =
    useState("");


  /* =====================================================
     LOAD ACTIVATION PACKAGE
     ===================================================== */

  useEffect(() => {

    async function loadLaunch() {

      try {

        const response =
          await fetch(
            `${API_BASE}/launch/${encodeURIComponent(
              trend
            )}`
          );


        if (!response.ok) {

          throw new Error(
            "Launch preparation failed"
          );
        }


        const result =
          await response.json();


        setData(
          result
        );


        setLoading(
          false
        );

      } catch {

        setError(
          "Could not prepare campaign activation."
        );

        setLoading(
          false
        );
      }
    }


    loadLaunch();

  }, [trend]);


  /* =====================================================
     ACTIVATE
     ===================================================== */

  async function activateCampaign() {

    if (
      !data ||
      data.activated
    ) {
      return;
    }


    try {

      setActivating(
        true
      );

      setActivationStep(
        0
      );


      await sleep(
        450
      );


      setActivationStep(
        1
      );


      await sleep(
        500
      );


      setActivationStep(
        2
      );


      const request =
        fetch(
          `${API_BASE}/launch/${encodeURIComponent(
            trend
          )}/activate`,
          {
            method:
              "POST",
          }
        );


      await sleep(
        550
      );


      setActivationStep(
        3
      );


      await sleep(
        550
      );


      const response =
        await request;


      if (!response.ok) {

        const responseData =
          await response.json();


        throw new Error(
          responseData?.detail ||
          "Activation failed"
        );
      }


      setActivationStep(
        4
      );


      await sleep(
        650
      );


      setData(
        (
          previous
        ) =>
          previous
            ? {
              ...previous,
              status:
                "Activated",
              activated:
                true,
            }
            : previous
      );


      setActivating(
        false
      );

      setActivationStep(
        -1
      );

    } catch (
    activationError
    ) {

      setActivating(
        false
      );

      setActivationStep(
        -1
      );


      setError(
        activationError instanceof Error
          ? activationError.message
          : "Could not activate campaign."
      );
    }
  }


  /* =====================================================
     LOADER
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

            <Rocket
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
            Preparing activation package
          </div>


          <div
            className="
              mt-2
              text-[12px]
              text-[#858A99]
            "
          >
            Loading approved campaign,
            regional executions and channels...
          </div>

        </div>

      </main>
    );
  }


  if (!data) {

  return (
    <main className="min-h-screen">

      <div className="page-shell">

        <TopNav />

        <WorkflowProgress
          active="launch"
          completed={false}
        />

        <div className="py-32 text-center">

          <div className="text-[14px] text-rose-300">
            {error || "Could not load campaign activation."}
          </div>

        </div>

      </div>

    </main>
  );
}


  /* =====================================================
     COUNTS
     ===================================================== */

  const totalChannels =
    data.markets.reduce(
      (
        total,
        market
      ) =>
        total +
        market.channels.length,

      0
    );


  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <main className="min-h-screen">

      <div className="page-shell">

        <TopNav />
        <WorkflowProgress active="launch" completed={data.activated} />

        <section className="pb-24 pt-8">


          {/* =================================================
              BACK
              ================================================= */}

          <button
            onClick={() => {
              if (fromRadar) {
                router.push("/explore");
              } else {
                router.back();
              }
            }}
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
            <ArrowLeft size={14} />

            {data.activated
              ? "Opportunity Radar"
              : "Governance Validation"}
          </button>


          {/* =================================================
              HEADER
              ================================================= */}

          <div className="mt-9">

            <div className="kicker">
              06 · Activate
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
                  Activation Control
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
                  border-emerald-400/15
                  bg-emerald-400/[0.05]
                  px-3.5
                  py-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[.13em]
                  text-emerald-300
                "
              >

                <ShieldCheck
                  size={13}
                />

                Human approval recorded

              </div>

            </div>

          </div>


          {/* =================================================
              MISSION CONTROL HERO
              ================================================= */}

          <section
            className="
              relative
              mt-9
              overflow-hidden
              rounded-[26px]
              border
              border-violet-400/15
              bg-gradient-to-br
              from-violet-500/[0.08]
              via-[#101119]
              to-[#090A0F]
              p-8
              md:p-9
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                right-[-100px]
                top-[-120px]
                h-[360px]
                w-[360px]
                rounded-full
                bg-violet-500/[0.08]
                blur-[110px]
              "
            />


            <div
              className="
                relative
                flex
                flex-col
                justify-between
                gap-8
                lg:flex-row
                lg:items-center
              "
            >

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[.17em]
                    text-violet-300/80
                  "
                >

                  {data.activated ? (

                    <CheckCircle2
                      size={13}
                      className="text-emerald-300"
                    />

                  ) : (

                    <Radio
                      size={13}
                    />

                  )}

                  Campaign status

                </div>


                <h2
                  className="
                    mt-4
                    text-[31px]
                    font-semibold
                    tracking-[-0.045em]
                    text-[#F5F5F8]
                    md:text-[36px]
                  "
                >
                  {data.activated
                    ? "Campaign is live"
                    : "Ready for activation"}
                </h2>


                <p
                  className="
                    mt-3
                    max-w-[680px]
                    text-[13px]
                    leading-6
                    text-[#8E93A2]
                  "
                >
                  {data.activated
                    ? "The approved campaign package has been activated across all prepared regional executions."
                    : "Governance is complete. The approved campaign package is ready to move into channel execution."}
                </p>


                <div
                  className="
                    mt-6
                    flex
                    flex-wrap
                    gap-3
                  "
                >

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
                      text-[10px]
                      text-[#A1A5B1]
                    "
                  >

                    <Check
                      size={12}
                      className="text-emerald-300"
                    />

                    AI validation complete

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
                      text-[10px]
                      text-[#A1A5B1]
                    "
                  >

                    <Check
                      size={12}
                      className="text-emerald-300"
                    />

                    Regional adaptations ready

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
                      text-[10px]
                      text-[#A1A5B1]
                    "
                  >

                    <Check
                      size={12}
                      className="text-emerald-300"
                    />

                    Human approval complete

                  </div>

                </div>

              </div>


              {!data.activated &&
                !activating && (

                  <button
                    onClick={
                      activateCampaign
                    }
                    className="
                    group
                    flex
                    shrink-0
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-violet-500
                    px-6
                    py-4
                    text-[12px]
                    font-semibold
                    text-white
                    transition
                    hover:bg-violet-400
                  "
                  >

                    <Rocket
                      size={16}
                    />

                    Launch campaign

                  </button>

                )}


              {data.activated && (

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-emerald-400/20
                    bg-emerald-400/[0.06]
                    px-5
                    py-4
                    text-[12px]
                    font-semibold
                    text-emerald-300
                  "
                >

                  <CheckCircle2
                    size={16}
                  />

                  Activated

                </div>

              )}

            </div>

          </section>


          {/* =================================================
              ACTIVATING VISUAL
              ================================================= */}

          {activating && (

            <section
              className="
                mt-6
                rounded-[22px]
                border
                border-violet-400/15
                bg-[#0B0D13]
                p-7
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

                  <Rocket
                    size={18}
                    className="animate-pulse"
                  />

                </div>


                <div>

                  <div
                    className="
                      text-[13px]
                      font-medium
                      text-[#F2F3F6]
                    "
                  >
                    Activating campaign
                  </div>


                  <div
                    className="
                      mt-1
                      text-[10px]
                      text-[#737887]
                    "
                  >
                    Signal-to-Campaign workflow completing
                  </div>

                </div>

              </div>


              <div
                className="
                  mt-7
                  grid
                  gap-3
                  md:grid-cols-5
                "
              >

                {ACTIVATION_STEPS.map(
                  (
                    step,
                    index
                  ) => {

                    const completed =
                      index <
                      activationStep;


                    const active =
                      index ===
                      activationStep;


                    return (
                      <div
                        key={
                          step
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
                          className={`
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-full
                            border
                            ${completed
                              ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300"
                              : active
                                ? "border-violet-400/30 bg-violet-500/[0.08] text-violet-300"
                                : "border-white/[0.07] text-[#515664]"
                            }
                          `}
                        >

                          {completed ? (

                            <Check
                              size={11}
                            />

                          ) : active ? (

                            <span
                              className="
                                h-1.5
                                w-1.5
                                animate-pulse
                                rounded-full
                                bg-violet-400
                              "
                            />

                          ) : (

                            <Circle
                              size={8}
                            />

                          )}

                        </div>


                        <div
                          className={`
                            mt-3
                            text-[10px]
                            leading-4
                            ${completed
                              ? "text-[#9EA2AF]"
                              : active
                                ? "text-[#E2E3E8]"
                                : "text-[#555A68]"
                            }
                          `}
                        >
                          {step}
                        </div>

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
                      `${((activationStep +
                        1) /
                        ACTIVATION_STEPS.length) *
                      100
                      }%`,
                  }}
                />

              </div>

            </section>

          )}


          {/* =================================================
              DEPLOYMENT METRICS
              ================================================= */}

          <div
            className="
              mt-7
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
                Regional executions
              </div>


              <div
                className="
                  mt-3
                  text-[31px]
                  font-semibold
                  tracking-[-0.045em]
                  text-[#F4F4F7]
                "
              >
                {data.markets.length}
              </div>


              <div
                className="
                  mt-2
                  text-[10px]
                  text-[#656A78]
                "
              >
                locally adapted markets
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
                Channel activations
              </div>


              <div
                className="
                  mt-3
                  text-[31px]
                  font-semibold
                  tracking-[-0.045em]
                  text-violet-400
                "
              >
                {totalChannels}
              </div>


              <div
                className="
                  mt-2
                  text-[10px]
                  text-[#656A78]
                "
              >
                across regional plans
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
                Governance
              </div>


              <div
                className="
                  mt-3
                  flex
                  items-center
                  gap-2
                  text-[18px]
                  font-semibold
                  text-emerald-300
                "
              >

                <ShieldCheck
                  size={17}
                />

                Approved

              </div>


              <div
                className="
                  mt-3
                  text-[10px]
                  text-[#656A78]
                "
              >
                human approval recorded
              </div>

            </div>

          </div>


          {/* =================================================
              REGIONAL EXECUTION CARDS
              ================================================= */}

          <div className="mt-10">

            <div
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[.17em]
                text-[#707584]
              "
            >
              Deployment plan
            </div>


            <h2
              className="
                mt-2
                text-[24px]
                font-semibold
                tracking-[-0.035em]
                text-[#F3F4F7]
              "
            >
              Regional executions
            </h2>

          </div>


          <div
            className="
              mt-6
              grid
              gap-5
              xl:grid-cols-3
            "
          >

            {data.markets.map(
              (
                market
              ) => (

                <article
                  key={
                    market.market
                  }
                  className="
                    panel
                    flex
                    min-h-[345px]
                    flex-col
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
                        Market
                      </div>


                      <h3
                        className="
                          mt-2
                          text-[24px]
                          font-semibold
                          tracking-[-0.04em]
                          text-[#F4F4F7]
                        "
                      >
                        {market.market}
                      </h3>

                    </div>


                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-white/[0.06]
                        bg-white/[0.02]
                        text-violet-400
                      "
                    >

                      <MapPin
                        size={15}
                      />

                    </div>

                  </div>


                  <div
                    className="
                      mt-6
                      border-t
                      border-white/[0.06]
                      pt-5
                    "
                  >

                    <div
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[.16em]
                        text-[#626775]
                      "
                    >
                      Approved execution
                    </div>


                    <p
                      className="
                        mt-3
                        text-[13px]
                        leading-6
                        text-[#A3A7B3]
                      "
                    >
                      “{market.execution}”
                    </p>

                  </div>


                  <div className="mt-6">

                    <div
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[.16em]
                        text-[#626775]
                      "
                    >
                      Channels
                    </div>


                    <div
                      className="
                        mt-3
                        flex
                        flex-wrap
                        gap-2
                      "
                    >

                      {market.channels.map(
                        (
                          channel
                        ) => (

                          <span
                            key={
                              channel
                            }
                            className="
                              rounded-full
                              border
                              border-white/[0.065]
                              bg-white/[0.018]
                              px-3
                              py-1.5
                              text-[10px]
                              text-[#999DAA]
                            "
                          >
                            {channel}
                          </span>

                        )
                      )}

                    </div>

                  </div>


                  <div
                    className={`
                      mt-auto
                      flex
                      items-center
                      gap-2
                      border-t
                      border-white/[0.06]
                      pt-5
                      text-[10px]
                      ${data.activated
                        ? "text-emerald-300"
                        : "text-[#777C8C]"
                      }
                    `}
                  >

                    {data.activated ? (

                      <>
                        <CheckCircle2
                          size={13}
                        />

                        Activated
                      </>

                    ) : (

                      <>
                        <Clock3
                          size={13}
                        />

                        Ready for activation
                      </>

                    )}

                  </div>

                </article>

              )
            )}

          </div>


          {/* =================================================
              FINAL COMPLETE STATE
              ================================================= */}

          {data.activated && (

            <section
              className="
                relative
                mt-8
                overflow-hidden
                rounded-[24px]
                border
                border-emerald-400/15
                bg-emerald-400/[0.03]
                p-8
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  right-[-100px]
                  top-[-100px]
                  h-[280px]
                  w-[280px]
                  rounded-full
                  bg-emerald-400/[0.05]
                  blur-[90px]
                "
              />


              <div
                className="
                  relative
                  flex
                  flex-col
                  justify-between
                  gap-6
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
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[.17em]
                      text-emerald-300
                    "
                  >

                    <CheckCircle2
                      size={13}
                    />

                    Signal-to-Campaign complete

                  </div>


                  <h3
                    className="
                      mt-3
                      text-[24px]
                      font-semibold
                      tracking-[-0.035em]
                      text-[#F3F3F6]
                    "
                  >
                    Campaign activated across {data.markets.length} markets
                  </h3>


                  <p
                    className="
                      mt-2
                      max-w-[650px]
                      text-[12px]
                      leading-5
                      text-[#858A99]
                    "
                  >
                    The signal has moved from consumer intelligence
                    to governed, localized campaign execution.
                  </p>

                </div>


                <button
                  onClick={() =>
                    router.push(
                      "/explore"
                    )
                  }
                  className="
                    shrink-0
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.02]
                    px-5
                    py-3.5
                    text-[11px]
                    font-medium
                    text-[#B6B9C3]
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  Return to Opportunity Radar
                </button>

              </div>

            </section>

          )}


          {error && (

            <div
              className="
                mt-5
                rounded-xl
                border
                border-rose-400/15
                bg-rose-400/[0.03]
                px-4
                py-3
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