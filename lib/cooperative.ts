import type { Cooperative } from "./types";

// Fields considered essential for a "complete" cooperative profile. These
// mirror the required fields enforced by CooperativeForm (#36->#40 in
// components/coop/cooperative-form.tsx) and Moroccan registration basics.
const REQUIRED_FIELDS = [
  "name_fr",
  "name_ar",
  "address",
  "phone",
  "email",
  "ice",
] as const;

export function cooperativeIsComplete(cooperative: Cooperative | null): boolean {
  if (!cooperative) return false;
  for (const field of REQUIRED_FIELDS) {
    const value = cooperative[field];
    if (!value || typeof value !== "string" || value.trim() === "") return false;
  }
  return true;
}

export function cooperativeMissingFields(
  cooperative: Cooperative | null
): string[] {
  if (!cooperative) return [...REQUIRED_FIELDS] as unknown as string[];
  return REQUIRED_FIELDS.filter((field) => {
    const value = cooperative[field];
    return !value || typeof value !== "string" || value.trim() === "";
  });
}