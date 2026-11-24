import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { CheckCircle, Clock, Sparkles } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

export default function Worker() {
  const { user, isWorker, isAdmin } = useAuth();
  const { rooms, tasks, markRoomReady, completeTask } = useHotel();

  if (!user) return <Navigate to="/login" replace />;
  if (!isWorker && !isAdmin) return <Navigate to="/" replace />;

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const roomsNeedingCare = rooms.filter((r) => r.needs_cleaning || !r.is_available);

  async function handleMarkReady(roomId: string, taskId?: string) {
    await markRoomReady(roomId);
    if (taskId) await completeTask(taskId);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12 pb-24">
      <h1 className="section-title mb-2">Worker Panel</h1>
      <p className="text-gray-500 mb-8">Hello, {user.full_name} — manage room readiness</p>

      {/* Rooms needing attention */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-terracotta-500" />
          Rooms to Prepare
        </h2>

        {roomsNeedingCare.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            All rooms are ready. Great work!
          </div>
        ) : (
          <div className="space-y-3">
            {roomsNeedingCare.map((room) => (
              <div key={room.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-full sm:w-28 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{room.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{room.type} · Floor {room.floor}</p>
                  <span className={cn(
                    'badge mt-1',
                    room.needs_cleaning ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  )}>
                    {room.needs_cleaning ? 'Needs cleaning / prep' : 'Unavailable'}
                  </span>
                </div>
                <button
                  onClick={() => handleMarkReady(room.id)}
                  className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Ready & Available
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Task list */}
      <section>
        <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-terracotta-500" />
          Assigned Tasks
        </h2>

        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No tasks assigned yet</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => {
              const room = rooms.find((r) => r.id === t.room_id);
              return (
                <div
                  key={t.id}
                  className={cn(
                    'card p-4 flex items-center justify-between gap-3',
                    t.status === 'completed' && 'opacity-60'
                  )}
                >
                  <div>
                    <p className="font-medium capitalize">
                      {t.type} — {room?.name || t.room_id}
                    </p>
                    {t.notes && <p className="text-sm text-gray-500">{t.notes}</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(t.created_at)}</p>
                  </div>
                  {t.status !== 'completed' ? (
                    <button
                      onClick={() => handleMarkReady(t.room_id, t.id)}
                      className="btn-primary text-sm py-1.5 px-3"
                    >
                      Complete
                    </button>
                  ) : (
                    <span className="badge bg-green-100 text-green-700">Done</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
