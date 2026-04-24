import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
  title: string;
};

export function Layout({ children, title }: LayoutProps) {
  return (
    <div>
      <header>
        <h1>{title}</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
