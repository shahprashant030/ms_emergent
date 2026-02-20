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
        {
            'id': 'cat-001',
            'name': 'Traditional Sweets',
            'slug': 'sweets',
            'description': 'Authentic Nepali sweets made with traditional recipes',
            'image': 'https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg',
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 'cat-002',
            'name': 'Premium Groceries',
            'slug': 'groceries',
            'description': 'Pure and organic groceries from Nepal',
            'image': 'https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85',
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 'cat-003',
            'name': 'Handcrafted Clothing',
            'slug': 'clothing',
            'description': 'Traditional Nepali clothing and fabrics',
            'image': 'https://images.unsplash.com/photo-1595972424993-0cf6b1273a68?crop=entropy&cs=srgb&fm=jpg&q=85',
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.categories.insert_many(categories)
    print('✓ Categories created')
    
    # Create products
    products = [
        {
            'id': 'prod-001',
            'name': 'Thekuwa',
            'slug': 'thekuwa-traditional-sweet',
            'description': 'Traditional Maithili sweet made with wheat flour, jaggery, and aromatic spices. Handcrafted using recipes passed down through generations in Janakpur. Perfect for festivals and celebrations.',
            'short_description': 'Authentic Maithili sweet with wheat flour and jaggery',
            'categories': ['sweets'],
            'tags': ['traditional', 'festival', 'maithili'],
            'price': 450.00,
            'discount_price': 399.00,
            'stock': 50,
            'sku': 'MS-THK-001',
            'weight': 0.5,
            'images': [
                'https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg',
                'https://images.pexels.com/photos/22820070/pexels-photo-22820070.jpeg'
            ],
            'is_featured': True,
            'is_new': True,
            'is_active': True,
            'rating': 4.8,
            'reviews_count': 24,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [],
            'attributes': {}
        },
        {
            'id': 'prod-002',
            'name': 'Pure Himalayan Ghee',
            'slug': 'pure-himalayan-ghee',
            'description': 'Premium quality ghee made from grass-fed cow milk in the foothills of the Himalayas. Rich in nutrients and with an authentic taste that enhances any dish. Contains no additives or preservatives.',
            'short_description': 'Organic ghee from grass-fed Himalayan cows',
            'categories': ['groceries'],
            'tags': ['organic', 'ghee', 'himalayan'],
            'price': 1200.00,
            'stock': 30,
            'sku': 'MS-GHE-001',
            'weight': 1.0,
            'images': [
                'https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85',
                'https://images.pexels.com/photos/34961656/pexels-photo-34961656.jpeg'
            ],
            'is_featured': True,
            'is_new': False,
            'is_active': True,
            'rating': 4.9,
            'reviews_count': 45,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [],
            'attributes': {}
        },
        {
            'id': 'prod-003',
            'name': 'Khajuriya',
            'slug': 'khajuriya-sweet',
            'description': 'Crispy and sweet traditional Nepali snack made with rice flour and molasses. A beloved treat during Chhath Puja and other festivals. Light, crunchy, and perfectly sweet.',
            'short_description': 'Crispy rice flour sweet, perfect for festivals',
            'categories': ['sweets'],
            'tags': ['traditional', 'festival', 'chhath'],
            'price': 380.00,
            'discount_price': 320.00,
            'stock': 40,
            'sku': 'MS-KHJ-001',
            'weight': 0.5,
            'images': [
                'https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg'
            ],
            'is_featured': True,
            'is_new': False,
            'is_active': True,
            'rating': 4.7,
            'reviews_count': 18,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [],
            'attributes': {}
        },
        {
            'id': 'prod-004',
            'name': 'Organic Mustard Oil',
            'slug': 'organic-mustard-oil',
            'description': 'Cold-pressed mustard oil from locally grown mustard seeds. Rich in omega-3 fatty acids and essential nutrients. Perfect for cooking and traditional massages.',
            'short_description': 'Cold-pressed organic mustard oil',
            'categories': ['groceries'],
            'tags': ['organic', 'oil', 'cold-pressed'],
            'price': 650.00,
            'stock': 25,
            'sku': 'MS-OIL-001',
            'weight': 1.0,
            'images': [
                'https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85'
            ],
            'is_featured': False,
            'is_new': True,
            'is_active': True,
            'rating': 4.6,
            'reviews_count': 12,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [],
            'attributes': {}
        },
        {
            'id': 'prod-005',
            'name': 'Dhaka Topi',
            'slug': 'dhaka-topi-traditional-cap',
            'description': 'Authentic Dhaka Topi (traditional Nepali cap) hand-woven with intricate patterns. A symbol of Nepali culture and pride. Perfect for cultural events and everyday wear.',
            'short_description': 'Hand-woven traditional Nepali cap',
            'categories': ['clothing'],
            'tags': ['traditional', 'dhaka', 'cap'],
            'price': 850.00,
            'discount_price': 750.00,
            'stock': 20,
            'sku': 'MS-CAP-001',
            'images': [
                'https://images.unsplash.com/photo-1595972424993-0cf6b1273a68?crop=entropy&cs=srgb&fm=jpg&q=85'
            ],
            'is_featured': True,
            'is_new': True,
            'is_active': True,
            'rating': 4.9,
            'reviews_count': 32,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [],
            'attributes': {}
        },
        {
            'id': 'prod-006',
            'name': 'Pirukiya',
            'slug': 'pirukiya-sweet',
            'description': 'Deep-fried sweet dumpling stuffed with khoya and nuts. A delicacy from Mithila region, prepared during special occasions. Crispy outside, sweet and rich inside.',
            'short_description': 'Sweet dumplings stuffed with khoya and nuts',
            'categories': ['sweets'],
            'tags': ['traditional', 'festival', 'mithai'],
            'price': 420.00,
            'stock': 35,
            'sku': 'MS-PIR-001',
            'weight': 0.5,
            'images': [
                'https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg'
            ],
            'is_featured': False,
            'is_new': False,
            'is_active': True,
            'rating': 4.5,
            'reviews_count': 15,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [],
            'attributes': {}
        },
        {
            'id': 'prod-007',
            'name': 'Laai (Puffed Rice)',
            'slug': 'laai-puffed-rice',
            'description': 'Traditional Nepali puffed rice, light and crispy. Perfect for making snacks or eating with curd and vegetables. A staple in Nepali households.',
            'short_description': 'Traditional puffed rice snack',
            'categories': ['sweets', 'groceries'],
            'tags': ['traditional', 'snack', 'light'],
            'price': 180.00,
            'stock': 60,
            'sku': 'MS-LAI-001',
            'weight': 0.3,
            'images': [
                'https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg'
            ],
            'is_featured': False,
            'is_new': False,
            'is_active': True,
            'rating': 4.3,
            'reviews_count': 8,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [],
            'attributes': {}
        },
        {
            'id': 'prod-008',
            'name': 'Homemade Dahi (Yogurt)',
            'slug': 'homemade-dahi',
            'description': 'Fresh homemade yogurt prepared using traditional methods. Creamy, tangy, and probiotic-rich. Made from pure buffalo milk from local farms.',
            'short_description': 'Fresh homemade yogurt from buffalo milk',
            'categories': ['groceries'],
            'tags': ['fresh', 'dairy', 'probiotic'],
            'price': 250.00,
            'stock': 15,
            'sku': 'MS-DAH-001',
            'weight': 0.5,
            'images': [
                'https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85'
            ],
            'is_featured': False,
            'is_new': True,
            'is_active': True,
            'rating': 4.7,
            'reviews_count': 21,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'variants': [],
            'attributes': {}
        }
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
