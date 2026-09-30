import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchIcon } from "@/components/ui/icons";

/**
 * Hero course search. A plain GET form to /courses?q=… — works without JavaScript.
 * Figma: 461px input + 16px gap + "Search" button, top-aligned.
 */
export function HeroSearch() {
  return (
    <form
      role="search"
      action="/courses"
      method="get"
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
    </form>
  );
}
