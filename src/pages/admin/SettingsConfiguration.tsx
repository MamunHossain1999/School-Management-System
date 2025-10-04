import React, { useEffect, useRef, useState } from 'react';
import {
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
  useResetToDefaultsMutation,
  useDownloadBackupMutation,
  useRestoreFromBackupMutation,
  useTestEmailConfigurationMutation,
  useTestSmsConfigurationMutation,
  useGetSystemHealthQuery,
  useGetSystemLogsQuery,
  type UpdateSettingsRequest,
} from '../../store/api/settingsApi';

type TabKey =
  | 'school'
  | 'academic'
  | 'time'
  | 'attendance'
  | 'exam'
  | 'fees'
  | 'notifications'
  | 'security'
  | 'system'
  | 'ui'
  | 'integrations'
  | 'health'
  | 'logs';

const tabs: Array<{ key: TabKey; label: string; description: string }> = [
  { key: 'school', label: 'School', description: 'School profile & branding' },
  { key: 'academic', label: 'Academic', description: 'Academic session & dates' },
  { key: 'time', label: 'Time', description: 'School hours & periods' },
  { key: 'attendance', label: 'Attendance', description: 'Attendance rules' },
  { key: 'exam', label: 'Exam', description: 'Grading & marks' },
  { key: 'fees', label: 'Fees', description: 'Currency & reminders' },
  { key: 'notifications', label: 'Notifications', description: 'Email, SMS, Push' },
  { key: 'security', label: 'Security', description: 'Passwords & sessions' },
  { key: 'system', label: 'System', description: 'Backup & maintenance' },
  { key: 'ui', label: 'UI & Locale', description: 'Theme, language, time' },
  { key: 'integrations', label: 'Integrations', description: '3rd party tools' },
  { key: 'health', label: 'Health', description: 'Runtime diagnostics' },
  { key: 'logs', label: 'Logs', description: 'System activity' },
];

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
  </div>
);

const FieldRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

