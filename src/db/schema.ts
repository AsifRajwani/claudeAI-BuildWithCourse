import { pgTable, uuid, varchar, boolean, timestamp, text, integer, decimal, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { check } from "drizzle-orm/pg-core";

// Table 1: exercises
// Exercise library (both global and user-specific exercises)
export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    isGlobal: boolean("is_global").notNull().default(false),
    userId: varchar("user_id", { length: 255 }), // Clerk userId, null for global exercises
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // CHECK: (is_global = true AND user_id IS NULL) OR (is_global = false AND user_id IS NOT NULL)
    check(
      "global_user_check",
      sql`(${table.isGlobal} = true AND ${table.userId} IS NULL) OR (${table.isGlobal} = false AND ${table.userId} IS NOT NULL)`
    ),
    // UNIQUE INDEX: (name) where is_global = true (partial unique constraint for global exercises)
    uniqueIndex("global_name_unique_idx").on(table.name).where(sql`${table.isGlobal} = true`),
    // UNIQUE INDEX: (name, user_id) where is_global = false (partial unique constraint for user exercises)
    uniqueIndex("user_name_unique_idx").on(table.name, table.userId).where(sql`${table.isGlobal} = false`),
    // Regular indexes
    index("exercises_user_id_idx").on(table.userId),
    index("exercises_is_global_idx").on(table.isGlobal),
  ]
);

// Table 2: workouts
// Workout sessions
export const workouts = pgTable(
  "workouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 }).notNull(), // Clerk userId
    title: varchar("title", { length: 255 }),
    notes: text("notes"),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // CHECK: status IN ('planned', 'in_progress', 'completed')
    check(
      "status_check",
      sql`${table.status} IN ('planned', 'in_progress', 'completed')`
    ),
    // CHECK: completed_at IS NULL OR completed_at >= started_at
    check(
      "completed_at_check",
      sql`${table.completedAt} IS NULL OR ${table.completedAt} >= ${table.startedAt}`
    ),
    // Regular indexes
    index("workouts_user_started_at_idx").on(table.userId, table.startedAt),
    index("workouts_user_status_idx").on(table.userId, table.status),
  ]
);

// Table 3: workout_exercises
// Junction table linking workouts to exercises
export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // UNIQUE: (workout_id, order)
    uniqueIndex("workout_order_unique_idx").on(table.workoutId, table.order),
    // CHECK: order > 0
    check("order_check", sql`${table.order} > 0`),
    // Regular indexes
    index("workout_exercises_workout_order_idx").on(table.workoutId, table.order),
    index("workout_exercises_exercise_id_idx").on(table.exerciseId),
  ]
);

// Table 4: sets
// Individual sets within a workout exercise
export const sets = pgTable(
  "sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workoutExerciseId: uuid("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    reps: integer("reps"),
    weight: decimal("weight", { precision: 6, scale: 2 }),
    isCompleted: boolean("is_completed").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // UNIQUE: (workout_exercise_id, set_number)
    uniqueIndex("workout_exercise_set_unique_idx").on(
      table.workoutExerciseId,
      table.setNumber
    ),
    // CHECK: set_number > 0
    check("set_number_check", sql`${table.setNumber} > 0`),
    // CHECK: reps IS NULL OR reps >= 0
    check(
      "reps_check",
      sql`${table.reps} IS NULL OR ${table.reps} >= 0`
    ),
    // CHECK: weight IS NULL OR weight >= 0
    check(
      "weight_check",
      sql`${table.weight} IS NULL OR ${table.weight} >= 0`
    ),
    // Regular indexes
    index("sets_workout_exercise_set_idx").on(table.workoutExerciseId, table.setNumber),
  ]
);
