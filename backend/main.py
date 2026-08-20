from copy import deepcopy
from pathlib import Path
from typing import Any, Optional

import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from brands import recommend_brand
from scoring import calculate_opportunity_score

from state.project_state import PROJECT_STATE

import re

from datetime import datetime, timezone

import json
import os

from openai import OpenAI

# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "trends.csv"
)

# =========================================================
# LIVE AI CONFIG
#
# AI is used ONLY for interpreting custom signals.
# Everything downstream remains deterministic.
# =========================================================

AI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-5.4-nano"
)

AI_MAX_OUTPUT_TOKENS = 320


def get_openai_client():

    api_key = os.getenv(
        "OPENAI_API_KEY"
    )

    if not api_key:

        raise RuntimeError(
            "OPENAI_API_KEY is not configured."
        )

    return OpenAI(
        api_key=api_key,
        timeout=8.0,
        max_retries=0
    )

# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="Signal-to-Campaign Studio API",
    version="0.2.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://hul-techtonic-alpha.vercel.app"

    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ]
)


# =========================================================
# REQUEST MODELS
# =========================================================

class AISignalAnalysis(BaseModel):
    hashtag: str
    category: str
    market: str
    consumer_need: str

    recommended_brand: str
    brand_reason: str

    trend_velocity: int
    brand_relevance: int
    consumer_fit: int
    sentiment: int
    time_sensitivity: int

    analysis_rationale: str

class TrendRequest(BaseModel):

    trend: str

    category: Optional[str] = None

    market: Optional[str] = None


class BrandUpdateRequest(BaseModel):

    brand: str

    reason: Optional[str] = None


class CampaignFieldUpdateRequest(BaseModel):

    field: str

    value: Any


class CampaignPatchRequest(BaseModel):

    objective: Optional[str] = None

    audience: Optional[str] = None

    tension: Optional[str] = None

    creative_territory: Optional[str] = None

    key_message: Optional[str] = None

    hero_copy: Optional[str] = None

    channels: Optional[list[str]] = None


class LocalizationFieldUpdateRequest(BaseModel):

    market: str

    field: str

    value: Any


class GovernanceDecisionRequest(BaseModel):

    decision: str

    feedback: Optional[str] = None

    route_to: Optional[str] = None

class GovernanceRegenerationRequest(BaseModel):
    feedback: str
    route_to: str
# =========================================================
# SIGNAL METADATA
# =========================================================

# =========================================================
# GOVERNANCE REGENERATION VARIANTS
# =========================================================

GOVERNANCE_REGENERATIONS = {

    "#MonsoonHairCare": {

        "Campaign Brief": [
            "The weather changes. Your hair confidence doesn't have to.",
            "Monsoon days change fast. Your confidence can stay constant.",
            "Whatever the weather brings, step out feeling like yourself."
        ],

        "Kerala": [
            "Monsoon outside. Confidence stays with you.",
            "Rainy day. Hair confidence, uninterrupted.",
            "Kerala monsoon outside. Your moment stays yours."
        ],

        "Tamil Nadu": [
            "Humidity is part of the day. Frizz doesn't have to be.",
            "Step into humidity with hair confidence intact.",
            "Hot, humid day. Still your hair, your way."
        ],

        "Karnataka Urban": [
            "Whatever the weather, step out ready.",
            "Bengaluru weather changes. Your confidence stays.",
            "Four seasons in a day. One confident you."
        ]
    },


    "#SweatProofConfidence": {

        "Campaign Brief": [
            "Pressure happens. Confidence can stay with you.",
            "High-pressure moment? Keep moving with confidence.",
            "Whatever the moment demands, stay confidently in motion."
        ],

        "Kerala": [
            "Humid day. Unshaken confidence.",
            "Humidity rises. Keep moving confidently.",
            "Busy day, humid weather, confidence intact."
        ],

        "Tamil Nadu": [
            "Heat moves up. Confidence moves with you.",
            "When temperatures rise, keep your confidence moving.",
            "Heat is part of the day. Confidence stays part of you."
        ],

        "Karnataka Urban": [
            "Pressure changes. Confidence stays.",
            "Meetings get intense. Keep moving confidently.",
            "From commute to presentation, stay confidently in motion."
        ]
    },


    "#SkinCyclingIndia": {

        "Campaign Brief": [
            "A smarter routine can also be a simpler one.",
            "Make skincare easier to understand and easier to follow.",
            "Less routine complexity. More consistency."
        ],

        "Kerala": [
            "Simpler steps. A routine you can stay with.",
            "Keep humid-weather skincare simple and consistent.",
            "A lighter routine for everyday consistency."
        ],

        "Tamil Nadu": [
            "Keep the routine simple. Keep it consistent.",
            "Fewer complications. A routine built to last.",
            "Smart skincare starts with a routine you can follow."
        ],

        "Karnataka Urban": [
            "Skincare that works with your calendar.",
            "A smarter routine for busy days.",
            "Your skincare routine should fit into your life."
        ]
    },


    "#QuickCommerceBeauty": {

        "Campaign Brief": [
            "Beauty essentials when the moment calls for them.",
            "Make everyday skincare easier to access when consumers need it.",
            "From discovery to doorstep, simplify the beauty purchase moment."
        ],

        "Kerala": [
            "Skincare when the need shows up.",
            "Your everyday skincare, easier to access.",
            "Beauty essentials ready for the moment."
        ],

        "Tamil Nadu": [
            "Your everyday skincare, without the wait.",
            "Need skincare today? Make access effortless.",
            "Everyday skincare for everyday moments."
        ],

        "Karnataka Urban": [
            "Beauty essentials at Bengaluru speed.",
            "Skincare built for fast-moving city routines.",
            "From need to doorstep, built for city life."
        ]
    }
}

CARD_META = {

    "#MonsoonHairCare": {

        "growth":
            "+326%",

        "window":
            "18–36h"
    },


    "#SweatProofConfidence": {

        "growth":
            "+284%",

        "window":
            "12–24h"
    },


    "#SkinCyclingIndia": {

        "growth":
            "+196%",

        "window":
            "2–4 days"
    },


    "#QuickCommerceBeauty": {

        "growth":
            "+168%",

        "window":
            "1–3 days"
    }
}


# =========================================================
# SIGNAL INSIGHTS
# =========================================================

INSIGHT_SUMMARIES = {

    "#MonsoonHairCare":

        "Monsoon humidity is accelerating conversations around "
        "frizz, hair damage and everyday manageability. "
        "The signal is highly relevant to South India and has "
        "a narrow activation window.",


    "#SweatProofConfidence":

        "Consumers are increasingly framing sweat management "
        "as a confidence issue during high-pressure social, "
        "professional and commuting moments.",


    "#SkinCyclingIndia":

        "Skincare consumers are showing growing interest in "
        "simpler, structured routines that reduce complexity "
        "while maintaining perceived efficacy.",


    "#QuickCommerceBeauty":

        "Beauty discovery is increasingly intersecting with "
        "instant commerce, creating opportunities around "
        "convenience, immediacy and impulse purchase."
}


# =========================================================
# DEFAULT CAMPAIGNS
#
# Used only to bootstrap PROJECT_STATE when a section
# is missing from project_state.py.
#
# After bootstrap, PROJECT_STATE is the runtime truth.
# =========================================================

DEFAULT_CAMPAIGNS = {

    "#MonsoonHairCare": {

        "objective":
            "Own the emerging monsoon hair-care conversation "
            "before the signal peaks.",

        "audience":
            "Women aged 18–30 in South India who experience "
            "humidity-driven frizz and want easy everyday "
            "hair management.",

        "tension":
            "Consumers want to look and feel put together, "
            "but monsoon humidity makes their hair difficult "
            "to manage at exactly the moments they want confidence.",

        "creative_territory":
            "Monsoon-Proof Your Moment",

        "key_message":
            "Don't let humidity decide your hair.",

        "hero_copy":
            "The weather can change. "
            "Your confidence doesn't have to.",

        "channels": [
            "Instagram Reels",
            "YouTube Shorts",
            "Quick Commerce"
        ]
    },


    "#SweatProofConfidence": {

        "objective":
            "Own high-pressure moments where sweat threatens "
            "consumer confidence and social comfort.",

        "audience":
            "Young urban consumers navigating high-energy "
            "professional, social and commuting moments.",

        "tension":
            "The moments where consumers most want to feel "
            "confident are often the same moments when heat, "
            "movement and pressure make them conscious of sweat.",

        "creative_territory":
            "Pressure Proof",

        "key_message":
            "Pressure rises. Rexona keeps up.",

        "hero_copy":
            "When the pressure is on, "
            "don't let sweat call the shots.",

        "channels": [
            "Instagram Reels",
            "YouTube Shorts",
            "Creator Content"
        ]
    },


    "#SkinCyclingIndia": {

        "objective":
            "Capture growing interest in structured skincare "
            "while making the routine feel simple and accessible.",

        "audience":
            "Digitally active skincare consumers in metropolitan "
            "India who are interested in better routines but "
            "overwhelmed by product complexity.",

        "tension":
            "Consumers want more intentional skincare, "
            "but increasingly complicated routines create "
            "confusion and make consistency difficult.",

        "creative_territory":
            "Simple Works",

        "key_message":
            "Smart skincare doesn't need to be complicated.",

        "hero_copy":
            "Less confusion. More skin confidence.",

        "channels": [
            "Instagram",
            "YouTube",
            "Beauty Creators"
        ]
    },


    "#QuickCommerceBeauty": {

        "objective":
            "Turn immediate beauty needs into fast, relevant "
            "purchase moments through quick-commerce channels.",

        "audience":
            "Urban beauty consumers who discover products "
            "digitally and increasingly expect beauty essentials "
            "to be available instantly.",

        "tension":
            "Beauty needs often emerge in the moment, "
            "but traditional purchase journeys require consumers "
            "to plan ahead or wait for delivery.",

        "creative_territory":
            "Beauty, Right Now",

        "key_message":
            "Your beauty routine shouldn't have a waiting period.",

        "hero_copy":
            "Need it now? Your skincare can be there in minutes.",

        "channels": [
            "Quick Commerce",
            "Instagram",
            "E-commerce Media"
        ]
    }
}


# =========================================================
# DEFAULT LOCALIZATION
# =========================================================

