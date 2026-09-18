"use client";

import { useState } from "react";

import { PASSWORD_MIN_LENGTH } from "@/data/dtos/password.dto";

export function usePasswordPair() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    matches: password === confirmPassword,
    ready: password.length >= PASSWORD_MIN_LENGTH && password === confirmPassword,
  };
}
