import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const isNativePlatform = () => Capacitor.isNativePlatform();

export const isIOS = () => Capacitor.getPlatform() === 'ios';

export const isAndroid = () => Capacitor.getPlatform() === 'android';

export async function takePhoto(): Promise<File | null> {
  if (!isNativePlatform()) {
    return null;
  }

  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    if (!photo.dataUrl) {
      return null;
    }

    const response = await fetch(photo.dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
    return file;
  } catch (error) {
    console.error('Camera error:', error);
    return null;
  }
}

export async function selectPhotoFromGallery(): Promise<File | null> {
  if (!isNativePlatform()) {
    return null;
  }

  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });

    if (!photo.dataUrl) {
      return null;
    }

    const response = await fetch(photo.dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'gallery-photo.jpg', { type: 'image/jpeg' });
    return file;
  } catch (error) {
    console.error('Gallery error:', error);
    return null;
  }
}

export async function hapticFeedback(style: ImpactStyle = ImpactStyle.Light) {
  if (isNativePlatform()) {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  }
}
