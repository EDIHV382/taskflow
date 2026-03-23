import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '../lib/validations'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'

export const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    await login(data)
    navigate('/dashboard')
  }

  const autoFillDemo = () => {
    console.log('🔵 Autocompletar clicked')
    // Usar setValue con shouldValidate y shouldDirty para que se dispare la validación
    setValue('email', 'example@gmail.com', { shouldValidate: true, shouldDirty: true })
    setValue('password', '123456', { shouldValidate: true, shouldDirty: true })
    console.log('🟢 Values set:', { email: 'example@gmail.com', password: '***' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 mx-auto text-blue-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            TaskFlow
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Inicia sesión para continuar
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                📋 Credenciales Demo
              </span>
            </div>
            <div className="space-y-2 text-xs text-blue-700 dark:text-blue-400">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">Email:</span>
                <code className="flex-1 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-blue-100 dark:border-blue-900 text-right">
                  example@gmail.com
                </code>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">Pass:</span>
                <code className="flex-1 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-blue-100 dark:border-blue-900 text-right">
                  123456
                </code>
              </div>
            </div>
            <button
              type="button"
              onClick={autoFillDemo}
              className="mt-3 w-full text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2 px-4 rounded-lg font-medium transition-all shadow-sm hover:shadow"
            >
              ⚡ Autocompletar Demo
            </button>
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 text-center italic">
              💡 Para recruiters: ¡Login instantáneo para probar la app!
            </p>
          </div>

          {/* Info box - registration disabled */}
          <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-400 text-center">
              🔒 Registro deshabilitado - Solo usuarios demo
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
