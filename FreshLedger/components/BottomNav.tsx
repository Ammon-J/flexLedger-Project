interface BottomNavProps {
  active: "home" | "blocks" | "expenses" | "account";
}
const items = [
  { id: "home", label: "Home", icon: "⌂", href: "/" },
  { id: "blocks", label: "Blocks", icon: "▣", href: "/blocks" },
  { id: "expenses", label: "Expenses", icon: "▤", href: "/expenses" },
  { id: "account", label: "Account", icon: "♙", href: "/account" },
] as const;
export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav class="bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
        <a
          class={item.id === active ? "nav-item active" : "nav-item"}
          href={item.href}
        >
          <span>{item.icon}</span>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
