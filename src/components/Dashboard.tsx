import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Wallet, Users, Package, Bell, Clock, UserCog } from 'lucide-react';
import FinanceModule from './modules/FinanceModule';
import ChandaModule from './modules/ChandaModule';
import AssetsModule from './modules/AssetsModule';
import CommitteeModule from './modules/CommitteeModule';
import NamazTimings from './modules/NamazTimings';
import NotificationsModule from './modules/NotificationsModule';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();

  const { data: accountData } = useQuery({
    queryKey: ['account'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Clock className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Jamia Masjid</h1>
              <p className="text-sm text-muted-foreground">Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ₹{accountData?.balance?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Current account balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Chanda</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                ₹{accountData?.total_chanda_collected?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Collected till date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                ₹{accountData?.total_expenses?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">All time expenses</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="finance" className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            <TabsTrigger value="finance">
              <Wallet className="h-4 w-4 mr-2" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="chanda">
              <Users className="h-4 w-4 mr-2" />
              Chanda
            </TabsTrigger>
            <TabsTrigger value="assets">
              <Package className="h-4 w-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="committee">
              <UserCog className="h-4 w-4 mr-2" />
              Committee
            </TabsTrigger>
            <TabsTrigger value="namaz">
              <Clock className="h-4 w-4 mr-2" />
              Namaz
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="finance">
            <FinanceModule isAdmin={userRole === 'admin'} />
          </TabsContent>

          <TabsContent value="chanda">
            <ChandaModule isAdmin={userRole === 'admin'} />
          </TabsContent>

          <TabsContent value="assets">
            <AssetsModule isAdmin={userRole === 'admin'} />
          </TabsContent>

          <TabsContent value="committee">
            <CommitteeModule isAdmin={userRole === 'admin'} />
          </TabsContent>

          <TabsContent value="namaz">
            <NamazTimings isAdmin={userRole === 'admin'} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsModule isAdmin={userRole === 'admin'} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
