"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authCopy } from "@/data/auth";
import { register as registerUser } from "@/lib/auth/api";
import { registerSchema } from "@/lib/auth/schemas";
import { FormStatus } from "./FormStatus";
import { useAuthSubmit } from "./useAuthSubmit";

const copy = authCopy.register;

/** Full name + email + password form. Figma: fields 24px apart, lime "Continue" pill aligned right. */
export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onTouched",
  });
  const { run, formError, slow } = useAuthSubmit("register", setError, isSubmitting);

  return (
    <form noValidate onSubmit={handleSubmit((values) => run(() => registerUser(values)))} className="flex flex-col gap-6">
      <Input
        variant="field"
        label="Full Name"
        placeholder="Jamie Davis"
        autoComplete="name"
        autoCapitalize="words"
        error={errors.name?.message}
        {...register("name")}
      />
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
        autoComplete="new-password"
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
