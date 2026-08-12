import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { api, ApiError } from './api';
import { useAuthStore } from '../store/authStore';

export interface DataExportResult {
  requestId: string;
  status: string;
  downloadUrl: string;
  format: string;
}

type ApiDataExport = {
  request_id: string;
  status: string;
  download_url: string;
  format?: string;
};

function mapExport(d: ApiDataExport): DataExportResult {
  return {
    requestId: d.request_id,
    status: d.status,
    downloadUrl: d.download_url,
    format: (d.format ?? 'pdf').toLowerCase(),
  };
}

function resolveDownloadUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  return `${base}/${url.replace(/^\//, '')}`;
}

export const requestReceiverDataExport = async (): Promise<DataExportResult> => {
  const res = await api.post('/receiver/account/data-export/');
  return mapExport(res.data.data as ApiDataExport);
};

export const requestRestaurantDataExport = async (): Promise<DataExportResult> => {
  const res = await api.post('/restaurant/account/data-export/');
  return mapExport(res.data.data as ApiDataExport);
};

/** Download the export PDF with the session token, then open the native share sheet. */
export const downloadAndShareDataExport = async (
  downloadUrl: string,
  format = 'pdf',
): Promise<void> => {
  const token = useAuthStore.getState().accessToken;
  if (!token) {
    throw new ApiError('SESSION_EXPIRED', 'Session expired. Please log in again.');
  }

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new ApiError('DOWNLOAD_FAILED', 'Could not access device storage.');
  }

  const ext = format.toLowerCase() || 'pdf';
  const fileUri = `${cacheDir}udufood-data-export.${ext}`;
  const result = await FileSystem.downloadAsync(resolveDownloadUrl(downloadUrl), fileUri, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new ApiError('DOWNLOAD_FAILED', 'Could not download your data. Please try again.');
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new ApiError('SHARE_UNAVAILABLE', 'Sharing is not available on this device.');
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: ext === 'pdf' ? 'application/pdf' : 'application/octet-stream',
    UTI: ext === 'pdf' ? 'com.adobe.pdf' : undefined,
    dialogTitle: 'Save your UDUFood data export',
  });
};
