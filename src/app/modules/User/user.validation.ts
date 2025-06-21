import { z } from "zod";

const createUser = z.object({
  name: z.string({
    required_error: "Name is required!",
  }),
  email: z
    .string({ required_error: "Email is required!" })
    .min(1, { message: " Valid Email is required!." })
    .email({ message: "This is not a valid email." }),
  password: z.string({
    required_error: "Password is required!",
  }),
});

export const userValidation = {
  createUser,
};
