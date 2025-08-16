
# 📚 DOCUMENTAÇÃO COMPLETA DAS APIS - EVOLVEYOU

## 🎯 Visão Geral

Esta documentação detalha todas as APIs dos microserviços do EvolveYou, organizadas por serviço e funcionalidade.

---

## 🚪 API Gateway

**Base URL**: `https://api.evolveyou.com.br`

### Autenticação
Todas as APIs (exceto login/registro) requerem token JWT no header:
```
Authorization: Bearer <jwt_token>
```

### Rate Limiting
- **Usuários Gratuitos**: 100 requests/15min
- **Usuários Premium**: 1000 requests/15min

---

## 👤 Users Service

### Autenticação

#### POST /auth/register
Registrar novo usuário

**Request**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "confirmPassword": "senha123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here"
    }
  }
}
```

#### POST /auth/login
Login de usuário

**Request**:
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "João Silva",
      "email": "joao@example.com",
      "isPremium": false
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here"
    }
  }
}
```

#### POST /auth/social-login
Login social (Google/Apple/Facebook)

**Request**:
```json
{
  "provider": "google",
  "token": "social_token_here"
}
```

#### POST /auth/refresh
Renovar token de acesso

**Request**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Perfil do Usuário

#### GET /users/me
Obter perfil do usuário atual

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "João Silva",
    "email": "joao@example.com",
    "profile": {
      "age": 30,
      "weight": 80,
      "height": 175,
      "gender": "male",
      "activityLevel": "moderate"
    },
    "metabolic": {
      "bmr": 1800,
      "tdee": 2400,
      "factors": {
        "bodyComposition": 1.05,
        "pharma": 1.0,
        "experience": 1.02
      }
    },
    "isPremium": false,
    "subscription": {
      "plan": "free",
      "expiresAt": null
    }
  }
}
```

#### PUT /users/me
Atualizar perfil do usuário

**Request**:
```json
{
  "name": "João Silva Santos",
  "profile": {
    "weight": 78,
    "activityLevel": "high"
  }
}
```

### Onboarding e Anamnese

#### POST /onboarding/submit
Submeter anamnese completa

**Request**:
```json
{
  "objective": "lose_weight",
  "motivation": "health",
  "timeline": "6_months",
  "physicalData": {
    "age": 30,
    "weight": 80,
    "height": 175,
    "gender": "male",
    "bodyFat": 15
  },
  "activityLevel": {
    "work": "sedentary",
    "leisure": "moderate",
    "experience": "intermediate"
  },
  "workoutPreferences": {
    "location": "gym",
    "frequency": 4,
    "duration": 60,
    "types": ["strength", "cardio"]
  },
  "supplementation": {
    "current": ["whey", "creatine"],
    "pharma": false,
    "allergies": ["lactose"]
  },
  "dietaryHabits": {
    "restrictions": ["lactose"],
    "preferences": ["high_protein"],
    "mealsPerDay": 5,
    "cookingSkill": "intermediate"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "anamneseId": "anamnese_123",
    "metabolicProfile": {
      "bmr": 1850,
      "tdee": 2450,
      "factors": {
        "bodyComposition": 1.08,
        "experience": 1.05,
        "pharma": 1.0
      }
    },
    "recommendations": {
      "calorieTarget": 2000,
      "macros": {
        "protein": 150,
        "carbs": 200,
        "fat": 67
      },
      "workoutFrequency": 4
    }
  }
}
```

#### POST /calories/recalculate
Recalcular calorias baseado em novos dados

**Request**:
```json
{
  "weight": 78,
  "bodyFat": 14,
  "activityLevel": "high"
}
```

---

## 📋 Plans Service

### Planos de Dieta

#### GET /plan/diet
Obter plano de dieta personalizado

**Query Parameters**:
- `date` (optional): Data específica (YYYY-MM-DD)
- `regenerate` (optional): Regenerar plano (true/false)

**Response**:
```json
{
  "success": true,
  "data": {
    "planId": "diet_plan_123",
    "date": "2025-08-16",
    "userId": "user_123",
    "totalCalories": 2000,
    "macros": {
      "protein": 150,
      "carbs": 200,
      "fat": 67,
      "fiber": 25
    },
    "meals": [
      {
        "id": "breakfast",
        "name": "Café da Manhã",
        "time": "07:00",
        "calories": 400,
        "macros": {
          "protein": 25,
          "carbs": 45,
          "fat": 15
        },
        "foods": [
          {
            "id": "BRC0001C",
            "name": "Aveia em flocos",
            "quantity": 50,
            "unit": "g",
            "calories": 190,
            "macros": {
              "protein": 7,
              "carbs": 32,
              "fat": 4
            }
          }
        ]
      }
    ],
    "hydration": {
      "target": 2500,
      "unit": "ml"
    },
    "notes": [
      "Beba água ao acordar",
      "Consuma proteína em todas as refeições"
    ]
  }
}
```

#### GET /plan/workout
Obter plano de treino personalizado

**Query Parameters**:
- `date` (optional): Data específica (YYYY-MM-DD)
- `type` (optional): Tipo de treino (strength/cardio/mixed)

**Response**:
```json
{
  "success": true,
  "data": {
    "planId": "workout_plan_123",
    "date": "2025-08-16",
    "userId": "user_123",
    "type": "strength",
    "duration": 60,
    "estimatedCalories": 300,
    "warmup": {
      "duration": 10,
      "exercises": [
        {
          "id": "warmup_001",
          "name": "Esteira caminhada",
          "duration": 5,
          "intensity": "light",
          "gif": "https://assets.evolveyou.com/gifs/treadmill_walk.gif"
        }
      ]
    },
    "workout": {
      "exercises": [
        {
          "id": "ex_001",
          "name": "Supino reto",
          "category": "chest",
          "equipment": "barbell",
          "sets": 4,
          "reps": "8-12",
          "rest": 90,
          "weight": "auto",
          "instructions": [
            "Deite no banco com os pés firmes no chão",
            "Segure a barra com pegada ligeiramente mais larga que os ombros"
          ],
          "gif": "https://assets.evolveyou.com/gifs/bench_press.gif",
          "premium": {
            "muscleGroups": ["peitoral maior", "tríceps", "deltóide anterior"],
            "cadence": "2-1-2-1",
            "tips": "Mantenha as escápulas retraídas durante todo o movimento"
          }
        }
      ]
    },
    "cooldown": {
      "duration": 10,
      "exercises": [
        {
          "id": "cooldown_001",
          "name": "Alongamento peitoral",
          "duration": 30,
          "instructions": ["Apoie o braço na parede e gire o corpo"]
        }
      ]
    }
  }
}
```

### Apresentação de Planos

#### GET /plan/presentation
Apresentação personalizada do plano pelo EVO

**Response**:
```json
{
  "success": true,
  "data": {
    "presentationId": "presentation_123",
    "evoMessage": {
      "greeting": "Olá João! Sou o EVO, seu coach pessoal 24/7! 🤖",
      "strategy": "Baseado na sua anamnese, criei uma estratégia personalizada para você perder 8kg em 6 meses de forma saudável e sustentável.",
      "dietPlan": {
        "description": "Seu plano alimentar tem 2000 calorias diárias, com déficit de 400 calorias para perda de gordura gradual.",
        "highlights": [
          "5 refeições balanceadas por dia",
          "150g de proteína para preservar massa muscular",
          "Alimentos que você gosta e sabe preparar"
        ]
      },
      "workoutPlan": {
        "description": "Treinos de força 4x por semana, focados em grandes grupos musculares.",
        "highlights": [
          "Sessões de 60 minutos na academia",
          "Progressão gradual de cargas",
          "Exercícios adequados ao seu nível intermediário"
        ]
      },
      "motivation": "Lembre-se: consistência é mais importante que perfeição. Estou aqui para te apoiar em cada passo! 💪",
      "nextSteps": [
        "Vamos começar com o café da manhã de hoje",
        "Seu primeiro treino está agendado para amanhã",
        "Qualquer dúvida, é só me chamar!"
      ]
    },
    "audioUrl": "https://assets.evolveyou.com/audio/presentation_123.mp3",
    "estimatedDuration": 180
  }
}
```

#### GET /plan/weekly-schedule
Cronograma semanal completo

**Response**:
```json
{
  "success": true,
  "data": {
    "weekId": "week_123",
    "startDate": "2025-08-16",
    "endDate": "2025-08-22",
    "schedule": [
      {
        "date": "2025-08-16",
        "dayOfWeek": "friday",
        "workout": {
          "type": "strength",
          "focus": "chest_triceps",
          "duration": 60
        },
        "diet": {
          "calories": 2000,
          "meals": 5
        },
        "notes": ["Primeiro dia do plano!", "Foque na execução correta"]
      }
    ],
    "weeklyGoals": {
      "workouts": 4,
      "avgCalories": 2000,
      "hydration": 2500,
      "steps": 8000
    }
  }
}
```

### Administração

#### POST /admin/regenerate-plans
Regenerar planos para usuário (admin only)

**Request**:
```json
{
  "userId": "user_123",
  "type": "both", // "diet", "workout", "both"
  "reason": "user_request"
}
```

---

## 📊 Content Service

### Alimentos (Base TACO)

#### GET /foods/search
Buscar alimentos

**Query Parameters**:
- `q`: Termo de busca
- `category`: Categoria (optional)
- `limit`: Limite de resultados (default: 20)
- `offset`: Offset para paginação (default: 0)

**Response**:
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "id": "BRC0001C",
        "codigo": "BRC0001C",
        "nome": "Abacate, polpa, in natura, Brasil",
        "grupo": "FRUTAS E DERIVADOS",
        "composicao": {
          "Energia": {"valor": 76, "unidade": "kcal"},
          "Proteína": {"valor": 1.15, "unidade": "g"},
          "Carboidrato total": {"valor": 5.84, "unidade": "g"},
          "Lipídios": {"valor": 6.21, "unidade": "g"},
          "Fibra alimentar": {"valor": 4.03, "unidade": "g"},
          "Cálcio": {"valor": 7.16, "unidade": "mg"},
          "Ferro": {"valor": 0.18, "unidade": "mg"},
          "Vitamina C": {"valor": 7.32, "unidade": "mg"}
        },
        "macronutrientes": {
          "carboidratos": 31,
          "proteinas": 6,
          "lipidios": 63
        }
      }
    ],
    "total": 156,
    "page": 1,
    "totalPages": 8
  }
}
```

