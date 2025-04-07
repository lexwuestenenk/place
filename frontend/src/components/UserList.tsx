import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

function UserList() {
  const presence = useSelector((state: RootState) => state.presence);

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg p-4 rounded-md">
      <h3 className="font-semibold mb-2 text-gray-800">Online Users</h3>
      <ul className="space-y-1">
        {Object.values(presence).map((user) => (
          <li key={user.userId} className="text-sm text-gray-700 flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: user.color || '#000000' }}
            />
            {user.username} ({user.x}, {user.y})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
