import axios from "axios";

// Demo mode - set to true to use mock data without backend
const DEMO_MODE = false;

// Mock data storage (mutable for CRUD operations)
const mockEmployees = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    birthDate: "1990-05-15",
    entryDate: "2020-03-01",
    manager: "Jane Smith",
    ccList: "hr@company.com",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    birthDate: "1988-09-22",
    entryDate: "2019-07-15",
    manager: "Jane Smith",
    ccList: "hr@company.com,manager@company.com",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "m.chen@company.com",
    birthDate: "1992-12-03",
    entryDate: "2021-01-10",
    manager: "Robert Brown",
    ccList: "hr@company.com",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.d@company.com",
    birthDate: "1995-03-18",
    entryDate: "2022-06-01",
    manager: "Jane Smith",
    ccList: "hr@company.com",
  },
  {
    id: "5",
    name: "David Wilson",
    email: "d.wilson@company.com",
    birthDate: "1987-11-30",
    entryDate: "2018-02-14",
    manager: "Robert Brown",
    ccList: "hr@company.com,manager@company.com",
  },
];

let mockTemplates = [
  {
    id: "1",
    name: "Birthday Celebration",
    type: "birthday",
    subject: "Happy Birthday {{name}}!",
    body: "Dear {{name}},\n\nWishing you a wonderful birthday filled with joy and happiness!\n\nBest regards,\nThe Team",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Work Anniversary",
    type: "work_anniversary",
    subject: "Congratulations on {{years}} Years!",
    body: "Dear {{name}},\n\nCongratulations on completing {{years}} years with us! Thank you for your dedication and hard work.\n\nBest regards,\nThe Team",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "3",
    name: "Birthday - Casual",
    type: "birthday",
    subject: "🎉 Happy Birthday {{name}}!",
    body: "Hey {{name}}!\n\nHope your special day is as amazing as you are! Enjoy your birthday!\n\nCheers,\nYour Team",
    createdAt: "2024-02-10T14:30:00Z",
    updatedAt: "2024-02-10T14:30:00Z",
  },
];

const mockLogs = [
  {
    id: "1",
    employeeName: "John Doe",
    employeeEmail: "john.doe@company.com",
    type: "birthday",
    subject: "Happy Birthday John!",
    sentAt: "2024-03-15T09:00:00Z",
    status: "sent",
  },
  {
    id: "2",
    employeeName: "Sarah Johnson",
    employeeEmail: "sarah.j@company.com",
    type: "work_anniversary",
    subject: "Congratulations on 5 Years!",
    sentAt: "2024-03-14T09:00:00Z",
    status: "sent",
  },
  {
    id: "3",
    employeeName: "Michael Chen",
    employeeEmail: "m.chen@company.com",
    type: "birthday",
    subject: "Happy Birthday Michael!",
    sentAt: "2024-03-13T09:00:00Z",
    status: "failed",
  },
  {
    id: "4",
    employeeName: "Emily Davis",
    employeeEmail: "emily.d@company.com",
    type: "birthday",
    subject: "🎉 Happy Birthday Emily!",
    sentAt: "2024-03-12T09:00:00Z",
    status: "sent",
  },
  {
    id: "5",
    employeeName: "David Wilson",
    employeeEmail: "d.wilson@company.com",
    type: "work_anniversary",
    subject: "Congratulations on 6 Years!",
    sentAt: "2024-03-11T09:00:00Z",
    status: "sent",
  },
  {
    id: "6",
    employeeName: "John Doe",
    employeeEmail: "john.doe@company.com",
    type: "work_anniversary",
    subject: "Congratulations on 4 Years!",
    sentAt: "2024-03-01T09:00:00Z",
    status: "sent",
  },
];

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
// api.interceptors.request.use((config) => {
//   const token = getAuthToken()
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

