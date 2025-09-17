HEAD
'use client';

import { Header } from '@/components/header';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

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
      </main>
    </div>

import GeoForm from '@/components/GeoForm';

export default function Home() {
  return (
    <>
      <h1>Hello</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
        pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
        aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
        Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
        aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      </p>
      <GeoForm />
    </>
1f65361b91bb4f39087864afff1eb66646ead26f
  );
}
