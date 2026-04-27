import { getToken } from "./authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

export interface ServiceTicketResponse {
  id: number;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerType: string;
  technicianId: number;
  technicianName: string;
  technicianSpecialization: string;
  availabilityId: number;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  serviceType: string;
  description: string;
  status: string;
  cancellationReason?: string;
  cancellationTimestamp?: string;
  createdAt: string;
  updatedAt: string;
  rated: boolean;
}

export interface ServiceRatingResponse {
  id: number;
  serviceTicketId: number;
  rating: number;
  feedback: string;
  createdAt: string;
  reviewerName: string;
}

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    console.error(`[authFetch] Error Body:`, data);
    const errorMsg =
      data && Object.keys(data).length > 0
        ? data
        : { message: `Request failed with status ${response.status}` };
    throw errorMsg;
  }

  return data;
};

export const raiseTicketAsUser = (
  availabilityId: number,
  serviceType: string,
  description: string,
): Promise<ServiceTicketResponse> =>
  authFetch(`${API_BASE_URL}/api/service-tickets/user`, {
    method: "POST",
    body: JSON.stringify({ availabilityId, serviceType, description }),
  });

export const raiseTicketAsCompany = (
  availabilityId: number,
  serviceType: string,
  description: string,
): Promise<ServiceTicketResponse> =>
  authFetch(`${API_BASE_URL}/api/service-tickets/company`, {
    method: "POST",
    body: JSON.stringify({ availabilityId, serviceType, description }),
  });

export const getMyTickets = (): Promise<ServiceTicketResponse[]> =>
  authFetch(`${API_BASE_URL}/api/service-tickets/user/my`);

export const getMyCompanyTickets = (): Promise<ServiceTicketResponse[]> =>
  authFetch(`${API_BASE_URL}/api/service-tickets/company/my`);

export const getTicketById = (id: number): Promise<ServiceTicketResponse> =>
  authFetch(`${API_BASE_URL}/api/service-tickets/${id}`);

export const cancelTicket = (
  id: number,
  reason: string,
): Promise<ServiceTicketResponse> =>
  authFetch(`${API_BASE_URL}/api/service-tickets/${id}/cancel`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });

export const cancelCompanyTicket = (
  id: number,
  reason: string,
): Promise<ServiceTicketResponse> =>
  authFetch(`${API_BASE_URL}/api/service-tickets/${id}/cancel`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });

export const submitRating = (
  ticketId: number,
  rating: number,
  feedback: string,
): Promise<ServiceRatingResponse> =>
  authFetch(`${API_BASE_URL}/api/service-tickets/${ticketId}/rating`, {
    method: "POST",
    body: JSON.stringify({ rating, feedback }),
  });

export const getTechnicianFeedbacks = (
  technicianId: number,
): Promise<ServiceRatingResponse[]> =>
  authFetch(`${API_BASE_URL}/public/technicians/${technicianId}/feedbacks`, {
    method: "GET",
  });
