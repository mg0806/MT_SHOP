"use client";

import Input from "@/components/inputs/input";
import Button from "@/components/universal/Button";
import Heading from "@/components/universal/Heading";
import { useEffect, useState } from "react";
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { AiOutlineGoogle } from "react-icons/ai";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SafeUser } from "@/types";
import Loader from "@/components/universal/Loader"; // Import the Loader component

interface LoginFormProps {
  currentUser: SafeUser | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ currentUser }) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push("/cart");
      router.refresh();
    }
  }, [currentUser, router]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    const callback = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    setIsLoading(false);
    if (callback?.ok) {
      router.push("/cart");
      router.refresh();
      toast.success("Logged In");
    } else if (callback?.error) {
      toast.error(callback.error);
    }
  };

  if (currentUser) {
    return <p className="text-center">Logged In. Redirecting</p>;
  }

  return (
    <>
      <Heading title="Sign in to MT-Shop" />
      <Button
        outline
        lable="Continue with Google"
        icon={AiOutlineGoogle}
        onClick={() => {
          signIn("google");
        }}
      />
      <hr className="bg-slate-300 w-full h-px" />
      <Input
        id="email"
        label="Email"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="password"
        label="Password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        type="password"
      />
      <Button
        lable={isLoading ? "Loading..." : "Login"}
        onClick={handleSubmit(onSubmit)}
      />
      <p className="text-sm">
        Don&apos;t have an account?
        <Link className="underline" href="/Register">
          {" "}
          Sign up
        </Link>
      </p>
      {isLoading && <Loader />} {/* Show loader while signing in */}
    </>
  );
};

export default LoginForm;
