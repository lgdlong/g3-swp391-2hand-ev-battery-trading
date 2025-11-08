import { Metadata } from 'next';
import { CasesClient } from './_components/cases-client';

export const metadata: Metadata = {
  title: 'Refund Cases | Admin Dashboard',
  description: 'View and manage all refund cases',
};

export default function CasesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Refund Cases Management</h1>
        <p className="text-muted-foreground">
          View all refund cases, filter by status/scenario, and resolve pending cases
        </p>
      </div>

      <CasesClient />
    </div>
  );
}
