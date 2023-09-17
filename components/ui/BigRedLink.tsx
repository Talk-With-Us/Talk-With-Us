import cx from "classnames";
import Link from "next/link";
import { ReactNode } from "react";

export default function BigRedButton(props: {
  children?: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <Link
      className={cx(
        "rounded-full bg-panda p-3 text-center text-xl text-white lg:p-4 xl:text-2xl",
        props.className
      )}
      href={props.href}
    >
      {props.children}
    </Link>
  );
}
