export interface PO {
  poId?: number; // Optional for new entries
  poNo: string;
  poDate: Date;
  statusNo: number;
  supplierLocationNo: string;
  supplierLocationLabel?: string;
  netAmount: number;
  bpName?: string;
  bpCode?: string;
  bpAddress?: string;

}