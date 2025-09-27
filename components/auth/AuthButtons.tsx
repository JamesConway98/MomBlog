"use client"
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  )
}

