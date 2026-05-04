import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";

export default function ListsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
    </AuthGuard>
  );
}
