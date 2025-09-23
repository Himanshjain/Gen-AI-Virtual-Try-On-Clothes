from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from utils.base64_helpers import array_buffer_to_base64
from utils.prompt_builder import build_tryon_prompt
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os, base64, traceback

load_dotenv()
router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in .env")

client = genai.Client(api_key=GEMINI_API_KEY)
print("Using GEMINI_API_KEY:", GEMINI_API_KEY[:8], "…")

@router.post("/try-on")
async def try_on(
    person_image: UploadFile = File(...),
    cloth_image: UploadFile = File(...),
    instructions: str = Form(""),
    model_type: str = Form(""),
    gender: str = Form(""),
    garment_type: str = Form(""),
    style: str = Form(""),
):
    try:
        # ---- 1. Validate + read your files ----
        MAX_MB = 10
        ALLOWED = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}

        async def validate(file: UploadFile, name: str):
            if file.content_type not in ALLOWED:
                raise HTTPException(400, f"{name}: unsupported {file.content_type}")
            data = await file.read()
            if len(data) > MAX_MB * 1024 * 1024:
                raise HTTPException(400, f"{name}: exceeds {MAX_MB}MB")
            return array_buffer_to_base64(data), file.content_type

        user_b64, user_mime = await validate(person_image, "person_image")
        cloth_b64, cloth_mime = await validate(cloth_image, "cloth_image")

        # ---- 2. Build prompt via our template ----
        prompt = build_tryon_prompt(
            model_type=model_type,
            gender=gender,
            garment_type=garment_type,
            style=style,
            instructions=instructions,
        )
        # print("Using prompt:", prompt[:200], "…")  # log first 200 chars
        

        # ---- 3. Call Gemini ----
        contents = [
            prompt,
            types.Part.from_bytes(data=user_b64, mime_type=user_mime),
            types.Part.from_bytes(data=cloth_b64, mime_type=cloth_mime),
        ]
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp-image-generation",
            contents=contents,
            config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
        )

        # ---- 4. Extract TEXT + IMAGE ----
        image_data = None
        text_response = "No description returned."
        candidate = (response.candidates or [None])[0]
        if candidate and candidate.content.parts:
            for part in candidate.content.parts:
                if getattr(part, "text", None):
                    text_response = part.text.strip()
                elif getattr(part, "inline_data", None):
                    image_data = part.inline_data.data
                    image_mime = getattr(part.inline_data, "mime_type", "image/png")

        if not image_data:
            raise HTTPException(502, "No image returned by AI service")

        # ---- 5. Encode & return ----
        b64 = base64.b64encode(image_data).decode("utf-8")
        data_uri = f"data:{image_mime};base64,{b64}"
        return JSONResponse({"image": data_uri, "text": text_response})

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, "Internal Server Error")
