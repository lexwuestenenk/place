import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export default function Home() {
  const token = useSelector((state: RootState) => state.account.token)
  const user = useSelector((state: RootState) => state.account.user)
  return (
    <div className='flex flex-col w-screen h-screen bg-red-500'>
      <span>{token}</span>
      <span>{user.email}</span>
      <span>{user.username}</span>
    </div>
  )
}