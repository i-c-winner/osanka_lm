// ─── Auth ────────────────────────────────────────────────────────────────────

export interface TelegramLoginRequest {
  telegram_id: string;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  telegram_id: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface MeResponse extends UserResponse {
  roles: string[];
}

export interface UserResponse {
  id: string;
  telegram_id: string;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
  avatar_url?: string;
  language_code?: string;
  timezone?: string;
  birth_date?: string;
  created_at: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface UserCreate {
  telegram_id: string;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export type SessionStatus = "active" | "cancelled" | "completed";

export interface SessionResponse {
  id: string;
  day_id: string;
  starts_at: string;
  ends_at: string;
  trainer_id?: string;
  capacity: number;
  class_type_id?: string;
  status: SessionStatus;
}

export interface SessionCreate {
  day_id: string;
  starts_at: string;
  ends_at: string;
  trainer_id?: string;
  capacity: number;
  class_type_id?: string;
  status: SessionStatus;
}

export interface SessionUpdate extends Partial<SessionCreate> {}

// ─── Booking ─────────────────────────────────────────────────────────────────

export type BookingStatus = "booked" | "attended" | "missed" | "cancelled";

export interface BookingResponse {
  id: string;
  session_id: string;
  user_id: string;
  status: BookingStatus;
  booked_at: string;
  cancelled_at?: string;
}

// ─── Subscription Plan ───────────────────────────────────────────────────────

export interface SubscriptionPlanResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  sessions_limit?: number;
  is_unlimited: boolean;
  is_calendar_month: boolean;
  duration_days?: number;
  is_active: boolean;
}

export interface SubscriptionPlanCreate {
  code: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  sessions_limit?: number;
  is_unlimited?: boolean;
  is_calendar_month?: boolean;
  duration_days?: number;
  is_active?: boolean;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionStatus = "active" | "expired" | "cancelled";

export interface SubscriptionResponse {
  id: string;
  user_id: string;
  plan_id: string;
  sessions_used: number;
  started_at: string;
  expires_at?: string;
  status: SubscriptionStatus;
}

// ─── Location ────────────────────────────────────────────────────────────────

export interface LocationResponse {
  id: string;
  name: string;
  address?: string;
  is_active: boolean;
}

export interface LocationCreate {
  name: string;
  address?: string;
  is_active?: boolean;
}

export interface LocationUpdate extends Partial<LocationCreate> {}

// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = "present" | "absent";

export interface AttendanceResponse {
  id: string;
  booking_id: string;
  status: AttendanceStatus;
  marked_by: string;
  marked_at: string;
}
