import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import EditorCanvas from "./component/EditorCanvas";
import CardPage from "./page/CardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EditorCanvas />} />
        <Route path="/card/:uuid" element={<CardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
