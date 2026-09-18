"use client";

import { useState } from "react";

import {
  useRegister,
  useLink,
  useNotification,
  useTranslate,
} from "@refinedev/core";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/shared/ui/card";
import { Separator } from "@/components/shared/ui/separator";
import { InputPassword } from "@/components/shared/refine-ui/form/input-password";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { cn } from "@/lib/utils";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const translate = useTranslate();
  const { path } = useLocale();

  const { open } = useNotification();

  const Link = useLink();

  const { mutate: register } = useRegister();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      open?.({
        type: "error",
        message: translate("auth.passwordsDontMatch"),
        description: translate("auth.passwordsDontMatchDescription"),
      });

      return;
    }

    register({
      email,
      password,
    });
  };

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "px-6",
        "py-8",
        "flex-1"
      )}
    >
      <Card className={cn("sm:w-[456px]", "p-12", "mt-6")}>
        <CardHeader className={cn("px-0")}>
          <CardTitle
            className={cn("text-primary", "text-3xl", "font-semibold")}
          >
            {translate("auth.signUp")}
          </CardTitle>
          <CardDescription
            className={cn("text-muted-foreground", "font-medium")}
          >
            {translate("auth.signUpWelcome")}
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className={cn("px-0")}>
          <form onSubmit={handleSignUp}>
            <div className={cn("flex", "flex-col", "gap-2")}>
              <Label htmlFor="email">{translate("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div
              className={cn("relative", "flex", "flex-col", "gap-2", "mt-6")}
            >
              <Label htmlFor="password">{translate("auth.password")}</Label>
              <InputPassword
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div
              className={cn("relative", "flex", "flex-col", "gap-2", "mt-6")}
            >
              <Label htmlFor="confirmPassword">
                {translate("auth.confirmPassword")}
              </Label>
              <InputPassword
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" size="lg" className={cn("w-full", "mt-6")}>
              {translate("auth.signUp")}
            </Button>
          </form>
        </CardContent>

        <Separator />

        <CardFooter>
          <div className={cn("w-full", "text-center text-sm")}>
            <span className={cn("text-sm", "text-muted-foreground")}>
              {translate("auth.haveAccount")}{" "}
            </span>
            <Link
              to={path("/login")}
              className={cn("text-primary", "font-semibold", "underline")}
            >
              {translate("auth.signIn")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

SignUpForm.displayName = "SignUpForm";
