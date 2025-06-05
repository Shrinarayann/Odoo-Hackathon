from flask import Blueprint, request, jsonify
from ..models.product import Product
from ..models.user import User
from ..utils.jwt import token_required
from mongoengine import DoesNotExist, ValidationError
from datetime import datetime
import logging

# Create blueprint
products_bp = Blueprint('products', __name__)


@products_bp.route('/', methods=['GET'])
@token_required
def get_user_products():
    try:
        user_payload = request.current_user
        user_id = user_payload.get('user_id')

        # Get pagination parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        # Ensure valid pagination values
        page = max(1, page)
        per_page = min(max(1, per_page), 100)  # Limit max per_page to 100

        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        # Get all products for this user
        all_products = user.products if hasattr(user, 'products') and user.products else []
        
        # Calculate pagination
        total_products = len(all_products)
        total_pages = (total_products + per_page - 1) // per_page  # Ceiling division
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        # Get paginated products
        paginated_products = all_products[start_idx:end_idx]

        product_list = []
        for product in paginated_products:
            try:
                product_data = {
                    '_id': str(product.id),  # Frontend expects _id
                    'id': str(product.id),   # Also provide id for compatibility
                    'name': getattr(product, 'name', ''),
                    'description': getattr(product, 'description', ''),
                    'category': getattr(product, 'category', ''),
                    'price': getattr(product, 'price', 0),
                    'quantity': getattr(product, 'quantity', 0),
                    'condition': getattr(product, 'condition', ''),
                    'image_url': getattr(product, 'image_url', ''),
                    'brand': getattr(product, 'brand', ''),
                    'model': getattr(product, 'model', ''),
                    'seller_location': getattr(product, 'seller_location', ''),
                    'status': getattr(product, 'status', 'active'),
                    'auction_status': getattr(product, 'auction_status', None),
                    'created_at': product.created_at.isoformat() if hasattr(product, 'created_at') and product.created_at else None,
                    'updated_at': product.updated_at.isoformat() if hasattr(product, 'updated_at') and product.updated_at else None,
                }
                product_list.append(product_data)
            except Exception as product_error:
                print(f"Error processing product {product.id}: {str(product_error)}")
                continue

        # Prepare pagination info
        pagination_info = {
            'page': page,
            'per_page': per_page,
            'total': total_products,
            'pages': total_pages
        }

        return jsonify({
            'success': True,
            'products': product_list,
            'pagination': pagination_info
        }), 200

    except ValueError as ve:
        return jsonify({'success': False, 'message': f'Invalid pagination parameters: {str(ve)}'}), 400
    except Exception as e:
        print(f"Error in get_user_products: {str(e)}")
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500


