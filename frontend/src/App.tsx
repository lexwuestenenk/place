import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './layouts/layout';
import Home from './pages/home';
import Login from './pages/account/login';
import Canvas from './pages/canvas';
import Register from './pages/account/register';

export default function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="canvases/:canvas_id" element={<Canvas />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
