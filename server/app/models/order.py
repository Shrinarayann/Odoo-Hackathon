from mongoengine import Document, ReferenceField, IntField, DateTimeField
from datetime import datetime
from app.models.user import User
from app.models.product import Product

class Order(Document):
    """
    Order document representing a completed purchase
    """
    user = ReferenceField(User, required=True)  # buyer
    product = ReferenceField(Product, required=True)
    seller = ReferenceField(User, required=True)  # seller/owner of the product
    price = IntField(required=True, min_value=0)  # price at time of purchase
    purchased_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'orders',
        'indexes': [
            'user',
            'seller',
            'product',
            'purchased_at'
        ]
    }
    
    @classmethod
    def create_from_product(cls, user_id, product_id):
        """
        Create an order directly from a product ID
        """
        user = User.objects.get(id=user_id)
        product = Product.objects.get(id=product_id)
        
        # Make sure product is not already sold
        if product.is_sold:
            raise ValueError("Product is already sold")
        
        # Create the order
        order = cls(
            user=user,
            product=product,
            seller=product.user_id,  # seller is the product owner
            price=product.price
        )
        
        # Mark the product as sold
        product.is_sold = True
        product.save()
        
        # Save and return the order
        order.save()
        return order
    
    @classmethod
    def get_user_orders(cls, user_id):
        """
        Get all orders for a specific user (as buyer)
        """
        return cls.objects(user=user_id).order_by('-purchased_at')
    
    @classmethod
    def get_seller_orders(cls, seller_id):
        """
        Get all orders for a specific seller
        """
        return cls.objects(seller=seller_id).order_by('-purchased_at')
    
    def to_dict(self):
        """
        Convert order to dictionary with all relevant information
        """
        return {
            'id': str(self.id),
            'user': {
                'id': str(self.user.id),
                'username': self.user.username
            },
            'product': {
                'id': str(self.product.id),
                'title': self.product.title,
                'image_url': self.product.image_url
            },
            'seller': {
                'id': str(self.seller.id),
                'username': self.seller.username
            },
            'price': self.price,
            'purchased_at': self.purchased_at.isoformat()
        }