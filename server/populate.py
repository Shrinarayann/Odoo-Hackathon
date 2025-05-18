# populate_data.py
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.cart import Cart


from mongoengine import connect

# Replace <db_username> and <db_password> with your actual credentials
connect(
    host="mongodb+srv://prawinkumar:BscL19uAYbZbnc5p@odoocluster.6rxxgxg.mongodb.net/?retryWrites=true&w=majority&appName=OdooCluster"
)

# 1. Create a user
from werkzeug.security import generate_password_hash

user = User(
    username="John Doe",           # ✅ Use the actual field name
    email="john@example.com",
    password_hash=generate_password_hash("securepassword123")
)

user.save()



# 2. Create a product
product = Product(
    user_id=user,
    title="Reusable Water Bottle",
    description="Stainless steel eco-friendly water bottle.",
    category="Accessories",
    price=500,
    image_url="https://example.com/waterbottle.jpg",
    eco_score=90
)
product.save()

# 3. Create an order
Order.create_from_product(user_id=user.id, product_id=product.id)


cart = Cart.get_or_create_cart(user.id)
cart.add_item(product.id, quantity=1)

print("Data populated successfully.")