DEFAULT_LOCALIZATION = {

    "#MonsoonHairCare": {

        "Kerala": {

            "market":
                "Kerala",

            "language":
                "Malayalam-first with selective English brand language.",

            "theme":
                "Monsoon-ready everyday hair confidence",

            "consumer_context":
                "Long monsoon periods, heavy rainfall and persistent "
                "humidity make frizz and everyday hair manageability "
                "especially relevant.",

            "tagline":
                "The rain can stay. The frizz doesn't have to.",

            "rationale":
                "Keeps the core humidity-confidence territory while "
                "making monsoon intensity the dominant local context.",

            "channels": [
                "Instagram Reels",
                "Malayalam Creators",
                "Quick Commerce"
            ]
        },


        "Tamil Nadu": {

            "market":
                "Tamil Nadu",

            "language":
                "Tamil-first with concise English product cues.",

            "theme":
                "Humidity-resistant everyday confidence",

            "consumer_context":
                "Heat, humidity and long daily commutes create recurring "
                "hair-management challenges even outside heavy-rain periods.",

            "tagline":
                "Humidity shouldn't decide how you step out.",

            "rationale":
                "Shifts away from a rain-heavy monsoon execution toward "
                "the broader everyday humidity tension.",

            "channels": [
                "YouTube",
                "Instagram",
                "Tamil Beauty Creators"
            ]
        },


        "Karnataka Urban": {

            "market":
                "Karnataka Urban",

            "language":
                "English-Kannada hybrid for digitally active urban cohorts.",

            "theme":
                "Weather-proof convenience for busy urban routines",

            "consumer_context":
                "Rapid weather changes, commuting and convenience-led "
                "beauty behaviour create demand for low-effort hair solutions.",

            "tagline":
                "Bengaluru weather changes fast. Your confidence doesn't.",

            "rationale":
                "Connects the same campaign territory to urban convenience "
                "and unpredictable city weather.",

            "channels": [
                "Instagram Reels",
                "Quick Commerce",
                "Urban Digital Media"
            ]
        }
    },


    "#SweatProofConfidence": {

        "Kerala": {

            "market":
                "Kerala",

            "language":
                "Malayalam-first with simple English confidence cues.",

            "theme":
                "Stay confident through humid, high-energy days",

            "consumer_context":
                "High humidity can intensify sweat discomfort during "
                "commutes, social occasions and outdoor movement.",

            "tagline":
                "Humidity rises. Confidence stays.",

            "rationale":
                "Localizes the pressure-confidence territory around "
                "Kerala's humid climate without overstating product claims.",

            "channels": [
                "Instagram Reels",
                "Malayalam Lifestyle Creators",
                "YouTube"
            ]
        },


        "Tamil Nadu": {

            "market":
                "Tamil Nadu",

            "language":
                "Tamil-first.",

            "theme":
                "Confidence through heat and movement",

            "consumer_context":
                "Heat, commuting and active outdoor routines make "
                "sweat management a highly visible everyday concern.",

            "tagline":
                "When the heat is on, keep your confidence on.",

            "rationale":
                "Uses heat and movement as the local manifestation of "
                "the broader Pressure Proof campaign idea.",

            "channels": [
                "YouTube Shorts",
                "Instagram",
                "Tamil Youth Creators"
            ]
        },


        "Karnataka Urban": {

            "market":
                "Karnataka Urban",

            "language":
                "English-Kannada hybrid.",

            "theme":
                "Pressure-proof professional confidence",

            "consumer_context":
                "Office commutes, packed schedules and high-pressure "
                "work moments make sweat anxiety both functional and social.",

            "tagline":
                "Meetings get intense. Confidence doesn't have to.",

            "rationale":
                "Moves the campaign into a distinctly urban-professional "
                "moment while retaining Rexona's confidence territory.",

            "channels": [
                "Instagram",
                "Office Commute Media",
                "YouTube Shorts"
            ]
        }
    },


    "#SkinCyclingIndia": {

        "Kerala": {

            "market":
                "Kerala",

            "language":
                "Malayalam-first with accessible skincare terminology.",

            "theme":
                "Simple skincare for humid conditions",

            "consumer_context":
                "Humidity and changing skin comfort can make consumers "
                "more cautious about layering complicated routines.",

            "tagline":
                "Your routine can do more with less.",

            "rationale":
                "Connects the simplicity territory to a locally relevant "
                "desire for lighter, easier-to-follow skincare routines.",

            "channels": [
                "Instagram",
                "Malayalam Beauty Creators",
                "YouTube"
            ]
        },


        "Tamil Nadu": {

            "market":
                "Tamil Nadu",

            "language":
                "Tamil-first with familiar skincare vocabulary.",

            "theme":
                "Less complexity. More consistency.",

            "consumer_context":
                "Consumers discovering routines through creators may "
                "struggle to maintain increasingly complex skincare steps.",

            "tagline":
                "Better skincare doesn't need more steps.",

            "rationale":
                "Keeps the campaign anchored in simplicity and makes "
                "routine consistency the primary consumer benefit.",

            "channels": [
                "Instagram",
                "Tamil Beauty Creators",
                "YouTube Shorts"
            ]
        },


        "Karnataka Urban": {

            "market":
                "Karnataka Urban",

            "language":
                "English-led with Kannada adaptation where relevant.",

            "theme":
                "Smarter routines for time-poor consumers",

            "consumer_context":
                "Digitally active urban consumers are exposed to many "
                "skincare trends but have limited time for complex routines.",

            "tagline":
                "Smart skincare fits your schedule.",

            "rationale":
                "Reframes simplicity around convenience and time, which "
                "better fits an urban professional lifestyle.",

            "channels": [
                "Instagram",
                "Beauty Creators",
                "E-commerce Media"
            ]
        }
    },


    "#QuickCommerceBeauty": {

        "Kerala": {

            "market":
                "Kerala",

            "language":
                "Malayalam-first digital copy with English product names.",

            "theme":
                "Beauty essentials when the moment arrives",

            "consumer_context":
                "Quick-commerce adoption creates new opportunities for "
                "last-minute replenishment and spontaneous beauty purchases.",

            "tagline":
                "Your skincare essential, right when you need it.",

            "rationale":
                "Preserves the immediacy platform while keeping the "
                "execution functional and utility-led.",

            "channels": [
                "Quick Commerce",
                "Instagram",
                "Malayalam Digital Creators"
            ]
        },


        "Tamil Nadu": {

            "market":
                "Tamil Nadu",

            "language":
                "Tamil-first commerce copy.",

            "theme":
                "Instant access to everyday skincare",

            "consumer_context":
                "Consumers increasingly expect essential categories "
                "to be available with the same convenience as food "
                "and grocery delivery.",

            "tagline":
                "Skincare needed now? Don't wait for tomorrow.",

            "rationale":
                "Makes speed and everyday availability the central "
                "reason to engage with the campaign.",

            "channels": [
                "Quick Commerce",
                "Instagram",
                "Commerce Media"
            ]
        },


        "Karnataka Urban": {

            "market":
                "Karnataka Urban",

            "language":
                "English-led with Kannada contextual variants.",

            "theme":
                "Beauty that moves at city speed",

            "consumer_context":
                "High quick-commerce penetration and convenience-led "
                "shopping make immediate beauty fulfilment especially "
                "relevant in Bengaluru.",

            "tagline":
                "Your skincare can arrive before your next plan.",

            "rationale":
                "Makes urban speed and spontaneous social moments the "
                "creative expression of the Beauty, Right Now platform.",

            "channels": [
                "Quick Commerce",
                "Instagram Reels",
                "Urban Commerce Media"
            ]
        }
    }
}


# =========================================================
# GOVERNANCE DEFAULTS
# =========================================================

DEFAULT_GOVERNANCE = {

    "#MonsoonHairCare": {

        "Kerala": {
            "overall_status":
                "review",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Confidence-led messaging remains consistent "
                        "with the approved campaign territory."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "pass",

                    "detail":
                        "No absolute product-performance or unsupported "
                        "anti-frizz efficacy claims detected."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "review",

                    "detail":
                        "Regional marketing owner should confirm that "
                        "monsoon framing feels locally authentic."
                },

                {
                    "name":
                        "Language usage",

                    "status":
                        "review",

                    "detail":
                        "Malayalam copy requires native-language review."
                }
            ]
        },


        "Tamil Nadu": {
            "overall_status":
                "review",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Core confidence territory remains intact."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "pass",

                    "detail":
                        "No guaranteed humidity-resistance claim detected."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "pass",

                    "detail":
                        "No problematic cultural assumption detected."
                },

                {
                    "name":
                        "Language usage",

                    "status":
                        "review",

                    "detail":
                        "Tamil-first copy requires native review."
                }
            ]
        },


        "Karnataka Urban": {
            "overall_status":
                "review",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Urban convenience framing fits the campaign."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "pass",

                    "detail":
                        "No unsupported performance claim detected."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "review",

                    "detail":
                        "Bengaluru-specific language should be reviewed."
                },

                {
                    "name":
                        "Language usage",

                    "status":
                        "pass",

                    "detail":
                        "English-led execution presents low linguistic risk."
                }
            ]
        }
    },


    "#SweatProofConfidence": {

        "Kerala": {
            "overall_status":
                "review",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Confidence and movement align with Rexona."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "review",

                    "detail":
                        "Ensure confidence messaging is not interpreted "
                        "as an absolute efficacy guarantee."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "pass",

                    "detail":
                        "No sensitive cultural assumptions detected."
                },

                {
                    "name":
                        "Language usage",

                    "status":
                        "review",

                    "detail":
                        "Malayalam copy requires native review."
                }
            ]
        },


        "Tamil Nadu": {
            "overall_status":
                "review",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Heat and movement fit Pressure Proof."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "review",

                    "detail":
                        "Avoid implying unlimited sweat protection."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "pass",

                    "detail":
                        "No regional stereotype detected."
                },

                {
                    "name":
                        "Language usage",

                    "status":
                        "review",

                    "detail":
                        "Tamil copy requires native review."
                }
            ]
        },


        "Karnataka Urban": {
            "overall_status":
                "pass",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Professional confidence fits the campaign."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "pass",

                    "detail":
                        "No explicit unsupported efficacy claim."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "pass",

                    "detail":
                        "Professional context presents low cultural risk."
                },

                {
                    "name":
                        "Language usage",

                    "status":
                        "pass",

                    "detail":
                        "English-led execution presents low risk."
                }
            ]
        }
    },


    "#SkinCyclingIndia": {

        "Kerala": {
            "overall_status":
                "review",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Simplification fits the campaign platform."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "review",

                    "detail":
                        "Avoid implying fewer steps produce superior "
                        "clinical outcomes."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "pass",

                    "detail":
                        "Humidity context is functional."
                },

                {
                    "name":
                        "Language usage",

                    "status":
                        "review",

                    "detail":
                        "Malayalam skincare terminology requires review."
                }
            ]
        },


        "Tamil Nadu": {
            "overall_status":
                "review",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Consistency messaging preserves Simple Works."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "review",

                    "detail":
                        "Avoid comparative efficacy implications."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "pass",

                    "detail":
                        "No sensitive cultural framing detected."
                },

                {
                    "name":
                        "Language usage",

                    "status":
                        "review",

                    "detail":
                        "Tamil skincare terminology requires review."
                }
            ]
        },


        "Karnataka Urban": {
            "overall_status":
                "pass",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Time-saving positioning fits simplicity."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "pass",

                    "detail":
                        "No clinical or superiority claim detected."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "pass",

                    "detail":
                        "Urban lifestyle framing presents low risk."
                },

                {
                    "name":
                        "Language usage",

                    "status":
                        "pass",

                    "detail":
                        "English-led copy presents low language risk."
                }
            ]
        }
    },


    "#QuickCommerceBeauty": {

        "Kerala": {
            "overall_status":
                "review",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Utility-led immediacy fits the campaign."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "pass",

                    "detail":
                        "No product efficacy claim detected."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "pass",

                    "detail":
                        "No cultural stereotype detected."
                },

                {
                    "name":
                        "Availability claim",

                    "status":
                        "review",

                    "detail":
                        "Delivery-speed language must match "
                        "actual platform serviceability."
                }
            ]
        },


        "Tamil Nadu": {
            "overall_status":
                "review",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Speed positioning fits Beauty, Right Now."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "pass",

                    "detail":
                        "No product-performance claim detected."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "pass",

                    "detail":
                        "No sensitive regional assumption detected."
                },

                {
                    "name":
                        "Availability claim",

                    "status":
                        "review",

                    "detail":
                        "Any immediate-delivery promise must be "
                        "validated against serviceability."
                }
            ]
        },


        "Karnataka Urban": {
            "overall_status":
                "review",

            "checks": [

                {
                    "name":
                        "Brand tone",

                    "status":
                        "pass",

                    "detail":
                        "Urban speed positioning fits the campaign."
                },

                {
                    "name":
                        "Claims compliance",

                    "status":
                        "pass",

                    "detail":
                        "No efficacy claim detected."
                },

                {
                    "name":
                        "Cultural sensitivity",

                    "status":
                        "pass",

                    "detail":
                        "Bengaluru context presents low cultural risk."
                },

                {
                    "name":
                        "Availability claim",

                    "status":
                        "review",

                    "detail":
                        "Creative speed language must not become "
                        "an explicit delivery guarantee."
                }
            ]
        }
    }
}


