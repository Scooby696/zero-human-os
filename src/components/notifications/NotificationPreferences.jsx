import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Mail, MessageSquare, Phone, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const EVENT_TYPES = [
  { id: 'agent_failure', label: 'Agent Failure', icon: '⚠️' },
  { id: 'budget_exceeded', label: 'Budget Exceeded', icon: '💰' },
  { id: 'security_alert', label: 'Security Alert', icon: '🔒' },
  { id: 'workflow_complete', label: 'Workflow Complete', icon: '✓' },
];

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const prefs = await base44.entities.NotificationPreference.filter({
          userId: currentUser.id,
        });
        setPreferences(prefs);
      } catch (error) {
        toast.error('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggle = async (prefId, field) => {
    const pref = preferences.find((p) => p.id === prefId);
    if (!pref) return;

    setSaving(prefId);
    try {
      const updated = { ...pref, [field]: !pref[field] };
      await base44.entities.NotificationPreference.update(prefId, {
        [field]: !pref[field],
      });
      setPreferences(preferences.map((p) => (p.id === prefId ? updated : p)));
      toast.success('Preference updated');
    } catch (error) {
      toast.error('Failed to update preference');
    } finally {
      setSaving(null);
    }
  };

  const handleUpdate = async (prefId, field, value) => {
    setSaving(prefId);
    try {
      await base44.entities.NotificationPreference.update(prefId, {
        [field]: value,
      });
      setPreferences(
        preferences.map((p) =>
          p.id === prefId ? { ...p, [field]: value } : p
        )
      );
      toast.success('Preference saved');
    } catch (error) {
      toast.error('Failed to save preference');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (prefId) => {
    if (!window.confirm('Delete this notification preference?')) return;
    try {
      await base44.entities.NotificationPreference.delete(prefId);
      setPreferences(preferences.filter((p) => p.id !== prefId));
      toast.success('Preference deleted');
    } catch (error) {
      toast.error('Failed to delete preference');
    }
  };

  const handleCreate = async (eventType) => {
    try {
      const newPref = await base44.entities.NotificationPreference.create({
        userId: user.id,
        eventType,
        email: true,
        slack: false,
        sms: false,
      });
      setPreferences([...preferences, newPref]);
      toast.success('Preference created');
    } catch (error) {
      toast.error('Failed to create preference');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure how you receive alerts for critical system events
        </p>
      </div>

      {/* Event Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EVENT_TYPES.map((event) => {
          const pref = preferences.find((p) => p.eventType === event.id);

          return (
            <div
              key={event.id}
              className="p-5 rounded-xl bg-card border border-border/50 space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{event.icon}</span>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {event.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {pref ? 'Enabled' : 'Not configured'}
                  </p>
                </div>
              </div>

              {pref ? (
                <div className="space-y-3">
                  {/* Email Channel */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.email}
                      onChange={() => handleToggle(pref.id, 'email')}
                      disabled={saving === pref.id}
                      className="w-4 h-4 rounded"
                    />
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      Email ({user?.email})
                    </span>
                  </label>

                  {/* Slack Channel */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.slack}
                        onChange={() => handleToggle(pref.id, 'slack')}
                        disabled={saving === pref.id}
                        className="w-4 h-4 rounded"
                      />
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Slack</span>
                    </label>
                    {pref.slack && (
                      <input
                        type="text"
                        placeholder="Slack webhook URL"
                        value={pref.slackWebhook || ''}
                        onChange={(e) =>
                          handleUpdate(pref.id, 'slackWebhook', e.target.value)
                        }
                        disabled={saving === pref.id}
                        className="ml-7 w-full text-xs px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                      />
                    )}
                  </div>

                  {/* SMS Channel */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.sms}
                        onChange={() => handleToggle(pref.id, 'sms')}
                        disabled={saving === pref.id}
                        className="w-4 h-4 rounded"
                      />
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">SMS</span>
                    </label>
                    {pref.sms && (
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={pref.phoneNumber || ''}
                        onChange={(e) =>
                          handleUpdate(pref.id, 'phoneNumber', e.target.value)
                        }
                        disabled={saving === pref.id}
                        className="ml-7 w-full text-xs px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                      />
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(pref.id)}
                    disabled={saving === pref.id}
                    className="ml-7 text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => handleCreate(event.id)}
                  size="sm"
                  className="w-full"
                >
                  Enable Notifications
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}