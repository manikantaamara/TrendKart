from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import OrderCreate, OrderResponse
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/orders", tags=["Orders & Checkout"])

MOCK_ORDERS: List[OrderResponse] = []

@router.post("/", response_model=OrderResponse)
def create_order(order_in: OrderCreate):
    new_id = f"ord-{random.randint(1000, 9999)}"
    order_no = f"TK-{datetime.utcnow().year}-{random.randint(10000, 99999)}"
    otp = f"{random.randint(1000, 9999)}"
    
    subtotal = sum([item.quantity * 1890.0 for item in order_in.items]) or 0.0
    discount = 300.0 if order_in.coupon_code else 0.0
    delivery = 30.0
    net = max(subtotal - discount + delivery, 0.0)
    
    new_ord = OrderResponse(
        id=new_id,
        order_number=order_no,
        shop_id=order_in.shop_id,
        shop_name="Local Store",
        customer_id="customer",
        customer_name="Customer",
        delivery_address="Customer Selected Address",
        total_amount=subtotal,
        discount_amount=discount,
        delivery_fee=delivery,
        net_amount=net,
        status="placed",
        payment_status="paid" if order_in.payment_method != "COD" else "pending",
        otp_code=otp,
        estimated_delivery_time=(datetime.utcnow() + timedelta(minutes=25)).strftime("%H:%M:%S"),
        items_count=len(order_in.items),
        created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    )
    MOCK_ORDERS.insert(0, new_ord)
    return new_ord

@router.get("/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: str):
    return [o for o in MOCK_ORDERS if o.customer_id == user_id]

@router.get("/shop/{shop_id}", response_model=List[OrderResponse])
def get_shop_orders(shop_id: str):
    return [o for o in MOCK_ORDERS if o.shop_id == shop_id or shop_id == "all"]

@router.put("/{order_id}/status")
def update_order_status(order_id: str, status: str):
    for o in MOCK_ORDERS:
        if o.id == order_id:
            o.status = status
            return {"message": f"Order status updated to {status}", "order": o}
    raise HTTPException(status_code=404, detail="Order not found")
