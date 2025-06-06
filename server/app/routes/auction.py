from flask import Blueprint, request, jsonify
from app.models.user import User
from app.models.auction_product import AuctionProduct # BidEntry is not directly used in this route
from app.utils.jwt import token_required
from mongoengine import DoesNotExist, ValidationError
from datetime import datetime # timedelta is not used in this specific route
import logging
from bson import ObjectId
# bson.ObjectId is not directly used in create_product but good for other routes

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
auction_bp = Blueprint('auction', __name__)

@auction_bp.route('/create-product', methods=['POST'])
@token_required
def create_auction_product():
    """
    Create a new product listing for auction.
    Frontend sends: product_name, product_description, base_price, auction_end_time,
                    image_url, category, condition, seller_location, brand, model.
    Backend derives seller_name and seller_id from token.
    """
    try:
        current_user_data = request.current_user
        user_id = current_user_data['user_id']
        try:
            user = User.objects.get(id=user_id)
        except DoesNotExist:
            logger.warning(f"Authenticated user with ID {user_id} not found in database.")
            return jsonify({'success': False, 'message': 'Authenticated user not found in database'}), 404
        except ValidationError: # Handles if user_id from token is not a valid ObjectId format
             logger.warning(f"Invalid user ID format from token: {user_id}")
             return jsonify({'success': False, 'message': 'Invalid user ID in token.'}), 400

        data = request.get_json()
        if not data:
            logger.warning("Create product attempt with no JSON data.")
            return jsonify({'success': False, 'message': 'No data provided or not JSON format'}), 400

        logger.debug(f"Received data for product creation by user {user.email}: {data}")

        # --- Validate required fields from payload ---
        # These fields are marked as required in the frontend form.
        # We use .get() for safety and then validate.

        product_name = data.get('product_name')
        if not product_name or not isinstance(product_name, str) or not product_name.strip():
            return jsonify({'success': False, 'message': 'Product name is required and cannot be empty.'}), 400

        product_description = data.get('product_description')
        if not product_description or not isinstance(product_description, str) or not product_description.strip():
            return jsonify({'success': False, 'message': 'Product description is required and cannot be empty.'}), 400

        category = data.get('category')
        if not category or not isinstance(category, str):
            return jsonify({'success': False, 'message': 'Category is required.'}), 400

        condition = data.get('condition')
        if not condition or not isinstance(condition, str):
            return jsonify({'success': False, 'message': 'Condition is required.'}), 400
        
        # Image URL: Frontend sends '' if no image. Model's image_url is not required=True.
        image_url = data.get('image_url')
        if image_url is None or not isinstance(image_url, str): 
            # This check ensures image_url is present and a string.
            # Frontend should always send it as a string (empty or URL).
            return jsonify({'success': False, 'message': 'Image URL must be provided as a string (can be empty).'}), 400

        # --- Base Price ---
        base_price_val = data.get('base_price')
        if base_price_val is None: # Handles JSON 'null' if frontend sent NaN
            return jsonify({'success': False, 'message': 'Base price is required.'}), 400
        try:
            base_price = float(base_price_val)
        except (ValueError, TypeError): # Catches if base_price_val is not a valid number string (e.g., "abc") or other non-convertible types
            return jsonify({'success': False, 'message': 'Base price must be a valid number.'}), 400
        
        if base_price < 0: # Model's base_price has min_value=0, but an explicit check is good.
            return jsonify({'success': False, 'message': 'Base price must be a non-negative number.'}), 400

        # --- Auction End Time ---
        end_time_str = data.get('auction_end_time')
        if not end_time_str or not isinstance(end_time_str, str):
            return jsonify({'success': False, 'message': 'Auction end time is required and must be a string.'}), 400
        try:
            # Frontend sends ISO string with 'Z'. Python's fromisoformat can handle 'Z' in >=3.11
            # The original .replace("Z", "+00:00") is robust for wider Python version compatibility.
            auction_end_time = datetime.fromisoformat(end_time_str.replace("Z", "+00:00"))
        except ValueError: # More specific exception for format issues
            return jsonify({'success': False, 'message': 'Invalid auction_end_time format. Expected ISO 8601 format (e.g., YYYY-MM-DDTHH:MM:SSZ).'}), 400

        # Ensure auction_end_time is timezone-aware if comparing with datetime.utcnow() which is naive
        # or make utcnow() offset-aware for comparison. For simplicity, assuming UTC.
        if auction_end_time <= datetime.utcnow().replace(tzinfo=auction_end_time.tzinfo if auction_end_time.tzinfo else None):
            return jsonify({'success': False, 'message': 'Auction end time must be in the future.'}), 400

        # --- Seller Location (from frontend, with fallback to user's profile location) ---
        # Frontend has this as a required select with a default.
        seller_location = data.get('seller_location')
        if not seller_location or not isinstance(seller_location, str):
            # If not provided or not a string, try user's default location if available
            if hasattr(user, 'location') and user.location and isinstance(user.location, str):
                seller_location = user.location
            else:
                # If still no valid location and your business logic requires it.
                # The AuctionProduct model's seller_location is not required=True.
                # So, if it's okay for it to be None/empty, you can remove this error.
                # Based on frontend 'required', let's enforce it for now.
                return jsonify({'success': False, 'message': 'Seller location is required and must be a string.'}), 400
        
        # --- Optional fields ---
        brand = data.get('brand') # Allow empty string or None
        if brand is not None and not isinstance(brand, str):
            return jsonify({'success': False, 'message': 'Brand, if provided, must be a string.'}), 400
            
        model = data.get('model') # Allow empty string or None
        if model is not None and not isinstance(model, str):
            return jsonify({'success': False, 'message': 'Model, if provided, must be a string.'}), 400

        # Prepare data for AuctionProduct, only include optional fields if they have values
        auction_product_data = {
            'seller_id': user.id,
            'seller_name': user.name,
            'product_name': product_name.strip(),
            'product_description': product_description.strip(),
            'category': category,
            'condition': condition,
            'image_url': image_url, # Can be an empty string
            'base_price': base_price,
            'current_highest_bid': base_price, # Initialize current_highest_bid
            'auction_end_time': auction_end_time,
            'status': 'active'
        }
        if seller_location: # Add if not empty
             auction_product_data['seller_location'] = seller_location
        if brand: # Add if not empty
            auction_product_data['brand'] = brand
        if model: # Add if not empty
            auction_product_data['model'] = model
            
        auction_product = AuctionProduct(**auction_product_data)
        auction_product.save() # This can still raise ValidationError for model-level checks (e.g. min_value)

        logger.info(f"Auction product '{auction_product.product_name}' (ID: {auction_product.id}) created by user {user.email} (ID: {user.id})")
        return jsonify({
            'success': True,
            'message': 'Auction product created successfully',
            'product_id': str(auction_product.id)
        }), 201 # HTTP 201 Created is more appropriate for successful resource creation

    except ValidationError as e:
        logger.error(f"Validation Error during auction product creation by {user_id if 'user_id' in locals() else 'unknown user'}: {e.to_dict() if hasattr(e, 'to_dict') else str(e)}")
        # e.to_dict() gives a structured error message from MongoEngine
        error_details = e.to_dict() if hasattr(e, 'to_dict') else str(e)
        return jsonify({'success': False, 'message': 'Validation Error.', 'errors': error_details}), 400
    except Exception as e:
        # Log the full traceback for unexpected errors
        logger.exception(f"Unexpected error creating auction product by {user_id if 'user_id' in locals() else 'unknown user'}:")
        return jsonify({'success': False, 'message': 'An unexpected error occurred on the server.'}), 500



