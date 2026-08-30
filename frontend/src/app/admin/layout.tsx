import { AdminAuth } from "@/components/admin/AdminAuth";

export const metadata = {
  title: "Administracija — Portfolio",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuth>{children}</AdminAuth>;
}
