import { apiFetch } from "@/lib/api/client";

export interface EnquiryRequest {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * ASSUMED endpoint — following the /{resource}/create convention used
 * elsewhere in this project. Confirm the path once an Enquiry controller
 * exists on the backend. Until then this call fails and the contact form
 * falls back to opening the guest's email app.
 */
export function createEnquiry(enquiry: EnquiryRequest) {
  return apiFetch<void>("/enquiry/create", {
    method: "POST",
    body: JSON.stringify(enquiry),
  });
}
