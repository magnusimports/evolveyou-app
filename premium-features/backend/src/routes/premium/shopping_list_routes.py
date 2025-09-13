from flask import Blueprint, request, jsonify
from datetime import datetime
from src.services.firebase_service import FirebaseService
from src.services.google_maps_service import GoogleMapsService
from src.services.gemini_ai_service import GeminiAIService
from src.services.supermarket_api_service import SupermarketAPIService
from src.models.shopping_list_model import ShoppingList, ShoppingListItem

shopping_list_bp = Blueprint("shopping_list_bp", __name__)

firebase_service = FirebaseService()
google_maps_service = GoogleMapsService()
gemini_ai_service = GeminiAIService()
supermarket_api_service = SupermarketAPIService()

@shopping_list_bp.route("/lists", methods=["POST"])
def create_shopping_list():
    data = request.get_json()
    user_id = data.get("user_id")
    name = data.get("name")

    if not user_id or not name:
        return jsonify({"error": "User ID and list name are required"}), 400

    new_list = ShoppingList(user_id=user_id, name=name, created_at=datetime.now(), updated_at=datetime.now())
    doc_ref, _ = firebase_service.add_document("shopping_lists", new_list.to_dict())
    return jsonify({"id": doc_ref.id, "message": "Shopping list created successfully"}), 201

@shopping_list_bp.route("/lists/<string:list_id>", methods=["GET"])
def get_shopping_list(list_id):
    doc = firebase_service.get_document("shopping_lists", list_id)
    if doc.exists:
        return jsonify(doc.to_dict()), 200
    return jsonify({"error": "Shopping list not found"}), 404

@shopping_list_bp.route("/lists/<string:list_id>", methods=["PUT"])
def update_shopping_list(list_id):
    data = request.get_json()
    doc = firebase_service.get_document("shopping_lists", list_id)
    if not doc.exists:
        return jsonify({"error": "Shopping list not found"}), 404
    
    updated_data = {"updated_at": datetime.now()}
    if "name" in data: updated_data["name"] = data["name"]
    if "items" in data: updated_data["items"] = data["items"]

    firebase_service.update_document("shopping_lists", list_id, updated_data)
    return jsonify({"message": "Shopping list updated successfully"}), 200

@shopping_list_bp.route("/lists/<string:list_id>", methods=["DELETE"])
def delete_shopping_list(list_id):
    firebase_service.delete_document("shopping_lists", list_id)
    return jsonify({"message": "Shopping list deleted successfully"}), 204

@shopping_list_bp.route("/suggestions", methods=["POST"])
def get_suggestions():
    data = request.get_json()
    user_id = data.get("user_id")
    current_list = data.get("current_list", [])

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    user_preferences_doc = firebase_service.get_user_preferences(user_id)
    user_preferences = user_preferences_doc.to_dict() if user_preferences_doc.exists else {}

    # Mock purchase history for now, in a real app this would come from Firebase
    purchase_history = ["Arroz", "Feijão", "Leite"]

    suggestions_text = gemini_ai_service.generate_shopping_list_suggestions(
        user_preferences=user_preferences,
        purchase_history=purchase_history,
        current_list=current_list
    )
    
    # Processar a string de sugestões em uma lista de itens
    suggestions = [item.strip() for item in suggestions_text.split(",") if item.strip()]

    return jsonify({"suggestions": suggestions}), 200

@shopping_list_bp.route("/supermarkets/nearby", methods=["GET"])
def get_nearby_supermarkets():
    latitude = request.args.get("latitude", type=float)
    longitude = request.args.get("longitude", type=float)
    radius = request.args.get("radius", type=int, default=5000)

    if not latitude or not longitude:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    supermarkets = google_maps_service.find_nearby_supermarkets(latitude, longitude, radius)
    return jsonify({"supermarkets": supermarkets}), 200

@shopping_list_bp.route("/supermarkets/<string:supermarket_id>/products", methods=["GET"])
def get_supermarket_products(supermarket_id):
    products = supermarket_api_service.get_products_by_supermarket(supermarket_id)
    return jsonify({"products": products}), 200

@shopping_list_bp.route("/products/search", methods=["GET"])
def search_products():
    query = request.args.get("query")
    supermarket_id = request.args.get("supermarket_id")

    if not query:
        return jsonify({"error": "Search query is required"}), 400

    products = supermarket_api_service.search_products(query, supermarket_id)
    return jsonify({"products": products}), 200