@products_bp.route('/', methods=['POST'])
@token_required
def create_product():
    try:
        user_payload = request.current_user
        user_id = user_payload.get('user_id')
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        required_fields = ['name', 'description', 'category', 'price', 'quantity', 'condition']
        if not all(field in data for field in required_fields):
            return jsonify({'success': False, 'message': 'Missing required product fields'}), 400

        product = Product(
            user_id=user,
            name=data['name'],
            description=data['description'],
            category=data['category'],
            price=data['price'],
            quantity=data['quantity'],
            condition=data['condition'],
            image_url=data.get('image_url', ''),
            brand=data.get('brand', ''),
            model=data.get('model', ''),
            seller_location=data.get('seller_location', ''),
        )
        product.save()

        # Add product reference to user's products array
        user.products.append(product)
        user.save()

        return jsonify({
            'success': True,
            'message': 'Product added successfully',
            'product_id': str(product.id)
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@products_bp.route('/<product_id>', methods=['DELETE'])
@token_required
def delete_product(product_id):
    try:
        user_payload = request.current_user
        user_id = user_payload.get('user_id')

        product = Product.objects(id=product_id, user_id=user_id).first()
        if not product:
            return jsonify({'success': False, 'message': 'Product not found or not owned by you'}), 404

        # Remove reference from User.products as well
        User.objects(id=user_id).update(pull__products=product)
        product.delete()

        return jsonify({'success': True, 'message': 'Product deleted successfully'}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500


@products_bp.route('/search', methods=['GET'])
@token_required  # Optional if you want to allow unauthenticated access
def get_products_by_category():
    try:
        category = request.args.get('category', None)
        if not category:
            return jsonify({'success': False, 'message': 'Category query parameter is required'}), 400
        
        user_payload = request.current_user
        user_id = user_payload.get('user_id') if user_payload else None  # Handle case where user_payload might be None
        
        # Query for products with matching category
        # Exclude products added by the logged-in user if user_id is present
        query = {'category': category}
        print(f"Category: {category}")
        print(f"Query: {query}")
        print(f"User ID: {user_id}")
        
        if user_id:
            query['user_id__ne'] = user_id  # MongoEngine syntax for "not equal"
        
        # Execute the query
        products = Product.objects(**query)
        print(f"Found {len(products)} products")
        
        # Serialize products with seller info included
        results = []
        for product in products:
            try:
                # Handle case where user_id might not be populated (if it's a reference)
                seller_info = {
                    'name': 'Unknown',
                    'phone': 'N/A',
                    'email': 'N/A'
                }
                
                # Check if user_id is populated and has the required fields
                if hasattr(product, 'user_id') and product.user_id:
                    if hasattr(product.user_id, 'name'):
                        seller_info['name'] = product.user_id.name
                    if hasattr(product.user_id, 'phone_number'):
                        seller_info['phone'] = product.user_id.phone_number
                    if hasattr(product.user_id, 'email'):
                        seller_info['email'] = product.user_id.email
                
                product_data = {
                    'id': str(product.id),
                    'name': product.name,
                    'description': product.description,
                    'price': product.price,
                    'category': product.category,
                    'seller': seller_info
                }
                
                # Add image URL if it exists
                if hasattr(product, 'image_url') and product.image_url:
                    product_data['image_url'] = product.image_url
                elif hasattr(product, 'image') and product.image:
                    product_data['image'] = product.image
                
                results.append(product_data)
                print(f"Added product: {product.name}")
                
            except Exception as e:
                print(f"Error processing product {product.id}: {str(e)}")
                continue
        
        print(f"Returning {len(results)} products")
        return jsonify({'success': True, 'products': results}), 200
        
    except Exception as e:
        print(f"Error in get_products_by_category: {str(e)}")
        return jsonify({'success': False, 'message': 'Internal server error', 'error': str(e)}), 500
    

@products_bp.route('/all', methods=['GET'])
@token_required
def get_all_products():
    """Get all products excluding current user's own products"""
    try:
        current_user = request.current_user
        user_id = current_user.get('user_id')
    
        # Fetch all products except those belonging to the current user
        products = Product.objects(user_id__ne=user_id)

        product_list = []
        for product in products:
            try:
                # Handle potential missing fields gracefully
                product_data = {
                    "id": str(product.id),
                    "name": getattr(product, 'name', 'Unknown'),
                    "description": getattr(product, 'description', ''),
                    "price": getattr(product, 'price', 0),
                    "quantity": getattr(product, 'quantity', 0),
                    "category": getattr(product, 'category', 'Uncategorized'),
                    "image_url": getattr(product, 'image_url', ''),
                    "brand": getattr(product, 'brand', ''),
                    "model": getattr(product, 'model', ''),
                    "condition": getattr(product, 'condition', ''),
                    "seller_location": getattr(product, 'seller_location', ''),
                    "is_sold": getattr(product, 'is_sold', False),
                }
                
                # Handle user_id reference safely
                if hasattr(product, 'user_id') and product.user_id:
                    # If user_id is a reference object, get its id
                    if hasattr(product.user_id, 'id'):
                        product_data["user_id"] = str(product.user_id.id)
                    else:
                        # If user_id is already an ObjectId
                        product_data["user_id"] = str(product.user_id)
                else:
                    product_data["user_id"] = "unknown"
                
                # Add seller information if available
                seller_info = {
                    'name': 'Unknown',
                    'phone': 'N/A',
                    'email': 'N/A'
                }
                
                if hasattr(product, 'user_id') and product.user_id:
                    if hasattr(product.user_id, 'name'):
                        seller_info['name'] = product.user_id.name or 'Unknown'
                    if hasattr(product.user_id, 'phone_number'):
                        seller_info['phone'] = product.user_id.phone_number or 'N/A'
                    if hasattr(product.user_id, 'email'):
                        seller_info['email'] = product.user_id.email or 'N/A'
                
                product_data["seller"] = seller_info
                product_list.append(product_data)
                
            except Exception as product_error:
                # Log the error but continue with other products
                print(f"Error processing product {product.id}: {str(product_error)}")
                continue

        return jsonify({
            "success": True,
            "products": product_list
        }), 200

    except Exception as e:
        print(f"Error in get_all_products: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch products", 
            "details": str(e)
        }), 500



@products_bp.route('/<product_id>', methods=['PUT'])
@token_required
def update_product(product_id):
    try:
        user_payload = request.current_user
        user_id = user_payload.get('user_id')

        # Parse JSON request
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['name', 'description', 'price', 'quantity']
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return jsonify({'success': False, 'message': f'{field.capitalize()} is required'}), 400

        # Parse and validate values
        try:
            price = float(data['price'])
            quantity = int(data['quantity'])
            if price < 0 or quantity < 0:
                return jsonify({'success': False, 'message': 'Price and quantity must be non-negative'}), 400
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Invalid price or quantity'}), 400

        # Fetch product and ensure it belongs to the user
        product = Product.objects(id=product_id, user_id=user_id).first()
        if not product:
            return jsonify({'success': False, 'message': 'Product not found or permission denied'}), 404

        # Update fields
        product.name = data['name'].strip()
        product.description = data['description'].strip()
        product.price = price
        product.quantity = quantity

        # Optional fields
        optional_fields = ['category', 'condition', 'brand', 'model', 'seller_location', 'image_url']
        for field in optional_fields:
            if field in data:
                setattr(product, field, data[field].strip() if data[field] else '')

        # Save updated product (timestamps are handled in model)
        product.save()

        updated_product_data = {
            '_id': str(product.id),
            'id': str(product.id),
            'name': product.name,
            'description': product.description,
            'category': product.category,
            'price': product.price,
            'quantity': product.quantity,
            'condition': product.condition,
            'image_url': product.image_url,
            'brand': product.brand,
            'model': product.model,
            'seller_location': product.seller_location,
            'status': product.status,
            'auction_status': product.auction_status,
            'created_at': product.created_at.isoformat() if product.created_at else None,
            'updated_at': product.updated_at.isoformat() if product.updated_at else None,
        }

        return jsonify({
            'success': True,
            'message': 'Product updated successfully',
            'product': updated_product_data
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Internal server error: {str(e)}'}), 500

