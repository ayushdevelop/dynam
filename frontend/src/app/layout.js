import './globals.css';

export const metadata = {
  title: 'Dynam Forms',
  description: 'A dynamic form builder and renderer application.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
