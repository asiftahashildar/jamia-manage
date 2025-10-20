import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, Clock } from 'lucide-react';

interface NamazTimingsProps {
  isAdmin: boolean;
}

const NamazTimings = ({ isAdmin }: NamazTimingsProps) => {
  const queryClient = useQueryClient();
  const [editDialog, setEditDialog] = useState<{ open: boolean; timing: any }>({
    open: false,
    timing: null,
  });
  const [newTime, setNewTime] = useState('');

  const { data: timings = [] } = useQuery({
    queryKey: ['namaz-timings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('namaz_timings')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const updateTimingMutation = useMutation({
    mutationFn: async ({ id, time }: { id: string; time: string }) => {
      const { error } = await supabase
        .from('namaz_timings')
        .update({ prayer_time: time })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['namaz-timings'] });
      setEditDialog({ open: false, timing: null });
      setNewTime('');
      toast.success('Prayer time updated');
    },
  });

  const handleEdit = (timing: any) => {
    setEditDialog({ open: true, timing });
    setNewTime(timing.prayer_time);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editDialog.timing) {
      updateTimingMutation.mutate({
        id: editDialog.timing.id,
        time: newTime,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Namaz Timings</CardTitle>
        <CardDescription>View and manage prayer times</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {timings.map((timing) => (
            <Card key={timing.id} className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{timing.prayer_name}</CardTitle>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(timing)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">
                  {timing.prayer_time.slice(0, 5)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isAdmin && (
          <Dialog
            open={editDialog.open}
            onOpenChange={(open) => setEditDialog({ open, timing: null })}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Prayer Time</DialogTitle>
                <DialogDescription>
                  Update the time for {editDialog.timing?.prayer_name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Update Time</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default NamazTimings;
