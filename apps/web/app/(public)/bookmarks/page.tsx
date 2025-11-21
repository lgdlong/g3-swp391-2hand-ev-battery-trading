import { Suspense } from 'react';
import { BookmarksManager } from './_components/bookmarks-manager';

export default async function bookmark() {
  return (
    <section className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Danh sách yêu thích của tôi</h1>
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
            Loading…
          </div>
        }
      >
        <BookmarksManager />
      </Suspense>
    </section>
  );
}
