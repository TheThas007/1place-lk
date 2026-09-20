export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-admin-root className="min-h-screen w-full bg-[#121358] text-white">
      {children}
    </div>
  );
}
