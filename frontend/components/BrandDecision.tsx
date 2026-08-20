"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  X,
} from "lucide-react";


type BrandOption = {
  brand: string;
  score: number;
  reason: string;
};


type Props = {
  trend: string;
  recommendedBrand: string;
  recommendedReason: string;
  alternatives: BrandOption[];
};


export default function BrandDecision({
  trend,
  recommendedBrand,
  recommendedReason,
  alternatives,
}: Props) {

  const [selectedBrand, setSelectedBrand] =
    useState(recommendedBrand);

  const [selectedReason, setSelectedReason] =
    useState(recommendedReason);

  const [showAlternatives, setShowAlternatives] =
    useState(false);

  const [humanChanged, setHumanChanged] =
    useState(false);


  function selectBrand(option: BrandOption) {

    setSelectedBrand(
      option.brand
    );

    setSelectedReason(
      option.reason
    );

    setHumanChanged(
      option.brand !== recommendedBrand
    );

    setShowAlternatives(
      false
    );
  }


  function restoreRecommendation() {

    setSelectedBrand(
      recommendedBrand
    );

    setSelectedReason(
      recommendedReason
    );

    setHumanChanged(
      false
    );

    setShowAlternatives(
      false
    );
  }


  return (
    <div className="flex h-full flex-col">

      {/* HEADER */}

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
          Brand match
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
          Recommended HUL brand
        </h2>

      </div>


      {/* AI RECOMMENDATION */}

      <div
        className="
          mt-8
          rounded-[20px]
          border
          border-violet-400/15
          bg-violet-500/[0.045]
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

          <div>

            <div
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[.15em]
                text-violet-300/70
              "
            >
              {humanChanged
                ? "Human-selected brand"
                : "AI recommendation"}
            </div>


            <div
              className="
                mt-2
                text-[31px]
                font-semibold
                tracking-[-0.045em]
                text-violet-300
              "
            >
              {selectedBrand}
            </div>

          </div>


          {humanChanged ? (

            <div
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                border
                border-amber-400/15
                bg-amber-400/[0.05]
                px-2.5
                py-1.5
                text-[9px]
                font-semibold
                text-amber-300
              "
            >
              <Check size={11} />

              Human override
            </div>

          ) : (

            <Sparkles
              size={18}
              className="text-violet-400"
            />

          )}

        </div>


        <p
          className="
            mt-4
            text-[13px]
            leading-6
            text-[#A0A4B1]
          "
        >
          {selectedReason}
        </p>

      </div>


      {/* HUMAN DECISION */}

      <div
        className="
          mt-5
          rounded-[18px]
          border
          border-white/[0.065]
          bg-white/[0.015]
          p-5
        "
      >

        <div
          className="
            text-[9px]
            font-semibold
            uppercase
            tracking-[.16em]
            text-[#737887]
          "
        >
          Human decision
        </div>


        <div
          className="
            mt-3
            text-[12px]
            font-medium
            text-[#E2E3E8]
          "
        >
          Is this the right HUL brand for the opportunity?
        </div>


        <div
          className="
            mt-5
            grid
            gap-3
            sm:grid-cols-2
          "
        >

          <button
            onClick={() =>
              setShowAlternatives(
                !showAlternatives
              )
            }
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.018]
              px-4
              py-3
              text-[11px]
              font-medium
              text-[#A7ABB7]
              transition
              hover:border-violet-400/20
              hover:bg-violet-500/[0.03]
              hover:text-white
            "
          >
            Change brand

            <ChevronDown
              size={14}
              className={`
                transition-transform
                ${
                  showAlternatives
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>


          <Link
            href={`/campaign/${encodeURIComponent(
              trend
            )}?brand=${encodeURIComponent(
              selectedBrand
            )}`}
            className="
              group
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-violet-500
              px-4
              py-3
              text-[11px]
              font-semibold
              text-white
              transition
              hover:bg-violet-400
            "
          >
            Continue with {selectedBrand}

            <ArrowRight
              size={14}
              className="
                transition-transform
                group-hover:translate-x-1
              "
            />
          </Link>

        </div>


        {/* ALTERNATIVES */}

        {showAlternatives && (

          <div
            className="
              mt-5
              border-t
              border-white/[0.06]
              pt-5
            "
          >

            <div
              className="
                mb-3
                text-[9px]
                font-semibold
                uppercase
                tracking-[.15em]
                text-[#626775]
              "
            >
              Alternative HUL matches
            </div>


            <div className="space-y-2">

              {alternatives.map(
                (
                  option
                ) => (

                  <button
                    key={
                      option.brand
                    }
                    onClick={() =>
                      selectBrand(
                        option
                      )
                    }
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-[14px]
                      border
                      border-white/[0.055]
                      bg-white/[0.012]
                      px-4
                      py-3
                      text-left
                      transition
                      hover:border-violet-400/20
                      hover:bg-violet-500/[0.025]
                    "
                  >

                    <div>

                      <div
                        className="
                          text-[12px]
                          font-medium
                          text-[#E1E3E8]
                        "
                      >
                        {option.brand}
                      </div>


                      <div
                        className="
                          mt-1
                          text-[10px]
                          text-[#6F7482]
                        "
                      >
                        {option.reason}
                      </div>

                    </div>


                    <div
                      className="
                        shrink-0
                        pl-4
                        text-[12px]
                        font-semibold
                        text-violet-400
                      "
                    >
                      {option.score}%
                    </div>

                  </button>

                )
              )}

            </div>


            {humanChanged && (

              <button
                onClick={
                  restoreRecommendation
                }
                className="
                  mt-4
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  text-[#777C8C]
                  transition
                  hover:text-white
                "
              >
                <X size={11} />

                Restore AI recommendation
              </button>

            )}

          </div>

        )}

      </div>


      <div
        className="
          mt-auto
          pt-6
          text-[10px]
          leading-5
          text-[#5F6472]
        "
      >
        AI recommends. Brand Manager decides.
      </div>

    </div>
  );
}