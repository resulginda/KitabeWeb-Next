export type Rating = {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  rejectedReason?: string;
  createdAt: any;
  updatedAt: any;
  approvedAt?: any;
  rejectedAt?: any;
};

export type PlaceRatingSummary = {
  placeId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [rating: number]: number;
  };
};
