import os
from typing import List

from dotenv import load_dotenv
from langchain.agents import Tool, initialize_agent
from langchain.llms import OpenAI

from inventory import InventoryManager

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise EnvironmentError("OPENAI_API_KEY is not set in the environment. Copy .env.example to .env and add your key.")


def format_inventory(items: List[dict]) -> str:
    if not items:
        return "No items found."
    lines = ["ID | Name | Category | Quantity | Location | Notes"]
    for item in items:
        lines.append(f"{item['id']} | {item['name']} | {item['category']} | {item['quantity']} | {item['location']} | {item.get('notes', '')}")
    return "\n".join(lines)


def create_ai_agent(inventory_manager: InventoryManager):
    llm = OpenAI(temperature=0.2, openai_api_key=OPENAI_API_KEY)

    def list_inventory() -> str:
        items = [item.__dict__ for item in inventory_manager.list_items()]
        return format_inventory(items)

    def search_inventory(query: str) -> str:
        items = [item.__dict__ for item in inventory_manager.search_items(query)]
        return format_inventory(items)

    def add_inventory(name: str, category: str, quantity: str, location: str, notes: str = "") -> str:
        try:
            qty = int(quantity)
        except ValueError:
            return "Quantity must be a whole number."
        item_id = inventory_manager.add_item(name, category, qty, location, notes)
        return f"Item added with id {item_id}."

    def update_inventory(item_id: str, quantity: str = None, location: str = None, notes: str = None) -> str:
        try:
            item_id_int = int(item_id)
        except ValueError:
            return "Item ID must be a number."
        quantity_int = None
        if quantity is not None and quantity.strip() != "":
            try:
                quantity_int = int(quantity)
            except ValueError:
                return "Quantity must be a whole number."
        updated = inventory_manager.update_item(item_id_int, quantity_int, location or None, notes or None)
        return "Item updated." if updated else "Item not found or no changes applied."

    def remove_inventory(item_id: str) -> str:
        try:
            item_id_int = int(item_id)
        except ValueError:
            return "Item ID must be a number."
        removed = inventory_manager.remove_item(item_id_int)
        return "Item removed." if removed else "Item not found."

    def inventory_report() -> str:
        summary = inventory_manager.inventory_summary()
        report_lines = [
            f"Total distinct items: {summary['total_items']}",
            f"Total quantity across inventory: {summary['total_quantity']}",
            "Quantity by category:",
        ]
        for category, qty in summary["quantity_by_category"].items():
            report_lines.append(f"  - {category}: {qty}")
        return "\n".join(report_lines)

    tools = [
        Tool(
            name="list_inventory",
            func=list_inventory,
            description="List all inventory items with their id, name, category, quantity, location, and notes.",
        ),
        Tool(
            name="search_inventory",
            func=search_inventory,
            description="Search inventory items by name, category, location, or notes.",
        ),
        Tool(
            name="add_inventory",
            func=add_inventory,
            description="Add a new inventory item. Provide name, category, quantity, location, and optional notes.",
        ),
        Tool(
            name="update_inventory",
            func=update_inventory,
            description="Update an existing item by id. You can change quantity, location, and notes.",
        ),
        Tool(
            name="remove_inventory",
            func=remove_inventory,
            description="Remove an inventory item by its id.",
        ),
        Tool(
            name="inventory_report",
            func=inventory_report,
            description="Return a quick summary report of total inventory totals and category breakdown.",
        ),
    ]

    return initialize_agent(
        tools,
        llm,
        agent="zero-shot-react-description",
        verbose=False,
        max_iterations=4,
    )
