import AnnouncementManager from "@/components/admin/announcement-manager";
import { getAnnouncements } from "@/lib/api/admin-ops";

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Announcements</h1>
      <AnnouncementManager initial={announcements} />
    </div>
  );
}
