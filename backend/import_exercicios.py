#!/usr/bin/env python3
"""
Script para importar exercícios para o Firebase Firestore
"""

import os
import sys
from firebase_admin import credentials, firestore, initialize_app
from exercicios_data import exercicios_data

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

def import_exercicios():
    """Importa exercícios para o Firestore"""
    
    # Inicializar Firebase
    db = initialize_firebase()
    if not db:
        print("Falha ao conectar com Firebase")
        return
    
    contador = 0
    batch = db.batch()
    
    try:
        for exercicio in exercicios_data:
            # Adicionar metadados
            exercicio_data = exercicio.copy()
            exercicio_data['criado_em'] = firestore.SERVER_TIMESTAMP
            exercicio_data['ativo'] = True
            exercicio_data['fonte'] = 'EvolveYou - Base de Exercícios'
            
            # Gerar ID baseado no nome do exercício
            exercicio_id = exercicio['nome'].lower().replace(' ', '_').replace('°', '_graus')
            doc_ref = db.collection('exercicios').document(exercicio_id)
            
            batch.set(doc_ref, exercicio_data)
            contador += 1
            
            print(f"Preparando: {exercicio['nome']} ({exercicio['categoria']})")
        
        # Commit do batch
        batch.commit()
        
        print(f"✅ Importação concluída! Total de {contador} exercícios importados.")
        
        # Verificar importação
        print("\n🔍 Verificando exercícios importados:")
        docs = db.collection('exercicios').limit(5).stream()
        for doc in docs:
            data = doc.to_dict()
            print(f"- {data.get('nome')} ({data.get('categoria')})")
        
    except Exception as e:
        print(f"❌ Erro durante a importação: {e}")

if __name__ == "__main__":
    print("💪 Iniciando importação de exercícios...")
    import_exercicios()

