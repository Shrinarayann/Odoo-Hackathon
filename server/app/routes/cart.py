from flask import Blueprint, request, jsonify
from ..utils.jwt import token_required
from app.models.user import User
from app.models.product import Product
from mongoengine.errors import DoesNotExist, ValidationError
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Create the cart blueprint
cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['POST'])
@token_required
def add_to_cart():
    """
    Add a product to user's cart.
    Expected JSON payload:
    {
        "productId": "product_object_id"
    }
    """
    try:
        current_user_id = request.current_user.get('user_id')
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        product_id = data.get('productId')
        if not product_id:
            return jsonify({'success': False, 'message': 'Product ID is required'}), 400

        user = User.objects.get(id=current_user_id)
        product = Product.objects.get(id=product_id)

        if not product.status:
            return jsonify({'success': False, 'message': 'Product is not currently available'}), 400

        if str(product.user_id.id) == str(current_user_id):
            return jsonify({'success': False, 'message': 'You cannot add your own product to cart'}), 400

        if product in user.cart:
            return jsonify({'success': False, 'message': 'Product is already in your cart'}), 400

        if product.quantity < 1:
            return jsonify({'success': False, 'message': 'Product is out of stock'}), 400

        user.cart.append(product)
        product.quantity -= 1
        
        product.save()
        user.save()

        logger.info(f"User {current_user_id} added product {product_id} to cart. New product quantity: {product.quantity}")

        return jsonify({
            'success': True,
            'message': f'{product.name} added to cart successfully',
            'data': {
                'product_id': str(product.id),
                'product_name': product.name,
                'cart_count': len(user.cart)
            }
        }), 200

    except DoesNotExist:
        return jsonify({'success': False, 'message': 'User or Product not found'}), 404
    except ValidationError:
        return jsonify({'success': False, 'message': 'Invalid Product ID format'}), 400
    except Exception as e:
        logger.error(f"Error in add_to_cart for user {request.current_user.get('user_id') if request.current_user else 'Unknown'}: {str(e)}")
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500


@cart_bp.route('', methods=['GET'])
@token_required
def get_cart_items():
    """
    Get user's cart items. Handles stale product references by removing them.
    """
    try:
        current_user_id = request.current_user.get('user_id')
        user = User.objects.get(id=current_user_id)
        
        valid_cart_product_objects = []
        cart_item_details_for_frontend = []
        cart_was_modified = False

        for product_in_user_cart_list in user.cart:
            # product_in_user_cart_list is a Product object (or proxy) from the ListField(ReferenceField)
            # We need to ensure it still exists in the Product collection
            try:
                # Fetch the product fresh from DB to ensure it's not stale/deleted
                # .first() returns None if not found, preventing DoesNotExist for this specific check
                actual_product_from_db = Product.objects(id=product_in_user_cart_list.id).first()

                if actual_product_from_db:
                    valid_cart_product_objects.append(actual_product_from_db) # Add the live DB object

                    seller_name = "Unknown Seller"
                    seller_id_str = None
                    if actual_product_from_db.user_id: # Check if user_id (seller) exists
                        seller_name = getattr(actual_product_from_db.user_id, 'name', "Unknown Seller")
                        seller_id_str = str(actual_product_from_db.user_id.id)

                    cart_item_details_for_frontend.append({
                        'id': str(actual_product_from_db.id),
                        'name': actual_product_from_db.name,
                        'category': actual_product_from_db.category,
                        'description': actual_product_from_db.description,
                        'price': actual_product_from_db.price,
                        'condition': actual_product_from_db.condition,
                        'seller_location': actual_product_from_db.seller_location,
                        'brand': actual_product_from_db.brand,
                        'model': actual_product_from_db.model,
                        'image_url': actual_product_from_db.image_url,
                        'seller_name': seller_name,
                        'seller_id': seller_id_str,
                        'available_stock': actual_product_from_db.quantity # Current stock in DB
                    })
                else:
                    # Product reference is stale (product deleted from DB)
                    cart_was_modified = True
                    logger.warning(f"Stale product reference (ID: {product_in_user_cart_list.id}) found in cart for user {user.id}. It will be removed.")
            
            except Exception as e_loop:
                logger.error(f"Error processing cart item ID {product_in_user_cart_list.id if product_in_user_cart_list else 'N/A'} for user {user.id}: {str(e_loop)}")
                cart_was_modified = True # Mark for cleanup

        if cart_was_modified:
            user.cart = valid_cart_product_objects # Update cart with only valid, existing products
            user.save()
            logger.info(f"Cart for user {user.id} was cleaned of stale product references.")
        
        return jsonify({
            'success': True,
            'message': 'Cart retrieved successfully' + (' and updated.' if cart_was_modified else ''),
            'cart': cart_item_details_for_frontend 
        }), 200
        
    except DoesNotExist: # For User.objects.get(id=current_user_id)
        return jsonify({'success': False, 'message': 'User not found'}), 404
    except Exception as e:
        logger.error(f"Error in get_cart_items for user {request.current_user.get('user_id') if request.current_user else 'Unknown'}: {str(e)}")
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500


