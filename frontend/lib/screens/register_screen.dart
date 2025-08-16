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

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _acceptTerms = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (!_acceptTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Você deve aceitar os termos de uso'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final success = await authService.createUserWithEmailAndPassword(
        _emailController.text.trim(),
        _passwordController.text,
        _nameController.text.trim(),
      );

      if (success && mounted) {
        Navigator.of(context).pushReplacementNamed('/onboarding');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao criar conta: $e'),
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
                    const SizedBox(height: 16),
                    
                    // Avatar EVO
                    Center(
                      child: EvoAvatarWidget(
                        state: EvoState.encouraging,
                        context: EvoContext.welcome,
                        message: 'Vamos começar sua jornada! 🚀',
                        size: 100,
                      ),
                    )
                        .animate()
                        .scale(
                          begin: const Offset(0.8, 0.8),
                          duration: AppConstants.mediumAnimation,
                          curve: Curves.elasticOut,
                        )
                        .fadeIn(),
                    
                    const SizedBox(height: 24),
                    
                    // Título
                    Text(
                      'Crie sua conta',
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
                      'Comece sua transformação hoje',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    )
                        .animate()
                        .slideY(begin: 0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 400.ms),
                    
                    const SizedBox(height: 32),
                    
                    // Campo Nome
                    CustomTextField(
                      controller: _nameController,
                      label: 'Nome completo',
                      hint: 'Digite seu nome',
                      keyboardType: TextInputType.name,
                      prefixIcon: Icons.person_outlined,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Nome é obrigatório';
                        }
                        if (value!.length < 2) {
                          return 'Nome deve ter pelo menos 2 caracteres';
                        }
                        return null;
                      },
                    )
                        .animate()
                        .slideX(begin: -0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 600.ms),
                    
                    const SizedBox(height: 16),
                    
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
                        .slideX(begin: 0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 800.ms),
                    
                    const SizedBox(height: 16),
                    
                    // Campo Senha
                    CustomTextField(
                      controller: _passwordController,
                      label: 'Senha',
                      hint: 'Crie uma senha forte',
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
                        if (value!.length < 6) {
                          return 'Senha deve ter pelo menos 6 caracteres';
                        }
                        return null;
                      },
                    )
                        .animate()
                        .slideX(begin: -0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 1000.ms),
                    
                    const SizedBox(height: 16),
                    
                    // Campo Confirmar Senha
                    CustomTextField(
                      controller: _confirmPasswordController,
                      label: 'Confirmar senha',
                      hint: 'Digite a senha novamente',
                      obscureText: _obscureConfirmPassword,
                      prefixIcon: Icons.lock_outlined,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscureConfirmPassword = !_obscureConfirmPassword;
                          });
                        },
                      ),
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Confirmação de senha é obrigatória';
                        }
                        if (value != _passwordController.text) {
                          return 'Senhas não coincidem';
                        }
                        return null;
                      },
                    )
                        .animate()
                        .slideX(begin: 0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 1200.ms),
                    
                    const SizedBox(height: 24),
                    
                    // Checkbox Termos
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Checkbox(
                          value: _acceptTerms,
                          onChanged: (value) {
                            setState(() {
                              _acceptTerms = value ?? false;
                            });
                          },
                          activeColor: AppColors.primary,
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _acceptTerms = !_acceptTerms;
                              });
                            },
                            child: Padding(
                              padding: const EdgeInsets.only(top: 12),
                              child: RichText(
                                text: TextSpan(
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                  children: [
                                    const TextSpan(text: 'Eu aceito os '),
                                    TextSpan(
                                      text: 'Termos de Uso',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const TextSpan(text: ' e '),
                                    TextSpan(
                                      text: 'Política de Privacidade',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    )
                        .animate()
                        .fadeIn(delay: 1400.ms),
                    
                    const SizedBox(height: 32),
                    
                    // Botão Criar Conta
                    CustomButton(
                      text: 'Criar Conta',
                      type: CustomButtonType.primary,
                      size: CustomButtonSize.large,
                      onPressed: _register,
                    )
                        .animate()
                        .slideY(begin: 0.3, duration: AppConstants.mediumAnimation)
                        .fadeIn(delay: 1600.ms),
                    
                    const SizedBox(height: 32),
                    
                    // Link para login
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Já tem uma conta? ',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).pushReplacementNamed('/login');
                          },
                          child: Text(
                            'Faça login',
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

