from fastapi import APIRouter
from app.models.schemas import AIDescRequest, AIDescResponse, AIBackgroundRemovalRequest, AIBackgroundRemovalResponse, AIOutfitRequest, ChatMessage
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/generate-description", response_model=AIDescResponse)
def generate_product_desc(req: AIDescRequest):
    return AIService.generate_product_description(req)

@router.post("/remove-background", response_model=AIBackgroundRemovalResponse)
def remove_image_background(req: AIBackgroundRemovalRequest):
    processed = AIService.remove_background(req.image_url, req.background_style)
    return AIBackgroundRemovalResponse(processed_image_url=processed)

@router.post("/outfit-recommendations")
def get_outfit_recommendations(req: AIOutfitRequest):
    return AIService.recommend_outfits(req)

@router.post("/chatbot")
def chatbot_interaction(query_text: str):
    return AIService.fashion_chatbot_respond(query_text)

@router.get("/demand-forecast")
def get_demand_forecast(shop_id: str):
    return {
        "shop_id": shop_id,
        "trending_categories": ["Linen Shirts", "Chikankari Sets", "Silk Blazers"],
        "predicted_high_demand_days": ["Friday", "Saturday", "Sunday"],
        "recommended_stock_top_up": [
            {"product_name": "Oversized Floral Linen Shirt", "recommended_units": 25},
            {"product_name": "Italian Super 120s Navy Blazer", "recommended_units": 10}
        ]
    }
