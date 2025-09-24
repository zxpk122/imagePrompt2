"use client";

import React from "react";
import Link from "next/link";
import type { User } from "@saasfly/auth";
import { useSelectedLayoutSegment } from "next/navigation";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";

import { MainNav } from "./main-nav";
import { LocaleChange } from "~/components/locale-change";
import { GitHubStar } from "~/components/github-star";
import { useSigninModal } from "~/hooks/use-signin-modal";
import { UserAccountNav } from "./user-account-nav";

import useScroll from "~/hooks/use-scroll";
import type { MainNavItem } from "~/types";

interface NavBarProps {
  user: Pick<User, "name" | "image" | "email"> | undefined;
  items?: MainNavItem[];
  children?: React.ReactNode;
  rightElements?: React.ReactNode;
  scroll?: boolean;
  params: {
    lang: string;
  };
  marketing: Record<string, string | object>;
  dropdown: Record<string, string>;
}

export function NavBar({
  user,
  items,
  children,
  rightElements,
  scroll = false,
  params: { lang },
  marketing,
  dropdown,
}: NavBarProps) {
  const scrolled = useScroll(50);
  const signInModal = useSigninModal();
  const segment = useSelectedLayoutSegment();

  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center border-border bg-white/80 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-white/0") : "border-b"
      }`}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <MainNav items={items} params={{ lang: `${lang}` }} marketing={marketing}>
          {children}
        </MainNav>

        <div className="flex items-center space-x-6">
          {items?.length ? (
            <nav className="hidden gap-8 md:flex">
              {items?.map((item, index) => (
                <Link
                  key={index}
                  href={item.disabled ? "#" : (item.href.startsWith("http") ? item.href : `/${lang}${item.href}`)}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-purple-600 text-gray-700",
                    item.href.startsWith(`/${segment}`)
                      ? "text-purple-600 font-semibold"
                      : "",
                    item.disabled && "cursor-not-allowed opacity-80",
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="flex items-center space-x-3">
            <LocaleChange url={"/"} />
            {!user ? (
              <Link href={`/${lang}/login`}>
                <Button variant="outline" size="sm" className="text-purple-600 border-purple-600 hover:bg-purple-50">
                  {typeof marketing.login === "string"
                    ? marketing.login
                    : "Login"}
                </Button>
              </Link>
            ) : null}

            {user ? (
              <UserAccountNav
                user={user}
                params={{ lang: `${lang}` }}
                dict={dropdown}
              />
            ) : (
              <Button
                className="px-4 bg-purple-600 hover:bg-purple-700"
                variant="default"
                size="sm"
                onClick={signInModal.onOpen}
              >
                {typeof marketing.signup === "string"
                  ? marketing.signup
                  : "Try it now!"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
