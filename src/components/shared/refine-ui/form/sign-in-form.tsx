"use client";

import { useState } from "react";

import { CircleHelp } from "lucide-react";

import { useLogin, useLink, useNotification, useTranslate } from "@refinedev/core";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Checkbox } from "@/components/shared/ui/checkbox";
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
            {translate("auth.signIn")}
          </CardTitle>
          <CardDescription
            className={cn("text-muted-foreground", "font-medium")}
          >
            {translate("auth.welcomeBack")}
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className={cn("px-0")}>
          <form onSubmit={handleSignIn}>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div
              className={cn(
                "flex items-center justify-between",
                "flex-wrap",
                "gap-2",
                "mt-4"
              )}
            >
              <div className={cn("flex items-center", "space-x-2")}>
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked === "indeterminate" ? false : checked)
                  }
                />
                <Label htmlFor="remember">{translate("auth.rememberMe")}</Label>
              </div>
              <Link
                to={path("/forgot-password")}
                className={cn(
                  "text-sm",
                  "flex",
                  "items-center",
                  "gap-2",
                  "text-primary hover:underline"
                )}
              >
                <span>{translate("auth.forgotPassword")}</span>
                <CircleHelp className={cn("w-4", "h-4")} />
              </Link>
            </div>

            <Button type="submit" size="lg" className={cn("w-full", "mt-6")} disabled={isPending}>
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

        <CardFooter>
          <div className={cn("w-full", "text-center text-sm")}>
            <span className={cn("text-sm", "text-muted-foreground")}>
              {translate("auth.noAccount")}{" "}
            </span>
            <Link
              to={path("/register")}
              className={cn("text-primary", "font-semibold", "underline")}
            >
              {translate("auth.signUp")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

SignInForm.displayName = "SignInForm";
