let memoryDeviceId = null;

export function getOrCreateDeviceId() {
  try {
    let devId = localStorage.getItem('karshaq_device_id');
    if (!devId) {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const debugInfo = gl ? gl.getExtension('WEBGL_debug_renderer_info') : null;
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        renderer
      ].join('###');
      
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
      devId = `KSQ-DEV-${Math.abs(hash).toString(36).toUpperCase()}-${randomPart}`;
      localStorage.setItem('karshaq_device_id', devId);
    }
    return devId;
  } catch (err) {
    console.warn("localStorage is blocked or unavailable. Falling back to memory storage.", err);
    if (!memoryDeviceId) {
      memoryDeviceId = `KSQ-DEV-MEM-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
    }
    return memoryDeviceId;
  }
}