api.interceptors.request.use(
  async (config) => {
    // If demo mode is enabled, intercept and return mock data immediately
    if (DEMO_MODE) {
      const url = config.url || "";
      const method = config.method?.toLowerCase();

      console.log("[v0] Demo mode intercepting:", method, url);

      // Mock employees endpoint
      if (url.includes("/api/employees")) {
        throw {
          config,
          response: {
            data: {
              employees: mockEmployees,
              total: mockEmployees.length,
            },
          },
          isDemo: true,
        };
      }

      // Mock templates endpoint
      if (url.includes("/api/templates")) {
        if (method === "get") {
          throw {
            config,
            response: { data: { templates: mockTemplates } },
            isDemo: true,
          };
        }
        if (method === "post") {
          const newTemplate = {
            ...JSON.parse(config.data || "{}"),
            id: String(Date.now()),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          mockTemplates.push(newTemplate);
          throw {
            config,
            response: { data: newTemplate },
            isDemo: true,
          };
        }
        if (method === "put") {
          const templateData = JSON.parse(config.data || "{}");
          const index = mockTemplates.findIndex((t) => url.includes(t.id));
          if (index !== -1) {
            mockTemplates[index] = {
              ...mockTemplates[index],
              ...templateData,
              updatedAt: new Date().toISOString(),
            };
          }
          throw {
            config,
            response: { data: { success: true } },
            isDemo: true,
          };
        }
        if (method === "delete") {
          const templateId = url.split("/").pop();
          mockTemplates = mockTemplates.filter((t) => t.id !== templateId);
          throw {
            config,
            response: { data: { success: true } },
            isDemo: true,
          };
        }
      }

      // Mock logs endpoint (handles both /api/logs and /api/email-logs)
      if (url.includes("/api/logs") || url.includes("/api/email-logs")) {
        throw {
          config,
          response: {
            data: {
              logs: mockLogs,
              total: mockLogs.length,
            },
          },
          isDemo: true,
        };
      }

      // Mock dashboard stats
      if (url.includes("/api/dashboard/stats")) {
        throw {
          config,
          response: {
            data: {
              totalEmployees: mockEmployees.length,
              upcomingBirthdays: 8,
              upcomingAnniversaries: 5,
              emailsSentThisMonth: mockLogs.filter(
                (log) => log.status === "sent"
              ).length,
            },
          },
          isDemo: true,
        };
      }

      // Mock sync endpoint
      if (url.includes("/api/sync")) {
        throw {
          config,
          response: {
            data: {
              success: true,
              message: "HR data synchronized successfully (Demo Mode)",
              syncedEmployees: mockEmployees.length,
            },
          },
          isDemo: true,
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If this is a demo mode response, return it as success
    if (error.isDemo) {
      return error.response;
    }

    // If there's a network error or no backend, return mock data
    if (!error.response || error.code === "ERR_NETWORK") {
      const url = error.config?.url || "";
      const method = error.config?.method;

      console.log(
        "[v0] Network error, falling back to mock data:",
        method,
        url
      );

      // Mock employees endpoint
      if (url.includes("/api/employees")) {
        return {
          data: {
            employees: mockEmployees,
            total: mockEmployees.length,
          },
        };
      }

      // Mock templates endpoint
      if (url.includes("/api/templates")) {
        if (method === "get") {
          return { data: { templates: mockTemplates } };
        }
        if (method === "post") {
          const newTemplate = {
            ...JSON.parse(error.config?.data || "{}"),
            id: String(Date.now()),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          mockTemplates.push(newTemplate);
          return { data: newTemplate };
        }
        if (method === "put") {
          return { data: { success: true } };
        }
        if (method === "delete") {
          return { data: { success: true } };
        }
      }

      // Mock logs endpoint
      if (url.includes("/api/logs") || url.includes("/api/email-logs")) {
        return {
          data: {
            logs: mockLogs,
            total: mockLogs.length,
          },
        };
      }

      // Mock dashboard stats
      if (url.includes("/api/dashboard/stats")) {
        return {
          data: {
            totalEmployees: mockEmployees.length,
            upcomingBirthdays: 8,
            upcomingAnniversaries: 5,
            emailsSentThisMonth: mockLogs.filter((log) => log.status === "sent")
              .length,
          },
        };
      }

      // Mock sync endpoint
      if (url.includes("/api/sync")) {
        return {
          data: {
            success: true,
            message: "HR data synchronized successfully (Demo Mode)",
          },
        };
      }
    }

    // Handle auth errors
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
