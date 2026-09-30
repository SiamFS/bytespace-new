"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Footer newsletter signup. No backend yet — shows a confirmation message.
 * Button text is "Search", exactly as in the Figma design.
 */
export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
    event.currentTarget.reset();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
          label="Email address"
          hideLabel
          placeholder="Enter your email"
          variant="outline"
          wrapperClassName="w-full sm:w-[376px]"
        />
        <Button type="submit" className="shrink-0">
          Search
        </Button>
      </form>
      <p role="status" className="max-w-[504px] text-body-xs text-neutral-950">
        {subscribed
          ? "Thanks for subscribing!"
          : "By subscribing, you agree to our Privacy Policy and consent to receive updates from our company."}
      </p>
    </div>
  );
}
