from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.schemas import DeliveryTrackingResponse, DeliveryLocationUpdate

router = APIRouter(prefix="/delivery", tags=["Delivery Partner & Live GPS"])

TRACKING_STORE: dict = {}

@router.get("/track/{order_id}", response_model=DeliveryTrackingResponse)
def get_live_tracking(order_id: str):
    if order_id in TRACKING_STORE:
        return TRACKING_STORE[order_id]
    raise HTTPException(status_code=404, detail="No active tracking found for this order.")

@router.post("/update-location")
def update_driver_location(update: DeliveryLocationUpdate):
    if update.order_id in TRACKING_STORE:
        TRACKING_STORE[update.order_id].driver_lat = update.current_lat
        TRACKING_STORE[update.order_id].driver_lng = update.current_lng
        TRACKING_STORE[update.order_id].status = update.status
    return {"message": "Location updated successfully", "lat": update.current_lat, "lng": update.current_lng}

@router.post("/verify-otp")
def verify_delivery_otp(order_id: str, entered_otp: str):
    if order_id in TRACKING_STORE and TRACKING_STORE[order_id].otp_code == entered_otp:
        TRACKING_STORE[order_id].status = "delivered"
        return {"success": True, "message": "🎉 OTP Verified! Order marked as delivered successfully."}
    return {"success": False, "message": "❌ Invalid OTP code. Please enter the correct code."}

@router.get("/requests")
def get_pending_delivery_requests():
    return []
