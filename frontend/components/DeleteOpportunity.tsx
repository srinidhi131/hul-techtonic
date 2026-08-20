"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  LockKeyhole,
  Trash2,
  X,
} from "lucide-react";


const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";


type Props = {
  trend: string;
  custom: boolean;
  approved: boolean;
};


export default function DeleteOpportunity({
  trend,
  custom,
  approved,
}: Props) {

  const router =
    useRouter();


  const [
    confirming,
    setConfirming
  ] =
    useState(false);


  const [
    deleting,
    setDeleting
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  // =====================================================
  // ORIGINAL DEMO SIGNAL
  // =====================================================

  if (!custom) {

    return null;
  }


  // =====================================================
  // APPROVED CUSTOM OPPORTUNITY
  // =====================================================

  if (approved) {

    return (
      <div
        className="
          flex
          items-center
          gap-2
          text-[10px]
          text-[#676C79]
        "
      >
        <LockKeyhole
          size={12}
        />

        Opportunity locked after approval
      </div>
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

      setError(
        ""
      );


      const response =
        await fetch(
          `${API_BASE}/opportunity/${encodeURIComponent(
            trend
          )}`,
          {
            method:
              "DELETE",
          }
        );


      if (!response.ok) {

        const result =
          await response.json();


        throw new Error(
          result?.detail ||
          "Could not delete opportunity."
        );
      }


      router.push(
        "/explore"
      );


      router.refresh();

    } catch (
      deleteError
    ) {

      setDeleting(
        false
      );


      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete opportunity."
      );
    }
  }


  return (
    <>
      <button
        onClick={() =>
          setConfirming(
            true
          )
        }
        className="
          flex
          items-center
          gap-2
          text-[10px]
          text-[#727786]
          transition
          hover:text-rose-300
        "
      >
        <Trash2
          size={12}
        />

        Delete opportunity
      </button>


      {/* ===============================================
          CONFIRMATION MODAL
          =============================================== */}

      {confirming && (

        <div
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-black/70
            px-6
            backdrop-blur-md
          "
        >

          <div
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
                onClick={() =>
                  setConfirming(
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
              This will remove the signal,
              campaign workspace, localization
              and governance history associated
              with this opportunity.
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
              {trend}
            </div>


            {error && (

              <div
                className="
                  mt-4
                  text-[10px]
                  text-rose-300
                "
              >
                {error}
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
                disabled={
                  deleting
                }
                onClick={() =>
                  setConfirming(
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
    </>
  );
}