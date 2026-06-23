import axiosClient from "@/api/axiosClient";

export interface Occupation {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOccupationPayload {
  categoryId: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateOccupationPayload {
  categoryId?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const occupationApi = {
  // GET /api/occupations/category/:categoryId
  getByCategory: (categoryId: string): Promise<Occupation[]> =>
    axiosClient
      .get<ApiEnvelope<Occupation[]>>(`/occupations/category/${categoryId}`)
      .then((res) => res.data.data),

  // POST /api/occupations
  create: (payload: CreateOccupationPayload): Promise<Occupation> =>
    axiosClient
      .post<ApiEnvelope<Occupation>>("/occupations", payload)
      .then((res) => res.data.data),

  // PATCH /api/occupations/:id
  update: (
    id: string,
    payload: UpdateOccupationPayload,
  ): Promise<Occupation> =>
    axiosClient
      .patch<ApiEnvelope<Occupation>>(`/occupations/${id}`, payload)
      .then((res) => res.data.data),
};

export default occupationApi;