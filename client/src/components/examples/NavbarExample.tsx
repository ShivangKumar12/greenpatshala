import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '../layout/Navbar';

export default function NavbarExample() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </ThemeProvider>
  );
}