# =========================================================
# BRAND ALTERNATIVES
# =========================================================

DEFAULT_BRAND_ALTERNATIVES = {

    "#MonsoonHairCare": [

        {
            "brand":
                "TRESemmé",

            "score":
                89
        },

        {
            "brand":
                "Dove Hair",

            "score":
                71
        }
    ],


    "#SweatProofConfidence": [

        {
            "brand":
                "Dove Deodorant",

            "score":
                74
        }
    ],


    "#SkinCyclingIndia": [

        {
            "brand":
                "Lakmé",

            "score":
                82
        },

        {
            "brand":
                "Dove Skincare",

            "score":
                69
        }
    ],


    "#QuickCommerceBeauty": [

        {
            "brand":
                "Lakmé",

            "score":
                86
        },

        {
            "brand":
                "Dove Skincare",

            "score":
                65
        }
    ]
}

# =========================================================
# CUSTOM OPPORTUNITY GENERATION
# =========================================================


CUSTOM_BRAND_ALTERNATIVES = {

    "haircare": [
        {
            "brand": "TRESemmé",
            "score": 86,
            "reason":
                "Strong fit with performance-led styling, "
                "frizz control and premium hair care."
        },
        {
            "brand": "Dove Hair",
            "score": 74,
            "reason":
                "Relevant nourishment and damage-care credentials."
        }
    ],

    "deodorant": [
        {
            "brand": "Dove Deodorant",
            "score": 76,
            "reason":
                "Relevant fit with underarm care and confidence."
        }
    ],

    "skincare": [
        {
            "brand": "Lakmé",
            "score": 83,
            "reason":
                "Strong relevance for beauty discovery and "
                "digitally active consumers."
        },
        {
            "brand": "Dove Skincare",
            "score": 72,
            "reason":
                "Relevant care credentials with broad consumer appeal."
        }
    ],

    "unknown": [
        {
            "brand": "HUL PORTFOLIO REVIEW",
            "score": 65,
            "reason":
                "The opportunity needs broader portfolio-level matching."
        }
    ]
}


def infer_custom_category(
    text: str
):

    value = text.lower()


    hair_keywords = [
        "hair",
        "frizz",
        "scalp",
        "shampoo",
        "conditioner",
        "hairfall",
        "hair fall",
        "dandruff"
    ]


    deodorant_keywords = [
        "sweat",
        "deodorant",
        "odour",
        "odor",
        "perspiration",
        "underarm",
        "body odour",
        "body odor"
    ]


    skincare_keywords = [
        "skin",
        "skincare",
        "serum",
        "face",
        "beauty",
        "moisturizer",
        "moisturiser",
        "acne",
        "glow",
        "sunscreen"
    ]


    if any(
        keyword in value
        for keyword in hair_keywords
    ):

        return "haircare"


    if any(
        keyword in value
        for keyword in deodorant_keywords
    ):

        return "deodorant"


    if any(
        keyword in value
        for keyword in skincare_keywords
    ):

        return "skincare"


    return "unknown"


def infer_custom_market(
    text: str
):

    value = text.lower()


    if any(
        word in value
        for word in [
            "kerala",
            "kochi",
            "trivandrum",
            "thiruvananthapuram"
        ]
    ):

        return "Kerala"


    if any(
        word in value
        for word in [
            "tamil nadu",
            "chennai",
            "coimbatore"
        ]
    ):

        return "Tamil Nadu"


    if any(
        word in value
        for word in [
            "karnataka",
            "bengaluru",
            "bangalore"
        ]
    ):

        return "Karnataka Urban"


    if any(
        word in value
        for word in [
            "office",
            "commute",
            "commuter",
            "metro",
            "urban",
            "professional"
        ]
    ):

        return "Urban India"


    return "India"


def infer_custom_need(
    text: str,
    category: str
):

    value = text.lower()


    if category == "haircare":

        if (
            "monsoon" in value
            or "humidity" in value
            or "frizz" in value
        ):

            return (
                "Easy hair manageability and confidence "
                "during humid or unpredictable weather."
            )

        return (
            "Simple everyday solutions for emerging "
            "hair-care concerns."
        )


    if category == "deodorant":

        if (
            "office" in value
            or "commute" in value
            or "professional" in value
        ):

            return (
                "Confidence and freshness during "
                "high-pressure commuting and professional moments."
            )

        return (
            "Reliable confidence and freshness "
            "during active everyday moments."
        )


    if category == "skincare":

        if (
            "quick commerce" in value
            or "instant" in value
            or "delivery" in value
        ):

            return (
                "Immediate access to skincare when "
                "a beauty need emerges."
            )

        return (
            "Simpler and more relevant skincare "
            "for changing consumer routines."
        )


    return (
        "An emerging consumer need identified "
        "from the submitted market signal."
    )


def make_custom_hashtag(
    text: str
):

    words = re.findall(
        r"[A-Za-z0-9]+",
        text
    )


    ignored = {
        "the",
        "a",
        "an",
        "and",
        "or",
        "for",
        "to",
        "of",
        "are",
        "is",
        "in",
        "on",
        "with",
        "during",
        "increasingly",
        "consumers"
    }


    useful_words = [
        word
        for word in words
        if word.lower()
        not in ignored
    ]


    selected = (
        useful_words[:4]
        if useful_words
        else ["New", "Consumer", "Signal"]
    )


    base = "#" + "".join(
        word[:1].upper()
        + word[1:]
        for word in selected
    )


    candidate = base

    counter = 2


    while (
        candidate
        in PROJECT_STATE
    ):

        candidate = (
            f"{base}{counter}"
        )

        counter += 1


    return candidate


def build_custom_scores(
    text: str,
    category: str
):

    value = text.lower()


    trend_velocity = 78

    brand_relevance = (
        84
        if category != "unknown"
        else 66
    )

    consumer_fit = 80

    sentiment = 76

    time_sensitivity = 79


    urgency_words = [
        "viral",
        "trending",
        "surge",
        "spike",
        "suddenly",
        "now",
        "summer",
        "monsoon",
        "festival"
    ]


    if any(
        word in value
        for word in urgency_words
    ):

        trend_velocity += 6

        time_sensitivity += 7


    if len(text.split()) >= 12:

        consumer_fit += 3


    values = {

        "trend_velocity":
            min(
                trend_velocity,
                100
            ),

        "brand_relevance":
            min(
                brand_relevance,
                100
            ),

        "consumer_fit":
            min(
                consumer_fit,
                100
            ),

        "sentiment":
            min(
                sentiment,
                100
            ),

        "time_sensitivity":
            min(
                time_sensitivity,
                100
            )
    }


    values[
        "opportunity_score"
    ] = calculate_opportunity_score(
        values
    )


    return values


def build_custom_campaign(
    trend: str,
    category: str,
    consumer_need: str,
    brand: str
):

    if category == "haircare":

        return {

            "objective":
                "Turn the emerging hair-care signal into "
                "a timely brand conversation before momentum decays.",

            "audience":
                "Digitally active consumers experiencing "
                "the emerging hair-care tension.",

            "tension":
                consumer_need,

            "creative_territory":
                "Own Your Hair Moment",

            "key_message":
                "Your environment should not decide "
                "how confident you feel about your hair.",

            "hero_copy":
                "Whatever the day brings, "
                "step out feeling like yourself.",

            "channels": [
                "Instagram Reels",
                "YouTube Shorts",
                "Creator Content"
            ]
        }


    if category == "deodorant":

        return {

            "objective":
                "Own the emerging confidence moment "
                "before the consumer conversation peaks.",

            "audience":
                "Young urban consumers navigating "
                "active, high-pressure everyday situations.",

            "tension":
                consumer_need,

            "creative_territory":
                "Confidence That Keeps Moving",

            "key_message":
                "Stay confident through the moments "
                "that put you under pressure.",

            "hero_copy":
                "The day gets intense. "
                "Your confidence can keep up.",

            "channels": [
                "Instagram Reels",
                "YouTube Shorts",
                "Creator Content"
            ]
        }


    if category == "skincare":

        return {

            "objective":
                "Translate the emerging skincare behaviour "
                "into a simple, timely brand opportunity.",

            "audience":
                "Digitally active skincare consumers "
                "responding to new beauty behaviours.",

            "tension":
                consumer_need,

            "creative_territory":
                "Skincare for the Moment",

            "key_message":
                "Make skincare easier to fit into "
                "the way consumers live today.",

            "hero_copy":
                "Skincare that moves with your life.",

            "channels": [
                "Instagram",
                "YouTube",
                "Digital Commerce"
            ]
        }


    return {

        "objective":
            "Translate the emerging consumer signal "
            "into a timely HUL brand opportunity.",

        "audience":
            "Consumers demonstrating emerging interest "
            "in the submitted trend.",

        "tension":
            consumer_need,

        "creative_territory":
            "Meet the Emerging Moment",

        "key_message":
            "Respond to the consumer need "
            "while the signal is still relevant.",

        "hero_copy":
            "Built for the moment consumers are moving toward.",

        "channels": [
            "Instagram",
            "YouTube",
            "Digital Commerce"
        ]
    }


