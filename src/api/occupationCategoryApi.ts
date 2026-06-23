import axiosClient from "@/api/axiosClient";

export interface OccupationCategory {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOccupationCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateOccupationCategoryPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const occupationCategoryApi = {
  // GET /api/occupation-categories
  getAll: (): Promise<OccupationCategory[]> =>
    axiosClient
      .get<ApiEnvelope<OccupationCategory[]>>("/occupation-categories")
      .then((res) => res.data.data),

  // POST /api/occupation-categories
  create: (
    payload: CreateOccupationCategoryPayload,
  ): Promise<OccupationCategory> =>
    axiosClient
      .post<ApiEnvelope<OccupationCategory>>(
        "/occupation-categories",
        payload,
      )
      .then((res) => res.data.data),

  // PATCH /api/occupation-categories/:id
  update: (
    id: string,
    payload: UpdateOccupationCategoryPayload,
  ): Promise<OccupationCategory> =>
    axiosClient
      .patch<ApiEnvelope<OccupationCategory>>(
        `/occupation-categories/${id}`,
        payload,
      )
      .then((res) => res.data.data),

  // DELETE /api/occupation-categories/:id (không trả data, chỉ message)
  remove: (id: string): Promise<void> =>
    axiosClient
      .delete<{ success: boolean; message: string }>(
        `/occupation-categories/${id}`,
      )
      .then(() => undefined),
};

export default occupationCategoryApi;