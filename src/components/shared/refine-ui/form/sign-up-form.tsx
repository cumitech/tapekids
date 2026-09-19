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
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/shared/ui/card";
import { Separator } from "@/components/shared/ui/separator";
import { AuthFormFrame } from "@/components/shared/refine-ui/form/auth-form-frame";
import { InputPassword } from "@/components/shared/refine-ui/form/input-password";
import { useLocale } from "@/hooks/core/use-locale.hook";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const translate = useTranslate();
  const { path } = useLocale();

  const { open } = useNotification();

  const Link = useLink();

  const { mutate: register } = useRegister({
    mutationOptions: {
      onSuccess: (result) => {
        if (String(result.redirectTo ?? "").includes("/login")) {
          open?.({
            type: "success",
            message: translate("auth.checkEmail"),
          });
        }
      },
    },
  });

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
    <AuthFormFrame>
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-semibold text-primary sm:text-3xl">
          {translate("auth.signUp")}
        </CardTitle>
        <CardDescription className="font-medium text-muted-foreground">
          {translate("auth.signUpWelcome")}
        </CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="px-0">
        <form onSubmit={handleSignUp}>
          <div className="flex flex-col gap-2">
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

          <div className="relative mt-4 flex flex-col gap-2 sm:mt-6">
            <Label htmlFor="password">{translate("auth.password")}</Label>
            <InputPassword
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative mt-4 flex flex-col gap-2 sm:mt-6">
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

          <Button type="submit" size="lg" className="mt-5 w-full sm:mt-6">
            {translate("auth.signUp")}
          </Button>
        </form>
      </CardContent>

      <Separator />

      <CardFooter className="px-0">
        <div className="w-full text-center text-sm">
          <span className="text-sm text-muted-foreground">
            {translate("auth.haveAccount")}{" "}
          </span>
          <Link
            to={path("/login")}
            className="inline-flex min-h-12 items-center font-semibold text-primary underline"
          >
            {translate("auth.signIn")}
          </Link>
        </div>
      </CardFooter>
    </AuthFormFrame>
  );
};

SignUpForm.displayName = "SignUpForm";
