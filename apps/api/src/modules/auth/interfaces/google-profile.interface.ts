export interface GoogleProfile {
  googleId: string; // Google unique user id
  email: string;
  emailVerified: boolean;
  name: string; // Display name (full name)
  givenName: string; // Given name (thường là tên gọi)
  avatar: string; // Avatar/photo URL
  provider: string; // 'google' (có thể mở rộng nếu dùng nhiều provider)
}
