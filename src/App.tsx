import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame";
import { AuthProvider } from "./auth/AuthContext";
import { RedirectIfAuthed, RequireAuth } from "./auth/RequireAuth";
import Onboarding from "./screens/Onboarding";
import Home from "./screens/Home";
import SearchFilters from "./screens/SearchFilters";
import ItemDetails from "./screens/ItemDetails";
import MakeOffer from "./screens/MakeOffer";
import Chat from "./screens/Chat";
import TradeSummary from "./screens/TradeSummary";
import TradeConfirmed from "./screens/TradeConfirmed";
import Profile from "./screens/Profile";
import More from "./screens/More";
import Messages from "./screens/Messages";
import PostItem from "./screens/PostItem";
import Register from "./screens/auth/Register";
import Login from "./screens/auth/Login";
import VerifyEmail from "./screens/auth/VerifyEmail";
import CompleteProfile from "./screens/auth/CompleteProfile";
import ForgotPassword from "./screens/auth/ForgotPassword";
import AuthCallback from "./screens/auth/AuthCallback";
import Setup from "./screens/Setup";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PhoneFrame>
          <Routes>
            <Route
              path="/"
              element={
                <RedirectIfAuthed>
                  <Onboarding />
                </RedirectIfAuthed>
              }
            />
            <Route path="/setup" element={<Setup />} />
            <Route
              path="/register"
              element={
                <RedirectIfAuthed>
                  <Register />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <Login />
                </RedirectIfAuthed>
              }
            />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/complete-profile"
              element={
                <RequireAuth>
                  <CompleteProfile />
                </RequireAuth>
              }
            />

            <Route
              path="/home"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/search"
              element={
                <RequireAuth>
                  <SearchFilters />
                </RequireAuth>
              }
            />
            <Route
              path="/post"
              element={
                <RequireAuth>
                  <PostItem />
                </RequireAuth>
              }
            />
            <Route
              path="/messages"
              element={
                <RequireAuth>
                  <Messages />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/more"
              element={
                <RequireAuth>
                  <More />
                </RequireAuth>
              }
            />
            <Route
              path="/item/:id"
              element={
                <RequireAuth>
                  <ItemDetails />
                </RequireAuth>
              }
            />
            <Route
              path="/offer/:id"
              element={
                <RequireAuth>
                  <MakeOffer />
                </RequireAuth>
              }
            />
            <Route
              path="/chat/:id"
              element={
                <RequireAuth>
                  <Chat />
                </RequireAuth>
              }
            />
            <Route
              path="/summary/:id"
              element={
                <RequireAuth>
                  <TradeSummary />
                </RequireAuth>
              }
            />
            <Route
              path="/confirmed/:id"
              element={
                <RequireAuth>
                  <TradeConfirmed />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PhoneFrame>
      </BrowserRouter>
    </AuthProvider>
  );
}
