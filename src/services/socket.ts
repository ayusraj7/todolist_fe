import { io, Socket } from 'socket.io-client';
import { Task } from '../types';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('http://localhost:5000', {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join-room', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId);
    }
  }

  onTaskCreated(callback: (task: Task) => void) {
    if (this.socket) {
      this.socket.on('task-created', callback);
    }
  }

  onTaskUpdated(callback: (task: Task) => void) {
    if (this.socket) {
      this.socket.on('task-updated', callback);
    }
  }

  onTaskDeleted(callback: (taskId: string) => void) {
    if (this.socket) {
      this.socket.on('task-deleted', callback);
    }
  }

  emitTaskCreated(task: Task) {
    if (this.socket) {
      this.socket.emit('task-created', { task, roomId: 'tasks' });
    }
  }

  emitTaskUpdated(task: Task) {
    if (this.socket) {
      this.socket.emit('task-updated', { task, roomId: 'tasks' });
    }
  }

  emitTaskDeleted(taskId: string) {
    if (this.socket) {
      this.socket.emit('task-deleted', { taskId, roomId: 'tasks' });
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService(); 