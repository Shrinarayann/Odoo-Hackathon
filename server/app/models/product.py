from mongoengine import Document, StringField, ReferenceField, IntField, BooleanField, DateTimeField, DictField
from datetime import datetime
from app.models.user import User

class Product(Document):

    # Reference to the User who created the product
    user_id = ReferenceField('User', required=True)

    # Product fields
    name = StringField(required=True, max_length=100)
    category = StringField(required=True)
    description = StringField(required=True)
    price = IntField(required=True, min_value=0)
    quantity = IntField(required=True,min_value=0)
    condition = StringField(required=True)
    seller_location=StringField()
    brand=StringField()
    model=StringField()
    image_url = StringField()
    status = BooleanField(default=True)
    auction_status=BooleanField(default=False)
    # auction=DictField()

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    # Override save method to update timestamps
    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        return super(Product, self).save(*args, **kwargs)
    

