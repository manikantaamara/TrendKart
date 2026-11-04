from fastapi import APIRouter
from app.api.v1 import auth, shops, products, orders, delivery, admin, ai

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(shops.router)
api_router.include_router(products.router)
api_router.include_router(orders.router)
api_router.include_router(delivery.router)
api_router.include_router(admin.router)
api_router.include_router(ai.router)
