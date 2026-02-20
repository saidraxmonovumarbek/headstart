import AdminLayout from "@/app/admin/layout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}