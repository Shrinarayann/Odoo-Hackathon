from mongoengine import Document, StringField, DateTimeField
from datetime import datetime
import bcrypt

class User(Document):

    email = StringField(required=True, unique=True)
    password_hash = StringField(required=True)
    username = StringField(required=True, unique=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    
    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        return super(User, self).save(*args, **kwargs)
    
    def hash_password(self, raw_password):
            # hashing password with bcrypt
        self.password = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, input_password):
        return bcrypt.checkpw(input_password.encode('utf-8'), self.password.encode('utf-8'))
    

