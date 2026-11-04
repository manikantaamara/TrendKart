import random
from typing import List, Dict, Any
from app.models.schemas import AIDescRequest, AIDescResponse, AIOutfitRequest

class AIService:
    @staticmethod
    def generate_product_description(req: AIDescRequest) -> AIDescResponse:
        """
        AI Engine that generates high-converting, SEO-optimized product copy for local fashion shops.
        """
        material = req.material or "Premium Breathable Fabric"
        fit = req.fit_type or "Modern Ergonomic Fit"
        
        copy_templates = [
            f"Step out in style with this handcrafted {req.title}. Crafted from {material} with a precision {fit}, this outfit delivers maximum comfort for everyday elegance. Designed for {req.gender} and tailored to elevate your wardrobe.",
            f"Elevate your fashion game with the all-new {req.title}. Made with ultra-soft {material}, featuring a stylish {fit}. Perfectly curated for local fashion enthusiasts who demand speed and premium quality.",
            f"Experience instant local luxury with this {req.title}. Engineered with high-durability {material} and a sleek {fit}. Handpicked from top local boutique collections."
        ]
        
        selected_copy = random.choice(copy_templates)
        
        tags = [
            req.category.lower(),
            req.gender.lower(),
            "local-fashion",
            "express-delivery",
            fit.lower().replace(" ", "-"),
            "trending-now"
        ]
        
        seo_title = f"{req.title} - Hyperlocal Express Delivery | TrendKart"
        
        return AIDescResponse(
            generated_description=selected_copy,
            suggested_tags=tags,
            seo_title=seo_title
        )

    @staticmethod
    def remove_background(image_url: str, style: str = "transparent") -> str:
        """
        Simulates AI background removal pipeline for studio quality shop uploads.
        """
        # Appends simulated AI canvas parameter or returns processed placeholder URL
        if "placeholder" in image_url or image_url.startswith("http"):
            return f"{image_url}?ai_bg_remove=processed&style={style}"
        return f"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80&bg={style}"

    @staticmethod
    def recommend_outfits(req: AIOutfitRequest) -> List[Dict[str, Any]]:
        """
        AI Matchmaker: Generates full outfit pairings (Top + Bottom + Footwear/Accessories)
        matching gender, occasion, budget, and color harmony.
        """
        outfits = [
            {
                "outfit_name": f"{req.occasion} Modern Ensemble",
                "match_score": 98,
                "reasoning": f"Perfect match for {req.occasion} using a balanced {req.primary_color} palette under ₹{req.budget_max}.",
                "items": [
                    {
                        "type": "Topwear",
                        "name": f"{req.primary_color.capitalize()} Premium Oxford Shirt",
                        "price": min(req.budget_max * 0.45, 1499),
                        "shop": "Raymond Hyperlocal Store"
                    },
                    {
                        "type": "Bottomwear",
                        "name": "Tailored Charcoal Chinos",
                        "price": min(req.budget_max * 0.40, 1299),
                        "shop": "Urbanic Express Store"
                    },
                    {
                        "type": "Footwear",
                        "name": "Handcrafted Leather Loafers",
                        "price": min(req.budget_max * 0.15, 899),
                        "shop": "Metro Shoes Local Hub"
                    }
                ]
            },
            {
                "outfit_name": f"{req.occasion} Festival Special",
                "match_score": 94,
                "reasoning": "Curated with high breathable fabric from nearby boutiques with instant 30-min delivery.",
                "items": [
                    {
                        "type": "Ethnic Outerwear",
                        "name": f"Embroidered {req.primary_color.capitalize()} Nehru Jacket",
                        "price": min(req.budget_max * 0.50, 1799),
                        "shop": "Manyavar Local Boutique"
                    },
                    {
                        "type": "Kurta Set",
                        "name": "Silk Blend White Kurta Pyjama",
                        "price": min(req.budget_max * 0.50, 1499),
                        "shop": "FabIndia Hyper Store"
                    }
                ]
            }
        ]
        return outfits

    @staticmethod
    def fashion_chatbot_respond(query: str) -> Dict[str, Any]:
        """
        AI Conversational Assistant for TrendKart customers.
        """
        q = query.lower()
        if "deliver" in q or "time" in q or "fast" in q:
            reply = "⚡ All items on TrendKart are sourced from shops within 5km of your location and delivered in 30-45 minutes by local delivery riders!"
        elif "return" in q or "refund" in q:
            reply = "🔄 We offer hassle-free instant returns within 7 days. Our delivery partner will pick it up directly from your doorstep."
        elif "wedding" in q or "ethnic" in q or "party" in q:
            reply = "✨ For grand occasions, I recommend exploring our Manyavar and FabIndia verified nearby boutique collections."
        else:
            reply = f"🛍️ I searched nearby stores for '{query}'. Here are top-rated items available for instant delivery today!"
            
        return {
            "reply": reply,
            "suggested_actions": ["Filter by 30-min delivery", "View Near Stores", "Try AI Outfit Matcher"]
        }
