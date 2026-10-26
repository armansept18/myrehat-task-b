"use client";

import { LISTING_CATEGORIES, type ListingCategory } from "@myrehat-task-b/api";
import { Button } from "@myrehat-task-b/ui/components/button";
import { Input } from "@myrehat-task-b/ui/components/input";
import { Label } from "@myrehat-task-b/ui/components/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

interface ListingFormData {
  title: string;
  price: string;
  location: string;
  category: ListingCategory;
  contactWa: string;
}

const INITIAL_FORM_STATE: ListingFormData = {
  title: "",
  price: "",
  location: "",
  category: "Buy Property",
  contactWa: "",
};

function FormInputs({
  data,
  onChange,
}: {
  data: ListingFormData;
  onChange: (field: keyof ListingFormData, val: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="title">Listing Title</Label>
        <Input
          id="title"
          placeholder="e.g. Modern Seaview Villa in Batu Ferringhi"
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          placeholder="e.g. RM 350 / night or 450000"
          value={data.price}
          onChange={(e) => onChange("price", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={data.category}
          onChange={(e) =>
            onChange("category", e.target.value as ListingCategory)
          }
          className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
          required
        >
          {LISTING_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g. Penang, Malaysia"
          value={data.location}
          onChange={(e) => onChange("location", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contactWa">WhatsApp Contact</Label>
        <Input
          id="contactWa"
          placeholder="e.g. +60123456789"
          value={data.contactWa}
          onChange={(e) => onChange("contactWa", e.target.value)}
          required
        />
      </div>
    </div>
  );
}

export function ListingForm() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [formData, setFormData] = useState<ListingFormData>(INITIAL_FORM_STATE);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: ListingFormData) => orpc.listing.create.call(input),
    onSuccess: () => {
      toast.success("Listing submitted successfully!");
      setFormData(INITIAL_FORM_STATE);
      queryClient.invalidateQueries({ queryKey: orpc.listing.list.key() });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit listing");
    },
  });

  const handleFieldChange = (field: keyof ListingFormData, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (sessionLoading) {
    return (
      <div className="text-muted-foreground p-4 text-center text-sm">
        Checking authentication...
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="border-primary/30 bg-primary/5 rounded-xl border border-dashed p-6 text-center">
        <h3 className="text-base font-semibold">
          Want to list your homestay or property?
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in or create an account to publish your BuyHomestay listing
          directly to guests.
        </p>
        <Link href="/login" className="mt-4 inline-block">
          <Button variant="default" size="sm">
            Sign In to Create Listing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-xl border p-6 shadow-xs"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Create BuyHomestay Listing</h3>
        <p className="text-muted-foreground text-xs">
          Fill in details below to publish your homestay or property
          opportunity.
        </p>
      </div>
      <FormInputs data={formData} onChange={handleFieldChange} />
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Submitting..." : "Submit Listing"}
        </Button>
      </div>
    </form>
  );
}
