import { z } from "zod";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const insertProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  userId: z.string(),
});

export const api = {
  profiles: {
    list: {
      path: "/api/profiles",
      responses: {
        200: z.array(
          z.object({
            id: z.number(),
            userId: z.string(),
            name: z.string(),
            relationship: z.string(),
            createdAt: z.string().nullable().optional(),
          })
        ),
      },
    },
    create: {
      path: "/api/profiles",
      responses: {
        201: z.object({
          id: z.number(),
          userId: z.string(),
          name: z.string(),
          relationship: z.string(),
          createdAt: z.string().nullable().optional(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
};
