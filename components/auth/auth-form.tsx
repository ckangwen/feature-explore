"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { userAuthSchema, UserAuthSchema } from "auth/schema";
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { Input, Label, toast, buttonVariants, Icons } from "ui";
import { IResponse } from "@/types";

interface UserAuthFormProps {
  className?: string;
  signUp?: boolean;
}

export default function UserAuthForm({
  className,
  signUp = false,
  ...props
}: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserAuthSchema>({
    resolver: zodResolver(userAuthSchema),
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();

  async function onSubmit(formData: UserAuthSchema) {
    setIsLoading(true);
    if (signUp) {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data: IResponse = await res.json();
        setIsLoading(false);

        return toast({
          title: "提示",
          description: data.message,
        });
      } catch (e: any) {
        setIsLoading(false);
        return toast({
          title: "注册失败",
          description: e.message ?? "系统内部错误",
          variant: "destructive",
        });
      }
    } else {
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      setIsLoading(false);

      if (!signInResult?.ok) {
        return toast({
          title: "提示",
          description: "登录失败，请检查邮箱和密码是否正确",
          variant: "destructive",
        });
      }
      if (signInResult.error) {
        return toast({
          title: "提示",
          description: signInResult.error,
          variant: "destructive",
        });
      }

      toast({
        title: "提示",
        description: "登录成功",
        duration: 1500,
      });

      router.push(searchParams.get("redirect") || "/dashboard");
    }
  }

  return (
    <div className={cn("grid gap-6", className)}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="请输入你的邮箱"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Password
            </Label>
            <Input
              id="password"
              placeholder="请输入你的密码"
              type="password"
              autoCorrect="off"
              disabled={isLoading}
              {...register("password")}
            />
            {errors?.password && (
              <p className="px-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className={cn(buttonVariants())}
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Email
          </button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
      </div>
    </div>
  );
}
