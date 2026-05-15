import sqlite3
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class InventoryItem:
    id: int
    name: str
    category: str
    quantity: int
    location: str
    notes: Optional[str] = None


class InventoryManager:
    def __init__(self, db_path: str = "inventory.db"):
        self.db_path = db_path
        self._create_table()

    def _connect(self):
        return sqlite3.connect(self.db_path)

    def _create_table(self):
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS inventory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    location TEXT NOT NULL,
                    notes TEXT
                )
                """
            )
            conn.commit()

    def add_item(self, name: str, category: str, quantity: int, location: str, notes: str = "") -> int:
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO inventory (name, category, quantity, location, notes) VALUES (?, ?, ?, ?, ?)",
                (name, category, quantity, location, notes),
            )
            conn.commit()
            return cursor.lastrowid

    def update_item(self, item_id: int, quantity: Optional[int] = None, location: Optional[str] = None, notes: Optional[str] = None) -> bool:
        fields: List[str] = []
        values: List[Any] = []
        if quantity is not None:
            fields.append("quantity = ?")
            values.append(quantity)
        if location is not None:
            fields.append("location = ?")
            values.append(location)
        if notes is not None:
            fields.append("notes = ?")
            values.append(notes)

        if not fields:
            return False

        values.append(item_id)
        query = f"UPDATE inventory SET {', '.join(fields)} WHERE id = ?"
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute(query, values)
            conn.commit()
            return cursor.rowcount > 0

    def remove_item(self, item_id: int) -> bool:
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM inventory WHERE id = ?", (item_id,))
            conn.commit()
            return cursor.rowcount > 0

    def list_items(self) -> List[InventoryItem]:
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, category, quantity, location, notes FROM inventory ORDER BY id")
            rows = cursor.fetchall()
            return [InventoryItem(*row) for row in rows]

    def search_items(self, query: str) -> List[InventoryItem]:
        with self._connect() as conn:
            cursor = conn.cursor()
            query_pattern = f"%{query}%"
            cursor.execute(
                "SELECT id, name, category, quantity, location, notes FROM inventory WHERE name LIKE ? OR category LIKE ? OR location LIKE ? OR notes LIKE ?",
                (query_pattern, query_pattern, query_pattern, query_pattern),
            )
            rows = cursor.fetchall()
            return [InventoryItem(*row) for row in rows]

    def get_item(self, item_id: int) -> Optional[InventoryItem]:
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, category, quantity, location, notes FROM inventory WHERE id = ?", (item_id,))
            row = cursor.fetchone()
            return InventoryItem(*row) if row else None

    def inventory_summary(self) -> Dict[str, Any]:
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*), SUM(quantity) FROM inventory")
            total_items, total_quantity = cursor.fetchone()
            cursor.execute("SELECT category, SUM(quantity) FROM inventory GROUP BY category")
            by_category = {row[0]: row[1] for row in cursor.fetchall()}
            return {
                "total_items": total_items,
                "total_quantity": total_quantity or 0,
                "quantity_by_category": by_category,
            }
