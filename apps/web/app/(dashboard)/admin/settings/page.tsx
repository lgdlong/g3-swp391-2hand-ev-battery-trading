import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Globe, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <>
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Settings</h2>
            <p className="text-muted-foreground">
              Manage your application settings and preferences
            </p>
          </div>
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe className="w-5 h-5 text-primary" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-foreground">
                  Site Name
                </Label>
                <Input
                  id="siteName"
                  defaultValue="My Admin Panel"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl" className="text-foreground">
                  Site URL
                </Label>
                <Input
                  id="siteUrl"
                  defaultValue="https://example.com"
                  className="bg-background border-border"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Put site in maintenance mode</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Weekly analytics reports</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Auth</p>
                  <p className="text-sm text-muted-foreground">Enable 2FA for admin accounts</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionDuration" className="text-foreground">
                  Session Duration (minutes)
                </Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  defaultValue="30"
                  className="bg-background border-border"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Palette className="w-5 h-5 text-primary" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Compact Mode</p>
                  <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemsPerPage" className="text-foreground">
                  Items Per Page
                </Label>
                <Input
                  id="itemsPerPage"
                  type="number"
                  defaultValue="25"
                  className="bg-background border-border"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
