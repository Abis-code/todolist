import { create } from "zustand";
import { supabase } from "./supabase";

interface Task {
    id: string;
    title: string;
    is_completed: boolean;
}

interface TodoStore {
    tasks: Task[];
    fetchTasks: () => Promise<void>;
    addTask: (title: string) => Promise<void>;
    toggleTask: (id: string, isCompleted: boolean) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set) => ({
    tasks: [],

    fetchTasks: async () => {
        const { data, error } = await supabase
            .from("todos")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("🚨 Supabase Fetch Error:", error.message);
            return;
        }

        if (data) {
            set({ tasks: data });
        }
    },

    addTask: async (title: string) => {
        const { data, error } = await supabase
            .from("todos")
            .insert([{ title, is_completed: false }])
            .select();

        if (error) {
            console.error("🚨 Supabase Insert Error:", error.message);
            return;
        }

        if (data && data.length > 0) {
            set((state) => ({ tasks: [...state.tasks, data[0]] }));
        }
    },

    toggleTask: async (id: string, isCompleted: boolean) => {
        const { error } = await supabase
            .from("todos")
            .update({ is_completed: isCompleted })
            .eq("id", id);

        if (error) {
            console.error("🚨 Supabase Update Error:", error.message);
            return;
        }

        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === id ? { ...task, is_completed: isCompleted } : task
            ),
        }));
    },

    deleteTask: async (id: string) => {
        console.log("🗑️ Attempting to delete task with ID:", id);
        const { error } = await supabase.from("todos").delete().eq("id", id);

        if (error) {
            console.error("🚨 Supabase Delete Error:", error.message);
            return;
        }

        set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
        }));
    },
}));
