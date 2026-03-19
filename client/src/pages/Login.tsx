import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Conta criada com sucesso!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Login realizado com sucesso!');
      }
      setLocation('/');
    } catch (error: any) {
      const errorMessage = error.message || 'Erro na autenticação';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>
            SmartOps
          </h1>
          <p style={{ color: '#6B7280' }}>
            Gestão de Tempo e Custos
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">
            {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          </p>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {isSignUp ? 'Faça login aqui' : 'Crie uma conta'}
          </button>
        </div>


      </div>
    </div>
  );
}
