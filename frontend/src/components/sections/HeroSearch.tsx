import Form from "next/form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchIcon } from "@/components/ui/icons";

/**
 * Hero course search. Searches the landing page's own course grid: submits ?q=… to "/" (<Form>
 * makes it a client-side navigation without scrolling to the top; without JavaScript it's a
 * plain GET), and CourseBrowser filters the grid and scrolls to it.
 * Figma: 461px input + 16px gap + "Search" button, top-aligned.
 */
export function HeroSearch() {
  return (
    <Form
      action="/"
      scroll={false}
      role="search"
      className="flex w-full max-w-[581px] flex-col gap-4 sm:flex-row sm:items-start"
    >
      <Input
        type="search"
        name="q"
        label="Search courses"
        hideLabel
        placeholder="Course, topic, creator"
        icon={<SearchIcon />}
        wrapperClassName="w-full sm:flex-1"
      />
      <Button type="submit" className="shrink-0">
        Search
      </Button>
    </Form>
  );
}
