"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useForgotPassword, useLink, useTranslate } from "@refinedev/core";
import { AuthFormFrame } from "@/components/shared/refine-ui/form/auth-form-frame";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shared/ui/card";
import { useLocale } from "@/hooks/core/use-locale.hook";

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const translate = useTranslate();
  const { path } = useLocale();

  const Link = useLink();

  const { mutate: forgotPassword } = useForgotPassword();

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    forgotPassword({
      email,
    });
  };

  return (
    <AuthFormFrame>
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-semibold text-primary sm:text-3xl">
          {translate("auth.forgotPassword")}
        </CardTitle>
        <CardDescription className="font-medium text-muted-foreground">
          {translate("auth.forgotDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <form onSubmit={handleForgotPassword}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{translate("auth.email")}</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="email"
                type="email"
                placeholder=""
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="sm:px-6">
                {translate("auth.send")}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 sm:mt-8">
          <Link
            to={path("/login")}
            className="inline-flex min-h-12 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{translate("auth.back")}</span>
          </Link>
        </div>
      </CardContent>
    </AuthFormFrame>
  );
};

ForgotPasswordForm.displayName = "ForgotPasswordForm";
