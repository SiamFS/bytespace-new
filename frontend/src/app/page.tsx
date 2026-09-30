import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Temporary component showcase — replaced by the landing page sections in later PRs.
export default function Home() {
  return (
    <main className="flex-1 bg-neutral-50 py-16">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          title="Discover Your Passion, Build Your Skills"
          description="At Bytespace Courses, we bring you closer to life-changing knowledge."
        />

        <div className="flex flex-wrap items-center gap-4">
          <Button>Search</Button>
          <Button href="/">Join as Creator</Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Chip active>Featured</Chip>
          <Chip>Music</Chip>
          <Chip>Drawing &amp; Painting</Chip>
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge>17 Lessons</Badge>
          <Badge tone="neutral">Beginner</Badge>
        </div>

        <div className="max-w-md">
          <Input label="Search courses" hideLabel placeholder="Course, topic, creator" />
        </div>

        <div className="flex flex-wrap gap-6">
          <Card radius="md" className="flex flex-col gap-2">
            <span className="text-label-s">Happy Students</span>
            <AvatarGroup avatars={[]} more="2K+" />
          </Card>
          <Card bordered padding="md" className="max-w-xs">
            <p className="text-body-m text-muted">Bordered card, 24px radius.</p>
          </Card>
        </div>
      </Container>
    </main>
  );
}
