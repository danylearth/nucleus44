import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pill } from "lucide-react";
import { Supplement } from "@/entities/Supplement";

export default function AddSupplementDialog({ open, onOpenChange, onSupplementAdded }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name || !timeOfDay) return;
    setIsSaving(true);
    try {
      await Supplement.create({
        name,
        dosage,
        time_of_day: timeOfDay,
        taken_dates: []
      });
      onSupplementAdded();
    } catch (error) {
      console.error("Error adding supplement:", error);
    } finally {
      setIsSaving(false);
      onOpenChange(false);
      setName('');
      setDosage('');
      setTimeOfDay('morning');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-500" />
            Add New Supplement
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Supplement Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Vitamin D3" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage</Label>
            <Input id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g., 5000 IU" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time of Day</Label>
            <Select value={timeOfDay} onValueChange={setTimeOfDay}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Add Supplement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}