#### GET /foods/{id}
Obter detalhes de um alimento específico

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "BRC0001C",
    "codigo": "BRC0001C",
    "nome": "Abacate, polpa, in natura, Brasil",
    "grupo": "FRUTAS E DERIVADOS",
    "composicao": {
      "Energia": {"valor": 76, "unidade": "kcal"},
      "Proteína": {"valor": 1.15, "unidade": "g"},
      "Carboidrato total": {"valor": 5.84, "unidade": "g"},
      "Lipídios": {"valor": 6.21, "unidade": "g"},
      "Fibra alimentar": {"valor": 4.03, "unidade": "g"}
    },
    "equivalencias": [
      {
        "alimento": "Banana, nanica, in natura",
        "quantidade": "120g",
        "motivo": "Similar em carboidratos"
      }
    ],
    "usos": [
      "Vitaminas e smoothies",
      "Sobremesas saudáveis",
      "Lanches pré-treino"
    ]
  }
}
```

#### GET /foods/stats
Estatísticas da base de alimentos

**Response**:
```json
{
  "success": true,
  "data": {
    "totalFoods": 3047,
    "categories": [
      {"name": "FRUTAS E DERIVADOS", "count": 156},
      {"name": "CEREAIS E DERIVADOS", "count": 287},
      {"name": "CARNES E DERIVADOS", "count": 198}
    ],
    "lastUpdate": "2025-08-16T10:30:00Z"
  }
}
```

#### GET /foods/groups
Listar grupos de alimentos

**Response**:
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "frutas",
        "name": "FRUTAS E DERIVADOS",
        "count": 156,
        "description": "Frutas frescas, secas e derivados"
      },
      {
        "id": "cereais",
        "name": "CEREAIS E DERIVADOS",
        "count": 287,
        "description": "Grãos, farinhas, pães e massas"
      }
    ]
  }
}
```

