import os
import json
import logging

import httpx
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from backend.services.cache import get_cache, set_cache
from backend.database.models import Product, Order, OrderItem

logger = logging.getLogger(__name__)

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "sk-or-v1-test-key-free-mode")
if OPENROUTER_API_KEY.startswith("sk-or-v1-test"):
    logger.warning(
        "OPENROUTER_API_KEY is not configured. AI assistant is running in fallback test mode. "
        "Set OPENROUTER_API_KEY in your environment to enable real OpenRouter responses."
    )
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-chat:free")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
AI_ENABLE_CRUD = os.getenv("AI_ENABLE_CRUD", "true").lower() == "true"
ALLOWED_AI_ACTIONS = {"create_product", "update_product", "create_order"}


def execute_ai_action(action_type: str, data: dict, db: Session) -> dict:
    """Execute AI-generated action on the database."""
    if not AI_ENABLE_CRUD:
        return {"status": "error", "message": "CRUD operations disabled"}
    
    try:
        if action_type == "create_product":
            # Safe coercion of numeric fields
            try:
                quantity = int(data.get("quantity", 0))
            except Exception:
                quantity = 0
            try:
                price = float(data.get("price", 0.0))
            except Exception:
                price = 0.0
            try:
                reorder_level = int(data.get("reorder_level", 10))
            except Exception:
                reorder_level = 10

            product = Product(
                name=data.get("name", "AI Generated Product"),
                sku=data.get("sku", f"AI-{os.urandom(4).hex()}"),
                quantity=quantity,
                price=price,
                reorder_level=reorder_level,
            )
            if "category_id" in data:
                try:
                    product.category_id = int(data["category_id"])
                except Exception:
                    pass
            if "supplier_id" in data:
                try:
                    product.supplier_id = int(data["supplier_id"])
                except Exception:
                    pass
            
            db.add(product)
            db.commit()
            db.refresh(product)
            return {"status": "success", "type": "product_created", "id": product.id, "name": product.name}
        
        elif action_type == "update_product":
            product_id = data.get("id") or data.get("product_id")
            try:
                product_id = int(product_id)
            except Exception:
                return {"status": "error", "message": "Invalid product id"}
            product = db.query(Product).filter(Product.id == product_id).first()
            if not product:
                return {"status": "error", "message": "Product not found"}
            
            if "name" in data:
                product.name = data["name"]
            if "quantity" in data:
                try:
                    product.quantity = int(data["quantity"])
                except Exception:
                    pass
            if "price" in data:
                try:
                    product.price = float(data["price"])
                except Exception:
                    pass
            if "reorder_level" in data:
                try:
                    product.reorder_level = int(data["reorder_level"])
                except Exception:
                    pass
            
            db.commit()
            db.refresh(product)
            return {"status": "success", "type": "product_updated", "id": product.id}
        
        elif action_type == "create_order":
            try:
                total_amount = float(data.get("total_amount", 0.0))
            except Exception:
                total_amount = 0.0
            order = Order(
                customer_name=data.get("customer_name", "AI Order"),
                total_amount=total_amount,
                status=data.get("status", "pending"),
            )
            db.add(order)
            db.flush()
            
            # Add order items
            for item in data.get("items", []):
                try:
                    pid = int(item.get("product_id"))
                except Exception:
                    continue
                product = db.query(Product).filter(Product.id == pid).first()
                if product:
                    try:
                        qty = int(item.get("quantity", 1))
                    except Exception:
                        qty = 1
                    try:
                        price = float(item.get("price", product.price))
                    except Exception:
                        price = product.price
                    order_item = OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        quantity=qty,
                        price=price,
                    )
                    db.add(order_item)
                    product.quantity = max(0, product.quantity - qty)
            
            db.commit()
            db.refresh(order)
            return {"status": "success", "type": "order_created", "id": order.id}
        
        else:
            return {"status": "error", "message": f"Unknown action type: {action_type}"}
    
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}


