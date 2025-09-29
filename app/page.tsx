
/**
 * Página principal - redirección automática manejada por middleware
 * Esta página no debería mostrarse ya que el middleware redirige automáticamente:
 * - Usuarios autenticados (admin) → /dashboard
 * - Usuarios no autenticados → /auth/signin
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
