#!/usr/bin/env python3
"""
Script para importar dados da Tabela TACO para o Firebase Firestore
"""

import csv
import json
import os
import sys
from firebase_admin import credentials, firestore, initialize_app

def initialize_firebase():
    """Inicializa Firebase"""
    try:
        config_path = os.path.join(os.path.dirname(__file__), 'firebase-config.json')
        cred = credentials.Certificate(config_path)
        initialize_app(cred)
        db = firestore.client()
        return db
    except Exception as e:
        print(f"Erro ao inicializar Firebase: {e}")
        return None

def clean_value(value):
    """Limpa e converte valores do CSV"""
    if value == 'NA' or value == '':
        return None
    try:
        # Tenta converter para float
        if '.' in value or 'e-' in value:
            return float(value)
        # Tenta converter para int
        return int(value)
    except:
        # Retorna como string se não conseguir converter
        return value.strip('"')

def import_taco_data():
    """Importa dados da Tabela TACO para o Firestore"""
    
    # Inicializar Firebase
    db = initialize_firebase()
    if not db:
        print("Falha ao conectar com Firebase")
        return
    
    # Ler arquivo CSV
    csv_file = os.path.join(os.path.dirname(__file__), 'taco_alimentos.csv')
    
    if not os.path.exists(csv_file):
        print(f"Arquivo {csv_file} não encontrado")
        return
    
    # Definir campos do CSV baseado no cabeçalho
    campos = [
        'numero_alimento', 'categoria', 'descricao', 'umidade_g', 'energia_kcal', 'energia_kj',
        'proteina_g', 'lipideos_g', 'colesterol_mg', 'carboidrato_g', 'fibra_alimentar_g',
        'cinzas_g', 'calcio_mg', 'magnesio_mg', 'manganes_mg', 'fosforo_mg', 'ferro_mg',
        'sodio_mg', 'potassio_mg', 'cobre_mg', 'zinco_mg', 'retinol_mcg', 'vitamina_a_rae_mcg',
        'carotenoides_mcg', 'tiamina_mg', 'riboflavina_mg', 'piridoxina_mg', 'niacina_mg',
        'vitamina_c_mg'
    ]
    
    contador = 0
    batch = db.batch()
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            
            # Pular cabeçalho
            next(reader)
            
            for row in reader:
                if len(row) < len(campos):
                    print(f"Linha incompleta ignorada: {row}")
                    continue
                
                # Criar documento
                alimento_data = {}
                for i, campo in enumerate(campos):
                    if i < len(row):
                        alimento_data[campo] = clean_value(row[i])
                
                # Adicionar metadados
                alimento_data['fonte'] = 'TACO - Tabela Brasileira de Composição de Alimentos'
                alimento_data['versao'] = '4ª edição'
                alimento_data['importado_em'] = firestore.SERVER_TIMESTAMP
                
                # Usar número do alimento como ID do documento
                doc_id = f"taco_{alimento_data['numero_alimento']}"
                doc_ref = db.collection('evolveyou-foods').document(doc_id)
                
                batch.set(doc_ref, alimento_data)
                contador += 1
                
                # Commit em lotes de 500 (limite do Firestore)
                if contador % 500 == 0:
                    batch.commit()
                    batch = db.batch()
                    print(f"Importados {contador} alimentos...")
        
        # Commit final
        if contador % 500 != 0:
            batch.commit()
        
        print(f"✅ Importação concluída! Total de {contador} alimentos importados.")
        
    except Exception as e:
        print(f"❌ Erro durante a importação: {e}")

if __name__ == "__main__":
    print("🍎 Iniciando importação da Tabela TACO...")
    import_taco_data()

