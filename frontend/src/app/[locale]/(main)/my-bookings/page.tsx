import { redirect } from "next/navigation";

// Страница удалена. Редирект на главную.
export default function MyBookingsPage() {
  redirect("/main");
}
