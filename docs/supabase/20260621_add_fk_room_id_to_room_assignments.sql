-- Migration: Add missing foreign key constraint for room_id on room_assignments
-- Date: 2026-06-21

ALTER TABLE public.room_assignments 
ADD CONSTRAINT fk_room_assignments_room_id 
FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;
