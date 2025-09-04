import { Exercise } from "./Exercise";

export interface TrainingExercise {
    id: number;
    exercise: Exercise;
    reps: number;
    weight: number;
}