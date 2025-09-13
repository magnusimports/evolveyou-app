class ShoppingList:
    def __init__(self, user_id, name, items=None, created_at=None, updated_at=None):
        self.user_id = user_id
        self.name = name
        self.items = items if items is not None else []
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "items": self.items,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @staticmethod
    def from_dict(source):
        return ShoppingList(
            source["user_id"],
            source["name"],
            source.get("items"),
            source.get("created_at"),
            source.get("updated_at")
        )

class ShoppingListItem:
    def __init__(self, product_id, product_name, quantity, unit, price=None, supermarket_id=None, purchased=False):
        self.product_id = product_id
        self.product_name = product_name
        self.quantity = quantity
        self.unit = unit
        self.price = price
        self.supermarket_id = supermarket_id
        self.purchased = purchased

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "product_name": self.product_name,
            "quantity": self.quantity,
            "unit": self.unit,
            "price": self.price,
            "supermarket_id": self.supermarket_id,
            "purchased": self.purchased
        }

    @staticmethod
    def from_dict(source):
        return ShoppingListItem(
            source["product_id"],
            source["product_name"],
            source["quantity"],
            source["unit"],
            source.get("price"),
            source.get("supermarket_id"),
            source.get("purchased", False)
        )


