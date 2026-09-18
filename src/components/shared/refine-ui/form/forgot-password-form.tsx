"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useForgotPassword, useLink, useTranslate } from "@refinedev/core";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shared/ui/card";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { cn } from "@/lib/utils";

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
            {translate("auth.forgotPassword")}
          </CardTitle>
          <CardDescription
            className={cn("text-muted-foreground", "font-medium")}
          >
            {translate("auth.forgotDescription")}
          </CardDescription>
        </CardHeader>

        <CardContent className={cn("px-0")}>
          <form onSubmit={handleForgotPassword}>
            <div className={cn("flex", "flex-col", "gap-2")}>
              <Label htmlFor="email">{translate("auth.email")}</Label>
              <div className={cn("flex", "gap-2")}>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn("flex-1")}
                />
                <Button type="submit" className={cn("px-6")}>
                  {translate("auth.send")}
                </Button>
              </div>
            </div>
          </form>

          <div className={cn("mt-8")}>
            <Link
              to={path("/login")}
              className={cn(
                "inline-flex",
                "items-center",
                "gap-2",
                "text-sm",
                "text-muted-foreground",
                "hover:text-foreground",
                "transition-colors"
              )}
            >
              <ArrowLeft className={cn("w-4", "h-4")} />
              <span>{translate("auth.back")}</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

ForgotPasswordForm.displayName = "ForgotPasswordForm";