# auction_routes.py


@auction_bp.route('/place-bid', methods=['POST'])
@token_required
def place_bid():
    """Place a bid on an auction product."""
    try:
        current_user_data = request.current_user
        bidder_id = current_user_data['user_id']
        bidder = User.objects.get(id=bidder_id)

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        product_id = data.get('product_id')
        bid_amount_str = data.get('bid_amount')
        if not product_id or bid_amount_str is None:
            return jsonify({'success': False, 'message': 'Product ID and bid amount are required'}), 400

        try:
            bid_amount = float(bid_amount_str)
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid bid amount format'}), 400

        auction_product = AuctionProduct.objects.get(id=product_id)
        auction_product.add_bid(bidder, bid_amount)

        logger.info(f"Bid of {bid_amount} placed on '{auction_product.product_name}' by user {bidder.email} (ID: {bidder.id})")
        return jsonify({
            'success': True,
            'message': 'Bid placed successfully',
            'product': {
                '_id': str(auction_product.id),
                'current_highest_bid': auction_product.current_highest_bid,
                'highest_bidder': auction_product.highest_bidder_name,
                'bid_history_count': len(auction_product.bid_history)
            }
        }), 200

    except DoesNotExist:
        return jsonify({'success': False, 'message': 'User or Auction Product not found'}), 404
    except ValidationError as e:
        return jsonify({'success': False, 'message': f'Validation Error: {str(e)}'}), 400
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400
    except Exception as e:
        logger.error(f"Error placing bid: {str(e)}")
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500


