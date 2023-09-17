import cx from "classnames";
import { ReactNode } from "react";

export default function BigRedButton(props: {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      className={cx(
        "rounded-full bg-dark-blue p-3 text-center text-xl text-white lg:p-4 xl:text-2xl",
        props.className
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
