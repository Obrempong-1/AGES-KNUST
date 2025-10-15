import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  details: string;
  published: boolean;
  createdAt: any;
}

const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement>>({});
  const [isEditing, setIsEditing] = useState(false);

  const announcementsCollectionRef = collection(db, "announcements");

  const fetchAnnouncements = async () => {
    const q = query(announcementsCollectionRef, orderBy("createdAt", "desc"));
    const data = await getDocs(q);
    setAnnouncements(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Announcement[]);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSave = async () => {
    if (!currentAnnouncement.title || !currentAnnouncement.details) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const { id, ...announcementData } = { ...currentAnnouncement, published: currentAnnouncement.published ?? false };

      if (isEditing && currentAnnouncement.id) {
        const announcementDoc = doc(db, "announcements", currentAnnouncement.id);
        await updateDoc(announcementDoc, { ...announcementData, updatedAt: serverTimestamp() });
        toast.success("Announcement updated successfully!");
      } else {
        await addDoc(announcementsCollectionRef, { ...announcementData, createdAt: serverTimestamp() });
        toast.success("Announcement created successfully!");
      }
      resetForm();
      fetchAnnouncements();
    } catch (error: any) {
      console.error("Error saving announcement: ", error);
      toast.error(error.message || "Failed to save announcement.");
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setIsEditing(true);
  };

  const handleDelete = async (announcement: Announcement) => {
    try {
      const announcementDoc = doc(db, "announcements", announcement.id);
      await deleteDoc(announcementDoc);
      toast.success("Announcement deleted successfully!");
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement: ", error);
      toast.error("Failed to delete announcement.");
    }
  };

  const togglePublish = async (announcement: Announcement) => {
    try {
      const announcementDoc = doc(db, "announcements", announcement.id);
      await updateDoc(announcementDoc, { published: !announcement.published });
      toast.success(`Announcement ${!announcement.published ? 'published' : 'unpublished'} successfully!`);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error toggling publish status: ", error);
      toast.error("Failed to update publish status.");
    }
  }

  const resetForm = () => {
    setCurrentAnnouncement({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Announcement" : "Create Announcement"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={currentAnnouncement.title || ''}
            onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, title: e.target.value })}
          />
          <Textarea
            placeholder="Details"
            value={currentAnnouncement.details || ''}
            onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, details: e.target.value })}
            rows={5}
          />

          <div className="flex items-center gap-4">
            <Button onClick={handleSave}>
              {isEditing ? "Update Announcement" : "Create Announcement"}
            </Button>
            {isEditing && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-bold">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(announcement.createdAt?.toDate()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={announcement.published}
                      onCheckedChange={() => togglePublish(announcement)}
                      aria-readonly
                    />
                    <span>{announcement.published ? "Published" : "Draft"}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(announcement)}>Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the announcement.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(announcement)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementsManager;
