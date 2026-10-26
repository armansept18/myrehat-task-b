"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin, MessageCircle, Tag } from "lucide-react";

import { orpc } from "@/utils/orpc";

interface ListingItem {
  id: string;
  title: string;
  price: string;
  location: string;
  category: string;
  contactWa: string;
  createdAt: string | Date;
}

function ListingCard({ item }: { item: ListingItem }) {
  const cleanWa = item.contactWa.replace(/\D/g, "");
  const waUrl = cleanWa ? `https://wa.me/${cleanWa}` : "#";

  return (
    <div className="bg-card flex flex-col justify-between rounded-xl border p-5 shadow-xs transition hover:shadow-md">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <Tag className="h-3 w-3" />
            {item.category}
          </span>
          <span className="text-muted-foreground text-xs">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h4 className="line-clamp-2 text-base font-semibold">{item.title}</h4>
        <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
        <div className="text-foreground mt-3 text-lg font-bold">
          {item.price.startsWith("RM") || item.price.startsWith("$")
            ? item.price
            : `RM ${item.price}`}
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Chat on WhatsApp ({item.contactWa})
        </a>
      </div>
    </div>
  );
}

export function ListingList() {
  const {
    data: listings,
    isLoading,
    error,
  } = useQuery(orpc.listing.list.queryOptions());

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-muted/40 h-48 animate-pulse rounded-xl border p-4"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border p-4 text-center text-sm">
        Failed to load listings. Please try again.
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm font-medium">
          No listings available yet.
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Be the first to list a property or homestay!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((item) => (
        <ListingCard key={item.id} item={item} />
      ))}
    </div>
  );
}
