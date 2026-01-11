import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-6 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-foreground">Account Created!</h1>
        <p className="text-muted-foreground mb-6">Please check your email to verify your account before signing in.</p>
        <Button asChild>
          <a href="/auth/login">Go to Sign In</a>
        </Button>
      </Card>
    </div>
  )
}
