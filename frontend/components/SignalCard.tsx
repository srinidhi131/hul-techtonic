"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Rocket,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";


const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";


export type Signal = {
  trend: string;
  category: string;
  market: string;
  consumer_need: string;
  opportunity_score: number;

  trend_velocity?: number;
  brand_relevance?: number;
  consumer_fit?: number;
  sentiment?: number;
  time_sensitivity?: number;

  growth?: string;
  window?: string;

  brand?: string;
  brand_reason?: string;
  insight_summary?: string;

  custom?: boolean;
  approved?: boolean;

  // NEW
  activated?: boolean;
};


export default function SignalCard({
  signal,
}: {
  signal: Signal;
}) {
  const router =
    useRouter();


  const [
    loading,
    setLoading
  ] =
    useState(false);


  const [
    confirmingDelete,
    setConfirmingDelete
  ] =
    useState(false);


  const [
    deleting,
    setDeleting
  ] =
    useState(false);


  const [
    deleteError,
    setDeleteError
  ] =
    useState("");


  // =====================================================
  // LOADER MESSAGES
  // =====================================================

  const LOADER_MESSAGES: Record<
    string,
    {
      title: string;
      subtitle: string;
    }
  > = {

    "#MonsoonHairCare": {
      title:
        "Analysing monsoon hair-care signals",

      subtitle:
        "Measuring humidity trends, consumer conversations and category relevance...",
    },


    "#SweatProofConfidence": {
      title:
        "Analysing confidence and perspiration signals",

      subtitle:
        "Evaluating consumer sentiment, social momentum and purchase intent...",
    },


    "#SkinCyclingIndia": {
      title:
        "Analysing skincare routine trends",

      subtitle:
        "Clustering skincare conversations and identifying emerging consumer behaviors...",
    },


    "#QuickCommerceBeauty": {
      title:
        "Analysing beauty commerce signals",

      subtitle:
        "Detecting convenience-driven purchasing patterns and time-sensitive opportunities...",
    },
  };


  const loader =
    signal.activated
      ? {
          title:
            "Opening activated campaign",

          subtitle:
            "Loading the final approved campaign package and deployment status...",
        }
      : LOADER_MESSAGES[
          signal.trend
        ] || {
          title:
            "Analysing signal",

          subtitle:
            "Scoring relevance, consumer fit and time sensitivity...",
        };


  // =====================================================
  // OPEN SIGNAL
  // =====================================================

  function openSignal() {
    if (
      loading ||
      confirmingDelete ||
      deleting
    ) {
      return;
    }


    setLoading(
      true
    );


    setTimeout(
      () => {

        // -----------------------------------------------
        // ACTIVATED:
        // Skip the workflow and open final page.
        // -----------------------------------------------

        if (
          signal.activated
        ) {

          router.push(
            `/launch/${encodeURIComponent(
              signal.trend
            )}`
          );

          return;
        }


        // -----------------------------------------------
        // NOT ACTIVATED:
        // Enter normal workflow.
        // -----------------------------------------------

        router.push(
          `/opportunity/${encodeURIComponent(
            signal.trend
          )}`
        );

      },
      650
    );
  }


  // =====================================================
  // KEYBOARD CARD ACCESS
  // =====================================================

  function handleKeyDown(
    event:
      React.KeyboardEvent<HTMLDivElement>
  ) {

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {

      event.preventDefault();

      openSignal();
    }
  }


  // =====================================================
  // OPEN DELETE CONFIRMATION
  // =====================================================

  function requestDelete(
    event:
      React.MouseEvent<HTMLButtonElement>
  ) {

    event.stopPropagation();


    // Activated opportunities are immutable.
    if (
      signal.activated
    ) {
      return;
    }


    setDeleteError(
      ""
    );


    setConfirmingDelete(
      true
    );
  }


  // =====================================================
  // DELETE
  // =====================================================

  async function deleteOpportunity() {

    try {

      setDeleting(
        true
      );


      setDeleteError(
        ""
      );


      const response =
        await fetch(
          `${API_BASE}/opportunity/${encodeURIComponent(
            signal.trend
          )}`,
          {
            method:
              "DELETE",
          }
        );


      if (
        !response.ok
      ) {

        const result =
          await response.json();


        throw new Error(
          result?.detail ||
          "Could not delete opportunity."
        );
      }


      setConfirmingDelete(
        false
      );


      setDeleting(
        false
      );


      // Re-renders the server Explore page
      // and fetches the updated /signals list.
      router.refresh();

    } catch (
      deleteError
    ) {

      setDeleting(
        false
      );


      setDeleteError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete opportunity."
      );
    }
  }


  // =====================================================
  // CARD
  // =====================================================
  const isLongTrend =
  signal.trend.length > 28;
  return (
    <>

      <div
        role="button"
        tabIndex={0}
        onClick={
          openSignal
        }
        onKeyDown={
          handleKeyDown
        }
        className={`
          panel
          group
          relative
          w-full
          cursor-pointer
          overflow-hidden
          rounded-[20px]
          p-6
          text-left
          transition-all
          duration-200
          hover:-translate-y-1
          focus:outline-none

          ${
            signal.activated
              ? `
                  border-emerald-400/20
                  bg-emerald-400/[0.025]
                  hover:border-emerald-400/35
                  hover:bg-emerald-400/[0.045]
                `
              : `
                  hover:border-violet-400/30
                  hover:bg-violet-500/[0.035]
                `
          }
        `}
      >

        {/* ===============================================
            HEADER
            =============================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >

          {/* STATUS */}

          {signal.activated ? (

            <span
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                border
                border-emerald-400/15
                bg-emerald-400/[0.06]
                px-2.5
                py-1
                text-[9px]
                font-semibold
                uppercase
                tracking-[.15em]
                text-emerald-300
              "
            >
              <CheckCircle2
                size={11}
              />

              Activated
            </span>

          ) : (

            <span
              className="
                rounded-full
                border
                border-white/[0.07]
                bg-white/[0.02]
                px-2.5
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-[.15em]
                text-[#858A99]
              "
            >
              Emerging signal
            </span>

          )}


          {/* ACTIONS */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            {/* DELETE ONLY BEFORE ACTIVATION */}

            {!signal.activated && (

              <button
                type="button"
                onClick={
                  requestDelete
                }
                aria-label={`Delete ${signal.trend}`}
                title="Delete opportunity"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.055]
                  bg-white/[0.01]
                  text-[#5F6472]
                  transition
                  hover:border-rose-400/20
                  hover:bg-rose-400/[0.045]
                  hover:text-rose-300
                "
              >
                <Trash2
                  size={13}
                />
              </button>

            )}


            {signal.activated ? (

              <Rocket
                size={16}
                className="
                  text-emerald-300
                  transition-transform
                  group-hover:translate-x-0.5
                "
              />

            ) : (

              <ArrowUpRight
                size={16}
                className="
                  text-[#686D7B]
                  transition-colors
                  group-hover:text-violet-400
                "
              />

            )}

          </div>

        </div>


        {/* ===============================================
            TREND
            =============================================== */}

        <h3
          className={`
            mt-5
            min-h-[72px]
            max-w-full
            overflow-hidden
            break-all
            font-semibold
            leading-[1.25]
            tracking-[-0.04em]

            ${
              isLongTrend
                ? "text-[16px]"
                : "text-[19px]"
            }

            ${
              signal.activated
                ? "text-[#F2F7F4]"
                : "text-[#F5F5F8]"
            }
          `}
        >
          {signal.trend}
        </h3>


        {/* ===============================================
            NEED
            =============================================== */}

        <p
          className="
            mt-3
            min-h-[48px]
            text-[13px]
            leading-6
            text-[#8D92A1]
          "
        >
          {signal.consumer_need}
        </p>


        {/* ===============================================
            SCORE + META
            =============================================== */}

        <div
          className="
            mt-7
            flex
            items-end
            justify-between
            gap-4
          "
        >

          <div>

            <div
              className="
                text-[10px]
                uppercase
                tracking-[.16em]
                text-[#6F7482]
              "
            >
              Opportunity score
            </div>


            <div
              className={`
                mt-1
                text-[31px]
                font-semibold
                tracking-[-0.04em]

                ${
                  signal.activated
                    ? "text-emerald-300"
                    : "text-violet-400"
                }
              `}
            >
              {signal.opportunity_score.toFixed(
                1
              )}

              <span
                className="
                  ml-1
                  text-[12px]
                  font-medium
                  text-[#696E7C]
                "
              >
                /100
              </span>

            </div>

          </div>


          <div
            className="
              space-y-2
              text-right
              text-[11px]
              text-[#777C8C]
            "
          >

            <div
              className="
                flex
                items-center
                justify-end
                gap-1.5
              "
            >
              <MapPin
                size={13}
              />

              {signal.market}
            </div>


            <div
              className="
                flex
                items-center
                justify-end
                gap-1.5
              "
            >
              <Clock3
                size={13}
              />

              {signal.activated
                ? "Campaign live"
                : signal.window ??
                  "Emerging"}
            </div>

          </div>

        </div>


        {/* ===============================================
            ACTIVATED FOOTER
            =============================================== */}

        {signal.activated && (

          <div
            className="
              mt-6
              flex
              items-center
              justify-between
              border-t
              border-emerald-400/10
              pt-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-medium
                text-emerald-300
              "
            >
              <CheckCircle2
                size={12}
              />

              Signal-to-Campaign complete
            </div>


            <div
              className="
                text-[9px]
                uppercase
                tracking-[.12em]
                text-[#647269]
              "
            >
              View activation
            </div>

          </div>

        )}

      </div>


      {/* =================================================
          DELETE CONFIRMATION
          ================================================= */}

      {confirmingDelete && (

        <div
          className="
            fixed
            inset-0
            z-[300]
            flex
            items-center
            justify-center
            bg-[#050609]/80
            px-5
            backdrop-blur-md
          "
          onClick={() => {

            if (
              !deleting
            ) {

              setConfirmingDelete(
                false
              );
            }

          }}
        >

          <div
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            className="
              w-full
              max-w-[440px]
              rounded-[24px]
              border
              border-white/[0.08]
              bg-[#0D0F15]
              p-7
              shadow-2xl
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

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-rose-400/15
                  bg-rose-400/[0.05]
                  text-rose-300
                "
              >
                <AlertTriangle
                  size={18}
                />
              </div>


              <button
                type="button"
                onClick={() =>
                  setConfirmingDelete(
                    false
                  )
                }
                disabled={
                  deleting
                }
                className="
                  text-[#676C79]
                  transition
                  hover:text-white
                  disabled:opacity-40
                "
              >
                <X
                  size={17}
                />
              </button>

            </div>


            <h3
              className="
                mt-6
                text-[20px]
                font-semibold
                tracking-[-0.03em]
                text-[#F4F4F7]
              "
            >
              Delete this opportunity?
            </h3>


            <p
              className="
                mt-3
                text-[12px]
                leading-6
                text-[#858A99]
              "
            >
              This will permanently remove
              the opportunity and its current
              campaign workflow from the Studio.
              Activated campaigns cannot be deleted.
            </p>


            <div
              className="
                mt-5
                rounded-[14px]
                border
                border-white/[0.06]
                bg-white/[0.015]
                px-4
                py-3
                text-[11px]
                text-[#B7BAC4]
              "
            >
              {signal.trend}
            </div>


            {deleteError && (

              <div
                className="
                  mt-4
                  rounded-lg
                  border
                  border-rose-400/10
                  bg-rose-400/[0.03]
                  px-3
                  py-2
                  text-[10px]
                  text-rose-300
                "
              >
                {deleteError}
              </div>

            )}


            <div
              className="
                mt-7
                flex
                justify-end
                gap-3
              "
            >

              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={() =>
                  setConfirmingDelete(
                    false
                  )
                }
                className="
                  rounded-lg
                  border
                  border-white/[0.08]
                  px-4
                  py-2.5
                  text-[10px]
                  text-[#969AA7]
                  transition
                  hover:bg-white/[0.03]
                  hover:text-white
                  disabled:opacity-40
                "
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={
                  deleteOpportunity
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-rose-500
                  px-4
                  py-2.5
                  text-[10px]
                  font-semibold
                  text-white
                  transition
                  hover:bg-rose-400
                  disabled:opacity-40
                "
              >
                <Trash2
                  size={12}
                />

                {deleting
                  ? "Deleting..."
                  : "Delete opportunity"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          FULL-SCREEN NAVIGATION OVERLAY
          ================================================= */}

      {loading && (

        <div
          className="
            fixed
            inset-0
            z-[400]
            flex
            items-center
            justify-center
            bg-[#07080D]/95
            backdrop-blur-xl
          "
        >

          <div className="text-center">

            <div
              className={`
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border

                ${
                  signal.activated
                    ? `
                        border-emerald-400/20
                        bg-emerald-400/[0.07]
                        text-emerald-300
                      `
                    : `
                        border-violet-400/20
                        bg-violet-500/[0.08]
                        text-violet-400
                      `
                }
              `}
            >

              {signal.activated ? (

                <Rocket
                  size={23}
                  className="animate-pulse"
                />

              ) : (

                <Sparkles
                  size={24}
                  className="animate-pulse"
                />

              )}

            </div>


            <div
              className="
                mt-6
                text-[16px]
                font-semibold
                tracking-[-0.02em]
                text-[#F5F5F8]
              "
            >
              {loader.title}
            </div>


            <div
              className="
                mt-2
                max-w-[430px]
                text-[12px]
                leading-5
                text-[#858A99]
              "
            >
              {loader.subtitle}
            </div>


            <div
              className="
                mx-auto
                mt-6
                h-[2px]
                w-[220px]
                overflow-hidden
                rounded-full
                bg-white/[0.06]
              "
            >

              <div
                className={`
                  h-full
                  w-1/2
                  animate-[pulse_1s_ease-in-out_infinite]
                  rounded-full

                  ${
                    signal.activated
                      ? "bg-emerald-400"
                      : "bg-violet-400"
                  }
                `}
              />

            </div>

          </div>

        </div>

      )}

    </>
  );
}