from flask import Blueprint, request, jsonify
from ..utils.jwt import token_required
from app.models.user import User
from app.models.product import Product
from mongoengine.errors import DoesNotExist, ValidationError
from bson import ObjectId

# Create the cart blueprint
cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['POST'])
@token_required
def add_to_cart():
    """
    Add a product to user's cart
    Expected JSON payload:
    {
        "productId": "product_object_id",
        "quantity": 1
    }
    """
    try:
        # Get current user from JWT token
        current_user_id = request.current_user.get('user_id')
        
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        product_id = data.get('productId')
        quantity = data.get('quantity', 1)
        
        # Validate required fields
        if not product_id:
            return jsonify({
                'success': False,
                'message': 'Product ID is required'
            }), 400
        
        # Validate quantity
        if not isinstance(quantity, int) or quantity < 1:
            return jsonify({
                'success': False,
                'message': 'Quantity must be a positive integer'
            }), 400
        
        # Get the current user
        try:
            user = User.objects.get(id=current_user_id)
        except DoesNotExist:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Get the product
        try:
            product = Product.objects.get(id=product_id)
        except DoesNotExist:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        # Check if product is active/available
        if not product.status:
            return jsonify({
                'success': False,
                'message': 'Product is not available'
            }), 400
        
        # Check if user is trying to add their own product
        if str(product.user_id.id) == str(current_user_id):
            return jsonify({
                'success': False,
                'message': 'You cannot add your own product to cart'
            }), 400
        
        # Check if product has sufficient quantity
        if product.quantity < quantity:
            return jsonify({
                'success': False,
                'message': f'Only {product.quantity} items available in stock'
            }), 400
        
        # Check if product is already in cart
        if product in user.cart:
            return jsonify({
                'success': False,
                'message': 'Product is already in your cart'
            }), 400
        
        # Add product to cart
        user.cart.append(product)
        user.save()
        
        return jsonify({
            'success': True,
            'message': f'{product.name} added to cart successfully',
            'data': {
                'product_id': str(product.id),
                'product_name': product.name,
                'cart_count': len(user.cart)
            }
        }), 200
        
    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': f'Validation error: {str(e)}'
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@cart_bp.route('', methods=['GET'])
@token_required
def get_cart():
    """
    Get user's cart items
    """
    try:
        # Get current user from JWT token
        current_user_id = request.current_user.get('user_id')
        
        # Get the current user
        try:
            user = User.objects.get(id=current_user_id)
        except DoesNotExist:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Get cart items with product details
        cart_items = []
        for product in user.cart:
            cart_items.append({
                'id': str(product.id),
                'name': product.name,
                'category': product.category,
                'description': product.description,
                'price': product.price,
                'quantity': product.quantity,
                'condition': product.condition,
                'seller_location': product.seller_location,
                'brand': product.brand,
                'model': product.model,
                'image_url': product.image_url,
                'seller_name': product.user_id.name,
                'seller_id': str(product.user_id.id)
            })
        
        return jsonify({
            'success': True,
            'message': 'Cart retrieved successfully',
            'data': {
                'cartItems': cart_items,
                'cart_count': len(cart_items)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@cart_bp.route('/<product_id>', methods=['DELETE'])
@token_required
def remove_from_cart(product_id):
    """
    Remove a product from user's cart
    """
    try:
        # Get current user from JWT token
        current_user_id = request.current_user.get('user_id')
        
        # Get the current user
        try:
            user = User.objects.get(id=current_user_id)
        except DoesNotExist:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Get the product
        try:
            product = Product.objects.get(id=product_id)
        except DoesNotExist:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        # Check if product is in cart
        if product not in user.cart:
            return jsonify({
                'success': False,
                'message': 'Product is not in your cart'
            }), 400
        
        # Remove product from cart
        user.cart.remove(product)
        user.save()
        
        return jsonify({
            'success': True,
            'message': f'{product.name} removed from cart successfully',
            'data': {
                'cart_count': len(user.cart)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@cart_bp.route('/clear', methods=['DELETE'])
@token_required
def clear_cart():
    """
    Clear all items from user's cart
    """
    try:
        # Get current user from JWT token
        current_user_id = request.current_user.get('user_id')
        
        # Get the current user
        try:
            user = User.objects.get(id=current_user_id)
        except DoesNotExist:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Clear the cart
        user.cart = []
        user.save()
        
        return jsonify({
            'success': True,
            'message': 'Cart cleared successfully',
            'data': {
                'cart_count': 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500