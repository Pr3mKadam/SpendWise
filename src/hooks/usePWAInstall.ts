import { useState, useEffect } from 'react';
import { BeforeInstallPromptEvent } from '@/types/dom';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      // Log install to analytics or clear state
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    // Check if it's already installed globally (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const triggerInstall = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSPrompt(true);
      } else {
        alert("App installation is not available. Please try installing from your browser options.");
      }
      return;
    }
    
    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  return { 
    isInstallable: !!deferredPrompt, 
    isAppInstalled, 
    triggerInstall, 
    isIOS, 
    showIOSPrompt, 
    closeIOSPrompt: () => setShowIOSPrompt(false) 
  };
}
