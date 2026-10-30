import { sendEchoRequest } from './client';
import {
  ClaimLegacyRoomResponse,
  CloseRoomResponse,
  CreateRoomResponse,
  DeleteFeedbackResponse,
  DeleteMyPostResponse,
  DiscoverRoomsResponse,
  GetFeedbackResponse,
  GetMyPostsResponse,
  GetOwnerRoomsResponse,
  GetRoomResponse,
  ReopenRoomResponse,
  RoomMetadata,
  RoomVisibility,
  SubmitFeedbackResponse,
  UserPost,
} from './types';

export const echoService = {
  /**
   * Creates a new anonymous feedback room with discussion prompt and visibility.
   */
  async createRoom(
    roomName: string,
    roomDescription: string,
    visibility: RoomVisibility = 'public'
  ): Promise<CreateRoomResponse> {
    const trimmedName = roomName.trim();
    if (!trimmedName) {
      throw new Error('Room name cannot be empty');
    }
    const trimmedDesc = roomDescription.trim();
    if (!trimmedDesc) {
      throw new Error('Room description or discussion prompt cannot be empty');
    }

    return sendEchoRequest<CreateRoomResponse>({
      action: 'create_room',
      room_name: trimmedName,
      room_description: trimmedDesc,
      visibility,
    });
  },

  /**
   * Discovers active public rooms for discussion.
   */
  async discoverRooms(searchQuery?: string): Promise<RoomMetadata[]> {
    const payload: any = { action: 'discover_rooms' };
    if (searchQuery && searchQuery.trim()) {
      payload.search = searchQuery.trim();
    }
    const res = await sendEchoRequest<DiscoverRoomsResponse>(payload);
    return res.rooms || [];
  },

  /**
   * Retrieves all messages submitted by the current authenticated EchoBox identity.
   */
  async getMyPosts(): Promise<UserPost[]> {
    const res = await sendEchoRequest<GetMyPostsResponse>({
      action: 'get_my_posts',
    });
    return res.posts || [];
  },

  /**
   * Deletes a user's own submitted post across devices.
   */
  async deleteMyPost(roomId: string, feedbackId: string): Promise<DeleteMyPostResponse> {
    const cleanRoom = roomId.trim();
    const cleanFb = feedbackId.trim();
    if (!cleanRoom || !cleanFb) {
      throw new Error('Room ID and Message ID are required');
    }
    return sendEchoRequest<DeleteMyPostResponse>({
      action: 'delete_my_post',
      room_id: cleanRoom,
      feedback_id: cleanFb,
    });
  },

  /**
   * Retrieves all rooms belonging to the authenticated owner from DynamoDB.
   */
  async getOwnerRooms(): Promise<RoomMetadata[]> {
    const response = await sendEchoRequest<GetOwnerRoomsResponse>({
      action: 'get_owner_rooms',
    });
    return response.rooms || [];
  },

  /**
   * Claims an unowned legacy room into the authenticated owner's workspace.
   */
  async claimLegacyRoom(roomId: string): Promise<ClaimLegacyRoomResponse> {
    const cleanId = roomId.trim();
    if (!cleanId) {
      throw new Error('Room ID is required');
    }
    return sendEchoRequest<ClaimLegacyRoomResponse>({
      action: 'claim_legacy_room',
      room_id: cleanId,
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
    return response.room;
  },

  /**
   * Submits anonymous feedback / conversation message into a room.
   */
  async submitFeedback(
    roomId: string,
    message: string,
    identity?: { displayName?: string; sessionId?: string }
  ): Promise<SubmitFeedbackResponse> {
    const cleanId = roomId.trim();
    const cleanMessage = message.trim();

    if (!cleanId) {
      throw new Error('Room ID is required');
    }
    if (!cleanMessage) {
      throw new Error('Message cannot be empty');
    }
    if (cleanMessage.length > 2000) {
      throw new Error('Message cannot exceed 2000 characters');
    }

    return sendEchoRequest<SubmitFeedbackResponse>({
      action: 'submit_feedback',
      room_id: cleanId,
      message: cleanMessage,
      display_name: identity?.displayName,
      anonymous_session_id: identity?.sessionId,
    });
  },

  /**
   * Retrieves all messages for a room.
   */
  async getFeedback(roomId: string, ownerMode = false): Promise<GetFeedbackResponse> {
    const cleanId = roomId.trim();
    if (!cleanId) {
      throw new Error('Room ID is required');
    }
    return sendEchoRequest<GetFeedbackResponse>({
      action: 'get_feedback',
      room_id: cleanId,
      owner_mode: ownerMode,
    });
  },

  /**
   * Deletes a feedback item from a room (Room Owner operation).
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
   * Closes a room to stop further feedback submissions (Room Owner operation).
   */
  async closeRoom(roomId: string): Promise<CloseRoomResponse> {
    const cleanId = roomId.trim();
    if (!cleanId) {
      throw new Error('Room ID is required');
    }
    return sendEchoRequest<CloseRoomResponse>({
      action: 'close_room',
      room_id: cleanId,
    });
  },

  /**
   * Reopens a closed room before its 24-hour expiration (Room Owner operation).
   */
  async reopenRoom(roomId: string): Promise<ReopenRoomResponse> {
    const cleanId = roomId.trim();
    if (!cleanId) {
      throw new Error('Room ID is required');
    }
    return sendEchoRequest<ReopenRoomResponse>({
      action: 'reopen_room',
      room_id: cleanId,
    });
  },
};
