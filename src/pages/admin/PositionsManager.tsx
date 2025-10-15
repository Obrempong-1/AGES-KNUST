import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Position {
  id: string;
  title: string;
  open: boolean;
  createdAt: any;
}

const PositionsManager = () => {
  const [items, setItems] = useState<Position[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<Position>>({ title: '' });
  const [isEditing, setIsEditing] = useState(false);

  const itemsCollectionRef = collection(db, "positions");

  const fetchItems = async () => {
    const q = query(itemsCollectionRef, orderBy("createdAt", "desc"));
    const data = await getDocs(q);
    setItems(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Position[]);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async () => {
    try {
      if (!currentItem.title) {
        toast.error("Title is required.");
        return;
      }
      if (isEditing && currentItem.id) {
        const itemDoc = doc(db, "positions", currentItem.id);
        await updateDoc(itemDoc, { ...currentItem, updatedAt: serverTimestamp() });
        toast.success("Position updated successfully!");
      } else {
        await addDoc(itemsCollectionRef, { ...currentItem, open: false, createdAt: serverTimestamp() });
        toast.success("Position created successfully!");
      }
      resetForm();
      fetchItems();
    } catch (error: any) {
      console.error("Error saving position: ", error);
      toast.error(error.message || "Failed to save position.");
    }
  };

  const handleEdit = (item: Position) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const itemDoc = doc(db, "positions", id);
      await deleteDoc(itemDoc);
      toast.success("Position deleted successfully!");
      fetchItems();
    } catch (error) {
      console.error("Error deleting position: ", error);
      toast.error("Failed to delete position.");
    }
  };

  const toggleOpen = async (item: Position) => {
    try {
      const itemDoc = doc(db, "positions", item.id);
      await updateDoc(itemDoc, { open: !item.open });
      toast.success(`Position status updated to ${!item.open ? 'Open' : 'Closed'}`);
      fetchItems();
    } catch (error) {
      console.error("Error toggling open status: ", error);
      toast.error("Failed to update position status.");
    }
  }

  const resetForm = () => {
    setCurrentItem({ title: '' });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Position" : "Create Position"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={currentItem.title || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
          />
          <div className="flex items-center gap-4">
            <Button onClick={handleSave}>
              {isEditing ? "Update Position" : "Create Position"}
            </Button>
            {isEditing && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(item.createdAt?.toDate()).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={item.open}
                      onCheckedChange={() => toggleOpen(item)}
                    />
                    <span>{item.open ? "Open" : "Closed"}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the position.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
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

export default PositionsManager;
