import { Skeleton } from "@/components/ui/skeleton";

export default function LifeLoading() {
  return (
    <main className="mx-auto max-w-6xl p-6 lg:p-10">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-4 h-4 w-96 max-w-full" />
      <Skeleton className="mt-8 h-64 w-full rounded-3xl" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-32 rounded-2xl" />)}
      </div>
    </main>
  );
}