def build_custom_localization(
    category: str,
    creative_territory: str
):

    return {

        "Kerala": {

            "market":
                "Kerala",

            "language":
                "Malayalam-first with selective English brand language.",

            "theme":
                f"{creative_territory} adapted for Kerala",

            "consumer_context":
                "Adapt the national idea around locally relevant "
                "climate, routines and consumer behaviour.",

            "tagline":
                "Built for the local moment.",

            "rationale":
                "AI adapted the national campaign while "
                "preserving the approved core strategy.",

            "channels": [
                "Instagram Reels",
                "Malayalam Creators",
                "Digital Commerce"
            ]
        },


        "Tamil Nadu": {

            "market":
                "Tamil Nadu",

            "language":
                "Tamil-first with concise English product cues.",

            "theme":
                f"{creative_territory} adapted for Tamil Nadu",

            "consumer_context":
                "Adapt the national idea to everyday routines, "
                "climate and digital behaviour in Tamil Nadu.",

            "tagline":
                "Made relevant for the way your day moves.",

            "rationale":
                "AI localized execution without changing "
                "the national campaign strategy.",

            "channels": [
                "Instagram",
                "YouTube Shorts",
                "Tamil Creators"
            ]
        },


        "Karnataka Urban": {

            "market":
                "Karnataka Urban",

            "language":
                "English-Kannada hybrid for urban digital audiences.",

            "theme":
                f"{creative_territory} adapted for Karnataka Urban",

            "consumer_context":
                "Adapt the campaign to digitally active "
                "urban consumers and convenience-led routines.",

            "tagline":
                "Built to move at city speed.",

            "rationale":
                "AI preserves the national strategy while "
                "adapting execution to urban Karnataka.",

            "channels": [
                "Instagram Reels",
                "Urban Digital Media",
                "Quick Commerce"
            ]
        }
    }


def build_custom_governance():

    return {

        "markets": {

            "Kerala": {

                "overall_status":
                    "review",

                "checks": [

                    {
                        "name":
                            "Brand tone",

                        "status":
                            "pass",

                        "detail":
                            "Generated execution remains within "
                            "the selected brand strategy."
                    },

                    {
                        "name":
                            "Claims compliance",

                        "status":
                            "pass",

                        "detail":
                            "No unsupported absolute product claim detected."
                    },

                    {
                        "name":
                            "Cultural sensitivity",

                        "status":
                            "review",

                        "detail":
                            "Regional context requires human validation."
                    },

                    {
                        "name":
                            "Language usage",

                        "status":
                            "review",

                        "detail":
                            "Malayalam-first copy requires native-language review."
                    }
                ]
            },


            "Tamil Nadu": {

                "overall_status":
                    "review",

                "checks": [

                    {
                        "name":
                            "Brand tone",

                        "status":
                            "pass",

                        "detail":
                            "Generated execution remains within "
                            "the selected brand strategy."
                    },

                    {
                        "name":
                            "Claims compliance",

                        "status":
                            "pass",

                        "detail":
                            "No unsupported absolute product claim detected."
                    },

                    {
                        "name":
                            "Cultural sensitivity",

                        "status":
                            "pass",

                        "detail":
                            "No obvious regional stereotype detected."
                    },

                    {
                        "name":
                            "Language usage",

                        "status":
                            "review",

                        "detail":
                            "Tamil-first copy requires native-language review."
                    }
                ]
            },


            "Karnataka Urban": {

                "overall_status":
                    "pass",

                "checks": [

                    {
                        "name":
                            "Brand tone",

                        "status":
                            "pass",

                        "detail":
                            "Execution remains aligned with brand strategy."
                    },

                    {
                        "name":
                            "Claims compliance",

                        "status":
                            "pass",

                        "detail":
                            "No unsupported absolute product claim detected."
                    },

                    {
                        "name":
                            "Cultural sensitivity",

                        "status":
                            "pass",

                        "detail":
                            "Urban framing presents low cultural risk."
                    },

                    {
                        "name":
                            "Language usage",

                        "status":
                            "pass",

                        "detail":
                            "English-led execution presents low linguistic risk."
                    }
                ]
            }
        },

        "decision":
            None,

        "feedback":
            None,

        "route_to":
            None,

        "revisions":
            []
    }

# =========================================================
# PRE-GENERATED AI DEMO SCENARIOS
# =========================================================

DEMO_SCENARIOS = {

    "helmet-scalp": {

        "signal":
            "Young professionals are increasingly discussing "
            "greasy scalp and flat hair after long two-wheeler commutes.",

        "category":
            "haircare",

        "market":
            "Urban India",

        "consumer_need":
            "Scalp freshness and manageable hair after long helmet-heavy commutes.",

        "trend_velocity":
            82,

        "brand_relevance":
            88,

        "consumer_fit":
            86,

        "sentiment":
            72,

        "time_sensitivity":
            79
    },


    "office-sweat": {

        "signal":
            "Office commuters are searching for ways to manage "
            "sweat and body odour through long summer workdays.",

        "category":
            "deodorant",

        "market":
            "Urban India",

        "consumer_need":
            "Reliable freshness and confidence throughout long, high-pressure workdays.",

        "trend_velocity":
            89,

        "brand_relevance":
            94,

        "consumer_fit":
            91,

        "sentiment":
            79,

        "time_sensitivity":
            88
    },


    "post-gym-hair": {

        "signal":
            "Urban women are discussing quick hair-refresh routines "
            "after workouts without doing a full wash.",

        "category":
            "haircare",

        "market":
            "Metro India",

        "consumer_need":
            "Quick hair refresh between workouts and the rest of the day.",

        "trend_velocity":
            78,

        "brand_relevance":
            85,

        "consumer_fit":
            83,

        "sentiment":
            81,

        "time_sensitivity":
            72
    },


    "barrier-repair": {

        "signal":
            "Consumers are moving away from aggressive skincare routines "
            "and talking more about repairing damaged skin barriers.",

        "category":
            "skincare",

        "market":
            "Metro India",

        "consumer_need":
            "Gentler skincare that supports recovery from over-complicated routines.",

        "trend_velocity":
            86,

        "brand_relevance":
            89,

        "consumer_fit":
            92,

        "sentiment":
            84,

        "time_sensitivity":
            77
    },


    "quick-commerce-refill": {

        "signal":
            "Consumers are increasingly buying skincare and personal-care "
            "essentials through quick-commerce when products run out unexpectedly.",

        "category":
            "skincare",

        "market":
            "Urban India",

        "consumer_need":
            "Immediate access to everyday beauty essentials when products unexpectedly run out.",

        "trend_velocity":
            84,

        "brand_relevance":
            87,

        "consumer_fit":
            88,

        "sentiment":
            82,

        "time_sensitivity":
            85
    },


    "hostel-haircare": {

        "signal":
            "College students living in hostels are discussing low-effort "
            "hair routines because of hard water, limited time and shared bathrooms.",

        "category":
            "haircare",

        "market":
            "Urban India",

        "consumer_need":
            "Simple haircare that works despite hard water, limited time and shared facilities.",

        "trend_velocity":
            76,

        "brand_relevance":
            86,

        "consumer_fit":
            90,

        "sentiment":
            75,

        "time_sensitivity":
            69
    },


    "festive-recovery": {

        "signal":
            "After wedding and festive seasons, consumers are searching "
            "for simple skincare routines to recover from heavy makeup and late nights.",

        "category":
            "skincare",

        "market":
            "India",

        "consumer_need":
            "Simple post-festive skincare that helps consumers return to their everyday routine.",

        "trend_velocity":
            81,

        "brand_relevance":
            84,

        "consumer_fit":
            85,

        "sentiment":
            80,

        "time_sensitivity":
            91
    },


    "humidity-fragrance": {

        "signal":
            "Young consumers in coastal cities are discussing deodorant "
            "and freshness solutions that last through humid commutes and social plans.",

        "category":
            "deodorant",

        "market":
            "Coastal Urban India",

        "consumer_need":
            "Freshness and confidence that fits humid commutes and long social days.",

        "trend_velocity":
            87,

        "brand_relevance":
            95,

        "consumer_fit":
            89,

        "sentiment":
            83,

        "time_sensitivity":
            86
    },


    "minimal-morning": {

        "signal":
            "Young professionals are simplifying morning skincare because "
            "long routines do not fit increasingly early commute schedules.",

        "category":
            "skincare",

        "market":
            "Urban India",

        "consumer_need":
            "Effective morning skincare that fits into increasingly compressed routines.",

        "trend_velocity":
            79,

        "brand_relevance":
            87,

        "consumer_fit":
            91,

        "sentiment":
            84,

        "time_sensitivity":
            74
    },


    "travel-personal-care": {

        "signal":
            "Frequent domestic travellers are discussing compact, spill-proof "
            "personal-care products for short work trips and weekend travel.",

        "category":
            "unknown",

        "market":
            "Urban India",

        "consumer_need":
            "Compact personal-care formats that are easy to carry on short trips.",

        "trend_velocity":
            73,

        "brand_relevance":
            76,

        "consumer_fit":
            84,

        "sentiment":
            82,

        "time_sensitivity":
            66
    }
}

# =========================================================
# DATA
# =========================================================

def load_trends():

    df = pd.read_csv(
        DATA_PATH
    )


    df[
        "opportunity_score"
    ] = df.apply(
        calculate_opportunity_score,
        axis=1
    )


    return (
        df
        .sort_values(
            "opportunity_score",
            ascending=False
        )
        .reset_index(
            drop=True
        )
    )


