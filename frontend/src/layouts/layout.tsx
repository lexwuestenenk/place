import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className='h-screen w-screen font-sans'>
      <Outlet />
    </div>
  );
}

export default Layout;
