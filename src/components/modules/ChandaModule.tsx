import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface ChandaModuleProps {
  isAdmin: boolean;
}

const ChandaModule = ({ isAdmin }: ChandaModuleProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const { data: chandaCollections = [] } = useQuery({
    queryKey: ['chanda'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chanda_collections')
        .select('*')
        .order('collection_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addChandaMutation = useMutation({
    mutationFn: async (chanda: any) => {
      const { error } = await supabase.from('chanda_collections').insert([chanda]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chanda'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      setIsDialogOpen(false);
      setMemberName('');
      setAmount('');
      setNotes('');
      toast.success('Chanda recorded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to record chanda: ${error.message}`);
    },
  });

  const deleteChandaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('chanda_collections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chanda'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      toast.success('Chanda record deleted');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addChandaMutation.mutate({
      member_name: memberName,
      amount: parseFloat(amount),
      notes,
    });
  };

  const totalChanda = chandaCollections.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Chanda Collection</CardTitle>
            <CardDescription>Track weekly and total chanda contributions</CardDescription>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Chanda
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Chanda Collection</DialogTitle>
                  <DialogDescription>Add a new chanda contribution</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="member">Member Name</Label>
                    <Input
                      id="member"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">Record Chanda</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-accent/10 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Collected</p>
          <p className="text-2xl font-bold text-accent">₹{totalChanda.toLocaleString()}</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {chandaCollections.map((chanda) => (
              <TableRow key={chanda.id}>
                <TableCell className="font-medium">{chanda.member_name}</TableCell>
                <TableCell>₹{chanda.amount}</TableCell>
                <TableCell>{new Date(chanda.collection_date).toLocaleDateString()}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteChandaMutation.mutate(chanda.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ChandaModule;