# @auction_bp.route('/product/<product_id_str>', methods=['GET'])
# def get_single_auction_product(product_id_str):
#     """Get details for a single auction product."""
#     try:
#         product = AuctionProduct.objects.get(id=product_id_str)
#         product_data = {
#             '_id': str(product.id),
#             'product_name': product.product_name,
#             'product_description': product.product_description,
#             'category': product.category,
#             'condition': product.condition,
#             'seller_location': product.seller_location,
#             'brand': product.brand,
#             'model': product.model,
#             'image_url': product.image_url,
#             'base_price': product.base_price,
#             'current_highest_bid': product.current_highest_bid,
#             'highest_bidder_id': str(product.highest_bidder_id.id) if product.highest_bidder_id else None,
#             'highest_bidder': product.highest_bidder_name,
#             'auction_start_time': product.auction_start_time.isoformat(),
#             'auction_end_time': product.auction_end_time.isoformat(),
#             'bid_history': [{
#                 'bidder_id': str(b.bidder_id.id),
#                 'bidder_name': b.bidder_name,
#                 'bid_amount': b.bid_amount,
#                 'timestamp': b.timestamp.isoformat()
#             } for b in product.bid_history],
#             'status': product.status,
#             'seller_id': str(product.seller_id.id),
#             'seller_name': product.seller_name,
#             'created_at': product.created_at.isoformat()
#         }
#         return jsonify({'success': True, 'product': product_data}), 200

#     except DoesNotExist:
#         return jsonify({'success': False, 'message': 'Auction product not found'}), 404
#     except ValidationError:
#         return jsonify({'success': False, 'message': 'Invalid product ID format'}), 400
#     except Exception as e:
#         logger.error(f"Error fetching single auction product {product_id_str}: {str(e)}")
#         return jsonify({'success': False, 'message': 'An error occurred'}), 500


#from flask import jsonify # Ensure jsonify is imported
# Assuming auction_bp, AuctionProduct, logger, DoesNotExist, ValidationError are defined/imported
# from mongoengine.errors import DoesNotExist, ValidationError # if using mongoengine
# import logging # Example: logger = logging.getLogger(__name__)

# If logger is not configured, replace logger.error with print for debugging
# For example, if you have: from .. import logger

# @auction_bp.route('/products', methods=['GET']) # Changed route from /product/<product_id_str>
# def get_all_auction_products(): # Renamed function and removed product_id_str parameter
#     """Get all active auction products."""
#     try:
#         # Fetch all products. Filtering for "active" status as per example and typical use case.
#         # If you need all products regardless of status, use AuctionProduct.objects.all()
#         all_products = AuctionProduct.objects.filter(status="active")

#         products_data_list = []
#         for product in all_products:
#             # Safely access brand and model, as they might not be present on all documents
#             brand = getattr(product, 'brand', None)
#             model = getattr(product, 'model', None)

#             # Safely access .id attribute for reference fields
#             highest_bidder_id_str = None
#             if product.highest_bidder_id and hasattr(product.highest_bidder_id, 'id'):
#                 highest_bidder_id_str = str(product.highest_bidder_id.id)

#             seller_id_str = None
#             if product.seller_id and hasattr(product.seller_id, 'id'):
#                 seller_id_str = str(product.seller_id.id)

