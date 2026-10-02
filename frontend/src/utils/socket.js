import { io } from 'socket.io-client';
import { store } from '../app/store';
import { addNotification } from '../features/notifications/notificationSlice';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: { token: localStorage.getItem('token') }
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.joinUserRoom();
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('notification', (notification) => {
        store.dispatch(addNotification(notification));
      });

      this.socket.on('event-update', (update) => {
        console.log('Event update received:', update);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinUserRoom() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id && this.socket) {
          this.socket.emit('join-user-room');
        }
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
      }
    }
  }

  joinEventRoom(eventId) {
    if (this.socket) {
      this.socket.emit('join-event-room', eventId);
    }
  }

  leaveEventRoom(eventId) {
    if (this.socket) {
      this.socket.emit('leave-event-room', eventId);
    }
  }
}

const socketService = new SocketService();

export default socketService;
