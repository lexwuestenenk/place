import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

function UserList() {
  const presence = useSelector((state: RootState) => state.presence);

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg p-4 rounded-md">
      <h3 className="font-semibold mb-2 text-gray-800">Online Users ({Object.values(presence).length})</h3>
      <div className='flex flex-col'>
        {Object.values(presence).map((user) => (
          <div key={user.username} className="flex items-center text-sm text-gray-700 gap-2 border-l-4 m-2" style={{ borderColor: `#${user.color}`}}>
            <div className='pl-3'>{user.username} ({user.x}, {user.y})</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;
