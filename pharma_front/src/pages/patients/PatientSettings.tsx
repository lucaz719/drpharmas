import { useState } from "react";
import { Save, Settings, Bell, Shield, Database, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PatientSettings {
  general: {
    autoAssignPatientId: boolean;
    patientIdPrefix: string;
    requirePhoneNumber: boolean;
    requireEmail: boolean;
    requireAddress: boolean;
    allowDuplicateNames: boolean;
  };
  privacy: {
    dataRetentionPeriod: number;
    anonymizeAfterPeriod: boolean;
    requireConsentForMarketing: boolean;
    allowDataExport: boolean;
    encryptSensitiveData: boolean;
  };
  notifications: {
    birthdayReminders: boolean;
    appointmentReminders: boolean;
    prescriptionRefillReminders: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  records: {
    defaultRecordType: string;
    autoArchiveOldRecords: boolean;
    archiveAfterMonths: number;
    requireDoctorSignature: boolean;
    allowPatientAccess: boolean;
  };
}

const defaultSettings: PatientSettings = {
  general: {
    autoAssignPatientId: true,
    patientIdPrefix: "PAT",
    requirePhoneNumber: true,
    requireEmail: false,
    requireAddress: true,
    allowDuplicateNames: false,
  },
  privacy: {
    dataRetentionPeriod: 7,
    anonymizeAfterPeriod: true,
    requireConsentForMarketing: true,
    allowDataExport: true,
    encryptSensitiveData: true,
  },
  notifications: {
    birthdayReminders: true,
    appointmentReminders: true,
    prescriptionRefillReminders: true,
    emailNotifications: true,
    smsNotifications: false,
  },
  records: {
    defaultRecordType: "consultation",
    autoArchiveOldRecords: true,
    archiveAfterMonths: 24,
    requireDoctorSignature: true,
    allowPatientAccess: false,
  }
};

export default function PatientSettings() {
  const [settings, setSettings] = useState<PatientSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (section: keyof PatientSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save settings logic here
    console.log("Saving settings:", settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Patient Settings</h1>
          <p className="text-muted-foreground">Configure patient management preferences and policies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                General Patient Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-assign Patient ID</Label>
                      <p className="text-sm text-muted-foreground">Automatically generate unique patient IDs</p>
                    </div>
                    <Switch
                      checked={settings.general.autoAssignPatientId}
                      onCheckedChange={(value) => updateSetting('general', 'autoAssignPatientId', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientIdPrefix">Patient ID Prefix</Label>
                    <Input
                      id="patientIdPrefix"
                      value={settings.general.patientIdPrefix}
                      onChange={(e) => updateSetting('general', 'patientIdPrefix', e.target.value)}
                      placeholder="PAT"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Phone Number</Label>
                      <p className="text-sm text-muted-foreground">Make phone number mandatory</p>
                    </div>
                    <Switch
                      checked={settings.general.requirePhoneNumber}
                      onCheckedChange={(value) => updateSetting('general', 'requirePhoneNumber', value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Email Address</Label>
                      <p className="text-sm text-muted-foreground">Make email address mandatory</p>
                    </div>
                    <Switch
                      checked={settings.general.requireEmail}
                      onCheckedChange={(value) => updateSetting('general', 'requireEmail', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Address</Label>
                      <p className="text-sm text-muted-foreground">Make address mandatory</p>
                    </div>
                    <Switch
                      checked={settings.general.requireAddress}
                      onCheckedChange={(value) => updateSetting('general', 'requireAddress', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Duplicate Names</Label>
                      <p className="text-sm text-muted-foreground">Allow patients with same name</p>
                    </div>
                    <Switch
                      checked={settings.general.allowDuplicateNames}
                      onCheckedChange={(value) => updateSetting('general', 'allowDuplicateNames', value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Data Retention Period (Years)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.privacy.dataRetentionPeriod}
                      onChange={(e) => updateSetting('privacy', 'dataRetentionPeriod', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Anonymize After Retention Period</Label>
                      <p className="text-sm text-muted-foreground">Remove personal identifiers after retention period</p>
                    </div>
                    <Switch
                      checked={settings.privacy.anonymizeAfterPeriod}
                      onCheckedChange={(value) => updateSetting('privacy', 'anonymizeAfterPeriod', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Marketing Consent</Label>
                      <p className="text-sm text-muted-foreground">Require explicit consent for marketing communications</p>
                    </div>
                    <Switch
                      checked={settings.privacy.requireConsentForMarketing}
                      onCheckedChange={(value) => updateSetting('privacy', 'requireConsentForMarketing', value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Data Export</Label>
                      <p className="text-sm text-muted-foreground">Allow patients to export their data</p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowDataExport}
                      onCheckedChange={(value) => updateSetting('privacy', 'allowDataExport', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Encrypt Sensitive Data</Label>
                      <p className="text-sm text-muted-foreground">Encrypt sensitive patient information</p>
                    </div>
                    <Switch
                      checked={settings.privacy.encryptSensitiveData}
                      onCheckedChange={(value) => updateSetting('privacy', 'encryptSensitiveData', value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Birthday Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send birthday wishes to patients</p>
                    </div>
                    <Switch
                      checked={settings.notifications.birthdayReminders}
                      onCheckedChange={(value) => updateSetting('notifications', 'birthdayReminders', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send appointment reminders</p>
                    </div>
                    <Switch
                      checked={settings.notifications.appointmentReminders}
                      onCheckedChange={(value) => updateSetting('notifications', 'appointmentReminders', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Prescription Refill Reminders</Label>
                      <p className="text-sm text-muted-foreground">Remind patients about prescription refills</p>
                    </div>
                    <Switch
                      checked={settings.notifications.prescriptionRefillReminders}
                      onCheckedChange={(value) => updateSetting('notifications', 'prescriptionRefillReminders', value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(value) => updateSetting('notifications', 'emailNotifications', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(value) => updateSetting('notifications', 'smsNotifications', value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Medical Records Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultRecordType">Default Record Type</Label>
                    <Select
                      value={settings.records.defaultRecordType}
                      onValueChange={(value) => updateSetting('records', 'defaultRecordType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="test">Test Result</SelectItem>
                        <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-archive Old Records</Label>
                      <p className="text-sm text-muted-foreground">Automatically archive old medical records</p>
                    </div>
                    <Switch
                      checked={settings.records.autoArchiveOldRecords}
                      onCheckedChange={(value) => updateSetting('records', 'autoArchiveOldRecords', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="archiveAfter">Archive After (Months)</Label>
                    <Input
                      id="archiveAfter"
                      type="number"
                      value={settings.records.archiveAfterMonths}
                      onChange={(e) => updateSetting('records', 'archiveAfterMonths', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Doctor Signature</Label>
                      <p className="text-sm text-muted-foreground">Require digital signature for medical records</p>
                    </div>
                    <Switch
                      checked={settings.records.requireDoctorSignature}
                      onCheckedChange={(value) => updateSetting('records', 'requireDoctorSignature', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Patient Access</Label>
                      <p className="text-sm text-muted-foreground">Allow patients to view their medical records</p>
                    </div>
                    <Switch
                      checked={settings.records.allowPatientAccess}
                      onCheckedChange={(value) => updateSetting('records', 'allowPatientAccess', value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-800">
                <Settings className="w-4 h-4" />
                <span className="font-medium">You have unsaved changes</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setHasChanges(false)}>
                  Discard
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}