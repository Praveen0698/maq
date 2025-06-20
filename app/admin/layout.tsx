'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import renderIcons from '@/utils/renderIcons';
import { AiOutlineLogout } from 'react-icons/ai';
import { ImSpinner2 } from 'react-icons/im';
import Cookies from "js-cookie";

type IconName =
  | 'AiOutlineDashboard'
  | 'LiaQuestionSolid'
  | 'FaComputer'
  | 'PiUsersThreeFill';

const navOptions: { name: string; href: string; icon: IconName }[] = [
  { name: 'Dashboard', href: '/admin', icon: 'AiOutlineDashboard' },
  { name: 'MCQs', href: '/admin/questions', icon: 'LiaQuestionSolid' },
  { name: 'Users', href: '/admin/users', icon: 'PiUsersThreeFill' },
  { name: 'Assignments', href: '/admin/assignments', icon: 'FaComputer' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };
  return (
    <div className="flex w-full min-h-screen m-0 p-0">
      <aside className="w-[15vw] bg-gray-800 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6 text-white">Admin Panel</h2>
          <nav className="space-y-2">
            {navOptions.map((option) => {
              const isActive = pathname === option.href;
              return (
                <Link key={option.name} href={option.href} className="block w-full">
                  <span
                    className={`flex items-center gap-3 rounded-md w-full py-2 px-4 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white text-purple-700'
                        : 'text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    {renderIcons(option.icon, 20, 'inherit')}
                    {option.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="mt-10 flex items-center gap-2 text-white hover:text-red-500 transition-colors"
        >
          {isLoggingOut ? (
            <>
              <ImSpinner2 className="animate-spin" size={18} />
              Logging out...
            </>
          ) : (
            <>
              <AiOutlineLogout size={18} />
              Logout
            </>
          )}
        </button>
      </aside>

      <main className="flex-1 w-[83vw] h-full overflow-y-auto bg-black p-6">{children}</main>
    </div>
  );
}
