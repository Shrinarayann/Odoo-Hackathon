from mongoengine import Document, ReferenceField, DateTimeField, IntField, EmbeddedDocument, EmbeddedDocumentField, ListField
from datetime import datetime
from app.models.product import Product  # ✅ Correct
from app.models.user import User


class CartItem(EmbeddedDocument):
    """
    Embedded document representing an item in the cart
    """
    product = ReferenceField('Product', required=True)
    quantity = IntField(default=1, min_value=1)
    added_at = DateTimeField(default=datetime.utcnow)

    def subtotal(self):
        """Calculate the subtotal for this cart item"""
        return self.product.price * self.quantity

class Cart(Document):
    """
    Cart document representing a user's shopping cart
    """
    user = ReferenceField('User', required=True, unique=True)
    items = ListField(EmbeddedDocumentField(CartItem), default=[])
    updated_at = DateTimeField(default=datetime.utcnow)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'carts',
        'indexes': [
            'user',
            {'fields': ['user', 'items.product'], 'unique': True}
        ]
    }

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        return super(Cart, self).save(*args, **kwargs)

    def add_item(self, product_id, quantity=1):
        """
        Add a product to the cart or update quantity if it already exists
        """
        # Find the product
        product = Product.objects.get(id=product_id)
        
        # Check if product is already in cart
        for item in self.items:
            if str(item.product.id) == str(product_id):
                item.quantity += quantity
                self.save()
                return self
        
        # If not found, add new item
        cart_item = CartItem(product=product, quantity=quantity)
        self.items.append(cart_item)
        self.save()
        return self

    def remove_item(self, product_id):
        """
        Remove a product from the cart
        """
        self.items = [item for item in self.items if str(item.product.id) != str(product_id)]
        self.save()
        return self

    def update_quantity(self, product_id, quantity):
        """
        Update the quantity of a product in the cart
        """
        for item in self.items:
            if str(item.product.id) == str(product_id):
                if quantity > 0:
                    item.quantity = quantity
                else:
                    # If quantity is 0 or negative, remove the item
                    return self.remove_item(product_id)
                self.save()
                return self
                
        # Item not found
        return None

    def clear(self):
        """
        Clear all items from the cart
        """
        self.items = []
        self.save()
        return self

    def item_count(self):
        """
        Get the total number of items in the cart
        """
        return sum(item.quantity for item in self.items)

    def total(self):
        """
        Calculate the total cost of all items in the cart
        """
        return sum(item.subtotal() for item in self.items)

    @classmethod
    def get_or_create_cart(cls, user_id):
        """
        Get an existing cart for a user or create a new one
        """
        try:
            cart = cls.objects.get(user=user_id)
            return cart
        except cls.DoesNotExist:
            user = User.objects.get(id=user_id)
            cart = cls(user=user)
            cart.save()
            return cart