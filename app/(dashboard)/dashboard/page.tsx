"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, Cake, Mail, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { EmployeeListDialog } from "@/components/employee-list-dialog";
import api from "@/lib/api";

interface DashboardStats {
  totalEmployees: number;
  birthdaysThisWeek: number;
  workAnniversariesThisWeek: number;
  emailsSentToday: number;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  entryDate: string;
  manager: string;
}
interface EmailLog {
  id: number;
  recipientEmail: string;
  subject: string;
  body: string;
  type: string;
  ccList?: string;
  sentAt: string;
  status: string;
  errorMessage?: string;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const t = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    birthdaysThisWeek: 0,
    workAnniversariesThisWeek: 0,
    emailsSentToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    "birthday" | "anniversary" | "email"
  >("birthday");
  const [dialogEmployees, setDialogEmployees] = useState<
    Employee[] | EmailLog[]
  >([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/api/stats/weekly");
      setStats(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post("/api/sync");
      toast({
        title: "Sync successful",
        description: "Employee data has been synchronized",
      });
      fetchStats();
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to synchronize employee data",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCardClick = async (
    type: "birthday" | "anniversary" | "email"
  ) => {
    setLoadingEmployees(true);
    setDialogType(type);
    setDialogOpen(true);

    try {
      let endpoint = "";

      switch (type) {
        case "birthday":
          endpoint = "/api/employees/birthdays-this-week";
          break;
        case "anniversary":
          endpoint = "/api/employees/anniversaries-this-week";
          break;
        case "email":
          endpoint = "/api/email-logs/sent-today";
          break;
        default:
          throw new Error("Invalid card type");
      }

      const response = await api.get(endpoint);
      setDialogEmployees(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          type === "birthday"
            ? "Failed to load birthdays"
            : type === "anniversary"
            ? "Failed to load anniversaries"
            : "Failed to load emails",
        variant: "destructive",
      });
      setDialogEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      description: "Active employees in system",
      icon: Users,
      color: "text-blue-500",
      clickable: false,
    },
    {
      title: t.dashboard.birthdaysThisWeek,
      value: stats.birthdaysThisWeek,
      description: "Upcoming birthday celebrations",
      icon: Cake,
      color: "text-pink-500",
      clickable: true,
      onClick: () => handleCardClick("birthday"),
    },
    {
      title: t.dashboard.workAnniversaries,
      value: stats.workAnniversariesThisWeek,
      description: "This week's milestones",
      icon: Calendar,
      color: "text-purple-500",
      clickable: true,
      onClick: () => handleCardClick("anniversary"),
    },
    {
      title: t.dashboard.emailsSent,
      value: stats.emailsSentToday,
      description: "Automated emails delivered",
      icon: Mail,
      color: "text-green-500",
      clickable: true,
      onClick: () => handleCardClick("email"),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.dashboard.title}</h1>
          <p className="mt-2 text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
          />
          {isSyncing ? t.dashboard.syncing : t.dashboard.syncHRData}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className={
              stat.clickable
                ? "cursor-pointer hover:border-primary/50 transition-colors"
                : ""
            }
            onClick={stat.clickable ? stat.onClick : undefined}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
                {stat.clickable && " • Click to view"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
          <CardDescription>
            Navigate to key sections of the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 bg-transparent"
            asChild
          >
            <a href="/employees">
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{t.dashboard.manageEmployees}</div>
                <div className="text-xs text-muted-foreground">
                  View and search employee data
                </div>
              </div>
            </a>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 bg-transparent"
            asChild
          >
            <a href="/templates">
              <Calendar className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{t.dashboard.manageTemplates}</div>
                <div className="text-xs text-muted-foreground">
                  Create and edit email templates
                </div>
              </div>
            </a>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 bg-transparent"
            asChild
          >
            <a href="/logs">
              <Mail className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{t.dashboard.viewLogs}</div>
                <div className="text-xs text-muted-foreground">
                  View sent email history
                </div>
              </div>
            </a>
          </Button>
        </CardContent>
      </Card>

      <EmployeeListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employees={loadingEmployees ? [] : dialogEmployees}
        title={
          dialogType === "birthday"
            ? "Birthdays This Week"
            : dialogType === "anniversary"
            ? "Work Anniversaries This Week"
            : "Emails Sent Today"
        }
        description={
          loadingEmployees
            ? "Loading data..."
            : dialogType === "birthday"
            ? `${dialogEmployees.length} birthday celebration${
                dialogEmployees.length !== 1 ? "s" : ""
              } this week`
            : dialogType === "anniversary"
            ? `${dialogEmployees.length} work anniversar${
                dialogEmployees.length !== 1 ? "ies" : "y"
              } this week`
            : `${dialogEmployees.length} email${
                dialogEmployees.length !== 1 ? "s" : ""
              } sent today`
        }
        type={dialogType}
      />

    </div>
  );
}
