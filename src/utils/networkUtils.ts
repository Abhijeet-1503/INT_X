/**
 * Utility functions for network operations
 */

/**
 * Get the network IP address for mobile device access
 * Falls back to common network IPs if localhost is detected
 */
export const getNetworkUrl = (): string => {
  const currentUrl = window.location.origin;
  
  // If already using a network IP, return as is
  if (!currentUrl.includes('localhost') && !currentUrl.includes('127.0.0.1')) {
    return currentUrl;
  }
  
  // Use the correct port from Vite config (8080, but dev server might use 8081)
  const port = window.location.port || '8081';
  
  // Try to detect network IP from common patterns
  // These are the IPs shown in your Vite dev server output
  const possibleNetworkIPs = [
    '10.100.122.223', // Your primary network IP
    '172.30.176.1',   // Your secondary network IP
    '192.168.1.1',    // Common router gateway
    '192.168.0.1',    // Another common gateway
    '192.168.1.100',  // Common router range
    '10.0.0.1'        // Corporate network gateway
  ];
  
  // Return the first network IP (your primary one)
  const networkUrl = `http://${possibleNetworkIPs[0]}:${port}`;
  
  console.log('Network URL generated:', networkUrl);
  console.log('Current URL:', currentUrl);
  console.log('Port detected:', port);
  
  return networkUrl;
};

/**
 * Test if a URL is accessible from mobile devices
 */
export const testNetworkConnectivity = async (url: string): Promise<boolean> => {
  try {
    // Simple connectivity test
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      timeout: 5000
    });
    return true;
  } catch (error) {
    console.warn('Network connectivity test failed:', error);
    return false;
  }
};

/**
 * Generate a mobile-friendly URL for QR codes
 */
export const generateMobileUrl = (sessionId: string): string => {
  const baseUrl = getNetworkUrl();
  return `${baseUrl}/#/mobile-wireless/${sessionId}`;
};

/**
 * Get device network information
 */
export const getDeviceNetworkInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};
