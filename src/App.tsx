import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame";
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

export default function App() {
  return (
    <HashRouter>
      <PhoneFrame>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<SearchFilters />} />
          <Route path="/post" element={<PostItem />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/more" element={<More />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/offer/:id" element={<MakeOffer />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/summary/:id" element={<TradeSummary />} />
          <Route path="/confirmed/:id" element={<TradeConfirmed />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PhoneFrame>
    </HashRouter>
  );
}
