import { LoginForm } from "@/components/login-comp/login-form"
import { ThemeToggle } from "@/components/login-comp/theme-toggle"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
