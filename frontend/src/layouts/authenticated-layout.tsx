import { Outlet } from 'react-router-dom';
import { PhoenixProvider } from '../components/socket-provider';

function AuthenticatedLayout() {
  return (
    <div className='h-screen w-screen font-sans'>
      <PhoenixProvider>
        <Outlet />
      </PhoenixProvider>
    </div>
  );
}

export default AuthenticatedLayout;
