import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'activity',
})
export class ActivityGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ActivityGateway.name);
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from query or auth header
      const token = client.handshake.auth.token || client.handshake.query.token;

      if (!token) {
        this.logger.warn('Client connected without token');
        client.disconnect();
        return;
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.tokenType !== 'access') {
        this.logger.warn('Invalid token type');
        client.disconnect();
        return;
      }

      // Store user connection
      const userId = payload.sub;
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      // Join user to their own room
      client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      this.server.emit('users:update', { onlineUsers: this.getOnlineUsers() });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
      this.server.emit('users:update', { onlineUsers: this.getOnlineUsers() });
    }
  }

  @SubscribeMessage('join:project')
  handleJoinProject(client: Socket, projectId: string) {
    client.join(`project:${projectId}`);
    this.logger.log(`User ${client.data.userId} joined project room: ${projectId}`);
  }

  @SubscribeMessage('leave:project')
  handleLeaveProject(client: Socket, projectId: string) {
    client.leave(`project:${projectId}`);
    this.logger.log(`User ${client.data.userId} left project room: ${projectId}`);
  }

  @SubscribeMessage('join:article')
  handleJoinArticle(client: Socket, articleId: string) {
    client.join(`article:${articleId}`);
    this.logger.log(`User ${client.data.userId} joined article room: ${articleId}`);
  }

  @SubscribeMessage('leave:article')
  handleLeaveArticle(client: Socket, articleId: string) {
    client.leave(`article:${articleId}`);
    this.logger.log(`User ${client.data.userId} left article room: ${articleId}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    return 'pong';
  }

  /**
   * Broadcast activity to project members
   */
  broadcastToProject(projectId: string, event: string, data: any) {
    this.server.to(`project:${projectId}`).emit(event, data);
    this.logger.log(`Broadcasted ${event} to project: ${projectId}`);
  }

  /**
   * Broadcast activity to article viewers
   */
  broadcastToArticle(articleId: string, event: string, data: any) {
    this.server.to(`article:${articleId}`).emit(event, data);
    this.logger.log(`Broadcasted ${event} to article: ${articleId}`);
  }

  /**
   * Send notification to specific user
   */
  notifyUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
    this.logger.log(`Sent ${event} to user: ${userId}`);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Broadcasted ${event} to all clients`);
  }

  /**
   * Get list of online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
