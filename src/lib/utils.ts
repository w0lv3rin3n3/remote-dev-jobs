import toast from "react-hot-toast";

export const handleError = (error: unknown) => {
  if (error instanceof Error) toast.error(error.message);
  else if (typeof error === "string") toast.error(error);
  else toast.error("An error occurred");
};
