import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';
import '../widgets/evo_avatar_widget.dart';
import '../widgets/custom_button.dart';

/// Tela de boas-vindas com apresentação do EVO
class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with TickerProviderStateMixin {
  late PageController _pageController;
  int _currentPage = 0;
  
  final List<WelcomePageData> _pages = [
    WelcomePageData(
      title: 'Conheça o EVO',
      subtitle: 'Seu personal trainer digital',
      description: 'Olá! Eu sou o EVO, sua inteligência artificial dedicada a transformar sua jornada fitness. Vou te acompanhar em cada passo!',
      evoState: EvoState.talking,
      evoMessage: EvoMessages.getWelcomeMessage(),
    ),
    WelcomePageData(
      title: 'Planos Personalizados',
      subtitle: 'Feitos especialmente para você',
      description: 'Criarei treinos e dietas 100% personalizados baseados no seu perfil, objetivos e preferências. Nada de receitas prontas!',
      evoState: EvoState.thinking,
      evoMessage: 'Vou analisar seu perfil e criar o plano perfeito! 🎯',
    ),
    WelcomePageData(
      title: 'Acompanhamento Inteligente',
      subtitle: 'Evolução em tempo real',
      description: 'Monitoro seu progresso 24/7 e ajusto seus planos automaticamente. Cada dia é uma nova oportunidade de evolução!',
      evoState: EvoState.analyzing,
      evoMessage: 'Seus dados me ajudam a te ajudar melhor! 📊',
    ),
    WelcomePageData(
      title: 'Motivação Constante',
      subtitle: 'Nunca desista dos seus sonhos',
      description: 'Estarei sempre aqui para te motivar, celebrar suas conquistas e te ajudar a superar os desafios. Juntos somos mais fortes!',
      evoState: EvoState.encouraging,
      evoMessage: 'Você consegue! Eu acredito em você! 💪',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: AppConstants.mediumAnimation,
        curve: Curves.easeInOut,
      );
    } else {
      _navigateToRegister();
    }
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: AppConstants.mediumAnimation,
        curve: Curves.easeInOut,
      );
    }
  }

  void _navigateToRegister() {
    Navigator.of(context).pushNamed('/register');
  }

  void _navigateToLogin() {
    Navigator.of(context).pushNamed('/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppColors.primary.withOpacity(0.1),
              AppColors.surface,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header com skip
              _buildHeader(),
              
              // Conteúdo das páginas
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (index) {
                    setState(() {
                      _currentPage = index;
                    });
                  },
                  itemCount: _pages.length,
                  itemBuilder: (context, index) {
                    return _buildPage(_pages[index]);
                  },
                ),
              ),
              
              // Indicadores de página
              _buildPageIndicators(),
              
              const SizedBox(height: 24),
              
              // Botões de navegação
              _buildNavigationButtons(),
              
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Logo pequeno
          Text(
            AppConstants.appName,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          
          // Botão Skip
          if (_currentPage < _pages.length - 1)
            TextButton(
              onPressed: () {
                _pageController.animateToPage(
                  _pages.length - 1,
                  duration: AppConstants.mediumAnimation,
                  curve: Curves.easeInOut,
                );
              },
              child: Text(
                'Pular',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPage(WelcomePageData pageData) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const Spacer(),
          
          // Avatar EVO
          EvoAvatarWidget(
            state: pageData.evoState,
            context: EvoContext.welcome,
            message: pageData.evoMessage,
            size: 140,
            onTap: () {
              // Animação de interação
              setState(() {
                // Atualizar estado do EVO
              });
            },
          )
              .animate()
              .scale(
                begin: const Offset(0.8, 0.8),
                end: const Offset(1.0, 1.0),
                duration: AppConstants.mediumAnimation,
                curve: Curves.elasticOut,
              )
              .fadeIn(duration: AppConstants.mediumAnimation),
          
          const SizedBox(height: 32),
          
          // Título
          Text(
            pageData.title,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          )
              .animate()
              .slideY(
                begin: 0.3,
                end: 0,
                duration: AppConstants.mediumAnimation,
              )
              .fadeIn(
                delay: 200.ms,
                duration: AppConstants.mediumAnimation,
              ),
          
          const SizedBox(height: 8),
          
          // Subtítulo
          Text(
            pageData.subtitle,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          )
              .animate()
              .slideY(
                begin: 0.3,
                end: 0,
                duration: AppConstants.mediumAnimation,
              )
              .fadeIn(
                delay: 400.ms,
                duration: AppConstants.mediumAnimation,
              ),
          
          const SizedBox(height: 24),
          
          // Descrição
          Text(
            pageData.description,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.textSecondary,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          )
              .animate()
              .slideY(
                begin: 0.3,
                end: 0,
                duration: AppConstants.mediumAnimation,
              )
              .fadeIn(
                delay: 600.ms,
                duration: AppConstants.mediumAnimation,
              ),
          
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  Widget _buildPageIndicators() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(_pages.length, (index) {
        return AnimatedContainer(
          duration: AppConstants.shortAnimation,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: _currentPage == index ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: _currentPage == index
                ? AppColors.primary
                : AppColors.primary.withOpacity(0.3),
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }

  Widget _buildNavigationButtons() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          // Botão principal
          CustomButton(
            text: _currentPage == _pages.length - 1
                ? 'Começar Minha Jornada'
                : 'Continuar',
            type: CustomButtonType.primary,
            size: CustomButtonSize.large,
            onPressed: _nextPage,
          )
              .animate()
              .slideY(
                begin: 0.2,
                end: 0,
                duration: AppConstants.mediumAnimation,
              )
              .fadeIn(
                delay: 800.ms,
                duration: AppConstants.mediumAnimation,
              ),
          
          const SizedBox(height: 16),
          
          // Botões secundários
          Row(
            children: [
              // Botão Voltar
              if (_currentPage > 0)
                Expanded(
                  child: CustomButton(
                    text: 'Voltar',
                    type: CustomButtonType.outline,
                    onPressed: _previousPage,
                  ),
                ),
              
              if (_currentPage > 0) const SizedBox(width: 16),
              
              // Botão Já tenho conta
              Expanded(
                child: CustomButton(
                  text: 'Já tenho conta',
                  type: CustomButtonType.text,
                  onPressed: _navigateToLogin,
                ),
              ),
            ],
          )
              .animate()
              .slideY(
                begin: 0.2,
                end: 0,
                duration: AppConstants.mediumAnimation,
              )
              .fadeIn(
                delay: 1000.ms,
                duration: AppConstants.mediumAnimation,
              ),
        ],
      ),
    );
  }
}

/// Modelo de dados para páginas de welcome
class WelcomePageData {
  final String title;
  final String subtitle;
  final String description;
  final EvoState evoState;
  final String evoMessage;

  WelcomePageData({
    required this.title,
    required this.subtitle,
    required this.description,
    required this.evoState,
    required this.evoMessage,
  });
}

