import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';
import '../services/auth_service_simple.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/loading_overlay.dart';
import '../widgets/evo_avatar_widget.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final success = await authService.signInWithEmailAndPassword(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (success && mounted) {
        Navigator.of(context).pushReplacementNamed('/main');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao fazer login: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _loginWithGoogle() async {
    setState(() => _isLoading = true);

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final success = await authService.signInWithGoogle();

      if (success && mounted) {
        Navigator.of(context).pushReplacementNamed('/main');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao fazer login com Google: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: Container(
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
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 32),
                    
                    // Avatar EVO
                    Center(
                      child: EvoAvatarWidget(
                        state: EvoState.talking,
                        context: EvoContext.welcome,
                        message: 'Que bom te ver de volta! 😊',
                        size: 120,
                      ),
                    )
                        .animate()
                        .scale(
                          begin: const Offset(0.8, 0.8),
                          duration: AppConstants.mediumAnimation,
                          curve: Curves.elasticOut,
                        )
                        .fadeIn(),
                    
                    const SizedBox(height: 32),
                    
                    // Título
                    Text(
                      'Bem-vindo de volta!',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                      textAlign: TextAlign.center,
                    )
                        .animate()
                        .slideY(begin: 0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 200.ms),
                    
                    const SizedBox(height: 8),
                    
                    Text(
                      'Continue sua jornada de evolução',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    )
                        .animate()
                        .slideY(begin: 0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 400.ms),
                    
                    const SizedBox(height: 48),
                    
                    // Campo Email
                    CustomTextField(
                      controller: _emailController,
                      label: 'E-mail',
                      hint: 'Digite seu e-mail',
                      keyboardType: TextInputType.emailAddress,
                      prefixIcon: Icons.email_outlined,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'E-mail é obrigatório';
                        }
                        if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value!)) {
                          return 'E-mail inválido';
                        }
                        return null;
                      },
                    )
                        .animate()
                        .slideX(begin: -0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 600.ms),
                    
                    const SizedBox(height: 16),
                    
                    // Campo Senha
                    CustomTextField(
                      controller: _passwordController,
                      label: 'Senha',
                      hint: 'Digite sua senha',
                      obscureText: _obscurePassword,
                      prefixIcon: Icons.lock_outlined,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Senha é obrigatória';
                        }
                        return null;
                      },
                    )
                        .animate()
                        .slideX(begin: 0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 800.ms),
                    
                    const SizedBox(height: 24),
                    
                    // Esqueci a senha
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () {
                          // Implementar reset de senha
                        },
                        child: Text(
                          'Esqueci minha senha',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    )
                        .animate()
                        .fadeIn(delay: 1000.ms),
                    
                    const SizedBox(height: 32),
                    
                    // Botão Login
                    CustomButton(
                      text: 'Entrar',
                      type: CustomButtonType.primary,
                      size: CustomButtonSize.large,
                      onPressed: _login,
                    )
                        .animate()
                        .slideY(begin: 0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 1200.ms),
                    
                    const SizedBox(height: 24),
                    
                    // Divisor
                    Row(
                      children: [
                        Expanded(child: Divider(color: AppColors.border)),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'ou',
                            style: TextStyle(color: AppColors.textSecondary),
                          ),
                        ),
                        Expanded(child: Divider(color: AppColors.border)),
                      ],
                    )
                        .animate()
                        .fadeIn(delay: 1400.ms),
                    
                    const SizedBox(height: 24),
                    
                    // Botão Google
                    CustomButton(
                      text: 'Continuar com Google',
                      type: CustomButtonType.outline,
                      size: CustomButtonSize.large,
                      onPressed: _loginWithGoogle,
                    )
                        .animate()
                        .slideY(begin: 0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 1600.ms),
                    
                    const SizedBox(height: 32),
                    
                    // Link para registro
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Não tem uma conta? ',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).pushReplacementNamed('/register');
                          },
                          child: Text(
                            'Cadastre-se',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    )
                        .animate()
                        .fadeIn(delay: 1800.ms),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

