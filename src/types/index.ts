export interface User {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role: 'admin' | 'user';
  profileImage?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: DocumentStatus;
  ownerId: string;
  signers: Signer[];
  fileUrl: string;
  fileType: string;
  fileSize: number;
  isEncrypted: boolean;
  blockchainVerified?: boolean;
  auditTrail: AuditEvent[];
}

export type DocumentStatus = 
  | 'draft'
  | 'pending'
  | 'signed'
  | 'completed'
  | 'expired'
  | 'rejected'
  | 'cancelled';

export interface Signer {
  id: string;
  name: string;
  email: string;
  status: SignerStatus;
  role: string;
  signMethod?: SignMethod;
  signatureId?: string;
  signedAt?: string;
}

export type SignerStatus = 
  | 'pending'
  | 'viewed'
  | 'signed'
  | 'rejected'
  | 'expired';

export type SignMethod = 
  | 'aadhaar'
  | 'dsc'
  | 'manual'
  | 'otp';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  details?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface Signature {
  id: string;
  userId: string;
  type: SignMethod;
  data: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}