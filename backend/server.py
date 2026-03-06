from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import random
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Base URL for image serving
BASE_URL = os.environ.get('BASE_URL', 'http://localhost:8001')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'mithila-sutra-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 720

security = HTTPBearer()

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    picture: Optional[str] = None  # Google profile picture
    address: Optional[str] = None
    city: Optional[str] = None
    role: str = "customer"
    auth_provider: str = "phone"  # "phone" or "google"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    description: Optional[str] = None
    discount_type: str = "percentage"  # "percentage" or "fixed"
    discount_value: float
    min_order_amount: float = 0
    max_discount: Optional[float] = None  # Max discount for percentage coupons
    usage_limit: Optional[int] = None
    used_count: int = 0
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OTPStore(BaseModel):
    model_config = ConfigDict(extra="ignore")
    phone: str
    otp: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductVariant(BaseModel):
    name: str
    value: str
    price_adjustment: float = 0.0
    stock: int = 0

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    short_description: Optional[str] = None
    categories: List[str] = []
    subcategories: List[str] = []
    tags: List[str] = []
    price: float
    discount_price: Optional[float] = None
    stock: int = 0
    sku: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    images: List[str] = []
    video: Optional[str] = None
    variants: List[ProductVariant] = []
    attributes: Dict[str, Any] = {}
    is_featured: bool = False
    is_new: bool = False
    is_active: bool = True
    rating: float = 0.0
    reviews_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Carousel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image: str
    tag: str  # e.g., "FESTIVAL SPECIAL"
    title: str  # e.g., "Flat 50% OFF"
    description: str
    button_text: str = "Shop Now"  # e.g., "Shop Now", "Grab the Offer"
    button_link: str = "/products"
    order: int = 0  # For ordering slides
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItem(BaseModel):
    product_id: str
    variant_name: Optional[str] = None
    quantity: int = 1
    price: float

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    variant_name: Optional[str] = None
    quantity: int
    price: float
    total: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"MS{random.randint(100000, 999999)}")
    user_id: str
    items: List[OrderItem]
    subtotal: float
    discount: float = 0.0
    total: float
    payment_method: str = "cod"
    payment_status: str = "pending"
    order_status: str = "pending"
    shipping_address: str
    phone: str
    name: str
    email: Optional[str] = None
    notes: Optional[str] = None
    coupon_code: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============= REQUEST/RESPONSE MODELS =============

class PhoneLoginRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str

class TokenResponse(BaseModel):
    token: str
    user: User

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str
    short_description: Optional[str] = None
    categories: List[str] = []
    price: float
    discount_price: Optional[float] = None
    stock: int = 0
    images: List[str] = []
    is_featured: bool = False
    is_new: bool = False

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None

class CartAddRequest(BaseModel):
    product_id: str
    variant_name: Optional[str] = None
    quantity: int = 1

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total: float
    shipping_address: str
    phone: str
    name: str
    email: Optional[str] = None
    notes: Optional[str] = None
    payment_method: str = "cod"
    coupon_code: Optional[str] = None
    discount_amount: float = 0

# ============= TWILIO SMS CONFIG =============
# Add your Twilio credentials here
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '')

async def send_sms(to_phone: str, message: str):
    """Send SMS via Twilio - returns True if sent, False otherwise"""
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
        logging.warning("Twilio credentials not configured. SMS not sent.")
        return False
    
    try:
        from twilio.rest import Client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Format Nepal phone number if needed
        if not to_phone.startswith('+'):
            if to_phone.startswith('9'):
                to_phone = '+977' + to_phone
            else:
                to_phone = '+' + to_phone
        
        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        logging.info(f"SMS sent to {to_phone}: {message.sid}")
        return True
    except Exception as e:
        logging.error(f"Failed to send SMS: {str(e)}")
        return False

