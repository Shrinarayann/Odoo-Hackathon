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

# ... (rest of your auction_bp routes: get_auction_products, place_bid, etc.)


# auction_routes.py

# ... (imports and other routes remain the same) ...
from flask import request, jsonify
from datetime import datetime


from mongoengine.queryset.visitor import Q # Required for complex queries


@auction_bp.route('/products/<string:user_id_from_path>', methods=['GET'])
def get_auction_products(user_id_from_path: str):
    """
    Get all active auction products for any user to view.
    This endpoint is public and does not filter by seller.
    Supports pagination, search, category filtering, and sorting.
    The user_id_from_path parameter is accepted to match client requests but is not used for filtering products.
    """
    try:
        # Log the user_id from path if needed, e.g., for analytics or context
        # logger.info(f"Fetching auction products for request associated with user_id_from_path: {user_id_from_path}")

        # Basic query conditions: only get products that are currently active
        query_conditions = Q(status='active') & Q(auction_end_time__gt=datetime.utcnow())

        # Search term filter (applies to product_name and product_description)
        search_query = request.args.get('search', None)
        if search_query:
            query_conditions &= (Q(product_name__icontains=search_query) | \
                                 Q(product_description__icontains=search_query))

        # Category filter
        category_filter = request.args.get('category', None)
        if category_filter and category_filter.lower() != 'all':
            query_conditions &= Q(category=category_filter)

        # Pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20)) # Default limit 20, as in original
        offset = (page - 1) * limit

        # Sorting
        sort_criteria = request.args.get('sort_by', 'ending_soon') # Default as in frontend
        
        # Determine sort field based on criteria
        if sort_criteria == 'newest':
            sort_field = '-created_at'
        elif sort_criteria == 'price_low':
            sort_field = '+current_highest_bid' # Assuming current_highest_bid, or base_price if no bids
        elif sort_criteria == 'price_high':
            sort_field = '-current_highest_bid'
        elif sort_criteria == 'ending_soon':
            sort_field = '+auction_end_time'
        else: # Default sort
            sort_field = '+auction_end_time'


        # Fetch the products from the database with filters, sorting, and pagination
        auction_products_query = AuctionProduct.objects(query_conditions)
        
        total_products = auction_products_query.count()
        auction_products = auction_products_query.order_by(sort_field).skip(offset).limit(limit)

        # Serialize the products into a JSON-friendly list
        products_list = []
        for p in auction_products:
            products_list.append({
                '_id': str(p.id),
                'product_name': p.product_name,
                'product_description': p.product_description,
                'category': p.category,
                'condition': p.condition,
                'seller_location': p.seller_location,
                'brand': p.brand,
                'model': p.model,
                'image_url': p.image_url,
                'base_price': p.base_price,
                'current_highest_bid': p.current_highest_bid,
                'highest_bidder_id': str(p.highest_bidder_id.id) if p.highest_bidder_id else None,
                'highest_bidder': p.highest_bidder_name, # Frontend expects 'highest_bidder' for the name
                'auction_start_time': p.auction_start_time.isoformat(),
                'auction_end_time': p.auction_end_time.isoformat(),
                'bid_history': [{
                    'bidder_id': str(b.bidder_id.id) if b.bidder_id else None, # Added check for b.bidder_id
                    'bidder_name': b.bidder_name,
                    'bid_amount': b.bid_amount,
                    'timestamp': b.timestamp.isoformat()
                } for b in p.bid_history],
                'status': p.status,
                'seller_id': str(p.seller_id.id) if p.seller_id else None, # Added check for p.seller_id
                'seller_name': p.seller_name,
                'created_at': p.created_at.isoformat()
            })

        return jsonify({
            'success': True,
            'products': products_list,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_products': total_products,
                'total_pages': (total_products + limit - 1) // limit if limit > 0 else 0
            },
            # Optionally, echo back applied filters/sorting for frontend confirmation
            'filters_applied': {
                'search_query': search_query,
                'category': category_filter,
                'sort_by': sort_criteria
            }
        }), 200

    except Exception as e:
        # Assuming logger is configured
        # logger.error(f"Error fetching auction products (path user_id: {user_id_from_path}): {str(e)}")
        print(f"Error fetching auction products: {str(e)}") # Fallback print if logger not available
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500

