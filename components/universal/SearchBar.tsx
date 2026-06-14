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
    <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center">
      <input
        {...register("searchTerm")}
        autoComplete="off"
        type="text"
        placeholder="Search shirts, co-ords, cargos..."
        className="h-11 min-w-0 border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium outline-none placeholder:text-[var(--color-secondary)] sm:h-12 sm:px-4"
      />
      <button
        onClick={handleSubmit(onSubmit)}
        className="h-11 min-w-[92px] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--color-bg)] transition hover:bg-[var(--color-primary)] sm:h-12 sm:min-w-[116px] sm:px-6 sm:text-xs"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