async def send_order_notification(order: dict, notification_type: str = "placed"):
    """Send order notification SMS"""
    phone = order.get('phone')
    order_number = order.get('order_number')
    name = order.get('name', 'Customer')
    
    messages = {
        "placed": f"Hi {name}! Your order #{order_number} has been placed successfully. Total: NPR {order.get('total')}. Thank you for shopping with Mithila Sutra!",
        "confirmed": f"Hi {name}! Your order #{order_number} has been confirmed and is being prepared. Thank you!",
        "packed": f"Hi {name}! Your order #{order_number} has been packed and is ready for shipping.",
        "shipped": f"Hi {name}! Great news! Your order #{order_number} is on its way. Track your delivery!",
        "delivered": f"Hi {name}! Your order #{order_number} has been delivered. Enjoy your purchase from Mithila Sutra!",
        "cancelled": f"Hi {name}! Your order #{order_number} has been cancelled. If you have questions, please contact us."
    }
    
    message = messages.get(notification_type, messages["placed"])
    await send_sms(phone, message)

# ============= HELPER FUNCTIONS =============

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        
        user_doc = await db.users.find_one({'id': user_id}, {'_id': 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        
        return User(**user_doc)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[User]:
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except:
        return None

# ============= AUTH ROUTES =============

@api_router.post("/auth/send-otp")
async def send_otp(request: PhoneLoginRequest):
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    otp_doc = {
        'phone': request.phone,
        'otp': otp,
        'expires_at': expires_at.isoformat(),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.otps.delete_many({'phone': request.phone})
    await db.otps.insert_one(otp_doc)
    
    return {"message": "OTP sent", "otp": otp}

@api_router.post("/auth/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerifyRequest):
    otp_doc = await db.otps.find_one({'phone': request.phone, 'otp': request.otp}, {'_id': 0})
    
    if not otp_doc:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    expires_at = datetime.fromisoformat(otp_doc['expires_at'])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")
    
    user_doc = await db.users.find_one({'phone': request.phone}, {'_id': 0})
    
    if not user_doc:
        user = User(phone=request.phone, role="customer")
        user_dict = user.model_dump()
        user_dict['created_at'] = user_dict['created_at'].isoformat()
        await db.users.insert_one(user_dict)
    else:
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        user = User(**user_doc)
    
    token = create_token(user.id)
    await db.otps.delete_many({'phone': request.phone})
    
    return TokenResponse(token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Google OAuth session endpoint
@api_router.post("/auth/google/session")
async def google_auth_session(session_id: str):
    """Exchange Google OAuth session_id for user data and JWT token"""
    import httpx
    
    try:
        # Call Emergent Auth API to get session data
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            google_data = response.json()
            
            # Check if user exists by email
            user_doc = await db.users.find_one({'email': google_data['email']}, {'_id': 0})
            
            if user_doc:
                # Update existing user with Google data
                await db.users.update_one(
                    {'email': google_data['email']},
                    {'$set': {
                        'name': google_data.get('name') or user_doc.get('name'),
                        'picture': google_data.get('picture'),
                        'auth_provider': 'google'
                    }}
                )
                user_doc = await db.users.find_one({'email': google_data['email']}, {'_id': 0})
                if isinstance(user_doc.get('created_at'), str):
                    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
                user = User(**user_doc)
            else:
                # Create new user from Google data
                user = User(
                    email=google_data['email'],
                    name=google_data.get('name'),
                    picture=google_data.get('picture'),
                    auth_provider='google',
                    role='customer'
                )
                user_dict = user.model_dump()
                user_dict['created_at'] = user_dict['created_at'].isoformat()
                await db.users.insert_one(user_dict)
            
            token = create_token(user.id)
            
            return {"token": token, "user": user}
            
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify Google session: {str(e)}")

@api_router.put("/auth/profile", response_model=User)
async def update_profile(name: Optional[str] = None, email: Optional[str] = None, 
                        address: Optional[str] = None, city: Optional[str] = None,
                        phone: Optional[str] = None, current_user: User = Depends(get_current_user)):
    update_data = {}
    if name:
        update_data['name'] = name
    if email:
        update_data['email'] = email
    if address:
        update_data['address'] = address
    if city:
        update_data['city'] = city
    if phone:
        update_data['phone'] = phone
    
    if update_data:
        await db.users.update_one({'id': current_user.id}, {'$set': update_data})
        user_doc = await db.users.find_one({'id': current_user.id}, {'_id': 0})
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        return User(**user_doc)
    
    return current_user

# ============= COUPON ROUTES =============

@api_router.get("/coupons/validate")
async def validate_coupon(code: str, order_total: float):
    """Validate a coupon and calculate discount"""
    coupon_doc = await db.coupons.find_one({'code': code.upper(), 'is_active': True}, {'_id': 0})
    
    if not coupon_doc:
        raise HTTPException(status_code=404, detail="Coupon not found or expired")
    
    # Check validity dates
    now = datetime.now(timezone.utc)
    valid_from = datetime.fromisoformat(coupon_doc['valid_from']) if isinstance(coupon_doc['valid_from'], str) else coupon_doc['valid_from']
    valid_until = datetime.fromisoformat(coupon_doc['valid_until']) if isinstance(coupon_doc['valid_until'], str) else coupon_doc['valid_until']
    
    if valid_from.tzinfo is None:
        valid_from = valid_from.replace(tzinfo=timezone.utc)
    if valid_until.tzinfo is None:
        valid_until = valid_until.replace(tzinfo=timezone.utc)
    
    if now < valid_from or now > valid_until:
        raise HTTPException(status_code=400, detail="Coupon is not valid at this time")
    
    # Check usage limit
    if coupon_doc.get('usage_limit') and coupon_doc['used_count'] >= coupon_doc['usage_limit']:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    
    # Check minimum order amount
    if order_total < coupon_doc.get('min_order_amount', 0):
        raise HTTPException(status_code=400, detail=f"Minimum order amount is NPR {coupon_doc['min_order_amount']}")
    
    # Calculate discount
    if coupon_doc['discount_type'] == 'percentage':
        discount = order_total * (coupon_doc['discount_value'] / 100)
        if coupon_doc.get('max_discount'):
            discount = min(discount, coupon_doc['max_discount'])
    else:
        discount = coupon_doc['discount_value']
    
    return {
        "valid": True,
        "code": coupon_doc['code'],
        "discount_type": coupon_doc['discount_type'],
        "discount_value": coupon_doc['discount_value'],
        "calculated_discount": discount,
        "description": coupon_doc.get('description')
    }

@api_router.get("/admin/coupons")
async def get_all_coupons(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    coupons = await db.coupons.find({}, {'_id': 0}).to_list(100)
    return coupons

@api_router.post("/admin/coupons")
async def create_coupon(coupon_data: dict, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    coupon = Coupon(
        code=coupon_data['code'].upper(),
        description=coupon_data.get('description'),
        discount_type=coupon_data.get('discount_type', 'percentage'),
        discount_value=coupon_data['discount_value'],
        min_order_amount=coupon_data.get('min_order_amount', 0),
        max_discount=coupon_data.get('max_discount'),
        usage_limit=coupon_data.get('usage_limit'),
        valid_from=datetime.fromisoformat(coupon_data['valid_from']),
        valid_until=datetime.fromisoformat(coupon_data['valid_until']),
        is_active=coupon_data.get('is_active', True)
    )
    
    coupon_dict = coupon.model_dump()
    coupon_dict['created_at'] = coupon_dict['created_at'].isoformat()
    coupon_dict['valid_from'] = coupon_dict['valid_from'].isoformat()
    coupon_dict['valid_until'] = coupon_dict['valid_until'].isoformat()
    
    await db.coupons.insert_one(coupon_dict)
    return coupon_dict

@api_router.put("/admin/coupons/{coupon_id}")
async def update_coupon(coupon_id: str, coupon_data: dict, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_data = {k: v for k, v in coupon_data.items() if v is not None}
    if 'code' in update_data:
        update_data['code'] = update_data['code'].upper()
    
    await db.coupons.update_one({'id': coupon_id}, {'$set': update_data})
    coupon = await db.coupons.find_one({'id': coupon_id}, {'_id': 0})
    return coupon

@api_router.delete("/admin/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.coupons.delete_one({'id': coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    return {"message": "Coupon deleted successfully"}

# ============= PRODUCT ROUTES =============

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, featured: Optional[bool] = None, 
                      new: Optional[bool] = None, search: Optional[str] = None):
    query = {'is_active': True}
    
    if category:
        query['categories'] = category
    if featured is not None:
        query['is_featured'] = featured
    if new is not None:
        query['is_new'] = new
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]
    
    products = await db.products.find(query, {'_id': 0}).to_list(1000)
    
    # Get all valid category slugs
    valid_categories = await db.categories.find({'is_active': True}, {'_id': 0, 'slug': 1}).to_list(1000)
    valid_category_slugs = {cat['slug'] for cat in valid_categories}
    
    # Filter products to only include valid categories
    for product in products:
        for field in ['created_at', 'updated_at']:
            if isinstance(product.get(field), str):
                product[field] = datetime.fromisoformat(product[field])
        
        # Filter out invalid categories
        if product.get('categories'):
            product['categories'] = [cat for cat in product['categories'] if cat in valid_category_slugs]
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({'id': product_id}, {'_id': 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for field in ['created_at', 'updated_at']:
        if isinstance(product.get(field), str):
            product[field] = datetime.fromisoformat(product[field])
    
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate categories exist
    if product_data.categories:
        valid_categories = await db.categories.find({'slug': {'$in': product_data.categories}, 'is_active': True}, {'_id': 0, 'slug': 1}).to_list(100)
        valid_slugs = {cat['slug'] for cat in valid_categories}
        invalid_categories = [cat for cat in product_data.categories if cat not in valid_slugs]
        
        if invalid_categories:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid categories: {', '.join(invalid_categories)}. Please create these categories first."
            )
    
    product = Product(**product_data.model_dump())
    product_dict = product.model_dump()
    product_dict['created_at'] = product_dict['created_at'].isoformat()
    product_dict['updated_at'] = product_dict['updated_at'].isoformat()
    
    await db.products.insert_one(product_dict)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate categories exist
    if product_data.categories:
        valid_categories = await db.categories.find({'slug': {'$in': product_data.categories}, 'is_active': True}, {'_id': 0, 'slug': 1}).to_list(100)
        valid_slugs = {cat['slug'] for cat in valid_categories}
        invalid_categories = [cat for cat in product_data.categories if cat not in valid_slugs]
        
        if invalid_categories:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid categories: {', '.join(invalid_categories)}. Please create these categories first."
            )
    
    update_data = product_data.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.products.update_one(
        {'id': product_id},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({'id': product_id}, {'_id': 0})
    for field in ['created_at', 'updated_at']:
        if isinstance(product.get(field), str):
            product[field] = datetime.fromisoformat(product[field])
    
    return Product(**product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.products.delete_one({'id': product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# ============= CATEGORY ROUTES =============

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({'is_active': True}, {'_id': 0}).to_list(1000)
    
    for category in categories:
        if isinstance(category.get('created_at'), str):
            category['created_at'] = datetime.fromisoformat(category['created_at'])
    
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    category = Category(**category_data.model_dump())
    category_dict = category.model_dump()
    category_dict['created_at'] = category_dict['created_at'].isoformat()
    
    await db.categories.insert_one(category_dict)
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category_data: CategoryCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_data = category_data.model_dump()
    
    result = await db.categories.update_one(
        {'id': category_id},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category = await db.categories.find_one({'id': category_id}, {'_id': 0})
    if isinstance(category.get('created_at'), str):
        category['created_at'] = datetime.fromisoformat(category['created_at'])
    
    return Category(**category)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.categories.delete_one({'id': category_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

# ============= CAROUSEL ROUTES =============

@api_router.get("/carousels", response_model=List[Carousel])
async def get_carousels():
    carousels = await db.carousels.find({'is_active': True}, {'_id': 0}).sort('order', 1).to_list(100)
    
    for carousel in carousels:
        if isinstance(carousel.get('created_at'), str):
            carousel['created_at'] = datetime.fromisoformat(carousel['created_at'])
    
    return [Carousel(**c) for c in carousels]

@api_router.get("/admin/carousels", response_model=List[Carousel])
async def get_all_carousels(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    carousels = await db.carousels.find({}, {'_id': 0}).sort('order', 1).to_list(100)
    
    for carousel in carousels:
        if isinstance(carousel.get('created_at'), str):
            carousel['created_at'] = datetime.fromisoformat(carousel['created_at'])
    
    return [Carousel(**c) for c in carousels]

@api_router.post("/carousels", response_model=Carousel)
async def create_carousel(carousel: Carousel, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    carousel_dict = carousel.model_dump()
    carousel_dict['created_at'] = carousel_dict['created_at'].isoformat()
    
    await db.carousels.insert_one(carousel_dict)
    
    carousel_dict['created_at'] = datetime.fromisoformat(carousel_dict['created_at'])
    return Carousel(**carousel_dict)

@api_router.put("/carousels/{carousel_id}", response_model=Carousel)
async def update_carousel(carousel_id: str, carousel_data: dict, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = await db.carousels.find_one({'id': carousel_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Carousel not found")
    
    update_data = {k: v for k, v in carousel_data.items() if v is not None}
    
    await db.carousels.update_one(
        {'id': carousel_id},
        {'$set': update_data}
    )
    
    carousel = await db.carousels.find_one({'id': carousel_id}, {'_id': 0})
    
    if isinstance(carousel.get('created_at'), str):
        carousel['created_at'] = datetime.fromisoformat(carousel['created_at'])
    
    return Carousel(**carousel)

@api_router.delete("/carousels/{carousel_id}")
async def delete_carousel(carousel_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.carousels.delete_one({'id': carousel_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Carousel not found")
    
    return {"message": "Carousel deleted successfully"}

# ============= CART ROUTES =============

@api_router.get("/cart", response_model=Cart)
async def get_cart(session_id: Optional[str] = None, current_user: Optional[User] = Depends(get_optional_user)):
    query = {}
    if current_user:
        query['user_id'] = current_user.id
    elif session_id:
        query['session_id'] = session_id
    else:
        raise HTTPException(status_code=400, detail="Session ID or authentication required")
    
    cart = await db.carts.find_one(query, {'_id': 0})
    
    if not cart:
        new_cart = Cart(
            user_id=current_user.id if current_user else None,
            session_id=session_id if not current_user else None
        )
        cart_dict = new_cart.model_dump()
        cart_dict['updated_at'] = cart_dict['updated_at'].isoformat()
        await db.carts.insert_one(cart_dict)
        return new_cart
    
    if isinstance(cart.get('updated_at'), str):
        cart['updated_at'] = datetime.fromisoformat(cart['updated_at'])
    
    return Cart(**cart)

@api_router.post("/cart/add")
async def add_to_cart(request: CartAddRequest, session_id: Optional[str] = None, 
                     current_user: Optional[User] = Depends(get_optional_user)):
    product = await db.products.find_one({'id': request.product_id}, {'_id': 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    price = product.get('discount_price', product['price'])
    
    query = {}
    if current_user:
        query['user_id'] = current_user.id
    elif session_id:
        query['session_id'] = session_id
    else:
        raise HTTPException(status_code=400, detail="Session ID or authentication required")
    
    cart = await db.carts.find_one(query, {'_id': 0})
    
    if not cart:
        cart = {
            'id': str(uuid.uuid4()),
            'user_id': current_user.id if current_user else None,
            'session_id': session_id if not current_user else None,
            'items': [],
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
    
    item_found = False
    for item in cart.get('items', []):
        if item['product_id'] == request.product_id and item.get('variant_name') == request.variant_name:
            item['quantity'] += request.quantity
            item_found = True
            break
    
    if not item_found:
        new_item = {
            'product_id': request.product_id,
            'variant_name': request.variant_name,
            'quantity': request.quantity,
            'price': price
        }
        if 'items' not in cart:
            cart['items'] = []
        cart['items'].append(new_item)
    
    cart['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(query, {'$set': cart}, upsert=True)
    
    return {"message": "Item added to cart", "cart_id": cart['id']}

@api_router.delete("/cart/item/{product_id}")
async def remove_from_cart(product_id: str, session_id: Optional[str] = None,
                          current_user: Optional[User] = Depends(get_optional_user)):
    query = {}
    if current_user:
        query['user_id'] = current_user.id
    elif session_id:
        query['session_id'] = session_id
    else:
        raise HTTPException(status_code=400, detail="Session ID or authentication required")
    
    await db.carts.update_one(
        query,
        {'$pull': {'items': {'product_id': product_id}},
         '$set': {'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Item removed from cart"}

@api_router.delete("/cart/clear")
async def clear_cart(session_id: Optional[str] = None,
                    current_user: Optional[User] = Depends(get_optional_user)):
    query = {}
    if current_user:
        query['user_id'] = current_user.id
    elif session_id:
        query['session_id'] = session_id
    else:
        raise HTTPException(status_code=400, detail="Session ID or authentication required")
    
    await db.carts.update_one(
        query,
        {'$set': {'items': [], 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Cart cleared"}

# ============= ORDER ROUTES =============

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    # Apply coupon if provided
    discount = order_data.discount_amount
    final_total = order_data.total - discount
    
    # If coupon code provided, increment usage
    if order_data.coupon_code:
        await db.coupons.update_one(
            {'code': order_data.coupon_code.upper()},
            {'$inc': {'used_count': 1}}
        )
    
    order = Order(
        user_id=current_user.id,
        items=order_data.items,
        subtotal=order_data.total,
        discount=discount,
        total=final_total,
        shipping_address=order_data.shipping_address,
        phone=order_data.phone,
        name=order_data.name,
        email=order_data.email,
        notes=order_data.notes,
        payment_method=order_data.payment_method,
        coupon_code=order_data.coupon_code
    )
    
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    order_dict['updated_at'] = order_dict['updated_at'].isoformat()
    
    await db.orders.insert_one(order_dict)
    
    # Clear user's cart
    await db.carts.update_one(
        {'user_id': current_user.id},
        {'$set': {'items': [], 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    # Send SMS notification (non-blocking)
    import asyncio
    asyncio.create_task(send_order_notification(order_dict, "placed"))
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_user_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({'user_id': current_user.id}, {'_id': 0}).sort('created_at', -1).to_list(1000)
    
    for order in orders:
        for field in ['created_at', 'updated_at']:
            if isinstance(order.get(field), str):
                order[field] = datetime.fromisoformat(order[field])
    
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({'id': order_id, 'user_id': current_user.id}, {'_id': 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for field in ['created_at', 'updated_at']:
        if isinstance(order.get(field), str):
            order[field] = datetime.fromisoformat(order[field])
    
    return Order(**order)

# ============= ADMIN ROUTES =============

@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    orders = await db.orders.find({}, {'_id': 0}).sort('created_at', -1).to_list(1000)
    
    for order in orders:
        for field in ['created_at', 'updated_at']:
            if isinstance(order.get(field), str):
                order[field] = datetime.fromisoformat(order[field])
    
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, new_status: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    valid_statuses = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "refunded"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    await db.orders.update_one(
        {'id': order_id},
        {'$set': {'order_status': new_status, 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    # Get order and send SMS notification
    order_doc = await db.orders.find_one({'id': order_id}, {'_id': 0})
    if order_doc:
        import asyncio
        asyncio.create_task(send_order_notification(order_doc, new_status))
    
    return {"message": "Order status updated"}

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_products = await db.products.count_documents({'is_active': True})
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({})
    
    pipeline = [
        {'$group': {'_id': None, 'total_revenue': {'$sum': '$total'}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]['total_revenue'] if revenue_result else 0
    
    return {
        'total_products': total_products,
        'total_orders': total_orders,
        'total_users': total_users,
        'total_revenue': total_revenue
    }

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {'_id': 0}).to_list(1000)
    
    for user_doc in users:
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return users

@api_router.get("/admin/customers", response_model=List[User])
async def get_customers(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    customers = await db.users.find({'role': 'customer'}, {'_id': 0}).to_list(1000)
    
    for user_doc in customers:
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return customers

@api_router.get("/admin/admins", response_model=List[User])
async def get_admins(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    admins = await db.users.find({'role': 'admin'}, {'_id': 0}).to_list(1000)
    
    for user_doc in admins:
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return admins

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image files are allowed (JPEG, PNG, WebP)")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return the full URL
    image_url = f"{BASE_URL}/api/uploads/{unique_filename}"
    return {"url": image_url, "filename": unique_filename}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Mount uploads directory AFTER router for serving static files
# Use /api/uploads to ensure proper routing through ingress
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()