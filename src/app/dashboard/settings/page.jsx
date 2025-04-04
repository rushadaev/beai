'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { getUserData, updateUserSettings, updateSingleSetting } from '@/lib/firebase/firestore';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    'settings.theme': 'dark',
    'settings.notifications.email': true,
    'settings.notifications.push': true,
    'settings.privacy.showProfile': true,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userData = await getUserData(user.uid);
        
        if (userData) {
          setSettings(userData);
          // Flatten nested objects for form data
          setFormData({
            displayName: userData.displayName || '',
            'settings.theme': userData.settings?.theme || 'dark',
            'settings.notifications.email': userData.settings?.notifications?.email ?? true,
            'settings.notifications.push': userData.settings?.notifications?.push ?? true,
            'settings.privacy.showProfile': userData.settings?.privacy?.showProfile ?? true,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Save individual settings
      const promises = Object.entries(formData).map(([key, value]) => {
        if (key === 'displayName') {
          return updateUserSettings(user.uid, { displayName: value });
        } else {
          return updateSingleSetting(user.uid, key, value);
        }
      });
      
      await Promise.all(promises);
      
      // Reload user data
      const updatedData = await getUserData(user.uid);
      setSettings(updatedData);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark p-6">
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-2xl font-bold text-primary mb-6">Settings</h1>
          <div className="animate-pulse bg-gray-800 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-primary mb-6">Settings</h1>
        
        <form onSubmit={saveSettings} className="bg-gray-900 rounded-lg p-6 shadow-lg">
          <div className="mb-8 border-b border-gray-800 pb-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Profile</h2>
            
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-primary focus:ring-accent focus:border-accent"
              />
            </div>
            
            <div className="text-sm text-gray-400">
              Email: {user?.email}
            </div>
          </div>
          
          <div className="mb-8 border-b border-gray-800 pb-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Appearance</h2>
            
            <div className="mb-4">
              <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-1">
                Theme
              </label>
              <select
                id="theme"
                name="settings.theme"
                value={formData['settings.theme']}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-primary focus:ring-accent focus:border-accent"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
          
          <div className="mb-8 border-b border-gray-800 pb-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Notifications</h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="settings.notifications.email"
                  checked={formData['settings.notifications.email']}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-700 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-300">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  name="settings.notifications.push"
                  checked={formData['settings.notifications.push']}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-700 rounded"
                />
                <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-300">
                  Push Notifications
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary mb-4">Privacy</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showProfile"
                name="settings.privacy.showProfile"
                checked={formData['settings.privacy.showProfile']}
                onChange={handleInputChange}
                className="h-4 w-4 text-accent focus:ring-accent border-gray-700 rounded"
              />
              <label htmlFor="showProfile" className="ml-2 block text-sm text-gray-300">
                Show my profile to other users
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-accent text-dark rounded-md hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 