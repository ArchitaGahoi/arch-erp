export interface PO {
  poId?: number; // Optional for new entries
  poNo: string;
  poDate: Date;
  statusNo: string;
  supplierLocationNo: string;
  supplierLocationLabel?: string;
  netAmount: number;
}