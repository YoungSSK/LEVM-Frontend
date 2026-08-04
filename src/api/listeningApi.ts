import axiosClient from "@/api/axiosClient";

export interface ListeningSet {
  _id: string;
  title: string;
  part: 1 | 2 | 3 | 4;
  difficulty: "beginner" | "elementary" | "intermediate" | "upper_intermediate" | "advanced";
  status: "draft" | "published" | "archived";
  xpReward: number;
  passThreshold: number;
  order: number;
  allowedPackageIds: string[];
  questionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListeningAudioGroup {
  _id: string;
  setId: string;
  title: string;
  audioUrl: string;
  audioPublicId?: string;
  transcript: string;
  imageUrl?: string;
  imagePublicId?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListeningOption {
  key: string;
  text: string;
  isCorrect: boolean;
}

export interface ListeningQuestion {
  _id: string;
  setId: string;
  groupId?: string | null;
  part: 1 | 2 | 3 | 4;
  audioUrl?: string;
  audioPublicId?: string;
  imageUrl?: string;
  imagePublicId?: string;
  transcript?: string;
  questionText?: string;
  options: ListeningOption[];
  explanation?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListeningSetDetail extends ListeningSet {
  groups: ListeningAudioGroup[];
  questions: ListeningQuestion[];
}

export interface CreateListeningSetPayload {
  title: string;
  part: 1 | 2 | 3 | 4;
  difficulty?: string;
  status?: "draft" | "published" | "archived";
  xpReward?: number;
  passThreshold?: number;
  order?: number;
  allowedPackageIds?: string[];
}

export interface CreateListeningGroupPayload {
  title?: string;
  audioUrl: string;
  audioPublicId?: string;
  transcript: string;
  imageUrl?: string;
  imagePublicId?: string;
  order?: number;
}

export interface CreateListeningQuestionPayload {
  setId: string;
  groupId?: string | null;
  part: 1 | 2 | 3 | 4;
  audioUrl?: string;
  audioPublicId?: string;
  imageUrl?: string;
  imagePublicId?: string;
  transcript?: string;
  questionText?: string;
  options: ListeningOption[];
  explanation?: string;
  order?: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UploadMediaResponse {
  publicId: string;
  secureUrl: string;
  format?: string;
  duration?: number;
}

export const listeningApi = {
  // Upload helpers
  uploadImage: (file: File): Promise<UploadMediaResponse> => {
    const formData = new FormData();
    formData.append("image", file);
    return axiosClient
      .post<ApiEnvelope<UploadMediaResponse>>("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data.data);
  },

  uploadAudio: (file: File): Promise<UploadMediaResponse> => {
    const formData = new FormData();
    formData.append("audio", file);
    return axiosClient
      .post<ApiEnvelope<UploadMediaResponse>>("/upload/audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data.data);
  },

  // Set API
  getSets: (params?: { part?: number; status?: string; page?: number; limit?: number }) =>
    axiosClient.get<ApiEnvelope<ListeningSet[]>>("/listening/sets", { params }).then((res) => res.data),

  getSetDetail: (id: string) =>
    axiosClient.get<ApiEnvelope<ListeningSetDetail>>(`/listening/sets/${id}`).then((res) => res.data.data),

  createSet: (payload: CreateListeningSetPayload) =>
    axiosClient.post<ApiEnvelope<ListeningSet>>("/listening/sets", payload).then((res) => res.data.data),

  updateSet: (id: string, payload: Partial<CreateListeningSetPayload>) =>
    axiosClient.put<ApiEnvelope<ListeningSet>>(`/listening/sets/${id}`, payload).then((res) => res.data.data),

  deleteSet: (id: string) =>
    axiosClient.delete<{ success: boolean; message: string }>(`/listening/sets/${id}`).then((res) => res.data),

  reorderGroups: (setId: string, items: { id: string; order: number }[]) =>
    axiosClient.put(`/listening/sets/${setId}/groups/reorder`, { items }).then((res) => res.data),

  reorderQuestions: (setId: string, items: { id: string; order: number }[]) =>
    axiosClient.put(`/listening/sets/${setId}/questions/reorder`, { items }).then((res) => res.data),

  // Audio Group API
  createGroup: (setId: string, payload: CreateListeningGroupPayload) =>
    axiosClient.post<ApiEnvelope<ListeningAudioGroup>>(`/listening/sets/${setId}/groups`, payload).then((res) => res.data.data),

  updateGroup: (groupId: string, payload: Partial<CreateListeningGroupPayload>) =>
    axiosClient.put<ApiEnvelope<ListeningAudioGroup>>(`/listening/groups/${groupId}`, payload).then((res) => res.data.data),

  deleteGroup: (groupId: string) =>
    axiosClient.delete<{ success: boolean; message: string }>(`/listening/groups/${groupId}`).then((res) => res.data),

  getQuestionsByGroup: (groupId: string) =>
    axiosClient.get<ApiEnvelope<ListeningQuestion[]>>(`/listening/groups/${groupId}/questions`).then((res) => res.data.data),

  // Question API
  createQuestion: (payload: CreateListeningQuestionPayload) =>
    axiosClient.post<ApiEnvelope<ListeningQuestion>>("/listening/questions", payload).then((res) => res.data.data),

  updateQuestion: (id: string, payload: Partial<CreateListeningQuestionPayload>) =>
    axiosClient.put<ApiEnvelope<ListeningQuestion>>(`/listening/questions/${id}`, payload).then((res) => res.data.data),

  deleteQuestion: (id: string) =>
    axiosClient.delete<{ success: boolean; message: string }>(`/listening/questions/${id}`).then((res) => res.data),
};

export default listeningApi;
