import type { JarvisAPI } from '../../preload/index';

declare global {
  interface Window {
    jarvis: JarvisAPI;
  }
}

export {};
