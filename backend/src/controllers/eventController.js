import {
  createEvent,
  deleteEvent,
  getAdminEvents,
  getEventBySlug,
  getEvents,
  updateEvent,
} from "../services/eventService.js";

export const listEvents = async (_req, res) => {
  const events = await getEvents();
  res.json(events);
};

export const getEventHandler = async (req, res) => {
  const event = await getEventBySlug(req.params.slug);
  res.json(event);
};

export const listAdminEvents = async (_req, res) => {
  const events = await getAdminEvents();
  res.json(events);
};

export const createEventHandler = async (req, res) => {
  const event = await createEvent(req.body);
  res.status(201).json(event);
};

export const updateEventHandler = async (req, res) => {
  const event = await updateEvent(req.params.id, req.body);
  res.json(event);
};

export const deleteEventHandler = async (req, res) => {
  const result = await deleteEvent(req.params.id);
  res.json(result);
};
