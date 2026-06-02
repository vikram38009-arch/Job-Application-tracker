// src/components/JobKanbanBoard.tsx
import React, { useState } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Edit, 
  Trash2, 
  Briefcase, 
  MapPin, 
  MoveRight,
  AlertCircle,
  Brain
} from 'lucide-react';
import { JobApplication, JobStatus } from '../types';

const DroppableAny = Droppable as any;
const DraggableAny = Draggable as any;

interface JobKanbanBoardProps {
  applications: JobApplication[];
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  setToast: (toast: { message: string; type: 'success' | 'info' | 'error' } | null) => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  backendUrl: string;
  onAnalyze?: (app: JobApplication) => void;
}

const COLUMNS: { id: JobStatus; title: string; color: string; bg: string; border: string; iconSrc: React.ReactNode }[] = [
  { 
    id: 'APPLIED', 
    title: 'Applied', 
    color: 'text-sky-400',
    bg: 'bg-sky-500/5',
    border: 'border-t-sky-500',
    iconSrc: <Clock className="w-4 h-4 text-sky-400" />
  },
  { 
    id: 'INTERVIEW', 
    title: 'Interview', 
    color: 'text-amber-400',
    bg: 'bg-amber-500/5',
    border: 'border-t-amber-500',
    iconSrc: <TrendingUp className="w-4 h-4 text-amber-400 animate-pulse" />
  },
  { 
    id: 'OFFER', 
    title: 'Offer Received', 
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/5',
    border: 'border-t-emerald-500',
    iconSrc: <CheckCircle className="w-4 h-4 text-emerald-400" />
  },
  { 
    id: 'REJECTED', 
    title: 'Archived / Rejected', 
    color: 'text-rose-400',
    bg: 'bg-rose-500/5',
    border: 'border-t-rose-500',
    iconSrc: <XCircle className="w-4 h-4 text-rose-400" />
  }
];

export default function JobKanbanBoard({ 
  applications, 
  setApplications, 
  setToast, 
  onEdit, 
  onDelete,
  backendUrl,
  onAnalyze
}: JobKanbanBoardProps) {

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same spot
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const jobToMove = applications.find(app => String(app.id) === String(draggableId));
    if (!jobToMove) return;

    const oldStatus = jobToMove.status;
    const newStatus = destination.droppableId as JobStatus;

    if (oldStatus === newStatus) return;

    // --- OPTIMISTIC UPDATE ---
    // Instantly modify state so card appears moved
    setApplications(prev => 
      prev.map(app => 
        String(app.id) === String(draggableId) 
          ? { ...app, status: newStatus } 
          : app
      )
    );

    // Notify user of immediate transition feedback
    setToast({ 
      message: `Moving "${jobToMove.company}" to ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}...`, 
      type: 'info' 
    });

    // --- BACKEND SYNC ---
    try {
      const response = await fetch(`${backendUrl}${draggableId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedFromDb = await response.json();
        
        // Sync correct parameters from database returned row
        setApplications(prev => 
          prev.map(app => 
            String(app.id) === String(draggableId) 
              ? updatedFromDb 
              : app
          )
        );

        setToast({ 
          message: `Successfully migrated "${jobToMove.company}" to ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}!`, 
          type: 'success' 
        });
      } else {
        throw new Error('Database server rejected request');
      }
    } catch (err) {
      console.error("Migration error during optimistic drag:", err);
      
      // --- ROLLBACK IN CASE OF FAILURE ---
      setApplications(prev => 
        prev.map(app => 
          String(app.id) === String(draggableId) 
            ? { ...app, status: oldStatus } 
            : app
        )
      );

      setToast({ 
        message: `Failed to move application on the database. Connection error.`, 
        type: 'error' 
      });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start pb-6 select-none" id="kanban-board-workspace">
        {COLUMNS.map((col) => {
          // Filter applications belongs to this status column
          const colApps = applications.filter(app => app.status === col.id);

          return (
            <div 
              key={col.id} 
              className={`bg-slate-900/30 rounded-2xl border-t-4 ${col.border} border-x border-b border-slate-800/80 p-4 shadow-sm flex flex-col gap-4 min-h-[500px] h-full relative overflow-hidden`}
              id={`col-${col.id}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between font-sans pb-2 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  {col.iconSrc}
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    {col.title}
                  </h4>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${col.color} bg-slate-800/80 border border-slate-700/60`}>
                  {colApps.length}
                </span>
              </div>

              {/* Column Contents list */}
              <DroppableAny droppableId={col.id}>
                {(provided: any, snapshot: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-col gap-3 min-h-[420px] rounded-xl transition-all ${
                      snapshot.isDraggingOver 
                        ? 'bg-[#0f172a]/40 scale-[0.99] border-2 border-dashed border-indigo-550/30' 
                        : ''
                    }`}
                  >
                    {colApps.length > 0 ? (
                      colApps.map((app, index) => (
                        <DraggableAny 
                          key={String(app.id)} 
                          draggableId={String(app.id)} 
                          index={index}
                        >
                          {(dragProvided: any, dragSnapshot: any) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              style={{
                                ...dragProvided.draggableProps.style
                              }}
                              className={`bg-[#0a0f1d] border rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 hover:shadow-lg transition-all text-left relative group duration-200 ${
                                dragSnapshot.isDragging 
                                  ? 'ring-2 ring-indigo-500/80 scale-[1.03] border-indigo-500/60 shadow-2xl z-50 bg-[#121a30]' 
                                  : 'border-slate-800/90'
                              }`}
                            >
                              {/* Header info */}
                              <div>
                                <div className="flex justify-between items-start gap-1">
                                  <h5 className="font-extrabold text-white text-sm leading-snug truncate">
                                    {app.company}
                                  </h5>
                                  {/* Actions strip */}
                                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => onAnalyze && onAnalyze(app)}
                                      className="p-1 rounded-md text-indigo-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                                      title="Run Smart Fit Analysis"
                                    >
                                      <Brain className="w-3.5 h-3.5 text-indigo-400" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onEdit(app)}
                                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                                      title="Edit job parameters"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDelete(app.id)}
                                      className="p-1 rounded-md text-slate-500 hover:text-rose-450 hover:bg-rose-950/20 transition cursor-pointer"
                                      title="Delete job application"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-slate-400 text-xs font-semibold truncate mt-0.5">
                                  {app.role}
                                </p>
                              </div>

                              {/* Small Notes clip */}
                              {app.notes ? (
                                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 h-[34px] border-l border-slate-800 pl-2 leading-relaxed whitespace-normal break-words">
                                  {app.notes}
                                </p>
                              ) : (
                                <div className="h-[34px] mt-2 block" />
                              )}

                              {/* Footer details info line */}
                              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-850/50">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 font-mono">
                                  <Calendar className="w-3 h-3 text-indigo-400/80" />
                                  <span>{app.date_applied || "Active"}</span>
                                </div>
                                <span className="bg-slate-800/80 text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-sans select-none font-bold">
                                  {app.source || "Direct"}
                                </span>
                              </div>
                            </div>
                          )}
                        </DraggableAny>
                      ))
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-850/60 rounded-xl p-4 gap-2 text-center select-none py-12">
                        <div className="bg-slate-850/40 p-2.5 rounded-xl border border-slate-800 text-slate-500">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                          Empty column
                        </span>
                        <p className="text-[9px] text-slate-600 max-w-[120px] leading-relaxed">
                          Drag and drop job applications here to change status
                        </p>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </DroppableAny>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
