from mongoengine import Document, StringField, DateTimeField,IntField,ListField,ReferenceField,FloatField
from datetime import datetime
import bcrypt

class User(Document):
    profile_pic=StringField(required=True)
    name = StringField(required=True)
    email = StringField(required=True,unique=True)
    phone_number=IntField(required=True,unique=True)
    location = StringField(required=True)
    password= StringField(required=True)
    products = ListField(ReferenceField('Product', required=True), default=list)
    cart = ListField(ReferenceField('Product'), default=list)
    ratings=FloatField(default=0)
    number_rated=IntField(default=0)


    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        return super(User, self).save(*args, **kwargs)

    def hash_password(self, raw_password):
        self.password_hash = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, input_password):
        return bcrypt.checkpw(input_password.encode('utf-8'), self.password_hash.encode('utf-8'))