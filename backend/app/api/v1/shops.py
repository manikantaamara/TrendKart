from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from app.models.schemas import ShopResponse, ShopCreate

router = APIRouter(prefix="/shops", tags=["Hyperlocal Shops"])

MOCK_SHOPS: List[ShopResponse] = []

@router.get("/nearby", response_model=List[ShopResponse])
def get_nearby_shops(
    lat: float = 28.6315,
    lng: float = 77.2167,
    max_distance_km: float = 10.0,
    search: Optional[str] = None
):
    results = MOCK_SHOPS
    if search:
        s = search.lower()
        results = [sh for sh in results if s in sh.shop_name.lower() or s in (sh.description or "").lower()]
    return results

@router.get("/{shop_id}", response_model=ShopResponse)
def get_shop_by_id(shop_id: str):
    for shop in MOCK_SHOPS:
        if shop.id == shop_id or shop.slug == shop_id:
            return shop
    raise HTTPException(status_code=404, detail="Shop not found")
