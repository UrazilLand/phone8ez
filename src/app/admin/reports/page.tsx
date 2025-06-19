import ReportModerationView from '@/components/admin/ReportModerationView';
// import AdminGuard from '@/components/user/AdminGuard'; // Conceptual

export default function AdminReportsPage() {
  return (
    // <AdminGuard> // Conceptual: Wrap with AdminGuard for access control
    <div className="py-8">
      <ReportModerationView />
    </div>
    // </AdminGuard>
  );
}
