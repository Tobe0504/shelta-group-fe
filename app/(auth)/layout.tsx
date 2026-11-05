import Link from "next/link"
import { AuthBrandPanel } from "@/components/auth-brand-panel"
import { Logo } from "@/components/logo"

/** Shared shell for sign-in, sign-up and recovery: form on the left, brand panel on the right. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_minmax(0,560px)] xl:grid-cols-2">
      <div className="flex flex-col gap-10 px-5 py-6 sm:px-10">
        <Logo />
        <main id="main" className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          {children}
        </main>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="/help#terms" className="underline underline-offset-4 hover:text-foreground">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/help#protection" className="underline underline-offset-4 hover:text-foreground">
            buyer protection policy
          </Link>
          .
        </p>
      </div>
      <AuthBrandPanel />
    </div>
  )
}
