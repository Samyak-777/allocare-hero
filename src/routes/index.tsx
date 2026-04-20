import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { HomePage } from "@/components/HomePage";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PageLayout hero>
      <HomePage />
    </PageLayout>
  );
}
