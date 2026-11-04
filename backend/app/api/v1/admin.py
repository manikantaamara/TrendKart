from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/admin", tags=["Admin Control Panel"])

@router.get("/metrics")
def get_admin_metrics():
    return {
        "total_gtv": 1489200.0,
        "total_orders": 3482,
        "active_shops": 128,
        "verified_drivers": 340,
        "platform_commission_earned": 148920.0,
        "avg_delivery_time_mins": 26.4
    }

@router.get("/pending-verifications")
def get_pending_verifications():
    return {
        "shops": [
            {
                "id": "shop-pending-1",
                "shop_name": "Delhi Vintage Boutique",
                "owner_name": "Sunita Verma",
                "gst": "07AAAAA0000A1Z5",
                "address": "Lajpat Nagar 2",
                "submitted_at": "2026-07-27"
            }
        ],
        "delivery_partners": [
            {
                "id": "driver-pending-1",
                "full_name": "Rohan Gupta",
                "vehicle": "Hero Electric Optima (DL 04 EF 1234)",
                "dl_number": "DL-1420230099881",
                "submitted_at": "2026-07-27"
            }
        ]
    }

@router.post("/verify")
def approve_entity(entity_type: str, entity_id: str, action: str = "approve"):
    return {"message": f"Successfully {action}d {entity_type} {entity_id}"}

@router.post("/broadcast")
def broadcast_notification(title: str, message: str, target_group: str = "all"):
    return {
        "status": "success",
        "title": title,
        "message": message,
        "target_group": target_group,
        "delivered_count": 1420
    }
