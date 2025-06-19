import NoticeWriteForm from '@/components/admin/NoticeWriteForm';
// import AdminGuard from '@/components/user/AdminGuard'; // Conceptual

export default function AdminNoticePage() {
  return (
    // <AdminGuard> // Conceptual: Wrap with AdminGuard for access control
    <div className="py-8">
      <NoticeWriteForm />
    </div>
    // </AdminGuard>
  );
}