### Exercícios

#### GET /exercises
Listar exercícios

**Query Parameters**:
- `category`: Categoria do exercício
- `equipment`: Equipamento necessário
- `muscle`: Grupo muscular
- `difficulty`: Nível de dificuldade

**Response**:
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "ex_001",
        "name": "Supino reto",
        "category": "strength",
        "muscleGroups": ["chest", "triceps", "shoulders"],
        "equipment": ["barbell", "bench"],
        "difficulty": "intermediate",
        "instructions": [
          "Deite no banco com os pés firmes no chão",
          "Segure a barra com pegada ligeiramente mais larga que os ombros"
        ],
        "gif": "https://assets.evolveyou.com/gifs/bench_press.gif",
        "met": 6.0,
        "premium": {
          "muscleActivation": {
            "peitoral_maior": 85,
            "triceps": 65,
            "deltoide_anterior": 45
          },
          "biomechanics": "Movimento de empurrar horizontal",
          "variations": ["Inclinado", "Declinado", "Halteres"]
        }
      }
    ]
  }
}
```

#### GET /exercises/{id}
Obter detalhes de um exercício

#### GET /exercises/categories
Listar categorias de exercícios

---

## 📈 Tracking Service

### Dashboard

#### GET /dashboard
Dados do dashboard principal

**Query Parameters**:
- `date`: Data específica (default: hoje)

**Response**:
```json
{
  "success": true,
  "data": {
    "date": "2025-08-16",
    "energyBalance": {
      "consumed": 1650,
      "burned": 2100,
      "balance": -450,
      "target": -400,
      "status": "on_track"
    },
    "calorieExpenditure": {
      "bmr": 1800,
      "activities": 300,
      "total": 2100,
      "breakdown": {
        "workout": 250,
        "daily_activities": 50
      }
    },
    "macronutrients": {
      "protein": {
        "consumed": 95,
        "target": 150,
        "percentage": 63
      },
      "carbs": {
        "consumed": 120,
        "target": 200,
        "percentage": 60
      },
      "fat": {
        "consumed": 45,
        "target": 67,
        "percentage": 67
      }
    },
    "hydration": {
      "consumed": 1800,
      "target": 2500,
      "percentage": 72,
      "glasses": 7
    },
    "fullTimeActions": {
      "available": true,
      "suggestions": [
        {
          "type": "extra_activity",
          "title": "Registrar caminhada extra",
          "icon": "walk"
        },
        {
          "type": "unplanned_food",
          "title": "Registrar lanche não previsto",
          "icon": "food"
        }
      ]
    }
  }
}
```

### Logging de Refeições

#### POST /log/meal-checkin
Confirmar consumo de refeição

**Request**:
```json
{
  "mealId": "breakfast",
  "date": "2025-08-16",
  "consumed": true,
  "adjustments": [
    {
      "foodId": "BRC0001C",
      "originalQuantity": 50,
      "actualQuantity": 60
    }
  ],
  "notes": "Comi um pouco mais de aveia"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "logId": "meal_log_123",
    "updatedTotals": {
      "calories": 1650,
      "protein": 95,
      "carbs": 120,
      "fat": 45
    },
    "rebalanceNeeded": false
  }
}
```

#### POST /log/unplanned-food
Registrar alimento não previsto (Sistema Full-time)

**Request**:
```json
{
  "foodId": "BRC0045C",
  "quantity": 100,
  "unit": "g",
  "meal": "snack",
  "time": "15:30",
  "reason": "fome_extra"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "logId": "unplanned_123",
    "calories": 150,
    "rebalance": {
      "needed": true,
      "adjustments": {
        "dinner": {
          "calories": -150,
          "fat": -10,
          "carbs": -15,
          "protein": -2
        }
      },
      "message": "Ajustei seu jantar para compensar o lanche extra"
    }
  }
}
```

### Logging de Treinos

#### POST /log/set
Registrar série de exercício

**Request**:
```json
{
  "exerciseId": "ex_001",
  "setNumber": 1,
  "weight": 80,
  "reps": 10,
  "rpe": 7,
  "restTime": 90,
  "notes": "Execução boa"
}
```

#### POST /log/workout-session/start
Iniciar sessão de treino

**Request**:
```json
{
  "workoutPlanId": "workout_plan_123",
  "startTime": "2025-08-16T18:00:00Z",
  "location": "gym"
}
```

#### POST /log/workout-session/end
Finalizar sessão de treino

**Request**:
```json
{
  "sessionId": "session_123",
  "endTime": "2025-08-16T19:00:00Z",
  "totalDuration": 60,
  "completedExercises": 8,
  "totalExercises": 10,
  "feeling": "good",
  "notes": "Treino produtivo"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "caloriesBurned": 250,
    "duration": 60,
    "completionRate": 80,
    "updatedDashboard": {
      "energyBalance": {
        "burned": 2350,
        "balance": -700
      }
    }
  }
}
```

#### POST /log/extra-activity
Registrar atividade extra (Sistema Full-time)

**Request**:
```json
{
  "activity": "walking",
  "duration": 30,
  "intensity": "moderate",
  "time": "12:00",
  "description": "Caminhada no parque"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "logId": "activity_123",
    "caloriesBurned": 120,
    "rebalance": {
      "needed": true,
      "adjustments": {
        "dinner": {
          "calories": +120,
          "carbs": +20,
          "fat": +5
        }
      },
      "message": "Ótimo! Adicionei calorias ao seu jantar para compensar a atividade extra"
    }
  }
}
```

### Rebalanceamento (Sistema Full-time)

#### GET /rebalance/calculate
Calcular rebalanceamento necessário

**Query Parameters**:
- `date`: Data para cálculo
- `extraCalories`: Calorias extras (positivo ou negativo)

**Response**:
```json
{
  "success": true,
  "data": {
    "rebalanceNeeded": true,
    "extraCalories": 150,
    "distribution": {
      "fat": {
        "calories": 90,
        "grams": 10,
        "percentage": 60
      },
      "carbs": {
        "calories": 45,
        "grams": 11.25,
        "percentage": 30
      },
      "protein": {
        "calories": 15,
        "grams": 3.75,
        "percentage": 10
      }
    },
    "mealAdjustments": [
      {
        "meal": "dinner",
        "adjustments": {
          "calories": -150,
          "fat": -10,
          "carbs": -11,
          "protein": -4
        }
      }
    ]
  }
}
```

#### POST /rebalance/apply
Aplicar rebalanceamento

**Request**:
```json
{
  "date": "2025-08-16",
  "adjustments": {
    "dinner": {
      "calories": -150,
      "fat": -10,
      "carbs": -11,
      "protein": -4
    }
  }
}
```

---

## 🤖 EVO Service

### Chat e Interação

#### POST /evo/chat
Conversar com o Coach EVO

**Request**:
```json
{
  "message": "Estou com dificuldade para fazer o supino",
  "context": {
    "currentWorkout": "chest_triceps",
    "exercise": "bench_press",
    "mood": "frustrated"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "response": "Entendo sua frustração com o supino, João! É um exercício técnico mesmo. Vamos focar em alguns pontos: 1) Posição das escápulas - mantenha-as retraídas e deprimidas; 2) Pegada - ligeiramente mais larga que os ombros; 3) Trajetória - a barra deve tocar no peito na altura dos mamilos. Quer que eu te mostre um vídeo demonstrativo?",
    "suggestions": [
      "Ver vídeo demonstrativo",
      "Exercícios preparatórios",
      "Reduzir a carga"
    ],
    "mood": "supportive",
    "audioUrl": "https://assets.evolveyou.com/audio/evo_response_123.mp3"
  }
}
```

#### GET /evo/personality
Obter personalidade atual do EVO

**Response**:
```json
{
  "success": true,
  "data": {
    "personality": {
      "tone": "friendly_motivational",
      "expertise": "fitness_nutrition",
      "communication": "didactic_encouraging",
      "humor": "light_positive"
    },
    "currentMood": "energetic",
    "adaptations": {
      "userMood": "motivated",
      "timeOfDay": "evening",
      "recentProgress": "good"
    }
  }
}
```

### Análise e Orientação

#### POST /evo/analyze-photo
Análise corporal por IA (Premium)

**Request**:
```json
{
  "photoUrl": "https://user-photos.evolveyou.com/user_123/progress_001.jpg",
  "type": "progress", // "progress", "posture", "form"
  "previousPhotoUrl": "https://user-photos.evolveyou.com/user_123/initial.jpg",
  "metadata": {
    "date": "2025-08-16",
    "weight": 78,
    "bodyFat": 14
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis_123",
    "type": "progress",
    "results": {
      "overallProgress": "positive",
      "changes": [
        {
          "area": "abdominal",
          "change": "fat_reduction",
          "confidence": 85,
          "description": "Redução visível de gordura abdominal"
        },
        {
          "area": "shoulders",
          "change": "muscle_gain",
          "confidence": 78,
          "description": "Aumento da definição dos deltóides"
        }
      ],
      "measurements": {
        "estimatedBodyFat": 13.2,
        "muscleDefinition": 7.8,
        "posture": 8.5
      }
    },
    "evoFeedback": "Parabéns João! Posso ver uma evolução clara em apenas 2 semanas. A redução de gordura abdominal está evidente e seus ombros estão mais definidos. Continue assim! 💪",
    "recommendations": [
      "Manter consistência na dieta",
      "Aumentar ligeiramente a carga nos exercícios de ombro",
      "Adicionar exercícios específicos para core"
    ],
    "nextPhotoSuggestion": "2025-08-30"
  }
}
```

#### GET /evo/guidance/{type}
Obter orientações específicas

**Tipos disponíveis**: `nutrition`, `workout`, `motivation`, `technique`

**Response para /evo/guidance/nutrition**:
```json
{
  "success": true,
  "data": {
    "type": "nutrition",
    "guidance": {
      "title": "Dicas Nutricionais Personalizadas",
      "tips": [
        {
          "category": "hydration",
          "tip": "Beba 500ml de água ao acordar para acelerar o metabolismo",
          "importance": "high",
          "timing": "morning"
        },
        {
          "category": "protein",
          "tip": "Consuma proteína em todas as refeições para manter a saciedade",
          "importance": "high",
          "timing": "all_meals"
        }
      ],
      "personalizedAdvice": "Com base no seu objetivo de perda de peso, foque em alimentos com alta densidade nutricional e baixa densidade calórica.",
      "audioUrl": "https://assets.evolveyou.com/audio/nutrition_guidance_123.mp3"
    }
  }
}
```

### Motivação e Coaching

#### GET /evo/motivation
Obter mensagem motivacional personalizada

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "João, você já completou 80% dos treinos desta semana! Isso é consistência de campeão! 🏆 Lembre-se: cada treino te aproxima do seu objetivo. Vamos finalizar a semana com chave de ouro?",
    "type": "achievement",
    "mood": "celebratory",
    "context": {
      "weekProgress": 80,
      "streak": 5,
      "nextGoal": "complete_week"
    },
    "audioUrl": "https://assets.evolveyou.com/audio/motivation_123.mp3",
    "visualElements": {
      "emoji": "🏆",
      "color": "#FFD700",
      "animation": "celebration"
    }
  }
}
```