# =========================================================
# STATE HELPERS
# =========================================================

def get_project_state(
    trend: str
):

    state = PROJECT_STATE.get(
        trend
    )


    if state is None:

        raise HTTPException(
            status_code=404,
            detail=f"Unknown trend: {trend}"
        )


    return state


def get_selected_brand(
    trend: str
):

    state = get_project_state(
        trend
    )


    opportunity = state.setdefault(
        "opportunity",
        {}
    )


    selected_brand = opportunity.get(
        "selected_brand"
    )


    if selected_brand:

        return selected_brand


    recommended_brand = opportunity.get(
        "recommended_brand"
    )


    if recommended_brand:

        return recommended_brand


    df = load_trends()


    row = df[
        df["trend"] == trend
    ]


    if not row.empty:

        brand_info = recommend_brand(
            row.iloc[0][
                "category"
            ]
        )

        opportunity[
            "recommended_brand"
        ] = brand_info[
            "brand"
        ]

        opportunity[
            "brand_reason"
        ] = brand_info[
            "reason"
        ]


        return brand_info[
            "brand"
        ]


    return "HUL BRAND"


def get_campaign_state(
    trend: str
):

    state = get_project_state(
        trend
    )


    if (
        "campaign"
        not in state
        or not state["campaign"]
    ):

        state[
            "campaign"
        ] = deepcopy(
            DEFAULT_CAMPAIGNS.get(
                trend,
                {}
            )
        )


    return state[
        "campaign"
    ]


def get_localization_state(
    trend: str
):

    state = get_project_state(
        trend
    )


    if (
        "localization"
        not in state
        or not state["localization"]
    ):

        state[
            "localization"
        ] = deepcopy(
            DEFAULT_LOCALIZATION.get(
                trend,
                {}
            )
        )


    return state[
        "localization"
    ]


def get_governance_state(
    trend: str
):

    state = get_project_state(
        trend
    )


    if (
        "governance"
        not in state
        or not state["governance"]
    ):

        state[
            "governance"
        ] = {

            "markets":
                deepcopy(
                    DEFAULT_GOVERNANCE.get(
                        trend,
                        {}
                    )
                ),

            "decision":
                None,

            "feedback":
                None,

            "route_to":
                None,

            "revisions":
                []
        }


    elif (
        "markets"
        not in state[
            "governance"
        ]
    ):

        # Handles the simple governance structure
        # created in the earlier state example.

        state[
            "governance"
        ] = {

            "markets":
                deepcopy(
                    DEFAULT_GOVERNANCE.get(
                        trend,
                        {}
                    )
                ),

            "decision":
                None,

            "feedback":
                None,

            "route_to":
                None,

            "revisions":
                []
        }


    return state[
        "governance"
    ]


# =========================================================
# BOOTSTRAP ALL FOUR TRENDS
# =========================================================

def bootstrap_project_state():

    df = load_trends()


    for _, row in df.iterrows():

        trend = row[
            "trend"
        ]


        state = PROJECT_STATE.setdefault(
            trend,
            {}
        )


        # -------------------------------------------------
        # SIGNAL
        # -------------------------------------------------

        signal = state.setdefault(
            "signal",
            {}
        )


        signal.update({

            "trend":
                trend,

            "category":
                row[
                    "category"
                ],

            "market":
                row[
                    "market"
                ],

            "consumer_need":
                row[
                    "consumer_need"
                ],

            "trend_velocity":
                float(
                    row[
                        "trend_velocity"
                    ]
                ),

            "brand_relevance":
                float(
                    row[
                        "brand_relevance"
                    ]
                ),

            "consumer_fit":
                float(
                    row[
                        "consumer_fit"
                    ]
                ),

            "sentiment":
                float(
                    row[
                        "sentiment"
                    ]
                ),

            "time_sensitivity":
                float(
                    row[
                        "time_sensitivity"
                    ]
                ),

            "opportunity_score":
                float(
                    row[
                        "opportunity_score"
                    ]
                ),

            "growth":
                CARD_META.get(
                    trend,
                    {}
                ).get(
                    "growth",
                    "+100%"
                ),

            "window":
                CARD_META.get(
                    trend,
                    {}
                ).get(
                    "window",
                    "Emerging"
                ),

            "insight_summary":
                INSIGHT_SUMMARIES.get(
                    trend,
                    ""
                )
        })


        # -------------------------------------------------
        # OPPORTUNITY
        # -------------------------------------------------

        opportunity = state.setdefault(
            "opportunity",
            {}
        )


        brand_info = recommend_brand(
            row[
                "category"
            ]
        )


        opportunity.setdefault(
            "recommended_brand",
            brand_info[
                "brand"
            ]
        )


        opportunity.setdefault(
            "selected_brand",
            opportunity[
                "recommended_brand"
            ]
        )


        opportunity.setdefault(
            "brand_reason",
            brand_info[
                "reason"
            ]
        )


        opportunity.setdefault(
            "alternative_brands",
            deepcopy(
                DEFAULT_BRAND_ALTERNATIVES.get(
                    trend,
                    []
                )
            )
        )


        # -------------------------------------------------
        # CAMPAIGN
        # -------------------------------------------------

        if (
            "campaign"
            not in state
            or not state[
                "campaign"
            ]
        ):

            state[
                "campaign"
            ] = deepcopy(
                DEFAULT_CAMPAIGNS.get(
                    trend,
                    {}
                )
            )


        # -------------------------------------------------
        # LOCALIZATION
        # -------------------------------------------------

        if (
            "localization"
            not in state
            or not state[
                "localization"
            ]
        ):

            state[
                "localization"
            ] = deepcopy(
                DEFAULT_LOCALIZATION.get(
                    trend,
                    {}
                )
            )


        # -------------------------------------------------
        # GOVERNANCE
        # -------------------------------------------------

        if (
            "governance"
            not in state
            or
            "markets"
            not in state[
                "governance"
            ]
        ):

            state[
                "governance"
            ] = {

                "markets":
                    deepcopy(
                        DEFAULT_GOVERNANCE.get(
                            trend,
                            {}
                        )
                    ),

                "decision":
                    None,

                "feedback":
                    None,

                "route_to":
                    None
            }


        # -------------------------------------------------
        # LAUNCH
        # -------------------------------------------------

        launch = state.setdefault(
            "launch",
            {}
        )


        launch.setdefault(
            "status",
            "Ready for approval"
        )


        launch.setdefault(
            "activated",
            False
        )


# Run once when backend starts.

bootstrap_project_state()


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():

    return {

        "status":
            "ok",

        "state_mode":
            "global",

        "tracked_opportunities":
            len(
                PROJECT_STATE
            )
    }


# =========================================================
# DEBUG / FULL STATE
# =========================================================

@app.get("/state/{trend}")
def read_full_state(
    trend: str
):

    return deepcopy(
        get_project_state(
            trend
        )
    )


# =========================================================
# SIGNALS / OPPORTUNITY RADAR
# =========================================================

@app.get("/signals")
def signals():

    records = []


    for trend, state in PROJECT_STATE.items():

        signal = state.get(
            "signal",
            {}
        )


        opportunity = state.get(
            "opportunity",
            {}
        )


        launch = state.get(
            "launch",
            {}
        )


        if not signal:

            continue


        records.append({

            # ---------------------------------------------
            # SIGNAL DATA
            # ---------------------------------------------

            **signal,


            # ---------------------------------------------
            # BRAND
            # ---------------------------------------------

            "brand":
                opportunity.get(
                    "selected_brand"
                )
                or opportunity.get(
                    "recommended_brand",
                    "HUL BRAND"
                ),


            "brand_reason":
                opportunity.get(
                    "brand_reason",
                    ""
                ),


            "alternative_brands":
                opportunity.get(
                    "alternative_brands",
                    []
                ),


            # ---------------------------------------------
            # WORKFLOW STATE
            # ---------------------------------------------

            "custom":
                state.get(
                    "custom",
                    False
                ),


            "approved":
                state.get(
                    "approved",
                    False
                ),


            # IMPORTANT:
            # Opportunity Radar uses this to:
            #
            # 1. turn activated cards green
            # 2. disable deletion
            # 3. route directly to Launch
            #
            "activated":
                launch.get(
                    "activated",
                    False
                ),
        })


    return sorted(
        records,

        key=lambda item:
            item.get(
                "opportunity_score",
                0
            ),

        reverse=True
    )
# =========================================================
# ANALYSE NEW TREND
# =========================================================

@app.post("/analyse-trend")
def analyse_trend(
    request: TrendRequest
):

    text = request.trend.lower()


    if request.category:

        category = (
            request.category
            .lower()
            .strip()
        )


    elif any(
        word in text

        for word in [
            "hair",
            "frizz",
            "shampoo",
            "scalp",
            "conditioner"
        ]
    ):

        category = (
            "haircare"
        )


    elif any(
        word in text

        for word in [
            "sweat",
            "deodorant",
            "odor",
            "odour",
            "perspiration"
        ]
    ):

        category = (
            "deodorant"
        )


    elif any(
        word in text

        for word in [
            "skin",
            "beauty",
            "serum",
            "face",
            "skincare"
        ]
    ):

        category = (
            "skincare"
        )


    else:

        category = (
            "unknown"
        )


    brand = recommend_brand(
        category
    )


    synthetic = {

        "trend_velocity":
            82,

        "brand_relevance":
            (
                84
                if category != "unknown"
                else 68
            ),

        "consumer_fit":
            81,

        "sentiment":
            78,

        "time_sensitivity":
            83
    }


    score = calculate_opportunity_score(
        synthetic
    )


    return {

        "trend":
            request.trend,

        "category":
            category,

        "market":
            request.market
            or "India",

        "brand":
            brand[
                "brand"
            ],

        "brand_reason":
            brand[
                "reason"
            ],

        "opportunity_score":
            score,

        **synthetic,

        "summary":
            (
                f'The signal "{request.trend}" appears '
                f'potentially actionable. The prototype '
                f'maps it to {category} and recommends '
                f'{brand["brand"]}.'
            )
    }


# =========================================================
# BRAND DECISION
# =========================================================

