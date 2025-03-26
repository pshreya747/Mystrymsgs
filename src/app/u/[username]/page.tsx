"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

function MessagePage() {
  const { toast } = useToast();
  const params = useParams(); // Remove generic typing since it's inferred
  const username = params?.username ? String(params.username) : "";

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    if (!username) {
      toast({
        title: "Error",
        description: "Username is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post<ApiResponse>(
        "http://localhost:3000/api/send-message",
        {
          username, // Use the extracted and validated username
          content: data.content,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`, // Handle null values safely
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Success",
        description: response.data.message,
        variant: "default",
      });
    } catch (error) {
      console.error("Error during message submission:", error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Something went wrong";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control} // Correct prop usage
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Send Anonymous Message to @{username || "Unknown"}
                </FormLabel>
                <Textarea
                  placeholder="Drop your anonymous message here."
                  className="resize-none"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Send It</Button>
        </form>
      </Form>
    </div>
  );
}

export default MessagePage;
