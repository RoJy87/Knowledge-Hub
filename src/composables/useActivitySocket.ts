import { onBeforeUnmount, ref } from 'vue';
import { io, type Socket } from 'socket.io-client';
import type { Activity } from '@/types/models';

export function useActivitySocket(onActivity?: (activity: Activity) => void) {
  const connected = ref(false);
  let socket: Socket | null = null;

  function resolveWsUrl(): string {
    const envUrl = import.meta.env.VITE_WS_URL as string | undefined;
    if (envUrl) return envUrl;
    return `${window.location.protocol === 'https:' ? 'https' : 'http'}://${window.location.host}`;
  }

  function connect() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    socket = io(`${resolveWsUrl()}/activity`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      connected.value = true;
    });

    socket.on('disconnect', () => {
      connected.value = false;
    });

    socket.on('connect_error', () => {
      connected.value = false;
    });

    socket.on('activity:new', (activity: Activity) => {
      onActivity?.(activity);
    });
  }

  function disconnect() {
    socket?.disconnect();
    socket = null;
    connected.value = false;
  }

  function joinArticle(articleId: string) {
    socket?.emit('join:article', articleId);
  }

  function leaveArticle(articleId: string) {
    socket?.emit('leave:article', articleId);
  }

  function joinProject(projectId: string) {
    socket?.emit('join:project', projectId);
  }

  function leaveProject(projectId: string) {
    socket?.emit('leave:project', projectId);
  }

  connect();

  onBeforeUnmount(disconnect);

  return {
    connected,
    disconnect,
    joinArticle,
    leaveArticle,
    joinProject,
    leaveProject,
  };
}