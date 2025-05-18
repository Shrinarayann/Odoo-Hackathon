from mongoengine import Document, StringField, ReferenceField, IntField, BooleanField, DateTimeField
from datetime import datetime
from app.models import User  # Import the User model to reference it

class Product(Document):

    # Reference to the User who created the product
    user_id = ReferenceField('User', required=True)

    # Product fields
    title = StringField(required=True, max_length=100)
    description = StringField(required=True)
    category = StringField(required=True)
    price = IntField(required=True, min_value=0)
    image_url = StringField()
    is_sold = BooleanField(default=False)
    eco_score = IntField(min_value=0, max_value=100)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    # Override save method to update timestamps
    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        return super(Product, self).save(*args, **kwargs)
    

