import { api } from "@/lib/api/axios";

export interface Payment {
  paymentId: number;
  amount: number;
  paymentStatus: "SUCCESS" | "FAILED" | "PENDING";
  paymentDate: string;
  invoiceId?: number;
  invoiceReference: string;
}

export interface CreatePaymentRequest {
  amount: number;
  paymentStatus: Payment["paymentStatus"];
  invoiceId: number;
}

export interface DemoCheckoutRequest {
  invoiceId: number;
}

export async function getPayments(): Promise<Payment[]> {
  const response = await api.get<Payment[]>("/payment/getall");
  return response.data;
}

export async function getPaymentById(id: number): Promise<Payment> {
  const response = await api.get<Payment>(`/payment/read/${id}`);
  return response.data;
}

export async function createPayment(
  data: CreatePaymentRequest
): Promise<Payment> {
  const response = await api.post<Payment>("/payment/create", data);
  return response.data;
}

export async function createDemoCheckout(
  data: DemoCheckoutRequest
): Promise<Payment> {
  const response = await api.post<Payment>("/payment/checkout", data);
  return response.data;
}

export async function updatePayment(
  id: number,
  data: Partial<CreatePaymentRequest>
): Promise<Payment> {
  const response = await api.put<Payment>(`/payment/update/${id}`, data);
  return response.data;
}

export async function deletePayment(id: number): Promise<void> {
  await api.delete(`/payment/delete/${id}`);
}