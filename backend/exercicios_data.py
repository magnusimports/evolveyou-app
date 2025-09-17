#!/usr/bin/env python3
"""
Lista de exercícios para importação no Firebase
"""

exercicios_data = [
    # PEITO
    {
        "nome": "Supino Reto com Barra",
        "categoria": "Peito",
        "grupo_muscular": "Peitoral Maior",
        "equipamento": "Barra",
        "nivel": "Intermediário",
        "descricao": "Exercício fundamental para desenvolvimento do peitoral maior, realizado deitado no banco reto.",
        "instrucoes": [
            "Deite no banco reto com os pés apoiados no chão",
            "Segure a barra com pegada pronada, mãos um pouco mais largas que os ombros",
            "Desça a barra controladamente até tocar o peito",
            "Empurre a barra de volta à posição inicial"
        ],
        "musculos_primarios": ["Peitoral Maior"],
        "musculos_secundarios": ["Tríceps", "Deltóide Anterior"],
        "calorias_por_minuto": 8.5,
        "tipo": "Força"
    },
    {
        "nome": "Flexão de Braço",
        "categoria": "Peito",
        "grupo_muscular": "Peitoral Maior",
        "equipamento": "Peso Corporal",
        "nivel": "Iniciante",
        "descricao": "Exercício básico usando o peso corporal para fortalecer o peito.",
        "instrucoes": [
            "Posicione-se em prancha com mãos no chão",
            "Mantenha o corpo reto da cabeça aos pés",
            "Desça o corpo flexionando os braços",
            "Empurre de volta à posição inicial"
        ],
        "musculos_primarios": ["Peitoral Maior"],
        "musculos_secundarios": ["Tríceps", "Core"],
        "calorias_por_minuto": 7.0,
        "tipo": "Força"
    },
    {
        "nome": "Supino Inclinado com Halteres",
        "categoria": "Peito",
        "grupo_muscular": "Peitoral Superior",
        "equipamento": "Halteres",
        "nivel": "Intermediário",
        "descricao": "Exercício para enfatizar a porção superior do peitoral.",
        "instrucoes": [
            "Ajuste o banco em inclinação de 30-45 graus",
            "Segure um halter em cada mão",
            "Desça os halteres controladamente",
            "Empurre de volta contraindo o peito"
        ],
        "musculos_primarios": ["Peitoral Superior"],
        "musculos_secundarios": ["Deltóide Anterior", "Tríceps"],
        "calorias_por_minuto": 8.0,
        "tipo": "Força"
    },
    
    # COSTAS
    {
        "nome": "Puxada na Polia Alta",
        "categoria": "Costas",
        "grupo_muscular": "Latíssimo do Dorso",
        "equipamento": "Polia",
        "nivel": "Iniciante",
        "descricao": "Exercício fundamental para desenvolvimento das costas.",
        "instrucoes": [
            "Sente no equipamento e ajuste a almofada nas coxas",
            "Segure a barra com pegada pronada, mãos mais largas que os ombros",
            "Puxe a barra em direção ao peito",
            "Retorne controladamente à posição inicial"
        ],
        "musculos_primarios": ["Latíssimo do Dorso"],
        "musculos_secundarios": ["Bíceps", "Rombóides"],
        "calorias_por_minuto": 7.5,
        "tipo": "Força"
    },
    {
        "nome": "Remada Curvada com Barra",
        "categoria": "Costas",
        "grupo_muscular": "Latíssimo do Dorso",
        "equipamento": "Barra",
        "nivel": "Intermediário",
        "descricao": "Exercício composto para desenvolvimento das costas e força funcional.",
        "instrucoes": [
            "Fique em pé com pés na largura dos ombros",
            "Curve o tronco mantendo as costas retas",
            "Puxe a barra em direção ao abdômen",
            "Retorne controladamente"
        ],
        "musculos_primarios": ["Latíssimo do Dorso", "Rombóides"],
        "musculos_secundarios": ["Bíceps", "Deltóide Posterior"],
        "calorias_por_minuto": 8.5,
        "tipo": "Força"
    },
    
    # PERNAS
    {
        "nome": "Agachamento Livre",
        "categoria": "Pernas",
        "grupo_muscular": "Quadríceps",
        "equipamento": "Barra",
        "nivel": "Intermediário",
        "descricao": "Exercício fundamental para desenvolvimento das pernas e glúteos.",
        "instrucoes": [
            "Posicione a barra nos ombros",
            "Pés na largura dos ombros",
            "Desça flexionando quadris e joelhos",
            "Suba empurrando pelos calcanhares"
        ],
        "musculos_primarios": ["Quadríceps", "Glúteos"],
        "musculos_secundarios": ["Isquiotibiais", "Core"],
        "calorias_por_minuto": 9.0,
        "tipo": "Força"
    },
    {
        "nome": "Leg Press 45°",
        "categoria": "Pernas",
        "grupo_muscular": "Quadríceps",
        "equipamento": "Máquina",
        "nivel": "Iniciante",
        "descricao": "Exercício seguro para desenvolvimento das pernas.",
        "instrucoes": [
            "Sente no equipamento com costas apoiadas",
            "Posicione os pés na plataforma",
            "Desça controladamente flexionando os joelhos",
            "Empurre de volta à posição inicial"
        ],
        "musculos_primarios": ["Quadríceps"],
        "musculos_secundarios": ["Glúteos", "Isquiotibiais"],
        "calorias_por_minuto": 8.0,
        "tipo": "Força"
    },
    {
        "nome": "Stiff com Halteres",
        "categoria": "Pernas",
        "grupo_muscular": "Isquiotibiais",
        "equipamento": "Halteres",
        "nivel": "Intermediário",
        "descricao": "Exercício para desenvolvimento dos músculos posteriores da coxa.",
        "instrucoes": [
            "Fique em pé segurando halteres",
            "Mantenha pernas levemente flexionadas",
            "Desça os halteres flexionando o quadril",
            "Retorne contraindo os isquiotibiais"
        ],
        "musculos_primarios": ["Isquiotibiais"],
        "musculos_secundarios": ["Glúteos", "Eretores da Espinha"],
        "calorias_por_minuto": 7.5,
        "tipo": "Força"
    },
    
    # OMBROS
    {
        "nome": "Desenvolvimento com Halteres",
        "categoria": "Ombros",
        "grupo_muscular": "Deltóides",
        "equipamento": "Halteres",
        "nivel": "Intermediário",
        "descricao": "Exercício fundamental para desenvolvimento dos ombros.",
        "instrucoes": [
            "Sente com costas apoiadas",
            "Segure halteres na altura dos ombros",
            "Empurre os halteres para cima",
            "Desça controladamente"
        ],
        "musculos_primarios": ["Deltóide Anterior", "Deltóide Médio"],
        "musculos_secundarios": ["Tríceps", "Trapézio"],
        "calorias_por_minuto": 7.0,
        "tipo": "Força"
    },
    {
        "nome": "Elevação Lateral",
        "categoria": "Ombros",
        "grupo_muscular": "Deltóide Médio",
        "equipamento": "Halteres",
        "nivel": "Iniciante",
        "descricao": "Exercício de isolamento para o deltóide médio.",
        "instrucoes": [
            "Fique em pé com halteres nas mãos",
            "Eleve os braços lateralmente",
            "Pare na altura dos ombros",
            "Desça controladamente"
        ],
        "musculos_primarios": ["Deltóide Médio"],
        "musculos_secundarios": ["Trapézio"],
        "calorias_por_minuto": 6.0,
        "tipo": "Força"
    },
    
    # BRAÇOS
    {
        "nome": "Rosca Direta com Barra",
        "categoria": "Braços",
        "grupo_muscular": "Bíceps",
        "equipamento": "Barra",
        "nivel": "Iniciante",
        "descricao": "Exercício clássico para desenvolvimento dos bíceps.",
        "instrucoes": [
            "Fique em pé segurando a barra",
            "Mantenha cotovelos fixos ao lado do corpo",
            "Flexione os braços levando a barra ao peito",
            "Desça controladamente"
        ],
        "musculos_primarios": ["Bíceps"],
        "musculos_secundarios": ["Antebraços"],
        "calorias_por_minuto": 6.5,
        "tipo": "Força"
    },
    {
        "nome": "Tríceps Testa",
        "categoria": "Braços",
        "grupo_muscular": "Tríceps",
        "equipamento": "Barra",
        "nivel": "Intermediário",
        "descricao": "Exercício de isolamento para o tríceps.",
        "instrucoes": [
            "Deite no banco segurando a barra",
            "Mantenha braços perpendiculares ao corpo",
            "Flexione apenas os antebraços",
            "Estenda de volta à posição inicial"
        ],
        "musculos_primarios": ["Tríceps"],
        "musculos_secundarios": [],
        "calorias_por_minuto": 6.0,
        "tipo": "Força"
    },
    
    # CARDIO
    {
        "nome": "Corrida na Esteira",
        "categoria": "Cardio",
        "grupo_muscular": "Sistema Cardiovascular",
        "equipamento": "Esteira",
        "nivel": "Iniciante",
        "descricao": "Exercício cardiovascular fundamental.",
        "instrucoes": [
            "Ajuste velocidade conforme condicionamento",
            "Mantenha postura ereta",
            "Respire de forma controlada",
            "Aumente intensidade gradualmente"
        ],
        "musculos_primarios": ["Quadríceps", "Panturrilhas"],
        "musculos_secundarios": ["Glúteos", "Core"],
        "calorias_por_minuto": 12.0,
        "tipo": "Cardio"
    },
    {
        "nome": "Bicicleta Ergométrica",
        "categoria": "Cardio",
        "grupo_muscular": "Sistema Cardiovascular",
        "equipamento": "Bicicleta",
        "nivel": "Iniciante",
        "descricao": "Exercício cardiovascular de baixo impacto.",
        "instrucoes": [
            "Ajuste altura do banco",
            "Mantenha postura ereta",
            "Pedale com resistência adequada",
            "Controle a respiração"
        ],
        "musculos_primarios": ["Quadríceps"],
        "musculos_secundarios": ["Panturrilhas", "Glúteos"],
        "calorias_por_minuto": 10.0,
        "tipo": "Cardio"
    },
    
    # CORE/ABDÔMEN
    {
        "nome": "Prancha",
        "categoria": "Core",
        "grupo_muscular": "Core",
        "equipamento": "Peso Corporal",
        "nivel": "Iniciante",
        "descricao": "Exercício isométrico para fortalecimento do core.",
        "instrucoes": [
            "Posicione-se em prancha sobre antebraços",
            "Mantenha corpo reto da cabeça aos pés",
            "Contraia abdômen e glúteos",
            "Mantenha a posição pelo tempo determinado"
        ],
        "musculos_primarios": ["Reto Abdominal", "Transverso do Abdômen"],
        "musculos_secundarios": ["Glúteos", "Deltóides"],
        "calorias_por_minuto": 5.0,
        "tipo": "Core"
    },
    {
        "nome": "Abdominal Tradicional",
        "categoria": "Core",
        "grupo_muscular": "Reto Abdominal",
        "equipamento": "Peso Corporal",
        "nivel": "Iniciante",
        "descricao": "Exercício básico para o abdômen.",
        "instrucoes": [
            "Deite com joelhos flexionados",
            "Mãos atrás da cabeça ou cruzadas no peito",
            "Eleve o tronco contraindo o abdômen",
            "Desça controladamente"
        ],
        "musculos_primarios": ["Reto Abdominal"],
        "musculos_secundarios": ["Oblíquos"],
        "calorias_por_minuto": 4.5,
        "tipo": "Core"
    }
]

