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
    phone: str
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    role: str = "customer"
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
    payment_method: str = "COD"
    payment_status: str = "pending"
    order_status: str = "pending"
    shipping_address: str
    phone: str
    name: str
    notes: Optional[str] = None
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
    notes: Optional[str] = None

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

@api_router.put("/auth/profile", response_model=User)
async def update_profile(name: Optional[str] = None, email: Optional[str] = None, 
                        address: Optional[str] = None, current_user: User = Depends(get_current_user)):
    update_data = {}
    if name:
        update_data['name'] = name
    if email:
        update_data['email'] = email
    if address:
        update_data['address'] = address
    
    if update_data:
        await db.users.update_one({'id': current_user.id}, {'$set': update_data})
        user_doc = await db.users.find_one({'id': current_user.id}, {'_id': 0})
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        return User(**user_doc)
    
    return current_user

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
    order = Order(
        user_id=current_user.id,
        items=order_data.items,
        subtotal=order_data.total,
        total=order_data.total,
        shipping_address=order_data.shipping_address,
        phone=order_data.phone,
        name=order_data.name,
        notes=order_data.notes
    )
    
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    order_dict['updated_at'] = order_dict['updated_at'].isoformat()
    
    await db.orders.insert_one(order_dict)
    
    await db.carts.update_one(
        {'user_id': current_user.id},
        {'$set': {'items': [], 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
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
    
    # Return the URL
    image_url = f"/uploads/{unique_filename}"
    return {"url": image_url, "filename": unique_filename}

app.include_router(api_router)

# Mount uploads directory for serving static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()