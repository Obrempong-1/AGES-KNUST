
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { BellRing } from 'lucide-react';
import { isSupported } from 'firebase/messaging';

const NotificationPrompt = () => {
  const { requestNotificationPermission } = useNotifications();

  useEffect(() => {
    isSupported().then((supported) => {
      if (supported) {
        const promptShown = localStorage.getItem('notificationPromptShown') === 'true';
        if (!promptShown && Notification.permission === 'default') {
          const toastId = toast(
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3">
                <BellRing className="h-6 w-6 text-primary" />
                <h4 className="font-semibold">Stay Updated!</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Enable push notifications to receive the latest news and announcements directly on your device.
              </p>
              <div className="flex gap-2 self-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.dismiss(toastId);
                    localStorage.setItem('notificationPromptShown', 'true');
                  }}
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    await requestNotificationPermission();
                    toast.dismiss(toastId);
                    localStorage.setItem('notificationPromptShown', 'true');
                  }}
                >
                  Enable
                </Button>
              </div>
            </div>,
            {
              duration: Infinity, 
              position: 'bottom-right',
            }
          );
        }
      }
    });
  }, [requestNotificationPermission]);

  return null; 
};

export default NotificationPrompt;
