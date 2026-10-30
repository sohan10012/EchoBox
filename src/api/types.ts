/**
 * EchoBox AWS API Gateway Types & Domain Models
 */

export type RoomStatus = 'active' | 'closed';

export interface RoomMetadata {
  room_id: string;
  room_name: string;
  created_at: string;
  status: RoomStatus;
  PK?: string;
  SK?: string;
  feedback_count?: number;
}

export interface FeedbackItem {
  feedback_id: string;
  message: string;
  created_at: string;
  PK?: string;
  SK?: string;
  display_name?: string;
  anonymous_session_id?: string;
}

// Request Payloads
export interface CreateRoomPayload {
  action: 'create_room';
  room_name: string;
}

export interface GetRoomPayload {
  action: 'get_room';
  room_id: string;
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

export type EchoApiRequest =
  | CreateRoomPayload
  | GetRoomPayload
  | SubmitFeedbackPayload
  | GetFeedbackPayload
  | DeleteFeedbackPayload
  | CloseRoomPayload;

// Response Payloads
export interface CreateRoomResponse {
  message: string;
  room_id: string;
  room_name: string;
}

export interface GetRoomResponse {
  room: {
    room_name: string;
    created_at: string;
    PK: string;
    status: RoomStatus;
    SK: string;
  };
}

export interface SubmitFeedbackResponse {
  message: string;
  feedback_id: string;
}

export interface GetFeedbackResponse {
  room_id: string;
  count: number;
  feedback: FeedbackItem[];
}

export interface DeleteFeedbackResponse {
  message: string;
}

export interface CloseRoomResponse {
  message: string;
  room?: {
    status: RoomStatus;
    room_name: string;
    created_at: string;
    PK?: string;
    SK?: string;
  };
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