const Input = (
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }
) => {
  const { label, hint, className, ...rest } = props;
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <input
        {...rest}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
          className || ''
        }`}
      />
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
};

const Switch = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="flex items-center gap-3 select-none">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-gray-300'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
);

const ActionBar = ({
  onSave,
  onReset,
  saving,
  disabled,
}: {
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  disabled: boolean;
}) => (
  <div className="flex flex-wrap items-center gap-3">
    <button
      onClick={onSave}
      disabled={disabled || saving}
      className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
    >
      {saving ? 'Saving...' : 'Save Changes'}
    </button>
    <button
      onClick={onReset}
      disabled={disabled || saving}
      className="inline-flex items-center justify-center rounded-md border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
    >
      Reset To Defaults
    </button>
  </div>
);

const SettingsConfiguration: React.FC = () => {
  const [active, setActive] = useState<TabKey>('school');
  const {
    data: settings,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetSystemSettingsQuery();
  const [updateSettings, { isLoading: isSaving } ] = useUpdateSystemSettingsMutation();
  const [resetDefaults] = useResetToDefaultsMutation();
  const [downloadBackup, { isLoading: isDownloading }] = useDownloadBackupMutation();
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreFromBackupMutation();
  const [testEmail, { isLoading: isTestingEmail }] = useTestEmailConfigurationMutation();
  const [testSms, { isLoading: isTestingSms }] = useTestSmsConfigurationMutation();
  const { data: health } = useGetSystemHealthQuery();
  const [logsPage, setLogsPage] = useState(1);
  const { data: logsData, refetch: refetchLogs, isFetching: logsLoading } = useGetSystemLogsQuery({ page: logsPage, limit: 20 });

  const [form, setForm] = useState<UpdateSettingsRequest>({});
  const fileRef = useRef<HTMLInputElement | null>(null);
  const hasSettings = !!settings;

  // Initialize form when settings load
  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, createdAt, updatedAt, updatedBy, ...rest } = settings;
      setForm(rest);
    }
  }, [settings]);

  const handleChange = <K extends keyof UpdateSettingsRequest>(key: K, value: UpdateSettingsRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const numOrUndef = (v: string) => (v === '' ? undefined : Number(v));
  const themeOrDefault = (v: string): 'light' | 'dark' | 'auto' => (v === 'light' || v === 'dark' || v === 'auto' ? v : 'light');
  const timeFormatOrDefault = (v: string): '12h' | '24h' => (v === '24h' ? '24h' : '12h');
  const backupFreqOrDefault = (v: string): 'daily' | 'weekly' | 'monthly' =>
    v === 'daily' || v === 'weekly' || v === 'monthly' ? v : 'daily';

  const save = async () => {
    try {
      await updateSettings(form).unwrap();
      await refetch();
      // Simple inline feedback
      alert('Settings updated successfully');
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to update settings');
    }
  };

  const reset = async () => {
    try {
      await resetDefaults({}).unwrap();
      await refetch();
      alert('Settings reset to defaults');
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to reset settings');
    }
  };

  const doBackup = async () => {
    try {
      const blob = await downloadBackup().unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `school-backup-${new Date().toISOString()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to download backup');
    }
  };

  const doRestore = async (file?: File | null) => {
    try {
      if (!file) return;
      const fd = new FormData();
      fd.append('backup', file);
      await restoreBackup(fd).unwrap();
      alert('Restore initiated successfully');
      await refetch();
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to restore from backup');
    }
  };

  const emailTest = async () => {
    const email = prompt('Enter email to send test message to:');
    if (!email) return;
    try {
      const res = await testEmail({ email }).unwrap();
      alert(res.message || 'Test email sent');
    } catch (e: any) {
      alert(e?.data?.message || 'Email test failed');
    }
  };

  const smsTest = async () => {
    const phone = prompt('Enter phone number to send test SMS to:');
    if (!phone) return;
    try {
      const res = await testSms({ phone }).unwrap();
      alert(res.message || 'Test SMS sent');
    } catch (e: any) {
      alert(e?.data?.message || 'SMS test failed');
    }
  };

  const loading = isLoading || isFetching;

  const TabButton = ({ t }: { t: (typeof tabs)[number] }) => (
    <button
      onClick={() => setActive(t.key)}
      className={`px-3 py-2 rounded-md text-sm font-medium border ${
        active === t.key ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-gray-50'
      }`}
    >
      {t.label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings & Configuration</h2>
          <p className="text-gray-600">School profile, notifications, backup and security.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="rounded-md border px-3 py-2 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={doBackup}
            disabled={isDownloading}
            className="rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            {isDownloading ? 'Downloading...' : 'Download Backup'}
          </button>
          <input
            type="file"
            ref={fileRef}
            onChange={(e) => doRestore(e.target.files?.[0])}
            accept=".zip,.tar,.gz,.tgz"
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isRestoring}
            className="rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            {isRestoring ? 'Restoring...' : 'Restore Backup'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
          Failed to load settings.
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <TabButton key={t.key} t={t} />
        ))}
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm border">
        {loading && !hasSettings ? (
          <p className="text-sm text-gray-600">Loading settings...</p>
        ) : null}

        {/* School */}
        {active === 'school' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="School Profile" subtitle="Basic information about your school" />
            <FieldRow>
              <Input label="School Name" value={form.schoolName || ''} onChange={(e) => handleChange('schoolName', e.target.value)} />
              <Input label="Established Year" type="number" value={String(form.establishedYear ?? '')} onChange={(e) => handleChange('establishedYear', numOrUndef(e.target.value))} />
              <Input label="Address" value={form.schoolAddress || ''} onChange={(e) => handleChange('schoolAddress', e.target.value)} />
              <Input label="Phone" value={form.schoolPhone || ''} onChange={(e) => handleChange('schoolPhone', e.target.value)} />
              <Input label="Email" type="email" value={form.schoolEmail || ''} onChange={(e) => handleChange('schoolEmail', e.target.value)} />
              <Input label="Website" value={form.schoolWebsite || ''} onChange={(e) => handleChange('schoolWebsite', e.target.value)} />
              <Input label="Principal Name" value={form.principalName || ''} onChange={(e) => handleChange('principalName', e.target.value)} />
            </FieldRow>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* Academic */}
        {active === 'academic' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="Academic Settings" />
            <FieldRow>
              <Input label="Academic Year" value={form.academicYear || ''} onChange={(e) => handleChange('academicYear', e.target.value)} />
              <Input label="Current Session" value={form.currentSession || ''} onChange={(e) => handleChange('currentSession', e.target.value)} />
              <Input label="Session Start Date" type="date" value={form.sessionStartDate ? form.sessionStartDate.substring(0,10) : ''} onChange={(e) => handleChange('sessionStartDate', e.target.value)} />
              <Input label="Session End Date" type="date" value={form.sessionEndDate ? form.sessionEndDate.substring(0,10) : ''} onChange={(e) => handleChange('sessionEndDate', e.target.value)} />
            </FieldRow>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* Time */}
        {active === 'time' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="Time Settings" />
            <FieldRow>
              <Input label="School Start Time" type="time" value={form.schoolStartTime || ''} onChange={(e) => handleChange('schoolStartTime', e.target.value)} />
              <Input label="School End Time" type="time" value={form.schoolEndTime || ''} onChange={(e) => handleChange('schoolEndTime', e.target.value)} />
              <Input label="Period Duration (min)" type="number" value={String(form.periodDuration ?? '')} onChange={(e) => handleChange('periodDuration', numOrUndef(e.target.value))} />
              <Input label="Break Duration (min)" type="number" value={String(form.breakDuration ?? '')} onChange={(e) => handleChange('breakDuration', numOrUndef(e.target.value))} />
              <Input label="Lunch Duration (min)" type="number" value={String(form.lunchDuration ?? '')} onChange={(e) => handleChange('lunchDuration', numOrUndef(e.target.value))} />
            </FieldRow>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* Attendance */}
        {active === 'attendance' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="Attendance Rules" />
            <FieldRow>
              <Input label="Grace Period (min)" type="number" value={String(form.attendanceGracePeriod ?? '')} onChange={(e) => handleChange('attendanceGracePeriod', numOrUndef(e.target.value))} />
              <Input label="Late Threshold (min)" type="number" value={String(form.lateMarkThreshold ?? '')} onChange={(e) => handleChange('lateMarkThreshold', numOrUndef(e.target.value))} />
              <Input label="Absent Threshold (min)" type="number" value={String(form.absentMarkThreshold ?? '')} onChange={(e) => handleChange('absentMarkThreshold', numOrUndef(e.target.value))} />
              <Input label="Min Attendance %" type="number" value={String(form.minimumAttendancePercentage ?? '')} onChange={(e) => handleChange('minimumAttendancePercentage', numOrUndef(e.target.value))} />
            </FieldRow>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* Exam */}
        {active === 'exam' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="Exam & Grading" />
            <FieldRow>
              <Input label="Passing Marks" type="number" value={String(form.passingMarks ?? '')} onChange={(e) => handleChange('passingMarks', numOrUndef(e.target.value))} />
              <Input label="Max Marks" type="number" value={String(form.maxMarks ?? '')} onChange={(e) => handleChange('maxMarks', numOrUndef(e.target.value))} />
            </FieldRow>
            <p className="text-sm text-gray-500">Grade scale editing can be added later as a table editor.</p>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* Fees */}
        {active === 'fees' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="Fees & Billing" />
            <FieldRow>
              <Input label="Currency (e.g., USD)" value={form.currency || ''} onChange={(e) => handleChange('currency', e.target.value)} />
              <Input label="Currency Symbol" value={form.currencySymbol || ''} onChange={(e) => handleChange('currencySymbol', e.target.value)} />
              <Input label="Late Fee %" type="number" value={String(form.lateFeePercentage ?? '')} onChange={(e) => handleChange('lateFeePercentage', numOrUndef(e.target.value))} />
            </FieldRow>
            <p className="text-sm text-gray-500">Fee reminder days array can be managed in an advanced editor later.</p>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* Notifications */}
        {active === 'notifications' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="Notifications" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Switch label="Email" checked={!!form.emailNotifications} onChange={(v) => handleChange('emailNotifications', v)} />
              <Switch label="SMS" checked={!!form.smsNotifications} onChange={(v) => handleChange('smsNotifications', v)} />
              <Switch label="Push" checked={!!form.pushNotifications} onChange={(v) => handleChange('pushNotifications', v)} />
            </div>
            <FieldRow>
              <Input label="Retention Days" type="number" value={String(form.notificationRetentionDays ?? '')} onChange={(e) => handleChange('notificationRetentionDays', numOrUndef(e.target.value))} />
            </FieldRow>
            <div className="flex gap-3">
              <button onClick={emailTest} disabled={isTestingEmail} className="rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50">{isTestingEmail ? 'Testing...' : 'Send Test Email'}</button>
              <button onClick={smsTest} disabled={isTestingSms} className="rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50">{isTestingSms ? 'Testing...' : 'Send Test SMS'}</button>
            </div>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* Security */}
        {active === 'security' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="Security" />
            <FieldRow>
              <Input label="Password Min Length" type="number" value={String(form.passwordMinLength ?? '')} onChange={(e) => handleChange('passwordMinLength', numOrUndef(e.target.value))} />
              <Input label="Session Timeout (min)" type="number" value={String(form.sessionTimeoutMinutes ?? '')} onChange={(e) => handleChange('sessionTimeoutMinutes', numOrUndef(e.target.value))} />
              <Input label="Max Login Attempts" type="number" value={String(form.maxLoginAttempts ?? '')} onChange={(e) => handleChange('maxLoginAttempts', numOrUndef(e.target.value))} />
            </FieldRow>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Switch label="Require Uppercase" checked={!!form.passwordRequireUppercase} onChange={(v) => handleChange('passwordRequireUppercase', v)} />
              <Switch label="Require Lowercase" checked={!!form.passwordRequireLowercase} onChange={(v) => handleChange('passwordRequireLowercase', v)} />
              <Switch label="Require Numbers" checked={!!form.passwordRequireNumbers} onChange={(v) => handleChange('passwordRequireNumbers', v)} />
              <Switch label="Require Special" checked={!!form.passwordRequireSpecialChars} onChange={(v) => handleChange('passwordRequireSpecialChars', v)} />
            </div>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* System */}
        {active === 'system' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="System" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Switch label="Maintenance Mode" checked={!!form.maintenanceMode} onChange={(v) => handleChange('maintenanceMode', v)} />
              <Input label="Maintenance Message" value={form.maintenanceMessage || ''} onChange={(e) => handleChange('maintenanceMessage', e.target.value)} />
              <Input label="Backup Frequency (daily/weekly/monthly)" value={form.backupFrequency || ''} onChange={(e) => handleChange('backupFrequency', backupFreqOrDefault(e.target.value))} />
              <Input label="Data Retention Years" type="number" value={String(form.dataRetentionYears ?? '')} onChange={(e) => handleChange('dataRetentionYears', numOrUndef(e.target.value))} />
            </div>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* UI & Locale */}
        {active === 'ui' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="UI & Localization" />
            <FieldRow>
              <Input label="Theme (light/dark/auto)" value={form.theme || ''} onChange={(e) => handleChange('theme', themeOrDefault(e.target.value))} />
              <Input label="Primary Color" value={form.primaryColor || ''} onChange={(e) => handleChange('primaryColor', e.target.value)} />
              <Input label="Secondary Color" value={form.secondaryColor || ''} onChange={(e) => handleChange('secondaryColor', e.target.value)} />
              <Input label="Language" value={form.language || ''} onChange={(e) => handleChange('language', e.target.value)} />
              <Input label="Timezone" value={form.timezone || ''} onChange={(e) => handleChange('timezone', e.target.value)} />
              <Input label="Date Format" value={form.dateFormat || ''} onChange={(e) => handleChange('dateFormat', e.target.value)} />
              <Input label="Time Format (12h/24h)" value={form.timeFormat || ''} onChange={(e) => handleChange('timeFormat', timeFormatOrDefault(e.target.value))} />
            </FieldRow>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* Integrations */}
        {active === 'integrations' && hasSettings ? (
          <div className="space-y-4">
            <SectionHeader title="Integrations" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Switch label="Google Classroom" checked={!!form.googleClassroomEnabled} onChange={(v) => handleChange('googleClassroomEnabled', v)} />
              <Switch label="Microsoft Teams" checked={!!form.microsoftTeamsEnabled} onChange={(v) => handleChange('microsoftTeamsEnabled', v)} />
              <Switch label="Zoom" checked={!!form.zoomEnabled} onChange={(v) => handleChange('zoomEnabled', v)} />
            </div>
            <ActionBar onSave={save} onReset={reset} saving={isSaving} disabled={loading} />
          </div>
        ) : null}

        {/* Health */}
        {active === 'health' ? (
          <div className="space-y-4">
            <SectionHeader title="System Health" />
            {!health ? (
              <p className="text-sm text-gray-600">Loading health...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded border">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-semibold">{health.status}</div>
                </div>
                <div className="p-3 rounded border">
                  <div className="text-xs text-gray-500">Database</div>
                  <div className="font-semibold">{health.database}</div>
                </div>
                <div className="p-3 rounded border">
                  <div className="text-xs text-gray-500">Version</div>
                  <div className="font-semibold">{health.version}</div>
                </div>
                <div className="p-3 rounded border">
                  <div className="text-xs text-gray-500">Storage</div>
                  <div className="font-semibold">{health.storage.used} / {health.storage.total} ({health.storage.percentage}%)</div>
                </div>
                <div className="p-3 rounded border">
                  <div className="text-xs text-gray-500">Memory</div>
                  <div className="font-semibold">{health.memory.used} / {health.memory.total} ({health.memory.percentage}%)</div>
                </div>
                <div className="p-3 rounded border">
                  <div className="text-xs text-gray-500">Uptime (s)</div>
                  <div className="font-semibold">{health.uptime}</div>
                </div>
                <div className="p-3 rounded border md:col-span-3">
                  <div className="text-xs text-gray-500">Last Backup</div>
                  <div className="font-semibold">{health.lastBackup}</div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Logs */}
        {active === 'logs' ? (
          <div className="space-y-4">
            <SectionHeader title="System Logs" />
            <div className="flex items-center justify-between">
              <button onClick={() => refetchLogs()} className="rounded-md border px-3 py-2 hover:bg-gray-50">Refresh Logs</button>
              <div className="flex items-center gap-2">
                <button disabled={logsPage <= 1} onClick={() => setLogsPage((p) => Math.max(1, p - 1))} className="rounded-md border px-2 py-1 disabled:opacity-50">Prev</button>
                <span className="text-sm">Page {logsPage}</span>
                <button onClick={() => setLogsPage((p) => p + 1)} className="rounded-md border px-2 py-1">Next</button>
              </div>
            </div>
            <div className="rounded border divide-y">
              {logsLoading && !logsData ? (
                <div className="p-3 text-sm text-gray-600">Loading logs...</div>
              ) : null}
              {logsData?.logs?.length ? (
                logsData.logs.map((l, idx) => (
                  <div key={idx} className="p-3 flex items-start gap-4">
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      l.level === 'error' ? 'bg-red-100 text-red-700' : l.level === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-700'
                    }`}>{l.level.toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">{new Date(l.timestamp).toLocaleString()}</div>
                      <div className="text-sm text-gray-900">{l.message}</div>
                      <div className="text-xs text-gray-500">{l.user || ''} {l.action ? `• ${l.action}` : ''}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-600">No logs found.</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SettingsConfiguration;
