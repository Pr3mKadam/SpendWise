import { useCallback, useEffect, useState } from 'react';

type BiometricType = 'face' | 'fingerprint' | 'iris' | 'none';

interface BiometricsResult {
  isAvailable: boolean;
  biometryType: BiometricType;
}

interface AuthenticateResult {
  authenticated: boolean;
}

function isCapacitorAvailable(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform()
  );
}

async function checkBiometrics(): Promise<BiometricsResult> {
  if (!isCapacitorAvailable()) {
    return { isAvailable: false, biometryType: 'none' };
  }
  try {
    // @ts-expect-error Capacitor plugin not installed
    const { Biometrics } = await import('@capacitor/biometrics');
    return await Biometrics.checkBiometrics();
  } catch {
    // @ts-expect-error Capacitor plugin not installed
    const { Biometrics } = await import('@capacitor-community/biometrics');
    const result = await Biometrics.checkBiometrics();
    return {
      isAvailable: result.isAvailable,
      biometryType: result.biometryType as BiometricType,
    };
  }
}

async function authenticate(reason: string): Promise<AuthenticateResult> {
  if (!isCapacitorAvailable()) {
    return { authenticated: false };
  }
  try {
    // @ts-expect-error Capacitor plugin not installed
    const { Biometrics } = await import('@capacitor/biometrics');
    return await Biometrics.authenticate({ reason });
  } catch {
    // @ts-expect-error Capacitor plugin not installed
    const { Biometrics } = await import('@capacitor-community/biometrics');
    const result = await Biometrics.authenticate({ reason });
    return { authenticated: result.authenticated };
  }
}

export function useNativeBiometrics() {
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (!isCapacitorAvailable()) return;
    checkBiometrics().then(result => {
      setIsAvailable(result.isAvailable);
      setBiometricType(result.biometryType);
    });
  }, []);

  const check = useCallback(async (): Promise<BiometricsResult> => {
    return checkBiometrics();
  }, []);

  const auth = useCallback(async (reason: string): Promise<boolean> => {
    const result = await authenticate(reason);
    return result.authenticated;
  }, []);

  return { biometricType, isAvailable, checkBiometrics: check, authenticate: auth };
}
