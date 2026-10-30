/**
 * EchoBox AWS API Gateway Types & Domain Models
 */

export type RoomStatus = 'active' | 'closed' | 'expired';
export type RoomVisibility = 'public' | 'private';

export interface RoomMetadata {
  room_id: string;
  room_name: string;
  room_description?: string;
  visibility?: RoomVisibility;
  created_at: string;
  status: RoomStatus;
  expires_at?: number; // Unix epoch seconds
  is_expired?: boolean;
  owner_id?: string;
  owner_email?: string;
  owner_username?: string;
  PK?: string;
  SK?: string;
  feedback_count?: number;
  message_count?: number;
}

export interface FeedbackItem {
  feedback_id: string;
  message: string;
  created_at: string;
  expires_at?: number;
  PK?: string;
  SK?: string;
  display_name?: string;
  anonymous_session_id?: string;
  author_id?: string;
  echobox_id?: string;
}

export interface UserPost {
  feedback_id: string;
  room_id: string;
  room_name: string;
  message: string;
  display_name: string;
  created_at: string;
  expires_at: number;
  status: string;
}

// Request Payloads
export interface CreateRoomPayload {
  action: 'create_room';
  room_name: string;
  room_description?: string;
  visibility?: RoomVisibility;
}

export interface GetRoomPayload {
  action: 'get_room';
  room_id: string;
}

export interface DiscoverRoomsPayload {
  action: 'discover_rooms' | 'search_rooms';
  search?: string;
  q?: string;
}

export interface SubmitFeedbackPayload {
  action: 'submit_feedback';
  room_id: string;
  message: string;
  display_name?: string;
  anonymous_session_id?: string;
}

export interface GetFeedbackPayload {
  action: 'get_feedback';
  room_id: string;
  owner_mode?: boolean;
}

export interface GetMyPostsPayload {
  action: 'get_my_posts';
}

export interface DeleteMyPostPayload {
  action: 'delete_my_post';
  room_id: string;
  feedback_id: string;
}

export interface DeleteFeedbackPayload {
  action: 'delete_feedback';
  room_id: string;
  feedback_id: string;
}

export interface CloseRoomPayload {
  action: 'close_room';
  room_id: string;
}

export interface ReopenRoomPayload {
  action: 'reopen_room';
  room_id: string;
}

export interface GetOwnerRoomsPayload {
  action: 'get_owner_rooms';
}

export interface ClaimLegacyRoomPayload {
  action: 'claim_legacy_room';
  room_id: string;
}

export type EchoApiRequest =
  | CreateRoomPayload
  | GetRoomPayload
  | DiscoverRoomsPayload
  | SubmitFeedbackPayload
  | GetFeedbackPayload
  | GetMyPostsPayload
  | DeleteMyPostPayload
  | DeleteFeedbackPayload
  | CloseRoomPayload
  | ReopenRoomPayload
  | GetOwnerRoomsPayload
  | ClaimLegacyRoomPayload;

// Response Payloads
export interface CreateRoomResponse {
  message: string;
  room_id: string;
  room_name: string;
  room_description?: string;
  visibility?: RoomVisibility;
  created_at?: string;
  expires_at?: number;
  status?: RoomStatus;
}

export interface GetRoomResponse {
  room: RoomMetadata;
}

export interface DiscoverRoomsResponse {
  rooms: RoomMetadata[];
  count: number;
}

export interface GetMyPostsResponse {
  posts: UserPost[];
  count: number;
  echobox_id?: string;
}

export interface DeleteMyPostResponse {
  message: string;
  feedback_id: string;
}

export interface SubmitFeedbackResponse {
  message: string;
  feedback_id: string;
  display_name?: string;
  anonymous_session_id?: string;
  created_at?: string;
  echobox_id?: string;
}

export interface GetFeedbackResponse {
  room_id: string;
  count: number;
  feedback: FeedbackItem[];
  expires_at?: number;
  status?: RoomStatus;
}

export interface DeleteFeedbackResponse {
  message: string;
}

export interface CloseRoomResponse {
  message: string;
  room?: RoomMetadata;
}

export interface ReopenRoomResponse {
  message: string;
  room?: RoomMetadata;
}

export interface GetOwnerRoomsResponse {
  rooms: RoomMetadata[];
  count: number;
}

export interface ClaimLegacyRoomResponse {
  message: string;
  room_id: string;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}
