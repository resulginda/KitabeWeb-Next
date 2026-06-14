export type PhotoSubmission = {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  photoUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  rejectedReason?: string;
  createdAt: any;
  updatedAt: any;
  approvedAt?: any;
  rejectedAt?: any;
};
