'use client';

import { Navbar } from '@/components/navbar';
import { SearchBar } from '@/components/searchbar';
import GeoForm from '@/components/GeoForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />

      {/* Search Bar */}
      <SearchBar />

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Welcome to 2Hand EV Battery Trading
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Your trusted platform for buying and selling high-quality second-hand electric vehicle batteries.
            Find the perfect battery for your EV or sell your used battery to get the best value.
          </p>
        </div>

        {/* Extra section */}
        <section className="mt-12 text-left">


          {/* Form component */}
          <div className="mt-6">
            <GeoForm />
          </div>
        </section>
      </main>
    </div>
  );
}
