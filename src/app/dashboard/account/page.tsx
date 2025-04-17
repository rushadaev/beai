'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getUserData, updateUserProfile, updateUserPreferences } from '@/lib/api';
import { updateUserPassword, logoutAllDevices } from '@/lib/firebase/auth';
import { useSafeTranslation } from '@/components/I18nProvider';

// Define types for user data
interface UserNotifications {
  newChats: boolean;
  chatUpdates: boolean;
  monthlyReport: boolean;
  productUpdates: boolean;
}

interface UserPreferences {
  notifications: UserNotifications;
}

interface UserData {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  displayName?: string;
  preferences?: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function AccountPage() {
  const { t } = useSafeTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notifications, setNotifications] = useState<UserNotifications>({
    newChats: true,
    chatUpdates: true,
    monthlyReport: true,
    productUpdates: false,
  });
  
  // New state variables for password management
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Browser and device info
  const [deviceInfo, setDeviceInfo] = useState<{
    browser: string;
    os: string;
    lastActive: string;
  }>({
    browser: 'Unknown Browser',
    os: 'Unknown OS',
    lastActive: new Date().toLocaleString()
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // First, add a check for Google provider in the useEffect
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  
  // Detect browser and OS
  useEffect(() => {
    // Simple browser and OS detection
    const detectBrowserAndOS = () => {
      const userAgent = navigator.userAgent;
      let browser = 'Unknown Browser';
      let os = 'Unknown OS';
      
      // Detect browser
      if (userAgent.indexOf('Chrome') > -1) {
        browser = 'Chrome';
      } else if (userAgent.indexOf('Safari') > -1) {
        browser = 'Safari';
      } else if (userAgent.indexOf('Firefox') > -1) {
        browser = 'Firefox';
      } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
        browser = 'Internet Explorer';
      } else if (userAgent.indexOf('Edge') > -1) {
        browser = 'Microsoft Edge';
      }
      
      // Detect OS
      if (userAgent.indexOf('Windows') > -1) {
        os = 'Windows';
      } else if (userAgent.indexOf('Mac') > -1) {
        os = 'macOS';
      } else if (userAgent.indexOf('Linux') > -1) {
        os = 'Linux';
      } else if (userAgent.indexOf('Android') > -1) {
        os = 'Android';
      } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
        os = 'iOS';
      }
      
      setDeviceInfo({
        browser,
        os,
        lastActive: new Date().toLocaleString()
      });
    };
    
    detectBrowserAndOS();
  }, []);
  
