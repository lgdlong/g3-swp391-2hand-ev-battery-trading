import { Suspense } from "react";
import { BookmarksManager } from "./_components/bookmarks-manager";

export default function bookmark(){
    return(
        <section className="container mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">My Bookmarks</h1>
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
          <BookmarksManager />
        </Suspense>
      </section>
    )
}