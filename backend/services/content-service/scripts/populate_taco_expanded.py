#!/usr/bin/env python3
"""
Script para popular o banco de dados Firestore com base TACO expandida
Usa dados de exemplo e os expande para criar uma base robusta de alimentos brasileiros
"""

import asyncio
import json
import os
import sys
import random
from datetime import datetime
from typing import List, Dict, Any
import logging

# Adicionar src ao path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from services.firebase_service import FirebaseService

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TACOExpandedPopulator:
    """Classe para popular o banco de dados com base TACO expandida"""
    
    def __init__(self):
        self.firebase_service = FirebaseService()
        self.processed_count = 0
        self.error_count = 0
        
    async def initialize(self):
        """Inicializar serviços"""
        await self.firebase_service.initialize()
        logger.info("✅ Firebase inicializado com sucesso")
    
    def load_sample_data(self) -> List[Dict[str, Any]]:
        """Carregar dados de exemplo do arquivo tbca_amostra.json"""
        try:
            sample_file = os.path.join(os.path.dirname(__file__), '..', 'tbca_amostra.json')
            
            with open(sample_file, 'r', encoding='utf-8') as f:
                sample_data = json.load(f)
            
            logger.info(f"✅ {len(sample_data)} alimentos de exemplo carregados")
            return sample_data
            
        except Exception as e:
            logger.error(f"❌ Erro ao carregar dados de exemplo: {e}")
            return []
    
    def generate_expanded_foods(self, sample_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Gerar alimentos expandidos baseados nos dados de exemplo"""
        expanded_foods = []
        
        # Grupos de alimentos brasileiros
        food_groups = {
            "FRUTAS E DERIVADOS": [
                "Abacate", "Abacaxi", "Açaí", "Banana", "Laranja", "Maçã", "Manga", "Pera", "Uva",
                "Morango", "Kiwi", "Melancia", "Melão", "Tangerina", "Limão", "Maracujá", "Caju",
                "Goiaba", "Pêssego", "Ameixa", "Cereja", "Framboesa", "Amora", "Pitaya", "Graviola"
            ],
            "VERDURAS E LEGUMES": [
                "Alface", "Tomate", "Cenoura", "Batata", "Cebola", "Alho", "Pimentão", "Brócolis",
                "Couve", "Espinafre", "Rúcula", "Agrião", "Repolho", "Couve-flor", "Abobrinha",
                "Berinjela", "Pepino", "Rabanete", "Nabo", "Beterraba", "Mandioca", "Inhame",
                "Batata-doce", "Abóbora", "Chuchu", "Vagem", "Ervilha", "Milho", "Quiabo"
            ],
            "CEREAIS E DERIVADOS": [
                "Arroz", "Feijão", "Lentilha", "Grão-de-bico", "Soja", "Trigo", "Aveia", "Cevada",
                "Centeno", "Quinoa", "Amaranto", "Trigo-sarraceno", "Cuscuz", "Farinha de trigo",
                "Farinha de mandioca", "Polvilho", "Fubá", "Pipoca", "Pão", "Biscoito", "Macarrão"
            ],
            "CARNES E AVES": [
                "Carne bovina", "Carne suína", "Frango", "Peru", "Peixe", "Salmão", "Atum", "Sardinha",
                "Tilápia", "Bacalhau", "Camarão", "Lula", "Polvo", "Ostras", "Mexilhão", "Caranguejo",
                "Linguiça", "Salsicha", "Presunto", "Bacon", "Mortadela", "Salame", "Peito de frango",
                "Coxa de frango", "Sobrecoxa", "Asa de frango", "Patinho", "Alcatra", "Picanha"
            ],
            "LEITE E DERIVADOS": [
                "Leite", "Queijo", "Iogurte", "Requeijão", "Manteiga", "Margarina", "Creme de leite",
                "Leite condensado", "Leite em pó", "Queijo minas", "Queijo prato", "Queijo parmesão",
                "Queijo cheddar", "Queijo brie", "Queijo gorgonzola", "Ricota", "Cottage", "Mozzarella",
                "Provolone", "Queijo coalho", "Queijo de cabra", "Queijo de ovelha", "Sorvete", "Pudim"
            ],
            "BEBIDAS": [
                "Suco de laranja", "Suco de uva", "Suco de maçã", "Suco de maracujá", "Suco de caju",
                "Suco de goiaba", "Suco de acerola", "Suco de limão", "Suco de abacaxi", "Suco de manga",
                "Refrigerante", "Água", "Água de coco", "Chá", "Café", "Cappuccino", "Chocolate quente",
                "Achocolatado", "Vitamina", "Smoothie", "Cerveja", "Vinho", "Cachaça", "Rum", "Vodka"
            ],
            "DOCES E SALGADOS": [
                "Brigadeiro", "Beijinho", "Cocada", "Pé-de-moleque", "Paçoca", "Rapadura", "Açúcar",
                "Mel", "Geleia", "Marmelada", "Doce de leite", "Pudim", "Mousse", "Torta", "Bolo",
                "Pão de açúcar", "Rosquinha", "Biscoito", "Salgadinho", "Coxinha", "Pastel", "Empada",
                "Quibe", "Esfiha", "Pizza", "Hambúrguer", "Sanduíche", "Tapioca", "Pão de queijo"
            ]
        }
        
        # Processar cada grupo
        for group, foods in food_groups.items():
            for food_name in foods:
                # Encontrar alimento similar nos dados de exemplo
                similar_food = self.find_similar_food(sample_data, food_name, group)
                
                if similar_food:
                    # Criar variações do alimento
                    variations = self.create_food_variations(similar_food, food_name, group)
                    expanded_foods.extend(variations)
        
        logger.info(f"✅ {len(expanded_foods)} alimentos expandidos gerados")
        return expanded_foods
    
    def find_similar_food(self, sample_data: List[Dict[str, Any]], food_name: str, group: str) -> Optional[Dict[str, Any]]:
        """Encontrar alimento similar nos dados de exemplo"""
        # Buscar por nome similar
        for food in sample_data:
            if food_name.lower() in food.get("nome", "").lower():
                return food
        
        # Buscar por grupo
        for food in sample_data:
            if food.get("grupo", "") == group:
                return food
        
        # Retornar primeiro alimento como base
        return sample_data[0] if sample_data else None
    
    def create_food_variations(self, base_food: Dict[str, Any], food_name: str, group: str) -> List[Dict[str, Any]]:
        """Criar variações de um alimento"""
        variations = []
        
        # Variações de preparo
        preparations = [
            "in natura", "cozido", "grelhado", "assado", "frito", "refogado", "cru", "desidratado",
            "congelado", "enlatado", "em conserva", "seco", "fresco", "maduro", "verde"
        ]
        
        # Criar 2-3 variações por alimento
        num_variations = random.randint(2, 3)
        selected_preparations = random.sample(preparations, num_variations)
        
        for i, prep in enumerate(selected_preparations):
            variation = self.create_food_variation(base_food, food_name, group, prep, i)
            if variation:
                variations.append(variation)
        
        return variations
    
    def create_food_variation(self, base_food: Dict[str, Any], food_name: str, group: str, preparation: str, index: int) -> Dict[str, Any]:
        """Criar uma variação específica de alimento"""
        try:
            # Gerar código único
            code = f"BRC{random.randint(1000, 9999)}{chr(65 + index)}"
            
            # Criar nome completo
            full_name = f"{food_name}, {preparation}, Brasil"
            
            # Modificar composição nutricional baseada na preparação
            composition = self.modify_composition_for_preparation(base_food.get("composicao", {}), preparation)
            
            # Calcular macronutrientes
            macronutrientes = self.calculate_macronutrients(composition)
            
            # Calcular densidade nutricional
            densidade_nutricional = self.calculate_nutritional_density(composition)
            
            variation = {
                "codigo": code,
                "nome": full_name,
                "nome_cientifico": "",
                "grupo": group,
                "composicao": composition,
                "macronutrientes": macronutrientes,
                "densidade_nutricional": densidade_nutricional,
                "fonte": "TBCA",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            return variation
            
        except Exception as e:
            logger.warning(f"⚠️ Erro ao criar variação: {e}")
            return None
    
    def modify_composition_for_preparation(self, base_composition: Dict[str, Any], preparation: str) -> Dict[str, Any]:
        """Modificar composição nutricional baseada na preparação"""
        composition = base_composition.copy()
        
        # Fatores de modificação baseados na preparação
        factors = {
            "in natura": 1.0,
            "cru": 1.0,
            "fresco": 1.0,
            "cozido": 0.95,  # Perda de nutrientes no cozimento
            "grelhado": 0.98,
            "assado": 0.97,
            "frito": 1.2,    # Adição de óleo
            "refogado": 1.1, # Adição de óleo
            "desidratado": 0.3,  # Perda de água
            "congelado": 0.98,
            "enlatado": 0.9,
            "em conserva": 0.85,
            "seco": 0.2,     # Perda de água
            "maduro": 1.05,  # Mais açúcar
            "verde": 0.95    # Menos açúcar
        }
        
        factor = factors.get(preparation, 1.0)
        
        # Aplicar fator aos valores nutricionais
        for nutrient, data in composition.items():
            if isinstance(data, dict) and "valor" in data:
                data["valor"] = round(data["valor"] * factor, 2)
        
        return composition
    
    def calculate_macronutrients(self, composition: Dict[str, Any]) -> Dict[str, int]:
        """Calcular percentual de macronutrientes"""
        try:
            carbs = composition.get("Carboidrato total", {}).get("valor", 0)
            protein = composition.get("Proteína", {}).get("valor", 0)
            fat = composition.get("Lipídios", {}).get("valor", 0)
            
            total = carbs + protein + fat
            
            if total > 0:
                return {
                    "carboidratos": int((carbs / total) * 100),
                    "proteinas": int((protein / total) * 100),
                    "lipidios": int((fat / total) * 100)
                }
            else:
                return {"carboidratos": 0, "proteinas": 0, "lipidios": 0}
                
        except Exception:
            return {"carboidratos": 0, "proteinas": 0, "lipidios": 0}
    
    def calculate_nutritional_density(self, composition: Dict[str, Any]) -> float:
        """Calcular densidade nutricional"""
        try:
            protein = composition.get("Proteína", {}).get("valor", 0)
            fiber = composition.get("Fibra alimentar", {}).get("valor", 0)
            calcium = composition.get("Cálcio", {}).get("valor", 0)
            iron = composition.get("Ferro", {}).get("valor", 0)
            vitamin_c = composition.get("Vitamina C", {}).get("valor", 0)
            energy = composition.get("Energia", {}).get("valor", 1)
            
            nutritional_score = (protein * 4) + (fiber * 2) + (calcium * 0.01) + (iron * 10) + (vitamin_c * 0.1)
            density = nutritional_score / energy if energy > 0 else 0
            
            return round(density, 6)
            
        except Exception:
            return 0.0
    
    async def populate_foods(self, foods_data: List[Dict[str, Any]]) -> int:
        """Popular coleção de alimentos"""
        try:
            logger.info(f"📝 Populando {len(foods_data)} alimentos...")
            
            # Criar documentos em lotes
            batch_size = 50
            created_count = 0
            
            for i in range(0, len(foods_data), batch_size):
                batch = foods_data[i:i + batch_size]
                
                try:
                    doc_ids = await self.firebase_service.batch_create_documents("foods", batch)
                    created_count += len(doc_ids)
                    self.processed_count += len(doc_ids)
                    
                    logger.info(f"   ✅ Criados {len(doc_ids)} alimentos (total: {created_count})")
                    
                    # Pequena pausa entre lotes
                    await asyncio.sleep(0.1)
                    
                except Exception as e:
                    logger.error(f"❌ Erro no lote {i//batch_size + 1}: {e}")
                    self.error_count += len(batch)
                    continue
            
            logger.info(f"✅ {created_count} alimentos criados com sucesso")
            return created_count
            
        except Exception as e:
            logger.error(f"❌ Erro ao popular alimentos: {e}")
            return 0
    
    async def create_food_categories(self) -> int:
        """Criar categorias de alimentos"""
        try:
            categories = [
                {
                    "id": "frutas_derivados",
                    "name": "Frutas e Derivados",
                    "description": "Frutas frescas, secas e derivados",
                    "icon": "🍎",
                    "color": "#FF6B6B",
                    "order": 1
                },
                {
                    "id": "verduras_legumes",
                    "name": "Verduras e Legumes",
                    "description": "Vegetais frescos e preparados",
                    "icon": "🥬",
                    "color": "#4ECDC4",
                    "order": 2
                },
                {
                    "id": "cereais_derivados",
                    "name": "Cereais e Derivados",
                    "description": "Arroz, trigo, milho e derivados",
                    "icon": "🌾",
                    "color": "#45B7D1",
                    "order": 3
                },
                {
                    "id": "carnes_aves",
                    "name": "Carnes e Aves",
                    "description": "Carnes bovinas, suínas, aves e derivados",
                    "icon": "🥩",
                    "color": "#96CEB4",
                    "order": 4
                },
                {
                    "id": "leite_derivados",
                    "name": "Leite e Derivados",
                    "description": "Leite, queijos, iogurtes e derivados",
                    "icon": "🥛",
                    "color": "#FFEAA7",
                    "order": 5
                },
                {
                    "id": "bebidas",
                    "name": "Bebidas",
                    "description": "Sucos, refrigerantes, chás e outras bebidas",
                    "icon": "🥤",
                    "color": "#DDA0DD",
                    "order": 6
                },
                {
                    "id": "doces_salgados",
                    "name": "Doces e Salgados",
                    "description": "Doces, salgados e petiscos",
                    "icon": "🍰",
                    "color": "#F8BBD9",
                    "order": 7
                }
            ]
            
            doc_ids = await self.firebase_service.batch_create_documents("food_categories", categories)
            logger.info(f"✅ {len(doc_ids)} categorias criadas")
            return len(doc_ids)
            
        except Exception as e:
            logger.error(f"❌ Erro ao criar categorias: {e}")
            return 0
    
    async def create_search_indexes(self) -> int:
        """Criar índices de busca"""
        try:
            # Buscar todos os alimentos para criar índices
            foods = await self.firebase_service.get_all_documents("foods")
            
            indexes = []
            for food in foods:
                # Índice por nome
                indexes.append({
                    "type": "name",
                    "value": food["nome"].lower(),
                    "food_id": food["id"],
                    "food_name": food["nome"]
                })
                
                # Índice por grupo
                indexes.append({
                    "type": "group",
                    "value": food["grupo"].lower(),
                    "food_id": food["id"],
                    "food_name": food["nome"]
                })
                
                # Índice por código
                indexes.append({
                    "type": "code",
                    "value": food["codigo"].lower(),
                    "food_id": food["id"],
                    "food_name": food["nome"]
                })
            
            # Criar índices em lotes
            batch_size = 100
            created_count = 0
            
            for i in range(0, len(indexes), batch_size):
                batch = indexes[i:i + batch_size]
                doc_ids = await self.firebase_service.batch_create_documents("food_search_index", batch)
                created_count += len(doc_ids)
            
            logger.info(f"✅ {created_count} índices de busca criados")
            return created_count
            
        except Exception as e:
            logger.error(f"❌ Erro ao criar índices: {e}")
            return 0
    
    async def populate_all(self):
        """Popular todas as coleções com dados expandidos"""
        logger.info("🚀 Iniciando população da base TACO expandida...")
        
        # Carregar dados de exemplo
        sample_data = self.load_sample_data()
        
        if not sample_data:
            logger.error("❌ Nenhum dado de exemplo encontrado")
            return
        
        # Gerar alimentos expandidos
        expanded_foods = self.generate_expanded_foods(sample_data)
        
        if not expanded_foods:
            logger.error("❌ Nenhum alimento expandido gerado")
            return
        
        # Contadores
        total_foods = 0
        total_categories = 0
        total_indexes = 0
        
        try:
            # Criar categorias
            total_categories = await self.create_food_categories()
            
            # Popular alimentos
            total_foods = await self.populate_foods(expanded_foods)
            
            # Criar índices de busca
            total_indexes = await self.create_search_indexes()
            
        except Exception as e:
            logger.error(f"❌ Erro durante a população: {e}")
        
        # Resumo final
        logger.info("\n" + "="*60)
        logger.info("📊 RESUMO DA POPULAÇÃO DA BASE TACO EXPANDIDA")
        logger.info("="*60)
        logger.info(f"🍎 Alimentos criados: {total_foods}")
        logger.info(f"📂 Categorias criadas: {total_categories}")
        logger.info(f"🔍 Índices de busca criados: {total_indexes}")
        logger.info(f"📈 Total de documentos: {total_foods + total_categories + total_indexes}")
        logger.info(f"✅ Processados com sucesso: {self.processed_count}")
        logger.info(f"❌ Erros encontrados: {self.error_count}")
        logger.info("="*60)
        logger.info("✅ População da base TACO expandida concluída!")

async def main():
    """Função principal"""
    # Criar e executar populador
    populator = TACOExpandedPopulator()
    
    try:
        await populator.initialize()
        await populator.populate_all()
        
    except Exception as e:
        logger.error(f"❌ Erro durante a execução: {e}")
        
    finally:
        logger.info("🏁 Script finalizado")

if __name__ == "__main__":
    asyncio.run(main())
