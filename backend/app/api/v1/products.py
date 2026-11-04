from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from app.models.schemas import ProductResponse, ProductCreate

router = APIRouter(prefix="/products", tags=["Products & Catalog"])

MOCK_PRODUCTS: List[ProductResponse] = []

@router.get("/search", response_model=List[ProductResponse])
def search_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    gender: Optional[str] = None,
    max_price: Optional[float] = None,
    max_delivery_mins: Optional[int] = None,
    size: Optional[str] = None,
    color: Optional[str] = None
):
    results = MOCK_PRODUCTS
    if q:
        query = q.lower()
        results = [
            p for p in results 
            if query in p.name.lower() 
            or query in (p.description or "").lower() 
            or query in p.shop_name.lower()
            or query in (p.category_name or "").lower()
        ]
    if gender and gender.lower() != "all":
        results = [p for p in results if p.gender.lower() == gender.lower() or p.gender.lower() == "unisex"]
    if max_price:
        results = [p for p in results if (p.discount_price or p.base_price) <= max_price]
    if max_delivery_mins:
        results = [p for p in results if (p.delivery_mins or 30) <= max_delivery_mins]
    if size:
        results = [p for p in results if size in p.sizes]
    if color:
        results = [p for p in results if any(color.lower() in c.lower() for c in p.colors)]
    return results

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str):
    for p in MOCK_PRODUCTS:
        if p.id == product_id or p.slug == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")

@router.post("/", response_model=ProductResponse)
def create_product(product_in: ProductCreate):
    new_id = f"prod-{len(MOCK_PRODUCTS) + 101}"
    new_product = ProductResponse(
        id=new_id,
        shop_id=product_in.shop_id,
        shop_name="Custom Shop",
        name=product_in.name,
        slug=product_in.name.lower().replace(" ", "-"),
        category_id=product_in.category_id,
        category_name="Custom Category",
        brand_name="Shop Verified",
        description=product_in.description,
        gender=product_in.gender,
        base_price=product_in.base_price,
        discount_price=product_in.discount_price,
        images=product_in.images or ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"],
        sizes=[inv.size for inv in product_in.inventory] or ["S", "M", "L"],
        colors=[inv.color for inv in product_in.inventory] or ["Default"],
        in_stock=True,
        ai_generated_desc="✨ AI Generated item.",
        rating=5.0,
        distance_km=1.0,
        delivery_mins=30
    )
    MOCK_PRODUCTS.insert(0, new_product)
    return new_product
