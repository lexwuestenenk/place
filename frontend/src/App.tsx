import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './layouts/layout';
import Home from './pages/home';
import Login from './pages/account/login';
import Canvas from './pages/canvas';
import Register from './pages/account/register';
import AuthenticatedLayout from './layouts/authenticated-layout';

export default function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route path="/canvases" element={<AuthenticatedLayout />}>
              <Route index element={<Home />} />
              <Route path=":canvas_id" element={<Canvas />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
