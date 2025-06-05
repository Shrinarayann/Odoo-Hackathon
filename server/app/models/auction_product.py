from mongoengine import Document, StringField, ReferenceField, FloatField, DateTimeField, ListField, EmbeddedDocument, EmbeddedDocumentField
from datetime import datetime, timedelta
from app.models.user import User # Assuming your User model is here

class BidEntry(EmbeddedDocument):
    """
    Represents a single bid in the auction.
    """
    bidder_id = ReferenceField('User', required=True)
    bidder_name = StringField(required=True) # Denormalized for easier display
    bid_amount = FloatField(required=True, min_value=0)
    timestamp = DateTimeField(default=datetime.utcnow)

class AuctionProduct(Document):
    """
    Model for products listed for auction.
    """
    seller_id = ReferenceField('User', required=True)
    seller_name = StringField(required=True) # Denormalized for easier display

    product_name = StringField(required=True, max_length=200)
    product_description = StringField(required=True)
    category = StringField(required=True)
    condition = StringField(required=True) # e.g., "Like New", "Good", "Fair"
    seller_location = StringField()
    brand = StringField()
    model = StringField()
    image_url = StringField() # URL to the image

    base_price = FloatField(required=True, min_value=0)
    current_highest_bid = FloatField(min_value=0) # Can be initialized to base_price
    highest_bidder_id = ReferenceField('User', null=True) # User who placed the current_highest_bid
    highest_bidder_name = StringField(null=True) # Denormalized

    auction_start_time = DateTimeField(default=datetime.utcnow)
    auction_end_time = DateTimeField(required=True)

    bid_history = ListField(EmbeddedDocumentField(BidEntry), default=list)
    
    # status can be 'active', 'ended_no_bids', 'ended_sold', 'cancelled'
    status = StringField(default='active', choices=['active', 'ended_no_bids', 'ended_sold', 'cancelled'])

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'indexes': [
            'status',
            'auction_end_time',
            'category',
            {'fields': ['$product_name', "$product_description"],
             'default_language': 'english',
             'weights': {'product_name': 10, 'product_description': 2}
            }
        ]
    }

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.utcnow()
        if self.current_highest_bid is None: # Initialize if not set
            self.current_highest_bid = self.base_price
        self.updated_at = datetime.utcnow()
        return super(AuctionProduct, self).save(*args, **kwargs)

    def is_active(self):
        return self.status == 'active' and self.auction_end_time > datetime.utcnow()

    def add_bid(self, user, bid_amount):
        if not self.is_active():
            raise ValueError("Auction is not active.")
        if bid_amount <= self.current_highest_bid:
            raise ValueError("Bid must be higher than the current highest bid.")
        if str(user.id) == str(self.seller_id.id):
            raise ValueError("Seller cannot bid on their own item.")

        new_bid = BidEntry(
            bidder_id=user,
            bidder_name=user.name, # Assuming User model has a 'name' field
            bid_amount=bid_amount,
            timestamp=datetime.utcnow()
        )
        self.bid_history.append(new_bid)
        self.current_highest_bid = bid_amount
        self.highest_bidder_id = user
        self.highest_bidder_name = user.name
        self.save()
