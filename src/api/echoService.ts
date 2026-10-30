import { sendEchoRequest } from './client';
import {
  CloseRoomResponse,
  CreateRoomResponse,
  DeleteFeedbackResponse,
  GetFeedbackResponse,
  GetRoomResponse,
  RoomMetadata,
  SubmitFeedbackResponse,
} from './types';

export const echoService = {
  /**
   * Creates a new anonymous feedback room.
   */
  async createRoom(roomName: string): Promise<CreateRoomResponse> {
    const trimmed = roomName.trim();
    if (!trimmed) {
      throw new Error('Room name cannot be empty');
    }
    return sendEchoRequest<CreateRoomResponse>({
      action: 'create_room',
      room_name: trimmed,
    });
  },

  /**
   * Retrieves public room metadata by unique ID.
   */
  async getRoom(roomId: string): Promise<RoomMetadata> {
    const cleanId = roomId.trim();
    if (!cleanId) {
      throw new Error('Room ID is required');
    }
    const response = await sendEchoRequest<GetRoomResponse>({
      action: 'get_room',
      room_id: cleanId,
    });

    return {
      room_id: cleanId,
      room_name: response.room.room_name,
      created_at: response.room.created_at,
      status: response.room.status,
      PK: response.room.PK,
      SK: response.room.SK,
    };
  },

  /**
   * Submits an anonymous message to an active room with optional identity metadata.
   */
  async submitFeedback(
    roomId: string,
    message: string,
    options?: { displayName?: string; sessionId?: string }
  ): Promise<SubmitFeedbackResponse> {
    const cleanRoomId = roomId.trim();
    const cleanMessage = message.trim();

    if (!cleanRoomId) {
      throw new Error('Room ID is required');
    }
    if (!cleanMessage) {
      throw new Error('Message cannot be empty');
    }
    if (cleanMessage.length > 2000) {
      throw new Error('Message exceeds the 2000 character maximum limit');
    }

    return sendEchoRequest<SubmitFeedbackResponse>({
      action: 'submit_feedback',
      room_id: cleanRoomId,
      message: cleanMessage,
      ...(options?.displayName ? { display_name: options.displayName } : {}),
      ...(options?.sessionId ? { anonymous_session_id: options.sessionId } : {}),
    });
  },

  /**
   * Retrieves all anonymous feedback items submitted to a room.
   */
  async getFeedback(roomId: string): Promise<GetFeedbackResponse> {
    const cleanRoomId = roomId.trim();
    if (!cleanRoomId) {
      throw new Error('Room ID is required');
    }

    return sendEchoRequest<GetFeedbackResponse>({
      action: 'get_feedback',
      room_id: cleanRoomId,
    });
  },

  /**
   * Deletes a specific feedback item from a room.
   */
  async deleteFeedback(roomId: string, feedbackId: string): Promise<DeleteFeedbackResponse> {
    const cleanRoomId = roomId.trim();
    const cleanFeedbackId = feedbackId.trim();

    if (!cleanRoomId || !cleanFeedbackId) {
      throw new Error('Room ID and Feedback ID are required');
    }

    return sendEchoRequest<DeleteFeedbackResponse>({
      action: 'delete_feedback',
      room_id: cleanRoomId,
      feedback_id: cleanFeedbackId,
    });
  },

  /**
   * Closes a room, preventing further feedback submissions.
   */
  async closeRoom(roomId: string): Promise<CloseRoomResponse> {
    const cleanRoomId = roomId.trim();
    if (!cleanRoomId) {
      throw new Error('Room ID is required');
    }

    return sendEchoRequest<CloseRoomResponse>({
      action: 'close_room',
      room_id: cleanRoomId,
    });
  },
};

