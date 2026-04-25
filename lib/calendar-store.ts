// Calendar event storage utilities

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  color: string;
  type: "assignment" | "lecture" | "study" | "custom" | "milestone";
};

const CALENDAR_STORAGE_KEY = "calendar-events";

export function loadEventsFromStorage(): CalendarEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((e: any) => ({
      ...e,
      date: new Date(e.date),
    }));
  } catch {
    return [];
  }
}

export function saveEventsToStorage(events: CalendarEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error("Failed to save events to localStorage:", err);
  }
}

export function addCalendarEvent(event: Omit<CalendarEvent, "id">): CalendarEvent {
  const newEvent: CalendarEvent = {
    ...event,
    id: `${event.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  
  const existingEvents = loadEventsFromStorage();
  const updatedEvents = [...existingEvents, newEvent];
  saveEventsToStorage(updatedEvents);
  
  return newEvent;
}

export function addMultipleCalendarEvents(events: Omit<CalendarEvent, "id">[]): CalendarEvent[] {
  const existingEvents = loadEventsFromStorage();
  
  const newEvents: CalendarEvent[] = events.map((event) => ({
    ...event,
    id: `${event.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }));
  
  const updatedEvents = [...existingEvents, ...newEvents];
  saveEventsToStorage(updatedEvents);
  
  return newEvents;
}