#### POST /evo/celebration
Celebrar conquista do usuário

**Request**:
```json
{
  "achievement": "first_week_completed",
  "data": {
    "workoutsCompleted": 4,
    "mealsLogged": 35,
    "weightLoss": 0.8
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "celebration": {
      "message": "🎉 PRIMEIRA SEMANA CONCLUÍDA! 🎉\n\nJoão, que semana incrível! Você:\n✅ Completou 4 treinos\n✅ Registrou 35 refeições\n✅ Perdeu 0.8kg\n\nIsso é o que eu chamo de DETERMINAÇÃO! Continue assim e seus objetivos serão alcançados! 💪",
      "rewards": [
        {
          "type": "badge",
          "name": "Primeira Semana",
          "icon": "🏅"
        }
      ],
      "nextMilestone": {
        "name": "Primeira Meta Mensal",
        "progress": 25,
        "target": "4_weeks"
      }
    }
  }
}
```

### Funcionalidades Premium

#### POST /evo/guided-workout
Treino guiado pela EVO (Premium)

**Request**:
```json
{
  "workoutId": "workout_plan_123",
  "exerciseId": "ex_001",
  "setNumber": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "guidance": {
      "preExercise": {
        "instruction": "Vamos começar o supino reto! Posicione-se no banco, pés firmes no chão.",
        "audioUrl": "https://assets.evolveyou.com/audio/bench_press_setup.mp3",
        "duration": 10
      },
      "duringExercise": {
        "cadence": "2-1-2-1",
        "cues": [
          "Desça controlado em 2 segundos",
          "Pausa de 1 segundo no peito",
          "Suba explosivo em 2 segundos",
          "Pausa de 1 segundo no topo"
        ],
        "audioUrl": "https://assets.evolveyou.com/audio/bench_press_execution.mp3"
      },
      "postExercise": {
        "feedback": "Excelente execução! Mantenha essa técnica na próxima série.",
        "restTimer": 90,
        "nextSetPreparation": "Na próxima série, foque ainda mais na retração das escápulas."
      }
    },
    "realTimeCoaching": {
      "enabled": true,
      "cues": [
        {
          "timing": "start",
          "message": "Respire fundo e mantenha o core contraído"
        },
        {
          "timing": "mid_rep",
          "message": "Controle a descida, não deixe a barra cair"
        }
      ]
    }
  }
}
```

