import { useEffect, useState } from "react";
import { Bell, Check, BookOpen, Sparkles, Building2, FileText, UserCog, TrendingUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationsAPI } from "@/api";
import type { Notification, NotificationType } from "@/data/mock";
import type { Role } from "@/components/RoleSidebar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  test: BookOpen,
  training: Sparkles,
  drive: Building2,
  marks: FileText,
  mentor: UserCog,
  readiness: TrendingUp,
};

interface Props {
  role: Role;
}

export const NotificationBell = ({ role }: Props) => {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    NotificationsAPI.list(role).then(setItems);
  }, [role]);

  const unread = items.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await NotificationsAPI.markRead(id);
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await NotificationsAPI.markAllRead(role);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={`Notifications (${unread} unread)`}
          className="relative rounded-md p-2 hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 glass-card border-border">
        <div className="flex items-center justify-between border-b border-border p-3">
          <div>
            <p className="font-semibold text-sm">Notifications</p>
            <p className="text-[11px] text-muted-foreground">{unread} unread</p>
          </div>
          {unread > 0 && (
            <Button size="sm" variant="ghost" className="text-primary text-xs h-7" onClick={markAllRead}>
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No notifications.</div>
            ) : (
              items.map((n) => {
                const Icon = ICONS[n.type] || Bell;
                return (
                  <motion.button
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "w-full text-left flex gap-3 items-start p-3 border-b border-border/50 transition-colors hover:bg-secondary/40",
                      !n.read && "bg-primary/5",
                    )}
                  >
                    <div className={cn("rounded-md p-2 shrink-0", !n.read ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm", !n.read ? "font-semibold" : "font-medium text-muted-foreground")}>{n.title}</p>
                        {!n.read && <span className="h-2 w-2 mt-1 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{n.time}</p>
                    </div>
                  </motion.button>
                );
              })
            )}
          </AnimatePresence>
        </ScrollArea>
        <div className="p-2 border-t border-border">
          <Badge variant="outline" className="w-full justify-center text-[10px]">
            {items.length} total · live updates
          </Badge>
        </div>
      </PopoverContent>
    </Popover>
  );
};
