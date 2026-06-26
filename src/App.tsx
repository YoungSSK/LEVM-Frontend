import { useEffect } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import AdminLayout from "@/components/layout/AdminLayout";
import AuthPage from "@/features/auth/AuthPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import OccupationPage from "@/features/occupation/OccupationPage";
import LessonDetailPage from "@/features/vocabulary/page/LessonDetailPage";
import TopicDetailPage from "@/features/vocabulary/page/TopicDetailPage";
import TopicPage from "@/features/vocabulary/page/TopicPage";
import VocabularyPage from "@/features/vocabulary/page/VocabularyPage";
import WordDetailPage from "@/features/vocabulary/page/WordDetailPage";
import WordPage from "@/features/vocabulary/page/WordPage";
import { authStore, useAuthStore } from "@/stores/authStore";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { accessToken, hydrated } = useAuthStore();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AnonymousRoute({ children }: { children: ReactNode }) {
  const { accessToken, hydrated } = useAuthStore();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    void authStore.bootstrapSession();
  }, []);

  return (
    <div>
      <Toaster position="bottom-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="occupation" element={<OccupationPage />} />
            <Route path="vocabulary" element={<VocabularyPage />}>
              <Route index element={<Navigate to="topics" replace />} />
              <Route path="topics" element={<TopicPage />} />
              <Route path="topics/:topicId" element={<TopicDetailPage />} />
              <Route path="lessons/:lessonId" element={<LessonDetailPage />} />
              <Route path="words" element={<WordPage />} />
              <Route path="words/:wordId" element={<WordDetailPage />} />
            </Route>
          </Route>
          <Route
            path="/auth"
            element={
              <AnonymousRoute>
                <AuthPage />
              </AnonymousRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
