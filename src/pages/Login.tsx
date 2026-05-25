import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginPayload } from "@/services/auth/types";
import { login } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { useGetProfile } from "@/hooks/useGetProfile";
import { useEffect } from "react";
const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

export function LoginPage() {
  const {profileQuery} = useGetProfile();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => login(data),
    onSuccess: () => {
      navigate({ to: "/" });
    }
  });

  const onSubmit =  (data: LoginPayload) => {
    loginMutation.mutate(data)
  };

  useEffect(() => {
    if(profileQuery?.data?.data) {
      navigate({ to: "/" })
    }
  }, [profileQuery?.data?.data])

  return (
    <div className="grid min-h-screen bg-background">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-soft">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">TaskFlow</div>
            </div>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your workspace to keep building.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter email" type="email" {...register("email")} className="mt-1.5" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot?</button>
              </div>
              <Input id="password" placeholder="Enter password" type="password" {...register("password")} className="mt-1.5" />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
