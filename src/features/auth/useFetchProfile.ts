import { useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";

/**
 * Gọi GET /api/users/me để lấy thông tin chi tiết (displayName, avatar...)
 * mỗi khi có accessToken hợp lệ nhưng chưa có profile trong userStore.
 * Dùng ở AdminLayout - nơi chắc chắn người dùng đã đăng nhập.
 */
export function useFetchProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const profile = useUserStore((state) => state.profile);
  const fetchProfile = useUserStore((state) => state.fetchProfile);

  useEffect(() => {
    if (!accessToken || profile) return;

    fetchProfile().catch(() => {
      // Lỗi lấy profile không nên đăng xuất người dùng, chỉ bỏ qua,
      // Header sẽ tự fallback hiển thị "Admin" nếu profile vẫn null.
    });
  }, [accessToken, profile, fetchProfile]);
}