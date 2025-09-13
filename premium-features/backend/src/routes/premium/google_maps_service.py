import requests
import os

class GoogleMapsService:
    def __init__(self):
        self.api_key = os.environ.get("GOOGLE_MAPS_API_KEY", "AIzaSyD-PuRkqWjiz2Sbv0jLVq0b9NOp9kIFwdI") # Usando a chave fornecida no contexto
        self.places_aggregate_base_url = "https://places.googleapis.com/v1/places:aggregate"

    def find_nearby_supermarkets(self, latitude, longitude, radius=5000, page_size=10):
        # A API Places Aggregate é mais complexa e requer um corpo de requisição POST
        # Para simplificar, vamos usar a API Places Search (Find Nearby Places) que é mais direta para este caso de uso
        # A Places Aggregate é mais para insights e contagens, não para listar lugares específicos diretamente de forma simples.
        # Para listar supermercados próximos, a API Places API (New) ou a antiga Places API (Find Place) são mais adequadas.
        # Vamos usar a API Places API (New) - Search Nearby para listar supermercados.
        
        # URL da API Places API (New) - Search Nearby
        search_nearby_url = "https://places.googleapis.com/v1/places:searchNearby"
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount"
        }
        
        data = {
            "includedTypes": ["supermarket"],
            "maxResultCount": page_size,
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": latitude,
                        "longitude": longitude
                    },
                    "radius": radius # raio em metros
                }
            }
        }
        
        try:
            response = requests.post(search_nearby_url, headers=headers, json=data)
            response.raise_for_status() # Levanta um erro para códigos de status HTTP ruins (4xx ou 5xx)
            return response.json().get("places", [])
        except requests.exceptions.RequestException as e:
            print(f"Erro ao buscar supermercados próximos: {e}")
            return []

    # Método placeholder para buscar detalhes de um supermercado, se necessário
    def get_supermarket_details(self, place_id):
        # Implementar se houver necessidade de mais detalhes de um supermercado específico
        pass


