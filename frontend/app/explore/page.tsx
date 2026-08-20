import SignalCard, {
  type Signal,
} from "@/components/SignalCard";

import TopNav from "@/components/TopNav";
import WorkflowProgress from "@/components/WorkflowProgress";

import { getSignals } from "@/lib/api";


export default async function ExplorePage() {

  let signals: Signal[] = [];


  try {

    signals =
      await getSignals();

  } catch {

    signals =
      [];
  }


  const activeCount =
    signals.filter(
      (signal) =>
        signal.activated
    ).length;


  const emergingCount =
    signals.length -
    activeCount;


  return (
    <main className="min-h-screen">

      <div className="page-shell">

        <TopNav />

        <WorkflowProgress
          active="signal"
        />


        <section
          className="
            pb-20
            pt-10
          "
        >

          {/* ===============================================
              HEADER
              =============================================== */}

          <div className="kicker">
            01 · Detect
          </div>


          <div
            className="
              mt-4
              flex
              flex-col
              justify-between
              gap-5
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
                Opportunity Radar
              </h1>


              <p
                className="
                  mt-3
                  max-w-[650px]
                  text-[14px]
                  leading-6
                  text-[#8D92A1]
                "
              >
                Emerging consumer signals ranked by
                velocity, brand relevance, consumer fit,
                sentiment and time sensitivity.
              </p>

            </div>


            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >

              <div
                className="
                  rounded-full
                  border
                  border-white/[0.06]
                  bg-white/[0.018]
                  px-3.5
                  py-2
                  text-[10px]
                  text-[#888D9A]
                "
              >
                {emergingCount} emerging
              </div>


              {activeCount > 0 && (

                <div
                  className="
                    rounded-full
                    border
                    border-emerald-400/15
                    bg-emerald-400/[0.04]
                    px-3.5
                    py-2
                    text-[10px]
                    text-emerald-300
                  "
                >
                  {activeCount} activated
                </div>

              )}


              <div
                className="
                  rounded-full
                  border
                  border-emerald-400/15
                  bg-emerald-400/[0.04]
                  px-3.5
                  py-2
                  text-[11px]
                  text-emerald-300
                "
              >
                Live monitoring active
              </div>

            </div>

          </div>


          {/* ===============================================
              SIGNAL GRID
              =============================================== */}

          {signals.length > 0 ? (

            <div
              className="
                mt-10
                grid
                gap-5
                md:grid-cols-2
                xl:grid-cols-4
              "
            >

              {signals.map(
                (signal) => (

                  <SignalCard
                    key={
                      signal.trend
                    }
                    signal={
                      signal
                    }
                  />

                )
              )}

            </div>

          ) : (

            <div
              className="
                panel
                mt-10
                rounded-[20px]
                px-6
                py-12
                text-center
                text-[13px]
                text-[#8D92A1]
              "
            >
              No opportunities are currently available.
              If this is unexpected, make sure FastAPI
              is running on port 8000 and refresh.
            </div>

          )}

        </section>

      </div>

    </main>
  );
}