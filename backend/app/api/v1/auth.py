from fastapi import APIRouter, HTTPException, status
from app.models.schemas import UserLogin, UserRegister, Token
from app.core.security import create_access_token, verify_password, get_password_hash
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory user database store for registered users
MOCK_USERS = {}

@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    user = MOCK_USERS.get(credentials.email.lower())
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token_str = create_access_token(subject=user["id"], role=user["role"])
    return Token(
        access_token=token_str,
        user_id=user["id"],
        full_name=user["full_name"],
        email=user["email"],
        role=user["role"],
        phone=user.get("phone"),
        avatar_url=user.get("avatar_url")
    )

@router.post("/register", response_model=Token)
def register(user_in: UserRegister):
    if user_in.email.lower() in MOCK_USERS:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    new_id = str(uuid.uuid4())
    user_record = {
        "id": new_id,
        "email": user_in.email.lower(),
        "password_hash": get_password_hash(user_in.password),
        "full_name": user_in.full_name,
        "phone": user_in.phone or "+91 9800000000",
        "role": user_in.role,
        "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    }
    MOCK_USERS[user_in.email.lower()] = user_record
    
    token_str = create_access_token(subject=new_id, role=user_in.role)
    return Token(
        access_token=token_str,
        user_id=new_id,
        full_name=user_record["full_name"],
        email=user_record["email"],
        role=user_record["role"],
        phone=user_record["phone"],
        avatar_url=user_record["avatar_url"]
    )
