// Группа (main) оставлена для совместимости роутинга.
// Страницы внутри редиректят на /main.
export default function MainGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
