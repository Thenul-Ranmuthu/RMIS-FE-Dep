// // RMIS/files/services/authService.ts

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

// // ─── Interfaces ───────────────────────────────────────────────

// export interface PublicUserRegisterPayload {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   password: string;
//   confirmPassword: string;
// }

// export interface TechnicianRegisterPayload {
//   fullName: string;
//   email: string;
//   province: string;
//   district: string;
//   password: string;
//   confirmPassword: string;
// }

// export interface CompanyRegisterPayload {
//   companyName: string;
//   registrationNumber: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
// }

// export interface RegisterResponse {
//   token: string;
//   user: {
//     id: string;
//     email: string;
//     role: string;
//   };
// export interface AuthResponse {
//     token: string;
//     tokenType: string;
// }

// // ─── Helper ───────────────────────────────────────────────────
// // Add a helper to decode the role from the JWT token
// export const getRoleFromToken = (token: string): string | null => {
//     try {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         return payload.userType || null; // ← backend puts role in 'userType'
//     } catch {
//         return null;
//     }
// };

// const post = async (
//   url: string,
//   payload: object,
// ): Promise<RegisterResponse> => {
//   const response = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
// // Add helpers to store and retrieve token
// export const saveToken = (token: string) => {
//     localStorage.setItem('accessToken', token);
// };

// export const getToken = (): string | null => {
//     return localStorage.getItem('accessToken');
// };

// export const getRole = (): string | null => {
//     const token = getToken();
//     if (!token) return null;
//     return getRoleFromToken(token);
// };

// export const logout = () => {
//     localStorage.removeItem('accessToken');
// };

// const post = async (url: string, payload: object): Promise<AuthResponse> => {
//     const response = await fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//     });

//   if (!response.ok) {
//     const error = await response.json();
//     throw error;
//   }

//   return response.json();
// };

// // ─── Register Functions ───────────────────────────────────────

// export const registerPublicUser = (payload: PublicUserRegisterPayload) =>
//   post(`${API_BASE_URL}/auth/user/register`, payload);

// export const registerTechnician = (payload: TechnicianRegisterPayload) =>
//   post(`${API_BASE_URL}/auth/technician/register`, payload);

// export const registerCompany = (payload: CompanyRegisterPayload) =>
//   post(`${API_BASE_URL}/auth/company/register`, payload);

// // ─── Login Functions ──────────────────────────────────────────

// export const loginPublicUser = (email: string, password: string) =>
//   post(`${API_BASE_URL}/auth/user/login`, { email, password });

// export const loginTechnician = (email: string, password: string) =>
//   post(`${API_BASE_URL}/auth/technician/login`, { email, password });

// export const loginCompany = (email: string, password: string) =>
//   post(`${API_BASE_URL}/auth/company/login`, { email, password });

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

// ─── Interfaces ───────────────────────────────────────────────

export interface PublicUserRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface TechnicianRegisterPayload {
  fullName: string;
  email: string;
  province: string;
  district: string;
  password: string;
  confirmPassword: string;
}

export interface CompanyRegisterPayload {
  companyName: string;
  registrationNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
}

// ─── Token Helpers ────────────────────────────────────────────

export const getRoleFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userType || null;
  } catch {
    return null;
  }
};

export const saveToken = (token: string, rememberMe: boolean = false) => {
  if (rememberMe) {
    localStorage.setItem("accessToken", token);
  } else {
    sessionStorage.setItem("accessToken", token);
  }
  // Also set cookie for middleware/SSR if needed
  document.cookie = `accessToken=${token}; path=/; max-age=${rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24}`;
};

//export const getToken = (): string | null => {
//  return localStorage.getItem("accessToken");
//};

export const getRole = (): string | null => {
  const token = getToken();
  if (!token) return null;
  return getRoleFromToken(token);
};

//fix
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("accessToken");
};

// ─── Helper ───────────────────────────────────────────────────

const post = async (url: string, payload: object): Promise<AuthResponse> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

// ─── Register Functions ───────────────────────────────────────

export const registerPublicUser = (payload: PublicUserRegisterPayload) =>
  post(`${API_BASE_URL}/auth/user/register`, payload);

export const registerTechnician = (payload: TechnicianRegisterPayload) =>
  post(`${API_BASE_URL}/auth/technician/register`, payload);

export const registerCompany = (payload: CompanyRegisterPayload) =>
  post(`${API_BASE_URL}/auth/company/register`, payload);

// ─── Login Functions ──────────────────────────────────────────

export const loginPublicUser = (email: string, password: string) =>
  post(`${API_BASE_URL}/auth/user/login`, { email, password });

export const loginTechnician = (email: string, password: string) =>
  post(`${API_BASE_URL}/auth/technician/login`, { email, password });

export const loginCompany = (email: string, password: string) =>
  post(`${API_BASE_URL}/auth/company/login`, { email, password });

// ─── Technician Admin API ─────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

const authFetch = (url: string, options: RequestInit = {}) => {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getTechniciansByStatus = (
  status: "PENDING" | "ACTIVE" | "REJECTED",
) =>
  authFetch(`${API_BASE}/admin/technicians/${status.toLowerCase()}`).then((r) =>
    r.json(),
  );

export const getTechnicianById = (id: number) =>
  authFetch(`${API_BASE}/admin/technicians/${id}`).then((r) => r.json());

export const approveTechnician = (id: number) =>
  authFetch(`${API_BASE}/admin/technicians/${id}/approve`, {
    method: "POST",
  }).then((r) => r.json());

export const rejectTechnician = (id: number, reason: string) =>
  authFetch(
    `${API_BASE}/admin/technicians/${id}/reject?reason=${encodeURIComponent(reason)}`,
    { method: "POST" },
  ).then((r) => r.json());

export const deleteTechnician = (id: number) =>
  authFetch(`${API_BASE}/admin/technicians/${id}`, { method: "DELETE" }).then(
    (r) => r.json(),
  );
