"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Languages,
  LockKeyhole,
  MapPin,
  Pencil,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import TopNav from "@/components/TopNav";
import WorkflowProgress from "@/components/WorkflowProgress";

type LocalVariant = {
  market: string;
  language: string;
  theme: string;
  consumer_context: string;
  tagline: string;
  rationale: string;
  channels: string[];
};


type LocalizationResponse = {
  trend: string;
  brand: string;
  campaign: string;
  variants: LocalVariant[];
};


type EditableField =
  | "language"
  | "theme"
  | "consumer_context"
  | "tagline";


type EditingState = {
  market: string;
  field: EditableField | "channels";
} | null;


export default function LocalizationPage() {
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
    useState<LocalizationResponse | null>(
      null
    );


  const [
    draftData,
    setDraftData
  ] =
    useState<LocalizationResponse | null>(
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
    editing,
    setEditing
  ] =
    useState<EditingState>(
      null
    );


  const [
    editedMarkets,
    setEditedMarkets
  ] =
    useState<string[]>(
      []
    );


  const [
    regeneratingMarket,
    setRegeneratingMarket
  ] =
    useState<string | null>(
      null
    );


  // =====================================================
  // LOAD LOCALIZATION
  // =====================================================

  useEffect(() => {
    async function loadLocalization() {
      try {
        setLoading(
          true
        );

        const API_BASE =
          process.env
            .NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:8000";

        const response =
          await fetch(
            `${API_BASE}/localize/${encodeURIComponent(
              trend
            )}`
          );

        if (!response.ok) {
          throw new Error(
            "Localization failed"
          );
        }

        const result =
          await response.json();

        setTimeout(
          () => {
            setData(
              result
            );

            setDraftData(
              result
            );

            setLoading(
              false
            );
          },
          650
        );

      } catch {
        setError(
          "Could not generate regional variants."
        );

        setLoading(
          false
        );
      }
    }

    loadLocalization();

  }, [trend]);


  // =====================================================
  // HELPERS
  // =====================================================

  function markMarketEdited(
    market: string
  ) {
    if (
      !editedMarkets.includes(
        market
      )
    ) {
      setEditedMarkets(
        [
          ...editedMarkets,
          market
        ]
      );
    }
  }


  function startEditing(
    market: string,
    field: EditableField | "channels"
  ) {
    if (!data) {
      return;
    }

    setDraftData({
      ...data,
      variants:
        data.variants.map(
          (variant) => ({
            ...variant,
            channels: [
              ...variant.channels
            ]
          })
        )
    });

    setEditing({
      market,
      field
    });
  }


  function cancelEditing() {
    if (data) {
      setDraftData({
        ...data,
        variants:
          data.variants.map(
            (variant) => ({
              ...variant,
              channels: [
                ...variant.channels
              ]
            })
          )
      });
    }

    setEditing(
      null
    );
  }


  function updateDraftField(
    market: string,
    field: EditableField,
    value: string
  ) {
    setDraftData(
      (previous) => {
        if (!previous) {
          return null;
        }

        return {
          ...previous,
          variants:
            previous.variants.map(
              (variant) =>
                variant.market === market
                  ? {
                      ...variant,
                      [field]:
                        value
                    }
                  : variant
            )
        };
      }
    );
  }


  function saveField(
    market: string,
    field: EditableField
  ) {
    if (
      !data ||
      !draftData
    ) {
      return;
    }

    const draftVariant =
      draftData.variants.find(
        (variant) =>
          variant.market ===
          market
      );

    if (!draftVariant) {
      return;
    }

    setData({
      ...data,
      variants:
        data.variants.map(
          (variant) =>
            variant.market ===
            market
              ? {
                  ...variant,
                  [field]:
                    draftVariant[field]
                }
              : variant
        )
    });

    markMarketEdited(
      market
    );

    setEditing(
      null
    );
  }


  function updateDraftChannel(
    market: string,
    index: number,
    value: string
  ) {
    setDraftData(
      (previous) => {
        if (!previous) {
          return null;
        }

        return {
          ...previous,
          variants:
            previous.variants.map(
              (variant) => {
                if (
                  variant.market !==
                  market
                ) {
                  return variant;
                }

                const channels =
                  [
                    ...variant.channels
                  ];

                channels[
                  index
                ] =
                  value;

                return {
                  ...variant,
                  channels
                };
              }
            )
        };
      }
    );
  }


  function addDraftChannel(
    market: string
  ) {
    setDraftData(
      (previous) => {
        if (!previous) {
          return null;
        }

        return {
          ...previous,
          variants:
            previous.variants.map(
              (variant) =>
                variant.market ===
                market
                  ? {
                      ...variant,
                      channels: [
                        ...variant.channels,
                        ""
                      ]
                    }
                  : variant
            )
        };
      }
    );
  }


  function removeDraftChannel(
    market: string,
    index: number
  ) {
    setDraftData(
      (previous) => {
        if (!previous) {
          return null;
        }

        return {
          ...previous,
          variants:
            previous.variants.map(
              (variant) =>
                variant.market ===
                market
                  ? {
                      ...variant,
                      channels:
                        variant.channels.filter(
                          (
                            _,
                            currentIndex
                          ) =>
                            currentIndex !==
                            index
                        )
                    }
                  : variant
            )
        };
      }
    );
  }


  function saveChannels(
    market: string
  ) {
    if (
      !data ||
      !draftData
    ) {
      return;
    }

    const draftVariant =
      draftData.variants.find(
        (variant) =>
          variant.market ===
          market
      );

    if (!draftVariant) {
      return;
    }

    setData({
      ...data,
      variants:
        data.variants.map(
          (variant) =>
            variant.market ===
            market
              ? {
                  ...variant,
                  channels:
                    draftVariant.channels.filter(
                      (channel) =>
                        channel.trim() !== ""
                    )
                }
              : variant
        )
    });

    markMarketEdited(
      market
    );

    setEditing(
      null
    );
  }


  async function regenerateVariant(
    market: string
  ) {
    try {
      setRegeneratingMarket(
        market
      );

      const API_BASE =
        process.env
          .NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:8000";

      const response =
        await fetch(
          `${API_BASE}/localize/${encodeURIComponent(
            trend
          )}/regenerate/${encodeURIComponent(
            market
          )}`,
          {
            method:
              "POST"
          }
        );

      if (!response.ok) {
        throw new Error(
          "Regeneration failed"
        );
      }

      const result:
        LocalVariant =
          await response.json();

      setTimeout(
        () => {
          setData(
            (previous) => {
              if (!previous) {
                return previous;
              }

              return {
                ...previous,
                variants:
                  previous.variants.map(
                    (variant) =>
                      variant.market ===
                      market
                        ? result
                        : variant
                  )
              };
            }
          );

          setDraftData(
            (previous) => {
              if (!previous) {
                return previous;
              }

              return {
                ...previous,
                variants:
                  previous.variants.map(
                    (variant) =>
                      variant.market ===
                      market
                        ? result
                        : variant
                  )
              };
            }
          );

          markMarketEdited(
            market
          );

          setRegeneratingMarket(
            null
          );
        },
        650
      );

    } catch {
      setRegeneratingMarket(
        null
      );
    }
  }


  // =====================================================
  // LOADING
  // =====================================================

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
            <Languages
              size={24}
              className="animate-pulse"
            />
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
            Adapting campaign across markets
          </div>


          <div
            className="
              mt-2
              text-[12px]
              text-[#858A99]
            "
          >
            Applying regional context,
            language direction and cultural relevance...
          </div>


          <div
            className="
              mx-auto
              mt-6
              h-[2px]
              w-[230px]
              overflow-hidden
              rounded-full
              bg-white/[0.06]
            "
          >
            <div
              className="
                h-full
                w-1/2
                animate-[pulse_1s_ease-in-out_infinite]
                rounded-full
                bg-violet-400
              "
            />
          </div>

        </div>
      </main>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (
    error ||
    !data ||
    !draftData
  ) {
    return (
      <main className="min-h-screen">

        <div className="page-shell">

          <TopNav />
          <WorkflowProgress active="localize" />
          <div className="py-32 text-center">

            <div className="text-[14px] text-rose-300">
              {error}
            </div>

            <button
              onClick={() =>
                router.back()
              }
              className="
                mt-6
                text-[12px]
                text-violet-400
              "
            >
              ← Return to campaign
            </button>

          </div>

        </div>

      </main>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen">

      <div className="page-shell">

        <TopNav />
      <WorkflowProgress active="localize" />

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
            <ArrowLeft size={14} />

            Campaign Brief
          </button>


          {/* HEADER */}

          <div className="mt-9">

            <div className="kicker">
              04 · Adapt
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
                  Regional Campaign Studio
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
                <Sparkles size={13} />

                3 variants generated
              </div>

            </div>

          </div>


          {/* LOCKED STRATEGY NOTE */}

          <div
            className="
              panel
              mt-9
              rounded-[20px]
              px-6
              py-5
            "
          >

            <div
              className="
                flex
                items-start
                gap-4
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
                  border-violet-400/15
                  bg-violet-500/[0.05]
                  text-violet-400
                "
              >
                <LockKeyhole
                  size={16}
                />
              </div>


              <div>

                <div
                  className="
                    text-[12px]
                    font-medium
                    text-[#E0E2E8]
                  "
                >
                  Core campaign strategy locked
                </div>


                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-[#777C8C]
                  "
                >
                  Regional teams may edit language,
                  local context, tagline and channels.
                  The national campaign objective and
                  creative territory remain unchanged.
                </p>

              </div>

            </div>

          </div>


          {/* VARIANTS */}

          <div
            className="
              mt-7
              grid
              gap-5
              xl:grid-cols-3
            "
          >

            {data.variants.map(
              (variant, index) => {

                const draftVariant =
                  draftData.variants.find(
                    (item) =>
                      item.market ===
                      variant.market
                  ) ?? variant;


                const isRegenerating =
                  regeneratingMarket ===
                  variant.market;


                return (
                  <article
                    key={
                      variant.market
                    }
                    className="
                      panel
                      group
                      flex
                      min-h-[610px]
                      flex-col
                      rounded-[24px]
                      p-7
                      transition-all
                      duration-200
                      hover:border-violet-400/20
                    "
                  >

                    {/* MARKET HEADER */}

                    <div
                      className="
                        flex
                        items-start
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
                            tracking-[.16em]
                            text-[#696E7C]
                          "
                        >
                          Market 0{index + 1}
                        </div>


                        <h2
                          className="
                            mt-2
                            text-[27px]
                            font-semibold
                            tracking-[-0.04em]
                            text-[#F4F4F7]
                          "
                        >
                          {variant.market}
                        </h2>

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
                          size={16}
                        />
                      </div>

                    </div>


                    {/* ACTIONS */}

                    <div
                      className="
                        mt-5
                        flex
                        flex-wrap
                        gap-2
                      "
                    >

                      <button
                        onClick={() =>
                          startEditing(
                            variant.market,
                            "tagline"
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          border-white/[0.07]
                          bg-white/[0.015]
                          px-3
                          py-2
                          text-[10px]
                          text-[#9498A6]
                          transition
                          hover:border-violet-400/20
                          hover:text-white
                        "
                      >
                        <Pencil
                          size={11}
                        />

                        Edit local variant
                      </button>


                      <button
                        onClick={() =>
                          regenerateVariant(
                            variant.market
                          )
                        }
                        disabled={
                          isRegenerating
                        }
                        className="
                          flex
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          border-white/[0.07]
                          bg-white/[0.015]
                          px-3
                          py-2
                          text-[10px]
                          text-[#9498A6]
                          transition
                          hover:border-violet-400/20
                          hover:text-white
                          disabled:opacity-40
                        "
                      >
                        <RotateCcw
                          size={11}
                          className={
                            isRegenerating
                              ? "animate-spin"
                              : ""
                          }
                        />

                        {isRegenerating
                          ? "Regenerating..."
                          : "Regenerate"}
                      </button>

                    </div>


                    {/* EDITED BADGE */}

                    {editedMarkets.includes(
                      variant.market
                    ) && (

                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          gap-1.5
                          text-[9px]
                          font-medium
                          uppercase
                          tracking-[.12em]
                          text-amber-300
                        "
                      >
                        <Check size={11} />

                        Human-adjusted variant
                      </div>

                    )}


                    {/* FIELDS */}

                    <div
                      className="
                        mt-6
                        space-y-6
                        border-t
                        border-white/[0.06]
                        pt-6
                      "
                    >

                      {[
                        {
                          label:
                            "Language direction",
                          field:
                            "language" as EditableField,
                          value:
                            variant.language
                        },

                        {
                          label:
                            "Local theme",
                          field:
                            "theme" as EditableField,
                          value:
                            variant.theme
                        },

                        {
                          label:
                            "Consumer context",
                          field:
                            "consumer_context" as EditableField,
                          value:
                            variant.consumer_context
                        },

                        {
                          label:
                            "Creative adaptation",
                          field:
                            "tagline" as EditableField,
                          value:
                            variant.tagline
                        }

                      ].map(
                        (item) => {

                          const isEditing =
                            editing?.market ===
                              variant.market &&
                            editing?.field ===
                              item.field;


                          return (
                            <div
                              key={
                                item.field
                              }
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
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-[.17em]
                                    text-[#626775]
                                  "
                                >
                                  {item.label}
                                </div>


                                {!isEditing && (
                                  <button
                                    onClick={() =>
                                      startEditing(
                                        variant.market,
                                        item.field
                                      )
                                    }
                                    className="
                                      text-[9px]
                                      text-[#696E7C]
                                      transition
                                      hover:text-violet-300
                                    "
                                  >
                                    Edit
                                  </button>
                                )}

                              </div>


                              {!isEditing ? (

                                <div
                                  className={`
                                    mt-2
                                    ${
                                      item.field ===
                                      "tagline"
                                        ? "text-[16px] font-medium leading-7 text-[#F1F2F5]"
                                        : "text-[12px] leading-6 text-[#9A9EAB]"
                                    }
                                  `}
                                >
                                  {item.field ===
                                  "tagline"
                                    ? `“${item.value}”`
                                    : item.value}
                                </div>

                              ) : (

                                <>

                                  <textarea
                                    autoFocus
                                    value={
                                      draftVariant[
                                        item.field
                                      ]
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateDraftField(
                                        variant.market,
                                        item.field,
                                        e.target.value
                                      )
                                    }
                                    className="
                                      mt-3
                                      min-h-[95px]
                                      w-full
                                      resize-none
                                      rounded-xl
                                      border
                                      border-white/[0.08]
                                      bg-[#0D0F15]
                                      p-3.5
                                      text-[12px]
                                      leading-5
                                      text-white
                                      outline-none
                                      focus:border-violet-400/30
                                    "
                                  />


                                  <div
                                    className="
                                      mt-3
                                      flex
                                      gap-2
                                    "
                                  >

                                    <button
                                      onClick={() =>
                                        saveField(
                                          variant.market,
                                          item.field
                                        )
                                      }
                                      className="
                                        rounded-lg
                                        bg-violet-500
                                        px-3
                                        py-2
                                        text-[9px]
                                        font-semibold
                                        text-white
                                        hover:bg-violet-400
                                      "
                                    >
                                      Save
                                    </button>


                                    <button
                                      onClick={
                                        cancelEditing
                                      }
                                      className="
                                        rounded-lg
                                        border
                                        border-white/[0.08]
                                        px-3
                                        py-2
                                        text-[9px]
                                        text-[#8F93A3]
                                      "
                                    >
                                      Cancel
                                    </button>

                                  </div>

                                </>

                              )}

                            </div>
                          );

                        }
                      )}

                    </div>


                    {/* RATIONALE */}

                    <div
                      className="
                        mt-6
                        rounded-[16px]
                        border
                        border-white/[0.055]
                        bg-white/[0.012]
                        p-4
                      "
                    >

                      <div
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[.17em]
                          text-[#626775]
                        "
                      >
                        AI rationale
                      </div>


                      <p
                        className="
                          mt-2
                          text-[10px]
                          leading-5
                          text-[#737887]
                        "
                      >
                        {variant.rationale}
                      </p>

                    </div>


                    {/* CHANNELS */}

                    <div
                      className="
                        mt-auto
                        pt-7
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
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[.17em]
                            text-[#626775]
                          "
                        >
                          Recommended channels
                        </div>


                        {!(
                          editing?.market ===
                            variant.market &&
                          editing?.field ===
                            "channels"
                        ) && (

                          <button
                            onClick={() =>
                              startEditing(
                                variant.market,
                                "channels"
                              )
                            }
                            className="
                              text-[9px]
                              text-[#696E7C]
                              hover:text-violet-300
                            "
                          >
                            Edit
                          </button>

                        )}

                      </div>


                      {editing?.market ===
                        variant.market &&
                      editing?.field ===
                        "channels" ? (

                        <div className="mt-3">

                          <div className="space-y-2">

                            {draftVariant.channels.map(
                              (
                                channel,
                                channelIndex
                              ) => (

                                <div
                                  key={
                                    channelIndex
                                  }
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                  "
                                >

                                  <input
                                    value={
                                      channel
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateDraftChannel(
                                        variant.market,
                                        channelIndex,
                                        e.target.value
                                      )
                                    }
                                    className="
                                      min-w-0
                                      flex-1
                                      rounded-lg
                                      border
                                      border-white/[0.08]
                                      bg-[#0D0F15]
                                      px-3
                                      py-2
                                      text-[10px]
                                      text-white
                                      outline-none
                                    "
                                  />


                                  <button
                                    onClick={() =>
                                      removeDraftChannel(
                                        variant.market,
                                        channelIndex
                                      )
                                    }
                                    className="
                                      text-[9px]
                                      text-rose-300/70
                                    "
                                  >
                                    Remove
                                  </button>

                                </div>

                              )
                            )}

                          </div>


                          <button
                            onClick={() =>
                              addDraftChannel(
                                variant.market
                              )
                            }
                            className="
                              mt-3
                              text-[9px]
                              text-violet-400
                            "
                          >
                            + Add channel
                          </button>


                          <div
                            className="
                              mt-4
                              flex
                              gap-2
                            "
                          >

                            <button
                              onClick={() =>
                                saveChannels(
                                  variant.market
                                )
                              }
                              className="
                                rounded-lg
                                bg-violet-500
                                px-3
                                py-2
                                text-[9px]
                                font-semibold
                                text-white
                              "
                            >
                              Save
                            </button>


                            <button
                              onClick={
                                cancelEditing
                              }
                              className="
                                rounded-lg
                                border
                                border-white/[0.08]
                                px-3
                                py-2
                                text-[9px]
                                text-[#8F93A3]
                              "
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      ) : (

                        <div
                          className="
                            mt-3
                            flex
                            flex-wrap
                            gap-2
                          "
                        >

                          {variant.channels.map(
                            (channel) => (

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

                      )}

                    </div>

                  </article>
                );

              }
            )}

          </div>


          {/* NEXT */}

          <div
            className="
              mt-10
              flex
              flex-col
              items-end
              gap-3
            "
          >

            {editedMarkets.length >
              0 && (

              <div
                className="
                  text-[10px]
                  text-[#737887]
                "
              >
                {editedMarkets.length} regional variant
                {editedMarkets.length ===
                1
                  ? ""
                  : "s"} adjusted by humans
              </div>

            )}


            <button
              disabled={
                editing !==
                null ||
                regeneratingMarket !==
                null
              }
              onClick={() =>
                router.push(
                  `/governance/${encodeURIComponent(
                    data.trend
                  )}`
                )
              }
              className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                bg-violet-500
                px-5
                py-3.5
                text-[12px]
                font-semibold
                text-white
                transition
                hover:bg-violet-400
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Continue to governance

              <ArrowRight
                size={16}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}