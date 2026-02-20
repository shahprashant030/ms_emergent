import requests
import sys
import json
from datetime import datetime

class MithilaSutraAPITester:
    def __init__(self, base_url="https://nepal-heritage-shop.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = "test_session_123"
        self.test_product_id = None
        self.test_order_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, params=params)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, params=params)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, params=params)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_send_otp(self, phone):
        """Test sending OTP"""
        success, response = self.run_test(
            "Send OTP",
            "POST",
            "auth/send-otp",
            200,
            data={"phone": phone}
        )
        if success and 'otp' in response:
            print(f"   OTP received: {response['otp']}")
            return response['otp']
        return None

    def test_verify_otp(self, phone, otp):
        """Test OTP verification and get token"""
        success, response = self.run_test(
            "Verify OTP",
            "POST",
            "auth/verify-otp",
            200,
            data={"phone": phone, "otp": otp}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token received for user: {response.get('user', {}).get('phone')}")
            return True
        return False

    def test_get_me(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_update_profile(self):
        """Test updating user profile"""
        success, response = self.run_test(
            "Update Profile",
            "PUT",
            "auth/profile",
            200,
            data={"name": "Test User", "email": "test@example.com", "address": "Test Address"}
        )
        return success

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        if success and response:
            print(f"   Found {len(response)} products")
            if response:
                self.test_product_id = response[0]['id']
                print(f"   Using product ID for tests: {self.test_product_id}")
        return success

    def test_search_products(self):
        """Test product search"""
        success, response = self.run_test(
            "Search Products",
            "GET",
            "products",
            200,
            params={"search": "khajur"}
        )
        if success:
            print(f"   Search returned {len(response)} products")
        return success

    def test_filter_products_by_category(self):
        """Test filtering products by category"""
        success, response = self.run_test(
            "Filter Products by Category",
            "GET",
            "products",
            200,
            params={"category": "Food"}
        )
        if success:
            print(f"   Category filter returned {len(response)} products")
        return success

    def test_get_featured_products(self):
        """Test getting featured products"""
        success, response = self.run_test(
            "Get Featured Products",
            "GET",
            "products",
            200,
            params={"featured": True}
        )
        if success:
            print(f"   Featured products: {len(response)}")
        return success

    def test_get_single_product(self):
        """Test getting a single product"""
        if not self.test_product_id:
            print("❌ No product ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Single Product",
            "GET",
            f"products/{self.test_product_id}",
            200
        )
        return success

    def test_get_categories(self):
        """Test getting categories"""
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        if success:
            print(f"   Found {len(response)} categories")
        return success

    def test_get_cart_guest(self):
        """Test getting cart for guest user"""
        success, response = self.run_test(
            "Get Cart (Guest)",
            "GET",
            "cart",
            200,
            headers={'Authorization': ''},  # Remove auth header
            params={"session_id": self.session_id}
        )
        return success

    def test_add_to_cart_guest(self):
        """Test adding item to cart for guest"""
        if not self.test_product_id:
            print("❌ No product ID available for cart testing")
            return False
            
        success, response = self.run_test(
            "Add to Cart (Guest)",
            "POST",
            "cart/add",
            200,
            data={"product_id": self.test_product_id, "quantity": 2},
            headers={'Authorization': ''},  # Remove auth header
            params={"session_id": self.session_id}
        )
        return success

    def test_get_cart_authenticated(self):
        """Test getting cart for authenticated user"""
        success, response = self.run_test(
            "Get Cart (Authenticated)",
            "GET",
            "cart",
            200
        )
        return success

    def test_add_to_cart_authenticated(self):
        """Test adding item to cart for authenticated user"""
        if not self.test_product_id:
            print("❌ No product ID available for cart testing")
            return False
            
        success, response = self.run_test(
            "Add to Cart (Authenticated)",
            "POST",
            "cart/add",
            200,
            data={"product_id": self.test_product_id, "quantity": 1}
        )
        return success

    def test_remove_from_cart(self):
        """Test removing item from cart"""
        if not self.test_product_id:
            print("❌ No product ID available for cart testing")
            return False
            
        success, response = self.run_test(
            "Remove from Cart",
            "DELETE",
            f"cart/item/{self.test_product_id}",
            200
        )
        return success

    def test_create_order(self):
        """Test creating an order"""
        if not self.test_product_id:
            print("❌ No product ID available for order testing")
            return False
            
        order_data = {
            "items": [{
                "product_id": self.test_product_id,
                "product_name": "Test Product",
                "quantity": 1,
                "price": 100.0,
                "total": 100.0
            }],
            "total": 100.0,
            "shipping_address": "Test Address, Kathmandu",
            "phone": "9800000001",
            "name": "Test Customer",
            "notes": "Test order"
        }
        
        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if success and 'id' in response:
            self.test_order_id = response['id']
            print(f"   Order created with ID: {self.test_order_id}")
        
        return success

    def test_get_user_orders(self):
        """Test getting user orders"""
        success, response = self.run_test(
            "Get User Orders",
            "GET",
            "orders",
            200
        )
        if success:
            print(f"   Found {len(response)} orders")
        return success

    def test_get_single_order(self):
        """Test getting a single order"""
        if not self.test_order_id:
            print("❌ No order ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Single Order",
            "GET",
            f"orders/{self.test_order_id}",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        # First send OTP to admin phone
        otp = self.test_send_otp("9800000000")
        if not otp:
            return False
            
        # Verify OTP and get admin token
        success, response = self.run_test(
            "Admin Login - Verify OTP",
            "POST",
            "auth/verify-otp",
            200,
            data={"phone": "9800000000", "otp": otp}
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token received")
            return True
        return False

    def test_admin_stats(self):
        """Test admin dashboard stats"""
        # Use admin token
        original_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200
        )
        
        if success:
            print(f"   Stats: Products={response.get('total_products')}, Orders={response.get('total_orders')}, Users={response.get('total_users')}, Revenue={response.get('total_revenue')}")
        
        # Restore original token
        self.token = original_token
        return success

    def test_admin_get_all_orders(self):
        """Test admin getting all orders"""
        # Use admin token
        original_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test(
            "Admin Get All Orders",
            "GET",
            "admin/orders",
            200
        )
        
        if success:
            print(f"   Admin can see {len(response)} total orders")
        
        # Restore original token
        self.token = original_token
        return success

    def test_admin_update_order_status(self):
        """Test admin updating order status"""
        if not self.test_order_id:
            print("❌ No order ID available for status update testing")
            return False
            
        # Use admin token
        original_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test(
            "Admin Update Order Status",
            "PUT",
            f"admin/orders/{self.test_order_id}/status",
            200,
            data={"status": "confirmed"}
        )
        
        # Restore original token
        self.token = original_token
        return success

    def test_create_product_admin(self):
        """Test admin creating a product"""
        # Use admin token
        original_token = self.token
        self.token = self.admin_token
        
        product_data = {
            "name": "Test Product API",
            "slug": "test-product-api",
            "description": "A test product created via API",
            "short_description": "Test product",
            "categories": ["Food"],
            "price": 150.0,
            "stock": 10,
            "images": ["https://example.com/test.jpg"],
            "is_featured": True,
            "is_new": True
        }
        
        success, response = self.run_test(
            "Admin Create Product",
            "POST",
            "products",
            200,
            data=product_data
        )
        
        # Restore original token
        self.token = original_token
        return success

    def test_create_category_admin(self):
        """Test admin creating a category"""
        # Use admin token
        original_token = self.token
        self.token = self.admin_token
        
        category_data = {
            "name": "Test Category",
            "slug": "test-category",
            "description": "A test category created via API",
            "image": "https://example.com/category.jpg"
        }
        
        success, response = self.run_test(
            "Admin Create Category",
            "POST",
            "categories",
            200,
            data=category_data
        )
        
        # Restore original token
        self.token = original_token
        return success

def main():
    print("🚀 Starting Mithila Sutra E-commerce API Testing")
    print("=" * 60)
    
    tester = MithilaSutraAPITester()
    
    # Test Authentication Flow
    print("\n📱 AUTHENTICATION TESTS")
    print("-" * 30)
    
    # Test regular user authentication
    otp = tester.test_send_otp("9800000001")
    if not otp:
        print("❌ Failed to send OTP, stopping tests")
        return 1
    
    if not tester.test_verify_otp("9800000001", otp):
        print("❌ Failed to verify OTP, stopping tests")
        return 1
    
    tester.test_get_me()
    tester.test_update_profile()
    
    # Test Product APIs
    print("\n🛍️ PRODUCT TESTS")
    print("-" * 30)
    
    tester.test_get_products()
    tester.test_search_products()
    tester.test_filter_products_by_category()
    tester.test_get_featured_products()
    tester.test_get_single_product()
    tester.test_get_categories()
    
    # Test Cart APIs
    print("\n🛒 CART TESTS")
    print("-" * 30)
    
    tester.test_get_cart_guest()
    tester.test_add_to_cart_guest()
    tester.test_get_cart_authenticated()
    tester.test_add_to_cart_authenticated()
    tester.test_remove_from_cart()
    
    # Test Order APIs
    print("\n📦 ORDER TESTS")
    print("-" * 30)
    
    tester.test_create_order()
    tester.test_get_user_orders()
    tester.test_get_single_order()
    
    # Test Admin APIs
    print("\n👑 ADMIN TESTS")
    print("-" * 30)
    
    if tester.test_admin_login():
        tester.test_admin_stats()
        tester.test_admin_get_all_orders()
        tester.test_admin_update_order_status()
        tester.test_create_product_admin()
        tester.test_create_category_admin()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️ Some tests failed - check logs above")
        return 1

if __name__ == "__main__":
    sys.exit(main())