# @auction_bp.route('/products', methods=['GET'])

# def get_auction_products():
#     """
#     Get all active auction products for any user to view.
#     This endpoint is now public and does not filter by seller.
#     """

#     try:
#         # Basic filters: only get products that are currently active
#         query_filters = {
#             'status': 'active',
#             'auction_end_time__gt': datetime.utcnow()
#         }


#         # Pagination parameters from the request query string (e.g., /products?page=1&limit=10)
#         page = int(request.args.get('page', 1))
#         limit = int(request.args.get('limit', 20))
#         offset = (page - 1) * limit

#         # Fetch the products from the database with pagination and sorting
#         auction_products = AuctionProduct.objects(**query_filters).order_by('+auction_end_time').skip(offset).limit(limit)
#         total_products = AuctionProduct.objects(**query_filters).count()

#         # Serialize the products into a JSON-friendly list
#         products_list = []
#         for p in auction_products:
#             products_list.append({
#                 '_id': str(p.id),
#                 'product_name': p.product_name,
#                 'product_description': p.product_description,
#                 'category': p.category,
#                 'condition': p.condition,
#                 'seller_location': p.seller_location,
#                 'brand': p.brand,
#                 'model': p.model,
#                 'image_url': p.image_url,
#                 'base_price': p.base_price,
#                 'current_highest_bid': p.current_highest_bid,
#                 'highest_bidder_id': str(p.highest_bidder_id.id) if p.highest_bidder_id else None,
#                 'highest_bidder': p.highest_bidder_name,
#                 'auction_start_time': p.auction_start_time.isoformat(),
#                 'auction_end_time': p.auction_end_time.isoformat(),
#                 'bid_history': [{
#                     'bidder_id': str(b.bidder_id.id),
#                     'bidder_name': b.bidder_name,
#                     'bid_amount': b.bid_amount,
#                     'timestamp': b.timestamp.isoformat()
#                 } for b in p.bid_history],
#                 'status': p.status,
#                 'seller_id': str(p.seller_id.id),
#                 'seller_name': p.seller_name,
#                 'created_at': p.created_at.isoformat()
#             })

#         return jsonify({
#             'success': True,
#             'products': products_list,
#             'pagination': {
#                 'page': page,
#                 'limit': limit,
#                 'total_products': total_products,
#                 'total_pages': (total_products + limit - 1) // limit if limit > 0 else 0
#             }
#         }), 200

#     except Exception as e:
#         logger.error(f"Error fetching auction products: {str(e)}")
#         return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500


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


@auction_bp.route('/product/<product_id_str>', methods=['GET'])
def get_single_auction_product(product_id_str):
    """Get details for a single auction product."""
    try:
        product = AuctionProduct.objects.get(id=product_id_str)
        product_data = {
            '_id': str(product.id),
            'product_name': product.product_name,
            'product_description': product.product_description,
            'category': product.category,
            'condition': product.condition,
            'seller_location': product.seller_location,
            'brand': product.brand,
            'model': product.model,
            'image_url': product.image_url,
            'base_price': product.base_price,
            'current_highest_bid': product.current_highest_bid,
            'highest_bidder_id': str(product.highest_bidder_id.id) if product.highest_bidder_id else None,
            'highest_bidder': product.highest_bidder_name,
            'auction_start_time': product.auction_start_time.isoformat(),
            'auction_end_time': product.auction_end_time.isoformat(),
            'bid_history': [{
                'bidder_id': str(b.bidder_id.id),
                'bidder_name': b.bidder_name,
                'bid_amount': b.bid_amount,
                'timestamp': b.timestamp.isoformat()
            } for b in product.bid_history],
            'status': product.status,
            'seller_id': str(product.seller_id.id),
            'seller_name': product.seller_name,
            'created_at': product.created_at.isoformat()
        }
        return jsonify({'success': True, 'product': product_data}), 200

    except DoesNotExist:
        return jsonify({'success': False, 'message': 'Auction product not found'}), 404
    except ValidationError:
        return jsonify({'success': False, 'message': 'Invalid product ID format'}), 400
    except Exception as e:
        logger.error(f"Error fetching single auction product {product_id_str}: {str(e)}")
        return jsonify({'success': False, 'message': 'An error occurred'}), 500