@app.post("/brand/{trend}/update")
def update_brand(
    trend: str,
    request: BrandUpdateRequest
):

    state = get_project_state(
        trend
    )


    opportunity = state.setdefault(
        "opportunity",
        {}
    )


    previous_brand = opportunity.get(
        "selected_brand"
    )


    opportunity[
        "selected_brand"
    ] = request.brand


    opportunity[
        "human_override"
    ] = (
        request.brand
        != opportunity.get(
            "recommended_brand"
        )
    )


    if request.reason:

        opportunity[
            "selection_reason"
        ] = request.reason


    return {

        "trend":
            trend,

        "previous_brand":
            previous_brand,

        "brand":
            request.brand,

        "human_override":
            opportunity[
                "human_override"
            ]
    }


# =========================================================
# CAMPAIGN
# =========================================================

@app.get("/campaign/{trend}")
def get_campaign(
    trend: str,
    brand: Optional[str] = None
):

    state = get_project_state(
        trend
    )


    # Temporary backwards compatibility with the
    # current frontend, which passes ?brand=...
    #
    # This also commits the human choice into
    # global project state.

    if brand:

        state[
            "opportunity"
        ][
            "selected_brand"
        ] = brand


        state[
            "opportunity"
        ][
            "human_override"
        ] = (
            brand
            != state[
                "opportunity"
            ].get(
                "recommended_brand"
            )
        )


    campaign = get_campaign_state(
        trend
    )


    return {

        "trend":
            trend,

        "brand":
            get_selected_brand(
                trend
            ),

        **campaign
    }


@app.post("/campaign/{trend}/update")
def update_campaign_field(
    trend: str,
    request: CampaignFieldUpdateRequest
):

    campaign = get_campaign_state(
        trend
    )


    allowed_fields = {

        "objective",
        "audience",
        "tension",
        "creative_territory",
        "key_message",
        "hero_copy",
        "channels"
    }


    if (
        request.field
        not in allowed_fields
    ):

        raise HTTPException(
            status_code=400,
            detail="Unsupported campaign field"
        )


    campaign[
        request.field
    ] = request.value


    state = get_project_state(
        trend
    )


    state.setdefault(
        "audit",
        []
    ).append({

        "stage":
            "campaign",

        "action":
            "human_edit",

        "field":
            request.field
    })


    return {

        "trend":
            trend,

        "brand":
            get_selected_brand(
                trend
            ),

        **campaign
    }


@app.patch("/campaign/{trend}")
def patch_campaign(
    trend: str,
    request: CampaignPatchRequest
):

    campaign = get_campaign_state(
        trend
    )


    updates = request.model_dump(
        exclude_none=True
    )


    campaign.update(
        updates
    )


    return {

        "trend":
            trend,

        "brand":
            get_selected_brand(
                trend
            ),

        **campaign
    }


# =========================================================
# LOCALIZATION
# =========================================================

@app.get("/localize/{trend}")
def localize_campaign(
    trend: str
):

    campaign = get_campaign_state(
        trend
    )


    localization = get_localization_state(
        trend
    )


    return {

        "trend":
            trend,

        "brand":
            get_selected_brand(
                trend
            ),

        "campaign":
            campaign.get(
                "creative_territory",
                "Campaign"
            ),

        "variants":
            list(
                localization.values()
            )
    }


@app.post("/localize/{trend}/update")
def update_localization(
    trend: str,
    request: LocalizationFieldUpdateRequest
):

    localization = get_localization_state(
        trend
    )


    if (
        request.market
        not in localization
    ):

        raise HTTPException(
            status_code=404,
            detail="Unknown market"
        )


    allowed_fields = {

        "language",
        "theme",
        "consumer_context",
        "tagline",
        "rationale",
        "channels"
    }


    if (
        request.field
        not in allowed_fields
    ):

        raise HTTPException(
            status_code=400,
            detail="Unsupported localization field"
        )


    localization[
        request.market
    ][
        request.field
    ] = request.value


    state = get_project_state(
        trend
    )


    state.setdefault(
        "audit",
        []
    ).append({

        "stage":
            "localization",

        "action":
            "human_edit",

        "market":
            request.market,

        "field":
            request.field
    })


    return localization[
        request.market
    ]


# =========================================================
# LOCALIZATION REGENERATION
# =========================================================

REGENERATED_TAGLINES = {

    "#MonsoonHairCare": {

        "Kerala":
            "Monsoon outside. Confidence stays with you.",

        "Tamil Nadu":
            "Humidity is part of the day. Frizz doesn't have to be.",

        "Karnataka Urban":
            "Whatever the weather, step out ready."
    },


    "#SweatProofConfidence": {

        "Kerala":
            "Humid day. Unshaken confidence.",

        "Tamil Nadu":
            "Heat moves up. Confidence moves with you.",

        "Karnataka Urban":
            "Pressure changes. Confidence stays."
    },


    "#SkinCyclingIndia": {

        "Kerala":
            "Simpler steps. A routine you can stay with.",

        "Tamil Nadu":
            "Keep the routine simple. Keep it consistent.",

        "Karnataka Urban":
            "Skincare that works with your calendar."
    },


    "#QuickCommerceBeauty": {

        "Kerala":
            "Skincare when the need shows up.",

        "Tamil Nadu":
            "Your everyday skincare, without the wait.",

        "Karnataka Urban":
            "Beauty essentials at Bengaluru speed."
    }
}


@app.post(
    "/localize/{trend}/regenerate/{market}"
)
def regenerate_localized_variant(
    trend: str,
    market: str
):

    localization = get_localization_state(
        trend
    )


    if (
        market
        not in localization
    ):

        raise HTTPException(
            status_code=404,
            detail="Unknown market"
        )


    variant = localization[
        market
    ]


    new_tagline = (
        REGENERATED_TAGLINES
        .get(
            trend,
            {}
        )
        .get(
            market,
            variant[
                "tagline"
            ]
        )
    )


    variant[
        "tagline"
    ] = new_tagline


    variant[
        "rationale"
    ] = (
        "AI regenerated this execution while preserving "
        "the approved national campaign strategy. "
        + variant.get(
            "rationale",
            ""
        )
    )


    state = get_project_state(
        trend
    )


    state.setdefault(
        "audit",
        []
    ).append({

        "stage":
            "localization",

        "action":
            "ai_regeneration",

        "market":
            market
    })


    return variant


# =========================================================
# GOVERNANCE
# =========================================================

@app.get("/governance/{trend}")
def governance_check(
    trend: str
):

    campaign = get_campaign_state(
        trend
    )


    governance = get_governance_state(
        trend
    )


    markets = []


    for market_name, market_data in (
        governance[
            "markets"
        ].items()
    ):

        markets.append({

            "market":
                market_name,

            **market_data
        })


    return {

        "trend":
            trend,

        "brand":
            get_selected_brand(
                trend
            ),

        "campaign":
            campaign.get(
                "creative_territory",
                "Campaign"
            ),

        "decision":
            governance.get(
                "decision"
            ),

        "feedback":
            governance.get(
                "feedback"
            ),

        "route_to":
            governance.get(
                "route_to"
            ),

        "markets":
            markets
    }


@app.post("/governance/{trend}/decision")
def governance_decision(
    trend: str,
    request: GovernanceDecisionRequest
):

    governance = get_governance_state(
        trend
    )


    valid_decisions = {
        "approve",
        "changes"
    }


    if (
        request.decision
        not in valid_decisions
    ):

        raise HTTPException(
            status_code=400,
            detail="Decision must be 'approve' or 'changes'"
        )


    if (
        request.decision == "changes"
        and not request.route_to
    ):

        raise HTTPException(
            status_code=400,
            detail="route_to is required when requesting changes"
        )


    governance[
        "decision"
    ] = request.decision


    governance[
        "feedback"
    ] = request.feedback


    governance[
        "route_to"
    ] = request.route_to


    state = get_project_state(
        trend
    )


    state.setdefault(
        "audit",
        []
    ).append({

        "stage":
            "governance",

        "action":
            request.decision,

        "route_to":
            request.route_to
    })


    if (
        request.decision
        == "approve"
    ):

        # Final human approval locks the opportunity.
        state[
            "approved"
        ] = True


        state[
            "launch"
        ][
            "status"
        ] = (
            "Approved for activation"
        )


    else:

        # Changes requested means the workflow
        # is not yet finally approved.
        state[
            "approved"
        ] = False


        state[
            "launch"
        ][
            "status"
        ] = (
            "Changes requested"
        )


    return {

        "trend":
            trend,

        "decision":
            governance[
                "decision"
            ],

        "feedback":
            governance[
                "feedback"
            ],

        "route_to":
            governance[
                "route_to"
            ]
    }

# =========================================================
# DELETE CUSTOM OPPORTUNITY
# =========================================================

# =========================================================
# DELETE OPPORTUNITY
#
# FINAL LIFECYCLE RULE:
#
# Not activated → deletable
# Activated     → immutable
# =========================================================

@app.delete("/opportunity/{trend}")
def delete_opportunity(
    trend: str
):

    state = PROJECT_STATE.get(
        trend
    )


    # -----------------------------------------------------
    # EXISTS?
    # -----------------------------------------------------

    if state is None:

        raise HTTPException(
            status_code=404,
            detail="Opportunity not found."
        )


    # -----------------------------------------------------
    # ACTIVATION STATE
    # -----------------------------------------------------

    activated = (
        state
        .get(
            "launch",
            {}
        )
        .get(
            "activated",
            False
        )
    )


    # -----------------------------------------------------
    # ACTIVATED CAMPAIGNS ARE IMMUTABLE
    # -----------------------------------------------------

    if activated:

        raise HTTPException(
            status_code=403,
            detail=(
                "This campaign has already been activated "
                "and the opportunity is now locked."
            )
        )


    # -----------------------------------------------------
    # DELETE ENTIRE WORKFLOW
    # -----------------------------------------------------

    del PROJECT_STATE[
        trend
    ]


    return {

        "trend":
            trend,

        "deleted":
            True,

        "status":
            "Opportunity deleted"
    }

# =========================================================
# LAUNCH
# =========================================================

@app.get("/launch/{trend}")
def launch_campaign(
    trend: str
):

    state = get_project_state(
        trend
    )


    campaign = get_campaign_state(
        trend
    )


    localization = get_localization_state(
        trend
    )


    launch = state.setdefault(
        "launch",
        {}
    )


    markets = []


    for market_name, variant in (
        localization.items()
    ):

        markets.append({

            "market":
                market_name,

            "status":
                "ready",

            "execution":
                variant.get(
                    "tagline",
                    ""
                ),

            "channels":
                variant.get(
                    "channels",
                    []
                )
        })


    return {

        "trend":
            trend,

        "brand":
            get_selected_brand(
                trend
            ),

        "campaign":
            campaign.get(
                "creative_territory",
                "Campaign"
            ),

        "status":
            launch.get(
                "status",
                "Ready for approval"
            ),

        "activated":
            launch.get(
                "activated",
                False
            ),

        "markets":
            markets
    }


