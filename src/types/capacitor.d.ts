declare module '@capacitor/biometrics' {
  export const Biometrics: {
    checkBiometrics(): Promise<{ isAvailable: boolean; biometryType: string }>;
    authenticate(options: { reason: string }): Promise<{ authenticated: boolean }>;
  };
}

declare module '@capacitor-community/biometrics' {
  export const Biometrics: {
    checkBiometrics(): Promise<{ isAvailable: boolean; biometryType: string }>;
    authenticate(options: { reason: string }): Promise<{ authenticated: boolean }>;
  };
}

declare module '@capacitor/push-notifications' {
  export const PushNotifications: {
    requestPermissions(): Promise<void>;
    register(): Promise<void>;
    addListener(
      event: 'registration',
      callback: (data: { value: string }) => void
    ): Promise<{ remove: () => void }>;
    addListener(
      event: 'pushReceived',
      callback: (data: Record<string, unknown>) => void
    ): Promise<{ remove: () => void }>;
    addListener(
      event: string,
      callback: (data: Record<string, unknown>) => void
    ): Promise<{ remove: () => void }>;
  };
}

declare module '@capacitor-community/sms-retriever' {
  export const SMSRetriever: {
    startListening(): Promise<void>;
    addListener(
      event: string,
      callback: (data: { message: string }) => void
    ): Promise<{ remove: () => void }>;
  };
}
