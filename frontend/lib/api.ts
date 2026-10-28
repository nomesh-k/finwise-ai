/**
 * FinWise AI - Typed Frontend API Client
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
    : "https://finwise-ai-93mc.onrender.com/api/v1";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("finwise_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("finwise_token", token);
  } else {
    localStorage.removeItem("finwise_token");
  }
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function describeError(errJson: any): { message: string; code?: string } {
  const detail = errJson?.detail ?? errJson?.message;
  if (typeof detail === "string") return { message: detail };
  if (Array.isArray(detail)) {
    // FastAPI validation errors: [{ msg: "Value error, Password must ..." }]
    const msg = detail
      .map((d: any) => String(d?.msg || "").replace(/^Value error,\s*/i, ""))
      .filter(Boolean)
      .join(" ");
    return { message: msg || "Please check the details you entered." };
  }
  if (detail && typeof detail === "object") {
    return { message: detail.message || "An unexpected error occurred.", code: detail.code };
  }
  return { message: "An unexpected error occurred." };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    setToken(null);
  }

  if (!res.ok) {
    let message = `HTTP error ${res.status}`;
    let code: string | undefined;
    try {
      const text = await res.text();
      try {
        ({ message, code } = describeError(JSON.parse(text)));
      } catch {
        message = text || message;
      }
    } catch {
      // keep default message
    }
    if (res.status === 429) message = message || "Too many attempts. Please wait a moment.";
    throw new ApiError(message, res.status, code);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ access_token: string; token_type: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    register: (data: { email: string; password: string; display_name: string; currency?: string }) =>
      request<{ message: string; email: string; requires_verification: boolean }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    verifyEmail: (data: { email: string; code: string }) =>
      request<{ access_token: string; token_type: string; user: any }>("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    resendCode: (data: { email: string; purpose: "signup" | "reset" }) =>
      request<{ message: string }>("/auth/resend-code", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<any>("/auth/me"),
    logout: () =>
      request<any>("/auth/logout", {
        method: "POST",
      }),
    forgotPassword: (data: { email: string }) =>
      request<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    resetPassword: (data: { email: string; code: string; new_password: string }) =>
      request<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  onboarding: {
    getStatus: () => request<{ is_onboarded: boolean; profile: any }>("/onboarding/status"),
    submit: (payload: any) =>
      request<any>("/onboarding/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  dashboard: {
    getSummary: () =>
      request<{
        total_income: number;
        total_expenses: number;
        net_cash_flow: number;
        savings_rate: number;
        income_change_pct: number;
        expense_change_pct: number;
        period_label: string;
        currency: string;
      }>("/dashboard/summary"),
    getCashFlow: () =>
      request<Array<{ month: string; income: number; expenses: number; net: number }>>("/dashboard/cash-flow"),
    getSpendingBreakdown: () =>
      request<Array<{ category_id: number; category_name: string; color: string; amount: number; percentage: number }>>(
        "/dashboard/spending-breakdown"
      ),
  },

  transactions: {
    list: (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
      });
      return request<{ items: any[]; total: number; page: number; page_size: number; total_pages: number }>(
        `/transactions?${qs.toString()}`
      );
    },
    create: (data: any) =>
      request<any>("/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<any>(`/transactions/${id}`, {
        method: "DELETE",
      }),
    importCsv: (formData: FormData) =>
      request<any>("/transactions/import", {
        method: "POST",
        body: formData,
      }),
    getExportUrl: () => `${API_BASE}/transactions/export`,
    exportCsv: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/transactions/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to export CSV");
      return await res.blob();
    },
  },

  budgets: {
    list: () =>
      request<{
        items: any[];
        total_budget: number;
        total_spent: number;
        remaining_budget: number;
        overall_usage_percentage: number;
        health_status: string;
      }>("/budgets"),
    create: (data: any) =>
      request<any>("/budgets", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/budgets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<any>(`/budgets/${id}`, {
        method: "DELETE",
      }),
    copyPrevious: () =>
      request<any>("/budgets/copy-previous", {
        method: "POST",
      }),
  },

  goals: {
    list: () => request<any[]>("/goals"),
    create: (data: any) =>
      request<any>("/goals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/goals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<any>(`/goals/${id}`, {
        method: "DELETE",
      }),
    addContribution: (id: number, data: any) =>
      request<any>(`/goals/${id}/contributions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getContributions: (id: number) => request<any[]>(`/goals/${id}/contributions`),
  },

  bills: {
    list: () => request<any[]>("/bills"),
    create: (data: any) =>
      request<any>("/bills", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/bills/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<any>(`/bills/${id}`, {
        method: "DELETE",
      }),
    pay: (id: number) =>
      request<any>(`/bills/${id}/pay`, {
        method: "POST",
      }),
  },

  debts: {
    list: () => request<any[]>("/debts"),
    create: (data: any) =>
      request<any>("/debts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/debts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<any>(`/debts/${id}`, {
        method: "DELETE",
      }),
    calculateStrategy: (monthly_extra_payment: number) =>
      request<any>("/debts/calculate-strategy", {
        method: "POST",
        body: JSON.stringify({ monthly_extra_payment }),
      }),
  },

  ai: {
    chat: (message: string, scenario_id?: number) =>
      request<{
        reply: string;
        agent_steps: Array<{ agent: string; action: string; output_summary: string }>;
        recommendation?: any;
        data_sources: string[];
        requires_approval: boolean;
      }>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message, scenario_id }),
      }),
    getRuns: () => request<any[]>("/ai/runs"),
    getRecommendations: () => request<any[]>("/ai/recommendations"),
    approveRecommendation: (id: number) =>
      request<any>(`/ai/recommendations/${id}/approve`, {
        method: "POST",
      }),
    rejectRecommendation: (id: number) =>
      request<any>(`/ai/recommendations/${id}/reject`, {
        method: "POST",
      }),
    emailReport: (subject: string, content: string) =>
      request<{ message: string }>("/ai/email-report", {
        method: "POST",
        body: JSON.stringify({ subject, content }),
      }),
  },

  forecasts: {
    simulate: (params: any) =>
      request<any>("/forecasts", {
        method: "POST",
        body: JSON.stringify(params),
      }),
    getScenarios: () => request<any[]>("/forecasts/scenarios"),
    saveScenario: (payload: any) =>
      request<any>("/forecasts/scenarios", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  reports: {
    getMonthly: (year?: number, month?: number) => {
      const qs = new URLSearchParams();
      if (year) qs.append("year", String(year));
      if (month) qs.append("month", String(month));
      return request<any>(`/reports/monthly?${qs.toString()}`);
    },
    getAnnual: (year?: number) => {
      const qs = new URLSearchParams();
      if (year) qs.append("year", String(year));
      return request<any>(`/reports/annual?${qs.toString()}`);
    },
    getExportUrl: () => `${API_BASE}/reports/export`,
  },

  settings: {
    getProfile: () => request<any>("/settings/profile"),
    updateProfile: (payload: any) =>
      request<any>("/settings/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    exportData: () =>
      request<any>("/settings/export-data", {
        method: "POST",
      }),
    deleteAccount: () =>
      request<any>("/settings/account", {
        method: "DELETE",
      }),
  },

  admin: {
    getHealth: () => request<any>("/admin/health"),
    getStats: () => request<any>("/admin/stats"),
    getUsers: () => request<any[]>("/admin/users"),
    getAgents: () => request<any[]>("/admin/agents"),
    getAuditEvents: () => request<any[]>("/admin/audit-events"),
  },
};