@app.post("/launch/{trend}/activate")
def activate_campaign(
    trend: str
):

    state = get_project_state(
        trend
    )


    governance = get_governance_state(
        trend
    )


    if (
        governance.get(
            "decision"
        )
        != "approve"
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Campaign must be approved in governance "
                "before activation."
            )
        )


    launch = state[
        "launch"
    ]


    launch[
        "activated"
    ] = True


    launch[
        "status"
    ] = "Activated"


    state.setdefault(
        "audit",
        []
    ).append({

        "stage":
            "launch",

        "action":
            "activated"
    })


    return {

        "trend":
            trend,

        "status":
            "Activated",

        "activated":
            True
    }


# =========================================================
# RESET ONE WORKFLOW
# =========================================================

@app.post("/state/{trend}/reset")
def reset_workflow(
    trend: str
):

    if (
        trend
        not in PROJECT_STATE
    ):

        raise HTTPException(
            status_code=404,
            detail="Unknown trend"
        )


    # Preserve signal intelligence,
    # reset mutable workflow decisions.

    state = PROJECT_STATE[
        trend
    ]


    state[
        "opportunity"
    ][
        "selected_brand"
    ] = state[
        "opportunity"
    ][
        "recommended_brand"
    ]


    state[
        "opportunity"
    ][
        "human_override"
    ] = False


    state[
        "campaign"
    ] = deepcopy(
        DEFAULT_CAMPAIGNS[
            trend
        ]
    )


    state[
        "localization"
    ] = deepcopy(
        DEFAULT_LOCALIZATION[
            trend
        ]
    )


    state[
        "governance"
    ] = {

        "markets":
            deepcopy(
                DEFAULT_GOVERNANCE[
                    trend
                ]
            ),

        "decision":
            None,

        "feedback":
            None,

        "route_to":
            None
    }


    state[
        "launch"
    ] = {

        "status":
            "Ready for approval",

        "activated":
            False
    }


    state[
        "audit"
    ] = []


    return {

        "trend":
            trend,

        "status":
            "reset"
    }


# =========================================================
# GOVERNANCE — HUMAN FEEDBACK REGENERATION
# =========================================================

@app.post(
    "/governance/{trend}/regenerate"
)
def governance_regenerate(
    trend: str,
    request: GovernanceRegenerationRequest
):

    state = get_project_state(
        trend
    )


    governance = get_governance_state(
        trend
    )


    # -----------------------------------------------------
    # REVISION HISTORY
    # -----------------------------------------------------

    revisions = governance.setdefault(
        "revisions",
        []
    )


    version = (
        len(
            revisions
        )
        + 2
    )


    target = (
        request.route_to
    )


    allowed_targets = {
        "Campaign Brief",
        "Kerala",
        "Tamil Nadu",
        "Karnataka Urban"
    }


    if (
        target
        not in allowed_targets
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid regeneration target"
        )


    # -----------------------------------------------------
    # PICK NEXT AI VERSION
    # -----------------------------------------------------

    options = (
        GOVERNANCE_REGENERATIONS
        .get(
            trend,
            {}
        )
        .get(
            target,
            []
        )
    )


    option_index = (
        len(
            [
                revision

                for revision in revisions

                if revision[
                    "target"
                ] == target
            ]
        )
        %
        max(
            len(
                options
            ),
            1
        )
    )


    # =====================================================
    # CAMPAIGN BRIEF REGENERATION
    # =====================================================

    if (
        target ==
        "Campaign Brief"
    ):

        campaign = get_campaign_state(
            trend
        )


        before = campaign.get(
            "hero_copy",
            ""
        )


        if options:

            after = options[
                option_index
            ]

        else:

            after = (
                before
                + " Updated based on Brand Manager feedback."
            )


        campaign[
            "hero_copy"
        ] = after


        changed_field = (
            "hero_copy"
        )


    # =====================================================
    # REGIONAL REGENERATION
    # =====================================================

    else:

        localization = get_localization_state(
            trend
        )


        if (
            target
            not in localization
        ):

            raise HTTPException(
                status_code=404,
                detail="Regional variant not found"
            )


        variant = localization[
            target
        ]


        before = variant.get(
            "tagline",
            ""
        )


        if options:

            after = options[
                option_index
            ]

        else:

            after = (
                before
                + " Updated based on reviewer feedback."
            )


        variant[
            "tagline"
        ] = after


        variant[
            "rationale"
        ] = (
            "AI regenerated this regional execution "
            "using Brand Manager feedback while "
            "preserving the approved national strategy."
        )


        changed_field = (
            "tagline"
        )


    # -----------------------------------------------------
    # STORE REVISION
    # -----------------------------------------------------

    revision = {

        "version":
            version,

        "target":
            target,

        "feedback":
            request.feedback,

        "field":
            changed_field,

        "before":
            before,

        "after":
            after,

        "status":
            "regenerated"
    }


    revisions.append(
        revision
    )


    # -----------------------------------------------------
    # GOVERNANCE STATE
    # -----------------------------------------------------

    governance[
        "decision"
    ] = None


    governance[
        "feedback"
    ] = request.feedback


    governance[
        "route_to"
    ] = target


    # Any regeneration invalidates previous approval.

    state[
        "launch"
    ][
        "status"
    ] = "Governance review required"


    state[
        "launch"
    ][
        "activated"
    ] = False


    # -----------------------------------------------------
    # AUDIT LOG
    # -----------------------------------------------------

    state.setdefault(
        "audit",
        []
    ).append({

        "stage":
            "governance",

        "action":
            "human_feedback_regeneration",

        "target":
            target,

        "version":
            version,

        "feedback":
            request.feedback
    })


    return revision

# =========================================================
# ANALYSE + CREATE CUSTOM OPPORTUNITY
# =========================================================

# =========================================================
# LIVE AI CUSTOM SIGNAL
# =========================================================

@app.post("/analyse/custom")
def create_custom_opportunity(
    request: TrendRequest
):

    raw_signal = (
        request.trend
        .strip()
    )


    if not raw_signal:

        raise HTTPException(
            status_code=400,
            detail="Trend description cannot be empty."
        )


    try:

        analysis = (
            analyse_custom_signal_with_ai(
                raw_signal
            )
        )


        return (
            create_opportunity_from_analysis(

                raw_signal=
                    raw_signal,

                analysis=
                    analysis,

                analysis_source=
                    "live_ai"
            )
        )


    except HTTPException:

        raise


    except Exception as error:

        print(
            "[LIVE AI ERROR]",
            type(error).__name__,
            str(error)
        )


        raise HTTPException(
            status_code=503,
            detail=(
                "Live AI could not complete this analysis. "
                "Please try again or switch to Demo Mode."
            )
        )

# =========================================================
# CREATE CUSTOM OPPORTUNITY FROM NORMALISED ANALYSIS
# =========================================================

def create_opportunity_from_analysis(
    raw_signal: str,
    analysis: dict,
    analysis_source: str
):

    # -----------------------------------------------------
    # CORE ANALYSIS
    # -----------------------------------------------------

    category = (
        analysis[
            "category"
        ]
        .strip()
    )


    market = (
        analysis[
            "market"
        ]
        .strip()
    )


    consumer_need = (
        analysis[
            "consumer_need"
        ]
        .strip()
    )


    # -----------------------------------------------------
    # METRICS
    # -----------------------------------------------------

    scores = {

        "trend_velocity":
            analysis[
                "trend_velocity"
            ],

        "brand_relevance":
            analysis[
                "brand_relevance"
            ],

        "consumer_fit":
            analysis[
                "consumer_fit"
            ],

        "sentiment":
            analysis[
                "sentiment"
            ],

        "time_sensitivity":
            analysis[
                "time_sensitivity"
            ]
    }


    # -----------------------------------------------------
    # OPPORTUNITY SCORE
    #
    # The underlying component scores come from AI.
    # This only applies the visible weighted framework.
    # -----------------------------------------------------

    scores[
        "opportunity_score"
    ] = calculate_opportunity_score(
        scores
    )


    # -----------------------------------------------------
    # BRAND
    # -----------------------------------------------------

    if (
        analysis_source
        == "live_ai"
    ):

        recommended_brand = (
            analysis[
                "recommended_brand"
            ]
            .strip()
        )


        brand_reason = (
            analysis[
                "brand_reason"
            ]
            .strip()
        )


        # Live AI owns the recommendation.
        # Do NOT run deterministic brand matching.

        alternative_brands = []


    else:

        # Demo Mode remains pre-generated / deterministic.

        brand_info = (
            recommend_brand(
                category
            )
        )


        recommended_brand = (
            brand_info[
                "brand"
            ]
        )


        brand_reason = (
            brand_info[
                "reason"
            ]
        )


        alternative_brands = (
            deepcopy(
                CUSTOM_BRAND_ALTERNATIVES.get(
                    category,
                    CUSTOM_BRAND_ALTERNATIVES.get(
                        "unknown",
                        []
                    )
                )
            )
        )


    # -----------------------------------------------------
    # OPPORTUNITY NAME
    # -----------------------------------------------------

    if (
        analysis_source
        == "live_ai"
    ):

        trend = (
            analysis[
                "hashtag"
            ]
            .strip()
        )


    else:

        trend = (
            make_custom_hashtag(
                raw_signal
            )
        )


    if not trend.startswith(
        "#"
    ):

        trend = (
            "#"
            + trend
        )


    # Prevent very long AI-generated titles.

    if len(
        trend
    ) > 32:

        raise ValueError(
            "AI returned an opportunity name that is too long."
        )


    # -----------------------------------------------------
    # UNIQUE TREND ID
    # -----------------------------------------------------

    base_trend = (
        trend
    )

    counter = 2


    while (
        trend
        in PROJECT_STATE
    ):

        trend = (
            f"{base_trend}{counter}"
        )

        counter += 1


    # -----------------------------------------------------
    # CAMPAIGN SEED
    #
    # AI integration stops after opportunity creation.
    # Existing downstream workflow remains unchanged.
    # -----------------------------------------------------

    campaign = (
        build_custom_campaign(

            trend=
                trend,

            category=
                category,

            consumer_need=
                consumer_need,

            brand=
                recommended_brand
        )
    )


    # -----------------------------------------------------
    # AI RATIONALE
    # -----------------------------------------------------

    analysis_rationale = (
        analysis.get(
            "analysis_rationale",
            ""
        )
        .strip()
    )


    # -----------------------------------------------------
    # GLOBAL PROJECT STATE
    # -----------------------------------------------------

    PROJECT_STATE[
        trend
    ] = {

        # ---------------------------------------------
        # LIFECYCLE
        # ---------------------------------------------

        "custom":
            True,

        "approved":
            False,

        "analysis_source":
            analysis_source,

        "created_at":
            datetime.now(
                timezone.utc
            ).isoformat(),


        # ---------------------------------------------
        # SIGNAL
        # ---------------------------------------------

        "signal": {

            "trend":
                trend,

            "raw_signal":
                raw_signal,

            "category":
                category,

            "market":
                market,

            "consumer_need":
                consumer_need,

            **scores,

            "growth":
                "AI assessed",

            "window":
                "Emerging",

            "analysis_rationale":
                analysis_rationale,

            # Opportunity page currently reads
            # insight_summary, so feed the AI rationale
            # directly into that existing field.

            "insight_summary":
                analysis_rationale
        },


        # ---------------------------------------------
        # OPPORTUNITY
        # ---------------------------------------------

        "opportunity": {

            "recommended_brand":
                recommended_brand,

            "selected_brand":
                recommended_brand,

            "brand_reason":
                brand_reason,

            "alternative_brands":
                alternative_brands,

            "human_override":
                False
        },


        # ---------------------------------------------
        # CAMPAIGN
        # ---------------------------------------------

        "campaign":
            campaign,


        # ---------------------------------------------
        # LOCALIZATION
        # ---------------------------------------------

        "localization":
            build_custom_localization(

                category=
                    category,

                creative_territory=
                    campaign[
                        "creative_territory"
                    ]
            ),


        # ---------------------------------------------
        # GOVERNANCE
        # ---------------------------------------------

        "governance":
            build_custom_governance(),


        # ---------------------------------------------
        # LAUNCH
        # ---------------------------------------------

        "launch": {

            "status":
                "Not approved",

            "activated":
                False
        },


        # ---------------------------------------------
        # AUDIT
        # ---------------------------------------------

        "audit": [

            {
                "stage":
                    "signal",

                "action":
                    "custom_opportunity_created",

                "source":
                    analysis_source
            }

        ]
    }


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "trend":
            trend,

        "custom":
            True,

        "approved":
            False,

        "category":
            category,

        "market":
            market,

        "consumer_need":
            consumer_need,

        "opportunity_score":
            scores[
                "opportunity_score"
            ],

        "trend_velocity":
            scores[
                "trend_velocity"
            ],

        "brand_relevance":
            scores[
                "brand_relevance"
            ],

        "consumer_fit":
            scores[
                "consumer_fit"
            ],

        "sentiment":
            scores[
                "sentiment"
            ],

        "time_sensitivity":
            scores[
                "time_sensitivity"
            ],

        "brand":
            recommended_brand,

        "brand_reason":
            brand_reason,

        "analysis_source":
            analysis_source,

        "analysis_rationale":
            analysis_rationale,

        "status":
            "Opportunity created"
    }