#             bid_history_data = []
#             for b in product.bid_history:
#                 bidder_id_str = None
#                 if b.bidder_id and hasattr(b.bidder_id, 'id'):
#                     bidder_id_str = str(b.bidder_id.id)
#                 bid_history_data.append({
#                     'bidder_id': bidder_id_str,
#                     'bidder_name': b.bidder_name,
#                     'bid_amount': b.bid_amount,
#                     'timestamp': b.timestamp.isoformat()
#                 })

#             product_data = {
#                 '_id': str(product.id),
#                 'product_name': product.product_name,
#                 'product_description': product.product_description,
#                 'category': product.category,
#                 'condition': product.condition,
#                 'seller_location': product.seller_location,
#                 'brand': brand,
#                 'model': model,
#                 'image_url': product.image_url,
#                 'base_price': product.base_price,
#                 'current_highest_bid': product.current_highest_bid,
#                 'highest_bidder_id': highest_bidder_id_str,
#                 'highest_bidder': product.highest_bidder_name, # Corresponds to 'highest_bidder_name' in DB model
#                 'auction_start_time': product.auction_start_time.isoformat(),
#                 'auction_end_time': product.auction_end_time.isoformat(),
#                 'bid_history': bid_history_data,
#                 'status': product.status,
#                 'seller_id': seller_id_str,
#                 'seller_name': product.seller_name,
#                 'created_at': product.created_at.isoformat(),
#                 # 'updated_at': product.updated_at.isoformat() # Add if needed
#             }
#             products_data_list.append(product_data)

#         return jsonify({'success': True, 'products': products_data_list}), 200

#     except Exception as e:
#         # Replace with your actual logger if available
#         print(f"Error fetching all auction products: {str(e)}")
#         # logger.error(f"Error fetching all auction products: {str(e)}")
#         return jsonify({'success': False, 'message': 'An error occurred while fetching products'}), 500


# from flask import Blueprint, request, jsonify
# from app.models.user import User
# from app.models.auction_product import AuctionProduct
# from app.utils.jwt import token_required
# from mongoengine import DoesNotExist, ValidationError
# from datetime import datetime
# import logging




@auction_bp.route('/products', methods=['GET'])
def get_all_auction_products():
    """
    Get all auction products and update status of expired ones.
    """
    try:
        # --- NEW LOGIC: Update expired auctions before fetching ---
        now = datetime.utcnow()
        # Find auctions that are still marked as 'active' but their end time has passed.
        expired_auctions = AuctionProduct.objects.filter(status="active", auction_end_time__lte=now)

        for product in expired_auctions:
            # Check if there were any bids other than the initial base price setting.
            # A bid history length of 0 means no one bid.
            if len(product.bid_history) > 0:
                product.status = 'ended_sold'
            else:
                product.status = 'ended_no_bids'
            product.save()
            logger.info(f"Updated status for expired product {product.id} to {product.status}")
        # --- END OF NEW LOGIC ---

        # Fetch all products to send to the frontend (you might still want to show ended auctions)
        all_products = AuctionProduct.objects.all().order_by('auction_end_time')

        products_data_list = []
        for product in all_products:
            # This part of your code was already good, just ensuring it's complete.
            product_data = {
                '_id': str(product.id),
                'product_name': product.product_name,
                'product_description': product.product_description,
                'category': product.category,
                'condition': product.condition,
                'seller_location': product.seller_location,
                'brand': getattr(product, 'brand', None),
                'model': getattr(product, 'model', None),
                'image_url': product.image_url,
                'base_price': product.base_price,
                'current_highest_bid': product.current_highest_bid,
                'highest_bidder_id': str(product.highest_bidder_id.id) if product.highest_bidder_id else None,
                'highest_bidder': product.highest_bidder_name,
                'auction_start_time': product.auction_start_time.isoformat(),
                'auction_end_time': product.auction_end_time.isoformat(),
                'bid_history': [{
                    'bidder_name': b.bidder_name,
                    'bid_amount': b.bid_amount,
                    'timestamp': b.timestamp.isoformat()
                } for b in product.bid_history],
                'status': product.status,
                'seller_id': str(product.seller_id.id),
                'seller_name': product.seller_name,
                'created_at': product.created_at.isoformat(),
            }
            products_data_list.append(product_data)

        return jsonify({'success': True, 'products': products_data_list}), 200

    except Exception as e:
        logger.error(f"Error fetching all auction products: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'message': 'An error occurred while fetching products'}), 500