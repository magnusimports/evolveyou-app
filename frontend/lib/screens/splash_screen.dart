import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';
import '../services/auth_service_simple.dart';
import '../widgets/evo_avatar_widget.dart';

/// Tela de splash com logo EVO animado
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _textController;
  late AnimationController _backgroundController;
  
  late Animation<double> _logoScale;
  late Animation<double> _logoRotation;
  late Animation<double> _textOpacity;
  late Animation<Color?> _backgroundColor;

  @override
  void initState() {
    super.initState();
    
    _logoController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    
    _textController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _backgroundController = AnimationController(
      duration: const Duration(milliseconds: 3000),
      vsync: this,
    );

    _logoScale = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _logoController,
      curve: Curves.elasticOut,
    ));

    _logoRotation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _logoController,
      curve: Curves.easeInOut,
    ));

    _textOpacity = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _textController,
      curve: Curves.easeIn,
    ));

    _backgroundColor = ColorTween(
      begin: AppColors.primary,
      end: AppColors.surface,
    ).animate(CurvedAnimation(
      parent: _backgroundController,
      curve: Curves.easeInOut,
    ));

    _startAnimations();
  }

  @override
  void dispose() {
    _logoController.dispose();
    _textController.dispose();
    _backgroundController.dispose();
    super.dispose();
  }

  void _startAnimations() async {
    // Iniciar animações em sequência
    _backgroundController.forward();
    
    await Future.delayed(const Duration(milliseconds: 500));
    _logoController.forward();
    
    await Future.delayed(const Duration(milliseconds: 800));
    _textController.forward();
    
    // Aguardar um pouco e verificar autenticação
    await Future.delayed(const Duration(milliseconds: 2000));
    _checkAuthenticationAndNavigate();
  }

  void _checkAuthenticationAndNavigate() async {
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      
      // Verificar se o usuário está logado
      final isLoggedIn = await authService.isUserLoggedIn();
      
      if (!mounted) return;
      
      if (isLoggedIn) {
        // Verificar se completou onboarding
        final hasCompletedOnboarding = await authService.hasCompletedOnboarding();
        
        if (hasCompletedOnboarding) {
          Navigator.of(context).pushReplacementNamed('/main');
        } else {
          Navigator.of(context).pushReplacementNamed('/onboarding');
        }
      } else {
        Navigator.of(context).pushReplacementNamed('/welcome');
      }
    } catch (e) {
      // Em caso de erro, ir para welcome
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/welcome');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBuilder(
        animation: _backgroundColor,
        builder: (context, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  _backgroundColor.value ?? AppColors.primary,
                  (_backgroundColor.value ?? AppColors.primary).withOpacity(0.8),
                ],
              ),
            ),
            child: SafeArea(
              child: Column(
                children: [
                  // Espaço superior
                  const Spacer(flex: 2),
                  
                  // Logo EVO animado
                  _buildAnimatedLogo(),
                  
                  const SizedBox(height: 32),
                  
                  // Texto animado
                  _buildAnimatedText(),
                  
                  // Espaço inferior
                  const Spacer(flex: 3),
                  
                  // Loading indicator
                  _buildLoadingIndicator(),
                  
                  const SizedBox(height: 32),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildAnimatedLogo() {
    return AnimatedBuilder(
      animation: Listenable.merge([_logoScale, _logoRotation]),
      builder: (context, child) {
        return Transform.scale(
          scale: _logoScale.value,
          child: Transform.rotate(
            angle: _logoRotation.value * 0.1, // Rotação sutil
            child: Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.white.withOpacity(0.3),
                    blurRadius: 30,
                    spreadRadius: 10,
                  ),
                ],
              ),
              child: EvoAvatarWidget(
                state: EvoState.celebrating,
                context: EvoContext.welcome,
                size: 150,
                showMessage: false,
                isAnimated: true,
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildAnimatedText() {
    return AnimatedBuilder(
      animation: _textOpacity,
      builder: (context, child) {
        return Opacity(
          opacity: _textOpacity.value,
          child: Column(
            children: [
              // Nome do app
              Text(
                AppConstants.appName,
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                  color: AppColors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              )
                  .animate()
                  .slideY(
                    begin: 0.5,
                    end: 0,
                    duration: AppConstants.mediumAnimation,
                  )
                  .fadeIn(duration: AppConstants.mediumAnimation),
              
              const SizedBox(height: 8),
              
              // Slogan
              Text(
                'Evolua a cada dia',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppColors.white.withOpacity(0.9),
                  fontWeight: FontWeight.w300,
                  letterSpacing: 1,
                ),
              )
                  .animate(delay: 200.ms)
                  .slideY(
                    begin: 0.5,
                    end: 0,
                    duration: AppConstants.mediumAnimation,
                  )
                  .fadeIn(duration: AppConstants.mediumAnimation),
              
              const SizedBox(height: 16),
              
              // Powered by
              Text(
                'Powered by EvolveYou.ia',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.white.withOpacity(0.7),
                  fontWeight: FontWeight.w400,
                ),
              )
                  .animate(delay: 400.ms)
                  .fadeIn(duration: AppConstants.mediumAnimation),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLoadingIndicator() {
    return Column(
      children: [
        // Indicador de progresso customizado
        Container(
          width: 200,
          height: 4,
          decoration: BoxDecoration(
            color: AppColors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(2),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              backgroundColor: Colors.transparent,
              valueColor: AlwaysStoppedAnimation<Color>(
                AppColors.white.withOpacity(0.8),
              ),
            ),
          ),
        )
            .animate(delay: 1000.ms)
            .fadeIn(duration: AppConstants.shortAnimation)
            .slideY(begin: 0.2, end: 0),
        
        const SizedBox(height: 16),
        
        // Texto de loading
        Text(
          'Preparando sua jornada...',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.white.withOpacity(0.8),
          ),
        )
            .animate(delay: 1200.ms)
            .fadeIn(duration: AppConstants.shortAnimation),
      ],
    );
  }
}

/// Widget de loading customizado com pontos animados
class AnimatedDots extends StatefulWidget {
  final Color color;
  final double size;

  const AnimatedDots({
    super.key,
    required this.color,
    this.size = 8,
  });

  @override
  State<AnimatedDots> createState() => _AnimatedDotsState();
}

class _AnimatedDotsState extends State<AnimatedDots>
    with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  late List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    
    _controllers = List.generate(3, (index) {
      return AnimationController(
        duration: const Duration(milliseconds: 600),
        vsync: this,
      );
    });

    _animations = _controllers.map((controller) {
      return Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(parent: controller, curve: Curves.easeInOut),
      );
    }).toList();

    _startAnimations();
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _startAnimations() async {
    while (mounted) {
      for (int i = 0; i < _controllers.length; i++) {
        if (mounted) {
          _controllers[i].forward();
          await Future.delayed(const Duration(milliseconds: 200));
        }
      }
      
      await Future.delayed(const Duration(milliseconds: 400));
      
      for (var controller in _controllers) {
        if (mounted) {
          controller.reverse();
        }
      }
      
      await Future.delayed(const Duration(milliseconds: 600));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (index) {
        return AnimatedBuilder(
          animation: _animations[index],
          builder: (context, child) {
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 2),
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                color: widget.color.withOpacity(_animations[index].value),
                shape: BoxShape.circle,
              ),
            );
          },
        );
      }),
    );
  }
}

