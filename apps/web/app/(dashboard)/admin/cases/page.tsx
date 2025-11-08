import { Metadata } from 'next';
import { CasesClient } from './_components/cases-client';

export const metadata: Metadata = {
  title: 'Refund Cases | Admin Dashboard',
  description: 'View and manage all refund cases and pending refund candidates',
};

export default function CasesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Refund Management</h1>
        <p className="text-muted-foreground">
          Manage refund cases and posts pending refund processing
        </p>
      </div>

      <CasesClient />
    </div>
  );
}
