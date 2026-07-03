from sqlalchemy.orm import Session
from app.models.dining import DiningItem

MOCK_MENU = [
    {"hall": "Appalachian", "meal_period": "Breakfast", "item_name": "Scrambled Eggs", "category": "Protein"},
    {"hall": "Appalachian", "meal_period": "Breakfast", "item_name": "Pancakes", "category": "Grains"},
    {"hall": "Appalachian", "meal_period": "Breakfast", "item_name": "Oatmeal", "category": "Grains"},
    {"hall": "Appalachian", "meal_period": "Lunch", "item_name": "Grilled Chicken Sandwich", "category": "Protein"},
    {"hall": "Appalachian", "meal_period": "Lunch", "item_name": "Caesar Salad", "category": "Vegetables"},
    {"hall": "Appalachian", "meal_period": "Lunch", "item_name": "Tomato Soup", "category": "Soup"},
    {"hall": "Appalachian", "meal_period": "Dinner", "item_name": "Pasta Primavera", "category": "Pasta"},
    {"hall": "Appalachian", "meal_period": "Dinner", "item_name": "Roasted Vegetables", "category": "Vegetables"},
    {"hall": "C4", "meal_period": "Breakfast", "item_name": "Bagels", "category": "Grains"},
    {"hall": "C4", "meal_period": "Breakfast", "item_name": "Yogurt Parfait", "category": "Dairy"},
    {"hall": "C4", "meal_period": "Lunch", "item_name": "Halal Chicken Bowl", "category": "Protein"},
    {"hall": "C4", "meal_period": "Lunch", "item_name": "Veggie Wrap", "category": "Vegetables"},
    {"hall": "C4", "meal_period": "Dinner", "item_name": "Stir Fry", "category": "Protein"},
    {"hall": "C4", "meal_period": "Dinner", "item_name": "Brown Rice", "category": "Grains"},
]

def scrape_dining(db: Session):
    db.query(DiningItem).delete()
    items = []
    for d in MOCK_MENU:
        item = DiningItem(**d)
        db.add(item)
        items.append(item)
    db.commit()
    return items
