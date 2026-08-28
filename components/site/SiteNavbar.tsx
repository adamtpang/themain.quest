"use client";

import Link from "next/link";
import {
  Gamepad2,
  Home,
  KeyRound,
  Landmark,
  LockKeyhole,
  Menu,
  Mountain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { href: "/", label: "Home", description: "See the whole system", icon: Home },
  { href: "/life", label: "Life", description: "Run the next private quest", icon: Mountain },
  { href: "/board", label: "Board", description: "Play the public demo", icon: Gamepad2 },
  { href: "/money-os", label: "Money OS", description: "Open the private money system", icon: Landmark },
  { href: "/signin", label: "Sign in", description: "Enter with the approved account", icon: KeyRound },
];

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center rounded-[1.35rem_1.1rem_1.5rem_1.2rem] border-[3px] border-ink bg-card/90 px-3 shadow-pix backdrop-blur-xl sm:px-4"
      >
        <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label="The Main Quest home">
          <span className="flex h-10 w-10 shrink-0 -rotate-3 items-center justify-center rounded-[45%_55%_48%_52%] border-[3px] border-ink bg-gold font-pixel text-[8px] text-ink transition-transform group-hover:rotate-0">
            MQ
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-bold tracking-tight">The Main Quest</span>
            <span className="block truncate text-[10px] font-medium text-muted-foreground">Your life, made playable</span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          {navigation.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Button asChild className="quest-button ml-auto bg-primary text-primary-foreground hover:bg-primary/90 lg:ml-3">
          <Link href="/life"><LockKeyhole /> Open Life</Link>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-2 shrink-0 rounded-full border-2 lg:hidden" aria-label="Open navigation">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[min(92vw,24rem)] border-l-[3px] p-5">
            <SheetHeader className="pr-8 text-left">
              <div className="flex h-11 w-11 -rotate-3 items-center justify-center rounded-[45%_55%] border-[3px] border-ink bg-gold font-pixel text-[9px] text-ink">MQ</div>
              <SheetTitle className="pt-3 text-2xl">Choose your doorway</SheetTitle>
              <SheetDescription>
                The Main Quest navigation keeps the free public board, private owner tools, and public project information together so every destination stays easy to identify.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 grid gap-2">
              {navigation.map((item) => (
                <SheetClose key={item.href} asChild>
                  <Link href={item.href} className="group flex items-center gap-3 rounded-2xl border-2 bg-card p-3 transition-colors hover:border-primary hover:bg-secondary">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                    </span>
                  </Link>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
