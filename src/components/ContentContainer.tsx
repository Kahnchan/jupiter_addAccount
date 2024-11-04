import { FC } from 'react';
import Link from "next/link";
import Text from './Text';
import NavElement from './nav-element';
interface Props {
  children: React.ReactNode;
}

export const ContentContainer: React.FC<Props> = ({ children }) => {

  return (
    <div className="flex-1 drawer h-52 flex-col justify-between">
      <div className="items-center drawer-content flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};
