import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './layouts/layout';
import Home from './pages/Home';
import Login from './pages/account/login';
import Canvas from './pages/Canvas';

export default function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="canvases/:canvas_id" element={<Canvas />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
