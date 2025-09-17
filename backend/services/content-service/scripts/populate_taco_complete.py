#!/usr/bin/env python3
"""
Script para popular o banco de dados Firestore com base TACO completa
Processa milhares de alimentos brasileiros da tabela TACO oficial
"""

import asyncio
import json
import os
import sys
import requests
import csv
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

# Adicionar src ao path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from services.firebase_service import FirebaseService
from models.food import Food, NutritionalInfo, ServingSize

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TACOPopulator:
    """Classe para popular o banco de dados com base TACO completa"""
    
    def __init__(self):
        self.firebase_service = FirebaseService()
        self.processed_count = 0
        self.error_count = 0
        
    async def initialize(self):
        """Inicializar serviços"""
        await self.firebase_service.initialize()
        logger.info("✅ Firebase inicializado com sucesso")
    
    def download_taco_data(self) -> Optional[str]:
        """Baixar dados da tabela TACO oficial"""
        try:
            # URL da tabela TACO oficial (exemplo - ajustar conforme necessário)
            taco_url = "https://www.nepa.unicamp.br/taco/tabela.php?table=tabela&format=csv"
            
            logger.info("📥 Baixando dados da tabela TACO...")
            response = requests.get(taco_url, timeout=30)
            response.raise_for_status()
            
            # Salvar arquivo localmente
            file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'taco_completa.csv')
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            
            logger.info(f"✅ Dados TACO baixados e salvos em: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"❌ Erro ao baixar dados TACO: {e}")
            return None
    
    def load_taco_csv(self, file_path: str) -> List[Dict[str, Any]]:
        """Carregar dados do arquivo CSV da TACO"""
        try:
            foods = []
            
            with open(file_path, 'r', encoding='utf-8') as f:
                # Detectar delimitador
                sample = f.read(1024)
                f.seek(0)
                
                # Tentar diferentes delimitadores
                for delimiter in [';', ',', '\t']:
                    if delimiter in sample:
                        break
                else:
                    delimiter = ';'  # Padrão para TACO
                
                reader = csv.DictReader(f, delimiter=delimiter)
                
                for row in reader:
                    try:
                        food_data = self.parse_taco_row(row)
                        if food_data:
                            foods.append(food_data)
                    except Exception as e:
                        logger.warning(f"⚠️ Erro ao processar linha: {e}")
                        self.error_count += 1
                        continue
            
            logger.info(f"✅ {len(foods)} alimentos carregados do CSV")
            return foods
            
        except Exception as e:
            logger.error(f"❌ Erro ao carregar CSV: {e}")
            return []
    
    def parse_taco_row(self, row: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Parsear uma linha do CSV da TACO"""
        try:
            # Mapear colunas da TACO para nosso formato
            food_data = {
                "codigo": row.get("Código", "").strip(),
                "nome": row.get("Nome", "").strip(),
                "nome_cientifico": row.get("Nome Científico", "").strip(),
                "grupo": row.get("Grupo", "").strip(),
                "composicao": self.parse_composition(row),
                "macronutrientes": self.calculate_macronutrients(row),
                "densidade_nutricional": self.calculate_nutritional_density(row),
                "fonte": "TBCA",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            # Validar dados essenciais
            if not food_data["nome"] or not food_data["codigo"]:
                return None
                
            return food_data
            
        except Exception as e:
            logger.warning(f"⚠️ Erro ao parsear linha: {e}")
            return None
    
    def parse_composition(self, row: Dict[str, str]) -> Dict[str, Any]:
        """Parsear composição nutricional"""
        composition = {}
        
        # Mapear nutrientes da TACO
        nutrient_mapping = {
            "Energia": "Energia (kcal)",
            "Umidade": "Umidade (g)",
            "Carboidrato total": "Carboidrato total (g)",
            "Carboidrato disponível": "Carboidrato disponível (g)",
            "Proteína": "Proteína (g)",
            "Lipídios": "Lipídios (g)",
            "Fibra alimentar": "Fibra alimentar (g)",
            "Álcool": "Álcool (g)",
            "Cinzas": "Cinzas (g)",
            "Colesterol": "Colesterol (mg)",
            "Ácidos graxos saturados": "Ácidos graxos saturados (g)",
            "Ácidos graxos monoinsaturados": "Ácidos graxos monoinsaturados (g)",
            "Ácidos graxos poliinsaturados": "Ácidos graxos poliinsaturados (g)",
            "Ácidos graxos trans": "Ácidos graxos trans (g)",
            "Cálcio": "Cálcio (mg)",
            "Ferro": "Ferro (mg)",
            "Sódio": "Sódio (mg)",
            "Magnésio": "Magnésio (mg)",
            "Fósforo": "Fósforo (mg)",
            "Potássio": "Potássio (mg)",
            "Manganês": "Manganês (mg)",
            "Zinco": "Zinco (mg)",
            "Cobre": "Cobre (mg)",
            "Selênio": "Selênio (mcg)",
            "Vitamina A (RE)": "Vitamina A (RE) (mcg)",
            "Vitamina A (RAE)": "Vitamina A (RAE) (mcg)",
            "Vitamina D": "Vitamina D (mcg)",
            "Alfa-tocoferol (Vitamina E)": "Alfa-tocoferol (Vitamina E) (mg)",
            "Tiamina": "Tiamina (mg)",
            "Riboflavina": "Riboflavina (mg)",
            "Niacina": "Niacina (mg)",
            "Vitamina B6": "Vitamina B6 (mg)",
            "Vitamina B12": "Vitamina B12 (mcg)",
            "Vitamina C": "Vitamina C (mg)",
            "Equivalente de folato": "Equivalente de folato (mcg)",
            "Sal de adição": "Sal de adição (g)",
            "Açúcar de adição": "Açúcar de adição (g)"
        }
        
        for nutrient, column_name in nutrient_mapping.items():
            value = row.get(column_name, "").strip()
            
            if value and value not in ["NA", "tr", "-", ""]:
                try:
                    # Converter vírgula para ponto e extrair valor numérico
                    numeric_value = float(value.replace(",", "."))
                    
                    # Determinar unidade
                    if "kcal" in column_name:
                        unit = "kcal"
                    elif "mg" in column_name:
                        unit = "mg"
                    elif "mcg" in column_name:
                        unit = "mcg"
                    else:
                        unit = "g"
                    
                    composition[nutrient] = {
                        "valor": numeric_value,
                        "unidade": unit,
                        "valor_original": value
                    }
                except ValueError:
                    # Valor não numérico, pular
                    continue
        
        return composition
    
    def calculate_macronutrients(self, row: Dict[str, str]) -> Dict[str, int]:
        """Calcular percentual de macronutrientes"""
        try:
            # Obter valores de macronutrientes
            carbs = self.safe_float(row.get("Carboidrato total (g)", "0"))
            protein = self.safe_float(row.get("Proteína (g)", "0"))
            fat = self.safe_float(row.get("Lipídios (g)", "0"))
            
            # Calcular total
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
    
    def calculate_nutritional_density(self, row: Dict[str, str]) -> float:
        """Calcular densidade nutricional"""
        try:
            # Obter valores nutricionais importantes
            protein = self.safe_float(row.get("Proteína (g)", "0"))
            fiber = self.safe_float(row.get("Fibra alimentar (g)", "0"))
            calcium = self.safe_float(row.get("Cálcio (mg)", "0"))
            iron = self.safe_float(row.get("Ferro (mg)", "0"))
            vitamin_c = self.safe_float(row.get("Vitamina C (mg)", "0"))
            energy = self.safe_float(row.get("Energia (kcal)", "1"))
            
            # Calcular densidade nutricional (simplificado)
            nutritional_score = (protein * 4) + (fiber * 2) + (calcium * 0.01) + (iron * 10) + (vitamin_c * 0.1)
            density = nutritional_score / energy if energy > 0 else 0
            
            return round(density, 6)
            
        except Exception:
            return 0.0
    
    def safe_float(self, value: str) -> float:
        """Converter string para float de forma segura"""
        try:
            if not value or value in ["NA", "tr", "-", ""]:
                return 0.0
            return float(value.replace(",", "."))
        except (ValueError, AttributeError):
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
                    
                    # Pequena pausa entre lotes para não sobrecarregar
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
                    "color": "#FF6B6B"
                },
                {
                    "id": "verduras_legumes",
                    "name": "Verduras e Legumes",
                    "description": "Vegetais frescos e preparados",
                    "icon": "🥬",
                    "color": "#4ECDC4"
                },
                {
                    "id": "cereais_derivados",
                    "name": "Cereais e Derivados",
                    "description": "Arroz, trigo, milho e derivados",
                    "icon": "🌾",
                    "color": "#45B7D1"
                },
                {
                    "id": "carnes_aves",
                    "name": "Carnes e Aves",
                    "description": "Carnes bovinas, suínas, aves e derivados",
                    "icon": "🥩",
                    "color": "#96CEB4"
                },
                {
                    "id": "leite_derivados",
                    "name": "Leite e Derivados",
                    "description": "Leite, queijos, iogurtes e derivados",
                    "icon": "🥛",
                    "color": "#FFEAA7"
                },
                {
                    "id": "bebidas",
                    "name": "Bebidas",
                    "description": "Sucos, refrigerantes, chás e outras bebidas",
                    "icon": "🥤",
                    "color": "#DDA0DD"
                },
                {
                    "id": "doces_salgados",
                    "name": "Doces e Salgados",
                    "description": "Doces, salgados e petiscos",
                    "icon": "🍰",
                    "color": "#F8BBD9"
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
    
    async def populate_all(self, csv_file_path: Optional[str] = None):
        """Popular todas as coleções com dados da TACO"""
        logger.info("🚀 Iniciando população da base TACO completa...")
        
        # Baixar dados se não fornecidos
        if not csv_file_path:
            csv_file_path = self.download_taco_data()
            if not csv_file_path:
                logger.error("❌ Não foi possível baixar dados da TACO")
                return
        
        # Carregar dados do CSV
        foods_data = self.load_taco_csv(csv_file_path)
        
        if not foods_data:
            logger.error("❌ Nenhum alimento encontrado para popular")
            return
        
        # Contadores
        total_foods = 0
        total_categories = 0
        total_indexes = 0
        
        try:
            # Criar categorias
            total_categories = await self.create_food_categories()
            
            # Popular alimentos
            total_foods = await self.populate_foods(foods_data)
            
            # Criar índices de busca
            total_indexes = await self.create_search_indexes()
            
        except Exception as e:
            logger.error(f"❌ Erro durante a população: {e}")
        
        # Resumo final
        logger.info("\n" + "="*60)
        logger.info("📊 RESUMO DA POPULAÇÃO DA BASE TACO")
        logger.info("="*60)
        logger.info(f"🍎 Alimentos criados: {total_foods}")
        logger.info(f"📂 Categorias criadas: {total_categories}")
        logger.info(f"🔍 Índices de busca criados: {total_indexes}")
        logger.info(f"📈 Total de documentos: {total_foods + total_categories + total_indexes}")
        logger.info(f"✅ Processados com sucesso: {self.processed_count}")
        logger.info(f"❌ Erros encontrados: {self.error_count}")
        logger.info("="*60)
        logger.info("✅ População da base TACO concluída!")

async def main():
    """Função principal"""
    # Verificar se arquivo CSV existe
    csv_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'taco_completa.csv')
    
    if not os.path.exists(csv_file):
        logger.info("📥 Arquivo TACO não encontrado, baixando...")
        csv_file = None
    
    # Criar e executar populador
    populator = TACOPopulator()
    
    try:
        await populator.initialize()
        await populator.populate_all(csv_file)
        
    except Exception as e:
        logger.error(f"❌ Erro durante a execução: {e}")
        
    finally:
        logger.info("🏁 Script finalizado")

if __name__ == "__main__":
    asyncio.run(main())
