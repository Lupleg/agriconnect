export type ListingStatus = 'available' | 'reserved' | 'sold';
export type OrderStatus = 'pending' | 'picked' | 'in transit' | 'delivered';
export type MessageSender = 'farmer' | 'buyer' | 'driver';

export type HarvestPlan = {
  id: string;
  cropName: string;
  harvestDate: string;
  quantityKg: number;
};

export type FarmerProfile = {
  fullName: string;
  phoneNumber: string;
  farmLocation: string;
  cropTypes: string[];
  onboardingComplete: boolean;
  harvestPlans: HarvestPlan[];
};

export type CropListing = {
  id: string;
  cropName: string;
  quantityKg: number;
  pricePerKg: number;
  harvestDate: string;
  photoUrl?: string;
  status: ListingStatus;
  createdAt: string;
};

export type BuyerOrder = {
  id: string;
  listingId: string;
  cropName: string;
  buyerName: string;
  buyerContact: string;
  quantityKg: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
};

export type GpsCheckpoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export type TransportRequest = {
  id: string;
  orderId: string;
  driverName: string;
  vehiclePlate: string;
  pickupDetails: string;
  dropoffDetails: string;
  deliveryFee: number;
  checkpoints: GpsCheckpoint[];
  currentCheckpointIndex: number;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  orderId: string;
  sender: MessageSender;
  body: string;
  createdAt: string;
};

export type PlaceOrderInput = {
  listingId: string;
  buyerName: string;
  buyerContact: string;
  quantityKg: number;
  pickupLocation: string;
  dropoffLocation: string;
};

export type UpsertTransportInput = {
  orderId: string;
  driverName: string;
  vehiclePlate: string;
  pickupDetails: string;
  dropoffDetails: string;
  deliveryFee: number;
};
