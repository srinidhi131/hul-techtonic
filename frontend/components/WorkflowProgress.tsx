"use client";

import {
  Check,
  ChevronRight,
} from "lucide-react";

type Stage =
  | "signal"
  | "insight"
  | "brief"
  | "localize"
  | "govern"
  | "launch";

type Props = {
  active: Stage;
  completed?: boolean;
};

const STAGES: {
  id: Stage;
  label: string;
}[] = [
  {
    id: "signal",
    label: "Signal",
  },
  {
    id: "insight",
    label: "Insight",
  },
  {
    id: "brief",
    label: "Brief",
  },
  {
    id: "localize",
    label: "Localize",
  },
  {
    id: "govern",
    label: "Govern",
  },
  {
    id: "launch",
    label: "Launch",
  },
];

export default function WorkflowProgress({
  active,
  completed = false,
}: Props) {
  const activeIndex =
    STAGES.findIndex(
      (stage) =>
        stage.id === active
    );

  return (
    <div
      className="
        mt-6
        overflow-x-auto
        rounded-[18px]
        border
        border-white/[0.06]
        bg-white/[0.012]
        px-5
        py-3.5
      "
    >
      <div
        className="
          flex
          min-w-max
          items-center
        "
      >
        {STAGES.map(
          (
            stage,
            index
          ) => {
           const stageCompleted =
            completed
              ? index <= activeIndex
              : index < activeIndex;

          const current =
            !completed &&
            index === activeIndex;

            return (
              <div
                key={
                  stage.id
                }
                className="
                  flex
                  items-center
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
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
                      transition
                      ${
                        stageCompleted
                          ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                          : current
                          ? "border-violet-400/30 bg-violet-500/[0.10] text-violet-300"
                          : "border-white/[0.07] bg-white/[0.01] text-[#555A68]"
                      }
                    `}
                  >
                    {stageCompleted ? (
                      <Check
                        size={11}
                      />
                    ) : (
                      <span
                        className={`
                          h-1.5
                          w-1.5
                          rounded-full
                          ${
                            current
                              ? "bg-violet-400"
                              : "bg-[#505562]"
                          }
                        `}
                      />
                    )}
                  </div>

                  <span
                    className={`
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[.13em]
                      ${
                        stageCompleted
                          ? "text-[#8F94A1]"
                          : current
                          ? "text-violet-300"
                          : "text-[#505562]"
                      }
                    `}
                  >
                    {stage.label}
                  </span>
                </div>

                {index <
                  STAGES.length -
                    1 && (
                  <ChevronRight
                    size={13}
                    className="
                      mx-4
                      text-[#3F4450]
                    "
                  />
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}