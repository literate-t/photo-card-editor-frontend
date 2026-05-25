import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import EditorCanvas from "./component/EditorCanvas";
import PrivateRoute from "./component/PrivateRoute";
import apiClient from "./lib/apiClient";
import CardPage from "./page/CardPage";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setAuthReady = useAuthStore((s) => s.setAuthReady);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);

  useEffect(() => {
    apiClient
      .post<{ accessToken: string }>("/auth/refresh")
      .then((res) => setAccessToken(res.data.accessToken))
      .catch(() => {
        // 쿠키 없음 / 만료 → 비로그인 상태로 진행
      })
      .finally(() => setAuthReady());
  }, [setAccessToken, setAuthReady]);

  if (!isAuthReady) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <EditorCanvas />
            </PrivateRoute>
          }
        />
        <Route path="/card/:uuid" element={<CardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
