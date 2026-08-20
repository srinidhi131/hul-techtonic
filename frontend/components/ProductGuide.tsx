"use client";

import { useState } from "react";
import {
  BookOpen,
  X,
  Sparkles,
  ShieldCheck,
  Workflow,
  Calculator,
  Info,
  Cpu,
  Bot,
Database,
GitBranch,
UserCheck,
Zap,
ArrowDown,
} from "lucide-react";


const glossary = [
  {
    term: "Consumer Signal",
    meaning:
      "An emerging consumer behaviour, search pattern, discussion or market movement identified through AI analysis or pre-generated scenarios.",
  },
  {
    term: "Live AI",
    meaning:
      "A real-time AI model that interprets previously unseen consumer signals and converts them into structured marketing intelligence.",
  },
  {
    term: "Demo Mode",
    meaning:
      "A library of pre-generated AI scenarios used to demonstrate the workflow without requiring live API access.",
  },
  {
    term: "Opportunity Score",
    meaning:
      "A weighted score used to prioritize opportunities based on momentum, consumer fit, brand relevance, sentiment and urgency.",
  },
  {
    term: "AI Interpretation",
    meaning:
      "A concise explanation describing why a detected signal represents a meaningful consumer opportunity.",
  },
  {
    term: "Brand Matching",
    meaning:
      "AI-assisted recommendation of the HUL brand best positioned to respond to a consumer opportunity.",
  },
  {
    term: "Localization",
    meaning:
      "Regional adaptation of an approved campaign across language, culture and consumer context.",
  },
  {
    term: "Governance",
    meaning:
      "Automated and human validation of campaign outputs for compliance, cultural sensitivity and brand alignment.",
  },
  {
    term: "Human-in-the-loop",
    meaning:
      "AI recommends and generates while marketers retain the ability to override, edit, regenerate and approve.",
  },
  {
    term: "Activation",
    meaning:
      "The final stage in which an approved campaign is released into downstream execution channels.",
  },
];


const assumptions = [
  "The platform demonstrates an AI-first operating model rather than a production marketing platform.",

  "Live AI is used only for custom signal interpretation.",

  "Pre-generated scenarios are included to ensure a reliable demonstration experience.",

  "Opportunity scoring follows a weighted framework rather than real-time market analytics.",

  "Brand recommendations illustrate portfolio matching and do not represent official HUL brand decisions.",

  "Campaign briefs are automatically generated to demonstrate workflow orchestration rather than final creative development.",

  "Localization outputs illustrate AI-assisted adaptation and would require regional validation before deployment.",

  "Governance rules demonstrate how automated compliance systems could interact with human reviewers.",

  "Human reviewers can override recommendations, edit campaigns, regenerate outputs and approve final decisions.",

  "Current application state is stored in memory and is designed for demonstration purposes.",
];

