"use client";

import { useRouter } from "next/navigation";
import queryString from "query-string";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

const SearchBar = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      searchTerm: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    // console.log(data);
    if (!data.searchTerm) {
      return router.push("/");
    }
    const url = queryString.stringifyUrl(
      {
        url: "/",
        query: { searchTerm: data.searchTerm },
      },
      { skipNull: true }
    );

    router.push(url);
    reset();
  };

  return (
    <div className="flex w-full items-center">
      <input
        {...register("searchTerm")}
        autoComplete="off"
        type="text"
        placeholder="Search shirts, co-ords, cargos..."
        className="h-12 min-w-0 flex-1 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium outline-none placeholder:text-[var(--color-secondary)]"
      />
      <button
        onClick={handleSubmit(onSubmit)}
        className="h-12 border border-[var(--color-accent)] bg-[var(--color-accent)] px-6 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-bg)] transition hover:bg-[var(--color-primary)]"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
