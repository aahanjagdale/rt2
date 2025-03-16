import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Heart, CheckSquare, GamepadIcon, ListTodo, Gift, SparklesIcon } from "lucide-react";

export default function MainNav() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: Heart },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/game", label: "Game", icon: GamepadIcon },
    { href: "/bucketlist", label: "Bucket List", icon: ListTodo },
    { href: "/coupons", label: "Love Coupons", icon: Gift },
    { href: "/attractions", label: "Why I Find You Hot", icon: SparklesIcon },
  ];

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 fill-primary text-primary" />
            <span className="font-bold">RelationTrack</span>
          </Link>
        </div>
        <div className="flex gap-6">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                location === href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}