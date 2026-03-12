import React, { createContext, useContext, useMemo, useState } from 'react';

import type {
  BuyerOrder,
  ChatMessage,
  CropListing,
  FarmerProfile,
  GpsCheckpoint,
  HarvestPlan,
  ListingStatus,
  MessageSender,
  OrderStatus,
  PlaceOrderInput,
  TransportRequest,
  UpsertTransportInput,
} from '@/types/agri';

const ORDER_FLOW: OrderStatus[] = ['pending', 'picked', 'in transit', 'delivered'];

type AgriContextValue = {
  farmerProfile: FarmerProfile;
  listings: CropListing[];
  orders: BuyerOrder[];
  transportRequests: TransportRequest[];
  chatMessages: ChatMessage[];
  upsertFarmerProfile: (payload: Omit<FarmerProfile, 'onboardingComplete'>) => void;
  addHarvestPlan: (input: Omit<HarvestPlan, 'id'>) => void;
  removeHarvestPlan: (id: string) => void;
  createListing: (input: Omit<CropListing, 'id' | 'createdAt'>) => void;
  updateListingStatus: (listingId: string, status: ListingStatus) => void;
  placeOrder: (input: PlaceOrderInput) => void;
  advanceOrderStatus: (orderId: string) => void;
  upsertTransportRequest: (input: UpsertTransportInput) => void;
  addChatMessage: (orderId: string, sender: MessageSender, body: string) => void;
};

const AgriContext = createContext<AgriContextValue | undefined>(undefined);

const nowDate = () => new Date().toISOString();

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultFarmerProfile: FarmerProfile = {
  fullName: '',
  phoneNumber: '',
  farmLocation: '',
  cropTypes: [],
  onboardingComplete: false,
  harvestPlans: [],
};

const sampleListings: CropListing[] = [
  {
    id: 'crop-maize-1',
    cropName: 'Maize',
    quantityKg: 1200,
    pricePerKg: 0.6,
    harvestDate: '2026-03-20',
    photoUrl: '',
    status: 'available',
    createdAt: nowDate(),
  },
  {
    id: 'crop-beans-1',
    cropName: 'Beans',
    quantityKg: 480,
    pricePerKg: 1.4,
    harvestDate: '2026-03-14',
    photoUrl: '',
    status: 'available',
    createdAt: nowDate(),
  },
];

const sampleOrders: BuyerOrder[] = [
  {
    id: 'order-1',
    listingId: 'crop-maize-1',
    cropName: 'Maize',
    buyerName: 'Lusaka Fresh Produce Hub',
    buyerContact: '+260 97 000 1111',
    quantityKg: 200,
    unitPrice: 0.6,
    totalPrice: 120,
    status: 'pending',
    pickupLocation: 'Mkushi Farm Gate',
    dropoffLocation: 'Lusaka Market Depot',
    createdAt: nowDate(),
  },
];

const sampleMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    orderId: 'order-1',
    sender: 'buyer',
    body: 'Can the pickup happen early morning?',
    createdAt: nowDate(),
  },
  {
    id: 'msg-2',
    orderId: 'order-1',
    sender: 'farmer',
    body: 'Yes, produce will be ready by 7:00 AM.',
    createdAt: nowDate(),
  },
];

const hash = (value: string) =>
  value
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

const buildRouteCheckpoints = (pickup: string, dropoff: string): GpsCheckpoint[] => {
  const seed = hash(`${pickup}-${dropoff}`);
  // Zambia-centered demo coordinates (roughly around Lusaka/Central) so maps render locally.
  const latBase = -15.4 + (seed % 18) / 100;
  const lngBase = 28.3 + (seed % 22) / 100;

  return [
    {
      id: uid(),
      name: `Pickup: ${pickup}`,
      latitude: latBase,
      longitude: lngBase,
    },
    {
      id: uid(),
      name: 'Collection Hub',
      latitude: latBase + 0.03,
      longitude: lngBase + 0.04,
    },
    {
      id: uid(),
      name: 'Transit Stop',
      latitude: latBase + 0.07,
      longitude: lngBase + 0.08,
    },
    {
      id: uid(),
      name: `Dropoff: ${dropoff}`,
      latitude: latBase + 0.12,
      longitude: lngBase + 0.14,
    },
  ];
};

const statusToCheckpointIndex = (status: OrderStatus, maxIndex: number) => {
  if (status === 'pending') return 0;
  if (status === 'picked') return Math.min(1, maxIndex);
  if (status === 'in transit') return Math.min(Math.max(1, Math.floor(maxIndex * 0.65)), maxIndex);
  return maxIndex;
};

