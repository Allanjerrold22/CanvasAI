"use client";

import { useState, useMemo } from "react";
import {
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  Plus as PlusIcon,
  X as XIcon,
  Clock as ClockIcon,
  Trash as TrashIcon,
} from "@phosphor-icons/react/dist/ssr";
import PageHeader from "@/components/PageHeader";
import { courses } from "@/lib/courses";
import { CalendarEvent, loadEventsFromStorage, saveEventsToStorage } from "@/lib/calendar-store";

// ── Types ──

type ViewMode = "month" | "week" | "day";

type ViewMode = "month" | "week" | "day";

// ── Helpers ──

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getWeekDates(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// ── Seed events from course assignments ──

function buildCourseEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const course of courses) {
    if (!course.assignments) continue;
    for (const a of course.assignments) {
      // Parse due dates like "Due Apr 28, 11:59 PM" or "Submitted Mar 10"
      const dateMatch = a.dueDate.match(
        /(?:Due|Submitted|Overdue\s*—?\s*)\s*(\w+\s+\d+)/i
      );
      if (dateMatch) {
        const parsed = new Date(`${dateMatch[1]}, 2026`);
        if (!isNaN(parsed.getTime())) {
          events.push({
            id: a.id,
            title: `${course.code}: ${a.title}`,
            date: parsed,
            color: course.accent,
            type: "assignment",
          });
        }
      }
    }
  }

  // Add some recurring lecture events
  const lectureEvents: { title: string; color: string; dayOfWeek: number }[] = [
    { title: "CSE 310 Lecture", color: "#8C1D40", dayOfWeek: 1 },
    { title: "CSE 310 Lecture", color: "#8C1D40", dayOfWeek: 3 },
    { title: "DES 301 Studio", color: "#C2410C", dayOfWeek: 2 },
    { title: "MAT 267 Lecture", color: "#334155", dayOfWeek: 2 },
    { title: "MAT 267 Lecture", color: "#334155", dayOfWeek: 4 },
  ];

  // Generate lectures for April 2026
  for (let day = 1; day <= 30; day++) {
    const date = new Date(2026, 3, day);
    for (const lec of lectureEvents) {
      if (date.getDay() === lec.dayOfWeek) {
        events.push({
          id: `lec-${lec.title}-${day}`,
          title: lec.title,
          date,
          color: lec.color,
          type: "lecture",
        });
      }
    }
  }

  return events;
}