#### GET /evo/progress-report
Relatório de progresso detalhado (Premium)

**Query Parameters**:
- `period`: Período do relatório (week/month/quarter)
- `includePhotos`: Incluir análise de fotos (true/false)

**Response**:
```json
{
  "success": true,
  "data": {
    "reportId": "report_123",
    "period": "month",
    "dateRange": {
      "start": "2025-07-16",
      "end": "2025-08-16"
    },
    "summary": {
      "overallProgress": "excellent",
      "score": 8.7,
      "achievements": [
        "Perdeu 3.2kg",
        "Ganhou força em todos os exercícios",
        "Manteve consistência de 90%"
      ]
    },
    "metrics": {
      "weight": {
        "start": 80,
        "current": 76.8,
        "change": -3.2,
        "trend": "decreasing"
      },
      "bodyComposition": {
        "estimatedBodyFat": {
          "start": 15,
          "current": 13.2,
          "change": -1.8
        },
        "muscleMass": {
          "trend": "maintained",
          "quality": "improved"
        }
      },
      "performance": {
        "strengthGains": [
          {
            "exercise": "Supino reto",
            "startWeight": 70,
            "currentWeight": 80,
            "improvement": 14.3
          }
        ],
        "endurance": {
          "improvement": "moderate",
          "metrics": ["Menor fadiga", "Recuperação mais rápida"]
        }
      }
    },
    "evoAnalysis": "João, seu progresso este mês foi excepcional! A combinação de perda de gordura com manutenção da massa muscular mostra que nossa estratégia está funcionando perfeitamente. Seus ganhos de força são evidência de que você está evoluindo não apenas esteticamente, mas funcionalmente também.",
    "recommendations": {
      "nextMonth": [
        "Aumentar ligeiramente a intensidade dos treinos",
        "Incluir exercícios de mobilidade",
        "Manter a consistência nutricional"
      ],
      "adjustments": [
        {
          "type": "diet",
          "change": "Aumentar calorias em 100kcal para suportar ganhos de força"
        },
        {
          "type": "workout",
          "change": "Adicionar exercícios unilaterais para correção de assimetrias"
        }
      ]
    },
    "photoComparison": {
      "available": true,
      "improvements": [
        "Redução visível de gordura abdominal",
        "Maior definição muscular nos braços",
        "Melhora na postura"
      ],
      "beforeAfterUrl": "https://assets.evolveyou.com/reports/comparison_123.jpg"
    }
  }
}
```

