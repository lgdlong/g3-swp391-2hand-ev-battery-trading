import { SearchBar } from "@/components/searchbar";

export default function EvPostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SearchBar />
      <main>{children}</main>
    </>
  );
}
