import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';

/// Estados do avatar EVO
enum EvoState {
  idle,
  talking,
  celebrating,
  thinking,
  encouraging,
  analyzing,
}

/// Contextos onde o EVO aparece
enum EvoContext {
  welcome,
  dashboard,
  workout,
  nutrition,
  progress,
  achievement,
}

/// Widget do avatar EVO da EvolveYou
class EvoAvatarWidget extends StatefulWidget {
  final EvoState state;
  final EvoContext context;
  final String? message;
  final double size;
  final VoidCallback? onTap;
  final bool showMessage;
  final bool isAnimated;
  final EdgeInsetsGeometry? padding;

  const EvoAvatarWidget({
    super.key,
    this.state = EvoState.idle,
    this.context = EvoContext.dashboard,
    this.message,
    this.size = 120,
    this.onTap,
    this.showMessage = true,
    this.isAnimated = true,
    this.padding,
  });

  @override
  State<EvoAvatarWidget> createState() => _EvoAvatarWidgetState();
}

class _EvoAvatarWidgetState extends State<EvoAvatarWidget>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _bounceController;
  late AnimationController _glowController;
  
  late Animation<double> _pulseAnimation;
  late Animation<double> _bounceAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    
    _bounceController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    _bounceAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _bounceController,
      curve: Curves.elasticOut,
    ));

    _glowAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));

    if (widget.isAnimated) {
      _startIdleAnimation();
    }
  }

  @override
  void didUpdateWidget(EvoAvatarWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    
    if (widget.state != oldWidget.state) {
      _handleStateChange();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _bounceController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  void _startIdleAnimation() {
    _pulseController.repeat(reverse: true);
  }

  void _handleStateChange() {
    switch (widget.state) {
      case EvoState.celebrating:
        _bounceController.forward().then((_) {
          _bounceController.reverse();
        });
        break;
      case EvoState.thinking:
        _glowController.repeat(reverse: true);
        break;
      case EvoState.encouraging:
        _pulseController.stop();
        _pulseController.repeat(reverse: true);
        break;
      case EvoState.talking:
        _pulseController.stop();
        _pulseController.repeat(reverse: true);
        break;
      case EvoState.analyzing:
        _glowController.repeat(reverse: true);
        break;
      case EvoState.idle:
      default:
        _startIdleAnimation();
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: widget.padding ?? const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildAvatar(),
          if (widget.showMessage && widget.message != null) ...[
            const SizedBox(height: 12),
            _buildMessageBubble(),
          ],
        ],
      ),
    );
  }

  Widget _buildAvatar() {
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: Listenable.merge([
          _pulseAnimation,
          _bounceAnimation,
          _glowAnimation,
        ]),
        builder: (context, child) {
          return Transform.scale(
            scale: _pulseAnimation.value * (1.0 + _bounceAnimation.value * 0.1),
            child: Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: _getGlowColor().withOpacity(0.3 + _glowAnimation.value * 0.4),
                    blurRadius: 20 + _glowAnimation.value * 10,
                    spreadRadius: 2 + _glowAnimation.value * 3,
                  ),
                ],
              ),
              child: ClipOval(
                child: Image.asset(
                  'assets/images/evo_avatar.png',
                  width: widget.size,
                  height: widget.size,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return _buildFallbackAvatar();
                  },
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFallbackAvatar() {
    return Container(
      width: widget.size,
      height: widget.size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary,
            AppColors.secondary,
          ],
        ),
      ),
      child: Center(
        child: Text(
          'EVO',
          style: TextStyle(
            color: AppColors.white,
            fontSize: widget.size * 0.25,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildMessageBubble() {
    return Container(
      constraints: BoxConstraints(
        maxWidth: MediaQuery.of(context).size.width * 0.8,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Indicador de que é o EVO falando
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _getStateColor(),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'EVO',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Mensagem
          Text(
            widget.message!,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: AppConstants.shortAnimation)
        .slideY(
          begin: 0.2,
          end: 0.0,
          duration: AppConstants.shortAnimation,
          curve: Curves.easeOut,
        );
  }

  Color _getGlowColor() {
    switch (widget.state) {
      case EvoState.celebrating:
        return AppColors.success;
      case EvoState.thinking:
      case EvoState.analyzing:
        return AppColors.accent;
      case EvoState.encouraging:
        return AppColors.secondary;
      case EvoState.talking:
        return AppColors.primary;
      case EvoState.idle:
      default:
        return AppColors.primary;
    }
  }

  Color _getStateColor() {
    switch (widget.state) {
      case EvoState.celebrating:
        return AppColors.success;
      case EvoState.thinking:
      case EvoState.analyzing:
        return AppColors.warning;
      case EvoState.encouraging:
        return AppColors.secondary;
      case EvoState.talking:
        return AppColors.primary;
      case EvoState.idle:
      default:
        return AppColors.primary;
    }
  }
}

/// Mensagens contextuais do EVO
class EvoMessages {
  static String getWelcomeMessage() {
    final messages = [
      "Olá! Eu sou o EVO, seu personal trainer digital! 💪",
      "Bem-vindo à EvolveYou! Vamos transformar sua vida juntos! 🚀",
      "Oi! Pronto para começar sua jornada fitness? Eu vou te ajudar! ⭐",
    ];
    return messages[DateTime.now().millisecond % messages.length];
  }

  static String getDashboardMessage(String userName) {
    final messages = [
      "Oi $userName! Como está se sentindo hoje? 😊",
      "Vamos ver seu progresso, $userName! Você está indo muito bem! 📈",
      "$userName, que tal um treino hoje? Estou aqui para te motivar! 💪",
      "Olá $userName! Lembre-se: cada dia é uma nova oportunidade! ✨",
    ];
    return messages[DateTime.now().millisecond % messages.length];
  }

  static String getWorkoutMessage() {
    final messages = [
      "Vamos treinar! Lembre-se: forma é mais importante que peso! 🏋️",
      "Você consegue! Cada repetição te deixa mais forte! 💪",
      "Foco na respiração e na execução perfeita! 🎯",
      "Está sentindo o músculo trabalhar? Isso é progresso! 🔥",
    ];
    return messages[DateTime.now().millisecond % messages.length];
  }

  static String getNutritionMessage() {
    final messages = [
      "Alimentação é 70% do resultado! Vamos escolher bem? 🥗",
      "Cada refeição é uma oportunidade de nutrir seu corpo! 🍎",
      "Lembre-se: qualidade sempre, quantidade na medida certa! ⚖️",
      "Hidratação também é fundamental! Já bebeu água hoje? 💧",
    ];
    return messages[DateTime.now().millisecond % messages.length];
  }

  static String getProgressMessage() {
    final messages = [
      "Olha só seu progresso! Você está evoluindo muito! 📊",
      "Os números não mentem: você está no caminho certo! 📈",
      "Cada pequena melhoria conta! Continue assim! 🎯",
      "Seu esforço está dando resultado! Parabéns! 🏆",
    ];
    return messages[DateTime.now().millisecond % messages.length];
  }

  static String getEncouragementMessage() {
    final messages = [
      "Você é mais forte do que imagina! Continue! 💪",
      "Desistir nunca! Cada dia é um passo a mais! 🚀",
      "Acredite em você! Eu acredito! ⭐",
      "O sucesso é a soma de pequenos esforços diários! 🎯",
    ];
    return messages[DateTime.now().millisecond % messages.length];
  }

  static String getCelebrationMessage() {
    final messages = [
      "PARABÉNS! Você alcançou sua meta! 🎉",
      "INCRÍVEL! Continue assim que você vai longe! 🏆",
      "SUCESSO! Seu esforço valeu a pena! ⭐",
      "FANTÁSTICO! Você é uma inspiração! 🚀",
    ];
    return messages[DateTime.now().millisecond % messages.length];
  }
}

