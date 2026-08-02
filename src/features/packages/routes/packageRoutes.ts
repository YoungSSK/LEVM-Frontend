import { Crown, CreditCard } from "lucide-react";

export const packageRoutePaths = {
  root: "/packages",
  list: "/packages/list",
  subscriptions: "/packages/subscriptions",
} as const;

export const packageNavigationItems = [
  {
    key: "packages-list",
    label: "Danh sách Gói",
    icon: Crown,
    to: packageRoutePaths.list,
  },
  {
    key: "packages-subscriptions",
    label: "Lịch sử Giao dịch & Subscriptions",
    icon: CreditCard,
    to: packageRoutePaths.subscriptions,
  },
] as const;
