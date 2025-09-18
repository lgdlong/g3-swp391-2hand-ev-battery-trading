'use client';

import { Header } from '@/components/header';
import GeoForm from '@/components/GeoForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

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
          <h2 className="text-2xl font-semibold mb-4">Hello</h2>
          <p className="text-muted-foreground leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
            pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
            aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
            Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
            aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
          </p>

          {/* Form component */}
          <div className="mt-6">
            <GeoForm />
          </div>
        </section>
      </main>
    </div>
  );
}
