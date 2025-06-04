from mongoengine import Document, ReferenceField, IntField, DateTimeField
from datetime import datetime
from app.models.user import User
from app.models.product import Product

class Order(Document):
    """
    Order document representing a completed purchase
    """
    user = ReferenceField('User', required=True)  # buyer
    product = ReferenceField('Product', required=True)
    seller = ReferenceField('User', required=True)  # seller/owner of the product
    price = IntField(required=True, min_value=0)  # price at time of purchase
    purchased_at = DateTimeField(default=datetime.utcnow)
