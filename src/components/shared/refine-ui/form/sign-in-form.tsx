"use client";

import { useState } from "react";

import { CircleHelp } from "lucide-react";

import { useLogin, useLink, useNotification, useTranslate } from "@refinedev/core";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Checkbox } from "@/components/shared/ui/checkbox";
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

export const SignInForm = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const translate = useTranslate();
  const { path } = useLocale();
  const { open } = useNotification();

  const Link = useLink();

  const { mutate: login, isPending } = useLogin();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    login(
      {
        email,
        password,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            return;
          }
          const message =
            result.error?.message || translate("auth.invalidCredentials");
          setFormError(message);
          open?.({ type: "error", message });
        },
        onError: (error) => {
          const message =
            error?.message || translate("auth.invalidCredentials");
          setFormError(message);
          open?.({ type: "error", message });
        },
      }
    );
  };

  return (
    <AuthFormFrame>
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-semibold text-primary sm:text-3xl">
          {translate("auth.signIn")}
        </CardTitle>
        <CardDescription className="font-medium text-muted-foreground">
          {translate("auth.welcomeBack")}
        </CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="px-0">
        <form onSubmit={handleSignIn}>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mt-4 flex min-h-12 flex-wrap items-center justify-between gap-2">
            <div className="flex min-h-12 items-center gap-3">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setRememberMe(checked === "indeterminate" ? false : checked)
                }
              />
              <Label htmlFor="remember" className="min-h-12 cursor-pointer py-3">
                {translate("auth.rememberMe")}
              </Label>
            </div>
            <Link
              to={path("/forgot-password")}
              className="inline-flex min-h-12 items-center gap-2 text-sm text-primary hover:underline"
            >
              <span>{translate("auth.forgotPassword")}</span>
              <CircleHelp className="h-4 w-4" />
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full sm:mt-6"
            disabled={isPending}
          >
            {isPending ? translate("loading") : translate("auth.signIn")}
          </Button>
          {formError ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
        </form>
      </CardContent>

      <Separator />

      <CardFooter className="px-0">
        <div className="w-full text-center text-sm">
          <span className="text-sm text-muted-foreground">
            {translate("auth.noAccount")}{" "}
          </span>
          <Link
            to={path("/register")}
            className="inline-flex min-h-12 items-center font-semibold text-primary underline"
          >
            {translate("auth.signUp")}
          </Link>
        </div>
      </CardFooter>
    </AuthFormFrame>
  );
};

SignInForm.displayName = "SignInForm";
