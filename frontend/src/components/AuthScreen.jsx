import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Dumbbell, AlertCircle, CheckCircle } from 'lucide-react';
import { auth, makeAuthenticatedRequest, API_ENDPOINTS } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpar erros quando o usuário começar a digitar
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
    setError('');
  };

  // Validação de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de senha
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Validação do formulário
  const validateForm = () => {
    const errors = {};

    if (!isLogin && !formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let userCredential;
      
      if (isLogin) {
        // Login
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        setSuccess('Login realizado com sucesso!');
      } else {
        // Cadastro
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Criar perfil do usuário no backend
        try {
          await makeAuthenticatedRequest(API_ENDPOINTS.createUser, {
            method: 'POST',
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              uid: userCredential.user.uid
            })
          });
        } catch (apiError) {
          console.warn('Erro ao criar perfil no backend:', apiError);
          // Não bloquear o cadastro se a API falhar
        }
        
        setSuccess('Cadastro realizado com sucesso!');
      }

      // Preparar dados do usuário
      const userData = {
        uid: userCredential.user.uid,
        name: formData.name || userCredential.user.displayName || 'Usuário',
        email: userCredential.user.email,
        avatar: userCredential.user.photoURL
      };

      // Aguardar um pouco para mostrar a mensagem de sucesso
      setTimeout(() => {
        onLogin(userData);
      }, 1000);

    } catch (error) {
      console.error('Erro na autenticação:', error);
      
      // Tratar erros específicos do Firebase
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Este email já está em uso');
          break;
        case 'auth/weak-password':
          setError('Senha muito fraca');
          break;
        case 'auth/user-not-found':
          setError('Usuário não encontrado');
          break;
        case 'auth/wrong-password':
          setError('Senha incorreta');
          break;
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas. Tente novamente mais tarde');
          break;
        default:
          setError('Erro na autenticação. Tente novamente');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      uid: 'guest_user',
      name: 'Usuário Convidado',
      email: 'guest@evolveyou.com',
      avatar: null
    };
    onLogin(guestUser);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Digite seu email para recuperar a senha');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Digite um email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Email não encontrado');
          break;
        default:
          setError('Erro ao enviar email de recuperação');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">EvolveYou</h1>
          <p className="text-gray-400">Seu coach pessoal de fitness e nutrição</p>
        </div>

        {/* Formulário */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLogin 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isLogin 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Mensagens de feedback */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                    validationErrors.name 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-700 focus:border-purple-500'
                  }`}
                  required={!isLogin}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-red-400 text-xs">{validationErrors.name}</p>
                )}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  validationErrors.email 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-700 focus:border-purple-500'
                }`}
                required
              />
              {validationErrors.email && (
                <p className="mt-1 text-red-400 text-xs">{validationErrors.email}</p>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Senha"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  validationErrors.password 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-700 focus:border-purple-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {validationErrors.password && (
                <p className="mt-1 text-red-400 text-xs">{validationErrors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar senha"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                    validationErrors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-700 focus:border-purple-500'
                  }`}
                  required={!isLogin}
                />
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-red-400 text-xs">{validationErrors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isLogin ? 'Entrando...' : 'Cadastrando...'}
                </div>
              ) : (
                isLogin ? 'Entrar' : 'Cadastrar'
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center space-y-2">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors block mx-auto"
              >
                Esqueceu sua senha?
              </button>
              <button
                onClick={handleGuestLogin}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                Continuar como convidado
              </button>
            </div>
          )}

          {/* Modal de recuperação de senha */}
          {showForgotPassword && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-white font-medium mb-2">Recuperar senha</h3>
              <p className="text-gray-400 text-sm mb-3">
                Digite seu email para receber as instruções de recuperação
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="flex-1 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? (
              <>
                Não tem uma conta?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Faça login
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recursos */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">Recursos disponíveis:</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Coach IA
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Firebase
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Gemini AI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;

