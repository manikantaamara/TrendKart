from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --------------------------------------------------------------------
# AUTH SCHEMAS
# --------------------------------------------------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "customer" # customer, shop_owner, delivery_partner, admin

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    full_name: str
    email: str
    role: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

# --------------------------------------------------------------------
# SHOP SCHEMAS
# --------------------------------------------------------------------
class ShopBase(BaseModel):
    shop_name: str
    description: str
    address: str
    city: str
    pincode: str
    latitude: float
    longitude: float
    opening_time: str = "09:00"
    closing_time: str = "21:00"

class ShopCreate(ShopBase):
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None

class ShopResponse(ShopBase):
    id: str
    owner_id: str
    slug: str
    rating: float
    total_ratings: int
    is_verified: bool
    is_active: bool
    distance_km: Optional[float] = None
    estimated_delivery_mins: Optional[int] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None

# --------------------------------------------------------------------
# PRODUCT & INVENTORY SCHEMAS
# --------------------------------------------------------------------
class InventoryItem(BaseModel):
    size: str
    color: str
    stock_quantity: int
    sku: Optional[str] = None

class ProductCreate(BaseModel):
    shop_id: str
    name: str
    category_id: int
    brand_id: Optional[int] = None
    description: str
    gender: str = "unisex"
    base_price: float
    discount_price: Optional[float] = None
    barcode: Optional[str] = None
    images: List[str] = []
    inventory: List[InventoryItem] = []

class ProductResponse(BaseModel):
    id: str
    shop_id: str
    shop_name: str
    name: str
    slug: str
    category_id: Optional[int]
    category_name: Optional[str]
    brand_name: Optional[str]
    description: str
    gender: str
    base_price: float
    discount_price: Optional[float]
    images: List[str]
    sizes: List[str]
    colors: List[str]
    in_stock: bool
    ai_generated_desc: Optional[str] = None
    rating: float = 4.7
    distance_km: Optional[float] = 1.2
    delivery_mins: Optional[int] = 25

# --------------------------------------------------------------------
# ORDER & CHECKOUT SCHEMAS
# --------------------------------------------------------------------
class CartItemSchema(BaseModel):
    product_id: str
    size: str
    color: str
    quantity: int

class OrderCreate(BaseModel):
    shop_id: str
    address_id: str
    payment_method: str # UPI, CREDIT_CARD, RAZORPAY, COD
    items: List[CartItemSchema]
    coupon_code: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_number: str
    shop_id: str
    shop_name: str
    customer_id: str
    customer_name: str
    delivery_address: str
    total_amount: float
    discount_amount: float
    delivery_fee: float
    net_amount: float
    status: str
    payment_status: str
    otp_code: str
    estimated_delivery_time: str
    items_count: int
    created_at: str

# --------------------------------------------------------------------
# DELIVERY & GPS TRACKING
# --------------------------------------------------------------------
class DeliveryLocationUpdate(BaseModel):
    order_id: str
    current_lat: float
    current_lng: float
    speed_kmh: float = 25.0
    status: str = "out_for_delivery"

class DeliveryTrackingResponse(BaseModel):
    order_id: str
    order_number: str
    driver_name: str
    driver_phone: str
    vehicle_number: str
    driver_lat: float
    driver_lng: float
    shop_lat: float
    shop_lng: float
    customer_lat: float
    customer_lng: float
    estimated_minutes: int
    otp_code: str
    status: str

# --------------------------------------------------------------------
# AI TOOL SCHEMAS
# --------------------------------------------------------------------
class AIDescRequest(BaseModel):
    title: str
    category: str
    gender: str
    material: Optional[str] = "100% Premium Cotton"
    fit_type: Optional[str] = "Slim Fit"
    keywords: Optional[List[str]] = []

class AIDescResponse(BaseModel):
    generated_description: str
    suggested_tags: List[str]
    seo_title: str

class AIBackgroundRemovalRequest(BaseModel):
    image_url: str
    background_style: str = "transparent" # transparent, studio_white, pastel_gradient

class AIBackgroundRemovalResponse(BaseModel):
    processed_image_url: str
    status: str = "success"

class AIOutfitRequest(BaseModel):
    gender: str
    occasion: str # Casual, Formal, Wedding, Party, Summer
    primary_color: str
    budget_max: float

class ChatMessage(BaseModel):
    sender: str # user, bot
    text: str
    recommendations: Optional[List[ProductResponse]] = None
