"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authCopy } from "@/data/auth";
import { login } from "@/lib/auth/api";
import { loginSchema } from "@/lib/auth/schemas";
import { FormStatus } from "./FormStatus";
import { useAuthSubmit } from "./useAuthSubmit";

const copy = authCopy.login;

/** Email + password form. Figma: fields 24px apart, lime "Sign In" pill aligned right. */
export function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });
  const { run, formError, slow } = useAuthSubmit("login", setError, isSubmitting);

  return (
    <form noValidate onSubmit={handleSubmit((values) => run(() => login(values)))} className="flex flex-col gap-6">
      <Input
        variant="field"
        label="Email"
        type="email"
        placeholder="designer@example.com"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        variant="field"
        label="Password"
        type="password"
        placeholder="********"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <FormStatus error={formError} slow={slow} />
      <Button type="submit" disabled={isSubmitting} aria-disabled={isSubmitting} className="self-end">
        {isSubmitting ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}