def generate_ai_insight(prompt: str, db: Session = None) -> tuple[str, str | None]:
    # Return test mode response if no API key
    if OPENROUTER_API_KEY.startswith("sk-or-v1-test"):
        return (
            f"AI Test Mode Response to: '{prompt}'\n\n"
            "Capabilities Available:\n"
            "- Create products\n"
            "- Update product quantities and pricing\n"
            "- Create orders\n"
            "- Generate inventory insights\n\n"
            "Try asking me to create a product or place an order!",
            "AI CRUD operations enabled (test mode)"
        )

    cached = get_cache(f"ai_insight:{prompt}")
    if cached:
        insight, recommendation = cached.split("||RECOMMEND||", 1)
        return insight, recommendation if recommendation != "None" else None

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": "You are an AI inventory assistant. You can help with:\n1. Creating products\n2. Updating product quantities and prices\n3. Creating and managing orders\n4. Providing inventory insights.\n\nWhen users ask you to create or modify items, respond with JSON in your message like:\n{\"action\": \"create_product\", \"name\": \"Product Name\", \"sku\": \"SKU\", \"quantity\": 10, \"price\": 29.99}\nor\n{\"action\": \"create_order\", \"customer_name\": \"Customer\", \"items\": [{\"product_id\": 1, \"quantity\": 5}]}\n\nAlways provide human-readable explanations first, then the JSON commands."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 1000,
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(OPENROUTER_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        message = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        text = message.strip()
        
        # Try to execute any JSON commands in the response
        if db and AI_ENABLE_CRUD:
            try:
                import re
                json_matches = re.findall(r'\{[^{}]*"action"[^{}]*\}', text, flags=re.DOTALL)
                for json_str in json_matches:
                    try:
                        action_data = json.loads(json_str)
                        action = action_data.get("action", "")
                        if action not in ALLOWED_AI_ACTIONS:
                            logger.warning("Ignoring disallowed AI action: %s", action)
                            continue
                        # Basic sanitization and safe coercion of numeric fields
                        if action in ("create_product", "update_product"):
                            if "quantity" in action_data:
                                try:
                                    action_data["quantity"] = int(action_data["quantity"])
                                except Exception:
                                    action_data["quantity"] = 0
                            if "price" in action_data:
                                try:
                                    action_data["price"] = float(action_data["price"])
                                except Exception:
                                    action_data["price"] = 0.0
                            if "reorder_level" in action_data:
                                try:
                                    action_data["reorder_level"] = int(action_data["reorder_level"])
                                except Exception:
                                    action_data["reorder_level"] = 10
                            if "id" in action_data:
                                try:
                                    action_data["id"] = int(action_data["id"])
                                except Exception:
                                    pass
                        if action == "create_order":
                            items = action_data.get("items", [])
                            sanitized_items = []
                            for item in items:
                                try:
                                    pid = int(item.get("product_id"))
                                    qty = int(item.get("quantity", 1))
                                    price = float(item.get("price", 0.0))
                                    sanitized_items.append({"product_id": pid, "quantity": qty, "price": price})
                                except Exception:
                                    continue
                            action_data["items"] = sanitized_items
                        result = execute_ai_action(action, action_data, db)
                        if result.get("status") == "success":
                            text += f"\n✓ {result['type'].replace('_', ' ').title()}: {result.get('name', result.get('id'))}"
                    except json.JSONDecodeError:
                        logger.debug("Failed to decode JSON from AI output: %s", json_str)
                    except Exception as e:
                        logger.exception("Error processing AI action: %s", e)
            except:
                pass
        
        if "Recommendation:" in text:
            insight, recommendation = text.split("Recommendation:", 1)
            recommendation = recommendation.strip()
        else:
            insight, recommendation = text, None

        cache_value = f"{insight}||RECOMMEND||{recommendation or 'None'}"
        set_cache(f"ai_insight:{prompt}", cache_value, ttl=300)
        return insight, recommendation
    
    except Exception as e:
        return f"Error generating insight: {str(e)}", "Please check your API key configuration"
