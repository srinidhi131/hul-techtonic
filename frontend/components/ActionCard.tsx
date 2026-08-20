import Link from "next/link";
import { ArrowRight, Radar, SquarePen } from "lucide-react";

type Props = {
  href: string;
  title: string;
  description: string;
  icon: "radar" | "pen";
};

export default function ActionCard({
  href,
  title,
  description,
  icon,
}: Props) {
  const Icon = icon === "radar" ? Radar : SquarePen;

  return (
    <Link
      href={href}
      className="
        group
        panel
        flex
        items-center
        gap-8
        rounded-[22px]
        px-10
        py-8
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-violet-400/30
        hover:bg-violet-500/[0.04]
      "
    >
      <div
        className="
          flex
          h-20
          w-20
          shrink-0
          items-center
          justify-center
          rounded-[20px]
          border
          border-violet-400/15
          bg-violet-500/[0.05]
          text-violet-400
        "
      >
        <Icon size={34} strokeWidth={1.7} />
      </div>

      <div>
        <div className="flex items-center gap-4">
          <h3
            className="
              text-[18px]
              font-semibold
              tracking-[-0.03em]
              text-white
            "
          >
            {title}
          </h3>

          <ArrowRight
            size={22}
            strokeWidth={1.8}
            className="
              text-violet-400
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </div>

        <p
          className="
            max-w-[330px]
            text-[13px]
            leading-8
            text-[#8E93A4]
          "
        >
          {description}
        </p>
      </div>
    </Link>
  );
}