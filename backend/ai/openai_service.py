import os
import json

import httpx
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from backend.services.cache import get_cache, set_cache
from backend.database.models import Product, Order, OrderItem

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "sk-or-v1-test-key-free-mode")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-chat:free")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
AI_ENABLE_CRUD = os.getenv("AI_ENABLE_CRUD", "true").lower() == "true"


def execute_ai_action(action_type: str, data: dict, db: Session) -> dict:
    """Execute AI-generated action on the database."""
    if not AI_ENABLE_CRUD:
        return {"status": "error", "message": "CRUD operations disabled"}
    
    try:
        if action_type == "create_product":
            product = Product(
                name=data.get("name", "AI Generated Product"),
                sku=data.get("sku", f"AI-{os.urandom(4).hex()}"),
                quantity=int(data.get("quantity", 0)),
                price=float(data.get("price", 0.0)),
                reorder_level=int(data.get("reorder_level", 10)),
            )
            if "category_id" in data:
                product.category_id = int(data["category_id"])
            if "supplier_id" in data:
                product.supplier_id = int(data["supplier_id"])
            
            db.add(product)
            db.commit()
            db.refresh(product)
            return {"status": "success", "type": "product_created", "id": product.id, "name": product.name}
        
        elif action_type == "update_product":
            product_id = data.get("id") or data.get("product_id")
            product = db.query(Product).filter(Product.id == product_id).first()
            if not product:
                return {"status": "error", "message": "Product not found"}
            
            if "name" in data:
                product.name = data["name"]
            if "quantity" in data:
                product.quantity = int(data["quantity"])
            if "price" in data:
                product.price = float(data["price"])
            if "reorder_level" in data:
                product.reorder_level = int(data["reorder_level"])
            
            db.commit()
            db.refresh(product)
            return {"status": "success", "type": "product_updated", "id": product.id}
        
        elif action_type == "create_order":
            order = Order(
                customer_name=data.get("customer_name", "AI Order"),
                total_amount=float(data.get("total_amount", 0.0)),
                status=data.get("status", "pending"),
            )
            db.add(order)
            db.flush()
            
            # Add order items
            for item in data.get("items", []):
                product = db.query(Product).filter(Product.id == item.get("product_id")).first()
                if product:
                    order_item = OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        quantity=int(item.get("quantity", 1)),
                        price=float(item.get("price", product.price)),
                    )
                    db.add(order_item)
                    product.quantity = max(0, product.quantity - int(item.get("quantity", 1)))
            
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
                json_matches = re.findall(r'\{[^{}]*"action"[^{}]*\}', text)
                for json_str in json_matches:
                    try:
                        action_data = json.loads(json_str)
                        action_type = action_data.get("action", "").replace("_", "")
                        result = execute_ai_action(action_type, action_data, db)
                        if result["status"] == "success":
                            text += f"\n✓ {result['type'].replace('_', ' ').title()}: {result.get('name', result.get('id'))}"
                    except:
                        pass
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
