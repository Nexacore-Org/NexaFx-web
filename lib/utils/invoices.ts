import { Invoice } from "@/lib/types";

const INVOICES_KEY = "userInvoices";

export const getInvoices = (): Invoice[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(INVOICES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getInvoice = (id: string): Invoice | undefined => {
  const invoices = getInvoices();
  return invoices.find((invoice) => invoice.id === id);
};

export const addInvoice = (invoice: Invoice): void => {
  if (typeof window === "undefined") return;
  const invoices = getInvoices();
  const newInvoices = [invoice, ...invoices];
  localStorage.setItem(INVOICES_KEY, JSON.stringify(newInvoices));
  window.dispatchEvent(new Event("storage"));
};

export const updateInvoiceStatus = (
  id: string,
  status: "Pending" | "Paid",
): void => {
  if (typeof window === "undefined") return;
  const invoices = getInvoices();
  const newInvoices = invoices.map((invoice) =>
    invoice.id === id ? { ...invoice, status } : invoice,
  );
  localStorage.setItem(INVOICES_KEY, JSON.stringify(newInvoices));
  window.dispatchEvent(new Event("storage"));
};

export const deleteInvoice = (id: string): void => {
  if (typeof window === "undefined") return;
  const invoices = getInvoices();
  const newInvoices = invoices.filter((invoice) => invoice.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(newInvoices));
  window.dispatchEvent(new Event("storage"));
};
