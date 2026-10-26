"use client";

import { Building2, ShieldCheck, Sparkles } from "lucide-react";
import { ListingForm } from "@/components/listing-form";
import { ListingList } from "@/components/listing-list";

function HeroSection() {
  return (
    <section className="space-y-4 py-8 text-center md:py-12">
      <div className="bg-muted/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium">
        <Sparkles className="text-primary h-3.5 w-3.5" />
        <span>Direct Homestay Marketplace</span>
      </div>
      <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
        Book homestays directly with hosts
      </h1>
      <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
        Connect with authentic local stays without middleman commissions.
        Explore properties, profile acquisitions, and homestay business
        opportunities with verified hosts.
      </p>
      <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-6 pt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Direct Host Contact</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 className="text-primary h-4 w-4" />
          <span>Curated BuyHomestay Opportunities</span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto max-w-6xl space-y-12 overflow-x-hidden px-4 py-6 sm:px-6">
        <HeroSection />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Post a Listing
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Sell property, land, Airbnb profiles, or homestay businesses
                directly.
              </p>
            </div>
          </div>
          <ListingForm />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Available Listings
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Browse current homestay opportunities and contact hosts via
                WhatsApp.
              </p>
            </div>
          </div>
          <ListingList />
        </section>
      </main>
    </div>
  );
}
