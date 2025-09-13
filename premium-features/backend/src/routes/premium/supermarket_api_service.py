class SupermarketAPIService:
    def __init__(self):
        # Este é um serviço mockado para simular a integração com APIs de supermercados.
        # Em um cenário real, aqui haveria lógica para interagir com APIs de supermercados reais.
        self.mock_products = {
            "supermercado_a": [
                {"id": "prod1", "name": "Arroz 5kg", "price": 25.00, "stock": 100, "category": "Grãos"},
                {"id": "prod2", "name": "Feijão Carioca 1kg", "price": 8.50, "stock": 50, "category": "Grãos"},
                {"id": "prod3", "name": "Leite Integral 1L", "price": 4.20, "stock": 200, "category": "Laticínios"},
                {"id": "prod4", "name": "Pão de Forma", "price": 6.90, "stock": 80, "category": "Panificação"},
                {"id": "prod5", "name": "Maçã (kg)", "price": 7.00, "stock": 150, "category": "Hortifruti"},
            ],
            "supermercado_b": [
                {"id": "prod6", "name": "Arroz Branco 5kg", "price": 24.50, "stock": 120, "category": "Grãos"},
                {"id": "prod7", "name": "Feijão Preto 1kg", "price": 9.00, "stock": 60, "category": "Grãos"},
                {"id": "prod8", "name": "Leite Desnatado 1L", "price": 4.50, "stock": 180, "category": "Laticínios"},
                {"id": "prod9", "name": "Pão Integral", "price": 7.50, "stock": 70, "category": "Panificação"},
                {"id": "prod10", "name": "Banana (kg)", "price": 5.50, "stock": 200, "category": "Hortifruti"},
            ]
        }

    def get_products_by_supermarket(self, supermarket_id):
        # Retorna produtos mockados para um dado supermercado
        return self.mock_products.get(supermarket_id, [])

    def search_products(self, query, supermarket_id=None):
        results = []
        if supermarket_id and supermarket_id in self.mock_products:
            products_to_search = self.mock_products[supermarket_id]
        else:
            products_to_search = []
            for sm_id in self.mock_products:
                products_to_search.extend(self.mock_products[sm_id])
        
        for product in products_to_search:
            if query.lower() in product["name"].lower():
                results.append(product)
        return results

    def get_product_price(self, product_id, supermarket_id):
        if supermarket_id in self.mock_products:
            for product in self.mock_products[supermarket_id]:
                if product["id"] == product_id:
                    return product["price"]
        return None


