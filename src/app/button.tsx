"use client";

export default function Button(props: IButton) {
  return <button onClick={() => props.onClick()}>{props.text}</button>;
}

interface IButton {
  text: string;
  onClick: () => void;
}
