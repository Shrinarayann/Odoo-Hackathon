from flask import Blueprint, request, jsonify
from ..models.product import Product
from ..models.user import User
from ..utils.jwt import token_required
from mongoengine import DoesNotExist, ValidationError
from datetime import datetime
import logging

# Create blueprint
products_bp = Blueprint('products', __name__)






 # Set up logging
# logger = logging.getLogger(__name__)

# @products_bp.route('/', methods=['POST'])
# @token_required
# def create_product():
#     """Create a new product listing"""
#     try:
#         # Get current user from token
#         current_user_id = request.current_user['user_id']
#         user = User.objects(id=current_user_id).first()
        
#         if not user:
#             return jsonify({'error': 'User not found'}), 404
        
#         # Get request data
#         data = request.get_json()
        
#         # Validate required fields
#         required_fields = ['name', 'description', 'category', 'price', 'quantity', 'condition']
#         for field in required_fields:
#             if field not in data or not data[field]:
#                 return jsonify({'error': f'{field} is required'}), 400
        
#         # Validate price and quantity are positive
#         if data['price'] < 0:
#             return jsonify({'error': 'Price must be non-negative'}), 400
#         if data['quantity'] < 0:
#             return jsonify({'error': 'Quantity must be non-negative'}), 400
        
#         # Create product
#         product = Product(
#             user_id=user,
#             name=data['name'],
#             description=data['description'],
#             category=data['category'],
#             price=data['price'],
#             quantity=data['quantity'],
#             condition=data['condition'],
#             image_url=data.get('image_url', ''),
#             brand=data.get('brand', ''),
#             model=data.get('model', ''),
#             seller_location=data.get('seller_location', ''),
#             is_sold=data.get('is_sold', False)
#         )
        
#         product.save()
        
#         return jsonify({
#             'message': 'Product created successfully',
#             'product': {
#                 'id': str(product.id),
#                 'name': product.name,
#                 'description': product.description,
#                 'category': product.category,
#                 'price': product.price,
#                 'quantity': product.quantity,
#                 'condition': product.condition,
#                 'image_url': product.image_url,
#                 'brand': product.brand,
#                 'model': product.model,
#                 'seller_location': product.seller_location,
#                 'is_sold': product.is_sold,
#                 'created_at': product.created_at.isoformat(),
#                 'updated_at': product.updated_at.isoformat()
#             }
#         }), 201
        
#     except ValidationError as e:
#         return jsonify({'error': f'Validation error: {str(e)}'}), 400
#     except Exception as e:
#         logger.error(f"Error creating product: {str(e)}")
#         return jsonify({'error': 'Internal server error'}), 500



# @products_bp.route('/<product_id>', methods=['PUT'])
# @token_required
# def update_product(product_id):
#     """Update a specific product (only if owned by current user)"""
#     try:
#         # Get current user from token
#         current_user_id = request.current_user['user_id']
#         user = User.objects(id=current_user_id).first()
        
#         if not user:
#             return jsonify({'error': 'User not found'}), 404
        
#         # Find product
#         product = Product.objects(id=product_id, user_id=user).first()
        
#         if not product:
#             return jsonify({'error': 'Product not found or not owned by user'}), 404
        
#         # Get request data
#         data = request.get_json()
        
#         # Update fields if provided
#         updateable_fields = [
#             'name', 'description', 'category', 'price', 'quantity', 
#             'condition', 'image_url', 'brand', 'model', 'seller_location', 'is_sold'
#         ]
        
#         for field in updateable_fields:
#             if field in data:
#                 # Validate numeric fields
#                 if field == 'price' and data[field] < 0:
#                     return jsonify({'error': 'Price must be non-negative'}), 400
#                 if field == 'quantity' and data[field] < 0:
#                     return jsonify({'error': 'Quantity must be non-negative'}), 400
                
#                 setattr(product, field, data[field])
        
#         # Update timestamp
#         product.updated_at = datetime.utcnow()
#         product.save()
        
#         return jsonify({
#             'message': 'Product updated successfully',
#             'product': {
#                 'id': str(product.id),
#                 'name': product.name,
#                 'description': product.description,
#                 'category': product.category,
#                 'price': product.price,
#                 'quantity': product.quantity,
#                 'condition': product.condition,
#                 'image_url': product.image_url,
#                 'brand': product.brand,
#                 'model': product.model,
#                 'seller_location': product.seller_location,
#                 'is_sold': product.is_sold,
#                 'created_at': product.created_at.isoformat(),
#                 'updated_at': product.updated_at.isoformat()
#             }
#         }), 200
        
#     except DoesNotExist:
#         return jsonify({'error': 'Product not found'}), 404
#     except ValidationError as e:
#         return jsonify({'error': f'Validation error: {str(e)}'}), 400
#     except Exception as e:
#         logger.error(f"Error updating product: {str(e)}")
#         return jsonify({'error': 'Internal server error'}), 500

# @products_bp.route('/<product_id>', methods=['DELETE'])
# @token_required
# def delete_product(product_id):
#     """Delete a specific product (only if owned by current user)"""
#     try:
#         # Get current user from token
#         current_user_id = request.current_user['user_id']
#         user = User.objects(id=current_user_id).first()
        
#         if not user:
#             return jsonify({'error': 'User not found'}), 404
        
#         # Find product
#         product = Product.objects(id=product_id, user_id=user).first()
        
#         if not product:
#             return jsonify({'error': 'Product not found or not owned by user'}), 404
        
#         # Store product info for response
#         product_name = product.name
        
#         # Delete product
#         product.delete()
        
#         return jsonify({
#             'message': f'Product "{product_name}" deleted successfully'
#         }), 200
        
#     except DoesNotExist:
#         return jsonify({'error': 'Product not found'}), 404
#     except Exception as e:
#         logger.error(f"Error deleting product: {str(e)}")
#         return jsonify({'error': 'Internal server error'}), 500

# @products_bp.route('/<product_id>/toggle-status', methods=['PATCH'])
# @token_required
# def toggle_product_status(product_id):
#     """Toggle product sold status (mark as sold/unsold)"""
#     try:
#         # Get current user from token
#         current_user_id = request.current_user['user_id']
#         user = User.objects(id=current_user_id).first()
        
#         if not user:
#             return jsonify({'error': 'User not found'}), 404
        
#         # Find product
#         product = Product.objects(id=product_id, user_id=user).first()
        
#         if not product:
#             return jsonify({'error': 'Product not found or not owned by user'}), 404
        
#         # Toggle sold status
#         product.is_sold = not product.is_sold
#         product.updated_at = datetime.utcnow()
#         product.save()
        
#         status = "sold" if product.is_sold else "active"
        
#         return jsonify({
#             'message': f'Product marked as {status}',
#             'product': {
#                 'id': str(product.id),
#                 'name': product.name,
#                 'is_sold': product.is_sold,
#                 'updated_at': product.updated_at.isoformat()
#             }
#         }), 200
        
#     except DoesNotExist:
#         return jsonify({'error': 'Product not found'}), 404
#     except Exception as e:
#         logger.error(f"Error toggling product status: {str(e)}")
#         return jsonify({'error': 'Internal server error'}), 500