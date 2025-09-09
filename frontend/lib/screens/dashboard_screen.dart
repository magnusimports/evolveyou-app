import 'package:flutter/material.dart';
import 'package:evolveyou_app/frontend/lib/components/WorkoutPlanCard.dart';
import 'package:evolveyou_app/frontend/lib/components/DietPlanCard.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Dashboard"),
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 600) {
            // Layout para telas maiores (web, tablet)
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Plano de Treino",
                          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        WorkoutPlanCard(
                          title: "Treino do Dia",
                          description: "Treino de força para membros superiores.",
                          onTap: () {
                            print("Treino do Dia clicado!");
                          },
                        ),
                      ],
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Plano de Dieta",
                          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        DietPlanCard(
                          title: "Dieta Semanal",
                          description: "Plano alimentar para ganho de massa.",
                          onTap: () {
                            print("Dieta Semanal clicada!");
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          } else {
            // Layout para telas menores (mobile)
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Plano de Treino",
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  WorkoutPlanCard(
                    title: "Treino do Dia",
                    description: "Treino de força para membros superiores.",
                    onTap: () {
                      print("Treino do Dia clicado!");
                    },
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    "Plano de Dieta",
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  DietPlanCard(
                    title: "Dieta Semanal",
                    description: "Plano alimentar para ganho de massa.",
                    onTap: () {
                      print("Dieta Semanal clicada!");
                    },
                  ),
                ],
              ),
            );
          }
        },
      ),
    );
  }
}


