import { Navbar } from '@/components/navbar/navbar';
import { PhoneVerificationBanner } from '@/components/navbar/PhoneVerificationBanner';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <PhoneVerificationBanner />
      <main>{children}</main>
    </>
  );
}