@cart_bp.route('/delete', methods=['POST'])
@token_required
def remove_item_from_cart():
    """
    Remove a specific product from user's cart.
    Expected JSON payload:
    {
        "productId": "product_object_id"
    }
    """
    try:
        current_user_id = request.current_user.get('user_id')
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        product_id = data.get('productId')
        if not product_id:
            return jsonify({'success': False, 'message': 'Product ID is required'}), 400

        user = User.objects.get(id=current_user_id)
        product_to_remove = Product.objects.get(id=product_id)
        
        # Check if product is in cart. user.cart contains Product references.
        # To remove, we find the matching product *object* in the list.
        # A direct product_to_remove in user.cart check might not work if it's a different instance.
        # It's safer to iterate or use pull operation if product_id is sufficient.
        
        found_in_cart = False
        temp_cart = []
        for item_in_cart in user.cart:
            if item_in_cart.id == product_to_remove.id:
                found_in_cart = True
            else:
                temp_cart.append(item_in_cart)
        
        if not found_in_cart:
            return jsonify({'success': False, 'message': 'Product is not in your cart'}), 400

        user.cart = temp_cart # Assign the new list without the removed item
        
        # Restore product quantity (since adding to cart decremented it)
        product_to_remove.quantity += 1
        
        product_to_remove.save()
        user.save()

        logger.info(f"User {current_user_id} removed product {product_id} from cart. New product quantity: {product_to_remove.quantity}")
        
        return jsonify({
            'success': True,
            'message': f'{product_to_remove.name} removed from cart successfully',
            'data': {
                'cart_count': len(user.cart)
            }
        }), 200
        
    except DoesNotExist:
        return jsonify({'success': False, 'message': 'User or Product not found'}), 404
    except ValidationError:
        return jsonify({'success': False, 'message': 'Invalid Product ID format'}), 400
    except Exception as e:
        logger.error(f"Error in remove_item_from_cart for user {request.current_user.get('user_id') if request.current_user else 'Unknown'}: {str(e)}")
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500


@cart_bp.route('/clear', methods=['DELETE'])
@token_required
def clear_entire_cart():
    """
    Clear all items from user's cart and restore their quantities.
    """
    try:
        current_user_id = request.current_user.get('user_id')
        user = User.objects.get(id=current_user_id)
        
        if not user.cart:
             return jsonify({'success': True, 'message': 'Cart is already empty', 'data': {'cart_count': 0}}), 200

        products_to_update_qty = []
        for product_in_cart in user.cart:
            try:
                # Fetch product to ensure it exists and to update it
                product = Product.objects.get(id=product_in_cart.id)
                product.quantity += 1
                products_to_update_qty.append(product)
            except DoesNotExist:
                logger.warning(f"Product ID {product_in_cart.id} from user {user.id}'s cart not found in DB during cart clear. Cannot restore quantity.")
            except Exception as e_prod:
                logger.error(f"Error finding/updating product {product_in_cart.id} during cart clear for user {user.id}: {str(e_prod)}")
        
        # Bulk save updated products if your MongoEngine version supports it, or save one by one
        for p in products_to_update_qty:
            p.save()

        logger.info(f"User {current_user_id} cleared cart. Restored quantities for {len(products_to_update_qty)} products.")

        user.cart = []
        user.save()
        
        return jsonify({
            'success': True,
            'message': 'Cart cleared successfully',
            'data': {
                'cart_count': 0
            }
        }), 200
        
    except DoesNotExist: # For User.objects.get(id=current_user_id)
        return jsonify({'success': False, 'message': 'User not found'}), 404
    except Exception as e:
        logger.error(f"Error in clear_entire_cart for user {request.current_user.get('user_id') if request.current_user else 'Unknown'}: {str(e)}")
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500