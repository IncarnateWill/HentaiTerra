'use client';

import { useState, useEffect, useCallback } from "react";
import { Coins, CheckCircle, Clock } from "lucide-react";
import { getTasksAndProgress, claimTask, getUserPoints } from "@/actions/economy.actions";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

export default function PointsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [userPoints, setUserPoints] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isLoaded) return;
    
    if (isSignedIn) {
      const data = await getTasksAndProgress();
      if (data.tasks) setTasks(data.tasks);
      if (data.progress) setUserProgress(data.progress);
      if (data.user) setUserPoints(data.user.points || 0);
    }
    setLoading(false);
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleClaim(task: any) {
    if (!isSignedIn) {
      toast.error('Trebuie să fii autentificat!');
      return;
    }
    setClaiming(task._id);
    
    const res = await claimTask(task._id);
    if (res.success) {
      toast.success('Puncte revendicate cu succes!');
      setUserPoints(res.points!);
      window.dispatchEvent(new CustomEvent("points-updated", { detail: { points: res.points } }));
      await loadData(); // reload progress
    } else {
      toast.error(res.error || 'Eroare la revendicare');
    }
    setClaiming(null);
  }

  function isTaskCompleted(task: any) {
    const progress = userProgress.find((p: any) => p.taskId === task._id);
    if (!progress) return false;
    if (task.taskType === "watch_episodes") {
      return (progress.progress || 0) >= (task.requiredEpisodes || 1);
    }
    return !!progress.completed;
  }

  // Filter out premium AnimeDemons tasks per user request, only show regular tasks
  const regularTasks = tasks.filter(t => !t.premium);
  const completedCount = regularTasks.filter(t => isTaskCompleted(t)).length;

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-3xl md:text-4xl text-foreground tracking-wider">PUNCTE SI TASKURI</h1>
          <p className="text-muted-foreground">Completeaza taskurile si castiga puncte bonus!</p>
        </div>

        {/* Points Card */}
        {isSignedIn && (
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center space-y-4">
            <p className="text-muted-foreground text-sm">PUNCTELE TALE</p>
            <div className="flex items-center justify-center gap-3">
              <Coins size={32} className="text-amber-400" />
              <span className="font-heading text-5xl text-foreground">{userPoints}</span>
            </div>
          </div>
        )}

        {!isSignedIn && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
             <p className="text-muted-foreground">Trebuie să fii autentificat pentru a câștiga puncte și a rezolva task-uri.</p>
          </div>
        )}

        {/* Regular Tasks Grid */}
        {isSignedIn && (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-xl text-foreground tracking-wider mb-1">TASKURI ZILEI</h2>
              <p className="text-xs text-muted-foreground">
                {completedCount} / {regularTasks.length} completate
              </p>
            </div>

            {regularTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nu sunt taskuri disponibile momentan
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularTasks.map(task => {
                  const isCompleted = isTaskCompleted(task);
                  const progress = userProgress.find((p: any) => p.taskId === task._id);
                  const currentProgress = progress?.progress || 0;
                  const progressPercent = task.requiredEpisodes ? Math.min((currentProgress / task.requiredEpisodes) * 100, 100) : 0;

                  return (
                    <div
                      key={task._id}
                      className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">{task.title}</h3>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                          )}
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ml-2 ${
                            isCompleted
                              ? "bg-green-500/20 text-green-400"
                              : "bg-primary/20 text-primary"
                          }`}
                        >
                          +{task.points}
                        </span>
                      </div>

                      {task.requiredEpisodes && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{currentProgress} / {task.requiredEpisodes} episoade</span>
                            <span>{Math.round(progressPercent)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {isCompleted ? (
                            <>
                              <CheckCircle size={14} className="text-green-400" />
                              <span>Completat</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} />
                              <span className="capitalize">{task.difficulty || "easy"}</span>
                            </>
                          )}
                        </div>

                        {!isCompleted && !task.requiredEpisodes && (
                          <button
                            onClick={() => handleClaim(task)}
                            disabled={claiming === task._id}
                            className="text-xs px-3 py-1.5 rounded bg-primary/30 text-primary hover:bg-primary/40 font-semibold transition-colors disabled:opacity-50"
                          >
                            {claiming === task._id ? "..." : "Revendica"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