export function AgriProvider({ children }: { children: React.ReactNode }) {
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>(defaultFarmerProfile);
  const [listings, setListings] = useState<CropListing[]>(sampleListings);
  const [orders, setOrders] = useState<BuyerOrder[]>(sampleOrders);
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(sampleMessages);

  const value = useMemo<AgriContextValue>(
    () => ({
      farmerProfile,
      listings,
      orders,
      transportRequests,
      chatMessages,
      upsertFarmerProfile: (payload) => {
        setFarmerProfile({
          ...payload,
          onboardingComplete: Boolean(
            payload.fullName.trim() &&
              payload.phoneNumber.trim() &&
              payload.farmLocation.trim() &&
              payload.cropTypes.length,
          ),
        });
      },
      addHarvestPlan: (input) => {
        setFarmerProfile((current) => ({
          ...current,
          harvestPlans: [...current.harvestPlans, { ...input, id: uid() }],
        }));
      },
      removeHarvestPlan: (id) => {
        setFarmerProfile((current) => ({
          ...current,
          harvestPlans: current.harvestPlans.filter((plan) => plan.id !== id),
        }));
      },
      createListing: (input) => {
        setListings((current) => [{ ...input, id: uid(), createdAt: nowDate() }, ...current]);
      },
      updateListingStatus: (listingId, status) => {
        setListings((current) =>
          current.map((listing) => (listing.id === listingId ? { ...listing, status } : listing)),
        );
      },
      placeOrder: (input) => {
        let selectedListing: CropListing | undefined;

        setListings((current) =>
          current.map((listing) => {
            if (listing.id !== input.listingId) return listing;

            selectedListing = listing;
            const remaining = Number((listing.quantityKg - input.quantityKg).toFixed(2));
            const nextStatus: ListingStatus = remaining <= 0 ? 'sold' : 'reserved';

            return {
              ...listing,
              quantityKg: Math.max(remaining, 0),
              status: nextStatus,
            };
          }),
        );

        if (!selectedListing) return;
        const resolvedListing = selectedListing;

        setOrders((current) => [
          {
            id: uid(),
            listingId: resolvedListing.id,
            cropName: resolvedListing.cropName,
            buyerName: input.buyerName,
            buyerContact: input.buyerContact,
            quantityKg: input.quantityKg,
            unitPrice: resolvedListing.pricePerKg,
            totalPrice: Number((input.quantityKg * resolvedListing.pricePerKg).toFixed(2)),
            status: 'pending',
            pickupLocation: input.pickupLocation,
            dropoffLocation: input.dropoffLocation,
            createdAt: nowDate(),
          },
          ...current,
        ]);
      },
      advanceOrderStatus: (orderId) => {
        let nextStatus: OrderStatus | null = null;

        setOrders((current) =>
          current.map((order) => {
            if (order.id !== orderId) return order;

            const currentIndex = ORDER_FLOW.indexOf(order.status);
            const updatedStatus = ORDER_FLOW[Math.min(currentIndex + 1, ORDER_FLOW.length - 1)];
            nextStatus = updatedStatus;

            return {
              ...order,
              status: updatedStatus,
            };
          }),
        );

        if (!nextStatus) return;

        setTransportRequests((current) =>
          current.map((request) => {
            if (request.orderId !== orderId) return request;

            const maxIndex = Math.max(request.checkpoints.length - 1, 0);

            return {
              ...request,
              currentCheckpointIndex: statusToCheckpointIndex(nextStatus!, maxIndex),
            };
          }),
        );
      },
      upsertTransportRequest: (input) => {
        setTransportRequests((current) => {
          const existing = current.find((request) => request.orderId === input.orderId);

          if (!existing) {
            return [
              {
                id: uid(),
                orderId: input.orderId,
                driverName: input.driverName,
                vehiclePlate: input.vehiclePlate,
                pickupDetails: input.pickupDetails,
                dropoffDetails: input.dropoffDetails,
                deliveryFee: input.deliveryFee,
                checkpoints: buildRouteCheckpoints(input.pickupDetails, input.dropoffDetails),
                currentCheckpointIndex: 0,
                createdAt: nowDate(),
              },
              ...current,
            ];
          }

          return current.map((request) => {
            if (request.orderId !== input.orderId) return request;

            return {
              ...request,
              driverName: input.driverName,
              vehiclePlate: input.vehiclePlate,
              pickupDetails: input.pickupDetails,
              dropoffDetails: input.dropoffDetails,
              deliveryFee: input.deliveryFee,
              checkpoints: buildRouteCheckpoints(input.pickupDetails, input.dropoffDetails),
              currentCheckpointIndex: 0,
            };
          });
        });
      },
      addChatMessage: (orderId, sender, body) => {
        const cleanBody = body.trim();

        if (!cleanBody) return;

        setChatMessages((current) => [
          {
            id: uid(),
            orderId,
            sender,
            body: cleanBody,
            createdAt: nowDate(),
          },
          ...current,
        ]);
      },
    }),
    [chatMessages, farmerProfile, listings, orders, transportRequests],
  );

  return <AgriContext.Provider value={value}>{children}</AgriContext.Provider>;
}

export const useAgri = () => {
  const context = useContext(AgriContext);

  if (!context) {
    throw new Error('useAgri must be used inside AgriProvider');
  }

  return context;
};
