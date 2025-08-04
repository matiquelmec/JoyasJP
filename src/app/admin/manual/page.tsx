import { CompleteManual } from '@/components/admin/complete-manual'

export default function ManualPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Manual de Usuario
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Guía completa para administrar tu tienda Joyas JP
        </p>
      </div>
      <CompleteManual />
    </div>
  )
}