export default function ProductGuide() {
  const [open, setOpen] =
    useState(false);

  const [section, setSection] =
  useState<
    | "glossary"
    | "workflow"
    | "scoring"
    | "architecture"
    | "assumptions"
  >("glossary");


  return (
    <>
      {/* =================================================
          FLOATING BUTTON
          ================================================= */}

      <button
        onClick={() =>
          setOpen(true)
        }
        className="
          fixed
          bottom-6
          right-6
          z-[150]
          flex
          items-center
          gap-2
          rounded-full
          border
          border-violet-400/20
          bg-[#11131A]/95
          px-4
          py-3
          text-[11px]
          font-medium
          text-[#D8DAE2]
          shadow-2xl
          backdrop-blur-xl
          transition
          hover:-translate-y-0.5
          hover:border-violet-400/35
          hover:bg-violet-500/[0.08]
          hover:text-white
        "
      >
        <BookOpen
          size={14}
          className="text-violet-400"
        />

        Product Guide
      </button>


      {/* =================================================
          MODAL
          ================================================= */}

      {open && (
        <div
          className="
            fixed
            inset-0
            z-[500]
            flex
            items-center
            justify-center
            bg-[#050609]/80
            px-5
            py-8
            backdrop-blur-md
          "
          onClick={() =>
            setOpen(false)
          }
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              flex
              max-h-[88vh]
              w-full
              max-w-[980px]
              flex-col
              overflow-hidden
              rounded-[26px]
              border
              border-white/[0.08]
              bg-[#0C0E14]
              shadow-2xl
            "
          >

            {/* ===========================================
                HEADER
                =========================================== */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-5
                border-b
                border-white/[0.06]
                px-7
                py-6
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
                    text-violet-300
                  "
                >
                  <Sparkles size={12} />

                  Signal-to-Campaign Studio
                </div>

                <h2
                  className="
                    mt-2
                    text-[26px]
                    font-semibold
                    tracking-[-0.04em]
                    text-[#F4F5F8]
                  "
                >
                  Product Guide
                  • Prototype v1.0 • Live AI enabled
                </h2>

                <p
                  className="
                    mt-2
                    max-w-[650px]
                    text-[11px]
                    leading-5
                    text-[#787D8B]
                  "
                >
                  Glossary, operating-model logic,
                  scoring methodology and prototype
                  assumptions.
                </p>
              </div>

              <button
                onClick={() =>
                  setOpen(false)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.06]
                  text-[#707584]
                  transition
                  hover:bg-white/[0.04]
                  hover:text-white
                "
              >
                <X size={16} />
              </button>
            </div>


            {/* ===========================================
                TABS
                =========================================== */}

            <div
              className="
                flex
                gap-2
                overflow-x-auto
                border-b
                border-white/[0.06]
                px-7
                py-4
              "
            >
              {[
                {
                  id:
                    "glossary",
                  label:
                    "Glossary",
                  icon:
                    BookOpen,
                },
                {
                  id:
                    "workflow",
                  label:
                    "Workflow",
                  icon:
                    Workflow,
                },
                {
                  id:
                    "scoring",
                  label:
                    "Scoring",
                  icon:
                    Calculator,
                },
                {
                    id: "architecture",
                    label: "AI Architecture",
                    icon: Cpu,
                },
                {
                  id:
                    "assumptions",
                  label:
                    "Assumptions",
                  icon:
                    Info,
                },
              ].map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    section ===
                    item.id;

                  return (
                    <button
                      key={
                        item.id
                      }
                      onClick={() =>
                        setSection(
                          item.id as any
                        )
                      }
                      className={`
                        flex
                        shrink-0
                        items-center
                        gap-2
                        rounded-xl
                        border
                        px-4
                        py-2.5
                        text-[10px]
                        font-medium
                        transition

                        ${
                          active
                            ? "border-violet-400/25 bg-violet-500/[0.08] text-violet-300"
                            : "border-white/[0.06] bg-white/[0.01] text-[#747987] hover:text-white"
                        }
                      `}
                    >
                      <Icon size={13} />

                      {item.label}
                    </button>
                  );
                }
              )}
            </div>


            {/* ===========================================
                CONTENT
                =========================================== */}

            <div
              className="
                overflow-y-auto
                px-7
                py-7
              "
            >

              {/* =========================================
                  GLOSSARY
                  ========================================= */}

              {section ===
                "glossary" && (
                <div>
                  <div
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[.17em]
                      text-[#707584]
                    "
                  >
                    Core terminology
                  </div>

                  <div
                    className="
                      mt-5
                      grid
                      gap-3
                      md:grid-cols-2
                    "
                  >
                    {glossary.map(
                      (item) => (
                        <div
                          key={
                            item.term
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
                              text-[12px]
                              font-semibold
                              text-[#E8E9EE]
                            "
                          >
                            {item.term}
                          </div>

                          <p
                            className="
                              mt-2
                              text-[11px]
                              leading-5
                              text-[#7F8492]
                            "
                          >
                            {item.meaning}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}


              {/* =========================================
                  WORKFLOW
                  ========================================= */}

              {section ===
                "workflow" && (
                <div>
                  <div
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[.17em]
                      text-[#707584]
                    "
                  >
                    AI-first operating model
                  </div>

                  <div
                    className="
                      mt-6
                      space-y-3
                    "
                  >
                    {[
                    [
                        "01 · Detect",
                        "AI identifies an emerging consumer signal from a live prompt or a pre-generated scenario.",
                    ],
                    [
                        "02 · Understand",
                        "The signal is translated into structured intelligence including category, market, consumer need, opportunity score and a recommended HUL brand.",
                    ],
                    [
                        "03 · Create",
                        "AI transforms the opportunity into an editable campaign brief.",
                    ],
                    [
                        "04 · Adapt",
                        "The national strategy is localized across regional markets while preserving the core campaign objective.",
                    ],
                    [
                        "05 · Govern",
                        "Automated validation identifies risks. Human reviewers can approve or request AI regeneration multiple times.",
                    ],
                    [
                        "06 · Activate",
                        "Approved campaigns are activated and become part of the opportunity portfolio.",
                    ],
                    ].map(
                      (
                        [
                          title,
                          description,
                        ],
                        index
                      ) => (
                        <div
                          key={
                            title
                          }
                          className="
                            flex
                            gap-4
                            rounded-[16px]
                            border
                            border-white/[0.055]
                            bg-white/[0.012]
                            p-5
                          "
                        >
                          <div
                            className="
                              flex
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-violet-400/15
                              bg-violet-500/[0.05]
                              text-[10px]
                              font-semibold
                              text-violet-300
                            "
                          >
                            {index +
                              1}
                          </div>

                          <div>
                            <div
                              className="
                                text-[12px]
                                font-semibold
                                text-[#E7E8ED]
                              "
                            >
                              {title}
                            </div>

                            <p
                              className="
                                mt-1.5
                                text-[11px]
                                leading-5
                                text-[#7E8391]
                              "
                            >
                              {description}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div
                    className="
                      mt-6
                      rounded-[18px]
                      border
                      border-violet-400/15
                      bg-violet-500/[0.035]
                      p-5
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-[11px]
                        font-semibold
                        text-violet-300
                      "
                    >
                      <ShieldCheck
                        size={14}
                      />

                      Operating principle
                    </div>

                    <p
                      className="
                        mt-2
                        text-[12px]
                        leading-6
                        text-[#979BA8]
                      "
                    >
                     AI generates insights and recommendations.

                    Humans retain ownership of strategy,
                    creative direction, approvals and
                    activation decisions.
                    </p>
                  </div>
                </div>
              )}


              {/* =========================================
                  SCORING
                  ========================================= */}

              {section ===
                "scoring" && (
                <div>
                  <div
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[.17em]
                      text-[#707584]
                    "
                  >
                    Opportunity intelligence
                  </div>

                  <div
                    className="
                      mt-5
                      rounded-[20px]
                      border
                      border-violet-400/15
                      bg-violet-500/[0.035]
                      p-6
                    "
                  >
                    <div
                      className="
                        text-[11px]
                        uppercase
                        tracking-[.14em]
                        text-violet-300/70
                      "
                    >
                      Prototype formula
                    </div>

                    <div
                      className="
                        mt-4
                        text-[15px]
                        leading-8
                        text-[#E8E9ED]
                      "
                    >
                      Opportunity Score =
                      <br />
                      0.25 × Trend Velocity
                      <br />
                      + 0.25 × Brand Relevance
                      <br />
                      + 0.20 × Consumer Fit
                      <br />
                      + 0.15 × Sentiment
                      <br />
                      + 0.15 × Time Sensitivity
                    </div>
                  </div>

                  <div
                    className="
                      mt-5
                      grid
                      gap-3
                      md:grid-cols-2
                    "
                  >
                    {[
                      [
                        "Trend Velocity · 25%",
                        "How rapidly the signal is gaining momentum.",
                      ],
                      [
                        "Brand Relevance · 25%",
                        "How closely the signal aligns with an HUL brand and category.",
                      ],
                      [
                        "Consumer Fit · 20%",
                        "Strength of the connection between the signal and an identifiable consumer need.",
                      ],
                      [
                        "Sentiment · 15%",
                        "Direction and strength of consumer conversation around the signal.",
                      ],
                      [
                        "Time Sensitivity · 15%",
                        "How quickly the opportunity may decay if the brand does not respond.",
                      ],
                    ].map(
                      ([
                        title,
                        description,
                      ]) => (
                        <div
                          key={
                            title
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
                              text-[11px]
                              font-semibold
                              text-[#E5E6EB]
                            "
                          >
                            {title}
                          </div>

                          <p
                            className="
                              mt-2
                              text-[10px]
                              leading-5
                              text-[#7D8290]
                            "
                          >
                            {description}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {section === "architecture" && (
  <div>

    {/* ===============================================
        HEADER
        =============================================== */}

    <div>
      <div
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[.17em]
          text-[#707584]
        "
      >
        System architecture
      </div>

      <h3
        className="
          mt-2
          text-[20px]
          font-semibold
          tracking-[-0.035em]
          text-[#F1F2F5]
        "
      >
        AI where intelligence is needed.
        Control where decisions matter.
      </h3>

      <p
        className="
          mt-2
          max-w-[760px]
          text-[11px]
          leading-5
          text-[#7E8391]
        "
      >
        Signal-to-Campaign Studio combines live AI,
        deterministic decision engines and human
        governance instead of routing every step
        through a generative model.
      </p>
    </div>


    {/* ===============================================
        INPUT LAYER
        =============================================== */}

    <div className="mt-7">

      <div
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[.16em]
          text-[#626775]
        "
      >
        01 · Signal input
      </div>

      <div
        className="
          mt-3
          grid
          gap-3
          md:grid-cols-2
        "
      >

        {/* LIVE AI */}

        <div
          className="
            rounded-[18px]
            border
            border-violet-400/20
            bg-violet-500/[0.045]
            p-5
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
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-violet-400/20
                bg-violet-500/[0.08]
                text-violet-300
              "
            >
              <Bot size={16} />
            </div>

            <span
              className="
                rounded-full
                border
                border-emerald-400/15
                bg-emerald-400/[0.05]
                px-2.5
                py-1
                text-[8px]
                font-semibold
                uppercase
                tracking-[.13em]
                text-emerald-300
              "
            >
              Live
            </span>
          </div>

          <div
            className="
              mt-4
              text-[12px]
              font-semibold
              text-[#ECEEF2]
            "
          >
            Live AI
          </div>

          <p
            className="
              mt-2
              text-[10px]
              leading-5
              text-[#818694]
            "
          >
            Interprets a previously unseen consumer
            signal entered by the marketer.
          </p>
        </div>


        {/* DEMO AI */}

        <div
          className="
            rounded-[18px]
            border
            border-white/[0.06]
            bg-white/[0.012]
            p-5
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
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                text-[#A5A9B4]
              "
            >
              <Database size={16} />
            </div>

            <span
              className="
                rounded-full
                border
                border-white/[0.07]
                bg-white/[0.02]
                px-2.5
                py-1
                text-[8px]
                font-semibold
                uppercase
                tracking-[.13em]
                text-[#777C89]
              "
            >
              Demo
            </span>
          </div>

          <div
            className="
              mt-4
              text-[12px]
              font-semibold
              text-[#ECEEF2]
            "
          >
            Pre-generated AI scenarios
          </div>

          <p
            className="
              mt-2
              text-[10px]
              leading-5
              text-[#818694]
            "
          >
            Curated AI-generated signals provide a
            zero-dependency path for reliable demonstrations.
          </p>
        </div>

      </div>

    </div>


    {/* CONNECTOR */}

    <div
      className="
        flex
        justify-center
        py-4
        text-[#505562]
      "
    >
      <ArrowDown size={15} />
    </div>


    {/* ===============================================
        AI INTELLIGENCE
        =============================================== */}

    <div
      className="
        rounded-[20px]
        border
        border-violet-400/15
        bg-gradient-to-r
        from-violet-500/[0.055]
        to-transparent
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
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-violet-400/20
            bg-violet-500/[0.07]
            text-violet-300
          "
        >
          <Sparkles size={15} />
        </div>

        <div>
          <div
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[.16em]
              text-violet-300/70
            "
          >
            02 · AI Intelligence Layer
          </div>

          <div
            className="
              mt-1
              text-[13px]
              font-semibold
              text-[#ECEEF2]
            "
          >
            Signal → structured opportunity intelligence
          </div>
        </div>
      </div>


      <div
        className="
          mt-5
          grid
          gap-2
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {[
          "Opportunity name",
          "Category",
          "Market",
          "Consumer need",
          "Signal metrics",
          "AI interpretation",
        ].map((item) => (
          <div
            key={item}
            className="
              rounded-xl
              border
              border-white/[0.055]
              bg-black/10
              px-3.5
              py-3
              text-[10px]
              text-[#A4A8B3]
            "
          >
            {item}
          </div>
        ))}
      </div>

    </div>


    {/* CONNECTOR */}

    <div
      className="
        flex
        justify-center
        py-4
        text-[#505562]
      "
    >
      <ArrowDown size={15} />
    </div>


    {/* ===============================================
        DETERMINISTIC ENGINE
        =============================================== */}

    <div
      className="
        rounded-[20px]
        border
        border-cyan-400/10
        bg-cyan-400/[0.02]
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
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-cyan-400/15
            bg-cyan-400/[0.04]
            text-cyan-200
          "
        >
          <GitBranch size={15} />
        </div>

        <div>
          <div
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[.16em]
              text-cyan-200/60
            "
          >
            03 · Decision & orchestration layer
          </div>

          <div
            className="
              mt-1
              text-[13px]
              font-semibold
              text-[#ECEEF2]
            "
          >
            Deterministic business logic
          </div>
        </div>
      </div>


      <div
        className="
          mt-5
          grid
          gap-3
          md:grid-cols-2
        "
      >

        <div
          className="
            rounded-[15px]
            border
            border-white/[0.055]
            bg-white/[0.012]
            p-4
          "
        >
          <div
            className="
              text-[10px]
              font-semibold
              text-[#D6D8DF]
            "
          >
            Opportunity Scoring
          </div>

          <p
            className="
              mt-2
              text-[9px]
              leading-5
              text-[#747987]
            "
          >
            Weighted formula converts signal metrics
            into a consistent 0–100 priority score.
          </p>
        </div>


        <div
          className="
            rounded-[15px]
            border
            border-white/[0.055]
            bg-white/[0.012]
            p-4
          "
        >
          <div
            className="
              text-[10px]
              font-semibold
              text-[#D6D8DF]
            "
          >
            Brand Matching
          </div>

          <p
            className="
              mt-2
              text-[9px]
              leading-5
              text-[#747987]
            "
          >
            Category and portfolio rules recommend
            the most relevant HUL brand.
          </p>
        </div>


        <div
          className="
            rounded-[15px]
            border
            border-white/[0.055]
            bg-white/[0.012]
            p-4
          "
        >
          <div
            className="
              text-[10px]
              font-semibold
              text-[#D6D8DF]
            "
          >
            Workflow State
          </div>

          <p
            className="
              mt-2
              text-[9px]
              leading-5
              text-[#747987]
            "
          >
            Campaign versions, edits, approvals and
            lifecycle state remain controlled and traceable.
          </p>
        </div>


        <div
          className="
            rounded-[15px]
            border
            border-white/[0.055]
            bg-white/[0.012]
            p-4
          "
        >
          <div
            className="
              text-[10px]
              font-semibold
              text-[#D6D8DF]
            "
          >
            Activation Logic
          </div>

          <p
            className="
              mt-2
              text-[9px]
              leading-5
              text-[#747987]
            "
          >
            Campaigns cannot activate until the
            required governance decision is recorded.
          </p>
        </div>

      </div>

    </div>


    {/* CONNECTOR */}

    <div
      className="
        flex
        justify-center
        py-4
        text-[#505562]
      "
    >
      <ArrowDown size={15} />
    </div>


    {/* ===============================================
        HUMAN CONTROL
        =============================================== */}

    <div
      className="
        rounded-[20px]
        border
        border-amber-400/10
        bg-amber-400/[0.02]
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
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-amber-400/15
            bg-amber-400/[0.04]
            text-amber-200
          "
        >
          <UserCheck size={15} />
        </div>

        <div>
          <div
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[.16em]
              text-amber-200/60
            "
          >
            04 · Human control layer
          </div>

          <div
            className="
              mt-1
              text-[13px]
              font-semibold
              text-[#ECEEF2]
            "
          >
            Marketer remains the decision owner
          </div>
        </div>
      </div>


      <div
        className="
          mt-5
          flex
          flex-wrap
          gap-2
        "
      >
        {[
          "Override brand",
          "Edit campaign",
          "Review localization",
          "Request changes",
          "Approve",
        ].map((item) => (
          <div
            key={item}
            className="
              rounded-full
              border
              border-white/[0.06]
              bg-white/[0.015]
              px-3
              py-2
              text-[9px]
              text-[#999DA9]
            "
          >
            {item}
          </div>
        ))}
      </div>

    </div>


    {/* CONNECTOR */}

    <div
      className="
        flex
        justify-center
        py-4
        text-[#505562]
      "
    >
      <ArrowDown size={15} />
    </div>


    {/* ===============================================
        EXECUTION
        =============================================== */}

    <div
      className="
        rounded-[20px]
        border
        border-emerald-400/12
        bg-emerald-400/[0.025]
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
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-emerald-400/15
            bg-emerald-400/[0.04]
            text-emerald-300
          "
        >
          <Zap size={15} />
        </div>

        <div>
          <div
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[.16em]
              text-emerald-300/60
            "
          >
            05 · Execution layer
          </div>

          <div
            className="
              mt-1
              text-[13px]
              font-semibold
              text-[#ECEEF2]
            "
          >
            Governed campaign activation
          </div>
        </div>
      </div>


      <div
        className="
          mt-5
          grid
          gap-2
          sm:grid-cols-3
        "
      >
        {[
          "Campaign Brief",
          "Regional Variants",
          "Channel Activation",
        ].map((item) => (
          <div
            key={item}
            className="
              rounded-xl
              border
              border-emerald-400/[0.08]
              bg-emerald-400/[0.02]
              px-4
              py-3
              text-center
              text-[10px]
              text-[#AAB6AF]
            "
          >
            {item}
          </div>
        ))}
      </div>

    </div>


    {/* ===============================================
        PRINCIPLE
        =============================================== */}

    <div
      className="
        mt-6
        rounded-[18px]
        border
        border-violet-400/15
        bg-violet-500/[0.035]
        p-5
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
          tracking-[.15em]
          text-violet-300
        "
      >
        <ShieldCheck size={13} />

        Architecture principle
      </div>


      <p
        className="
          mt-3
          text-[12px]
          leading-6
          text-[#A0A4AF]
        "
      >
        Generative AI handles ambiguity.
        Deterministic systems handle control.
        Humans retain accountability.
      </p>

    </div>

  </div>
)}

              {/* =========================================
                  ASSUMPTIONS
                  ========================================= */}

              {section ===
                "assumptions" && (
                <div>
                  <div
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[.17em]
                      text-[#707584]
                    "
                  >
                    Prototype assumptions & boundaries
                  </div>

                  <p
                    className="
                      mt-3
                      max-w-[720px]
                      text-[12px]
                      leading-6
                      text-[#858A99]
                    "
                  >
                    Signal-to-Campaign Studio is
                    designed to demonstrate the
                    operating model and decision
                    architecture rather than replicate
                    every production integration.
                  </p>

                  <div
                    className="
                      mt-6
                      space-y-3
                    "
                  >
                    {assumptions.map(
                      (
                        assumption,
                        index
                      ) => (
                        <div
                          key={
                            assumption
                          }
                          className="
                            flex
                            items-start
                            gap-4
                            rounded-[15px]
                            border
                            border-white/[0.05]
                            bg-white/[0.01]
                            px-5
                            py-4
                          "
                        >
                          <div
                            className="
                              mt-0.5
                              flex
                              h-6
                              w-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-white/[0.035]
                              text-[9px]
                              font-semibold
                              text-[#777C89]
                            "
                          >
                            {index +
                              1}
                          </div>

                          <p
                            className="
                              text-[11px]
                              leading-5
                              text-[#858A99]
                            "
                          >
                            {assumption}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}