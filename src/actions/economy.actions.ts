'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { User, Task, UserTaskProgress, ShopPrice, Card, UserCard, WatchHistory, Episode, Rank, Lootbox } from '@/models';
import { auth } from '@clerk/nextjs/server';
import moment from 'moment-timezone';

export async function getUserPoints() {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const user = await User.findOne({ clerkId }).populate('rankId');
        if (!user) return { error: 'User not found' };

        return { points: user.points || 0, user: JSON.parse(JSON.stringify(user)) };
    } catch (error) {
        console.error('Error getting points:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function getTasksAndProgress() {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const user = await User.findOne({ clerkId }).populate('rankId');
        if (!user) return { error: 'User not found' };

        const tasks = await Task.find({ active: true }).sort({ createdAt: -1 });
        let progress = await UserTaskProgress.find({ userId: user._id });

        // Evaluate and reset recurring missions based on Europe/Bucharest timezone
        const now = moment().tz('Europe/Bucharest');
        let needsSave = false;

        for (let p of progress) {
            const task = tasks.find(t => t._id.toString() === p.taskId.toString());
            if (!task || !task.recurrence || task.recurrence === 'none') continue;
            
            const lastUpdated = moment(p.updatedAt).tz('Europe/Bucharest');
            let shouldReset = false;

            if (task.recurrence === 'daily') {
                if (now.clone().startOf('day').isAfter(lastUpdated)) shouldReset = true;
            } else if (task.recurrence === 'weekly') {
                if (now.clone().startOf('isoWeek').isAfter(lastUpdated)) shouldReset = true; // isoWeek starts on Monday
            } else if (task.recurrence === 'monthly') {
                if (now.clone().startOf('month').isAfter(lastUpdated)) shouldReset = true;
            }

            if (shouldReset) {
                p.completed = false;
                p.progress = 0;
                p.completedDate = null;
                p.updatedAt = new Date();
                await p.save();
                needsSave = true;
            }
        }

        if (needsSave) {
            progress = await UserTaskProgress.find({ userId: user._id });
        }

        return { tasks: JSON.parse(JSON.stringify(tasks)), progress: JSON.parse(JSON.stringify(progress)), user: JSON.parse(JSON.stringify(user)) };
    } catch (error) {
        console.error('Error getting tasks:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function claimTask(taskId: string) {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const user = await User.findOne({ clerkId });
        if (!user) return { error: 'User not found' };

        const task = await Task.findById(taskId);
        if (!task || !task.active) return { error: 'Task not found or inactive' };

        const existingProgress = await UserTaskProgress.findOne({ userId: user._id, taskId: task._id });

        if (!existingProgress) {
            await UserTaskProgress.create({
                userId: user._id,
                taskId: task._id,
                completed: true,
                completedDate: new Date(),
                progress: task.taskType === 'watch_episodes' ? 0 : 1
            });

            const newPoints = (user.points || 0) + task.points;
            user.points = newPoints;
            await user.save();

            return { success: true, points: newPoints };
        } else {
            return { error: 'Task already claimed or in progress' };
        }

    } catch (error) {
        console.error('Error claiming task:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function getShopData() {
    try {
        await connectToDatabase();
        
        const shopPrices = await ShopPrice.find().sort({ createdAt: -1 });
        const cards = await Card.find();
        const ranks = await Rank.find().sort({ requiredPoints: 1 });
        const lootboxes = await Lootbox.find({ active: true }).sort({ pricePoints: 1, priceMoney: 1 });

        return { 
            shopPrices: JSON.parse(JSON.stringify(shopPrices)), 
            cards: JSON.parse(JSON.stringify(cards)),
            ranks: JSON.parse(JSON.stringify(ranks)),
            lootboxes: JSON.parse(JSON.stringify(lootboxes))
        };
    } catch (error) {
        console.error('Error getting shop data:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function buyChest(rarity: 'simple' | 'bune' | 'epic' | 'legendar', costPoints: number) {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const user = await User.findOne({ clerkId });
        if (!user) return { error: 'User not found' };

        if ((user.points || 0) < costPoints) {
            return { error: 'Not enough points' };
        }

        const cardsOfRarity = await Card.find({ rarity });
        if (!cardsOfRarity || cardsOfRarity.length === 0) {
            return { error: 'No cards available for this rarity' };
        }

        const wonCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];

        // Deduct points and save
        const newPoints = (user.points || 0) - costPoints;
        user.points = newPoints;
        await user.save();

        await UserCard.create({
            userId: user._id,
            cardId: wonCard._id,
        });

        return { success: true, wonCard: JSON.parse(JSON.stringify(wonCard)), newPoints };
    } catch (error) {
        console.error('Error buying chest:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function buyLootbox(lootboxId: string) {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const user = await User.findOne({ clerkId });
        if (!user) return { error: 'User not found' };

        const lootbox = await Lootbox.findById(lootboxId);
        if (!lootbox || !lootbox.active) return { error: 'Lootbox not found or inactive' };

        if (!lootbox.pricePoints && !lootbox.priceMoney) {
            return { error: 'Invalid lootbox price' };
        }

        if (lootbox.pricePoints && (user.points || 0) < lootbox.pricePoints) {
            return { error: 'Not enough points' };
        }

        const wonCards = [];
        const cardsCount = lootbox.cardsCount || 1;

        for (let i = 0; i < cardsCount; i++) {
            // Determine rarity based on percentages
            const rand = Math.random() * 100;
            let current = 0;
            let selectedRarity = 'simple'; // fallback

            for (const r of lootbox.rarities) {
                current += r.chance;
                if (rand <= current) {
                    selectedRarity = r.rarity;
                    break;
                }
            }

            const cardsOfRarity = await Card.find({ rarity: selectedRarity });
            if (cardsOfRarity && cardsOfRarity.length > 0) {
                const wonCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
                wonCards.push(wonCard);
                await UserCard.create({
                    userId: user._id,
                    cardId: wonCard._id,
                });
            }
        }

        if (wonCards.length === 0) {
            return { error: 'No cards available to draw' };
        }

        // Deduct points and save
        if (lootbox.pricePoints) {
            user.points = (user.points || 0) - lootbox.pricePoints;
            await user.save();
        }

        return { 
            success: true, 
            wonCard: JSON.parse(JSON.stringify(wonCards[0])), // For backwards compatibility UI
            wonCards: JSON.parse(JSON.stringify(wonCards)), 
            newPoints: user.points 
        };
    } catch (error) {
        console.error('Error buying lootbox:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function awardWatchPoints(episodeId: string, watchTimeSeconds: number, pointsToAdd: number, historyId?: string) {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const user = await User.findOne({ clerkId });
        if (!user) return { error: 'User not found' };

        const episode = await Episode.findOne({ episodeId: episodeId }); // episodeId is the string ID in URL
        if (!episode) return { error: 'Episode not found' };

        let watchHistory;
        if (historyId) {
            watchHistory = await WatchHistory.findById(historyId);
        } else {
            watchHistory = await WatchHistory.findOne({ userId: user._id, episodeId: episode._id });
        }

        if (!watchHistory) {
            watchHistory = await WatchHistory.create({
                userId: user._id,
                episodeId: episode._id,
                watchTimeSeconds: watchTimeSeconds,
                pointsEarned: pointsToAdd
            });
        } else {
            watchHistory.watchTimeSeconds = watchTimeSeconds;
            watchHistory.pointsEarned = (watchHistory.pointsEarned || 0) + pointsToAdd;
            await watchHistory.save();
        }

        user.points = (user.points || 0) + pointsToAdd;
        await user.save();

        // Check Watch Episode Tasks
        const allTasks = await Task.find({ taskType: 'watch_episodes', active: true });
        const userProgresses = await UserTaskProgress.find({ userId: user._id });
        
        const totalEpisodesWatched = await WatchHistory.countDocuments({ userId: user._id }); // number of unique episodes started watching

        for (const task of allTasks) {
            const existingProgress = userProgresses.find(p => p.taskId.toString() === task._id.toString());

            if (existingProgress && !existingProgress.completed) {
                if (totalEpisodesWatched >= (task.requiredEpisodes || 1)) {
                    existingProgress.completed = true;
                    existingProgress.completedDate = new Date();
                    existingProgress.progress = totalEpisodesWatched;
                    await existingProgress.save();

                    user.points = (user.points || 0) + task.points;
                    await user.save();
                } else {
                    existingProgress.progress = totalEpisodesWatched;
                    await existingProgress.save();
                }
            } else if (!existingProgress && totalEpisodesWatched > 0) {
                const completed = totalEpisodesWatched >= (task.requiredEpisodes || 1);
                await UserTaskProgress.create({
                    userId: user._id,
                    taskId: task._id,
                    completed: completed,
                    completedDate: completed ? new Date() : null,
                    progress: totalEpisodesWatched
                });
                
                if (completed) {
                    user.points = (user.points || 0) + task.points;
                    await user.save();
                }
            }
        }

        return { success: true, points: user.points, historyId: watchHistory._id.toString() };
    } catch (error) {
        console.error('Error awarding watch points:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function syncWatchTime(episodeId: string, watchTimeSeconds: number, historyId?: string) {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const user = await User.findOne({ clerkId });
        if (!user) return { error: 'User not found' };

        const episode = await Episode.findOne({ episodeId: episodeId });
        if (!episode) return { error: 'Episode not found' };

        let watchHistory;
        if (historyId) {
            watchHistory = await WatchHistory.findById(historyId);
        } else {
            watchHistory = await WatchHistory.findOne({ userId: user._id, episodeId: episode._id });
        }

        if (!watchHistory) {
            watchHistory = await WatchHistory.create({
                userId: user._id,
                episodeId: episode._id,
                watchTimeSeconds: watchTimeSeconds,
                pointsEarned: 0
            });
        } else {
            if (watchTimeSeconds > watchHistory.watchTimeSeconds) {
                watchHistory.watchTimeSeconds = watchTimeSeconds;
                await watchHistory.save();
            }
        }

        // Check Watch Episode Tasks (same as awardWatchPoints)
        const allTasks = await Task.find({ taskType: 'watch_episodes', active: true });
        const userProgresses = await UserTaskProgress.find({ userId: user._id });
        
        const totalEpisodesWatched = await WatchHistory.countDocuments({ userId: user._id }); 

        for (const task of allTasks) {
            const existingProgress = userProgresses.find(p => p.taskId.toString() === task._id.toString());

            if (existingProgress && !existingProgress.completed) {
                if (totalEpisodesWatched >= (task.requiredEpisodes || 1)) {
                    existingProgress.completed = true;
                    existingProgress.completedDate = new Date();
                    existingProgress.progress = totalEpisodesWatched;
                    await existingProgress.save();

                    user.points = (user.points || 0) + task.points;
                    await user.save();
                } else {
                    existingProgress.progress = totalEpisodesWatched;
                    await existingProgress.save();
                }
            } else if (!existingProgress && totalEpisodesWatched > 0) {
                const completed = totalEpisodesWatched >= (task.requiredEpisodes || 1);
                await UserTaskProgress.create({
                    userId: user._id,
                    taskId: task._id,
                    completed: completed,
                    completedDate: completed ? new Date() : null,
                    progress: totalEpisodesWatched
                });
                
                if (completed) {
                    user.points = (user.points || 0) + task.points;
                    await user.save();
                }
            }
        }

        return { success: true, historyId: watchHistory._id.toString(), newPoints: user.points };
    } catch (error) {
        console.error('Error syncing watch time:', error);
        return { error: 'Internal Server Error' };
    }
}

export async function getProfileEconomyData(username: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ username }).populate('rankId');
        if (!user) return { error: 'User not found' };

        const allRanks = await Rank.find().sort({ requiredPoints: -1 });
        let currentRank = user.rankId;
        
        if (!currentRank) {
            currentRank = allRanks.find(r => !r.isPremium && user.points >= (r.requiredPoints || 0));
        }

        const watchHistory = await WatchHistory.find({ userId: user._id })
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate({ path: 'episodeId', populate: { path: 'animeId' } });

        const userCards = await UserCard.find({ userId: user._id })
            .populate('cardId');
            
        // Also fetch tasks and progress for profile display
        const tasksRes = await getTasksAndProgress();
        const tasks = tasksRes.tasks || [];
        const progress = tasksRes.progress || [];

        return { 
            rank: JSON.parse(JSON.stringify(currentRank || null)),
            watchHistory: JSON.parse(JSON.stringify(watchHistory)),
            userCards: JSON.parse(JSON.stringify(userCards)),
            tasks,
            progress
        };
    } catch (e) {
        console.error('Error getting profile economy data:', e);
        return { error: 'Internal Server Error' };
    }
}

export async function toggleShowcaseCard(userCardId: string, showcase: boolean) {
    try {
        await connectToDatabase();
        const { userId: clerkId } = await auth();
        if (!clerkId) return { error: 'Unauthorized' };

        const user = await User.findOne({ clerkId });
        if (!user) return { error: 'User not found' };

        if (showcase) {
            // Check if already showcasing 5
            const count = await UserCard.countDocuments({ userId: user._id, isShowcased: true });
            if (count >= 5) return { error: 'Limita de 5 cartonașe atinsă' };
        }

        await UserCard.findOneAndUpdate(
            { _id: userCardId, userId: user._id },
            { isShowcased: showcase }
        );

        return { success: true };
    } catch (e) {
        console.error('Error toggling showcase:', e);
        return { error: 'Internal Server Error' };
    }
}