function initializeEvents(): CalendarEvent[] {
  const courseEvents = buildCourseEvents();
  const storedEvents = loadEventsFromStorage();
  
  // Merge: stored events override course events with same ID
  const eventMap = new Map<string, CalendarEvent>();
  courseEvents.forEach(e => eventMap.set(e.id, e));
  storedEvents.forEach(e => eventMap.set(e.id, e));
  
  return Array.from(eventMap.values());
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

// ── Component ──

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(initializeEvents);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventColor, setNewEventColor] = useState("#8C1D40");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState<CalendarEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Save to localStorage whenever events change
  const updateEvents = (newEvents: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => {
    setEvents((prev) => {
      const updated = typeof newEvents === "function" ? newEvents(prev) : newEvents;
      saveEventsToStorage(updated);
      return updated;
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  function goNext() {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === "week") {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
    }
  }

  function goPrev() {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === "week") {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
    }
  }

  function goToday() {
    setCurrentDate(new Date(2026, 3, 15)); // Mid-April 2026 for demo
  }

  // Events for a specific date
  function eventsForDate(date: Date): CalendarEvent[] {
    return events.filter((e) => isSameDay(e.date, date));
  }

  // Add event
  function addEvent() {
    if (!newEventTitle.trim() || !selectedDate) return;
    const event: CalendarEvent = {
      id: `custom-${Date.now()}`,
      title: newEventTitle.trim(),
      date: selectedDate,
      color: newEventColor,
      type: "custom",
    };
    updateEvents((prev) => [...prev, event]);
    setNewEventTitle("");
    setShowNewEvent(false);
    setSelectedDate(null);
  }

  function updateEvent() {
    if (!editingEvent || !newEventTitle.trim() || !selectedDate) return;
    updateEvents((prev) =>
      prev.map((e) =>
        e.id === editingEvent.id
          ? { ...e, title: newEventTitle.trim(), date: selectedDate, color: newEventColor }
          : e
      )
    );
    setNewEventTitle("");
    setEditingEvent(null);
    setSelectedDate(null);
    setShowEventDetails(null);
  }

  function deleteEvent(id: string) {
    updateEvents((prev) => prev.filter((e) => e.id !== id));
    setShowDeleteConfirm(null);
    setShowEventDetails(null);
  }

  function openEditModal(event: CalendarEvent) {
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setSelectedDate(event.date);
    setNewEventColor(event.color);
    setShowEventDetails(null);
  }

  // Month grid
  const monthCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells: (Date | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  // Week dates
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // Header label
  const headerLabel =
    viewMode === "month"
      ? formatMonthYear(currentDate)
      : viewMode === "week"
        ? `${weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
        : currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });

  const EVENT_COLORS = [
    "#8C1D40", "#1F2937", "#0F766E", "#6B21A8", "#C2410C", "#334155", "#1D4ED8",
  ];

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Calendar"
        subtitle="Lectures, deadlines, and study sessions — all in one place."
        action={
          <button
            type="button"
            onClick={() => {
              setSelectedDate(currentDate);
              setShowNewEvent(true);
            }}
            className="inline-flex items-center gap-2 bg-ink text-white text-[13px] font-medium px-4 py-2 rounded-full hover:bg-ink/90 transition-colors"
          >
            <PlusIcon size={14} weight="bold" />
            New event
          </button>
        }
      />

      <div className="mt-8 bg-surface border border-ink-border rounded-2xl shadow-subtle overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-border">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              className="w-8 h-8 grid place-items-center rounded-md text-ink-muted hover:bg-surface-muted transition-colors"
            >
              <CaretLeftIcon size={16} />
            </button>
            <div className="text-[14px] font-semibold min-w-[180px] text-center">
              {headerLabel}
            </div>
            <button
              onClick={goNext}
              className="w-8 h-8 grid place-items-center rounded-md text-ink-muted hover:bg-surface-muted transition-colors"
            >
              <CaretRightIcon size={16} />
            </button>
            <button
              onClick={goToday}
              className="ml-2 text-[12px] font-medium text-[var(--brand)] hover:underline"
            >
              Today
            </button>
          </div>
          <div className="inline-flex items-center gap-1 p-1 bg-surface-muted rounded-full text-[12.5px]">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={
                  viewMode === v
                    ? "px-3 py-1 rounded-full bg-[var(--brand-tint)] text-[var(--brand)] font-medium"
                    : "px-3 py-1 rounded-full text-ink-muted hover:text-ink transition-colors"
                }
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Month View ── */}
        {viewMode === "month" && (
          <>
            <div className="grid grid-cols-7 border-b border-ink-border bg-surface-muted/60">
              {WEEK_DAYS.map((d) => (
                <div
                  key={d}
                  className="px-3 py-2 text-[11px] uppercase tracking-[0.06em] text-ink-subtle font-medium"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthCells.map((date, idx) => {
                const dayEvents = date ? eventsForDate(date) : [];
                const isToday = date && isSameDay(date, today);
                return (
                  <div
                    key={idx}
                    className={`min-h-[108px] border-r border-b border-ink-border last:border-r-0 p-2 transition-colors cursor-pointer ${
                      date ? "hover:bg-[var(--brand-tint)]/40" : "bg-surface-muted/30"
                    }`}
                    onClick={() => {
                      if (date) {
                        setSelectedDate(date);
                        setShowNewEvent(true);
                      }
                    }}
                  >
                    {date && (
                      <>
                        <div
                          className={`text-[12px] font-medium ${
                            isToday
                              ? "w-6 h-6 rounded-full bg-[var(--brand)] text-white grid place-items-center"
                              : "text-ink-muted"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="mt-1 flex flex-col gap-0.5">
                          {dayEvents.slice(0, 3).map((e) => (
                            <div
                              key={e.id}
                              className="text-[10.5px] px-1.5 py-0.5 rounded-md text-white truncate cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: e.color }}
                              title={e.title}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setShowEventDetails(e);
                              }}
                            >
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[10px] text-ink-muted pl-1">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Week View ── */}
        {viewMode === "week" && (
          <>
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-ink-border bg-surface-muted/60">
              <div />
              {weekDates.map((d, i) => (
                <div key={i} className="px-2 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-ink-subtle">
                    {WEEK_DAYS[i]}
                  </div>
                  <div
                    className={`text-[14px] font-semibold mt-0.5 ${
                      isSameDay(d, today)
                        ? "w-7 h-7 rounded-full bg-[var(--brand)] text-white grid place-items-center mx-auto"
                        : "text-ink"
                    }`}
                  >
                    {d.getDate()}
                  </div>
                </div>
              ))}
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-ink-border/50 min-h-[48px]"
                >
                  <div className="text-[10px] text-ink-subtle font-medium px-2 py-1 text-right pr-3">
                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                  </div>
                  {weekDates.map((d, i) => {
                    const dayEvents = eventsForDate(d);
                    return (
                      <div
                        key={i}
                        className="border-l border-ink-border/30 px-1 py-0.5 hover:bg-[var(--brand-tint)]/30 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedDate(d);
                          setShowNewEvent(true);
                        }}
                      >
                        {hour === 9 &&
                          dayEvents.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              className="text-[10px] px-1 py-0.5 rounded text-white truncate mb-0.5 cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: e.color }}
                              title={e.title}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setShowEventDetails(e);
                              }}
                            >
                              {e.title}
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Day View ── */}
        {viewMode === "day" && (
          <div className="max-h-[600px] overflow-y-auto">
            {HOURS.map((hour) => {
              const dayEvents = eventsForDate(currentDate).filter(
                () => hour === 9 || hour === 14
              );
              return (
                <div
                  key={hour}
                  className="grid grid-cols-[80px_1fr] border-b border-ink-border/50 min-h-[56px] hover:bg-[var(--brand-tint)]/20 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedDate(currentDate);
                    setShowNewEvent(true);
                  }}
                >
                  <div className="text-[11px] text-ink-subtle font-medium px-3 py-2 text-right border-r border-ink-border/30">
                    {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? "12:00 PM" : `${hour}:00 AM`}
                  </div>
                  <div className="px-3 py-1">
                    {hour === 9 &&
                      eventsForDate(currentDate).map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center gap-2 text-[12px] px-2 py-1.5 rounded-lg text-white mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: e.color }}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setShowEventDetails(e);
                          }}
                        >
                          <span className="flex-1 truncate">{e.title}</span>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── New/Edit Event Modal ── */}
      {(showNewEvent || editingEvent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-ink-border/30 w-full max-w-sm mx-4 overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-border/30">
              <h3 className="text-[15px] font-semibold">
                {editingEvent ? "Edit Event" : "New Event"}
              </h3>
              <button
                onClick={() => {
                  setShowNewEvent(false);
                  setEditingEvent(null);
                  setNewEventTitle("");
                }}
                className="w-7 h-7 grid place-items-center rounded-full hover:bg-surface-muted text-ink-muted"
              >
                <XIcon size={14} />
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              {/* Date */}
              <div>
                <label className="text-[12px] text-ink-muted font-medium block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={
                    selectedDate
                      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
                      : ""
                  }
                  onChange={(e) => setSelectedDate(new Date(e.target.value + "T12:00:00"))}
                  className="w-full px-3 py-2 text-[13px] border border-ink-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-[12px] text-ink-muted font-medium block mb-1">
                  Event title
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Study group, Office hours…"
                  className="w-full px-3 py-2 text-[13px] border border-ink-border rounded-xl bg-surface placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      editingEvent ? updateEvent() : addEvent();
                    }
                  }}
                />
              </div>

              {/* Color */}
              <div>
                <label className="text-[12px] text-ink-muted font-medium block mb-1.5">
                  Color
                </label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewEventColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${
                        newEventColor === c
                          ? "ring-2 ring-offset-2 ring-[var(--brand)] scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-ink-border/20 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewEvent(false);
                  setEditingEvent(null);
                  setNewEventTitle("");
                }}
                className="text-[13px] text-ink-muted hover:text-ink px-3 py-1.5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingEvent ? updateEvent : addEvent}
                disabled={!newEventTitle.trim()}
                className="text-[13px] font-medium bg-ink text-white px-4 py-1.5 rounded-full hover:bg-ink/90 transition-colors disabled:opacity-40"
              >
                {editingEvent ? "Save Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Details Modal ── */}
      {showEventDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-ink-border/30 w-full max-w-sm mx-4 overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-border/30">
              <h3 className="text-[15px] font-semibold">Event Details</h3>
              <button
                onClick={() => setShowEventDetails(null)}
                className="w-7 h-7 grid place-items-center rounded-full hover:bg-surface-muted text-ink-muted"
              >
                <XIcon size={14} />
              </button>
            </div>

            <div className="px-5 py-4">
              <div
                className="w-full px-4 py-3 rounded-xl text-white font-medium mb-4"
                style={{ backgroundColor: showEventDetails.color }}
              >
                {showEventDetails.title}
              </div>

              <div className="flex items-center gap-2 text-[13px] text-ink-muted mb-1">
                <ClockIcon size={16} />
                <span>
                  {showEventDetails.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="text-[12px] text-ink-subtle mt-2 px-2 py-1.5 bg-surface-muted/50 rounded-lg">
                Type: {showEventDetails.type.charAt(0).toUpperCase() + showEventDetails.type.slice(1)}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-ink-border/20 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(showEventDetails.id)}
                className="text-[13px] font-medium text-red-600 hover:text-red-700 px-3 py-1.5 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => openEditModal(showEventDetails)}
                className="text-[13px] font-medium bg-ink text-white px-4 py-1.5 rounded-full hover:bg-ink/90 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-ink-border/30 w-full max-w-sm mx-4 overflow-hidden animate-slideUp">
            <div className="px-5 py-4 border-b border-ink-border/30">
              <h3 className="text-[15px] font-semibold">Delete Event</h3>
            </div>

            <div className="px-5 py-4">
              <p className="text-[13px] text-ink-muted">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
            </div>

            <div className="px-5 py-3 border-t border-ink-border/20 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-[13px] text-ink-muted hover:text-ink px-3 py-1.5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteEvent(showDeleteConfirm)}
                className="text-[13px] font-medium bg-red-600 text-white px-4 py-1.5 rounded-full hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
