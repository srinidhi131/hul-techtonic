"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
    ArrowLeft,
    ArrowRight,
    Check,
    Instagram,
    Pencil,
    RotateCcw,
    ShoppingBag,
    Sparkles,
    Youtube,
} from "lucide-react";

import TopNav from "@/components/TopNav";
import WorkflowProgress from "@/components/WorkflowProgress";


type Campaign = {
    trend: string;
    brand: string;
    objective: string;
    audience: string;
    tension: string;
    creative_territory: string;
    key_message: string;
    hero_copy: string;
    channels: string[];
};


type EditableTextField =
    | "objective"
    | "audience"
    | "tension"
    | "creative_territory"
    | "key_message"
    | "hero_copy";


type EditingField =
    | EditableTextField
    | "channels"
    | null;


/* =========================================================
   EDITABLE TEXT SECTION
   ========================================================= */

function EditableSection({
    title,
    field,
    value,
    draftValue,
    editing,
    multiline = true,
    prominent = false,
    edited = false,
    onEdit,
    onChange,
    onSave,
    onCancel,
}: {
    title: string;
    field: EditableTextField;
    value: string;
    draftValue: string;
    editing: EditingField;
    multiline?: boolean;
    prominent?: boolean;
    edited?: boolean;
    onEdit: () => void;
    onChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
}) {
    const isEditing =
        editing === field;

    return (
        <div
            className={`
        rounded-[22px]
        border
        p-7
        transition-all
        ${isEditing
                    ? "border-violet-400/25 bg-violet-500/[0.035]"
                    : "border-white/[0.075] bg-white/[0.018]"
                }
      `}
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
            text-[10px]
            font-semibold
            uppercase
            tracking-[.17em]
            text-[#727786]
          "
                >
                    {title}
                </div>


                {!isEditing && (
                    <button
                        onClick={onEdit}
                        className="
              flex
              items-center
              gap-1.5
              text-[10px]
              font-medium
              text-[#777C8C]
              transition
              hover:text-violet-300
            "
                    >
                        <Pencil size={11} />

                        Edit
                    </button>
                )}
            </div>


            {!isEditing ? (
                <>
                    <p
                        className={`
              mt-4
              ${prominent
                                ? "text-[20px] font-medium leading-8 tracking-[-0.025em] text-[#F1F2F5]"
                                : "text-[14px] leading-7 text-[#B1B4BF]"
                            }
            `}
                    >
                        {value}
                    </p>


                    {edited && (
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

                            Edited by Brand Manager
                        </div>
                    )}
                </>
            ) : (
                <>
                    {multiline ? (
                        <textarea
                            value={draftValue}
                            onChange={(e) =>
                                onChange(
                                    e.target.value
                                )
                            }
                            autoFocus
                            className="
                mt-4
                min-h-[120px]
                w-full
                resize-none
                rounded-[14px]
                border
                border-white/[0.08]
                bg-[#0D0F15]
                px-4
                py-3.5
                text-[14px]
                leading-6
                text-[#F4F4F7]
                outline-none
                transition
                focus:border-violet-400/30
              "
                        />
                    ) : (
                        <input
                            value={draftValue}
                            onChange={(e) =>
                                onChange(
                                    e.target.value
                                )
                            }
                            autoFocus
                            className="
                mt-4
                w-full
                rounded-[14px]
                border
                border-white/[0.08]
                bg-[#0D0F15]
                px-4
                py-3.5
                text-[14px]
                text-[#F4F4F7]
                outline-none
                transition
                focus:border-violet-400/30
              "
                        />
                    )}


                    <div
                        className="
              mt-4
              flex
              items-center
              gap-3
            "
                    >
                        <button
                            onClick={onSave}
                            className="
                rounded-lg
                bg-violet-500
                px-4
                py-2
                text-[10px]
                font-semibold
                text-white
                transition
                hover:bg-violet-400
              "
                        >
                            Save change
                        </button>


                        <button
                            onClick={onCancel}
                            className="
                rounded-lg
                border
                border-white/[0.08]
                px-4
                py-2
                text-[10px]
                text-[#9296A4]
                transition
                hover:bg-white/[0.03]
                hover:text-white
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


/* =========================================================
   CAMPAIGN PAGE
   ========================================================= */

export default function CampaignPage() {
    const params =
        useParams();

    const router =
        useRouter();

    const searchParams =
        useSearchParams();

    const selectedBrand =
        searchParams.get("brand");


    const trend =
        decodeURIComponent(
            Array.isArray(
                params.trend
            )
                ? params.trend[0]
                : (
                    params.trend as string
                )
        );


    /* =====================================================
       STATE
       ===================================================== */

    const [
        campaign,
        setCampaign
    ] =
        useState<Campaign | null>(
            null
        );


    const [
        draft,
        setDraft
    ] =
        useState<Campaign | null>(
            null
        );


    const [
        originalCampaign,
        setOriginalCampaign
    ] =
        useState<Campaign | null>(
            null
        );


    const [
        editing,
        setEditing
    ] =
        useState<EditingField>(
            null
        );


    const [
        editedFields,
        setEditedFields
    ] =
        useState<string[]>(
            []
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


    /* =====================================================
       FETCH CAMPAIGN
       ===================================================== */

    useEffect(() => {

        async function loadCampaign() {

            try {

                setLoading(
                    true
                );


                const API_BASE =
                    process.env
                        .NEXT_PUBLIC_API_BASE_URL ||
                    "http://localhost:8000";


                const brandQuery =
                    selectedBrand
                        ? `?brand=${encodeURIComponent(
                            selectedBrand
                        )}`
                        : "";


                const response =
                    await fetch(
                        `${API_BASE}/campaign/${encodeURIComponent(
                            trend
                        )}${brandQuery}`
                    );


                if (
                    !response.ok
                ) {
                    throw new Error(
                        "Campaign generation failed"
                    );
                }


                const data =
                    await response.json();


                setTimeout(
                    () => {

                        setCampaign(
                            data
                        );

                        setDraft(
                            data
                        );

                        setOriginalCampaign(
                            data
                        );

                        setLoading(
                            false
                        );

                    },
                    700
                );

            } catch {

                setError(
                    "Could not generate campaign brief."
                );

                setLoading(
                    false
                );
            }
        }


        loadCampaign();

    }, [trend, selectedBrand]);


    /* =====================================================
       EDITING HELPERS
       ===================================================== */

    function startEditing(
        field: EditingField
    ) {

        if (!campaign) {
            return;
        }


        setDraft({
            ...campaign,
            channels: [
                ...campaign.channels
            ],
        });


        setEditing(
            field
        );
    }


    function cancelEditing() {

        if (campaign) {

            setDraft({
                ...campaign,
                channels: [
                    ...campaign.channels
                ],
            });
        }


        setEditing(
            null
        );
    }


    function saveTextField(
        field: EditableTextField
    ) {

        if (
            !draft ||
            !campaign
        ) {
            return;
        }


        setCampaign({
            ...campaign,
            [field]:
                draft[field],
        });


        if (
            !editedFields.includes(
                field
            )
        ) {

            setEditedFields(
                [
                    ...editedFields,
                    field
                ]
            );
        }


        setEditing(
            null
        );
    }


    function saveChannels() {

        if (
            !draft ||
            !campaign
        ) {
            return;
        }


        setCampaign({
            ...campaign,
            channels:
                draft.channels,
        });


        if (
            !editedFields.includes(
                "channels"
            )
        ) {

            setEditedFields(
                [
                    ...editedFields,
                    "channels"
                ]
            );
        }


        setEditing(
            null
        );
    }


    function updateDraftField(
        field: EditableTextField,
        value: string
    ) {

        setDraft(
            (
                previous
            ) => {

                if (
                    !previous
                ) {
                    return null;
                }


                return {
                    ...previous,
                    [field]:
                        value,
                };
            }
        );
    }


    function updateChannel(
        index: number,
        value: string
    ) {

        setDraft(
            (
                previous
            ) => {

                if (
                    !previous
                ) {
                    return null;
                }


                const channels =
                    [
                        ...previous.channels
                    ];


                channels[
                    index
                ] =
                    value;


                return {
                    ...previous,
                    channels,
                };
            }
        );
    }


    function addChannel() {

        setDraft(
            (
                previous
            ) => {

                if (
                    !previous
                ) {
                    return null;
                }


                return {
                    ...previous,
                    channels: [
                        ...previous.channels,
                        "",
                    ],
                };
            }
        );
    }


    function removeChannel(
        index: number
    ) {

        setDraft(
            (
                previous
            ) => {

                if (
                    !previous
                ) {
                    return null;
                }


                return {
                    ...previous,
                    channels:
                        previous.channels.filter(
                            (
                                _,
                                currentIndex
                            ) =>
                                currentIndex !==
                                index
                        ),
                };
            }
        );
    }


    function resetToAI() {

        if (
            !originalCampaign
        ) {
            return;
        }


        setCampaign({
            ...originalCampaign,
            channels: [
                ...originalCampaign.channels
            ],
        });


        setDraft({
            ...originalCampaign,
            channels: [
                ...originalCampaign.channels
            ],
        });


        setEditedFields(
            []
        );


        setEditing(
            null
        );
    }


    /* =====================================================
       CHANNEL ICON
       ===================================================== */

    function getChannelIcon(
        channel: string
    ) {

        const lower =
            channel.toLowerCase();


        if (
            lower.includes(
                "instagram"
            )
        ) {
            return (
                <Instagram
                    size={15}
                />
            );
        }


        if (
            lower.includes(
                "youtube"
            )
        ) {
            return (
                <Youtube
                    size={16}
                />
            );
        }


        if (
            lower.includes(
                "commerce"
            ) ||
            lower.includes(
                "e-commerce"
            )
        ) {
            return (
                <ShoppingBag
                    size={15}
                />
            );
        }


        return (
            <Sparkles
                size={15}
            />
        );
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

                        <Sparkles
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
                        Building campaign brief
                    </div>


                    <div
                        className="
              mt-2
              text-[12px]
              text-[#858A99]
            "
                    >
                        Translating consumer intelligence
                        into a strategic campaign...
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


    /* =====================================================
       ERROR
       ===================================================== */

    if (
        error ||
        !campaign ||
        !draft
    ) {

        return (
            <main className="min-h-screen">

                <div className="page-shell">

                    <TopNav />
                    <WorkflowProgress active="brief" />


                    <div className="py-32 text-center">

                        <div className="text-[15px] text-rose-300">
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
                            ← Return to opportunity
                        </button>

                    </div>

                </div>

            </main>
        );
    }


    /* =====================================================
       PAGE
       ===================================================== */

    return (
        <main className="min-h-screen">

            <div className="page-shell">

                <TopNav />
                <WorkflowProgress active="brief" />

                <section className="pb-24 pt-8">


                    {/* =================================================
              BACK
              ================================================= */}

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

                        Opportunity Intelligence
                    </button>


                    {/* =================================================
              HEADER
              ================================================= */}

                    <div className="mt-9">

                        <div className="kicker">
                            03 · Create
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
                                    Campaign Brief
                                </h1>


                                <div
                                    className="
                    mt-3
                    flex
                    items-center
                    gap-3
                  "
                                >

                                    <span
                                        className="
                      text-[14px]
                      text-[#8D92A1]
                    "
                                    >
                                        {campaign.trend}
                                    </span>


                                    <span className="text-[#555A68]">
                                        ×
                                    </span>


                                    <span
                                        className="
                      text-[13px]
                      font-semibold
                      tracking-[0.03em]
                      text-violet-400
                    "
                                    >
                                        {campaign.brand}
                                    </span>

                                </div>


                                <div
                                    className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-amber-400/15
                    bg-amber-400/[0.05]
                    px-3
                    py-1.5
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[.12em]
                    text-amber-300
                  "
                                >
                                    <Pencil size={11} />

                                    Human-in-the-loop editing enabled
                                </div>

                            </div>


                            <div
                                className="
                  flex
                  items-center
                  gap-3
                "
                            >

                                {editedFields.length >
                                    0 && (
                                        <button
                                            onClick={
                                                resetToAI
                                            }
                                            className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-white/[0.018]
                      px-3.5
                      py-2.5
                      text-[10px]
                      font-medium
                      text-[#8F93A3]
                      transition
                      hover:bg-white/[0.04]
                      hover:text-white
                    "
                                        >
                                            <RotateCcw
                                                size={13}
                                            />

                                            Restore AI brief
                                        </button>
                                    )}


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

                                    AI generated
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
              CAMPAIGN OBJECTIVE
              ================================================= */}

                    <div className="mt-10">

                        <EditableSection
                            title="Campaign objective"
                            field="objective"
                            value={
                                campaign.objective
                            }
                            draftValue={
                                draft.objective
                            }
                            editing={
                                editing
                            }
                            prominent
                            edited={
                                editedFields.includes(
                                    "objective"
                                )
                            }
                            onEdit={() =>
                                startEditing(
                                    "objective"
                                )
                            }
                            onChange={(
                                value
                            ) =>
                                updateDraftField(
                                    "objective",
                                    value
                                )
                            }
                            onSave={() =>
                                saveTextField(
                                    "objective"
                                )
                            }
                            onCancel={
                                cancelEditing
                            }
                        />

                    </div>


                    {/* =================================================
              AUDIENCE + TENSION
              ================================================= */}

                    <div
                        className="
              mt-5
              grid
              gap-5
              md:grid-cols-2
            "
                    >

                        <EditableSection
                            title="Target consumer"
                            field="audience"
                            value={
                                campaign.audience
                            }
                            draftValue={
                                draft.audience
                            }
                            editing={
                                editing
                            }
                            edited={
                                editedFields.includes(
                                    "audience"
                                )
                            }
                            onEdit={() =>
                                startEditing(
                                    "audience"
                                )
                            }
                            onChange={(
                                value
                            ) =>
                                updateDraftField(
                                    "audience",
                                    value
                                )
                            }
                            onSave={() =>
                                saveTextField(
                                    "audience"
                                )
                            }
                            onCancel={
                                cancelEditing
                            }
                        />


                        <EditableSection
                            title="Consumer tension"
                            field="tension"
                            value={
                                campaign.tension
                            }
                            draftValue={
                                draft.tension
                            }
                            editing={
                                editing
                            }
                            edited={
                                editedFields.includes(
                                    "tension"
                                )
                            }
                            onEdit={() =>
                                startEditing(
                                    "tension"
                                )
                            }
                            onChange={(
                                value
                            ) =>
                                updateDraftField(
                                    "tension",
                                    value
                                )
                            }
                            onSave={() =>
                                saveTextField(
                                    "tension"
                                )
                            }
                            onCancel={
                                cancelEditing
                            }
                        />

                    </div>


                    {/* =================================================
              CREATIVE DIRECTION
              ================================================= */}

                    <div
                        className="
              relative
              mt-5
              overflow-hidden
              rounded-[24px]
              border
              border-violet-400/15
              bg-gradient-to-br
              from-violet-500/[0.07]
              via-[#101119]
              to-[#0C0D13]
              p-8
            "
                    >

                        <div
                            className="
                pointer-events-none
                absolute
                right-[-120px]
                top-[-100px]
                h-[320px]
                w-[320px]
                rounded-full
                bg-violet-500/[0.07]
                blur-[100px]
              "
                        />


                        <div className="relative">

                            <div
                                className="
                  flex
                  items-center
                  justify-between
                "
                            >

                                <div className="kicker">
                                    Creative direction
                                </div>

                            </div>


                            <div
                                className="
                  mt-6
                  grid
                  gap-5
                  xl:grid-cols-[.9fr_1.1fr]
                "
                            >

                                <EditableSection
                                    title="Creative territory"
                                    field="creative_territory"
                                    value={
                                        campaign.creative_territory
                                    }
                                    draftValue={
                                        draft.creative_territory
                                    }
                                    editing={
                                        editing
                                    }
                                    multiline={
                                        false
                                    }
                                    prominent
                                    edited={
                                        editedFields.includes(
                                            "creative_territory"
                                        )
                                    }
                                    onEdit={() =>
                                        startEditing(
                                            "creative_territory"
                                        )
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateDraftField(
                                            "creative_territory",
                                            value
                                        )
                                    }
                                    onSave={() =>
                                        saveTextField(
                                            "creative_territory"
                                        )
                                    }
                                    onCancel={
                                        cancelEditing
                                    }
                                />


                                <div className="space-y-5">

                                    <EditableSection
                                        title="Key message"
                                        field="key_message"
                                        value={
                                            campaign.key_message
                                        }
                                        draftValue={
                                            draft.key_message
                                        }
                                        editing={
                                            editing
                                        }
                                        edited={
                                            editedFields.includes(
                                                "key_message"
                                            )
                                        }
                                        onEdit={() =>
                                            startEditing(
                                                "key_message"
                                            )
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateDraftField(
                                                "key_message",
                                                value
                                            )
                                        }
                                        onSave={() =>
                                            saveTextField(
                                                "key_message"
                                            )
                                        }
                                        onCancel={
                                            cancelEditing
                                        }
                                    />


                                    <EditableSection
                                        title="Hero copy"
                                        field="hero_copy"
                                        value={
                                            campaign.hero_copy
                                        }
                                        draftValue={
                                            draft.hero_copy
                                        }
                                        editing={
                                            editing
                                        }
                                        edited={
                                            editedFields.includes(
                                                "hero_copy"
                                            )
                                        }
                                        onEdit={() =>
                                            startEditing(
                                                "hero_copy"
                                            )
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateDraftField(
                                                "hero_copy",
                                                value
                                            )
                                        }
                                        onSave={() =>
                                            saveTextField(
                                                "hero_copy"
                                            )
                                        }
                                        onCancel={
                                            cancelEditing
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
              CHANNELS
              ================================================= */}

                    <div
                        className="
              panel
              mt-5
              rounded-[22px]
              p-7
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
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[.17em]
                  text-[#727786]
                "
                            >
                                Recommended channels
                            </div>


                            {editing !==
                                "channels" && (

                                    <button
                                        onClick={() =>
                                            startEditing(
                                                "channels"
                                            )
                                        }
                                        className="
                    flex
                    items-center
                    gap-1.5
                    text-[10px]
                    text-[#777C8C]
                    transition
                    hover:text-violet-300
                  "
                                    >
                                        <Pencil
                                            size={11}
                                        />

                                        Edit
                                    </button>
                                )}

                        </div>


                        {editing !==
                            "channels" ? (

                            <>
                                <div
                                    className="
                    mt-5
                    flex
                    flex-wrap
                    gap-3
                  "
                                >

                                    {campaign.channels.map(
                                        (
                                            channel
                                        ) => (

                                            <div
                                                key={
                                                    channel
                                                }
                                                className="
                          flex
                          items-center
                          gap-2.5
                          rounded-full
                          border
                          border-white/[0.07]
                          bg-white/[0.02]
                          px-4
                          py-2.5
                          text-[12px]
                          text-[#B7BAC5]
                        "
                                            >

                                                <span className="text-violet-400">
                                                    {getChannelIcon(
                                                        channel
                                                    )}
                                                </span>

                                                {channel}

                                            </div>

                                        )
                                    )}

                                </div>


                                {editedFields.includes(
                                    "channels"
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
                                            <Check
                                                size={11}
                                            />

                                            Edited by Brand Manager
                                        </div>

                                    )}
                            </>

                        ) : (

                            <div className="mt-5">

                                <div className="space-y-3">

                                    {draft.channels.map(
                                        (
                                            channel,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    index
                                                }
                                                className="
                          flex
                          items-center
                          gap-3
                        "
                                            >

                                                <input
                                                    value={
                                                        channel
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateChannel(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="
                            flex-1
                            rounded-xl
                            border
                            border-white/[0.08]
                            bg-[#0D0F15]
                            px-4
                            py-3
                            text-[13px]
                            text-white
                            outline-none
                            focus:border-violet-400/30
                          "
                                                />


                                                <button
                                                    onClick={() =>
                                                        removeChannel(
                                                            index
                                                        )
                                                    }
                                                    className="
                            rounded-lg
                            border
                            border-white/[0.07]
                            px-3
                            py-3
                            text-[10px]
                            text-[#777C8C]
                            transition
                            hover:border-rose-400/20
                            hover:text-rose-300
                          "
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        )
                                    )}

                                </div>


                                <button
                                    onClick={
                                        addChannel
                                    }
                                    className="
                    mt-4
                    text-[10px]
                    font-medium
                    text-violet-400
                  "
                                >
                                    + Add channel
                                </button>


                                <div
                                    className="
                    mt-5
                    flex
                    gap-3
                  "
                                >

                                    <button
                                        onClick={
                                            saveChannels
                                        }
                                        className="
                      rounded-lg
                      bg-violet-500
                      px-4
                      py-2
                      text-[10px]
                      font-semibold
                      text-white
                      hover:bg-violet-400
                    "
                                    >
                                        Save channels
                                    </button>


                                    <button
                                        onClick={
                                            cancelEditing
                                        }
                                        className="
                      rounded-lg
                      border
                      border-white/[0.08]
                      px-4
                      py-2
                      text-[10px]
                      text-[#9296A4]
                    "
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>

                        )}

                    </div>


                    {/* =================================================
              NEXT
              ================================================= */}

                    <div
                        className="
              mt-10
              flex
              flex-col
              items-end
              gap-3
            "
                    >

                        {editedFields.length >
                            0 && (

                                <div
                                    className="
                  text-[10px]
                  text-[#737887]
                "
                                >
                                    {editedFields.length} campaign field
                                    {editedFields.length ===
                                        1
                                        ? ""
                                        : "s"} modified by Brand Manager
                                </div>

                            )}


                        <button
                            disabled={
                                editing !==
                                null
                            }
                            onClick={() =>
                                router.push(
                                    `/localize/${encodeURIComponent(
                                        campaign.trend
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
                            Continue to localization

                            <ArrowRight
                                size={16}
                                className="
                  transition-transform
                  group-hover:translate-x-1
                "
                            />
                        </button>


                        {editing !==
                            null && (

                                <div
                                    className="
                  text-[10px]
                  text-amber-300
                "
                                >
                                    Save or cancel your current edit before continuing.
                                </div>

                            )}

                    </div>

                </section>

            </div>

        </main>
    );
}