---

## 🔐 Códigos de Status e Erros

### Códigos de Sucesso
- `200` - OK
- `201` - Created
- `204` - No Content

### Códigos de Erro
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Premium required)
- `404` - Not Found
- `429` - Too Many Requests (Rate limit)
- `500` - Internal Server Error

### Formato de Erro
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha incorretos",
    "details": {
      "field": "password",
      "reason": "incorrect"
    }
  }
}
```

---

## 📊 Rate Limiting

### Limites por Plano
- **Gratuito**: 100 requests/15min
- **Premium**: 1000 requests/15min
- **Admin**: Sem limite

### Headers de Rate Limit
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1692181200
```

---

## 🔒 Autenticação Premium

### Verificação de Assinatura
Endpoints premium verificam automaticamente:
1. Token JWT válido
2. Assinatura ativa
3. Plano com acesso à funcionalidade

### Resposta para Usuário Não Premium
```json
{
  "success": false,
  "error": {
    "code": "PREMIUM_REQUIRED",
    "message": "Esta funcionalidade requer assinatura premium",
    "upgradeUrl": "https://app.evolveyou.com.br/premium",
    "features": [
      "Treino guiado pela EVO",
      "Análise corporal por IA",
      "Relatórios detalhados"
    ]
  }
}
```

---

**Esta documentação cobre todas as APIs necessárias para implementar o EvolveYou completo conforme o projeto original. Cada endpoint foi projetado para suportar a experiência única que torna o aplicativo revolucionário no mercado de fitness e nutrição.**

