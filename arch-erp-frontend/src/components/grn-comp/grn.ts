export interface GRN {
  grnId: number
  grnNo: string
  grnDate: string
  statusNo: string
  supplierLocationNo: string
  supplierLocationLabel?: string;
  poNo: string
  challanNo: string
  challanDate: string
  actualBpId?: number;
  bpName?: string;
  bpCode?: string;
  bpAddress?: string;

}