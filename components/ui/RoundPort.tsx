import { ReactNode } from "react";

export default function RoundPort(props: { children?: ReactNode }) {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <div className="h-5/6 w-11/12 rounded-xl bg-gray-100 p-4 lg:h-3/4 lg:w-3/4 lg:p-16">
        {props.children}
      </div>
    </main>
  );
}
