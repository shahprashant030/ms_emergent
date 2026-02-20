import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Clear existing data
    await db.products.delete_many({})
    await db.categories.delete_many({})
    await db.users.delete_many({})
    
    # Create admin user
    admin_user = {
        'id': 'admin-001',
        'phone': '9800000000',
        'name': 'Admin',
        'email': 'admin@mithilasutra.com',
        'role': 'admin',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_user)
    print('✓ Admin user created (Phone: 9800000000)')
    
    # Create categories
    categories = [
        {'id': 'cat-001', 'name': 'Food', 'slug': 'food', 'description': 'Traditional Maithili food items', 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': 'cat-002', 'name': 'Groceries', 'slug': 'groceries', 'description': 'Pure and organic groceries', 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': 'cat-003', 'name': 'Achar (Pickles)', 'slug': 'achar', 'description': 'Traditional Nepali pickles', 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': 'cat-004', 'name': 'Mithai (Sweets)', 'slug': 'mithai', 'description': 'Traditional Indian sweets', 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': 'cat-005', 'name': 'Clothes', 'slug': 'clothes', 'description': 'Traditional Nepali woolen clothing', 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': 'cat-006', 'name': 'Others', 'slug': 'others', 'description': 'Home textiles and accessories', 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': 'cat-007', 'name': 'Art', 'slug': 'art', 'description': 'Traditional Mithila art pieces', 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
    ]
    await db.categories.insert_many(categories)
    print('✓ Categories created')
    
    # Product images from uploaded assets
    khajuriya_img = 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/n332lran_Khajuriya.png'
    thekuwa_img = 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/knd24dxo_Thekuwa.png'
    pirukiya_img = 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/wvd83v0z_Pirukiya.png'
    mango_pickle_img = 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/o8gz2tcv_Mango_Pickle.png'
    
    # Create products
    products = [
        # FOOD
        {
            'id': 'prod-001', 'name': 'Khajuriya', 'slug': 'khajuriya',
            'description': 'Crispy and sweet traditional Nepali snack made with rice flour and molasses. A beloved treat during Chhath Puja and other festivals.',
            'short_description': 'Traditional crispy sweet made with rice flour',
            'categories': ['food'], 'tags': ['traditional', 'festival', 'sweet'],
            'price': 380.00, 'discount_price': 320.00, 'stock': 50, 'sku': 'MS-KHJ-001',
            'weight': 0.5, 'images': [khajuriya_img],
            'is_featured': True, 'is_new': True, 'is_active': True, 'rating': 4.8, 'reviews_count': 24,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-002', 'name': 'Thekuwa', 'slug': 'thekuwa',
            'description': 'Traditional Maithili sweet made with wheat flour, jaggery, and aromatic spices. Handcrafted using recipes passed down through generations in Janakpur.',
            'short_description': 'Authentic Maithili sweet with wheat flour and jaggery',
            'categories': ['food'], 'tags': ['traditional', 'maithili', 'sweet'],
            'price': 450.00, 'discount_price': 399.00, 'stock': 60, 'sku': 'MS-THK-001',
            'weight': 0.5, 'images': [thekuwa_img],
            'is_featured': True, 'is_new': True, 'is_active': True, 'rating': 4.9, 'reviews_count': 32,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-003', 'name': 'Purukiya', 'slug': 'purukiya',
            'description': 'Deep-fried sweet dumpling stuffed with khoya and nuts. A delicacy from Mithila region, prepared during special occasions.',
            'short_description': 'Sweet dumplings stuffed with khoya and nuts',
            'categories': ['food'], 'tags': ['traditional', 'sweet', 'mithila'],
            'price': 420.00, 'stock': 40, 'sku': 'MS-PIR-001',
            'weight': 0.5, 'images': [pirukiya_img],
            'is_featured': True, 'is_new': False, 'is_active': True, 'rating': 4.7, 'reviews_count': 18,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-004', 'name': 'Laai (Seasonal)', 'slug': 'laai-seasonal',
            'description': 'Traditional Nepali puffed rice, light and crispy. Perfect for making snacks or eating with curd and vegetables.',
            'short_description': 'Traditional puffed rice snack',
            'categories': ['food'], 'tags': ['seasonal', 'snack', 'traditional'],
            'price': 180.00, 'stock': 45, 'sku': 'MS-LAI-001',
            'weight': 0.3, 'images': ['https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.5, 'reviews_count': 12,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        
        # GROCERIES
        {
            'id': 'prod-005', 'name': 'Pure Himalayan Ghee', 'slug': 'pure-ghee',
            'description': 'Premium quality ghee made from grass-fed cow milk in the foothills of the Himalayas. Rich in nutrients and authentic taste.',
            'short_description': 'Organic ghee from grass-fed Himalayan cows',
            'categories': ['groceries'], 'tags': ['organic', 'ghee', 'pure'],
            'price': 1200.00, 'stock': 30, 'sku': 'MS-GHE-001',
            'weight': 1.0, 'images': ['https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': True, 'is_new': False, 'is_active': True, 'rating': 4.9, 'reviews_count': 45,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-006', 'name': 'Organic Mustard Oil', 'slug': 'mustard-oil',
            'description': 'Cold-pressed mustard oil from locally grown mustard seeds. Rich in omega-3 fatty acids and essential nutrients.',
            'short_description': 'Cold-pressed organic mustard oil',
            'categories': ['groceries'], 'tags': ['organic', 'oil', 'cold-pressed'],
            'price': 650.00, 'stock': 25, 'sku': 'MS-OIL-001',
            'weight': 1.0, 'images': ['https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': True, 'is_active': True, 'rating': 4.6, 'reviews_count': 18,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-007', 'name': 'Plain Dahi', 'slug': 'plain-dahi',
            'description': 'Fresh homemade yogurt prepared using traditional methods. Creamy, tangy, and probiotic-rich.',
            'short_description': 'Fresh homemade plain yogurt',
            'categories': ['groceries'], 'tags': ['fresh', 'dairy', 'probiotic'],
            'price': 250.00, 'stock': 20, 'sku': 'MS-DAH-001',
            'weight': 0.5, 'images': ['https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.7, 'reviews_count': 28,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-008', 'name': 'Sweet Dahi', 'slug': 'sweet-dahi',
            'description': 'Sweetened yogurt with natural sugar. A perfect dessert or accompaniment to spicy meals.',
            'short_description': 'Sweetened traditional yogurt',
            'categories': ['groceries'], 'tags': ['sweet', 'dairy', 'dessert'],
            'price': 280.00, 'stock': 20, 'sku': 'MS-DAH-002',
            'weight': 0.5, 'images': ['https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.6, 'reviews_count': 15,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-009', 'name': 'Natural Flavoured Dahi', 'slug': 'flavoured-dahi',
            'description': 'Yogurt infused with natural fruit flavors. No artificial colors or preservatives.',
            'short_description': 'Naturally flavored yogurt',
            'categories': ['groceries'], 'tags': ['flavored', 'natural', 'dairy'],
            'price': 300.00, 'stock': 15, 'sku': 'MS-DAH-003',
            'weight': 0.5, 'images': ['https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': True, 'is_active': True, 'rating': 4.5, 'reviews_count': 10,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-010', 'name': 'Low Fat Dahi', 'slug': 'low-fat-dahi',
            'description': 'Healthy low-fat yogurt option. All the goodness with reduced fat content.',
            'short_description': 'Healthy low-fat yogurt',
            'categories': ['groceries'], 'tags': ['healthy', 'low-fat', 'dairy'],
            'price': 270.00, 'stock': 15, 'sku': 'MS-DAH-004',
            'weight': 0.5, 'images': ['https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.4, 'reviews_count': 8,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        
        # ACHAR (PICKLES)
        {
            'id': 'prod-011', 'name': 'Raw Mango Pickle', 'slug': 'raw-mango-pickle',
            'description': 'Tangy and spicy raw mango pickle made with traditional Nepali spices. A perfect accompaniment to meals.',
            'short_description': 'Tangy raw mango pickle',
            'categories': ['achar'], 'tags': ['pickle', 'spicy', 'mango'],
            'price': 350.00, 'stock': 30, 'sku': 'MS-ACH-001',
            'weight': 0.25, 'images': [mango_pickle_img],
            'is_featured': True, 'is_new': False, 'is_active': True, 'rating': 4.8, 'reviews_count': 35,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-012', 'name': 'Riped Mango Pickle', 'slug': 'riped-mango-pickle',
            'description': 'Sweet and tangy pickle made from ripe mangoes. A unique flavor profile loved by all.',
            'short_description': 'Sweet ripe mango pickle',
            'categories': ['achar'], 'tags': ['pickle', 'sweet', 'mango'],
            'price': 380.00, 'stock': 25, 'sku': 'MS-ACH-002',
            'weight': 0.25, 'images': [mango_pickle_img],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.7, 'reviews_count': 22,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-013', 'name': 'Mustard Seed Pickle', 'slug': 'mustard-seed-pickle',
            'description': 'Aromatic mustard seed pickle with bold flavors. Made with traditional recipe.',
            'short_description': 'Bold mustard seed pickle',
            'categories': ['achar'], 'tags': ['pickle', 'spicy', 'mustard'],
            'price': 320.00, 'stock': 20, 'sku': 'MS-ACH-003',
            'weight': 0.25, 'images': [mango_pickle_img],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.6, 'reviews_count': 16,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-014', 'name': 'Ginger Pickle', 'slug': 'ginger-pickle',
            'description': 'Spicy and warming ginger pickle. Great for digestion and adds zing to any meal.',
            'short_description': 'Spicy ginger pickle',
            'categories': ['achar'], 'tags': ['pickle', 'ginger', 'spicy'],
            'price': 340.00, 'stock': 25, 'sku': 'MS-ACH-004',
            'weight': 0.25, 'images': [mango_pickle_img],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.7, 'reviews_count': 19,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-015', 'name': 'Garlic Pickle', 'slug': 'garlic-pickle',
            'description': 'Pungent and flavorful garlic pickle. Rich in antioxidants and traditional taste.',
            'short_description': 'Flavorful garlic pickle',
            'categories': ['achar'], 'tags': ['pickle', 'garlic', 'spicy'],
            'price': 360.00, 'stock': 20, 'sku': 'MS-ACH-005',
            'weight': 0.25, 'images': [mango_pickle_img],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.8, 'reviews_count': 24,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-016', 'name': 'Chilly Pickle', 'slug': 'chilly-pickle',
            'description': 'Extra spicy chilly pickle for those who love heat. Made with fresh green chillies.',
            'short_description': 'Extra spicy chilly pickle',
            'categories': ['achar'], 'tags': ['pickle', 'spicy', 'hot'],
            'price': 330.00, 'stock': 20, 'sku': 'MS-ACH-006',
            'weight': 0.25, 'images': [mango_pickle_img],
            'is_featured': False, 'is_new': True, 'is_active': True, 'rating': 4.5, 'reviews_count': 12,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        
        # MITHAI (SWEETS)
        {
            'id': 'prod-017', 'name': 'Rasgulla', 'slug': 'rasgulla',
            'description': 'Soft and spongy cottage cheese balls soaked in sugar syrup. A classic Bengali sweet.',
            'short_description': 'Soft cottage cheese balls in syrup',
            'categories': ['mithai'], 'tags': ['sweet', 'dessert', 'bengali'],
            'price': 450.00, 'stock': 15, 'sku': 'MS-MIT-001',
            'weight': 0.5, 'images': ['https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg'],
            'is_featured': True, 'is_new': False, 'is_active': True, 'rating': 4.9, 'reviews_count': 42,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-018', 'name': 'Laal Mohan', 'slug': 'laal-mohan',
            'description': 'Deep-fried milk solids dough balls soaked in rose-flavored syrup. A festive favorite.',
            'short_description': 'Rose-flavored sweet balls',
            'categories': ['mithai'], 'tags': ['sweet', 'festival', 'rose'],
            'price': 480.00, 'stock': 12, 'sku': 'MS-MIT-002',
            'weight': 0.5, 'images': ['https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.7, 'reviews_count': 28,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-019', 'name': 'Buniya Laddu', 'slug': 'buniya-laddu',
            'description': 'Round shaped sweets made with gram flour, ghee, and sugar. Melt-in-mouth texture.',
            'short_description': 'Traditional gram flour laddus',
            'categories': ['mithai'], 'tags': ['sweet', 'traditional', 'laddu'],
            'price': 420.00, 'stock': 18, 'sku': 'MS-MIT-003',
            'weight': 0.5, 'images': ['https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.8, 'reviews_count': 31,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-020', 'name': 'Peda', 'slug': 'peda',
            'description': 'Soft milk-based sweet flavored with cardamom. A traditional Indian delicacy.',
            'short_description': 'Soft milk-based sweet',
            'categories': ['mithai'], 'tags': ['sweet', 'milk', 'traditional'],
            'price': 400.00, 'stock': 20, 'sku': 'MS-MIT-004',
            'weight': 0.5, 'images': ['https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.6, 'reviews_count': 24,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-021', 'name': 'Barfi', 'slug': 'barfi',
            'description': 'Dense milk-based sweet cut into diamond shapes. Garnished with pistachios and almonds.',
            'short_description': 'Dense milk sweet with nuts',
            'categories': ['mithai'], 'tags': ['sweet', 'milk', 'nuts'],
            'price': 520.00, 'stock': 15, 'sku': 'MS-MIT-005',
            'weight': 0.5, 'images': ['https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg'],
            'is_featured': True, 'is_new': False, 'is_active': True, 'rating': 4.9, 'reviews_count': 38,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-022', 'name': 'Kaaju Katli', 'slug': 'kaaju-katli',
            'description': 'Premium cashew-based sweet with silver foil. The king of Indian sweets.',
            'short_description': 'Premium cashew sweet',
            'categories': ['mithai'], 'tags': ['sweet', 'premium', 'cashew'],
            'price': 850.00, 'discount_price': 750.00, 'stock': 10, 'sku': 'MS-MIT-006',
            'weight': 0.5, 'images': ['https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg'],
            'is_featured': True, 'is_new': True, 'is_active': True, 'rating': 5.0, 'reviews_count': 52,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        
        # CLOTHES
        {
            'id': 'prod-023', 'name': 'Woolen Sweater', 'slug': 'woolen-sweater',
            'description': 'Hand-knitted woolen sweater made from pure Himalayan wool. Warm and comfortable.',
            'short_description': 'Hand-knitted pure wool sweater',
            'categories': ['clothes'], 'tags': ['wool', 'winter', 'handmade'],
            'price': 1800.00, 'discount_price': 1600.00, 'stock': 15, 'sku': 'MS-CLO-001',
            'images': ['https://images.unsplash.com/photo-1595972424993-0cf6b1273a68?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': True, 'is_new': True, 'is_active': True, 'rating': 4.8, 'reviews_count': 28,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-024', 'name': 'Woolen Gloves', 'slug': 'woolen-gloves',
            'description': 'Soft woolen gloves to keep your hands warm during winter. Made with traditional techniques.',
            'short_description': 'Soft woolen winter gloves',
            'categories': ['clothes'], 'tags': ['wool', 'winter', 'accessories'],
            'price': 450.00, 'stock': 25, 'sku': 'MS-CLO-002',
            'images': ['https://images.unsplash.com/photo-1595972424993-0cf6b1273a68?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.6, 'reviews_count': 18,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-025', 'name': 'Woolen Cap', 'slug': 'woolen-cap',
            'description': 'Traditional Nepali woolen cap. Stylish and warm for cold weather.',
            'short_description': 'Traditional woolen cap',
            'categories': ['clothes'], 'tags': ['wool', 'winter', 'cap'],
            'price': 550.00, 'stock': 20, 'sku': 'MS-CLO-003',
            'images': ['https://images.unsplash.com/photo-1595972424993-0cf6b1273a68?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.7, 'reviews_count': 22,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        
        # OTHERS
        {
            'id': 'prod-026', 'name': 'Parda (Curtain)', 'slug': 'parda-curtain',
            'description': 'Traditional Nepali curtain with ethnic patterns. Adds cultural touch to your home.',
            'short_description': 'Traditional ethnic curtain',
            'categories': ['others'], 'tags': ['home', 'textile', 'traditional'],
            'price': 1200.00, 'stock': 10, 'sku': 'MS-OTH-001',
            'images': ['https://images.unsplash.com/photo-1595972424993-0cf6b1273a68?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.5, 'reviews_count': 12,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-027', 'name': 'Ghaila (Cushion Cover)', 'slug': 'ghaila-cushion',
            'description': 'Decorative cushion covers with traditional Nepali designs. Perfect for home decor.',
            'short_description': 'Traditional decorative cushion cover',
            'categories': ['others'], 'tags': ['home', 'decor', 'textile'],
            'price': 450.00, 'stock': 20, 'sku': 'MS-OTH-002',
            'images': ['https://images.unsplash.com/photo-1595972424993-0cf6b1273a68?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.6, 'reviews_count': 15,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-028', 'name': 'Table Cover', 'slug': 'table-cover',
            'description': 'Elegant table covers with traditional motifs. Made from quality fabric.',
            'short_description': 'Traditional table cover',
            'categories': ['others'], 'tags': ['home', 'textile', 'table'],
            'price': 800.00, 'stock': 12, 'sku': 'MS-OTH-003',
            'images': ['https://images.unsplash.com/photo-1595972424993-0cf6b1273a68?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': True, 'is_active': True, 'rating': 4.4, 'reviews_count': 8,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        {
            'id': 'prod-029', 'name': 'Door Matt', 'slug': 'door-matt',
            'description': 'Durable door mat with traditional welcome designs. Keeps your home clean.',
            'short_description': 'Traditional welcome door mat',
            'categories': ['others'], 'tags': ['home', 'mat', 'decor'],
            'price': 650.00, 'stock': 15, 'sku': 'MS-OTH-004',
            'images': ['https://images.unsplash.com/photo-1595972424993-0cf6b1273a68?crop=entropy&cs=srgb&fm=jpg&q=85'],
            'is_featured': False, 'is_new': False, 'is_active': True, 'rating': 4.5, 'reviews_count': 10,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
        
        # ART
        {
            'id': 'prod-030', 'name': 'Mithila Art Painting', 'slug': 'mithila-art-painting',
            'description': 'Authentic Mithila art hand-painted by local artists. Each piece is unique and tells a story.',
            'short_description': 'Hand-painted authentic Mithila art',
            'categories': ['art'], 'tags': ['art', 'mithila', 'handmade', 'unique'],
            'price': 2500.00, 'discount_price': 2200.00, 'stock': 8, 'sku': 'MS-ART-001',
            'images': ['https://images.pexels.com/photos/22820070/pexels-photo-22820070.jpeg'],
            'is_featured': True, 'is_new': True, 'is_active': True, 'rating': 5.0, 'reviews_count': 16,
            'created_at': datetime.now(timezone.utc).isoformat(), 'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [], 'attributes': {}
        },
    ]
    
    await db.products.insert_many(products)
    print('✓ Products created')
    print(f'\n✅ Database seeded successfully!')
    print(f'   - Admin user: Phone 9800000000')
    print(f'   - {len(categories)} categories')
    print(f'   - {len(products)} products')
    
    client.close()

if __name__ == '__main__':
    asyncio.run(seed_database())
