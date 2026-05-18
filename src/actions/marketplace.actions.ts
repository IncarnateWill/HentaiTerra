'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { User, UserCard, MarketplaceListing } from '@/models';
import { auth } from '@clerk/nextjs/server';

export async function getMarketplaceListings() {
    try {
        await connectToDatabase();
        
        const listings = await MarketplaceListing.find({ active: true })
            .sort({ createdAt: -1 })
            .populate('sellerId', 'username email imageUrl clerkId')
            .populate({
                path: 'userCardId',
                populate: { path: 'cardId' }
            });

        return { listings: JSON.parse(JSON.stringify(listings)) };
    } catch (error) {
        console.error('Error getting marketplace listings:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function createListing(userCardId: string, pricePoints: number) {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const user = await User.findOne({ clerkId });
        if (!user) return { error: 'User not found' };

        const userCard = await UserCard.findOne({ _id: userCardId, userId: user._id });
        if (!userCard) return { error: 'Card not found or does not belong to you' };

        // Check if already listed
        const existingListing = await MarketplaceListing.findOne({ userCardId, active: true });
        if (existingListing) return { error: 'Card is already listed' };

        await MarketplaceListing.create({
            sellerId: user._id,
            userCardId: userCard._id,
            pricePoints,
            active: true
        });

        return { success: true };
    } catch (error) {
        console.error('Error creating listing:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function buyListing(listingId: string) {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const buyer = await User.findOne({ clerkId });
        if (!buyer) return { error: 'Buyer not found' };

        const listing = await MarketplaceListing.findById(listingId).populate('userCardId');
        if (!listing || !listing.active) return { error: 'Listing not available' };

        if (listing.sellerId.toString() === buyer._id.toString()) {
            return { error: 'Cannot buy your own listing' };
        }

        if ((buyer.points || 0) < listing.pricePoints) {
            return { error: 'Not enough points' };
        }

        const seller = await User.findById(listing.sellerId);
        if (!seller) {
            return { error: 'Seller not found' };
        }

        const userCard = await UserCard.findById(listing.userCardId);
        if (!userCard) return { error: 'Card not found' };

        // Transaction logic: 
        // 1. Deduct points from buyer
        buyer.points = (buyer.points || 0) - listing.pricePoints;
        await buyer.save();

        // 2. Add points to seller
        seller.points = (seller.points || 0) + listing.pricePoints;
        await seller.save();

        // 3. Transfer card ownership
        userCard.userId = buyer._id;
        await userCard.save();

        // 4. Mark listing as inactive
        listing.active = false;
        await listing.save();

        return { success: true, newPoints: buyer.points };
    } catch (error) {
        console.error('Error buying listing:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function cancelListing(listingId: string) {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const user = await User.findOne({ clerkId });
        if (!user) return { error: 'User not found' };

        const listing = await MarketplaceListing.findOne({ _id: listingId, sellerId: user._id, active: true });
        if (!listing) return { error: 'Listing not found or not yours' };

        listing.active = false;
        await listing.save();

        return { success: true };
    } catch (error) {
        console.error('Error cancelling listing:', error);
        return { error: 'Internal Server Error' };
    }
}