# =========================================================
# PRE-GENERATED AI DEMO OPPORTUNITY
# =========================================================

@app.post(
    "/analyse/demo/{scenario_id}"
)
def analyse_demo_scenario(
    scenario_id: str
):

    scenario = (
        DEMO_SCENARIOS.get(
            scenario_id
        )
    )


    if scenario is None:

        raise HTTPException(
            status_code=404,
            detail="Demo scenario not found."
        )


    analysis = {

        "category":
            scenario[
                "category"
            ],

        "market":
            scenario[
                "market"
            ],

        "consumer_need":
            scenario[
                "consumer_need"
            ],

        "trend_velocity":
            scenario[
                "trend_velocity"
            ],

        "brand_relevance":
            scenario[
                "brand_relevance"
            ],

        "consumer_fit":
            scenario[
                "consumer_fit"
            ],

        "sentiment":
            scenario[
                "sentiment"
            ],

        "time_sensitivity":
            scenario[
                "time_sensitivity"
            ]
    }


    return create_opportunity_from_analysis(

        raw_signal=
            scenario[
                "signal"
            ],

        analysis=
            analysis,

        analysis_source=
            "pre_generated_ai"
    )

# =========================================================
# LIVE AI SIGNAL ANALYSIS
# =========================================================

def analyse_custom_signal_with_ai(
    raw_signal: str
):

    client = (
        get_openai_client()
    )
    prompt = f"""
You are the consumer-intelligence engine inside
HUL's Signal-to-Campaign Studio.

Analyse the consumer signal supplied by the marketer
and convert it into a complete structured opportunity.

CONSUMER SIGNAL:
{raw_signal}


=====================================================
1. OPPORTUNITY NAME
=====================================================

Create one short, memorable opportunity hashtag.

Rules:
- Must begin with #
- Maximum 24 characters including #
- 2 to 4 words in PascalCase
- Capture the consumer behaviour, tension or emerging need
- Should sound like a trend a marketing team would track
- Do not include an HUL brand name
- Avoid generic names such as #EmergingTrend

Examples:

Helmet-related hair freshness
→ #HelmetHairReset

Post-workout hair refresh
→ #PostGymHairRefresh

Portable detergent formats for travel
→ #TravelLaundryShift

Simpler skincare routines
→ #SkinRoutineReset


=====================================================
2. CATEGORY
=====================================================

Infer the most appropriate consumer-product category.

Do NOT restrict yourself to beauty and personal care.

Examples of valid categories include:

haircare
skincare
deodorant
beauty
fabric care
home care
oral care
nutrition
foods
personal care

Use a concise lowercase category name.

Choose the category based on the underlying consumer need,
not simple keyword matching.


=====================================================
3. MARKET
=====================================================

Infer the most appropriate Indian market or geography.

Examples:

India
Urban India
Metro India
South India
North India
Coastal Urban India
Kerala
Tamil Nadu
Karnataka Urban

If the signal does not provide enough geographic evidence,
use "India".

Do not invent geographic specificity.


=====================================================
4. CONSUMER NEED
=====================================================

Describe the underlying consumer need.

Rules:
- Maximum 18 words
- Focus on the actual consumer problem or tension
- Do not mention an HUL brand
- Do not describe a campaign
- Do not invent statistics


=====================================================
5. HUL BRAND MATCHING
=====================================================

Recommend the single HUL brand best positioned to respond
to the opportunity.

Relevant HUL brands may include, but are not limited to:

Sunsilk
Dove
TRESemmé
Pond's
Lakmé
Rexona
Surf Excel
Comfort
Vim
Pepsodent
Closeup
Horlicks
Kissan

Choose based on category, consumer need, brand relevance
and natural portfolio fit.

Do not simply match keywords.

If no HUL brand has a credible fit, use:

"HUL Portfolio Review"

Do not force a brand recommendation.

Return:

recommended_brand
brand_reason

brand_reason rules:
- Maximum 25 words
- Explain why this brand is strategically relevant
- Do not claim access to confidential HUL strategy


=====================================================
6. OPPORTUNITY METRICS
=====================================================

Return integer scores from 0 to 100.

trend_velocity:
How quickly this described behaviour could plausibly gain momentum.

brand_relevance:
How strongly the opportunity connects to the recommended HUL brand.

consumer_fit:
How clearly the signal reflects a meaningful consumer need.

sentiment:
How favourable and actionable the underlying consumer conversation appears.
50 means neutral.

time_sensitivity:
How quickly the opportunity may lose relevance if the brand waits.


SCORING GUIDANCE

90–100 = exceptional
75–89 = strong
60–74 = moderate
40–59 = weak
0–39 = very weak

Be conservative.

Do not automatically assign high scores.

Do not claim these scores come from measured social-listening data.
They are AI assessments of the supplied signal.


=====================================================
7. ANALYSIS RATIONALE
=====================================================

Explain why the signal represents a meaningful consumer
and brand opportunity.

Rules:
- Maximum 35 words
- 1 or 2 sentences
- Explain the underlying behaviour or tension
- Explain why it could matter to the recommended brand
- Do not expose internal chain-of-thought
- Do not invent statistics


=====================================================
RETURN THESE FIELDS
=====================================================

hashtag
category
market
consumer_need
recommended_brand
brand_reason
trend_velocity
brand_relevance
consumer_fit
sentiment
time_sensitivity
analysis_rationale


IMPORTANT

You are interpreting only the signal supplied by the user.

You are NOT claiming to have:
- performed live social listening
- measured actual search volume
- observed real sales data
- accessed confidential HUL strategy

Return only the structured result required by the schema.
"""



    response = (
        client.responses.parse(

            model=
                AI_MODEL,

            input=[
                {
                    "role":
                        "system",

                    "content":
                        (
                            "Extract structured consumer-signal "
                            "intelligence for a marketing workflow."
                        )
                },

                {
                    "role":
                        "user",

                    "content":
                        prompt
                }
            ],

            text_format=
                AISignalAnalysis,

            max_output_tokens=
                AI_MAX_OUTPUT_TOKENS
        )
    )


    result = (
        response.output_parsed
    )


    if result is None:

        raise RuntimeError(
            "The model returned no structured analysis."
        )

    if not result.category.strip():

        raise ValueError(
            "AI returned an empty category."
        )


    if not result.recommended_brand.strip():

        raise ValueError(
            "AI returned an empty brand recommendation."
        )


    if not result.hashtag.strip():

        raise ValueError(
            "AI returned an empty opportunity name."
        )
    # -----------------------------------------------------
    # SERVER-SIDE VALIDATION
    # -----------------------------------------------------


    score_fields = [
        result.trend_velocity,
        result.brand_relevance,
        result.consumer_fit,
        result.sentiment,
        result.time_sensitivity
    ]


    if not all(
        0 <= value <= 100
        for value in score_fields
    ):

        raise ValueError(
            "AI returned an invalid score."
        )


    return {
        "hashtag":
            result.hashtag,

        "category":
            result.category,

        "market":
            result.market,

        "consumer_need":
            result.consumer_need,

        "recommended_brand":
            result.recommended_brand,

        "brand_reason":
            result.brand_reason,

        "trend_velocity":
            result.trend_velocity,

        "brand_relevance":
            result.brand_relevance,

        "consumer_fit":
            result.consumer_fit,

        "sentiment":
            result.sentiment,

        "time_sensitivity":
            result.time_sensitivity,

        "analysis_rationale":
            result.analysis_rationale,

        "analysis_source":
            "live_ai"
    }

@app.get("/health")
def health():
    return {
        "status": "ok"
    }