  // Fetch user data from Firestore when component mounts
  useEffect(() => {
    async function fetchUserData() {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const userData = await getUserData(user.uid) as UserData | null;
        
        if (userData) {
          // Set profile data
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setCompanyName(userData.companyName || '');
          
          // Set notification preferences if they exist
          if (userData.preferences?.notifications) {
            setNotifications(prevNotifications => ({
              ...prevNotifications,
              ...userData.preferences?.notifications
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [user]);
  
  // First, add a check for Google provider in the useEffect
  useEffect(() => {
    // Check if user is authenticated via Google
    const checkAuthProvider = () => {
      if (user && user.providerData && user.providerData.length > 0) {
        const isGoogleUser = user.providerData.some(
          (provider: { providerId: string }) => provider.providerId === 'google.com'
        );
        setIsGoogleUser(isGoogleUser);
      }
    };
    
    checkAuthProvider();
  }, [user]);
  
  // Save profile data to Firestore
  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    
    try {
      setSaving(true);
      
      const profileData: UserData = {
        firstName,
        lastName,
        companyName,
        email: user.email || '',
      };
      
      const success = await updateUserProfile(user.uid, profileData);
      
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Save notification preferences to Firestore
  const handleSavePreferences = async () => {
    if (!user?.uid) return;
    
    try {
      setSaving(true);
      
      const preferencesData: UserPreferences = {
        notifications
      };
      
      const success = await updateUserPreferences(user.uid, preferencesData);
      
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Validate password and update
  const handleUpdatePassword = async () => {
    // Reset states
    setPasswordError('');
    setPasswordSuccess(false);
    
    // Basic validation
    if (!currentPassword) {
      setPasswordError(t('dashboard.account.security.errors.currentPasswordRequired'));
      return;
    }
    
    if (!newPassword) {
      setPasswordError(t('dashboard.account.security.errors.newPasswordRequired'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t('dashboard.account.security.errors.passwordsDoNotMatch'));
      return;
    }
    
    // Password strength check
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError(t('dashboard.account.security.errors.passwordComplexity'));
      return;
    }
    
    try {
      setSaving(true);
      
      const result = await updateUserPassword(currentPassword, newPassword);
      
      if (result.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.error || t('dashboard.account.security.errors.updateFailed'));
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(t('dashboard.account.security.errors.unexpectedError'));
    } finally {
      setSaving(false);
    }
  };
  
  // Handle logout from all devices
  const handleLogoutAllDevices = async () => {
    try {
      setSaving(true);
      
      const result = await logoutAllDevices();
      
      if (result.success) {
        // Redirect to login page
        window.location.href = '/login';
      } else {
        console.error('Failed to logout from all devices:', result.error);
      }
    } catch (error) {
      console.error('Error logging out from all devices:', error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">{t('dashboard.account.title')}</h2>
          <p className="text-secondary">{t('dashboard.account.subtitle')}</p>
        </div>
        
        {/* Tab navigation */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', labelKey: 'dashboard.account.tabs.profile' },
              { id: 'security', labelKey: 'dashboard.account.tabs.security' },
              { id: 'preferences', labelKey: 'dashboard.account.tabs.preferences' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'security' | 'preferences')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-secondary hover:border-border hover:text-primary'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Success message */}
        {saveSuccess && (
          <div className="mb-4 rounded-md bg-green-500/10 p-3 text-green-400">
            <p>{t('dashboard.account.messages.saveSuccess')}</p>
          </div>
        )}
        
        {loading ? (
          // Loading skeleton UI
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm animate-pulse">
            <div className="h-6 w-1/4 bg-dark/50 rounded mb-6"></div>
            
            <div className="mb-6 overflow-hidden rounded-lg border border-border bg-dark/40 shadow-sm h-32"></div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 w-1/4 bg-dark/50 rounded mb-2"></div>
                  <div className="h-10 w-full bg-dark/40 rounded"></div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <div className="h-10 w-32 bg-dark/40 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-primary">{t('dashboard.account.profile.title')}</h3>
                
                <div className="mb-6 overflow-hidden rounded-lg border border-border bg-dark shadow-sm">
                  <div className="flex flex-col items-center justify-center p-8 sm:flex-row sm:justify-start">
                    <div className="relative mb-4 h-24 w-24 sm:mb-0 sm:mr-6">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <span className="text-3xl font-medium">{firstName ? firstName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}</span>
                      </div>
                      <button className="absolute bottom-0 right-0 rounded-full bg-accent p-1.5 text-dark hover:bg-accent/90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium text-primary">{firstName || user?.email?.split('@')[0] || t('dashboard.account.profile.defaultUser')}</h4>
                      <p className="text-secondary">{user?.email}</p>
                      <p className="mt-1 text-xs text-secondary">{t('dashboard.account.profile.memberSince', { date: new Date().toLocaleDateString() })}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary">
                      {t('dashboard.account.profile.firstNameLabel')}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t('dashboard.account.profile.firstNamePlaceholder')}
                      className="w-full rounded-md border border-border bg-dark px-4 py-2 text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary">
                      {t('dashboard.account.profile.lastNameLabel')}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t('dashboard.account.profile.lastNamePlaceholder')}
                      className="w-full rounded-md border border-border bg-dark px-4 py-2 text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary">
                      {t('dashboard.account.profile.emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full rounded-md border border-border bg-dark/50 px-4 py-2 text-primary opacity-70"
                    />
                    <p className="mt-1 text-xs text-secondary">
                      {t('dashboard.account.profile.emailHelpText')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary">
                      {t('dashboard.account.profile.companyNameLabel')}
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={t('dashboard.account.profile.companyNamePlaceholder')}
                      className="w-full rounded-md border border-border bg-dark px-4 py-2 text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saving || loading}
                    className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
                  >
                    {saving ? t('dashboard.account.buttons.saving') : t('dashboard.account.buttons.saveChanges')}
                  </button>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-primary">{t('dashboard.account.security.changePasswordTitle')}</h3>
                
                {isGoogleUser ? (
                  <div className="mb-6 rounded-md bg-blue-500/10 p-4 text-blue-400">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium">{t('dashboard.account.security.googleAccount.title')}</p>
                        <p className="mt-1 text-sm">{t('dashboard.account.security.googleAccount.message')}</p>
                        <a 
                          href="https://myaccount.google.com/security" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-2 inline-block text-sm underline"
                        >
                          {t('dashboard.account.security.googleAccount.link')}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Password success message */}
                    {passwordSuccess && (
                      <div className="mb-4 rounded-md bg-green-500/10 p-3 text-green-400">
                        <p>{t('dashboard.account.security.messages.passwordUpdateSuccess')}</p>
                      </div>
                    )}
                    
                    {/* Password error message */}
                    {passwordError && (
                      <div className="mb-4 rounded-md bg-red-500/10 p-3 text-red-400">
                        <p>{passwordError}</p>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-primary">
                          {t('dashboard.account.security.currentPasswordLabel')}
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder={t('dashboard.account.security.currentPasswordPlaceholder')}
                          className="w-full rounded-md border border-border bg-dark px-4 py-2 text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="mb-1 block text-sm font-medium text-primary">
                          {t('dashboard.account.security.newPasswordLabel')}
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t('dashboard.account.security.newPasswordPlaceholder')}
                          className="w-full rounded-md border border-border bg-dark px-4 py-2 text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-secondary">
                          {t('dashboard.account.security.passwordComplexityHelpText')}
                        </p>
                      </div>
                      
                      <div>
                        <label className="mb-1 block text-sm font-medium text-primary">
                          {t('dashboard.account.security.confirmPasswordLabel')}
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={t('dashboard.account.security.confirmPasswordPlaceholder')}
                          className="w-full rounded-md border border-border bg-dark px-4 py-2 text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
                        />
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <button 
                          onClick={handleUpdatePassword}
                          disabled={saving} 
                          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
                        >
                          {saving ? t('dashboard.account.buttons.updating') : t('dashboard.account.buttons.updatePassword')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="mb-4 text-lg font-medium text-primary">{t('dashboard.account.security.twoFactor.title')}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary">{t('dashboard.account.security.twoFactor.subtitle')}</p>
                      <p className="text-sm text-secondary">
                        {t('dashboard.account.security.twoFactor.description')}
                      </p>
                    </div>
                    <button 
                      disabled 
                      className="rounded-md border border-accent/50 bg-transparent px-4 py-2 text-sm font-medium text-accent/50"
                    >
                      {t('dashboard.account.security.twoFactor.comingSoonButton')}
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="mb-4 text-lg font-medium text-primary">{t('dashboard.account.security.access.title')}</h3>
                  
                  <div className="mb-4 rounded-lg bg-dark p-4">
                    <div className="flex items-center">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-primary">{t('dashboard.account.security.access.deviceInfo', { browser: deviceInfo.browser, os: deviceInfo.os })}</h4>
                        <p className="text-xs text-secondary">{t('dashboard.account.security.access.lastActive', { date: deviceInfo.lastActive })}</p>
                      </div>
                      <div className="ml-auto flex">
                        <span className="mr-2 rounded-full bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-400">
                          {t('dashboard.account.security.access.currentDevice')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={handleLogoutAllDevices}
                      disabled={saving}
                      className="rounded-md bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {saving ? t('dashboard.account.buttons.loggingOut') : t('dashboard.account.buttons.logOutAll')}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-secondary text-right">
                    {t('dashboard.account.security.access.logoutNote')}
                  </p>
                </div>
              </div>
            )}
            
            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-primary">{t('dashboard.account.preferences.title')}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary">{t('dashboard.account.preferences.notifications.newChats.title')}</p>
                      <p className="text-sm text-secondary">
                        {t('dashboard.account.preferences.notifications.newChats.description')}
                      </p>
                    </div>
                    <div className="relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-card" onClick={() => setNotifications({...notifications, newChats: !notifications.newChats})}>
                      <span className={`absolute h-5 w-5 rounded-full transition-all ${notifications.newChats ? 'right-0.5 bg-accent' : 'left-0.5 bg-dark'}`}></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary">{t('dashboard.account.preferences.notifications.chatUpdates.title')}</p>
                      <p className="text-sm text-secondary">
                        {t('dashboard.account.preferences.notifications.chatUpdates.description')}
                      </p>
                    </div>
                    <div className="relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-card" onClick={() => setNotifications({...notifications, chatUpdates: !notifications.chatUpdates})}>
                      <span className={`absolute h-5 w-5 rounded-full transition-all ${notifications.chatUpdates ? 'right-0.5 bg-accent' : 'left-0.5 bg-dark'}`}></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary">{t('dashboard.account.preferences.notifications.monthlyReport.title')}</p>
                      <p className="text-sm text-secondary">
                        {t('dashboard.account.preferences.notifications.monthlyReport.description')}
                      </p>
                    </div>
                    <div className="relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-card" onClick={() => setNotifications({...notifications, monthlyReport: !notifications.monthlyReport})}>
                      <span className={`absolute h-5 w-5 rounded-full transition-all ${notifications.monthlyReport ? 'right-0.5 bg-accent' : 'left-0.5 bg-dark'}`}></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary">{t('dashboard.account.preferences.notifications.productUpdates.title')}</p>
                      <p className="text-sm text-secondary">
                        {t('dashboard.account.preferences.notifications.productUpdates.description')}
                      </p>
                    </div>
                    <div className="relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-card" onClick={() => setNotifications({...notifications, productUpdates: !notifications.productUpdates})}>
                      <span className={`absolute h-5 w-5 rounded-full transition-all ${notifications.productUpdates ? 'right-0.5 bg-accent' : 'left-0.5 bg-dark'}`}></span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleSavePreferences}
                    disabled={saving || loading}
                    className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
                  >
                    {saving ? t('dashboard.account.buttons.saving') : t('dashboard.account.buttons.savePreferences')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 