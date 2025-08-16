import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';
import 'dashboard_screen.dart';
import 'workout_screen.dart';
import 'nutrition_screen.dart';
import 'progress_screen.dart';
import 'profile_screen.dart';

/// Tela principal de navegação com bottom navigation bar
class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen>
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  late PageController _pageController;
  late AnimationController _fabAnimationController;
  late Animation<double> _fabAnimation;

  // Lista de telas
  final List<Widget> _screens = [
    const DashboardScreen(),
    const WorkoutScreen(),
    const NutritionScreen(),
    const ProgressScreen(),
    const ProfileScreen(),
  ];

  // Configuração das abas
  final List<NavigationItem> _navigationItems = [
    NavigationItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home,
      label: 'Hoje',
      color: AppColors.primary,
    ),
    NavigationItem(
      icon: Icons.fitness_center_outlined,
      activeIcon: Icons.fitness_center,
      label: 'Treino',
      color: AppColors.accent,
    ),
    NavigationItem(
      icon: Icons.restaurant_outlined,
      activeIcon: Icons.restaurant,
      label: 'Nutrição',
      color: AppColors.secondary,
    ),
    NavigationItem(
      icon: Icons.analytics_outlined,
      activeIcon: Icons.analytics,
      label: 'Progresso',
      color: AppColors.success,
    ),
    NavigationItem(
      icon: Icons.person_outline,
      activeIcon: Icons.person,
      label: 'Perfil',
      color: AppColors.warning,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _currentIndex);
    
    _fabAnimationController = AnimationController(
      duration: AppConstants.mediumAnimation,
      vsync: this,
    );
    
    _fabAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fabAnimationController,
      curve: Curves.elasticOut,
    ));

    _fabAnimationController.forward();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _fabAnimationController.dispose();
    super.dispose();
  }

  void _onTabTapped(int index) {
    if (index == _currentIndex) {
      // Se já está na aba, fazer scroll para o topo
      _scrollToTop();
      return;
    }

    setState(() {
      _currentIndex = index;
    });

    _pageController.animateToPage(
      index,
      duration: AppConstants.mediumAnimation,
      curve: Curves.easeInOut,
    );

    // Animação do FAB
    _fabAnimationController.reset();
    _fabAnimationController.forward();

    // Feedback tátil
    HapticFeedback.lightImpact();
  }

  void _scrollToTop() {
    // Implementar scroll para o topo da tela atual
    // Isso seria feito através de um controller específico de cada tela
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        children: _screens,
      ),
      
      bottomNavigationBar: _buildBottomNavigationBar(),
      
      // FAB para ação rápida (opcional)
      floatingActionButton: _buildFloatingActionButton(),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  Widget _buildBottomNavigationBar() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Container(
          height: 80,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: _navigationItems.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              final isActive = index == _currentIndex;

              return _buildNavigationItem(item, index, isActive);
            }).toList(),
          ),
        ),
      ),
    );
  }

  Widget _buildNavigationItem(NavigationItem item, int index, bool isActive) {
    return GestureDetector(
      onTap: () => _onTabTapped(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: AppConstants.shortAnimation,
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? item.color.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedSwitcher(
              duration: AppConstants.shortAnimation,
              child: Icon(
                isActive ? item.activeIcon : item.icon,
                key: ValueKey(isActive),
                color: isActive ? item.color : AppColors.textSecondary,
                size: 24,
              ),
            ),
            const SizedBox(height: 4),
            AnimatedDefaultTextStyle(
              duration: AppConstants.shortAnimation,
              style: Theme.of(context).textTheme.bodySmall!.copyWith(
                color: isActive ? item.color : AppColors.textSecondary,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                fontSize: isActive ? 12 : 11,
              ),
              child: Text(item.label),
            ),
          ],
        ),
      ),
    )
        .animate(target: isActive ? 1 : 0)
        .scale(
          begin: const Offset(1.0, 1.0),
          end: const Offset(1.1, 1.1),
          duration: AppConstants.shortAnimation,
        );
  }

  Widget? _buildFloatingActionButton() {
    // FAB apenas na tela de treino para ação rápida
    if (_currentIndex != 1) return null;

    return ScaleTransition(
      scale: _fabAnimation,
      child: FloatingActionButton(
        onPressed: () {
          // Ação rápida - iniciar treino
          _startQuickWorkout();
        },
        backgroundColor: AppColors.accent,
        foregroundColor: AppColors.white,
        elevation: 8,
        child: const Icon(Icons.play_arrow, size: 28),
      ),
    );
  }

  void _startQuickWorkout() {
    // Implementar início rápido de treino
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Iniciando treino rápido...'),
        backgroundColor: AppColors.accent,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}

/// Modelo para itens de navegação
class NavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final Color color;

  NavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.color,
  });
}

/// Mixin para controle de scroll nas telas
mixin ScrollToTopMixin<T extends StatefulWidget> on State<T> {
  ScrollController? get scrollController;

  void scrollToTop() {
    if (scrollController?.hasClients == true) {
      scrollController!.animateTo(
        0,
        duration: AppConstants.mediumAnimation,
        curve: Curves.easeInOut,
      );
    }
  }
}

