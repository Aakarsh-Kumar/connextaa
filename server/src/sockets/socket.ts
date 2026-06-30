import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';
import logger from '../utils/logger';
import { registerChatSockets } from './chat.socket';

let io: Server | null = null;

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        callback(null, true);
      },
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      let token: string | undefined;

      const cookieHeader = socket.handshake.headers.cookie;
      const cookies = parseCookies(cookieHeader);
      if (cookies.token) {
        token = cookies.token;
      }

      if (!token && socket.handshake.query?.token) {
        token = socket.handshake.query.token as string;
      }

      if (!token && socket.handshake.headers.authorization?.startsWith('Bearer ')) {
        token = socket.handshake.headers.authorization.replace('Bearer ', '').trim();
      }

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = verifyToken(token);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      logger.error('Socket authentication failed', err);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info(`User ${user.id} connected via Socket.IO`);

    // Register chat sockets
    registerChatSockets(io!, socket);
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
}
